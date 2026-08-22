import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Droplets, Thermometer, CloudRain, Radio, Wifi, Bell,
  MapPin, ChevronLeft, ChevronRight, Gauge
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SmartFarm3DGame } from "@/components/SmartFarm3DGame";

// 1. ประกาศ Type ให้ TypeScript รู้จัก Custom Element <model-viewer>
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'auto-rotate'?: boolean | string;
          'camera-controls'?: boolean | string;
          'shadow-intensity'?: string | number;
          'ar'?: boolean | string;
          'loading'?: 'auto' | 'lazy' | 'eager';
          'autoplay'?: boolean | string;
          'animation-name'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export const Route = createFileRoute("/")({
  component: HomePage,
});

// ข้อมูล 6 ภาพสไลด์แบนเนอร์
const HERO_SLIDES = [
  {
    id: 1,
    image: "/Banner 1.jpg",
    badge: "MAHIDOL SMART FARM HUB",
    title: "ฐานเรียนรู้เกษตรอัจฉริยะ",
    subtitle: "งานพันธกิจเพื่อสังคม คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล อ.สบปราบ จ.ลำปาง",
    buttonText: "สำรวจแปลงเกษตร 3 มิติ",
    buttonLink: "#media-section",
  },
  {
    id: 2,
    image: "/Banner 2.jpg",
    badge: "ZONE 01 // SOIL MOISTURE IOT",
    title: "เซนเซอร์วัดความชื้นดิน",
    subtitle: "ตรวจวัดความชื้นในดินแบบเรียลไทม์ด้วยเซนเซอร์ IoT ทั่วแปลงสาธิต เพื่อการรดน้ำที่แม่นยำ",
    buttonText: "ดูข้อมูลความชื้นดิน",
    buttonLink: "#cards-section",
  },
  {
    id: 3,
    image: "/Banner 3.jpg",
    badge: "ZONE 02 // WEATHER STATION",
    title: "สถานีตรวจวัดสภาพอากาศ",
    subtitle: "บันทึกอุณหภูมิ ความชื้นอากาศ และปริมาณน้ำฝนตลอด 24 ชั่วโมง เพื่อวางแผนการเพาะปลูก",
    buttonText: "ดูข้อมูลสภาพอากาศ",
    buttonLink: "#cards-section",
  },
  {
    id: 4,
    image: "/Banner 4.jpg",
    badge: "ZONE 03 // AUTO IRRIGATION",
    title: "ระบบรดน้ำอัตโนมัติ",
    subtitle: "วาล์วน้ำอัจฉริยะสั่งงานอัตโนมัติตามค่าความชื้นดิน ลดการใช้น้ำและแรงงานในแปลงสาธิต",
    buttonText: "ดูระบบรดน้ำอัตโนมัติ",
    buttonLink: "#cards-section",
  },
  {
    id: 5,
    image: "/Banner 5.jpg",
    badge: "ZONE 04 // DIGITAL TWIN 3D",
    title: "โมเดลแปลงเกษตร 3 มิติ",
    subtitle: "สำรวจโครงสร้างแปลงสาธิตและตำแหน่งเซนเซอร์แบบ 360 องศาผ่านโมเดล 3 มิติเสมือนจริง",
    buttonText: "หมุนดูโมเดล 3 มิติ",
    buttonLink: "#media-section",
  },
  {
    id: 6,
    image: "/Banner 6.jpg",
    badge: "ZONE 05 // REALTIME DASHBOARD",
    title: "แดชบอร์ดและการแจ้งเตือน",
    subtitle: "ติดตามค่าจากเซนเซอร์ทุกจุดและรับการแจ้งเตือนทันทีเมื่อค่าความชื้นหรืออุณหภูมิผิดปกติ",
    buttonText: "ดูสถิติแบบเรียลไทม์",
    buttonLink: "#data-viz",
  },
];

