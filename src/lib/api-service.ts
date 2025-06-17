import type {
  TokenDto,
  UserLoginRequest,
  UserRegisterRequest,
  RoadSurfaceIssueDto,
  RoadSurfaceIssueRequest,
  PublicUtilityResponseDto,
  PublicUtilityResponseRequest,
  IssueStatus,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7280/api';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    console.error('API Error:', response.status, errorData);
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  
  if (response.status === 204) { // No Content
    return null as T;
  }

  return response.json();
}

// Auth Endpoints
export const registerUser = (data: UserRegisterRequest): Promise<TokenDto> =>
  fetchApi<TokenDto>('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const loginUser = (data: UserLoginRequest): Promise<TokenDto> =>
  fetchApi<TokenDto>('/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const signOutUser = (userId: string): Promise<void> =>
  fetchApi<void>(`/auth/sign-out/${userId}`, { method: 'POST' });

// Road Surface Issue Endpoints
export const getAllIssues = (): Promise<RoadSurfaceIssueDto[]> =>
  fetchApi<RoadSurfaceIssueDto[]>('/roadsurfaceissue');

export const getIssueById = (id: string): Promise<RoadSurfaceIssueDto> =>
  fetchApi<RoadSurfaceIssueDto>(`/roadsurfaceissue/${id}`);

export const getIssuesByUserId = (userId: string): Promise<RoadSurfaceIssueDto[]> =>
  fetchApi<RoadSurfaceIssueDto[]>(`/roadsurfaceissue/user/${userId}`);

export const addIssue = (data: RoadSurfaceIssueRequest): Promise<RoadSurfaceIssueDto> => // Assuming backend returns the created issue
  fetchApi<RoadSurfaceIssueDto>('/roadsurfaceissue', { method: 'POST', body: JSON.stringify(data) });

export const updateIssue = (id: string, data: Partial<RoadSurfaceIssueRequest>): Promise<void> =>
  fetchApi<void>(`/roadsurfaceissue/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  
export const updateIssueStatus = (id: string, status: IssueStatus): Promise<void> => 
  fetchApi<void>(`/roadsurfaceissue/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });


export const deleteIssue = (id: string): Promise<void> =>
  fetchApi<void>(`/roadsurfaceissue/${id}`, { method: 'DELETE' });

export const getIssuesByStatus = (status: IssueStatus): Promise<RoadSurfaceIssueDto[]> =>
  fetchApi<RoadSurfaceIssueDto[]>(`/roadsurfaceissue/status/${status}`);

// Public Utility Response Endpoints
export const getResponsesByIssueId = (issueId: string): Promise<PublicUtilityResponseDto[]> =>
  fetchApi<PublicUtilityResponseDto[]>(`/publicutility/issue/${issueId}`);

export const addResponse = (data: PublicUtilityResponseRequest): Promise<PublicUtilityResponseDto> => // Assuming backend returns the created response
  fetchApi<PublicUtilityResponseDto>('/publicutility', { method: 'POST', body: JSON.stringify(data) });

export const updateResponse = (id: string, data: PublicUtilityResponseRequest): Promise<void> =>
  fetchApi<void>(`/publicutility/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteResponse = (id: string): Promise<void> =>
  fetchApi<void>(`/publicutility/${id}`, { method: 'DELETE' });
