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





## NOTED อ่านศึกษาก่อนทำ  ##

# PROJECT: JOHNY OS

## Personal Digital Workspace + AI Assistant + LINE Secretary

Version 1.0

---

# 1. PROJECT VISION

สร้างระบบ Web Application ที่ทำหน้าที่เป็น

"พื้นที่ทำงานดิจิทัลส่วนตัว"

(Personal Digital Workspace)

ที่รวมความสามารถของ

* Todo List
* Planner
* Calendar
* Notes
* Reminder
* File Tools
* Expense Tracker
* AI Assistant
* LINE Secretary

ไว้ในระบบเดียว

โดยผู้ใช้งานสามารถจัดการชีวิต งาน เป้าหมาย ความคิด เอกสาร และการเงินส่วนตัว ผ่านทั้ง Web App และ LINE Bot

ระบบต้องรองรับการขยายเป็น

* Progressive Web App (PWA)
* Mobile App
* SaaS Platform

ในอนาคต

---

# 2. CORE CONCEPT

ระบบนี้ไม่ใช่เพียง To-do App

แต่เป็น

"Digital Second Brain"

และ

"Personal Operating System"

ที่ช่วยผู้ใช้งาน

* คิด
* จดจำ
* วางแผน
* ติดตามงาน
* วิเคราะห์รายจ่าย
* จัดเก็บความรู้
* แจ้งเตือนเรื่องสำคัญ

เสมือนมีเลขาส่วนตัวทำงานตลอด 24 ชั่วโมง

---

# 3. DESIGN PRINCIPLES

## UI Style

Modern Digital Workspace

* Modern
* Premium
* Minimal
* Clean
* Productivity Focused

---

## Color Theme

อ้างอิง Pantone Color Trend Top 10 ปี 2026

รองรับ

* Light Mode
* Dark Mode

---

## Animation

Background Animation

ประกอบด้วย

* Parallax Scrolling
* Floating Elements
* Glassmorphism Effects
* Smooth Motion
* Interactive Transitions

ต้องลื่นไหลและไม่กินทรัพยากรเครื่องมากเกินไป

---

## Responsive Design

รองรับ

* Desktop
* Tablet
* Mobile

---

# 4. MAIN MODULES

## MODULE A : Dashboard

หน้า Overview

แสดงข้อมูลสรุปทั้งหมด

ประกอบด้วย

* งานทั้งหมด
* งานที่เสร็จแล้ว
* งานค้าง
* งานสำคัญ
* เป้าหมาย
* รายจ่ายเดือนนี้
* กิจกรรมล่าสุด
* สถิติการใช้งาน

---

## MODULE B : Task Management

สามารถ

* เพิ่มงาน
* แก้ไขงาน
* ลบงาน
* ติดดาวงาน
* ตั้งเวลา
* ตั้งวันครบกำหนด
* ตั้งลำดับความสำคัญ

Priority

* Low
* Medium
* High
* Critical

Status

* Pending
* In Progress
* Completed

รองรับ

* Drag & Drop
* Sorting
* Filtering

---

## MODULE C : Planner

รองรับการวางแผน

* รายวัน
* รายสัปดาห์
* รายเดือน
* รายปี

สามารถจัดลำดับงานได้

---

## MODULE D : Calendar

รองรับ

* Day View
* Week View
* Month View

เชื่อมโยงกับ Tasks และ Reminders

---

## MODULE E : Notes

ใช้เก็บ

* ความคิด
* ไอเดีย
* ความรู้
* บันทึกส่วนตัว

รองรับ

* Rich Text
* Markdown

มีระบบ

* Tag
* Folder
* Search

---

## MODULE F : Reminder

แจ้งเตือนผ่าน

* Browser Notification
* Email
* LINE Bot

รองรับ

* One Time Reminder
* Recurring Reminder

---

## MODULE G : Personal Workspace

ผู้ใช้สามารถปรับแต่ง

* Theme
* Layout
* Widgets
* Dashboard
* Colors

ได้เอง

---

# 5. EXPENSE TRACKING SYSTEM

## เป้าหมาย

ให้ระบบสามารถทำบัญชีรายรับรายจ่ายแบบอัตโนมัติ

---

## การเพิ่มข้อมูล

รองรับ

* ถ่ายรูปใบเสร็จ
* อัปโหลดบิล
* PDF
* พิมพ์ข้อความ
* ส่งผ่าน LINE

---

## OCR Processing

ระบบจะ

1. อ่านข้อมูลจากภาพ
2. ดึงข้อความ
3. วิเคราะห์รายการ
4. แยกยอดเงิน
5. ระบุวันที่
6. จัดหมวดหมู่

อัตโนมัติ

---

## Expense Categories

* อาหาร
* เครื่องดื่ม
* เดินทาง
* น้ำมัน
* ค่าไฟ
* ค่าน้ำ
* อินเทอร์เน็ต
* สุขภาพ
* ช้อปปิ้ง
* การศึกษา
* ลงทุน
* อื่นๆ

---

## Dashboard

แสดง

* รายวัน
* รายสัปดาห์
* รายเดือน
* รายปี

กราฟ

* Pie Chart
* Bar Chart
* Trend Chart

---

## Export

รองรับ

* CSV
* Excel
* PDF

