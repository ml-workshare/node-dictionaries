'use strict';

describe('DictionaryStore', function () {
    const DictionaryStore = require('../../../app/lib/DictionaryStore'),
        uuid = 'potato-chimichanga',
        accountsCollection = {},
        usersCollection = {
            find: sinon.stub(),
            findOne: sinon.stub(),
            findAndModify: sinon.stub(),
            remove: sinon.stub()
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
        const document = {
            name: 'potato',
            uuid: uuid,
            value: { a: 'value' },
            _id: '5642217cf9abdbd528bc1448'
        };

        it('should pass the correct parameters to usersCollection', function () {
            usersCollection.findOne.resolves(document);

            return this.dictionary.willGet('potato').then(() => {
                expect(usersCollection.findOne).to.
                    have.been.calledWith({
                        uuid: uuid,
                        name: 'potato'
                    });
            });
        });

        it('should act as a promise and return the value', function () {
            usersCollection.findOne.resolves(document);

            const expectedResult = { name: 'potato', a: 'value' };

            return this.dictionary.willGet('potato').then((doc) => {
                expect(doc).to.deep.equal(expectedResult);
            });
        });

        it('should reject promise when mongo fails to retrieve a result', function () {
            const errorMessage = 'errorMessage';
            var rejected = false;

            usersCollection.findOne.rejects(errorMessage);

            return this.dictionary.willGet('potato').catch((error) => {
                rejected = true;
                expect(error.error_code).to.be.equal('die');
                expect(error.error_msg.message).to.be.equal(errorMessage);
            }).then(() => {
                /* jshint maxcomplexity: 2 */
                if (!rejected) {
                    throw new Error('Fulfilled when should have failed');
                }
            });
        });
    });

    describe('willSet', function () {
        const name = 'potato',
            value = { a: 'value' },
            newValue = { another: 'value2' },
            document = {
                name: name,
                uuid: uuid,
                value: newValue,
                _id: '5642217cf9abdbd528bc1448'
            };

        it('should pass the correct parameters to usersCollection', function () {
            const query = { uuid, name },
                insert = { uuid, name, value };

            usersCollection.findAndModify.resolves(document);

            return this.dictionary.willSet(name, value).then(() => {
                expect(usersCollection.findAndModify).to.
                    have.been.calledWith(query, insert, { upsert: true });
            });
        });

        it('should act as a promise and return the value', function () {
            usersCollection.findAndModify.resolves(document);

            const expectedResult = { name: name, another: 'value2' };

            return this.dictionary.willSet(name, newValue).then((doc) => {
                expect(doc).to.deep.equal(expectedResult);
            });
        });

        it('should reject promise when mongo fails to retrieve a result', function (done) {

            const errorMessage = 'errorMessage';

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
        const name = 'potato',
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

        it('should pass the correct parameters to usersCollection', function () {
            const query = { uuid };

            usersCollection.find.resolves(documents);

            return this.dictionary.willGetCollection().then(() => {
                    expect(usersCollection.find).to.
                        have.been.calledWith(query);
            });
        });

        it('should act as a promise and return the value', function () {
            usersCollection.find.resolves(documents);

            const expectedResult = [
                { name: name, a: 'value' },
                { name: secondName, another: 'value2' }
            ];

            return this.dictionary.willGetCollection().then((docs) => {
                expect(docs).to.deep.equal(expectedResult);
            });
        });

        it('should reject promise when mongo fails to retrieve a result', function (done) {

            const errorMessage = 'errorMessage';

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
        const name = 'potato',
            filters = { a: 'value' },
            sanitizedFilters = { uuid: uuid, 'value.a': 'value' },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function () {
            usersCollection.find.resolves(documents);

            return this.dictionary.willGetCollection(filters).then(() => {
                expect(usersCollection.find).to.
                    have.been.calledWith(sanitizedFilters);
            });
        });
    });

    describe('willGetCollection (filtered for int)', function () {
        const name = 'potato',
            filters = { a: '42' },
            sanitizedFilters = { uuid: uuid, 'value.a': { '$in': [ 42, '42' ] } },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function () {
            usersCollection.find.resolves(documents);

            return this.dictionary.willGetCollection(filters).then(() => {
                expect(usersCollection.find).to.
                    have.been.calledWith(sanitizedFilters);
            });
        });
    });

    describe('willGetCollection (filtered for float)', function () {
        const name = 'potato',
            filters = { a: '42.42' },
            sanitizedFilters = { uuid: uuid, 'value.a': { '$in': [ 42.42, '42.42'] } },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function () {
            usersCollection.find.resolves(documents);

            return this.dictionary.willGetCollection(filters).then(() => {
                expect(usersCollection.find).to.
                    have.been.calledWith(sanitizedFilters);
            });
        });
    });

    describe('willGetCollection (filtered for true)', function () {
        const name = 'potato',
            filters = { a: 'true' },
            sanitizedFilters = { uuid: uuid, 'value.a': { '$in': [ true, 'true' ] } },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function () {
            usersCollection.find.resolves(documents);

            return this.dictionary.willGetCollection(filters).then(() => {
                expect(usersCollection.find).to.
                    have.been.calledWith(sanitizedFilters);
            });
        });
    });

    describe('willGetCollection (filtered for false)', function () {
        const name = 'potato',
            filters = { a: 'false' },
            sanitizedFilters = { uuid: uuid, 'value.a': { '$in': [ false, 'false' ] } },
            documents = [{
                name: name,
                uuid: uuid,
                value: { a: 'value' },
                _id: '5642217cf9abdbd528bc1448'
            }];

        it('should pass the correct parameters to usersCollection', function () {
            usersCollection.find.resolves(documents);

            return this.dictionary.willGetCollection(filters).then(() => {
                expect(usersCollection.find).to.
                    have.been.calledWith(sanitizedFilters);
            });
        });
    });

    describe('willDelete', function () {

        var name = 'potato',
            value = { a: 'value' },
            document = {
                name: name,
                uuid: uuid,
                value: value,
                _id: '5642217cf9abdbd528bc1448'
            },
            expectedResult = {
                name: 'potato',
                a: 'value'
            };

        it('should return null if the value to be deleted is not found', function () {

            usersCollection.findOne.resolves(null);
            usersCollection.remove.resolves(null);

            return this.dictionary.willDelete(name).then((result) => {

                expect(result).to.deep.equal(null);

            });

        });

        it('should return the deleted value if value to be deleted is found', function () {

            usersCollection.findOne.resolves(document);
            usersCollection.remove.resolves(document);

            return this.dictionary.willDelete(name).then((result) => {

                expect(result).to.deep.equal(expectedResult);

            });

        });

        it('should reject when mongo fails to retrieve the value to be deleted', function (done) {

            var errorMessage = 'errorMessage';

            usersCollection.findOne.rejects(errorMessage);

            this.dictionary.willDelete('potato').then(() => {
                done(new Error('Fulfilled when should have failed'));
            }).catch(function (error) {
                testAsync(done, () => {
                    expect(error.error_code).to.be.equal('die');
                    expect(error.error_msg.message).to.be.equal(errorMessage);
                });
            });

        });

        it('should reject when mongo fails to delete the value', function (done) {

            var errorMessage = 'errorMessage';

            usersCollection.findOne.resolves(document);
            usersCollection.remove.rejects(errorMessage);

            this.dictionary.willDelete('potato').then(() => {
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
