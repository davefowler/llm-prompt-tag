# LLMPromptTag

A lightweight utility for building clean, composable, and maintainable LLM prompts using **tagged template literals**.

```typescript
import { prompt } from 'llm-prompt-tag';

const problems = [
  "String concatenation",
  "Conditional logic mess", 
  "Formatting inconsistencies",
  "Hard to maintain"
];

const solutions = [
  "Tagged templates",
  "Conditional sections", 
  "Automatic formatting",
  "Composable structure"
];

const includeDebugInfo = false;

const msg = prompt()`
  You are a helpful AI assistant. It can be really annoying to put all the conditional data in your prompts.

  ${prompt('Problems with creating prompts')`${problems}`}

  ${prompt('Solutions from llm-prompt-tag')`${solutions}`}

  ${prompt('Debug Info', includeDebugInfo)`This section only appears when debugging`}

  Now I can make complex, conditional, formatted prompts I can still read thanks to llm-prompt-tag!
`;

console.log(msg);
```

**Output:**
```
You are a helpful AI assistant. It can be really annoying to put all the conditional data in your prompts.

==== Problems with creating prompts ====
String concatenation

Conditional logic mess

Formatting inconsistencies

Hard to maintain
==== End of Problems with creating prompts ====

==== Solutions from llm-prompt-tag ====
Tagged templates

Conditional sections

Automatic formatting

Composable structure
==== End of Solutions from llm-prompt-tag ====

Now I can make complex, conditional, formatted prompts I can still read thanks to llm-prompt-tag!
```

---

## ✨ Features

- ✅ Native JavaScript/TypeScript tagged template syntax
- ✅ Automatic whitespace and formatting cleanup
- ✅ Optional section headers
- ✅ Conditional rendering
- ✅ `makePrompt` generator for type-safe extensibility
- ✅ Smart array formatting with customizable separators
- ✅ No dependencies

---

## 📦 Installation

```bash
npm install llm-prompt-tag
```

---

## 🧠 Basic Usage

```typescript
import { prompt } from 'llm-prompt-tag';

const result = prompt('Instructions')`
  Write a short, direct note using the user's own words.
`;

console.log(result);
```

**Output:**

```
==== Instructions ====
Write a short, direct note using the user's own words.
==== End of Instructions ====
```

---

## 🔁 Conditional Sections

```typescript
const showHelp = false;

const result = prompt('Help Section', showHelp)`
  If you get stuck, refer to the user's original notes.
`;

console.log(result);
```

**Output:**

```
(empty string - no output because condition is false)
```

**With condition true:**

```typescript
const showHelp = true;

const result = prompt('Help Section', showHelp)`
  If you get stuck, refer to the user's original notes.
`;

console.log(result);
```

**Output:**

```
==== Help Section ====
If you get stuck, refer to the user's original notes.
==== End of Help Section ====
```

---

## 🏷️ Semantic Naming Patterns

Some people may prefer to rename the function for two distinct purposes: a simpler tag `p` for the overall template, and a separate one for `section`s.

This approach can be more readable and semantic:

```typescript
import { prompt } from 'llm-prompt-tag';

// Use 'section' for structured sections
const section = prompt;

// Use a plain wrapper for the main content
const p = prompt();

const someVariable = "User prefers dark mode";
const notes = "Remember to save work frequently";

const result = p`You are a helpful AI assistant.

${section('User Settings')`${someVariable}`}

${section('Notes')`The user's notes are: ${notes}`} 

Whatever approach feels cleaner to you!`;

console.log(result);
```

**Output:**

```
You are a helpful AI assistant.

==== User Settings ====
User prefers dark mode
==== End of User Settings ====

==== Notes ====
The user's notes are: Remember to save work frequently
==== End of Notes ====

Whatever approach feels cleaner to you!
```

---

## 🧱 Extending with makePrompt

If you have custom objects you're putting into your prompts you can make that easier/cleaner by using the `makePrompt` generator with type guards and their formatters.

**Example:**

