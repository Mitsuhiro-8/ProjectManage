import { useEffect, useState } from 'react';
import {
  Box, Button, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Member } from '../types';
import { memberApi } from '../api/memberApi';
import MemberFormDialog from '../components/members/MemberFormDialog';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const load = () => memberApi.getAll().then(setMembers);
  useEffect(() => { load(); }, []);

  const handleSave = async (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editMember) {
      await memberApi.update(editMember.id, { ...editMember, ...data });
    } else {
      await memberApi.create(data);
    }
    setFormOpen(false);
    setEditMember(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('メンバーを削除しますか？（論理削除）')) return;
    await memberApi.delete(id);
    load();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">メンバー一覧</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditMember(null); setFormOpen(true); }}>
          メンバー追加
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>氏名</TableCell>
              <TableCell>役割</TableCell>
              <TableCell>メールアドレス</TableCell>
              <TableCell>月間標準工数</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map(m => (
              <TableRow key={m.id} hover>
                <TableCell><Typography fontWeight="bold">{m.name}</Typography></TableCell>
                <TableCell>{m.role ?? '-'}</TableCell>
                <TableCell>{m.email ?? '-'}</TableCell>
                <TableCell>{m.defaultMonthlyHours}h</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setEditMember(m); setFormOpen(true); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(m.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">メンバーがいません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MemberFormDialog
        open={formOpen}
        member={editMember}
        onClose={() => { setFormOpen(false); setEditMember(null); }}
        onSave={handleSave}
      />
    </Box>
  );
}
