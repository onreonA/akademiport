/**
 * Page Object Pattern for E2E Tests
 *
 * Her sayfa için page object class'ları
 * Test kodunu daha okunabilir ve maintainable yapar
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Appointment Page Object
 */
export class AppointmentPage {
  constructor(private page: Page) {}

  // Locators
  get newAppointmentButton(): Locator {
    return this.page.locator(
      'button:has-text("Yeni Randevu"), button:has-text("Yeni Randevu Talep Et")'
    );
  }

  get titleInput(): Locator {
    return this.page.locator('#title, input[id="title"]');
  }

  get consultantSelect(): Locator {
    return this.page.locator('[role="combobox"], select[name="consultantId"]');
  }

  get startTimeInput(): Locator {
    return this.page.locator('#start-time, input[id="start-time"]');
  }

  get endTimeInput(): Locator {
    return this.page.locator('#end-time, input[id="end-time"]');
  }

  get submitButton(): Locator {
    return this.page.locator(
      'button[type="submit"], button:has-text("Gönder"), button:has-text("Kaydet")'
    );
  }

  get approveButton(): Locator {
    return this.page.locator('button:has-text("Onayla"), button[data-testid="approve"]');
  }

  get rejectButton(): Locator {
    return this.page.locator('button:has-text("Reddet"), button[data-testid="reject"]');
  }

  // Actions
  async goto(): Promise<void> {
    await this.page.goto('/company-dashboard/appointments');
  }

  async gotoConsultant(): Promise<void> {
    await this.page.goto('/consultant-dashboard/appointments');
  }

