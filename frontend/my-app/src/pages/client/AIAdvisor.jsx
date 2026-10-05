import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, Send, Trash2, TrendingUp, PieChart, RefreshCw,
  ChevronDown, ChevronUp, Plus, X, Sparkles, AlertCircle,
  BarChart3, Target, ShieldCheck, Loader2, MessageSquare,
  Wallet, CircleDot
} from 'lucide-react';
import ClientNavbar from '../../components/ClientNavbar';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { useAuth } from '../../context/AuthContext';

/* ── helpers ─────────────────────────────────────── */
const API = (path, token, opts = {}) =>
  fetch(`/api/client-advisor${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  }).then(r => r.json());

const ASSET_TYPES = ['stock', 'bond', 'crypto', 'cash', 'mutual_fund', 'etf'];
const TYPE_COLORS = {
  stock:       'bg-blue-100 text-blue-700',
  bond:        'bg-green-100 text-green-700',
  crypto:      'bg-purple-100 text-purple-700',
  cash:        'bg-yellow-100 text-yellow-700',
  mutual_fund: 'bg-orange-100 text-orange-700',
  etf:         'bg-teal-100 text-teal-700',
};

function Badge({ type }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}>
      {type.replace('_', ' ')}
    </span>
  );
}

function Spinner() {
  return <Loader2 size={16} className="animate-spin inline-block" />;
}

function MarkdownText({ text }) {
  return <MarkdownRenderer content={text} />;
}

/* ─────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────── */
export default function AIAdvisor() {
  const { accessToken } = useAuth();

  // Portfolio state
  const [portfolio, setPortfolio]       = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [analysis, setAnalysis]         = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');

  // Chat state
  const [messages, setMessages]         = useState([]);
  const [chatInput, setChatInput]       = useState('');
  const [chatLoading, setChatLoading]   = useState(false);
  const [chatError, setChatError]       = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);
  const [clearingChat, setClearingChat] = useState(false);

  // Portfolio form state
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [goals, setGoals]               = useState(['']);
  const [assets, setAssets]             = useState([{ symbol: '', type: 'stock', quantity: '', purchasePrice: '', currentPrice: '' }]);
  const [saveLoading, setSaveLoading]   = useState(false);
  const [saveError, setSaveError]       = useState('');

  const chatEndRef = useRef(null);

  // Scroll chat to bottom
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatLoading]);

  // Load portfolio + chat history on mount
  useEffect(() => {
    loadPortfolio();
    loadHistory();
  }, []);

  const loadPortfolio = useCallback(async () => {
    setPortfolioLoading(true);
    const data = await API('/portfolio', accessToken);
    setPortfolioLoading(false);
    if (!data.error) setPortfolio(data);
    else setPortfolio(null);
  }, [accessToken]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const data = await API('/chat/history', accessToken);
    setHistoryLoading(false);
    if (data.messages) setMessages(data.messages);
  }, [accessToken]);

  /* ── Portfolio Form handlers ── */
  function openForm() {
    if (portfolio) {
      setRiskTolerance(portfolio.riskTolerance || 'moderate');
      setGoals(portfolio.financialGoals?.length ? portfolio.financialGoals : ['']);
      setAssets(portfolio.assets?.length ? portfolio.assets.map(a => ({ ...a, quantity: String(a.quantity), purchasePrice: String(a.purchasePrice), currentPrice: String(a.currentPrice) })) : [{ symbol: '', type: 'stock', quantity: '', purchasePrice: '', currentPrice: '' }]);
    } else {
      setRiskTolerance('moderate');
      setGoals(['']);
      setAssets([{ symbol: '', type: 'stock', quantity: '', purchasePrice: '', currentPrice: '' }]);
    }
    setSaveError('');
    setShowPortfolioForm(true);
  }

  function addAsset()   { setAssets(a => [...a, { symbol: '', type: 'stock', quantity: '', purchasePrice: '', currentPrice: '' }]); }
  function removeAsset(i) { setAssets(a => a.filter((_, idx) => idx !== i)); }
  function updateAsset(i, field, val) { setAssets(a => a.map((asset, idx) => idx === i ? { ...asset, [field]: val } : asset)); }

  async function savePortfolio() {
    setSaveError(''); setSaveLoading(true);
    const payload = {
      riskTolerance,
      financialGoals: goals.filter(g => g.trim()),
      assets: assets.map(a => ({
        symbol: a.symbol.trim().toUpperCase(),
        type: a.type,
        quantity: parseFloat(a.quantity),
        purchasePrice: parseFloat(a.purchasePrice),
        currentPrice: parseFloat(a.currentPrice),
      })),
    };
    const data = await API('/portfolio', accessToken, { method: 'POST', body: JSON.stringify(payload) });
    setSaveLoading(false);
    if (data.error) { setSaveError(data.error); return; }
    setPortfolio(data.portfolio);
    setShowPortfolioForm(false);
    setAnalysis('');
  }

  async function runAnalysis() {
    setAnalysis(''); setAnalysisLoading(true); setPortfolioError('');
    const data = await API('/portfolio/analyze', accessToken, { method: 'POST' });
    setAnalysisLoading(false);
    if (data.error) setPortfolioError(data.error);
    else setAnalysis(data.analysis);
  }

  /* ── Chat handlers ── */
  async function sendMessage(e) {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    setMessages(m => [...m, { role: 'user', content: text, createdAt: new Date().toISOString() }]);
    setChatLoading(true);
    const data = await API('/chat', accessToken, { method: 'POST', body: JSON.stringify({ message: text }) });
    setChatLoading(false);
    if (data.error) { setChatError(data.error); return; }
    setMessages(m => [...m, { role: 'assistant', content: data.reply, createdAt: new Date().toISOString() }]);
  }

  async function clearHistory() {
    setClearingChat(true);
    await API('/chat/history', accessToken, { method: 'DELETE' });
    setMessages([]);
    setClearingChat(false);
  }

  /* ── Derived values ── */
  const totalValue   = portfolio?.assets?.reduce((s, a) => s + a.quantity * a.currentPrice, 0) || 0;
  const totalCost    = portfolio?.assets?.reduce((s, a) => s + a.quantity * a.purchasePrice, 0) || 0;
  const pnl          = totalValue - totalCost;
  const pnlPct       = totalCost > 0 ? ((pnl / totalCost) * 100).toFixed(2) : '0.00';
  const isPositive   = pnl >= 0;

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-navy-700 flex items-center justify-center shadow">
                <Sparkles size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-navy-900">AI Financial Advisor</h1>
            </div>
            <p className="text-gray-500 text-sm ml-13">Portfolio analysis &amp; interactive financial guidance powered by AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* ── LEFT: Portfolio + Analysis (3/5) ── */}
          <div className="xl:col-span-3 space-y-6">

            {/* Portfolio Card */}
            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-navy-900">My Portfolio</h2>
                </div>
                <button
                  onClick={openForm}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors"
                >
                  <Plus size={14} />
                  {portfolio ? 'Edit' : 'Add Holdings'}
                </button>
              </div>

              {portfolioLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Spinner /> <span className="ml-2 text-sm">Loading portfolio…</span>
                </div>
              ) : !portfolio ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <PieChart size={40} className="text-gray-200 mb-3" />
                  <p className="text-gray-500 font-medium">No holdings yet</p>
                  <p className="text-gray-400 text-sm mt-1">Add your assets to unlock AI analysis and personalised advice.</p>
                  <button onClick={openForm} className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
                    Add Holdings
                  </button>
                </div>
              ) : (
                <div>
                  {/* Summary strip */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100">
                    {[
                      { label: 'Total Value',   val: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-navy-900' },
                      { label: 'Unrealised P&L', val: `${isPositive ? '+' : ''}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pnlPct}%)`, color: isPositive ? 'text-emerald-600' : 'text-red-500' },
                      { label: 'Risk Tolerance', val: portfolio.riskTolerance.charAt(0).toUpperCase() + portfolio.riskTolerance.slice(1), color: 'text-navy-700' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="px-4 py-3 text-center">
                        <div className={`text-sm font-semibold ${color}`}>{val}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Asset list */}
                  <div className="divide-y divide-gray-50">
                    {portfolio.assets.map((a, i) => {
                      const mv    = (a.quantity * a.currentPrice).toFixed(2);
                      const gain  = ((a.currentPrice - a.purchasePrice) / a.purchasePrice * 100).toFixed(1);
                      const isUp  = a.currentPrice >= a.purchasePrice;
                      return (
                        <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
                              <CircleDot size={16} className="text-navy-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-navy-900 text-sm">{a.symbol}</div>
                              <Badge type={a.type} />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-navy-900">${parseFloat(mv).toLocaleString()}</div>
                            <div className={`text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                              {isUp ? '+' : ''}{gain}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Analyse button */}
                  <div className="px-6 py-4 border-t border-gray-100">
                    <button
                      onClick={runAnalysis}
                      disabled={analysisLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-navy-700 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {analysisLoading ? <><Spinner /> Analysing…</> : <><BarChart3 size={16} /> Run AI Analysis</>}
                    </button>
                    {portfolioError && <p className="text-red-500 text-xs text-center mt-2">{portfolioError}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis result */}
            {(analysisLoading || analysis) && (
              <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                  <TrendingUp size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-navy-900">AI Portfolio Analysis</h2>
                  {analysis && (
                    <button onClick={runAnalysis} disabled={analysisLoading} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
                <div className="px-6 py-5">
                  {analysisLoading ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Spinner /> <span className="text-sm">Analysing your portfolio with AI…</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <MarkdownText text={analysis} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Chat (2/5) ── */}
          <div className="xl:col-span-2 flex flex-col">
            <div className="bg-white rounded-2xl shadow-card border border-border flex flex-col h-[680px]">

              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-navy-700 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm">Advisor Chat</div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      <span className="text-xs text-gray-400">AI-powered</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearHistory}
                  disabled={clearingChat || messages.length === 0}
                  title="Clear chat"
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 disabled:opacity-40 transition-colors"
                >
                  {clearingChat ? <Spinner /> : <Trash2 size={15} />}
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Spinner />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 px-4">
                    <MessageSquare size={32} className="mb-3 text-gray-200" />
                    <p className="text-sm font-medium">Ask your financial advisor</p>
                    <p className="text-xs mt-1 text-gray-300">Questions about your portfolio, financial terms, investment strategies…</p>
                    <div className="mt-5 space-y-2 w-full">
                      {[
                        'What is my portfolio\'s biggest risk?',
                        'Explain what an ETF is',
                        'How should I rebalance for retirement?',
                      ].map(q => (
                        <button
                          key={q}
                          onClick={() => { setChatInput(q); }}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50 text-gray-500 hover:text-teal-700 transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-navy-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                            <Bot size={12} className="text-white" />
                          </div>
                        )}
                        <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-navy-800 text-white rounded-tr-sm'
                            : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-sm'
                        }`}>
                          {m.role === 'assistant' ? <MarkdownText text={m.content} /> : m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-navy-700 flex items-center justify-center mr-2 mt-0.5">
                          <Bot size={12} className="text-white" />
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Error banner */}
              {chatError && (
                <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                  <AlertCircle size={13} /> {chatError}
                </div>
              )}

              {/* Input */}
              <form onSubmit={sendMessage} className="px-4 pb-4 pt-2 border-t border-gray-100">
                <div className="flex gap-2 items-end">
                  <textarea
                    rows={1}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Ask anything about your finances…"
                    className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent bg-gray-50 placeholder-gray-400 max-h-28"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="p-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-center text-xs text-gray-300 mt-2">Educational only • Not fiduciary advice</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Portfolio Form Modal ── */}
      {showPortfolioForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-navy-900 text-lg">{portfolio ? 'Edit Portfolio' : 'Add Holdings'}</h3>
              <button onClick={() => setShowPortfolioForm(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

              {/* Risk & Goals */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Risk Tolerance</label>
                  <select
                    value={riskTolerance}
                    onChange={e => setRiskTolerance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  >
                    {['conservative', 'moderate', 'aggressive'].map(r => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Financial Goals</label>
                  {goals.map((g, i) => (
                    <div key={i} className="flex gap-2 mb-1.5">
                      <input
                        value={g}
                        onChange={e => setGoals(gs => gs.map((gg, ii) => ii === i ? e.target.value : gg))}
                        placeholder="e.g. Retirement by 60"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                      {goals.length > 1 && (
                        <button onClick={() => setGoals(gs => gs.filter((_, ii) => ii !== i))} className="text-gray-300 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setGoals(gs => [...gs, ''])} className="text-xs text-teal-600 hover:text-teal-700 font-medium">+ Add goal</button>
                </div>
              </div>

              {/* Assets */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Assets</label>
                <div className="space-y-3">
                  {assets.map((a, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <input
                        value={a.symbol}
                        onChange={e => updateAsset(i, 'symbol', e.target.value.toUpperCase())}
                        placeholder="AAPL"
                        className="col-span-1 px-3 py-2 rounded-lg border border-gray-200 text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                      <select
                        value={a.type}
                        onChange={e => updateAsset(i, 'type', e.target.value)}
                        className="col-span-2 px-2 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      >
                        {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                      </select>
                      {['quantity', 'purchasePrice', 'currentPrice'].map(field => (
                        <input
                          key={field}
                          type="number"
                          min="0"
                          step="any"
                          value={a[field]}
                          onChange={e => updateAsset(i, field, e.target.value)}
                          placeholder={field === 'quantity' ? 'Qty' : field === 'purchasePrice' ? 'Buy $' : 'Now $'}
                          className="col-span-1 px-2 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                        />
                      ))}
                      <button onClick={() => removeAsset(i)} disabled={assets.length === 1} className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition-colors mx-auto">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="text-xs text-gray-400 grid grid-cols-6 gap-2 px-3 -mt-1">
                    <span>Symbol</span><span className="col-span-2">Type</span><span>Qty</span><span>Buy $</span><span>Now $</span>
                  </div>
                </div>
                <button onClick={addAsset} className="mt-3 flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium">
                  <Plus size={14} /> Add asset
                </button>
              </div>
            </div>

            {saveError && <p className="px-6 text-red-500 text-sm text-center">{saveError}</p>}

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowPortfolioForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={savePortfolio} disabled={saveLoading} className="px-5 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-60 transition-colors">
                {saveLoading ? <><Spinner /> Saving…</> : 'Save Portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
