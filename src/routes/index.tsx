import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// ข้อมูล 6 ภาพสไลด์แบนเนอร์ (ดึงไฟล์จริง Banner 1.jpg ถึง Banner 6.jpg จากโฟลเดอร์ public)
const HERO_SLIDES = [
  {
    id: 1,
    image: "/Banner 1.jpg",
    badge: "MAHIDOL LAC LEARNING CENTER",
    title: "ห้องเรียนรู้ครั่งครบวงจร",
    subtitle: "งานพันธกิจเพื่อสังคม คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล อ.สบปราบ จ.ลำปาง",
    buttonText: "สำรวจศูนย์เรียนรู้ 3D",
    buttonLink: "#media-section",
  },
  {
    id: 2,
    image: "/Banner 2.jpg",
    badge: "ZONE 01 // THE ORIGIN",
    title: "กำเนิดครั่ง (The Origin)",
    subtitle: "ประวัติศาสตร์ ภูมิปัญญาดั้งเดิม อนุกรมวิธาน และถิ่นกำเนิดแมลงครั่งในเอเชียใต้และตะวันออกเฉียงใต้",
    buttonText: "ศึกษาเรื่องกำเนิดครั่ง",
    buttonLink: "#cards-section",
  },
  {
    id: 3,
    image: "/Banner 3.jpg",
    badge: "ZONE 02 // LIFE CYCLE",
    title: "มหัศจรรย์วงจรชีวิต (The Life Cycle)",
    subtitle: "เรียนรู้ชีววิทยา วงจรชีวิต ตัวอ่อน การขับชันยาง และสรีรวิทยาของแมลงครั่งอย่างครอบคลุม",
    buttonText: "ชมวงจรชีวิตแมลงครั่ง",
    buttonLink: "#cards-section",
  },
  {
    id: 4,
    image: "/Banner 4.jpg",
    badge: "ZONE 03 // THE HABITATS",
    title: "พืชอาศัยและนิเวศวิทยา (The Habitats)",
    subtitle: "พืชอาศัยที่เหมาะแก่การเพาะเลี้ยง เช่น ต้นจามจุรี (ก้ามปู) ต้นปลัก สีเสียด พร้อมการกักเก็บคาร์บอน",
    buttonText: "ดูข้อมูลพืชอาศัย",
    buttonLink: "#cards-section",
  },
  {
    id: 5,
    image: "/Banner 5.jpg",
    badge: "ZONE 04 // CULTIVATION",
    title: "การเพาะเลี้ยงและการจัดการ",
    subtitle: "รอบปฏิทินฤดูกาล (ฤดูร้อน/ฤดูฝน) เทคนิคการคัดแม่พันธุ์ การคุมศัตรูครั่ง และการเก็บเกี่ยวอย่างมีประสิทธิภาพ",
    buttonText: "ดูคู่มือการเพาะเลี้ยง",
    buttonLink: "#cards-section",
  },
  {
    id: 6,
    image: "/Banner 6.jpg",
    badge: "ZONE 05 // PRODUCT INNOVATION",
    title: "ครั่ง สู่ นวัตกรรมการผลิต",
    subtitle: "การแปรรูปครั่งดิบสู่ครั่งเมล็ด เชลแลกเกรดอุตสาหกรรม สีย้อมผ้าธรรมชาติ และสารเคลือบผิวระดับสูง",
    buttonText: "ชมนวัตกรรมแปรรูปครั่ง",
    buttonLink: "#cards-section",
  },
];