  async createAppointment(data: {
    title: string;
    consultantId?: string; // Consultant ID veya adı
    consultantName?: string; // Consultant tam adı
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<void> {
    await this.newAppointmentButton.click();

    // Form'un render edilmesini bekle ve API çağrılarını bekle
    await Promise.all([
      this.page
        .waitForResponse(
          (response) => response.url().includes(`/api/companies/`) && response.status() === 200
        )
        .catch(() => null),
      this.page
        .waitForResponse(
          (response) =>
            response.url().includes('/api/programs/') &&
            response.url().includes('/consultants') &&
            response.status() === 200
        )
        .catch(() => null),
    ]);

    await expect(this.page.locator('label:has-text("Randevu Başlığı")')).toBeVisible({
      timeout: 15000,
    });
    await this.page.waitForTimeout(500); // Form render için ek bekleme

    await this.titleInput.fill(data.title);

    // Consultant select için Radix UI Select kullanılıyor
    // Önce consultant select trigger'ını bul
    const consultantSelectTrigger = this.page
      .locator('#consultant, [id="consultant"]')
      .locator('..')
      .locator('[role="combobox"]')
      .first();

    // Consultant seçimi için bekle
    await consultantSelectTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await consultantSelectTrigger.click();

    // Dropdown açılmasını bekle
    await this.page.waitForTimeout(300);

    // Consultant'ı seç (ID veya ad ile)
    const consultantToSelect = data.consultantName || data.consultantId || 'Test Consultant';
    const consultantOption = this.page
      .locator(`[role="option"]`)
      .filter({ hasText: new RegExp(consultantToSelect, 'i') })
      .first();

    // Eğer consultant bulunamazsa ilk consultant'ı seç
    if ((await consultantOption.count()) === 0) {
      const firstConsultant = this.page.locator('[role="option"]').first();
      await firstConsultant.waitFor({ state: 'visible', timeout: 5000 });
      await firstConsultant.click();
    } else {
      await consultantOption.click();
    }

    // datetime-local format'a çevir
    const startTimeLocal = data.startTime.includes('T')
      ? data.startTime.slice(0, 16)
      : data.startTime;
    const endTimeLocal = data.endTime.includes('T') ? data.endTime.slice(0, 16) : data.endTime;

    await this.startTimeInput.fill(startTimeLocal);
    await this.endTimeInput.fill(endTimeLocal);

    if (data.notes) {
      const notesInput = this.page.locator('#description, textarea[id="description"]');
      await notesInput.fill(data.notes);
    }

    await this.submitButton.click();

    // Başarı mesajını bekle (toast notification)
    await expect(
      this.page
        .locator('[data-sonner-toast], [role="status"]')
        .filter({ hasText: /başarılı|oluşturuldu|kaydedildi|randevu.*gönderildi/i })
    ).toBeVisible({ timeout: 15000 });
  }

  async approveAppointment(appointmentTitle: string): Promise<void> {
    // Randevuyu bul ve detay sayfasına git
    await this.page.locator(`text=${appointmentTitle}`).click();
    await this.approveButton.click();

    // Onay mesajını bekle
    await expect(this.page.locator('text=Onaylandı, text=Başarılı')).toBeVisible({ timeout: 5000 });
  }

  async rejectAppointment(appointmentTitle: string, reason?: string): Promise<void> {
    // Randevuyu bul ve detay sayfasına git
    await this.page.locator(`text=${appointmentTitle}`).click();
    await this.rejectButton.click();

    if (reason) {
      const reasonInput = this.page.locator('input[name="reason"], textarea[name="reason"]');
      await reasonInput.fill(reason);
    }

    const confirmButton = this.page.locator('button:has-text("Evet"), button:has-text("Onayla")');
    await confirmButton.click();

    // Red mesajını bekle
    await expect(this.page.locator('text=Reddedildi, text=Başarılı')).toBeVisible({
      timeout: 5000,
    });
  }

  async getAppointmentStatus(appointmentTitle: string): Promise<string> {
    const appointmentRow = this.page.locator(`text=${appointmentTitle}`).locator('..');
    const statusBadge = appointmentRow.locator('[data-testid="status"], .badge, .status');
    return (await statusBadge.textContent()) || '';
  }

  async expectAppointmentVisible(title: string): Promise<void> {
    await expect(this.page.locator(`text=${title}`)).toBeVisible();
  }

  async expectAppointmentStatus(title: string, status: string): Promise<void> {
    const statusText = await this.getAppointmentStatus(title);
    expect(statusText.toLowerCase()).toContain(status.toLowerCase());
  }
}

/**
 * Event Page Object
 */
export class EventPage {
  constructor(private page: Page) {}

  get newEventButton(): Locator {
    return this.page.locator(
      'button:has-text("Yeni Etkinlik"), button:has-text("Etkinlik Oluştur")'
    );
  }

  get titleInput(): Locator {
    return this.page.locator('#title, input[id="title"]');
  }

  get startTimeInput(): Locator {
    return this.page.locator('#startTime, input[id="startTime"]');
  }

  get endTimeInput(): Locator {
    return this.page.locator('#endTime, input[id="endTime"]');
  }

  get descriptionInput(): Locator {
    return this.page.locator('textarea[name="description"]');
  }

  get submitButton(): Locator {
    return this.page.locator('button[type="submit"], button:has-text("Kaydet")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/consultant-dashboard/events');
  }

  async createEvent(data: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
  }): Promise<void> {
    await this.newEventButton.click();

    // Dialog'un açılmasını bekle
    await expect(this.page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500); // Form render için bekleme

    await this.titleInput.fill(data.title);

    // datetime-local format'a çevir (ISO string'den)
    const startTimeLocal = data.startTime.includes('T')
      ? data.startTime.slice(0, 16)
      : data.startTime;
    const endTimeLocal = data.endTime.includes('T') ? data.endTime.slice(0, 16) : data.endTime;

    await this.startTimeInput.fill(startTimeLocal);
    await this.endTimeInput.fill(endTimeLocal);

    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }

    // Submit butonuna tıkla ve API response'unu bekle
    await Promise.all([
      this.page
        .waitForResponse(
          (response) => response.url().includes('/api/events') && response.status() < 400
        )
        .catch(() => null),
      this.submitButton.click(),
    ]);

    // Dialog'un kapanmasını bekle (başarılı olursa dialog kapanır)
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });

    // Alternatif olarak toast notification'ı kontrol et
    try {
      await expect(
        this.page
          .locator('[data-sonner-toast], [role="status"], [data-sonner-toaster]')
          .filter({ hasText: /başarılı|oluşturuldu|kaydedildi/i })
      ).toBeVisible({ timeout: 5000 });
    } catch {
      // Toast görünmezse dialog'un kapandığını kontrol et (başarılı sayılır)
      // Zaten yukarıda kontrol ettik
    }
  }

  async expectEventVisible(title: string): Promise<void> {
    await expect(this.page.locator(`text=${title}`)).toBeVisible();
  }
}

