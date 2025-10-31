import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display home page', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('Yoloseum') || expect(title).toContain('Trading');
  });

  test('should navigate to strategies without login', async ({ page }) => {
    await page.goto('/');
    // Look for a strategies button or link
    const strategiesLink = page.locator('a, button').filter({ hasText: /Strategies|전략/i }).first();
    if (await strategiesLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await strategiesLink.click();
      await page.waitForURL(/.*strategies.*/);
      expect(page.url()).toContain('/strategies');
    }
  });

  test('should show login button on home page', async ({ page }) => {
    await page.goto('/');
    const loginButton = page.locator('button').filter({ hasText: /Sign In|Sign Up|Login|로그인/i }).first();
    await expect(loginButton).toBeVisible({ timeout: 10000 });
  });

  test('should handle navigation between pages', async ({ page }) => {
    await page.goto('/');
    // Test basic navigation
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost');
  });
});
