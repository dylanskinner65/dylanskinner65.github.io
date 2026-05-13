---
slug: "pandas-the-basics"
title: "Pandas: The Basics"
date: "2023-04-28"
description: "A basic tutorial on the Python package Pandas. Includes information about Pandas data structures, reading in data, and manipulating data."
quote: "No data is clean, but most is useful."
quoteAuthor: "Dean Abbott"
category: "Statistics & Data Science"
---

### Introduction

While preparing for my summer internship, I decided to learn more about the Python package [Pandas](https://pandas.pydata.org). Pandas is a very powerful tool for data analysis and manipulation. It is built on top of NumPy, and is one of the most popular Python packages for data science. I have used Pandas in the past, but I wanted to learn more about it and get a better understanding of how it works. This post will cover the basics of Pandas, including data structures, reading in data, and manipulating data.

### Pandas Data Structures

Pandas has two main data structures: Series and DataFrames. A Series is a one-dimensional array of indexed data (very similar to a NumPy ndarray). A DataFrame is a two-dimensional array of indexed data. A DataFrame is essentially a collection of Series objects. The index of a Series or DataFrame is a set of labels that allow you to access the data. The index can be a list of integers, strings, or dates. The data in a Series or DataFrame can be any NumPy data type. The following code shows how to create a Series and a DataFrame.

:::code-tabs
```python
# Import the pandas package
import pandas as pd

# Create a Series of flowers with their heights and colors
heights = pd.Series([3, 2, 4, 1], index=['sunflower', 'rose', 'tulip', 'daisy'])

colors = pd.Series(['yellow', 'red', 'pink', 'white'], index=['sunflower', 'rose', 'tulip', 'daisy'])

# Create a DataFrame of flowers with their heights and colors
flowers = pd.DataFrame({'height': heights, 'color': colors})
```
:::

As you can see, we create a Series by doing `pd.Series()`. We pass in a list of data and a list of index labels. One thing to note is that the argument `index` is optional. You can omit that and get the same results. One we have our Series, we can now create our DataFrame. We can do this by passing in a dictionary of Series objects. The keys of the dictionary are the column names, and the values are the Series. We can also create a DataFrame by passing in a list of lists. The first list is the column names, and the rest of the lists are the rows of data.

If we were to print out our Series and DataFrame, we would get the following:

:::code-tabs
```python
print(heights)
>>> sunflower    3
>>> rose         2
>>> tulip        4
>>> daisy        1
>>> dtype: int64

print(colors)
>>> sunflower    yellow
>>> rose            red
>>> tulip          pink
>>> daisy         white
>>> dtype: object

print(flowers)
>>>              height   color
>>> sunflower       3     yellow
>>> rose            2     red
>>> tulip           4     pink
>>> daisy           1     white
```
:::

From this we can see that `pd.DataFrame` lines up our information nicely. If one element of our Series is not present in the other Series, Pandas will fill that value with `NaN`.

Once you have all your information in a DataFrame, if you want to get the information as a NumPy array, you can simply call `flowers.values`. This will return a two-dimensional array of the data. If you want to get the index labels, you can call `flowers.index`. This will return a list of the index labels. If you want to get the column names, you can call `flowers.columns`. This will return a list of the column names, as seen below.

:::code-tabs
```python
print(flowers.values)
>>>[[3 'yellow']
>>> [2 'red']
>>> [4 'pink']
>>> [1 'white']]

print(flowers.index)
>>> Index(['sunflower', 'rose', 'tulip', 'daisy'], dtype='object')

print(flowers.columns)
>>> Index(['height', 'color'], dtype='object')
```
:::

### Reading in Data

One very nice thing about Pandas is that it has functions that make reading in data very easy. Pandas can read in data from CSV files, Excel files, HTML tables, JSON files, SQL databases, and more. For this post, we will focus on reading in CSV files. To read in a CSV file, we can use the `pd.read_csv()` function. This function has many arguments, but the only required argument is the file path. Another potentially helpful argument is `index_col`. This argument allows you to specify which column you want to use as the index. If you do not specify this argument, Pandas will create a new index for you.

Say you have the following CSV file called `nhl_teams.csv`:

| Team | Stadium Name | Stanley Cups Won |
| :--- | :--- | :--- |
| Dallas Stars | American Airlines Center | 1 |
| New Jersey Devils | Prudential Center | 3 |
| Arizona Coyotes | Gila River Arena | 0 |
| Carolina Hurricanes | PNC Arena | 1 |
| Seattle Kraken | Climate Pledge Arena | 0 |

You could read the data in without the index tag:

:::code-tabs
```python
# Read in nhl_teams.csv (without index_col)
nhl_teams = pd.read_csv('nhl_teams.csv')

# Print nhl_teams
print(nhl_teams)
>>>             Team	        Stadium	               Stanley Cups
>>> 0	Dallas Stars	     American Airlines Center	  1
>>> 1	New Jersey Devils    Prudential Center	          3
>>> 2	Arizona Coyotes	     Gila River Arena	          0
>>> 3	Carolina Hurricanes  PNC Arena	                  1
>>> 4	Seattle Kraken	     Climate Pledge Arena	  0
```
:::

But, if you read it in with the index tag set to `Team`, you would get the following:

:::code-tabs
```python
# Read in nhl_teams.csv (with index_col)
nhl_teams = pd.read_csv('nhl_teams.csv', index_col='Team')

# Print nhl_teams
print(nhl_teams)
>>>                                 Stadium             Stanley Cups
>>>     Team                                                       
>>> Dallas Stars         American Airlines Center             1
>>> New Jersey Devils           Prudential Center             3
>>> Arizona Coyotes              Gila River Arena             0
>>> Carolina Hurricanes                 PNC Arena             1
>>> Seattle Kraken           Climate Pledge Arena             0
```
:::

Our data frame now only has Stadium and Stanley Cups as columns, while the team names are the indices. This is a much more useful way to organize the data as we will see in the next section.

### Manipulating Data

Now that we have our data in a DataFrame, we can manipulate it in many different ways. We can add columns, remove columns, add rows, remove rows, and more. We can also perform calculations on the data.

Generally, we want to access the data in our Series or DataFrame through the methods `loc` and `iloc`. `loc` is used to access data by label, while `iloc` is used to access data by integer position. For example, if we wanted to access the data for the Dallas Stars, we could use either `loc` or `iloc`:

:::code-tabs
```python
# Accessing information about the Dallas Stars using loc
print(nhl_teams.loc['Dallas Stars'])
>>> Stadium         American Airlines Center
>>> Stanley Cups                           1
>>> Name: Dallas Stars, dtype: object

# Accessing information about the Dallas Stars using iloc
print(nhl_teams.iloc[0])
>>> Stadium         American Airlines Center
>>> Stanley Cups                           1
>>> Name: Dallas Stars, dtype: object
```
:::

The information presented using both methods is the same. The only difference is that `loc` uses the label `Dallas Stars` to access the data, while `iloc` uses the integer position `0` to access the data.

You can also look up multiple rows at once using `loc` and `iloc`. For example, if we wanted to look up the data for the Dallas Stars and the New Jersey Devils, we could use either `loc` or `iloc`:

:::code-tabs
```python
# Accessing information about the Dallas Stars and New Jersey Devils using loc
print(nhl_teams.loc[['Dallas Stars', 'New Jersey Devils']])
>>>                                Stadium       Stanley Cups
>>> Team                                                     
>>> Dallas Stars       American Airlines Center             1
>>> New Jersey Devils         Prudential Center             3                           

# Accessing information about the Dallas Stars and New Jersey Devils using iloc
print(nhl_teams.iloc[[0, 1]])
>>>                                 Stadium      Stanley Cups
>>> Team                                                     
>>> Dallas Stars       American Airlines Center             1
>>> New Jersey Devils         Prudential Center             3
```
:::

Note the double brackets `[[]]` in this segment. But, similar to the previous code block, the results are the same.

If you want to look up a specific column, insidee the brackets, you can add the name of the column you want to look up. For example, if we wanted to look up the stadium for the Dallas Stars, we could use either `loc` or `iloc`:

:::code-tabs
```python
# Accessing the stadium for the Dallas Stars using loc
print(nhl_teams.loc['Dallas Stars', 'Stadium'])
>>> American Airlines Center

# Accessing the stadium for the Dallas Stars using iloc
print(nhl_teams.iloc[0, 0])
>>> American Airlines Center
```
:::

Now let's say you have a new column, Current Wins, you want to add to the DataFrame. With Pandas, this is super easy!

:::code-tabs
```python
# Add a new column to the DataFrame
nhl_teams['Current Wins'] = [1, 2, 3, 4, 5]

# Print the DataFrame to see the new column
print(nhl_teams)
>>>                                 Stadium     Stanley Cups  Current Wins
>>> Team                                                                     
>>> Dallas Stars        American Airlines Center           1         1
>>> New Jersey Devils          Prudential Center           3         2
>>> Arizona Coyotes             Gila River Arena           0         3
>>> Carolina Hurricanes                PNC Arena           1         4
>>> Seattle Kraken          Climate Pledge Arena           0         5
```
:::

Since Pandas is build on top of NumPy and utilized NumPy arrays, we can also perform calculations on the data in a way similar to NumPy. For example, if we wanted to add the number of Stanley Cups and Current wins together and triple the number of Stanley Cups for each team, we could do:

:::code-tabs
```python
# Add the number of Stanley Cups and Current Wins together
nhl_teams['Stanley Cups'] + nhl_teams['Current Wins']
>>> Team
>>> Dallas Stars           2
>>> New Jersey Devils      5
>>> Arizona Coyotes        3
>>> Carolina Hurricanes    5
>>> Seattle Kraken         5
>>> dtype: int64

# Triple the number of Stanely Cups
nhl_teams['Stanley Cups'] * 3
>>> Team
>>> Dallas Stars           3
>>> New Jersey Devils      9
>>> Arizona Coyotes        0
>>> Carolina Hurricanes    3
>>> Seattle Kraken         0
>>> Name: Stanley Cups, dtype: int64
```
:::

There are many more ways to manipulate the data in a DataFrame. Most other methods are very similar to NumPy arrays. For example you can use `abs()` to get the absolute value, `sum()` to get the sum of the data, `mean()` to get the mean of the data. Two particularly useful methods are `idxmax()` and `idxmin()`. These methods return the index of the maximum and minimum values in the data.

In addition to these methods, there is also `describe()` which gives basic summary statistics about the data in the DataFrame. In our example we have:

:::code-tabs
```python
# Print the summary statistics for the DataFrame
print(nhl_teams.describe())
>>>        Stanley Cups  Current Wins
>>> count      5.000000      5.000000
>>> mean       1.000000      3.000000
>>> std        1.224745      1.581139
>>> min        0.000000      1.000000
>>> 25%        0.000000      2.000000
>>> 50%        1.000000      3.000000
>>> 75%        1.000000      4.000000
>>> max        3.000000      5.000000                    
```
:::

This information is not particularly exciting or useful in our toy example, but can be very useful when doing beginning stages data exploration.

The final piece of data manipulation I want to talk about today is masks. Masks are a way to filter the data in a DataFrame showing only the information we are looking for. For example, say we want to find the teams with one or more Stanley Cup. We can do this by masking!

:::code-tabs
```python
# Create the mask to get teams with one or more Stanley Cup.
mask = nhl_teams['Stanley Cups'] >= 1

# Apply mask to the DataFrame
print(nhl_teams[mask])
>>>                                       Stadium  Stanley Cups  Current Wins
>>> Team                                                                     
>>> Dallas Stars         American Airlines Center             1             1
>>> New Jersey Devils           Prudential Center             3             2
>>> Carolina Hurricanes                 PNC Arena             1             4
```
:::

This is good, but sometimes this can give us more information than we are looking for. Say for example we only wanted the team names and current wins of the teams that have won one or more Stanley Cup. We can do this, still with masking, quite easily. Simply take your DataFrame, apply the mask to it, then, in brackets, put the columns you want to see.

:::code-tabs
```python
# Apply mask and only get team names and current wins.
print(nhl_teams[mask]['Current Wins'])
>>> Team
>>> Dallas Stars           1
>>> New Jersey Devils      2
>>> Carolina Hurricanes    4
>>> Name: Current Wins, dtype: int64
```
:::

### Conclusion

There is WAY more to Pandas than mentioned here, but I hope this article gave you a taste of the power that Pandas has to offer! Now that you know a bit about Pandas, I invite you to read the documentation and try exploring some data for yourself!
