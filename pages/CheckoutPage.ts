import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับขั้นตอน checkout (ครอบ 2 steps + หน้า complete)
// step 1: /checkout-step-one.html  — กรอกข้อมูลการจัดส่ง
// step 2: /checkout-step-two.html  — สรุปคำสั่งซื้อ
// complete: /checkout-complete.html — ยืนยันคำสั่งซื้อ
export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;   // ปุ่มไปหน้าถัดไป (step 1 → step 2)
  readonly finishButton: Locator;     // ปุ่มยืนยันคำสั่งซื้อ (step 2 → complete)
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly summaryTotal: Locator;     // label แสดงยอดรวมทั้งหมด
  readonly confirmationHeader: Locator;

  constructor(page: Page) {
    this.page                = page;
    this.firstNameInput      = page.locator('[data-test="firstName"]');
    this.lastNameInput       = page.locator('[data-test="lastName"]');
    this.postalCodeInput     = page.locator('[data-test="postalCode"]');
    this.continueButton      = page.locator('[data-test="continue"]');
    this.finishButton        = page.locator('[data-test="finish"]');
    this.cancelButton        = page.locator('[data-test="cancel"]');
    this.errorMessage        = page.locator('[data-test="error"]');
    this.summaryTotal        = page.locator('.summary_total_label');
    this.confirmationHeader  = page.locator('.complete-header');
  }

  // ตรวจสอบว่าอยู่ที่ step 1 (หน้ากรอกข้อมูล)
  async expectToBeOnCheckoutStep1() {
    await expect(this.page).toHaveURL('/checkout-step-one.html');
  }

  // ตรวจสอบว่าอยู่ที่ step 2 (หน้าสรุปคำสั่งซื้อ)
  async expectToBeOnCheckoutStep2() {
    await expect(this.page).toHaveURL('/checkout-step-two.html');
  }

  // กรอกข้อมูลการจัดส่งครบแล้วกด Continue
  // รวม 4 บรรทัดไว้ใน method เดียวเพราะทุก test ต้องทำขั้นตอนนี้เหมือนกัน
  async fillShippingInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  // กดปุ่ม Finish เพื่อยืนยันคำสั่งซื้อ
  async finish() {
    await this.finishButton.click();
  }

  // ตรวจสอบว่าหน้า confirmation แสดงขึ้นและข้อความถูกต้อง
  async expectOrderConfirmed() {
    await expect(this.page).toHaveURL('/checkout-complete.html');
    await expect(this.confirmationHeader).toHaveText('Thank you for your order!');
  }

  // ตรวจสอบว่า error message แสดงขึ้นและข้อความตรงกับที่คาดหวัง
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
