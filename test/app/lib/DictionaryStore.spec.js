'use strict';

describe('DictionaryStore', function () {
    var DictionaryStore = require('../../../app/lib/DictionaryStore'),
        _ = require('underscore'),
        testHelper;

    before(function() {
        _.extend(this, testHelper);
    });

    beforeEach(function () {
        this.dictionary = new DictionaryStore({
            scope: 'users',
            uuid: 'fake-0129384701294190842'
        });
    });

    describe('constructor', function () {
        it('should construct with scope and user', function () {
            expect(this.dictionary.scope).to.be.equal('users');
            expect(this.dictionary.uuid).to.be.equal('fake-0129384701294190842');
        });
    });

    describe('willSet', function () {
        it('should promise to set a dictionary value', function (asyncDone) {
            /* jshint maxcomplexity: 3 */
            var DATA = {
                    name: 'GOTCHA',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                },
                RESULT = {
                    name: 'TEST_DICTIONARY',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                },
                promise = this.dictionary.willSet(
                    'TEST_DICTIONARY',
                    JSON.stringify(DATA)
                );
                this.checkFulfillment(promise, RESULT, asyncDone);
        });

        it('should promise to set another dictionary value', function (asyncDone) {
            var DATA = {
                    type: 'weird',
                    payload: true,
                    enabled: true,
                    cuteness: -12
                },
                RESULT = {
                    name: 'TEST_OTHER',
                    type: 'weird',
                    payload: true,
                    enabled: true,
                    cuteness: -12
                },
                promise = this.dictionary.willSet(
                    'TEST_OTHER',
                    JSON.stringify(DATA)
                );

            this.checkFulfillment(promise, RESULT, asyncDone);
        });

        it('should promise to set another value again, add, remove, ' +
            'change keys', function (asyncDone) {
            var DATA = {
                    type: 'weirdulator',
                    enabled: true,
                    cuteness: -12,
                    added: 'this'
                },
                RESULT = {
                    name: 'TEST_OTHER',
                    type: 'weirdulator',
                    enabled: true,
                    cuteness: -12,
                    added: 'this'
                },
                promise = this.dictionary.willSet(
                    'TEST_OTHER',
                    JSON.stringify(DATA)
                );

            this.checkFulfillment(promise, RESULT, asyncDone);
        });

        it('should promise to set a dictionary value to be deleted', function (asyncDone) {
            var DATA = {
                    name: 'GOTCHA',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                },
                RESULT = {
                    name: 'TEST_DELETE',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                },
                promise = this.dictionary.willSet(
                    'TEST_DELETE',
                    JSON.stringify(DATA)
                );

            this.checkFulfillment(promise, RESULT, asyncDone);
        });
    });

    describe('willDelete', function () {
        it('should promise to delete a dictionary value', function (asyncDone) {
            var RESULT = {
                    name: 'TEST_DELETE',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                },
                promise = this.dictionary.willDelete(
                    'TEST_DELETE'
                );

            this.checkFulfillment(promise, RESULT, asyncDone);
        });

        it('should reject promise when dictionary not present', function (asyncDone) {
            var promise = this.dictionary.willDelete(
                'TEST_DELETE'
            );

            this.checkRejection(promise, 'Not Found', asyncDone);
        });
    });

    describe('willGet', function () {
        it('should promise to get a dictionary value', function (asyncDone) {
            var RESULT = {
                    name: 'TEST_DICTIONARY',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                },
                promise = this.dictionary.willGet(
                    'TEST_DICTIONARY'
                );

            this.checkFulfillment(promise, RESULT, asyncDone);
        });

        it('should promise to get a modified dictionary value', function (asyncDone) {
            var RESULT = {
                    name: 'TEST_OTHER',
                    type: 'weirdulator',
                    enabled: true,
                    cuteness: -12,
                    added: 'this'
                },
                promise = this.dictionary.willGet(
                    'TEST_OTHER'
                );

            this.checkFulfillment(promise, RESULT, asyncDone);
        });

        it('should reject promise to get a dictionary ' +
            'value that was deleted', function (asyncDone) {
            var promise = this.dictionary.willGet(
                    'TEST_DELETE'
                );

            this.checkRejection(promise, 'Not Found', asyncDone);
        });
    });

    describe('willGetCollection', function () {
        it('should promise to get the whole collection', function (asyncDone) {
            var RESULT = [{
                    name: 'TEST_OTHER',
                    type: 'weirdulator',
                    enabled: true,
                    cuteness: -12,
                    added: 'this'
                },{
                    name: 'TEST_DICTIONARY',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                }],
                promise = this.dictionary.willGetCollection();

            this.checkFulfillmentSorted(promise, RESULT, asyncDone);
        });

        it('should promise to get a filtered collection', function (asyncDone) {
            var RESULT = [{
                    name: 'TEST_DICTIONARY',
                    payload: true,
                    enabled: false,
                    cuteness: 42
                }],
                promise = this.dictionary.willGetCollection({
                    payload: true
                });

            this.checkFulfillmentSorted(promise, RESULT, asyncDone);
        });

        it('should promise to get filter with no match', function (asyncDone) {
            var RESULT = [],
                promise = this.dictionary.willGetCollection({
                    payload: true,
                    missing: true
                });

            this.checkFulfillmentSorted(promise, RESULT, asyncDone);
        });
    });

    testHelper = {
        checkFulfillment: function (promise, expected, asyncDone) {
            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        expect(JSON.parse(result))
                            .to.be.deep.equal(expected);
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
        },

        checkFulfillmentSorted: function (promise, expected, asyncDone) {
            var sorter = this.sorter;

            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        var sorted = JSON.parse(result).sort(sorter);

                        expect(sorted)
                            .to.be.deep.equal(expected.sort(sorter));
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
        },

        checkRejection: function (promise, expected, asyncDone) {
            promise.then(function (result) {
                    asyncDone(new Error('FAIL should not fulfill ' + result));
                })
                .catch(function (reason) {
                    testAsync(asyncDone, function () {
                        expect(reason)
                            .to.be.deep.equal(expected);
                    });
                });
        },

        sorter: function (before, after) {
            /* jshint maxcomplexity: 3 */
            return (before.name || '').localeCompare(
                (after.name || ''),
                'en',
                {'sensitivity': 'base'}
            );
        }
};
});
