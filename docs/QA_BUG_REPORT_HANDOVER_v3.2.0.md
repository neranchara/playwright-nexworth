# 📋 เอกสารส่งมอบงานสำหรับแก้ไขระบบเพื่อรองรับการรันทดสอบ (QA Bug Report & Handover Document)

* **ระดับความสำคัญ:** 🔴 สูงมาก (Blocker - กีดขวางการทำ E2E Regression Test 100%)
* **เวอร์ชันระบบ:** Nexworth v3.2.0
* **สภาพแวดล้อมระบบฐานข้อมูล:** `stg_nexworth_db` (Staging Database - ปลอดภัย 100% ไม่ยุ่งเกี่ยวกับ Production)
* **วันที่รายงาน:** 17 พฤษภาคม 2569

---

## 🔍 บทนำและวัตถุประสงค์ (Executive Summary)

จากการตรวจสอบความเข้ากันได้ของการพัฒนา UI เวอร์ชัน v3.2.0 ร่วมกับชุดการทดสอบอัตโนมัติ E2E (Playwright Test Suite) ของฝ่ายควบคุมคุณภาพ (QA) พบจุดบกพร่อง (Bugs) และความคลาดเคลื่อนในการกำหนดค่าระบบจำนวน 4 จุด ซึ่งทำให้ชุดการทดสอบติดขัดและหน้าจอรายงานการตรวจสอบระบบ (Diagnostic Terminal) เกิดการเสียหาย (React Crash)

เอกสารฉบับนี้จัดขึ้นเพื่อให้ทีมพัฒนา (Developer) ใช้แก้ไขระบบใน Workspace หลักของฝั่ง Dev ให้เกิดความเสถียรและปลดบล็อกการทำ Regression Test ทั้งหมดของโครงการ

---

## 🛠️ รายการจุดบกพร่องที่ต้องดำเนินการแก้ไข (Technical Bug Specifications)

### 🔴 จุดที่ 1: หน้าจอ Diagnostic Terminal (Admin Ops) เกิดอาการ React Crash
* **พิกัดไฟล์:** `apps/web/src/components/admin/ops/DiagnosticTerminal.tsx`
* **ปัญหา:** เมื่อกดเข้าหน้าเมนู `/admin/ops` หน้าจอจะแสดงหน้าขาวว่างเปล่า (React Runtime Error)
* **สาเหตุ:** ฟิลด์ `role` ในระบบฐานข้อมูลของ v3 คืนค่ากลับมาเป็นแบบ Object `{ id, name }` แทนที่จะเป็นแบบ String เดิม ส่งผลให้โค้ดตรง `{(data.user as any).role}` พยายามเขียน Object ลงบนหน้าจอโดยตรง ทำให้ React สั่งหยุดการทำงานทันที
* **แนวทางการแก้ไขสำหรับทีม Dev:**
  1. แก้ไขเงื่อนไขการตรวจสอบระดับสิทธิ์ (บรรทัดที่ 135) ให้เช็คผ่าน `.role?.name`
  2. แก้ไขการเรนเดอร์ข้อความสิทธิ์ (บรรทัดที่ 271) ให้ตรวจสอบโครงสร้างออบเจ็กต์อย่างปลอดภัย

```diff
<<<< ORIGINAL CODE (บรรทัดที่ 135)
    { subject: 'Privilege', value: userData.role === 'ADMIN' ? 100 : 50, fullMark: 100 }
==== PROPOSED FIX
    { subject: 'Privilege', value: userData.role?.name === 'Admin' ? 100 : 50, fullMark: 100 }
>>>>

<<<< ORIGINAL CODE (บรรทัดที่ 271)
    <span>{(data.user as any).role}</span>
==== PROPOSED FIX
    <span>
      {typeof (data.user as any).role === 'object' 
        ? ((data.user as any).role?.name || 'USER') 
        : ((data.user as any).role || 'USER')}
    </span>
>>>>
```

---

### 🔴 จุดที่ 2: ลิงก์การตั้งค่าพื้นฐานในแถบเมนูด้านซ้ายหายไป (Sidebar v3 Navigation Links)
* **พิกัดไฟล์:** `apps/web/src/features/dashboard-layout/navConfig.ts`
* **ปัญหา:** ปุ่มตั้งค่าระบบของ `banks`, `categories`, `users`, และ `permissions` ไม่แสดงบน Sidebar ทำให้ Playwright หาตัวเลือกไม่พบ (Timeout 120000ms Exceeded)
* **สาเหตุ:** ตัวแปรสัญจรหลัก `MGMT_NAV_LINKS` ขาดรายการเมนูที่ E2E เรียกใช้
* **แนวทางการแก้ไขสำหรับทีม Dev:** เพิ่มเมนูที่ขาดหายไปกลับเข้าไปในอาร์เรย์ `MGMT_NAV_LINKS` พร้อมกำหนด `testId` ให้ตรงตามตาราง Selector:

