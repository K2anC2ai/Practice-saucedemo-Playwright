import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

// test suite สำหรับขั้นตอน checkout ทั้งหมด
// ครอบคลุม: form validation, happy path, post-order state
test.describe('Checkout Flow', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  // setup ทุก test ให้อยู่ที่จุดเริ่มต้นของ checkout เสมอ
  // login → เพิ่มสินค้า → ไป cart → กด Checkout
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    inventoryPage = new InventoryPage(page);
    cartPage      = new CartPage(page);
    checkoutPage  = new CheckoutPage(page);

    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
  });

  // navigation — ยืนยันว่า setup ถูกต้อง อยู่ที่ step 1
  test('should reach checkout step 1 from cart', async () => {
    await checkoutPage.expectToBeOnCheckoutStep1();
  });

  // boundary — ส่ง form โดยไม่กรอก first name
  // test แต่ละ field แยกกันเพื่อให้รู้ว่า validation ตัวไหนทำงาน
  test('should show error when first name is missing', async () => {
    await checkoutPage.fillShippingInfo('', 'Doe', '10110');
    await checkoutPage.expectErrorMessage('First Name is required');
  });

  // boundary — ส่ง form โดยไม่กรอก last name
  test('should show error when last name is missing', async () => {
    await checkoutPage.fillShippingInfo('John', '', '10110');
    await checkoutPage.expectErrorMessage('Last Name is required');
  });

  // boundary — ส่ง form โดยไม่กรอก postal code
  test('should show error when postal code is missing', async () => {
    await checkoutPage.fillShippingInfo('John', 'Doe', '');
    await checkoutPage.expectErrorMessage('Postal Code is required');
  });

  // happy path — กรอกครบถ้วน ต้องไป step 2 ได้
  test('should proceed to order summary after filling shipping info', async () => {
    await checkoutPage.fillShippingInfo('John', 'Doe', '10110');
    await checkoutPage.expectToBeOnCheckoutStep2();
  });

  // data presence — หน้า summary ต้องแสดง order total (ไม่ verify ตัวเลขเพราะ tax อาจเปลี่ยน)
  test('should display order total on summary page', async ({ page }) => {
    await checkoutPage.fillShippingInfo('John', 'Doe', '10110');
    const total = page.locator('.summary_total_label');
    await expect(total).toBeVisible();
    await expect(total).toContainText('Total: $');
  });

  // end-to-end happy path — ทำ checkout จนจบ ต้องเห็นหน้า confirmation
  test('should complete order successfully', async () => {
    await checkoutPage.fillShippingInfo('John', 'Doe', '10110');
    await checkoutPage.finish();
    await checkoutPage.expectOrderConfirmed();
  });

  // post-order state — หลังสั่งซื้อสำเร็จ กลับ inventory แล้ว cart ต้องว่าง
  test('should clear cart after successful order', async ({ page }) => {
    await checkoutPage.fillShippingInfo('John', 'Doe', '10110');
    await checkoutPage.finish();
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  // escape hatch — กด Cancel ต้องกลับ cart ได้ ไม่ใช่กลับ inventory
  test('should cancel checkout and return to cart', async ({ page }) => {
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL('/cart.html');
  });
});
