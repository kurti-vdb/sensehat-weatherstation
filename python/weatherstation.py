
from timer import Timer
#from sense_hat import SenseHat
from time import sleep
import os
import sqlite3
import time, datetime

#sense = SenseHat()

def persistData ():
    
    #temp = round(sense.get_temperature(),1)
    #cpu_temp = round(get_cpu_temp(), 1)
    temp_calibrated = temp - ((cpu_temp - temp)/5.466)

    #pressure = round(sense.get_pressure(), 1)
    #humidity = round(sense.get_humidity(), 1)
    date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M") 
    
    db = sqlite3.connect(r'./db/weatherstation2.db')
    cursor = db.cursor()
    #cursor.execute('INSERT INTO pidata(pressure, temperature, humidity, datum) VALUES(?,?,?,?)', (pressure, temp_calibrated, humidity, date))
    cursor.execute('INSERT INTO pidata(pressure, temperature, humidity, datum) VALUES(?,?,?,?)', (date, date, date, date))
    db.commit()
    db.close()


def get_cpu_temp():

    res = os.popen("vcgencmd measure_temp").readline()
    t = float(res.replace("temp=","").replace("'C\n",""))
    return(t)

# Persist wheater data every 15 mintues
rt = Timer(900, persistData) 