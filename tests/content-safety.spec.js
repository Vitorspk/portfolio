const { test, expect } = require('@playwright/test');

test.describe('Content Safety', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all external links have rel="noopener noreferrer"', async ({ page }) => {
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel');
      expect(rel, `Link ${i} missing rel`).toContain('noopener');
      expect(rel, `Link ${i} missing noreferrer`).toContain('noreferrer');
    }
  });

  test('no leaked corporate domains', async ({ page }) => {
    const html = await page.content();
    const blockedPatterns = [
      /intelipost\.com\.br/i,
      /dasalabs\.com\.br/i,
      /dasa\.com\.br/i,
      /\.internal\.\w+/i,
      /viavarejo-kafka/i,
    ];
    for (const pattern of blockedPatterns) {
      expect(html).not.toMatch(pattern);
    }
  });

  test('no leaked AWS/Azure credentials', async ({ page }) => {
    const html = await page.content();
    const secretPatterns = [
      /AKIA[0-9A-Z]{16}/,
      /sk-[a-zA-Z0-9]{20,}/,
      /ghp_[a-zA-Z0-9]{36}/,
      /subscriptionId:\s*[0-9a-f-]{36}/i,
      /tenantId:\s*[0-9a-f-]{36}/i,
      /clientSecret:\s*\w+/i,
    ];
    for (const pattern of secretPatterns) {
      expect(html).not.toMatch(pattern);
    }
  });

  test('no inline event handlers', async ({ page }) => {
    const handlers = ['onclick', 'onmouseover', 'onmouseout', 'onload', 'onerror', 'onsubmit'];
    for (const handler of handlers) {
      const elements = page.locator(`[${handler}]`);
      const count = await elements.count();
      expect(count, `Found ${handler} attribute`).toBe(0);
    }
  });

  test('structured data (ld+json) is valid JSON', async ({ page }) => {
    const ldJsonScripts = page.locator('script[type="application/ld+json"]');
    const count = await ldJsonScripts.count();
    for (let i = 0; i < count; i++) {
      const content = await ldJsonScripts.nth(i).textContent();
      const parsed = JSON.parse(content);
      expect(parsed['@context']).toBeTruthy();
      expect(parsed['@type']).toBeTruthy();
    }
  });

  test('no ECR image URIs or AWS account IDs', async ({ page }) => {
    const html = await page.content();
    expect(html).not.toMatch(/\d{12}\.dkr\.ecr\./);
    expect(html).not.toMatch(/0b397135-7b70/);
  });
});
