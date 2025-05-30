import { prompt } from './prompt';

type TypeGuard<T = any> = (obj: any) => obj is T;
type Formatter<T = any> = (val: T) => string;
type ArrayFormatter = (items: any[], itemFormatter: (item: any) => string) => string;

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
 * @param options.useToJSON - If true, objects without registered formatters will use toJSON() instead of toString()
 * @param options.arrayFormatter - Custom array formatter function (default: join with '\n\n')
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
 * ]);
 * 
 * const note: Note = { title: "Meeting", content: "Discuss project timeline" };
 * const result = customPrompt('Notes')`${note}`;
 * ```
 */
export const makePrompt = (
  formatters: Array<[TypeGuard, Formatter]>, 
  options: { useToJSON?: boolean; arrayFormatter?: ArrayFormatter } = {}
) => {
  // Default array formatter uses double newlines between items
  const defaultArrayFormatter: ArrayFormatter = (items, itemFormatter) => 
    items.map(itemFormatter).join('\n\n');
  
  // Allow custom array formatter to be provided
  const arrayFormatter = options.arrayFormatter || defaultArrayFormatter;
  
  return (header?: string, condition: boolean = true) => {
    const base = prompt(header, condition);

    return (strings: TemplateStringsArray, ...values: any[]): string => {
      const transformed = values.map((v) => {
        // Handle arrays - first check if any type guard matches the array itself
        if (Array.isArray(v)) {
          // Check if a type guard matches the array itself (like isArray)
          for (const [typeGuard, formatter] of formatters) {
            if (typeGuard(v)) {
              return formatter(v);
            }
          }
          
          // If no direct match and array has items, check if all items match a type guard
          if (v.length > 0) {
            for (const [typeGuard, formatter] of formatters) {
              if (v.every(item => typeGuard(item))) {
                // All items match this type guard, use the formatter
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
              // Fallback to toString for items that don't match any type guard
              if (item && typeof item === 'object') {
                if (options.useToJSON && typeof item.toJSON === 'function') {
                  const jsonResult = item.toJSON();
                  return typeof jsonResult === 'string' ? jsonResult : JSON.stringify(jsonResult);
                } else if (typeof item.toString === 'function') {
                  return item.toString();
                }
              }
              return item;
            });
            
            return arrayFormatter(formattedItems, (item: any) => item);
          }
        }
        
        // Handle individual registered types
        for (const [typeGuard, formatter] of formatters) {
          if (typeGuard(v)) {
            return formatter(v);
          }
        }
        
        // Better fallback: use toJSON() or toString() for objects, direct conversion for primitives
        if (v && typeof v === 'object') {
          if (options.useToJSON && typeof v.toJSON === 'function') {
            const jsonResult = v.toJSON();
            return typeof jsonResult === 'string' ? jsonResult : JSON.stringify(jsonResult);
          } else if (typeof v.toString === 'function') {
            return v.toString();
          }
        }
        
        return v;
      });
      return base(strings, ...transformed);
    };
  };
}; 