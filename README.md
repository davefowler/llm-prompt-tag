# LLMPromptTag

A lightweight utility for building clean, composable, and maintainable LLM prompts using **tagged template literals**.

---

## ✨ Features

- ✅ Native JavaScript/TypeScript tagged template syntax
- ✅ Automatic whitespace and formatting cleanup
- ✅ Optional section headers
- ✅ Conditional rendering
- ✅ `makePrompt` generator for type-safe extensibility
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

console.log(result); // Output: ''
```

---

## 🧱 Extending with makePrompt

If you want to format certain object types automatically (e.g. Note), use `makePrompt`.

**Example:**

```typescript
import { makePrompt } from 'llm-prompt-tag';

class Note {
  constructor(public title: string, public content: string) {}
}

const note2Text = (note: Note) => `• ${note.title}\n${note.content}`;

const promptWithNotes = makePrompt({
  Note: note2Text
});

const note = new Note("LLM Summary", "LLMs are transforming software development.");

const result = promptWithNotes('Note Section')`
  Here's a user note:
  ${note}
`;

console.log(result);
```

**Output:**

```
==== Note Section ====
Here's a user note:
• LLM Summary
LLMs are transforming software development.
==== End of Note Section ====
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
- `formatters`: Object with constructor names as keys and formatter functions as values

**Returns:** A prompt function with custom formatting capabilities

**Example:**
```typescript
const customPrompt = makePrompt({
  Note: (note) => `• ${note.title}\n${note.content}`,
  Task: (task) => `[${task.completed ? 'x' : ' '}] ${task.name}`
});
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