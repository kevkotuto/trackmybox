import axios, { AxiosInstance } from 'axios';
import {
  Container,
  Item,
  Move,
  Room,
  Photo,
  MoveStats,
  ContainerStatus,
  ContainerType,
  ContainerPriority,
  ChecklistItem,
} from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://trackmybox.generale-ci.com/api/v1';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  try {
    const { useAuthStore } = require('../stores/useAuthStore');
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export interface ContainerFilters {
  moveId?: string;
  roomId?: string;
  status?: ContainerStatus;
  type?: ContainerType;
  priority?: ContainerPriority;
  search?: string;
  isScannedOnArrival?: boolean;
}

export type CreateContainerData = Omit<Container, 'id' | 'items' | 'photos' | 'createdAt' | 'updatedAt'>;
export type UpdateContainerData = Partial<CreateContainerData>;
export type CreateItemData = Omit<Item, 'id' | 'createdAt'>;
export type UpdateItemData = Partial<CreateItemData>;
export type CreateMoveData = Omit<Move, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMoveData = Partial<CreateMoveData>;
export type CreateRoomData = Omit<Room, 'id'>;
export type UpdateRoomData = Partial<CreateRoomData>;
export type CreatePhotoData = Omit<Photo, 'id' | 'createdAt'>;

// ---------- Containers ----------

export const containerApi = {
  async getAll(filters?: ContainerFilters): Promise<Container[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.moveId) params.append('moveId', filters.moveId);
      if (filters.roomId) params.append('roomId', filters.roomId);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.isScannedOnArrival !== undefined)
        params.append('isScannedOnArrival', String(filters.isScannedOnArrival));
    }
    const { data } = await client.get<Container[]>('/containers', { params });
    return data;
  },

  async getById(id: string): Promise<Container> {
    const { data } = await client.get<Container>(`/containers/${id}`);
    return data;
  },

  async getByQR(qrCode: string): Promise<Container> {
    const { data } = await client.get<Container>('/containers/qr', { params: { code: qrCode } });
    return data;
  },

  async create(containerData: CreateContainerData): Promise<Container> {
    const { data } = await client.post<Container>('/containers', containerData);
    return data;
  },

  async update(id: string, containerData: UpdateContainerData): Promise<Container> {
    const { data } = await client.patch<Container>(`/containers/${id}`, containerData);
    return data;
  },

  async scan(id: string): Promise<Container> {
    const { data } = await client.post<Container>(`/containers/${id}/scan`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await client.delete(`/containers/${id}`);
  },

  async getStats(moveId?: string): Promise<MoveStats> {
    const params = moveId ? { moveId } : {};
    const { data } = await client.get<MoveStats>('/containers/stats', { params });
    return data;
  },
};

// ---------- Items ----------

export const itemApi = {
  async getByContainer(containerId: string): Promise<Item[]> {
    const { data } = await client.get<Item[]>(`/containers/${containerId}/items`);
    return data;
  },

  async create(itemData: CreateItemData): Promise<Item> {
    const { data } = await client.post<Item>('/items', itemData);
    return data;
  },

  async update(id: string, itemData: UpdateItemData): Promise<Item> {
    const { data } = await client.put<Item>(`/items/${id}`, itemData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await client.delete(`/items/${id}`);
  },
};

// ---------- Moves ----------

export const moveApi = {
  async getAll(): Promise<Move[]> {
    const { data } = await client.get<Move[]>('/moves');
    return data;
  },

  async getById(id: string): Promise<Move> {
    const { data } = await client.get<Move>(`/moves/${id}`);
    return data;
  },

  async create(moveData: CreateMoveData): Promise<Move> {
    const { data } = await client.post<Move>('/moves', moveData);
    return data;
  },

  async update(id: string, moveData: UpdateMoveData): Promise<Move> {
    const { data } = await client.put<Move>(`/moves/${id}`, moveData);
    return data;
  },

  async start(id: string): Promise<Move> {
    const { data } = await client.post<Move>(`/moves/${id}/start`);
    return data;
  },

  async complete(id: string): Promise<Move> {
    const { data } = await client.post<Move>(`/moves/${id}/complete`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await client.delete(`/moves/${id}`);
  },
};

// ---------- Rooms ----------

export const roomApi = {
  async getAll(moveId?: string): Promise<Room[]> {
    const params = moveId ? { moveId } : {};
    const { data } = await client.get<Room[]>('/rooms', { params });
    return data;
  },

  async create(roomData: CreateRoomData): Promise<Room> {
    const { data } = await client.post<Room>('/rooms', roomData);
    return data;
  },

  async update(id: string, roomData: UpdateRoomData): Promise<Room> {
    const { data } = await client.put<Room>(`/rooms/${id}`, roomData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await client.delete(`/rooms/${id}`);
  },
};

// ---------- Checklist ----------

export const checklistApi = {
  async getByContainer(containerId: string): Promise<ChecklistItem[]> {
    const { data } = await client.get<ChecklistItem[]>(`/containers/${containerId}/checklist`);
    return data;
  },

  async create(containerId: string, label: string): Promise<ChecklistItem> {
    const { data } = await client.post<ChecklistItem>(`/containers/${containerId}/checklist`, { label });
    return data;
  },

  async toggle(itemId: string, isDone: boolean): Promise<ChecklistItem> {
    const { data } = await client.patch<ChecklistItem>(`/checklist/${itemId}`, { isDone });
    return data;
  },

  async delete(itemId: string): Promise<void> {
    await client.delete(`/checklist/${itemId}`);
  },
};

// ---------- Auth ----------

export const authApi = {
  async createHousehold(name: string, deviceName: string, pin: string): Promise<{ code: string; householdId: string; token: string }> {
    const { data } = await client.post('/auth/household', { name, deviceName, pin });
    return data;
  },

  async joinHousehold(code: string, deviceName: string, pin: string): Promise<{ token: string; householdId: string }> {
    const { data } = await client.post('/auth/join', { code, deviceName, pin });
    return data;
  },

  async loginDevice(code: string, pin: string): Promise<{ token: string; householdId: string; code: string }> {
    const { data } = await client.post('/auth/login', { code, pin });
    return data;
  },

  async verifyPin(pin: string): Promise<{ token: string }> {
    const { data } = await client.post('/auth/verify-pin', { pin });
    return data;
  },

  async getDevices(): Promise<{ id: string; deviceName: string; createdAt: string }[]> {
    const { data } = await client.get('/auth/household/devices');
    return data;
  },

  async deleteHousehold(): Promise<void> {
    await client.delete('/auth/household');
  },
};

// ---------- Notifications ----------

export const notificationsApi = {
  async registerToken(expoPushToken: string): Promise<void> {
    await client.post('/notifications/register', { expoPushToken });
  },
};

// ---------- Photos ----------

export const photoApi = {
  async getByContainer(containerId: string): Promise<Photo[]> {
    const { data } = await client.get<Photo[]>(`/containers/${containerId}/photos`);
    return data;
  },

  async create(photoData: CreatePhotoData): Promise<Photo> {
    const { data } = await client.post<Photo>('/photos', photoData);
    return data;
  },

  async upload(containerId: string, localUri: string, caption?: string): Promise<Photo> {
    const filename = localUri.split('/').pop() || 'photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const formData = new FormData();
    formData.append('file', { uri: localUri, name: filename, type: mimeType } as any);
    formData.append('containerId', containerId);
    if (caption) formData.append('caption', caption);
    const { data } = await client.post<Photo>('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async delete(id: string): Promise<void> {
    await client.delete(`/photos/${id}`);
  },
};
