import React from "react";
import { ArrowRight, CheckCircle2, AlertTriangle, MinusCircle } from "lucide-react";
import { FeedbackEntry } from "../../types/onboarding";

interface Props {
  feedback: FeedbackEntry;
  onContinue: () => void;
}

const FeedbackOverlay: React.FC<Props> = ({ feedback, onContinue }) => {
  const Icon = feedback.resultTag === "good" ? CheckCircle2 : feedback.resultTag === "risky" ? AlertTriangle : MinusCircle;
  const tone = feedback.resultTag === "good" ? "text-green-700" : feedback.resultTag === "risky" ? "text-red-700" : "text-slate-700";
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Icon className={`w-7 h-7 shrink-0 ${tone}`} />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">ผลการตัดสินใจ</p>
          <p className="text-sm leading-relaxed text-slate-700">{feedback.text}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${tone}`}>คะแนน {feedback.scoreModifier >= 0 ? "+" : ""}{feedback.scoreModifier}</span>
        <button onClick={onContinue} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
          เข้าสู่เกม <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FeedbackOverlay;
