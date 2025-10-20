<h1>Understanding JavaScript Closures</h1>

<p>Closures are one of the most <strong>fundamental concepts</strong> in JavaScript programming. They provide a powerful way to create private variables and maintain state.</p>

<h2>What is a Closure?</h2>

<p>A closure is a function that has access to variables in its outer (enclosing) function's scope, even after the outer function has returned.</p>

<h3>Example</h3>

<pre><code>
function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
</code></pre>

<h2>Why Use Closures?</h2>

<ul>
  <li>Data encapsulation</li>
  <li>Creating private variables</li>
  <li>Maintaining state</li>
  <li>Implementing module patterns</li>
</ul>

<h2>Common Pitfalls</h2>

<p>Be careful with closures in loops. The classic mistake is creating closures in a loop where all closures share the same variable reference.</p>

<h3>Memory Considerations</h3>

<p>Closures can lead to memory leaks if not used carefully, as they keep references to outer scope variables.</p>

<h2>Real-World Applications</h2>

<ol>
  <li>Event handlers</li>
  <li>Callbacks</li>
  <li>Functional programming</li>
  <li>Module patterns</li>
</ol>

<p>Understanding closures is essential for mastering JavaScript and writing efficient, maintainable code.</p>
