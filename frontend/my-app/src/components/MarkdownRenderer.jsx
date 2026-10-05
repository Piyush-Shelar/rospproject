import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Professional Markdown Renderer for AI responses, chat bubbles, and reports.
 * Properly renders bold, italics, dividers (***, ---), bullet/numbered lists, tables, and blockquotes.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  return (
    <div className={`markdown-content text-sm leading-relaxed text-gray-800 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-bold text-navy-900 mt-3 mb-1.5 first:mt-0" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-bold text-navy-850 mt-2.5 mb-1 first:mt-0" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-semibold text-navy-800 uppercase tracking-wide mt-2 mb-0.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-inherit" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-2.5 space-y-1 text-inherit" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-inherit" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-navy-950" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-inherit" {...props} />
          ),
          hr: () => (
            <hr className="my-3 border-t border-gray-200/80" />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-3 border-teal-500 bg-teal-50/50 pl-3 py-1 my-2 text-xs italic text-gray-600 rounded-r" {...props} />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="px-1.5 py-0.5 rounded bg-gray-100 text-teal-800 font-mono text-xs" {...props} />
            ) : (
              <pre className="p-3 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto my-2" {...props} />
            ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border text-xs" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 text-navy-900 font-semibold" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-left font-semibold text-navy-800" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-t border-border/60 text-gray-700" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-teal-600 hover:text-teal-700 underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
