/**
 * OCTOPUS
 *
 * Simple asynchronous helper functions.
 *
 * 　  ／＼
 *　 ∠＿＿_ゝ　　
 *　 )|’ー’| /　
 *  (ノﾉﾉ从し'　　
 *
 *  @author Craig Campbell
 */
(function(global) {
    function _run(calls, callback) {
        var isArray = calls instanceof Array;
        var waitingOn = isArray ? calls.length : Object.keys(calls).length;
        var responses = {};

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
                    if (arguments.length === 2 && arguments[0]) {
                        waitingOn = 0;
                        callback(arguments[0], isArray ? [] : {});
                        return;
                    }

                    responses[key] = arguments.length === 2 ? arguments[1] : arguments[0];
                    waitingOn -= 1;

                    if (waitingOn === 0) {
                        var args = [_format(responses)];
                        if (arguments.length === 2) {
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

    var octopus = {
        run: _run
    };

    global.octopus = octopus;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = octopus;
    }
} (this));
