export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type LeaveType = 'SICK' | 'CASUAL' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

export interface User {
  id: string;
  supabaseId: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: Role;
  department?: string | null;
  designation?: string | null;
  phone?: string | null;
  joinedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  assigneeId?: string | null;
  assignee?: User | null;
  creatorId: string;
  creator?: User;
  tags: string[];
  attachments: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  user?: User;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string | null;
  comments?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  sender?: User;
  content: string;
  type: MessageType;
  fileUrl?: string | null;
  createdAt: Date;
  editedAt?: Date | null;
}

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  createdAt: Date;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: User;
  isPublic: boolean;
  tags: string[];
  fileUrl?: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  priority: Priority;
  pinned: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: Date;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
