---
slug: "tools-as-ux-for-the-model"
title: "Tools as UX for the Model"
date: "2026-07-23"
description: "Tool design is interface design for a very literal user: the model. What the model actually sees, concrete principles for designing tools well, and a real example in the Linear MCP server."
quote: "Design is not just what it looks like and feels like. Design is how it works."
quoteAuthor: "Steve Jobs"
category: "Math & ML"
---

<figure class="flex flex-col items-center my-8">
    <img src="/blog_files/tools_as_ux/tools_intro.webp" alt="Gold pipes running along a wall." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">Photo by <a href="https://unsplash.com/@victor_g?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Victor</a> on <a href="https://unsplash.com/photos/gold-pipes-UoIiVYka3VY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></figcaption>
</figure>

<div class="thesis">
    Tool design is interface design. The difference is that your user isn't a person clicking buttons — it's a model reading text. Everything you know about good UX still applies. You just have a very literal, very fast user who only ever sees the contract.
</div>

Most engineers think of tools as plumbing. You have a function, you wrap it so the model can call it, you move on. The wrapping is treated as a mechanical translation step: take the API you already have, expose it, done.

This is the single most common way agents get quietly hobbled. The model is only as capable as the tools you hand it, and it interacts with those tools through an interface you designed — whether or not you thought of it as design. A confusingly named tool, an overloaded parameter, a wall of JSON returned where three fields would do: each of these degrades the agent in ways that look like model failures but are actually interface failures.

This post argues that tools are a design surface, walks through what the model actually sees, and lays out concrete principles for designing tools well — drawing on the Model Context Protocol (MCP) specification, which encodes a lot of hard-won wisdom worth stealing even if you never use MCP directly. It continues the agents series from [Agents Are Just a While Loop](/blog/agents-are-just-a-while-loop) and [Choosing an Agent Framework](/blog/choosing-an-agent-framework).

## What the Model Actually Sees

Start with the thing that matters most and is most often ignored: the model never sees your implementation. It does not see your clean function signature, your carefully named private variables, or the comment you wrote explaining the edge case. It sees the *contract* — the tool's name, its description, and its input schema. That is the entire interface.

The MCP specification makes this contract explicit. A tool definition is essentially three things:

```typescript
{
  name: string;          // Unique identifier for the tool
  description?: string;  // Human-readable description
  inputSchema: {         // JSON Schema for the tool's parameters
    type: "object",
    properties: { ... }  // Tool-specific parameters
  }
}
```

That is what the model is handed. Three fields. When your agent picks the wrong tool, passes a malformed argument, or ignores a tool entirely, the cause is almost always something in those three fields. The name was ambiguous. The description didn't explain when to use it. The schema allowed a shape the model couldn't reason about.

Reframing this as UX is not a metaphor stretch. The name is the label on the button. The description is the tooltip and the docs. The input schema is the form the user has to fill out. And the return value is the screen that comes back after they submit. Design each of those badly and your user — the model — makes mistakes, the same way a human would with a badly labeled form.

> **The core reframe**
> Traditional API design is optimized for developers and functional completeness. Agent tool design is optimized for a model and cognitive friendliness. These are different goals, and a tool that is excellent for a human programmer can be actively hostile to an agent.

## Design Principles

Here are the principles that have the highest leverage. Several are drawn directly from the guidance the MCP team and Anthropic have published on writing effective tools; I have found all of them to hold up in practice.

### Naming and namespacing

The tool name is the first thing the model reasons about. Names should be unambiguous on their own, without requiring the model to read the full description to disambiguate. When you have many tools, especially across multiple services, namespacing prevents collisions and helps the model group related capabilities.

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 not-prose">
  <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md border border-red-500/10 overflow-hidden">
    <span class="text-[10px] font-black tracking-wider uppercase block px-4 py-2 text-red-800 dark:text-red-400 border-b border-red-500/10">Ambiguous</span>
    <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto m-0 text-foreground/80">search
send
get
update</pre>
  </div>
  <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md border border-emerald-500/10 overflow-hidden">
    <span class="text-[10px] font-black tracking-wider uppercase block px-4 py-2 text-emerald-800 dark:text-emerald-400 border-b border-emerald-500/10">Namespaced &amp; specific</span>
    <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto m-0 text-foreground/80">linear_search_issues
slack_send_message
github_get_pull_request
datadog_search_logs</pre>
  </div>
</div>

The names on the right tell the model both what service it is talking to and what the operation does. When an agent has twenty tools available, this is the difference between confident selection and a coin flip.

### Choose the right abstraction level

