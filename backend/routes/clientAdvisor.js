import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import Portfolio   from '../models/Portfolio.js';
import ChatMessage from '../models/ChatMessage.js';
import { analyzePortfolio, handleClientChat } from '../services/aiAdvisorService.js';

const router = express.Router();

// All routes in this file require a valid JWT + client role
router.use(authenticate);
router.use(requireRole('client'));

/* ─────────────────────────────────────────
   PORTFOLIO ENDPOINTS
───────────────────────────────────────── */

/**
 * POST /api/client-advisor/portfolio
 * Create or fully replace the client's portfolio.
 */
router.post('/portfolio', async (req, res) => {
  try {
    const { assets, riskTolerance, financialGoals } = req.body;

    if (!Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ error: 'assets must be a non-empty array' });
    }

    // Validate each asset has required fields
    for (const a of assets) {
      if (!a.symbol || !a.type || a.quantity == null || a.purchasePrice == null || a.currentPrice == null) {
        return res.status(400).json({
          error: 'Each asset must have: symbol, type, quantity, purchasePrice, currentPrice',
        });
      }
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, assets, riskTolerance, financialGoals, updatedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ message: 'Portfolio saved successfully', portfolio });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to save portfolio: ' + err.message });
  }
});

/**
 * GET /api/client-advisor/portfolio
 * Fetch the authenticated client's portfolio.
 */
router.get('/portfolio', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id }).lean();
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio found. Please upload your holdings first.' });
    }
    return res.status(200).json(portfolio);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch portfolio: ' + err.message });
  }
});

/**
 * POST /api/client-advisor/portfolio/analyze
 * Run an AI analysis on the client's current portfolio.
 */
router.post('/portfolio/analyze', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id }).lean();
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio found. Please upload your holdings before requesting an analysis.' });
    }
    if (!portfolio.assets || portfolio.assets.length === 0) {
      return res.status(400).json({ error: 'Portfolio has no assets to analyze.' });
    }

    const analysis = await analyzePortfolio(portfolio);
    return res.status(200).json({ analysis });
  } catch (err) {
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'AI service is not configured. Contact your administrator.' });
    }
    return res.status(500).json({ error: 'Portfolio analysis failed: ' + err.message });
  }
});

/* ─────────────────────────────────────────
   CHAT ENDPOINTS
───────────────────────────────────────── */

const CHAT_HISTORY_LIMIT = 20; // messages kept for context

/**
 * POST /api/client-advisor/chat
 * Send a message to the AI advisor chatbot and persist the exchange.
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'message must be a non-empty string' });
    }

    const userId = req.user.id;

    // Fetch recent history for context (exclude system messages)
    const recentHistory = await ChatMessage.find({ userId, role: { $in: ['user', 'assistant'] } })
      .sort({ createdAt: -1 })
      .limit(CHAT_HISTORY_LIMIT)
      .lean();
    recentHistory.reverse(); // chronological order

    // Optionally inject portfolio context
    const portfolio = await Portfolio.findOne({ userId }).lean();

    // Call AI
    const assistantReply = await handleClientChat(recentHistory, message.trim(), portfolio);

    // Persist both turns atomically
    await ChatMessage.insertMany([
      { userId, role: 'user',      content: message.trim() },
      { userId, role: 'assistant', content: assistantReply  },
    ]);

    return res.status(200).json({ reply: assistantReply });
  } catch (err) {
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'AI service is not configured. Contact your administrator.' });
    }
    return res.status(500).json({ error: 'Chat failed: ' + err.message });
  }
});

/**
 * GET /api/client-advisor/chat/history
 * Return the last 50 messages for the authenticated client.
 */
router.get('/chat/history', async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const messages = await ChatMessage.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    messages.reverse(); // return in chronological order
    return res.status(200).json({ messages });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch chat history: ' + err.message });
  }
});

/**
 * DELETE /api/client-advisor/chat/history
 * Clear all chat messages for the authenticated client.
 */
router.delete('/chat/history', async (req, res) => {
  try {
    const result = await ChatMessage.deleteMany({ userId: req.user.id });
    return res.status(200).json({ message: `Cleared ${result.deletedCount} message(s)` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear chat history: ' + err.message });
  }
});

export default router;
