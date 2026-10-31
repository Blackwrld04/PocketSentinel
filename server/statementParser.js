/**
 * statementParser.js - Unified Bank Statement Parser for Recall
 * Supports PDF statements (OPay, GTBank, Kuda, Chase, etc.) and CSV statements
 * Provides full multi-month extraction, inflow/outflow analysis, and categorization
 */

import { execSync } from 'child_process';
import fs from 'fs';

export function parseStatementFile(filePath, originalFilename = '', userCurrency = '') {
  const isPdf = originalFilename.toLowerCase().endsWith('.pdf') || filePath.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return parsePdfStatement(filePath, originalFilename, userCurrency);
  } else {
    return parseCsvStatement(filePath, originalFilename, userCurrency);
  }
}

/**
 * Extracts month key ('2026-10') and human label ('October 2026') from date string
 */
export function getMonthMeta(dateStr) {
  const monthsMap = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const monthNames = {
    '01': 'January', '02': 'February', '03': 'March', '04': 'April',
    '05': 'May', '06': 'June', '07': 'July', '08': 'August',
    '09': 'September', '10': 'October', '11': 'November', '12': 'December'
  };
  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!dateStr || typeof dateStr !== 'string') {
    return { monthKey: '2026-10', monthLabel: 'October 2026' };
  }

  const parts = dateStr.trim().split(/[\s-]+/);
  if (parts.length >= 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const y = parts[0];
      const mNum = parseInt(parts[1], 10);
      const mPad = String(mNum).padStart(2, '0');
      const label = fullMonthNames[mNum - 1] || 'October';
      return { monthKey: `${y}-${mPad}`, monthLabel: `${label} ${y}` };
    } else {
      // DD Mon YYYY
      const mStr = parts[1].toLowerCase().substring(0, 3);
      const mPad = monthsMap[mStr] || '10';
      const mIdx = parseInt(mPad, 10) - 1;
      const y = parts[2];
      const label = fullMonthNames[mIdx] || 'October';
      return { monthKey: `${y}-${mPad}`, monthLabel: `${label} ${y}` };
    }
  }

  return { monthKey: '2026-10', monthLabel: 'October 2026' };
}

/**
 * Computes monthly inflow, outflow, net delta, and category destination breakdown
 */
export function computeMonthlyBreakdown(transactions) {
  const monthlyMap = {};

  for (const tx of transactions) {
    const key = tx.monthKey || '2026-10';
    const label = tx.monthLabel || 'October 2026';

    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        monthKey: key,
        monthLabel: label,
        inflow: 0,
        outflow: 0,
        net: 0,
        txCount: 0,
        debitCount: 0,
        creditCount: 0,
        categories: {}
      };
    }

    const m = monthlyMap[key];
    m.txCount++;

    const amt = Number(tx.amount) || 0;
    if (tx.type === 'debit') {
      m.outflow += amt;
      m.debitCount++;
      const cat = tx.category || 'Discretionary';
      m.categories[cat] = (m.categories[cat] || 0) + amt;
    } else {
      m.inflow += amt;
      m.creditCount++;
    }
  }

  // Format numbers and sort available months descending
  const availableMonths = Object.keys(monthlyMap)
    .sort((a, b) => b.localeCompare(a))
    .map(k => {
      const item = monthlyMap[k];
      item.net = item.inflow - item.outflow;

      // Find top destination category
      let topCategory = 'Discretionary';
      let topCategoryAmt = 0;
      for (const [catName, catAmt] of Object.entries(item.categories)) {
        if (catAmt > topCategoryAmt) {
          topCategoryAmt = catAmt;
          topCategory = catName;
        }
      }
      item.topCategory = topCategory;
      item.topCategoryAmount = Number(topCategoryAmt.toFixed(2));
      item.inflow = Number(item.inflow.toFixed(2));
      item.outflow = Number(item.outflow.toFixed(2));
      item.net = Number(item.net.toFixed(2));
      return item;
    });

  return {
    monthlySummary: monthlyMap,
    availableMonths
  };
}

/**
 * Parses a PDF bank statement using pdftotext
 */
