import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowDownRight, ArrowUpRight, Camera, CheckCircle2, CircleAlert,
  CloudRain, Droplets, ExternalLink, Leaf, RefreshCw, ShieldAlert, Sprout,
  Thermometer, WifiOff, Wind,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxIXYFkonDlYf8sb1VqTDoJXlsZ58Pd53qYSP-rxeLc-9_hiHA4kKIUVAUEM-IdcrLIkQ/exec";

type SurveyRow = {
  timestamp?: string;
  p2_location?: number | string;
  p2_schedule?: number | string;
  p2_readiness?: number | string;
  p2_reception?: number | string;
  p2_overall?: number | string;
  p3_interest?: number | string;
  p3_content?: number | string;
  p3_clarity?: number | string;
  p3_benefit?: number | string;
  p3_application?: number | string;
  p4_knowledge?: number | string;
  p4_inspiration?: number | string;
  p4_communityResource?: number | string;
  p4_futureReturn?: number | string;
  feedback?: string;
  [key: string]: unknown;
};

const RATING_KEYS: (keyof SurveyRow)[] = [
  "p2_location", "p2_schedule", "p2_readiness", "p2_reception", "p2_overall",
  "p3_interest", "p3_content", "p3_clarity", "p3_benefit", "p3_application",
  "p4_knowledge", "p4_inspiration", "p4_communityResource", "p4_futureReturn",
];

// These values already exist in the original homepage UI. They are intentionally
// labelled as demo data until a real sensor/API feed is connected.
const soilMoistureDemo = [
  { time: "06:00", moisture: 68 }, { time: "09:00", moisture: 61 },
  { time: "12:00", moisture: 52 }, { time: "15:00", moisture: 47 },
  { time: "18:00", moisture: 58 }, { time: "21:00", moisture: 65 },
];
const weatherDemo = [
  { time: "06:00", temp: 24, humidity: 82 }, { time: "09:00", temp: 28, humidity: 70 },
  { time: "12:00", temp: 33, humidity: 55 }, { time: "15:00", temp: 34, humidity: 51 },
  { time: "18:00", temp: 29, humidity: 66 }, { time: "21:00", temp: 25, humidity: 78 },
];

function Metric({
  label, value, detail, icon: Icon, accent = "text-[#F5B800]",
}: {
  label: string; value: string; detail: string; icon: typeof Activity; accent?: string;
}) {
  return (
    <article className="panel min-h-36">
      <div className="flex items-start justify-between gap-3">
        <p className="panel-title">{label}</p>
        <Icon className={`size-5 ${accent}`} aria-hidden="true" />
      </div>
      <p className="num-xl mt-4 text-3xl sm:text-4xl">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </article>
  );
}