```typescript
import { makePrompt } from 'llm-prompt-tag';

type Note = {
  title: string;
  content: string;
}

// Type guard function to check if an object is a Note
const isNote = (obj: any): obj is Note => 
  obj && typeof obj.title === 'string' && typeof obj.content === 'string';

const promptWithNotes = makePrompt([
  [isNote, (note: Note) => `• ${note.title}\n${note.content}`]
]);

const note: Note = { title: "LLM Summary", content: "LLMs are transforming software development." };

const result = promptWithNotes('User\'s Notes')`
  Here's a user note:
  ${note}
`;

console.log(result);
```

**Output:**

```
==== User's Notes ====
Here's a user note:
• LLM Summary
LLMs are transforming software development.
==== End of User's Notes ====
```

**Fallback to toString():**

Objects that don't match any registered type guard will automatically use their `toString()` method, making it easy to mix custom formatted objects with other types:

```typescript
const customObj = {
  value: "important data",
  toString() { return `CustomObject: ${this.value}`; }
};

const result = promptWithNotes('Mixed Content')`
  ${note}
  ${customObj}
  ${"plain string"}
  ${42}
`;
```

**Output:**

```
==== Mixed Content ====
• LLM Summary
LLMs are transforming software development.
CustomObject: important data
plain string
42
==== End of Mixed Content ====
```

---

## 📝 Smart Array Formatting

To keep templates simpler, arrays of registered types are automatically formatted. By default, items are separated with double newlines for clean readability:

```typescript
type Note = {
  title: string;
  content: string;
}

const isNote = (obj: any): obj is Note => 
  obj && typeof obj.title === 'string' && typeof obj.content === 'string';

const promptWithNotes = makePrompt([
  [isNote, (note: Note) => `• ${note.title}\n  ${note.content}`]
]);

const notes: Note[] = [
  { title: "Meeting", content: "Discuss project timeline" },
  { title: "Task", content: "Review pull request" },
  { title: "Reminder", content: "Update documentation" }
];

const result = promptWithNotes('User\'s Notes')`${notes}`;

console.log(result);
```

**Output:**

```
==== User's Notes ====
• Meeting
  Discuss project timeline

• Task
  Review pull request

• Reminder
  Update documentation
==== End of User's Notes ====
```

**Custom Array Formatting:**

You can customize how arrays are formatted (default is two line seperation: '\n\n') by providing an `arrayFormatter` option:

```typescript
const commaPrompt = makePrompt(
  [[isNote, (note: Note) => note.title]],
  { arrayFormatter: (items: any[], formatter: any) => items.map(formatter).join(', ') }
);

const result = commaPrompt('Note Titles')`
  Meeting topics: ${notes}
`;

console.log(result);
```

**Output:**

```
==== Note Titles ====
Meeting topics: Meeting, Task, Reminder
==== End of Note Titles ====
```

**Mixed-Type Arrays:**

Arrays can contain different types, and each item will be formatted according to its type:

```typescript
type Task = {
  name: string;
  completed: boolean;
}

const isTask = (obj: any): obj is Task => 
  obj && typeof obj.name === 'string' && typeof obj.completed === 'boolean';

const mixedPrompt = makePrompt([
  [isNote, (note: Note) => `📝 ${note.title}`],
  [isTask, (task: Task) => `${task.completed ? '✅' : '⏳'} ${task.name}`]
]);

const note: Note = { title: "Meeting", content: "Important discussion" };
const task: Task = { name: "Review code", completed: false };
const customObj = { toString() { return "Custom item"; } };

const mixedArray = [note, task, customObj, "plain string"];

const result = mixedPrompt('Mixed Items')`${mixedArray}`;

console.log(result);
```

**Output:**

```
==== Mixed Items ====
📝 Meeting

⏳ Review code

Custom item

plain string
==== End of Mixed Items ====
```

---

## 🧪 Multiple formatters example

