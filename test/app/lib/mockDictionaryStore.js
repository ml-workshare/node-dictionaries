'use strict';

const DictionaryMiddleware = require('../../../app/DictionaryMiddleware'),
    mockDictionaryStore = {

        attachMockDictionaryMiddleware: function () {
            this.attachMockDictionary();
            this.dictionaryMiddleware = new DictionaryMiddleware(
                this.dictionaryStoreFactory);
        },

        attachMockDictionary: function () {
            const self = this,
                dictionaryStore = {
                    willSet: function () {
                        console.log('mockDictionaryStore.willSet() called');
                    },
                    willDelete: function () {
                        console.log('mockDictionaryStore.willDelete() called');
                    },
                    willGet: function () {
                        console.log('mockDictionaryStore.willGet() called');
                    },
                    willGetCollection: function () {
                        console.log('mockDictionaryStore.willGetCollection() called');
                    }
                };

            self.dictionaryStoreFactoryCreateArguments = [];
            self.dictionaryStore = dictionaryStore;
            self.dictionaryStoreFactory = {
                create: function () {
                    self.dictionaryStoreFactoryCreateArguments.push(arguments);
                    return dictionaryStore;
                }
            };
            return self.dictionaryStoreFactory;
        }
    };

module.exports = mockDictionaryStore;
