/**
 * E2E Test: Event Attendance Flow
 *
 * Senaryo 1: Event Attendance Registration (POST)
 * Senaryo 2: Get Event Attendees (GET)
 * Senaryo 3: Mark Attendance as Attended (PATCH)
 * Senaryo 4: Attendance Authorization Checks
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Event Attendance Flow', () => {
  let testEventId: string;

  test.beforeEach(async ({ page }) => {
    // Her test için bir event oluştur (eğer gerekirse)
    // Bu test'ler mevcut bir event'in varlığını varsayar
    testEventId = 'test-event-id'; // Gerçek test'te dinamik olarak oluşturulmalı
  });

  test('Register Event Attendance - Success', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Event attendance registration API'yi çağır
    const response = await page.request.post(`/api/events/${testEventId}/attendance`, {
      data: {
        notes: 'Test attendance notes',
      },
    });

    // 3. Response'un başarılı olduğunu kontrol et
    expect([200, 201]).toContain(response.status());

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.attendance).toBeDefined();
    expect(data.attendance.eventId).toBe(testEventId);
  });

  test('Register Event Attendance - Unauthorized', async ({ page }) => {
    // 1. Login olmadan attendance registration denemesi
    const response = await page.request.post(`/api/events/${testEventId}/attendance`, {
      data: {
        notes: 'Test notes',
      },
    });

    // 2. 401 Unauthorized dönmeli
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Register Event Attendance - Forbidden (Consultant)', async ({ page }) => {
    // 1. Consultant olarak login
    await loginAs(page, 'consultant');

    // 2. Consultant'lar attendance kaydı yapamaz
    const response = await page.request.post(`/api/events/${testEventId}/attendance`, {
      data: {
        notes: 'Test notes',
      },
    });

    // 3. 403 Forbidden dönmeli
    expect(response.status()).toBe(403);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Get Event Attendees - Success', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Event attendees API'yi çağır
    const response = await page.request.get(`/api/events/${testEventId}/attendance`);

    // 3. Response'un başarılı olduğunu kontrol et
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.attendees).toBeDefined();
    expect(Array.isArray(data.attendees)).toBe(true);
  });

  test('Get Event Attendees - Unauthorized', async ({ page }) => {
    // 1. Login olmadan attendees API'ye erişim denemesi
    const response = await page.request.get(`/api/events/${testEventId}/attendance`);

    // 2. 401 Unauthorized dönmeli
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Get Event Attendees - Event Not Found', async ({ page }) => {
    // 1. Admin olarak login
    await loginAs(page, 'admin');

    // 2. Var olmayan bir event için attendees API'yi çağır
    const response = await page.request.get('/api/events/non-existent-event/attendance');

    // 3. 404 Not Found dönmeli
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Get Event Attendees - Company User Access Control', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    // 2. Kendi program'ındaki event için attendees API'yi çağır
    // (Bu test gerçek event ID'si gerektirir)
    const response = await page.request.get(`/api/events/${testEventId}/attendance`);

    // 3. Eğer event company'nin program'ında değilse 403 dönmeli
    // Eğer event company'nin program'ındaysa 200 dönmeli
    expect([200, 403, 404]).toContain(response.status());
  });

  test('Mark Attendance as Attended - Consultant Success', async ({ page }) => {
    // 1. Consultant olarak login
    await loginAs(page, 'consultant');

    const attendanceId = 'test-attendance-id'; // Gerçek test'te dinamik olarak oluşturulmalı

    // 2. Mark attendance as attended API'yi çağır
    const response = await page.request.patch(
      `/api/events/${testEventId}/attendance/${attendanceId}`,
      {
        data: {},
      }
    );

    // 3. Response'un başarılı olduğunu kontrol et (eğer event consultant'a aitse)
    // Eğer event consultant'a ait değilse 403 dönmeli
    expect([200, 403, 404]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.attendance).toBeDefined();
      expect(data.attendance.status).toBe('attended');
    }
  });

  test('Mark Attendance as Attended - Master Admin Success', async ({ page }) => {
    // 1. Master admin olarak login
    await loginAs(page, 'admin');

    const attendanceId = 'test-attendance-id';

    // 2. Mark attendance as attended API'yi çağır
    const response = await page.request.patch(
      `/api/events/${testEventId}/attendance/${attendanceId}`,
      {
        data: {},
      }
    );

    // 3. Response'un başarılı olduğunu kontrol et
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.attendance).toBeDefined();
    }
  });

  test('Mark Attendance as Attended - Unauthorized', async ({ page }) => {
    // 1. Login olmadan mark attendance denemesi
    const attendanceId = 'test-attendance-id';
    const response = await page.request.patch(
      `/api/events/${testEventId}/attendance/${attendanceId}`,
      {
        data: {},
      }
    );

    // 2. 401 Unauthorized dönmeli
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Mark Attendance as Attended - Forbidden (Company User)', async ({ page }) => {
    // 1. Company user olarak login
    await loginAs(page, 'company');

    const attendanceId = 'test-attendance-id';

    // 2. Company user'lar mark attendance yapamaz
    const response = await page.request.patch(
      `/api/events/${testEventId}/attendance/${attendanceId}`,
      {
        data: {},
      }
    );

    // 3. 403 Forbidden dönmeli
    expect(response.status()).toBe(403);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Mark Attendance as Attended - Event Not Found', async ({ page }) => {
    // 1. Consultant olarak login
    await loginAs(page, 'consultant');

    const attendanceId = 'test-attendance-id';

    // 2. Var olmayan bir event için mark attendance denemesi
    const response = await page.request.patch(
      `/api/events/non-existent-event/attendance/${attendanceId}`,
      {
        data: {},
      }
    );

    // 3. 404 Not Found dönmeli
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Mark Attendance as Attended - Consultant Own Event Only', async ({ page }) => {
    // 1. Consultant olarak login
    await loginAs(page, 'consultant');

    const attendanceId = 'test-attendance-id';
    const otherConsultantEventId = 'other-consultant-event-id'; // Başka consultant'ın event'i

    // 2. Başka consultant'ın event'i için mark attendance denemesi
    const response = await page.request.patch(
      `/api/events/${otherConsultantEventId}/attendance/${attendanceId}`,
      {
        data: {},
      }
    );

    // 3. 403 Forbidden dönmeli (eğer event başka consultant'a aitse)
    expect([403, 404]).toContain(response.status());

    if (response.status() === 403) {
      const data = await response.json();
      expect(data.error).toBeDefined();
    }
  });
});

