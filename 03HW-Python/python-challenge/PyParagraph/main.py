import pandas as pd
import csv

input_fili = './raw_data/test.txt'
data = open(input_fili,'r').read()
word = data.replace(',','').replace('!','').replace('.','').replace(':','').lower()
print (word.split())
wordcount = len(word.split())
print (wordcount)
