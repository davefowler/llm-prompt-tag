/**
 * Type guard function to check if a value is an array.
 * Useful as a helper when setting up makePrompt formatters.
 * 
 * @param obj - The value to check
 * @returns True if the value is an array
 * 
 * @example
 * ```typescript
 * import { makePrompt, isArray } from 'llm-prompt-tag';
 * 
 * const customPrompt = makePrompt([
 *   [isArray, (arr: any[]) => `Array with ${arr.length} items: ${arr.join(', ')}`]
 * ]);
 * ```
 */
export const isArray = (obj: any): obj is any[] => Array.isArray(obj); 

