import csv
import pandas as pd

input_fili = '~/Downloads/UCBER201805DATA2-Class-Repository-DATA/02-Homework/03-Python/Solutions/PyPoll/Resources/election_data.csv'
output_fili = 'analysis.txt'

df = pd.read_csv(input_fili)
total_num_votes = len(df)
candidate_list = df['Candidate'].value_counts().index.tolist()
candidate_won_vote_list = df['Candidate'].value_counts().values.tolist()
winner_candidate = (df['Candidate'].value_counts().idxmax())


output = 'Election Results\n' + \
         '---------------------------\n' + \
         'Total Votes: ' + str(total_num_votes) + '\n' + \
         '---------------------------\n' 

for can_i, can_name in enumerate(candidate_list):
    vote_percentage = 100. * float(candidate_won_vote_list[can_i]) / float(total_num_votes) 
    output += can_name + ': {:.3f}'.format(vote_percentage) + '% (' + str(candidate_won_vote_list[can_i])  + ')\n'

output+= '---------------------------\n' + \
         'Winner: ' + winner_candidate + '\n' + \
         '---------------------------' 

print (output)

with open(output_fili,'w') as txt_file:
    txt_file.write (output)
