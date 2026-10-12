import { test, expect } from '@playwright/test';

test('test repository shows correct metrics', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto('./');
  await page.getByTestId('demo').click();
  await page.getByTestId('analyse-live').click();

  const deploymentFrequency = page.getByTestId('metric-deploymentFrequency');
  await expect(deploymentFrequency).toBeVisible({ timeout: 60_000 });
  await expect(deploymentFrequency.getByRole('heading')).toContainText('Deployment frequency');
});