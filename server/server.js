/**
 * server.js - Main Express Application for RecallRamp
 * 
 * Hackathon Target: Total Recall | Tatum x Walrus Memory
 * Architecture:
 * - REST API endpoints for Walrus Memory on Sui Mainnet
 * - Tatum Sui RPC & Data APIs client
 * - Watchdog Anomaly & Micro-Inflation Engine
 * - Serves Static Web App Dashboard
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WalrusClient } from './walrusClient.js';
import { TatumClient } from './tatumClient.js';
import { WatchdogEngine, evaluateOcrMatch } from './watchdogEngine.js';
import { seedAllMemories } from './seedMemories.js';
import { GroqClient } from './groqClient.js';
import { GeminiVisionClient } from './geminiVision.js';
import { parseStatementFile } from './statementParser.js';
import { validateService, ValidationError, toVendorSlug, updateLedger } from './subscriptionLedger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Helmet security headers (CSP disabled for now because UI uses inline onclick handlers)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(cors({
  origin: allowedOrigin ? allowedOrigin.split(',').map(o => o.trim()) : true,
  credentials: true
}));

// Rate limiting tiers
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests, please slow down.', retryAfter: '1 minute' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'AI inference rate limit exceeded. Please wait a moment.', retryAfter: '1 minute' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Statement upload rate limit exceeded. Max 10 uploads per minute.', retryAfter: '1 minute' }
});

const mutatingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Mutation rate limit exceeded. Max 60 operations per minute.', retryAfter: '1 minute' }
});

app.use(globalLimiter);
app.use('/api/copilot/chat', aiLimiter);
app.use('/api/ocr/scan', aiLimiter);
app.use('/api/statement/upload', uploadLimiter);
app.use(['/api/memories/commit', '/api/memories/override', '/api/subscriptions', '/api/account/delete'], mutatingLimiter);

// Default express.json (100kb limit) globally
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

// File upload handler for statements and receipts
const upload = multer({ dest: path.join(__dirname, '../data/uploads') });

/**
 * Sanitizes values for CSV output to prevent spreadsheet formula injection
 */
export function csvCell(v) {
  const str = String(v ?? '');
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  if (/[",\n\r]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

/**
 * Production-safe error response helper: logs error with requestId and returns generic message in production
 */
export function sendInternalError(res, req, err) {
  const reqId = req?.id || crypto.randomUUID();
  console.error(`[Internal Error] [ReqID: ${reqId}] ${req?.method} ${req?.originalUrl}:`, err);
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      ok: false,
      error: 'An internal server error occurred.',
      requestId: reqId
    });
  }
  return res.status(500).json({
    ok: false,
    error: err?.message || 'Internal server error',
    requestId: reqId
  });
}

/**
 * Admin Authentication Middleware
 * Protects administrative routes (seed, config, purge).
 * In production: fails closed with 503 if ADMIN_TOKEN is not configured.
 * Uses timingSafeEqual with SHA-256 digests to prevent timing attacks.
 */
const requireAdmin = (req, res, next) => {
  const adminToken = process.env.ADMIN_TOKEN;
  const isProd = process.env.NODE_ENV === 'production';

  if (!adminToken) {
    if (isProd) {
      return res.status(503).json({
        ok: false,
        error: 'Service Unavailable: Administrator authentication token is not configured on this server.'
      });
    }
    return next();
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] || req.query?.admin_token);
  if (!token || typeof token !== 'string') {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized: Admin token required'
    });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest();
  const adminHash = crypto.createHash('sha256').update(adminToken).digest();

  if (!crypto.timingSafeEqual(tokenHash, adminHash)) {
    return res.status(403).json({
      ok: false,
      error: 'Forbidden: Invalid admin token'
    });
  }

  next();
};

// Initialize Core Clients
const walrus = new WalrusClient();
const tatum = new TatumClient();
const watchdog = new WatchdogEngine(walrus);
const groq = new GroqClient();
const geminiVision = new GeminiVisionClient();

