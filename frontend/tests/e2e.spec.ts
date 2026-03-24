import { test, expect, Page } from '@playwright/test';

declare global {
  interface Window {
    __mockChatAdapter?: any;
  }
}

const mockUser = {
  nickname: 'mock-user',
  email: 'mock@example.com',
  firstName: 'Mock',
  lastName: 'User',
};

async function mockApiEndpoints(page: Page) {
  await page.route('**/api/user/**', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify(mockUser),
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  await page.route('**/api/chat/group/history**', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          id: 1,
          sender: 'mock-user',
          content: 'Historic hello from server',
          type: 'CHAT',
          timeStamp: new Date().toISOString(),
        },
      ]),
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  await page.route('**/api/chat/history**', (route) =>
    route.fulfill({
      status: 200,
      body: '[]',
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  await page.route('**/api/Users/search**', (route) =>
    route.fulfill({
      status: 200,
      body: '[]',
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const handlers: { value?: any } = {};
    window.__mockChatAdapter = {
      connect(hooks) {
        handlers.value = hooks;
      },
      send(message) {
        handlers.value?.onPublicMessage?.({ ...message, id: Date.now() });
      },
      sendPrivate(message) {
        handlers.value?.onPrivateMessage?.({ ...message, id: Date.now() });
      },
      sendFile(message) {
        handlers.value?.onPublicMessage?.({ ...message, id: Date.now() });
      },
      disconnect() {
        handlers.value = undefined;
      },
    };
  });
});

test('home navigation works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Where Conversations Come Alive')).toBeVisible();
  await page.getByRole('link', { name: 'Login' }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('link', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test('login flow returns the dashboard', async ({ page }) => {
  await mockApiEndpoints(page);
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ status: 'SUCCESS', username: mockUser.nickname }),
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  await page.goto('/login');
  await page.getByPlaceholder('Email Address').fill(mockUser.email);
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL(/\/dashboard$/);
  await expect(page.getByText('Global Chat Room')).toBeVisible();
  await expect(page.getByText('Mock User')).toBeVisible();
});

test('dashboard renders mocked websocket messages', async ({ page }) => {
  await mockApiEndpoints(page);

  await page.addInitScript(() => {
    const handlers: { value?: any } = {};
    window.__mockChatAdapter = {
      connect(hooks) {
        handlers.value = hooks;
        hooks.onActiveUsers(['mock-friend']);
        hooks.onPublicMessage({
          sender: 'mock-friend',
          content: 'Mock broadcast hello',
          type: 'CHAT',
          timeStamp: new Date().toISOString(),
        });
      },
      send(message) {
        handlers.value?.onPublicMessage?.({ ...message, id: Date.now() });
      },
      sendPrivate(message) {
        handlers.value?.onPrivateMessage?.({ ...message, id: Date.now() });
      },
      sendFile(message) {
        handlers.value?.onPublicMessage?.({ ...message, id: Date.now() });
      },
      disconnect() {
        handlers.value = undefined;
      },
    };
  });

  await page.goto('/dashboard');
  await expect(page.getByText('Mock broadcast hello')).toBeVisible();

  const input = page.locator('textarea#message');
  await input.fill('Message from e2e');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Message from e2e')).toBeVisible();
});
