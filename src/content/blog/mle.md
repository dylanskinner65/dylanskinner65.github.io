---
slug: "mle"
title: "Maximum Likelihood Estimation"
date: "2024-03-20"
description: "In this blog post we talk about maximum likelihood estimation and its importance in probability."
quote: "And when is there time to remember, to sift, to weigh, to estimate, to total?"
quoteAuthor: "Tillie Olson"
category: "Math & ML"
---

Maximum likelihood estimation (MLE) stands as a cornerstone in the realm of statistical inference, offering a powerful method for estimating the parameters of a probability distribution. Rooted in the principle of finding the most probable values for the parameters given observed data, MLE provides a systematic framework for making inferences about unknown quantities. Whether in fields like economics, biology, or engineering, where uncertainty reigns, understanding and applying MLE empowers researchers and practitioners to glean insights from data and make informed decisions.

In this blog post, we will explore the concept of MLE, its mathematical underpinnings, and consider a few examples.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/mle/estimation_image.jpg" alt="A river." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">Photo by <a href="https://unsplash.com/@solenfeyissa?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Solen Feyissa</a> on <a href="https://unsplash.com/photos/a-black-background-with-multicolored-lines-in-the-dark-8z1SGcgkOiA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a></figcaption>
</figure>

### What is Maximum Likelihood Estimation?

Maximum likelihood estimation is an estimation method used to find the parameter values of a probability distribution that maximize the likelihood of the observed data. In other words, MLE seeks to find the most probable values for the parameters of a distribution given the observed data. Consider the following definition.

Let $X_1, X_2, \ldots, X_n$ be a random sample from a discrete distribution $X$ with probability mass function (p.m.f.) $g(x,\theta)$ (or a random sample from a continuous distribution $X$ with probability density function (p.d.f.) $f(x,\theta)$), where $\theta$ is the parameter of the distribution. If $\textbf{x} = (x_1, \dots, x_n)$ is a draw from the sample, we define the joint probability to be

$$
L(\theta) = P(X_1 = x_1, \dots, X_n = x_n) = \prod_{i=1}^n P(X_i=x_i) = \prod_{i=1}^n g(x_i, \theta)
$$

in the discrete case, or

$$
\prod_{i=1}^n P(X_i=x_i) = \prod_{i=1}^n f(x_i, \theta)
$$

in the continuous case. The function $L(\theta)$ is called the *likelihood of* $\mathit{\theta}$

We defined the point $\widehat{\theta}$ that maximizes $L(\theta)$ as the *maximum likelihood estimate of* $\mathit{\theta}$. If we find a an estimator $\widehat{\theta}(X_1,\dots, X_n)$ whose estimate $\widehat{\theta}(x_1,\dots,x_n)$ is the maximum likelihood estimate of $\theta$, then $\widehat{\theta}$ is called a *maximum likelihood estimator* of $\theta$.

With those definitions in mind, let's do some examples to illustrate the concept.

### MLE Examples

For our first example, let's consider a simple case where we have a random sample from a Bernoulli distribution. Recall that the p.m.f. for the Bernoulli distribution is given by

$$
g(x,\theta) = \theta^x(1-\theta)^{1-x}
$$

where $x \in \{0,1\}$ and $\theta \in [0,1]$, with $\theta$ unknown. If $\textbf{x} = (x_1, \dots, x_n)$ is a draw from our distribution, then the likelihood of $\theta$ is given by

$$
L(\theta) = \prod_{i=1}^n \theta^{x_i}(1-\theta)^{1-x_i}.
$$

By the nature of products, this is equivalent to

$$
L(\theta) = \theta^{\sum_{i=1}^n x_i}(1-\theta)^{n-\sum_{i=1}^n x_i}.
$$

Working with $\sum_{i=1}^n x_i$ will be a little hairy, so define $\bar{x} = \frac{1}{n}\sum_{i=1}^n x_i$. Then we have

$$
L(\theta) = \theta^{n\bar{x}}(1-\theta)^{n-n\bar{x}}.
$$

To find the maximum likelihood estimate of $\theta$, we take the derivative of $L(\theta)$ with respect to $\theta$, set it equal to zero, and solve for $\theta$. Doing this we get