export function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"video" | "3d">("video");
  const [currentSlide, setCurrentSlide] = useState(0);

  // ตั้งเวลาเปลี่ยนภาพสไลด์อัตโนมัติทุกๆ 5 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // โหลดสคริปต์ตัวเล่น 3D Model Viewer จาก Google อัตโนมัติ
  useEffect(() => {
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
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
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 font-['Mitr'] selection:bg-[#801818] selection:text-white flex flex-col justify-between">
      
      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-50 bg-[#0A2E4D] text-white shadow-md border-b-2 border-[#801818]">
        <nav className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5">
          <div className="flex items-center justify-between gap-4">
            
            {/* ฝั่งซ้าย: โลโก้ 3 ตัว + เส้นแบ่ง + ข้อความ */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-lg h-9 sm:h-11 flex items-center justify-center shrink-0 shadow-sm">
                  <img 
                    src="/envi-logo.jpg" 
                    alt="Envi Mahidol Logo" 
                    className="h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerText = '🌍 Envi';
                    }}
                  />
                </div>

                <div className="bg-white p-1 rounded-lg h-9 sm:h-11 flex items-center justify-center shrink-0 shadow-sm">
                  <img 
                    src="/mahidol-logo.png" 
                    alt="Mahidol University Logo" 
                    className="h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerText = '🏛️ Mahidol';
                    }}
                  />
                </div>

                <div className="bg-white p-1 rounded-lg h-9 sm:h-11 flex items-center justify-center shrink-0 shadow-sm">
                  <img 
                    src="/social-engagement-logo.png" 
                    alt="Social Engagement Logo" 
                    className="h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerText = '🤝 Social';
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
        <section className="relative w-full h-[460px] sm:h-[500px] lg:h-[540px] overflow-hidden bg-[#500A0A]">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* ภาพพื้นหลังสไลด์ */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 transform scale-105"
                style={{ backgroundImage: `url('${encodeURI(slide.image)}')` }}
              >
                {/* Gradient Overlay สีแดงครั่ง #801818 */}
                <div className="absolute inset-0 bg-[#701414]/55 bg-gradient-to-t from-[#500A0A] via-[#801818]/60 to-black/40" />
              </div>

              {/* ข้อความกลางสไลด์ */}
              <div className="relative z-20 max-w-5xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-center items-center text-center text-white space-y-4">
                <span className="bg-white/15 backdrop-blur-md text-[#F5B800] text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F5B800] animate-pulse"></span>
                  {slide.badge}
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-md leading-tight max-w-4xl">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-lg text-rose-100/95 max-w-2xl font-light leading-relaxed drop-shadow">
                  {slide.subtitle}
                </p>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      const id = slide.buttonLink.replace("#", "");
                      scrollToSection(id);
                    }}
                    className="bg-[#801818] border border-rose-300/40 hover:bg-[#600C0C] text-white font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>{slide.buttonText}</span>
                    <span className="text-[#F5B800] font-bold">›</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* ปุ่มสไลด์ย้อนกลับ (ซ้าย) */}
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Previous Slide"
          >
            ‹
          </button>

          {/* ปุ่มสไลด์ถัดไป (ขวา) */}
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Next Slide"
          >
            ›
          </button>

          {/* แถบจุดเปลี่ยนสไลด์ 6 แบนเนอร์ (ด้านล่าง) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? "w-8 bg-[#801818] border border-rose-400" : "w-2.5 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ==================== MEDIA SECTION: VIDEO & 3D SKETCHUP VIEW ==================== */}
        <section id="media-section" className="py-12 px-4 max-w-5xl mx-auto scroll-mt-24">
          <div className="bg-white border border-slate-200/80 p-5 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 space-y-6">
            
            {/* ส่วนสลับแท็บ (Video VS 3D View) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
                  {activeMediaTab === "video" ? "🎬 วิดีโอแนะนำห้องการเรียนรู้" : "🧊 โมเดล 3D อาคารเรียนรู้ (SketchUp)"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  {activeMediaTab === "video" 
                    ? "รับชมบรรยากาศและบทเรียนการเพาะเลี้ยงครั่งอย่างถูกต้อง" 
                    : "สำรวจโครงสร้างอาคารเรียนรู้ครั่ง 360 องศาด้วยโมเดล 3D"}
                </p>
              </div>

              {/* ปุ่มเลือกสลับสื่อ */}
              <div className="flex bg-slate-100 p-1 rounded-xl font-semibold text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("video")}
                  className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMediaTab === "video" ? "bg-[#0A2E4D] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🎬</span> วิดีโอแนะนำ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("3d")}
                  className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMediaTab === "3d" ? "bg-[#801818] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🧊</span> โมเดล 3D SketchUp
                </button>
              </div>
            </div>

            {/* แสดงผลสื่อตามแท็บที่เลือก */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner">
              {activeMediaTab === "video" ? (
                /* TAB 1: วิดีโอ */
                <video className="w-full h-full object-cover" controls playsInline preload="metadata">
                  <source src="/intro-lac.mp4" type="video/mp4" />
                </video>
              ) : (
                /* TAB 2: โมเดล 3D (ดึงไฟล์ rac-room3d.glb ในโฟลเดอร์ public) */
                <div className="w-full h-full relative bg-slate-100 flex flex-col items-center justify-center">
                  <model-viewer
                    src="/rac-room3d.glb"
                    alt="โมเดล 3D อาคารเรียนรู้ครั่ง"
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    style={{ width: "100%", height: "100%" }}
                  ></model-viewer>

                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-normal px-3 py-1.5 rounded-lg border border-white/20 pointer-events-none flex items-center gap-1.5 shadow-md">
                    <span>🖱️</span> คลิกและลากเพื่อหมุนดูโมเดล 3D แบบ 360°
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Cards Grid Section */}
        <div id="cards-section" className="scroll-mt-24">
          <LacKnowledgeCards />
        </div>

        {/* Data Viz Section */}
        <div id="data-viz" className="scroll-mt-24">
          <LacDataVisualization />
        </div>

        {/* Accordion Section */}
        <LacKnowledgeAccordion />
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

// --- COMPONENT: Cards Grid (5 โซนหลัก) ---
function LacKnowledgeCards() {
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  const cards = [
    {
      id: 1,
      icon: "📜",
      title: "กำเนิดครั่ง (The Origin)",
      desc: "ประวัติศาสตร์ สารชันสีแดงธรรมชาติ ภูมิปัญญา และกำเนิดแมลงครั่งในอนุกรมวิธาน",
      tag: "โซน 1 • ประวัติศาสตร์",
      tagBg: "bg-amber-100 text-amber-800 border-amber-200",
      detail: {
        overview: "ครั่ง คือ สารชันธรรมชาติที่ขับออกมาจากตัวแมลงครั่งเพื่อสร้างเป็นรังห่อหุ้มลำตัว มีประวัติยาวนานในงานภูมิปัญญาไทยและเอเชียใต้",
        highlights: [
          "สารธรรมชาติ 100% ที่ปลอดภัยและย่อยสลายได้ง่าย",
          "ภูมิปัญญาดั้งเดิมในงานช่างสิบหมู่ ยารักษาโรค และงานสีย้อม",
        ],
      },
    },
    {
      id: 2,
      icon: "🐞",
      title: "มหัศจรรย์วงจรชีวิต (Life Cycle)",
      desc: "สรีรวิทยาแมลงครั่ง ระยะตัวอ่อน การลอกคราบ การเกาะกิ่ง และการสร้างรังชัน",
      tag: "โซน 2 • ชีววิทยา",
      tagBg: "bg-rose-100 text-rose-800 border-rose-200",
      detail: {
        overview: "แมลงครั่งมีวงจรชีวิตที่น่าทึ่ง ตัวอ่อนจะคลานออกจากรังแม่ไปเกาะกิ่งอ่อนเพื่อดูดกินน้ำเลี้ยงและขับชันห่อหุ้มตัว",
        highlights: [
          "การขับชันยางเพื่อปกป้องตนเองและขยายพันธุ์",
          "วงจรชีวิต 2 รอบต่อปีที่สัมพันธ์กับสภาพอากาศ",
        ],
      },
    },
    {
      id: 3,
      icon: "🌳",
      title: "พืชอาศัยและนิเวศวิทยา (Habitats)",
      desc: "ต้นไม้อาศัยที่เหมาะสม เช่น จามจุรี ปลัก สีเสียด พร้อมระบบกักเก็บคาร์บอน",
      tag: "โซน 3 • นิเวศวิทยา",
      tagBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      detail: {
        overview: "แมลงครั่งอาศัยกิ่งของต้นไม้เฉพาะชนิดเพื่อดูดกินน้ำเลี้ยง พืชอาศัยที่ดีต้องมีทรงพุ่มโปร่งและกิ่งอ่อนสมบูรณ์",
        highlights: [
          "ต้นจามจุรี (ก้ามปู): โตไว ให้ผลผลิตครั่งสูงที่สุด",
          "ต้นปลัก/สีเสียด: ทนทานสภาพอากาศแห้งแล้งได้ดีเยี่ยม",
        ],
      },
    },
    {
      id: 4,
      icon: "📅",
      title: "การเพาะเลี้ยงและการจัดการ",
      desc: "รอบปฏิทินฤดูกาล (รอบร้อน/ฝน) เทคนิคการคัดแม่พันธุ์ และการดูแลป้องกันศัตรูครั่ง",
      tag: "โซน 4 • การเพาะเลี้ยง",
      tagBg: "bg-sky-100 text-sky-800 border-sky-200",
      detail: {
        overview: "การเลี้ยงครั่งแบ่งเป็น 2 รอบตามฤดูกาล การจัดการที่ดีช่วยลดอัตราการสูญเสียจากศัตรูพืช",
        highlights: [
          "รอบฤดูร้อน: ปล่อยพันธุ์ พ.ย.-ธ.ค. เก็บเกี่ยว พ.ค.-มิ.ย.",
          "รอบฤดูฝน: ปล่อยพันธุ์ พ.ค.-มิ.ย. เก็บเกี่ยว พ.ย.-ธ.ค.",
        ],
      },
    },
    {
      id: 5,
      icon: "🧪",
      title: "ครั่ง สู่ นวัตกรรมการผลิต",
      desc: "การแปรรูปสู่ครั่งเมล็ด เชลแลก สีย้อมผ้า สารเคลือบผิวผลไม้/ยา และน้ำล้างครั่ง",
      tag: "โซน 5 • นวัตกรรม",
      tagBg: "bg-purple-100 text-purple-800 border-purple-200",
      detail: {
        overview: "ครั่งดิบถูกนำไปแกะ บด ล้าง สกัดแยกสี เพื่อส่งต่อเข้าสู่อุตสาหกรรมมูลค่าสูง",
        highlights: [
          "เชลแลก (Shellac): เคลือบเงาไม้ และเคลือบเม็ดยา/อาหาร",
          "สีสกัดครั่ง: สีย้อมธรรมชาติปลอดภัยสำหรับสิ่งทอ",
        ],
      },
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          📚 โซนเรียนรู้และองค์ความรู้เรื่องครั่ง
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
            className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#801818]/30 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-3xl w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {card.icon}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${card.tagBg}`}>
                  {card.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#801818] transition-colors leading-snug">
                {card.title}
              </h3>
              <p className="text-sm font-normal leading-relaxed text-slate-600">
                {card.desc}
              </p>
            </div>
            <div className="text-xs font-semibold text-[#801818] flex items-center gap-1 group-hover:gap-2 transition-all pt-2 border-t border-slate-100">
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
                <span className="text-4xl p-2 bg-slate-50 rounded-2xl border border-slate-100">{selectedCard.icon}</span>
                <div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${selectedCard.tagBg}`}>
                    {selectedCard.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">{selectedCard.title}</h3>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wider text-[#801818]">📌 ภาพรวมประจำโซน</h4>
                <p className="text-sm font-normal leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700">
                  {selectedCard.detail.overview}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wider text-[#2D5A27]">💡 ประเด็นสำคัญ</h4>
                <ul className="space-y-2 text-sm font-normal text-slate-700">
                  {selectedCard.detail.highlights.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#801818] font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="w-full bg-[#801818] hover:bg-[#600C0C] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer shadow-sm"
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
function LacDataVisualization() {
  const [activeTab, setActiveTab] = useState<"farmers" | "efficiency">("farmers");

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          📊 สถิติและข้อมูลการผลิต จ.ลำปาง
        </h2>
        <p className="text-sm font-normal text-slate-500">
          ข้อมูลเชิงสถิติจำนวนผู้ผลิตและพื้นที่ศักยภาพในจังหวัดลำปาง
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-200/60 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs font-semibold tracking-wider text-[#801818]">ศูนย์กลางการผลิตใหญ่สุด</p>
          <h3 className="text-xl font-bold text-slate-800">อ.งาว (บ้านบ่อสี่เหลี่ยม)</h3>
          <p className="text-3xl sm:text-4xl font-bold text-[#801818] pt-2">
            300,000 <span className="text-sm font-semibold text-slate-600">กก./ปี</span>
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/60 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs font-semibold tracking-wider text-[#2D5A27]">ประสิทธิภาพสูงสุด</p>
          <h3 className="text-xl font-bold text-slate-800">อ.สบปราบ</h3>
          <p className="text-3xl sm:text-4xl font-bold text-[#2D5A27] pt-2">
            อันดับ 1
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-200/60 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs font-semibold tracking-wider text-amber-800">พืชอาศัยยอดนิยม</p>
          <h3 className="text-xl font-bold text-slate-800">ต้นจามจุรี (ก้ามปู)</h3>
          <p className="text-3xl sm:text-4xl font-bold text-amber-700 pt-2">
            TOP 1
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">📍 อันดับพื้นที่การผลิต จ.ลำปาง</h3>
          <div className="flex bg-slate-100 p-1 rounded-xl font-semibold text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("farmers")}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "farmers" ? "bg-[#801818] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ผู้เลี้ยงมากสุด
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("efficiency")}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "efficiency" ? "bg-[#2D5A27] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ประสิทธิภาพสูงสุด
            </button>
          </div>
        </div>

        <div className="space-y-3 font-semibold text-sm">
          {activeTab === "farmers" ? (
            <>
              <div className="p-4 bg-rose-50/70 border border-rose-200/70 rounded-2xl flex justify-between items-center text-slate-800">
                <span className="font-bold">🥇 อันดับ 1: อ.วังเหนือ</span>
                <span className="bg-[#801818] text-white px-3 py-1 rounded-full text-xs font-medium">เกษตรกรมากที่สุด</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-slate-700">
                <span>🥈 อันดับ 2: อ.แจ้ห่ม</span>
                <span className="text-xs font-normal text-slate-500">พื้นที่ยุทธศาสตร์</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-slate-700">
                <span>🥉 อันดับ 3: อ.เมืองปาน</span>
                <span className="text-xs font-normal text-slate-500">พื้นที่ยุทธศาสตร์</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex justify-between items-center text-slate-800">
                <span className="font-bold">🥇 อันดับ 1: อ.สบปราบ</span>
                <span className="bg-[#2D5A27] text-white px-3 py-1 rounded-full text-xs font-medium">ผลผลิต/กก.พันธุ์ สูงสุด</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-slate-700">
                <span>🥈 อันดับ 2: อ.เสริมงาม</span>
                <span className="text-xs font-normal text-slate-500">อัตราการรอดสูง</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-slate-700">
                <span>🥉 อันดับ 3: อ.ห้างฉัตร</span>
                <span className="text-xs font-normal text-slate-500">อัตราการรอดสูง</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// --- COMPONENT: Accordion ---
function LacKnowledgeAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const accordions = [
    {
      title: "🗓️ ปฏิทินและเทคนิคการเพาะเลี้ยงครั่ง",
      content: "รอบฤดูร้อน (ปล่อย พ.ย.-ธ.ค. / เก็บ พ.ค.-มิ.ย.) และรอบฤดูฝน (ปล่อย พ.ค.-มิ.ย. / เก็บ พ.ย.-ธ.ค.)",
    },
    {
      title: "🌿 รายชื่อพืชอาศัยยอดนิยม",
      content: "ต้นจามจุรี (ก้ามปู), ต้นปลัก, ต้นสีเสียด, กระถินเทพา, ต้นลำไย ฯลฯ",
    },
    {
      title: "🏭 ผลิตภัณฑ์และการแปรรูปจากครั่ง",
      content: "เชลแลกทาเงาไม้, สีสกัดย้อมผ้าธรรมชาติ, สารเคลือบเม็ดยา/ผลไม้ และน้ำล้างครั่งบำรุงดิน",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-6">
        ❓ เจาะลึกรายละเอียด (FAQ)
      </h2>

      <div className="space-y-3">
        {accordions.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="bg-white border border-[#801818]/20 rounded-2xl overflow-hidden shadow-sm hover:border-[#801818]/40 transition-colors">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center p-4 sm:p-5 font-semibold text-slate-800 text-left cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-base sm:text-lg">{item.title}</span>
                <span className="text-xl font-medium text-slate-400">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 text-slate-700 text-sm leading-relaxed">
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
