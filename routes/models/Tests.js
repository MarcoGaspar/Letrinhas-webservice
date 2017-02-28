require('colors');
//DB Info
var config = require('../../config.js');
var dbConfig = require('../../dbConfig.js');
var nano = require('nano')(config.dbserver);

var jsonQuery = require('json-query');

var Tests = function() {}

Tests.prototype.data = {}

//Returns an array of all schools
Tests.prototype.getAll = function(callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_tests);


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

Tests.prototype.getByStudent = function(studentID, callback) {
    var self = this;

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_tests);


    self.getAll(function(err, testsData) {
        if (err) return callback(err);
        //Recolhe os testes do aluno
        var studentTests = jsonQuery('[doc][*studentID=' + studentID + ']', {
            data: testsData
        }).value;

        callback(null, studentTests);
    });

};

Tests.prototype.getByStudentSorted = function(studentID, callback) {
    var self = this;

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_tests);


    self.getAll(function(err, testsData) {
        if (err) return callback(err);
        //Recolhe os testes do aluno
        var studentTests = jsonQuery('[doc][*studentID=' + studentID + ']', {
            data: testsData
        }).value;

        var testSolved = [];
        var testToSolve = [];

        for (var i = 0; i < studentTests.length; i++) {
            var test = studentTests[i];
            if (test.solved === true) {
                testSolved.push(test);

            } else {
                testToSolve.push(test);
            }
        }
        var tests = {
            solved: testSolved,
            unsolved: testToSolve
        }

        callback(null, tests);
    });

};

Tests.prototype.getById = function(id, callback) {
    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_tests);
    db.get(id, function(err, body) {
        if (err) {
            callback(err);
        }
        callback(null, body);
    })
};

Tests.prototype.add = function(test, callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_tests);

    db.insert(test, test._id, function(err, body) {
        if (err) {
            callback(err);
        }
        callback(null, body);
    });

};

Tests.prototype.getSolvedTestByStudent = function(studentID, callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_tests);


    db.list({
            'include_docs': true,
            'attachments': true,
            'limit': undefined,
            'descending': false
        },
        function(err, body) {
            //if an error occurs
            if (err) return callback(err);


            var tests = jsonQuery('[doc][*studentID=' + studentID + '][*solved=' + true + ']', {
                data: body.rows
            }).value;

            callback(null, tests);
        });

};

Tests.prototype.getUnsolvedTestByStudent = function(studentID, callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_tests);


    db.list({
            'include_docs': true,
            'attachments': true,
            'limit': undefined,
            'descending': false
        },
        function(err, body) {
            //if an error occurs
            if (err) return callback(err);


            var tests = jsonQuery('[doc][*studentID=' + studentID + '][*solved=' + false + ']', {
                data: body.rows
            }).value;

            callback(null, tests);
        });

};

Tests.prototype.saveAll = function(data, callback) {

    var dbconfig = dbConfig.getConfig();
    var db = nano.use(dbconfig.db_tests);

    var self = this;

    if (data.length === 0) {
        callback();
    }

    var count = 0;
    for (var i = 0; i < data.length; i++) {

        var res = data[i];

        self.getById(res._id, function(err, body) {
            if (err) {
                callback(err);
            }
            count++;

            if (body.solved == false && res.solved == true && body !== undefined) {

                res._rev = body._rev;

                self.add(res, function(err, body) {

                    if (err && err.statusCode !== 409) {
                        callback(err);
                    }
                    if (count == data.length) {
                        callback();
                    }
                });
            } else {

                if (count == data.length) {
                    callback();
                }

            }

        });


    }

};

module.exports = new Tests();
