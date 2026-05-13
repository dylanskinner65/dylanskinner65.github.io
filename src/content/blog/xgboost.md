---
slug: "xgboost"
title: "A Gentle Introduction and Mathematical Foundations of XGBoost"
date: "2024-01-31"
description: "XGBoost is a powerful machine learning algorithm that is used in many data science competitions, combining ideas from gradient boosting, random forests, and other important topics."
quote: "XGBoost"
quoteAuthor: "Bojan Tunguz"
category: "Math & ML"
---

When it comes to the current machine learning landscape, XGBoost is king. If you look at the tops solutions for just about any Kaggle competition, the winner will most likely be using XGBoost. XGBoost is a powerful machine learning algorithm that combines ideas from gradient boosting, random forests, and other important topics. In this blog post, we'll discuss the math behind XGBoost, exploring its inner workings and understanding how it stands out among other machine learning algorithms. We'll also shed light on the importance of regularization and draw comparisons between XGBoost, gradient boosting, and random forests through a practical Python example.

Note, this blog post builds off of my previous blog posts about [decision trees](/blog/decision-tress), [random forests](/blog/random-forests), and [gradient boosting](/blog/gradient-boosting). If you are unfamiliar with these topics, I recommend reading those blog posts first.

Additionally, this blog post is **very** math heavy. If you are more interested in the implementation of XGBoost and seeing how it compares against random forests and gradient boosted trees, I would recommend skipping to the [Python Example](#python-example) section.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/xgboost/XGBoost_logo.png" alt="XGBoost logo." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60"></figcaption>
</figure>

### Newton Boosted Trees

To begin, let's talk about Newton boosted trees. Newton boosted trees are a special case of gradient boosted trees that use Newton's method to find the optimal weights for each tree. This is the main idea behind XGBoost.

The main idea of XGBoost is to use the idea of Newton's method to express the objective function $T$ in terms of a sum over the leaves of the trees. Note, we will actually be getting the quadratic approximation of $T$ instead of the actual $T$ itself. This is because the quadratic approximation of $T$ is much easier to work with. We will see this come into play, especially in the proofs.

Recall in my blog post about [gradient boosted trees](/blog/gradient-boosting), we use gradient descent to find the optimal tree $t_k$ that minimizes the loss function $T$. With Newton boosting, we instead use a quadratic approximation of our objective function $T$ to find the optimal tree $t_k$. Since the quadratic approximation is a key idea in Newton's method, we call this Newton boosted trees.

Now, using Newton's method has some pros and cons. One pro is that Newton's method can be much faster than gradient descent. Newton's method converges quadratically while gradient descent converges linearly, thus a quicker conversion rate. However, Newton's method also requires computing the Hessian matrix ($2^{\text{nd}}$ derivative matrix), which can be very expensive ($O(n^3)$, in fact). So, while Newton's method can converge faster, it can also be much expensive to compute, causing Newton's method to be slower than gradient descent in some cases.

Since Newton's method is $O(n^3)$ and our parameter space is determined by the values $\textbf{x}_1, \dots, \textbf{x}_N$, Newton's method is not feasible for large datasets. The nice thing, however, is we can use the idea of approximating the objective with a quadratic function and minimizing that without ever computing the Hessian! Let's dive into that, reviewing first a few important pieces of terminology.

### Minimizing Quadratics Without the Hessian

Recall that our updated function is $f_{k+1} = f_k + t_{k+1}$, where $f_k$ is sum of previous trees $\sum_{i=1}^k t_i$ and $t_{k+1}$ is our new tree. When evalauted at some specific datapoint $\textbf{x}_i$, we have $f_{k+1}(\textbf{x}_i) = \hat{y}_i^{k+1} = \hat{y}_i^k + t_{k+1}(\textbf{x}_i)$.

To minimize our quadratic function without the Hessian, we need to take the quadratic approximation of our loss function $\mathscr{L}((f_k + t_{k+1})(\textbf{x}_i), y_i)$. The best way to do this is to use a Taylor series expansion around $t_{k+1}(\textbf{x}_i) = 0$ to get a resulting polynomial of degree 2. This will result in

$$
\small{\begin{align*}\mathscr{L}(\hat{y}_i^k + t_{k+1}(\textbf{x}_i), y_i) \approx \mathscr{L}(\hat{y}_i^k + 0, y_i)(t_{k+1}(\textbf{x}_i))^0 &+ \mathscr{L}^{\prime}(\hat{y}_i^k + 0, y_i)(t_{k+1}(\textbf{x}_i))^1 \\
                                                                                      &+ \frac{\mathscr{L}^{\prime\prime}(\hat{y}_i^k + 0, y_i)}{2!}(t_{k+1}(\textbf{x}_i))^2\end{align*}}
$$

While this looks quite messy, it is simply the Taylor expansion learned about in calc 2. If this is unfamiliar to you, I recommend checking out [this blog post](https://math.libretexts.org/Bookshelves/Calculus/Calculus_3e_(Apex)/08%3A_Sequences_and_Series/8.08%3A_Taylor_Series) on Taylor/Maclaurin series.

You might also be asking yourself, 'why are we using the second order Taylor series expansion instead of any other order'. That is a valid question! Ultimately, it comes down to the second order expansion seems to work well and is not too computationally expensive!

Since we are minimizing this objective function, we do not care about any constant terms, so we can drop them. This leaves us with

$$
\small{\mathscr{L}^{\prime}(\hat{y}_i^k + 0, y_i)(t_{k+1}(\textbf{x}_i))^1
+ \frac{\mathscr{L}^{\prime\prime}(\hat{y}_i^k + 0, y_i)}{2!}(t_{k+1}(\textbf{x}_i))^2}
$$

Now, don't let notation fool you. $t_{k+1}(\textbf{x}_i)$ is a *variable*, the same as $x$ is a variable in $f(x) = x^2$.

With this in mind, instead of computing the Hessian of the objective function $T$ and minimizing that, we instead are trying to find the tree $t_{k+1}$ that takes in points $\textbf{x}_1, \dots, \textbf{x}_N$ and outputs the values $t_{k+1}(\textbf{x}_1), \dots, t_{k+1}(\textbf{x}_N)$ and now try to minimize

$$
\small{\begin{align*}\widetilde{T} = \left[\sum_{i}^{N} \mathscr{L}^{\prime}(\hat{y}_i^k + 0, y_i)\cdot(t_{k+1}(\textbf{x}_i))^1
+ \frac{\mathscr{L}^{\prime\prime}(\hat{y}_i^k + 0, y_i)}{2!}\cdot(t_{k+1}(\textbf{x}_i))^2\right] + R(t_{k+1})\end{align*}}
$$

Where $R(t_{k+1})$ is the contribution of tree $t_{k+1}$ to our regularization term.

Note, the summation occurs simply because we are doing this for each data point in our dataset. The only jump we made from the previous equation to this one is the inclusion of more data points. The previous equation is what we are minimizing for one data point, while this equation is what we are minimizing for all data points!

### Example of Quadratic Approximation: Exponential Loss

Let's work through an example of the math shown above using the exponential loss function

$$
\small{\mathscr{L}(f(\textbf{x}_i), y_i) = \exp(-y_i f(\textbf{x}_i)).}
$$

(We will be evaluating each derivative at $0$, so keep that in mind!)

Replacing $f(\textbf{x}_i)$ with $f_k(\textbf{x}_i) + t_{k+1}(\textbf{x}_i)$, we get

$$
\small{\begin{align*}\mathscr{L}(f_k(\textbf{x}_i) + t_{k+1}(\textbf{x}_i), y_i) &= \exp(-y_i (f_k(\textbf{x}_i) + t_{k+1}(\textbf{x}_i))) \\
                                                                                              &= \exp(-y_i f_k(\textbf{x}_i) -y_i t_{k+1}(\textbf{x}_i))\end{align*}}
$$

Before getting the Taylor series expansion, let's first compute the first and second derivatives of $\mathscr{L}$. The first derivative is given by

$$
\small{\begin{align*} 
    \frac{d}{dt_{k+1}}\mathscr{L}(f_k(\textbf{x}_i) + t_{k+1}(\textbf{x}_i), y_i) &= \exp(-y_i f_k(\textbf{x}_i) -y_i t_{k+1}(\textbf{x}_i)) \\
                             &= -y_i\exp(-y_i f_k(\textbf{x}_i) -y_i t_{k+1}(\textbf{x}_i)) \\
\end{align*}}
$$

Evaluating this derivative at $t_{k+1}(\textbf{x}_i) = 0$, we get

$$
\small{\begin{align*} 
    -y_i\exp(-y_i f_k(\textbf{x}_i) -y_i t_{k+1}(\textbf{x}_i))|_{t_{k+1}(\textbf{x}_i) = 0} &=   -y_i\exp(-y_i f_k(\textbf{x}_i) -y_i (0))\\
                             &= -y_i\exp(-y_i f_k(\textbf{x}_i)) \\\end{align*}}
$$

Similarly, taking the second derivative of $\mathscr{L}$, we get

$$
\small{\begin{align*} 
    \frac{d^2}{dt_{k+1}^2}\mathscr{L}(f_k(\textbf{x}_i) + t_{k+1}(\textbf{x}_i), y_i) &= \frac{d}{dt_{k+1}}(-y_i\exp(-y_i f_k(\textbf{x}_i) -y_i t_{k+1}(\textbf{x}_i))) \\
                             &= y_i^2\exp(-y_i f_k(\textbf{x}_i) -y_i t_{k+1}(\textbf{x}_i)) \\
\end{align*}}
$$

Evaluating this derivative at $t_{k+1}(\textbf{x}_i) = 0$, we get

$$
\small{\begin{align*} 
    y_i^2\exp(-y_i f_k(\textbf{x}_i) -y_i t_{k+1}(\textbf{x}_i))|_{t_{k+1}(\textbf{x}_i) = 0} &=   y_i^2\exp(-y_i f_k(\textbf{x}_i) -y_i (0))\\
                             &= y_i^2\exp(-y_i f_k(\textbf{x}_i)) \\\end{align*}}
$$

We can now easily express our quadratic approximation of $\mathscr{L}$ as

$$
\small{\begin{align*}
        \widetilde{T}(t_{k+1}) = \sum_{i=1}^{N}&-y_i\exp(-y_i f_k(\textbf{x}_i))\cdot(t_{k+1}(\textbf{x}_i))^1 \\
        &+\frac{y_i^2\exp(-y_i f_k(\textbf{x}_i))}{2!}\cdot(t_{k+1}(\textbf{x}_i))^2 + R(t_{k+1})
\end{align*}}
$$

### Writing this in Terms of Tree Leaves

Now, we want to write this in terms of the leaves of the tree. Let's define a few functions real quick. Let $q:\mathbb{R}^d\to L$ be a function that maps a point $\textbf{x}_i$ to the leaf $L$ that it falls into, and let $\textbf{w}:L\to\mathbb{R}$ be a function that maps a leaf $L$ to a weight $w$. With these new functions, we can write $t_{k+1}(\textbf{x}_i)$ as $\textbf{w}(q(\textbf{x}_i))$.

Now, we can rewrite our quadratic approximation of $\widetilde{T}$ as

$$
\small{\begin{align*}
        \widetilde{T}(t_{k+1}(\textbf{x}_i)) = \sum_{i=1}^{N}&\mathscr{L}^{\prime}(\hat{y}_i^k, y_i)\cdot w(q(\textbf{x}_i))^1 \\
        &+\frac{\mathscr{L}^{\prime\prime}(\hat{y}_i^k + 0, y_i)}{2!}\cdot w(q(\textbf{x}_i))^2 + R(t_{k+1})\end{align*}}
$$

For each of our leaves $\ell \in L$, we can define the set $I_{\ell} = \{i \;|\; q(\textbf{x}_i = \ell)\}$ be the set indices $i$ where $\textbf{x}_i$ falls into leaf $\ell$ in tree $t_{k+1}$. We can now rewrite our quadratic approximation of $\widetilde{T}$ as

$$
\small{\begin{align*}
            \widetilde{T}(t_{k+1}(\textbf{x}_i)) &= \sum_{i}^{N} \left[\mathscr{L}^{\prime}(\hat{y}_i^k, y_i)\cdot w(q(\textbf{x}_i))^1
                + \frac{1}{2}\mathscr{L}^{\prime\prime}(\hat{y}_i^k, y_i)\cdot w(q(\textbf{x}_i))^2\right] + \gamma|L| + \frac{1}{2}\lambda\sum_{\ell\in L}w_{\ell}^2 \\
  \end{align*}}
$$

Where the last two terms come from the regularization term $R(t_{k+1})$. The first term, $\gamma|L|$, is the cost of adding a new leaf to our tree. The second term, $\frac{1}{2}\lambda\sum_{\ell\in L}w_{\ell}^2$, is the cost of the weights of our tree. Note, $\gamma$ and $\lambda$ are hyperparameters that control the strength of regularization.

This can "simplify", however, into

$$
\small{\begin{align*}
            \widetilde{T}(t_{k+1}(\textbf{x}_i)) &= \sum_{\ell\in L} \left(\sum_{i\in I_{\ell}} \mathscr{L}^{\prime}(\hat{y}_i^k, y_i)\right)w_{\ell}
                + \frac{1}{2}\sum_{\ell\in L}\left(\sum_{i\in I_{\ell}} \mathscr{L}^{\prime\prime}(\hat{y}_i^k, y_i)\right)w_{\ell}^2 + \gamma|L| + \frac{1}{2}\lambda\sum_{\ell\in L}w_{\ell}^2
    \end{align*}}.
$$

This is because we can group the terms by leaf $\ell$ and then sum over all the leaves. But, if we look at the terms inside the parentheses, only one term is dependent on $i$ and the other is not. This means we can rewrite our quadratic approximation of $\widetilde{T}$ as

$$
\small{\begin{align*}
            \widetilde{T}(t_{k+1}(\textbf{x}_i)) &= \sum_{\ell\in L}w_{\ell} \left(\sum_{i\in I_{\ell}} \mathscr{L}^{\prime}(\hat{y}_i^k, y_i)\right)
                + \frac{1}{2}\sum_{\ell\in L}w_{\ell}^2\left(\sum_{i\in I_{\ell}} \mathscr{L}^{\prime\prime}(\hat{y}_i^k, y_i)\right) + \gamma|L| + \frac{1}{2}\lambda\sum_{\ell\in L}w_{\ell}^2
    \end{align*}}
$$

If we let $$F_{\ell} = \sum_{i\in I_{\ell}} \mathscr{L}^{\prime}(\hat{y}_i^k, y_i)$$ and $$H_{\ell} = \sum_{i\in I_{\ell}} \mathscr{L}^{\prime\prime}(\hat{y}_i^k, y_i),$$ we can rewrite our quadratic approximation of $\widetilde{T}$ as

$$
\small{\begin{align*}
            \widetilde{T}(t_{k+1}(\textbf{x}_i)) &= \sum_{\ell\in L}\left(w_{\ell} F_{\ell} + \frac{1}{2}(H_{\ell} + \lambda)w_{\ell}^2\right) + \gamma|L| \\
                                                                         &= \sum_{\ell\in L}\left(w_{\ell} F_{\ell} + \frac{1}{2}(H_{\ell} + \lambda)w_{\ell}^2 + \gamma\right)
    \end{align*}}
$$

### Finding the Optimal Weights and Objective

With this notation down, we now seek to find the optimal weights $\textbf{w}^*$ that minimize our quadratic approximation of $\widetilde{T}$ derived above. We will do this by utilizing the most simple minimization technique: taking the derivative and setting it equal to zero.

Taking $$ \small{\widetilde{T}(t_{k+1}(\textbf{x}_i)) = \sum_{\ell\in L}\left(w_{\ell} F_{\ell} + \frac{1}{2}(H_{\ell} + \lambda)w_{\ell}^2\right) + \gamma|L|}$$ and taking the derivative with respect to $w_{\ell}$, we get

$$
\small{\begin{align*}
    \frac{d}{dw_{\ell}}(\widetilde{T}(t_{k+1}(\textbf{x}_i))) &= \frac{d}{dw_{\ell}}\left(\sum_{\ell\in L}\left(w_{\ell} F_{\ell} + \frac{1}{2}(H_{\ell} + \lambda)w_{\ell}^2\right) + \gamma|L|\right) \\
                                                                                          &= F_{\ell} + (H_{\ell} + \lambda)w_{\ell} \\
  \end{align*}}
$$

Setting this equal to zero and solving for $w_{\ell}$, we get

$$
\small{\begin{align*}
    F_{\ell} + (H_{\ell} + \lambda)w_{\ell} &= 0 \\
    (H_{\ell} + \lambda)w_{\ell} &= -F_{\ell} \\
    w_{\ell} &= \frac{-F_{\ell}}{H_{\ell} + \lambda} \\
  \end{align*}}
$$

This gives us that our optimal weights are given by

$$
\small{w_{\ell}^* = \frac{-F_{\ell}}{H_{\ell} + \lambda}}.
$$

Now, we can plug this back into our quadratic approximation of $\widetilde{T}$ to get

$$
\small{\begin{align*}
    \widetilde{T}(t_{k+1}(\textbf{x}_i)) &= \sum_{\ell\in L}\left(w_{\ell} F_{\ell} + \frac{1}{2}(H_{\ell} + \lambda)w_{\ell}^2\right) + \gamma|L| \\
                                                                         &= \sum_{\ell\in L}\left(\frac{-F_{\ell}^2}{H_{\ell} + \lambda} + \frac{1}{2}(H_{\ell} + \lambda)\left(\frac{-F_{\ell}}{H_{\ell} + \lambda}\right)^2\right) + \gamma|L| \\
                                                                         &= \sum_{\ell\in L}\left(\frac{-F_{\ell}^2}{H_{\ell} + \lambda} + \frac{1}{2}(H_{\ell} + \lambda)\frac{F_{\ell}^2}{(H_{\ell} + \lambda)^2}\right) + \gamma|L| \\
                                                                         &= \sum_{\ell\in L}\left(\frac{-F_{\ell}^2}{H_{\ell} + \lambda} + \frac{1}{2}\frac{F_{\ell}^2}{H_{\ell} + \lambda}\right) + \gamma|L| \\
                                                                         &= \sum_{\ell\in L}\left(\frac{-F_{\ell}^2}{2(H_{\ell} + \lambda)}\right) + \gamma|L| \\
                                                                         &= \sum_{\ell\in L}\left(\gamma - \frac{F_{\ell}^2}{2(H_{\ell} + \lambda)}\right) \\
                                                                            \end{align*}}
$$

Where the last step comes because  $$\sum_{\ell\in L}\gamma = \gamma|L|. $$

Thus our optimal weights are given by $$\small{w_{\ell}^* = \frac{-F_{\ell}}{H_{\ell} + \lambda}}$$ and our optimal tree is given by

$$
\small{\begin{align*}
    \widetilde{T}(t_{k+1}(\textbf{x}_i)) &= \sum_{\ell\in L}\left(\gamma - \frac{F_{\ell}^2}{2(H_{\ell} + \lambda)}\right) \\
                                                                            \end{align*}}.
$$

### Comparing the Cost Functions of XGBoost, Random Forests, and Gradient Boosted Trees

Before getting into our python example, let's first look at the cost functions of XGBoost, random forests, and gradient boosted trees.

Recall from my blog post about [decision trees](/blog/decision-trees) that one way to build our trees is to use the Gini index as our cost function. The Gini index is a good cost function for building random forests and is given by

$$
G_{\mathbb{D}_{\ell}} = 1 - \sum_{c\in\mathscr{Y}}\left(\frac{1}{N_{\ell}}\sum_{(\mathbf{x}_i, y_i)\in\mathbb{D}_{\ell}}\mathbb{I}_{(y_i=c)}\right)^2
$$

Now, the cost function for gradient boosted trees is given by

$$
f^* \approx \text{argmin}_{f\in\mathscr{F}}T(f) = \text{argmin}_{f\in\mathscr{F}}\frac{1}{N}\sum_{i=1}^{N}\mathscr{L}(f(\textbf{x}_i), y_i),
$$

where we can iteratively find our next tree by

$$
f_{k+1} = f_k - \alpha_k DT(f_k)^T.
$$

Where $DT(f_k)^T$ is the gradient of the loss function $\mathscr{L}$ evaluated at $f_k$ and $\alpha_k$ is the learning rate. (For more information, check out my blog post about [gradient boosted trees](/blog/gradient-boosting)).

And of course, the cost function for XGBoost is given by

$$
\widetilde{T}(t_{k+1}(\textbf{x}_i)) = \sum_{\ell\in L}\left(\gamma - \frac{F_{\ell}^2}{2(H_{\ell} + \lambda)}\right).
$$

<a id="python-example"></a>

### Python Example

For this example, we will be using the same dataset that we used in my blog post about [gradient boosting](/blog/gradient-boosting), the [Olivetti Faces data](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_olivetti_faces.html#sklearn.datasets.fetch_olivetti_faces). Let's start off by importing XGBoost and this dataset.

:::code-tabs
```python
import xgboost as xgb
from sklearn.datasets import fetch_olivetti_faces
```
:::

Now, let's load in the data and split it into training and testing sets.

:::code-tabs
```python
# Import train test split
from sklearn.model_selection import train_test_split

# Load in the data
faces_X, faces_y = fetch_olivetti_faces(return_X_y=True, shuffle=True, random_state=1)

# Perform train test split
X_train, X_test, y_train, y_test = train_test_split(faces_X, faces_y, test_size=0.20, random_state=1)
```
:::

Now, let's create our XGBoost model. We will use the `xgb.XGBClassifier()` class to create our model. We will use the default parameters, but do specify `objective="multi:softmax"` (because this is a multiclass classification problem).

:::code-tabs
```python
# Create the model
xgb_classifier = xgb.XGBClassifier(objective="multi:softmax", random_state=1)
```
:::

Just like we did in the [gradient boosting](/blog/gradient-boosting) article, we will fit our model, timing how long it takes to train.

:::code-tabs
```python
%%timeit
xgb_classifier.fit(X_train, y_train)
>>> 15.1 s ± 708 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```
:::

We see it took 15.1 seconds. Now, we will evaluate our model on the test set.

:::code-tabs
```python
# Evaluate the model
xgb_classifier.score(X_test, y_test)
>>> 0.7625
```
:::

Looking at a table comparing the results of XGBoost, gradient boosting, and random forests, we have

| Model | Time to Train | Accuracy |
| :--- | :--- | :--- |
| XGBoost | 15.1 seconds | 76.25% |
| Gradient Boosting | 88 minutes, 12 seconds | 53.75% |
| Random Forests | 10.9 seconds | 91.25% |

Clearly Random Forests is the best option, which is a bit of a surprise! This is not always the case.

In a previous project I participated in where we tried to [predict taxi duration times](https://github.com/jeffxhansen/NYC_Taxi_Trip_Duration/blob/main/NYC%20Taxi%20Duration%20Prediction.ipynb), we found that XGBoost was the best model and random forests was second best. Thus, it is important to try different models and different model parameters to find the best model for your data!

### Conclusion

In this article, we went deep into the math behind newton boosted trees, the backbone of XGBoost. We discussed how to find the optimal cost function for our trees without the Hessian, and how avoiding overfitting is built into the cost function. We then went through an example of implementing XGBoost in Python and compared it to gradient boosting and random forests. I hope that through this article, you now understand XGBoost especially why it is so successful (which most people don't)! If you want to see the code used in this article, you can find it on my [Github](https://github.com/dylanskinner65/dylanskinner65.github.io/blob/main/blog/blog_files/xgboost/xgboost.ipynb). I hope that you choose to try out XGBoost in your next project!
