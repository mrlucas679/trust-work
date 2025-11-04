import { ApplicationTestQuestion, QuestionBank, SkillCategory } from '@/types/skillTest';

// Question Bank: 20 skills × 40 questions each = 800 total questions
// Distribution: 50% easy (20q), 30% medium (12q), 20% hard (8q)

// ============================================================================
// JAVASCRIPT QUESTIONS (40 total)
// ============================================================================

const javascriptQuestions: ApplicationTestQuestion[] = [
    // EASY (20 questions)
    {
        id: 'js-001',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which of the following is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'int x = 5;', 'dim x = 5;'],
        correctAnswer: 0,
        explanation: 'In JavaScript, variables are declared using var, let, or const keywords.'
    },
    {
        id: 'js-002',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What is the output of: console.log(typeof [])?',
        options: ['array', 'object', 'undefined', 'null'],
        correctAnswer: 1,
        explanation: 'Arrays in JavaScript are actually objects, so typeof returns "object".'
    },
    {
        id: 'js-003',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which operator is used for strict equality comparison?',
        options: ['==', '===', '=', '!='],
        correctAnswer: 1,
        explanation: '=== checks both value and type equality without type coercion.'
    },
    {
        id: 'js-004',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'How do you write a single-line comment in JavaScript?',
        options: ['<!-- comment -->', '/* comment */', '// comment', '# comment'],
        correctAnswer: 2,
        explanation: 'Single-line comments in JavaScript start with //'
    },
    {
        id: 'js-005',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What will "5" + 3 evaluate to?',
        options: ['8', '53', 'error', 'NaN'],
        correctAnswer: 1,
        explanation: 'The + operator performs string concatenation when one operand is a string.'
    },
    {
        id: 'js-006',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['append()', 'push()', 'add()', 'insert()'],
        correctAnswer: 1,
        explanation: 'The push() method adds elements to the end of an array.'
    },
    {
        id: 'js-007',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What is the correct way to write an if statement?',
        options: ['if x = 5', 'if (x == 5)', 'if x == 5 then', 'if x = 5 then'],
        correctAnswer: 1,
        explanation: 'JavaScript if statements require parentheses around the condition.'
    },
    {
        id: 'js-008',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which built-in method returns the length of a string?',
        options: ['size()', 'length()', 'length', 'getLength()'],
        correctAnswer: 2,
        explanation: 'String length is accessed via the length property (not a method).'
    },
    {
        id: 'js-009',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What does NaN stand for?',
        options: ['Not a Number', 'Null and Null', 'New Array Notation', 'No Answer Needed'],
        correctAnswer: 0,
        explanation: 'NaN stands for "Not a Number" and represents an invalid numeric value.'
    },
    {
        id: 'js-010',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'How do you create a function in JavaScript?',
        options: ['function myFunction()', 'function:myFunction()', 'create myFunction()', 'def myFunction()'],
        correctAnswer: 0,
        explanation: 'Functions are declared using the function keyword followed by the function name.'
    },
    {
        id: 'js-011',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which symbol is used for comments in JSON?',
        options: ['//', '/* */', '<!-- -->', 'JSON does not support comments'],
        correctAnswer: 3,
        explanation: 'JSON specification does not include comment syntax.'
    },
    {
        id: 'js-012',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What is the result of: Boolean(0)?',
        options: ['true', 'false', 'undefined', '0'],
        correctAnswer: 1,
        explanation: '0 is a falsy value in JavaScript, so Boolean(0) returns false.'
    },
    {
        id: 'js-013',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which method removes the last element from an array?',
        options: ['pop()', 'remove()', 'deleteLast()', 'shift()'],
        correctAnswer: 0,
        explanation: 'The pop() method removes and returns the last element of an array.'
    },
    {
        id: 'js-014',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What does the "break" statement do in a loop?',
        options: ['Pauses the loop', 'Exits the loop', 'Skips to next iteration', 'Restarts the loop'],
        correctAnswer: 1,
        explanation: 'The break statement terminates the loop immediately.'
    },
    {
        id: 'js-015',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which keyword is used to define a constant variable?',
        options: ['constant', 'const', 'static', 'final'],
        correctAnswer: 1,
        explanation: 'The const keyword declares a constant variable that cannot be reassigned.'
    },
    {
        id: 'js-016',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What is the output of: console.log(1 + "2" + 3)?',
        options: ['6', '123', '33', 'error'],
        correctAnswer: 1,
        explanation: 'String concatenation occurs left to right: 1+"2" = "12", then "12"+3 = "123"'
    },
    {
        id: 'js-017',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which method converts a string to lowercase?',
        options: ['toLowerCase()', 'lower()', 'lowerCase()', 'toLower()'],
        correctAnswer: 0,
        explanation: 'The toLowerCase() method converts a string to lowercase letters.'
    },
    {
        id: 'js-018',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What is the correct way to write an array in JavaScript?',
        options: ['var colors = "red", "green", "blue"', 'var colors = (1:"red", 2:"green")', 'var colors = ["red", "green", "blue"]', 'var colors = {red, green, blue}'],
        correctAnswer: 2,
        explanation: 'Arrays in JavaScript are declared using square brackets [].'
    },
    {
        id: 'js-019',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'Which event occurs when a user clicks on an HTML element?',
        options: ['onchange', 'onclick', 'onmouseover', 'onhover'],
        correctAnswer: 1,
        explanation: 'The onclick event is triggered when an element is clicked.'
    },
    {
        id: 'js-020',
        skill: 'JavaScript',
        difficulty: 'easy',
        question: 'What is the output of: typeof null?',
        options: ['null', 'undefined', 'object', 'number'],
        correctAnswer: 2,
        explanation: 'This is a known JavaScript quirk - typeof null returns "object".'
    },

    // MEDIUM (12 questions)
    {
        id: 'js-021',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What will be logged: let x = 10; (function() { console.log(x); var x = 20; })();',
        options: ['10', '20', 'undefined', 'ReferenceError'],
        correctAnswer: 2,
        explanation: 'Due to hoisting, var x is declared but not initialized before the console.log, resulting in undefined.'
    },
    {
        id: 'js-022',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What does the Array.prototype.map() method return?',
        options: ['Modified original array', 'New array with transformed elements', 'Boolean value', 'Single value'],
        correctAnswer: 1,
        explanation: 'map() creates a new array by applying a function to each element.'
    },
    {
        id: 'js-023',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'Which of the following is a proper use of the spread operator?',
        options: ['let arr = ...array', 'let arr = [...array]', 'let arr = {..array}', 'let arr = array...'],
        correctAnswer: 1,
        explanation: 'The spread operator (...) is used inside array literals or function calls.'
    },
    {
        id: 'js-024',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What is a closure in JavaScript?',
        options: ['A way to close browser windows', 'A function that has access to outer function variables', 'A loop termination', 'An object property'],
        correctAnswer: 1,
        explanation: 'A closure is a function that retains access to its outer scope variables.'
    },
    {
        id: 'js-025',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What does "this" refer to in an arrow function?',
        options: ['The function itself', 'The global object', 'The lexical scope where it was defined', 'undefined'],
        correctAnswer: 2,
        explanation: 'Arrow functions inherit "this" from the surrounding lexical context.'
    },
    {
        id: 'js-026',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What is the purpose of Array.prototype.reduce()?',
        options: ['Remove elements', 'Reduce array size', 'Accumulate array values into a single value', 'Sort in descending order'],
        correctAnswer: 2,
        explanation: 'reduce() applies a function to accumulate array elements into a single result.'
    },
    {
        id: 'js-027',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What is event bubbling?',
        options: ['Events fire twice', 'Events propagate from child to parent elements', 'Events are cancelled', 'Events create new elements'],
        correctAnswer: 1,
        explanation: 'Event bubbling means events propagate up the DOM tree from target to ancestors.'
    },
    {
        id: 'js-028',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'Which method would you use to combine two arrays?',
        options: ['concat()', 'merge()', 'combine()', 'join()'],
        correctAnswer: 0,
        explanation: 'concat() merges two or more arrays and returns a new array.'
    },
    {
        id: 'js-029',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What does JSON.parse() do?',
        options: ['Converts object to JSON string', 'Converts JSON string to object', 'Validates JSON', 'Formats JSON'],
        correctAnswer: 1,
        explanation: 'JSON.parse() parses a JSON string and returns a JavaScript object.'
    },
    {
        id: 'js-030',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What is the difference between let and var?',
        options: ['No difference', 'let is block-scoped, var is function-scoped', 'var is faster', 'let cannot be reassigned'],
        correctAnswer: 1,
        explanation: 'let has block scope while var has function scope and is hoisted.'
    },
    {
        id: 'js-031',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What will console.log([1, 2, 3].slice(1)) output?',
        options: ['[1]', '[2, 3]', '[1, 2]', '[3]'],
        correctAnswer: 1,
        explanation: 'slice(1) returns a new array from index 1 to the end.'
    },
    {
        id: 'js-032',
        skill: 'JavaScript',
        difficulty: 'medium',
        question: 'What is the purpose of the "async" keyword?',
        options: ['Makes function run faster', 'Indicates function returns a Promise', 'Runs function in background', 'Delays execution'],
        correctAnswer: 1,
        explanation: 'async keyword makes a function return a Promise automatically.'
    },

    // HARD (8 questions)
    {
        id: 'js-033',
        skill: 'JavaScript',
        difficulty: 'hard',
        question: 'What is the output: console.log([] == ![])?',
        options: ['false', 'true', 'undefined', 'error'],
        correctAnswer: 1,
        explanation: 'Both sides coerce to false: [] becomes 0, ![] becomes false which is 0, so 0 == 0 is true.'
    },
    {
        id: 'js-034',
        skill: 'JavaScript',
        difficulty: 'hard',
        question: 'What is the Temporal Dead Zone?',
        options: ['Time between hoisting and initialization', 'Zone where variables are deleted', 'setTimeout delay period', 'Deprecated feature'],
        correctAnswer: 0,
        explanation: 'TDZ is the period between entering scope and variable initialization where let/const cannot be accessed.'
    },
    {
        id: 'js-035',
        skill: 'JavaScript',
        difficulty: 'hard',
        question: 'What does Object.freeze() do?',
        options: ['Stops execution', 'Makes object immutable at first level', 'Deep freezes nested objects', 'Caches object in memory'],
        correctAnswer: 1,
        explanation: 'Object.freeze() makes an object immutable (shallow), but nested objects can still be modified.'
    },
    {
        id: 'js-036',
        skill: 'JavaScript',
        difficulty: 'hard',
        question: 'What is the difference between call() and apply()?',
        options: ['No difference', 'call() takes arguments separately, apply() takes array', 'apply() is faster', 'call() works with objects only'],
        correctAnswer: 1,
        explanation: 'call() accepts arguments individually, apply() accepts an array of arguments.'
    },
    {
        id: 'js-037',
        skill: 'JavaScript',
        difficulty: 'hard',
        question: 'What is a WeakMap used for?',
        options: ['Storing primitive values', 'Memory-efficient object keys with automatic garbage collection', 'Weak references to functions', 'Temporary storage'],
        correctAnswer: 1,
        explanation: 'WeakMap allows garbage collection of keys when no other references exist.'
    },
    {
        id: 'js-038',
        skill: 'JavaScript',
        difficulty: 'hard',
        question: 'What is the purpose of Symbol in JavaScript?',
        options: ['Mathematical operations', 'Create unique identifiers', 'Type checking', 'Memory optimization'],
        correctAnswer: 1,
        explanation: 'Symbols create guaranteed unique identifiers, often used for object properties.'
    },
    {
        id: 'js-039',
        skill: 'JavaScript',
        difficulty: 'hard',
        question: 'What does the Proxy object allow you to do?',
        options: ['Copy objects', 'Intercept and customize object operations', 'Create network proxies', 'Optimize performance'],
        correctAnswer: 1,
        explanation: 'Proxy creates a wrapper that can intercept and redefine object operations like get, set, etc.'
    },
    {
        id: 'js-040',
        skill: 'JavaScript',
        difficulty: 'hard',
        question: 'What is the difference between microtasks and macrotasks?',
        options: ['Size of task', 'Microtasks execute before next macrotask', 'No difference', 'Macrotasks are async'],
        correctAnswer: 1,
        explanation: 'Microtasks (Promises) have higher priority and execute before the next macrotask (setTimeout).'
    }
];

