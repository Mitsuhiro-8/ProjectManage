import api from './client';
import type { Project } from '../types';

export const projectApi = {
  getAll: () => api.get<Project[]>('/projects').then(r => r.data),
  getById: (id: number) => api.get<Project>(`/projects/${id}`).then(r => r.data),
  create: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'projectMembers'>) =>
    api.post<Project>('/projects', data).then(r => r.data),
  update: (id: number, data: Project) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  assignMember: (projectId: number, memberId: number) =>
    api.post(`/projects/${projectId}/members/${memberId}`),
  removeMember: (projectId: number, memberId: number) =>
    api.delete(`/projects/${projectId}/members/${memberId}`),
};
