require('colors');

var config = require('../../config.js');
var dbConfig = require('../../dbConfig.js');
var nano = require('nano')(config.dbserver);
var jsonQuery = require('json-query');


var Question = function() {}

Question.prototype.getAllByStudent = function(questions, callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_questions);

    var ids = [];

    for (var j = 0; j < questions.length; j++) {
        for (var i = 0; i < questions[j].questions.length; i++) {

            var q = questions[j].questions[i]._id;
            ids.push(q);

        }
      }

    callback(null, ids);


};

Question.prototype.analyze = function(array, callback) {

    var self = this;

    var data = array;

    var q = data.ids[0];


    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_questions);


    db.get(q, {
        'attachments': true
    }, function(err, body) {

        if (err) callback(err);

        data.data.push(body);
        data.ids.splice(0, 1);

        if (data.ids.length == 0) {

            callback(null, data);

        } else {

            self.analyze(data, callback);

        }
    });



};

module.exports = new Question();
