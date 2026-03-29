import api from './client';
import type { CalendarData, Holiday } from '../types';

export const calendarApi = {
  get: (params: { projectId?: number; year: number; month: number }) =>
    api.get<CalendarData>('/calendar', { params }).then(r => r.data),
};

export const holidayApi = {
  getAll: (params: { year?: number; month?: number }) =>
    api.get<Holiday[]>('/holidays', { params }).then(r => r.data),
  seed: (year: number) => api.post(`/holidays/seed/${year}`),
};
