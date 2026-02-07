const CHECKBOX_REGEX = /- \[([ xX])\]/g;

export function toggleMarkdownCheckbox(markdown: string, checkboxIndex: number): string {
  let currentIndex = 0;

  return markdown.replace(CHECKBOX_REGEX, (match) => {
    if (currentIndex === checkboxIndex) {
      currentIndex++;
      return match === '- [ ]' ? '- [x]' : '- [ ]';
    }
    currentIndex++;
    return match;
  });
}

export function hasCheckboxes(markdown: string): boolean {
  return /- \[([ xX])\]/.test(markdown);
}
