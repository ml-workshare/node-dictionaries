'use strict';
var debug = require('debug')('test');

describe.only('DictionaryStore', function () {
    var DictionaryStore = require('../../../app/lib/DictionaryStore'),
        accountsCollection = {},
        usersCollection = {
            findOne: sinon.stub()
        },
        db = {
            get: function (scope) {
                /* jshint maxcomplexity: 3 */
                if (scope === 'users') {
                    return usersCollection;
                } else if (scope === 'accounts') {
                    return accountsCollection;
                }
            }
        },
        testHelper;

    beforeEach(function () {
        this.uuid = 'fake-0129384701294190842';
        this.dictionary = new DictionaryStore({
            scope: 'users',
            uuid: this.uuid,
            database: db
        });
    });

    describe('constructor', function () {
        it('should construct with scope and user', function () {
            expect(this.dictionary.scope).to.be.equal('users');
            expect(this.dictionary.uuid).to.be.equal('fake-0129384701294190842');
        });
    });

    describe('willGet', function () {
        it('should pass the correct parameters to usersCollection', function () {
            var getPromise = this.dictionary.willGet('potato');

            getPromise.then(() => {
                expect(usersCollection.findOne).to.
                    have.been.calledWith({
                        uuid: this.uuid,
                        name: 'potato'
                    });
            });
        });
    });

    testHelper = {
        checkFulfillment: function (promise, expected, asyncDone) {
            promise.then(function (result) {
                    testAsync(asyncDone, function () {
                        expect(result).to.be.deep.equal(expected);
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
                        var sorted = result.sort(sorter);

                        debug(sorted);
                        debug(expected);
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
