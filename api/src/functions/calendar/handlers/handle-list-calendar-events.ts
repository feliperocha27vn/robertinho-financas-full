import type { CalendarProvider } from '../../../providers/calendar/calendar-provider'

export async function handleListCalendarEvents(
  calendarProvider: CalendarProvider,
  args: Record<string, unknown>
) {
  const result = await calendarProvider.listEvents({
    timeMin: String(args.timeMin ?? ''),
    timeMax: String(args.timeMax ?? ''),
  })

  return {
    ok: true,
    result,
  }
}
