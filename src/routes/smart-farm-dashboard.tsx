import { useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarDays,
  Camera, CheckCircle2, Clock3, CloudSun, Droplets, Gauge, Leaf,
  RefreshCw, Thermometer, Wifi, WifiOff, Wind, Zap
} from "lucide-react";

type Period = "24h" | "7d" | "30d";
type DeviceFilter = "all" | "device-1" | "device-2";

const devices = [
  { id: "device-1", name: "HMI_PI8043_MU_LAMPANG_1", label: "อุปกรณ์ 01" },
  { id: "device-2", name: "HMI_PI8043_MU_LAMPANG_2", label: "อุปกรณ์ 02" },
];

const sensorGroups = [
  {
    title: "สภาพอากาศ",
    icon: CloudSun,
    sensors: [
      { name: "AirTEMP", label: "อุณหภูมิอากาศ", unit: "°C" },
      { name: "AirHUMID", label: "ความชื้นอากาศ", unit: "%" },
      { name: "UV", label: "รังสี UV", unit: "" },
      { name: "Solar", label: "Solar Radiation", unit: "" },
    ],
  },
  {
    title: "ความชื้นและอุณหภูมิดิน",
    icon: Droplets,
    sensors: [
      { name: "SoilTEMP1–7", label: "อุณหภูมิดิน จุด 1–7", unit: "°C" },
      { name: "SoilMOISTURE1–7", label: "ความชื้นดิน จุด 1–7", unit: "%" },
      { name: "Soil N1", label: "Soil N1", unit: "" },
    ],
  },
];

const controls = ["EXHAUST", "EVAP", "VALVE 1", "VALVE 2", "SHADE", "LIGHTING"];

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  footnote,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  unit?: string;
  footnote: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#102B43] p-4 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="rounded-lg bg-white/5 p-2 text-[#F5B800]"><Icon size={17} /></span>
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-white">{value}</span>
        {unit ? <span className="text-sm text-slate-400">{unit}</span> : null}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">{footnote}</p>
    </div>
  );
}