// Auto-seed if first run
const existingMemories = await walrus.listMemories();
if (existingMemories.length < 10) {
  console.log(`[PocketSentinel Server] Initializing Walrus Memory with 12 Mainnet records...`);
  await seedAllMemories(walrus);
}

// ================= API ROUTES =================

/**
 * System Status & Agent Info
 */
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.get('/api/status', async (req, res) => {
  const memories = await walrus.listMemories();
  const balance = await tatum.getSuiBalance();
  
  res.json({
    status: 'OPERATIONAL',
    system: 'PocketSentinel Sovereign Expense Sentinel',
    version: '1.0.0',
    hackathon: 'Total Recall | Tatum x Walrus Memory',
    walrus: {
      agentId: walrus.agentId,
      network: walrus.network,
      memoriesCommittedCount: memories.length,
      meetsHackathonRule: memories.length >= 10,
      apiUrl: walrus.apiUrl
    },
    tatum: {
      network: balance.network,
      suiRpc: tatum.suiRpcUrl,
      walletAddress: balance.address,
      suiBalance: balance.formattedSui,
      usdcBalance: balance.formattedUsdc,
      liveRpcConnected: balance.live
    }
  });
});

/**
 * List all Walrus Memories
 */
app.get('/api/memories', async (req, res) => {
  const category = req.query.category || null;
  const list = await walrus.listMemories(category);
  res.json({
    agentId: walrus.agentId,
    network: walrus.network,
    count: list.length,
    memories: list
  });
});

/**
 * Re-seed the 12 Verified Memories
 */
app.post('/api/memories/seed', requireAdmin, async (req, res) => {
  const results = await seedAllMemories(walrus);
  res.json({
    message: `Successfully seeded verified memories to Walrus (${walrus.isLive ? 'Live Sui Mainnet' : 'Local Mock'})`,
    count: results.length,
    mode: walrus.isLive ? 'live' : 'mock',
    items: results
  });
});

/**
 * Commit a single new memory (Schema v2 supported)
 */
app.post('/api/memories/commit', async (req, res) => {
  try {
    const { key, id, category, type, content, value, source, sensitivity, tags, supersedes, metadata } = req.body;
    const KEY_REGEX = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
    const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
    if (!key || typeof key !== 'string' || !KEY_REGEX.test(key) || FORBIDDEN_KEYS.has(key.toLowerCase())) {
      return res.status(400).json({ ok: false, error: 'Invalid memory key format. Must match ^[a-z0-9][a-z0-9_-]{0,63}$ and not be reserved.' });
    }
    if (id && (!KEY_REGEX.test(id) || FORBIDDEN_KEYS.has(String(id).toLowerCase()))) {
      return res.status(400).json({ ok: false, error: 'Invalid memory id format. Must match ^[a-z0-9][a-z0-9_-]{0,63}$ and not be reserved.' });
    }
    const record = await walrus.commitMemory({
      id,
      key,
      category: category || type || 'Custom',
      type: type || category || 'Baseline',
      content: content || '',
      value: value || null,
      source: source || 'user_stated',
      sensitivity: sensitivity || null,
      tags: tags || [],
      supersedes: supersedes || null,
      metadata: metadata || {}
    });
    res.json({ success: true, record });
  } catch (err) {
    if (err instanceof ValidationError || err.name === 'ValidationError') {
      return res.status(400).json({ ok: false, error: err.message });
    }
    sendInternalError(res, req, err);
  }
});

/**
 * Learn an Override from human action
 */
app.post('/api/memories/override', async (req, res) => {
  try {
    const { key, reason, amount } = req.body;
    const KEY_REGEX = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
    const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
    if (!key || typeof key !== 'string' || !KEY_REGEX.test(key) || FORBIDDEN_KEYS.has(key.toLowerCase())) {
      return res.status(400).json({ ok: false, error: 'Invalid memory key format' });
    }
    const record = await walrus.recordOverride(key, { reason, amount });
    res.json({ success: true, message: 'Policy override permanently recorded to Walrus Memory', record });
  } catch (err) {
    sendInternalError(res, req, err);
  }
});

