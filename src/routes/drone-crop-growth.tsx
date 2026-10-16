import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CloudUpload,
  Drone,
  FileImage,
  ImagePlus,
  Leaf,
  MapPin,
  PlaneTakeoff,
  RefreshCw,
  Sprout,
  Trash2,
} from "lucide-react";

type DroneImage = {
  id: string;
  file: File;
  url: string;
};

type SurveyRecord = {
  id: string;
  plot: string;
  date: string;
  operator: string;
  drone: string;
  note: string;
  imageCount: number;
};

const PLOT_OPTIONS = [
  { value: "plot-a", label: "แปลงสาธิต A" },
  { value: "plot-b", label: "แปลงสาธิต B" },
  { value: "plot-c", label: "แปลงสาธิต C" },
  { value: "other", label: "แปลงอื่น / ระบุในหมายเหตุ" },
];

const today = new Date().toLocaleDateString("en-CA");

export function DroneCropGrowthPage() {
  const [plot, setPlot] = useState(PLOT_OPTIONS[0].value);
  const [surveyDate, setSurveyDate] = useState(today);
  const [operator, setOperator] = useState("");
  const [drone, setDrone] = useState("DJI Phantom 4 (RGB)");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<DroneImage[]>([]);
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [beforeId, setBeforeId] = useState("");
  const [afterId, setAfterId] = useState("");
  const [feedback, setFeedback] = useState("");
  const imagesRef = useRef<DroneImage[]>([]);
  imagesRef.current = images;

  useEffect(() => {
    return () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
  }, []);

  const beforeImage = useMemo(
    () => images.find((image) => image.id === beforeId),
    [images, beforeId],
  );
  const afterImage = useMemo(
    () => images.find((image) => image.id === afterId),
    [images, afterId],
  );

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const accepted = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );
    const next = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((current) => {
      const merged = [...current, ...next];
      if (!beforeId && merged[0]) setBeforeId(merged[0].id);
      if ((!afterId || afterId === beforeId) && merged.length > 1) {
        setAfterId(merged[merged.length - 1].id);
      }
      return merged;
    });
    setFeedback(accepted.length ? `เพิ่มภาพ ${accepted.length} ไฟล์แล้ว (ยังไม่อัปโหลดไปยังเซิร์ฟเวอร์)` : "ไม่พบไฟล์ภาพที่รองรับ");
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const remaining = current.filter((image) => image.id !== id);
      if (beforeId === id) setBeforeId(remaining[0]?.id ?? "");
      if (afterId === id) setAfterId(remaining[1]?.id ?? remaining[0]?.id ?? "");
      return remaining;
    });
  };

  const saveSurveyDraft = () => {
    if (!surveyDate) {
      setFeedback("กรุณาเลือกวันที่สำรวจก่อน");
      return;
    }
    if (!images.length) {
      setFeedback("กรุณาเพิ่มภาพโดรนอย่างน้อย 1 ภาพก่อนสร้างบันทึก");
      return;
    }
    const record: SurveyRecord = {
      id: `survey-${Date.now()}`,
      plot,
      date: surveyDate,
      operator: operator.trim() || "ไม่ได้ระบุ",
      drone,
      note: note.trim(),
      imageCount: images.length,
    };
    setRecords((current) => [record, ...current]);
    setFeedback("สร้างบันทึกรอบสำรวจในหน้านี้แล้ว ข้อมูลยังไม่ถูกบันทึกลงฐานข้อมูล");
  };

  const plotLabel = (value: string) =>
    PLOT_OPTIONS.find((option) => option.value === value)?.label ?? value;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 font-['Mitr']">
      <header className="sticky top-0 z-40 border-b-2 border-[#1B6B3C] bg-[#0A2E4D] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#F5B800]">
              <Leaf className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-wide">MAHIDOL SMART FARM</span>
              <span className="block truncate text-[11px] text-emerald-100">ติดตามการเติบโตของพืชด้วยโดรน</span>
            </span>
          </Link>
          <Link to="/" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 sm:text-sm">
            <ArrowLeft className="size-4" />
            <span>กลับหน้าเว็บเดิม</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2E4D] via-[#104B3A] to-[#1B6B3C] p-6 text-white shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-12 size-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 top-4 size-40 rounded-full border border-[#F5B800]/20" />
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
              <PlaneTakeoff className="size-4 text-[#F5B800]" />
              DRONE SURVEY · CROP GROWTH
            </div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">ติดตามการเติบโตของพืช</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
              เพิ่มรอบสำรวจจากภาพถ่ายโดรน เปรียบเทียบภาพต่างช่วงเวลา และเก็บบันทึกภาคสนาม
              เพื่อสนับสนุนการจัดการแปลงและการถ่ายทอดความรู้ให้ชุมชน
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-white/20 bg-black/10 px-3 py-2">ระบบเดิมยังคงอยู่</span>
              <span className="rounded-lg border border-white/20 bg-black/10 px-3 py-2">รองรับภาพ RGB</span>
              <span className="rounded-lg border border-[#F5B800]/40 bg-[#F5B800]/10 px-3 py-2 text-amber-100">ต้นแบบ · ยังไม่เชื่อมฐานข้อมูล</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard icon={<ClipboardList className="size-5" />} label="บันทึกในหน้านี้" value={String(records.length)} detail="ข้อมูลชั่วคราวระหว่างเปิดหน้านี้" />
          <SummaryCard icon={<FileImage className="size-5" />} label="ภาพที่เลือก" value={String(images.length)} detail="ภาพในเบราว์เซอร์เครื่องนี้" />
          <SummaryCard icon={<MapPin className="size-5" />} label="แปลงที่กำลังทำงาน" value={plotLabel(plot)} detail="เลือกแปลงสำหรับรอบสำรวจนี้" />
        </section>

        <section className="grid items-start gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#1B6B3C]">
                <Drone className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold">สร้างรอบสำรวจ</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">ระบุข้อมูลเที่ยวบินและเลือกภาพที่ต้องการตรวจสอบ</p>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="แปลงเกษตร">
                <select value={plot} onChange={(event) => setPlot(event.target.value)} className={inputClass}>
                  {PLOT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="วันที่สำรวจ">
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
                    <input type="date" value={surveyDate} onChange={(event) => setSurveyDate(event.target.value)} className={`${inputClass} pl-9`} />
                  </div>
                </Field>
                <Field label="อากาศยาน / กล้อง">
                  <select value={drone} onChange={(event) => setDrone(event.target.value)} className={inputClass}>
                    <option>DJI Phantom 4 (RGB)</option>
                    <option>โดรน RGB รุ่นอื่น</option>
                    <option>ไม่ทราบรุ่น</option>
                  </select>
                </Field>
              </div>
              <Field label="ผู้ปฏิบัติงาน (ไม่บังคับ)">
                <input value={operator} onChange={(event) => setOperator(event.target.value)} placeholder="ชื่อผู้สำรวจ" className={inputClass} />
              </Field>
              <Field label="หมายเหตุภาคสนาม (ไม่บังคับ)">
                <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="เช่น ระยะการเจริญเติบโต สภาพอากาศ หรือบริเวณที่ควรลงตรวจ" className={`${inputClass} resize-y`} />
              </Field>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/70 px-5 py-7 text-center transition hover:border-[#1B6B3C] hover:bg-emerald-50">
                <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-white text-[#1B6B3C] shadow-sm">
                  <CloudUpload className="size-6" />
                </span>
                <span className="text-sm font-bold text-slate-800">เลือกภาพจากโดรน</span>
                <span className="mt-1 text-xs leading-5 text-slate-500">เลือกไฟล์ภาพ JPG, PNG หรือภาพ RGB ที่ส่งออกมาแล้ว</span>
                <span className="mt-3 rounded-lg bg-[#1B6B3C] px-4 py-2 text-xs font-semibold text-white">เลือกไฟล์ภาพ</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { handleFiles(event.target.files); event.currentTarget.value = ""; }} />
              </label>

              {feedback && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-900">{feedback}</p>}
              <button type="button" onClick={saveSurveyDraft} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2E4D] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#123f61]">
                <CheckCircle2 className="size-4" />
                สร้างบันทึกรอบสำรวจ
              </button>
              <p className="text-[11px] leading-5 text-slate-500">หมายเหตุ: ตอนนี้เป็นต้นแบบฝั่งหน้าเว็บ บันทึกและภาพยังไม่ถูกส่งไป Supabase หรือจัดเก็บถาวร</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">ภาพที่เลือก</h2>
                  <p className="mt-1 text-xs text-slate-500">ตรวจดูภาพก่อนเปรียบเทียบ</p>
                </div>
                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{images.length} ไฟล์</span>
              </div>
              {images.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <ImagePlus className="size-9 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-600">ยังไม่ได้เลือกภาพ</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">เลือกภาพถ่ายจากโดรนเพื่อดูตัวอย่างและใช้เครื่องมือเปรียบเทียบด้านล่าง</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((image) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img src={image.url} alt={image.file.name} className="aspect-square w-full object-cover" />
                      <button type="button" onClick={() => removeImage(image.id)} aria-label={`ลบ ${image.file.name}`} className="absolute right-2 top-2 rounded-lg bg-slate-950/75 p-2 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100">
                        <Trash2 className="size-3.5" />
                      </button>
                      <div className="p-2">
                        <p className="truncate text-[11px] font-semibold text-slate-700" title={image.file.name}>{image.file.name}</p>
                        <p className="mt-1 text-[10px] text-slate-500">{(image.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><RefreshCw className="size-5" /></span>
                <div>
                  <h2 className="text-xl font-bold">เปรียบเทียบภาพ</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">ดูความแตกต่างด้วยสายตา ระหว่างภาพสองช่วงเวลา</p>
                </div>
              </div>
              {images.length < 2 ? (
                <div className="rounded-xl bg-amber-50 px-4 py-5 text-center">
                  <Sprout className="mx-auto size-7 text-amber-700" />
                  <p className="mt-2 text-sm font-semibold text-amber-950">ต้องมีภาพอย่างน้อย 2 ภาพ</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">เพิ่มภาพจากคนละวันหรือคนละรอบสำรวจเพื่อเริ่มเปรียบเทียบ</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <Field label="ภาพก่อน">
                      <select value={beforeId} onChange={(event) => setBeforeId(event.target.value)} className={inputClass}>
                        {images.map((image) => <option key={image.id} value={image.id}>{image.file.name}</option>)}
                      </select>
                    </Field>
                    <Field label="ภาพหลัง">
                      <select value={afterId} onChange={(event) => setAfterId(event.target.value)} className={inputClass}>
                        {images.map((image) => <option key={image.id} value={image.id}>{image.file.name}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ComparisonImage image={beforeImage} label="ภาพก่อน" />
                    <ComparisonImage image={afterImage} label="ภาพหลัง" />
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-slate-500">การเปรียบเทียบนี้เป็นการดูภาพ RGB ด้วยสายตา ยังไม่ใช่การวัดพื้นที่ใบพืช ความสูง หรือดัชนีพืชพรรณอัตโนมัติ</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold">บันทึกรอบสำรวจในเซสชันนี้</h2>
              <p className="mt-1 text-xs text-slate-500">รายการจะหายเมื่อรีเฟรชหรือออกจากหน้านี้ จนกว่าจะเชื่อมฐานข้อมูล</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{records.length} รายการ</span>
          </div>
          {records.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <ClipboardList className="mx-auto size-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-600">ยังไม่มีบันทึกในเซสชันนี้</p>
              <p className="mt-1 text-xs text-slate-500">เลือกภาพและสร้างบันทึกรอบสำรวจเพื่อแสดงรายการตรงนี้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead><tr className="border-b border-slate-200 text-xs text-slate-500"><th className="px-3 py-3 font-semibold">วันที่</th><th className="px-3 py-3 font-semibold">แปลง</th><th className="px-3 py-3 font-semibold">อุปกรณ์</th><th className="px-3 py-3 font-semibold">ผู้สำรวจ</th><th className="px-3 py-3 text-right font-semibold">จำนวนภาพ</th></tr></thead>
                <tbody>{records.map((record) => <tr key={record.id} className="border-b border-slate-100 last:border-0"><td className="px-3 py-3">{record.date}</td><td className="px-3 py-3 font-semibold">{plotLabel(record.plot)}</td><td className="px-3 py-3">{record.drone}</td><td className="px-3 py-3">{record.operator}</td><td className="px-3 py-3 text-right tabular-nums">{record.imageCount}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-10 border-t border-slate-800 bg-[#071F34] px-4 py-8 text-center text-slate-300">
        <p className="text-xs leading-6">งานพันธกิจเพื่อสังคม คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล จังหวัดลำปาง</p>
        <p className="mt-1 text-[11px] text-slate-500">Drone & Crop Growth · Smart Farm extension</p>
      </footer>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1B6B3C] focus:ring-2 focus:ring-emerald-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="block text-xs font-semibold text-slate-700">{label}</span>{children}</label>;
}

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-500">{icon}{label}</div><p className="mt-3 truncate text-2xl font-bold text-[#0A2E4D]">{value}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{detail}</p></div>;
}

function ComparisonImage({ image, label }: { image?: DroneImage; label: string }) {
  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2"><span className="text-xs font-bold text-slate-700">{label}</span><span className="text-[10px] text-slate-500">{image ? image.file.name : "ยังไม่เลือก"}</span></div>{image ? <img src={image.url} alt={label} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center text-xs text-slate-400">ไม่มีภาพ</div>}</div>;
}
