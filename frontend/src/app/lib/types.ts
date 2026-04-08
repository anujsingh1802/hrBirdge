export type UserRole = 'user' | 'candidate' | 'admin';

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

// ─── Blog Types ───────────────────────────────────────────────────────────────

export type ContentBlockType = 'text' | 'image' | 'video';

export interface ContentBlock {
  type: ContentBlockType;
  value: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  content: ContentBlock[];
  author: { _id: string; name: string } | string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  type: string;
  location: string;
  rating: number;
  tags: string[];
  description: string;
}

export interface CompanyFilters {
  type?: string;
  search?: string;
  location?: string;
  limit?: number;
  page?: number;
}

export interface JobFilters {
  search?: string;
  location?: string;
  job_type?: string;
  skills?: string;
  salary_max?: number;
  page?: number;
  limit?: number;
  sort?: string;
  [key: string]: string | number | undefined | null;
}
