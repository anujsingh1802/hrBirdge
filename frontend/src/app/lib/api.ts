import type { Application, ApplicationStatus, AuthUser, Blog, Job, PaginatedResult } from './types';

// @ts-ignore - Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ApiErrorShape {
  message?: string;
  errors?: string[];
}

interface BackendPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

interface BackendUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  location?: string;
  createdAt?: string;
}

interface BackendJob {
  _id: string;
  title: string;
  company: string;
  location?: string;
  job_type?: string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  skills?: string[];
  description?: string;
  createdAt?: string;
  isActive?: boolean;
}

interface BackendApplication {
  _id: string;
  status: ApplicationStatus;
  createdAt: string;
  cover_letter?: string;
  resume_url?: string;
  job_id:
    | string
    | {
        _id?: string;
        title?: string;
        company?: string;
        location?: string;
        job_type?: string;
        salary?: string;
      };
  user_id?:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
        skills?: string[];
      };
}

export class ApiError extends Error {
  errors?: string[];

  constructor(message: string, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | undefined | null>) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  if (API_BASE_URL.startsWith('http')) {
    return url.toString();
  }

  return `${url.pathname}${url.search}`;
}

async function request<T>(path: string, init: RequestInit = {}, token?: string, params?: Record<string, string | number | undefined | null>) {
  const headers = new Headers(init.headers);

  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...init,
    headers,
    credentials: init.credentials || 'include',
  };

  const response = await fetch(buildUrl(path, params), fetchOptions);

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorData = data as ApiErrorShape | null;
    throw new ApiError(errorData?.message || 'Something went wrong', errorData?.errors);
  }

  return data as T;
}

function formatSalaryRange(job: BackendJob) {
  if (job.salary?.trim()) return job.salary;

  const min = job.salary_min ?? 0;
  const max = job.salary_max ?? 0;

  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (max) return `Up to ${max.toLocaleString()}`;
  if (min) return `From ${min.toLocaleString()}`;
  return 'Not specified';
}

function normalizeUser(user: BackendUser): AuthUser {
  return {
    id: user.id || user._id || '',
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    skills: user.skills,
    resumeUrl: user.resumeUrl,
    location: user.location,
    createdAt: user.createdAt,
  };
}

function normalizeJob(job: BackendJob): Job {
  return {
    id: job._id,
    title: job.title,
    company: job.company,
    location: job.location || 'Location not specified',
    type: job.job_type || 'Not specified',
    salary: formatSalaryRange(job),
    salaryMin: job.salary_min ?? 0,
    salaryMax: job.salary_max ?? 0,
    skills: job.skills || [],
    description: job.description || 'No description provided yet.',
    postedAt: job.createdAt,
    isActive: job.isActive,
  };
}

