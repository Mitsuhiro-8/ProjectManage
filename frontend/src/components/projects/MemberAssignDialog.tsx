import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Checkbox, Typography } from '@mui/material';
import type { Member, Project } from '../../types';
import { memberApi } from '../../api/memberApi';
import { projectApi } from '../../api/projectApi';

interface Props {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function MemberAssignDialog({ open, project, onClose, onUpdated }: Props) {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  // API呼び出し中の連打による競合を防ぐフラグ
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!open || !project) return;
    memberApi.getAll().then(setAllMembers);
    const ids = new Set((project.projectMembers ?? []).map(pm => pm.member.id));
    setAssignedIds(ids);
  }, [open, project]);

  const toggle = async (memberId: number) => {
    if (!project || toggling) return;
    setToggling(true);
    if (assignedIds.has(memberId)) {
      await projectApi.removeMember(project.id, memberId);
      setAssignedIds(prev => { const s = new Set(prev); s.delete(memberId); return s; });
    } else {
      await projectApi.assignMember(project.id, memberId);
      setAssignedIds(prev => new Set(prev).add(memberId));
    }
    setToggling(false);
    onUpdated();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>メンバーアサイン</DialogTitle>
      <DialogContent>
        {project && <Typography variant="subtitle2" gutterBottom>{project.name}</Typography>}
        <List dense>
          {allMembers.map(m => (
            <ListItem key={m.id} secondaryAction={
              <Checkbox checked={assignedIds.has(m.id)} onChange={() => toggle(m.id)} disabled={toggling} />
            }>
              <ListItemText primary={m.name} secondary={m.role} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
