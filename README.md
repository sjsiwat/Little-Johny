# Johny OS Lite

Personal digital workspace แบบประหยัดสำหรับใช้งานเองบนเว็บ static

Live site: https://johny.siwat.me

Phase 1 status: complete

## ฟีเจอร์ในเวอร์ชันแรก

- Redesigned Dashboard พร้อม hero, quick start, demo data และ empty state ที่ชวนเริ่มใช้งาน
- Dashboard สรุปงาน รายจ่าย และโน้ตล่าสุด
- Task management พร้อม priority, due date, done/delete
- Notes พร้อม tags
- Expense tracker พร้อมหมวดหมู่และสรุปกราฟแบบง่าย
- Secretary preview สำหรับลองคำสั่งก่อนต่อ LINE Bot จริง
- Light/Dark theme
- Web app metadata, favicon, manifest และ offline cache เบื้องต้น
- ข้อมูลเก็บใน browser ด้วย `localStorage`

## วิธีเปิดในเครื่อง

เปิดไฟล์ `index.html` ด้วย browser ได้ทันที

หรือถ้าต้องการเปิดผ่าน local server:

```bash
python3 -m http.server 8080
```

แล้วเข้า:

```text
http://localhost:8080
```

## วิธี deploy ฟรีบน Cloudflare Pages

โปรเจกต์นี้ deploy แล้วที่ `johny.siwat.me` ถ้าต้อง deploy ใหม่ให้ใช้ขั้นตอนนี้:

1. สร้าง repository ใหม่บน GitHub แล้วใส่ไฟล์ในโฟลเดอร์นี้
2. เข้า Cloudflare Dashboard
3. ไปที่ Workers & Pages
4. เลือก Create application > Pages > Connect to Git
5. เลือก repository นี้
6. ตั้งค่า build:
   - Framework preset: None
   - Build command: เว้นว่าง
   - Build output directory: `/`
7. Deploy

## ผูกกับโดเมน

แนะนำให้ใช้ subdomain:

```text
johny.siwat.me
```

ใน Cloudflare Pages ให้เข้าโปรเจกต์ > Custom domains > Add custom domain แล้วใส่ `johny.siwat.me`

หลังจากนั้นค่อยเอาลิงก์นี้ไปแปะในเว็บหลัก `https://siwat.me`

## Phase 2 ที่แนะนำ

- ต่อ Supabase เพื่อ sync ข้ามเครื่อง
- เพิ่ม login ส่วนตัว
- ต่อ LINE Messaging API
- เพิ่ม reminder แบบ recurring
- เพิ่ม AI assistant ผ่าน API
- เพิ่ม OCR ใบเสร็จด้วย Tesseract หรือ Google Vision
