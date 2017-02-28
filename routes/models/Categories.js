require('colors');



var config = require('../../config.js');
var dbConfig = require('../../dbConfig.js');
var nano = require('nano')(config.dbserver);
var jsonQuery = require('json-query');

var Categories = function (data) {
    this.categories = data;
}


Categories.prototype.getAll = function (callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_categories);

    db.list({'include_docs': true, 'attachments': true, 'limit': undefined, 'descending': false},
        function (err, body) {

            //if an error occurs
            if (err) return callback(err);
            //else sends fetched data


          

            callback(null, (jsonQuery('[doc][*]', {
                data: body.rows
            }).value));
        });

};




module.exports = new Categories();