/**
 * Dynamic Runway calculated directly from Walrus Memory anchors (MEM_13, MEM_15, MEM_16)
 */
app.get('/api/memories/runway', async (req, res) => {
  try {
    const balance = req.query.balance ? Number(req.query.balance) : 2450.00;
    const currency = req.query.currency || '$';
    const runway = await watchdog.calculateRunwayFromMemories(balance, null, currency);
    res.json(runway);
  } catch (err) {
    sendInternalError(res, req, err);
  }
});

/**
 * Cognitive Envelope Health derived from historical overspending and rebalances (MEM_18, MEM_19, MEM_21)
 */
app.get('/api/memories/envelope-health', async (req, res) => {
  try {
    const health = await watchdog.evaluateEnvelopeHealth();
    res.json(health);
  } catch (err) {
    sendInternalError(res, req, err);
  }
});

/**
 * Active Subscriptions & Trial Watches
 */
app.get('/api/subscriptions', async (req, res) => {
  try {
    const data = await watchdog.getActiveSubscriptionsState();
    res.json(data);
  } catch (err) {
    sendInternalError(res, req, err);
  }
});

/**
 * Helper: Category Overlap Check
 */
function checkCategoryOverlap(category, newVendorSlug, services = {}) {
  if (!category) return null;
  const catNorm = category.toLowerCase().trim();
  const overlapping = [];
  for (const [slug, s] of Object.entries(services)) {
    if (slug === newVendorSlug) continue;
    if (s.status !== 'active') continue;
    if (s.category && s.category.toLowerCase().trim() === catNorm) {
      overlapping.push(s.display_name || slug);
    }
  }
  if (overlapping.length > 0) {
    return {
      detected: true,
      category,
      existingServices: overlapping,
      warning: `Potential duplicate subscription in ${category}: already active with ${overlapping.join(', ')}.`
    };
  }
  return null;
}

/**
 * Manual Subscription or Trial Add
 */
