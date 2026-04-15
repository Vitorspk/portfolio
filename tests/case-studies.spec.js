const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 1280, height: 800 } });

test.describe('Case Studies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#tab-cases').click();
    await expect(page.locator('#cases')).toHaveAttribute('aria-hidden', 'false');
  });

  test('all case studies start collapsed', async ({ page }) => {
    const caseStudies = page.locator('#cases .case-study');
    const count = await caseStudies.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(caseStudies.nth(i)).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('clicking header expands case study', async ({ page }) => {
    const firstHeader = page.locator('#cases .case-header').first();
    const firstStudy = page.locator('#cases .case-study').first();
    await firstHeader.click();
    await expect(firstStudy).toHaveAttribute('aria-expanded', 'true');
    const body = firstStudy.locator('.case-body');
    await expect(body).toBeVisible();
  });

  test('clicking again collapses case study', async ({ page }) => {
    const firstHeader = page.locator('#cases .case-header').first();
    const firstStudy = page.locator('#cases .case-study').first();
    await firstHeader.click();
    await expect(firstStudy).toHaveAttribute('aria-expanded', 'true');
    await firstHeader.click();
    await expect(firstStudy).toHaveAttribute('aria-expanded', 'false');
  });

  test('expanding one does not collapse another', async ({ page }) => {
    const headers = page.locator('#cases .case-header');
    const studies = page.locator('#cases .case-study');
    await headers.nth(0).click();
    await expect(studies.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await headers.nth(1).click();
    await expect(studies.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(studies.nth(0)).toHaveAttribute('aria-expanded', 'true');
  });

  test('SVG diagrams render when case study is expanded', async ({ page }) => {
    const caseStudies = page.locator('#cases .case-study');
    const count = await caseStudies.count();
    let svgFound = 0;
    for (let i = 0; i < count; i++) {
      const study = caseStudies.nth(i);
      const svgs = study.locator('.architecture-diagram svg');
      if (await svgs.count() > 0) {
        await study.locator('.case-header').click();
        await expect(study).toHaveAttribute('aria-expanded', 'true');
        const svg = svgs.first();
        await expect(svg).toHaveAttribute('aria-hidden', 'true');
        await expect(svg).toHaveAttribute('focusable', 'false');
        const viewBox = await svg.getAttribute('viewBox');
        expect(viewBox).toBeTruthy();
        svgFound++;
      }
    }
    expect(svgFound).toBeGreaterThanOrEqual(2);
  });

  test('case study headers are keyboard accessible', async ({ page }) => {
    const firstHeader = page.locator('#cases .case-header').first();
    const firstStudy = page.locator('#cases .case-study').first();
    await firstHeader.focus();
    await page.keyboard.press('Enter');
    await expect(firstStudy).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Enter');
    await expect(firstStudy).toHaveAttribute('aria-expanded', 'false');
  });

  test('Business Impact section is visible when expanded', async ({ page }) => {
    const caseStudies = page.locator('#cases .case-study');
    const count = await caseStudies.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const study = caseStudies.nth(i);
      await study.locator('.case-header').click();
      await expect(study).toHaveAttribute('aria-expanded', 'true');
      const impact = study.locator('.impact-metrics');
      if (await impact.count() > 0) {
        await expect(impact.first()).toBeVisible();
      }
    }
  });
});
