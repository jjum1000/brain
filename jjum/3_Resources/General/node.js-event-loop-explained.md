---
created: '2025-10-20T23:30:12.454Z'
modified: '2025-10-20T23:30:12.472Z'
status: normalized
title: Node.js Event Loop Explained
keywords:
  - Callbacks
  - Executes
  - Event
  - Loop
  - Node
  - Close
  - '# Node.js Event Loop'
  - The Node.js Event Loop
  - Node.js
  - I/o Operations
  - Javascript
  - '## Phases Of The Event Loop'
  - '1. **timers**:'
  - Executes Callbacks
  - Settimeout() And Setinterval()
tags: []
concepts:
  - Callbacks
  - Executes
  - Event
  - Loop
  - Node
  - Close
  - '# Node.js Event Loop'
  - The Node.js Event Loop
  - Node.js
  - I/o Operations
linked_concepts:
  - JavaScript
unlinked_keywords:
  - Callbacks
  - Executes
  - Event
  - Loop
  - Node
  - Close
  - '# Node.js Event Loop'
  - The Node.js Event Loop
  - Node.js
  - I/o Operations
  - '## Phases Of The Event Loop'
  - '1. **timers**:'
  - Executes Callbacks
  - Settimeout() And Setinterval()
filed_at: '2025-10-20T23:30:12.472Z'
filed_from: 'd:\jjumV\jjum\00_Inbox\test-batch-3.md'
filing_rule: rule-default
destination_folder: 3_Resources/General
---
# Node.js Event Loop Explained

The Node.js event loop is what allows Node.js to perform non-blocking I/O operations despite [[JavaScript]] being single-threaded.

## Phases of the Event Loop

1. **Timers**: Executes callbacks scheduled by setTimeout() and setInterval()
2. **Pending Callbacks**: Executes I/O callbacks deferred to the next loop iteration
3. **Idle, Prepare**: Internal use only
4. **Poll**: Retrieves new I/O events
5. **Check**: Executes setImmediate() callbacks
6. **Close Callbacks**: Executes close event callbacks

Understanding the event loop is crucial for writing efficient asynchronous Node.js applications.
