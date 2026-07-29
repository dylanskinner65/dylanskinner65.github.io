---
slug: "braid-representations-and-knot-theory"
title: "Leveraging Deep Reinforcement Learning and Braid Representations to Explore Knot Theory"
date: "2024-02-24"
venue: "JMM · San Francisco"
description: "Training PPO agents to construct minimal-genus slice surfaces by searching over sequences of braid transformations."
slides: "/slides/braid-representations-and-knot-theory.pdf"
category: "Talks"
---

Constructing minimal-genus slice surfaces is hard for knots of any real complexity, and it's the kind of problem where human intuition runs out early. This talk covers the approach from my honors thesis: represent knots as braids, define an objective function over slice surfaces, and train reinforcement learning agents to find the sequence of braid transformations that gets you to a minimal-genus surface.

The talk walks through what a knot invariant is, why the 4D slice genus is difficult to compute, how braid notation makes the problem tractable as a sequence-of-actions search, and what PPO actually converged on.

[Slides (PDF)](/slides/braid-representations-and-knot-theory.pdf)

## Related

- [Deep Knots RL](/projects/deep-knots-rl) — the project and the code behind it
- [An Introduction to Knots](/blog/intro-to-knots)
- [Braids](/blog/braids)
- [Slice Surface Genus](/blog/slice-surface-genus)
- [PPO](/blog/ppo)