```typescript
type Task = {
  name: string;
  completed: boolean;
}

const isTask = (obj: any): obj is Task => 
  obj && typeof obj.name === 'string' && typeof obj.completed === 'boolean';

const customPrompt = makePrompt([
  [isNote, (note: Note) => `📝 ${note.title}: ${note.content}`],
  [isTask, (task: Task) => `${task.completed ? '✅' : '⏳'} ${task.name}`]
]);

const note: Note = { title: "Meeting", content: "Discuss project timeline" };
const task: Task = { name: "Review code", completed: false };

const result = customPrompt('Project Status')`
  Current items:
  ${note}
  ${task}
`;

console.log(result);
```

**Output:**

```
==== Project Status ====
Current items:
📝 Meeting: Discuss project timeline
⏳ Review code
==== End of Project Status ====
```

---

## 🔗 Composable Prompts

Prompts can be nested and composed together:

```typescript
const systemPrompt = prompt('System')`
  You are a helpful AI assistant.
`;

const userContext = prompt('User Context')`
  User: Alice
  Task: Help prioritize work
`;

const fullPrompt = prompt()`
  ${systemPrompt}
  ${userContext}
  
  Please provide helpful guidance.
`;

console.log(fullPrompt);
```

**Output:**

```
==== System ====
You are a helpful AI assistant.
==== End of System ====

==== User Context ====
User: Alice
Task: Help prioritize work
==== End of User Context ====

Please provide helpful guidance.
```

---

## 🧪 Example Unit Tests

The library includes comprehensive tests that demonstrate usage patterns:

```typescript
import { prompt, makePrompt } from 'llm-prompt-tag';

// Basic usage
const result = prompt('Intro')`
  Hello world.
`;
// Output: "==== Intro ====\nHello world.\n==== End of Intro ===="

// With custom formatters
class Note {
  constructor(public title: string, public content: string) {}
}

const noteFormatter = (note: Note) => `• ${note.title}\n${note.content}`;
const customPrompt = makePrompt({
  Note: noteFormatter
});

const note = new Note("Meeting", "Discuss project timeline");
const formatted = customPrompt('Notes')`${note}`;
// Output: "==== Notes ====\n• Meeting\nDiscuss project timeline\n==== End of Notes ===="
```

---

## 📝 API Reference

### `prompt(header?, condition?)`

Creates a tagged template literal function for building prompts.

**Parameters:**
- `header` (optional): String to use as section header
- `condition` (optional): Boolean to conditionally render the section (default: `true`)

**Returns:** A tagged template function

### `makePrompt(formatters)`

Creates a customizable prompt function with type-specific formatters.

**Parameters:**
- `formatters`: Object with constructor names as keys and formatter functions as values. Special key `Array` can customize array formatting.

**Returns:** A prompt function with custom formatting capabilities

**Example:**
```typescript
const customPrompt = makePrompt({
  Note: (note) => `• ${note.title}\n${note.content}`,
  Task: (task) => `[${task.completed ? 'x' : ' '}] ${task.name}`,
  Array: (items, formatter) => items.map(formatter).join(' | ') // Custom separator for list items
});
```

---

## 🔧 Helper Functions

### `isArray` Type Guard

For convenience, the library exports an `isArray` helper function that you can use to format arrays as a specific type:

```typescript
import { makePrompt, isArray } from 'llm-prompt-tag';

const arrayPrompt = makePrompt([
  [isArray, (arr: any[]) => `Array with ${arr.length} items: [${arr.join(', ')}]`]
]);

const fruits = ["apple", "banana", "cherry"];
const result = arrayPrompt('Fruits')`${fruits}`;

console.log(result);
```

**Output:**

```
==== Fruits ====
Array with 3 items: [apple, banana, cherry]
==== End of Fruits ====
```

---

## 🏗 Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Development mode with watch
npm run dev
```

---

## 🧩 Core Implementation

The library consists of two main modules:

### `prompt.ts`
Core tagged template implementation with whitespace cleanup and conditional rendering.

### `makePrompt.ts`
Extension mechanism for registering custom object formatters.

---

## 🧾 License

MIT

---

## 📢 Author

Dave Fowler  
[GitHub](https://github.com/davefowler) | [X / Twitter](https://twitter.com/davefowler) | [ThingsILearned](https://thingsilearned.com)