'use strict';

describe('CirrusMiddleware', function () {
    var CirrusMiddleware = require('../../app/CirrusMiddleware'),
        mockHttp = require('node-mocks-http'),
        _ = require('underscore'),
        testHelper;

    before(function () {
        _.extend(this, testHelper);
    });

    beforeEach(function () {
        this.cirrus = new CirrusMiddleware({
        });
    });

    describe('addsCurrentUuid', function () {
        it('should add UUID to the request for next handler', function (asyncDone) {
            var self = this;

            this.testCirrusMiddleware(asyncDone, function () {
                expect(self.request.currentUuid).to.be.equal('uUiD.UuId.uUiD.UuId');
            });
        });
    });

    testHelper = {
        testCirrusMiddleware: function (asyncDone, fnTest) {
            var self = this;
            self.request = mockHttp.createRequest({
                method: 'GET',
                url: '/fake'
            });
            self.response = mockHttp.createResponse();

            self.cirrus.addsCurrentUuid(self.request, self.response, function () {
                testAsync(asyncDone, function () {
                    fnTest();
                });
            });
        }
    };
});
