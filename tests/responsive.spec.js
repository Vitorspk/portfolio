const { test, expect } = require('@playwright/test');

test.describe('Responsive Layout', () => {
  test.describe('Mobile viewport', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('sidebar is hidden on mobile', async ({ page }) => {
      await expect(page.locator('.sidebar')).not.toBeVisible();
    });

    test('mobile tabs are visible', async ({ page }) => {
      await expect(page.locator('.mobile-tabs')).toBeVisible();
    });

    test('sidebar nav has inert on mobile', async ({ page }) => {
      const sidebarNav = page.locator('.sidebar-nav');
      await expect(sidebarNav).toHaveAttribute('inert', '');
    });

    test('mobile tab click navigates correctly', async ({ page }) => {
      const mobileTab = page.locator('#mobile-tab-cases');
      await mobileTab.click();
      await expect(page.locator('#cases')).toHaveAttribute('aria-hidden', 'false');
    });

    test('topbar is visible on mobile', async ({ page }) => {
      await expect(page.locator('.topbar')).toBeVisible();
    });
  });

  test.describe('Desktop viewport', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('sidebar is visible on desktop', async ({ page }) => {
      await expect(page.locator('.sidebar')).toBeVisible();
    });

    test('mobile tabs have inert on desktop', async ({ page }) => {
      const mobileTabs = page.locator('.mobile-tabs');
      await expect(mobileTabs).toHaveAttribute('inert', '');
    });

    test('sidebar tablist is not inert on desktop', async ({ page }) => {
      const sidebarNav = page.locator('.sidebar-nav');
      const hasInert = await sidebarNav.getAttribute('inert');
      expect(hasInert).toBeNull();
    });
  });
});
