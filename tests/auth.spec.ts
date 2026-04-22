import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

// test suite สำหรับระบบ Authentication
// ครอบคลุม: login สำเร็จ, login ล้มเหลว, validation
test.describe('Authentication', () => {
  let loginPage: LoginPage;

  // ทุก test ใน suite นี้เริ่มต้นที่หน้า login เสมอ
  // beforeEach รันก่อนทุก test อัตโนมัติ
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // happy path — login ด้วย credential ที่ถูกต้อง ต้องเข้าหน้า inventory ได้
  test('should login successfully with valid credentials', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await loginPage.loginAsStandardUser();
    await inventoryPage.expectToBeOnInventoryPage();
  });

  // negative — password ผิด ต้องแสดง error
  test('should show error for invalid password', async () => {
    await loginPage.login('standard_user', 'wrong_password');
    await loginPage.expectErrorMessage('Username and password do not match');
  });

  // edge case — account ถูกล็อค ต้องแสดง error คนละข้อความ
  test('should show error for locked out user', async () => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    await loginPage.expectErrorMessage('Sorry, this user has been locked out');
  });

  // boundary — ส่ง form โดยไม่กรอก username
  test('should show error when username is empty', async () => {
    await loginPage.login('', 'secret_sauce');
    await loginPage.expectErrorMessage('Username is required');
  });

  // boundary — ส่ง form โดยไม่กรอก password
  test('should show error when password is empty', async () => {
    await loginPage.login('standard_user', '');
    await loginPage.expectErrorMessage('Password is required');
  });

  // UX behavior — กด X บน error message ต้องหายไป
  test('should clear error message when user edits input', async ({ page }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();

    await loginPage.usernameInput.fill('standard_user');
    await page.locator('[data-test="error-button"]').click(); // ปุ่ม X ปิด error
    await expect(loginPage.errorMessage).not.toBeVisible();
  });

  // smoke — เช็ค title หน้าเว็บเพื่อยืนยันว่าโหลดถูกหน้า
  test('login page should have correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Swag Labs/);
  });
});
