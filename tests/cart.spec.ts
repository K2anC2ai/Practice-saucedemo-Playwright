import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

// test suite สำหรับหน้าตะกร้าสินค้า
// ครอบคลุม: สินค้าใน cart, ลบสินค้า, persistence ข้ามหน้า, ราคา
test.describe('Shopping Cart', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  // login ก่อนทุก test และสร้าง page object ทั้งสอง
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    inventoryPage = new InventoryPage(page);
    cartPage      = new CartPage(page);
  });

  // baseline — cart ต้องว่างตอน login ครั้งแรก ยังไม่มีสินค้า
  test('should show empty cart on first visit', async () => {
    await inventoryPage.goToCart();
    await cartPage.expectToBeOnCartPage();
    await cartPage.expectItemCount(0);
  });

  // happy path — เพิ่มสินค้า 1 ชิ้น ต้องปรากฏใน cart พร้อมชื่อถูกต้อง
  test('should show added item in cart', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.expectToBeOnCartPage();
    await cartPage.expectItemCount(1);
    const names = await cartPage.getItemNames();
    expect(names).toContain('Sauce Labs Backpack');
  });

  // happy path — เพิ่มหลายชิ้น ต้องนับจำนวนได้ถูกต้อง
  test('should show multiple items in cart', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
    await inventoryPage.addItemToCartByName('Sauce Labs Bolt T-Shirt');
    await inventoryPage.goToCart();
    await cartPage.expectItemCount(3);
  });

  // functional — ลบสินค้าจากหน้า cart (ต่างจากลบจากหน้า inventory)
  // หลังลบ Backpack ออก ต้องเหลือแค่ Bike Light และ Backpack ต้องไม่อยู่ใน list
  test('should remove item from cart page', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
    await inventoryPage.goToCart();
    await cartPage.removeItemByName('Sauce Labs Backpack');
    await cartPage.expectItemCount(1);
    const names = await cartPage.getItemNames();
    expect(names).not.toContain('Sauce Labs Backpack');
  });

  // persistence — cart ต้องจำสินค้าไว้หลังกลับมาที่หน้า inventory
  // ถ้า session state พัง badge จะหายและ cart จะว่างเปล่า
  test('should persist cart after navigating back to inventory', async () => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.continueShopping();
    await inventoryPage.expectToBeOnInventoryPage();
    await inventoryPage.expectCartBadge(1);
  });

  // state cleanup — ลบสินค้าชิ้นสุดท้าย badge ต้องหายไปทั้งหมด
  test('should update cart badge after removing item from cart page', async ({ page }) => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.removeItemByName('Sauce Labs Backpack');
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  // data integrity — ราคาที่แสดงใน cart ต้องตรงกับราคาในหน้า inventory
  // hardcode $29.99 เพราะ Sauce Demo ราคาไม่เคยเปลี่ยน
  test('should show correct item price in cart', async ({ page }) => {
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    const price = page.locator('.cart_item .inventory_item_price');
    await expect(price).toHaveText('$29.99');
  });
});
