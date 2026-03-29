import api from './client';
import type { Member } from '../types';

export const memberApi = {
  getAll: () => api.get<Member[]>('/members').then(r => r.data),
  getById: (id: number) => api.get<Member>(`/members/${id}`).then(r => r.data),
  create: (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Member>('/members', data).then(r => r.data),
  update: (id: number, data: Member) => api.put(`/members/${id}`, data),
  delete: (id: number) => api.delete(`/members/${id}`),
};
