import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

// test suite สำหรับหน้ารายการสินค้า
// ครอบคลุม: จำนวนสินค้า, sort, add/remove, navigation
test.describe('Inventory / Product Listing', () => {
  let inventoryPage: InventoryPage;

  // login ก่อนทุก test เพราะหน้า inventory เข้าได้เฉพาะหลัง login
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    inventoryPage = new InventoryPage(page);
  });

  // smoke — ตรวจสอบว่าสินค้าโหลดครบ 6 ชิ้นตามที่ Sauce Demo กำหนด
  test('should display 6 products after login', async () => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  // sort A-Z: ดึงชื่อทั้งหมด → sort ใน JS → เปรียบเทียบกับสิ่งที่หน้าแสดง
  // ถ้าหน้าแสดงผิด array จะไม่ตรงกัน
  test('should sort products by name A-Z', async () => {
    await inventoryPage.sortBy('az');
    const names  = await inventoryPage.getItemNames();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  // sort Z-A: reverse ของ sort ปกติ
  test('should sort products by name Z-A', async () => {
    await inventoryPage.sortBy('za');
    const names  = await inventoryPage.getItemNames();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  // sort ราคาต่ำ-สูง: ใช้ (a, b) => a - b สำหรับ numeric sort
  test('should sort products by price low to high', async () => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getItemPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  // sort ราคาสูง-ต่ำ: reverse ของ numeric sort
  test('should sort products by price high to low', async () => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getItemPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  // navigation — กดชื่อสินค้าต้องไปหน้า detail และแสดงชื่อสินค้าถูกต้อง
  test('should navigate to product detail page', async ({ page }) => {
    await inventoryPage.clickItemByName('Sauce Labs Backpack');
    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Backpack');
  });

  // state change — เพิ่มสินค้า 1 ชิ้น badge ต้องแสดง "1"
  test('should add item to cart and show badge', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.expectCartBadge(1);
  });

  // state accumulation — เพิ่ม 2 ชิ้น badge ต้องแสดง "2"
  test('should update cart badge when adding multiple items', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
    await inventoryPage.expectCartBadge(2);
  });

  // UI state — หลัง add ปุ่มต้องเปลี่ยนจาก "Add to cart" เป็น "Remove"
  test('should change Add to Cart button to Remove after adding', async ({ page }) => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    const backpackItem = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' });
    await expect(backpackItem.locator('button')).toHaveText('Remove');
  });

  // state reset — ลบสินค้าออก badge ต้องหายไป (ไม่ใช่แสดง "0")
  test('should remove item from inventory and hide badge', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.expectCartBadge(1);
    await inventoryPage.removeItemFromInventoryByName('Sauce Labs Backpack');
    await inventoryPage.expectCartBadgeHidden();
  });
});
