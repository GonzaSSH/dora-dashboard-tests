import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('sidebar lists the three saved examples', async ({ page }) => {
  const sidebar = page.getByTestId('sidebar');
  await expect(sidebar.getByRole('heading', { name: 'DORA Dashboard' })).toBeVisible();
  await expect(page.getByTestId('demo')).toContainText('The test repository');
  await expect(page.getByTestId('demo-angular')).toContainText('angular/angular');
  await expect(page.getByTestId('demo-dashboard')).toContainText('This dashboard');
});

test('the date range defaults to the last 90 days', async ({ page }) => {
  const today = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - 89 * 86_400_000).toISOString().slice(0, 10);
  await expect(page.getByTestId('to-input')).toHaveValue(today);
  await expect(page.getByTestId('from-input')).toHaveValue(from);
  await expect(page.getByTestId('repo-input')).toHaveValue('');
});

test('the about section explains all five metrics', async ({ page }) => {
  const about = page.locator('#about');
  for (const title of ['Deployment frequency', 'Change lead time', 'Change failure rate', 'Failed deployment recovery time', 'Rework rate']) {
    await expect(about).toContainText(title);
  }
});

test('the Settings link opens the settings panel', async ({ page }) => {
  const settings = page.getByTestId('settings');
  await expect(settings).not.toHaveAttribute('open');
  await page.getByTestId('open-settings').click();
  await expect(settings).toHaveAttribute('open');
  await expect(page.getByTestId('source-select')).toBeVisible();
  await expect(page.getByTestId('rework-rule')).toBeVisible();
});

test('an invalid repository name shows an error without calling GitHub', async ({ page }) => {
  const calls: string[] = [];
  await page.route('https://api.github.com/**', (route) => {
    calls.push(route.request().url());
    return route.abort();
  });
  await page.getByTestId('repo-input').fill('just-a-name');
  await page.getByTestId('analyse').click();
  await expect(page.getByTestId('error')).toContainText('owner/name');
  await expect(page.getByTestId('results')).toBeHidden();
  expect(calls).toEqual([]);
});
