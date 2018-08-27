import datetime as dt
import numpy as np
import pandas as pd

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from sqlalchemy.sql import label

from flask import Flask, jsonify

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///hawaii.sqlite")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
Measurement = Base.classes.measurement
Station = Base.classes.station

# Create our session (link) from Python to the DB
session = Session(engine)


#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/precipitation<br/>"
        f"/api/v1.0/stations<br/>"
        f"/api/v1.0/start<br/>"
        f"/api/v1.0/end"
    )

@app.route("/api/v1.0/precipitation")
def precipitaiton():
    """
    Return the dates and temperature observations from the last year
    Convert the query results to a Dictionary using `date` as the key and `tobs` as the value.
    Return the JSON representation of your dictionary.
    """
    lastday_string = max(session.query(Measurement.date).all())[0]
    lastday = dt.datetime.strptime(lastday_string, '%Y-%m-%d')
    one_year_before = lastday - dt.timedelta(days=365)

    results = session.query(Measurement.date, func.avg(Measurement.prcp))\
            .filter(Measurement.date > one_year_before)\
            .group_by(Measurement.date)\
            .all()
    return jsonify(dict(results))

@app.route("/api/v1.0/station")
def station():
    """
    Return a JSON list of stations from the dataset.
    """
    results = session.query(Measurement.station, Station.name).distinct()\
                .filter(Measurement.station == Station.station)\
                .all()
    return jsonify(dict(results))

@app.route("/api/v1.0/tobs")
def tobs():
    """
    Return a JSON list of Temperature Observations (tobs) for the previous year
    """
    lastday_string = max(session.query(Measurement.date).all())[0]
    lastday = dt.datetime.strptime(lastday_string, '%Y-%m-%d')
    one_year_before = lastday - dt.timedelta(days=365)

    results = session.query(Measurement.date, func.avg(Measurement.tobs))\
            .filter(Measurement.date > one_year_before)\
            .group_by(Measurement.date)\
            .all()

    return jsonify(dict(results))


@app.route("/api/v1.0/<start>", defaults={'end': None})
@app.route("/api/v1.0/<start>/<end>")
def period(start,end):
    startdate = dt.datetime.strptime(start, '%Y-%m-%d')
    if not end:
        enddate = dt.datetime.now()
    else:
        enddate = dt.datetime.strptime(end, '%Y-%m-%d')
    
    results = session.query(label('TMIN', func.min(Measurement.tobs)),\
                            label('TMAX', func.max(Measurement.tobs)),\
                            label('TAVG', func.avg(Measurement.tobs)))\
                    .filter(Measurement.date >= startdate)\
                    .filter(Measurement.date <= enddate)\
                    .all()
    Max_temp = results[0].TMAX
    Min_temp = results[0].TMIN
    Avg_temp = results[0].TAVG

    return jsonify({'StartDate': startdate.strftime('%Y-%m-%d'), \
                    'EndDate': enddate.strftime('%Y-%m-%d'),\
                    'Max_temp': Max_temp, 'Min_temp':Min_temp, 'Avg_temp':Avg_temp,})

if __name__ == '__main__':
    app.run(debug=True)
