import { test, expect } from '@playwright/test';

test.describe('Admin Create Product Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login flow
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('safwanuser@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(safwanuser);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to Create Product page
    await page.getByRole('button', { name: /admin/i }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Product' }).click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Mock file upload
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="file-input"]');
      if (!input) throw new Error("File input not found");

      const fakeFile = new File(["dummy"], "mock.png", { type: "image/png" });
      const dt = new DataTransfer();
      dt.items.add(fakeFile);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  test('shows error when name is missing', async ({ page }) => {
    await page.getByPlaceholder('write a description').fill('Product without name');
    await page.getByPlaceholder('write a price').fill('10');
    await page.getByPlaceholder('write a quantity').fill('5');

    await page.locator('.ant-select').first().click({ force: true });
    await page.locator('.ant-select-item-option-content').first().click();

    await page.locator('.ant-select').nth(1).click({ force: true });
    await page.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Name is Required/i)).toBeVisible();
  });

  test('shows error when description is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('No Description Product');
    await page.getByPlaceholder('write a price').fill('10');
    await page.getByPlaceholder('write a quantity').fill('5');

    await page.locator('.ant-select').first().click({ force: true });
    await page.locator('.ant-select-item-option-content').first().click();

    await page.locator('.ant-select').nth(1).click({ force: true });
    await page.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Description is Required/i)).toBeVisible();
  });

  test('shows error when price is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('No Price Product');
    await page.getByPlaceholder('write a description').fill('Missing price field');
    await page.getByPlaceholder('write a quantity').fill('5');

    await page.locator('.ant-select').first().click({ force: true });
    await page.locator('.ant-select-item-option-content').first().click();

    await page.locator('.ant-select').nth(1).click({ force: true });
    await page.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Price is Required/i)).toBeVisible();
  });

  test('shows error when quantity is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('No Quantity Product');
    await page.getByPlaceholder('write a description').fill('Missing quantity');
    await page.getByPlaceholder('write a price').fill('15');

    await page.locator('.ant-select').first().click({ force: true });
    await page.locator('.ant-select-item-option-content').first().click();

    await page.locator('.ant-select').nth(1).click({ force: true });
    await page.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Quantity is Required/i)).toBeVisible();
  });

  test('shows error when category is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('No Category Product');
    await page.getByPlaceholder('write a description').fill('Missing category');
    await page.getByPlaceholder('write a price').fill('20');
    await page.getByPlaceholder('write a quantity').fill('10');

    await page.locator('.ant-select').nth(1).click({ force: true });
    await page.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Category is Required/i)).toBeVisible();
  });

  test('shows error when price is negative', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('Negative Price');
    await page.getByPlaceholder('write a description').fill('Test invalid price');
    await page.getByPlaceholder('write a price').fill('-10');
    await page.getByPlaceholder('write a quantity').fill('5');

    await page.locator('.ant-select').first().click({ force: true });
    await page.locator('.ant-select-item-option-content').first().click();
    await page.locator('.ant-select').nth(1).click({ force: true });
    await page.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Invalid value for price/i)).toBeVisible();
  });

  test('shows error when quantity is negative', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('Negative Quantity');
    await page.getByPlaceholder('write a description').fill('Test invalid quantity');
    await page.getByPlaceholder('write a price').fill('20');
    await page.getByPlaceholder('write a quantity').fill('-5');

    await page.locator('.ant-select').first().click({ force: true });
    await page.locator('.ant-select-item-option-content').first().click();
    await page.locator('.ant-select').nth(1).click({ force: true });
    await page.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Invalid value for quantity/i)).toBeVisible();
  });

  test('successfully creates product with valid inputs', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('Valid Product');
    await page.getByPlaceholder('write a description').fill('This is a valid product');
    await page.getByPlaceholder('write a price').fill('100');
    await page.getByPlaceholder('write a quantity').fill('10');

    await page.locator('.ant-select').first().click({ force: true });
    await page.locator('.ant-select-item-option-content').first().click();
    await page.locator('.ant-select').nth(1).click({ force: true });
    await page.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Product Created Successfully/i)).toBeVisible();
  });
});