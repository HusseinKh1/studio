
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

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

function extractErrorMessage(data: any, defaultMessage: string): string {
  if (!data) return defaultMessage;
  if (typeof data === 'string') return data;
  if (data && typeof data.message === 'string' && data.message.trim() !== "") return data.message;
  if (data && typeof data.Message === 'string' && data.Message.trim() !== "") return data.Message; // ASP.NET Core sometimes uses uppercase M
  if (data && typeof data.detail === 'string' && data.detail.trim() !== "") return data.detail;
  if (data && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (typeof firstError === 'string' && firstError.trim() !== "") return firstError;
    if (typeof firstError?.message === 'string' && firstError.message.trim() !== "") return firstError.message;
    if (typeof firstError?.msg === 'string' && firstError.msg.trim() !== "") return firstError.msg; // Common in some validation libraries
  }
  // Check for ASP.NET Core validation problem details
  if (data && typeof data.title === 'string' && data.title.trim() !== "" && data.errors && typeof data.errors === 'object') {
    const errorKeys = Object.keys(data.errors);
    if (errorKeys.length > 0 && Array.isArray(data.errors[errorKeys[0]]) && data.errors[errorKeys[0]].length > 0) {
      return `${data.title}: ${errorKeys[0]} - ${data.errors[errorKeys[0]][0]}`;
    }
    return data.title;
  }
  return defaultMessage;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        errorData = await response.json();
      } catch (e) {
        // If JSON parsing fails, but content type was JSON, it's an issue.
        // Fallback to statusText.
        errorData = { messageFromCatch: response.statusText || `Failed to parse JSON error response for status ${response.status}` };
      }
    } else {
      // If not JSON, use statusText or a generic message.
      const textResponse = await response.text().catch(() => null);
      errorData = { messageFromNonJson: textResponse || response.statusText || `Non-JSON error response with status ${response.status}` };
    }
    
    console.error('API Error:', response.status, errorData || "<No error data parsed>");

    const defaultApiErrorMsg = `API request failed with status ${response.status}`;
    const extractedMsg = extractErrorMessage(errorData, defaultApiErrorMsg);

    if (response.status === 401 || response.status === 403) {
      const authErrorMsg = extractErrorMessage(errorData, `Authorization/Authentication error with status ${response.status}`);
      throw new AuthError(authErrorMsg);
    }
    throw new Error(extractedMsg);
  }
  
  if (response.status === 204) { // No Content
    return null as T;
  }

  // Check if response is actually JSON before parsing, to prevent errors with empty/non-JSON 2xx responses
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  // For 2xx responses that are not JSON (e.g. plain text or empty)
  return response.text().then(text => text as unknown as T); // Or handle as appropriate for non-JSON success
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

export const addIssue = (data: RoadSurfaceIssueRequest): Promise<RoadSurfaceIssueDto> => 
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

export const addResponse = (data: PublicUtilityResponseRequest): Promise<PublicUtilityResponseDto> => 
  fetchApi<PublicUtilityResponseDto>('/publicutility', { method: 'POST', body: JSON.stringify(data) });

export const updateResponse = (id: string, data: PublicUtilityResponseRequest): Promise<void> =>
  fetchApi<void>(`/publicutility/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteResponse = (id: string): Promise<void> =>
  fetchApi<void>(`/publicutility/${id}`, { method: 'DELETE' });
