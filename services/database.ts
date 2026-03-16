import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Item,
  Move,
  Room,
  Photo,
  MoveStats,
  ContainerType,
  ContainerStatus,
  ContainerPriority,
  MoveStatus,
} from '../types';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('trackmybox.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS moves (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'preparation',
      fromAddress TEXT,
      toAddress TEXT,
      moveDate TEXT,
      startedAt TEXT,
      completedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      floor INTEGER,
      description TEXT,
      moveId TEXT,
      isDestination INTEGER DEFAULT 0,
      FOREIGN KEY (moveId) REFERENCES moves(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS containers (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'carton',
      status TEXT NOT NULL DEFAULT 'emballe',
      priority TEXT NOT NULL DEFAULT 'semaine',
      roomId TEXT,
      destinationRoomId TEXT,
      isScannedOnArrival INTEGER DEFAULT 0,
      scannedAt TEXT,
      moveId TEXT,
      qrCodeData TEXT NOT NULL,
      notes TEXT,
      isThirdParty INTEGER DEFAULT 0,
      thirdPartyOwner TEXT,
      returnDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY (destinationRoomId) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY (moveId) REFERENCES moves(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      photoUrl TEXT,
      estimatedValue REAL,
      isFragile INTEGER DEFAULT 0,
      containerId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (containerId) REFERENCES containers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      containerId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (containerId) REFERENCES containers(id) ON DELETE CASCADE
    );
  `);
}

function nowISO(): string {
  return new Date().toISOString();
}

// ---------- Container helpers ----------

function rowToContainer(row: Record<string, unknown>): Omit<Container, 'items' | 'photos'> {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    type: row.type as ContainerType,
    status: row.status as ContainerStatus,
    priority: row.priority as ContainerPriority,
    roomId: (row.roomId as string) || undefined,
    destinationRoomId: (row.destinationRoomId as string) || undefined,
    isScannedOnArrival: Boolean(row.isScannedOnArrival),
    scannedAt: (row.scannedAt as string) || undefined,
    moveId: (row.moveId as string) || undefined,
    qrCodeData: row.qrCodeData as string,
    notes: (row.notes as string) || undefined,
    isThirdParty: Boolean(row.isThirdParty),
    thirdPartyOwner: (row.thirdPartyOwner as string) || undefined,
    returnDate: (row.returnDate as string) || undefined,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

function rowToItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    category: (row.category as string) || undefined,
    photoUrl: (row.photoUrl as string) || undefined,
    estimatedValue: row.estimatedValue != null ? Number(row.estimatedValue) : undefined,
    isFragile: row.isFragile != null ? Boolean(row.isFragile) : undefined,
    containerId: row.containerId as string,
    createdAt: row.createdAt as string,
  };
}

function rowToPhoto(row: Record<string, unknown>): Photo {
  return {
    id: row.id as string,
    url: row.url as string,
    caption: (row.caption as string) || undefined,
    containerId: row.containerId as string,
    createdAt: row.createdAt as string,
  };
}

function rowToMove(row: Record<string, unknown>): Move {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    status: row.status as MoveStatus,
    fromAddress: (row.fromAddress as string) || undefined,
    toAddress: (row.toAddress as string) || undefined,
    moveDate: (row.moveDate as string) || undefined,
    startedAt: (row.startedAt as string) || undefined,
    completedAt: (row.completedAt as string) || undefined,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

function rowToRoom(row: Record<string, unknown>): Room {
  return {
    id: row.id as string,
    name: row.name as string,
    icon: (row.icon as string) || undefined,
    floor: row.floor != null ? Number(row.floor) : undefined,
    description: (row.description as string) || undefined,
    moveId: (row.moveId as string) || undefined,
    isDestination: Boolean(row.isDestination),
  };
}

// ---------- Containers ----------

export const containerDb = {
  async getAll(filters?: {
    moveId?: string;
    roomId?: string;
    status?: ContainerStatus;
    type?: ContainerType;
    priority?: ContainerPriority;
    search?: string;
    isScannedOnArrival?: boolean;
  }): Promise<Container[]> {
    const database = await getDb();
    let query = 'SELECT * FROM containers WHERE 1=1';
    const params: unknown[] = [];

    if (filters?.moveId) {
      query += ' AND moveId = ?';
      params.push(filters.moveId);
    }
    if (filters?.roomId) {
      query += ' AND roomId = ?';
      params.push(filters.roomId);
    }
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters?.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }
    if (filters?.search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR notes LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }
    if (filters?.isScannedOnArrival !== undefined) {
      query += ' AND isScannedOnArrival = ?';
      params.push(filters.isScannedOnArrival ? 1 : 0);
    }

    query += ' ORDER BY createdAt DESC';

    const rows = await database.getAllAsync(query, params as any[]);
    const containers: Container[] = [];

    for (const row of rows) {
      const container = rowToContainer(row as Record<string, unknown>);
      const items = await itemDb.getByContainer(container.id);
      const photos = await photoDb.getByContainer(container.id);
      containers.push({ ...container, items, photos });
    }

    return containers;
  },

  async getById(id: string): Promise<Container | null> {
    const database = await getDb();
    const row = await database.getFirstAsync('SELECT * FROM containers WHERE id = ?', [id]);
    if (!row) return null;

    const container = rowToContainer(row as Record<string, unknown>);
    const items = await itemDb.getByContainer(id);
    const photos = await photoDb.getByContainer(id);
    return { ...container, items, photos };
  },

  async getByQR(qrCode: string): Promise<Container | null> {
    const database = await getDb();
    const row = await database.getFirstAsync('SELECT * FROM containers WHERE qrCodeData = ?', [qrCode]);
    if (!row) return null;

    const container = rowToContainer(row as Record<string, unknown>);
    const items = await itemDb.getByContainer(container.id);
    const photos = await photoDb.getByContainer(container.id);
    return { ...container, items, photos };
  },

  async create(data: Omit<Container, 'id' | 'items' | 'photos' | 'createdAt' | 'updatedAt'>): Promise<Container> {
    const database = await getDb();
    const id = uuidv4();
    const now = nowISO();

    await database.runAsync(
      `INSERT INTO containers (id, name, description, type, status, priority, roomId, destinationRoomId, isScannedOnArrival, scannedAt, moveId, qrCodeData, notes, isThirdParty, thirdPartyOwner, returnDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.type,
        data.status,
        data.priority,
        data.roomId || null,
        data.destinationRoomId || null,
        data.isScannedOnArrival ? 1 : 0,
        data.scannedAt || null,
        data.moveId || null,
        data.qrCodeData,
        data.notes || null,
        data.isThirdParty ? 1 : 0,
        data.thirdPartyOwner || null,
        data.returnDate || null,
        now,
        now,
      ]
    );

    return {
      id,
      ...data,
      items: [],
      photos: [],
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(
    id: string,
    data: Partial<Omit<Container, 'id' | 'items' | 'photos' | 'createdAt' | 'updatedAt'>>
  ): Promise<Container | null> {
    const database = await getDb();
    const existing = await this.getById(id);
    if (!existing) return null;

    const now = nowISO();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description || null); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority); }
    if (data.roomId !== undefined) { fields.push('roomId = ?'); values.push(data.roomId || null); }
    if (data.destinationRoomId !== undefined) { fields.push('destinationRoomId = ?'); values.push(data.destinationRoomId || null); }
    if (data.isScannedOnArrival !== undefined) { fields.push('isScannedOnArrival = ?'); values.push(data.isScannedOnArrival ? 1 : 0); }
    if (data.scannedAt !== undefined) { fields.push('scannedAt = ?'); values.push(data.scannedAt || null); }
    if (data.moveId !== undefined) { fields.push('moveId = ?'); values.push(data.moveId || null); }
    if (data.qrCodeData !== undefined) { fields.push('qrCodeData = ?'); values.push(data.qrCodeData); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes || null); }
    if (data.isThirdParty !== undefined) { fields.push('isThirdParty = ?'); values.push(data.isThirdParty ? 1 : 0); }
    if (data.thirdPartyOwner !== undefined) { fields.push('thirdPartyOwner = ?'); values.push(data.thirdPartyOwner || null); }
    if (data.returnDate !== undefined) { fields.push('returnDate = ?'); values.push(data.returnDate || null); }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await database.runAsync(`UPDATE containers SET ${fields.join(', ')} WHERE id = ?`, values as any[]);

    return this.getById(id);
  },

  async scan(id: string): Promise<Container | null> {
    const now = nowISO();
    return this.update(id, { isScannedOnArrival: true, scannedAt: now, status: ContainerStatus.DEPOSE });
  },

  async delete(id: string): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM containers WHERE id = ?', [id]);
  },

  async getStats(moveId?: string): Promise<MoveStats> {
    const database = await getDb();
    let totalQuery = 'SELECT COUNT(*) as count FROM containers';
    let scannedQuery = 'SELECT COUNT(*) as count FROM containers WHERE isScannedOnArrival = 1';
    const totalParams: unknown[] = [];
    const scannedParams: unknown[] = [];

    if (moveId) {
      totalQuery += ' WHERE moveId = ?';
      scannedQuery += ' AND moveId = ?';
      totalParams.push(moveId);
      scannedParams.push(moveId);
    }

    const totalRow = await database.getFirstAsync(totalQuery, totalParams as any[]) as Record<string, unknown>;
    const scannedRow = await database.getFirstAsync(scannedQuery, scannedParams as any[]) as Record<string, unknown>;

    const total = Number(totalRow?.count || 0);
    const scanned = Number(scannedRow?.count || 0);
    const missing = total - scanned;
    const percentage = total > 0 ? Math.round((scanned / total) * 100) : 0;

    return { total, scanned, missing, percentage };
  },
};

