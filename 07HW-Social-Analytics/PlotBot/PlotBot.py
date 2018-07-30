## ===== Dependencies =====
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import json
import tweepy
import datetime
import sys
from pprint import pprint

## ===== API key =====
from config import consumer_key, consumer_secret, access_token, access_token_secret

## ===== VADER =====
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
analyzer = SentimentIntensityAnalyzer()
def print_sentiment_scores(sentence):
    snt = analyzer.polarity_scores(sentence)
    return snt

## ===== Function for PlotBot Analysis ====
def PlotBotAnalysis():

  ## ----- Tweeter API -----
  auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
  auth.set_access_token(access_token, access_token_secret)
  api = tweepy.API(auth, parser=tweepy.parsers.JSONParser())

  ## ----- -----
  info = api.search("@plotbot5 Analyze:")
  recent_command = info["statuses"][0]["text"]
  recent_requesting_user = info["statuses"][0]["user"]["screen_name"]
  recent_command_target_account = recent_command.split(" ")[-1]
  print ("Target account is: " + recent_command_target_account + "\n" +\
         "Requesting user is: " + recent_requesting_user)

  ## ----- check repeatness -----
  self_timeline = api.user_timeline()
  repeat = False
  for tweet in self_timeline:
    print (tweet["text"])
    if recent_command_target_account in tweet["text"]:
      repeat = True
      print ("The target account " + recent_command_target_account + " is repeat.")
    else:
      print ("Oh ya! The target account "  + recent_command_target_account + " is NOT repeat.") 
      continue 

  ## ----- sentimental analysis -----
  if not (repeat):
    ## --- Save info in dictionary ---
    tweet_info = { \
        "tweet_count": [],
        "tweet_username": [], 
        "tweet_date": [],
        "tweet_content": [],
        "tweet_compound_score": [],
        "tweet_neg_score": [],
        "tweet_pos_score": [],
        "tweet_neu_score": []
    }
    count = 1
    for x in range(int(500/20)):  # one page contains 20 tweets
      tweets = api.user_timeline(recent_command_target_account, page=x)
      for tweet in tweets:
        tweet_info['tweet_count'].append(count)
        tweet_info['tweet_username'].append(tweet["user"]["name"])
        tweet_info['tweet_date'].append(tweet["created_at"])
        tweet_info['tweet_content'].append(tweet["text"])
        tweet_info['tweet_compound_score'].append(analyzer.polarity_scores(tweet["text"])["compound"])
        tweet_info['tweet_neg_score'].append(analyzer.polarity_scores(tweet["text"])["neg"])
        tweet_info['tweet_pos_score'].append(analyzer.polarity_scores(tweet["text"])["pos"])
        tweet_info['tweet_neu_score'].append(analyzer.polarity_scores(tweet["text"])["neu"]) 
        count += 1
    ## --- Transfer form to dataframe ---
    tweet_info_df = pd.DataFrame(tweet_info)

    ## --- Create plot ---
    font = {'family':'DejaVu Sans','weight':'bold','size':18}
    matplotlib.rc('font',**font)
    plt.figure(figsize=(10,8))
    plt.scatter(np.arange(-500,0), tweet_info_df['tweet_compound_score'], label=recent_command_target_account)
    plt.xlabel('Tweets Ago') 
    plt.ylabel('Tweet Polarity')
    plt.legend()
    plt.grid()
    filename = "./Figures/"+recent_command_target_account+"_analysis.png"
    plt.savefig(filename)

  ## ----- push to self tweet timeline ----- 
  if not (repeat):
    api.update_with_media(filename, "Tweet sentimental analysis: " + recent_command_target_account + \
                                    " (requested by " + recent_requesting_user + ")")   
    
while (True):
  PlotBotAnalysis()
  time.sleep(300)  # 5min