export function SmartFarmDashboardPage() {
  const [period, setPeriod] = useState<Period>("24h");
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>("all");
  const [notice, setNotice] = useState("");
  const [checking, setChecking] = useState(false);

  const checkConnection = () => {
    setChecking(true);
    setNotice("Dashboard พร้อมแล้ว แต่ยังไม่มีการเชื่อมต่อ V-NET2.0 → Supabase จึงยังไม่แสดงค่าตัวเลขจริง");
    window.setTimeout(() => setChecking(false), 450);
  };

  return (
    <div className="min-h-screen bg-[#071B2D] text-slate-100">
      <header className="border-b border-white/10 bg-[#0A2E4D]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#F5B800]/30 bg-[#F5B800]/10 p-3 text-[#F5B800]">
              <Leaf size={25} />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#F5B800]">MAHIDOL UNIVERSITY · SMART FARM</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">Smart Farm Monitoring</h1>
              <p className="mt-1 text-xs text-slate-300">ระบบติดตามสภาพแวดล้อมและการจัดการแปลงเกษตรอัจฉริยะ</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/" className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10">กลับหน้าหลัก</a>
            <button onClick={checkConnection} disabled={checking} className="inline-flex items-center gap-2 rounded-lg bg-[#F5B800] px-3.5 py-2 text-xs font-semibold text-[#102B43] transition hover:bg-yellow-300 disabled:opacity-60">
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} /> ตรวจสอบการเชื่อมต่อ
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0D2439] p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-40" />
              <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
            </span>
            <span className="font-medium text-amber-300">รอเชื่อมต่อข้อมูล V-NET2.0</span>
            <span className="hidden text-slate-500 sm:inline">·</span>
            <span className="text-xs text-slate-400">ยังไม่มีการอ่านค่าจากอุปกรณ์ในหน้านี้</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="device-filter">เลือกอุปกรณ์</label>
            <select id="device-filter" value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value as DeviceFilter)} className="rounded-lg border border-white/10 bg-[#102B43] px-3 py-2 text-xs text-slate-200 outline-none focus:border-[#F5B800]">
              <option value="all">อุปกรณ์ทั้งหมด</option>
              <option value="device-1">อุปกรณ์ 01</option>
              <option value="device-2">อุปกรณ์ 02</option>
            </select>
            <div className="flex rounded-lg border border-white/10 bg-[#102B43] p-1">
              {(["24h", "7d", "30d"] as Period[]).map((item) => (
                <button key={item} onClick={() => setPeriod(item)} className={`rounded-md px-3 py-1.5 text-xs transition ${period === item ? "bg-[#F5B800] font-semibold text-[#102B43]" : "text-slate-300 hover:bg-white/10"}`}>
                  {item === "24h" ? "24 ชั่วโมง" : item === "7d" ? "7 วัน" : "30 วัน"}
                </button>
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 text-[11px] text-slate-400"><CalendarDays size={13} /> Asia/Bangkok</span>
          </div>
        </section>

        {notice ? (
          <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-300" />{notice}
          </div>
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">ภาพรวมฟาร์ม</h2>
              <p className="mt-1 text-[11px] text-slate-400">ค่าจริงจะแสดงเมื่อระบบเริ่มซิงก์ข้อมูลจาก V-NET2.0</p>
            </div>
            <span className="text-[10px] text-slate-500">ช่วงข้อมูล: {period === "24h" ? "24 ชั่วโมงล่าสุด" : period === "7d" ? "7 วันล่าสุด" : "30 วันล่าสุด"}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard icon={Wifi} label="อุปกรณ์ออนไลน์" value="— / 2" footnote="รอข้อมูลสถานะอุปกรณ์" />
            <MetricCard icon={Thermometer} label="อุณหภูมิอากาศ" value="—" unit="°C" footnote="ค่าเฉลี่ยจาก Sensor" />
            <MetricCard icon={Droplets} label="ความชื้นอากาศ" value="—" unit="%" footnote="ค่าเฉลี่ยจาก Sensor" />
            <MetricCard icon={Gauge} label="ความชื้นดินเฉลี่ย" value="—" unit="%" footnote="รวมจุดตรวจวัดที่มีข้อมูล" />
            <MetricCard icon={AlertTriangle} label="Alarm วันนี้" value="—" footnote="รอประวัติ Alarm จาก V-NET2.0" />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-[#102B43] p-5 xl:col-span-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">แนวโน้มสภาพอากาศ</h2>
                <p className="mt-1 text-[11px] text-slate-400">AirTEMP · AirHUMID · Solar · UV</p>
              </div>
              <CloudSun className="text-[#F5B800]" size={19} />
            </div>
            <div className="mt-5 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#0B2236]/70 px-5 text-center">
              <Activity size={28} className="text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-300">ยังไม่มีข้อมูลกราฟ</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">กราฟจะเริ่มแสดงเมื่อ Apps Script บันทึกค่า Sensor พร้อม Timestamp ลง Supabase</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#102B43] p-5 xl:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">ความชื้นดิน 7 จุด</h2>
                <p className="mt-1 text-[11px] text-slate-400">SoilMOISTURE1–7 · หน่วย %</p>
              </div>
              <Droplets className="text-sky-300" size={19} />
            </div>
            <div className="mt-5 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#0B2236]/70 px-5 text-center">
              <Droplets size={28} className="text-slate-500" />
              <p className="mt-3 text-sm font-medium text-slate-300">รอข้อมูลความชื้นดิน</p>
              <p className="mt-1 text-xs text-slate-500">ยังไม่แสดงค่าตัวอย่าง เพื่อป้องกันการเข้าใจว่าเป็นข้อมูลจริง</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#102B43] p-5 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">รายการ Sensor</h2>
                <p className="mt-1 text-[11px] text-slate-400">Tag ที่ตรวจพบจากหน้าจอ V-NET2.0 เบื้องต้น</p>
              </div>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-400">19 Tags / device ตามหน้าจอ</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {sensorGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.title} className="rounded-xl border border-white/10 bg-[#0B2236]/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200"><GroupIcon size={15} className="text-[#F5B800]" />{group.title}</div>
                    <div className="space-y-2">
                      {group.sensors.map((sensor) => (
                        <div key={sensor.name} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <div><p className="text-xs text-slate-200">{sensor.label}</p><p className="mt-0.5 text-[10px] text-slate-500">{sensor.name}</p></div>
                          <span className="text-sm font-semibold tabular-nums text-slate-400">— <small className="text-[10px] font-normal">{sensor.unit}</small></span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">หมายเหตุ: รายการข้างต้นเป็น Tag ที่อ่านได้จากภาพที่ส่งมา ยังต้องตรวจสอบรายการครบทั้ง 19 Tags และ Mapping ของอุปกรณ์ตัวที่ 2 ก่อนใช้งานจริง</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#102B43] p-5">
            <div className="flex items-center justify-between">
              <div><h2 className="text-sm font-semibold text-white">สถานะอุปกรณ์</h2><p className="mt-1 text-[11px] text-slate-400">HMI / PLC</p></div>
              <WifiOff className="text-amber-300" size={18} />
            </div>
            <div className="mt-4 space-y-3">
              {devices.filter((device) => deviceFilter === "all" || device.id === deviceFilter).map((device) => (
                <div key={device.id} className="rounded-xl border border-white/10 bg-[#0B2236]/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold tracking-wide text-[#F5B800]">{device.label}</span>
                    <span className="rounded-full bg-slate-500/15 px-2 py-1 text-[9px] text-slate-400">รอข้อมูล</span>
                  </div>
                  <p className="mt-2 break-all text-xs text-slate-200">{device.name}</p>
                  <p className="mt-1 text-[10px] text-slate-500">ยังไม่ได้รับสถานะจาก API</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-2 text-[10px] font-semibold tracking-wider text-slate-400">อุปกรณ์ควบคุมที่พบใน HMI</p>
              <div className="grid grid-cols-2 gap-2">
                {controls.map((item) => <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-center text-[10px] text-slate-300">{item}<span className="mt-1 block text-[9px] text-slate-500">รอข้อมูล</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#102B43] p-5">
            <div className="flex items-center gap-2"><AlertTriangle size={17} className="text-amber-300" /><h2 className="text-sm font-semibold text-white">Alarm & เหตุการณ์</h2></div>
            <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-[#0B2236]/70 px-4 py-8 text-center">
              <p className="text-xs text-slate-400">รอเชื่อมต่อ Alarm records จาก V-NET2.0</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#102B43] p-5">
            <div className="flex items-center gap-2"><Camera size={17} className="text-[#F5B800]" /><h2 className="text-sm font-semibold text-white">CCTV Monitoring</h2></div>
            <p className="mt-1 text-[11px] text-slate-400">เชื่อมโยงกับระบบ Gmail → Apps Script → Supabase Storage เดิม</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[2, 3].map((camera) => <div key={camera} className="rounded-xl border border-white/10 bg-[#0B2236]/70 p-4 text-center"><Camera size={21} className="mx-auto text-slate-500" /><p className="mt-2 text-xs font-semibold text-slate-200">CCTV {camera}</p><p className="mt-1 text-[10px] text-slate-500">แสดงภาพล่าสุดเมื่อเชื่อม API</p></div>)}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 py-5 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Mahidol Smart Farm · Environmental & Resource Studies</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 size={12} /> Last data sync: ยังไม่มีข้อมูล</span>
        </footer>
      </main>
    </div>
  );
}
