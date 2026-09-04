// src/components/onboarding/CharacterStage.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Character, Emotion } from "../../types/onboarding";

interface Props {
  character: Character;
  emotion: Emotion;
}

const CharacterStage: React.FC<Props> = ({ character, emotion }) => {
  return (
    <div
      className="relative w-full flex flex-col items-center justify-end rounded-2xl overflow-hidden border-2"
      style={{ borderColor: character.themeColor, backgroundColor: `${character.themeColor}0D`, minHeight: 260 }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={emotion}
          src={character.spriteByEmotion[emotion]}
          alt={`${character.name} - ${emotion}`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.35 }}
          className="h-56 object-contain"
        />
      </AnimatePresence>
      <div
        className="w-full py-2 text-center text-xs font-semibold text-white"
        style={{ backgroundColor: character.themeColor }}
      >
        {character.name} · {character.role}
      </div>
    </div>
  );
};

export default CharacterStage;