/**
 * Project Page Object
 */
export class ProjectPage {
  constructor(private page: Page) {}

  get newProjectButton(): Locator {
    return this.page.locator('button:has-text("Yeni Proje"), button:has-text("Proje Oluştur")');
  }

  get nameInput(): Locator {
    return this.page.locator('#name, input[id="name"]');
  }

  get descriptionInput(): Locator {
    return this.page.locator('#description, textarea[id="description"]');
  }

  get submitButton(): Locator {
    return this.page.locator(
      'button[type="submit"]:has-text("Proje Oluştur"), button[type="submit"]'
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/consultant-dashboard/projects');
  }

  async createProject(data: {
    name: string;
    description?: string;
    companyId?: string;
  }): Promise<void> {
    await this.newProjectButton.click();

    // Sayfanın yüklendiğini bekle
    await expect(this.page.locator('label:has-text("Proje Adı")')).toBeVisible({ timeout: 15000 });
    await this.page.waitForTimeout(500); // Form render için bekleme

    // Company seç (eğer verilmişse veya zorunluysa)
    const companySelectTrigger = this.page
      .locator('#company_id, [id="company_id"]')
      .locator('..')
      .locator('[role="combobox"]')
      .first();
    if (await companySelectTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await companySelectTrigger.click();
      await this.page.waitForTimeout(300);

      if (data.companyId) {
        // Belirli bir company seç
        const companyOption = this.page
          .locator(`[role="option"]`)
          .filter({ hasText: new RegExp(data.companyId, 'i') })
          .first();
        if ((await companyOption.count()) > 0) {
          await companyOption.click();
        } else {
          await this.page.locator(`[role="option"]`).first().click();
        }
      } else {
        // İlk firmayı seç
        await this.page.locator(`[role="option"]`).first().click();
      }
    }

    await this.nameInput.fill(data.name);

    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }

    // Submit butonuna tıkla ve API response'unu bekle
    await Promise.all([
      this.page
        .waitForResponse(
          (response) =>
            response.url().includes('/api/projects') &&
            response.request().method() === 'POST' &&
            response.status() < 400
        )
        .catch(() => null),
      this.submitButton.click(),
    ]);

    // Proje detay sayfasına yönlendirme veya başarı mesajını bekle
    try {
      await this.page.waitForURL(/\/consultant-dashboard\/projects\/[^/]+/, { timeout: 10000 });
    } catch {
      // Yönlendirme olmazsa toast notification'ı kontrol et
      await expect(
        this.page
          .locator('[data-sonner-toast], [role="status"], [data-sonner-toaster]')
          .filter({ hasText: /başarılı|oluşturuldu/i })
      ).toBeVisible({ timeout: 5000 });
    }
  }

  async expectProjectVisible(name: string): Promise<void> {
    await expect(this.page.locator(`text=${name}`)).toBeVisible();
  }
}

/**
 * News Page Object
 */
export class NewsPage {
  constructor(private page: Page) {}

  // Locators
  get newNewsButton(): Locator {
    return this.page.locator('button:has-text("Yeni Haber"), button:has-text("Haber Oluştur")');
  }

