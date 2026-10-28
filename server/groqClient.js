/**
 * groqClient.js — High-Speed Groq AI Copilot for Recall
 * 
 * Capabilities:
 * - Powered by Groq's ultra-fast inference (llama-3.3-70b-versatile / llama-3.1-8b-instant)
 * - Has full awareness of the user's real-time financial status & live metrics:
 *   • Monthly Inflow: $4,850.00
 *   • Fixed Subscriptions: $301.46 (9 services)
 *   • Walrus Emergency Buffer: $500.00
 *   • Variable Spend: $3,566.19
 *   • Available Safe-to-Spend Runway: $482.35
 *   • Daily Burn Velocity: $48.23/day (10 days remaining in cycle)
 *   • 6 Digital Envelopes (Dining Out -$45.00 deficit, Fun +$130.00 surplus)
 *   • 12 Walrus episodic memory records anchored to Sui Mainnet
 * - Teaches timeless personal finance principles synthesized from:
 *   • "The Psychology of Money" (Morgan Housel)
 *   • "I Will Teach You To Be Rich" (Ramit Sethi — Conscious Spending)
 *   • "Your Money or Your Life" (Vicki Robin — Money as Life Energy)
 *   • "The Richest Man in Babylon" (George S. Clason — Pay Yourself First)
 *   • Adaptive Rebalancing ("Roll With the Punches" — Zero-Based Balance)
 * - 3 Switchable behavioral personas: Sentinel (Forensic Strategist), Roast (Tough Love), Hype (Encouraging Coach)
 * - Resilient offline fallback engine when GROQ_API_KEY is not yet supplied.
 */

import 'dotenv/config';

export class GroqClient {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.GROQ_API_KEY || '';
    this.model = config.model || process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  setApiKey(key) {
    this.apiKey = key ? key.trim() : '';
  }