The instinct when wrapping an existing API is to expose one tool per endpoint. The emerging consensus is that this is usually the wrong default. Anthropic's guidance on writing tools for agents puts it directly: a common error is building tools that merely wrap existing API endpoints, whether or not those endpoints are appropriate for agents. The reasoning is that agents have different "affordances" than traditional software — most importantly, limited context — so a tool that makes the agent read and stitch together many low-level responses wastes the resource the agent can least afford to spend.

The nuance worth holding onto: this is not a rule that granular tools are bad. It is a case for consolidating around tasks *when consolidation removes work the agent would otherwise have to do in context.* A primitive like `list_events` can be genuinely useful on its own — the problem is only when the agent is forced to chain several primitives together, reasoning over each intermediate result, just to accomplish one obvious task.

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 not-prose">
  <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md border border-red-500/10 overflow-hidden">
    <span class="text-[10px] font-black tracking-wider uppercase block px-4 py-2 text-red-800 dark:text-red-400 border-b border-red-500/10">Forces the agent to orchestrate</span>
    <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto m-0 text-foreground/80">list_users()
list_events()
create_event(user_ids, time)</pre>
  </div>
  <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md border border-emerald-500/10 overflow-hidden">
    <span class="text-[10px] font-black tracking-wider uppercase block px-4 py-2 text-emerald-800 dark:text-emerald-400 border-b border-emerald-500/10">Consolidated around the task</span>
    <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto m-0 text-foreground/80">schedule_event(
  participants,
  topic
)
# finds common free time
# and creates the meeting</pre>
  </div>
</div>

This is the exact example Anthropic uses, and the point is the consolidation, not the deletion of primitives. The task-level tool collapses three calls and the reasoning between them into one; the agent expresses intent ("schedule this meeting") rather than orchestrating primitives. Every step you remove from the agent's plate is a step that can't go wrong and tokens that don't get spent.

There is a real counterweight, though, and it is worth stating so you don't over-correct. Over-wrapping is also a failure mode: if every endpoint becomes a narrowly-defined bespoke tool with no shared structure, the tool surface fragments and gets *harder* for the model to navigate, not easier. And when a tool wraps a well-documented public API the model already has strong training priors for, a thin wrapper that exposes the familiar interface can actually outperform a clever custom abstraction that introduces inconsistencies the model has never seen. The goal is not maximal abstraction; it is a consistent, task-aligned abstraction that matches how an agent will actually work.

### Input schemas that make valid calls easy

The input schema is a form. Good forms constrain the input space so that invalid entries are hard to express. Use enums instead of free text where the options are known. Mark required fields as required. Provide sensible defaults so the model only has to specify what matters. Use descriptive parameter names, and add per-parameter descriptions when the meaning isn't obvious from the name.

A schema that accepts `{ operation: string }` and expects the model to know the seven valid operation strings is a trap. A schema with `operation: enum["sum", "average", "count"]` hands the model the menu. Notably, the newer MCP revisions extend tool schemas to full JSON Schema 2020-12, allowing composition (`oneOf`, `anyOf`) and conditionals — more expressive power to make valid calls easy and invalid ones unrepresentable.

### Return meaningful context, not raw data

What a tool returns is as much a part of the interface as what it accepts. The temptation is to return the full API response and let the model sort it out. But the model pays for every token it reads, and internal identifiers, MIME types, and pagination cursors are cognitive noise it has to wade through.

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 not-prose">
  <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md border border-red-500/10 overflow-hidden">
    <span class="text-[10px] font-black tracking-wider uppercase block px-4 py-2 text-red-800 dark:text-red-400 border-b border-red-500/10">Raw dump</span>
    <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto m-0 text-foreground/80">{
  "user_uuid": "a1b2c3d4-e5f6-7890",
  "avatar_256px_url": "https://...",
  "mime_type": "image/jpeg",
  "created_ts": 1699...
}</pre>
  </div>
  <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md border border-emerald-500/10 overflow-hidden">
    <span class="text-[10px] font-black tracking-wider uppercase block px-4 py-2 text-emerald-800 dark:text-emerald-400 border-b border-emerald-500/10">Model-friendly</span>
    <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto m-0 text-foreground/80">{
  "name": "John Smith",
  "role": "Product Manager",
  "status": "online"
}</pre>
  </div>
</div>

Return what the model needs to make its next decision. If it later needs the UUID to make another call, thread that through internally or provide it as a separate, retrievable field — but don't make the model read it every time.

### Token efficiency

