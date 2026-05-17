# 🧪 Nexworth v3.2.0: Master Test Case Document

**Document Version:** 1.0
**Target Environment:** Staging (`stg_nexworth_db`)
**Status:** Ready for Execution

เอกสารนี้รวบรวม Test Cases สำหรับฟีเจอร์หลักในเวอร์ชัน 3.2.0 อ้างอิงจาก Business Requirement (BA) และ System Architecture (SA) โดยออกแบบให้ครอบคลุมทั้ง Positive, Negative และ Edge Cases ระดับนำไปใช้งานจริงได้ทันที

---

## 1. Feature: Cashflow Health Indicator

**Description:** ระบบวิเคราะห์สภาพคล่องทางการเงินแบบ Real-time บน Dashboard

| Test Case ID | TC-CASH-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการแสดงผลสถานะ "Danger" (ระดับอันตราย) |
| **Pre-conditions** | 1. User เข้าสู่ระบบสำเร็จ<br>2. ตั้งค่า `minThreshold = 30000`, `maxThreshold = 70000`<br>3. ยอดรวมบัญชีประเภท `CASH`, `SAVINGS`, `CURRENT` มีค่าน้อยกว่าหรือเท่ากับ 30,000 |
| **Test Steps** | 1. ไปที่หน้า Dashboard<br>2. สังเกตที่ Widget Cashflow Health |
| **Expected Result** | 1. Widget แสดงสถานะ "DANGER"<br>2. สีของ Widget เปลี่ยนเป็นสีแดง (Rose)<br>3. มี Effect การกระพริบ (Pulsing effect) ที่ Widget |

| Test Case ID | TC-CASH-002 |
| :--- | :--- |
| **Title** | ตรวจสอบการตั้งค่า Threshold ที่ไม่ถูกต้อง (Negative Case) |
| **Pre-conditions** | User เข้าสู่ระบบและเปิด Modal ตั้งค่า Liquidity Settings |
| **Test Steps** | 1. ปรับค่า Min Threshold ให้มีค่า **มากกว่าหรือเท่ากับ** Max Threshold (เช่น Min = 50,000, Max = 40,000)<br>2. กดปุ่มบันทึก (Save) |
| **Expected Result** | 1. ระบบ API ปฏิเสธการบันทึกข้อมูล (Validation Error)<br>2. หน้าจอแสดงข้อความแจ้งเตือน "Min Threshold ต้องมีค่าน้อยกว่า Max Threshold" |

| Test Case ID | TC-CASH-003 |
| :--- | :--- |
| **Title** | ตรวจสอบประเภทบัญชีที่นำมาคำนวณ (Business Logic) |
| **Pre-conditions** | 1. User มีบัญชี `CASH` = 10,000<br>2. User มีบัญชี `SAVINGS` = 20,000<br>3. User มีบัญชี `CREDIT` (บัตรเครดิต) = 50,000 |
| **Test Steps** | 1. รีเฟรชหน้า Dashboard (รอให้ Cache 5 นาทีหมดอายุ หากเพิ่งอัปเดตข้อมูล)<br>2. ตรวจสอบยอด Total Balance ที่นำมาคำนวณ Cashflow Health |
| **Expected Result** | ยอดรวมที่แสดงจะต้องเท่ากับ 30,000 เท่านั้น (ไม่นำยอดของบัตรเครดิตมาคำนวณ) |

---

## 2. Feature: AI Slip Scanning

**Description:** ระบบดึงข้อมูลจากรูปภาพสลิปโอนเงินอัตโนมัติ

| Test Case ID | TC-SCAN-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการสแกนสลิปโอนเงินสำเร็จ (Positive Case) |
| **Pre-conditions** | 1. เข้าสู่ระบบและเปิดหน้า Transaction Modal<br>2. เตรียมไฟล์ภาพสลิปโอนเงินที่ชัดเจน (JPG, PNG, หรือ WebP) |
| **Test Steps** | 1. อัปโหลดไฟล์สลิปผ่านระบบ Multipart Upload<br>2. รอระบบประมวลผล |
| **Expected Result** | 1. ระบบ Auto-fill ข้อมูลลงในฟอร์ม: ยอดเงิน (Amount), วันที่ (Date), และเลขที่อ้างอิง (Ref No.)<br>2. ค่าปี ค.ศ. (Date) ต้องถูกแปลงจาก พ.ศ. เป็น ค.ศ. ถูกต้อง |

