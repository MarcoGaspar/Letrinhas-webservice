require('colors');
var sizeof = require('object-sizeof');
var Students = require('./models/Students.js'),
    Schools = require('./models/Schools.js'),
    Tests = require('./models/Tests.js'),
    Categories = require('./models/Categories.js'),
    Teachers = require('./models/Teachers.js'),
    TestType = require('./models/TestType.js'),
    Questions = require('./models/Questions.js'),
    Resolutions = require('./models/Resolutions.js');

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " Bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MB";
    else return (bytes / 1073741824).toFixed(3) + " GB";
};

exports.get = function(req, res) {
    Students.getById(req.user.studentID, function(err, body) {

        if (err) {
            return res.status(401).json({
                status: 'nok',
                result: 'error getByID'
            });
        }

        return res.status(200).json({
            status: 'ok',
            result: 'Successfully'
        });

    });
};

exports.saveAllRes = function(req, res) {


    Resolutions.saveAll(req.body, function(err, body) {

        if (err) {
            return res.status(401).json({
                status: 'nok',
                result: 'error getByID'
            });
        }
        console.log('fin asdas d');
        return res.status(200).json({
            status: 'ok',
            result: 'Successfully'
        });
    });

};

exports.saveAllTestsAllResolutionsByStudent = function(req, res) {
    var data = req.body;

    console.log('student: ' + req.user.name+' - STARTED UPLOAD ALL TESTS AND RESOLUTIONS');
    console.log('tamanho dos testes:  '+ data.tests.length);
    console.log('tamanho das resolu:  '+ data.resolutions.length);

    if (JSON.stringify(data) === '{}') {
      return res.status(200).json({
          status: 'ok',
          result: 'Testes e resoluções actualizadas!'
      });
    }

    Tests.saveAll(data.tests, function(err, body) {

        if (err) {
            return res.status(401).json({
                status: 'nok',
                result: 'Erro a guardar Testes!'
            });
        }


        Resolutions.saveAll(data.resolutions, function(err, body) {

            if (err) {
                return res.status(401).json({
                    status: 'nok',
                    result: 'Erro a guardar Resoluções!'
                });
            }

            console.log('student: ' + req.user.name+' - HAVE FINISHED UPLOAD ALL TESTS AND RESOLUTIONS');
            return res.status(200).json({
                status: 'nok',
                result: 'Testes e resoluções actualizadas!'
            });
        });
    });

};

exports.getAllAboutMe = function(req, res) {
  console.log(req.body);
    var data = {};

    console.log('student: ' + req.user.name + ' - GET ALL ABOUT ME STARTED');

    Students.getById(req.user.studentID, function(err, student) {

        if (err) {
            console.log('student: ' + req.user.name + ' - error fetching student');
            return res.status(401).json({
                status: 'nok',
                result: 'Erro ao carregar o Aluno!'
            });
        }

        Schools.getById(student.school, function(err, school) {
            if (err) {
                console.log('student: ' + req.user.name + ' - error fetching school');
                return res.status(401).json({
                    status: 'nok',
                    result: 'Erro ao carregar a Escola!'
                });
            }

            Tests.getByStudentSorted(student._id, function(err, tests) {

                if (err) {
                    console.log('student: ' + req.user.name + ' - error fetching tests');
                    return res.status(401).json({
                        status: 'nok',
                        result: 'Erro ao carregar os Testes!'
                    });
                }

                Categories.getAll(function(err, categories) {

                    if (err) {
                        console.log('student: ' + req.user.name + ' - error fetching Categories');
                        return res.status(401).json({
                            status: 'nok',
                            result: 'Erro ao carregar as Categorias!'
                        });
                    }

                    Teachers.getByStudent(student, school, function(err, teachers) {

                        if (err) {
                            console.log('student: ' + req.user.name + ' - error fetching Teachers');
                            return res.status(401).json({
                                status: 'nok',
                                result: 'Erro ao carregar os Professores!'
                            });
                        }

                        TestType.getAll(function(err, testtypes) {

                            if (err) {
                                console.log('student: ' + req.user.name + ' - error fetching TestTypes');
                                return res.status(401).json({
                                    status: 'nok',
                                    result: 'Erro ao carregar os Tipos de Teste!'
                                });
                            }

                            Questions.getAllByStudent(tests.unsolved, function(err, questions) {
                                if (err) {
                                    console.log('student: ' + req.user.name + ' - error fetching Questions');
                                    return res.status(401).json({
                                        status: 'nok',
                                        result: 'Erro ao carregar as Questões!'
                                    });
                                }


                                var quests = [];
                                quests.data = [];
                                quests.ids = questions;

                                Questions.analyze(quests, function(err, questionsWithAttach) {
                                    if (err) {
                                        console.log('student: ' + req.user.name + ' - error fetching Questions with Attachements');
                                        return res.status(401).json({
                                            status: 'nok',
                                            result: 'Erro ao carregar as Questões com Som!'
                                        });
                                    }


                                    console.log('student: ' + req.user.name + ' - GET ALL ABOUT ME FINISHED');

                                    data.questions = questionsWithAttach.data;
                                    data.testtypes = testtypes;
                                    data.categories = categories;
                                    data.tests = tests;
                                    data.student = student;
                                    data.school = school;
                                    data.teachers = teachers;
                                    data.resolutions = [];

                                    return res.status(200).json({
                                        status: 'ok',
                                        result: 'Successfully',
                                        data: data,
                                        size: formatBytes(sizeof(data))
                                    });

                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

/*
exports.getTestAndResolutions = function(req, res) {

    Tests.getSolvedTestByStudent(req.user.studentID, function(err, solvedTest) {

        if (err) {
            return res.status(401).json({
                status: 'nok',
                result: 'error getByID'
            });
        }


        for (var i = 0; i < solvedTest.length; i++) {
            var test = solvedTest[i];
            for (var j = 0; j < test.questions.length; j++) {
                var quest = test.questions[j];


                Resolutions.countByTestID ()
                Resolutions.getById('T' + test._id + '' + quest._id, function(err, resol) {
                    if (err) {
                        console.log('not found');
                    }
                    console.log('found' + resol._id);

                    toSolve++;
                    return res.status(200).json({
                        status: 'ok',
                        result: 'error getByID'
                    });
                    console.log('SENT');
                });


            }



        }





        console.log(toSolve);
    });
    console.log('fim tudo');
};
*/
