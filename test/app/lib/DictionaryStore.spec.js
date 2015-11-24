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
            expect(this.dictionary.uuid).to.be.equal(this.uuid);
        });
    });

    describe('willGet', function () {
        var document = {
            name: 'potato',
            value: { a: 'value' },
            _id: '5642217cf9abdbd528bc1448'
        };

        it('should pass the correct parameters to usersCollection', function (done) {
            usersCollection.findOne.resolves(document);

            this.dictionary.willGet('potato').then(() => {
                testAsync(done, () => {
                    expect(usersCollection.findOne).to.
                        have.been.calledWith({
                            uuid: this.uuid,
                            name: 'potato'
                        });
                });
            }, done);
        });

        it('should act as a promise and return the value', function (done) {
            usersCollection.findOne.resolves(document);

            var expectedResult = { name: 'potato', a: 'value' };

            this.dictionary.willGet('potato').then((doc) => {
                testAsync(done, () => {
                    expect(doc).to.deep.equal(expectedResult);
                });
            }, done);
        });

        it('should reject promise when mongo fails to retrieve a result', function (done) {

            var errorMessage = 'errorMessage';

            usersCollection.findOne.rejects(errorMessage);

            this.dictionary.willGet('potato').then(() => {
                    done(new Error('Fulfilled when should have failed'));
                }).catch(function (error) {
                    testAsync(done, () => {
                        expect(error.error_code).to.be.equal('die');
                        expect(error.error_msg.message).to.be.equal(errorMessage);
                    });
                });
        });
    });
});
