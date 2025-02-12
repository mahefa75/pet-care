export interface SyncInfo {
  id: 1;
  lastUpdate: Date;
  dataHash: string; // Hash des données pour vérifier l'intégrité
  status: 'idle' | 'syncing' | 'error' | 'offline';
  lastError?: string;
}

export interface SyncLogEntry {
  id?: number;
  timestamp: Date;
  operation: 'push' | 'pull' | 'conflict' | 'sync';
  status: 'success' | 'error';
  details: string;
  affectedTables: string[];
  error?: string;
}

export interface TableChange {
  tableName: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: Date;
  recordId: number | string;
  changes?: Record<string, any>;
}

export interface SyncQueue {
  id?: number;
  changes: TableChange[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: Date;
  processedAt?: Date;
  error?: string;
} 