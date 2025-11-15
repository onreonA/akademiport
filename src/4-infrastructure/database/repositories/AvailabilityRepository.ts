/**
 * Availability Repository Implementation
 * Müsaitlik kuralları için repository implementation
 */

import { createClient } from '@/infrastructure/database/supabase-server';
import { Result } from '@/core/result/Result';
import type { IAvailabilityRepository } from '@/domain/repositories/IAvailabilityRepository';
import type {
  Availability,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
} from '@/domain/entities/Availability';
import type {
  UnavailableDate,
  CreateUnavailableDateDto,
  UpdateUnavailableDateDto,
} from '@/domain/entities/UnavailableDate';

export class AvailabilityRepository implements IAvailabilityRepository {
  // ============================================
  // AVAILABILITY CRUD
  // ============================================

  async createAvailability(data: CreateAvailabilityDto): Promise<Result<Availability>> {
    try {
      const supabase = await createClient();
      const { data: availability, error } = await supabase
        .from('consultant_availability')
        .insert({
          consultant_id: data.consultantId,
          day_of_week: data.dayOfWeek,
          start_time: data.startTime,
          end_time: data.endTime,
          valid_from: data.validFrom?.toISOString().split('T')[0] || null,
          valid_until: data.validUntil?.toISOString().split('T')[0] || null,
          program_id: data.programId || null,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToAvailability(availability));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsaitlik kuralı oluşturulamadı'
      );
    }
  }

