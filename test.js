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

describe('Test', function() {
    it('should run functions in parallel', function(done) {
        var calls = [
            function ten(callback) { callback(10); },
            function twenty(callback) { callback(20); }
        ];

        octopus.run(calls, function(results) {
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
            expect(arguments.length).to.equal(2);
            expect(err).to.not.equal(null);
            expect(results).to.deep.equal({});
            done();
        });
    });
});
