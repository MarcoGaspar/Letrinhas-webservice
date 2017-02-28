require('colors');

//server config
var config = require('./config.js');
//database config
var dbConfig = require('./dbConfig.js');
var nano = require('nano')(config.dbserver);

//Requirements
var express = require('express'),
    bodyParser = require('body-parser'),
    basicAuth = require('basic-auth'),
    http = require('http');

//Path Variable
var path = require('path'),
    fs = require('fs-extra'), //File System - for file manipulation
    mime = require('mime'),
    jsonQuery = require('json-query');

//Route Controllers
var students = require('./routes/students'),
    tests = require('./routes/tests');
var StudentsModel = require('./routes/models/Students.js');

//Express Variable
var app = express();



app.use(bodyParser({
    limit: '100mb'
})); //Data Transfer Max Size
app.use(bodyParser.urlencoded({
    extended: true
})); //Set URL Enconde
app.use(bodyParser.json()); //Parse Body Data To JSON
app.use(express.static(path.join(__dirname, '/public'))); //Public Folder Path

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


//Set our server port
app.set('port', 446);


// get an instance of router
var router = express.Router();

// Route middleware that will happen on every request
router.use(function(req, res, next) {
    // log each request to the console
    switch (req.method) {
        case "GET":
            console.log("Route Request: " + req.method.green, req.url);
            break;
        case "PUT":
            console.log("Route Request: " + req.method.yellow, req.url);
            break;
        case "DELETE":
            console.log("Route Request: " + req.method.red, req.url);
            break;
        case "POST":
            console.log("Route Request: " + req.method.blue, req.url);
            break;
    }
    next();
});


// Validating Login Credentials
var auth = function(req, res, next) {

    //Check For Login User
    var login = basicAuth(req);
    login.name.toLowerCase();

    if (login && login.name !== '') {

        dbConfig.setPrefix(req.query.prefix);
        var dbconfig = dbConfig.getConfig();

        StudentsModel.getByName(login.name, function(err, fetchedStudent) {

            if (err){
              console.log('Student not found!');
                return res.status(401).json({
                    status: 'nok',
                    result: 'Aluno não encontrado!'
                });
              }

            if (fetchedStudent) {

                if (fetchedStudent.password == login.pass) {
                    req.user = {
                        name: login.name,
                        studentID: fetchedStudent._id,
                        dbword: req.query.prefix
                    };
                    next();
                } else {
                    console.log('Student: '+login.name+'  incorrect login data!');
                    return res.status(401).json({
                        status: 'nok',
                        result: 'Dados incorrectos!'
                    });
                }
            }else{
              console.log('Student: '+login.name+'  not found!');
              return res.status(401).json({
                  status: 'nok',
                  result: 'Aluno inexistente!'
              });
            }
        });
    } else {
        //Report Error (No Auth Credentials)
        console.log('Student: '+login.name+'  Login data Missing!');
        return res.status(401).json({
            status: 'nok',
            result: 'Volte a inserir os dados de Autenticação!'
        });
    }

};

// Make App use router
app.use('/', router);

//login info
app.route('/login')
    .get(auth, students.get);

//get all student related information, tests, questions, categores
app.route('/student')
    .get(auth, students.getAllAboutMe);

app.route('/student/saveAllTestsAllResolutionsByStudent')
    .post(auth, students.saveAllTestsAllResolutionsByStudent);

app.route('/test')
    .post(auth, tests.saveTestWithResolutions);

var server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log('Listening on %d'.green, app.get('port'));
});
