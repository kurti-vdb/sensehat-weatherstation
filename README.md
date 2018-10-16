# Raspberry Pi Sensehat weatherstation

A Raspberry Pi Weather Station using the Sense HAT that stores all captured data in a local SQLite DB. You will need a sense HAT and a few other bits of equipment to be able to get this to work.

### Things needed:

 - Raspberry Pi 2 or 3
 - Micro SD Card or a SD card if you’re using an old version of the Pi.
 - Power Supply
 - Sense HAT
 - Ethernet Cable or WiFi Dongle (The Pi 3 has WiFi inbuilt)
 
### Getting started with the Sense HAT:
This weatherstation consists of two parts. A python script that reads out all the data from the Sense Hat and persists it into a SQLite databse, and a Node.js part that executes the py script, and displays the retrieved data on a webpage. 

## The Python part

 1. Make sure the Pi has the latest updates and software. 
    ```
    $sudo apt-get update
    $sudo apt-get upgrade
    ```
 2. Install the Sense Hat software package, which provides all the libraries to interact with the Sense Hat.
    ```
    $sudo apt-get install sense-hat
    $sudo reboot
    ```
 3. Create the following python script and save it as weatherstation.py
     ```
    from timer import Timer
    from sense_hat import SenseHat
    from time import sleep
    import os
    import sqlite3
    import time, datetime

    sense = SenseHat()

    def persistData ():
    
        temp = round(sense.get_temperature(),1)
        cpu_temp = round(get_cpu_temp(), 1)
        temp_calibrated = temp - ((cpu_temp - temp)/5.466) # Temperature correction due to cpu heat

        pressure = round(sense.get_pressure(), 1)
        humidity = round(sense.get_humidity(), 1)
        date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M") 
    
        # This creates or opens up a DB
        db = sqlite3.connect('./db/weatherstation.db')
        cursor = db.cursor()
        cursor.execute('INSERT INTO pidata(pressure, temperature, humidity, datum) VALUES(?,?,?,?)', 
            (pressure, temp_calibrated, humidity, date))
        db.commit()
        db.close()

    
    def get_cpu_temp():
    
        res = os.popen("vcgencmd measure_temp").readline()
        t = float(res.replace("temp=","").replace("'C\n",""))
        return(t)
        
    # Persist wheater data every 15 mintues
    rt = Timer(900, persistData) 
    ```
4. Test and run your python script 
    ```
    $sudo python3 weatherstation.py
    ```

## The Node.js part


1. Add a weathercontroller.js
    ```
    module.exports = function(app, db, jsonParser){
    
        var fields = ["ID",  "pressure", "temperature", "humidity", "datum"];
  
        //  api/weatherdata
        app.get('/api/weatherdata', function(req, res){ 
            db.all("SELECT " + fields.join(", ") + " FROM pidata", function(err, rows) {
                res.json(rows); 
            });                       
        });

        //  api/weatherdata/trend/pressure  - Select last 7 days and every nth row (ID % 4 = 0), four in this case
        app.get('/api/weatherdata/trend/pressure', function(req, res){ 
            db.all("SELECT pressure, time(datum) AS datum FROM pidata WHERE datum > (SELECT DATETIME('now', 'localtime', '-7 day')) AND ID % 4 = 0", function(err, rows) {
                res.json(rows); 
            });                       
        });

        //  api/weatherdata/trend/pressure/today
        app.get('/api/weatherdata/trend/pressure/today', function(req, res){ 
            db.all("SELECT pressure, time(datum) AS datum FROM pidata WHERE  datum >= (SELECT DATETIME('now', 'localtime', '-1 day')) AND datum <=  (SELECT DATETIME('now', 'localtime'))", function(err, rows) {
                res.json(rows); 
            });                       
        });
    
        //  api/weatherdata/trend/temperature/today
        app.get('/api/weatherdata/trend/temperature/today', function(req, res){ 
            db.all("SELECT temperature, time(datum) AS datum FROM pidata WHERE  datum >= (SELECT DATETIME('now', 'localtime', '-1 day')) AND datum <=  (SELECT DATETIME('now', 'localtime'))", function(err, rows) {
                res.json(rows); 
            });                       
        });
    }
    ```
    
 2. And finally the server.js file:
     ```
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
     
3. Run your node script access the retrieved data on localhost:9999
    ``` 
    $node server.js
    ```
4. Access the retrieved data

    ```
    All data:                        localhost:9999/api/weatherdata
    Pressure for the last 7 days:    localhost:9999/api/weatherdata/trend/pressure
    Pressure today:                  localhost:9999/api/weatherdata/trend/pressure/today
    Temperature today:               localhost:9999/api/weatherdata/trend/temperature/today
    ```
