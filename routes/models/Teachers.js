var config = require('../../config.js');
//DB Info
var config = require('../../config.js');
var dbConfig = require('../../dbConfig.js');
var nano = require('nano')(config.dbserver);

var jsonQuery = require('json-query'),
    Schools = require("./Schools.js");



var Teachers = function() {}



Teachers.prototype.getByStudent = function(student, school, callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_teachers);

    db.list({'include_docs': true,'attachments': true,'limit': undefined,'descending': false},
        function(err, teachers) {

            if (err) return callback(err);

            var teacher = [];

            var teachersFiltered = (jsonQuery('[*_id=' + student.class + ']', {
                data: school.classes
            }).value[0]);

            for (var j = 0; j < teachersFiltered.profs.length; j++) {

                var pushUp = (jsonQuery('[doc][*_id=' + teachersFiltered.profs[j]._id + ']', {
                    data: teachers.rows
                }).value[0]);

                delete pushUp.password;

                teacher.push(pushUp);
            }

            callback(null, teacher);
        });

};



module.exports = new Teachers();
