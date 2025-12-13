'use client';

import { useMemo, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Calendar, Clock, Filter } from 'lucide-react';
import { Card } from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import type { EventResponseDto } from '@/application/dto/event';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'event' | 'appointment';
  category?: string;
  status?: string;
  zoomJoinUrl?: string | null;
  description?: string | null;
  organizerName?: string | null;
  currentAttendees?: number;
  maxAttendees?: number | null;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  display?: 'auto' | 'block' | 'listItem' | 'background';
  rendering?: 'background' | 'inverse-background' | 'list-item';
  className?: string;
  extendedProps?: Record<string, unknown>;
}

interface UnifiedCalendarProps {
  events?: EventResponseDto[];
  appointments?: any[]; // AppointmentResponseDto will be added later
  availability?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    validFrom?: Date | string | null;
    validUntil?: Date | string | null;
  }>; // Weekly availability rules
  unavailableDates?: Array<{ startTime: Date | string; endTime: Date | string }>; // Unavailable date ranges
  consultantId?: string; // For availability visualization
  view?: 'month' | 'week' | 'day' | 'list';
  onEventClick?: (event: CalendarEvent) => void;
  onAppointmentClick?: (appointment: any) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onViewChange?: (view: string) => void;
  height?: string | number;
  showFilters?: boolean;
  defaultView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
}

