
export enum IssueStatus {
  Reported = 'Reported',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  address: string;
  email: string;
  role: 'Admin' | 'User';
}

export interface TokenDto {
  id: string;
  email: string;
  role: 'Admin' | 'User';
  userName: string;
  accessToken: string;
  durationInMinutes: number;
}

export interface RoadSurfaceIssueDto {
  id: string;
  description: string;
  location: string;
  reportedDate: string; // ISO Date string
  status: IssueStatus;
  reportedByUserId: string;
  reportedByUser?: AppUser; // Optional, depending on API response
  responses?: PublicUtilityResponseDto[]; // Optional
}

export interface PublicUtilityResponseDto {
  id: string;
  comment: string;
  responseDate: string; // ISO Date string
  roadSurfaceIssueId: string;
}

// Request Payloads
export interface UserRegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface RoadSurfaceIssueRequest {
  description: string;
  location: string;
  reportedByUserId: string;
}

export interface PublicUtilityResponseRequest {
  comment: string;
  roadSurfaceIssueId: string;
}
