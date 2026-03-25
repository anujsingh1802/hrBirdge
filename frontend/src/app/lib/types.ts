export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  location?: string;
  createdAt?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  description: string;
  postedAt?: string;
  isActive?: boolean;
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: ApplicationStatus;
  location?: string;
  type?: string;
  salary?: string;
  coverLetter?: string;
  resumeUrl?: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantSkills?: string[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}
