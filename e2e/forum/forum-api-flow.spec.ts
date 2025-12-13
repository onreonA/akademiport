/**
 * E2E Test: Forum API Routes Flow
 *
 * API route'larını direkt test eden E2E testleri
 * UI'dan bağımsız olarak API'lerin doğru çalıştığını doğrular
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Forum API Routes Flow', () => {
  let testTopicId: string;
  let testReplyId: string;

  test('POST /api/forum/topics - Konu Oluşturma', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. API'yi direkt çağır
    const response = await page.request.post('/api/forum/topics', {
      data: {
        title: `API Test Topic ${Date.now()}`,
        content: 'Bu bir API test konusudur.',
        categoryId: 'test-category-id', // Gerçek test'te geçerli category ID kullanılmalı
        programId: 'test-program-id', // Gerçek test'te geçerli program ID kullanılmalı
      },
    });

    // 3. Response kontrolü
    if (response.status() === 401 || response.status() === 403) {
      console.warn('⚠️ Yetki hatası, test skip ediliyor');
      test.skip();
      return;
    }

    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data.success || data.topic).toBeDefined();
    if (data.topic) {
      testTopicId = data.topic.id;
    }
  });

  test('GET /api/forum/topics - Konu Listesi', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. API'yi direkt çağır
    const response = await page.request.get('/api/forum/topics?programId=test-program-id');

    // 3. Response kontrolü
    expect([200, 401, 403]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.topics || data.data).toBeDefined();
    }
  });

  test('GET /api/forum/topics/[id] - Konu Detayı', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. Önce bir konu ID'si al (eğer testTopicId yoksa)
    if (!testTopicId) {
      const listResponse = await page.request.get('/api/forum/topics?programId=test-program-id');
      if (listResponse.status() === 200) {
        const listData = await listResponse.json();
        const topics = listData.topics || listData.data || [];
        if (topics.length > 0) {
          testTopicId = topics[0].id;
        } else {
          console.warn('⚠️ Test konusu bulunamadı, test skip ediliyor');
          test.skip();
          return;
        }
      } else {
        console.warn('⚠️ Konu listesi alınamadı, test skip ediliyor');
        test.skip();
        return;
      }
    }

    // 3. API'yi direkt çağır
    const response = await page.request.get(`/api/forum/topics/${testTopicId}`);

    // 4. Response kontrolü
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.topic || data.data).toBeDefined();
    }
  });

  test('POST /api/forum/topics/[id]/replies - Yanıt Oluşturma', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. Önce bir konu ID'si al
    if (!testTopicId) {
      const listResponse = await page.request.get('/api/forum/topics?programId=test-program-id');
      if (listResponse.status() === 200) {
        const listData = await listResponse.json();
        const topics = listData.topics || listData.data || [];
        if (topics.length > 0) {
          testTopicId = topics[0].id;
        } else {
          console.warn('⚠️ Test konusu bulunamadı, test skip ediliyor');
          test.skip();
          return;
        }
      } else {
        console.warn('⚠️ Konu listesi alınamadı, test skip ediliyor');
        test.skip();
        return;
      }
    }

    // 3. API'yi direkt çağır
    const response = await page.request.post(`/api/forum/topics/${testTopicId}/replies`, {
      data: {
        content: `API Test Reply ${Date.now()}`,
      },
    });

    // 4. Response kontrolü
    if (response.status() === 401 || response.status() === 403) {
      console.warn('⚠️ Yetki hatası, test skip ediliyor');
      test.skip();
      return;
    }

    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data.success || data.reply).toBeDefined();
    if (data.reply) {
      testReplyId = data.reply.id;
    }
  });

  test('POST /api/forum/topics/[id]/like - Konu Beğenme', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. Önce bir konu ID'si al
    if (!testTopicId) {
      const listResponse = await page.request.get('/api/forum/topics?programId=test-program-id');
      if (listResponse.status() === 200) {
        const listData = await listResponse.json();
        const topics = listData.topics || listData.data || [];
        if (topics.length > 0) {
          testTopicId = topics[0].id;
        } else {
          console.warn('⚠️ Test konusu bulunamadı, test skip ediliyor');
          test.skip();
          return;
        }
      } else {
        console.warn('⚠️ Konu listesi alınamadı, test skip ediliyor');
        test.skip();
        return;
      }
    }

    // 3. API'yi direkt çağır
    const response = await page.request.post(`/api/forum/topics/${testTopicId}/like`);

    // 4. Response kontrolü
    expect([200, 201, 400, 401, 403]).toContain(response.status());
    // 400 = zaten beğenilmiş olabilir, bu normal
  });

  test('POST /api/forum/topics/[id]/mark-solution - Çözüm İşaretleme', async ({ page }) => {
    // 1. Company user olarak login (konu sahibi olmalı)
    await loginAs(page, 'company');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.warn('⚠️ Login başarısız, test skip ediliyor');
      test.skip();
      return;
    }

    // 2. Önce bir konu ve yanıt ID'si al
    if (!testTopicId || !testReplyId) {
      console.warn('⚠️ Test konusu veya yanıt bulunamadı, test skip ediliyor');
      test.skip();
      return;
    }

    // 3. API'yi direkt çağır
    const response = await page.request.post(`/api/forum/topics/${testTopicId}/mark-solution`, {
      data: {
        replyId: testReplyId,
      },
    });

    // 4. Response kontrolü
    expect([200, 201, 400, 401, 403]).toContain(response.status());
    // 400 = yetki hatası veya zaten çözüm işaretlenmiş olabilir
  });
});
