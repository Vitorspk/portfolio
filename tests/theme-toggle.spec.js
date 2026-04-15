const { test, expect } = require('@playwright/test');

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('default theme is dark', async ({ page }) => {
    const theme = await page.locator('html').getAttribute('data-theme');
    expect(theme === null || theme === 'dark').toBeTruthy();
  });

  test('toggle switches to light theme', async ({ page }) => {
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('toggle back to dark theme', async ({ page }) => {
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('theme persists across reload', async ({ page }) => {
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('aria-label updates on toggle', async ({ page }) => {
    const labelBefore = await page.locator('#themeToggle').getAttribute('aria-label');
    await page.locator('#themeToggle').click();
    const labelAfter = await page.locator('#themeToggle').getAttribute('aria-label');
    expect(labelBefore).not.toBe(labelAfter);
  });
});
