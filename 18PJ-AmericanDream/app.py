import datetime as dt
import numpy as np
import pandas as pd

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from sqlalchemy.sql import label

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
CORS(app)


#################################################
# Database Setup
#################################################
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/project_2.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
home_price = Base.classes.home_price
mortgage_30 = Base.classes.mortgage_30
oesm = Base.classes.oesm

# Use Pandas to perform the sql query
stmt = db.session.query(mortgage_30).statement
df_mortgage = pd.read_sql_query(stmt, db.session.bind)
stmt = db.session.query(home_price).statement
df_homeprice = pd.read_sql_query(stmt, db.session.bind)
stmt = db.session.query(oesm).statement
df_oesm = pd.read_sql_query(stmt, db.session.bind)

df_housemerge = df_mortgage.merge(df_homeprice, left_on="state", right_on="RegionName", how="outer")
df_housemerge = df_housemerge.drop(columns = ["RegionName"])
df_housemerge = df_housemerge[1:]
df_housemerge.replace('', np.nan, inplace=True)
df_housemerge = df_mortgage.merge(df_homeprice, left_on="state", right_on="RegionName", how="outer")
df_housemerge = df_housemerge.drop(columns = ["RegionName"])
df_housemerge = df_housemerge.iloc[1:]
df_housemerge.replace('', np.nan, inplace=True)
df_housemerge = df_housemerge.sort_values(['state'])
df_housemerge = df_housemerge.reset_index()
df_housemerge = df_housemerge.drop(columns=['index'])
df_monthly_payment = df_housemerge[['state','average_rate']].copy()
for i in np.arange(5,108,1):
    timeindex = df_housemerge.columns[i]
    monpay = []
    for index, row in df_housemerge.iterrows():
        monpay.append(-1.* np.pmt(0.01 * float(row['average_rate'].rstrip('%')) / 12., 
                        360., float(row[timeindex]) * 0.8))
    df_monthly_payment[timeindex] = monpay


#################################################
# Flask Routes
#################################################

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/state_name")
def names():
    """Return a list of state names."""
    return jsonify(sorted(list(df_homeprice['RegionName'])))

@app.route("/house_price_with_time")
def house_price_with_time():
    avghomeprice = {}
    timelist = []
    avgprice = []
    for i in np.arange(5,108,1):
        timelist.append( df_housemerge.columns[i] )
        avgprice.append( np.nanmean(np.array(df_housemerge.iloc[:,i].get_values(), dtype=float)))
    avghomeprice = {
        'time': timelist,
        'house_price': avgprice,
    }
    return jsonify(avghomeprice)

@app.route("/house_price_with_time/map/<montime>")
def house_price_with_time_map_montime(montime):
    """Return house price in each state for all time periods"""
    data = {}
    df_homeprice_sortstate = df_homeprice.sort_values(['RegionName'])
    for t in np.arange(2,105,1):
        timeindex = df_homeprice_sortstate.columns[t]
        data.setdefault(timeindex, {})
        statelist = []
        valuelist = []
        for no, i in enumerate(df_homeprice_sortstate['RegionName']):
            statelist.append(i)
            valuelist.append(df_homeprice_sortstate.iloc[no,t])
        data[timeindex] = {
            'state': statelist,
            'value': valuelist,
        }
    return jsonify(data[montime])

@app.route("/house_price_with_time/<state>")
def house_price_with_time_state(state):
    """Return a list of house price with time for a given state"""
    data = {}
    for index in range(0, len(df_homeprice)):
        stateKey = df_homeprice.iloc[index, 0]
        data.setdefault(stateKey, {})
        data[stateKey] = {
            'time': list(df_homeprice.iloc[index,2:].keys()),
            'house_price': list(df_homeprice.iloc[index,2:].get_values()),
        }
    return jsonify(data[state])

@app.route("/monthly_payment_with_time/<state>")      
def monthly_payment_with_time_state(state):
    """Return a list of monthly payment with time for a given state"""
    data = {}
    for index in range(0, len(df_monthly_payment)):
        stateKey = df_monthly_payment.iloc[index, 0]
        data.setdefault(stateKey, {})
        data[stateKey] = {
            'time': list(df_monthly_payment.iloc[index,2:].keys()),
            'monthly_payment': list(df_monthly_payment.iloc[index,2:].get_values()),
        }
    return jsonify(data[state])