function SourceStatus({ connected, label, detail }: {
  connected: boolean | null; label: string; detail: string;
}) {
  const tone = connected === true
    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
    : connected === false
      ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
      : "border-amber-300/30 bg-amber-300/10 text-amber-200";
  const status = connected === true ? "CONNECTED" : connected === false ? "ERROR" : "PENDING";
  return (
    <div className="flex items-start gap-3 rounded-lg border border-panel-line bg-black/10 p-3">
      <span className={`mt-0.5 rounded-md border p-2 ${tone}`}>
        {connected === true ? <CheckCircle2 className="size-4" /> : connected === false ? <WifiOff className="size-4" /> : <CircleAlert className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{label}</p>
          <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wider ${tone}`}>{status}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export function SmartDashboardPage() {
  const [surveyRows, setSurveyRows] = useState<SurveyRow[]>([]);
  const [surveyState, setSurveyState] = useState<"loading" | "connected" | "error">("loading");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadSurveyData = useCallback(async () => {
    setSurveyState("loading");
    setErrorMessage("");
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, { method: "GET", redirect: "follow" });
      if (!response.ok) throw new Error("Google Apps Script ตอบกลับไม่สำเร็จ");
      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) throw new Error("รูปแบบข้อมูลแบบสอบถามไม่ใช่รายการข้อมูล");
      const rows = payload.filter((item): item is SurveyRow =>
        Boolean(item && typeof item === "object" &&
          Object.values(item as Record<string, unknown>).some((v) => v !== null && v !== undefined && String(v).trim() !== "")),
      );
      setSurveyRows(rows);
      setSurveyState("connected");
      setLastUpdated(new Date().toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }));
    } catch (error) {
      setSurveyRows([]);
      setSurveyState("error");
      setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูลแบบสอบถามได้");
    }
  }, []);

  useEffect(() => { void loadSurveyData(); }, [loadSurveyData]);

  const surveyMetrics = useMemo(() => {
    const scores = surveyRows.flatMap((row) => RATING_KEYS
      .map((key) => Number(row[key]))
      .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5));
    const average = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;
    const feedbackCount = surveyRows.filter((row) => typeof row.feedback === "string" && row.feedback.trim()).length;
    return { average, feedbackCount, scoreCount: scores.length };
  }, [surveyRows]);

  const responseTimeline = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of surveyRows) {
      if (!row.timestamp) continue;
      const date = new Date(row.timestamp);
      if (Number.isNaN(date.getTime())) continue;
      const label = date.toLocaleDateString("th-TH", { day: "2-digit", month: "short" });
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return Array.from(counts, ([date, responses]) => ({ date, responses })).slice(-8);
  }, [surveyRows]);

  const overallLabel = surveyMetrics.average === null
    ? "ยังไม่มีคะแนน"
    : surveyMetrics.average >= 4.5 ? "ดีมากที่สุด"
      : surveyMetrics.average >= 4 ? "ดีมาก" : "ควรติดตาม";

  return (
    <main className="min-h-screen px-3 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col justify-between gap-4 border-b border-panel-line pb-5 lg:flex-row lg:items-end">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-gold">
              <Leaf className="size-4" /> MAHIDOL SMART FARM HUB
            </Link>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Smart Farm Executive Dashboard</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              ภาพรวมข้อมูลที่มีอยู่เดิม: แบบสอบถามผู้เข้าร่วม, สถานะเซนเซอร์, เหตุการณ์ CCTV และความพร้อมของข้อมูลโดรน
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-panel-line px-3 py-2 text-xs hover:border-gold/60">
              ดู Dashboard แบบสอบถาม <ExternalLink className="size-3.5" />
            </Link>
            <button onClick={() => void loadSurveyData()} disabled={surveyState === "loading"} className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60">
              <RefreshCw className={`size-3.5 ${surveyState === "loading" ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="SURVEY RESPONSES" value={surveyState === "loading" ? "…" : surveyState === "error" ? "—" : surveyRows.length.toLocaleString("th-TH")} detail={surveyState === "connected" ? "ข้อมูลจาก Google Apps Script" : surveyState === "error" ? "ดึงข้อมูลไม่สำเร็จ" : "กำลังโหลดข้อมูล"} icon={Activity} accent="text-sky-300" />
          <Metric label="AVERAGE SATISFACTION" value={surveyMetrics.average === null ? "—" : surveyMetrics.average.toFixed(2)} detail={surveyMetrics.average === null ? "ไม่มีคะแนนที่ใช้คำนวณได้" : `จากคะแนนที่มีจริง · ${overallLabel}`} icon={Sprout} accent="text-emerald-300" />
          <Metric label="OPEN FEEDBACK" value={surveyMetrics.feedbackCount.toLocaleString("th-TH")} detail="จำนวนคำตอบปลายเปิดที่มีข้อความ" icon={ArrowUpRight} accent="text-[#F5B800]" />
          <Metric label="CCTV / DRONE" value="รอเชื่อมต่อ" detail="มี schema CCTV; ยังไม่มี endpoint อ่านข้อมูลในหน้าเว็บ" icon={Camera} accent="text-amber-200" />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="panel">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="panel-title">RESPONSE TIMELINE</p>
                <h2 className="mt-1 text-base font-semibold">แนวโน้มผู้ตอบแบบสอบถาม</h2>
              </div>
              <span className={`rounded border px-2 py-1 text-[10px] ${surveyState === "connected" ? "border-emerald-400/30 text-emerald-300" : "border-amber-300/30 text-amber-200"}`}>
                {surveyState === "connected" ? "ข้อมูลที่ดึงได้" : surveyState === "error" ? "แหล่งข้อมูลขัดข้อง" : "กำลังโหลด"}
              </span>
            </div>
            {surveyState === "error" ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
                <CircleAlert className="size-7 text-rose-300" />
                <p className="text-sm">ไม่สามารถโหลดข้อมูลแบบสอบถามได้</p>
                <p className="max-w-lg text-xs text-muted-foreground">{errorMessage}</p>
              </div>
            ) : responseTimeline.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={responseTimeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="responseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} /><stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#10233d", border: "1px solid #344b6b", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="responses" name="จำนวนผู้ตอบ" stroke="#60a5fa" strokeWidth={2} fill="url(#responseFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex min-h-48 items-center justify-center rounded border border-dashed border-panel-line p-5 text-center text-xs text-muted-foreground">
                {surveyState === "loading" ? "กำลังอ่านข้อมูลจาก Google Sheets…" : "ยังไม่มีข้อมูลวันที่ที่ใช้สร้างแนวโน้มได้"}
              </div>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground">อัปเดตล่าสุด: {lastUpdated || "—"} · กราฟนี้คำนวณจาก timestamp ที่พบในข้อมูลจริง</p>
          </article>

          <article className="panel">
            <p className="panel-title">DATA SOURCE HEALTH</p>
            <h2 className="mt-1 text-base font-semibold">สถานะการเชื่อมต่อข้อมูล</h2>
            <div className="mt-4 space-y-3">
              <SourceStatus connected={surveyState === "connected" ? true : surveyState === "error" ? false : null} label="แบบสอบถาม / Google Apps Script" detail="ใช้ endpoint เดียวกับ Dashboard วิเคราะห์แบบสอบถามเดิม" />
              <SourceStatus connected={null} label="IoT / ความชื้นดินและสภาพอากาศ" detail="หน้าแรกมีชุดข้อมูลตัวอย่างแบบ hard-coded; ยังไม่พบ feed เซนเซอร์สดที่หน้าเว็บอ่านได้" />
              <SourceStatus connected={null} label="CCTV / Supabase" detail="มีตาราง cctv_events และ RLS สำหรับ authenticated read; ต้องเชื่อมผ่าน session/API ที่ปลอดภัยก่อนแสดงเหตุการณ์" />
              <SourceStatus connected={null} label="Drone / Phantom 4" detail="ยังไม่พบโมดูลนำเข้าภาพ สำรวจแปลง หรือประมวลผลภาพใน route ปัจจุบัน" />
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className="panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="panel-title">IOT TELEMETRY · EXISTING UI SAMPLE</p>
                <h2 className="mt-1 text-base font-semibold">แนวโน้มความชื้นดิน</h2>
              </div>
              <Droplets className="size-5 text-sky-300" />
            </div>
            <div className="mt-2 rounded border border-amber-300/25 bg-amber-300/5 px-3 py-2 text-[11px] text-amber-100">
              ข้อมูลตัวอย่างจากโค้ดหน้าแรกเดิม ไม่ใช่ข้อมูลเซนเซอร์สด
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={soilMoistureDemo} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#10233d", border: "1px solid #344b6b", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="moisture" name="ความชื้น (%)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.13} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </article>

          <article className="panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="panel-title">WEATHER · EXISTING UI SAMPLE</p>
                <h2 className="mt-1 text-base font-semibold">อุณหภูมิและความชื้นอากาศ</h2>
              </div>
              <Thermometer className="size-5 text-amber-200" />
            </div>
            <div className="mt-2 rounded border border-amber-300/25 bg-amber-300/5 px-3 py-2 text-[11px] text-amber-100">
              แสดงค่าตัวอย่างเดิมเพื่อรักษามุมมอง UI; ต้องเปลี่ยนเป็น API/IoT feed ก่อนใช้งานจริง
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={weatherDemo} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="temp" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#10233d", border: "1px solid #344b6b", borderRadius: 8, fontSize: 12 }} />
                <Area yAxisId="temp" type="monotone" dataKey="temp" name="อุณหภูมิ (°C)" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} strokeWidth={2} />
                <Area yAxisId="temp" type="monotone" dataKey="humidity" name="ความชื้นอากาศ (%)" stroke="#34d399" fill="#34d399" fillOpacity={0.06} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="panel">
            <div className="flex items-center gap-2"><ShieldAlert className="size-5 text-amber-200" /><p className="panel-title">CCTV EVENTS</p></div>
            <p className="mt-3 text-lg font-semibold">cctv_events</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">migration มี event time, camera ID, snapshot และสถานะการแจ้งเตือนแล้ว แต่หน้านี้ยังไม่ได้อ่านตารางโดยตรง</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-200"><CircleAlert className="size-4" /> ต้องเชื่อม authenticated API ก่อน</div>
          </article>
          <article className="panel">
            <div className="flex items-center gap-2"><Camera className="size-5 text-sky-300" /><p className="panel-title">DRONE SURVEY</p></div>
            <p className="mt-3 text-lg font-semibold">Phantom 4 · RGB</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">ขั้นถัดไปคืออัปโหลดภาพจาก SD card, บันทึกเที่ยวบิน/แปลง และแสดง orthomosaic เมื่อมี pipeline ประมวลผล</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Wind className="size-4" /> ยังไม่มีเที่ยวบินที่เชื่อมกับ Dashboard</div>
          </article>
          <article className="panel">
            <div className="flex items-center gap-2"><CloudRain className="size-5 text-emerald-300" /><p className="panel-title">NEXT INTEGRATION</p></div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex gap-2"><ArrowDownRight className="mt-0.5 size-3.5 shrink-0 text-gold" /> ทำ secure read API สำหรับ CCTV โดยไม่เปิด public write</li>
              <li className="flex gap-2"><ArrowDownRight className="mt-0.5 size-3.5 shrink-0 text-gold" /> เปลี่ยน telemetry ตัวอย่างเป็น feed เซนเซอร์จริงพร้อม timestamp</li>
              <li className="flex gap-2"><ArrowDownRight className="mt-0.5 size-3.5 shrink-0 text-gold" /> เพิ่ม survey, ภาพ RGB และประวัติการเจริญเติบโตของแปลง</li>
            </ul>
          </article>
        </section>

        <footer className="flex flex-col gap-2 border-t border-panel-line pt-4 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Mahidol Smart Farm · Integrated data view</span>
          <span>ข้อมูลที่ไม่มีแหล่งจริงจะแสดงเป็น Pending แทนการคาดเดาตัวเลข</span>
        </footer>
      </div>
    </main>
  );
}
