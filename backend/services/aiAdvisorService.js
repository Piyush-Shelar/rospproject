import OpenAI from 'openai';

// Lazy-initialise so missing key doesn't crash import at startup
let _openai = null;
function getClient() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const MODEL = () => process.env.OPENAI_MODEL || 'gpt-4o-mini';

const ADVISOR_SYSTEM_PROMPT = `You are a certified, prudent financial advisor AI assistant embedded in a secure client wealth portal called Amor Wealth.

Guidelines:
- Provide objective, risk-aligned analysis based on the client's stated risk tolerance, financial goals, and current holdings.
- Explain financial concepts clearly, breaking down complex terminology into plain language.
- When evaluating a portfolio, assess diversification, sector concentration, risk exposure, and suggest practical rebalancing considerations.
- Be concise and structured — use bullet points or numbered lists where appropriate.
- Do not make speculative bets, promote volatile pump-and-dump assets, or guarantee future returns.
- Always append a brief disclaimer at the end: "⚠️ Disclaimer: This analysis is for educational purposes only and does not constitute personalised fiduciary investment advice. Consult a licensed financial advisor before making investment decisions."`;

/**
 * Compute a simple derived portfolio summary for context injection.
 */
function buildPortfolioSummary(portfolioData) {
  const assets = portfolioData.assets || [];
  const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
  const totalCost  = assets.reduce((sum, a) => sum + a.quantity * a.purchasePrice, 0);
  const unrealisedPnL = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? ((unrealisedPnL / totalCost) * 100).toFixed(2) : '0.00';

  // Allocation by asset type
  const byType = {};
  for (const a of assets) {
    byType[a.type] = (byType[a.type] || 0) + a.quantity * a.currentPrice;
  }
  const allocation = Object.entries(byType).map(([type, val]) => ({
    type,
    value: val.toFixed(2),
    pct: totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) + '%' : '0%',
  }));

  return { totalValue: totalValue.toFixed(2), unrealisedPnL: unrealisedPnL.toFixed(2), pnlPct, allocation };
}

/**
 * Run a full AI portfolio analysis.
 * @param {Object} portfolioData  - Portfolio document from MongoDB (plain object)
 * @returns {Promise<string>}     - Markdown-formatted analysis from the model
 */
export async function analyzePortfolio(portfolioData) {
  const client = getClient();
  const summary = buildPortfolioSummary(portfolioData);

  const userPrompt = `
Client Risk Tolerance: ${portfolioData.riskTolerance}
Financial Goals: ${portfolioData.financialGoals?.length ? portfolioData.financialGoals.join(', ') : 'Long-term wealth building'}

Portfolio Computed Metrics:
  • Total Market Value:  $${summary.totalValue}
  • Unrealised P&L:      $${summary.unrealisedPnL} (${summary.pnlPct}%)
  • Asset Type Allocation:
${summary.allocation.map(a => `    - ${a.type}: $${a.value} (${a.pct})`).join('\n')}

Individual Holdings (JSON):
${JSON.stringify(portfolioData.assets, null, 2)}

Please provide a structured advisory report covering:
1. **Asset Allocation & Diversification Summary**
2. **Alignment with Risk Tolerance & Goals**
3. **Key Strengths & Vulnerabilities**
4. **3 Actionable Rebalancing / Next-Step Recommendations**
`.trim();

  const response = await client.chat.completions.create({
    model: MODEL(),
    messages: [
      { role: 'system', content: ADVISOR_SYSTEM_PROMPT },
      { role: 'user',   content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 1200,
  });

  return response.choices[0].message.content;
}

/**
 * Handle a single chat turn, injecting recent history and optional portfolio context.
 * @param {Array<{role:string, content:string}>} recentHistory  - Last N messages (user + assistant)
 * @param {string}  userMessage      - The new user message
 * @param {Object|null} portfolioContext - Optional portfolio plain object for context
 * @returns {Promise<string>}        - Assistant's reply
 */
export async function handleClientChat(recentHistory, userMessage, portfolioContext = null) {
  const client = getClient();

  let contextSnippet = 'The client has not uploaded a portfolio yet.';
  if (portfolioContext) {
    const summary = buildPortfolioSummary(portfolioContext);
    contextSnippet = `Client Portfolio Context — Risk Tolerance: ${portfolioContext.riskTolerance}; ` +
      `Goals: ${portfolioContext.financialGoals?.join(', ') || 'Not specified'}; ` +
      `Holdings: ${portfolioContext.assets?.length || 0} assets; ` +
      `Total Value: $${summary.totalValue}; Unrealised P&L: $${summary.unrealisedPnL} (${summary.pnlPct}%).`;
  }

  const messages = [
    { role: 'system',    content: `${ADVISOR_SYSTEM_PROMPT}\n\n${contextSnippet}` },
    ...recentHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user',      content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: MODEL(),
    messages,
    temperature: 0.6,
    max_tokens: 800,
  });

  return response.choices[0].message.content;
}
