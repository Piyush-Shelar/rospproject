import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, AlertTriangle, Lock, FileText,
  Download, ZoomIn, ZoomOut, Loader, Hash,
  Sparkles, Bot, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from './MarkdownRenderer';

function MarkdownText({ text }) {
  return <MarkdownRenderer content={text} />;
}

function StepRow({ label, done, active }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
        done
          ? 'bg-teal-500'
          : active
          ? 'border-2 border-teal-400 border-t-transparent animate-spin'
          : 'border-2 border-gray-200'
      }`}>
        {done && (
          <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors ${done ? 'text-teal-700 font-medium' : active ? 'text-navy-900 font-medium' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

export default function VerifyAndViewModal({ doc, onClose }) {
  const { accessToken } = useAuth();
  const [phase, setPhase] = useState('loading');
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pdfScale, setPdfScale] = useState(1);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);

  const handleAnalyzePdf = async () => {
    if (!doc || !accessToken || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const res = await fetch(`/api/documents/${doc._id}/analyze-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalysisError(data.error || 'Failed to analyze portfolio statement.');
      } else {
        setAiAnalysis(data.analysis);
        setIsAnalysisExpanded(true);
      }
    } catch {
      setAnalysisError('Unable to reach server. Please check your connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const steps = [
    'Decapsulating RSA-wrapped AES session key...',
    'Decrypting AES-256-GCM ciphertext...',
    'Recomputing SHA-256 digest on plaintext...',
    'Comparing against baseline hash...',
  ];

  useEffect(() => {
    if (!doc || !accessToken) return;

    let stepTimer;
    let stepIndex = 0;

    const advance = () => {
      stepIndex += 1;
      setStep(stepIndex);
      if (stepIndex < steps.length) {
        stepTimer = setTimeout(advance, 550);
      }
    };

    stepTimer = setTimeout(advance, 550);

    fetch(`/api/documents/${doc._id}/verify-and-view`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async res => {
        clearTimeout(stepTimer);
        setStep(steps.length);
        const data = await res.json();
        if (!res.ok || data.tamperDetected) {
          setError(data.error || 'Integrity check failed.');
          setPhase('tampered');
        } else {
          setResult(data);
          setPhase('verified');
        }
      })
      .catch(() => {
        clearTimeout(stepTimer);
        setError('Unable to reach server. Check your connection.');
        setPhase('tampered');
      });

    return () => clearTimeout(stepTimer);
  }, [doc, accessToken]);

  const handleDownload = () => {
    if (!result) return;
    const byteStr = atob(result.fileBase64);
    const bytes = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
    const blob = new Blob([bytes], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.originalFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dataUri = result ? `data:${result.mimeType};base64,${result.fileBase64}` : null;
  const isPdf = result?.mimeType === 'application/pdf';
  const isImage = result?.mimeType?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={phase !== 'loading' ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-4xl animate-scale-in mb-8">

        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              phase === 'loading' ? 'bg-navy-50' :
              phase === 'verified' ? 'bg-teal-50' : 'bg-amber-50'
            }`}>
              {phase === 'loading' && <Lock size={18} className="text-navy-700" />}
              {phase === 'verified' && <ShieldCheck size={18} className="text-teal-600" />}
              {phase === 'tampered' && <AlertTriangle size={18} className="text-amber-600" />}
            </div>
            <div>
              <h2 className="font-bold text-navy-900 text-sm">{doc?.originalFilename}</h2>
              <p className="text-xs text-gray-500">{doc?.documentType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={phase === 'loading'}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {phase === 'loading' && (
            <div className="animate-fade-in">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-navy-100 border-t-navy-700 animate-spin-slow" />
                  <div className="absolute inset-2 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '0.9s' }} />
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">Cryptographic Verification</h3>
                <p className="text-xs text-gray-500">Decrypting session key and recalculating SHA-256...</p>
              </div>

              <div className="max-w-sm mx-auto space-y-3">
                {steps.map((label, i) => (
                  <StepRow key={label} label={label} done={i < step} active={i === step} />
                ))}
              </div>

              <div className="mt-6 p-3 bg-navy-50 border border-navy-100 rounded-xl text-xs text-navy-600 text-center">
                RSA-2048 OAEP · AES-256-GCM · SHA-256 Baseline Comparison
              </div>
            </div>
          )}

          {phase === 'tampered' && (
            <div className="animate-fade-in flex flex-col items-center py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center mb-5">
                <AlertTriangle size={36} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Tamper Detected!</h3>
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 max-w-md leading-relaxed font-medium mb-4">
                {error || 'SHA-256 integrity check failed. Document access aborted.'}
              </p>
              <p className="text-xs text-gray-500 max-w-xs">
                The document's stored hash does not match the recomputed hash of the decrypted ciphertext.
                This document may have been altered in storage.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm transition-all"
              >
                Close
              </button>
            </div>
          )}

          {phase === 'verified' && result && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-xl mb-5">
                <ShieldCheck size={22} className="text-teal-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-teal-700">Integrity Verified: SHA-256 Valid ✓</p>
                  <p className="text-[11px] font-mono text-teal-600/70 mt-0.5 break-all">{result.sha256}</p>
                </div>
                {result.documentType === 'PORTFOLIO' && (
                  <button
                    onClick={handleAnalyzePdf}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-navy-800 to-teal-700 hover:from-navy-900 hover:to-teal-800 px-3 py-1.5 rounded-lg shadow-sm transition-all flex-shrink-0 disabled:opacity-60"
                    title="Extract and analyze portfolio holdings with AI"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} className="text-teal-300" />
                        <span>Analyze with AI</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-white border border-teal-300 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                >
                  <Download size={13} /> Download
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Encryption', value: 'AES-256-GCM' },
                  { label: 'Key Wrap', value: 'RSA-2048 OAEP' },
                  { label: 'Type', value: result.documentType },
                  { label: 'Size', value: result.fileSize ? `${(result.fileSize / 1024).toFixed(1)} KB` : '—' },
                ].map(m => (
                  <div key={m.label} className="bg-surface rounded-xl p-3 border border-border text-center">
                    <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">{m.label}</p>
                    <p className="text-xs font-bold text-navy-900">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border overflow-hidden bg-gray-50">
                {isPdf && (
                  <div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-border">
                      <span className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                        <FileText size={13} /> {result.originalFilename}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPdfScale(s => Math.max(0.5, s - 0.25))}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ZoomOut size={14} className="text-gray-500" />
                        </button>
                        <span className="text-xs text-gray-500 w-10 text-center">{Math.round(pdfScale * 100)}%</span>
                        <button
                          onClick={() => setPdfScale(s => Math.min(2, s + 0.25))}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ZoomIn size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-auto" style={{ maxHeight: '480px' }}>
                      <div style={{ transform: `scale(${pdfScale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                        <iframe
                          src={dataUri}
                          className="w-full"
                          style={{ height: '480px', border: 'none' }}
                          title={result.originalFilename}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isImage && (
                  <div className="flex flex-col items-center p-4">
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                        <FileText size={13} /> {result.originalFilename}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setPdfScale(s => Math.max(0.3, s - 0.25))} className="p-1.5 rounded-lg hover:bg-gray-100">
                          <ZoomOut size={14} className="text-gray-500" />
                        </button>
                        <span className="text-xs text-gray-500 w-10 text-center">{Math.round(pdfScale * 100)}%</span>
                        <button onClick={() => setPdfScale(s => Math.min(3, s + 0.25))} className="p-1.5 rounded-lg hover:bg-gray-100">
                          <ZoomIn size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-auto w-full" style={{ maxHeight: '480px' }}>
                      <img
                        src={dataUri}
                        alt={result.originalFilename}
                        style={{ transform: `scale(${pdfScale})`, transformOrigin: 'top center', transition: 'transform 0.2s', maxWidth: '100%' }}
                        className="rounded-lg block mx-auto"
                      />
                    </div>
                  </div>
                )}

                {!isPdf && !isImage && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                    <FileText size={32} className="mb-3 opacity-30" />
                    <p className="text-sm font-medium text-gray-500">{result.originalFilename}</p>
                    <p className="text-xs mt-1 mb-4">Preview not available for this file type</p>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm rounded-xl transition-all"
                    >
                      <Download size={14} /> Download File
                    </button>
                  </div>
                )}
              </div>

              {/* AI Portfolio Statement Analysis Section */}
              {(isAnalyzing || aiAnalysis || analysisError) && (
                <div className="mt-5 rounded-xl border border-teal-200/80 bg-gradient-to-b from-teal-50/40 via-white to-white overflow-hidden shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between px-4 py-3 bg-teal-50/80 border-b border-teal-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                        <Bot size={14} />
                      </div>
                      <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                        AI Portfolio Statement Analysis
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-teal-100 text-teal-800 rounded-md">
                          Gemini 3.8 Flash
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {aiAnalysis && !isAnalyzing && (
                        <button
                          onClick={handleAnalyzePdf}
                          className="px-2 py-1 rounded hover:bg-teal-100 text-teal-700 text-xs flex items-center gap-1 font-medium transition-colors"
                          title="Re-run Analysis"
                        >
                          <RefreshCw size={12} />
                          <span className="hidden sm:inline">Refresh</span>
                        </button>
                      )}
                      {aiAnalysis && (
                        <button
                          onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                          className="p-1 rounded hover:bg-teal-100 text-teal-700 transition-colors"
                          title={isAnalysisExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isAnalysisExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {isAnalyzing && (
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-3" />
                      <p className="text-xs font-semibold text-navy-900">Extracting PDF text and generating portfolio advisory...</p>
                      <p className="text-[11px] text-gray-500 mt-1">Evaluating asset allocation, top positions, risk balance & rebalancing</p>
                    </div>
                  )}

                  {analysisError && !isAnalyzing && (
                    <div className="p-4 bg-amber-50 border-t border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold mb-0.5">Statement Analysis Error</p>
                        <p>{analysisError}</p>
                      </div>
                      <button
                        onClick={handleAnalyzePdf}
                        className="px-2.5 py-1 bg-white border border-amber-300 rounded text-amber-900 font-semibold hover:bg-amber-100 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {aiAnalysis && !isAnalyzing && isAnalysisExpanded && (
                    <div className="p-5 max-h-[500px] overflow-y-auto">
                      <MarkdownText text={aiAnalysis} />
                      <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 italic">
                        Analysis generated via Google Gemini 3.8 Flash based on in-memory decrypted statement text.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 p-3 bg-surface border border-border rounded-xl flex items-start gap-2">
                <Hash size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">SHA-256 Digest (verified)</p>
                  <p className="text-xs font-mono text-navy-700 break-all">{result.sha256}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
