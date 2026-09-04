import { Character } from "../types/onboarding";

const emotions = ["idle", "happy", "thinking", "concerned", "surprised", "excited"] as const;

const spriteSet = (id: string) => Object.fromEntries(
  emotions.map((emotion) => [emotion, `/assets/characters/${id}/${emotion}.svg`])
) as Character["spriteByEmotion"];

export const CHARACTERS: Record<string, Character> = {
  "prof-mahidol": {
    id: "prof-mahidol",
    name: "อาจารย์มหิดล",
    role: "ผู้เชี่ยวชาญศูนย์เกษตรอัจฉริยะ",
    spriteByEmotion: spriteSet("prof-mahidol"),
    themeColor: "#166534",
  },
  "krupa-lac": {
    id: "krupa-lac",
    name: "ครูปาครั่ง",
    role: "ผู้เชี่ยวชาญครั่งสบปราบ",
    spriteByEmotion: spriteSet("krupa-lac"),
    themeColor: "#9E2A2B",
  },
  "officer-guard": {
    id: "officer-guard",
    name: "เจ้าหน้าที่ความปลอดภัย",
    role: "ผู้ดูแลความปลอดภัยอาคาร",
    spriteByEmotion: spriteSet("officer-guard"),
    themeColor: "#1D4ED8",
  },
};
