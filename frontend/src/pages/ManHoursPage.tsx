import { useEffect, useState } from 'react';
import {
  Box, Button, IconButton, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { ManHour, Member, Project } from '../types';
import { manHourApi } from '../api/manHourApi';
import { projectApi } from '../api/projectApi';
import { memberApi } from '../api/memberApi';
import ManHourInputDialog from '../components/manhours/ManHourInputDialog';

export default function ManHoursPage() {
  const [manHours, setManHours] = useState<ManHour[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filterProjectId, setFilterProjectId] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [formOpen, setFormOpen] = useState(false);
  const [editManHour, setEditManHour] = useState<ManHour | null>(null);

  useEffect(() => {
    projectApi.getAll().then(setProjects);
    memberApi.getAll().then(setMembers);
  }, []);

  const load = () => {
    manHourApi.getAll({
      projectId: filterProjectId || undefined,
      year: filterYear,
      month: filterMonth,
    }).then(setManHours);
  };

  useEffect(() => { load(); }, [filterProjectId, filterYear, filterMonth]);

  const handleSave = async (data: Omit<ManHour, 'id' | 'updatedAt' | 'member' | 'project'>) => {
    if (editManHour) {
      await manHourApi.update(editManHour.id, { ...editManHour, ...data });
    } else {
      await manHourApi.create(data);
    }
    setFormOpen(false);
    setEditManHour(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('工数レコードを削除しますか？')) return;
    await manHourApi.delete(id);
    load();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">工数管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditManHour(null); setFormOpen(true); }}>
          工数入力
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField select label="プロジェクト" value={filterProjectId} onChange={e => setFilterProjectId(e.target.value === '' ? '' : Number(e.target.value))} sx={{ minWidth: 200 }}>
          <MenuItem value="">すべて</MenuItem>
          {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        <TextField label="年" type="number" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} sx={{ width: 100 }} />
        <TextField select label="月" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} sx={{ width: 100 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <MenuItem key={m} value={m}>{m}月</MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>プロジェクト</TableCell>
              <TableCell>メンバー</TableCell>
              <TableCell>年月</TableCell>
              <TableCell align="right">予定工数</TableCell>
              <TableCell align="right">実績工数</TableCell>
              <TableCell>メモ</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manHours.map(mh => (
              <TableRow key={mh.id} hover>
                <TableCell>{mh.project?.name ?? '-'}</TableCell>
                <TableCell>{mh.member?.name ?? '-'}</TableCell>
                <TableCell>{mh.year}/{String(mh.month).padStart(2, '0')}</TableCell>
                <TableCell align="right">{mh.plannedHours}h</TableCell>
                <TableCell align="right">{mh.actualHours != null ? `${mh.actualHours}h` : '-'}</TableCell>
                <TableCell>{mh.memo ?? '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setEditManHour(mh); setFormOpen(true); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(mh.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {manHours.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">データがありません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ManHourInputDialog
        open={formOpen}
        manHour={editManHour}
        projects={projects}
        members={members}
        onClose={() => { setFormOpen(false); setEditManHour(null); }}
        onSave={handleSave}
      />
    </Box>
  );
}
