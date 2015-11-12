'use strict';

describe('DictionaryStore', function () {
    var DictionaryStore = require('../../../app/lib/DictionaryStore'),
        test = it.skip;

    beforeEach(function () {
        this.dictionary = new DictionaryStore({
            scope: 'users',
            uuid: '0129384701294190842'
        });
    });

    describe('constructor', function () {
        it('should construct with scope and user', function () {
            expect(this.dictionary.scope).to.be.equal('users');
            expect(this.dictionary.uuid).to.be.equal('0129384701294190842');
        });
    });

    describe('willSet', function () {
        it('should promise to set a dictionary value', function (asyncDone) {
            var DATA = {
                    name: 'GOTCHA',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                },
                promise = this.dictionary.willSet(
                    'TEST_DICTIONARY',
                    JSON.stringify(DATA)
                );

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(DATA);
                });
            });

        });

        it('should promise to set another dictionary value', function (asyncDone) {
            var DATA = {
                    type: 'weird',
                    payload: true,
                    enabled: true,
                    cuteness: -12
                },
                promise = this.dictionary.willSet(
                    'TEST_OTHER',
                    JSON.stringify(DATA)
                );

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(DATA);
                });
            });

        });

        it('should promise to set another value again, add, remove, ' +
            'change keys', function (asyncDone) {
            var DATA = {
                    type: 'weirdulator',
                    enabled: true,
                    cuteness: -12,
                    added: 'this'
                },
                promise = this.dictionary.willSet(
                    'TEST_OTHER',
                    JSON.stringify(DATA)
                );

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(DATA);
                });
            });

        });

        it('should promise to set a dictionary value to be deleted', function (asyncDone) {
            var DATA = {
                    name: 'GOTCHA',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                },
                promise = this.dictionary.willSet(
                    'TEST_DELETE',
                    JSON.stringify(DATA)
                );

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(DATA);
                });
            });

        });

    });

    describe('willDelete', function () {
        test('should promise to delete a dictionary value', function (asyncDone) {
            var RESULT = {},
                promise = this.dictionary.willDelete(
                    'TEST_DELETE'
                );

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(RESULT);
                });
            });

        });
    });

    describe('willGet', function () {
        test('should promise to get a dictionary value', function (asyncDone) {
            var RESULT = {},
                promise = this.dictionary.willGet(
                    'TEST_DICTIONARY'
                );

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(RESULT);
                });
            });

        });

        test('should promise to get a modified dictionary value', function (asyncDone) {
            var RESULT = {},
                promise = this.dictionary.willGet(
                    'TEST_OTHER'
                );

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(RESULT);
                });
            });

        });

        test('should promise to get a dictionary value that was deleted', function (asyncDone) {
            var RESULT = {},
                promise = this.dictionary.willGet(
                    'TEST_DELETE'
                );

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(RESULT);
                });
            });

        });
    });

    describe('willGetCollection', function () {
        test('should promise to get the whole collection', function (asyncDone) {
            var RESULT = {},
                promise = this.dictionary.willGetCollection();

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(RESULT);
                });
            });

        });

        test('should promise to get a filtered collection', function (asyncDone) {
            var RESULT = {},
                promise = this.dictionary.willGetCollection({
                    payload: true,
                    enabled: true
                });

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                    expect(JSON.parse(result))
                        .to.be.deep.equal(RESULT);
                });
            });

        });
    });
});