require('colors');

var config = require('../../config.js');
var dbConfig = require('../../dbConfig.js');
var nano = require('nano')(config.dbserver);

var jsonQuery = require('json-query');

var Resolutions = function() {}

Resolutions.prototype.getAll = function(callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_resolutions);

    db.list({
            'include_docs': true,
            'attachments': true,
            'limit': undefined,
            'descending': false
        },
        function(err, body) {
            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data
            callback(null, body.rows);
        });
};

Resolutions.prototype.getById = function(id, callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_resolutions);

    db.get(id, function(err, body) {
        if (err) {
            callback(err);
        }
        callback(null, body);
    });

};


Resolutions.prototype.saveAll = function(data, callback) {
    var self = this;

    var count = 0;
    if (data.length===0) {

      callback();
    }

    for (var i = 0; i < data.length; i++) {

        var res = data[i];

        self.add(res, function(err, body) {
            count++;

            if (err && err.statusCode !== 409) {
                callback(err);
            }

            if (count == data.length) {
                callback();
            }
        });

    }

};

Resolutions.prototype.add = function(resolution, callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_resolutions);

    if (resolution.type === "text" || resolution.type === "list") {

        var studentAudio = resolution.studentAudio;

        delete resolution._rev;
        delete resolution.studentAudio;

        var originaldata = new Buffer(studentAudio, 'base64');

        db.multipart.insert(resolution, [{
            name: 'record.m4a',
            data: originaldata,
            content_type: 'audio/mp4'
        }], resolution._id, function(err, body) {
            if (err) {

                return callback(err);

            } else {

                callback(null, body);

            }
        });

    } else {

        db.insert(resolution, resolution._id, function(err, body) {
            if (err) {
                return callback(err);
            }
            callback(null, body);
        });

    }
};

module.exports = new Resolutions();
