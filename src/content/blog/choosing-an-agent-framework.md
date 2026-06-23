---
slug: "choosing-an-agent-framework"
title: "Choosing an Agent Framework"
date: "2026-06-17"
description: "Evaluating agent frameworks: what they actually provide, a comparison of modern options (Anthropic, OpenAI, Mastra, LangGraph, Vercel AI SDK), and when to roll your own."
quote: "Never send a human to do a machine's job."
quoteAuthor: "Agent Smith"
category: "Math & ML"
---

<figure class="flex flex-col items-center my-8">
    <img src="/blog_files/choosing_framework/frameworks_intro.jpg" alt="A circular window with a sky view of a building." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">Photo by <a href="https://unsplash.com/@attentivesoul?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Lisa Forkner</a> on <a href="https://unsplash.com/photos/a-circular-window-with-a-sky-view-of-a-building-xbVyCa1pYoQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></figcaption>
</figure>

My team spent several weeks evaluating agent frameworks before building our first production agent. We ran proof-of-concept implementations with multiple candidates, read a lot of documentation, and ultimately made a choice that we later reversed — not because the framework was bad, but because our own infrastructure had quietly grown to cover everything it was providing.

This post is a record of that process. It covers what each major framework actually gives you, walks through the landscape of current options, and ends with the pattern we extracted: that the value of a framework is not fixed, and the right time to reach for one depends heavily on what you've already built.

## What Frameworks Actually Provide

Before comparing tools, it's worth being precise about what problem they are solving. An agent, at its core, is a model in a loop with tools (if that framing is new, see [the previous post](/blog/agents-are-just-a-while-loop)). That loop is not complicated to write yourself. So what does a framework add?

Most frameworks cluster around the same set of concerns:

| Concern | What it means in practice |
| :--- | :--- |
| **The agent loop** | Managing the model call, parsing tool use responses, re-entering the loop, and handling termination. The repetitive scaffolding you'd write from scratch. |
| **Tool registration** | A structured way to define tools, their input schemas, and their implementations, then pass them to the model correctly. |
| **Retries and error handling** | Rate limit backoff, transient error recovery, and graceful degradation when tool calls fail. |
| **Observability** | Tracing, span creation, token counting, and integration with monitoring systems so you can see what the agent did. |
| **Multi-agent routing** | Patterns for handing off between specialized agents, orchestrating parallel subagents, or managing a hierarchy. |
| **State management** | Persisting conversation history, managing context windows, and passing state between agent steps. |

This list is the lens we used for evaluation. It's also the list you should check against your own infrastructure before picking anything. If you already have a retry layer, a tracing system, and a router — you have most of a framework already.

## The Frameworks

What follows is an assessment of each major option. My team ran full proof-of-concept implementations on some of these; others are informed assessments based on documentation, community signal, and direct evaluation without a complete build. I note which is which.