  async findAvailabilityById(id: string): Promise<Result<Availability | null>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('consultant_availability')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(error.message);
      }

      return Result.ok(data ? this.mapToAvailability(data) : null);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Müsaitlik kuralı bulunamadı');
    }
  }

  async findAvailabilityByConsultant(
    consultantId: string,
    programId?: string | null
  ): Promise<Result<Availability[]>> {
    try {
      const supabase = await createClient();
      let query = supabase
        .from('consultant_availability')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('is_active', true);

      if (programId !== undefined) {
        if (programId === null) {
          // Get only general availability (no program_id)
          query = query.is('program_id', null);
        } else {
          // Get availability for specific program or general
          query = query.or(`program_id.eq.${programId},program_id.is.null`);
        }
      }

      const { data, error } = await query.order('day_of_week', { ascending: true });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok((data || []).map((item) => this.mapToAvailability(item)));
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Müsaitlik kuralları bulunamadı');
    }
  }

  async updateAvailability(id: string, data: UpdateAvailabilityDto): Promise<Result<Availability>> {
    try {
      const supabase = await createClient();
      const updateData: any = {};

      if (data.dayOfWeek !== undefined) updateData.day_of_week = data.dayOfWeek;
      if (data.startTime !== undefined) updateData.start_time = data.startTime;
      if (data.endTime !== undefined) updateData.end_time = data.endTime;
      if (data.validFrom !== undefined)
        updateData.valid_from = data.validFrom?.toISOString().split('T')[0] || null;
      if (data.validUntil !== undefined)
        updateData.valid_until = data.validUntil?.toISOString().split('T')[0] || null;
      if (data.programId !== undefined) updateData.program_id = data.programId || null;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { data: availability, error } = await supabase
        .from('consultant_availability')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToAvailability(availability));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsaitlik kuralı güncellenemedi'
      );
    }
  }

  async deleteAvailability(id: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('consultant_availability').delete().eq('id', id);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Müsaitlik kuralı silinemedi');
    }
  }

  // ============================================
  // UNAVAILABLE DATE CRUD
  // ============================================

  async createUnavailableDate(data: CreateUnavailableDateDto): Promise<Result<UnavailableDate>> {
    try {
      const supabase = await createClient();
      const { data: unavailableDate, error } = await supabase
        .from('consultant_unavailable_dates')
        .insert({
          consultant_id: data.consultantId,
          start_time: data.startTime.toISOString(),
          end_time: data.endTime.toISOString(),
          reason: data.reason || null,
          notes: data.notes || null,
          program_id: data.programId || null,
        })
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToUnavailableDate(unavailableDate));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarih oluşturulamadı'
      );
    }
  }

  async findUnavailableDateById(id: string): Promise<Result<UnavailableDate | null>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('consultant_unavailable_dates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.ok(null);
        }
        return Result.fail(error.message);
      }

      return Result.ok(data ? this.mapToUnavailableDate(data) : null);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarih bulunamadı'
      );
    }
  }

  async findUnavailableDatesByConsultant(
    consultantId: string,
    startDate?: Date,
    endDate?: Date,
    programId?: string | null
  ): Promise<Result<UnavailableDate[]>> {
    try {
      const supabase = await createClient();
      let query = supabase
        .from('consultant_unavailable_dates')
        .select('*')
        .eq('consultant_id', consultantId);

      if (startDate) {
        query = query.gte('end_time', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('start_time', endDate.toISOString());
      }

      if (programId !== undefined) {
        if (programId === null) {
          query = query.is('program_id', null);
        } else {
          query = query.or(`program_id.eq.${programId},program_id.is.null`);
        }
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok((data || []).map((item) => this.mapToUnavailableDate(item)));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarihler bulunamadı'
      );
    }
  }

  async updateUnavailableDate(
    id: string,
    data: UpdateUnavailableDateDto
  ): Promise<Result<UnavailableDate>> {
    try {
      const supabase = await createClient();
      const updateData: any = {};

      if (data.startTime !== undefined) updateData.start_time = data.startTime.toISOString();
      if (data.endTime !== undefined) updateData.end_time = data.endTime.toISOString();
      if (data.reason !== undefined) updateData.reason = data.reason || null;
      if (data.notes !== undefined) updateData.notes = data.notes || null;
      if (data.programId !== undefined) updateData.program_id = data.programId || null;

      const { data: unavailableDate, error } = await supabase
        .from('consultant_unavailable_dates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(this.mapToUnavailableDate(unavailableDate));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarih güncellenemedi'
      );
    }
  }

  async deleteUnavailableDate(id: string): Promise<Result<void>> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('consultant_unavailable_dates').delete().eq('id', id);

      if (error) {
        return Result.fail(error.message);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Müsait olmayan tarih silinemedi'
      );
    }
  }

  // ============================================
  // AVAILABILITY CHECK
  // ============================================

  async checkAvailability(
    consultantId: string,
    startTime: Date,
    endTime: Date,
    programId?: string | null
  ): Promise<
    Result<{
      isAvailable: boolean;
      conflicts: Array<{ type: 'appointment' | 'unavailable' | 'outside_hours'; details: any }>;
    }>
  > {
    try {
      const conflicts: Array<{
        type: 'appointment' | 'unavailable' | 'outside_hours';
        details: any;
      }> = [];

      // 1. Check unavailable dates
      const unavailableResult = await this.findUnavailableDatesByConsultant(
        consultantId,
        startTime,
        endTime,
        programId
      );

      if (unavailableResult.isFailure) {
        return Result.fail(unavailableResult.error || 'Müsaitlik kontrolü yapılamadı');
      }

      const unavailableDates = unavailableResult.value || [];
      for (const unavailable of unavailableDates) {
        // Check if there's an overlap
        if (
          (startTime >= unavailable.startTime && startTime < unavailable.endTime) ||
          (endTime > unavailable.startTime && endTime <= unavailable.endTime) ||
          (startTime <= unavailable.startTime && endTime >= unavailable.endTime)
        ) {
          conflicts.push({
            type: 'unavailable',
            details: {
              id: unavailable.id,
              reason: unavailable.reason,
              startTime: unavailable.startTime,
              endTime: unavailable.endTime,
            },
          });
        }
      }

      // 2. Check weekly availability rules
      const dayOfWeek = startTime.getDay();
      const availabilityResult = await this.findAvailabilityByConsultant(consultantId, programId);

      if (availabilityResult.isFailure) {
        return Result.fail(availabilityResult.error || 'Müsaitlik kuralları getirilemedi');
      }

      const availabilityRules = availabilityResult.value || [];
      const dayRules = availabilityRules.filter(
        (rule) => rule.dayOfWeek === dayOfWeek && rule.isActive
      );

      if (dayRules.length === 0) {
        conflicts.push({
          type: 'outside_hours',
          details: {
            message: 'Bu gün için müsaitlik kuralı tanımlanmamış',
            dayOfWeek,
          },
        });
      } else {
        // Check if time is within any rule
        const startHour = startTime.getHours();
        const startMinute = startTime.getMinutes();
        const endHour = endTime.getHours();
        const endMinute = endTime.getMinutes();

        const isWithinHours = dayRules.some((rule) => {
          const [ruleStartHour, ruleStartMinute] = rule.startTime.split(':').map(Number);
          const [ruleEndHour, ruleEndMinute] = rule.endTime.split(':').map(Number);

          const ruleStartMinutes = ruleStartHour * 60 + ruleStartMinute;
          const ruleEndMinutes = ruleEndHour * 60 + ruleEndMinute;
          const requestStartMinutes = startHour * 60 + startMinute;
          const requestEndMinutes = endHour * 60 + endMinute;

          // Check date range validity
          const requestDate = new Date(startTime);
          requestDate.setHours(0, 0, 0, 0);
          if (rule.validFrom) {
            const validFromDate = new Date(rule.validFrom);
            validFromDate.setHours(0, 0, 0, 0);
            if (requestDate < validFromDate) return false;
          }
          if (rule.validUntil) {
            const validUntilDate = new Date(rule.validUntil);
            validUntilDate.setHours(0, 0, 0, 0);
            if (requestDate > validUntilDate) return false;
          }

          return requestStartMinutes >= ruleStartMinutes && requestEndMinutes <= ruleEndMinutes;
        });

        if (!isWithinHours) {
          conflicts.push({
            type: 'outside_hours',
            details: {
              message: 'Seçilen saat çalışma saatleri dışında',
              dayOfWeek,
              availableRules: dayRules.map((r) => ({ startTime: r.startTime, endTime: r.endTime })),
            },
          });
        }
      }

      // 3. Check appointments (check for overlapping appointments)
      const supabase = await createClient();
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, start_time, end_time, status, title')
        .eq('consultant_id', consultantId)
        .in('status', ['pending', 'approved'])
        .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()})`);

      if (!appointmentsError && appointments) {
        for (const appointment of appointments) {
          const aptStartTime = new Date(appointment.start_time);
          const aptEndTime = new Date(appointment.end_time);

          // Check if there's an overlap
          if (
            (startTime >= aptStartTime && startTime < aptEndTime) ||
            (endTime > aptStartTime && endTime <= aptEndTime) ||
            (startTime <= aptStartTime && endTime >= aptEndTime)
          ) {
            conflicts.push({
              type: 'appointment',
              details: {
                id: appointment.id,
                title: appointment.title,
                status: appointment.status,
                startTime: aptStartTime,
                endTime: aptEndTime,
              },
            });
          }
        }
      }

      return Result.ok({
        isAvailable: conflicts.length === 0,
        conflicts,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Müsaitlik kontrolü yapılamadı');
    }
  }

  // ============================================
  // MAPPERS
  // ============================================

  private mapToAvailability(data: any): Availability {
    return {
      id: data.id,
      consultantId: data.consultant_id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      validFrom: data.valid_from ? new Date(data.valid_from) : null,
      validUntil: data.valid_until ? new Date(data.valid_until) : null,
      programId: data.program_id || null,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by || null,
      updatedBy: data.updated_by || null,
    };
  }

  private mapToUnavailableDate(data: any): UnavailableDate {
    return {
      id: data.id,
      consultantId: data.consultant_id,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      reason: data.reason || null,
      notes: data.notes || null,
      programId: data.program_id || null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by || null,
      updatedBy: data.updated_by || null,
    };
  }
}