```diff
<<<< ORIGINAL CODE (บรรทัดที่ 33-36)
export const MGMT_NAV_LINKS: NavLinkItem[] = [
  { href: '/dashboard/accounts', label: 'จัดการบัญชี (Accounts)', title: 'จัดการบัญชี', icon: Building2, resource: 'accounts', testId: 'layout-nav-link-setup-accounts' },
  { href: '/dashboard/types', label: 'ประเภท (Types)', title: 'ประเภท', icon: Layers, resource: 'types', adminOnly: true, testId: 'layout-nav-link-setup-types' },
];
==== PROPOSED FIX
export const MGMT_NAV_LINKS: NavLinkItem[] = [
  { href: '/dashboard/accounts', label: 'จัดการบัญชี (Accounts)', title: 'จัดการบัญชี', icon: Building2, resource: 'accounts', testId: 'layout-nav-link-setup-accounts' },
  { href: '/dashboard/types', label: 'ประเภท (Types)', title: 'ประเภท', icon: Layers, resource: 'types', adminOnly: true, testId: 'layout-nav-link-setup-types' },
  { href: '/dashboard/banks', label: 'ธนาคาร (Banks)', title: 'ธนาคาร', icon: Building2, resource: 'banks', adminOnly: true, testId: 'layout-nav-link-setup-banks' },
  { href: '/dashboard/categories', label: 'หมวดหมู่ (Categories)', title: 'หมวดหมู่', icon: Layers, resource: 'categories', adminOnly: true, testId: 'layout-nav-link-setup-categories' },
  { href: '/dashboard/users', label: 'ผู้ใช้งาน (Users)', title: 'ผู้ใช้งาน', icon: Settings, resource: 'users', adminOnly: true, testId: 'layout-nav-link-setup-users' },
  { href: '/dashboard/permissions', label: 'สิทธิ์การใช้งาน (Permissions)', title: 'สิทธิ์การใช้งาน', icon: Settings, resource: 'permissions', adminOnly: true, testId: 'layout-nav-link-setup-permissions' },
];
>>>>
```

---

### 🟡 จุดที่ 3: แถบโปรไฟล์ผู้ใช้งานแสดงชื่อต้นอย่างเดียว (Profile Name Mismatch)
* **พิกัดไฟล์:** `apps/web/src/features/dashboard-layout/DashboardShell.tsx`
* **ปัญหา:** แถบ Profile ดึงข้อความมาเฉพาะชื่อต้น ทำให้แสดง `"Test"` แต่ E2E ตรวจสอบหา `"Test Admin"` (Assertion Mismatch)
* **สาเหตุ:** โค้ดเรนเดอร์เพียงแค่ `{user.firstName || user.email}`
* **แนวทางการแก้ไขสำหรับทีม Dev:** ปรับเปลี่ยนให้แสดงนามสกุลต่อท้ายกรณีมีค่าตัวแปร:

```diff
<<<< ORIGINAL CODE (บรรทัดที่ 118)
                   <span className="text-xs font-bold text-white leading-none">{user.firstName || user.email}</span>
==== PROPOSED FIX
                   <span className="text-xs font-bold text-white leading-none">
                      {user.firstName 
                        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` 
                        : user.email}
                   </span>
>>>>
```

---

### 🟡 จุดที่ 4: ชุดการทดสอบสินทรัพย์เกิดข้อผิดพลาด Strict Mode ใน Playwright
* **พิกัดไฟล์ในคลัง QA:** `nexworth-test/tests/frontend/assets.spec.ts`
* **ปัญหา:** Playwright ฟ้องว่าระบุตำแหน่งคลุมเครือจับคู่ได้หลายส่วนพร้อมกัน (Strict Mode Error)
* **สาเหตุ:** คำค้นหา `h2` ไปตรวจพบทั้งหัวข้อหลัก `"สินทรัพย์ (Assets)"` และหัวข้อตัวควบคุม Modal `"Add Asset"`
* **แนวทางการแก้ไข:** (ส่วนนี้ทีม QA จะอัปเดตเองในฝั่ง QA Workspace) โดยจำกัดกรอบให้อยู่ภายใต้ `dialog`:

```diff
<<<< ORIGINAL CODE (บรรทัดที่ 21)
    await expect(page.locator('h2', { hasText: /Asset/i })).toBeVisible();
==== PROPOSED FIX
    await expect(page.locator('dialog h2', { hasText: /Asset/i })).toBeVisible();
>>>>
```

---

## 🔒 แนวทางความปลอดภัยของฐานข้อมูล (Database Connection Policy)
* ทีมงานขอเน้นย้ำตาม **นโยบายการควบคุมฐานข้อมูล** ว่าห้ามมิให้พยายามต่อกลับฐานข้อมูล Production (`prod_nexworth_db`) ในการทำงานทดสอบทุกกรณี ให้ใช้การเชื่อมต่อของระบบทดสอบชี้ตรงไปที่:
  `DATABASE_URL="postgresql://postgres:nop@ssw0rd@localhost:5432/stg_nexworth_db?schema=public"` เท่านั้น เพื่อป้องกันปัญหาข้อมูลจริงเสียหายและเพื่อความปลอดภัยสูงสุดของแอปพลิเคชันหลัก

---

*จัดทำขึ้นโดยทีมงาน QA (Antigravity AI)*
