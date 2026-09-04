// src/components/onboarding/OnboardingFlow.tsx
import React, { useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getScript } from "../../data/scriptRegistry";
import { CHARACTERS } from "../../data/characters";
import CharacterStage from "./CharacterStage";
import DialogueBox from "./DialogueBox";
import ChoiceButtons from "./ChoiceButtons";
import FeedbackOverlay from "./FeedbackOverlay";
import { Choice, Emotion, GameSession, OnboardingPhase, UserProfile } from "../../types/onboarding";

interface State {
  phase: OnboardingPhase;
  emotion: Emotion;
  selectedChoice: Choice | null;
}

type Action =
  | { type: "INTRO_DONE" }
  | { type: "CHOICE_MADE"; choice: Choice }
  | { type: "CONTINUE_TO_GAME" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INTRO_DONE":
      return { ...state, phase: "choice", emotion: "thinking" };
    case "CHOICE_MADE": {
      const emotionByTag: Record<Choice["resultTag"], Emotion> = {
        good: "excited",
        neutral: "idle",
        risky: "concerned",
      };
      return {
        ...state,
        phase: "feedback",
        selectedChoice: action.choice,
        emotion: emotionByTag[action.choice.resultTag],
      };
    }
    case "CONTINUE_TO_GAME":
      return { ...state, phase: "transition" };
    default:
      return state;
  }
}

interface Props {
  gameId: string;                 // "smart-farm" | "sobprab-lac" | "building-safety"
  user: UserProfile;
  onComplete: (session: GameSession) => void; // ส่งค่าไปเข้า Simulator จริง
}

const OnboardingFlow: React.FC<Props> = ({ gameId, user, onComplete }) => {
  const script = useMemo(() => getScript(gameId), [gameId]);
  const character = CHARACTERS[script.characterId];

  const [state, dispatch] = useReducer(reducer, {
    phase: "intro",
    emotion: "idle",
    selectedChoice: null,
  });

  const feedbackEntry = state.selectedChoice
    ? script.feedback.find((f) => f.resultTag === state.selectedChoice!.resultTag)
    : null;

  const handleContinueToGame = () => {
    if (!state.selectedChoice || !feedbackEntry) return;
    const session: GameSession = {
      gameId: script.gameId,
      user,
      selectedChoiceId: state.selectedChoice.id,
      scoreBonus: feedbackEntry.scoreModifier,
      initialParams: state.selectedChoice.paramPatch,
    };
    dispatch({ type: "CONTINUE_TO_GAME" });
    onComplete(session);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 p-4">
      <h1 className="text-center text-lg font-bold text-slate-800">{script.gameTitle}</h1>

      <CharacterStage character={character} emotion={state.emotion} />

      <AnimatePresence mode="wait">
        {state.phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DialogueBox lines={script.intro} onFinished={() => dispatch({ type: "INTRO_DONE" })} />
          </motion.div>
        )}

        {state.phase === "choice" && (
          <motion.div key="choice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-sm text-slate-500 text-center">เลือกแนวทางของคุณ</p>
            <ChoiceButtons choices={script.choices} onSelect={(choice) => dispatch({ type: "CHOICE_MADE", choice })} />
          </motion.div>
        )}

        {state.phase === "feedback" && feedbackEntry && (
          <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FeedbackOverlay feedback={feedbackEntry} onContinue={handleContinueToGame} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;