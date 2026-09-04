import { GameScript } from "../../types/onboarding";

export const buildingSecurityScript: GameScript = {
  gameId: "building-safety",
  gameTitle: "เกมจัดการความปลอดภัยอาคาร",
  characterId: "officer-guard",
  intro: [
    { speakerId: "officer-guard", emotion: "happy", text: "ยินดีต้อนรับครับ วันนี้คุณจะรับบทเป็นผู้จัดการความปลอดภัยอาคาร" },
    { speakerId: "officer-guard", emotion: "thinking", text: "ก่อนเริ่มภารกิจ เลือกแนวทางตรวจสอบและตอบสนองเหตุฉุกเฉินให้เหมาะสมครับ" },
  ],
  choices: [
    { id: "c1", label: "ตรวจระบบแจ้งเหตุ + แผนอพยพครบถ้วน", iconName: "ShieldCheck", resultTag: "good", paramPatch: { inspectionMode: "comprehensive", evacuationPlan: true } },
    { id: "c2", label: "ตรวจเฉพาะระบบหลักก่อน", iconName: "ClipboardCheck", resultTag: "neutral", paramPatch: { inspectionMode: "priority", evacuationPlan: true } },
    { id: "c3", label: "ข้ามการตรวจแล้วเปิดอาคารทันที", iconName: "AlertTriangle", resultTag: "risky", paramPatch: { inspectionMode: "skip", evacuationPlan: false } },
  ],
  feedback: [
    { resultTag: "good", emotion: "excited", text: "ดีมากครับ การตรวจครบทั้งระบบช่วยลดความเสี่ยงและทำให้พร้อมรับเหตุฉุกเฉิน", scoreModifier: 10 },
    { resultTag: "neutral", emotion: "idle", text: "ใช้ได้ครับ แต่ควรกลับมาตรวจรายการที่เหลือก่อนเปิดใช้งานเต็มรูปแบบ", scoreModifier: 0 },
    { resultTag: "risky", emotion: "concerned", text: "ควรหลีกเลี่ยงครับ การข้ามการตรวจอาจทำให้ความเสี่ยงด้านความปลอดภัยเพิ่มขึ้น", scoreModifier: -5 },
  ],
};
