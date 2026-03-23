import type { CalendarProvider } from '../../../providers/calendar/calendar-provider'

export async function handleCreateCalendarEvent(
  calendarProvider: CalendarProvider,
  args: Record<string, unknown>
) {
  const result = await calendarProvider.createEvent({
    summary: String(args.summary ?? ''),
    startTime: String(args.startTime ?? ''),
    endTime: String(args.endTime ?? ''),
  })

  return {
    ok: true,
    result,
  }
}
