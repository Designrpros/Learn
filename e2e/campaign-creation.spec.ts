
import { test, expect } from '@playwright/test';

test('Create a draft campaign', async ({ page }) => {
    // 1. Mock API responses
    await page.route('/api/ads/campaigns', async route => {
        const json = {
            id: 'mock-campaign-id',
            name: 'Test Campaign',
            status: 'draft',
            headline: 'Test Headline',
            body: 'Test Body',
            destinationUrl: 'https://example.com',
            images: ['https://example.com/mock-image.jpg'],
            targetCountries: ['US'],
            dailyBudget: 20,
            durationDays: 7
        };
        await route.fulfill({ json });
    });

    await page.route('/api/upload*', async route => {
        const json = { url: 'https://example.com/mock-image.jpg' };
        await route.fulfill({ json });
    });

    // 2. Navigate to wizard
    await page.goto('/ads/new');

    // 3. Fill Creative Section
    await page.getByPlaceholder('Write a compelling headline').fill('Test Campaign Headline');
    await page.getByPlaceholder('Tell people why they should care.').fill('This is a test campaign body description.');
    await page.getByPlaceholder('https://').fill('https://wikits.com');

    // Mock file upload
    // We can't easily upload a real file without one existing, but we can set the state directly or just omit it if not strictly required by frontend validation (it has a * so it is required).
    // Playwright can create a buffer.
    await page.setInputFiles('input[type="file"]', {
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('mock-image-content')
    });

    // Wait for upload simulation (toast success?)
    await expect(page.getByText('Image uploaded successfully')).toBeVisible({ timeout: 10000 });

    // 4. Targeting Section
    // Select "Entire World" for simplicity or pick a specific one
    await page.locator('select').filter({ hasText: 'Quick Select...' }).selectOption('world');

    // 5. Save Draft
    await page.getByRole('button', { name: 'Save Draft' }).click();

    // 6. Verify success
    // Should show toast or redirect
    await expect(page.getByText('Draft saved successfully')).toBeVisible();
});
