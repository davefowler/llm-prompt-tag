import { makePrompt } from '../src/makePrompt';

describe('makePrompt()', () => {
  // TypeScript types instead of classes
  type Note = {
    title: string;
    content: string;
  }

  type Task = {
    name: string;
    completed: boolean;
  }

  // Type guard functions
  const isNote = (obj: any): obj is Note => 
    obj && typeof obj.title === 'string' && typeof obj.content === 'string';

  const isTask = (obj: any): obj is Task => 
    obj && typeof obj.name === 'string' && typeof obj.completed === 'boolean';

  // Formatter functions
  const noteFormatter = (note: Note): string => `• ${note.title}\n${note.content}`;
  const taskFormatter = (task: Task): string => `[${task.completed ? 'x' : ' '}] ${task.name}`;

  // Create formatters array cleanly
  const promptWithFormatters = makePrompt([
    [isNote, noteFormatter],
    [isTask, taskFormatter]
  ]);

  it('formats typed objects using registered formatter', () => {
    const note: Note = { title: "Test", content: "This is a note." };
    const result = promptWithFormatters('Note Test')`${note}`;
    
    expect(result).toBe(`
==== Note Test ====
• Test
This is a note.
==== End of Note Test ====
`);
  });

  it('handles multiple formatters', () => {
    const note: Note = { title: "Meeting", content: "Discuss project timeline" };
    const task: Task = { name: "Review code", completed: true };
    const result = promptWithFormatters('Mixed Content')`
      Note: ${note}
      Task: ${task}
    `;
    
    expect(result).toBe(`
==== Mixed Content ====
Note: • Meeting
Discuss project timeline
Task: [x] Review code
==== End of Mixed Content ====
`);
  });

  it('falls back to toString for unregistered types', () => {
    const customObj = {
      toString() { return 'Custom toString output'; }
    };
    
    const result = promptWithFormatters('Raw Value')`${customObj}`;
    expect(result).toBe(`
==== Raw Value ====
Custom toString output
==== End of Raw Value ====
`);
  });

  it('works with conditional rendering', () => {
    const note: Note = { title: "Hidden", content: "Secret note" };
    const result = promptWithFormatters('Hidden Section', false)`${note}`;
    expect(result).toBe('');
  });

  it('handles empty formatters map', () => {
    const emptyPrompt = makePrompt([]);
    const result = emptyPrompt('Test')`Hello world`;
    expect(result).toBe(`
==== Test ====
Hello world
==== End of Test ====
`);
  });

  it('handles multiple instances of same type', () => {
    const note1: Note = { title: "First", content: "Content one" };
    const note2: Note = { title: "Second", content: "Content two" };
    const result = promptWithFormatters('Multiple Notes')`
      ${note1}
      ${note2}
    `;
    expect(result).toBe(`
==== Multiple Notes ====
• First
Content one
• Second
Content two
==== End of Multiple Notes ====
`);
  });

  it('preserves original values when no formatter matches', () => {
    const customPrompt = makePrompt([
      [isNote, noteFormatter]
    ]);
    const task: Task = { name: "Unformatted", completed: true };
    const result = customPrompt('Mixed')`
      Task: ${task}
      Number: ${42}
      String: ${"hello"}
    `;
    expect(result).toContain('[object Object]'); // Task falls back to toString since isTask not registered
    expect(result).toContain('42');
    expect(result).toContain('hello');
  });

  it('renders objects using toString() when no formatter matches', () => {
    const customObj = {
      toString() { return 'Custom toString output'; }
    };
    const result = promptWithFormatters('Raw Value')`${customObj}`;
    expect(result).toBe(`
==== Raw Value ====
Custom toString output
==== End of Raw Value ====
`);
  });

  it('automatically formats arrays with double newlines by default', () => {
    const notes: Note[] = [
      { title: "Task 1", content: "Review the pull request" },
      { title: "Task 2", content: "Update documentation" },
      { title: "Task 3", content: "Fix the failing tests" }
    ];
    
    const result = promptWithFormatters('All Notes')`${notes}`;
    
    expect(result).toBe(`
==== All Notes ====
• Task 1
Review the pull request

• Task 2
Update documentation

• Task 3
Fix the failing tests
==== End of All Notes ====
`);
  });

  it('allows custom array formatting', () => {
    const commaPrompt = makePrompt(
      [[isNote, (note: Note) => note.title]], 
      { arrayFormatter: (items: any[], formatter: (item: any) => string) => 
          items.map(formatter).join(', ') }
    );
    
    const notes: Note[] = [
      { title: "Task 1", content: "Content 1" },
      { title: "Task 2", content: "Content 2" },
      { title: "Task 3", content: "Content 3" }
    ];
    
    const result = commaPrompt('Note Names')`${notes}`;
    expect(result).toBe(`
==== Note Names ====
Task 1, Task 2, Task 3
==== End of Note Names ====
`);
  });

  it('custom array formatter with different separator', () => {
    const bulletPrompt = makePrompt(
      [[isTask, (task: Task) => task.name]],
      { arrayFormatter: (items: any[], formatter: (item: any) => string) => 
          items.map(formatter).map(item => `→ ${item}`).join('\n') }
    );
    
    const tasks: Task[] = [
      { name: "Review code", completed: false },
      { name: "Write tests", completed: false },
      { name: "Deploy", completed: false }
    ];
    
    const result = bulletPrompt('Task List')`${tasks}`;
    expect(result).toBe(`
==== Task List ====
→ Review code
→ Write tests
→ Deploy
==== End of Task List ====
`);
  });

  it('handles arrays of tasks with default formatting', () => {
    const tasks: Task[] = [
      { name: "Review code", completed: true },
      { name: "Write tests", completed: false }
    ];
    
    const result = promptWithFormatters('Task List')`${tasks}`;
    
    expect(result).toBe(`
==== Task List ====
[x] Review code

[ ] Write tests
==== End of Task List ====
`);
  });

  it('falls back to toString for mixed-type arrays', () => {
    const customObj = {
      toString() { return 'CustomObject'; }
    };
    
    const mixedArray = [
      { title: "Note", content: "Content" },
      { name: "Task", completed: true },
      customObj
    ];
    
    const result = promptWithFormatters('Mixed Array')`${mixedArray}`;
    
    expect(result).toBe(`
==== Mixed Array ====
• Note
Content

[x] Task

CustomObject
==== End of Mixed Array ====
`);
  });

  it('handles empty arrays', () => {
    const emptyArray: Note[] = [];
    const result = promptWithFormatters('Empty')`${emptyArray}`;
    // Empty arrays should be treated as empty string and not create a section
    expect(result).toBe('');
  });

  it('handles single-item arrays', () => {
    const singleNote: Note[] = [{ title: "Single", content: "Only one note" }];
    const result = promptWithFormatters('Single Note')`${singleNote}`;
    expect(result).toBe(`
==== Single Note ====
• Single
Only one note
==== End of Single Note ====
`);
  });

  it('handles multiple instances of same type', () => {
    const note1: Note = { title: "First", content: "Content one" };
    const note2: Note = { title: "Second", content: "Content two" };
    const result = promptWithFormatters('Multiple Notes')`
      ${note1}
      ${note2}
    `;
    expect(result).toBe(`
==== Multiple Notes ====
• First
Content one
• Second
Content two
==== End of Multiple Notes ====
`);
  });

  it('preserves original values when no formatter matches but uses toString', () => {
    type UnregisteredType = {
      value: string;
    }
    
    const prompt = makePrompt([
      [isNote, noteFormatter],
      [isTask, taskFormatter]
    ]);
    
    const obj: UnregisteredType & { toString(): string } = {
      value: "test",
      toString() { return `UnregisteredType(${this.value})`; }
    };
    
    const result = prompt('Mixed')`
      Object: ${obj}
      Number: ${42}
      String: ${"hello"}
    `;
    expect(result).toContain('UnregisteredType(test)');
    expect(result).toContain('42');
    expect(result).toContain('hello');
  });

  it('handles arrays with multiple different types', () => {
    const note: Note = { title: "Meeting Notes", content: "Discuss project scope" };
    const task: Task = { name: "Review PR", completed: false };
    const customObj = {
      toString() { return 'Custom Item'; }
    };
    const primitiveString = "Just a string";
    const primitiveNumber = 42;
    
    const mixedArray = [note, task, customObj, primitiveString, primitiveNumber];
    
    const result = promptWithFormatters('Mixed Types')`${mixedArray}`;
    
    expect(result).toBe(`
==== Mixed Types ====
• Meeting Notes
Discuss project scope

[ ] Review PR

Custom Item

Just a string

42
==== End of Mixed Types ====
`);
  });

  it('can use custom objectFormatter for unregistered objects', () => {
    const jsonPrompt = makePrompt([
      [isNote, noteFormatter]
    ], {
      objectFormatter: (obj) => JSON.stringify(obj, null, 2)
    });
    
    const unregisteredObj = { name: "Unknown", type: "mystery" };
    const note: Note = { title: "Known", content: "This has a formatter" };
    
    const result = jsonPrompt('Mixed Objects')`
      ${note}
      ${unregisteredObj}
    `;
    
    expect(result).toContain('• Known');
    expect(result).toContain('This has a formatter');
    expect(result).toContain('"name": "Unknown"');
    expect(result).toContain('"type": "mystery"');
  });

  it('can use custom objectFormatter that uses toJSON', () => {
    const toJSONPrompt = makePrompt([], {
      objectFormatter: (obj: any) => obj.toJSON ? obj.toJSON() : obj.toString()
    });
    
    const objWithToJSON = {
      data: "secret",
      toJSON() { return `JSON: ${this.data}`; }
    };
    
    const objWithoutToJSON = {
      data: "visible",
      toString() { return `String: ${this.data}`; }
    };
    
    const result = toJSONPrompt('JSON Test')`
      ${objWithToJSON}
      ${objWithoutToJSON}
    `;
    
    expect(result).toContain('JSON: secret');
    expect(result).toContain('String: visible');
  });
}); 