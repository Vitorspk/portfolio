const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.use({ viewport: { width: 1280, height: 800 } });

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('axe-core: no violations on overview tab', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.mobile-tabs[inert]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('skip link is first focusable element', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit mobile does not support Tab key focus navigation');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement.className);
    expect(focused).toContain('skip-link');
  });

  test('skip link targets main content', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    const href = await skipLink.getAttribute('href');
    expect(href).toBe('#main-content');
    const target = page.locator('#main-content');
    await expect(target).toHaveCount(1);
  });

  test('all tabpanels have aria-labelledby', async ({ page }) => {
    const panels = page.locator('[role="tabpanel"]');
    const count = await panels.count();
    expect(count).toBe(9);
    for (let i = 0; i < count; i++) {
      const labelledBy = await panels.nth(i).getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      const tab = page.locator(`#${labelledBy}`);
      await expect(tab).toHaveCount(1);
    }
  });

  test('all tab buttons have aria-controls', async ({ page }) => {
    const tabs = page.locator('.sidebar-nav [role="tab"]');
    const count = await tabs.count();
    expect(count).toBe(9);
    for (let i = 0; i < count; i++) {
      const controls = await tabs.nth(i).getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      const panel = page.locator(`#${controls}`);
      await expect(panel).toHaveCount(1);
    }
  });

  test('decorative elements are not focusable', async ({ page }) => {
    const decorative = page.locator('[aria-hidden="true"][tabindex]');
    const count = await decorative.count();
    for (let i = 0; i < count; i++) {
      const tabindex = await decorative.nth(i).getAttribute('tabindex');
      expect(Number(tabindex)).toBeLessThanOrEqual(0);
    }
  });

  test('theme toggle has accessible label', async ({ page }) => {
    const toggle = page.locator('#themeToggle');
    const label = await toggle.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label.toLowerCase()).toContain('theme');
  });
});
