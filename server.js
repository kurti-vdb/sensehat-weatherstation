var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var path = require('path')
var dbPath = path.resolve(__dirname, 'db/weatherstation.db')
var www = path.resolve(__dirname, 'www')
var python = path.resolve(__dirname, 'python/weatherstation.py')


var sqlite3 = require('sqlite3'); //.verbose();
var db = new sqlite3.Database(dbPath);

// Add restful controller
require('./controllers/weathercontroller')(app, db, jsonParser);


// Start the weatherstation.py script
var child_process = require('child_process');

child_process.exec('python3 ' + python, function (err){
    if (err) {
        console.log("child processes failed with error code: " + err.code);
    }
});


// Serve static files
app.use(express.static(www))
app.listen(9999);