| Test Case ID | TC-SCAN-002 |
| :--- | :--- |
| **Title** | ตรวจสอบกรณีรูปภาพไม่ถูกต้องหรือไม่ใช่สลิป (Negative Case) |
| **Pre-conditions** | เข้าสู่ระบบและเปิดหน้า Transaction Modal |
| **Test Steps** | 1. อัปโหลดไฟล์ภาพที่ **ไม่ใช่สลิปโอนเงิน** (เช่น รูปวิว, รูปใบเสร็จทั่วไป)<br>2. รอระบบประมวลผล |
| **Expected Result** | 1. ระบบแสดง Error Message อย่างชัดเจน (เช่น "ไม่สามารถอ่านข้อมูลจากรูปภาพได้")<br>2. เช็คที่ DB `SystemLog` ต้องมีการบันทึก Error 500 (Invalid Image) พร้อม Tag `ai-engine` |

| Test Case ID | TC-SCAN-003 |
| :--- | :--- |
| **Title** | ตรวจสอบกรณี Quota ของ AI เต็ม (Edge Case) |
| **Pre-conditions** | จำลองสถานการณ์ให้ API ของ Gemini ส่ง Error 429 (Too Many Requests) กลับมา |
| **Test Steps** | 1. อัปโหลดไฟล์สลิป<br>2. สังเกตการแจ้งเตือน |
| **Expected Result** | 1. ระบบจัดการ Error (Resilient Error Handling) โดยแสดงข้อความแจ้งเตือนที่เป็นมิตรกับผู้ใช้ (เช่น "ระบบประมวลผลสลิปเต็มชั่วคราว กรุณากรอกข้อมูลด้วยตนเอง")<br>2. มีการบันทึกลง `SystemLog` ว่าเกิด Error 429 |

---

## 3. Feature: Forgot Password Flow

**Description:** ระบบรีเซ็ตรหัสผ่านด้วยตนเองผ่านอีเมล

| Test Case ID | TC-AUTH-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการป้องกัน Email Enumeration (Security Case) |
| **Pre-conditions** | อยู่ที่หน้า Login และคลิก "FORGOT PASSWORD?" |
| **Test Steps** | 1. กรอก Email ที่ **ไม่มี** อยู่ในระบบฐานข้อมูล<br>2. กดส่งข้อมูล |
| **Expected Result** | 1. ระบบต้อง **ไม่แสดง** ข้อความ "ไม่พบอีเมลนี้ในระบบ"<br>2. ระบบแสดงข้อความสำเร็จแบบคลุมเครือ "หากมีอีเมลนี้ในระบบ เราได้ส่งลิงก์รีเซ็ตไปให้แล้ว"<br>3. ตรวจสอบที่ API Response ต้องคืนค่า HTTP 200 OK |

| Test Case ID | TC-AUTH-002 |
| :--- | :--- |
| **Title** | ตรวจสอบการหมดอายุของ Token (15 นาที) |
| **Pre-conditions** | 1. สร้างคำขอ Reset Password เพื่อรับ Token สำเร็จ<br>2. เข้าไปแก้ไข `expiresAt` ในตาราง `PasswordReset` ให้เป็นอดีต (หมดอายุแล้ว) |
| **Test Steps** | 1. เข้าใช้งาน URL `/reset-password?token=xxxxxx` |
| **Expected Result** | 1. ระบบปฏิเสธการเข้าถึง (HTTP 400)<br>2. แสดงหน้า Error แจ้งเตือนว่า "ลิงก์หมดอายุ กรุณาทำรายการใหม่" |

| Test Case ID | TC-AUTH-003 |
| :--- | :--- |
| **Title** | ตรวจสอบการรีเซ็ตรหัสผ่านสำเร็จและ One-time Use |
| **Pre-conditions** | User ได้รับลิงก์รีเซ็ตที่ถูกต้องและยังไม่หมดอายุ |
| **Test Steps** | 1. เปิดลิงก์จากอีเมล<br>2. กรอกรหัสผ่านใหม่ (New Password) และ ยืนยันรหัสผ่าน (Confirm Password) ให้ตรงกัน<br>3. กด Submit<br>4. ลองเปิดลิงก์เดิมซ้ำอีกครั้ง |
| **Expected Result** | **ครั้งแรก (ข้อ 3):**<br>1. ระบบพากลับไปหน้า Login พร้อมข้อความ "รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว"<br>2. ตาราง `PasswordReset` มีการอัปเดต `used = true`<br>3. ระบบสร้าง Audit Log บันทึกการเปลี่ยนรหัสผ่าน<br>**ครั้งที่สอง (ข้อ 4):**<br>1. ระบบต้องปฏิเสธการใช้งานและขึ้นแจ้งเตือน "ลิงก์นี้ถูกใช้งานไปแล้ว" (ป้องกัน Replay Attack) |

---

## 4. Feature: Core Asset & Transaction Rules

