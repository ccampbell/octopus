/**
 * OCTOPUS
 *
 * Simple asynchronous helpers
 *
 * This is basically a very tiny implementation of async.parallel and
 * async.series.
 *
 * 　  ／＼
 *　 ∠＿＿_ゝ　　
 *　 )|’ー’| /　
 *  (ノﾉﾉ从し'　　
 *
 * @author Craig Campbell
 */
(function(global) {
    function _run(calls, callback) {
        var isArray = calls instanceof Array;
        var waitingOn = isArray ? calls.length : Object.keys(calls).length;
        var responses = {};
        callback = callback || function() {};

        if (waitingOn === 0) {
            callback.call(octopus, isArray ? [] : {});
            return;
        }

        function _format(responses) {
            if (!isArray) {
                return responses;
            }

            var results = [];
            for (var i = 0; i < calls.length; i++) {
                results.push(responses[i]);
            }
            return results;
        }

        function _call(key) {
            calls[key].call(calls[key], (function(key) {
                return function() {
                    if (arguments.length > 1 && arguments[0] && waitingOn > 0) {
                        waitingOn = 0;
                        callback.call(octopus, arguments[0], isArray ? [] : {});
                        return;
                    }

                    responses[key] = arguments.length > 1 ? arguments[1] : arguments[0];
                    waitingOn -= 1;

                    if (waitingOn === 0) {
                        var args = [_format(responses)];
                        if (arguments.length > 1) {
                            args.unshift(null);
                        }
                        callback.apply(octopus, args);
                    }
                };
            })(key));
        }

        if (isArray) {
            for (var i = 0; i < calls.length; i++) {
                _call(i);
            }
            return;
        }

        Object.keys(calls).forEach(function(key) {
            _call(key);
        });
    }

    function _step(calls, callback) {
        callback = callback || function() {};

        function _stepSingle(calls, index, args) {
            args.push(function() {

                // We assume here that if you pass in multiple arguments into
                // your callback function the first one is an error argument
                // following the node.js conventions.
                //
                // In that case we want to stop running tasks and fire the final
                // callback with the error.
                if (arguments.length > 1 && arguments[0]) {
                    callback.apply(octopus, arguments);
                    return;
                }

                if (index < calls.length - 1) {
                    _stepSingle(calls, index + 1, Array.prototype.slice.call(arguments));
                    return;
                }

                // Final callback
                callback.apply(octopus, Array.prototype.slice.call(arguments));
            });

            calls[index].apply(calls[index], args);
        }

        if (calls.length === 0) {
            callback.call(octopus);
            return;
        }

        _stepSingle(calls, 0, []);
    }

    var octopus = {
        run: _run,
        step: _step
    };

    global.octopus = octopus;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = octopus;
    }
} (this || window));
