const { test, expect } = require('@playwright/test');

const TAB_NAMES = ['overview', 'cases', 'experience', 'aiml', 'finops', 'technical', 'achievements', 'skills', 'projects'];

test.use({ viewport: { width: 1280, height: 800 } });

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('default state: overview is active on load', async ({ page }) => {
    const overviewPanel = page.locator('#overview');
    await expect(overviewPanel).toHaveAttribute('aria-hidden', 'false');
    const overviewTab = page.locator('#tab-overview');
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  test('only one panel visible at a time', async ({ page }) => {
    const visiblePanels = page.locator('[role="tabpanel"][aria-hidden="false"]');
    await expect(visiblePanels).toHaveCount(1);
  });

  test('clicking each sidebar tab activates correct panel', async ({ page }) => {
    for (const name of TAB_NAMES) {
      await page.locator(`#tab-${name}`).click();
      await expect(page.locator(`#${name}`)).toHaveAttribute('aria-hidden', 'false');
      await expect(page.locator(`#tab-${name}`)).toHaveAttribute('aria-selected', 'true');
      const visiblePanels = page.locator('[role="tabpanel"][aria-hidden="false"]');
      await expect(visiblePanels).toHaveCount(1);
    }
  });

  test('URL hash navigation loads correct tab', async ({ page }) => {
    await page.goto('/#cases');
    await page.waitForFunction(() => {
      const panel = document.querySelector('#cases');
      return panel && panel.getAttribute('aria-hidden') === 'false';
    });
    await expect(page.locator('#cases')).toHaveAttribute('aria-hidden', 'false');
  });

  test('invalid hash falls back to overview', async ({ page }) => {
    await page.goto('/#nonexistent');
    await expect(page.locator('#overview')).toHaveAttribute('aria-hidden', 'false');
  });

  test('browser back/forward navigates tabs', async ({ page }) => {
    await page.locator('#tab-skills').click();
    await expect(page.locator('#skills')).toHaveAttribute('aria-hidden', 'false');

    await page.locator('#tab-cases').click();
    await expect(page.locator('#cases')).toHaveAttribute('aria-hidden', 'false');

    await page.goBack();
    await page.waitForFunction(() => {
      const panel = document.querySelector('#skills');
      return panel && panel.getAttribute('aria-hidden') === 'false';
    });
    await expect(page.locator('#skills')).toHaveAttribute('aria-hidden', 'false');

    await page.goForward();
    await page.waitForFunction(() => {
      const panel = document.querySelector('#cases');
      return panel && panel.getAttribute('aria-hidden') === 'false';
    });
    await expect(page.locator('#cases')).toHaveAttribute('aria-hidden', 'false');
  });

  test('ARIA consistency: controls match panel IDs', async ({ page }) => {
    for (const name of TAB_NAMES) {
      const tab = page.locator(`#tab-${name}`);
      await expect(tab).toHaveAttribute('aria-controls', name);
      const panel = page.locator(`#${name}`);
      await expect(panel).toHaveAttribute('aria-labelledby', `tab-${name}`);
    }
  });

  test('active tab has tabindex 0, others have -1', async ({ page }) => {
    await expect(page.locator('#tab-overview')).toHaveAttribute('tabindex', '0');
    for (const name of TAB_NAMES.slice(1)) {
      await expect(page.locator(`#tab-${name}`)).toHaveAttribute('tabindex', '-1');
    }
  });
});