**Description:** กฎการจัดทำบัญชีสินทรัพย์/หนี้สิน และบันทึกธุรกรรมทางการเงิน (Phase 1-16)

| Test Case ID | TC-CORE-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการสร้างบัญชีสินทรัพย์สำเร็จด้วย Mandatory Fields (Positive Case) |
| **Pre-conditions** | ผู้ใช้งาน Login เข้าสู่ระบบและเปิดหน้าฟอร์มสร้างบัญชี |
| **Test Steps** | 1. กรอก `Account Name` = "เงินฝากออมทรัพย์ออมสุข"<br>2. เลือก `Account Type` = "Savings"<br>3. กรอก `Initial Balance` = 25000<br>4. กดปุ่มบันทึก (Save) |
| **Expected Result** | 1. บัญชีใหม่ถูกสร้างสำเร็จและแสดงในรายการ Asset List<br>2. ในฐานข้อมูลเก็บสถานะ `IsActive = true` |

| Test Case ID | TC-CORE-002 |
| :--- | :--- |
| **Title** | ตรวจสอบการปฏิเสธการสร้างบัญชีเมื่อกรอกข้อมูลบังคับไม่ครบ (Negative Case) |
| **Pre-conditions** | ผู้ใช้งาน Login เข้าสู่ระบบและเปิดหน้าฟอร์มสร้างบัญชี |
| **Test Steps** | 1. ปล่อยช่อง `Account Name` ว่างไว้<br>2. เลือก `Account Type` = "Savings"<br>3. ปล่อยช่อง `Initial Balance` ว่างไว้<br>4. กดปุ่มบันทึก (Save) |
| **Expected Result** | 1. หน้าจอ UI และระบบหลังบ้าน (API) ปฏิเสธการทำรายการ<br>2. แสดงข้อความแจ้งเตือน (Validation Message) ว่าต้องระบุชื่อบัญชีและยอดยกมาเริ่มต้น |

| Test Case ID | TC-CORE-003 |
| :--- | :--- |
| **Title** | ตรวจสอบการห้ามกรอกยอดยอดคงเหลือเริ่มต้นติดลบในกลุ่มบัญชีสินทรัพย์ (Negative Case) |
| **Pre-conditions** | ผู้ใช้งาน Login เข้าสู่ระบบและเปิดหน้าฟอร์มสร้างบัญชี |
| **Test Steps** | 1. กรอก `Account Name` = "เงินสดส่วนตัว"<br>2. เลือก `Account Type` = "Cash"<br>3. กรอก `Initial Balance` = -1500 (ยอดติดลบ)<br>4. กดปุ่มบันทึก (Save) |
| **Expected Result** | 1. ระบบไม่อนุญาตให้กรอกยอดติดลบในบัญชีกลุ่มสินทรัพย์ (Cash, Savings)<br>2. แสดง Validation แจ้งเตือนยอดเงินเริ่มต้นต้องไม่ต่ำกว่า 0 หรือขึ้นคำเตือน Overdraft |

| Test Case ID | TC-CORE-004 |
| :--- | :--- |
| **Title** | ตรวจสอบการอนุญาตให้กรอกยอดติดลบในกลุ่มบัญชีหนี้สิน (Positive Case) |
| **Pre-conditions** | ผู้ใช้งาน Login เข้าสู่ระบบและเปิดหน้าฟอร์มสร้างบัญชี |
| **Test Steps** | 1. กรอก `Account Name` = "สินเชื่อบ้านกรุงไทย"<br>2. เลือก `Account Type` = "Loan" หรือ "Credit Card"<br>3. กรอก `Initial Balance` = -2500000 (ยอดติดลบ)<br>4. กดปุ่มบันทึก (Save) |
| **Expected Result** | 1. บัญชีหนี้สินถูกสร้างขึ้นพร้อมยอดเงินเริ่มต้นติดลบสำเร็จ<br>2. แสดงยอดติดลบอย่างถูกต้องภายใต้หมวด Liabilities บน Dashboard |

| Test Case ID | TC-CORE-005 |
| :--- | :--- |
| **Title** | ตรวจสอบการบล็อกการลบบัญชีที่มีข้อมูลธุรกรรมผูกอยู่ (Integrity Negative Case) |
| **Pre-conditions** | บัญชีผู้ใช้งานมีประวัติการบันทึกรายการธุรกรรม (Transaction) โยงอยู่แล้ว |
| **Test Steps** | 1. พยายามกดยืนยันการลบแบบ Hard Delete บัญชีนั้นจากระบบ |
| **Expected Result** | 1. ระบบ API และ UI บล็อกการลบถาวร<br>2. ระบบใช้วิธีเปลี่ยนสถานะเป็น Soft Delete (`IsActive = false` หรือ `IsDeleted = true`) แทน เพื่อให้ประวัติธุรกรรมยังคงแสดงในสรุปผลได้ |