<div class="grid grid-cols-1 gap-8 my-12">

  <!-- Claude Agent SDK -->
  <div class="border border-border rounded-lg overflow-hidden bg-surface shadow-sm transition-all duration-300 hover:shadow-md">
    <div class="flex flex-wrap items-center justify-between px-6 py-4 bg-accent-soft/30 border-b border-border gap-2">
      <span class="font-bold text-base text-foreground">Anthropic Agent SDK</span>
      <div class="flex flex-wrap gap-2">
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Open Source</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">Python &amp; TS</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">Full POC</span>
      </div>
    </div>
    <div class="p-6 space-y-4">
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        Anthropic's first-party SDK has a clean API and works well. The primitives feel right: tool definition is straightforward, the agent loop is well-abstracted, and the TypeScript and Python interfaces are symmetric enough that a team working in both languages can reason about them together.
      </p>
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        Our POC worked well. The dealbreaker was model lock-in. The SDK is designed around Claude, and while you can technically adapt it, the abstraction does not generalize cleanly to other providers. For teams certain they will only ever use Claude, this is a non-issue. For teams that want to route across providers or hedge against pricing changes, it's a real constraint.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md p-4 border border-emerald-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-emerald-800 dark:text-emerald-400">Strengths</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">First-party quality; well-maintained</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Clean, ergonomic API surface</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Strong TypeScript and Python support</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Tight integration with Claude features</li>
          </ul>
        </div>
        <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md p-4 border border-red-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-red-800 dark:text-red-400">Limitations</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Model lock-in to Claude</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Multi-provider routing requires adaptation</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Smaller community than framework-agnostic</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- OpenAI Agents SDK -->
  <div class="border border-border rounded-lg overflow-hidden bg-surface shadow-sm transition-all duration-300 hover:shadow-md">
    <div class="flex flex-wrap items-center justify-between px-6 py-4 bg-accent-soft/30 border-b border-border gap-2">
      <span class="font-bold text-base text-foreground">OpenAI Agents SDK</span>
      <div class="flex flex-wrap gap-2">
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Open Source</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">Python &amp; TS</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-neutral-100 text-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300">Assessed</span>
      </div>
    </div>
    <div class="p-6 space-y-4">
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        OpenAI’s agent SDK (formerly Swarm) is a lightweight, model-agnostic framework supporting both Python and TypeScript with feature parity between the two. It is provider-agnostic — while it works well with OpenAI’s APIs, it supports 100+ other LLMs through its provider abstraction. We did not build a full POC, but evaluated it based on documentation and community signal.
      </p>
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        The SDK has a small, deliberate primitive set: agents, handoffs, guardrails, and tracing. That minimalism is a genuine design choice rather than a limitation — it keeps the abstraction surface low. The community signal at the time of our evaluation was positive but not as strong as LangGraph's. For teams already invested in the OpenAI ecosystem who want a low-ceremony option with broad model support, it is worth evaluating seriously.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md p-4 border border-emerald-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-emerald-800 dark:text-emerald-400">Strengths</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Model-agnostic; supports 100+ LLMs</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Full Python &amp; TS parity</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Small, low-ceremony API surface</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Built-in tracing and guardrails</li>
          </ul>
        </div>
        <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md p-4 border border-red-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-red-800 dark:text-red-400">Limitations</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Minimalist — less built-in for complex flows</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Newer; some advanced features Python-first</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Smaller community than LangGraph</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Mastra -->
  <div class="border border-border rounded-lg overflow-hidden bg-surface shadow-sm transition-all duration-300 hover:shadow-md">
    <div class="flex flex-wrap items-center justify-between px-6 py-4 bg-accent-soft/30 border-b border-border gap-2">
      <span class="font-bold text-base text-foreground">Mastra</span>
      <div class="flex flex-wrap gap-2">
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Open Source</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">TypeScript</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">Full POC</span>
      </div>
    </div>
    <div class="p-6 space-y-4">
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        Mastra is a TypeScript-native agent framework with a broad feature set: agents, workflows, tool integrations, memory, and RAG pipelines. It is model-agnostic and supports most major providers through its integration layer.
      </p>
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        Our POC was solid. The API has more surface area than the first-party SDKs, which is both a feature and a liability depending on how much you want the framework to own. The workflow primitives are genuinely useful for multi-step, conditional agent logic. If you are building in TypeScript and want a batteries-included option that does not lock you to a model provider, Mastra is worth a serious look.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md p-4 border border-emerald-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-emerald-800 dark:text-emerald-400">Strengths</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Model-agnostic and provider-rich</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">TypeScript-native with strong types</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Broad feature set: agents, workflows, RAG</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Active development &amp; community</li>
          </ul>
        </div>
        <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md p-4 border border-red-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-red-800 dark:text-red-400">Limitations</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">More API surface area to learn</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Python support is secondary</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Younger project; API surface evolving</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- LangGraph -->
  <div class="border border-border rounded-lg overflow-hidden bg-surface shadow-sm transition-all duration-300 hover:shadow-md">
    <div class="flex flex-wrap items-center justify-between px-6 py-4 bg-accent-soft/30 border-b border-border gap-2">
      <span class="font-bold text-base text-foreground">LangGraph</span>
      <div class="flex flex-wrap gap-2">
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Open Source</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">Python &amp; TS</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">Full POC</span>
      </div>
    </div>
    <div class="p-6 space-y-4">
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        LangGraph models agent behavior as a state machine: a directed graph of nodes, each of which can call a model, run a tool, or make a routing decision. It is part of the LangChain ecosystem but usable independently. Both Python and TypeScript SDKs exist, though their maturity at the time of our evaluation was not equal.
      </p>
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        We ran a full POC, it passed, and we initially chose LangGraph. Between the two strong candidates (Mastra and LangGraph), we did not have a decisive technical reason to prefer one — both were capable of what we needed. We picked LangGraph and then found a bug in the TypeScript SDK’s agent loop for tool calling during a beta phase, before any production deployment.
      </p>
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        That bug prompted us to audit what LangGraph was actually providing beyond the agent loop itself. The answer was: not much we didn’t already have. Observability and routing were all already handled by existing infrastructure. Removing LangGraph was a smaller lift than working around the bug, so we removed it.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md p-4 border border-emerald-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-emerald-800 dark:text-emerald-400">Strengths</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Graph model is powerful for conditional flows</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Model-agnostic</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Strong Python SDK &amp; large community</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">First-class persistence &amp; checkpointing</li>
          </ul>
        </div>
        <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md p-4 border border-red-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-red-800 dark:text-red-400">Limitations</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">TypeScript SDK lags Python in maturity</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Graph adds overhead for simple linear agents</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">LangChain ecosystem baggage</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Vercel AI SDK -->
  <div class="border border-border rounded-lg overflow-hidden bg-surface shadow-sm transition-all duration-300 hover:shadow-md">
    <div class="flex flex-wrap items-center justify-between px-6 py-4 bg-accent-soft/30 border-b border-border gap-2">
      <span class="font-bold text-base text-foreground">Vercel AI SDK</span>
      <div class="flex flex-wrap gap-2">
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Open Source</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">TypeScript</span>
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-neutral-100 text-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300">Assessed</span>
      </div>
    </div>
    <div class="p-6 space-y-4">
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        The Vercel AI SDK is primarily a TypeScript library for building AI-powered interfaces. It is model-agnostic and has excellent support for streaming, React Server Components, and edge runtimes. Its agent primitives are functional but feel secondary to its core strength, which is UI integration.
      </p>
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        We did not build a full POC. For teams building Next.js applications where the agent is part of the UI layer, this is probably the most ergonomic option. For teams building backend-heavy agents or agentic pipelines that do not touch a frontend, other options will be a better fit.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md p-4 border border-emerald-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-emerald-800 dark:text-emerald-400">Strengths</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Excellent streaming and React integration</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Clean provider abstraction; model-agnostic</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">TypeScript-first with strong types</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Great for Next.js &amp; edge runtimes</li>
          </ul>
        </div>
        <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md p-4 border border-red-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-red-800 dark:text-red-400">Limitations</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Agent primitives are not the primary focus</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Less suited for complex multi-agent setups</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Python is not supported</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Roll your own -->
  <div class="border border-border rounded-lg overflow-hidden bg-surface shadow-sm transition-all duration-300 hover:shadow-md">
    <div class="flex flex-wrap items-center justify-between px-6 py-4 bg-accent-soft/30 border-b border-border gap-2">
      <span class="font-bold text-base text-foreground">Roll Your Own</span>
      <div class="flex flex-wrap gap-2">
        <span class="text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">Any Language</span>
      </div>
    </div>
    <div class="p-6 space-y-4">
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        The agent loop is not complicated. A model call, a tool dispatch, a recursive re-entry, and a termination condition. You can write this in an afternoon. The question is whether doing so leaves you without things you will need later: observability, retries, structured tool registration, state management.
      </p>
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        For many teams, those things already exist in some form. A retry layer in the HTTP client. An OpenTelemetry integration. A router. If you audit what you have and find it covers the table above, you may find that a framework is adding ceremony without adding capability.
      </p>
      <p class="text-sm leading-relaxed opacity-85 font-light italic">
        This is not an argument against frameworks. It is an argument for being honest about the accounting. The risk of rolling your own is that you quietly rebuild a framework badly, one incident at a time. The risk of adopting one is that you add a dependency whose value diminishes as your own stack matures. Both risks are real.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md p-4 border border-emerald-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-emerald-800 dark:text-emerald-400">Strengths</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">No external dependency to maintain</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">Exact fit to your infrastructure &amp; conventions</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['+'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">No abstraction overhead on the critical path</li>
          </ul>
        </div>
        <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md p-4 border border-red-500/10">
          <span class="text-[10px] font-black tracking-wider uppercase mb-3 block text-red-800 dark:text-red-400">Limitations</span>
          <ul class="list-none pl-0 m-0 space-y-2">
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">You own everything that goes wrong</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Easy to under-invest in observability/retries</li>
            <li class="text-xs font-light opacity-90 pl-5 relative before:content-['−'] before:absolute before:left-0 before:text-red-600 before:font-bold">Requires discipline to avoid reinvention</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