export function parsePdfStatement(pdfPath, originalFilename = '', userCurrency = '') {
  let rawText = '';
  try {
    rawText = execSync(`pdftotext -layout "${pdfPath}" -`, {
      encoding: 'utf8',
      maxBuffer: 60 * 1024 * 1024
    });
  } catch (err) {
    console.error('[statementParser] pdftotext failed:', err);
    throw new Error('Could not extract text from PDF statement. Please ensure the PDF is not password-protected.');
  }

  const isOpay = rawText.includes('Opay') || rawText.includes('OPay') || rawText.includes('OWealth') || rawText.includes('opay');
  const isNigerian = isOpay || rawText.includes('NGN') || rawText.includes('Naira') || rawText.includes('Kuda') || rawText.includes('GTBank') || rawText.includes('Zenith') || rawText.includes('Access Bank') || rawText.includes('FirstBank') || rawText.includes('UBA') || rawText.includes('Moniepoint') || rawText.includes('Palmpay') || rawText.includes('PalmPay') || (userCurrency === '₦' || userCurrency === 'NGN');

  let currency = '$';
  if (isNigerian || rawText.includes('₦') || userCurrency === '₦' || userCurrency === 'NGN') {
    currency = '₦';
  } else if (rawText.includes('£') || userCurrency === '£') {
    currency = '£';
  } else if (rawText.includes('€') || userCurrency === '€') {
    currency = '€';
  } else if (userCurrency) {
    currency = userCurrency;
  }

  const meta = {
    bank: isOpay ? 'OPay Digital Services Limited' : 'Bank Statement',
    currency,
    accountName: '',
    accountNumber: '',
    totalDebit: '',
    totalCredit: '',
    filename: originalFilename
  };

  const nameMatch = rawText.match(/Account Name[\s\S]*?\n([A-Z\s]{4,50})\s+\d{10}/);
  if (nameMatch) {
    meta.accountName = nameMatch[1].replace(/\s+/g, ' ').trim();
  } else {
    const fallbackName = originalFilename.split('_')[0];
    if (fallbackName && fallbackName.length > 3) meta.accountName = fallbackName.replace(/[-_]/g, ' ').trim();
  }

  const numMatch = rawText.match(/Account Number[\s\S]*?\n[A-Z\s]+\s+(\d{10})/);
  if (numMatch) meta.accountNumber = numMatch[1].trim();

  const debitMatch = rawText.match(/Total Debit[\s\S]*?\n[₦$]?([0-9,]+\.[0-9]{2})/);
  if (debitMatch) meta.totalDebit = debitMatch[1];

  const creditMatch = rawText.match(/Total Credit[\s\S]*?\n[₦$]?([0-9,]+\.[0-9]{2})/);
  if (creditMatch) meta.totalCredit = creditMatch[1];

  const lines = rawText.split('\n');
  const transactions = [];

  const rowRegex = /^\s*(\d{2}\s+[A-Za-z]{3}\s+\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(\d{2}\s+[A-Za-z]{3}\s+\d{4})\s+(.+)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(rowRegex);
    if (!match) continue;

    const transDate = match[1];
    const transTime = match[2];
    const remainder = match[4];

    const numMatches = Array.from(remainder.matchAll(/(--|[0-9,]+\.[0-9]{2})/g)).map(m => m[0]);
    if (numMatches.length < 2) continue;

    let debit = 0;
    let credit = 0;
    const rawDebit = numMatches[0];
    const rawCredit = numMatches[1];

    if (rawDebit !== '--') debit = parseFloat(rawDebit.replace(/,/g, '')) || 0;
    if (rawCredit !== '--') credit = parseFloat(rawCredit.replace(/,/g, '')) || 0;

    const firstAmtIdx = remainder.indexOf(numMatches[0]);
    let desc = remainder.substring(0, firstAmtIdx).trim();

    let fullDesc = desc;
    if (i > 0 && lines[i - 1].trim() && !lines[i - 1].match(rowRegex)) {
      const prev = lines[i - 1].trim();
      if (prev.length > 4 && !prev.includes('Balance After') && !prev.includes('Trans. Time') && !prev.includes('Account Statement')) {
        fullDesc = `${prev} ${desc}`.trim();
      }
    }
    if (i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].match(rowRegex)) {
      const next = lines[i + 1].trim();
      if (next.length > 3 && !next.match(/^\d{2}\s+[A-Za-z]{3}/) && !next.match(/^[0-9]+$/)) {
        fullDesc = `${fullDesc} ${next}`.trim();
      }
    }

    fullDesc = fullDesc.replace(/\s+/g, ' ').substring(0, 80).trim();
    if (!fullDesc) fullDesc = 'Bank Transaction';

    const isDebit = debit > 0;
    const amount = isDebit ? debit : credit;

    if (amount > 0) {
      const category = categorizeMerchant(fullDesc);
      const { monthKey, monthLabel } = getMonthMeta(transDate);

      transactions.push({
        date: formatDateIso(transDate),
        displayDate: transDate,
        time: transTime,
        merchant: fullDesc,
        amount,
        type: isDebit ? 'debit' : 'credit',
        category,
        currency,
        monthKey,
        monthLabel,
        timestamp: new Date(transDate + ' ' + transTime).toISOString()
      });
    }
  }

  // Sort descending by timestamp (newest first)
  transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Aggregate monthly stats across all months
  const { monthlySummary, availableMonths } = computeMonthlyBreakdown(transactions);

  return {
    meta,
    totalCountInStatement: transactions.length,
    monthlySummary,
    availableMonths,
    transactions
  };
}

