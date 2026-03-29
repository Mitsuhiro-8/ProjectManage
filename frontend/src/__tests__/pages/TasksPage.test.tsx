import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TasksPage from '../../pages/TasksPage';
import { taskApi } from '../../api/taskApi';
import { projectApi } from '../../api/projectApi';
import { memberApi } from '../../api/memberApi';
import type { Task, Project, Member } from '../../types';

// API をモック化
vi.mock('../../api/taskApi');
vi.mock('../../api/projectApi');
vi.mock('../../api/memberApi');

const mockProjects: Project[] = [
  { id: 1, name: 'プロジェクトA', startDate: '2026-04-01', endDate: '2026-09-30', status: 'Active', createdAt: '', updatedAt: '' },
  { id: 2, name: 'プロジェクトB', startDate: '2026-04-01', endDate: '2026-09-30', status: 'Active', createdAt: '', updatedAt: '' },
];

const mockMembers: Member[] = [
  { id: 1, name: '山田 太郎', defaultMonthlyHours: 160, isActive: true, createdAt: '', updatedAt: '' },
  { id: 2, name: '佐藤 花子', defaultMonthlyHours: 160, isActive: true, createdAt: '', updatedAt: '' },
];

const mockTasks: Task[] = [
  {
    id: 1, projectId: 1, memberId: 1, name: '基本設計', status: 'InProgress',
    plannedHours: 16, actualHours: 10,
    createdAt: '', updatedAt: '',
    project: mockProjects[0], member: mockMembers[0],
  },
  {
    id: 2, projectId: 1, memberId: 2, name: 'テスト作成', status: 'Todo',
    plannedHours: 8, actualHours: undefined,
    createdAt: '', updatedAt: '',
    project: mockProjects[0], member: mockMembers[1],
  },
  {
    id: 3, projectId: 2, memberId: 1, name: 'レビュー', status: 'Done',
    plannedHours: 4, actualHours: 4,
    createdAt: '', updatedAt: '',
    project: mockProjects[1], member: mockMembers[0],
  },
];

beforeEach(() => {
  // フィルタパラメータに応じてサーバー側で絞り込んだ結果を返す（APIの実動作を模倣）
  vi.mocked(taskApi.getAll).mockImplementation(async (params) => {
    let result = mockTasks;
    if (params?.projectId) result = result.filter(t => t.projectId === params.projectId);
    if (params?.memberId) result = result.filter(t => t.memberId === params.memberId);
    if (params?.status) result = result.filter(t => t.status === params.status);
    return result;
  });
  vi.mocked(projectApi.getAll).mockResolvedValue(mockProjects);
  vi.mocked(memberApi.getAll).mockResolvedValue(mockMembers);
});

describe('TasksPage', () => {
  it('タスク一覧が表示される', async () => {
    render(<TasksPage />);

    expect(await screen.findByText('基本設計')).toBeInTheDocument();
    expect(screen.getByText('テスト作成')).toBeInTheDocument();
    expect(screen.getByText('レビュー')).toBeInTheDocument();
  });

  it('プロジェクトフィルタで絞り込みができる', async () => {
    render(<TasksPage />);

    // 一覧が描画されるまで待つ
    await screen.findByText('基本設計');

    // プロジェクトBを選択
    const projectSelect = screen.getByLabelText('プロジェクト');
    await userEvent.click(projectSelect);
    await userEvent.click(await screen.findByRole('option', { name: 'プロジェクトB' }));

    // プロジェクトBのタスクのみ表示される
    expect(screen.getByText('レビュー')).toBeInTheDocument();
    expect(screen.queryByText('基本設計')).not.toBeInTheDocument();
    expect(screen.queryByText('テスト作成')).not.toBeInTheDocument();
  });

  it('工数集計サマリーが正しく計算・表示される', async () => {
    render(<TasksPage />);

    await screen.findByText('基本設計');

    // 全タスクの予定合計: 16 + 8 + 4 = 28h
    expect(screen.getByText('28h')).toBeInTheDocument();
    // 実績合計: 10 + 4 = 14h（actualHours が undefined のものは除外）
    expect(screen.getByText('14h')).toBeInTheDocument();
  });
});
