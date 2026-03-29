import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import type { Project } from '../types';
import { projectApi } from '../api/projectApi';
import ProjectFormDialog from '../components/projects/ProjectFormDialog';
import MemberAssignDialog from '../components/projects/MemberAssignDialog';

const statusLabel: Record<string, string> = {
  Active: '進行中', Completed: '完了', OnHold: '保留'
};
const statusColor: Record<string, 'success' | 'default' | 'warning'> = {
  Active: 'success', Completed: 'default', OnHold: 'warning'
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignProject, setAssignProject] = useState<Project | null>(null);

  const load = () => projectApi.getAll().then(setProjects);
  useEffect(() => { load(); }, []);

  const handleSave = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'projectMembers'>) => {
    if (editProject) {
      await projectApi.update(editProject.id, { ...editProject, ...data });
    } else {
      await projectApi.create(data);
    }
    setFormOpen(false);
    setEditProject(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('プロジェクトを削除しますか？')) return;
    await projectApi.delete(id);
    load();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">プロジェクト一覧</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditProject(null); setFormOpen(true); }}>
          新規作成
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>プロジェクト名</TableCell>
              <TableCell>期間</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>メンバー</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Typography fontWeight="bold">{p.name}</Typography>
                  {p.description && <Typography variant="caption" color="text.secondary">{p.description}</Typography>}
                </TableCell>
                <TableCell>{p.startDate} 〜 {p.endDate}</TableCell>
                <TableCell>
                  <Chip label={statusLabel[p.status]} color={statusColor[p.status]} size="small" />
                </TableCell>
                <TableCell>
                  {(p.projectMembers ?? []).map(pm => pm.member.name).join(', ') || '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setAssignProject(p); setAssignOpen(true); }}>
                    <PeopleIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { setEditProject(p); setFormOpen(true); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">プロジェクトがありません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ProjectFormDialog
        open={formOpen}
        project={editProject}
        onClose={() => { setFormOpen(false); setEditProject(null); }}
        onSave={handleSave}
      />
      <MemberAssignDialog
        open={assignOpen}
        project={assignProject}
        onClose={() => setAssignOpen(false)}
        onUpdated={load}
      />
    </Box>
  );
}
