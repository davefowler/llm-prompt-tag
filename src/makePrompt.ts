import { prompt } from './prompt';

type TypeGuard<T = any> = (obj: any) => obj is T;
type Formatter<T = any> = (val: T) => string;
type ArrayFormatter = (items: any[], itemFormatter: (item: any) => string) => string;
type ObjectFormatter = (obj: object) => string;

// Default formatters
const defaultArrayFormatter: ArrayFormatter = (items, itemFormatter) => 
  items.map(itemFormatter).join('\n\n');

const defaultObjectFormatter: ObjectFormatter = (obj) => 
  typeof obj.toString === 'function' ? obj.toString() : String(obj);

/**
 * Creates a customizable prompt function with type-specific formatters.
 * 
 * This allows you to register custom formatting functions for specific types using type guard functions,
 * making it easy to automatically format objects when they appear in template literals.
 * Arrays of registered types are automatically detected and formatted with double newlines
 * between items by default, but this can be customized.
 * 
 * @param formatters - Array of tuples [typeGuard, formatter] where typeGuard is a function that checks types
 * @param options - Optional configuration object
 * @param options.arrayFormatter - Custom array formatter function (default: join with '\n\n')
 * @param options.objectFormatter - Custom object formatter function (default: toString())
 * @returns A prompt function that applies custom formatting to registered types
 * 
 * @example
 * ```typescript
 * type Note = {
 *   title: string;
 *   content: string;
 * }
 * 
 * const isNote = (obj: any): obj is Note => 
 *   obj && typeof obj.title === 'string' && typeof obj.content === 'string';
 * 
 * const customPrompt = makePrompt([
 *   [isNote, (note: Note) => `• ${note.title}\n${note.content}`]
 * ], {
 *   arrayFormatter: (items, formatter) => items.map(formatter).join(', '),
 *   objectFormatter: (obj) => JSON.stringify(obj, null, 2)
 * });
 * 
 * const note: Note = { title: "Meeting", content: "Discuss project timeline" };
 * const result = customPrompt('Notes')`${note}`;
 * ```
 */
export const makePrompt = (
  formatters: Array<[TypeGuard, Formatter]>,
  {
    arrayFormatter = defaultArrayFormatter,
    objectFormatter = defaultObjectFormatter
  }: { arrayFormatter?: ArrayFormatter; objectFormatter?: ObjectFormatter } = {}
) => {
  return (header?: string, condition: boolean = true) => {
    const base = prompt(header, condition);

    return (strings: TemplateStringsArray, ...values: any[]): string => {
      const transformed = values.map((v) => {
        // Handle individual registered types first
        for (const [typeGuard, formatter] of formatters) {
          if (typeGuard(v)) {
            return formatter(v);
          }
        }
        
        // Handle arrays after individual type checks
        if (Array.isArray(v)) {
          if (v.length === 0) {
            return ''; // Empty arrays return empty string
          }
          
          // Check if all items match a single type guard
          for (const [typeGuard, formatter] of formatters) {
            if (v.every(item => typeGuard(item))) {
              // All items match this type guard, use the formatter with array formatting
              return arrayFormatter(v, formatter);
            }
          }
          
          // Handle mixed-type arrays by formatting individual items
          const formattedItems = v.map(item => {
            // Try to format each item individually
            for (const [typeGuard, formatter] of formatters) {
              if (typeGuard(item)) {
                return formatter(item);
              }
            }
            
            // Fallback: use object formatter for objects, direct conversion for primitives
            if (item && typeof item === 'object') {
              return objectFormatter(item);
            }
            return String(item);
          });
          
          return arrayFormatter(formattedItems, (item: any) => item);
        }
        
        // Handle objects after arrays (but not strings/numbers/etc)
        if (v && typeof v === 'object') {
          return objectFormatter(v);
        }
        
        // Primitives (string, number, boolean, null, undefined)
        return String(v);
      });
      return base(strings, ...transformed);
    };
  };
}; 