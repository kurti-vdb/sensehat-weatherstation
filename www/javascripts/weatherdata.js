var ajaxForm = new ajaxProxy("/api/weatherdata");
var pressureTrend = new ajaxProxy("/api/weatherdata/trend/pressure");                      
var temperatureTrendToday = new ajaxProxy("/api/weatherdata/trend/temperature/today");


document.addEventListener("DOMContentLoaded", function(event) {
    ajaxForm.PopulateTable (jsonToTable, handleError);
    pressureTrend.PopulateTable (pressureChart, handleError);  
    temperatureTrendToday.PopulateTable (temperatureChart, handleError);
});      

function handleError (data) {
    $("#ajax-error-box").modal('show');
    $("#ajax-error").text("Errorcode:" + data.status + ", Message:" + data.statusText);  
    console.log(data);                           
}

function jsonToTable (data) {
    
    // Clear table
    $('#weatherData tr').slice(1).remove();

    var tbody = $('#weatherData').children('tbody');                            
    var table = tbody.length ? tbody : $('#weatherData');

    var tableString = "";

    for(var i in data) {
        var item = data[i];
        
        tableString += "<tr><td>" + data[i].datum
                    + "</td><td>" + item.pressure + " hPA" 
                    + "</td><td>" + item.humidity  + "%"
                    + "</td><td>" + item.temperature  + " °C"                               
                    + "</td></tr>";                            
    }

    table.append(tableString);
}    


// Form event handlers
$('#refresh').click(function(){
    $("#ajax-error-box").hide();
    ajaxForm.PopulateTable (jsonToTable, handleError);                          
});  


function pressureChart (weatherData) {
    
    var dateData = weatherData.map(i => i.datum);
    var pressureData = weatherData.map(i => i.pressure);

    var options = {
        scales: {
            yAxes: [{
                ticks: {
                    min: 960,
                    max: 1050,
                    steps: 0.1
                }
            }]
        }
    };

    var data = {
        labels:dateData,
        datasets: [
          {
            label: "Pressure data",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: pressureData
          }
        ]  
    };

    var ctx = document.getElementById("pressureChart").getContext("2d");

    new Chart(ctx , {
        type: "line",
        data: data,
        options: options 
    }); 
}


function temperatureChart (weatherData) {
    
    var dateData = weatherData.map(i => i.datum);
    var temperatureData = weatherData.map(i => i.temperature);

    var data = {
        labels:dateData,
        datasets: [
          {
            label: "Temperature data",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: temperatureData
          }
        ] 
    };

    options = {
        scales: {
            yAxes: [{
                ticks: {
                    suggestedMin: -10,
                    suggestedMax: 50
                }
            }]
        }
    };

    var ctx = document.getElementById("temperatureChart").getContext("2d");
    new Chart(ctx , {
        type: "line",
        data: data,
        options: options 
    }); 
}

