import { describe, it, expect } from 'vitest';
import {
  validateListName,
  validateCreateListRequest,
  validateUpdateListRequest,
  validateArchiveListRequest,
} from '@/shared/lib/validation/list-validation';

describe('validateListName', () => {
  it('should return invalid for null', () => {
    const result = validateListName(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return invalid for undefined', () => {
    const result = validateListName(undefined);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return invalid for empty string', () => {
    const result = validateListName('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return invalid for whitespace-only string', () => {
    const result = validateListName('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return invalid for non-string types', () => {
    const result = validateListName(123);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return valid for a normal name', () => {
    const result = validateListName('Work');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return valid for a name with leading/trailing spaces', () => {
    const result = validateListName('  Work  ');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for a name longer than 255 characters', () => {
    const longName = 'a'.repeat(256);
    const result = validateListName(longName);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name must be 255 characters or less');
  });

  it('should return valid for a name exactly 255 characters', () => {
    const maxName = 'a'.repeat(255);
    const result = validateListName(maxName);
    expect(result.isValid).toBe(true);
  });
});

describe('validateCreateListRequest', () => {
  it('should return invalid when name is missing', () => {
    const result = validateCreateListRequest({});
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return invalid when body is null', () => {
    const result = validateCreateListRequest(null);
    expect(result.isValid).toBe(false);
  });

  it('should return valid with just a name', () => {
    const result = validateCreateListRequest({ name: 'Work' });
    expect(result.isValid).toBe(true);
    expect(result.name).toBe('Work');
  });

  it('should trim the name', () => {
    const result = validateCreateListRequest({ name: '  Work  ' });
    expect(result.isValid).toBe(true);
    expect(result.name).toBe('Work');
  });

  it('should default participatesInInitiative to true', () => {
    const result = validateCreateListRequest({ name: 'Work' });
    expect(result.participatesInInitiative).toBe(true);
  });

  it('should accept explicit participatesInInitiative value', () => {
    const result = validateCreateListRequest({ name: 'Work', participatesInInitiative: false });
    expect(result.participatesInInitiative).toBe(false);
  });

  it('should handle description as a string', () => {
    const result = validateCreateListRequest({ name: 'Work', description: 'My work tasks' });
    expect(result.description).toBe('My work tasks');
  });

  it('should trim description', () => {
    const result = validateCreateListRequest({ name: 'Work', description: '  My work tasks  ' });
    expect(result.description).toBe('My work tasks');
  });

  it('should set description to null when null', () => {
    const result = validateCreateListRequest({ name: 'Work', description: null });
    expect(result.description).toBeNull();
  });

  it('should set description to null when not provided', () => {
    const result = validateCreateListRequest({ name: 'Work' });
    expect(result.description).toBeNull();
  });

  it('should set description to null for empty string after trim', () => {
    const result = validateCreateListRequest({ name: 'Work', description: '   ' });
    expect(result.description).toBeNull();
  });

  it('should accept a valid color', () => {
    const result = validateCreateListRequest({ name: 'Work', color: 'blue' });
    expect(result.isValid).toBe(true);
    expect(result.color).toBe('blue');
  });

  it('should accept null color', () => {
    const result = validateCreateListRequest({ name: 'Work', color: null });
    expect(result.isValid).toBe(true);
    expect(result.color).toBeNull();
  });

  it('should default color to null when not provided', () => {
    const result = validateCreateListRequest({ name: 'Work' });
    expect(result.isValid).toBe(true);
    expect(result.color).toBeNull();
  });

  it('should reject an invalid color', () => {
    const result = validateCreateListRequest({ name: 'Work', color: 'rainbow' });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid color');
  });
});

describe('validateUpdateListRequest', () => {
  it('should return invalid when id is missing', () => {
    const result = validateUpdateListRequest({ name: 'Work' });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List ID must be a valid number');
  });

  it('should return invalid when name is missing', () => {
    const result = validateUpdateListRequest({ id: 1 });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return valid with id and name', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work' });
    expect(result.isValid).toBe(true);
    expect(result.id).toBe(1);
    expect(result.name).toBe('Work');
  });

  it('should trim the name', () => {
    const result = validateUpdateListRequest({ id: 1, name: '  Work  ' });
    expect(result.name).toBe('Work');
  });

  it('should handle description update', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work', description: 'Updated desc' });
    expect(result.description).toBe('Updated desc');
  });

  it('should set description to null when explicitly null', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work', description: null });
    expect(result.description).toBeNull();
  });

  it('should leave description undefined when not provided', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work' });
    expect(result.description).toBeUndefined();
  });

  it('should handle participatesInInitiative update', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work', participatesInInitiative: false });
    expect(result.participatesInInitiative).toBe(false);
  });

  it('should leave participatesInInitiative undefined when not provided', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work' });
    expect(result.participatesInInitiative).toBeUndefined();
  });

  it('should accept a valid color on update', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work', color: 'emerald' });
    expect(result.isValid).toBe(true);
    expect(result.color).toBe('emerald');
  });

  it('should accept null color to clear it', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work', color: null });
    expect(result.isValid).toBe(true);
    expect(result.color).toBeNull();
  });

  it('should leave color undefined when not provided', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work' });
    expect(result.color).toBeUndefined();
  });

  it('should reject an invalid color on update', () => {
    const result = validateUpdateListRequest({ id: 1, name: 'Work', color: 'neon' });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid color');
  });
});

describe('validateArchiveListRequest', () => {
  it('should return invalid when id is missing', () => {
    const result = validateArchiveListRequest({ archived: true });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List ID must be a valid number');
  });

  it('should return invalid when archived is not a boolean', () => {
    const result = validateArchiveListRequest({ id: 1, archived: 'true' });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('archived must be a boolean');
  });

  it('should return invalid when archived is missing', () => {
    const result = validateArchiveListRequest({ id: 1 });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('archived must be a boolean');
  });

  it('should return valid for archive request', () => {
    const result = validateArchiveListRequest({ id: 1, archived: true });
    expect(result.isValid).toBe(true);
    expect(result.id).toBe(1);
    expect(result.archived).toBe(true);
  });

  it('should return valid for unarchive request', () => {
    const result = validateArchiveListRequest({ id: 1, archived: false });
    expect(result.isValid).toBe(true);
    expect(result.id).toBe(1);
    expect(result.archived).toBe(false);
  });

  it('should return invalid when body is null', () => {
    const result = validateArchiveListRequest(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Request body must be a non-null object');
  });
});
