require('colors');
var sizeof = require('object-sizeof');

var Students = require('./models/Students.js'),
    Tests = require('./models/Tests.js'),
    Resolutions = require('./models/Resolutions.js');



exports.get = function(req, res) {
    Students.getById(req.user.studentID, function(err, body) {

        if (err)
            return res.status(401).json({
                status: 'nok',
                result: 'error getByID'
            });
        return res.status(200).json({
            status: 'ok',
            result: 'Successfully'
        });

    });
};

exports.saveTestWithResolutions = function(req, res) {

    console.log('starting to save test with resolutions');

    var test = req.body.test;
    var resolutions = req.body.resolutions;

    Tests.getById(test._id, function(err, body) {
        if (err){
        return res.status(401).json({
            status: 'nok',
            result: 'error getting test'
        });
        }

        test._rev = body._rev;

        Tests.add(test, function(err, body) {
            if (err){
                console.log('erro save test');
            return res.status(401).json({
                status: 'nok',
                result: 'error saving solved test'
            });
          }

            var count = 0;
            for (var i = 0; i < resolutions.length; i++) {

                var singleRes = resolutions[i];

                Resolutions.add(singleRes, function(err, body) {
                    if (err) {
                        return res.status(401).json({
                            status: 'nok',
                            result: 'error inserting test'
                        });
                    }

                    count++;
                    if (count === resolutions.length) {

                        return res.status(200).json({
                            status: 'ok',
                            result: 'test and resolutions inserted'
                        });
                    }
                });
            }
        });
    });
};
