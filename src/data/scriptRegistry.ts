// src/data/scriptRegistry.ts
import { GameScript } from "../types/onboarding";
import { smartFarmScript } from "./scripts/smartFarmScript";
import { sobprabLacScript } from "./scripts/sobprabLacScript";
import { buildingSecurityScript } from "./scripts/buildingSecurityScript";

export const SCRIPT_REGISTRY: Record<string, GameScript> = {
  "smart-farm": smartFarmScript,
  "sobprab-lac": sobprabLacScript,
  "building-safety": buildingSecurityScript,
};

export function getScript(gameId: string): GameScript {
  const script = SCRIPT_REGISTRY[gameId];
  if (!script) throw new Error(`ไม่พบสคริปต์สำหรับเกม: ${gameId}`);
  return script;
}