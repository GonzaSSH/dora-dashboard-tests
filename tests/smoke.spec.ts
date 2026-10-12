import { test, expect } from '@playwright/test';

test('dashboard loads', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('DORA Dashboard');
  await expect(page.getByRole('button', { name: 'Analyse' })).toBeVisible();
});