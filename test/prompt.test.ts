import { prompt } from '../src/prompt';

describe('prompt()', () => {
  it('renders a basic prompt block with header', () => {
    const result = prompt('Intro')`
      Hello world.
    `;
    expect(result).toContain('==== Intro ====');
    expect(result).toContain('Hello world.');
    expect(result).toContain('==== End of Intro ====');
  });

  it('renders content without header when no header provided', () => {
    const result = prompt()`
      Hello world.
    `;
    expect(result).toBe('Hello world.');
    expect(result).not.toContain('====');
  });

  it('omits section if condition is false', () => {
    const result = prompt('Hidden', false)`
      You should not see this.
    `;
    expect(result).toBe('');
  });

  it('cleans whitespace and line breaks', () => {
    const result = prompt()`
      Line one.

      
        Line two.  
    `;
    expect(result).toBe('Line one.\n\nLine two.');
  });

  it('handles undefined and null values', () => {
    const result = prompt()`
      Value: ${undefined} and ${null}
    `;
    expect(result).toBe('Value: and');
  });

  it('returns empty string when content is empty', () => {
    const result = prompt('Empty')`
      
    `;
    expect(result).toBe('');
  });

  it('interpolates values correctly', () => {
    const name = 'World';
    const count = 42;
    const result = prompt()`
      Hello ${name}! Count: ${count}
    `;
    expect(result).toBe('Hello World! Count: 42');
  });

  it('handles complex whitespace scenarios', () => {
    const result = prompt('Complex')`
      
      Line with    multiple spaces.
      
      
      Another line.
      
    `;
    expect(result).toContain('Line with multiple spaces.');
    expect(result).toContain('Another line.');
    expect(result).toContain('==== Complex ====');
  });

  it('works with empty header string', () => {
    const result = prompt('')`
      Content without header.
    `;
    expect(result).toBe('Content without header.');
    expect(result).not.toContain('====');
  });

  it('preserves intentional double newlines', () => {
    const result = prompt()`
      Paragraph one.
      
      Paragraph two.
    `;
    expect(result).toBe('Paragraph one.\n\nParagraph two.');
  });

  it('handles boolean conditions explicitly', () => {
    const showSection = true;
    const hideSection = false;
    
    const visibleResult = prompt('Visible', showSection)`Visible content`;
    const hiddenResult = prompt('Hidden', hideSection)`Hidden content`;
    
    expect(visibleResult).toContain('Visible content');
    expect(hiddenResult).toBe('');
  });

  it('should work inside itself', () => {
    const result = prompt()`
    You are a helpful assistant.
      ${prompt('Section 1')`Here is the content for section 1`}
      ${prompt('Section 2', false)`Section 2 here won't be shown as the conditional is false`}
    `
    expect(result).toContain('You are a helpful assistant.');
    expect(result).toContain('Here is the content for section 1');
    expect(result).not.toContain('Section 2 here won\'t be shown as the conditional is false');
  })
}); 