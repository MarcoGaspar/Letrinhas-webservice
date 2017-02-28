var config = require('../../config.js');
var dbConfig = require('../../dbConfig.js');
var nano = require('nano')(config.dbserver);
var jsonQuery = require('json-query');


var Students = function() {

}


Students.prototype.getByName = function(username, callback) {


    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_students);

    db.list({
            'include_docs': true,
            'attachments': true,
            'limit': undefined,
            'descending': false
        },
        function(err, studentsList) {
            if (err) return callback(err);
            //Verica se o username ja esta em uso
            var student = jsonQuery('rows[doc][*username=' + username + ']', {
                data: studentsList
            }).value;


            callback(null, student[0]);
        });
}


Students.prototype.getById = function(id, callback) {


    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_students);

    db.get(id, function(err, body) {
        //if an error occurs
        if (err) return callback(err);
        //else sends fetched data
        callback(null, body);
    });
};

module.exports = new Students();
