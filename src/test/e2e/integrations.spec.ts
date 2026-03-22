import { test, expect } from '@playwright/test'

test.describe('Integrations Page', () => {
  test('should load integrations page', async ({ page }) => {
    await page.goto('/integrations')
    await expect(page.getByRole('heading', { name: /integration/i })).toBeVisible()
  })

  test('should show integration cards', async ({ page }) => {
    await page.goto('/integrations')
    await expect(page.getByText('Salesforce')).toBeVisible()
    await expect(page.getByText('HubSpot')).toBeVisible()
  })

  test('should navigate to integration detail', async ({ page }) => {
    await page.goto('/integrations')
    await page.getByText('Salesforce').click()
    await expect(page.getByRole('heading', { name: /salesforce/i })).toBeVisible()
  })
})