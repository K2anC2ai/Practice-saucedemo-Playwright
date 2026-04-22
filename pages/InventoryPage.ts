import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับหน้า Products (/inventory.html)
// หน้านี้แสดงรายการสินค้า, sort, และ cart badge
export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryItems: Locator; // ครอบทุก product card บนหน้า
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;     // ตัวเลขสีแดงบน cart icon
  readonly cartIcon: Locator;
  readonly burgerMenu: Locator;    // ปุ่ม ☰ มุมบนซ้าย

  constructor(page: Page) {
    this.page           = page;
    this.title          = page.locator('.title');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown   = page.locator('[data-test="product-sort-container"]');
    this.cartBadge      = page.locator('.shopping_cart_badge');
    this.cartIcon       = page.locator('.shopping_cart_link');
    this.burgerMenu     = page.locator('#react-burger-menu-btn');
  }

  // ตรวจสอบว่าอยู่ที่หน้า inventory จริง (เช็คทั้ง URL และ heading)
  async expectToBeOnInventoryPage() {
    await expect(this.page).toHaveURL('/inventory.html');
    await expect(this.title).toHaveText('Products');
  }

  // กด "Add to cart" ของสินค้าที่ระบุชื่อ
  // ใช้ .filter() เพื่อหา card ที่มีข้อความชื่อสินค้านั้น แล้วกด button ใน card นั้น
  async addItemToCartByName(name: string) {
    const item = this.page.locator('.inventory_item').filter({ hasText: name });
    await item.locator('button').click();
  }

  // กด "Remove" ของสินค้าที่ระบุชื่อ (ปุ่มเดิมหลังจาก add แล้ว)
  async removeItemFromInventoryByName(name: string) {
    const item = this.page.locator('.inventory_item').filter({ hasText: name });
    await item.locator('button').click();
  }

  // เลือก option ใน sort dropdown
  // 'az' | 'za' | 'lohi' | 'hilo' คือ value ของ <option> ใน HTML
  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  // ดึงชื่อสินค้าทุกชิ้นบนหน้าออกมาเป็น array
  // ใช้สำหรับ verify ว่า sort ทำงานถูกต้อง
  async getItemNames(): Promise<string[]> {
    return this.inventoryItems.locator('.inventory_item_name').allTextContents();
  }

  // ดึงราคาสินค้าทุกชิ้นออกมาเป็น number array
  // .replace('$', '') ตัด $ ออกก่อน parseFloat
  async getItemPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItems
      .locator('.inventory_item_price')
      .allTextContents();
    return priceTexts.map((p) => parseFloat(p.replace('$', '')));
  }

  // กดชื่อสินค้าเพื่อเข้าหน้า detail
  async clickItemByName(name: string) {
    await this.page.locator('.inventory_item_name').filter({ hasText: name }).click();
  }

  // กด cart icon เพื่อไปหน้าตะกร้า
  async goToCart() {
    await this.cartIcon.click();
  }

  // ตรวจสอบว่า cart badge แสดงตัวเลขถูกต้อง
  async expectCartBadge(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  // ตรวจสอบว่า cart badge หายไป (cart ว่าง)
  async expectCartBadgeHidden() {
    await expect(this.cartBadge).not.toBeVisible();
  }
}
