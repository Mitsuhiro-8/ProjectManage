import api from './client';
import type { Task, TaskSummary } from '../types';

export const taskApi = {
  getAll: (params?: { projectId?: number; memberId?: number; status?: string }) =>
    api.get<Task[]>('/tasks', { params }).then(r => r.data),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`).then(r => r.data),
  create: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'project' | 'member'>) =>
    api.post<Task>('/tasks', data).then(r => r.data),
  update: (id: number, data: Omit<Task, 'project' | 'member'>) =>
    api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  getSummary: (params?: { projectId?: number; memberId?: number }) =>
    api.get<TaskSummary[]>('/tasks/summary', { params }).then(r => r.data),
};