Context is a finite, shared resource, and tools are one of the biggest consumers of it. A `list_contacts` tool that returns every contact might be reasonable for a program but is a disaster for an agent that has to hold all of them in context. Prefer a `search_contacts` tool that returns only what's relevant. Support pagination and filtering. Consider offering both a concise and a detailed response mode so the agent can ask for more only when it needs it.

### Error messages are feedback, not dead ends

This is the principle most often skipped, and it matters enormously because agents are recursive: an error goes back into the loop as input for the next step. A good error message lets the model self-correct. A bad one ends the run.

The MCP spec is deliberate about this. Tool errors should be reported *within the result* — by setting an `isError` flag and including details in the content — rather than thrown as protocol-level failures. The reason is exactly the recursive one: reporting the error in-band means the model sees it and can take corrective action, rather than the whole call blowing up out of the model's view.

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 not-prose">
  <div class="bg-red-500/5 dark:bg-red-500/10 rounded-md border border-red-500/10 overflow-hidden">
    <span class="text-[10px] font-black tracking-wider uppercase block px-4 py-2 text-red-800 dark:text-red-400 border-b border-red-500/10">Dead end</span>
    <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto m-0 text-foreground/80">Error: 422</pre>
  </div>
  <div class="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-md border border-emerald-500/10 overflow-hidden">
    <span class="text-[10px] font-black tracking-wider uppercase block px-4 py-2 text-emerald-800 dark:text-emerald-400 border-b border-emerald-500/10">Actionable</span>
    <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto m-0 text-foreground/80">Error: 'date' must be in
YYYY-MM-DD format. You
provided '11/23/2025'.
Try '2025-11-23'.</pre>
  </div>
</div>

The message on the right tells the model what went wrong, why, and what to do about it. On the next turn, the agent fixes the format and succeeds. The message on the left produces a stuck agent or a hallucinated guess.

## A Worked Example

Let's take one tool from naive to well-designed, applying the principles in order. Imagine we're giving an agent the ability to look up customer orders.

The naive version is a direct wrapper of the database query:

```json
{
  "name": "query",
  "description": "Query the orders table",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sql": { "type": "string" }
    },
    "required": ["sql"]
  }
}
```

This is bad in nearly every way we've discussed. The name is generic. The description explains nothing about when to use it. The schema asks the model to author raw SQL — an unconstrained string that can fail in a thousand ways and is a security liability on top of it. And there is no guidance on what comes back.

Now the designed version:

```json
{
  "name": "orders_find_by_customer",
  "description": "Look up recent orders for a customer by their email or customer ID. Returns order status, total, and date. Use this when you need a customer's order history to answer a support question.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "identifier": {
        "type": "string",
        "description": "Customer email or ID"
      },
      "status": {
        "type": "string",
        "enum": ["all", "open", "shipped", "cancelled"],
        "default": "all"
      },
      "limit": {
        "type": "integer",
        "default": 10,
        "description": "Max orders to return"
      }
    },
    "required": ["identifier"]
  }
}
```

Walk through what changed. The name is namespaced and task-specific. The description says what it does, what it returns, and when to reach for it. The schema replaced arbitrary SQL with a small set of meaningful parameters: an identifier, a constrained status enum, and a bounded limit with a sensible default. The model can now make a confident, valid call with a single required field — and the result set is bounded so it won't flood the context.

The underlying implementation might run the exact same SQL query. The difference is entirely in the interface. That is the whole point.

## A Real Example: The Linear MCP Server

Constructed examples only go so far. It helps to look at a real, widely-used tool surface and see the principles holding up in production. Linear's official MCP server is a good one to study, both because it's a well-designed set of tools and because it's a domain most engineers already understand: issues, projects, comments, cycles.

The server exposes tools for finding, creating, and updating objects in Linear — issues, projects, comments, and more. A representative slice of the toolset looks like this:

```text
list_issues        get_issue
create_issue       update_issue
list_projects      create_comment
list_teams         search_documentation
```

A few design decisions in that list are worth calling out, because they map directly onto the principles above.

### It draws the read/search/get distinction deliberately

Notice there are separate tools for listing issues with filters and for retrieving a single issue by ID. This is the abstraction question in miniature. `list_issues` takes filters (assignee, status, project) and returns a bounded, relevant set — the "skip to the right page" approach rather than dumping the whole backlog into context. `get_issue` is the precise single-record lookup once the agent knows which issue it wants. Two tools, two clearly different jobs.