| Test Case ID | TC-CORE-006 |
| :--- | :--- |
| **Title** | ตรวจสอบการสร้าง Transaction ด้วยจำนวนเงินเป็นค่าบวก (Positive Case) |
| **Pre-conditions** | ผู้ใช้งานเปิดหน้าฟอร์มบันทึกธุรกรรม (Add Transaction) |
| **Test Steps** | 1. เลือก `Transaction Type` = "Expense"<br>2. กรอก `Amount` = 320 (ค่าบวก)<br>3. ระบุ `Date`, `Category` = "Food", และเลือก `Account` = "เงินฝากออมทรัพย์ออมสุข"<br>4. กด Save |
| **Expected Result** | 1. ธุรกรรมถูกบันทึกสำเร็จลงฐานข้อมูล<br>2. ระบบประเมินหักยอดออกจากบัญชีปลายทางโดยใช้ Transaction Type เป็นตัวกำหนด (ผู้ใช้กรอกเป็นค่าบวก ห้ามกรอกลบเอง) |

| Test Case ID | TC-CORE-007 |
| :--- | :--- |
| **Title** | ตรวจสอบการห้ามกรอกจำนวนเงินธุรกรรมติดลบ (Negative Case) |
| **Pre-conditions** | ผู้ใช้งานเปิดหน้าฟอร์มบันทึกธุรกรรม |
| **Test Steps** | 1. เลือก `Transaction Type` = "Expense"<br>2. กรอก `Amount` = -320 (พยายามใส่เครื่องหมายลบเอง)<br>3. ระบุฟิลด์บังคับอื่นๆ แล้วกด Save |
| **Expected Result** | 1. ระบบ UI ป้องกันไม่ให้ป้อนค่าติดลบ หรือส่ง Warning เตือน<br>2. API คืนค่า Error ปฏิเสธค่าติดลบ (ต้องกรอกค่า `Amount > 0` เสมอ) |

| Test Case ID | TC-CORE-008 |
| :--- | :--- |
| **Title** | ตรวจสอบการโอนเงินโดยห้ามเลือกบัญชีต้นทางและปลายทางเดียวกัน (Negative Case) |
| **Pre-conditions** | ผู้ใช้งานเลือก Transaction Type เป็น Transfer (โอนเงิน) |
| **Test Steps** | 1. เลือก `From Account` = "เงินฝากออมทรัพย์ออมสุข"<br>2. เลือก `To Account` = "เงินฝากออมทรัพย์ออมสุข" (บัญชีเดิม)<br>3. ระบุจำนวนเงินแล้วกดบันทึก |
| **Expected Result** | 1. ระบบตรวจจับข้อผิดพลาดทันทีและไม่อนุญาตให้กดส่งข้อมูล<br>2. แสดงข้อความเตือน "บัญชีต้นทางและปลายทางต้องไม่ซ้ำกัน" |

---

## 5. Feature: Team Invitation & Organization

**Description:** กฎการสร้างองค์กรอัตโนมัติ และการจัดการลิงก์คำเชิญสมาชิก (Phase 19)

| Test Case ID | TC-TEAM-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการสร้าง Organization และสิทธิ์ Owner อัตโนมัติเมื่อสมัครสมาชิก (Positive Case) |
| **Pre-conditions** | ผู้ใช้รายใหม่ยังไม่มีบัญชีในระบบ |
| **Test Steps** | 1. สมัครสมาชิกผ่านหน้า Sign Up สำเร็จ<br>2. ตรวจสอบข้อมูลใน Database ทันที |
| **Expected Result** | 1. ระบบสร้างตาราง `Organization` เริ่มต้นให้โดยอัตโนมัติ<br>2. กำหนดให้ผู้ใช้ที่สมัครเป็น `Owner` ของ Organization ดังกล่าวโดยปริยาย |

| Test Case ID | TC-TEAM-002 |
| :--- | :--- |
| **Title** | ตรวจสอบการระบุข้อมูลสร้างคำเชิญและตรวจสอบอายุ Token 7 วัน (Positive Case) |
| **Pre-conditions** | ล็อกอินเข้าระบบด้วยสิทธิ์ Owner หรือ Admin |
| **Test Steps** | 1. เข้าหน้าเมนู Team Management<br>2. ส่งคำเชิญไปยังอีเมล `invitee@example.com` กำหนดสิทธิ์เป็น `Editor`<br>3. เปิดตรวจสอบ Record ลิงก์คำเชิญในฐานข้อมูล |
| **Expected Result** | 1. ระบบจัดส่งอีเมลเชิญด้วย Nodemailer สำเร็จ<br>2. คอลัมน์ `expiresAt` ถูกกำหนดเวลาหมดอายุไว้ที่ **7 วัน (168 ชั่วโมง)** นับจากวันที่ส่งพอดี |