// ---------- Items ----------

export const itemDb = {
  async getByContainer(containerId: string): Promise<Item[]> {
    const database = await getDb();
    const rows = await database.getAllAsync('SELECT * FROM items WHERE containerId = ? ORDER BY createdAt DESC', [containerId]);
    return rows.map((row) => rowToItem(row as Record<string, unknown>));
  },

  async create(data: Omit<Item, 'id' | 'createdAt'>): Promise<Item> {
    const database = await getDb();
    const id = uuidv4();
    const now = nowISO();

    await database.runAsync(
      `INSERT INTO items (id, name, description, category, photoUrl, estimatedValue, isFragile, containerId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.category || null,
        data.photoUrl || null,
        data.estimatedValue ?? null,
        data.isFragile ? 1 : 0,
        data.containerId,
        now,
      ]
    );

    return {
      id,
      ...data,
      createdAt: now,
    };
  },

  async update(id: string, data: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Item | null> {
    const database = await getDb();
    const existing = await database.getFirstAsync('SELECT * FROM items WHERE id = ?', [id]);
    if (!existing) return null;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description || null); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category || null); }
    if (data.photoUrl !== undefined) { fields.push('photoUrl = ?'); values.push(data.photoUrl || null); }
    if (data.estimatedValue !== undefined) { fields.push('estimatedValue = ?'); values.push(data.estimatedValue ?? null); }
    if (data.isFragile !== undefined) { fields.push('isFragile = ?'); values.push(data.isFragile ? 1 : 0); }
    if (data.containerId !== undefined) { fields.push('containerId = ?'); values.push(data.containerId); }

    if (fields.length === 0) return rowToItem(existing as Record<string, unknown>);

    values.push(id);
    await database.runAsync(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`, values as any[]);

    const updated = await database.getFirstAsync('SELECT * FROM items WHERE id = ?', [id]);
    return updated ? rowToItem(updated as Record<string, unknown>) : null;
  },

  async delete(id: string): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM items WHERE id = ?', [id]);
  },
};