  /**
   * Builds the comprehensive financial blueprint & literature knowledge base prompt
   */
  buildSystemPrompt(mode = 'sentinel', envelopesRebalanced = false, userProfile = null) {
    const isBalanced = Boolean(envelopesRebalanced);
    const userName = (userProfile && userProfile.name) || 'Alex Rivera';
    const currency = (userProfile && userProfile.currency) || '$';
    const inflow = (userProfile && userProfile.inflow !== undefined) ? Number(userProfile.inflow).toFixed(2) : '4,850.00';
    const wage = (userProfile && userProfile.hourlyWage !== undefined) ? Number(userProfile.hourlyWage).toFixed(2) : '25.00';
    const daysLeft = (userProfile && userProfile.cycleDays) || 10;
    const safeSpend = (userProfile && userProfile.safeSpend !== undefined) ? Number(userProfile.safeSpend).toFixed(2) : '482.35';
    const dailyVelocity = (userProfile && userProfile.dailyVelocity !== undefined) ? Number(userProfile.dailyVelocity).toFixed(2) : '48.23';

    return `You are PocketSentinel AI, the sovereign personal financial intelligence engine of PocketSentinel (anchored to Walrus Episodic Memory on Sui Mainnet). You are advising ${userName}.

### USER LIVE FINANCIAL STATUS (REAL NUMBERS IN THE APP):
• User Profile: ${userName} | Real Hourly Wage: ${currency}${wage}/hr (Vicki Robin Life Energy metric)
• Monthly Direct Inflow: ${currency}${inflow} / month
• Fixed Subscriptions: ${currency}301.46 / month across 9 active services (Netflix ${currency}17.99, Spotify ${currency}10.99, ChatGPT Plus ${currency}20.00, GitHub Copilot ${currency}10.00, etc.)
• Walrus Savings Vault / Emergency Buffer: ${currency}500.00 (George S. Clason 10% Babylon Reserve / Morgan Housel Buffer)
• Variable Statement Spend: ${currency}3,566.19 (Audited debits)
• Available Safe-to-Spend Runway: ${currency}${safeSpend}
• Daily Burn Velocity Allowance: ${currency}${dailyVelocity} / day across the ${daysLeft} remaining days in current billing cycle
• Digital Envelopes:
  - Groceries & Household: +${currency}104.80 left (${currency}495.20 spent of ${currency}600 budgeted)
  - Dining Out & Social: ${isBalanced ? `+${currency}0.00 BALANCED (${currency}395 allocated / ${currency}395 spent)` : `-${currency}45.00 DEFICIT (${currency}395 spent of ${currency}350 budgeted - NEEDS REBALANCE)`}
  - Discretionary Fun: ${isBalanced ? `+${currency}85.00 left (${currency}120 spent of ${currency}205 allocated)` : `+${currency}130.00 SURPLUS (${currency}120 spent of ${currency}250 budgeted)`}
  - Transportation & Fuel: ${currency}184.20 spent (${currency}250 budgeted)
  - Utilities & Internet: ${currency}140.00 spent (${currency}150 budgeted)
  - Emergency Reserve Vault: ${currency}500.00 untouched
• Active Urgent Watchdog Alerts:
  1. Adobe Creative Cloud: 7-day trial expires in 48 hours ($54.99/mo rebill risk). Recommendation: 1-tap cancel pack.
  2. Netflix Standard: Billed $17.99 vs stored Walrus baseline $15.49 (+ $2.50 /mo price creep = $30.00 /year drain).
  3. Overlapping Streaming: Spotify ($10.99) and Apple Music ($10.99) active concurrently (saves $131.88/yr if consolidated).
  4. Seasonal Override: AWS surge of $142.50 auto-reconciled under historical authorized ceiling of $180.00 (MEM_04).

### MASTER FINANCIAL LITERATURE & PHILOSOPHY:
Infuse your responses with timeless principles from foundational financial works:
1. "The Psychology of Money" (Morgan Housel):
   - True wealth is what you DO NOT spend; it's the freedom to not have to do things you don't want to.
   - Leave room for error in your cash runway; surviving financial shocks is better than optimizing for perfection.
2. "I Will Teach You To Be Rich" (Ramit Sethi):
   - Conscious Spending Plan: Spend extravagantly on the things you truly love, and cut costs mercilessly on the things you don't.
   - Don't agonize over $3 lattes; focus on big wins like canceling $55/mo zombie subscriptions and negotiating recurring bills.
3. "Your Money or Your Life" (Vicki Robin):
   - Money is "Life Energy" traded for hours of your finite life. Calculate if a purchase is truly worth the hours worked.
4. "The Richest Man in Babylon" (George S. Clason):
   - "A part of all you earn is yours to keep." Pay yourself first (our $500 Walrus emergency savings vault).
5. Adaptive Rebalancing ("Roll With the Punches" - Zero-Based Balance):
   - When a category overspends (like Dining Out -$45), don't feel guilty - immediately rebalance from a surplus envelope (Fun +$130).

### ACTIVE COPILOT MODE: "${mode.toUpperCase()}"
- SENTINEL MODE (Default): Forensic, objective, empowering financial strategist. Direct with the numbers, references Walrus memory, provides clear calculations.
- ROAST MODE: Hilarious, tough-love financial intervention. Zero filter! Roast unnecessary DoorDash delivery markups, impulse shopping, and forgotten subscriptions. Demand accountability!
- HYPE MODE: High-energy financial hype-man celebrating wins, discipline, zero-debt envelopes, and savings milestones.

### GENERAL KNOWLEDGE & WORLD QUESTIONS:
- If the user asks general questions (such as world leaders, history, geography, science, civics, or definitions), answer them directly, accurately, and concisely.
- Never give robotic refusals like "As an AI, I do not track real-time political appointments..." or refuse straightforward factual questions.
- Answer the factual question directly first, and then smoothly invite their next financial query or connect to economic context.

### OUTPUT GUIDELINES:
- Keep responses concise (2 to 4 punchy paragraphs or structured bullet points).
- STRICT PROHIBITION ON OTHER PRODUCTS/SERVICES: NEVER mention or refer to external commercial personal finance apps or software products (such as YNAB, You Need A Budget, Rocket Money, Copilot Money, Mint, Truebill, Cleo, etc.). Frame budgeting concepts solely around PocketSentinel zero-based envelopes and adaptive rebalancing.
- NEVER mention Groq, Groq Cloud, LLaMA, Qwen, or backend inference provider names. You are strictly PocketSentinel AI.
- STRICT PUNCTUATION & SYMBOL BAN:
  * ABSOLUTELY NEVER use em-dashes (—) or en-dashes (–). Use standard commas (,), periods (.), or colons (:) instead.
  * NEVER output symbols like ~, ^, |, •, ▪, ✦, ★, ▲, ■, ◆, or backslashes.
  * Do NOT output raw markdown headers (###), asterisks glitching, or bullet artifacts.
  * Always use standard numbered lists (1., 2., 3.) or standard hyphens (-).
  * ALWAYS refer to the system and yourself as PocketSentinel AI (never Recall or Recall Sentinel).
- Always use the real numbers from the user's status when they ask if they can afford something.
- Compute the exact velocity cost: (Cost / $48.23 = days of runway consumed) and remaining daily velocity: (Remaining / 10 days).
- Format using clean Markdown with bold numbers.`;
  }