// ============================================================================
// REACT QUESTIONS (40 total)
// ============================================================================

const reactQuestions: ApplicationTestQuestion[] = [
    // EASY (20 questions)
    {
        id: 'react-001',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is React?',
        options: ['A JavaScript library for building UIs', 'A database', 'A CSS framework', 'A backend framework'],
        correctAnswer: 0,
        explanation: 'React is a JavaScript library developed by Facebook for building user interfaces.'
    },
    {
        id: 'react-002',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is JSX?',
        options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
        correctAnswer: 0,
        explanation: 'JSX stands for JavaScript XML and allows writing HTML-like syntax in JavaScript.'
    },
    {
        id: 'react-003',
        skill: 'React',
        difficulty: 'easy',
        question: 'Which method is used to create a React component?',
        options: ['React.createComponent()', 'function ComponentName()', 'new Component()', 'Component.create()'],
        correctAnswer: 1,
        explanation: 'React components can be created as functions or classes.'
    },
    {
        id: 'react-004',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is the purpose of the useState hook?',
        options: ['Manage side effects', 'Add state to functional components', 'Fetch data', 'Create context'],
        correctAnswer: 1,
        explanation: 'useState allows functional components to have state variables.'
    },
    {
        id: 'react-005',
        skill: 'React',
        difficulty: 'easy',
        question: 'Which hook is used for side effects?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
        explanation: 'useEffect handles side effects like data fetching, subscriptions, and DOM manipulation.'
    },
    {
        id: 'react-006',
        skill: 'React',
        difficulty: 'easy',
        question: 'What does props stand for?',
        options: ['Properties', 'Proposals', 'Protocols', 'Procedures'],
        correctAnswer: 0,
        explanation: 'Props is short for properties and represents data passed to components.'
    },
    {
        id: 'react-007',
        skill: 'React',
        difficulty: 'easy',
        question: 'Can you modify props inside a component?',
        options: ['Yes, always', 'No, props are read-only', 'Only in class components', 'Only with useState'],
        correctAnswer: 1,
        explanation: 'Props are immutable and cannot be modified by the receiving component.'
    },
    {
        id: 'react-008',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is the virtual DOM?',
        options: ['A copy of the real DOM in memory', 'A CSS framework', 'A testing tool', 'A state manager'],
        correctAnswer: 0,
        explanation: 'Virtual DOM is a lightweight copy of the actual DOM that React uses for efficient updates.'
    },
    {
        id: 'react-009',
        skill: 'React',
        difficulty: 'easy',
        question: 'Which command creates a new React app?',
        options: ['npm init react-app', 'npx create-react-app my-app', 'npm create react', 'react new app'],
        correctAnswer: 1,
        explanation: 'npx create-react-app is the official way to create a new React application.'
    },
    {
        id: 'react-010',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is the correct way to handle events in React?',
        options: ['onclick="handleClick()"', 'onClick={handleClick}', 'onClick="handleClick"', 'on-click={handleClick}'],
        correctAnswer: 1,
        explanation: 'React uses camelCase event names and passes functions as event handlers.'
    },
    {
        id: 'react-011',
        skill: 'React',
        difficulty: 'easy',
        question: 'What does the key prop do in lists?',
        options: ['Locks elements', 'Helps React identify which items changed', 'Sets primary key', 'Encrypts data'],
        correctAnswer: 1,
        explanation: 'Keys help React identify which items have changed, been added, or removed.'
    },
    {
        id: 'react-012',
        skill: 'React',
        difficulty: 'easy',
        question: 'Which method is called when a component is removed from the DOM?',
        options: ['componentWillUnmount', 'componentDidUnmount', 'onUnmount', 'removeComponent'],
        correctAnswer: 0,
        explanation: 'componentWillUnmount is called right before a component is unmounted.'
    },
    {
        id: 'react-013',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is the default port for React development server?',
        options: ['3000', '8080', '5000', '4200'],
        correctAnswer: 0,
        explanation: 'React development server runs on port 3000 by default.'
    },
    {
        id: 'react-014',
        skill: 'React',
        difficulty: 'easy',
        question: 'How do you pass data from parent to child component?',
        options: ['Using state', 'Using props', 'Using context', 'Using refs'],
        correctAnswer: 1,
        explanation: 'Data flows from parent to child through props.'
    },
    {
        id: 'react-015',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is the correct way to update state?',
        options: ['state = newValue', 'this.state = newValue', 'setState(newValue)', 'updateState(newValue)'],
        correctAnswer: 2,
        explanation: 'State should be updated using setState() or the setter from useState hook.'
    },
    {
        id: 'react-016',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is conditional rendering?',
        options: ['Rendering based on conditions', 'Rendering CSS', 'Pre-rendering', 'Server-side rendering'],
        correctAnswer: 0,
        explanation: 'Conditional rendering displays components based on certain conditions.'
    },
    {
        id: 'react-017',
        skill: 'React',
        difficulty: 'easy',
        question: 'Which company developed React?',
        options: ['Google', 'Facebook', 'Microsoft', 'Amazon'],
        correctAnswer: 1,
        explanation: 'React was developed and is maintained by Facebook (Meta).'
    },
    {
        id: 'react-018',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is a fragment in React?',
        options: ['A broken component', 'A way to group elements without extra DOM nodes', 'A CSS module', 'A routing feature'],
        correctAnswer: 1,
        explanation: 'Fragments (<></>) let you group children without adding extra nodes to the DOM.'
    },
    {
        id: 'react-019',
        skill: 'React',
        difficulty: 'easy',
        question: 'What does npm start do?',
        options: ['Builds production', 'Starts development server', 'Installs packages', 'Runs tests'],
        correctAnswer: 1,
        explanation: 'npm start launches the React development server.'
    },
    {
        id: 'react-020',
        skill: 'React',
        difficulty: 'easy',
        question: 'What is the purpose of componentDidMount?',
        options: ['Update component', 'Run code after component renders', 'Unmount component', 'Initialize props'],
        correctAnswer: 1,
        explanation: 'componentDidMount runs after the component is mounted to the DOM.'
    },

    // MEDIUM (12 questions)
    {
        id: 'react-021',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is the purpose of useCallback?',
        options: ['Fetch data', 'Memoize functions to prevent recreat ion', 'Handle callbacks', 'Create side effects'],
        correctAnswer: 1,
        explanation: 'useCallback memoizes function definitions to optimize performance.'
    },
    {
        id: 'react-022',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is prop drilling?',
        options: ['Creating holes in props', 'Passing props through multiple levels', 'Debugging props', 'Validating props'],
        correctAnswer: 1,
        explanation: 'Prop drilling is passing data through many component layers.'
    },
    {
        id: 'react-023',
        skill: 'React',
        difficulty: 'medium',
        question: 'What does useReducer return?',
        options: ['State only', '[state, dispatch]', '[state, setState]', 'dispatch only'],
        correctAnswer: 1,
        explanation: 'useReducer returns an array with current state and a dispatch function.'
    },
    {
        id: 'react-024',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is React.memo used for?',
        options: ['Memoizing component to prevent unnecessary re-renders', 'Storing memory', 'Creating memos', 'Optimizing images'],
        correctAnswer: 0,
        explanation: 'React.memo is a higher-order component that memoizes component output.'
    },
    {
        id: 'react-025',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is the difference between controlled and uncontrolled components?',
        options: ['No difference', 'Controlled components use React state, uncontrolled use refs', 'Uncontrolled are faster', 'Controlled cannot be updated'],
        correctAnswer: 1,
        explanation: 'Controlled components derive their value from state; uncontrolled use DOM refs.'
    },
    {
        id: 'react-026',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is the purpose of useRef?',
        options: ['Create references to DOM elements', 'Manage state', 'Create context', 'Handle routing'],
        correctAnswer: 0,
        explanation: 'useRef creates a mutable reference that persists across renders.'
    },
    {
        id: 'react-027',
        skill: 'React',
        difficulty: 'medium',
        question: 'What does the dependency array in useEffect control?',
        options: ['When the effect runs', 'What data to fetch', 'Component lifecycle', 'Props to watch'],
        correctAnswer: 0,
        explanation: 'The dependency array determines when the effect should re-run.'
    },
    {
        id: 'react-028',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is lazy loading in React?',
        options: ['Slow rendering', 'Loading components on demand', 'Delayed state updates', 'Async rendering'],
        correctAnswer: 1,
        explanation: 'Lazy loading defers component loading until needed, improving initial load time.'
    },
    {
        id: 'react-029',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is Context API used for?',
        options: ['Routing', 'State management across component tree', 'API calls', 'Form validation'],
        correctAnswer: 1,
        explanation: 'Context provides a way to share data across the component tree without prop drilling.'
    },
    {
        id: 'react-030',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is the correct way to implement error boundaries?',
        options: ['Using try-catch', 'Using componentDidCatch', 'Using useError hook', 'Using error prop'],
        correctAnswer: 1,
        explanation: 'Error boundaries are implemented using componentDidCatch lifecycle method.'
    },
    {
        id: 'react-031',
        skill: 'React',
        difficulty: 'medium',
        question: 'What does React.StrictMode do?',
        options: ['Enforces strict typing', 'Identifies potential problems', 'Blocks warnings', 'Optimizes production'],
        correctAnswer: 1,
        explanation: 'StrictMode highlights potential problems in development mode.'
    },
    {
        id: 'react-032',
        skill: 'React',
        difficulty: 'medium',
        question: 'What is the purpose of useMemo?',
        options: ['Memoize expensive calculations', 'Store data', 'Create memory', 'Handle side effects'],
        correctAnswer: 0,
        explanation: 'useMemo memoizes computed values to avoid expensive recalculations.'
    },

    // HARD (8 questions)
    {
        id: 'react-033',
        skill: 'React',
        difficulty: 'hard',
        question: 'What is React Fiber?',
        options: ['A CSS library', 'React\'s reconciliation algorithm', 'A state manager', 'A routing solution'],
        correctAnswer: 1,
        explanation: 'Fiber is React\'s core reconciliation algorithm for efficient updates.'
    },
    {
        id: 'react-034',
        skill: 'React',
        difficulty: 'hard',
        question: 'What is the difference between React.createElement and JSX?',
        options: ['No difference, JSX transpiles to React.createElement', 'createElement is faster', 'JSX is deprecated', 'createElement is for classes only'],
        correctAnswer: 0,
        explanation: 'JSX is syntactic sugar that gets compiled to React.createElement calls.'
    },
    {
        id: 'react-035',
        skill: 'React',
        difficulty: 'hard',
        question: 'What is reconciliation in React?',
        options: ['Merging conflicts', 'Process of comparing virtual DOM with real DOM', 'Component lifecycle', 'State synchronization'],
        correctAnswer: 1,
        explanation: 'Reconciliation is React\'s algorithm for determining what changes to make to the DOM.'
    },
    {
        id: 'react-036',
        skill: 'React',
        difficulty: 'hard',
        question: 'What are render props?',
        options: ['Props for rendering', 'Pattern for sharing code using props with function values', 'CSS props', 'Validation props'],
        correctAnswer: 1,
        explanation: 'Render props is a technique for sharing logic by passing a function as a prop.'
    },
    {
        id: 'react-037',
        skill: 'React',
        difficulty: 'hard',
        question: 'What is the purpose of useImperativeHandle?',
        options: ['Customize ref value exposed to parent', 'Handle imperative code', 'Manage side effects', 'Create refs'],
        correctAnswer: 0,
        explanation: 'useImperativeHandle customizes the instance value exposed when using refs.'
    },
    {
        id: 'react-038',
        skill: 'React',
        difficulty: 'hard',
        question: 'What is Concurrent Mode in React?',
        options: ['Running multiple apps', 'Rendering updates at different priorities', 'Async state', 'Parallel processing'],
        correctAnswer: 1,
        explanation: 'Concurrent Mode allows React to work on multiple tasks and prioritize urgent updates.'
    },
    {
        id: 'react-039',
        skill: 'React',
        difficulty: 'hard',
        question: 'What is the purpose of useLayoutEffect?',
        options: ['Same as useEffect', 'Fires synchronously after DOM mutations', 'Handles layouts', 'Creates CSS'],
        correctAnswer: 1,
        explanation: 'useLayoutEffect fires synchronously after all DOM mutations, before paint.'
    },
    {
        id: 'react-040',
        skill: 'React',
        difficulty: 'hard',
        question: 'What is code splitting in React?',
        options: ['Dividing components', 'Breaking code into chunks loaded on demand', 'Organizing files', 'Testing strategy'],
        correctAnswer: 1,
        explanation: 'Code splitting divides bundles into smaller chunks that can be loaded on demand.'
    }
];

