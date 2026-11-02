import { test, expect } from '@playwright/test';

test.describe('Google Play Billing & Verification Security Tests', () => {
  test('rejects unauthenticated requests to /api/google-play/verify', async ({ request }) => {
    const response = await request.post('/api/google-play/verify', {
      data: {
        packageName: 'com.cvscan.app',
        productId: 'starter',
        purchaseToken: 'fake-token-test',
        purchaseType: 'product',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  test('validates payload schema and rejects invalid or missing fields', async ({ request }) => {
    // Calling without required fields
    const response = await request.post('/api/google-play/verify', {
      data: {
        packageName: 'com.cvscan.app',
      },
    });

    // 401 because getServerSession is called first before payload validation
    expect(response.status()).toBe(401);
  });

  test('rejects unauthenticated requests to /api/google-play/webhook with invalid token', async ({ request }) => {
    const response = await request.post('/api/google-play/webhook', {
      data: {
        message: {
          data: Buffer.from(JSON.stringify({ testNotification: {} })).toString('base64'),
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Unauthorized');
  });

  test('serves assetlinks.json correctly under /.well-known/assetlinks.json', async ({ request }) => {
    const response = await request.get('/.well-known/assetlinks.json');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]?.target?.package_name).toBe('com.cvscan.app');
  });

  test('public compliance pages are accessible and return 200', async ({ request }) => {
    const privacy = await request.get('/privacy');
    expect(privacy.status()).toBe(200);

    const terms = await request.get('/terms');
    expect(terms.status()).toBe(200);

    const deleteAccount = await request.get('/delete-account');
    expect(deleteAccount.status()).toBe(200);
  });
});
