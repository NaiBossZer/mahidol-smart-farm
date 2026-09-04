import { useState } from "react";
import { ArrowRight, CheckCircle2, Sprout, UserRound } from "lucide-react";
import { SmartFarm3DGame } from "./SmartFarm3DGame";

type Choice = { id: string; title: string; detail: string; crop: string; feedback: string };

const choices: Choice[] = [
  { id: "water", title: "ตรวจความชื้นก่อนรดน้ำ", detail: "ใช้น้ำเท่าที่พืชต้องการ ลดการสูญเสีย", crop: "ผักสลัด", feedback: "ดีมาก! คุณเริ่มต้นด้วยการใช้ข้อมูลจากเซนเซอร์อย่างรับผิดชอบ" },
  { id: "schedule", title: "รดน้ำตามเวลาเดิม", detail: "สะดวก แต่ไม่ตอบสนองต่อสภาพแปลงจริง", crop: "มะเขือเทศ", feedback: "พอใช้ได้ แต่ลองดูข้อมูลความชื้นก่อนตัดสินใจครั้งต่อไป" },
  { id: "more", title: "เปิดน้ำให้มากที่สุด", detail: "เสี่ยงใช้น้ำเกินความจำเป็นและทำให้รากเสียหาย", crop: "แตงกวา", feedback: "ควรระวัง! ฟาร์มอัจฉริยะเน้นการตัดสินใจจากข้อมูล ไม่ใช่ปริมาณน้ำที่มากที่สุด" },
];

export function LearningGameOnboarding() {
  const [step, setStep] = useState<"intro" | "choice" | "feedback" | "game">("intro");
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Choice | null>(null);

  if (step === "game") {
    return <div className="space-y-3"><div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><span>ผู้เล่น: {name || "นักสำรวจ"} · พืชเริ่มต้น: {selected?.crop}</span><button type="button" onClick={() => setStep("intro")} className="underline">เริ่มใหม่</button></div><SmartFarm3DGame /></div>;
  }

  return <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="onboarding-title">
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><Sprout /></div><div><p className="text-xs font-semibold tracking-widest text-emerald-700">SMART FARM LEARNING MISSION</p><h2 id="onboarding-title" className="text-2xl font-bold text-slate-900">เตรียมตัวก่อนเข้าสำรวจแปลง</h2></div></div>
      {step === "intro" && <div className="space-y-4"><p className="text-slate-600">สวัสดีครับนักสำรวจ เลือกแนวทางจัดการแปลง แล้วนำผลลัพธ์ไปเริ่มเกม 3D ได้ทันที</p><label className="block text-sm font-medium text-slate-700">ชื่อผู้เล่น<input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น น้องฟ้า" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200" /></label><button type="button" onClick={() => setStep("choice")} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">เริ่มภารกิจ <ArrowRight size={18} /></button></div>}
      {step === "choice" && <div className="space-y-4"><p className="font-medium text-slate-800">วันนี้คุณจะจัดการน้ำในแปลงอย่างไร?</p><div className="grid gap-3">{choices.map((choice) => <button type="button" key={choice.id} onClick={() => { setSelected(choice); setStep("feedback"); }} className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"><span className="font-semibold text-slate-900">{choice.title}</span><span className="mt-1 block text-sm text-slate-600">{choice.detail}</span></button>)}</div></div>}
      {step === "feedback" && selected && <div className="space-y-5"><div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900"><CheckCircle2 className="shrink-0" /><p>{selected.feedback}</p></div><div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><UserRound className="mb-2 text-emerald-700" size={20} />คุณเลือกเริ่มต้นด้วย <strong>{selected.crop}</strong> พร้อมเรียนรู้จากข้อมูลจริงในแปลง</div><button type="button" onClick={() => setStep("game")} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">เข้าสู่เกม 3D <ArrowRight size={18} /></button></div>}
    </div>
  </section>;
}