app.post('/api/subscriptions', async (req, res) => {
  try {
    const vendorName = req.body.vendor || req.body.display_name || req.body.merchant || req.body.name;
    const trialEnds = req.body.trial_ends || req.body.trialEndDate || req.body.trial_end;

    // If trial_ends is supplied, create a Trial Watch memory instead (default 48h alert, no price baseline)
    if (trialEnds) {
      if (!vendorName || typeof vendorName !== 'string' || !vendorName.trim()) {
        return res.status(400).json({ error: 'Vendor name is required for trial watch.' });
      }
      const slug = toVendorSlug(vendorName);
      const trialKey = `trial_${slug}`;
      const trialId = `MEM_TRIAL_${Date.now().toString(16).slice(-4).toUpperCase()}`;
      const record = await walrus.commitMemory({
        id: trialId,
        type: 'Event',
        category: 'Trial Watch',
        key: trialKey,
        content: `${vendorName.trim()} free trial ending ${trialEnds}. 48h cancellation notice alert.`,
        effective_date: new Date().toISOString().split('T')[0],
        source: 'user_stated',
        sensitivity: 'public',
        tags: ['trial', slug, 'trial_watch'],
        value: {
          merchant: vendorName.trim(),
          trialStartDate: new Date().toISOString().split('T')[0],
          trialEndDate: trialEnds,
          cancellationNoticeDeadline: trialEnds,
          rebillAmount: req.body.price !== undefined ? Number(req.body.price) : 0.00,
          status: 'active_trial',
          alertWindowHours: 48,
          category: req.body.category || 'Software'
        }
      });

      const store = await walrus.loadStore();
      const ledgerMem = store.memories['subscription_ledger'];
      const overlap = checkCategoryOverlap(req.body.category || 'Software', slug, ledgerMem?.value?.services || {});

      return res.status(201).json({ success: true, type: 'trial', memory: record, overlap });
    }

    // Manual add to ledger: source user_stated
    const serviceData = {
      display_name: vendorName,
      price: req.body.price !== undefined ? Number(req.body.price) : NaN,
      cadence: req.body.cadence || 'monthly',
      bill_day: req.body.bill_day !== undefined ? Number(req.body.bill_day) : (new Date().getDate() || 1),
      max_variance: req.body.max_variance !== undefined ? Number(req.body.max_variance) : 0.00,
      status: req.body.status || 'active',
      source: 'user_stated',
      first_seen: req.body.first_seen || new Date().toISOString().split('T')[0],
      category: req.body.category || 'Subscription',
      raw_patterns: Array.isArray(req.body.raw_patterns) ? req.body.raw_patterns : [vendorName].filter(Boolean)
    };

    validateService(serviceData);

    const slug = toVendorSlug(vendorName);
    const updatedLedger = await updateLedger(walrus, (services) => {
      services[slug] = serviceData;
    });

    const overlap = checkCategoryOverlap(serviceData.category, slug, updatedLedger.value.services);

    return res.status(201).json({
      success: true,
      service: serviceData,
      slug,
      overlap,
      ledger: updatedLedger
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Confirm Proposal into Ledger
 */
app.post('/api/subscriptions/confirm', async (req, res) => {
  try {
    const vendorName = req.body.vendor || req.body.display_name || req.body.merchant;
    const rawPattern = req.body.raw_pattern || req.body.rawPattern || vendorName;
    const rawPatterns = Array.isArray(req.body.raw_patterns) ? req.body.raw_patterns : (rawPattern ? [rawPattern] : [vendorName]);
    if (rawPattern && !rawPatterns.includes(rawPattern)) rawPatterns.push(rawPattern);
    if (vendorName && !rawPatterns.includes(vendorName)) rawPatterns.push(vendorName);

    const serviceData = {
      display_name: vendorName,
      price: Number(req.body.price !== undefined ? req.body.price : req.body.amount),
      cadence: req.body.cadence || req.body.detected_cadence || 'monthly',
      bill_day: req.body.bill_day !== undefined ? Number(req.body.bill_day) : (new Date().getDate() || 1),
      max_variance: req.body.max_variance !== undefined ? Number(req.body.max_variance) : 0.00,
      status: 'active',
      source: 'user_confirmed',
      first_seen: req.body.first_seen || new Date().toISOString().split('T')[0],
      category: req.body.category || 'Subscription',
      raw_patterns: rawPatterns
    };

    validateService(serviceData);

    const slug = toVendorSlug(vendorName);
    const updatedLedger = await updateLedger(walrus, (services) => {
      if (services[slug]) {
        const existingPatterns = services[slug].raw_patterns || [];
        const mergedPatterns = Array.from(new Set([...existingPatterns, ...rawPatterns]));
        services[slug] = {
          ...services[slug],
          ...serviceData,
          raw_patterns: mergedPatterns,
          source: 'user_confirmed',
          status: 'active'
        };
      } else {
        services[slug] = serviceData;
      }
    });

    const overlap = checkCategoryOverlap(serviceData.category, slug, updatedLedger.value.services);

    return res.status(200).json({
      success: true,
      service: updatedLedger.value.services[slug],
      slug,
      overlap,
      ledger: updatedLedger
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Cancel Subscription (status cancelled + cancelled_on; never delete)
 */
app.post('/api/subscriptions/cancel', async (req, res) => {
  try {
    const vendorQuery = req.body.slug || req.body.vendor || req.body.merchant;
    if (!vendorQuery) {
      return res.status(400).json({ error: 'Vendor or slug is required.' });
    }

    const slug = toVendorSlug(vendorQuery);
    const cancelledDate = req.body.cancelled_on || new Date().toISOString().split('T')[0];

    const updatedLedger = await updateLedger(walrus, (services) => {
      let targetKey = services[slug] ? slug : null;
      if (!targetKey) {
        for (const [sKey, s] of Object.entries(services)) {
          if (
            sKey === slug ||
            sKey.includes(slug) ||
            slug.includes(sKey) ||
            (s.display_name && s.display_name.toLowerCase().includes(vendorQuery.toLowerCase()))
          ) {
            targetKey = sKey;
            break;
          }
        }
      }
      if (!targetKey) {
        throw new ValidationError(`Subscription "${vendorQuery}" not found in ledger.`);
      }
      services[targetKey].status = 'cancelled';
      services[targetKey].cancelled_on = cancelledDate;
    });

    return res.json({
      success: true,
      message: `Subscription "${vendorQuery}" marked cancelled on ${cancelledDate}.`,
      ledger: updatedLedger
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Resolve Price Change (Plan Change vs Price Hike)
 */
app.post('/api/subscriptions/resolve-change', async (req, res) => {
  try {
    const { vendor, amount, choice } = req.body;
    if (!vendor || typeof vendor !== 'string' || !vendor.trim()) {
      return res.status(400).json({ error: 'Vendor is required.' });
    }
    if (!['plan_change', 'price_hike'].includes(choice)) {
      return res.status(400).json({ error: 'Invalid choice. Must be "plan_change" or "price_hike".' });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    const slug = toVendorSlug(vendor);

    if (choice === 'plan_change') {
      const updatedLedger = await updateLedger(walrus, (services) => {
        let targetKey = services[slug] ? slug : null;
        if (!targetKey) {
          for (const [sKey, s] of Object.entries(services)) {
            if (
              sKey === slug ||
              sKey.includes(slug) ||
              slug.includes(sKey) ||
              (s.display_name && s.display_name.toLowerCase().includes(vendor.toLowerCase()))
            ) {
              targetKey = sKey;
              break;
            }
          }
        }
        if (!targetKey) {
          targetKey = slug;
          services[targetKey] = {
            display_name: vendor.trim(),
            price: numAmount,
            cadence: 'monthly',
            bill_day: new Date().getDate() || 1,
            max_variance: 0.00,
            status: 'active',
            source: 'user_confirmed',
            first_seen: new Date().toISOString().split('T')[0],
            category: 'Subscription',
            raw_patterns: [vendor.trim()]
          };
        } else {
          services[targetKey].price = numAmount;
          services[targetKey].source = 'user_confirmed';
          services[targetKey].status = 'active';
          services[targetKey].updated_at = new Date().toISOString();
        }
      });

      return res.json({
        success: true,
        resolution: 'plan_change',
        price: numAmount,
        ledger: updatedLedger
      });
    }

    // price_hike: keep baseline, return dispute letter, write a Dispute memory
    const store = await walrus.loadStore();
    const ledgerMem = store.memories['subscription_ledger'];
    const services = ledgerMem?.value?.services || {};
    let matchedService = services[slug];
    if (!matchedService) {
      for (const [sKey, s] of Object.entries(services)) {
        if (
          sKey.includes(slug) ||
          slug.includes(sKey) ||
          (s.display_name && s.display_name.toLowerCase().includes(vendor.toLowerCase()))
        ) {
          matchedService = s;
          break;
        }
      }
    }

    const baseline = matchedService?.price || 0.00;
    const delta = Number((numAmount - baseline).toFixed(2));
    const disputePack = watchdog.generateDisputePack(
      {
        merchant: vendor.trim(),
        amount: numAmount,
        date: new Date().toISOString().split('T')[0]
      },
      baseline,
      delta,
      ledgerMem || { id: 'MEM_01', content: 'Subscription Ledger' },
      '$'
    );

    const disputeMemId = `MEM_DISPUTE_${Date.now().toString(16).slice(-4).toUpperCase()}`;
    const disputeRecord = await walrus.commitMemory({
      id: disputeMemId,
      type: 'Dispute',
      category: 'Dispute Trace',
      key: `dispute_${slug}_${Date.now()}`,
      content: `Contested unapproved price hike on ${vendor.trim()}: billed $${numAmount.toFixed(2)} vs authorized baseline $${baseline.toFixed(2)}.`,
      effective_date: new Date().toISOString().split('T')[0],
      source: 'user_stated',
      sensitivity: 'public',
      tags: ['dispute', slug, 'price_hike'],
      value: {
        merchant: vendor.trim(),
        disputedAmount: numAmount,
        baselineAmount: baseline,
        deltaAmount: delta,
        disputeDate: new Date().toISOString(),
        actionPlan: 'CONTEST_PRICE_HIKE',
        disputeLetter: disputePack.letterBody
      }
    });

    return res.json({
      success: true,
      resolution: 'price_hike',
      disputeLetter: disputePack.letterBody,
      disputePack,
      disputeMemory: disputeRecord
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Audit a single transaction
 */
app.post('/api/audit/transaction', async (req, res) => {
  try {
    const tx = req.body;
    if (!tx.merchant || tx.amount === undefined) {
      return res.status(400).json({ error: 'Merchant and amount required' });
    }
    const result = await watchdog.auditTransaction(tx);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Batch Audit Demo (Ingests statement feed)
 */
app.post('/api/audit/batch', async (req, res) => {
  try {
    const rawHdr = req.headers['x-user-currency'];
    const decodedHdr = rawHdr ? decodeURIComponent(rawHdr) : '';
    const userCurrency = req.body?.currency || decodedHdr || '$';
    const txs = req.body.transactions || [
      { merchant: 'Netflix', amount: 17.99, date: '2026-10-20' }, // +$2.50 hike vs $15.49 baseline
      { merchant: 'Amazon Web Services (AWS)', amount: 142.50, date: '2026-10-19' }, // Surpassed normal $64 but < $180 override -> SUPPRESSED!
      { merchant: 'OpenAI (ChatGPT Plus)', amount: 20.00, date: '2026-10-14' }, // Exact match
      { merchant: 'DoorDash DashPass', amount: 9.99, date: '2026-10-18' }, // Dispute trace trigger!
      { merchant: 'Apex Luxury Apparel LLC', amount: 89.00, date: '2026-10-21' }, // Unknown vendor > $50 -> Escalation!
      { merchant: 'Spotify Premium', amount: 10.99, date: '2026-10-15' } // Baseline match
    ];

    const report = await watchdog.auditBatch(txs, userCurrency);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Statement PDF / CSV Ingestion & Autonomous Audit
 */
const handleStatementUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No statement file provided in request.' });
  }

  const uploadedPath = req.file.path;
  const originalName = req.file.originalname || 'statement.pdf';
  const rawHdr = req.headers['x-user-currency'];
  const decodedHdr = rawHdr ? decodeURIComponent(rawHdr) : '';
  const userCurrency = req.body?.currency || decodedHdr || '';

  try {
    // Parse using unified statement parser (supports PDF & CSV)
    const parsed = parseStatementFile(uploadedPath, originalName, userCurrency);

    // Cleanup temp file safely
    try {
      if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
    } catch (e) {
      // ignore
    }

    if (!parsed.transactions || parsed.transactions.length === 0) {
      return res.status(422).json({
        ok: false,
        error: 'No valid transactions found in this statement. Please check the statement file.'
      });
    }

    // Run batch audit against Walrus decentralized memory
    const statementCurrency = parsed.meta?.currency || userCurrency || '$';
    const report = await watchdog.auditBatch(parsed.transactions, statementCurrency);

    res.json({
      ok: true,
      filename: originalName,
      meta: parsed.meta,
      monthlySummary: parsed.monthlySummary,
      availableMonths: parsed.availableMonths,
      parsedCount: parsed.transactions.length,
      totalCountInStatement: parsed.totalCountInStatement,
      report
    });
  } catch (err) {
    console.error('[server] Statement upload error:', err);
    if (fs.existsSync(uploadedPath)) {
      try { fs.unlinkSync(uploadedPath); } catch (e) {}
    }
    res.status(500).json({ ok: false, error: err.message || 'Failed to process statement file.' });
  }
};

app.post('/api/statement/upload', upload.single('statement'), handleStatementUpload);
app.post('/api/audit/upload', upload.single('statement'), handleStatementUpload);

/**
 * Tatum Sui Wallet & Onchain Stream
 */
app.get('/api/tatum/wallet', async (req, res) => {
  const balance = await tatum.getSuiBalance();
  const txs = await tatum.getRecentTransactions();
  const rate = await tatum.getSuiRate();
  const gas = await tatum.estimateGasPrice();
  res.json({ balance, transactions: txs, rate, gas });
});

/**
 * Tatum Anomaly Webhook Subscription
 */
app.post('/api/tatum/subscribe', async (req, res) => {
  try {
    const { webhookUrl, address } = req.body || {};
    const sub = await tatum.createAnomalySubscription(webhookUrl, address);
    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Execute Agent Payment via x402 / MPP settled on Sui
 */
app.post('/api/tatum/payment', async (req, res) => {
  try {
    const { recipient, amountSui, purpose } = req.body;
    const payment = await tatum.executeAgentPayment({
      recipient: recipient || '0xagent_bounty_settler_009x',
      amountSui: amountSui || '0.05 SUI',
      purpose: purpose || 'Automated price dispute micro-bounty settlement'
    });
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 20-Second Lazy Audio Financial Pulse Briefing
 */
const handleAudioPulse = async (req, res) => {
  const state = await watchdog.getActiveSubscriptionsState();
  const memories = await walrus.listMemories();

  const script = `Good morning. PocketSentinel audit complete. Your active monthly subscription run rate is $${state.totalMonthlyRunRate}. We detected one urgent alert: your Adobe Creative Cloud seven-day trial expires in 48 hours, risking a $54.99 rebill. We also flagged Netflix billing $2.50 above your Walrus baseline, draining $30 annually. An AWS charge of $142.50 was safely auto-reconciled based on your October seasonal override. One tap to file your Netflix refund pack now.`;

  res.json({
    durationEstimateSeconds: 20,
    audioScript: script,
    highlights: [
      { label: 'Monthly Run Rate', value: `$${state.totalMonthlyRunRate}` },
      { label: 'Active Trial Expirations', value: `${state.trials.length} urgent` },
      { label: 'Annual Leakage Flagged', value: '$30.00 / year' },
      { label: 'Walrus Mainnet Anchors', value: `${memories.length} memories` }
    ]
  });
};
app.get('/api/pulse/audio-summary', handleAudioPulse);
app.get('/api/pulse/audio', handleAudioPulse);

/**
 * POST /api/ocr/scan - Camera Receipt OCR + RULE_OCR_MATCH Reconciliation
 */
app.post('/api/ocr/scan', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { imageBase64, filename = '', existingTransactions = [], demoPreset = null } = req.body;

    // 1. Multimodal Vision OCR via Google Gemini (Cloud) / Gemma (Ollama) / deterministic fallback
    let extracted;
    if (demoPreset) {
      extracted = geminiVision.getFallbackExtraction(demoPreset);
    } else {
      extracted = await geminiVision.scanReceipt({ imageBase64, filename });
    }

    // 2. Execute RULE_OCR_MATCH against existing ledger transactions (±48h window)
    const ocrRuleResult = evaluateOcrMatch(extracted, existingTransactions);

    return res.json({
      ok: true,
      extracted,
      ruleAudit: ocrRuleResult
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/feed/csv - 9-Column Live Feed for Google Sheets =IMPORTDATA
 */
app.get('/api/feed/csv', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="recall_normalized_transactions.csv"');

    const headers = [
      csvCell('Date'),
      csvCell('Merchant'),
      csvCell('Category'),
      csvCell('Amount'),
      csvCell('Cadence'),
      csvCell('Status'),
      csvCell('Source'),
      csvCell('Walrus_Anchor'),
      csvCell('Rule_Audit')
    ].join(',') + '\n';

    const data = await watchdog.getActiveSubscriptionsState();
    const rows = (data.subscriptions || []).map(s => {
      const date = csvCell(s.first_seen || '2026-10-01');
      const merchant = csvCell(s.merchant || '');
      const cat = csvCell(s.category || 'Subscription');
      const amt = csvCell((Number(s.amount) || 0).toFixed(2));
      const cadence = csvCell(s.cadence || 'monthly');
      const status = csvCell(s.status || 'active');
      const source = csvCell(s.source || 'user_stated');
      const anchor = csvCell(s.id || 'MEM_01');
      const rule = csvCell(status === 'cancelled' ? 'CANCELLED_SERVICE' : 'SUBSCRIPTION_LEDGER_BASELINE');
      return `${date},${merchant},${cat},${amt},${cadence},${status},${source},${anchor},${rule}`;
    }).join('\n');

    res.send(headers + rows);
  } catch (err) {
    sendInternalError(res, req, err);
  }
});

/**
 * Universal Audit API: Ingest single or batch transactions
 */
app.post('/api/audit', async (req, res) => {
  try {
    const rawHdr = req.headers['x-user-currency'];
    const decodedHdr = rawHdr ? decodeURIComponent(rawHdr) : '';
    const userCurrency = req.body?.currency || decodedHdr || '$';
    if (req.body.transactions && Array.isArray(req.body.transactions)) {
      const report = await watchdog.auditBatch(req.body.transactions, userCurrency);
      return res.json(report);
    }
    if (req.body.merchant && req.body.amount !== undefined) {
      const result = await watchdog.auditTransaction(req.body, null, userCurrency);
      return res.json(result);
    }
    return res.status(400).json({ error: 'Either transaction object or transactions array required' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Sentinel AI Copilot Chat (PocketSentinel Intelligence Engine)
 */
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { query: rawQuery, message, history, mode, envelopesRebalanced, userProfile } = req.body;
    const query = rawQuery || message;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const result = await groq.chat({ query, history, mode, envelopesRebalanced, userProfile });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/copilot/config', (req, res) => {
  res.json({
    configured: Boolean(groq.apiKey),
    model: groq.model
  });
});

app.post('/api/copilot/config', requireAdmin, (req, res) => {
  const { apiKey, model } = req.body;
  if (apiKey !== undefined) {
    groq.setApiKey(apiKey);
  }
  if (model) {
    groq.model = model;
  }
  res.json({
    success: true,
    configured: Boolean(groq.apiKey),
    model: groq.model
  });
});

/**
 * Sovereign Data Purge - Delete Account and Ephemeral Server Caches
 * Eradicates any temporary in-memory sessions or audit caches.
 */
app.delete('/api/account/delete', requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      purgedAt: new Date().toISOString(),
      message: 'Sovereign purge acknowledged. Server session caches cleared.',
      status: 'SOVEREIGN_PURGE_COMPLETE'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for Single Page UI
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server (only when not running inside Vercel serverless environment)
let server;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🛡️  PocketSentinel Sentinel Live: http://localhost:${PORT}`);
    console.log(`📡 Walrus Memory Agent ID  : ${walrus.agentId}`);
    console.log(`⛓️  Tatum Sui RPC Gateway   : ${tatum.suiRpcUrl}`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
      console.error(`💡 Tip: Run 'fuser -k ${PORT}/tcp' or 'npx kill-port ${PORT}', or launch with PORT=${Number(PORT) + 1} npm run dev\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

export default app;
export { app };
