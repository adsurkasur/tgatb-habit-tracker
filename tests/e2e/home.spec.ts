import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows app title', async ({ page, baseURL }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/habit/i);
  });
});
