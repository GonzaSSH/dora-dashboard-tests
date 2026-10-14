// The saved examples load stored results, so these tests never call the GitHub API.
import { test, expect } from '@playwright/test';

const METRICS = ['deploymentFrequency', 'leadTime', 'changeFailureRate', 'recoveryTime', 'reworkRate'];

test('the test repository demo shows the hand-worked metric values', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('demo').click();

  await expect(page.getByTestId('repo-link')).toHaveText('GonzaSSH/dora-sandbox');
  await expect(page.getByTestId('value-deploymentFrequency')).toHaveText('0.78 per week');
  await expect(page.getByTestId('value-leadTime')).toHaveText('2.0 days');
  await expect(page.getByTestId('value-changeFailureRate')).toHaveText('40%');
  await expect(page.getByTestId('value-recoveryTime')).toHaveText('33 hours');
  await expect(page.getByTestId('value-reworkRate')).toHaveText('40%');
});

test('a demo is labelled as a saved result and makes no GitHub requests', async ({ page }) => {
  const calls: string[] = [];
  page.on('request', (req) => {
    if (req.url().startsWith('https://api.github.com/')) calls.push(req.url());
  });
  await page.goto('./?demo=sandbox');

  await expect(page.getByTestId('snapshot-note')).toContainText('Saved result from');
  await expect(page.getByTestId('requests-used')).toHaveText('saved result: no GitHub requests used now');
  await expect(page.getByTestId('analyse-live')).toBeVisible();
  expect(calls).toEqual([]);
});

test('only the two measured metrics get a rating; the other three are proxies', async ({ page }) => {
  await page.goto('./?demo=sandbox');
  for (const key of METRICS) {
    await expect(page.getByTestId(`metric-${key}`)).toBeVisible();
  }
  for (const key of ['deploymentFrequency', 'leadTime']) {
    await expect(page.getByTestId(`rating-${key}`)).toBeVisible();
    await expect(page.getByTestId(`proxy-${key}`)).toHaveCount(0);
  }
  for (const key of ['changeFailureRate', 'recoveryTime', 'reworkRate']) {
    await expect(page.getByTestId(`proxy-${key}`)).toHaveText('Proxy');
    await expect(page.getByTestId(`rating-${key}`)).toHaveCount(0);
  }
});

test('clicking a demo marks it current and puts it in the shareable address', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('demo-angular').click();

  await expect(page.getByTestId('repo-link')).toHaveText('angular/angular');
  await expect(page.getByTestId('demo-angular')).toHaveAttribute('aria-current', 'true');
  await expect(page.getByTestId('demo')).not.toHaveAttribute('aria-current');
  await expect(page).toHaveURL(/[?&]demo=angular/);
});

test('the deployments table lists every release with its classification', async ({ page }) => {
  await page.goto('./?demo=sandbox');
  const table = page.locator('details.deployments');
  await table.locator('summary').click();

  await expect(table.locator('tbody tr')).toHaveCount(10);
  await expect(page.getByTestId('deployment-v1.2.0')).toContainText('Quick patch');
  await expect(page.getByTestId('deployment-v1.3.0')).toContainText('Revert');
});
