'use strict';

describe('DictionaryStore', function () {
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
        };

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
});
