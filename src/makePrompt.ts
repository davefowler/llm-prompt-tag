import { prompt } from './prompt';

type Formatter<T = any> = (val: T) => string;
type ArrayFormatter = (items: any[], itemFormatter: (item: any) => string) => string;
type FormattersObject = Record<string, Formatter | ArrayFormatter>;

/**
 * Creates a customizable prompt function with type-specific formatters.
 * 
 * This allows you to register custom formatting functions for specific class types,
 * making it easy to automatically format objects when they appear in template literals.
 * Arrays of registered types are automatically detected and formatted with double newlines
 * between items by default, but this can be customized.
 * 
 * @param formatters - Object where keys are constructor names (as strings) and values are formatter functions.
 *                     Special key 'Array' can be used to customize array formatting behavior.
 * @returns A prompt function that applies custom formatting to registered types
 * 
 * @example
 * ```typescript
 * class Note {
 *   constructor(public title: string, public content: string) {}
 * }
 * 
 * // Default array formatting (double newlines)
 * const customPrompt = makePrompt({
 *   Note: (note) => `• ${note.title}\n  ${note.content}`
 * });
 * 
 * // Custom array formatting (comma separated)
 * const commaPrompt = makePrompt({
 *   Note: (note) => `${note.title}`,
 *   Array: (items, formatter) => items.map(formatter).join(', ')
 * });
 * 
 * const notes = [new Note("Task 1", "Content 1"), new Note("Task 2", "Content 2")];
 * const result1 = customPrompt('Notes')`${notes}`;  // Uses double newlines
 * const result2 = commaPrompt('Names')`${notes}`;   // Uses comma separation
 * ```
 */
export const makePrompt = (formatters: FormattersObject) => {
  // Default array formatter uses double newlines between items
  const defaultArrayFormatter: ArrayFormatter = (items, itemFormatter) => 
    items.map(itemFormatter).join('\n\n');
  
  // Allow custom array formatter to be provided
  const arrayFormatter = (formatters.Array as ArrayFormatter) || defaultArrayFormatter;
  
  return (header?: string, condition: boolean = true) => {
    const base = prompt(header, condition);

    return (strings: TemplateStringsArray, ...values: any[]): string => {
      const transformed = values.map((v) => {
        // Handle arrays of registered types
        if (Array.isArray(v) && v.length > 0) {
          // Check if all items in the array are of the same registered type
          const firstItemConstructor = v[0]?.constructor?.name;
          if (firstItemConstructor && formatters[firstItemConstructor]) {
            // Check if all items are of the same type
            const allSameType = v.every(item => 
              item && item.constructor && item.constructor.name === firstItemConstructor
            );
            
            if (allSameType) {
              // Use the item formatter and array formatter
              const itemFormatter = formatters[firstItemConstructor] as Formatter;
              return arrayFormatter(v, itemFormatter);
            }
          }
        }
        
        // Handle individual registered types
        if (v && v.constructor) {
          const constructorName = v.constructor.name;
          if (formatters[constructorName] && constructorName !== 'Array') {
            return (formatters[constructorName] as Formatter)(v);
          }
        }
        
        return v;
      });
      return base(strings, ...transformed);
    };
  };
}; 