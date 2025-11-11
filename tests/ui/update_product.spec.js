
import { test, expect } from '@playwright/test';

test.describe('Update Product Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@admin.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('$2b$10$nyzaFOPhn/01AbiQtp6qEeyLY81ppGWL6oiB3WwwD2JZIuTU3OxKa');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to Update Product page
    await page.getByRole('button', { name: 'renaAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('link', { name: /update/i }).first().click(); // Assumes there's a link to update a product

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('should show error when name is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('');
    await page.getByPlaceholder('write a description').fill('Valid description');
    await page.getByPlaceholder('write a price').fill('100');
    await page.getByPlaceholder('write a quantity').fill('10');

    await page.getByRole('button', { name: 'PLEASE WAIT FOR THE FINAL PART' }).click();
    await expect(page.getByText(/Name is Required/i)).toBeVisible();
  });

  test('should show error when description is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('Valid Name');
    await page.getByPlaceholder('write a description').fill('');
    await page.getByPlaceholder('write a price').fill('100');
    await page.getByPlaceholder('write a quantity').fill('10');

    await page.getByRole('button', { name: 'PLEASE WAIT FOR THE FINAL PART' }).click();
    await expect(page.getByText(/Description is Required/i)).toBeVisible();
  });

  test('should show error when price is negative', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('Valid Name');
    await page.getByPlaceholder('write a description').fill('Valid description');
    await page.getByPlaceholder('write a price').fill('-100');
    await page.getByPlaceholder('write a quantity').fill('10');

    await page.getByRole('button', { name: 'PLEASE WAIT FOR THE FINAL PART' }).click();
    await expect(page.getByText(/Invalid value for price/i)).toBeVisible();
  });

  test('should show error when quantity is negative', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('Valid Name');
    await page.getByPlaceholder('write a description').fill('Valid description');
    await page.getByPlaceholder('write a price').fill('100');
    await page.getByPlaceholder('write a quantity').fill('-10');

    await page.getByRole('button', { name: 'PLEASE WAIT FOR THE FINAL PART' }).click();
    await expect(page.getByText(/Invalid value for quantity/i)).toBeVisible();
  });

  test('should successfully update product', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('Updated Product Name');
    await page.getByPlaceholder('write a description').fill('Updated description');
    await page.getByPlaceholder('write a price').fill('150');
    await page.getByPlaceholder('write a quantity').fill('20');

    await page.getByRole('button', { name: 'PLEASE WAIT FOR THE FINAL PART' }).click();
    await expect(page.getByText(/Product Updated Successfully/i)).toBeVisible();
  });

  test('should delete product after confirmation', async ({ page }) => {
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
    await expect(page.getByText(/Product Deleted Successfully/i)).toBeVisible();
  });

  test('should allow file upload', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="file-input"]');
      if (!input) throw new Error("File input not found");

      const fakeFile = new File(["dummy"], "mock.png", { type: "image/png" });
      const dt = new DataTransfer();
      dt.items.add(fakeFile);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await expect(page.locator('img[alt="product_photo"]')).toBeVisible();
  });
});