| Test Case ID | TC-TEAM-003 |
| :--- | :--- |
| **Title** | ตรวจสอบการหมดอายุของลิงก์คำเชิญและเปลี่ยนสถานะเป็น EXPIRED (Negative Case) |
| **Pre-conditions** | 1. ส่งคำเชิญให้ผู้รับสำเร็จ<br>2. ทำการแก้ไข `expiresAt` ในฐานข้อมูลให้หมดอายุแล้ว (ข้ามเวลา 7 วัน) |
| **Test Steps** | 1. ผู้รับเชิญคลิกเข้าใช้ลิงก์คำเชิญ / ส่ง API กดยอมรับคำเชิญ |
| **Expected Result** | 1. ระบบ API ปฏิเสธการลงทะเบียนเข้ากลุ่ม<br>2. สถานะของคำเชิญเปลี่ยนเป็น `EXPIRED`<br>3. หน้าจอแสดงผลข้อความอย่างชัดเจน: "ลิงก์คำเชิญนี้หมดอายุแล้ว" |

| Test Case ID | TC-TEAM-004 |
| :--- | :--- |
| **Title** | ตรวจสอบการยกเลิกคำเชิญโดยผู้ดูแลระบบ (Owner/Admin Revocation) |
| **Pre-conditions** | มีลิงก์คำเชิญสถานะ Pending ค้างอยู่ในระบบ |
| **Test Steps** | 1. ล็อกอินเข้าใช้งานด้วยบัญชี Owner หรือ Admin<br>2. กดยยกเลิก (Revoke/Cancel) ลิงก์คำเชิญนั้น<br>3. ให้ผู้รับลองกดลิงก์คำเชิญที่ยกเลิกไปแล้วนั้น |
| **Expected Result** | 1. คำเชิญถูกเปลี่ยนสถานะเป็น `REVOKED` ทันที<br>2. เมื่อผู้รับกดลิงก์ ระบบแจ้งเตือนว่า "ลิงก์คำเชิญไม่ถูกต้องหรือถูกยกเลิกแล้ว" |

| Test Case ID | TC-TEAM-005 |
| :--- | :--- |
| **Title** | ตรวจสอบการบล็อกการเชิญอีเมลที่เป็นสมาชิกอยู่แล้วซ้ำ (Negative Case) |
| **Pre-conditions** | อีเมล `member@example.com` มีสถานะเป็น Active Member ในองค์กรนี้เรียบร้อยแล้ว |
| **Test Steps** | 1. พยายามกดส่งคำเชิญไปที่อีเมล `member@example.com` อีกครั้ง |
| **Expected Result** | 1. ระบบล็อกหรือขึ้นแจ้งเตือนทันทีในหน้าจอเชิญทีม<br>2. API ส่ง Error ปฏิเสธการเชิญพร้อมเหตุผล "อีเมลนี้เป็นสมาชิกขององค์กรนี้อยู่แล้ว" |

---

## 6. Feature: Thai Encoding Support

**Description:** การป้อนและเรนเดอร์ภาษาไทยได้ 100% ตลอดทั้งระบบ (Phase 18)

| Test Case ID | TC-THAI-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการกรอกภาษาไทยพร้อมวรรณยุกต์ใน Note และการแสดงผลถูกต้อง (Positive Case) |
| **Pre-conditions** | ผู้ใช้เข้าสู่ระบบสำเร็จและเปิด Transaction Modal |
| **Test Steps** | 1. บันทึกธุรกรรมโดยกรอกตัวอักษรภาษาไทยในช่อง Note: "ค่าน้ำมันรถก้อนยักษ์"<br>2. บันทึกข้อมูล รีเฟรชหน้าจอ และดูรายการในตาราง |
| **Expected Result** | 1. ข้อมูลถูกบันทึกสำเร็จ ไม่เกิดสัญลักษณ์ "?" หรือตัวอักษรเพี้ยน<br>2. UI เรนเดอร์คำว่า "ค่าน้ำมันรถก้อนยักษ์" ออกมาได้ถูกต้องและครบถ้วน 100% |

