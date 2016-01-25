'use strict';

const DictionaryMiddleware = require('../../app/DictionaryMiddleware'),
    mockHttp = require('node-mocks-http'),
    mockDictionaryStore = require('./lib/mockDictionaryStore'),
    _ = require('underscore');

describe('DictionaryMiddleware', function () {

    before(function () {
        _.extend(this, mockDictionaryStore);
    });

    beforeEach(function() {
        this.attachMockDictionary();

        this.dictionaryMiddleware = new DictionaryMiddleware(this.dictionaryStoreFactory);

        const self = this;
        self.request = mockHttp.createRequest({
            method: 'GET',
            url: '/fake-scope/fake-uuid/dictionaries.json'
        });
        self.request.params.scope = 'fake-scope';
        self.request.params.uuid = 'fake-uuid';

        self.response = mockHttp.createResponse();

    });

    describe('constructor', function() {
        it('should construct with no mock parameters', function () {

            this.dictionaryMiddleware = new DictionaryMiddleware();

            expect(this.dictionaryMiddleware.factory).to.ok;
            expect(this.dictionaryMiddleware.factory).to.respondTo('create');
        });
    });

    describe('addsDictionaryStore', function() {

        it('should create dictionary store with scope and uuid', function () {

            const self = this;

            this.dictionaryMiddleware.addsDictionaryStore(
                self.request, self.response, function () {
                    expect(self.dictionaryStoreFactoryCreateArguments.length)
                        .to.be.equals(1);
                    expect(self.dictionaryStoreFactoryCreateArguments[0].length)
                        .to.be.equals(1);

                    expect(self.dictionaryStoreFactoryCreateArguments[0][0])
                        .to.be.deep.equals({
                            scope: 'fake-scope',
                            uuid: 'fake-uuid'
                         });
                });
        });
    });

    it('should add the dictionaryStore to the request object', function () {

        const self = this;

        this.dictionaryMiddleware.addsDictionaryStore(
            self.request, self.response, function () {
                expect(self.request.dictionaryStore).to.ok;
                expect(self.request.dictionaryStore).to.respondTo('willSet');
            });
    });
});

