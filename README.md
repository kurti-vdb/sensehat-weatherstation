# Raspberry Pi Sensehat weatherstation

A Raspberry Pi Weather Station using the Sense HAT that stores all captured data in a local SQLite DB. You will need a sense HAT and a few other bits of equipment to be able to get this to work.

### Things needed:

 - Raspberry Pi 2 or 3
 - Micro SD Card or a SD card if you’re using an old version of the Pi.
 - Power Supply
 - Sense HAT
 - Ethernet Cable or WiFi Dongle (The Pi 3 has WiFi inbuilt)
 
## Getting started with the Sense HAT. The Python part

 1. Make sure the Pi has the latest updates and software. 
    ```
    sudo apt-get update
    sudo apt-get upgrade
    ```
 2. Install the Sense Hat software package, which provides all the libraries to interact with the Sense Hat.
    ```
    sudo apt-get install sense-hat
    sudo reboot
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
        temp_calibrated = temp - ((cpu_temp - temp)/5.466)

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
    sudo python3 weatherstation.py
    ```
## The Node.js part

1. Add a controller
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
