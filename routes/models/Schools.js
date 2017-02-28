require('colors');
var config = require('../../config.js');
var dbConfig = require('../../dbConfig.js');
var nano = require('nano')(config.dbserver);

var Schools = function () {

}




Schools.prototype.getById = function (schoolId, callback) {

  var dbconfig = dbConfig.getConfig();
  var db = nano.use(dbconfig.db_schools);

  db.get(schoolId, function (err, body) {

        if (err) return callback(err);

        callback(null, body);
    
    });
};



module.exports = new Schools();
