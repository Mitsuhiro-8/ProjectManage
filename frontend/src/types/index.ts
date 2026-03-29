export type ProjectStatus = 'Active' | 'Completed' | 'OnHold';
export type TaskStatus = 'Todo' | 'InProgress' | 'Done';

export interface Member {
  id: number;
  name: string;
  email?: string;
  role?: string;
  defaultMonthlyHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  projectMembers?: { member: Member }[];
}

/** タスク管理機能のタスクエンティティ */
export interface Task {
  id: number;
  projectId: number;
  memberId: number;
  name: string;
  description?: string;
  status: TaskStatus;
  plannedHours: number;
  /** 未入力の場合は undefined */
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  project?: Pick<Project, 'id' | 'name'>;
  member?: Pick<Member, 'id' | 'name'>;
}

/** タスク工数集計（プロジェクト×メンバー別） */
export interface TaskSummary {
  projectId: number;
  projectName: string;
  memberId: number;
  memberName: string;
  taskCount: number;
  plannedHours: number;
  /** actualHours が null のタスクは 0 として集計される */
  actualHours: number;
}

export interface ManHour {
  id: number;
  projectId: number;
  memberId: number;
  year: number;
  month: number;
  plannedHours: number;
  actualHours?: number;
  memo?: string;
  updatedAt: string;
  member?: Member;
  project?: Project;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  type: 'National' | 'Company';
}

export interface CalendarMemberSummary {
  memberId: number;
  memberName: string;
  plannedHours: number;
  actualHours?: number;
  workingDays: number;
  dailyPlannedHours: number;
}

export interface CalendarData {
  year: number;
  month: number;
  holidays: string[];
  workingDays: number;
  members: CalendarMemberSummary[];
}
