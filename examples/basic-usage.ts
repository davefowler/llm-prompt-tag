import { prompt, makePrompt } from '../src/index';

// Basic usage examples
console.log('=== Basic Usage ===');

const simplePrompt = prompt('System Instructions')`
  You are a helpful AI assistant. Please be concise and accurate.
`;

console.log(simplePrompt);

// Conditional rendering
console.log('\n=== Conditional Rendering ===');

const includeDebug = false;
const debugSection = prompt('Debug Info', includeDebug)`
  This section will only appear if debug mode is enabled.
`;

console.log('Debug section (should be empty):', debugSection);

// Variable interpolation
console.log('\n=== Variable Interpolation ===');

const userName = 'Alice';
const taskCount = 3;

const userPrompt = prompt('User Context')`
  User: ${userName}
  Pending tasks: ${taskCount}
  Please help them prioritize their work.
`;

console.log(userPrompt);

// Custom formatters example
console.log('\n=== Custom Formatters ===');

class Note {
  constructor(public title: string, public content: string, public priority: number) {}
}

class Task {
  constructor(public name: string, public completed: boolean) {}
}

const noteFormatter = (note: Note): string => 
  `📝 ${note.title} (Priority: ${note.priority})\n   ${note.content}`;

const taskFormatter = (task: Task): string => 
  `${task.completed ? '✅' : '⏳'} ${task.name}`;

const customPrompt = makePrompt({
  Note: noteFormatter,
  Task: taskFormatter
});

const importantNote = new Note(
  "Project Deadline", 
  "The new feature must be ready by Friday", 
  1
);

const urgentTask = new Task("Review pull request", false);
const completedTask = new Task("Update documentation", true);

const contextPrompt = customPrompt('Project Context')`
  Current situation:
  ${importantNote}
  
  Tasks:
  ${urgentTask}
  ${completedTask}
  
  Please help prioritize the remaining work.
`;

console.log(contextPrompt); 