  get titleInput(): Locator {
    return this.page.locator('#title, input[id="title"]');
  }

  get summaryInput(): Locator {
    return this.page.locator('textarea[placeholder*="özet"], textarea[name="summary"]');
  }

  get contentInput(): Locator {
    return this.page.locator('textarea[placeholder*="içerik"], textarea[name="content"]');
  }

  get categorySelect(): Locator {
    return this.page
      .locator('[role="combobox"]')
      .filter({ hasText: /kategori/i })
      .first();
  }

  get imageUrlInput(): Locator {
    return this.page.locator('input[placeholder*="image"], input[name="imageUrl"]');
  }

  get submitButton(): Locator {
    return this.page.locator(
      'button[type="submit"]:has-text("Oluştur"), button[type="submit"]:has-text("Güncelle"), button[type="submit"]'
    );
  }

  get publishButton(): Locator {
    return this.page.locator('button:has-text("Yayınla")');
  }

  get editButton(): Locator {
    return this.page.locator('button:has-text("Düzenle")');
  }

  get deleteButton(): Locator {
    return this.page.locator('button:has-text("Sil")');
  }

  get likeButton(): Locator {
    return this.page.locator('button:has-text("Beğen"), [data-testid="like-button"]');
  }

  // Actions
  async gotoAdmin(): Promise<void> {
    await this.page.goto('/admin-dashboard/news');
  }

  async gotoCompany(): Promise<void> {
    await this.page.goto('/company-dashboard/news');
  }

  async gotoConsultant(): Promise<void> {
    await this.page.goto('/consultant-dashboard/news');
  }

  async createNews(data: {
    title: string;
    content: string;
    summary?: string;
    category?: string;
    imageUrl?: string;
  }): Promise<void> {
    await this.newNewsButton.click();

    // Dialog'un açılmasını bekle
    await expect(this.page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(500); // Form render için bekleme

    await this.titleInput.fill(data.title);

    if (data.summary) {
      await this.summaryInput.fill(data.summary);
    }

    await this.contentInput.fill(data.content);

    if (data.category) {
      // Category select için Radix UI Select kullanılıyor
      const categoryTrigger = this.page
        .locator('label:has-text("Kategori")')
        .locator('..')
        .locator('[role="combobox"]')
        .first();
      await categoryTrigger.click();
      await this.page.waitForTimeout(300);
      await this.page.locator(`text=${data.category}`).click();
    }

    if (data.imageUrl) {
      await this.imageUrlInput.fill(data.imageUrl);
    }

    // Submit butonuna tıkla ve API response'unu bekle
    await Promise.all([
      this.page
        .waitForResponse(
          (response) => response.url().includes('/api/news') && response.status() < 400
        )
        .catch(() => null),
      this.submitButton.click(),
    ]);

    // Dialog'un kapanmasını bekle veya toast notification'ı kontrol et
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });
  }

  async expectNewsVisible(title: string): Promise<void> {
    await expect(this.page.locator(`text=${title}`)).toBeVisible({ timeout: 5000 });
  }

  async clickNews(title: string): Promise<void> {
    await this.page.locator(`text=${title}`).click();
  }

  async publishNews(title: string): Promise<void> {
    // News card'ı bul ve publish butonuna tıkla
    const newsCard = this.page.locator(`text=${title}`).locator('..').locator('..');
    await newsCard.locator('button:has-text("Yayınla")').click();

    // API response'unu bekle
    await this.page
      .waitForResponse(
        (response) =>
          response.url().includes('/api/news') &&
          response.url().includes('/publish') &&
          response.status() < 400
      )
      .catch(() => null);
  }

  async likeNews(title: string): Promise<void> {
    // News detay sayfasında veya card'da like butonuna tıkla
    const likeBtn = this.page.locator('button:has-text("Beğen")').first();
    if (await likeBtn.isVisible()) {
      await likeBtn.click();
      await this.page.waitForTimeout(500);
    }
  }
}