/**
 * Parses a standard CSV statement
 */
export function parseCsvStatement(csvPath, originalFilename = '', userCurrency = '') {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) {
    throw new Error('CSV file has no transaction rows.');
  }

  const header = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const dateIdx = header.findIndex(h => h.includes('date') || h.includes('time'));
  const descIdx = header.findIndex(h => h.includes('description') || h.includes('merchant') || h.includes('payee') || h.includes('narrative') || h.includes('details') || h.includes('name'));
  const amtIdx = header.findIndex(h => h.includes('amount') || h.includes('debit') || h.includes('total') || h.includes('paid out'));
  const catIdx = header.findIndex(h => h.includes('category') || h.includes('type'));

  const isNigerian = content.includes('NGN') || content.includes('Naira') || content.includes('Opay') || content.includes('OPay') || content.includes('OWealth') || content.includes('Kuda') || (userCurrency === '₦' || userCurrency === 'NGN');
  let currency = '$';
  if (isNigerian || content.includes('₦') || userCurrency === '₦' || userCurrency === 'NGN') {
    currency = '₦';
  } else if (content.includes('£') || userCurrency === '£') {
    currency = '£';
  } else if (content.includes('€') || userCurrency === '€') {
    currency = '€';
  } else if (userCurrency) {
    currency = userCurrency;
  }

  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length >= 2) {
      const rawDate = (dateIdx >= 0 && cols[dateIdx]) ? cols[dateIdx] : '2026-10-20';
      const merchant = (descIdx >= 0 && cols[descIdx]) ? cols[descIdx] : (cols[1] || 'Unknown Merchant');

      const rawAmt = (amtIdx >= 0 && cols[amtIdx]) ? cols[amtIdx] : (cols[cols.length - 1] || '0');
      const cleanNum = parseFloat(String(rawAmt).replace(/[^0-9.-]/g, ''));
      const amount = isNaN(cleanNum) ? 0 : Math.abs(cleanNum);
      const category = (catIdx >= 0 && cols[catIdx]) ? cols[catIdx] : categorizeMerchant(merchant);
      const isCredit = String(rawAmt).includes('+') || (cols.some(c => c.toLowerCase() === 'credit'));
      const { monthKey, monthLabel } = getMonthMeta(rawDate);

      if (amount > 0 || merchant !== 'Unknown Merchant') {
        transactions.push({
          date: formatDateIso(rawDate),
          displayDate: rawDate,
          merchant,
          amount,
          type: isCredit ? 'credit' : 'debit',
          category,
          currency,
          monthKey,
          monthLabel,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  transactions.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  const { monthlySummary, availableMonths } = computeMonthlyBreakdown(transactions);

  return {
    meta: {
      bank: 'CSV Statement Import',
      currency,
      filename: originalFilename
    },
    totalCountInStatement: transactions.length,
    monthlySummary,
    availableMonths,
    transactions
  };
}

function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim().replace(/^["']|["']$/g, ''));
  return result;
}

function categorizeMerchant(name) {
  const dLower = (name || '').toLowerCase();
  if (dLower.includes('owealth') || dLower.includes('auto-save') || dLower.includes('interest')) {
    return 'Savings & Wealth';
  }
  if (dLower.includes('transfer to') || dLower.includes('transfer from') || dLower.includes('palmpay') || dLower.includes('kuda') || dLower.includes('moniepoint') || dLower.includes('fcmb') || dLower.includes('zenith') || dLower.includes('gtbank')) {
    return 'Transfers';
  }
  if (dLower.includes('airtime') || dLower.includes('mtn') || dLower.includes('glo') || dLower.includes('airtel') || dLower.includes('data') || dLower.includes('recharge')) {
    return 'Airtime & Utilities';
  }
  if (dLower.includes('food') || dLower.includes('chowdeck') || dLower.includes('restaurant') || dLower.includes('kitchen') || dLower.includes('eat') || dLower.includes('doordash')) {
    return 'Dining Out';
  }
  if (dLower.includes('market') || dLower.includes('grocery') || dLower.includes('store') || dLower.includes('mart') || dLower.includes('wholefds')) {
    return 'Groceries';
  }
  if (dLower.includes('uber') || dLower.includes('bolt') || dLower.includes('fuel') || dLower.includes('transport') || dLower.includes('pos transfer') || dLower.includes('pos ')) {
    return 'Transport & POS';
  }
  if (dLower.includes('sub') || dLower.includes('netflix') || dLower.includes('spotify') || dLower.includes('apple') || dLower.includes('google') || dLower.includes('aws') || dLower.includes('openai') || dLower.includes('adobe')) {
    return 'Subscriptions';
  }
  if (dLower.includes('levy') || dLower.includes('fee') || dLower.includes('charge') || dLower.includes('tax') || dLower.includes('duty')) {
    return 'Bank Charges & Levies';
  }
  return 'Discretionary';
}

function formatDateIso(dateStr) {
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

/**
 * Detects recurring subscription proposals in a batch of transactions.
 * Groups debits by normalized vendor + same amount.
 * 2+ occurrences about 28 to 31 days apart (also ~7 and ~365) for a vendor not in the ledger
 * -> returns NEW_SUBSCRIPTION_PROPOSAL { type, vendor, raw_pattern, amount, detected_cadence, occurrences, first_seen }.
 * Writes nothing.
 */
export function detectSubscriptionProposals(transactions = [], existingLedgerServices = {}) {
  let services = existingLedgerServices;
  if (services && services.value && services.value.services) {
    services = services.value.services;
  } else if (services && services.subscription_ledger && services.subscription_ledger.value && services.subscription_ledger.value.services) {
    services = services.subscription_ledger.value.services;
  }

  const isVendorInLedger = (vendorName) => {
    if (!services || typeof services !== 'object') return false;
    const vLower = (vendorName || '').toLowerCase().trim();
    const vSlug = vLower.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    for (const [slug, s] of Object.entries(services)) {
      if (slug === vSlug || slug.includes(vSlug) || (vSlug && vSlug.includes(slug))) {
        return true;
      }
      if (s.display_name && (s.display_name.toLowerCase().includes(vLower) || vLower.includes(s.display_name.toLowerCase()))) {
        return true;
      }
      if (Array.isArray(s.raw_patterns)) {
        if (s.raw_patterns.some(p => p.toLowerCase().includes(vLower) || vLower.includes(p.toLowerCase()))) {
          return true;
        }
      }
    }
    return false;
  };

  const groups = new Map();

  for (const tx of transactions) {
    if (tx.type === 'credit') continue;
    const amount = Number(tx.amount);
    if (!amount || isNaN(amount) || amount <= 0) continue;
    const rawVendor = tx.merchant || tx.vendor || '';
    if (!rawVendor) continue;

    const normVendor = rawVendor.toLowerCase().replace(/[*\\_]/g, ' ').replace(/\s+/g, ' ').trim();
    const amtKey = amount.toFixed(2);
    const groupKey = `${normVendor}:::${amtKey}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        rawVendor,
        normVendor,
        amount,
        transactions: []
      });
    }
    groups.get(groupKey).transactions.push(tx);
  }

  const proposals = [];

  for (const [, group] of groups) {
    if (group.transactions.length < 2) continue;
    if (isVendorInLedger(group.normVendor) || isVendorInLedger(group.rawVendor)) {
      continue;
    }

    const sorted = [...group.transactions].sort((a, b) => {
      const tA = new Date(a.date || a.timestamp || 0).getTime();
      const tB = new Date(b.date || b.timestamp || 0).getTime();
      return tA - tB;
    });

    const intervalsInDays = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].date || sorted[i].timestamp || 0).getTime();
      const d2 = new Date(sorted[i + 1].date || sorted[i + 1].timestamp || 0).getTime();
      if (!isNaN(d1) && !isNaN(d2) && d2 >= d1) {
        const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        intervalsInDays.push(diffDays);
      }
    }

    if (intervalsInDays.length === 0) continue;

    let detectedCadence = null;
    const hasMonthly = intervalsInDays.some(d => d >= 26 && d <= 34);
    const hasWeekly = intervalsInDays.some(d => d >= 5 && d <= 9);
    const hasAnnual = intervalsInDays.some(d => d >= 350 && d <= 380);

    if (hasMonthly) {
      detectedCadence = 'monthly';
    } else if (hasWeekly) {
      detectedCadence = 'weekly';
    } else if (hasAnnual) {
      detectedCadence = 'annual';
    }

    if (detectedCadence) {
      const firstTx = sorted[0];
      const firstSeen = firstTx.date || firstTx.timestamp || new Date().toISOString().split('T')[0];
      proposals.push({
        type: 'NEW_SUBSCRIPTION_PROPOSAL',
        vendor: group.rawVendor,
        raw_pattern: group.rawVendor,
        amount: group.amount,
        detected_cadence: detectedCadence,
        occurrences: sorted.length,
        first_seen: firstSeen
      });
    }
  }

  return proposals;
}