$$
\begin{aligned}
\frac{dL(\widehat{\theta})}{d\theta} = n\bar{x}\widehat{\theta}^{n\bar{x}-1}(1-\widehat{\theta})^{n-n\bar{x}} - (n-n\bar{x})\widehat{\theta}^{n\bar{x}}(1-\widehat{\theta})^{n-n\bar{x}-1} &= 0 \\
\widehat{\theta}^{n\bar{x}-1}(1-\widehat{\theta})^{n-n\bar{x}-1}\left(n\bar{x}(1-\widehat{\theta}) - (n-n\bar{x})\widehat{\theta}\right) &= 0 \\
\end{aligned}
$$

Dividing both sides by the part outside the parenthesis gives us

$$
\begin{aligned}
    n\bar{x}(1-\widehat{\theta}) - (n-n\bar{x})\widehat{\theta} &= 0 \\
    n\bar{x}(1-\widehat{\theta}) &= (n-n\bar{x})\widehat{\theta} \quad\quad\text{(divide by $n$)} \\
    \bar{x}(1-\widehat{\theta}) &= (1-\bar{x})\widehat{\theta} \quad\quad\;\;\;\text{(distribute)} \\
    \bar{x} - \bar{x}\widehat{\theta} &= \widehat{\theta} - \bar{x}\widehat{\theta} \\
    \bar{x} &= \widehat{\theta}
\end{aligned}
$$

Recall that $\bar{x}$ is the sample mean of our data. Thus, the maximum likelihood estimate of $\theta$ is the sample mean of our data.

This should make sense to us. We estimate the probability of success in a Bernoulli trial by getting the average number of successes in our sample.

Now, one thing to note is that the math does not always work out this nice. However, there is a way around that!

### Log-Likelihood!

The idea of log-likelihood is to take the natural logarithm of the likelihood function and solve for the maximum likelihood estimate of our parameter. It is important to note that this will still give us the same answer. Since the logarithm is a monotonicly increasing function (always increasing) and the likelihood function is nonnegative, the log-likelihood $\ell(\theta) = \log L(\theta)$ will achieve its maximum at the same value of $\theta$ as the likelihood function.

Let's see this in action, first with the Bernoulli distribution. We have

$$
\ell(\theta) = \log L(\theta) = \log\left( \prod_{i=1}^n \theta^{x_i}(1-\theta)^{1-x_i} \right).
$$

Recalling that $\log(ab) = \log a + \log b$, we can rewrite the above as

$$
\begin{aligned}
\ell(\theta) = \log\left( \prod_{i=1}^n \theta^{x_i}(1-\theta)^{1-x_i} \right) &= \log\left(\theta^{n\bar{x}}(1-\theta)^{n-n\bar{x}} \right) \\
&= \log(\theta^{n\bar{x}}) + \log((1-\theta)^{n-n\bar{x}}) \\
&= n\bar{x}\log(\theta) + (n-n\bar{x})\log(1-\theta).
\end{aligned}
$$

Taking the derivative of this with respect to $\theta$ and setting it equal to zero gives us

$$
\begin{aligned}
\frac{d\ell(\widehat{\theta})}{d\theta} = \frac{n\bar{x}}{\widehat{\theta}} - \frac{n-n\bar{x}}{1-\widehat{\theta}} &= 0 \\
\frac{n\bar{x}}{\widehat{\theta}} &= \frac{n-n\bar{x}}{1-\widehat{\theta}}  \quad\quad(\text{divide by } n)\\
\frac{\bar{x}}{\widehat{\theta}} &= \frac{1-\bar{x}}{1-\widehat{\theta}} \\
\bar{x}(1-\widehat{\theta}) &= \widehat{\theta}(1-\bar{x}) \\
\bar{x} - \bar{x}\widehat{\theta} &= \widehat{\theta} - \bar{x}\widehat{\theta} \\
\bar{x} &= \widehat{\theta}.
\end{aligned}
$$

We get the same answer as before! This is a general result, and we can use the log-likelihood to find the maximum likelihood estimate of any parameter.

### Why is MLE Useful?

Earlier I mentioned that MLE is a powerful method for estimating the parameters of a probability distribution. But truthfully this is an understatement. MLE is the best method for estimating the parameters of a probability distribution. The principle of MLE is used as a foundation for many machine learning algorithms and statistical methods.

Truthfully, the question should not be when is MLE useful, but when is it not useful.

### Conclusion

Maximum likelihood estimation is a powerful method for estimating the parameters of a probability distribution. It provides a systematic framework for making inferences about unknown quantities, and is used as a foundation for many machine learning algorithms and statistical methods. In this blog post, we explored the concept of MLE, its mathematical underpinnings, and considered an example with the Bernoulli distribution. Stay tuned as we talk about different important ideas that use MLE!