</div>

## The Twist

We chose LangGraph over Mastra without a decisive technical reason. Both passed their POCs. During integration, we discovered a bug in the TypeScript SDK's agent loop for tool calling — an open issue on their GitHub, not something we were the first to hit. That discovery prompted us to audit what we were actually getting from LangGraph beyond the agent loop itself. The answer, line by line:

- **Observability** — already handled by our existing OTel integration
- **Routing** — already handled by our model router
- **The agent loop** — this was the only thing LangGraph was still providing

The agent loop was the one remaining contribution, and it had a known bug. Since that was the only surface we were using, ripping LangGraph out and building the loop ourselves was a smaller lift than working around the issue. We did exactly that, and the system got simpler.

> **Note**
> This is not a story about LangGraph being a bad framework. It is a story about constraints. If we had none of that existing infrastructure to begin with, LangGraph would have given us real value. By the time we discovered the bug, it was providing exactly one thing — and that one thing was already within reach to build ourselves.

## The Generalizable Pattern

The framework evaluation problem has an underappreciated time dimension. The value a framework provides is not constant — it depends on what your infrastructure can already do. A framework that provides five things you need on day one might provide only one of them six months later, once your stack has grown into the other four.

This suggests two things:

First, the standard framework evaluation checklist (does it support our language, is it model-agnostic, is the community active) is necessary but not sufficient. The more useful question is: which rows in the table from section one does my team genuinely lack? Be honest about this. Teams tend to overestimate what they need and underestimate what they already have.

