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