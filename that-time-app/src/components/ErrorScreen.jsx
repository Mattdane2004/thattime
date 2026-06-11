// Catch-all error screen used as React Router's `errorElement`. Reads the
// thrown error via useRouteError, renders a friendly message, and offers a
// one-tap copy of the full stack so the user can paste it back when asking
// for a fix.

import { useState } from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Copy, Check, RefreshCw } from 'lucide-react';

export default function ErrorScreen() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const errorText = formatError(error);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const ta = document.createElement('textarea');
      ta.value = errorText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        <img
          src="/error-mascot.png"
          alt=""
          className="w-32 h-32 mb-6"
          style={{ imageRendering: 'pixelated' }}
        />

        <h1 className="text-[32px] font-semibold tracking-tight text-gray-900 leading-tight mb-2">
          Something broke.
        </h1>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
          Copy the error and paste it back to Claude — it’ll know what to do.
        </p>

        {/* Error preview — first line only, full text goes to clipboard */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 mb-6 text-left">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Error
          </div>
          <div className="text-[13px] font-mono text-gray-700 break-words line-clamp-3">
            {errorPreview(error)}
          </div>
        </div>

        <button
          onClick={copy}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors flex items-center justify-center gap-2 mb-2"
        >
          {copied ? (
            <>
              <Check size={16} strokeWidth={2.5} />
              Copied
            </>
          ) : (
            <>
              <Copy size={16} strokeWidth={1.75} />
              Copy error
            </>
          )}
        </button>

        <button
          onClick={() => {
            navigate('/');
            window.location.reload();
          }}
          className="w-full h-12 rounded-full border border-gray-200 text-gray-900 text-[15px] font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={15} strokeWidth={1.75} />
          Reload app
        </button>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

function errorPreview(error) {
  if (!error) return 'Unknown error';
  if (error.message) return error.message;
  if (typeof error === 'string') return error;
  if (error.statusText) return `${error.status || ''} ${error.statusText}`.trim();
  return String(error);
}

function formatError(error) {
  // What gets copied to the clipboard. Includes message, stack, route info.
  const lines = [];
  lines.push('That Time — error report');
  lines.push(`URL: ${window.location.href}`);
  lines.push(`When: ${new Date().toISOString()}`);
  lines.push('');
  if (error?.message) lines.push(`Message: ${error.message}`);
  if (error?.status)  lines.push(`Status: ${error.status} ${error.statusText || ''}`);
  if (error?.stack) {
    lines.push('');
    lines.push('Stack:');
    lines.push(error.stack);
  } else if (typeof error === 'string') {
    lines.push(error);
  }
  return lines.join('\n');
}
