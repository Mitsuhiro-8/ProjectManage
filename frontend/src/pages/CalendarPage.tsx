import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, IconButton, MenuItem, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { CalendarData, Project } from '../types';
import { calendarApi, holidayApi } from '../api/calendarApi';
import { projectApi } from '../api/projectApi';

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [projectId, setProjectId] = useState<number | ''>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { projectApi.getAll().then(setProjects); }, []);

  // シード後など外部トリガーで再フェッチしたい場合に reloadKey をインクリメントする
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    calendarApi.get({ projectId: projectId || undefined, year, month }).then(setCalendarData);
  }, [projectId, year, month, reloadKey]);

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else { setMonth(m => m - 1); } };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else { setMonth(m => m + 1); } };

  const handleSeed = async () => {
    setSeeding(true);
    await holidayApi.seed(year);
    setSeeding(false);
    setReloadKey(k => k + 1);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isHoliday = (day: number) => {
    const str = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData?.holidays.includes(str) ?? false;
  };

  const isWeekend = (day: number) => {
    const dow = new Date(year, month - 1, day).getDay();
    return dow === 0 || dow === 6;
  };

  const dayLabel = (day: number) => {
    const dow = ['日', '月', '火', '水', '木', '金', '土'][new Date(year, month - 1, day).getDay()];
    return `${day}(${dow})`;
  };

  const getCellBg = (day: number) => {
    const dow = new Date(year, month - 1, day).getDay();
    if (isHoliday(day) || dow === 0) return '#ffebee';
    if (dow === 6) return '#e3f2fd';
    return undefined;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">月間稼働カレンダー</Typography>
        <Button variant="outlined" size="small" onClick={handleSeed} disabled={seeding}>
          {year}年の祝日をシード
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <IconButton onClick={prevMonth}><ChevronLeftIcon /></IconButton>
        <Typography variant="h6">{year}年 {month}月</Typography>
        <IconButton onClick={nextMonth}><ChevronRightIcon /></IconButton>
        <TextField select label="プロジェクト" value={projectId} onChange={e => setProjectId(e.target.value === '' ? '' : Number(e.target.value))} sx={{ minWidth: 200 }}>
          <MenuItem value="">すべて</MenuItem>
          {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>
        {calendarData && (
          <Chip label={`稼働日: ${calendarData.workingDays}日`} color="primary" variant="outlined" />
        )}
      </Stack>

      {calendarData && calendarData.members.length > 0 ? (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 120, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  メンバー
                </TableCell>
                {days.map(day => (
                  <TableCell key={day} align="center" sx={{ minWidth: 44, bgcolor: getCellBg(day), px: 0.5 }}>
                    <Typography variant="caption">{dayLabel(day)}</Typography>
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ minWidth: 80 }}>予定計</TableCell>
                <TableCell align="right" sx={{ minWidth: 80 }}>実績計</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calendarData.members.map(member => (
                <TableRow key={member.memberId} hover>
                  <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{member.memberName}</Typography>
                    <Typography variant="caption" color="text.secondary">{member.dailyPlannedHours}h/日</Typography>
                  </TableCell>
                  {days.map(day => (
                    <TableCell key={day} align="center" sx={{ bgcolor: getCellBg(day), px: 0.5 }}>
                      {!isWeekend(day) && !isHoliday(day) ? (
                        <Typography variant="caption">{member.dailyPlannedHours}</Typography>
                      ) : null}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">{member.plannedHours}h</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{member.actualHours != null ? `${member.actualHours}h` : '-'}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            工数データがありません。工数管理から予定工数を入力してください。
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
