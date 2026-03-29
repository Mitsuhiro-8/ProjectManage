import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import TaskFormDialog from '../../components/tasks/TaskFormDialog';
import type { Project, Member } from '../../types';

// 2件にすることでプロジェクト自動選択が発動せず、未選択状態でテストを開始できる
const mockProjects: Project[] = [
  { id: 1, name: 'プロジェクトA', startDate: '2026-04-01', endDate: '2026-09-30', status: 'Active', createdAt: '', updatedAt: '' },
  { id: 2, name: 'プロジェクトB', startDate: '2026-04-01', endDate: '2026-09-30', status: 'Active', createdAt: '', updatedAt: '' },
];
const mockMembers: Member[] = [
  { id: 1, name: '山田 太郎', defaultMonthlyHours: 160, isActive: true, createdAt: '', updatedAt: '' },
];

describe('TaskFormDialog', () => {
  it('必須項目（タスク名）未入力で保存ボタンが disabled になる', () => {
    render(
      <TaskFormDialog
        open={true}
        task={null}
        projects={mockProjects}
        members={mockMembers}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const saveButton = screen.getByRole('button', { name: '保存' });
    // タスク名が空なので disabled
    expect(saveButton).toBeDisabled();
  });

  it('正常入力で保存ボタンが有効になりonSaveが呼ばれる', async () => {
    const onSave = vi.fn();
    render(
      <TaskFormDialog
        open={true}
        task={null}
        projects={mockProjects}
        members={mockMembers}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    // タスク名・プロジェクト・担当者をすべて入力（3つが必須のため）
    await userEvent.type(screen.getByLabelText('タスク名'), '新しいタスク');
    await userEvent.click(screen.getByRole('combobox', { name: 'プロジェクト' }));
    await userEvent.click(await screen.findByRole('option', { name: 'プロジェクトA' }));
    await userEvent.click(screen.getByRole('combobox', { name: '担当者' }));
    await userEvent.click(await screen.findByRole('option', { name: '山田 太郎' }));

    const saveButton = screen.getByRole('button', { name: '保存' });
    expect(saveButton).not.toBeDisabled();

    await userEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('編集モードでは既存の値がフォームに表示される', () => {
    const existingTask = {
      id: 1, projectId: 1, memberId: 1, name: '既存タスク',
      status: 'InProgress' as const, plannedHours: 16, actualHours: 8,
      createdAt: '', updatedAt: '',
    };

    render(
      <TaskFormDialog
        open={true}
        task={existingTask}
        projects={mockProjects}
        members={mockMembers}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('既存タスク')).toBeInTheDocument();
    expect(screen.getByDisplayValue('16')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
  });
});
