# `thread-context`
This module is located at https://github.com/Aggtaa/thread-context. Any other location is either a fork or a copy.

## Overview
This module helps to mitigate absense of "thread context" in node.js, where threads are missing. It utilizes [`cls-hooked`](https://www.npmjs.com/package/cls-hooked) to access continuation local storage and provides a thin yet convenient wrapper around it.
It allows you to store data once and access it from any subsequent synchronous or asynchronous function call. Call stack from an express handler where every request can is given a unique ID makes a good example.

## API
The usage is straightforward:

The `threadContext` object that can be imported from the `thread-context` module, is a `Proxy` object with virtual getter and setter and implements `undefined` type (for those of you using typescript). It allows storing data of any structure within one stack call ("thread")

You simply call `threadContext.init()` once in the topmost function of a callstack (e.g. an express handler), giving a context a unique id. The id is later available as `threadContext.threadId`.

Any read or write to `threadContext` fields yields same result within one "thread" no matter how deep in call stack execution is.

The `threadContext` "threads" are disposed automatically, there is nothing you need to do.

## Example

index.js
```typescript
import debug from 'debug';
import express from 'express';
import { threadContext } from 'thread-context';
import { generateThreadReport } from './report';
import { generateSuperUniqueId } from './uniqueIdGenerator';

const app = new express.Express();

app.use(async (req, res, next) => {
    
    // start a threadContext and give it a unique ID
    await threadContext.init(generateSuperUniqueId());
    // or simply threadContext.init();

    // store some data for later
    threadContext.requestMethod = req.method;
    threadContext.requestPath = req.originalPath;

    debug.log(`[${threadContext.threadId}] ${threadContext.requestMethod} ${threadContext.requestPath}: threadContext init`);

    next();
});

app.get('/thread.json', (req, res, next) => {
    res.json(generate);
});

app.get('/someOtherUrl', (req, res, next) => {
    debug.log(`[${threadContext.threadId}] ${threadContext.requestMethod} ${threadContext.requestPath}: still in same threadContext`);
    // ...
    res.end();
});
```

report.js
```typescript
import debug from 'debug';
import { threadContext as ctx } from 'thread-context';

export function generateThreadReport() {

    debug.log(`[${ctx.threadId}] ${ctx.requestMethod} ${ctx.requestPath}: generating report`);

    return {
        threadId: ctx.threadId,
        requestMethod: ctx.requestMethod,
        requestPath: ctx.requestPath,
    }
}
```