// ข้อมูลแนวโน้มความชื้นดินรายชั่วโมง
const soilMoistureData = [
  { time: "06:00", moisture: 68 },
  { time: "09:00", moisture: 61 },
  { time: "12:00", moisture: 52 },
  { time: "15:00", moisture: 47 },
  { time: "18:00", moisture: 58 },
  { time: "21:00", moisture: 65 },
];

// ข้อมูลอุณหภูมิ/ความชื้นอากาศรายชั่วโมง
const weatherData = [
  { time: "06:00", temp: 24, humidity: 82 },
  { time: "09:00", temp: 28, humidity: 70 },
  { time: "12:00", temp: 33, humidity: 55 },
  { time: "15:00", temp: 34, humidity: 51 },
  { time: "18:00", temp: 29, humidity: 66 },
  { time: "21:00", temp: 25, humidity: 78 },
];

export function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ตั้งเวลาเปลี่ยนภาพสไลด์อัตโนมัติ
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // โหลดสคริปต์ตัวเล่น 3D Model Viewer อัตโนมัติ
  useEffect(() => {
    const scriptId = "google-model-viewer-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 font-['Mitr'] selection:bg-[#1B6B3C] selection:text-white flex flex-col justify-between">

      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-50 bg-[#0A2E4D] text-white shadow-md border-b-2 border-[#1B6B3C]">
        <nav className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5">
          <div className="flex items-center justify-between gap-4">

            {/* ฝั่งซ้าย: โลโก้ */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-lg h-9 sm:h-11 flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src="/envi-logo.jpg"
                    alt="Envi Mahidol Logo"
                    className="h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerText = "🌍 Envi";
                    }}
                  />
                </div>

                <div className="bg-white p-1 rounded-lg h-9 sm:h-11 flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src="/mahidol-logo.png"
                    alt="Mahidol University Logo"
                    className="h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerText = "🏛️ Mahidol";
                    }}
                  />
                </div>

                <div className="bg-white p-1 rounded-lg h-9 sm:h-11 flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src="/social-engagement-logo.png"
                    alt="Social Engagement Logo"
                    className="h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerText = "🤝 Social";
                    }}
                  />
                </div>
              </div>

              <div className="w-[1px] h-8 sm:h-10 bg-white/20 shrink-0 hidden sm:block"></div>

              <div className="hidden sm:block">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-white block leading-snug">
                  งานพันธกิจเพื่อสังคม สำนักงานวิจัยและวิทยบริการ
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-[#F5B800] block leading-tight mt-0.5">
                  คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล จังหวัดลำปาง
                </span>
              </div>
            </div>

            {/* ฝั่งขวา: เมนูนำทาง */}
            <div className="hidden xl:flex items-center space-x-6 text-xs sm:text-sm font-normal text-slate-200 shrink-0">
              <Link to="/" className="hover:text-[#F5B800] transition-colors py-1">
                หน้าแรก
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection("cards-section")}
                className="hover:text-[#F5B800] transition-colors py-1 cursor-pointer"
              >
                คลังความรู้
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("data-viz")}
                className="hover:text-[#F5B800] transition-colors py-1 cursor-pointer"
              >
                สถิติ
              </button>
              <Link to="/survey" className="hover:text-[#F5B800] transition-colors py-1">
                แบบสอบถาม
              </Link>
              <Link to="/dashboard" className="hover:text-[#F5B800] transition-colors py-1">
                สรุปผลแบบประเมินความพึงพอใจ
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="xl:hidden shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:text-[#F5B800]"
              >
                {isMobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>

          </div>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && (
            <div className="xl:hidden mt-3 pt-3 border-t border-white/15 space-y-2 text-sm font-normal">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white/10 text-white">
                หน้าแรก
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection("cards-section")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white"
              >
                คลังความรู้
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("data-viz")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white"
              >
                สถิติ
              </button>
              <Link to="/survey" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white/10 text-white">
                แบบสอบถาม
              </Link>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white/10 text-white">
                สรุปผลแบบประเมินความพึงพอใจ
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="grow">

        {/* ==================== HERO SLIDER BANNER SECTION ==================== */}
        <section className="relative w-full h-[460px] sm:h-[500px] lg:h-[540px] overflow-hidden bg-[#0B2B1E]">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 transform scale-105"
                style={{ backgroundImage: `url('${encodeURI(slide.image)}')` }}
              >
                <div className="absolute inset-0 bg-[#14432E]/55 bg-gradient-to-t from-[#0B2B1E] via-[#1B6B3C]/55 to-black/40" />
              </div>

              <div className="relative z-20 max-w-5xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-center items-center text-center text-white space-y-4">
                <span className="bg-white/15 backdrop-blur-md text-[#F5B800] text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F5B800] animate-pulse"></span>
                  {slide.badge}
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-md leading-tight max-w-4xl">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-lg text-emerald-50/95 max-w-2xl font-light leading-relaxed drop-shadow">
                  {slide.subtitle}
                </p>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      const id = slide.buttonLink.replace("#", "");
                      scrollToSection(id);
                    }}
                    className="bg-[#1B6B3C] border border-emerald-300/40 hover:bg-[#14512D] text-white font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>{slide.buttonText}</span>
                    <span className="text-[#F5B800] font-bold">›</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? "w-8 bg-[#1B6B3C] border border-emerald-300" : "w-2.5 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ==================== 🧊 3D MEDIA & GAME TABS SECTION ==================== */}
        <SmartFarmMediaSection />

        {/* Cards Grid Section */}
        <div id="cards-section" className="scroll-mt-24">
          <SmartFarmKnowledgeCards />
        </div>

        {/* Data Viz Section */}
        <div id="data-viz" className="scroll-mt-24">
          <SmartFarmDataVisualization />
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#071F34] text-slate-300 py-10 border-t border-slate-800 mt-16 space-y-3 text-center">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="text-xs sm:text-sm font-normal text-slate-300 leading-relaxed">
            งานพันธกิจเพื่อสังคม สำนักงานวิจัยและวิทยบริการ คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล จังหวัดลำปาง
          </p>
          <p className="text-slate-500 text-xs font-mono">
            © 2026 Faculty of Environment and Resource Studies, Mahidol University. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

