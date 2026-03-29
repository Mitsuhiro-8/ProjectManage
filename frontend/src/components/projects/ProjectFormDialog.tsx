import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material';
import type { Project, ProjectStatus } from '../../types';

interface Props {
  open: boolean;
  project?: Project | null;
  onClose: () => void;
  onSave: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'projectMembers'>) => void;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'Active', label: '進行中' },
  { value: 'Completed', label: '完了' },
  { value: 'OnHold', label: '保留' },
];

export default function ProjectFormDialog({ open, project, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Active');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? '');
      setStartDate(project.startDate);
      setEndDate(project.endDate);
      setStatus(project.status);
    } else {
      setName(''); setDescription(''); setStartDate(''); setEndDate(''); setStatus('Active');
    }
  }, [project, open]);

  const handleSave = () => {
    onSave({ name, description: description || undefined, startDate, endDate, status });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{project ? 'プロジェクト編集' : 'プロジェクト作成'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="プロジェクト名" value={name} onChange={e => setName(e.target.value)} fullWidth required />
          <TextField label="説明" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={2} />
          <TextField label="開始日" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
          <TextField label="終了日" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} required />
          <TextField select label="ステータス" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} fullWidth>
            {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name || !startDate || !endDate}>保存</Button>
      </DialogActions>
    </Dialog>
  );
}
