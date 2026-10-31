/**
 * subscriptionLedger.js — Household Subscription Ledger Engine
 * 
 * Manages the consolidated onchain subscription ledger (MEM_01: subscription_ledger)
 * with versioning, auditable history tracking, concurrency control via mutex,
 * and strict server-side validation.
 */

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

/**
 * Validates and normalizes an individual subscription service definition
 */
export function validateService(service) {
  if (!service || typeof service !== 'object') {
    throw new ValidationError('Service payload must be an object.');
  }

  const rawVendor = typeof service.display_name === 'string'
    ? service.display_name
    : (typeof service.merchant === 'string' ? service.merchant : '');
  
  // Strip control characters and trim
  const cleanVendor = rawVendor.replace(/[\x00-\x1F\x7F]/g, '').trim();
  if (!cleanVendor || cleanVendor.length === 0 || cleanVendor.length > 80) {
    throw new ValidationError('Vendor name must be a non-empty string of at most 80 characters without control characters.');
  }

  const rawPrice = service.price !== undefined ? service.price : service.amount;
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price < 0) {
    throw new ValidationError('Price must be a finite number greater than or equal to 0.');
  }

  const cadence = (service.cadence || 'monthly').toLowerCase();
  if (!['weekly', 'monthly', 'annual'].includes(cadence)) {
    throw new ValidationError(`Invalid cadence "${cadence}". Allowed values are: weekly, monthly, annual.`);
  }

  const rawBillDay = service.bill_day !== undefined ? service.bill_day : (service.dayOfMonth || 15);
  const billDay = Number(rawBillDay);
  if (!Number.isInteger(billDay) || billDay < 1 || billDay > 31) {
    throw new ValidationError('Bill day must be an integer between 1 and 31.');
  }

  const maxVariance = Number(service.max_variance !== undefined ? service.max_variance : 0.00);
  if (!Number.isFinite(maxVariance) || maxVariance < 0) {
    throw new ValidationError('Max variance must be a non-negative number.');
  }

  const status = service.status || 'active';
  if (!['active', 'pending_review', 'cancelled'].includes(status)) {
    throw new ValidationError(`Invalid status "${status}". Allowed values: active, pending_review, cancelled.`);
  }

  const source = service.source || 'user_stated';
  if (!['user_stated', 'user_confirmed', 'inferred'].includes(source)) {
    throw new ValidationError(`Invalid source "${source}". Allowed values: user_stated, user_confirmed, inferred.`);
  }

  let rawPatterns = Array.isArray(service.raw_patterns)
    ? service.raw_patterns.map(p => String(p).trim()).filter(Boolean)
    : [cleanVendor];
  if (rawPatterns.length === 0) {
    rawPatterns = [cleanVendor];
  }

  return {
    display_name: cleanVendor,
    price: Number(price.toFixed(2)),
    cadence,
    bill_day: billDay,
    max_variance: Number(maxVariance.toFixed(2)),
    status,
    source,
    first_seen: service.first_seen || new Date().toISOString().slice(0, 10),
    cancelled_on: service.cancelled_on || null,
    category: service.category || 'Subscriptions',
    raw_patterns: rawPatterns
  };
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
const FORBIDDEN_SLUGS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Creates a vendor slug for object keying
 */
export function toVendorSlug(name) {
  const raw = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const truncated = raw.slice(0, 64);
  if (!truncated || !SLUG_REGEX.test(truncated) || FORBIDDEN_SLUGS.has(truncated.toLowerCase())) {
    return 'custom_vendor';
  }
  return truncated;
}

/**
 * In-process async mutex for serialization of ledger writes
 */
let ledgerLock = Promise.resolve();

export async function withLedgerMutex(fn) {
  let release;
  const nextLock = new Promise((resolve) => {
    release = resolve;
  });
  const prevLock = ledgerLock;
  ledgerLock = nextLock;

  try {
    await prevLock;
    return await fn();
  } finally {
    release();
  }
}

/**
 * Atomically loads, mutates, validates, and commits an updated subscription ledger
 * keeping version increments and audit history.
 */
export async function updateLedger(walrusClient, mutatorFn, changeSummary = 'Update subscription ledger') {
  return withLedgerMutex(async () => {
    const existing = await walrusClient.getMemory('subscription_ledger');
    const existingValue = existing?.value || { services: {} };
    const servicesCopy = JSON.parse(JSON.stringify(existingValue.services || {}));

    // Apply mutation
    const mutatedServices = await mutatorFn(servicesCopy);

    // Validate all services in the ledger with prototype guards
    const validatedServices = Object.create(null);
    for (const [slug, item] of Object.entries(mutatedServices)) {
      if (!slug || !SLUG_REGEX.test(slug) || FORBIDDEN_SLUGS.has(slug.toLowerCase())) {
        throw new ValidationError(`Invalid service slug "${slug}". Must match ^[a-z0-9][a-z0-9_-]{0,63}$ and cannot equal reserved keywords.`);
      }
      validatedServices[slug] = validateService(item);
    }

    const prevVersion = Number(existing?.version || existing?.metadata?.version || 1);
    const newVersion = prevVersion + 1;
    const prevHistory = Array.isArray(existing?.history) 
      ? existing.history 
      : (Array.isArray(existing?.metadata?.history) ? existing.metadata.history : []);

    const prevBlobId = existing?.metadata?.memwalBlobId 
      || existing?.metadata?.suiTxDigest 
      || existing?.suiTxDigest 
      || 'genesis_blob';

    const timestamp = new Date().toISOString();
    const newHistoryEntry = {
      version: newVersion,
      committedAt: timestamp,
      blobId: prevBlobId,
      summary: changeSummary
    };
    const newHistory = [...prevHistory, newHistoryEntry];

    const committed = await walrusClient.commitMemory({
      id: 'MEM_01',
      key: 'subscription_ledger',
      type: 'Baseline',
      category: 'Baseline',
      sensitivity: 'encrypted',
      source: 'user_stated',
      supersedes: prevBlobId,
      tags: ['subscription_ledger', 'baseline', 'household'],
      content: `Consolidated Household Subscription Ledger (${Object.keys(validatedServices).length} services, version ${newVersion})`,
      value: {
        services: validatedServices
      },
      metadata: {
        version: newVersion,
        history: newHistory,
        supersedes: prevBlobId,
        lastChangeSummary: changeSummary
      }
    });

    committed.version = newVersion;
    committed.history = newHistory;
    return committed;
  });
}
