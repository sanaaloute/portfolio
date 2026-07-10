import type {
  Blog,
  Experience,
  LoginCredentials,
  Profile,
  Project,
  SkillGroup,
  MeResponse,
  UploadedImage,
} from './types';

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || '';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:changed'));
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error('Invalid server response');
  }
}

// Auth
export const authApi = {
  login: (payload: LoginCredentials) =>
    request<{ ok: boolean }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<MeResponse>('/api/auth/me'),
  logout: () =>
    request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
};

// Profile
export const profileApi = {
  get: () => request<Profile>('/api/profile'),
  update: (payload: Partial<Profile>) =>
    request<Profile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

// Projects
export const projectsApi = {
  list: () => request<Project[]>('/api/projects'),
  get: (slug: string) => request<Project>(`/api/projects/${slug}`),
  create: (payload: Partial<Project>) =>
    request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(payload) }),
  update: (slug: string, payload: Partial<Project>) =>
    request<Project>(`/api/projects/${slug}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (slug: string) =>
    request<void>(`/api/projects/${slug}`, { method: 'DELETE' }),
};

// Experiences
export const experiencesApi = {
  list: () => request<Experience[]>('/api/experiences'),
  get: (slug: string) => request<Experience>(`/api/experiences/${slug}`),
  create: (payload: Partial<Experience>) =>
    request<Experience>('/api/experiences', { method: 'POST', body: JSON.stringify(payload) }),
  update: (slug: string, payload: Partial<Experience>) =>
    request<Experience>(`/api/experiences/${slug}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (slug: string) =>
    request<void>(`/api/experiences/${slug}`, { method: 'DELETE' }),
};

// Skills
export const skillsApi = {
  list: () => request<SkillGroup[]>('/api/skills'),
  create: (payload: { category: string; name: string; position: number }) =>
    request<{ id: number }>('/api/skills', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: { category?: string; name?: string; position?: number }) =>
    request<{ id: number }>(`/api/skills/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id: number) => request<void>(`/api/skills/${id}`, { method: 'DELETE' }),
};

// Blogs
export const blogsApi = {
  list: () => request<Blog[]>('/api/blogs'),
  listAll: () => request<Blog[]>('/api/blogs/all'),
  get: (slug: string) => request<Blog>(`/api/blogs/${slug}`),
  create: (payload: Partial<Blog>) =>
    request<Blog>('/api/blogs', { method: 'POST', body: JSON.stringify(payload) }),
  update: (slug: string, payload: Partial<Blog>) =>
    request<Blog>(`/api/blogs/${slug}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (slug: string) => request<void>(`/api/blogs/${slug}`, { method: 'DELETE' }),
};

// Uploads
export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<UploadedImage>('/api/upload/image', {
      method: 'POST',
      body: formData,
    });
  },
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<UploadedImage>('/api/upload/resume', {
      method: 'POST',
      body: formData,
    });
  },
  list: () => request<UploadedImage[]>('/api/upload/images'),
  delete: (filename: string) =>
    request<void>(`/api/upload/images/${filename}`, { method: 'DELETE' }),
};