// Export question bank organized by skill
export const questionBank: QuestionBank = {
    'JavaScript': javascriptQuestions,
    'React': reactQuestions,
    // TODO: Add remaining 18 skills (TypeScript, Node.js, Python, etc.)
    // Each with 40 questions following same difficulty distribution
};

// Utility function to get random questions for a skill
export function getQuestionsForSkill(
    skill: SkillCategory,
    count: number
): ApplicationTestQuestion[] {
    const skillQuestions = questionBank[skill] || [];

    // Shuffle and select
    const shuffled = [...skillQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Generate test questions based on job requirements
export function generateTestQuestions(
    requiredSkills: string[],
    totalCount: number
): ApplicationTestQuestion[] {
    const questionsPerSkill = Math.ceil(totalCount / requiredSkills.length);
    const selectedQuestions: ApplicationTestQuestion[] = [];

    // Filter to only skills that have questions available
    const availableSkills = requiredSkills.filter(skill => {
        const questions = questionBank[skill as SkillCategory];
        return questions && questions.length > 0;
    });

    // If no skills have questions, return JavaScript questions as fallback
    if (availableSkills.length === 0) {
        console.warn('No questions available for requested skills, using JavaScript as fallback');
        const fallbackQuestions = getQuestionsForSkill('JavaScript', totalCount);
        return fallbackQuestions;
    }

    const questionsPerAvailableSkill = Math.ceil(totalCount / availableSkills.length);

    availableSkills.forEach(skill => {
        const skillQuestions = getQuestionsForSkill(skill as SkillCategory, questionsPerAvailableSkill);
        selectedQuestions.push(...skillQuestions);
    });

    // Shuffle final array and return exact count
    const shuffled = selectedQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalCount);
}
