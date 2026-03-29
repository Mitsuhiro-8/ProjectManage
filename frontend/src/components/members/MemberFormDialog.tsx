import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material';
import type { Member } from '../../types';

interface Props {
  open: boolean;
  member?: Member | null;
  onClose: () => void;
  onSave: (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function MemberFormDialog({ open, member, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [defaultMonthlyHours, setDefaultMonthlyHours] = useState(160);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email ?? '');
      setRole(member.role ?? '');
      setDefaultMonthlyHours(member.defaultMonthlyHours);
    } else {
      setName(''); setEmail(''); setRole(''); setDefaultMonthlyHours(160);
    }
  }, [member, open]);

  const handleSave = () => {
    onSave({
      name,
      email: email || undefined,
      role: role || undefined,
      defaultMonthlyHours,
      isActive: true,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{member ? 'メンバー編集' : 'メンバー追加'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="氏名" value={name} onChange={e => setName(e.target.value)} fullWidth required />
          <TextField label="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
          <TextField label="役割 (PM / Dev / QA 等)" value={role} onChange={e => setRole(e.target.value)} fullWidth />
          <TextField
            label="月間標準工数 (h)"
            type="number"
            value={defaultMonthlyHours}
            onChange={e => setDefaultMonthlyHours(Number(e.target.value))}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name}>保存</Button>
      </DialogActions>
    </Dialog>
  );
}
