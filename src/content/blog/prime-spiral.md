---
slug: "prime-spiral"
title: "Prime Spiral in Python"
date: "2023-04-15"
description: "A friend sent me a 3blue1brown video about what happens when you plot prime numbers in polar coordinates. I thought the video was interesting and decided to code it up myself."
quote: "Mathematicians have tried in vain to this day to discover some order in the sequence of prime numbers, and we have reason to believe that it is a mystery into which the human mind will never penetrate."
quoteAuthor: "Leonhard Euler"
category: "Topology & Theory"
---

### Why I Tried This

I have always been fascinated with prime numbers. I was born on the 23rd (prime), in 1999 (prime) and have always been interested in some of the characteristics of primes and the weird things they do. I remember in high school, I bought a book called 'Prime Obsession' by John Derbyshire. It was a fascinating book about the history of prime numbers and the people who have studied them. I have always wanted to do something with prime numbers, but I never knew what.

Yesterday, a friend of mine sent me a [video](https://www.tiktok.com/t/ZTR3CuBua/) from the 3blue1brown tiktok account. After struggling mightly to get it to load (turns out you do nothing and it will start by itself), I was captivated. This video showcased two things I really enjoy: primes, and data visualization.

As soon as I watched this video I knew I wanted to try and create the prime spiral for myself. Thankfully, 3blue1brown described this phenomenon in enough detail that I knew how to proceed. It seemed simple enough, so I fired up an iPython notebook in VS code I got to it.

### The Process

The first thing I new I needed to do was find a way to find the first $n$ primes in a quick manner. I remember doing a [lab](https://acme.byu.edu/00000181-49cb-d0ac-abe9-efff44d90000/profiling) in school where one of the problems was to write a function to find prime numbers as quick as possible. I went back, copied that code (thanks past me), and used it in my project. After testing it, my function could find the first 10000 times in about 0.07 seconds, and first 100000 primes in about 1.56 seconds. Sufficently fast for me.

After I got my prime finder up and running, and started working on how I wanted to plot these spirals. I have recently been enjoying the Plotly library, so I started with that. After a few seconds of Googling, I found that Plotly had a very easy way to plot polar coordinates using `plotly.express.scatter_polar()`. I ran my prime finder, and plotted the first 1000 primes. I could see the spiral, but the graph was not as interactive as I wanted it to be. One of the key features of the 3blue1brown video is that if you zoomed in or out on the graph, the spiral would change. I could not do that with this plotting method, so I needed to change something.

Eventually, after spending a few minutes getting my primes into their polar form, I got something to work using `plotly.express.scatter()`. It looked good and I was happy with it. After some reformating of the graph, I got something that looked like this:

<div class="flex justify-center my-8">
    <iframe src="/blog/blog_files/prime_spiral/prime_spiral_graph.html" height="800" width="100%" frameBorder="0"></iframe>
</div>

Pretty neat! Try zooming in to the middle to see how small the spiral gets.

### Conclusion

This was not anything crazy, but something cool that I saw and wanted to share. The code I used to create this graph and find the primes is located on my [Github](https://github.com/dylanskinner65/Fun_math).
