import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

// test suite สำหรับ sidebar menu และ navigation
// ครอบคลุม: เปิด/ปิด menu, logout, reset state, link ต่างๆ
test.describe('Navigation & Sidebar Menu', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  // login ก่อนทุก test เพราะ sidebar จะปรากฏหลัง login เท่านั้น
  test.beforeEach(async ({ page }) => {
    loginPage     = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
  });

  // smoke — กด ☰ แล้ว sidebar ต้องโผล่ขึ้นมา
  test('should open sidebar menu', async ({ page }) => {
    await inventoryPage.burgerMenu.click();
    await expect(page.locator('.bm-menu-wrap')).toBeVisible();
  });

  // functional — กด X ปิด sidebar แล้วต้องหายไป
  test('should close sidebar menu', async ({ page }) => {
    await inventoryPage.burgerMenu.click();
    await expect(page.locator('.bm-menu-wrap')).toBeVisible();
    await page.locator('#react-burger-cross-btn').click();
    await expect(page.locator('.bm-menu-wrap')).not.toBeVisible();
  });

  // auth flow — logout แล้วต้องกลับหน้า login และปุ่ม login ต้องแสดง
  test('should logout via sidebar', async ({ page }) => {
    await inventoryPage.burgerMenu.click();
    await page.locator('#logout_sidebar_link').click();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });

  // navigation — กด "All Items" จากหน้าอื่น ต้องกลับมาหน้า inventory
  test('should navigate to All Items via sidebar', async ({ page }) => {
    await inventoryPage.goToCart(); // ออกจากหน้า inventory ก่อน
    await inventoryPage.burgerMenu.click();
    await page.locator('#inventory_sidebar_link').click();
    await inventoryPage.expectToBeOnInventoryPage();
  });

  // state management — Reset App State ต้องล้าง cart โดยไม่ต้อง logout
  // มีประโยชน์สำหรับ teardown ระหว่าง test session
  test('should reset app state via sidebar', async ({ page }) => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.expectCartBadge(1);

    await inventoryPage.burgerMenu.click();
    await page.locator('#reset_sidebar_link').click();
    await inventoryPage.expectCartBadgeHidden();
  });

  // link integrity — ตรวจสอบว่า About link ชี้ไป saucelabs.com
  // assert href แทนการ navigate จริง เพราะ external site ช้าและอยู่นอก scope ของ system เรา
  test('About link should point to saucelabs.com', async ({ page }) => {
    await inventoryPage.burgerMenu.click();
    const aboutLink = page.locator('#about_sidebar_link');
    await expect(aboutLink).toHaveAttribute('href', /saucelabs\.com/);
  });

  // navigation — กด cart icon ต้องไปหน้า cart ได้
  test('cart icon should navigate to cart page', async ({ page }) => {
    await inventoryPage.goToCart();
    await expect(page).toHaveURL('/cart.html');
  });
});
