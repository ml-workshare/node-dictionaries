'use strict';

describe('DictionaryStore', function () {
    var DictionaryStore = require('../../../app/lib/DictionaryStore'),
        uuid = 'potato-chimichanga',
        accountsCollection = {},
        usersCollection = {
            find: sinon.stub(),
            findOne: sinon.stub(),
            findAndModify: sinon.stub()
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
        this.dictionary = new DictionaryStore({
            scope: 'users',
            uuid: uuid,
            database: db
        });
    });

    describe('constructor', function () {
        it('should construct with scope and user', function () {
            expect(this.dictionary.scope).to.be.equal('users');
            expect(this.dictionary.uuid).to.be.equal(uuid);
        });
    });

    describe('willGet', function () {
        var document = {
            name: 'potato',
            uuid: uuid,
            value: { a: 'value' },
            _id: '5642217cf9abdbd528bc1448'
        };

        it('should pass the correct parameters to usersCollection', function (done) {
            usersCollection.findOne.resolves(document);

            this.dictionary.willGet('potato').then(() => {
                testAsync(done, () => {
                    expect(usersCollection.findOne).to.
                        have.been.calledWith({
                            uuid: uuid,
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

    describe('willSet', function () {
        var name = 'potato',
            value = { a: 'value' },
            newValue = { another: 'value2' },
            document = {
                name: name,
                uuid: uuid,
                value: newValue,
                _id: '5642217cf9abdbd528bc1448'
            };

        it('should pass the correct parameters to usersCollection', function (done) {
            var query = { uuid, name },
                insert = { uuid, name, value };

            usersCollection.findAndModify.resolves(document);

            this.dictionary.willSet(name, value).then(() => {
                testAsync(done, () => {
                    expect(usersCollection.findAndModify).to.
                        have.been.calledWith(query, insert, { upsert: true });
                });
            }, done);
        });

        it('should act as a promise and return the value', function (done) {
            usersCollection.findAndModify.resolves(document);

            var expectedResult = { name: name, another: 'value2' };

            this.dictionary.willSet(name, newValue).then((doc) => {
                testAsync(done, () => {
                    expect(doc).to.deep.equal(expectedResult);
                });
            }, done);
        });

        it('should reject promise when mongo fails to retrieve a result', function (done) {

            var errorMessage = 'errorMessage';

            usersCollection.findAndModify.rejects(errorMessage);

            this.dictionary.willSet(name, newValue).then(() => {
                    done(new Error('Fulfilled when should have failed'));
                }).catch(function (error) {
                    testAsync(done, () => {
                        expect(error.error_code).to.be.equal('die');
                        expect(error.error_msg.message).to.be.equal(errorMessage);
                    });
                });
        });
    });

    describe('willGetCollection', function () {
        var name = 'potato',
            secondName = 'potato2',
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }, {
                name: secondName,
                uuid: uuid,
                value: { another: 'value2' },
                _id: '5642217cf9abdbd528bc144a'
            }];

        it('should pass the correct parameters to usersCollection', function (done) {
            var query = { uuid };

            usersCollection.find.resolves(documents);

            this.dictionary.willGetCollection().then(() => {
                testAsync(done, () => {
                    expect(usersCollection.find).to.
                        have.been.calledWith(query);
                });
            }, done);
        });

        it('should act as a promise and return the value', function (done) {
            usersCollection.find.resolves(documents);

            var expectedResult = [
                { name: name, a: 'value' },
                { name: secondName, another: 'value2' }
            ];

            this.dictionary.willGetCollection().then((docs) => {
                testAsync(done, () => {
                    expect(docs).to.deep.equal(expectedResult);
                });
            }, done);
        });

        it('should reject promise when mongo fails to retrieve a result', function (done) {

            var errorMessage = 'errorMessage';

            usersCollection.find.rejects(errorMessage);

            this.dictionary.willGetCollection().then(() => {
                    done(new Error('Fulfilled when should have failed'));
                }).catch(function (error) {
                    testAsync(done, () => {
                        expect(error.error_code).to.be.equal('die');
                        expect(error.error_msg.message).to.be.equal(errorMessage);
                    });
                });
        });
    });

    describe('willGetCollection (filtered)', function () {
        var name = 'potato',
            filters = { a: 'value' },
            sanitizedFilters = { uuid: uuid, 'value.a': 'value' },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function (done) {
            usersCollection.find.resolves(documents);

            this.dictionary.willGetCollection(filters).then(() => {
                testAsync(done, () => {
                    expect(usersCollection.find).to.
                        have.been.calledWith(sanitizedFilters);
                });
            }, done);
        });
    });

    describe('willGetCollection (filtered for int)', function () {
        var name = 'potato',
            filters = { a: '42' },
            sanitizedFilters = { uuid: uuid, 'value.a': { '$in': [ 42, '42' ] } },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function (done) {
            usersCollection.find.resolves(documents);

            this.dictionary.willGetCollection(filters).then(() => {
                testAsync(done, () => {
                    expect(usersCollection.find).to.
                        have.been.calledWith(sanitizedFilters);
                });
            }, done);
        });
    });

    describe('willGetCollection (filtered for float)', function () {
        var name = 'potato',
            filters = { a: '42.42' },
            sanitizedFilters = { uuid: uuid, 'value.a': { '$in': [ 42.42, '42.42'] } },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function (done) {
            usersCollection.find.resolves(documents);

            this.dictionary.willGetCollection(filters).then(() => {
                testAsync(done, () => {
                    expect(usersCollection.find).to.
                        have.been.calledWith(sanitizedFilters);
                });
            }, done);
        });
    });

    describe('willGetCollection (filtered for true)', function () {
        var name = 'potato',
            filters = { a: 'true' },
            sanitizedFilters = { uuid: uuid, 'value.a': { '$in': [ true, 'true' ] } },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function (done) {
            usersCollection.find.resolves(documents);

            this.dictionary.willGetCollection(filters).then(() => {
                testAsync(done, () => {
                    expect(usersCollection.find).to.
                        have.been.calledWith(sanitizedFilters);
                });
            }, done);
        });
    });

    describe('willGetCollection (filtered for false)', function () {
        var name = 'potato',
            filters = { a: 'false' },
            sanitizedFilters = { uuid: uuid, 'value.a': { '$in': [ false, 'false' ] } },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function (done) {
            usersCollection.find.resolves(documents);

            this.dictionary.willGetCollection(filters).then(() => {
                testAsync(done, () => {
                    expect(usersCollection.find).to.
                        have.been.calledWith(sanitizedFilters);
                });
            }, done);
        });
    });
});
