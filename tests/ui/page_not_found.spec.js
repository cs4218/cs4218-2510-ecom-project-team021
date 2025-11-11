import { test, expect } from '@playwright/test';

test.describe('Page Not Found', () => {
  test('should display 404 message and Go Back link', async ({ page }) => {
    await page.goto('http://localhost:3000/some-nonexistent-page');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/oops ! page not found/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /go back/i })).toBeVisible();
  });

  test('should navigate back to home when Go Back is clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/some-nonexistent-page');
    await page.getByRole('link', { name: /go back/i }).click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});