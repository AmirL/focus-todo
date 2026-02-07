export interface ListNameValidationResult {
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

export interface CreateListValidationResult {
  isValid: boolean;
  error?: string;
  name?: string;
  description?: string | null;
  participatesInInitiative?: boolean;
}

export function validateCreateListRequest(requestBody: unknown): CreateListValidationResult {
  const body = requestBody as { name?: unknown; description?: unknown; participatesInInitiative?: unknown };
  const nameValidation = validateListName(body?.name);

  if (!nameValidation.isValid) {
    return {
      isValid: false,
      error: nameValidation.error
    };
  }

  return {
    isValid: true,
    name: (body.name as string).trim(),
    description: body.description != null ? String(body.description).trim() || null : null,
    participatesInInitiative: body.participatesInInitiative === undefined ? true : Boolean(body.participatesInInitiative)
  };
}

export interface UpdateListValidationResult {
  isValid: boolean;
  error?: string;
  id?: number;
  name?: string;
  description?: string | null;
  participatesInInitiative?: boolean;
}

export function validateUpdateListRequest(requestBody: unknown): UpdateListValidationResult {
  const body = requestBody as { id?: unknown; name?: unknown; description?: unknown; participatesInInitiative?: unknown };

  if (!body?.id) {
    return {
      isValid: false,
      error: 'List ID and name are required'
    };
  }

  const nameValidation = validateListName(body.name);

  if (!nameValidation.isValid) {
    return {
      isValid: false,
      error: nameValidation.error
    };
  }

  return {
    isValid: true,
    id: body.id as number,
    name: (body.name as string).trim(),
    description: body.description !== undefined ? (body.description != null ? String(body.description).trim() || null : null) : undefined,
    participatesInInitiative: body.participatesInInitiative === undefined ? undefined : Boolean(body.participatesInInitiative)
  };
}