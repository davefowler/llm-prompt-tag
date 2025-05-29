import { makePrompt } from '../src/makePrompt';

describe('makePrompt()', () => {
  class Note {
    constructor(public title: string, public content: string) {}
  }

  class Task {
    constructor(public name: string, public completed: boolean) {}
  }

  const noteFormatter = (note: Note): string => `• ${note.title}\n${note.content}`;
  const taskFormatter = (task: Task): string => `[${task.completed ? 'x' : ' '}] ${task.name}`;

  const promptWithFormatters = makePrompt({
    Note: noteFormatter,
    Task: taskFormatter
  });

  it('formats class instances using registered formatter', () => {
    const note = new Note("Test", "This is a note.");
    const result = promptWithFormatters('Note Test')`${note}`;
    
    expect(result).toBe(`
==== Note Test ====
• Test
This is a note.
==== End of Note Test ====
`);
  });

  it('handles multiple formatters', () => {
    const note = new Note("Meeting", "Discuss project timeline");
    const task = new Task("Review code", true);
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

  it('falls back to default formatting for unregistered types', () => {
    const result = promptWithFormatters('Raw Value')`${42}`;
    expect(result).toBe(`
==== Raw Value ====
42
==== End of Raw Value ====
`);
  });

  it('works with conditional rendering', () => {
    const note = new Note("Hidden", "Secret note");
    const result = promptWithFormatters('Hidden Section', false)`${note}`;
    expect(result).toBe('');
  });

  it('handles empty formatters object', () => {
    const emptyPrompt = makePrompt({});
    const result = emptyPrompt('Test')`Hello world`;
    expect(result).toBe(`
==== Test ====
Hello world
==== End of Test ====
`);
  });

  it('handles multiple instances of same class', () => {
    const note1 = new Note("First", "Content one");
    const note2 = new Note("Second", "Content two");
    const result = promptWithFormatters('Multiple Notes')`
      ${note1}
      ${note2}
    `;
    expect(result).toContain('• First');
    expect(result).toContain('• Second');
  });

  it('preserves original values when no formatter matches', () => {
    const customPrompt = makePrompt({
      Note: noteFormatter
    });
    const task = new Task("Unformatted", true);
    const result = customPrompt('Mixed')`
      Task: ${task}
      Number: ${42}
      String: ${"hello"}
    `;
    expect(result).toContain('[object Object]'); // Task falls back to toString
    expect(result).toContain('42');
    expect(result).toContain('hello');
  });

  it('automatically formats arrays with double newlines by default', () => {
    const notes = [
      new Note("Task 1", "Review the pull request"),
      new Note("Task 2", "Update documentation"),
      new Note("Task 3", "Fix the failing tests")
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
    const commaPrompt = makePrompt({
      Note: (note: Note) => note.title,
      Array: (items: any[], formatter: (item: any) => string) => 
        items.map(formatter).join(', ')
    });
    
    const notes = [
      new Note("Task 1", "Content 1"),
      new Note("Task 2", "Content 2"),
      new Note("Task 3", "Content 3")
    ];
    
    const result = commaPrompt('Note Names')`${notes}`;
    expect(result).toBe(`
==== Note Names ====
Task 1, Task 2, Task 3
==== End of Note Names ====
`);
  });

  it('custom array formatter with different separator', () => {
    const bulletPrompt = makePrompt({
      Task: (task: Task) => task.name,
      Array: (items: any[], formatter: (item: any) => string) => 
        items.map(formatter).map(item => `→ ${item}`).join('\n')
    });
    
    const tasks = [
      new Task("Review code", false),
      new Task("Write tests", false),
      new Task("Deploy", false)
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
    const tasks = [
      new Task("Review code", true),
      new Task("Write tests", false)
    ];
    
    const result = promptWithFormatters('Task List')`${tasks}`;
    
    expect(result).toBe(`
==== Task List ====
[x] Review code

[ ] Write tests
==== End of Task List ====
`);
  });

  it('falls back to default for mixed-type arrays', () => {
    const mixedArray = [
      new Note("Note", "Content"),
      new Task("Task", true),
      "plain string"
    ];
    
    const result = promptWithFormatters('Mixed Array')`${mixedArray}`;
    // Should fall back to default array toString since types are mixed
    expect(result).toContain('[object Object]');
  });

  it('handles empty arrays', () => {
    const emptyArray: Note[] = [];
    const result = promptWithFormatters('Empty')`${emptyArray}`;
    // Empty arrays should be treated as empty string and not create a section
    expect(result).toBe('');
  });

  it('handles single-item arrays', () => {
    const singleNote = [new Note("Single", "Only one note")];
    const result = promptWithFormatters('Single Note')`${singleNote}`;
    expect(result).toBe(`
==== Single Note ====
• Single
Only one note
==== End of Single Note ====
`);
  });
}); 