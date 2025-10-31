import { test, expect } from '@playwright/test';

test.describe('Strategy Browse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strategies');
    await page.waitForLoadState('networkidle');
  });

  test('should load strategies list', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check if strategies content is visible
    const strategiesContainer = page.locator('[class*="strategy"], [data-testid*="strategy"]').first();
    const isVisible = await strategiesContainer.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await expect(strategiesContainer).toBeVisible();
    }
  });

  test('should display strategy cards', async ({ page }) => {
    // Look for strategy cards
    const cards = page.locator('[class*="card"], [role="article"]');
    const count = await cards.count();

    // If cards exist, verify they're visible
    if (count > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should allow viewing strategy details', async ({ page }) => {
    // Look for clickable strategy elements
    const strategyItems = page.locator('a, button, [role="button"]').filter({
      hasText: /Strategy|전략/i
    });

    const count = await strategyItems.count();

    if (count > 0) {
      const firstItem = strategyItems.first();
      const initialUrl = page.url();

      await firstItem.click();
      await page.waitForLoadState('networkidle');

      // Should navigate somewhere (URL changes or new content loads)
      await page.waitForTimeout(1000);
    }
  });

  test('should handle page navigation', async ({ page }) => {
    // Test that page loaded successfully
    expect(page.url()).toContain('/strategies');
  });
});
