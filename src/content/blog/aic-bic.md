---
slug: "aic-bic"
title: "Akaike and Bayesian Information Criterion"
date: "2023-12-27"
description: "Akaike information criterion (AIC) and Bayesian information criterion (BIC) are powerful tools for model selection and comparison in machine learning. In this article we will see what AIC and BIC are and how to use them."
quote: "All models are wrong, but some are useful."
quoteAuthor: "George Box"
category: "Math & ML"
---

One of the key problems in machine learning is knowing which model to use. Akaike information criterion (AIC), and Bayesian information criterion (BIC) are powerful tools used to perform model selection that can help us determine which model is best for our data. In this article we will see what AIC and BIC are and how to use them.

### Important Background Information

Before diving into what AIC is, we must establish some foundational knowledge and terminology.

First, consider a collection of models, given by

$$
\mathscr{M}_j = \{f_j(z | \boldsymbol{\theta})|\boldsymbol{\theta}\in \Theta_j \}
$$

In this, we have that each model is parameterized by some set of distributions, $\boldsymbol{\theta}$. Let $\widehat{\boldsymbol{\theta}}$ be the maximum likelihood estimator for $\boldsymbol{\theta}$ in model $j$.

It is important to note that the true distribution $f(z)$ for the data not might be in $\mathscr{M}_j$. In this case, we want to identify the model that is closest to the true distribution. If other model selection criteria do not apply (such as train-test split or cross validation), then we can use AIC and BIC to help us determine which model is best.

### Akaike Information Criterion

The main idea behind AIC is that we want to choose the MLE $\widehat{\boldsymbol{\theta}}$ for model $M_j$ that minimizes the relative entropy (KL-divergence) between our selected distribution, and the true distribution $f(z)$.

So, given some estimate $\widehat{\boldsymbol{\theta}_j}$ with $\widehat{f_j}(z) = f(z|\widehat{\boldsymbol{\theta}_j})$, we want to minimize

$$
\mathscr{D}_{\text{KL}}(f||\widehat{f}_j) = \int f(z)\log(f(z))dz - \int f(z)\log(\widehat{f}_j(z))dz
$$

Note, the first integral is completely independent of $j$ and $\widehat{\boldsymbol{\theta}_j}$. This means that in order to effectively minimize the relative entropy with respect to $j$, we need to minimize the second integral, given by

$$
\widehat{K}_j = - \int f(z)\log(\widehat{f}_j(z))dz
$$

Given this integral is intractable (and considering $f(z)$ is probably not known), we can instead use the following approximation:

$$
\widehat{K}_j \approx -\frac{1}{n}\sum_{i=1}^n\log(\widehat{f}_j(z_i))
$$