---

# 6. FILE CONVERSION CENTER

## Document Converter

รองรับ

* Word → PDF
* PDF → Word

---

## Image Converter

รองรับ

* JPG → PNG
* PNG → JPG
* JPEG → PNG
* PNG → JPEG

---

## Resize Image

ก่อนแปลง

ผู้ใช้สามารถกำหนด

* Width
* Height

ได้เอง

---

## Upload Limitation

ไฟล์ไม่เกิน

30 MB ต่อไฟล์

---

## File Retention Policy

ไฟล์อัปโหลดจะถูกเก็บ

ไม่เกิน 24 ชั่วโมง

จากนั้นระบบจะลบอัตโนมัติ

---

# 7. LINE SECRETARY SYSTEM

## เป้าหมาย

ให้ LINE Bot เป็นเลขาส่วนตัว

ที่สามารถเข้าถึงข้อมูลของผู้ใช้ตามสิทธิ์

---

## เพิ่ม Task ผ่าน LINE

ตัวอย่าง

เพิ่มงาน เรียน JavaScript พรุ่งนี้ 19:00

---

## เพิ่ม Note ผ่าน LINE

ตัวอย่าง

โน้ต:
ซื้อจอคอม

---

## บันทึกค่าใช้จ่ายผ่าน LINE

ส่ง

* รูปใบเสร็จ
* รูปบิล
* PDF

ระบบจะวิเคราะห์และบันทึกอัตโนมัติ

---

## เรียกดูข้อมูลผ่าน LINE

ตัวอย่าง

วันนี้มีงานอะไร

สรุปรายจ่ายเดือนนี้

งานสำคัญทั้งหมด

โน้ตเกี่ยวกับ AWS

งานค้างทั้งหมด

---

## แจ้งเตือนผ่าน LINE

ตัวอย่าง

* งานใกล้ครบกำหนด
* ค่าใช้จ่ายเกินงบ
* บิลใกล้ถึงกำหนด
* เป้าหมายรายเดือน

---

# 8. AI ASSISTANT

AI สามารถเข้าถึงข้อมูลในระบบเพื่อช่วยผู้ใช้งาน

ตัวอย่าง

วันนี้ฉันต้องทำอะไร

งานไหนสำคัญที่สุด

สรุปรายจ่ายเดือนนี้

ค่าใช้จ่ายหมวดอาหาร

มีบิลอะไรต้องจ่าย

เป้าหมายปีนี้คืออะไร

---

## AI Analysis

วิเคราะห์

* งานค้าง
* พฤติกรรมการใช้เงิน
* แนวโน้มค่าใช้จ่าย
* Productivity Trends

---

## Weekly Review

ทุกวันอาทิตย์

AI ส่งสรุป

* งานที่ทำเสร็จ
* งานค้าง
* รายจ่าย
* เป้าหมายสัปดาห์หน้า

---

# 9. SECURITY

ระบบต้องออกแบบโดยยึดหลัก Privacy First

---

## Authentication

รองรับ

* Email Login
* Google Login
* LINE Login

---

## Security

* HTTPS Only
* JWT Authentication
* Encryption at Rest
* Encryption in Transit
* Role Based Access Control
* Audit Logs

---

## User Data

ข้อมูลทุกอย่างเป็นของผู้ใช้

ไม่มีการแชร์ข้อมูลระหว่างบัญชี

---

# 10. TECH STACK (RECOMMENDED)

Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

Backend

* Supabase

Database

* PostgreSQL

Storage

* Supabase Storage

Authentication

* Supabase Auth

Notification

* LINE Messaging API

Charts

* Recharts

OCR

* Google Vision API
  หรือ
* Tesseract OCR

AI Layer

* OpenAI API

Hosting

* Cloudflare

---

# 11. ARCHITECTURE RULES

AI Developer ต้องปฏิบัติตาม

1. ห้ามเขียนโค้ดซ้ำซ้อน
2. ใช้ Modular Architecture
3. Component Reusable
4. Separation of Concerns
5. Clean Code
6. Comment สำคัญทุกส่วน
7. Folder Structure ชัดเจน
8. Responsive ทุกหน้า
9. Mobile First Design
10. ทุกฟีเจอร์ต้องตรวจสอบโค้ดซ้ำก่อนสร้างฟีเจอร์ใหม่

---

# 12. DEVELOPMENT WORKFLOW

ก่อนเริ่มเขียนโค้ด

AI ต้องส่ง

1. System Architecture
2. Database Design
3. ER Diagram
4. API Design
5. Folder Structure
6. UI Flow
7. Wireframe
8. Tech Stack Justification

ให้ผู้ใช้งานอนุมัติก่อน

ห้ามเริ่มเขียนโค้ดทันที

หาก Requirement ส่วนใดไม่ชัดเจน ต้องถามผู้ใช้งานก่อนทุกครั้ง

---

# 13. PROJECT GOAL

สร้างระบบที่รวมความสามารถของ

* Notion
* Todoist
* Google Calendar
* Google Keep
* Expense Tracker
* LINE Bot
* AI Assistant

ไว้ในแพลตฟอร์มเดียว

เพื่อให้เป็น

"Personal Operating System"

และ

"Digital Second Brain"

สำหรับการใช้งานระยะยาว