| Test Case ID | TC-THAI-002 |
| :--- | :--- |
| **Title** | ตรวจสอบความถูกต้องในการกรอกภาษาไทยในทุกโมดูลอินพุตหลัก (Acceptance Test) |
| **Pre-conditions** | ผู้ใช้เข้าสู่ระบบสำเร็จ |
| **Test Steps** | 1. สร้างบัญชีด้วยชื่อ "เงินฝากเพื่อการเกษียณ"<br>2. สร้างหมวดหมู่ด้วยชื่อ "สวัสดิการพนักงาน"<br>3. แก้ไขชื่อองค์กรเป็น "บริษัท เทคโนโลยีก้าวหน้า จำกัด"<br>4. สร้างเป้าหมายชื่อ "ปลดหนี้ก้อนแรก" |
| **Expected Result** | 1. ทุกฟิลด์สามารถรับภาษาไทยแบบ 100% ได้สมบูรณ์แบบ<br>2. UI ในส่วน Dropdown, Cards, และ Tables เรนเดอร์ถูกต้องไม่มีปัญหาตัดคำผิดเพี้ยน |

| Test Case ID | TC-THAI-003 |
| :--- | :--- |
| **Title** | ตรวจสอบการส่งออกไฟล์ CSV เป็นฟอร์แมต UTF-8 with BOM เพื่อป้องกันฟอนต์เพี้ยนใน Excel |
| **Pre-conditions** | ในระบบมีข้อมูลภาษาไทยที่บันทึกไว้ในโมดูล Transaction |
| **Test Steps** | 1. กดส่งออกไฟล์ธุรกรรมเป็น CSV<br>2. ทำการเปิดไฟล์ดังกล่าวบน Microsoft Excel |
| **Expected Result** | 1. ไฟล์เข้ารหัสแบบ `UTF-8 with BOM`<br>2. ข้อมูลภาษาไทยทั้งหมดแสดงผลปกติ ไม่แสดงอักขระต่างดาวเพี้ยนในโปรแกรม Excel |

| Test Case ID | TC-THAI-004 |
| :--- | :--- |
| **Title** | ตรวจสอบการฝังฟอนต์ภาษาไทยสำหรับการส่งออกไฟล์ PDF Report |
| **Pre-conditions** | ผู้ใช้มีพอร์ตการเงินที่มีข้อมูลภาษาไทย |
| **Test Steps** | 1. กด Export รายงานสรุปผลการเงินเป็นไฟล์ PDF<br>2. ทำการเปิดดูเนื้อหาในไฟล์ PDF |
| **Expected Result** | 1. PDF Generator ทำการฝัง (Embed) ฟอนต์ภาษาไทย เช่น Sarabun หรือ Noto Sans Thai เข้าไปในไฟล์<br>2. การจัดหน้าสมบูรณ์ อักษรวรรณยุกต์ไม่อยู่ในตำแหน่งลอยหรือหายไป |

---

## 7. Feature: Core Auth & Registration (Technical Integrity)

**Description:** การจัดการระบบสิทธิ์การลงทะเบียน ความสมบูรณ์ของทรานแซกชันฐานข้อมูล และโครงสร้างโทเค็น (Phase 1-16)

| Test Case ID | TC-AUTH-REG-001 |
| :--- | :--- |
| **Title** | ตรวจสอบความสมบูรณ์ของทรานแซกชันในฐานข้อมูลเมื่อลงทะเบียนสมัครสมาชิก (System Integration) |
| **Pre-conditions** | ไม่มีข้อมูลผู้ใช้งานคนใหม่มาก่อนในระบบ |
| **Test Steps** | 1. ส่งคำขอ `POST /api/auth/register` ด้วยอีเมลและรหัสผ่าน plain-text |
| **Expected Result** | 1. รหัสผ่านถูกเข้ารหัสผ่าน `bcrypt` (Salt rounds = 10 หรือ 12) ทันทีที่ API Layer<br>2. ระบบสร้างตาราง User, Default Organization, Role ผูกมัดเป็น Owner และทำการ Seed ค่า Category/Bank พื้นฐาน ทั้งหมดภายในก้อน **Database Transaction เดียวกัน** อย่างสมบูรณ์ |

| Test Case ID | TC-AUTH-REG-002 |
| :--- | :--- |
| **Title** | ตรวจสอบการทำ Rollback ฐานข้อมูลหากเกิดข้อผิดพลาดระหว่างกระบวนการลงทะเบียน (Resilience Test) |
| **Pre-conditions** | จำลองกรณีที่ Database เกิด Error ตอนจังหวะการ Seed ข้อมูลหมวดหมู่เริ่มต้น |
| **Test Steps** | 1. กดสมัครสมาชิกผู้ใช้รายใหม่เข้าสู่ระบบ |
| **Expected Result** | 1. Database Transaction จะต้องทำ **Rollback ทันทีแบบ 100%** เพื่อไม่ให้เกิดข้อมูลค้างครึ่งๆ กลางๆ<br>2. ไม่มี Record ของ User หรือ Organization นั้นในฐานข้อมูลหลังจากเกิด Error<br>3. API ตอบสนองด้วย Status Code `400` หรือ `500` ทันที |

