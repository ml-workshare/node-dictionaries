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

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                        expect(JSON.parse(result))
                            .to.be.deep.equal(RESULT);
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
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

            promise.then(function (result) {
                testAsync(asyncDone, function () {
                        expect(JSON.parse(result))
                            .to.be.deep.equal(RESULT);
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
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

            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        expect(JSON.parse(result))
                            .to.be.deep.equal(RESULT);
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
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

            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        expect(JSON.parse(result))
                            .to.be.deep.equal(RESULT);
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
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

            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        expect(JSON.parse(result))
                            .to.be.deep.equal(RESULT);
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
        });

        it('should reject promise when dictionary not present', function (asyncDone) {
            var promise = this.dictionary.willDelete(
                'TEST_DELETE'
            );

            promise.then(function (result) {
                    asyncDone(new Error('FAIL should not fulfill ' + result));
                })
                .catch(function (reason) {
                    testAsync(asyncDone, function () {
                        expect(reason)
                            .to.be.deep.equal('Not Found');
                    });
                });
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

            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        expect(JSON.parse(result))
                            .to.be.deep.equal(RESULT);
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
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

            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        expect(JSON.parse(result))
                            .to.be.deep.equal(RESULT);
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
        });

        it('should promise to get a dictionary value that was deleted', function (asyncDone) {
            var promise = this.dictionary.willGet(
                    'TEST_DELETE'
                );

            promise.then(function (result) {
                    asyncDone(new Error('FAIL should not fulfill ' + result));
                })
                .catch(function (reason) {
                    testAsync(asyncDone, function () {
                        expect(reason)
                            .to.be.deep.equal('Not Found');
                    });
                });
        });
    });

    describe('willGetCollection', function () {
        var sorter = function (before, after) {
            /* jshint maxcomplexity: 3 */
            return (before.name || '').localeCompare(
                (after.name || ''),
                'en',
                {'sensitivity': 'base'}
            );
        };

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

            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        var sorted = JSON.parse(result).sort(sorter);

                        expect(sorted)
                            .to.be.deep.equal(RESULT.sort(sorter));
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
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
                        var sorted = JSON.parse(result).sort(sorter);

                        console.log(sorted);

                        expect(sorted)
                            .to.be.deep.equal(RESULT.sort(sorter));
                    });
                })
                .catch(function (reason) {
                    asyncDone(new Error('FAIL should not reject ' + reason));
                });
        });
    });
});