export function UnifiedCalendar({
  events = [],
  appointments = [],
  availability = [],
  unavailableDates = [],
  onEventClick,
  onAppointmentClick,
  onDateSelect,
  onViewChange,
  height = 'auto',
  showFilters = true,
  defaultView = 'dayGridMonth',
}: UnifiedCalendarProps) {
  const [, setCurrentView] = useState<string>(defaultView);
  const [filterType, setFilterType] = useState<'all' | 'events' | 'appointments'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [visibleDateRange, setVisibleDateRange] = useState<{ start: Date; end: Date } | null>(null);

  // Convert events to FullCalendar format
  const calendarEvents = useMemo(() => {
    const eventItems: CalendarEvent[] = [];

    // Add events
    if (filterType === 'all' || filterType === 'events') {
      events.forEach((event) => {
        if (filterCategory !== 'all' && event.category !== filterCategory) return;
        if (filterStatus !== 'all' && event.status !== filterStatus) return;

        const eventColor = getEventColor(event.category, event.status);
        eventItems.push({
          id: event.id,
          title: event.title,
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          type: 'event',
          category: event.category,
          status: event.status,
          zoomJoinUrl: event.zoomJoinUrl,
          description: event.description,
          organizerName: event.organizerName,
          currentAttendees: event.currentAttendees,
          maxAttendees: event.maxAttendees,
          color: eventColor,
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: '#ffffff',
          extendedProps: {
            eventId: event.id,
            programId: event.programId,
            consultantId: event.consultantId,
          },
        });
      });
    }

    // Add appointments
    if (filterType === 'all' || filterType === 'appointments') {
      appointments.forEach((appointment) => {
        const appointmentStatus = appointment.status;
        const appointmentStartTime = appointment.startTime;
        const appointmentEndTime = appointment.endTime;
        const appointmentTitle = appointment.title || 'Randevu';
        const appointmentId = appointment.id;

        // Filter by status
        if (filterStatus !== 'all' && appointmentStatus !== filterStatus) return;

        // Validate dates
        if (!appointmentStartTime || !appointmentEndTime) {
          console.warn('⚠️ [UnifiedCalendar] Appointment missing dates:', appointment);
          return;
        }

        const startDate =
          appointmentStartTime instanceof Date
            ? appointmentStartTime
            : new Date(appointmentStartTime);
        const endDate =
          appointmentEndTime instanceof Date ? appointmentEndTime : new Date(appointmentEndTime);

        // Validate date parsing
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error('❌ [UnifiedCalendar] Invalid appointment dates:', {
            appointment,
            startTime: appointmentStartTime,
            endTime: appointmentEndTime,
            parsedStart: startDate,
            parsedEnd: endDate,
          });
          return;
        }

        console.log('✅ [UnifiedCalendar] Adding appointment to calendar:', {
          id: appointmentId,
          title: appointmentTitle,
          status: appointmentStatus,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        });

        const appointmentColor = getAppointmentColor(appointmentStatus);
        eventItems.push({
          id: appointmentId,
          title: appointmentTitle,
          start: startDate,
          end: endDate,
          type: 'appointment',
          status: appointmentStatus,
          zoomJoinUrl: appointment.zoomJoinUrl || null,
          color: appointmentColor,
          backgroundColor: appointmentColor,
          borderColor: appointmentColor,
          textColor: '#ffffff',
          extendedProps: {
            appointmentId: appointmentId,
            consultantId: appointment.consultantId,
            companyId: appointment.companyId,
          },
        });
      });
    }

    // Add weekly availability rules as background events (green striped)
    availability.forEach((rule) => {
      // Use visible date range if available, otherwise use current month
      const dateRange =
        visibleDateRange ||
        (() => {
          const now = new Date();
          return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          };
        })();

      const monthStart = dateRange.start;
      const monthEnd = dateRange.end;

      // Parse validity dates if provided
      const validFrom = rule.validFrom
        ? rule.validFrom instanceof Date
          ? rule.validFrom
          : new Date(rule.validFrom)
        : null;
      const validUntil = rule.validUntil
        ? rule.validUntil instanceof Date
          ? rule.validUntil
          : new Date(rule.validUntil)
        : null;

      // Generate availability slots for the current month
      const currentDate = new Date(monthStart);
      while (currentDate <= monthEnd) {
        // Check validity date range
        if (validFrom && currentDate < validFrom) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        if (validUntil && currentDate > validUntil) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

        // Check if this day matches the availability rule
        if (dayOfWeek === rule.dayOfWeek) {
          // Parse time strings (HH:mm format)
          const [startHour, startMinute] = rule.startTime.split(':').map(Number);
          const [endHour, endMinute] = rule.endTime.split(':').map(Number);

          if (!isNaN(startHour) && !isNaN(startMinute) && !isNaN(endHour) && !isNaN(endMinute)) {
            const availabilityStart = new Date(currentDate);
            availabilityStart.setHours(startHour, startMinute, 0, 0);

            const availabilityEnd = new Date(currentDate);
            availabilityEnd.setHours(endHour, endMinute, 0, 0);

            // Only add if end time is after start time
            if (availabilityEnd > availabilityStart) {
              const availabilityEvent: CalendarEvent = {
                id: `availability-${rule.dayOfWeek}-${currentDate.toISOString().split('T')[0]}`,
                title: `Müsait: ${rule.startTime}-${rule.endTime}`, // Show time range in title
                start: availabilityStart,
                end: availabilityEnd,
                type: 'event',
                color: '#86efac', // Green color
                backgroundColor: '#dcfce7', // Light green background
                borderColor: '#86efac', // Green border
                textColor: '#166534', // Dark green text for better visibility
                display: 'block', // Display as block (not background)
                className: 'availability-bg-event', // Custom class for styling
                extendedProps: {
                  isAvailability: true,
                  dayOfWeek: rule.dayOfWeek,
                  startTime: rule.startTime,
                  endTime: rule.endTime,
                },
              };

              console.log('✅ [UnifiedCalendar] Adding availability event:', {
                id: availabilityEvent.id,
                start: availabilityEvent.start.toISOString(),
                end: availabilityEvent.end.toISOString(),
                dayOfWeek: rule.dayOfWeek,
                display: availabilityEvent.display,
              });

              eventItems.push(availabilityEvent);
            }
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Add unavailable dates as background events (red striped)
    unavailableDates.forEach((unavailable) => {
      const startDate =
        unavailable.startTime instanceof Date
          ? unavailable.startTime
          : new Date(unavailable.startTime);
      const endDate =
        unavailable.endTime instanceof Date ? unavailable.endTime : new Date(unavailable.endTime);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const unavailableEvent: CalendarEvent = {
          id: `unavailable-${startDate.toISOString()}`,
          title: `Müsait Değil: ${startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}-${endDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`, // Show time range in title
          start: startDate,
          end: endDate,
          type: 'event',
          color: '#fca5a5', // Red color
          backgroundColor: '#fee2e2', // Light red background
          borderColor: '#fca5a5', // Red border
          textColor: '#991b1b', // Dark red text for better visibility
          display: 'block', // Display as block (not background)
          className: 'unavailable-bg-event', // Custom class for styling
          extendedProps: {
            isUnavailable: true,
          },
        };

        console.log('❌ [UnifiedCalendar] Adding unavailable event:', {
          id: unavailableEvent.id,
          start: unavailableEvent.start.toISOString(),
          end: unavailableEvent.end.toISOString(),
          display: unavailableEvent.display,
        });

        eventItems.push(unavailableEvent);
      }
    });

    const availabilityEvents = eventItems.filter((e) => e.extendedProps?.isAvailability);
    const unavailableEvents = eventItems.filter((e) => e.extendedProps?.isUnavailable);

    console.log('📅 [UnifiedCalendar] Total calendar events:', eventItems.length);
    console.log('📅 [UnifiedCalendar] Availability rules:', availability.length);
    console.log('📅 [UnifiedCalendar] Availability events created:', availabilityEvents.length);
    console.log('📅 [UnifiedCalendar] Unavailable dates:', unavailableDates.length);
    console.log('📅 [UnifiedCalendar] Unavailable events created:', unavailableEvents.length);
    console.log(
      '📅 [UnifiedCalendar] Visible date range:',
      visibleDateRange
        ? {
            start: visibleDateRange.start.toISOString(),
            end: visibleDateRange.end.toISOString(),
          }
        : 'not set (using current month)'
    );

    if (availabilityEvents.length > 0) {
      console.log(
        '📅 [UnifiedCalendar] Sample availability events:',
        availabilityEvents.slice(0, 3).map((e) => ({
          id: e.id,
          start: e.start.toISOString(),
          end: e.end.toISOString(),
          display: e.display,
        }))
      );
    }

    return eventItems;
  }, [
    events,
    appointments,
    availability,
    unavailableDates,
    filterType,
    filterCategory,
    filterStatus,
    visibleDateRange,
  ]);

  const handleEventClick = useCallback(
    (info: any) => {
      const event = calendarEvents.find((e) => e.id === info.event.id);
      if (!event) return;

      if (event.type === 'event' && onEventClick) {
        onEventClick(event);
      } else if (event.type === 'appointment' && onAppointmentClick) {
        onAppointmentClick(event);
      }
    },
    [calendarEvents, onEventClick, onAppointmentClick]
  );

  const handleDateSelect = useCallback(
    (selectInfo: any) => {
      if (onDateSelect) {
        onDateSelect(selectInfo.start, selectInfo.end);
      }
    },
    [onDateSelect]
  );

  const handleViewChange = useCallback(
    (view: any) => {
      const viewName = view.view.type;
      setCurrentView(viewName);
      if (onViewChange) {
        onViewChange(viewName);
      }
    },
    [onViewChange]
  );

  const handleDatesSet = useCallback((dateInfo: any) => {
    // Update visible date range when calendar view changes
    console.log('📅 [UnifiedCalendar] datesSet callback called:', {
      start: dateInfo.start?.toISOString(),
      end: dateInfo.end?.toISOString(),
      view: dateInfo.view?.type,
    });

    if (dateInfo.start && dateInfo.end) {
      const newRange = {
        start: new Date(dateInfo.start),
        end: new Date(dateInfo.end),
      };
      console.log('📅 [UnifiedCalendar] Setting visible date range:', {
        start: newRange.start.toISOString(),
        end: newRange.end.toISOString(),
      });
      setVisibleDateRange(newRange);
    }
  }, []);

  const eventContent = useCallback(
    (eventInfo: any) => {
      const event = calendarEvents.find((e) => e.id === eventInfo.event.id);
      if (!event) return null;

      // Availability/unavailable events - show time range in title
      if (event.extendedProps?.isAvailability) {
        return (
          <div className="fc-event-main-frame">
            <div className="fc-event-title-container">
              <div className="fc-event-title fc-sticky text-xs font-medium">{event.title}</div>
            </div>
          </div>
        );
      }

      if (event.extendedProps?.isUnavailable) {
        return (
          <div className="fc-event-main-frame">
            <div className="fc-event-title-container">
              <div className="fc-event-title fc-sticky text-xs font-medium">{event.title}</div>
            </div>
          </div>
        );
      }

      return (
        <div className="fc-event-main-frame">
          <div className="fc-event-time-container">
            <span className="fc-event-time">
              {event.start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="fc-event-title-container">
            <div className="fc-event-title fc-sticky">
              {event.type === 'event' ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {eventInfo.event.title}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {eventInfo.event.title}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
    [calendarEvents]
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtreler:</span>
            </div>

            <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="events">Etkinlikler</SelectItem>
                <SelectItem value="appointments">Randevular</SelectItem>
              </SelectContent>
            </Select>

            {filterType === 'all' || filterType === 'events' ? (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="announcement">Duyuru</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            ) : null}

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {filterType === 'all' || filterType === 'events' ? (
                  <>
                    <SelectItem value="scheduled">Planlanmış</SelectItem>
                    <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlanmış</SelectItem>
                    <SelectItem value="cancelled">İptal Edilmiş</SelectItem>
                  </>
                ) : null}
                {filterType === 'all' || filterType === 'appointments' ? (
                  <>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </>
                ) : null}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {calendarEvents.length} {calendarEvents.length === 1 ? 'etkinlik' : 'etkinlik'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card className="p-4">
        <div className="unified-calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={defaultView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            buttonText={{
              today: 'Bugün',
              month: 'Ay',
              week: 'Hafta',
              day: 'Gün',
              list: 'Liste',
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            selectable={!!onDateSelect}
            select={handleDateSelect}
            datesSet={handleDatesSet}
            viewDidMount={handleViewChange}
            height={height}
            locale="tr"
            firstDay={1} // Monday
            weekNumbers={true}
            weekNumberCalculation="ISO"
            eventDisplay="block"
            eventContent={eventContent}
            dayMaxEvents={false}
            moreLinkClick="popover"
            dayMaxEventRows={false}
            eventClassNames={(arg) => {
              const classes: string[] = [];
              const eventId = arg.event.id;

              // Check by event ID first (more reliable for background events)
              const isAvailabilityEvent =
                eventId.startsWith('availability-') || arg.event.extendedProps?.isAvailability;
              const isUnavailableEvent =
                eventId.startsWith('unavailable-') || arg.event.extendedProps?.isUnavailable;

              // Add classes for background events
              if (isAvailabilityEvent) {
                classes.push('availability-bg-event', 'fc-bgevent');
                console.log(
                  '✅ [UnifiedCalendar] eventClassNames - Added availability classes to:',
                  eventId
                );
              }

              if (isUnavailableEvent) {
                classes.push('unavailable-bg-event', 'fc-bgevent');
                console.log(
                  '❌ [UnifiedCalendar] eventClassNames - Added unavailable classes to:',
                  eventId
                );
              }

              // Don't add cursor-pointer to background events
              if (!isAvailabilityEvent && !isUnavailableEvent) {
                classes.push('cursor-pointer hover:opacity-80 transition-opacity');
              }

              return classes.join(' ');
            }}
            eventDidMount={(arg) => {
              const event = calendarEvents.find((e) => e.id === arg.event.id);
              const eventId = arg.event.id;

              // Check by event ID first (more reliable for background events)
              const isAvailabilityEvent =
                eventId.startsWith('availability-') ||
                arg.event.extendedProps?.isAvailability ||
                event?.extendedProps?.isAvailability;
              const isUnavailableEvent =
                eventId.startsWith('unavailable-') ||
                arg.event.extendedProps?.isUnavailable ||
                event?.extendedProps?.isUnavailable;

              console.log('🔍 [UnifiedCalendar] eventDidMount called:', {
                eventId,
                isAvailabilityEvent,
                isUnavailableEvent,
                hasExtendedProps: !!arg.event.extendedProps,
                extendedProps: arg.event.extendedProps,
                eventFound: !!event,
                eventExtendedProps: event?.extendedProps,
              });

              // Type assertion for arg.el (FullCalendar v6 EventMountArg has el property)
              const el = (arg as any).el as HTMLElement | undefined;
              if (!el) {
                console.warn(
                  '⚠️ [UnifiedCalendar] eventDidMount: el is undefined for event:',
                  eventId
                );
                return;
              }

              // Handle background events (availability/unavailable)
              if (isAvailabilityEvent) {
                el.setAttribute('data-availability', 'true');
                el.classList.add('availability-bg-event', 'fc-bgevent');
                // Force styles with !important via inline styles
                el.style.setProperty('background-color', '#dcfce7', 'important');
                el.style.setProperty('background', '#dcfce7', 'important');
                el.style.setProperty('border-color', '#86efac', 'important');
                el.style.setProperty('border-width', '2px', 'important');
                el.style.setProperty('border-style', 'solid', 'important');
                el.style.setProperty('opacity', '0.6', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
                el.style.setProperty('z-index', '0', 'important');
                el.style.setProperty('position', 'relative', 'important');
                // Hide title
                const titleEl = el.querySelector('.fc-event-title');
                if (titleEl) {
                  (titleEl as HTMLElement).style.setProperty('display', 'none', 'important');
                }
                console.log('✅ [UnifiedCalendar] Applied availability styles to:', eventId);
                return; // Don't apply normal event styles
              }

              if (isUnavailableEvent) {
                el.setAttribute('data-unavailable', 'true');
                el.classList.add('unavailable-bg-event', 'fc-bgevent');
                // Force styles with !important via inline styles
                el.style.setProperty('background-color', '#fee2e2', 'important');
                el.style.setProperty('background', '#fee2e2', 'important');
                el.style.setProperty('border-color', '#fca5a5', 'important');
                el.style.setProperty('border-width', '2px', 'important');
                el.style.setProperty('border-style', 'solid', 'important');
                el.style.setProperty('opacity', '0.6', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
                el.style.setProperty('z-index', '0', 'important');
                el.style.setProperty('position', 'relative', 'important');
                // Hide title
                const titleEl = el.querySelector('.fc-event-title');
                if (titleEl) {
                  (titleEl as HTMLElement).style.setProperty('display', 'none', 'important');
                }
                console.log('❌ [UnifiedCalendar] Applied unavailable styles to:', eventId);
                return; // Don't apply normal event styles
              }

              // Apply colors for normal events and appointments
              if (event && !isAvailabilityEvent && !isUnavailableEvent) {
                // Use explicit backgroundColor and borderColor from event object
                if (event.backgroundColor) {
                  el.style.setProperty('background-color', event.backgroundColor, 'important');
                }
                if (event.borderColor) {
                  el.style.setProperty('border-color', event.borderColor, 'important');
                  el.style.setProperty('border-width', '2px', 'important');
                  el.style.setProperty('border-style', 'solid', 'important');
                }
                if (event.textColor) {
                  el.style.setProperty('color', event.textColor, 'important');
                }
                // Ensure normal events appear above background events
                el.style.setProperty('z-index', '2', 'important');
                el.style.setProperty('position', 'relative', 'important');
                console.log('🎨 [UnifiedCalendar] Applied normal event styles to:', eventId, {
                  backgroundColor: event.backgroundColor,
                  borderColor: event.borderColor,
                });
              }
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            nowIndicator={true}
            editable={false}
            droppable={false}
            eventStartEditable={false}
            eventDurationEditable={false}
          />
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">Gösterge:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>Etkinlikler</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Randevular</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400"></div>
            <span>Tamamlanmış</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>İptal Edilmiş</span>
          </div>
        </div>
      </Card>

      <style jsx global>{`
        .unified-calendar-wrapper {
          --fc-border-color: hsl(var(--border));
          --fc-page-bg-color: hsl(var(--background));
          --fc-neutral-bg-color: hsl(var(--muted));
          --fc-neutral-text-color: hsl(var(--muted-foreground));
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-text-color: hsl(var(--primary-foreground));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-active-border-color: hsl(var(--primary) / 0.8);
          --fc-event-bg-color: hsl(var(--primary));
          --fc-event-border-color: hsl(var(--primary));
          --fc-event-text-color: hsl(var(--primary-foreground));
          --fc-today-bg-color: hsl(var(--accent) / 0.3);
          --fc-highlight-color: hsl(var(--accent) / 0.2);
          --fc-more-link-bg-color: hsl(var(--muted));
          --fc-more-link-text-color: hsl(var(--foreground));
        }

        .unified-calendar .fc-header-toolbar {
          margin-bottom: 1.5rem;
        }

        .unified-calendar .fc-button {
          padding: 0.5rem 1rem;
          border-radius: calc(var(--radius) - 2px);
          font-weight: 500;
          transition: all 0.2s;
        }

        .unified-calendar .fc-button:hover {
          transform: translateY(-1px);
        }

        .unified-calendar .fc-button-active {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .unified-calendar .fc-event {
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 0.875rem;
          font-weight: 500;
          border-width: 2px;
          border-style: solid;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        /* Don't override colors for normal events - let eventDidMount handle it */
        .unified-calendar .fc-event:not(.fc-bgevent) {
          /* Colors will be set via inline styles from eventDidMount */
        }

        .unified-calendar .fc-event:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .unified-calendar .fc-day-today {
          background-color: hsl(var(--accent) / 0.1) !important;
        }

        .unified-calendar .fc-daygrid-day-frame {
          min-height: 100px;
        }

        .unified-calendar .fc-timegrid-slot {
          height: 2.5rem;
        }

        .unified-calendar .fc-col-header-cell {
          padding: 0.75rem 0;
          font-weight: 600;
          text-transform: capitalize;
        }

        .unified-calendar .fc-daygrid-day-number {
          padding: 0.5rem;
          font-weight: 500;
        }

        .unified-calendar .fc-daygrid-day-top {
          flex-direction: row;
        }

        .unified-calendar .fc-event-main-frame {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .unified-calendar .fc-event-time {
          font-weight: 600;
          font-size: 0.75rem;
        }

        .unified-calendar .fc-event-title {
          font-size: 0.875rem;
          line-height: 1.2;
        }

        .unified-calendar .fc-popover {
          border-radius: calc(var(--radius));
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .unified-calendar .fc-popover-header {
          padding: 0.75rem 1rem;
          font-weight: 600;
        }

        .unified-calendar .fc-popover-body {
          padding: 0.5rem;
        }

        .unified-calendar .fc-more-link {
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .unified-calendar .fc-more-link:hover {
          background-color: hsl(var(--accent));
        }
      `}</style>
    </div>
  );
}

// Helper functions
function getEventColor(category?: string, status?: string): string {
  if (status === 'cancelled') return '#ef4444'; // red-500
  if (status === 'completed') return '#9ca3af'; // gray-400

  switch (category) {
    case 'webinar':
      return '#3b82f6'; // blue-500
    case 'workshop':
      return '#8b5cf6'; // purple-500
    case 'networking':
      return '#10b981'; // green-500
    case 'announcement':
      return '#f59e0b'; // amber-500
    default:
      return '#6366f1'; // indigo-500
  }
}

function getAppointmentColor(status?: string): string {
  switch (status) {
    case 'approved':
      return '#10b981'; // green-500
    case 'pending':
      return '#f59e0b'; // amber-500
    case 'rejected':
      return '#ef4444'; // red-500
    case 'completed':
      return '#3b82f6'; // blue-500
    case 'cancelled':
      return '#6b7280'; // gray-500
    default:
      return '#6366f1'; // indigo-500
  }
}
