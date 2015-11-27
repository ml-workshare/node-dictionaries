'use strict';

const category = 'MongoFiltersSanitizer';

var debug = require('debug')(category);

class MongoFiltersSanitizer {
    sanitize(filters) {
        var mongoFilters = {},
            self = this;
        if (!filters) {
            debug('sanitize()', 'result', mongoFilters);
            return mongoFilters;
        }
        Object.keys(filters).forEach((key) => {
            debug('sanitize()', 'sanitizing key', key);
            var value = filters[key];
            mongoFilters['value.' + key] = self._sanitizeValue(value);
        });
        debug('sanitize()', 'result', mongoFilters);
        return mongoFilters;
    }

    _sanitizeValue(value) {
        if ('true' === value) {
            return { '$in': [true, 'true'] };
        } else if ('false' === value) {
            return { '$in': [false, 'false'] };
        } else if (!isNaN(parseFloat(value))) {
            return { '$in': [parseFloat(value), value] };
        } else {
            return value;
        }
    }
}

module.exports = MongoFiltersSanitizer;
debug('exports', module.exports);
