export enum ContainerType {
  CARTON = 'carton',
  SAC = 'sac',
  VALISE = 'valise',
  BOITE = 'boite',
  DOSSIER = 'dossier',
  SACHET = 'sachet',
}

export enum ContainerStatus {
  EMBALLE = 'emballe',
  CAMION = 'camion',
  DEPOSE = 'depose',
  DEBALLE = 'deballe',
}

export enum ContainerPriority {
  URGENT = 'urgent',
  SEMAINE = 'semaine',
  PAS_PRESSE = 'pas_presse',
}

export enum MoveStatus {
  PREPARATION = 'preparation',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  category?: string;
  photoUrl?: string;
  estimatedValue?: number;
  isFragile?: boolean;
  containerId: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  containerId: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  icon?: string;
  floor?: number;
  description?: string;
  moveId?: string;
  isDestination?: boolean;
}

export interface Container {
  id: string;
  name: string;
  description?: string;
  type: ContainerType;
  status: ContainerStatus;
  priority: ContainerPriority;
  roomId?: string;
  destinationRoomId?: string;
  isScannedOnArrival: boolean;
  scannedAt?: string;
  moveId?: string;
  qrCodeData: string;
  notes?: string;
  isThirdParty?: boolean;
  thirdPartyOwner?: string;
  returnDate?: string;
  items: Item[];
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}

export interface Move {
  id: string;
  name: string;
  description?: string;
  status: MoveStatus;
  fromAddress?: string;
  toAddress?: string;
  moveDate?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoveStats {
  total: number;
  scanned: number;
  missing: number;
  percentage: number;
}

export type PrinterStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'printing' | 'error';

export interface BLEDevice {
  id: string;
  name: string | null;
  rssi?: number;
}

export interface StickerData {
  containerName: string;
  containerNumber: number;
  roomName?: string;
  items: string[];
  qrCodeData: string;
  type: ContainerType;
  priority: ContainerPriority;
}
