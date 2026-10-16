import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Camera,
  CircleAlert,
  Database,
  Droplets,
  Leaf,
  MapPin,
  Menu,
  ShieldCheck,
  Sprout,
  Thermometer,
  WifiOff,
  X,
} from "lucide-react";

type SourceState = "ready" | "pending" | "not-connected";

function SourceBadge({ state }: { state: SourceState }) {
  const config = {
    ready: { label: "READY", className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
    pending: { label: "PENDING", className: "border-amber-300/30 bg-amber-300/10 text-amber-200" },
    "not-connected": { label: "NOT CONNECTED", className: "border-rose-400/30 bg-rose-400/10 text-rose-300" },
  }[state];

  return <span className={`inline-flex rounded border px-2 py-1 font-mono text-[9px] tracking-wider ${config.className}`}>{config.label}</span>;
}

function StatusRow({
  title,
  detail,
  state = "pending",
}: {
  title: string;
  detail: string;
  state?: SourceState;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-panel-line bg-black/10 p-3">
      <span className="mt-0.5 rounded-md border border-amber-300/30 bg-amber-300/10 p-2 text-amber-200">
        {state === "ready" ? <ShieldCheck className="size-4" /> : <CircleAlert className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{title}</p>
          <SourceBadge state={state} />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <div className="mb-4">
      <p className="panel-title">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

export function SmartDashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { href: "#overview", label: "ภาพรวม" },
    { href: "#sources", label: "แหล่งข้อมูล" },
    { href: "#iot", label: "IoT" },
    { href: "#drone", label: "โดรนสำรวจ" },
    { href: "#cctv", label: "CCTV" },
  ];

  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-50 border-b border-panel-line bg-[#0a1730]/95 text-white shadow-lg backdrop-blur">
        <nav className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8" aria-label="เมนูหลัก">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={closeMenu}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-300/10 text-emerald-300">
              <Leaf className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-wide">MAHIDOL SMART FARM</span>
              <span className="block truncate text-[10px] text-slate-400">Farm monitoring workspace</span>
            </span>
          </Link>

          <div className="hidden items-center gap-5 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-xs text-slate-300 transition hover:text-[#F5B800]">
                {item.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
            aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 px-4 pb-3 pt-2 md:hidden">
            <div className="mx-auto grid max-w-[1500px] gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/5 hover:text-[#F5B800]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1500px] space-y-7 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section id="overview" className="scroll-mt-24">
          <div className="relative overflow-hidden rounded-2xl border border-panel-line bg-gradient-to-br from-[#102b50] via-[#10213d] to-[#18263b] p-5 sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full border border-[#F5B800]/10" />
            <div className="pointer-events-none absolute -right-3 -top-7 size-44 rounded-full border border-emerald-300/10" />
            <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-semibold tracking-widest text-amber-200">
                  <span className="size-1.5 rounded-full bg-amber-300" />
                  PREVIEW · DATA CONNECTION IN PROGRESS
                </div>
                <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300">AGRICULTURE · IOT · DRONE</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Smart Farm Dashboard</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  ศูนย์กลางติดตามแปลงเกษตร ข้อมูลเซนเซอร์ ภาพสำรวจจากโดรน และเหตุการณ์ CCTV สำหรับผู้ดูแลและผู้บริหาร
                </p>
              </div>
              <a href="#sources" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#F5B800] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                ตรวจสถานะข้อมูล <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="panel min-h-32">
              <div className="flex items-center justify-between gap-3">
                <p className="panel-title">LIVE DATA FEEDS</p>
                <Activity className="size-5 text-sky-300" />
              </div>
              <p className="num-xl mt-4 text-3xl">0 / 4</p>
              <p className="mt-2 text-xs text-muted-foreground">ยังไม่มีแหล่งข้อมูลฟาร์มที่หน้าเว็บอ่านได้จริง</p>
            </article>
            <article className="panel min-h-32">
              <div className="flex items-center justify-between gap-3">
                <p className="panel-title">FARM PLOTS</p>
                <MapPin className="size-5 text-emerald-300" />
              </div>
              <p className="mt-4 text-lg font-semibold">รอเชื่อมข้อมูล</p>
              <p className="mt-2 text-xs text-muted-foreground">ยังไม่พบรายการแปลงและพิกัดที่ Dashboard ใช้งานได้</p>
            </article>
            <article className="panel min-h-32">
              <div className="flex items-center justify-between gap-3">
                <p className="panel-title">DRONE SURVEYS</p>
                <Camera className="size-5 text-sky-300" />
              </div>
              <p className="mt-4 text-lg font-semibold">รอภาพชุดแรก</p>
              <p className="mt-2 text-xs text-muted-foreground">ยังไม่มี workflow นำเข้าภาพและประวัติการสำรวจ</p>
            </article>
            <article className="panel min-h-32">
              <div className="flex items-center justify-between gap-3">
                <p className="panel-title">SENSOR TELEMETRY</p>
                <Droplets className="size-5 text-amber-200" />
              </div>
              <p className="mt-4 text-lg font-semibold">ยังไม่เชื่อมต่อ</p>
              <p className="mt-2 text-xs text-muted-foreground">ไม่นำค่าตัวอย่างเดิมมาแสดงเป็นค่าปัจจุบัน</p>
            </article>
          </div>
        </section>

        <section id="sources" className="scroll-mt-24">
          <SectionHeading
            eyebrow="DATA SOURCE HEALTH"
            title="สถานะการเชื่อมต่อ"
            detail="สถานะต่อไปนี้อ้างอิงจากการตรวจโค้ดใน repository ไม่ใช่การตรวจสุขภาพระบบแบบเรียลไทม์"
          />
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <StatusRow
              title="IoT · ความชื้นดินและสภาพอากาศ"
              detail="พบกราฟและค่าตัวอย่างแบบ hard-coded ในหน้าเดิม แต่ยังไม่พบ endpoint หรือ subscription สำหรับอ่านเซนเซอร์จริง"
              state="not-connected"
            />
            <StatusRow
              title="Drone · DJI Phantom 4 RGB"
              detail="ยังไม่พบโมดูลอัปโหลดภาพต้นฉบับ จัดชุดภาพ สร้าง orthomosaic หรือเปรียบเทียบภาพตามช่วงเวลา"
              state="not-connected"
            />
            <StatusRow
              title="CCTV · Supabase"
              detail="มี migration สำหรับตาราง cctv_events และ RLS แต่หน้าเว็บยังไม่มีการอ่านข้อมูลผ่าน session/API ที่ตรวจสอบสิทธิ์แล้ว"
              state="pending"
            />
            <StatusRow
              title="Farm plots · ขอบเขตแปลง"
              detail="ยังไม่พบแหล่งข้อมูลขอบเขตแปลงและพิกัดที่เชื่อมกับหน้าภาพรวม"
              state="not-connected"
            />
          </div>
        </section>

        <section id="iot" className="scroll-mt-24">
          <SectionHeading
            eyebrow="IOT TELEMETRY"
            title="ข้อมูลเซนเซอร์"
            detail="ส่วนนี้จะแสดงค่าล่าสุด แนวโน้ม และเวลาอ่านค่าครั้งล่าสุดเมื่อเชื่อม feed จริงแล้ว"
          />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <article className="panel flex min-h-44 items-start gap-4">
              <span className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-3 text-sky-300"><Droplets className="size-6" /></span>
              <div>
                <h3 className="font-semibold">ความชื้นในดิน</h3>
                <p className="mt-1 text-xs text-muted-foreground">Soil moisture · %</p>
                <p className="mt-4 text-sm font-medium text-amber-200">รอเชื่อมเซนเซอร์</p>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">ไม่มีการแสดงตัวเลขจนกว่าจะอ่านค่าจากอุปกรณ์หรือ API ที่ระบุแหล่งที่มาได้</p>
              </div>
            </article>
            <article className="panel flex min-h-44 items-start gap-4">
              <span className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-amber-200"><Thermometer className="size-6" /></span>
              <div>
                <h3 className="font-semibold">อุณหภูมิและความชื้นอากาศ</h3>
                <p className="mt-1 text-xs text-muted-foreground">Weather station · °C / %</p>
                <p className="mt-4 text-sm font-medium text-amber-200">รอเชื่อมสถานีอากาศ</p>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">กราฟจะเริ่มแสดงเมื่อมีข้อมูลจริงพร้อม timestamp และหน่วยวัด</p>
              </div>
            </article>
          </div>
        </section>

        <section id="drone" className="scroll-mt-24">
          <SectionHeading
            eyebrow="AERIAL SURVEY"
            title="สำรวจแปลงด้วยโดรน"
            detail="ออกแบบสำหรับภาพ RGB จาก DJI Phantom 4 โดยไม่สมมติว่ามีภาพหรือผลประมวลผลอยู่แล้ว"
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <article className="panel">
              <div className="flex items-start gap-3">
                <span className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-3 text-sky-300"><Camera className="size-6" /></span>
                <div>
                  <p className="panel-title">DJI PHANTOM 4 · RGB</p>
                  <h3 className="mt-1 text-lg font-semibold">คลังภาพสำรวจ</h3>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-dashed border-panel-line bg-black/10 p-6 text-center">
                <Camera className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">ยังไม่มีชุดภาพที่เชื่อมกับระบบ</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">ฟังก์ชันอัปโหลดและจัดเก็บภาพยังไม่เปิดใช้งานในเวอร์ชันนี้</p>
              </div>
            </article>
            <article className="panel">
              <p className="panel-title">WORKFLOW ที่ต้องพัฒนา</p>
              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-panel-line font-mono text-xs">01</span>
                  <div><h3 className="text-sm font-semibold">นำเข้าภาพต้นฉบับ</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">จัดเก็บไฟล์ภาพ วันที่บิน รหัสแปลง และ metadata ของชุดสำรวจ</p></div>
                </div>
                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-panel-line font-mono text-xs">02</span>
                  <div><h3 className="text-sm font-semibold">ประมวลผลภาพ</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">สร้าง orthomosaic และข้อมูลเชิงพื้นที่ด้วย pipeline ที่รองรับภาพ RGB</p></div>
                </div>
                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-panel-line font-mono text-xs">03</span>
                  <div><h3 className="text-sm font-semibold">เปรียบเทียบการเติบโต</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">เปรียบเทียบภาพตามวันบินและบันทึกจุดที่ควรตรวจภาคสนาม</p></div>
                </div>
              </div>
              <p className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-relaxed text-amber-100">
                หมายเหตุ: ภาพ RGB ปกติไม่สามารถใช้ยืนยันค่า NDVI ได้โดยลำพัง
              </p>
            </article>
          </div>
        </section>

        <section id="cctv" className="scroll-mt-24">
          <SectionHeading
            eyebrow="SITE SAFETY"
            title="CCTV และเหตุการณ์ความปลอดภัย"
            detail="คงการรองรับ schema เดิมไว้ แต่ยังไม่แสดงเหตุการณ์จนกว่าจะเชื่อมการอ่านข้อมูลด้วยสิทธิ์ที่ถูกต้อง"
          />
          <article className="panel">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-emerald-300"><Database className="size-6" /></span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">Supabase · cctv_events</h3>
                  <SourceBadge state="pending" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  มี migration และนโยบาย RLS ใน repository แต่หน้า Dashboard ยังไม่ได้ query ตารางนี้โดยตรง จึงยังไม่สามารถสรุปจำนวนเหตุการณ์หรือสถานะกล้องได้
                </p>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-panel-line bg-black/10 p-3 text-xs leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                  ขั้นตอนถัดไปต้องใช้ authenticated session และคง RLS ไว้ ห้ามเปิดข้อมูลหรือเขียนเหตุการณ์แบบ public เพื่อให้หน้าเว็บทำงาน
                </div>
              </div>
            </div>
          </article>
        </section>

        <footer className="flex flex-col gap-2 border-t border-panel-line pt-4 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2"><Sprout className="size-3.5 text-emerald-300" /> Mahidol Smart Farm · Dashboard preview</span>
          <span className="inline-flex items-center gap-2"><WifiOff className="size-3.5" /> ยังไม่มีข้อมูลฟาร์มสดที่เชื่อมจากหน้าเว็บ</span>
        </footer>
      </main>
    </div>
  );
}
