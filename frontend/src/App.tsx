import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppLayout from './components/layout/AppLayout';
import ProjectsPage from './pages/ProjectsPage';
import MembersPage from './pages/MembersPage';
import ManHoursPage from './pages/ManHoursPage';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';

const theme = createTheme({
  palette: { mode: 'light' },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="manhours" element={<ManHoursPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