Second, the decision is not permanent. Frameworks get added and removed from production systems. Treating the choice as reversible reduces the pressure to get it right on the first try and makes it easier to update the decision when the underlying constraints change.

## Practical Heuristics

Given all of the above, here is how I would approach the decision:

1. **Audit your infrastructure first.** Before looking at any framework, check which rows in the table above you already cover. Be specific: not “we have retries somewhere” but “we have retry logic on all LLM calls with exponential backoff and a dead-letter path.” The gap between what you have and what you need is the actual problem to solve.
2. **Match framework scope to team context. &nbsp;** A TypeScript-only team should not adopt a framework whose Python SDK is the maintained one. A team building a Next.js application with streaming AI features should look at the Vercel AI SDK before anything else. Let context drive the shortlist.
3. **Build a real POC, not a toy.** The thing that matters is whether the framework works under your actual constraints: your tooling, your deployment environment, your model routing requirements. A hello-world agent tells you almost nothing.
4. **When two options are both adequate, pick one and move.** Optimization paralysis here costs more than a suboptimal choice. Both Mastra and LangGraph passed our evaluation. We picked one. The cost of that coin flip was negligible compared to the cost of continuing to evaluate.
5. **Revisit the decision as your stack matures.** Set a reminder. Six months after adopting a framework, ask the same audit question again: which of the six concerns is it still providing that your own infrastructure is not? If the answer is none, the calculus may have changed.

The goal is not to pick the best framework. The goal is to ship agents that work reliably, and to do so without accumulating dependencies that outlive their usefulness. Sometimes that means adopting a framework. Sometimes it means removing one. The right answer depends on where you are, not just on which framework scores best in a comparison table.
