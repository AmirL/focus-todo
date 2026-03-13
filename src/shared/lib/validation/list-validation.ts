import { validateListColor } from '@/shared/lib/colors';

interface ListNameValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateListName(name: unknown): ListNameValidationResult {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'List name is required'
    };
  }

  if (name.trim().length > 255) {
    return {
      isValid: false,
      error: 'List name must be 255 characters or less'
    };
  }

  return {
    isValid: true
  };
}

interface CreateListValidationResult {
  isValid: boolean;
  error?: string;
  name?: string;
  description?: string | null;
  participatesInInitiative?: boolean;
  color?: string | null;
}

export function validateCreateListRequest(requestBody: unknown): CreateListValidationResult {
  const body = requestBody as { name?: unknown; description?: unknown; participatesInInitiative?: unknown; color?: unknown };
  const nameValidation = validateListName(body?.name);

  if (!nameValidation.isValid) {
    return {
      isValid: false,
      error: nameValidation.error
    };
  }

  const colorValidation = validateListColor(body.color);
  if (!colorValidation.isValid) {
    return { isValid: false, error: colorValidation.error };
  }

  return {
    isValid: true,
    name: (body.name as string).trim(),
    description: body.description != null ? String(body.description).trim() || null : null,
    participatesInInitiative: body.participatesInInitiative === undefined ? true : Boolean(body.participatesInInitiative),
    color: body.color !== undefined ? (body.color as string | null) : null,
  };
}

interface UpdateListValidationResult {
  isValid: boolean;
  error?: string;
  id?: number;
  name?: string;
  description?: string | null;
  participatesInInitiative?: boolean;
  color?: string | null;
}

export function validateUpdateListRequest(requestBody: unknown): UpdateListValidationResult {
  const body = requestBody as { id?: unknown; name?: unknown; description?: unknown; participatesInInitiative?: unknown; color?: unknown };

  if (!body?.id || typeof body.id !== 'number' || !Number.isFinite(body.id)) {
    return {
      isValid: false,
      error: 'List ID must be a valid number'
    };
  }

  const nameValidation = validateListName(body.name);

  if (!nameValidation.isValid) {
    return {
      isValid: false,
      error: nameValidation.error
    };
  }

  const colorValidation = validateListColor(body.color);
  if (!colorValidation.isValid) {
    return { isValid: false, error: colorValidation.error };
  }

  return {
    isValid: true,
    id: body.id,
    name: (body.name as string).trim(),
    description: body.description !== undefined ? (body.description != null ? String(body.description).trim() || null : null) : undefined,
    participatesInInitiative: body.participatesInInitiative === undefined ? undefined : Boolean(body.participatesInInitiative),
    color: body.color !== undefined ? (body.color as string | null) : undefined,
  };
}

interface ArchiveListValidationResult {
  isValid: boolean;
  error?: string;
  id?: number;
  archived?: boolean;
}

export function validateArchiveListRequest(requestBody: unknown): ArchiveListValidationResult {
  const body = requestBody as { id?: unknown; archived?: unknown };

  if (!body?.id || typeof body.id !== 'number' || !Number.isFinite(body.id)) {
    return { isValid: false, error: 'List ID must be a valid number' };
  }

  if (typeof body.archived !== 'boolean') {
    return { isValid: false, error: 'archived must be a boolean' };
  }

  return { isValid: true, id: body.id, archived: body.archived };
}