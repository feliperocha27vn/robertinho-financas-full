import { Type } from '@google/genai'

export const declarationCalendar = {
  name: 'create_calendar_event',
  description:
    'Cria um evento no Google Calendar do usuario com horario de inicio e fim.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      startTime: {
        type: Type.STRING,
        description: 'Data/hora de inicio em ISO-8601.',
      },
      endTime: {
        type: Type.STRING,
        description: 'Data/hora de fim em ISO-8601.',
      },
    },
    required: ['summary', 'startTime', 'endTime'],
  },
}

export const declarationListCalendarEvents = {
  name: 'list_calendar_events',
  description:
    'Lista eventos do Google Calendar dentro de um intervalo de tempo.',
  parametersJsonSchema: {
    type: Type.OBJECT,
    properties: {
      timeMin: {
        type: Type.STRING,
        description: 'Inicio da janela em ISO-8601.',
      },
      timeMax: {
        type: Type.STRING,
        description: 'Fim da janela em ISO-8601.',
      },
    },
    required: ['timeMin', 'timeMax'],
  },
}
