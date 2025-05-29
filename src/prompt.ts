/**
 * Creates a tagged template literal function for building clean, formatted prompts.
 * 
 * Automatically handles whitespace cleanup, optional section headers, and conditional rendering.
 * The function cleans up extra whitespace, normalizes line breaks, and optionally wraps
 * content in section headers for better organization.
 * 
 * @param header - Optional section header to wrap the content. If provided, content will be
 *                 wrapped with "==== Header ====" and "==== End of Header ====" markers.
 * @param condition - Boolean flag to conditionally render the section. Defaults to true.
 *                    If false, returns empty string regardless of content.
 * @returns A tagged template literal function that processes the template and returns formatted string
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const result = prompt('Instructions')`
 *   Write a helpful response to the user.
 * `;
 * 
 * // Conditional rendering
 * const debug = false;
 * const debugInfo = prompt('Debug', debug)`
 *   This only appears if debug is true.
 * `;
 * 
 * // Without header
 * const simple = prompt()`Just some text content`;
 * ```
 */
export const prompt = (header?: string, condition: boolean = true) => {
  return (strings: TemplateStringsArray, ...values: any[]): string => {
    if (!condition) return '';

    const content = strings.reduce((result, str, i) => {
      const value = values[i];
      const stringValue =
        value !== undefined && value !== null ? String(value) : '';
      return result + str + stringValue;
    }, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n /g, '\n')
      .trim();

    if (!content) return '';

    if (header && header.trim()) {
      return `
==== ${header} ====
${content}
==== End of ${header} ====
`;
    }

    return content;
  };
}; 