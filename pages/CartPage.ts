import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับหน้าตะกร้าสินค้า (/cart.html)
export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;             // ครอบทุก row สินค้าในตะกร้า
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page                   = page;
    this.title                  = page.locator('.title');
    this.cartItems              = page.locator('.cart_item');
    this.checkoutButton         = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  // ตรวจสอบว่าอยู่ที่หน้า cart จริง
  async expectToBeOnCartPage() {
    await expect(this.page).toHaveURL('/cart.html');
    await expect(this.title).toHaveText('Your Cart');
  }

  // ตรวจสอบจำนวนสินค้าในตะกร้า
  async expectItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  // กดปุ่ม Remove ของสินค้าที่ระบุชื่อ
  // id ของปุ่มขึ้นต้นด้วย "remove" เสมอ เช่น "remove-sauce-labs-backpack"
  async removeItemByName(name: string) {
    const item = this.cartItems.filter({ hasText: name });
    await item.locator('button[id^="remove"]').click();
  }

  // ดึงชื่อสินค้าทุกชิ้นในตะกร้าออกมาเป็น array
  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allTextContents();
  }

  // กดปุ่ม Checkout เพื่อไปหน้ากรอกข้อมูลการจัดส่ง
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  // กดปุ่ม Continue Shopping เพื่อกลับหน้า inventory
  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
