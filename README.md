# Octopus

```
　  ／＼
　∠＿＿_ゝ　　
 )|’ー’| /　
(ノﾉﾉ从し'　
```

Octopus is a couple of simple asynchronous helper functions.  It is designed
for use in the browser and is < 500 bytes gzipped.  It works in node.js as well.

There are two calls

## octopus.run

Run a bunch of functions in parallel and receive a callback with the results
of all of them.

```javascript
var calls = [
    function one(callback) {
        setTimeout(function() {
            callback(10);
        }, 200);
    },
    function two(callback) {
        callback(20);
    }
];

octopus.run(calls, function(results) {
    console.log(results); // [10, 20]
});
```

Notice that even though function one finished after function two the results
still come back in the order you passed the functions in originally.

You can also pass in an object with names as the keys

```javascript
var calls = {
    one: function(callback) { callback(10); },
    two: function(callback) { callback(20); }
};

octopus.run(calls, function(results)) {
    console.log(results); // {one: 10, two: 20}
});
```

## octopus.step

Steps through functions one after the other passing the result from one function
to the next.

```javascript
var calls = [
    function one(callback) {
        callback(10);
    },
    function two(value, callback) {
        callback(value * 2);
    },
    function three(value, callback) {
        callback(value * 3);
    }
];

octopus.step(calls, function(result) {
    console.log(result); // 60
});
```

To achieve the same thing with those 3 functions in vanilla Javascript you would
have to do something like

```
one(function(result) {
    two(result, function(result) {
        three(result, function(result) {
            console.log(result);
        });
    });
});
```

### Note about using with node

In node.js the convention is to pass back an error before the actual result in
callback functions. To use any of the above examples in node, just be consistent
and pass back an error argument as the first argument in your callbacks.

Octopus will stop running and fire the final callback as soon as it receives an
error.  In the `step` call it will stop after the step that errored.  In the
`run` call it will fire the callback with the error, but the other calls will
continue running until they finish.  There is no easy way to cancel a function
from executing.
