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
        test('should construct with scope and user', function () {
            expect(this.dictionary.scope).to.be.equal('users');
            expect(this.dictionary.uuid).to.be.equal('0129384701294190842');
        });
    });

    describe('willSet', function () {
        test('should promise to set a dictionary value', function (asyncDone) {
            var promise = this.dictionary.willSet(
                'TEST_DICTIONARY',
                JSON.stringify({
                    name: 'GOTCHA',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                })
            );

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });

        test('should promise to set another dictionary value', function (asyncDone) {
            var promise = this.dictionary.willSet(
                'TEST_OTHER',
                JSON.stringify({
                    type: 'weird',
                    payload: true,
                    enabled: true,
                    cuteness: -12
                })
            );

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });

        test('should promise to set another value again, add, remove, ' +
            'change keys', function (asyncDone) {
            var promise = this.dictionary.willSet(
                'TEST_OTHER',
                JSON.stringify({
                    type: 'weirdulator',
                    enabled: true,
                    cuteness: -12,
                    added: 'this'
                })
            );

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });

        test('should promise to set a dictionary value to be deleted', function (asyncDone) {
            var promise = this.dictionary.willSet(
                'TEST_DELETE',
                JSON.stringify({
                    name: 'GOTCHA',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                })
            );

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });

    });

    describe('willDelete', function () {
        test('should promise to delete a dictionary value', function (asyncDone) {
            var promise = this.dictionary.willDelete(
                'TEST_DELETE'
            );

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });
    });

    describe('willGet', function () {
        test('should promise to get a dictionary value', function (asyncDone) {
            var promise = this.dictionary.willGet(
                'TEST_DICTIONARY'
            );

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });

        test('should promise to get a modified dictionary value', function (asyncDone) {
            var promise = this.dictionary.willGet(
                'TEST_OTHER'
            );

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });

        test('should promise to get a dictionary value that was deleted', function (asyncDone) {
            var promise = this.dictionary.willGet(
                'TEST_DELETE'
            );

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });
    });

    describe('willGetCollection', function () {
        test('should promise to get the whole collection', function (asyncDone) {
            var promise = this.dictionary.willGetCollection();

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });

        test('should promise to get a filtered collection', function (asyncDone) {
            var promise = this.dictionary.willGetCollection({
                payload: true,
                enabled: true
            });

            promise.then(function (result) {
                asyncDone(new Error(result));
            });

        });
    });
});