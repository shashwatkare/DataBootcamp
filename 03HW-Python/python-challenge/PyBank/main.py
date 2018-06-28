import csv
import pandas as pd

input_fili = '~/Downloads/UCBER201805DATA2-Class-Repository-DATA/02-Homework/03-Python/Solutions/PyBank/Resources/budget_data.csv'
output_fili = 'analysis.txt'
df = pd.read_csv(input_fili)

total_num_month = len(df)
net_amount_profit = df['Profit/Losses'].sum()
df['Profit Change'] = df['Profit/Losses'].diff()
avg_change_profit = df['Profit Change'].mean()
max_profit_date = df.loc[df['Profit Change'].idxmax(), 'Date']
max_profit_amount = df.loc[df['Profit Change'].idxmax(), 'Profit Change']
min_profit_date = df.loc[df['Profit Change'].idxmin(), 'Date']
min_profit_amount = df.loc[df['Profit Change'].idxmin(), 'Profit Change']

outputstring = 'Financial Analysis\n' + \
               '=============================\n' + \
               'Total Months: ' + str(total_num_month) + '\n' + \
               'Total: {:d}'.format(net_amount_profit) + '\n' + \
               'Average Change: {:.2f}'.format(avg_change_profit) + '\n' + \
               'Greatest Increase in Profits: ' + str(max_profit_date) + ' ($ {:.0f}'.format(max_profit_amount) + ')\n' + \
               'Greatest Decrease in Profits: ' + str(min_profit_date) + ' ($ {:.0f}'.format(min_profit_amount) + ')\n'

print (outputstring)

with open(output_fili, 'w') as txt_file:
  txt_file.write (outputstring)
