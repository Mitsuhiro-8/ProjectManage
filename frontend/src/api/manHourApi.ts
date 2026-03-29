import api from './client';
import type { ManHour } from '../types';

export const manHourApi = {
  getAll: (params: { projectId?: number; year?: number; month?: number }) =>
    api.get<ManHour[]>('/manhours', { params }).then(r => r.data),
  create: (data: Omit<ManHour, 'id' | 'updatedAt' | 'member' | 'project'>) =>
    api.post<ManHour>('/manhours', data).then(r => r.data),
  update: (id: number, data: ManHour) => api.put(`/manhours/${id}`, data),
  delete: (id: number) => api.delete(`/manhours/${id}`),
  getSummary: (memberId: number, year: number) =>
    api.get<ManHour[]>('/manhours/summary', { params: { memberId, year } }).then(r => r.data),
};
