import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem } from '@mui/material';
import type { ManHour, Member, Project } from '../../types';

interface Props {
  open: boolean;
  manHour?: ManHour | null;
  projects: Project[];
  members: Member[];
  onClose: () => void;
  onSave: (data: Omit<ManHour, 'id' | 'updatedAt' | 'member' | 'project'>) => void;
}

export default function ManHourInputDialog({ open, manHour, projects, members, onClose, onSave }: Props) {
  const [projectId, setProjectId] = useState<number | ''>('');
  const [memberId, setMemberId] = useState<number | ''>('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [plannedHours, setPlannedHours] = useState(0);
  const [actualHours, setActualHours] = useState<number | ''>('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (manHour) {
      setProjectId(manHour.projectId);
      setMemberId(manHour.memberId);
      setYear(manHour.year);
      setMonth(manHour.month);
      setPlannedHours(manHour.plannedHours);
      setActualHours(manHour.actualHours ?? '');
      setMemo(manHour.memo ?? '');
    } else {
      setProjectId(''); setMemberId('');
      setYear(new Date().getFullYear()); setMonth(new Date().getMonth() + 1);
      setPlannedHours(0); setActualHours(''); setMemo('');
    }
  }, [manHour, open]);

  const handleSave = () => {
    if (projectId === '' || memberId === '') return;
    onSave({
      projectId: projectId as number,
      memberId: memberId as number,
      year, month, plannedHours,
      actualHours: actualHours === '' ? undefined : actualHours as number,
      memo: memo || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{manHour ? '工数編集' : '工数入力'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="プロジェクト" value={projectId} onChange={e => setProjectId(Number(e.target.value))} fullWidth required>
            {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </TextField>
          <TextField select label="メンバー" value={memberId} onChange={e => setMemberId(Number(e.target.value))} fullWidth required>
            {members.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField label="年" type="number" value={year} onChange={e => setYear(Number(e.target.value))} fullWidth />
            <TextField select label="月" value={month} onChange={e => setMonth(Number(e.target.value))} fullWidth>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <MenuItem key={m} value={m}>{m}月</MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField label="予定工数 (h)" type="number" value={plannedHours} onChange={e => setPlannedHours(Number(e.target.value))} fullWidth />
          <TextField label="実績工数 (h)" type="number" value={actualHours} onChange={e => setActualHours(e.target.value === '' ? '' : Number(e.target.value))} fullWidth />
          <TextField label="メモ" value={memo} onChange={e => setMemo(e.target.value)} fullWidth multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained" disabled={projectId === '' || memberId === ''}>保存</Button>
      </DialogActions>
    </Dialog>
  );
}
