import pandas as pd
confirmed = pd.read_csv("greece_cases.csv")
confirmed = confirmed.fillna(0)

### merge ritsona with the rest of evoia ###
# create new variables for ritsona and evoia 
ritsona = confirmed[confirmed.county_normalized == 'ΡΙΤΣΩΝΑ']
eboia = confirmed[confirmed.county_normalized == 'ΕΥΒΟΙΑΣ'].set_index("county_normalized").reset_index()
# remove retsona and evoia from the confirmed cases
confirmed = confirmed.set_index("county_normalized")
confirmed = confirmed.drop("ΡΙΤΣΩΝΑ", axis=0)
confirmed = confirmed.drop("ΕΥΒΟΙΑΣ", axis=0)
confirmed = confirmed.reset_index()
# merge evoia and ritsona
eboia_all = pd.concat([eboia, ritsona])
strings = eboia.iloc[:,0:4].reset_index(drop=True)
numeric_sum = pd.DataFrame(eboia_all.sum(numeric_only=True)).T
evoia = pd.concat([strings, numeric_sum], axis = 1, ignore_index= True)
evoia.columns = confirmed.columns
# add evoia (which includes ritsona in the confirmed cases)
confirmed = pd.concat([confirmed, evoia],ignore_index= True, axis = 0)

# progress last ten days 
latest_values = pd.DataFrame(confirmed.iloc[:,-1])
confirmed['progress_ten_days_confirmed'] = latest_values.iloc[:,0]- confirmed.iloc[:,-10]
# save name of country, progress last 10 days and latest value
confirmed_to_save =confirmed[['county_normalized','progress_ten_days_confirmed']]
confirmed_to_save = pd.concat([confirmed_to_save, latest_values.iloc[:,0]],axis=1)
confirmed_to_save.columns = ['county','progress_ten_days_confirmed','latest_value_confirmed']



dead = pd.read_csv("greece_deaths.csv")
dead = dead.fillna(0)
latest_values_dead = pd.DataFrame(dead.iloc[:,-1])
dead['progress_ten_days_deaths'] = latest_values_dead.iloc[:,0]- dead.iloc[:,-10]
# save name of country, progress last 10 days and latest value
dead_to_save =dead[['county_normalized','progress_ten_days_deaths']]
dead_to_save = pd.concat([dead_to_save, latest_values_dead.iloc[:,0]],axis=1)
dead_to_save.columns = ['county','progress_ten_days_deaths','latest_value_deaths']

final = pd.merge(confirmed_to_save, dead_to_save, on='county')

final.to_csv("preprocessed_cases.csv", index = False)
