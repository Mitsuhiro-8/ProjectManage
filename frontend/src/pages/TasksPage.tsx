import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, IconButton, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Task, TaskStatus, Project, Member } from '../types';
import { taskApi } from '../api/taskApi';
import { projectApi } from '../api/projectApi';
import { memberApi } from '../api/memberApi';
import TaskFormDialog from '../components/tasks/TaskFormDialog';

const statusLabel: Record<TaskStatus, string> = {
  Todo: '未着手',
  InProgress: '進行中',
  Done: '完了',
};
const statusColor: Record<TaskStatus, 'default' | 'primary' | 'success'> = {
  Todo: 'default',
  InProgress: 'primary',
  Done: 'success',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filterProjectId, setFilterProjectId] = useState<number | ''>('');
  const [filterMemberId, setFilterMemberId] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () =>
    taskApi.getAll({
      projectId: filterProjectId || undefined,
      memberId: filterMemberId || undefined,
      status: filterStatus || undefined,
    }).then(setTasks);

  useEffect(() => {
    projectApi.getAll().then(setProjects);
    memberApi.getAll().then(setMembers);
  }, []);

  // フィルタ変更時に再取得
  useEffect(() => { load(); }, [filterProjectId, filterMemberId, filterStatus]);

  const handleSave = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'project' | 'member'>) => {
    if (loading) return;
    setLoading(true);
    try {
      if (editTask) {
        await taskApi.update(editTask.id, { ...editTask, ...data });
      } else {
        await taskApi.create(data);
      }
      setFormOpen(false);
      setEditTask(null);
      load();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('タスクを削除しますか？')) return;
    await taskApi.delete(id);
    load();
  };

  // フィルタ後のタスクをフロントで集計する（APIのsummaryはフィルタと別管理になるため）
  const totalPlanned = tasks.reduce((sum, t) => sum + t.plannedHours, 0);
  const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours ?? 0), 0);
  const achieveRate = totalPlanned > 0
    ? Math.round((totalActual / totalPlanned) * 100)
    : null;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">タスク管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditTask(null); setFormOpen(true); }}
        >
          タスク追加
        </Button>
      </Stack>

      {/* フィルタ */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          select
          label="プロジェクト"
          value={filterProjectId}
          onChange={e => setFilterProjectId(e.target.value === '' ? '' : Number(e.target.value))}
          size="small"
          sx={{ minWidth: 180 }}
          inputProps={{ 'aria-label': 'プロジェクト' }}
        >
          <MenuItem value="">全て</MenuItem>
          {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="担当者"
          value={filterMemberId}
          onChange={e => setFilterMemberId(e.target.value === '' ? '' : Number(e.target.value))}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">全て</MenuItem>
          {members.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="ステータス"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as TaskStatus | '')}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">全て</MenuItem>
          {(Object.keys(statusLabel) as TaskStatus[]).map(s => (
            <MenuItem key={s} value={s}>{statusLabel[s]}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* 工数集計サマリー */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={4}>
          <Typography>予定合計: <strong>{totalPlanned}h</strong></Typography>
          <Typography>実績合計: <strong>{totalActual}h</strong></Typography>
          <Typography>
            達成率: <strong>{achieveRate !== null ? `${achieveRate}%` : '-'}</strong>
          </Typography>
        </Stack>
      </Paper>

      {/* タスク一覧テーブル */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>タスク名</TableCell>
              <TableCell>プロジェクト</TableCell>
              <TableCell>担当者</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>予定 (h)</TableCell>
              <TableCell>実績 (h)</TableCell>
              <TableCell>開始日</TableCell>
              <TableCell>終了日</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map(t => (
              <TableRow key={t.id} hover>
                <TableCell>
                  <Typography fontWeight="bold">{t.name}</Typography>
                  {t.description && (
                    <Typography variant="caption" color="text.secondary">{t.description}</Typography>
                  )}
                </TableCell>
                <TableCell>{t.project?.name ?? '-'}</TableCell>
                <TableCell>{t.member?.name ?? '-'}</TableCell>
                <TableCell>
                  <Chip label={statusLabel[t.status]} color={statusColor[t.status]} size="small" />
                </TableCell>
                <TableCell>{t.plannedHours}</TableCell>
                <TableCell>{t.actualHours ?? '-'}</TableCell>
                <TableCell>{t.startDate ?? '-'}</TableCell>
                <TableCell>{t.endDate ?? '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setEditTask(t); setFormOpen(true); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">タスクがありません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TaskFormDialog
        open={formOpen}
        task={editTask}
        projects={projects}
        members={members}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        onSave={handleSave}
      />
    </Box>
  );
}
