import { google } from 'googleapis'
import { env } from '../../env'
import type {
  CalendarProvider,
  CreateCalendarEventInput,
  ListCalendarEventsInput,
} from './calendar-provider'

export class GoogleCalendarProvider implements CalendarProvider {
  private readonly calendar = google.calendar('v3')
  private readonly privateKey = env.PRIVATE_KEY_CALENDER.replace(
    /\\n/g,
    '\n'
  ).replace(/"/g, '')
  private readonly auth = new google.auth.JWT({
    email: env.CLIENT_EMAIL,
    key: this.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  })

  async createEvent(input: CreateCalendarEventInput): Promise<{
    id?: string | null
    summary?: string | null
    htmlLink?: string | null
    start?: string | null
    end?: string | null
  }> {
    const response = await this.calendar.events.insert({
      auth: this.auth,
      calendarId: env.GOOGLE_PERSONAL_EMAIL,
      requestBody: {
        summary: input.summary,
        start: {
          dateTime: input.startTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: input.endTime,
          timeZone: 'America/Sao_Paulo',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'popup', minutes: 10 },
          ],
        },
      },
    })

    return {
      id: response.data.id,
      summary: response.data.summary,
      htmlLink: response.data.htmlLink,
      start: response.data.start?.dateTime ?? null,
      end: response.data.end?.dateTime ?? null,
    }
  }

  async listEvents(input: ListCalendarEventsInput): Promise<{
    items: Array<{
      id?: string | null
      summary?: string | null
      start?: string | null
      end?: string | null
      htmlLink?: string | null
    }>
  }> {
    const response = await this.calendar.events.list({
      auth: this.auth,
      calendarId: env.GOOGLE_PERSONAL_EMAIL,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: input.timeMin,
      timeMax: input.timeMax,
    })

    const items = (response.data.items ?? []).map(item => ({
      id: item.id,
      summary: item.summary,
      start: item.start?.dateTime ?? item.start?.date ?? null,
      end: item.end?.dateTime ?? item.end?.date ?? null,
      htmlLink: item.htmlLink,
    }))

    return { items }
  }
}
