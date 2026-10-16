# Mahidol Smart Farm

เว็บ Dashboard สำหรับติดตามสถานะแหล่งข้อมูลฟาร์ม แผนการเชื่อมต่อ IoT, ภาพสำรวจจาก DJI Phantom 4 RGB และ CCTV

## สถานะปัจจุบัน

Dashboard แสดงสถานะความพร้อมตามโค้ดใน repository ไม่สร้างตัวเลขจำลองให้ดูเหมือนเป็นข้อมูลสด

| ส่วน | สถานะ |
| --- | --- |
| Dashboard / Navbar | มีหน้า Dashboard หลักและเมนู responsive สำหรับ desktop/mobile |
| IoT / ความชื้นดิน / สภาพอากาศ | ยังไม่พบ live API หรือ subscription ที่หน้าเว็บอ่านได้ |
| Drone / DJI Phantom 4 RGB | ยังไม่มี workflow อัปโหลดภาพและประมวลผลภาพในหน้าเว็บ |
| CCTV / Supabase | มี migration สำหรับ `cctv_events` และ RLS; frontend ยังไม่ได้อ่านข้อมูล |
| ขอบเขตแปลง | ยังไม่พบข้อมูลแปลงและพิกัดที่เชื่อมกับ Dashboard |

## Routes

- `/` — Smart Farm Dashboard
- `/smart-dashboard` — alias ของ Dashboard
- `/dashboard`, `/survey`, `/login` — legacy URLs จะ redirect กลับหน้า Dashboard

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Lucide React
- Supabase schema migration (CCTV)

## Run locally

ต้องติดตั้ง Node.js รุ่นที่รองรับ Vite ก่อน

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
npm run smoke
```

## แนวทางเชื่อมข้อมูลถัดไป

1. ระบุ endpoint หรือ Supabase table/view ที่เป็นแหล่งข้อมูล IoT พร้อม timestamp และหน่วยวัด
2. เชื่อม CCTV ผ่าน authenticated session และคง RLS; ห้ามใช้ public write หรือเปิดเผย service-role key ใน frontend
3. สร้าง flow นำเข้าภาพ RGB จากโดรน โดยบันทึก flight date, plot ID และ metadata
4. เพิ่ม pipeline สร้าง orthomosaic และหน้าเปรียบเทียบภาพตามช่วงเวลา
5. เพิ่มข้อมูลขอบเขตแปลงและพิกัดเพื่อให้แผนที่แสดงข้อมูลจริง

> หมายเหตุ: หน้านี้เป็น preview ของ UI และสถานะความพร้อม ยังไม่ใช่ระบบติดตามฟาร์มแบบ real-time จนกว่าจะเชื่อมแหล่งข้อมูลจริงและตรวจสอบสิทธิ์ครบถ้วน
