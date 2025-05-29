import { prompt } from './prompt';

type Formatter<T = any> = (val: T) => string;
type FormattersObject = Record<string, Formatter>;

/**
 * Creates a customizable prompt function with type-specific formatters.
 * 
 * This allows you to register custom formatting functions for specific class types,
 * making it easy to automatically format objects when they appear in template literals.
 * 
 * @param formatters - Object where keys are constructor names (as strings) and values are formatter functions
 * @returns A prompt function that applies custom formatting to registered types
 * 
 * @example
 * ```typescript
 * class Note {
 *   constructor(public title: string, public content: string) {}
 * }
 * 
 * const customPrompt = makePrompt({
 *   Note: (note) => `• ${note.title}\n  ${note.content}`
 * });
 * 
 * const note = new Note("Meeting", "Discuss project timeline");
 * const result = customPrompt('Notes')`Here's a note: ${note}`;
 * ```
 */
export const makePrompt = (formatters: FormattersObject) => {
  return (header?: string, condition: boolean = true) => {
    const base = prompt(header, condition);

    return (strings: TemplateStringsArray, ...values: any[]): string => {
      const transformed = values.map((v) => {
        // Check if the value is an instance of any of the registered constructors
        for (const [constructorName, formatter] of Object.entries(formatters)) {
          if (v && v.constructor && v.constructor.name === constructorName) {
            return formatter(v);
          }
        }
        return v;
      });
      return base(strings, ...transformed);
    };
  };
}; 