| Test Case ID | TC-AUTH-REG-003 |
| :--- | :--- |
| **Title** | ตรวจสอบโครงสร้าง JWT Token Payload และเวลาหมดอายุ 24 ชั่วโมง (Security Case) |
| **Pre-conditions** | ล็อกอินเข้าระบบและได้รับ JWT Access Token ชุดปัจจุบัน |
| **Test Steps** | 1. ตรวจสอบ Header `Authorization: Bearer <token>` ของ API Request<br>2. นำ JWT ไปดีโค้ดเพื่อตรวจสอบ Payload |
| **Expected Result** | 1. JWT Payload ต้องประกอบไปด้วยฟิลด์: `userId`, `email`, `organizationId`, `iat`, `exp` ครบถ้วนตามมาตรฐานความปลอดภัย<br>2. ค่า `exp` (หมดอายุ) ต้องถูกนับไว้ไม่เกิน **24 ชั่วโมง** นบัจากวันที่สร้าง หรือตามตัวแปร `JWT_EXPIRES_IN` |

---

## 8. Feature: User Impersonation

**Description:** การจัดการระบบ Impersonation ให้ Super Admin เข้าดูปัญหาและบันทึกการกระทำลง AuditLog (Phase 17)

| Test Case ID | TC-IMPER-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการจำลองสิทธิ์ผู้ใช้งานอื่นโดย Super Admin และการบันทึก Audit Log (Security Positive) |
| **Pre-conditions** | ผู้ใช้ล็อกอินด้วยสิทธิ์ Super Admin และมี Target User ID ของลูกค้าที่แจ้งปัญหา |
| **Test Steps** | 1. ส่งคำขอ `POST /api/auth/impersonate` พร้อมระบุ `targetUserId` = "customer-uuid" และ `reason` = "Support ticket #1234"<br>2. เช็คตาราง `AuditLog` ใน Database ทันที |
| **Expected Result** | 1. ระบบบันทึกข้อมูลเข้าตาราง `AuditLog` แบบบังคับทันที: `action: IMPERSONATE_USER`, `actorId` (Super Admin), `targetUserId` (ลูกค้า), `reason` และ `ipAddress` ครบถ้วนตามนโยบาย<br>2. API ตอบกลับด้วยรหัสผ่านหรือ JWT Token ชุดใหม่ที่มีสิทธิ์ของลูกค้าคนนั้น |

| Test Case ID | TC-IMPER-002 |
| :--- | :--- |
| **Title** | ตรวจสอบการบล็อกผู้ใช้ทั่วไปไม่ให้ใช้งาน Impersonate ผ่าน API (Security Negative) |
| **Pre-conditions** | ล็อกอินเข้าใช้งานด้วยบัญชีผู้ใช้ทั่วไป (Normal User) |
| **Test Steps** | 1. พยายามส่ง POST Request ไปที่ `/api/auth/impersonate` พร้อมระบุไอดีเป้าหมาย |
| **Expected Result** | 1. API บล็อกการทำงานทันที และตอบกลับด้วยรหัส `403 Forbidden` หรือ `401 Unauthorized`<br>2. ไม่มีการออก JWT Token จำลองสิทธิ์ใดๆ ทั้งสิ้น |

| Test Case ID | TC-IMPER-003 |
| :--- | :--- |
| **Title** | ตรวจสอบการตั้งค่า Flag ใน Token และการแสดงผลแบนเนอร์เตือนใน UI (End-to-End Test) |
| **Pre-conditions** | Super Admin ได้รับสิทธิ์ Token จำลองความช่วยเหลือแล้ว |
| **Test Steps** | 1. นำ Token ชุดจำลองสิทธิ์ไปเข้าใช้งานแอปพลิเคชันผ่านบราวเซอร์<br>2. ตรวจสอบการแสดงผลบนหน้าจอ |
| **Expected Result** | 1. โทเค็นมี Flag `isImpersonated: true`<br>2. UI Frontend แสดงผลแถบเตือนสีแดง (Banner Warning) เด่นชัดระบุ: "คุณกำลังใช้งานในโหมด Impersonation" ตลอดเวลาเพื่อความโปร่งใส |

---

## 9. Feature: Admin Diagnostic Terminal

**Description:** ข้อกำหนดในการรันคำสั่งผ่าน Diagnostic Terminal ใน Admin App และบล็อกคำสั่งอันตราย (Phase 17)