// --- COMPONENT: 3D Media Section (รวมโหมด 360° และ เดินชมแปลงไว้ที่เดียว) ---
function SmartFarmMediaSection() {
  const [activeTab, setActiveTab] = useState<"360" | "walk">("360");
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(true);

  return (
    <section id="media-section" className="py-12 px-4 max-w-6xl mx-auto scroll-mt-24">
      <div className="bg-white border border-slate-200/90 p-5 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 space-y-6">

        {/* Header & Tabs Controller */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
              🧊 โมเดล 3 มิติแปลงเกษตรอัจฉริยะ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              สำรวจแปลงสาธิต สภาพแวดล้อม และระบบการทำงานแบบ interactive
            </p>
          </div>

          {/* Toggle Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("360")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "360"
                  ? "bg-white text-[#1B6B3C] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🔄</span>
              <span>มุมมอง 360°</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("walk")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "walk"
                  ? "bg-white text-[#1B6B3C] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🚶‍♂️</span>
              <span>เดินชมแปลง</span>
            </button>
          </div>
        </div>

        {/* 3D Display Container */}
        <div className="relative w-full h-[500px] sm:h-[560px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">

          {/* TAB 1: 3D MODEL VIEWER (360) */}
          {activeTab === "360" ? (
            <div className="w-full h-full relative">
              <model-viewer
                src="/smart-farm3d.glb"
                alt="โมเดล 3 มิติแปลงเกษตรอัจฉริยะ"
                auto-rotate
                camera-controls
                shadow-intensity="1"
                loading="eager"
                {...(isPlayingAnimation ? { autoplay: true, 'animation-name': '*' } : {})}
                style={{ width: "100%", height: "100%" }}
              >
                <div slot="poster" className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <div className="w-8 h-8 border-4 border-[#1B6B3C] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-medium">กำลังโหลดโมเดล 3 มิติ...</span>
                </div>
              </model-viewer>

              {/* Badge มุมซ้ายบน */}
              <div className="absolute top-3 left-3 bg-[#1B6B3C]/90 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/20 pointer-events-none flex items-center gap-1.5 shadow-md z-10">
                <Radio className="w-3.5 h-3.5 text-[#F5B800]" /> จุดติดตั้งเซนเซอร์ทั้งหมด 12 จุด
              </div>

              {/* ปุ่มเปิด/ปิด เอฟเฟกต์เฉพาะโหมด 360 */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md backdrop-blur-md border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isPlayingAnimation
                      ? "bg-emerald-700/80 hover:bg-emerald-800 text-white border-white/20"
                      : "bg-slate-900/70 hover:bg-slate-900 text-slate-200 border-white/10"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isPlayingAnimation ? "bg-white animate-ping" : "bg-slate-400"}`} />
                  {isPlayingAnimation ? "เอฟเฟกต์: เปิด" : "เอฟเฟกต์: ปิด"}
                </button>
              </div>

              {/* Hint มุมขวาล่าง */}
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-normal px-3 py-1.5 rounded-lg border border-white/20 pointer-events-none flex items-center gap-1.5 shadow-md z-10">
                <span>🖱️</span> คลิกและลากเพื่อหมุนดูโมเดล 3 มิติแบบ 360°
              </div>
            </div>
          ) : (
            /* TAB 2: WALKTHROUGH 3D GAME */
            <div className="w-full h-full relative">
              <SmartFarm3DGame />
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

// --- COMPONENT: Cards Grid (5 โซนหลัก) ---
function SmartFarmKnowledgeCards() {
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  const cards = [
    {
      id: 1,
      icon: <Droplets className="w-7 h-7" />,
      title: "เซนเซอร์วัดความชื้นดิน",
      desc: "เครือข่ายเซนเซอร์ IoT ฝังในดินตรวจวัดค่าความชื้นแบบเรียลไทม์ทั่วแปลงสาธิต",
      tag: "โซน 1 • Soil Moisture IoT",
      tagBg: "bg-sky-100 text-sky-800 border-sky-200",
      detail: {
        overview: "เซนเซอร์วัดความชื้นดินฝังอยู่ในระดับรากพืชแต่ละแปลง ส่งค่าความชื้นขึ้นสู่ระบบคลาวด์ทุก 15 นาที เพื่อให้ทราบสภาพดินที่แท้จริงโดยไม่ต้องลงพื้นที่ตรวจสอบเอง",
        highlights: [
          "ครอบคลุมความลึก 3 ระดับ (10 / 20 / 30 ซม.) ต่อจุดติดตั้ง",
          "ส่งข้อมูลผ่านเครือข่าย LoRa ประหยัดพลังงานแบตเตอรี่ได้นานกว่า 1 ปี",
        ],
      },
    },
    {
      id: 2,
      icon: <Thermometer className="w-7 h-7" />,
      title: "สถานีตรวจวัดสภาพอากาศ",
      desc: "บันทึกอุณหภูมิ ความชื้นสัมพัทธ์ ปริมาณน้ำฝน และความเข้มแสงตลอด 24 ชั่วโมง",
      tag: "โซน 2 • Weather Station",
      tagBg: "bg-amber-100 text-amber-800 border-amber-200",
      detail: {
        overview: "สถานีตรวจอากาศขนาดเล็กติดตั้งกลางแปลงสาธิต รวบรวมค่าอุณหภูมิ ความชื้นอากาศ ปริมาณน้ำฝน และความเข้มแสงแดด เพื่อใช้วางแผนการเพาะปลูกและคาดการณ์ความเสี่ยงล่วงหน้า",
        highlights: [
          "แจ้งเตือนล่วงหน้าเมื่อคาดว่าจะมีฝนตกหรืออากาศร้อนจัด",
          "เชื่อมข้อมูลกับระบบรดน้ำอัตโนมัติเพื่อลดการให้น้ำซ้ำซ้อนเมื่อฝนตก",
        ],
      },
    },
    {
      id: 3,
      icon: <Gauge className="w-7 h-7" />,
      title: "ระบบรดน้ำอัตโนมัติ",
      desc: "วาล์วน้ำอัจฉริยะสั่งเปิด-ปิดอัตโนมัติตามค่าความชื้นดินและสภาพอากาศ",
      tag: "โซน 3 • Auto Irrigation",
      tagBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      detail: {
        overview: "เมื่อค่าความชื้นดินต่ำกว่าเกณฑ์ที่กำหนดต่อชนิดพืช ระบบจะสั่งเปิดวาล์วรดน้ำอัตโนมัติเฉพาะจุด และปิดทันทีเมื่อความชื้นถึงระดับที่เหมาะสม ลดการใช้น้ำเกินความจำเป็น",
        highlights: [
          "ตั้งเกณฑ์ความชื้นได้แยกตามชนิดพืชในแต่ละแปลงย่อย",
          "ลดปริมาณการใช้น้ำเมื่อเทียบกับการรดน้ำตามตารางเวลาแบบเดิม",
        ],
      },
    },
    {
      id: 4,
      icon: <Bell className="w-7 h-7" />,
      title: "แดชบอร์ดและการแจ้งเตือนเรียลไทม์",
      desc: "รวมข้อมูลจากทุกเซนเซอร์ไว้ในหน้าจอเดียว พร้อมแจ้งเตือนทันทีเมื่อค่าผิดปกติ",
      tag: "โซน 4 • Realtime Dashboard",
      tagBg: "bg-rose-100 text-rose-800 border-rose-200",
      detail: {
        overview: "แดชบอร์ดกลางรวบรวมค่าจากเซนเซอร์ความชื้นดินและสถานีอากาศไว้ในที่เดียว แสดงกราฟย้อนหลังและส่งการแจ้งเตือนผ่านแอปพลิเคชันทันทีเมื่อค่าผิดปกติจากเกณฑ์ที่ตั้งไว้",
        highlights: [
          "ดูค่าย้อนหลังเปรียบเทียบระหว่างแปลงได้ในหน้าเดียว",
          "แจ้งเตือนทันทีผ่านมือถือเมื่อความชื้นดินต่ำเกินเกณฑ์หรือระบบขัดข้อง",
        ],
      },
    },
    {
      id: 5,
      icon: <MapPin className="w-7 h-7" />,
      title: "โมเดล 3 มิติแปลงเกษตรอัจฉริยะ",
      desc: "แผนที่ดิจิทัลทวินแสดงตำแหน่งเซนเซอร์และผังแปลงจริงแบบ 360 องศา",
      tag: "โซน 5 • Digital Twin 3D",
      tagBg: "bg-purple-100 text-purple-800 border-purple-200",
      detail: {
        overview: "โมเดล 3 มิติจำลองผังแปลงสาธิตและตำแหน่งติดตั้งเซนเซอร์ทุกจุดตามพิกัดจริง ช่วยให้เข้าใจภาพรวมของระบบ Smart Farm ได้ง่ายกว่าการอ่านข้อมูลตัวเลขเพียงอย่างเดียว",
        highlights: [
          "หมุนดูตำแหน่งเซนเซอร์และวาล์วน้ำได้รอบทิศทางแบบ 360 องศา",
          "ใช้เป็นสื่อประกอบการอบรมเกษตรกรและผู้มาศึกษาดูงาน",
        ],
      },
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          📚 โซนเรียนรู้ระบบเกษตรอัจฉริยะ (Smart Farm)
        </h2>
        <p className="text-sm font-normal text-slate-500">
          คลิกที่การ์ดเพื่อเปิดอ่านรายละเอียดเชิงลึกประจำโซน
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelectedCard(card)}
            className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#1B6B3C]/30 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-[#1B6B3C] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {card.icon}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${card.tagBg}`}>
                  {card.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#1B6B3C] transition-colors leading-snug">
                {card.title}
              </h3>
              <p className="text-sm font-normal leading-relaxed text-slate-600">
                {card.desc}
              </p>
            </div>
            <div className="text-xs font-semibold text-[#1B6B3C] flex items-center gap-1 group-hover:gap-2 transition-all pt-2 border-t border-slate-100">
              <span>อ่านรายละเอียดโซนนี้</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full font-bold flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                <span className="text-[#1B6B3C] p-2 bg-slate-50 rounded-2xl border border-slate-100">{selectedCard.icon}</span>
                <div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${selectedCard.tagBg}`}>
                    {selectedCard.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">{selectedCard.title}</h3>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wider text-[#1B6B3C]">📌 ภาพรวมประจำโซน</h4>
                <p className="text-sm font-normal leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700">
                  {selectedCard.detail.overview}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wider text-[#0A2E4D]">💡 ประเด็นสำคัญ</h4>
                <ul className="space-y-2 text-sm font-normal text-slate-700">
                  {selectedCard.detail.highlights.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#1B6B3C] font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="w-full bg-[#1B6B3C] hover:bg-[#14512D] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// --- COMPONENT: Data Visualization ---
function SmartFarmDataVisualization() {
  const [activeTab, setActiveTab] = useState<"moisture" | "weather">("moisture");

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          📊 สถิติและข้อมูลเซนเซอร์แบบเรียลไทม์
        </h2>
        <p className="text-sm font-normal text-slate-500">
          ข้อมูลตัวอย่างจากเซนเซอร์ความชื้นดินและสถานีตรวจวัดสภาพอากาศประจำแปลงสาธิต
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-200/60 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs font-semibold tracking-wider text-[#0369A1] flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" /> จุดติดตั้งเซนเซอร์ทั้งหมด
          </p>
          <h3 className="text-xl font-bold text-slate-800">ครอบคลุม 4 แปลงสาธิต</h3>
          <p className="text-3xl sm:text-4xl font-bold text-[#0369A1] pt-2">
            12 <span className="text-sm font-semibold text-slate-600">จุดติดตั้ง</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/60 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs font-semibold tracking-wider text-[#1B6B3C] flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5" /> ประหยัดปริมาณน้ำได้
          </p>
          <h3 className="text-xl font-bold text-slate-800">เทียบกับรดน้ำตามตารางเวลาเดิม</h3>
          <p className="text-3xl sm:text-4xl font-bold text-[#1B6B3C] pt-2">
            ลดลง 30%
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-200/60 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs font-semibold tracking-wider text-amber-800 flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5" /> ความถี่การส่งข้อมูล
          </p>
          <h3 className="text-xl font-bold text-slate-800">อัปเดตต่อเนื่องตลอดวัน</h3>
          <p className="text-3xl sm:text-4xl font-bold text-amber-700 pt-2">
            ทุก 15 นาที
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">📍 แนวโน้มค่าเซนเซอร์รายชั่วโมง</h3>
          <div className="flex bg-slate-100 p-1 rounded-xl font-semibold text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("moisture")}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "moisture" ? "bg-[#0369A1] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ความชื้นดิน
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("weather")}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "weather" ? "bg-[#1B6B3C] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              อุณหภูมิ/ความชื้นอากาศ
            </button>
          </div>
        </div>

        <div className="h-[320px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "moisture" ? (
              <LineChart data={soilMoistureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none" }}
                />
                <Line type="monotone" dataKey="moisture" stroke="#0369A1" strokeWidth={3} dot={{ r: 4 }} name="ความชื้นดิน (%)" />
              </LineChart>
            ) : (
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none" }}
                />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="อุณหภูมิ (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#1B6B3C" strokeWidth={3} dot={{ r: 4 }} name="ความชื้นอากาศ (%)" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
