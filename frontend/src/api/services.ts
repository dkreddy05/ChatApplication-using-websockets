import apiClient from './client';

export interface RegistrationPayload {
  firstname: string;
  lastname: string;
  nickname: string;
  mail: string;
  password: string;
}

export interface LoginPayload {
  username: string; // backend expects username (email)
  password: string;
}

export interface ChatUserResponse {
  nickname: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
}

export interface UserSearchResult {
  nickname: string;
  firstName?: string;
  lastName?: string;
}

export interface ChatMessageDto {
  id?: number;
  sender?: string;
  from?: string;
  recipientTo?: string;
  content?: string;
  message?: string;
  type: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  timeStamp?: string;
  timestamp?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface FileMetadata {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface SignUpPayload {
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  password: string;
  role?: string;
  profilePictureUrl?: string;
}

export const loginUser = (payload: LoginPayload) =>
  apiClient.post('/api/auth/login', payload).then((res) => res.data);

export const registerUser = (payload: RegistrationPayload) =>
  apiClient.post('/api/registration/', payload).then(() => undefined);

export const confirmRegistration = (token: string) =>
  apiClient
    .get<string>('/api/registration/confirm', { params: { token } })
    .then((res) => res.data);

export const signUpUser = (payload: SignUpPayload) =>
  apiClient.post('/api/Users/signUp', payload).then((res) => res.data);

export const getCurrentUser = () =>
  apiClient.get<ChatUserResponse>('/api/user/').then((res) => res.data);

export const updateNickname = (nickname: string) =>
  apiClient.put('/api/user/', { nickname }).then(() => undefined);

export const updateProfilePicture = (profilePictureUrl: string) =>
  apiClient.put('/api/user/profile-picture', { profilePictureUrl }).then(() => undefined);

export const searchUsers = (query: string) =>
  apiClient
    .get<UserSearchResult[]>('/api/Users/search', { params: { query } })
    .then((res) => res.data);

export const getPrivateHistory = (user1: string, user2: string) =>
  apiClient
    .get<ChatMessageDto[]>('/api/chat/history', { params: { user1, user2 } })
    .then((res) => res.data);

export const getGroupHistory = (pageSize = 50, page = 0) =>
  apiClient
    .get<ChatMessageDto[]>('/api/chat/group/history', { params: { pageSize, page } })
    .then((res) => res.data);

export const uploadMessageFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient
    .post<FileMetadata>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

export const uploadProfilePictureFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient
    .post<string>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

export const logoutUser = () => apiClient.post('/logout').then(() => undefined);
