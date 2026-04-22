import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับหน้า Login (/)
// รวม locator และ action ของหน้านี้ไว้ที่เดียว
export class LoginPage {
  readonly page: Page;

  // locator คือตัวชี้ไปยัง element บนหน้าเว็บ
  // ใช้ data-test attribute เพราะ developer สร้างไว้สำหรับ automation โดยเฉพาะ
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton   = page.locator('[data-test="login-button"]');
    this.errorMessage  = page.locator('[data-test="error"]');
  }

  // เปิดหน้า login (baseURL กำหนดไว้ใน playwright.config.ts แล้ว)
  async goto() {
    await this.page.goto('/');
  }

  // กรอก username + password แล้วกด login
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // shortcut สำหรับ login ด้วย account ปกติ ไม่ต้องพิมพ์ credential ซ้ำในทุก test
  async loginAsStandardUser() {
    await this.login('standard_user', 'secret_sauce');
  }

  // ตรวจสอบว่า error message แสดงขึ้น และข้อความตรงกับที่คาดหวัง
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
