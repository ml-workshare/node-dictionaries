'use strict';

const DictionaryAPI = require('../../app/DictionaryAPI');

void DictionaryAPI;
describe('DictionaryAPI', function() {
    beforeEach(function() {
        this.dictionaryAPI = new DictionaryAPI();
        this.dictionaryStore = {
            willGet: function() {},
            willGetCollection: function() {},
            willSet: function() {},
            willDelete: function() {}
        };
        this.request = {
            dictionaryStore: this.dictionaryStore,
            params: {},
            query: {}
        };
        this.jsonSpy = sinon.stub();
        this.response = {
            json: this.jsonSpy
        };
    });

    describe('get', function() {
        beforeEach(function() {
            this.storeSpy = sinon.stub(this.dictionaryStore, 'willGet');
            this.request.params.dictionaryName = 'potato';
        });

        afterEach(function() {
            this.storeSpy.restore();
        });

        it('should call willGet on store', function() {
            this.storeSpy.resolves({});
            this.dictionaryAPI.get(this.request, {});
            expect(this.storeSpy).to.have.been.called;
        });

        it('should respond with something', function() {
            this.storeSpy.resolves({ a: 'value' });
            return this.dictionaryAPI.get(this.request, this.response)
                .then(function() {
                    expect(this.jsonSpy).to.have.been.calledWith({ a: 'value' });
                }.bind(this));
        });
    });

    describe('getCollection', function() {
        beforeEach(function() {
            this.storeSpy = sinon.stub(this.dictionaryStore, 'willGetCollection');
            this.request.query.filters = { a: 'filters' };
        });

        afterEach(function() {
            this.storeSpy.restore();
        });

        it('should call willGetCollection on store', function() {
            this.storeSpy.resolves({});
            this.dictionaryAPI.getCollection(this.request, {});
            expect(this.storeSpy).to.have.been.called;
        });

        it('should respond with something', function() {
            this.storeSpy.resolves([{ a: 'value' }]);
            return this.dictionaryAPI.getCollection(this.request, this.response)
                .then(function() {
                    expect(this.jsonSpy).to.have.been.calledWith([{ a: 'value' }]);
                }.bind(this));
        });
    });

    describe('put', function() {
        beforeEach(function() {
            this.storeSpy = sinon.stub(this.dictionaryStore, 'willSet');
            this.request.params.dictionaryName = 'potato';
        });

        afterEach(function() {
            this.storeSpy.restore();
        });

        it('should call willSet on store', function() {
            this.storeSpy.resolves({});
            this.dictionaryAPI.put(this.request, {});
            expect(this.storeSpy).to.have.been.called;
        });

        it('should respond with something', function() {
            this.storeSpy.resolves({ a: 'value' });
            return this.dictionaryAPI.put(this.request, this.response)
                .then(function() {
                    expect(this.jsonSpy).to.have.been.calledWith({ a: 'value' });
                }.bind(this));
        });
    });

    describe('delete', function() {
        beforeEach(function() {
            this.storeSpy = sinon.stub(this.dictionaryStore, 'willDelete');
            this.request.params.dictionaryName = 'potato';
        });

        afterEach(function() {
            this.storeSpy.restore();
        });

        it('should call willDelete on store', function() {
            this.storeSpy.resolves({});
            this.dictionaryAPI.delete(this.request, {});
            expect(this.storeSpy).to.have.been.called;
        });

        it('should respond with something', function() {
            this.storeSpy.resolves({ a: 'value' });
            return this.dictionaryAPI.delete(this.request, this.response)
                .then(function() {
                    expect(this.jsonSpy).to.have.been.calledWith({ a: 'value' });
                }.bind(this));
        });
    });
});
