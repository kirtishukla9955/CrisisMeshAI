import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const LOADING_MESSAGES = [
  'Analyzing incident history...',
  'Mapping response patterns...',
  'Evaluating severity trends...',
  'Generating authority briefing...',
];

/**
 * Triggers Post-Disaster AI Agent generation. Shows a multi-stage loading
 * sequence rather than a bare spinner (project brief section 20).
 */
export default function ReportGenerator({ onGenerate, generating }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!generating) { setMessageIndex(0); return undefined; }
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [generating]);

  return (
    <div className="bg-[#17324A] border border-white/10 rounded-xl p-8 flex flex-col items-center text-center gap-6 shadow-lg">
      <div>
        <div className="text-xs tracking-[0.2em] text-[#9b59b6] font-bold uppercase mb-1">
          POST-DISASTER INTELLIGENCE
        </div>
        <div className="text-sm text-white/60">
          AI-generated operational review and response analysis
        </div>
      </div>

      {generating ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#9b59b6]/30 border-t-[#9b59b6] animate-spin" />
          <div className="text-sm font-medium text-[#9b59b6] animate-pulse">{LOADING_MESSAGES[messageIndex]}</div>
        </div>
      ) : (
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-[#9b59b6] hover:bg-[#8e44ad] text-white transition-all shadow-[0_0_15px_rgba(155,89,182,0.4)] hover:shadow-[0_0_25px_rgba(155,89,182,0.6)] transform hover:-translate-y-0.5"
        >
          <Sparkles className="h-4 w-4" />
          Generate AI Report
        </button>
      )}
    </div>
  );
}
