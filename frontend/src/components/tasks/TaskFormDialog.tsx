import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Stack,
} from '@mui/material';
import type { Task, TaskStatus, Project, Member } from '../../types';

interface Props {
  open: boolean;
  task?: Omit<Task, 'project' | 'member'> | null;
  projects: Project[];
  members: Member[];
  onClose: () => void;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'project' | 'member'>) => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'Todo', label: '未着手' },
  { value: 'InProgress', label: '進行中' },
  { value: 'Done', label: '完了' },
];

export default function TaskFormDialog({ open, task, projects, members, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [memberId, setMemberId] = useState<number | ''>('');
  const [status, setStatus] = useState<TaskStatus>('Todo');
  const [plannedHours, setPlannedHours] = useState(0);
  const [actualHours, setActualHours] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description ?? '');
      setProjectId(task.projectId);
      setMemberId(task.memberId);
      setStatus(task.status);
      setPlannedHours(task.plannedHours);
      setActualHours(task.actualHours !== undefined ? String(task.actualHours) : '');
      setStartDate(task.startDate ?? '');
      setEndDate(task.endDate ?? '');
    } else {
      setName('');
      setDescription('');
      // プロジェクトが1件の場合は自動選択して入力手順を省く
      setProjectId(projects.length === 1 ? projects[0].id : '');
      setMemberId('');
      setStatus('Todo');
      setPlannedHours(0);
      setActualHours('');
      setStartDate('');
      setEndDate('');
    }
  }, [task, open, projects]);

  const handleSave = () => {
    onSave({
      name,
      description: description || undefined,
      projectId: projectId as number,
      memberId: memberId as number,
      status,
      plannedHours,
      actualHours: actualHours !== '' ? Number(actualHours) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const canSave = name.trim() !== '' && projectId !== '' && memberId !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'タスク編集' : 'タスク追加'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="タスク名"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            inputProps={{ 'aria-label': 'タスク名' }}
          />
          <TextField
            select
            label="プロジェクト"
            value={projectId}
            onChange={e => setProjectId(Number(e.target.value))}
            fullWidth
            required
          >
            {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="担当者"
            value={memberId}
            onChange={e => setMemberId(Number(e.target.value))}
            fullWidth
            required
          >
            {members.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="ステータス"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
            fullWidth
          >
            {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>
          <TextField
            label="予定工数 (h)"
            type="number"
            value={plannedHours}
            onChange={e => setPlannedHours(Number(e.target.value))}
            inputProps={{ min: 0, step: 0.5 }}
            fullWidth
            required
          />
          <TextField
            label="実績工数 (h)"
            type="number"
            value={actualHours}
            onChange={e => setActualHours(e.target.value)}
            inputProps={{ min: 0, step: 0.5 }}
            fullWidth
          />
          <TextField
            label="開始日"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="終了日"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="説明"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSave}>保存</Button>
      </DialogActions>
    </Dialog>
  );
}