This also illustrates the one place tool descriptions most often fall short, even in good tools. A reviewer's critique of one community Linear server's `list_issues` description — which said, roughly, "use this to browse and find issues" — was that it never says *when to use it instead of* `get_issue`. Agents frequently have several tools that could plausibly apply, and the description is the only place to disambiguate. The fix is explicit selection guidance: "use this to browse or filter multiple issues; use `get_issue` when you already know the specific issue ID." That one sentence removes a whole class of wrong-tool errors.

### It consolidates create and update where it makes sense

Some versions of the Linear tooling expose a single "save" operation that creates an issue when no ID is given and updates the existing one when an ID is provided. That is a nice example of consolidating around the task ("persist this issue") rather than around the underlying API verbs, without collapsing genuinely distinct operations into an overloaded mess. The parameters make the intent legible — and, notably, Linear's own guidance tells the model to use a friendly `assignee` field that accepts a name, email, or the literal string `"me"`, rather than forcing it to resolve a raw user ID first. That is the "natural language over cryptic identifiers" principle applied exactly where it reduces a step.

### It uses namespacing and stays within a sane tool count

Every tool is scoped to Linear's domain vocabulary, and the official server keeps the surface focused — on the order of a couple dozen tools covering the real daily workflow, comfortably under the point where selection accuracy starts to fall off. When you connect several MCP servers at once, the client typically namespaces each server's tools so `linear`'s issue search doesn't collide with another service's. The lesson to steal: keep a server's toolset scoped to a coherent domain, and resist the urge to expose every last endpoint just because you can.

> **What to take from it**
> The Linear server isn't special because it does something exotic. It's worth studying precisely because it does the ordinary things well: task-shaped tools, clear read-versus-get boundaries, friendly identifiers, a focused surface. When you design your own tools, having a concrete, well-built reference to compare against is worth more than any checklist.

## Tools as a System

Individual tools matter, but the set of tools an agent has is itself a design object. The model reads the whole menu before every decision, and a bad menu causes problems no single well-designed tool can fix.

The failure modes cluster into a few shapes:

- **Over-segmentation.** One tool per API endpoint produces dozens of fine-grained tools, forcing the model to compose them and inflating the surface it has to reason over. Consolidate toward tasks.
- **Overlap.** Two tools that could plausibly handle the same request create choice paralysis. If `search_orders` and `find_orders` both exist, the model wastes reasoning deciding between them — and may choose inconsistently.
- **Too many tools.** Even well-designed tools compete for attention. Past a certain count, selection accuracy drops. Consider whether some tools should be merged, or whether the agent should be split so each has a smaller, focused toolset.

That last point is worth putting real numbers to, because "too many" sounds vague until you see it measured. The effect shows up in a few consistent ways across function-calling research:

- Adding semantically related "distractor" tools to a toolkit costs roughly **one to eight percent** additional accuracy on function-calling benchmarks, mostly from the model picking the wrong function or the wrong parameters as the option set grows.
- Practitioner guidance puts the practical ceiling around **thirty to fifty tools** before selection starts to degrade sharply.
- Selection is also brittle in a way that compounds the problem: merely paraphrasing the same request can swing top-model accuracy by **eleven to nineteen percentage points**, and models' tool preferences are sensitive to ordering — so a large menu is doubly risky, since the model may pick wrong and may pick differently on identical inputs.

The practical takeaway from that research is the same one the consolidation principle points at: prefer a small set of general, composable tools over a large catalog of narrow ones, and if you genuinely need many capabilities, load the specialized ones on demand rather than registering everything up front for the model to scan on every call. (These figures come from aggregate benchmark studies; treat them as directional rather than guarantees for your specific agent — but the direction is consistent enough to design around.)

A useful test: read only your tool names and descriptions, as the model would, and ask whether you could confidently pick the right one for a given task. If you can't, the model can't either.

## Treat Tools Like a Product

The through-line is simple: every hour spent on tool ergonomics pays back in agent reliability, and the payback is often larger than what you'd get from prompt tuning or a model upgrade. The tool interface is where the model meets the world, and a model reasoning against a clear interface behaves dramatically better than the same model reasoning against a confusing one.

So treat your tools like a product you are shipping to a user. Because you are — the user is just a model. Name things clearly. Write descriptions that explain when and why, not just what. Constrain inputs so valid calls are easy and invalid ones are hard. Return what the model needs and nothing it doesn't. Write error messages that teach. And look at the whole toolset as a coherent surface, not a pile of wrapped endpoints.

The [MCP specification](https://modelcontextprotocol.io/specification) is worth reading in full for this reason. Even the parts that look like dry protocol detail — in-band error reporting, schema expressiveness, namespacing conventions — encode real lessons about how models interact with tools. You can borrow that wisdom whether or not you adopt the protocol itself.
