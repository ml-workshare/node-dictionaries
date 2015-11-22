'use strict';

const category = 'VersionAPI',
    versionPath = '../config/version.json',
    packagePath = '../package.json';

var logger = require('./lib/config-log4js').getLogger(category),
    debug = require('debug')(category),
    privates = {
        packageJSON: new WeakMap(),
        versionJSON: new WeakMap(),
        status: new WeakMap(),
        formattedResponse: new WeakMap()
    },
    _getPackageJSON,
    _getVersionJSON,
    _getJSON,
    _prepareVersion,
    _formatResponse;

class VersionAPI {
    constructor(mockPackage, mockVersion) {
        debug('constructor()');
        _getPackageJSON.call(this, mockPackage);
        _getVersionJSON.call(this, mockVersion);
        _prepareVersion.call(this);
    }

    get(request, response) {
        debug('get()');
        void request;

        response
            .type('text')
            .status(this.status)
            .send(this.formattedResponse);
    }

    get status () {
        return privates.status.get(this);
    }

    get formattedResponse () {
        return privates.formattedResponse.get(this);
    }

    toString () {
        return category + ' ' + JSON.stringify(this._privates);
    }

    get _privates () {
        var self = this, _privates = {};

        Object.keys(privates).forEach(function (key) {
            _privates[key] =
                JSON.parse(JSON.stringify(privates[key].get(self)));
        });
        return _privates;
    }
}

_getPackageJSON = function (mockPackage) {
    try {
        privates.packageJSON.set(this, _getJSON(mockPackage, packagePath));
    }
    catch (error) {
        logger.warn(process.pid + ' ', error);
    }
};

_getVersionJSON = function (mockVersion) {
    try {
        privates.versionJSON.set(this, _getJSON(mockVersion, versionPath));
    }
    catch (error) {
        privates.versionJSON.set(this, {});
        logger.warn(process.pid + ' ', error);
    }
};

_getJSON = function (pathOrObject, defaultPath) {
    var path = (typeof pathOrObject === 'string') ? pathOrObject : defaultPath;
    return typeof pathOrObject === 'object' ?
        pathOrObject : require(path);
};

_prepareVersion = function () {
    var status,
        result = {},
        packageJSON = privates.packageJSON.get(this),
        versionJSON = privates.versionJSON.get(this);

    if (packageJSON && packageJSON.version) {
        status = 200;
        result['Application Version'] = packageJSON.version;
        result['Application Name'] = 'api-location-node';
        result['Build Time'] = versionJSON.buildTime;
        result['Builder Number'] = versionJSON.builderNumber;
        result['Build Id'] = versionJSON.buildId;
        result['Job name'] = versionJSON.jobName;
        result['Build tag'] = versionJSON.buildTag;
        result['Git commit'] = versionJSON.gitCommit;
    } else {
        status = 500;
        result.error = 'We are unable to determine the version';
    }
    privates.status.set(this, status);
    privates.formattedResponse.set(this, _formatResponse(result));
};

_formatResponse = function (keyValues) {
    var result = [];
    Object.keys(keyValues).forEach(function (key) {
        result.push(key + '=' + keyValues[key]);
    });
    return result.join('\n');
};

module.exports = VersionAPI;