@app.route("/occ_and_workhour")
def  occ_and_workhour():
    """Return data of occupation employment statistics"""
    df_oes = df_oesm[['ST','STATE','OCC_CODE','OCC_TITLE','TOT_EMP','JOBS_1000','H_MEAN','H_PCT10','H_PCT25','H_MEDIAN','H_PCT75','H_PCT90']].copy()
    df_oes = df_oes[df_oes['OCC_CODE'].str.contains("-0000")]

    July2018 = df_monthly_payment[['state','2018-07']]

    df_occ_general_July2018 = df_oes.merge(July2018, left_on="STATE", right_on="state", how="outer")
    df_occ_general_July2018 = df_occ_general_July2018.drop(columns = ['state'])
    df_occ_general_July2018.rename(columns={'2018-07':'2018-07_monthlypay'}, inplace=True)
    df_occ_general_July2018_clean = df_occ_general_July2018.apply(pd.to_numeric, errors='coerce')
    df_occ_general_July2018_clean['ST'] = df_occ_general_July2018['ST']
    df_occ_general_July2018_clean['STATE'] = df_occ_general_July2018['STATE']
    df_occ_general_July2018_clean['OCC_CODE'] = df_occ_general_July2018['OCC_CODE']
    df_occ_general_July2018_clean['OCC_TITLE'] = df_occ_general_July2018['OCC_TITLE']
    df_occ_general_July2018_clean['TOT_EMP'] = df_occ_general_July2018['TOT_EMP']
    numericOccGeneralJuly2018 = pd.to_numeric(df_occ_general_July2018_clean['2018-07_monthlypay'])
    df_occ_general_July2018_clean['mean_work_hour'] = round(numericOccGeneralJuly2018/(pd.to_numeric(df_occ_general_July2018_clean['H_MEAN'])*0.3))
    df_occ_general_July2018_clean['PCT10_work_hour'] = round(numericOccGeneralJuly2018/(pd.to_numeric(df_occ_general_July2018_clean['H_PCT10'])*0.3))
    df_occ_general_July2018_clean['PCT25_work_hour'] = round(numericOccGeneralJuly2018/(pd.to_numeric(df_occ_general_July2018_clean['H_PCT25'])*0.3))
    df_occ_general_July2018_clean['PCT50_work_hour'] = round(numericOccGeneralJuly2018/(pd.to_numeric(df_occ_general_July2018_clean['H_MEDIAN'])*0.3))
    df_occ_general_July2018_clean['PCT75_work_hour'] = round(numericOccGeneralJuly2018/(pd.to_numeric(df_occ_general_July2018_clean['H_PCT75'])*0.3))
    df_occ_general_July2018_clean['PCT90_work_hour'] = round(numericOccGeneralJuly2018/(pd.to_numeric(df_occ_general_July2018_clean['H_PCT90'])*0.3))
    df_occ_general_July2018_clean = df_occ_general_July2018_clean.where((pd.notnull(df_occ_general_July2018_clean)), None)

    output = []
    for i in range(0, len(df_occ_general_July2018_clean)):
        if df_occ_general_July2018_clean.OCC_TITLE[i][:-12] == 'All':
            continue
        else:
            output.append({
                'state': df_occ_general_July2018_clean.STATE[i],
                'occupation': df_occ_general_July2018_clean.OCC_TITLE[i][:-12],
                'total_employment': int(df_occ_general_July2018_clean.TOT_EMP[i].replace(',','')),
                'mean_work_hour': df_occ_general_July2018_clean.mean_work_hour[i],
                'PCT10_work_hour': df_occ_general_July2018_clean.PCT10_work_hour[i],
                'PCT25_work_hour': df_occ_general_July2018_clean.PCT25_work_hour[i],
                'PCT50_work_hour': df_occ_general_July2018_clean.PCT50_work_hour[i],
                'PCT75_work_hour': df_occ_general_July2018_clean.PCT75_work_hour[i],
                'PCT90_work_hour': df_occ_general_July2018_clean.PCT90_work_hour[i],
            })
    return jsonify(output)

@app.route("/monthly_payment_high_and_low_groups")
def monthly_payment_high_and_low_groups():
    df_monthlypay_range = df_mortgage[1:].copy()
    df_monthlypay_range = df_monthlypay_range.reset_index()
    
    df_monthlypay_range['2018-07_houseprice'] = df_housemerge[['2018-07'][:]]
    avg_pay = []
    for index, row in df_monthlypay_range.iterrows():
        avg_pay.append( -1.* np.pmt(0.01 * float(row['average_rate'].rstrip('%')) / 12., 
                            360., float(row['2018-07_houseprice']) * 0.8) )
    df_monthlypay_range['avg_monthlypay'] = avg_pay

    low_pay = []
    for index, row in df_monthlypay_range.iterrows():
        low_pay.append( -1.* np.pmt(0.01 * float(row['range_min'].rstrip('%')) / 12., 
                            360., float(row['2018-07_houseprice']) * 0.8) )
    df_monthlypay_range['low_monthlypay'] = low_pay

    high_pay = []
    for index, row in df_monthlypay_range.iterrows():
        high_pay.append( -1.* np.pmt(0.01 * float(row['range_max'].rstrip('%')) / 12., 
                            360., float(row['2018-07_houseprice']) * 0.8) )
    df_monthlypay_range['high_monthlypay'] = high_pay

    df_monthlypay_lowgroup = df_monthlypay_range.copy()
    df_monthlypay_highgroup = df_monthlypay_range.copy()
    df_monthlypay_lowgroup = df_monthlypay_lowgroup.sort_values(by=['avg_monthlypay'], ascending=True)
    df_monthlypay_highgroup = df_monthlypay_highgroup.sort_values(by=['avg_monthlypay'], ascending=False)
    df_monthlypay_lowgroup = df_monthlypay_lowgroup.reset_index()
    df_monthlypay_highgroup = df_monthlypay_highgroup.reset_index()

    output_boxchart = {}
    output_boxchart.setdefault('high10',[])
    output_boxchart.setdefault('low10',[])
    for i in range(0,10):
        hh = df_monthlypay_highgroup.high_monthlypay[i]
        mm = df_monthlypay_highgroup.avg_monthlypay[i]
        ll = df_monthlypay_highgroup.low_monthlypay[i]
        output_boxchart['high10'].append( {'num': i,
                                    'state': df_monthlypay_highgroup.state[i],
                                    'avgmonthlypay': mm,
                                    'highbound': hh-mm,
                                    'lowbound': mm-ll } )

        hh = df_monthlypay_lowgroup.high_monthlypay[i]
        mm = df_monthlypay_lowgroup.avg_monthlypay[i]
        ll = df_monthlypay_lowgroup.low_monthlypay[i]
        output_boxchart['low10'].append( {'num': i,
                                    'state': df_monthlypay_lowgroup.state[i],
                                    'avgmonthlypay': mm,
                                    'highbound': hh-mm,
                                    'lowbound': mm-ll } )
    return (jsonify(output_boxchart))


if __name__ == '__main__':
    app.run(debug=True)
