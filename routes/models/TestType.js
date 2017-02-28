require('colors');

var config = require('../../config.js');
var dbConfig = require('../../dbConfig.js');
var nano = require('nano')(config.dbserver);
var jsonQuery = require('json-query');


var TestType = function() {}

TestType.prototype.getAll = function(callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_testtype);


    db.list({'include_docs': true,'attachments': true,   'limit': undefined,'descending': false }, function(err, body) {
        if (err) {
            return res.status(500).json({
                'result': 'nok',
                'message': err
            });
        }
        //Devlve o doc de cada row
        callback(null, (jsonQuery('rows.doc', {
            data: body
        }).value));
    });

};

module.exports = new TestType();