Nice as this may seem, it is important to note that this estimator is biased. This is because the data $z_1, \dots, z_n$ is used to estimate $\widehat{\boldsymbol{\theta}_j}$, which is then used to estimate $\widehat{K}_j$. But, Akaike found and [proved](https://ieeexplore.ieee.org/document/1100705) that the bias of this estimator is approximately $-\frac{k_j}{n}$, where $k_j$ is the dimension of the parameter space $\Theta_j$.

So, we now have that the approximation for the unbiased estimator for $\widehat{K}_j$ is given by

$$
\widehat{K}_j \approx \frac{k_j}{n}-\frac{1}{n}\sum_{i=1}^n\log(\widehat{f}_j(z_i))
$$

If we multiply by $2n$, this give us the AIC.

It is important to note that that the AIC is typically given by

$$
\text{AIC}(j) = 2k_j - 2\ell_j(\widehat{\boldsymbol{\theta}}_j)
$$

where $\ell_j(\widehat{\boldsymbol{\theta}}_j) = \sum_{i=1}^{n}\log(f_j(z_i|\widehat{\boldsymbol{\theta}}))$ is the MLE, and $k_j = \text{dim}(\Theta_j)$ is the dimension of the parameter space. Also, it is important to know that the $2$ is present for historical reasons. Since we are minimizing the AIC, and constant really doesn't matter.

### Bayesian Information Criterion

Next we talk about Bayesian Information Criterion (BIC). BIC is simply an alternative to the AIC and is similar in many ways. The key difference between AIC and BIC, however, is that in BIC, instead of minimizing the relative entropy between the true distribution and the selected distribution, we instead maximize the posterior probability of a selected model. Thus, we define the BIC to be

$$
\text{BIC}(j) = k_j \log(n) - 2\ell_j(\widehat{\boldsymbol{\theta}}_j)
$$

again, where $\ell_j(\widehat{\boldsymbol{\theta}}_j) = \sum_{i=1}^{n}\log(f_j(z_i|\widehat{\boldsymbol{\theta}}))$ is the MLE, and $k_j = \text{dim}(\Theta_j)$ is the dimension of the parameter space. In this case, $n$ is the number of data points. (For those interested in the derivation and proof of the BIC, you can find it [here](https://statproofbook.github.io/P/bic-der.html). Note the notational difference between the proof and the formula presented here.)

### Differences Between AIC and BIC

It is easy to see that AIC and BIC only differ by the first term of their formula. AIC's first term is $2k_j$, and BIC's first term is $k_j \log(n)$. Since $n$ is typically large, this means that, generally, $\log(n) > 2$. This tells us that BIC will penalize models with more parameters more than AIC will. This means that BIC will tend to select simpler models than AIC. Thus, AIC is more likely to choose a model that is too complex, and BIC is more liekly to choose a model that is too simple. So, which one you choose to use is dependent entirely on your situation and what you are trying to accomplish. For example, if you think there are unnecessary parameters in your model, then BIC might be a better choice. If you think that there are important parameters that you do not want to leave out, then AIC might be a better choice.

### A Quick Python Example

Now that we have seen what AIC and BIC are, let's see how we can use them in Python. For this example, we will use the `OLS` model from `statsmodels`, and the [California housing dataset](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html) from scikit-learn.

First, begin by importing the necessary libraries and loading in the data.

:::code-tabs
```python
# Import all the necessary things from sklearn.
from sklearn.datasets import fetch_california_housing
import statsmodels.api as sm

# Load in the data. Split into X and y, and make them Pandas dataframes.
X, y = fetch_california_housing(return_X_y=True, as_frame=True)
```
:::

Briefly looking at the data, we see that there are 8 features, and 20,640 data points, with the $X$ looking like

:::code-tabs
```python
X.head()
   MedInc  HouseAge  AveRooms  AveBedrms  Population  AveOccup  Latitude  
0  8.3252      41.0  6.984127   1.023810       322.0  2.555556     37.88   
1  8.3014      21.0  6.238137   0.971880      2401.0  2.109842     37.86   
2  7.2574      52.0  8.288136   1.073446       496.0  2.802260     37.85   
3  5.6431      52.0  5.817352   1.073059       558.0  2.547945     37.85   
4  3.8462      52.0  6.281853   1.081081       565.0  2.181467     37.85   
                                
   Longitude  
0    -122.23  
1    -122.22  
2    -122.24  
3    -122.25  
4    -122.25  
```
:::

and the $y$ looking like

:::code-tabs
```python
y.head()
0    4.526
1    3.585
2    3.521
3    3.413
4    3.422
Name: MedHouseVal, dtype: float64
```
:::

We now want to add a constant to the $X$ data (since `statsmodels` doesn't do that naturally), and then fit the model.

:::code-tabs
```python
# Add a constant to the X matrix, as statsmodels doesn't do that by default.
X_sm = sm.add_constant(X)

# Initialize our OLS model, and fit the data.
model_sm = sm.OLS(y, X_sm)
results = model_sm.fit()
```
:::

Now that we have fit the model, we simply use the `aic` and `bic` attributes of the `results` object to get the AIC and BIC values.

:::code-tabs
```python
# Get the AIC and BIC
results.aic
>>> 45265.54161
results.bic
>>> 45336.95649
```
:::

Now, these numbers by themselves are more or less meaningless. However, if we begin to perform model selection (such as stepwise feature removal), then we can use these numbers to help us determine which model is best.

### Conclusion

And there you have it! AIC and BIC are powerful ideas that can help us build useful models for our data. I hope that you can now see how useful and important these ideas are and how they can help you with your next machine learning project. To see the code use in this article, you can find it on my [Github](https://github.com/dylanskinner65/dylanskinner65.github.io/blob/ec4b663f532eaafd71172c3334de2b97610bb0d2/blog/blog_files/aic_bic/aic_bic.ipynb).
