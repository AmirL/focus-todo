import { describe, it, expect } from 'vitest';
import { toggleMarkdownCheckbox, hasCheckboxes } from './toggleMarkdownCheckbox';

describe('toggleMarkdownCheckbox', () => {
  it('should toggle the first unchecked checkbox to checked', () => {
    const md = '- [ ] item 1\n- [ ] item 2\n- [ ] item 3';
    const result = toggleMarkdownCheckbox(md, 0);
    expect(result).toBe('- [x] item 1\n- [ ] item 2\n- [ ] item 3');
  });

  it('should toggle a middle checkbox', () => {
    const md = '- [ ] item 1\n- [ ] item 2\n- [ ] item 3';
    const result = toggleMarkdownCheckbox(md, 1);
    expect(result).toBe('- [ ] item 1\n- [x] item 2\n- [ ] item 3');
  });

  it('should toggle the last checkbox', () => {
    const md = '- [ ] item 1\n- [ ] item 2\n- [ ] item 3';
    const result = toggleMarkdownCheckbox(md, 2);
    expect(result).toBe('- [ ] item 1\n- [ ] item 2\n- [x] item 3');
  });

  it('should toggle a checked checkbox to unchecked', () => {
    const md = '- [x] item 1\n- [ ] item 2';
    const result = toggleMarkdownCheckbox(md, 0);
    expect(result).toBe('- [ ] item 1\n- [ ] item 2');
  });

  it('should handle uppercase [X]', () => {
    const md = '- [X] item 1\n- [ ] item 2';
    const result = toggleMarkdownCheckbox(md, 0);
    expect(result).toBe('- [ ] item 1\n- [ ] item 2');
  });

  it('should handle mixed checked and unchecked', () => {
    const md = '- [x] done\n- [ ] todo\n- [x] also done';
    const result = toggleMarkdownCheckbox(md, 1);
    expect(result).toBe('- [x] done\n- [x] todo\n- [x] also done');
  });

  it('should return unchanged markdown when index is out of bounds', () => {
    const md = '- [ ] only item';
    const result = toggleMarkdownCheckbox(md, 5);
    expect(result).toBe('- [ ] only item');
  });

  it('should handle markdown with other content around checkboxes', () => {
    const md = '# Title\n\nSome text\n\n- [ ] sub 1\n- [x] sub 2\n\nMore text';
    const result = toggleMarkdownCheckbox(md, 0);
    expect(result).toBe('# Title\n\nSome text\n\n- [x] sub 1\n- [x] sub 2\n\nMore text');
  });

  it('should return unchanged when no checkboxes exist', () => {
    const md = 'Just some text\n- regular list item';
    const result = toggleMarkdownCheckbox(md, 0);
    expect(result).toBe(md);
  });
});

describe('hasCheckboxes', () => {
  it('should return true for unchecked checkboxes', () => {
    expect(hasCheckboxes('- [ ] item')).toBe(true);
  });

  it('should return true for checked checkboxes', () => {
    expect(hasCheckboxes('- [x] item')).toBe(true);
  });

  it('should return true for uppercase checked checkboxes', () => {
    expect(hasCheckboxes('- [X] item')).toBe(true);
  });

  it('should return false for plain text', () => {
    expect(hasCheckboxes('no checkboxes here')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(hasCheckboxes('')).toBe(false);
  });

  it('should return false for regular list items', () => {
    expect(hasCheckboxes('- regular item\n- another item')).toBe(false);
  });
});