// ---------- Moves ----------

export const moveDb = {
  async getAll(): Promise<Move[]> {
    const database = await getDb();
    const rows = await database.getAllAsync('SELECT * FROM moves ORDER BY createdAt DESC');
    return rows.map((row) => rowToMove(row as Record<string, unknown>));
  },

  async getById(id: string): Promise<Move | null> {
    const database = await getDb();
    const row = await database.getFirstAsync('SELECT * FROM moves WHERE id = ?', [id]);
    return row ? rowToMove(row as Record<string, unknown>) : null;
  },

  async create(data: Omit<Move, 'id' | 'createdAt' | 'updatedAt'>): Promise<Move> {
    const database = await getDb();
    const id = uuidv4();
    const now = nowISO();

    await database.runAsync(
      `INSERT INTO moves (id, name, description, status, fromAddress, toAddress, moveDate, startedAt, completedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description || null,
        data.status,
        data.fromAddress || null,
        data.toAddress || null,
        data.moveDate || null,
        data.startedAt || null,
        data.completedAt || null,
        now,
        now,
      ]
    );

    return {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: string, data: Partial<Omit<Move, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Move | null> {
    const database = await getDb();
    const existing = await this.getById(id);
    if (!existing) return null;

    const now = nowISO();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description || null); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.fromAddress !== undefined) { fields.push('fromAddress = ?'); values.push(data.fromAddress || null); }
    if (data.toAddress !== undefined) { fields.push('toAddress = ?'); values.push(data.toAddress || null); }
    if (data.moveDate !== undefined) { fields.push('moveDate = ?'); values.push(data.moveDate || null); }
    if (data.startedAt !== undefined) { fields.push('startedAt = ?'); values.push(data.startedAt || null); }
    if (data.completedAt !== undefined) { fields.push('completedAt = ?'); values.push(data.completedAt || null); }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await database.runAsync(`UPDATE moves SET ${fields.join(', ')} WHERE id = ?`, values as any[]);

    return this.getById(id);
  },

  async start(id: string): Promise<Move | null> {
    return this.update(id, { status: MoveStatus.ACTIVE, startedAt: nowISO() });
  },

  async complete(id: string): Promise<Move | null> {
    return this.update(id, { status: MoveStatus.COMPLETED, completedAt: nowISO() });
  },

  async delete(id: string): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM moves WHERE id = ?', [id]);
  },
};

// ---------- Rooms ----------

export const roomDb = {
  async getAll(moveId?: string): Promise<Room[]> {
    const database = await getDb();
    let query = 'SELECT * FROM rooms';
    const params: unknown[] = [];

    if (moveId) {
      query += ' WHERE moveId = ?';
      params.push(moveId);
    }

    query += ' ORDER BY name ASC';

    const rows = await database.getAllAsync(query, params as any[]);
    return rows.map((row) => rowToRoom(row as Record<string, unknown>));
  },

  async getById(id: string): Promise<Room | null> {
    const database = await getDb();
    const row = await database.getFirstAsync('SELECT * FROM rooms WHERE id = ?', [id]);
    return row ? rowToRoom(row as Record<string, unknown>) : null;
  },

  async create(data: Omit<Room, 'id'>): Promise<Room> {
    const database = await getDb();
    const id = uuidv4();

    await database.runAsync(
      `INSERT INTO rooms (id, name, icon, floor, description, moveId, isDestination)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.icon || null,
        data.floor ?? null,
        data.description || null,
        data.moveId || null,
        data.isDestination ? 1 : 0,
      ]
    );

    return { id, ...data };
  },

  async update(id: string, data: Partial<Omit<Room, 'id'>>): Promise<Room | null> {
    const database = await getDb();
    const existing = await this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon || null); }
    if (data.floor !== undefined) { fields.push('floor = ?'); values.push(data.floor ?? null); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description || null); }
    if (data.moveId !== undefined) { fields.push('moveId = ?'); values.push(data.moveId || null); }
    if (data.isDestination !== undefined) { fields.push('isDestination = ?'); values.push(data.isDestination ? 1 : 0); }

    if (fields.length === 0) return existing;

    values.push(id);
    await database.runAsync(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`, values as any[]);

    return this.getById(id);
  },

  async delete(id: string): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM rooms WHERE id = ?', [id]);
  },
};

// ---------- Photos ----------

export const photoDb = {
  async getByContainer(containerId: string): Promise<Photo[]> {
    const database = await getDb();
    const rows = await database.getAllAsync('SELECT * FROM photos WHERE containerId = ? ORDER BY createdAt DESC', [containerId]);
    return rows.map((row) => rowToPhoto(row as Record<string, unknown>));
  },

  async create(data: Omit<Photo, 'id' | 'createdAt'>): Promise<Photo> {
    const database = await getDb();
    const id = uuidv4();
    const now = nowISO();

    await database.runAsync(
      `INSERT INTO photos (id, url, caption, containerId, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.url, data.caption || null, data.containerId, now]
    );

    return {
      id,
      ...data,
      createdAt: now,
    };
  },

  async delete(id: string): Promise<void> {
    const database = await getDb();
    await database.runAsync('DELETE FROM photos WHERE id = ?', [id]);
  },
};
