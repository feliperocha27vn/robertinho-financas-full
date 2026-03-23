export interface CreateCalendarEventInput {
  summary: string
  startTime: string
  endTime: string
}

export interface ListCalendarEventsInput {
  timeMin: string
  timeMax: string
}

export interface CalendarProvider {
  createEvent(input: CreateCalendarEventInput): Promise<{
    id?: string | null
    summary?: string | null
    htmlLink?: string | null
    start?: string | null
    end?: string | null
  }>

  listEvents(input: ListCalendarEventsInput): Promise<{
    items: Array<{
      id?: string | null
      summary?: string | null
      start?: string | null
      end?: string | null
      htmlLink?: string | null
    }>
  }>
}
