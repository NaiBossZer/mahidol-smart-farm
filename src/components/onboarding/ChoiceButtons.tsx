// src/components/onboarding/ChoiceButtons.tsx
import React from "react";
import * as Icons from "lucide-react";
import { Choice } from "../../types/onboarding";

interface Props {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
}

const ChoiceButtons: React.FC<Props> = ({ choices, onSelect }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {choices.map((choice) => {
        const IconComp = (Icons as any)[choice.iconName] ?? Icons.HelpCircle;
        return (
          <button
            key={choice.id}
            onClick={() => onSelect(choice)}
            className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-xl p-4 text-left hover:border-slate-400 transition"
          >
            <IconComp className="w-6 h-6 text-slate-600 shrink-0" />
            <span className="text-sm font-medium text-slate-700">{choice.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ChoiceButtons;