import { describe, it, expect } from 'vitest';
import { validateEnumValue } from '@/shared/lib/url-utils';

describe('validateEnumValue', () => {
  const TestEnum = {
    Active: 'active',
    Completed: 'completed',
    Deleted: 'deleted',
  } as const;

  it('should return the value when it is a valid enum value', () => {
    expect(validateEnumValue('active', TestEnum, TestEnum.Active)).toBe('active');
  });

  it('should return the value for a different valid enum value', () => {
    expect(validateEnumValue('completed', TestEnum, TestEnum.Active)).toBe('completed');
  });

  it('should return the default value when value is null', () => {
    expect(validateEnumValue(null, TestEnum, TestEnum.Active)).toBe('active');
  });

  it('should return the default value when value is an empty string', () => {
    expect(validateEnumValue('', TestEnum, TestEnum.Active)).toBe('active');
  });

  it('should return the default value when value is not in the enum', () => {
    expect(validateEnumValue('invalid', TestEnum, TestEnum.Active)).toBe('active');
  });

  it('should return the default value when value is a different invalid string', () => {
    expect(validateEnumValue('ACTIVE', TestEnum, TestEnum.Active)).toBe('active');
  });

  it('should work with a different default value', () => {
    expect(validateEnumValue(null, TestEnum, TestEnum.Completed)).toBe('completed');
  });

  it('should accept any valid enum value regardless of default', () => {
    expect(validateEnumValue('deleted', TestEnum, TestEnum.Active)).toBe('deleted');
  });

  it('should work with single-value enums', () => {
    const SingleEnum = { Only: 'only' } as const;
    expect(validateEnumValue('only', SingleEnum, SingleEnum.Only)).toBe('only');
    expect(validateEnumValue('other', SingleEnum, SingleEnum.Only)).toBe('only');
  });
});
