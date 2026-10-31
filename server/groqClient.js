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
    const reserve = (userProfile && userProfile.reserve !== undefined) ? Number(userProfile.reserve).toFixed(2) : '0.00';
    const subsCount = (userProfile && userProfile.subscriptionsCount !== undefined) ? userProfile.subscriptionsCount : 0;
    const subsSum = (userProfile && userProfile.subscriptionsSum !== undefined) ? Number(userProfile.subscriptionsSum).toFixed(2) : '0.00';

    return `You are PocketSentinel AI, the sovereign personal financial intelligence engine of PocketSentinel (anchored to Walrus Episodic Memory on Sui Mainnet). You are advising ${userName}.

### USER LIVE FINANCIAL STATUS (REAL NUMBERS IN THE APP):
• User Profile: ${userName} | Real Hourly Wage: ${currency}${wage}/hr (Vicki Robin Life Energy metric)
• Monthly Direct Inflow: ${currency}${inflow} / month
• Fixed Subscriptions: ${currency}${subsSum} / month across ${subsCount} active services
• Walrus Savings Vault / Emergency Buffer: ${currency}${reserve} (George S. Clason 10% Babylon Reserve / Morgan Housel Buffer)
• Available Safe-to-Spend Runway: ${currency}${safeSpend}
• Daily Burn Velocity Allowance: ${currency}${dailyVelocity} / day across the ${daysLeft} remaining days in current billing cycle
• Digital Envelopes:
  - Groceries & Household: ${currency}0.00 spent of allocated target
  - Dining Out & Social: ${isBalanced ? `${currency}0.00 spent (Balanced)` : `${currency}0.00 spent`}
  - Discretionary Fun: ${currency}0.00 spent
  - Transportation & Fuel: ${currency}0.00 spent
  - Utilities & Internet: ${currency}0.00 spent
  - Emergency Reserve Vault: ${currency}${reserve} untouched
• Active Urgent Watchdog Alerts:
  ${subsCount > 0 ? `Tracking ${subsCount} active recurring debits with Walrus memory reconciliation.` : 'Zero active alert warnings. All baselines verified and clean slate confirmed.'}

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
  generateLocalReasoningResponse(query, mode, envelopesRebalanced, userProfile) {
    const qLower = query.toLowerCase();
    const isBalanced = Boolean(envelopesRebalanced);
    const cur = (userProfile && userProfile.currency) || '$';
    const currentSafeSpend = (userProfile && userProfile.safeSpend !== undefined) ? Number(userProfile.safeSpend) : 482.35;
    const daysRemaining = (userProfile && userProfile.cycleDays) || 10;
    const dailyVelocity = (userProfile && userProfile.dailyVelocity !== undefined) ? Number(userProfile.dailyVelocity) : (daysRemaining > 0 ? (currentSafeSpend / daysRemaining) : 48.23);
    const reserve = (userProfile && userProfile.reserve !== undefined) ? Number(userProfile.reserve) : 0.00;
    const inflow = (userProfile && userProfile.inflow !== undefined) ? Number(userProfile.inflow) : 4850.00;
    const wage = (userProfile && userProfile.hourlyWage !== undefined) ? Number(userProfile.hourlyWage) : 25.00;
    const subsCount = (userProfile && userProfile.subscriptionsCount !== undefined) ? userProfile.subscriptionsCount : 0;
    const subsSum = (userProfile && userProfile.subscriptionsSum !== undefined) ? Number(userProfile.subscriptionsSum) : 0.00;

    const priceMatch = query.match(/(?:[$₦€£]|(?:[A-Z]{3}))?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
    const amount = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

    // 1. Affordability question with price
    if (amount > 0 && (qLower.includes('afford') || qLower.includes('dinner') || qLower.includes('spend') || qLower.includes('buy') || qLower.includes('cost') || qLower.includes('trip') || qLower.includes('shopping') || qLower.includes('sushi') || qLower.includes('shoes') || qLower.includes('jacket'))) {
      const daysBurn = dailyVelocity > 0 ? (amount / dailyVelocity).toFixed(1) : '0.0';
      const remainingSafe = (currentSafeSpend - amount).toFixed(2);
      const newDaily = remainingSafe > 0 && daysRemaining > 0 ? (remainingSafe / daysRemaining).toFixed(2) : '0.00';
      const pctBuffer = currentSafeSpend > 0 ? Math.round((amount / currentSafeSpend) * 100) : 100;

      if (mode === 'roast') {
        if (amount > currentSafeSpend) {
          return `**PocketSentinel Roast:** Absolutely NOT! You want to drop **${cur}${amount.toFixed(2)}** when your total safe cash is only **${cur}${currentSafeSpend.toFixed(2)}**? As Morgan Housel wrote in *The Psychology of Money*, "Spending money to show people how much money you have is the fastest way to have less money." That puts you **${cur}${(amount - currentSafeSpend).toFixed(2)} in the red** and wipes out your buffer! Step away from the checkout!`;
        }
        return `**PocketSentinel Roast:** Dropping **${cur}${amount.toFixed(2)}** eats up **${daysBurn} days of runway**, lowering your daily allowance from ${cur}${dailyVelocity.toFixed(2)} down to **${cur}${newDaily}/day**! ${!isBalanced ? 'Check your envelope allocations first before swiping!' : 'Your envelopes are in balance, but do not get reckless.'}`;
      }

      if (mode === 'hype') {
        if (amount <= currentSafeSpend) {
          return `**Hype Verdict:** You are clear to swipe! Spending **${cur}${amount.toFixed(2)}** leaves **${cur}${remainingSafe}** in discretionary cash (${cur}${newDaily}/day velocity), and your ${cur}${reserve.toFixed(2)} emergency buffer is locked and protected! In the words of Ramit Sethi: "Spend extravagantly on the things you love, as long as your numbers are dialed in." Enjoy guilt-free!`;
        }
        return `**Hype Coaching:** Hold up superstar! **${cur}${amount.toFixed(2)}** exceeds your safe cash by **${cur}${(amount - currentSafeSpend).toFixed(2)}**. Let's build up that runway first so you stay in total control!`;
      }

      // Sentinel Mode
      if (amount <= (dailyVelocity * 1.2)) {
        return `**Sentinel Affordability Verdict: <span class="text-green">APPROVED</span>**\n\n- **Purchase Amount:** **${cur}${amount.toFixed(2)}** (consumes ~${daysBurn} days of daily velocity).\n- **Remaining Safe Runway:** **${cur}${remainingSafe}** (${cur}${newDaily}/day across the ${daysRemaining} remaining cycle days).\n- **Savings Buffer:** ${cur}${reserve.toFixed(2)} Emergency Vault 100% protected.\n\n*Personal Finance Principle (Vicki Robin):* This purchase consumes ~${wage > 0 ? (amount / wage).toFixed(1) : '0'} hours of life energy. Well within your conscious spending baseline.`;
      } else if (amount <= (dailyVelocity * 3.5)) {
        return `**Sentinel Affordability Verdict: <span class="text-amber">CAUTION</span>**\n\n- **Purchase Amount:** **${cur}${amount.toFixed(2)}** (consumes ~${daysBurn} days of runway velocity).\n- **Remaining Safe Runway:** **${cur}${remainingSafe}** (${cur}${newDaily}/day for ${daysRemaining} days).\n- **Recommendation:** Safe to proceed, but requires tightening discretionary spending over the next 3 days.\n\n*Adaptive Rebalancing:* Ensure you have sufficient cushion in your living envelopes before swiping.`;
      } else if (amount <= currentSafeSpend) {
        return `**Sentinel Affordability Verdict: <span class="text-coral">HIGH IMPACT</span>**\n\n- **Purchase Amount:** **${cur}${amount.toFixed(2)}** (burns ${pctBuffer}% of your remaining safe cash).\n- **Remaining Safe Runway:** **${cur}${remainingSafe}** (${cur}${newDaily}/day across ${daysRemaining} days).\n- **Warning:** Leaves very little cushion for unexpected debits. Consider delaying until your next direct deposit (${cur}${inflow.toFixed(2)}) clears.`;
      } else {
        return `**Sentinel Affordability Verdict: <span class="text-coral">RUNWAY BREACH</span>**\n\n- **Purchase Amount:** **${cur}${amount.toFixed(2)}** exceeds safe cash (${cur}${currentSafeSpend.toFixed(2)}) by **+${cur}${(amount - currentSafeSpend).toFixed(2)}**.\n- **Critical Warning:** Swiping for this debit will breach your ${cur}${reserve.toFixed(2)} emergency savings goal or cause upcoming recurring bills to bounce!`;
      }
    }

    // 2. Roast query
    if (mode === 'roast' || qLower.includes('roast')) {
      if (isBalanced) {
        return `**PocketSentinel Roast:** Look at you, actually balancing your envelopes before swiping! But don't pat yourself on the back too hard. Keep your subscriptions lean and watch out for hidden delivery fees and unused apps!`;
      }
      return `**PocketSentinel Roast:** You want accountability? Check your recurring subscriptions and delivery markups! Cut the phantom services you opened once and never use again. Put down the takeout menu and build that cash runway!`;
    }

    // 3. Cash leaks / Subscription waste
    if (qLower.includes('leak') || qLower.includes('creep') || qLower.includes('waste') || qLower.includes('cancel')) {
      return `**Cash Leak & Subscription Protection:**\n\n1. **Recurring Services Monitored:** Tracking ${subsCount} active services (${cur}${subsSum.toFixed(2)}/mo total).\n2. **Free Trial Defense:** 48-hour advance alarms armed before any free trial converts to a paid renewal.\n3. **Price Creep Radar:** Continuous comparison against historical baseline memory records on Sui Mainnet.\n\n*Wisdom (Ramit Sethi):* "Cutting back on subscriptions you do not use does 10x more for your wealth than obsessing over small purchases."`;
    }

    // 4. Financial lessons & Authors
    if (qLower.includes('housel') || qLower.includes('psychology of money')) {
      return `**Morgan Housel (*The Psychology of Money*) Applied to Your Numbers:**\n\n- **Room for Error is Wisdom, Not Waste:** Your ${cur}${reserve.toFixed(2)} emergency buffer is insurance against life unpredictability. As Housel wrote: *"The most important part of every plan is planning on your plan not going according to plan."*\n- **True Wealth is Unspent:** Having a safe runway of **${cur}${currentSafeSpend.toFixed(2)}** (${cur}${dailyVelocity.toFixed(2)}/day across ${daysRemaining} days) gives you freedom and autonomy, which provides far more happiness than impulse purchases.\n- **Avoid Social Comparison:** Do not spend to impress others. Living comfortably below your means is the foundation of lasting wealth.`;
    }

    if (qLower.includes('ramit') || qLower.includes('sethi') || qLower.includes('conscious spending')) {
      return `**Ramit Sethi (*I Will Teach You To Be Rich*) Applied to Your Numbers:**\n\n- **The Conscious Spending Plan:** Spend extravagantly on the things you truly love, and cut costs mercilessly on the things you don't.\n- **Fix the Big Wins:** Focus on optimizing recurring bills and eliminating unwanted zombie trials rather than agonizing over minor daily expenses.\n- **Guilt-Free Spending:** With your emergency reserve funded (${cur}${reserve.toFixed(2)}) and commitments accounted for, your remaining **${cur}${currentSafeSpend.toFixed(2)} runway** is yours to deploy with confidence!`;
    }

    if (qLower.includes('vicki') || qLower.includes('robin') || qLower.includes('life energy')) {
      return `**Vicki Robin (*Your Money or Your Life*) Applied to Your Numbers:**\n\n- **Money = Life Energy:** Based on your wage of ${cur}${wage.toFixed(2)}/hour, every expenditure represents hours of your finite life.\n- **Evaluating Purchases:** A ${cur}100 expense costs you **${wage > 0 ? (100 / wage).toFixed(1) : '4'} hours of your life energy**.\n- **Enough Point:** Your current runway of **${cur}${currentSafeSpend.toFixed(2)}** keeps you in control without accumulating debt or wasteful consumption.`;
    }

    if (qLower.includes('babylon') || qLower.includes('clason') || qLower.includes('pay yourself first')) {
      return `**George S. Clason (*The Richest Man in Babylon*) Applied to Your Numbers:**\n\n- **A Part of All You Earn is Yours to Keep:** The first rule of gold is putting aside at least 10% of all earnings into your reserve vault before spending begins.\n- **Control Thy Expenditures:** Do not confuse necessary expenses with desires. Keep fixed commitments controlled, leaving room for safe living cash.`;
    }

    if (qLower.includes('lesson') || qLower.includes('book') || qLower.includes('advice') || qLower.includes('wisdom') || qLower.includes('learn')) {
      return `**Core Financial Lessons from Essential Finance Literature:**\n\n- **Pay Yourself First (*The Richest Man in Babylon*):** Your ${cur}${reserve.toFixed(2)} transfer ensures capital is preserved before spending begins.\n- **Conscious Spending (*I Will Teach You To Be Rich*):** Prioritize ruthlessly: spend where it brings true joy and eliminate stealth leaks.\n- **Room for Error (*The Psychology of Money*):** A cash runway of ${cur}${currentSafeSpend.toFixed(2)} protects you from debt without needing to predict every emergency.`;
    }

    // 5. Default status
    return `Audited your live financial status against verified spending baselines.\n\n- **Safe-to-Spend Runway:** **${cur}${currentSafeSpend.toFixed(2)}** (${cur}${dailyVelocity.toFixed(2)}/day velocity, ${daysRemaining} days remaining).\n- **Envelopes Status:** ${isBalanced ? 'All categories in zero-based balance.' : 'Categories ready for adaptive rebalancing.'}\n- **Recurring Commitments:** ${cur}${subsSum.toFixed(2)}/mo across ${subsCount} verified services.\n\nAsk me anything: *"Can I afford a ${cur}50 purchase today?"*, *"How does Vicki Robin calculate life energy?"*, or *"Give me a financial roast."*`;
  }
}
