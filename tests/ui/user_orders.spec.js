import { test, expect } from '@playwright/test';

test.describe('User Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login flow
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@admin.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('$2b$10$nyzaFOPhn/01AbiQtp6qEeyLY81ppGWL6oiB3WwwD2JZIuTU3OxKa');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to Orders page
    await page.getByRole('button', { name: /user/i }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Orders' }).click();

    await page.waitForLoadState('domcontentloaded');
  });

  test('should display orders table with correct headers', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /all orders/i })).toBeVisible();
    const headers = ['#', 'Status', 'Buyer', 'date', 'Payment', 'Quantity'];
    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeVisible();
    }
  });

  test('should display order rows and product cards', async ({ page }) => {
    const orderRows = page.locator('table tbody tr');
    await expect(orderRows).toHaveCountGreaterThan(0);

    const productCards = page.locator('.card.flex-row');
    await expect(productCards).toHaveCountGreaterThan(0);
  });

  test('should show product image and details', async ({ page }) => {
    const firstCard = page.locator('.card.flex-row').first();
    await expect(firstCard.locator('img')).toBeVisible();
    await expect(firstCard.locator('p')).nth(0).toBeVisible(); // Product name
    await expect(firstCard.locator('p')).nth(2).toContainText(/price/i);
  });
});