| Test Case ID | TC-DIAG-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการเรียกใช้คำสั่งวินิจฉัยที่อนุญาตแบบ Read-only (Positive Case) |
| **Pre-conditions** | ล็อกอินเข้าใช้งานด้วยสิทธิ์ Admin |
| **Test Steps** | 1. ส่ง Command `"ping"` หรือ `"health"` ผ่าน `POST /api/admin/diagnostic`<br>2. ลองส่งคำสั่ง `"logs tail"` หรือ `"metrics"` เพื่อขอดู Performance |
| **Expected Result** | 1. API ประมวลผลสำเร็จ คืนค่า HTTP `200 OK`<br>2. คืนค่า JSON ผลลัพธ์กลับมาแสดงที่หน้าจอ โดยตัวจัดการระบบทำตัวเป็น Virtual Interpreter ไม่ได้รัน shell `exec()` ตรงๆ เพื่อความปลอดภัย |

| Test Case ID | TC-DIAG-002 |
| :--- | :--- |
| **Title** | ตรวจสอบการบล็อกและป้องกันคำสั่งอันตรายระดับ OS-level (Security Negative) |
| **Pre-conditions** | ล็อกอินเข้าใช้งานด้วยสิทธิ์ Admin |
| **Test Steps** | 1. พยายามป้อนคำสั่งอันตราย เช่น `"rm -rf"`, `"reboot"`, `"shutdown"`, หรือ `"truncate table users"` เข้าไปใน Diagnostic Terminal |
| **Expected Result** | 1. ระบบคัดกรองไม่อนุญาตให้ทำงาน<br>2. คืนค่า HTTP `400 Bad Request` หรือตอบกลับข้อความ `"Command not found / Forbidden"`<br>3. ตรวจสอบว่าระบบไม่มีการส่งคำสั่งไปรันที่ OS shell เด็ดขาด |

| Test Case ID | TC-DIAG-003 |
| :--- | :--- |
| **Title** | ตรวจสอบการเข้าถึง Diagnostic Terminal ด้วยบทบาทที่ไม่ถูกต้อง (Security Negative) |
| **Pre-conditions** | ล็อกอินเข้าใช้งานด้วยบทบาทผู้ใช้ปกติ (Non-Admin) |
| **Test Steps** | 1. พยายามส่ง Request ไปที่ `POST /api/admin/diagnostic` |
| **Expected Result** | 1. ระบบรักษาความปลอดภัยสกัดกั้นทันที<br>2. API ตอบกลับด้วย HTTP `403 Forbidden` |

---

## 10. Feature: Role-Based Access Control

**Description:** การบังคับใช้สิทธิ์ (Middleware Enforcement) และการดักจับข้อผิดพลาด 403 Forbidden (Phase 19)

| Test Case ID | TC-RBAC-001 |
| :--- | :--- |
| **Title** | ตรวจสอบการส่งต่อสิทธิ์และอนุญาตให้ทำงานเฉพาะ Role ที่มี Permission (Positive Case) |
| **Pre-conditions** | ผู้ใช้สิทธิ์ `Owner` หรือ `Editor` มีสิทธิ์ 'delete' บน Resource 'transaction' ในฐานข้อมูล |
| **Test Steps** | 1. ล็อกอินและเรียกร้องการลบข้อมูลธุรกรรมผ่าน API `DELETE /api/transactions/:id` |
| **Expected Result** | 1. Middleware `requirePermission('delete', 'transaction')` อนุมัติการเข้าถึง<br>2. API ทำการลบข้อมูลสำเร็จ คืนสถานะ 200 หรือ 204 |

| Test Case ID | TC-RBAC-002 |
| :--- | :--- |
| **Title** | ตรวจสอบการบล็อกการทำงานผู้ไม่มีสิทธิ์ และตอบกลับ JSON โครงสร้างมาตรฐาน (Security Negative) |
| **Pre-conditions** | ผู้ใช้ล็อกอินด้วยสิทธิ์ `Viewer` ซึ่งไม่มีสิทธิ์ 'delete' บน Resource 'transaction' |
| **Test Steps** | 1. พยายามส่งคำขอ `DELETE /api/transactions/:id` เพื่อลบรายการธุรกรรม |
| **Expected Result** | 1. ระบบ Middleware ทำการบล็อกการทำงานทันที<br>2. คืนค่า HTTP `403 Forbidden` พร้อม JSON รูปแบบมาตรฐาน 100%:<br>`{ "statusCode": 403, "error": "Forbidden", "message": "You do not have permission to perform this action." }`<br>3. UI Frontend ดักจับค่า 403 และยิง Toast Notification แสดงผลคำว่า "You do not have permission to perform this action." ให้ผู้ใช้งานเห็นชัดเจน |

