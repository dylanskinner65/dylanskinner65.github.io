---
slug: "building-effective-agents"
title: "Building Effective Agents"
date: "2026-07-28"
venue: "Local AI meetup"
description: "What it actually takes to build agents that work in production — the loop, the framework decision, tool design, prompting, and how you'd know whether any of it worked."
deck: "/decks/building-effective-agents/"
category: "Talks"
---

Agents are simpler than they look and harder than they seem. This talk walks through what it actually takes to build one that works in production, structured around the four questions you hit in the order you hit them.

<div class="thesis">
    An agent is a language model called repeatedly in a loop, with the ability to invoke tools, until it decides it's done. Everything else is a decision about some part of that loop.
</div>

## What it covers

**What is an agent, actually?** The loop, in a diagram and in twelve lines of code. What writing it yourself reveals: the model proposes and your code executes, so every safety boundary lives in that gap. "Done" is a decision you made. State lives in the message history, which is what makes any of it debuggable.

**Do I need a framework?** Two lists people conflate — what frameworks provide, and what you actually choose between them on. Then the story of picking LangGraph after real proof-of-concepts, hitting a bug in its TypeScript tool-calling loop during beta, auditing what it was still giving us, and deleting it. The framework hadn't changed. Our infrastructure had.

**How do I give it tools?** Tool design is interface design, and your user is the model — it never sees your implementation, only the name, the description, and the input schema. Three real tool definitions worth studying, pulled from live MCP servers. Why overlap costs more than count.

**How do I tell it what to do?** A chatbot prompt is a request; an agent prompt is a policy. Finding the right altitude. The two principles people skip most often, including the one where an absolute mandate makes the model invent tool arguments.

**And underneath all four: how would I know if any of it worked?** If each turn is ninety percent reliable, a thirteen-step task completes correctly about one run in four. Three points of per-turn reliability nearly doubles that — and three points is invisible if you're reading transcripts and forming an impression.

## The deck

The slides are [here](/decks/building-effective-agents/), interactive — arrow keys or space to advance. Best on a desktop; it's a fixed 16:9 stage.

## Further reading

Each section of the talk has a longer written treatment:

- [Agents Are Just a While Loop](/blog/agents-are-just-a-while-loop)
- [Choosing an Agent Framework](/blog/choosing-an-agent-framework)
- [Tools as UX for the Model](/blog/tools-as-ux-for-the-model)
- [Prompting an Agent](/blog/prompting-an-agent)

The talk leans on published guidance from Anthropic and OpenAI throughout — the *altitude* framing, the tool-consolidation example, and the mandate-backfire failure mode are all theirs, and the posts above cite them properly.
