import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should redirect to login when accessing protected route without auth', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show register form', async ({ page }) => {
    await page.goto('/register');
    await expect(
      page.getByRole('heading', { name: 'Register' })
    ).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL('/register');

    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should validate login form', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show validation errors
    await expect(
      page.getByText('Invalid email address')
    ).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should validate register form', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should show validation errors
    await expect(
      page.getByText('Invalid email address')
    ).toBeVisible();
    await expect(
      page.getByText('Password must be at least 8 characters')
    ).toBeVisible();
  });

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password456');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error toast (wait for it to appear)
    await page.waitForTimeout(1000);
    // The toast should be visible
    const toast = page.locator('[role="status"]');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('should complete full auth flow: register -> login -> logout', async ({
    page,
  }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';

    // Register
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Name (optional)').fill('Test User');
    await page.getByLabel('Password').fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should redirect to app after successful registration
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.getByText('Test User')).toBeVisible({ timeout: 5000 });

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Login again
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to app after successful login
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.getByText('Test User')).toBeVisible({ timeout: 5000 });
  });
});

