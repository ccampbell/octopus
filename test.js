/* global describe, it, beforeEach, afterEach */
var expect = require('chai').expect;
var sinon = require('sinon');
var octopus = require('./octopus.js');

var clock;
beforeEach(function () {
    clock = sinon.useFakeTimers();
});

afterEach(function () {
    clock.restore();
});

describe('Test octoppus.run', function() {
    it('should run functions in parallel', function(done) {
        var calls = [
            function ten(callback) { callback(10); },
            function twenty(callback) { callback(20); }
        ];

        octopus.run(calls, function(results) {
            expect(this).to.equal(octopus);
            expect(arguments.length).to.equal(1);
            expect(results).to.deep.equal([10, 20]);
            done();
        });
    });

    it('should run functions in parallel with an object', function(done) {
        var calls = {
            ten: function(callback) { callback(10); },
            twenty: function(callback) { callback(20); }
        };

        octopus.run(calls, function(results) {
            expect(this).to.equal(octopus);
            expect(arguments.length).to.equal(1);
            expect(results).to.deep.equal({ten: 10, twenty: 20});
            done();
        });
    });

    it('passed order should match', function(done) {
        var calls = [
            function(callback) {
                setTimeout(function() { callback(10); }, 1000);
            },
            function(callback) {
                callback(20);
            },
            function(callback) {
                setTimeout(function() { callback(30); }, 500);
            }
        ];

        octopus.run(calls, function(results) {
            expect(this).to.equal(octopus);
            expect(arguments.length).to.equal(1);
            expect(results).to.deep.equal([10, 20, 30]);
            done();
        });

        clock.tick(1001);
    });

    it('node style should return error argument in callback', function(done) {
        var calls = {
            ten: function(callback) { callback(null, 10); },
            twenty: function(callback) { callback(null, 20); }
        };

        octopus.run(calls, function(err, results) {
            expect(this).to.equal(octopus);
            expect(arguments.length).to.equal(2);
            expect(err).to.equal(null);
            expect(results).to.deep.equal({ten: 10, twenty: 20});
            done();
        });
    });

    it('should return error argument', function(done) {
        var calls = [
            function(callback) { callback('Failed to get result', null); },
            function(callback) { callback(null, 20); }
        ];

        octopus.run(calls, function(err, results) {
            expect(this).to.equal(octopus);
            expect(arguments.length).to.equal(2);
            expect(err).to.not.equal(null);
            expect(results).to.deep.equal([]);
            done();
        });
    });

    it('should return error with object failure', function(done) {
        var calls = {
            one: function(callback) { callback('Failed to get result', null); },
            two: function(callback) { callback(null, 20); }
        };

        octopus.run(calls, function(err, results) {
            expect(this).to.equal(octopus);
            expect(arguments.length).to.equal(2);
            expect(err).to.not.equal(null);
            expect(results).to.deep.equal({});
            done();
        });
    });

    it('should have only one callback for multiple errors', function(done) {
        var calls = {
            one: function(callback) { callback('Failed to get result', null); },
            two: function(callback) { callback('Also Failed', null); }
        };

        var count = 0;
        octopus.run(calls, function(err, results) {
            count += 1;
        });

        clock.tick(10);
        expect(count).to.equal(1);
        done();
    });

    it('should work with empty array', function(done) {
        var calls = [];

        var called = false;
        octopus.run(calls, function(results) {
            called = true;
            expect(this).to.equal(octopus);
            expect(results).to.deep.equal([]);
            done();
        });

        setTimeout(function() {
            if (!called) {
                done();
            }
        }, 1000);

        clock.tick(1000);

        expect(called).to.be.true;
    });

    it('should work with no callback', function(done) {
        var oneRan = false;
        var twoRan = false;

        var calls = [
            function(callback) { oneRan = true; callback(10); },
            function(callback) { twoRan = true; callback(20); }
        ];

        octopus.run(calls);
        expect(oneRan).to.be.true;
        expect(twoRan).to.be.true;
        done();
    });
});

describe('Test octopus.step', function() {
    it('should step through functions', function(done) {
        var calls = [
            function getValue(callback) {
                setTimeout(function() {
                    callback(10);
                }, 100);
            },
            function multiply(value, callback) {
                expect(value).to.equal(10);
                setTimeout(function() {
                    callback(value * 2);
                }, 20);
            },
            function writeToDisk(value, callback) {
                expect(value).to.equal(20);
                setTimeout(function() {
                    callback(value * 3);
                }, 1000);
            }
        ];

        octopus.step(calls, function(value) {
            expect(this).to.equal(octopus);
            expect(value).to.equal(60);
            done();
        });

        clock.tick(1200);
    });

    it('should step through node style functions', function(done) {
        var fourCalled = false;
        var calls = [
            function one(callback) {
                callback(null, 10);
            },
            function two(err, value, callback) {
                expect(err).to.be.null;
                callback('Error now', value);
            },
            function three(err, value, callback) {
                callback(null, value);
            },
            function four(err, value, callback) {
                fourCalled = true;
                callback(err, value);
            }
        ];

        octopus.step(calls, function(err, value) {
            expect(this).to.equal(octopus);
            expect(fourCalled).to.be.false;
            expect(err).to.equal('Error now');
            done();
        });
    });

    it('should work with empty array', function(done) {
        var calls = [];

        var called = false;
        octopus.step(calls, function(results) {
            called = true;
            expect(this).to.equal(octopus);
            expect(results).to.equal(undefined);
            done();
        });

        setTimeout(function() {
            if (!called) {
                done();
            }
        }, 1000);

        clock.tick(1000);

        expect(called).to.be.true;
    });

    it('should work with no callback', function(done) {
        var oneCalled = false;
        var twoCalled = false;

        var calls = [
            function one(callback) { oneCalled = true; callback(10); },
            function two(value, callback) { twoCalled = true; callback(value * 2); }
        ];

        octopus.step(calls);
        expect(oneCalled).to.be.true;
        expect(twoCalled).to.be.true;
        done();
    });

    it('should have only one callback for multiple errors', function(done) {
        var calls = [
            function(callback) { callback('Failed to get result', null); },
            function(callback) { callback('Also Failed', null); }
        ];

        var count = 0;
        octopus.step(calls, function(err, results) {
            count += 1;
        });

        clock.tick(10);
        expect(count).to.equal(1);
        done();
    });
});
