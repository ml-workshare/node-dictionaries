'use strict';

var category = 'VersionAPI',
    logger = require('./lib/config-log4js').getLogger(category),
    debug = require('debug')(category),
    versionPath = '../config/version.json',
    packagePath = '../package.json';

class VersionAPI {
    constructor(mockPackage, mockVersion) {
        debug('constructor()');
        this._getPackageJSON(mockPackage);
        this._getVersionJSON(mockVersion);
        this._prepareVersion();
    }

    get(request, response) {
        debug('get()');
        void request;

        response
            .type('text')
            .status(this.status)
            .send(this.formattedResponse);
    }

    _getPackageJSON (mockPackage) {
        try {
            this.packageJSON = this._getJSON(mockPackage, packagePath);
        }
        catch (error) {
            logger.warn(process.pid + ' ', error);
        }
    }

    _getVersionJSON (mockVersion) {
        try {
            this.versionJSON = this._getJSON(mockVersion, versionPath);
        }
        catch (error) {
            this.versionJSON = {};
            logger.warn(process.pid + ' ', error);
        }
    }

    _getJSON (pathOrObject, defaultPath) {
        var path = (typeof pathOrObject === 'string') ? pathOrObject : defaultPath;
        return typeof pathOrObject === 'object' ?
            pathOrObject : require(path);
    }

    _prepareVersion () {
        var result = {};
        if (this.packageJSON && this.packageJSON.version) {
            this.status = 200;
            result['Application Version'] = this.packageJSON.version;
            result['Application Name'] = 'api-location-node';
            result['Build Time'] = this.versionJSON.buildTime;
            result['Builder Number'] = this.versionJSON.builderNumber;
            result['Build Id'] = this.versionJSON.buildId;
            result['Job name'] = this.versionJSON.jobName;
            result['Build tag'] = this.versionJSON.buildTag;
            result['Git commit'] = this.versionJSON.gitCommit;
        } else {
            this.status = 500;
            result.error = 'We are unable to determine the version';
        }
        this.formattedResponse = this._formatResponse(result);
    }

    _formatResponse(keyValues) {
        var result = [];
        Object.keys(keyValues).forEach(function (key) {
            result.push(key + '=' + keyValues[key]);
        });
        return result.join('\n');
    }
}

module.exports = VersionAPI;
