---
slug: "braids"
title: "Introduction to Knot Theory: Braids, Alexander's Theorem, and Markov's Theorem"
date: "2024-02-21"
description: "In this blog post we build upon a previous post. We will be discussing braids, Alexander's theorem, and Markov's theorem."
quote: "Braids, bouffants, and balayage. Everything a girl wants to hear"
quoteAuthor: "The Internet"
category: "Topology & Theory"
---

Continuing on from my previous [blog post](/blog/intro-to-knots), this blog post focuses on braids, Alexander's Theorem, and Markov's Theorem.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/braid_intro_pic.jpg" alt="Fun knitted braid." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">A fun braid. Credit to <a href="https://en.wikipedia.org/wiki/File:Knitcable.jpg" target="_blank" rel="noopener noreferrer">Wikipedia</a>.</figcaption>
</figure>

### Introduction to Braids

In knot theory, knots can be represented in many different ways besides using the planar projections described in my previous [blog post](/blog/intro-to-knots). One of these ways is using *braid* closures. Braids are particularly helpful because every knot can be described as the closure of a braid. A braid is a set of $n$ strings that are attached to a horizontal bar at the top and the bottom and which travel monotonically downwards (see [Figure 1](#figure1)). These strings can cross over or underneath each other, but they cannot loop back up. Another way of putting this is that each string can cross any horizontal plane only one time. We let $B_n$ denote the set of all braids with $n$ strands.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure1.png" alt="Example braid." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure1" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 1:</strong> An example of a braid. Braids can have any number of strings and any number of crossings.</figcaption>
</figure>

Similar to knots, there is a notion of equivalency for braids. In order to see that two braids are equivalent, we must be able to rearrange the strings of the braid without removing the strings from the top or bottom bar, and without allowing the strings to pass through each other or themselves.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure2.png" alt="Equivalent braids." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure2" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 2:</strong> Even though these braids are not completely the same, since you can apply a series of Reidemeister moves to one and get the other, they are equivalent.</figcaption>
</figure>

When we have a braid, we can turn that braid into a knot by connecting the top and bottom bars together. The resulting form is a knot or a link, and this is called the *closure of the braid* (see [Figure 3](#figure3)).

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure3.png" alt="Closure of a braid." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure3" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 3:</strong> On the left, we have a braid. On the right, we have the closure of this braid, which is a knot.</figcaption>
</figure>

As mentioned previously, one nice feature of braids is that every knot can be represented as the closure of a braid. This helpful fact was proven by J.W. Alexander in 1923 and is known as Alexander's Theorem.

### Alexander's Theorem

Alexander's theorem states that every knot or link can be expressed as the closure of a braid. (See chapter 5.4 in [[1]](#adams) for more.)

Simple as this theorem may be, it is incredibly helpful for working with knots. Since every knot can be represented as a braid closure, we have another useful way of studying and classifying knots. In the same vein, one useful quantity to consider when thinking of knots as braid closures is the *braid index*.

The braid index of a knot is defined to be the fewest number of strings in a braid whose closure is the knot of interest [[1]](#adams). For example, the unknot (which is simply a circle) has a braid index of 1 since it can be expressed as the closure of a braid with a single strand (and no crossings).

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure4.png" alt="Closure of a braid." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure4" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 4:</strong> On the left, we have the simplest diagram of the unknot. On the right, we still have the unknot, but as the closure of a two strand braid with a single crossing. This simple example shows that different braids can have the same closure.</figcaption>
</figure>

While calculating the braid index seems simple, it can actually be quite tricky. If we represent a knot in braid form and then count the strings of the braid, it does not guarantee that we have achieved the least number of strings possible for that knot. Counting the strings of a braid representative can certainly give us an upper bound on the braid index, but finding the actual minimal braid index requires more work.

### Braid Words

In order to fully describe a braid, we look first at its projection. Once we have the projection of the braid—and ensure that no two crossings occur at the same height—we describe the braid by listing the strings that cross over and under other strings as we move toward the bottom bar. We always label the crossings from left to right. When the first string crosses under the second string, we call this crossing a $\sigma_{1}$ crossing. On the other hand, if the first string crosses over the second string, we call this crossing a $\sigma_{1}^{-1}$ crossing. If the second string crosses under the third, it is a $\sigma_{2}$ crossing, and if the second string crosses over the third, it is a $\sigma_{2}^{-1}$ crossing. This pattern continues, with a crossing of the $j^{th}$ strand passing under the $(j+1)^{th}$ strand being labeled as $\sigma_j$, while $\sigma_j^{-1}$ denotes the $j^{th}$ strand passing over the $(j+1)^{th}$ strand. To describe a braid then we simply start at the top of the braid, and list off the crossings we encounter as we travel from top to bottom. We call the resulting sequence of crossings a *braid word*.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure5.png" alt="Braid word example." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure5" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 5:</strong> The braid word for this braid is $\sigma_{1}^{-1}\sigma_{2}\sigma_{1}^{-1}$</figcaption>
</figure>

If we look at the braid in [Figure 5](#figure5), we can see that by listing the crossings from top to bottom, we obtain the braid word $\sigma_{1}^{-1}\sigma_{2}\sigma_{1}^{-1}$.

Along with giving a convenient way to describe the braid, there are other advantages to using braid representations of knots. One advantage is identifying which Reidemeister moves can be applied to simplify the braid. For example, if a braid word contains $\sigma_{k}\sigma_{k}^{-1}$, we know that the $k^{th}$ string goes under the ${(k+1)}^{th}$, and then immediately passes back underneath of it, returning to its original position. If we apply a simple Reidemester II move to this pair of crossings, the strings will straighten out and we are left with an equivalent braid (see [Figure 6](#figure6)).

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure6.png" alt="Braid word example." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure6" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 6:</strong> A Reidemester II move applied to a braid.</figcaption>
</figure>

For a more complicated example, say we have the braid word $\sigma_{1}\sigma_{3}\sigma_{2}\sigma_{2}^{-1}\sigma_{3}^{-1}\sigma_{4}\sigma_{3}$. Through a series of Reidemester II moves, we can take this word and simplify it to $\sigma_{1}\sigma_{3}\sigma_{3}^{-1}\sigma_{4}\sigma_{3}$, and then further to $\sigma_{1}\sigma_{4}\sigma_{3}$. This leaves us with a much simpler braid word which represents a braid that is equivalent to the original braid.

Another modification we can apply to braid projections is the Reidemeister III move. If we are given a braid projection and wish to move a strand over or under a crossing we are allowed to do this since a string does not need to be cut in the process. In general if you braid word contains $\sigma_{i}\sigma_{i+1}\sigma_{i}$, for $1 \leq i \leq n-2$, then it can be replaced using the substitution $\sigma_{i}\sigma_{i+1}\sigma_{i} = \sigma_{i+1}\sigma_{i}\sigma_{i+1}$ (see [Figure 7](#figure7), where the equivalent substitution $\sigma_{i}^{-1}\sigma_{i+1}^{-1}\sigma_{i}^{-1} = \sigma_{i+1}^{-1}\sigma_{i}^{-1}\sigma_{i+1}^{-1}$ is illustrated).

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure7.png" alt="Reidemeister III move on a braid." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure7" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 7:</strong> An example of a Reidemeister III move being applied to a general braid.</figcaption>
</figure>

The final move that we can apply to braid projections is not a Reidemeister move; instead, it is a switch. If our braid word contains $\sigma_{i}\sigma_{j}$, where $|i-j| > 1$, then we can switch the order of $\sigma_{i}$ and $\sigma_{j}$. So $\sigma_{i}\sigma_{j}$ becomes $\sigma_{j}\sigma_{i}$ (see [Figure 8](#figure8)).

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure8.png" alt="Reidemeister III move on a braid." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure8" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 8:</strong> On the left we have $\sigma_{1}^{-1}\sigma_{4}^{-1}$. Since $|1 - 4| > 1$, we can switch the order to $\sigma_{4}^{-1}\sigma_{1}^{-1}$.</figcaption>
</figure>

Using these three moves allows us to determine when two braids $b_{1}$ and $b_{2}$ are equivalent. This ideas leads to another very important theorem for working with braids: Markov's theorem.

### Markov's Theorem

Markov's theorem [[2]](#birman) states:

Given two braid words $\beta_{n}\in B_{n}$, $\beta'_{m}\in B_{m}$ with $n$ and $m$ strands respectively, their closures are equivalent links if and only if $\beta'_{m}$ can be obtained from $\beta_{n}$ by applying a sequence of the following operations:

1.  conjugating $\beta_{n}$ in $B_{n}$;
2.  replacing $\beta_{n}$ by $\beta_n\sigma_{n}^{\pm 1} \in B_{n+1}$;
3.  the inverse of the previous operation (if $\beta_{n}=\beta_{n-1}\sigma_{n}^{\pm 1}$ with $\beta_{n-1} \in B_{n-1}$, replace $\beta_{n}$ with $\beta_{n-1}$).

In Markov's theorem, we learn about two new moves that can be applied to braids to obtain different braids with equivalent closures. The first comes in part 1: conjugation. Conjugation is an operation applied to the braid word where the beginning of the word is multiplied by $\sigma_{j}$, and the end of the word by $\sigma_{j}^{-1}$, or vice-versa. In the closure we are only adding a Reidemeister II move, so we are not changing the resulting knot type (see [Figure 9](#figure9)).

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure9.png" alt="Example of conjugation." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure9" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 9:</strong> If we were to connect this braid into a knot and move the bottom crossing near the top crossing, we would see that it is simply a pair of crossings that can be removed by a Reidemeister II move.</figcaption>
</figure>

The second move comes in part 2: stabilization. Stabilization involves adding a new strand and a single crossing to a braid as illustrated in [Figure 10](#figure10). This is performed by taking the braid word $w$ that corresponds to an $n$-string braid, adding a strand to make it an $(n+1)$-string braid, and then adding $\sigma_{n}$ or $\sigma_{n}^{-1}$ to the beginning or end of the word $w$. Destabilization is the opposite of stabilization: simply remove a string and a crossing from a braid as shown in [Figure 11](#figure11) below.

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure10.png" alt="Stabilization." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure10" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 10:</strong> Through adding a single strand and crossing $\sigma^{\pm 1}_{n}$ at the end of the braid representation, we obtain a different braid with equivalent closure.</figcaption>
</figure>

<figure class="flex flex-col items-center my-12">
    <img src="/blog_files/braids/Figure11.png" alt="Destabilization." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" id="figure11" />
    <figcaption class="mt-4 text-center italic opacity-60"><strong>Figure 11:</strong> Through removing a single strand and crossing $\sigma^{\pm 1}_{n}$ at the end of the braid representation, we obtain a different braid with equivalent closure.</figcaption>
</figure>

### Conclusion

In this blog post, we discussed the basics of braids and introduced Alexander's theorem, and Markov's Theorem. Alexander's theorem which states that every knot or link can be expressed as the closure of a braid, and Markov's theorem which states that two braids are equivalent if and only if their diagrams are similar through a sequence of conjugations, stabilizations, and destabilizations. This is a precursor for the next blog post which will be about slice surfaces.

### Citations

<span id="adams">[1]</span> Collin C. Adams, *The Knot Book*. American Mathematical Society, 2004. ISBN: 978-0821836781.

<span id="birman">[2]</span> Joan S Birman. *Braids, links, and mapping class groups*. 82. Princeton University Press, 1974.