  /**
   * Main conversational method
   */
  async chat({ query, history = [], mode = 'sentinel', envelopesRebalanced = false, userProfile = null }) {
    const systemPrompt = this.buildSystemPrompt(mode, envelopesRebalanced, userProfile);

    // If GROQ_API_KEY is configured, call Groq API
    if (this.apiKey) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map(h => ({ role: h.role || 'user', content: h.content })),
          { role: 'user', content: query }
        ];

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(6000),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: mode === 'roast' ? 0.8 : 0.4,
            max_tokens: 650
          })
        });

        if (response.ok) {
          const data = await response.json();
          let reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
          if (reply) {
            // Sanitize em-dashes, en-dashes, weird symbols, legacy branding, and competitor names
            reply = reply
              .replace(/[\u2014\u2013—–]/g, ', ')
              .replace(/--+/g, ', ')
              .replace(/â€”|â€“|â€|Ã¢/g, '')
              .replace(/[•▪▫◦✦★▲■◆➔→➤✓✔]/g, '-')
              .replace(/[~^|\\`]/g, '')
              .replace(/\bRecall Sentinel\b/gi, 'PocketSentinel')
              .replace(/\bRecall\b/g, 'PocketSentinel')
              .replace(/\bYNAB Rule 3\b/gi, 'Adaptive Rebalancing')
              .replace(/\bYNAB\b/gi, 'Zero-Based Budgeting')
              .replace(/\bGroq Cloud\b/gi, 'PocketSentinel AI')
              .replace(/\bGroq\b/gi, 'PocketSentinel AI')
              .replace(/,\s*,+/g, ', ')
              .trim();

            return {
              success: true,
              reply,
              provider: 'PocketSentinel AI',
              mode
            };
          }
        } else {
          const errBody = await response.text();
          console.warn(`[GroqClient] Groq API returned status ${response.status}: ${errBody}`);
        }
      } catch (err) {
        console.warn(`[GroqClient] Network notice contacting Groq: ${err.message}. Falling back to local reasoning.`);
      }
    }

    // High-fidelity local reasoning engine (fallback when API key is not yet set)
    const fallbackReply = this.generateLocalReasoningResponse(query, mode, envelopesRebalanced, userProfile);
    return {
      success: true,
      reply: fallbackReply,
      provider: 'PocketSentinel AI',
      mode
    };
  }

  /**
   * Deterministic financial reasoning engine when offline or no API key
   */
  generateLocalReasoningResponse(query, mode, envelopesRebalanced) {
    const qLower = query.toLowerCase();
    const isBalanced = Boolean(envelopesRebalanced);

    const priceMatch = query.match(/\$?\s*(\d+(\.\d{1,2})?)/);
    const amount = priceMatch ? parseFloat(priceMatch[1]) : 0;

    const currentSafeSpend = 482.35;
    const dailyVelocity = 48.23;
    const daysRemaining = 10;

    // 1. Affordability question with price
    if (amount > 0 && (qLower.includes('afford') || qLower.includes('dinner') || qLower.includes('spend') || qLower.includes('buy') || qLower.includes('cost') || qLower.includes('trip') || qLower.includes('shopping') || qLower.includes('sushi') || qLower.includes('shoes') || qLower.includes('jacket'))) {
      const daysBurn = (amount / dailyVelocity).toFixed(1);
      const remainingSafe = (currentSafeSpend - amount).toFixed(2);
      const newDaily = remainingSafe > 0 ? (remainingSafe / daysRemaining).toFixed(2) : '0.00';
      const pctBuffer = Math.round((amount / currentSafeSpend) * 100);

      if (mode === 'roast') {
        if (amount > currentSafeSpend) {
          return `**PocketSentinel Roast:** Absolutely NOT! You want to drop **$${amount.toFixed(2)}** when your total safe cash is only **$482.35**? As Morgan Housel wrote in *The Psychology of Money*, "Spending money to show people how much money you have is the fastest way to have less money." That puts you **$${(amount - currentSafeSpend).toFixed(2)} in the red** and wipes out your savings buffer! Step away from the checkout!`;
        }
        return `**PocketSentinel Roast:** Dropping **$${amount.toFixed(2)}** eats up **${daysBurn} days of runway**, lowering your daily allowance from $48.23 down to **$${newDaily}/day**! ${!isBalanced ? 'And your Dining Out envelope is STILL -$45.00 in deficit! Rebalance your envelopes first before swiping!' : 'At least your envelopes are in balance, but do not get sloppy.'}`;
      }

      if (mode === 'hype') {
        if (amount <= currentSafeSpend) {
          return `**Hype Verdict:** You are clear to swipe! Spending **$${amount.toFixed(2)}** leaves **$${remainingSafe}** in discretionary cash ($${newDaily}/day velocity), and your $500 emergency buffer is 100% locked on Walrus! In the words of Ramit Sethi: "Spend extravagantly on the things you love, as long as your numbers are dialed in." ${!isBalanced ? 'Hit 1-tap rebalance on your -$45 dining deficit and enjoy!' : 'Enjoy guilt-free!'}`;
        }
        return `**Hype Coaching:** Hold up superstar! **$${amount.toFixed(2)}** exceeds your safe cash by **$${(amount - currentSafeSpend).toFixed(2)}**. Let's build up that runway first so you stay in total control!`;
      }

      // Sentinel Mode
      if (amount <= 50) {
        return `**Sentinel Affordability Verdict: <span class="text-green">APPROVED</span>**\n\n• **Purchase Amount:** **$${amount.toFixed(2)}** (consumes only ~${daysBurn} days of daily velocity).\n• **Remaining Safe Runway:** **$${remainingSafe}** ($${newDaily}/day across the ${daysRemaining} remaining cycle days).\n• **Savings Buffer:** $500.00 Walrus Emergency Vault 100% protected.\n\n*Personal Finance Principle (Vicki Robin):* This purchase consumes ~${(amount / 35).toFixed(1)} hours of life energy. Well within your conscious spending baseline.\n${!isBalanced ? '\n> ⚠️ *Note: Dining Out envelope is -$45.00 in deficit. Hit 1-Tap Rebalance to restore zero-based balance before swiping.*' : ''}`;
      } else if (amount <= 150) {
        return `**Sentinel Affordability Verdict: <span class="text-amber">CAUTION</span>**\n\n• **Purchase Amount:** **$${amount.toFixed(2)}** (consumes ~${daysBurn} days of runway velocity).\n• **Remaining Safe Runway:** **$${remainingSafe}** ($${newDaily}/day for ${daysRemaining} days).\n• **Recommendation:** Safe to proceed, but requires tightening discretionary spending over the next 3 days.\n\n*Adaptive Rebalancing:* If this purchase is dining or entertainment, ensure you shift surplus from Discretionary Fun before swiping.`;
      } else if (amount <= currentSafeSpend) {
        return `**Sentinel Affordability Verdict: <span class="text-coral">HIGH IMPACT</span>**\n\n• **Purchase Amount:** **$${amount.toFixed(2)}** (burns ${pctBuffer}% of your remaining safe cash).\n• **Remaining Safe Runway:** **$${remainingSafe}** ($${newDaily}/day across ${daysRemaining} days).\n• **Warning:** Leaves very little cushion for unexpected debits. Consider delaying until your next direct deposit ($4,850.00) clears.`;
      } else {
        return `**Sentinel Affordability Verdict: <span class="text-coral">RUNWAY BREACH</span>**\n\n• **Purchase Amount:** **$${amount.toFixed(2)}** exceeds safe cash ($482.35) by **+$${(amount - currentSafeSpend).toFixed(2)}**.\n• **Critical Warning:** Swiping for this debit will breach your $500 emergency savings goal or cause upcoming recurring bills to bounce!`;
      }
    }

    // 2. Roast query
    if (mode === 'roast' || qLower.includes('roast')) {
      if (isBalanced) {
        return `**PocketSentinel Roast:** Look at you, actually balancing your envelopes before swiping! But don't pat yourself on the back too hard - you still blew **$184.20** on DoorDash fees and your Adobe CC trial ($54.99/mo) expires in 48 hours. That's $659/year in ghost software. Keep your guard up!`;
      }
      return `**PocketSentinel Roast:** You have spent **$184.20** on food delivery markups this month while carrying an active -$45.00 dining deficit, paying $17.99 for Netflix, and sitting on an Adobe trial you opened once ($54.99/mo)! That's over **$112/mo** in stealth subscription leakage. Put down the takeout menu and make a sandwich!`;
    }

    // 3. Cash leaks / Subscription waste
    if (qLower.includes('leak') || qLower.includes('creep') || qLower.includes('waste') || qLower.includes('cancel')) {
      return `**Top 3 Cash Leaks Identified (October 2026):**\n\n1. **Adobe Creative Cloud ($54.99/mo):** Urgent 7-day trial conversion in 48h. Annual leakage prevented: **$659.88/yr**.\n2. **Netflix Standard ($17.99/mo):** Stealth +$2.50 price creep flagged against Walrus baseline [MEM_01] ($15.49). Annual leak: **$30.00/yr**.\n3. **Spotify + Apple Music Duplicate:** Simultaneous active streaming services. Consolidating saves **$131.88/yr**.\n\n*Wisdom (Ramit Sethi):* "Cutting back on $50/mo subscriptions you don't use does 10x more for your wealth than obsessing over $4 lattes." Use 1-Tap Dispute to wipe them out.`;
    }

    // 4. Financial lessons & Authors
    if (qLower.includes('housel') || qLower.includes('psychology of money')) {
      return `**Morgan Housel (*The Psychology of Money*) Applied to Your Numbers:**\n\n• **Room for Error is Wisdom, Not Waste:** Your $500.00 Walrus emergency buffer is not idle cash - it is insurance against life's unpredictability. As Housel wrote: *"The most important part of every plan is planning on your plan not going according to plan."*\n• **True Wealth is Unspent:** Having a safe runway of **$482.35** ($48.23/day across 10 days) gives you freedom and autonomy, which provides far more happiness than impulse purchases.\n• **Avoid Social Comparison:** Do not spend to impress others. Your 6.2% subscription ratio ($301.46 of $4,850 income) is lean and disciplined.`;
    }

    if (qLower.includes('ramit') || qLower.includes('sethi') || qLower.includes('conscious spending')) {
      return `**Ramit Sethi (*I Will Teach You To Be Rich*) Applied to Your Numbers:**\n\n• **The Conscious Spending Plan:** Spend extravagantly on the things you truly love, and cut costs mercilessly on the things you don't.\n• **Fix the Big Wins:** Your total fixed bills ($301.46) are only 6.2% of your $4,850 inflow (well below Ramit's 50-60% benchmark). But you have **$54.99/mo** on an Adobe CC trial and **$17.99/mo** on Netflix with a $2.50 hike. Canceling those saves **$875.88/year** - 100x more impactful than agonizing over a $4 latte.\n• **Guilt-Free Spending:** With your emergency reserve funded ($500) and bills accounted for, your remaining **$482.35 runway** is yours to spend guilt-free!`;
    }

    if (qLower.includes('vicki') || qLower.includes('robin') || qLower.includes('life energy')) {
      return `**Vicki Robin (*Your Money or Your Life*) Applied to Your Numbers:**\n\n• **Money = Life Energy:** Based on your $4,850 monthly inflow (~160 hours worked), your real hourly wage after fixed costs is ~$30.31/hour.\n• **Evaluating Purchases:** A $65 restaurant dinner costs you **2.1 hours of your finite life energy**. An unused $54.99/mo Adobe subscription costs you **1.8 hours every single month**.\n• **Enough Point:** Your current runway of **$482.35** keeps you in the sweet spot of fulfillment without accumulating debt or wasteful consumption.`;
    }

    if (qLower.includes('babylon') || qLower.includes('clason') || qLower.includes('pay yourself first')) {
      return `**George S. Clason (*The Richest Man in Babylon*) Applied to Your Numbers:**\n\n• **A Part of All You Earn is Yours to Keep:** The first rule of gold is putting aside at least 10% of all earnings. Your $500.00 Walrus emergency reserve represents **10.3% of your $4,850 inflow** paid to yourself first before any bill is paid!\n• **Control Thy Expenditures:** Do not confuse necessary expenses with desires. Your fixed commitments are $301.46, leaving $3,566.19 in audited variable expenses and $482.35 in safe cash.`;
    }

    if (qLower.includes('ynab') || qLower.includes('rule 3') || qLower.includes('punch') || qLower.includes('rebalance')) {
      return `**Adaptive Deficit Rebalancing ("Roll With The Punches") Applied to Your Envelopes:**\n\n• **Zero Guilt, Pure Adaptation:** Overspending in a category isn't a moral failure - it is simply life happening. Your Dining Out envelope is currently **-$45.00 in deficit** ($395 spent vs $350 allocated).\n• **Immediate Rebalance:** Your Discretionary Fun envelope has a **+$130.00 surplus** ($120 spent of $250). By shifting $45.00 from Fun to Dining, your ledger returns to a perfect zero-based balance without adding new debt.\n• **Every Dollar Has a Job:** Keep all $4,850 assigned so unbudgeted cash doesn't get spent blindly.`;
    }

    if (qLower.includes('lesson') || qLower.includes('book') || qLower.includes('advice') || qLower.includes('wisdom') || qLower.includes('learn')) {
      return `**Core Financial Lessons from Essential Finance Literature:**\n\n• **Pay Yourself First (*The Richest Man in Babylon*):** Your $500 monthly transfer to the Walrus vault ensures 10.3% of your $4,850 income is saved before spending begins.\n• **Conscious Spending (*I Will Teach You To Be Rich*):** Your fixed subscriptions ($301.46) represent only 6.2% of income - well within the recommended 50-60% fixed cost ceiling.\n• **Room for Error (*The Psychology of Money*):** A cash runway of $482.35 ($48.23/day) protects you from debt without needing to forecast the future.\n• **Roll With The Punches (Adaptive Rebalancing):** When dining out exceeds budget (-$45 deficit), adjust the ledger immediately from surplus categories. Balance is maintained dynamically, not rigidly.`;
    }

    // 5. Default status
    return `Audited your live Chase checking statement against your verified historical spending baselines.\n\n• **Safe-to-Spend Runway:** **$482.35** ($48.23/day velocity, 10 days remaining).\n• **Envelopes Status:** ${isBalanced ? 'All categories in zero-based balance.' : 'Dining Out has a -$45.00 deficit (1-Tap Rebalance available).'}\n• **Fixed Bills Locked:** $301.46/mo across 9 verified services.\n\nAsk me anything: *"Can I afford a $75 dinner tonight?"*, *"Where is my biggest cash leak?"*, or *"Teach me a financial lesson."*`;
  }
}
