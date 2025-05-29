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
    expect(result).toContain('• Test');
    expect(result).toContain('This is a note.');
  });

  it('handles multiple formatters', () => {
    const note = new Note("Meeting", "Discuss project timeline");
    const task = new Task("Review code", true);
    const result = promptWithFormatters('Mixed Content')`
      Note: ${note}
      Task: ${task}
    `;
    expect(result).toContain('• Meeting');
    expect(result).toContain('[x] Review code');
  });

  it('falls back to default formatting for unregistered types', () => {
    const result = promptWithFormatters('Raw Value')`${42}`;
    expect(result).toContain('42');
  });

  it('works with conditional rendering', () => {
    const note = new Note("Hidden", "Secret note");
    const result = promptWithFormatters('Hidden Section', false)`${note}`;
    expect(result).toBe('');
  });

  it('handles empty formatters object', () => {
    const emptyPrompt = makePrompt({});
    const result = emptyPrompt('Test')`Hello world`;
    expect(result).toContain('Hello world');
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
}); 