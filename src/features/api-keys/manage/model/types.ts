export type ApiKeyItem = {
  id: number;
  name: string | null;
  prefix: string;
  lastFour: string;
  createdAt: string | Date;
  lastUsedAt: string | Date | null;
  revokedAt: string | Date | null;
};

export type CreatedKey = {
  id: number;
  name: string | null;
  key: string; // plaintext, returned only once
  prefix: string;
  lastFour: string;
  createdAt: string | Date;
};