function normalizeApplication(item: BackendApplication): Application {
  const jobObject = typeof item.job_id === 'string' ? null : item.job_id;
  const userObject = item.user_id && typeof item.user_id !== 'string' ? item.user_id : null;

  return {
    id: item._id,
    jobId: typeof item.job_id === 'string' ? item.job_id : item.job_id?._id || '',
    jobTitle: jobObject?.title || 'Unknown job',
    company: jobObject?.company || 'Unknown company',
    appliedDate: item.createdAt,
    status: item.status,
    location: jobObject?.location,
    type: jobObject?.job_type,
    salary: jobObject?.salary,
    coverLetter: item.cover_letter || '',
    resumeUrl: item.resume_url || '',
    applicantName: userObject?.name,
    applicantEmail: userObject?.email,
    applicantSkills: userObject?.skills || [],
  };
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

export interface JobPayload {
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary: string;
  salary_min: number;
  salary_max: number;
  skills: string[];
  description: string;
}

export async function sendOtp(email: string) {
  return request<{ message: string; success: boolean }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, otp: string) {
  const data = await request<{ token: string; user: BackendUser; message: string }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  return { token: data.token, user: normalizeUser(data.user), message: data.message };
}

export async function registerUser(payload: { name: string; email: string; password: string }) {
  const data = await request<{ token: string; user: BackendUser; message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { token: data.token, user: normalizeUser(data.user), message: data.message };
}

export async function loginUser(payload: { email: string; password: string }) {
  const data = await request<{ token: string; user: BackendUser; message: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { token: data.token, user: normalizeUser(data.user), message: data.message };
}

export async function refreshAuth() {
  const data = await request<{ token: string; success: boolean }>('/auth/refresh', {
    method: 'POST',
  });
  return { token: data.token };
}

export async function logoutUser() {
  return request<{ message: string; success: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getMe(token: string) {
  const data = await request<{ user: BackendUser }>('/auth/me', {}, token);
  return normalizeUser(data.user);
}

export async function updateMe(token: string, payload: Partial<AuthUser>) {
  const data = await request<{ user: BackendUser; message: string }>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);

  return { user: normalizeUser(data.user), message: data.message };
}

export async function uploadResume(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  const data = await request<{ user: BackendUser; message: string; resumeUrl: string }>('/auth/resume', {
    method: 'POST',
    body: formData,
  }, token);

  return { user: normalizeUser(data.user), message: data.message, resumeUrl: data.resumeUrl };
}

export async function getAdminStats(token: string) {
  return request<{
    success: boolean;
    data: {
      jobs: { totalJobs: number; activeJobs: number };
      applications: { total: number; pending: number; reviewed: number; shortlisted: number; rejected: number };
    };
  }>('/stats/admin', {}, token);
}

export async function getCandidateStats(token: string) {
  return request<{
    success: boolean;
    data: { total: number; pending: number; reviewed: number; shortlisted: number; rejected: number };
  }>('/stats/candidate', {}, token);
}

export async function getJobs(filters: JobFilters = {}): Promise<PaginatedResult<Job>> {
  const data = await request<{ data: BackendJob[]; pagination: BackendPagination }>('/jobs', {}, undefined, filters);
  return {
    items: data.data.map(normalizeJob),
    pagination: data.pagination,
  };
}

export async function getJob(id: string): Promise<Job> {
  const data = await request<{ data: BackendJob }>(`/jobs/${id}`);
  return normalizeJob(data.data);
}

export async function createJob(payload: JobPayload, token: string): Promise<Job> {
  const data = await request<{ data: BackendJob }>('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);

  return normalizeJob(data.data);
}

export async function updateJob(id: string, payload: Partial<JobPayload> & { isActive?: boolean }, token: string): Promise<Job> {
  const data = await request<{ data: BackendJob }>(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token);

  return normalizeJob(data.data);
}

export async function deleteJob(id: string, token: string) {
  return request<{ message: string }>(`/jobs/${id}`, { method: 'DELETE' }, token);
}

export async function hardDeleteJob(id: string, token: string) {
  return request<{ message: string }>(`/jobs/${id}/hard`, { method: 'DELETE' }, token);
}

export async function applyToJob(jobId: string, token: string, payload: { resume_url: string; cover_letter: string }) {
  const data = await request<{ data: BackendApplication; message: string }>('/apply', {
    method: 'POST',
    body: JSON.stringify({
      job_id: jobId,
      resume_url: payload.resume_url,
      cover_letter: payload.cover_letter,
    }),
  }, token);

  return {
    message: data.message,
    application: normalizeApplication(data.data),
  };
}

export async function getMyApplications(token: string, params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResult<Application>> {
  const data = await request<{ data: BackendApplication[]; pagination: BackendPagination }>('/apply/my', {}, token, params);
  return {
    items: data.data.map(normalizeApplication),
    pagination: data.pagination,
  };
}

export async function getApplicantsForJob(jobId: string, token: string, params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResult<Application>> {
  const data = await request<{ data: BackendApplication[]; pagination: BackendPagination }>(`/apply/job/${jobId}`, {}, token, params);
  return {
    items: data.data.map(normalizeApplication),
    pagination: data.pagination,
  };
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus, token: string) {
  const data = await request<{ data: BackendApplication; message: string }>(`/apply/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token);

  return {
    message: data.message,
    application: normalizeApplication(data.data),
  };
}

export async function uploadJobs(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  return request<{
    success: boolean;
    message: string;
    total_inserted: number;
    skipped: number;
    errors?: Array<{ row: number | null; field: string; message: string }>;
  }>('/jobs/upload', {
    method: 'POST',
    body: formData,
  }, token);
}

export interface Company {
  _id: string;
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

export async function getCompanies(filters: CompanyFilters = {}): Promise<PaginatedResult<Company>> {
  const data = await request<{ items: Company[]; pagination: BackendPagination }>('/companies', {}, undefined, filters as any);
  return {
    items: data.items,
    pagination: data.pagination,
  };
}

// ─── Blog API ─────────────────────────────────────────────────────────────────

export async function getBlogs(params: { page?: number; limit?: number } = {}): Promise<{ items: Blog[]; pagination: BackendPagination }> {
  const data = await request<{ data: Blog[]; pagination: BackendPagination }>('/blogs', {}, undefined, params as any);
  return { items: data.data, pagination: data.pagination };
}

export async function getBlogBySlug(slug: string): Promise<Blog> {
  const data = await request<{ data: Blog }>(`/blogs/${slug}`);
  return data.data;
}

export async function createBlog(formData: FormData, token: string): Promise<Blog> {
  const data = await request<{ data: Blog }>('/blogs', { method: 'POST', body: formData }, token);
  return data.data;
}

export async function updateBlog(id: string, formData: FormData, token: string): Promise<Blog> {
  const data = await request<{ data: Blog }>(`/blogs/${id}`, { method: 'PUT', body: formData }, token);
  return data.data;
}

export async function deleteBlog(id: string, token: string) {
  return request<{ message: string; success: boolean }>(`/blogs/${id}`, { method: 'DELETE' }, token);
}

export async function uploadBlogMedia(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const data = await request<{ url: string; success: boolean }>('/blogs/upload-media', { method: 'POST', body: formData }, token);
  return data.url;
}
