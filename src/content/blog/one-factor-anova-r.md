---
slug: "one-factor-anova-r"
title: "Creating One-Factor ANOVA Tables in R"
date: "2022-04-16"
description: "ANOVA tables can be very useful to have, but rather difficult to create. This blog post gives an easy tutorial on creating ANOVA tables in R without using any extra packages."
quote: "'interaction' in contingency tables enjoys only a few of the fortuitously simple properties of interactions in the analysis of variance."
quoteAuthor: "John Darroch"
category: "Statistics & Data Science"
---

### Getting started

Creating ANOVA tables can help us better understand the relationship and interactions between variables. However, creating the ANOVA table can pose some difficulties. The purpose of this blog post is to help you create one-factor ANOVA tables in R quickly, easily, and without any extra packages!

**This article assumes you already know what ANOVA tables are. I will not be going into any of the math behind ANOVA tables.**

### Motivating Examples

I want to start this off with an example from the article [“Nutrient Deprivation Improves Field Performance of Woody Seedlings in a Degraded Semi-arid Shrubland” (R. Trubata, J. Cortina, and A. Vilagrosaa, Ecological Engineering, 2011:1164–1173)](https://www.sciencedirect.com/science/article/pii/S0925857411000802). One part of this article looks at the effect of three different types of fertilizers on the height of a specific Mediterranean tree species. One experiment the group conducts takes three samples of 10 different trees, with each sample being grown with a different fertilizer. One group—the control group—was grown with a standard fertilizer, a second group was grown with a fertilizer that contained half the nutrients of the standard fertilizer, and the third group was grown using a commercial slow-release fertilizer. After one year, the heights of the trees were measured and are listed in the following table.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/creating_anova/tree_height_picture.png" alt="Tree height data table." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">Data table courtesy of <a href="https://www.mheducation.com/highered/product/statistics-engineers-scientists-navidi/M9781259717604.html">William Navidi, “Statistics for Engineers and Scientists,” 5th edition (page 688–9)</a>.</figcaption>
</figure>

This leads us to our research question: does fertilizer type affect the height of these Mediterranean trees?

One statistical tool we can use to analyze the data and figure out the answer to our research question is called **An**alysis **o**f **Va**riance (ANOVA). The idea being to use an ANOVA test is to compare the variance in means of level (fertilizer type), to the variance that occurs by change (variance of errors). Now, you can compute this ANOVA table by hand, but it is long, tedious, and simply unnessary. Instead, we can use R!

### Calculating ANOVA Tables in R

Everything I am doing in the following steps can be done in the terminal of R.

1.  The first thing we need to do is read in our data.

:::code-tabs
```R
Control <- c(17.9, 12.2, 14.9, 13.8, 26.1, 15.4, 20.3, 16.9, 20.8, 14.8)
Deficient <- c(7.0, 6.9, 13.3, 11.1, 11.0, 16.5, 12.7, 12.4, 17.1, 9.0)
Slow_release <- c(19.8, 20.3, 16.1, 17.9, 12.4, 12.5, 17.4, 19.9, 27.3, 14.4)
```
:::

2.  Next, we want to put these variables into a dataframe

:::code-tabs
```R
height_dataset <- data.frame(Control, Deficient, Slow_release)
```
:::

This will give us a nice data frame that looks like this:

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/creating_anova/height_dataset.png" alt="Height dataset dataframe." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
</figure>

3.  To help prepare the data for the ANOVA table, we will want to stack the data together using the `stack()` function

:::code-tabs
```R
stack_height_dataset <- stack(height_dataset)
```
:::

When we stack our dataset together, we see that our data frame turns into a two column frame where the first column has the heights, and the second column as the three types of fertilizer. But, the column headers do not fully represent this.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/creating_anova/stack_height_dataset.png" alt="Stacked height dataset." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">This data frame has 30 rows, but these 21 should help you get the idea.</figcaption>
</figure>

4.  To make things easier for later, rename the column headers to accurately represent what the columns are showing.

:::code-tabs
```R
names(stack_height_dataset) <- c("Height", "Method")
```
:::

If we look at our data frame again, we will see that the column headers are renamed and accurately represent what we are looking at.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/creating_anova/stack_height_dataset_renamed.png" alt="Renamed stacked dataset." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">We see that the column headers are renamed.</figcaption>
</figure>

5.  With our renamed column headers, we will now want to turn our data frame into a linear model using the `lm()` function in R.

:::code-tabs
```R
height_fit <- lm(Height~Method, data=stack_height_dataset)
```
:::

If you look at our newly created height_fit linear model, we see a few weird things. Do not worry too much about this. This is all information that our next step requires.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/creating_anova/height_fit.png" alt="Linear model fit." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">There is a lot of information here, but do not worry about it if you are new! It is not super important for you to understand right now.</figcaption>
</figure>

6.  Final step! All of our data preparation has brought us up to this point! All we need to do is pass our `height_fit` linear model into the `anova()` function that R provides.

:::code-tabs
```R
anova(height_fit)
```
:::

When you run this function, R will automatically output the ANOVA table will all the information we need!

:::code-tabs
```R
Analysis of Variance Table

Response: Height
        Df Sum Sq Mean Sq F value  Pr(>F)   
Method     2 229.74 114.870  7.0587 0.00342 **
Residuals 27 439.39  16.274                   
---
Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1
```
:::

### Conclusion

That is it! If you recall our original research question, we wanted to know if fertilizer type impacts the height of these trees. If you recall from your statistics class, we compare the p-value with our significance value, $\alpha$. In this case, we used a significance $\alpha$ = 0.05 (which is pretty standard). Looking at our ANOVA table, we see that our p-value = 0.00342. Comparing our p-value and our significance level, we see that p-value = 0.00342 < 0.05 = $\alpha$, so we reject the null hypothesis and conclude that the fertilizer does have an impact on the height of these Mediterranean trees!

(If you are interested in finding the critical value of our experiment to compare with the F-value found on our ANOVA table, use the R function `qf()`. All you need is a significance level (1-$\alpha$), df1, and df2 where df1 is the degrees of freedom of the Method, and df2 is the degrees of freedom of the Residuals (simply look at the Df column of our ANOVA table).)

And that is it! Creating One-Factor ANOVA tables in R is super easy! Make sure to check out the original study that inspired our motivating example, and the textbook that helped provide the data table for our experiment!

### Example Fully Worked Out

Here is a picture of the full code in an R console.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/creating_anova/full_example_terminal.png" alt="Full example in R console." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">Here is a picture of the full code in an R console.</figcaption>
</figure>

Here is a code block of the full code in an R console.

:::code-tabs
```R
> Control <- c(17.9, 12.2, 14.9, 13.8, 26.1, 15.4, 20.3, 16.9, 20.8, 14.8)
> Deficient <- c(7.0, 6.9, 13.3, 11.1, 11.0, 16.5, 12.7, 12.4, 17.1, 9.0)
> Slow_release <- c(19.8, 20.3, 16.1, 17.9, 12.4, 12.5, 17.4, 19.9, 27.3, 14.4)
> 
> height_dataset <- data.frame(Control, Deficient, Slow_release)
> View(height_dataset)
> stack_height_dataset <- stack(height_dataset)
> 
> names(stack_height_dataset) <- c("Height", "Method")
>
> height_fit <- lm(Height~Method, data=stack_height_dataset)
>
> anova(height_fit)
Analysis of Variance Table
Response: Height
        Df Sum Sq Mean Sq F value  Pr(>F)   
Method     2 229.74 114.870  7.0587 0.00342 **
Residuals 27 439.39  16.274                   
---
Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1
```
:::
