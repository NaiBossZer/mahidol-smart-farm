// src/components/onboarding/DialogueBox.tsx
import React, { useEffect, useState } from "react";
import { DialogueLine } from "../../types/onboarding";
import { ChevronRight } from "lucide-react";

interface Props {
  lines: DialogueLine[];
  onFinished: () => void;
}

const TYPE_SPEED_MS = 18;

const DialogueBox: React.FC<Props> = ({ lines, onFinished }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = lines[lineIndex];

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setDisplayedText(currentLine.text.slice(0, i));
      if (i >= currentLine.text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, TYPE_SPEED_MS);
    return () => clearInterval(timer);
  }, [lineIndex, currentLine]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1);
    } else {
      onFinished();
    }
  };

  return (
    <button
      onClick={handleNext}
      className="w-full text-left bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-slate-300 transition"
    >
      <p className="text-sm text-slate-700 leading-relaxed min-h-[3rem]">{displayedText}</p>
      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
    </button>
  );
};

export default DialogueBox;