// src/types/onboarding.ts
export type Emotion = "idle" | "happy" | "thinking" | "concerned" | "surprised" | "excited";
export type ResultTag = "good" | "neutral" | "risky";

export interface Character {
  id: string;
  name: string;
  role: string;
  spriteByEmotion: Record<Emotion, string>;
  themeColor: string;
}

export interface DialogueLine {
  speakerId: string;
  emotion: Emotion;
  text: string;
}

export interface Choice {
  id: string;
  label: string;
  iconName: string;              // ชื่อ icon จาก lucide-react เช่น "Sprout", "ShieldCheck"
  resultTag: ResultTag;
  paramPatch: Record<string, unknown>;
}

export interface FeedbackEntry {
  resultTag: ResultTag;
  emotion: Emotion;
  text: string;
  scoreModifier: number;
}

export interface GameScript {
  gameId: string;                // "smart-farm" | "sobprab-lac" | "building-safety" | ...
  gameTitle: string;
  characterId: string;
  intro: DialogueLine[];
  choices: Choice[];
  feedback: FeedbackEntry[];
}

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export interface GameSession {
  gameId: string;
  user: UserProfile;
  selectedChoiceId?: string;
  scoreBonus: number;
  initialParams: Record<string, unknown>;
}

export type OnboardingPhase = "intro" | "choice" | "feedback" | "transition" | "done";