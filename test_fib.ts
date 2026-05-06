import { generateFibonacciTabulation } from './src/algorithms/fibonacci/fibonacci.tabulation.js';

const steps = generateFibonacciTabulation({ n: 5 });

console.log(JSON.stringify(steps, null, 2));
