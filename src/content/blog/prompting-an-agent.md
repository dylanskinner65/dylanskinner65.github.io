---
slug: "prompting-an-agent"
title: "Prompting an Agent"
date: "2026-07-25"
description: "A chatbot prompt is a request, but an agent prompt is a policy. In this post we look at finding the right altitude, the principles worth stealing from Anthropic and OpenAI, and why we cannot eyeball whether a prompt change helped."
quote: "If you don't know where you are going, any road will get you there."
quoteAuthor: "Lewis Carroll"
category: "Math & ML"
---

<figure class="flex flex-col items-center my-8">
    <img src="/blog_files/prompting_an_agent/prompting_intro.webp" alt="A close-up of a rock with a pattern on it." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">Photo by <a href="https://unsplash.com/@mattartz?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Matt Artz</a> on <a href="https://unsplash.com/photos/a-close-up-of-a-rock-with-a-pattern-on-it-ahomIKVfN4A?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></figcaption>
</figure>

A chatbot prompt is a request, but an agent prompt is a policy. We are not asking for one output. We are writing operating instructions for something that will run on its own for dozens of turns while nobody is watching.

In this blog post, we will look at what the system prompt is actually for, how to find the right level of detail (Anthropic calls this the right *altitude*), a handful of principles worth stealing from both Anthropic and OpenAI, and why we cannot tell whether a prompt change helped without measuring it.

That difference matters more than it sounds like it should, and the reason is compounding. A chatbot prompt that is ninety percent right gives us a slightly-off answer that we read, notice, and fix. An agent prompt that is ninety percent right gives us a run that looks fine for twelve turns and then quietly derails on turn thirteen (after burning real tokens and possibly taking real actions along the way).

There is good evidence that prompting is one of the highest-leverage things we can adjust. [OpenAI reports](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide) that adding three specific reminders to their agent prompt raised their internal SWE-bench Verified score by close to 20%, and described the effect as transforming the model from a chatbot-like state into a much more "eager" agent that drives the interaction forward on its own. That is a large gain from a handful of sentences, and it's worth understanding why those particular sentences did so much work.

If you recall from my previous blog post on [tool design](/blog/tools-as-ux-for-the-model), we discussed how the model only ever sees the tool contract (the name, the description, and the input schema). Prompting is the other half of that story. Earlier in this series we also looked at [the agent loop itself](/blog/agents-are-just-a-while-loop) and [how to choose a framework](/blog/choosing-an-agent-framework).

## What the System Prompt Is Actually For

When we prompt a chatbot, we are describing an output. When we prompt an agent, we are describing a job. The prompt has to answer questions the model will face at turn thirty (or turn three hundred) that we cannot anticipate now:

- What am I? What is my scope, and what is out of scope?
- When am I done? What does "finished" look like?
- What do I do when I am uncertain? Guess, retry, or ask?
- What am I not allowed to do, no matter what the task appears to require?
- How should I use the tools I have been given?

Those three high-leverage reminders OpenAI identified map neatly onto this framing. The first is **persistence**, which tells the model it is in a multi-message turn and should not hand control back early, only terminating when the problem is actually solved. The second is **tool-calling**, which tells it that when it is not sure about something, it should use its tools to find out rather than guessing or making something up. The third one is optional, and it is **planning**: asking the model to think in text before and after tool calls rather than silently chaining them together. OpenAI measured that last one separately and found that inducing explicit planning improved their pass rate by about 4%.

None of those three are about the task. They are about how to *be* an agent. That's the category of instruction a chatbot prompt never needs and an agent prompt cannot skip.

## Finding the Right Altitude

The most useful concept I've found for agent prompting is what Anthropic calls writing at the right *altitude*. The idea is that a system prompt can fail in two opposite directions, and both of them are common.

- **Too low (hardcoded, brittle logic).** Engineers try to specify exact behavior with sprawling if-then rules for every case they can imagine. This creates fragility, since the agent shatters on the first situation that is not in the list, and the prompt becomes a maintenance burden that grows with every incident.
- **Right (specific enough to guide, flexible enough to adapt).** Strong heuristics rather than exhaustive rules. The agent knows what it is optimizing for and how to reason about tradeoffs, so it can handle a case we never wrote down.
- **Too high (vague, assumes shared context).** Guidance so general that it gives the model no concrete signal. Worse, it can quietly assume the model knows things about our domain, our terminology, and our conventions that were never stated.

The failure I see most frequently in practice is the first one. Something goes wrong in production, so a rule gets added to the prompt. Then another one. Six months later the system prompt is a thousand lines of accumulated special cases (I've watched this happen more than once), and nobody can say whether any given line still matters. The prompt has become a bug tracker!

The fix is not brevity for its own sake. Anthropic's guidance is worth quoting the shape of here: aim for the minimal set of information that fully outlines the expected behavior, and note that minimal does *not* necessarily mean short. We still have to give the agent enough to go on. The process they recommend is to start with a minimal prompt on the strongest model available, see how it does, and then add instructions and examples targeted at the specific failure modes we actually observe. That's a very different activity from preemptively writing rules for everything we can imagine going wrong.

## Principles Worth Stealing

Pulling together guidance from Anthropic, OpenAI, and the broader practitioner conversation, a handful of principles show up again and again.

### Say what to do when uncertain

This is the single most valuable instruction category, and it's the one most frequently missing. An agent facing ambiguity will do *something*, and if we have not said what, it will improvise. So we should tell it explicitly: use your tools to find out rather than guessing, ask the user when you lack information you cannot retrieve, and stop and report rather than proceeding on a bad assumption.

There is a subtle failure mode here that OpenAI documents well. Instructing a model that it must always do something can backfire. If we say "you must call a tool before responding," the model may hallucinate tool inputs or call the tool with null values when it does not have enough information to fill them in. The mitigation is to pair the mandate with an escape hatch (one extra clause is enough), and add that if it does not have enough information to call the tool, it should ask for what it needs. Absolute rules need an explicit alternative, or the model will invent one.

### Do not duplicate what the tool descriptions already say

This one connects directly to [tool design](/blog/tools-as-ux-for-the-model). There are two places to tell the model how to use a tool: the tool's own description, and the system prompt. Putting the same guidance in both wastes context and creates a maintenance hazard, because the two copies will eventually disagree.

The division of labor that works is this. The tool description owns *what the tool does and how to call it correctly*, and the system prompt owns *strategy across tools* (when to prefer one approach over another, how to sequence work, and what to do when a tool fails). OpenAI's guidance adds a practical wrinkle here, which is that we should pass tools through the API's tools field rather than manually injecting schemas into the prompt text. They measured a 2% improvement in SWE-bench pass rate from doing it the supported way, which they attribute to keeping the model in-distribution for tool calling. They also suggest that if a tool is complex enough to need usage examples, those belong in an examples section of the system prompt rather than crammed into the description field.

### Curate examples, do not enumerate edge cases

Few-shot examples remain one of the strongest levers we have. But there is a specific way teams misuse them, which is stuffing a laundry list of edge cases into the prompt in an attempt to articulate every possible rule. [Anthropic explicitly recommends against this](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), and suggests instead that we curate a set of diverse, canonical examples that portray the expected behavior. For a model, examples really are the pictures worth a thousand words. A few examples that demonstrate the *shape* of good judgment will generalize, while thirty examples that each patch one specific hole will not.

### Structure the prompt, and mind where things sit

Both labs converge on organizing prompts into clearly delineated sections (role and objective, instructions, reasoning guidance, output format, examples, and context) using markdown headers or XML tags to mark the boundaries. Anthropic notes that the exact formatting probably matters less as models get more capable, but the discipline of separating concerns still helps us reason about our own prompt.

Position has measurable effects that are worth knowing about. OpenAI found that with long context, placing instructions both before and after the provided content outperformed placing them in only one spot. If we only want them once, above works better than below. They also note that when instructions conflict, the model tends to follow whichever one appears later in the prompt. That is a useful debugging heuristic when an agent seems to be ignoring a rule we are certain we wrote!

### Calibrate to the model we are actually using

Prompting advice is not model-agnostic, and this trips people up when they port a prompt and watch it degrade. OpenAI draws the distinction sharply. A reasoning model is like a senior coworker, where we give it a goal and trust it to work out the details, while a non-reasoning model is more like a junior coworker that performs best with explicit instructions toward a specific output (the analogy is theirs, and I think it is a good one). Prompts written for one can underperform on the other for reasons that have nothing to do with prompt quality in the abstract.

There is a related note on theatrics. OpenAI suggests that it's generally unnecessary to reach for all-caps, bribes, or tips, and recommends starting without them. If we inherited a prompt from an earlier model era and it is full of shouting, that emphasis may now be pulling attention harder than we intend.

### Split the agent before the prompt gets baroque

A prompt that has grown many conditional branches is often telling us something architectural. OpenAI's practical guide to building agents suggests that when prompts contain many if-then-else branches (the kind that make a prompt read like code) and templates get hard to scale, that's a signal to divide the logic across separate agents rather than continuing to grow one prompt.

The same guide makes a point about tools that reinforces my previous post nicely, which is that the problem is not purely the *number* of tools but their similarity and overlap. They note that some implementations successfully handle more than fifteen well-defined, distinct tools, while others struggle with fewer than ten overlapping ones. Anthropic frames the same idea as a test. If a human engineer cannot definitively say which tool should be used in a given situation, we cannot expect an agent to do any better.

## The Prompt Is Not the Only Input

Here is where prompting starts shading into something broader. Our system prompt does not arrive at the model alone. It shows up alongside tool definitions, message history, tool results, and whatever data we have retrieved, and all of it competes for the same finite budget.

Anthropic frames this as the shift from prompt engineering to *context engineering*, which is less about finding the right words and more about the question of what configuration of context is most likely to produce the behavior we want. The reason it matters is that attention is a scarce resource, not just a size limit. Research on "context rot" (which is a great name for it) finds that as the number of tokens in the window grows, the model's ability to accurately recall information from it declines. Some models degrade more gracefully than others, but the effect shows up across models. Anthropic's framing is that we should treat context as a finite resource with diminishing marginal returns, and that good context engineering means finding the smallest set of high-signal tokens that get us the outcome we want.

The practical consequence for prompting is direct. Every sentence in our system prompt is spending part of an attention budget that our tool descriptions and our actual task data also need. A five-hundred-line prompt full of stale special cases is not just hard to maintain. It's actively crowding out the information the agent needs to do the current job.

### Upfront versus just-in-time

One idea from context engineering is worth carrying into prompt design even if we go no further with it. Rather than pre-loading everything the agent might need, we can give it lightweight references (file paths, stored queries, and links) and let it pull data into context at runtime through tools. Anthropic points out that this mirrors how people actually work. We do not memorize entire corpuses. We build filesystems and inboxes and bookmarks, and then we retrieve on demand.

There is a real tradeoff here, since runtime exploration is slower than having the data already there, and it demands that the agent have good enough tools and heuristics to navigate without wasting context on dead ends. In practice a hybrid wins (at least it has for me). We load the small, high-certainty things up front, and let the agent fetch the rest as needed. The prompting question this raises is what belongs in the "always loaded" tier. Usually that's identity, scope, boundaries, and strategy. Usually it is not data that only some runs will need.

> **Scope note**
> There is considerably more to context engineering than what we covered here, including compaction, structured note-taking, and sub-agent architectures for long-horizon work. Those are real techniques and they deserve more room than one section, so I've kept this to the part that changes how we write a prompt.

## We Cannot Eyeball This

One theme runs through every source I looked at, from both labs: prompting is empirical, and intuition is not a substitute for measurement. OpenAI states it plainly. AI engineering is inherently an empirical discipline and models are inherently nondeterministic, so we should build informative evals and iterate to confirm that our prompt changes are actually helping.

Their own measurements are the argument for why. The three reminders we discussed above (persistence, tool-calling, and planning) moved SWE-bench Verified by close to 20%. Inducing explicit planning accounted for about 4% of that on its own (from one instruction!). Passing tool schemas through the API instead of the prompt text moved it about 2%. That last one is the telling case. A 2% shift in task completion is invisible if we are reading a few transcripts and forming an impression, but it is very much not invisible to a user running the agent a thousand times a day. OpenAI only knows those numbers because they had a fixed set of tasks and a consistent way of scoring them.

The uncomfortable corollary is that if small edits can produce gains that size, then small edits can produce losses that size too. A prompt change that looks obviously harmless can cost us several points of task completion, and without evals we will not find out until something breaks in a way a user notices.

Which brings me to the honest answer to what you might have wanted from this post. There is no prompt template that just works. There is a set of principles that get us a reasonable starting point, and then there is the loop of running real tasks, reading the transcripts, finding where the agent got confused, and fixing that specific thing. The principles narrow the search, but they do not replace it.

## Where This Leaves Us

Four posts in, the picture is reasonably complete. An agent is a model in a loop with tools. The framework around that loop is worth adopting only insofar as it provides something our own infrastructure does not. The tools are an interface, and the model is their user. And the prompt is the policy that governs how all of it behaves when nobody is watching.

What strikes me looking back is how much the four posts share a shape. Each one is really about the same discipline: being precise about what the model can actually see, honest about what our infrastructure actually provides, and empirical about whether our changes actually help. The failure modes across all four rhyme, and they are accumulating things we do not need, assuming context the model does not have, and trusting intuition where we should have measured.

There is plenty left over. Context management over long horizons is a deep topic that I only touched on. Evals deserve their own treatment (and probably their own post) rather than being the thing I keep gesturing at. Multi-agent architecture is a whole design space. If any of those turn into posts, they will show up here!

In the meantime, the two sources I would point at first are Anthropic's [writeup on context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) and OpenAI's [model-specific prompting guides](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide). Both of them are more detailed than anything I could compress into one post, and both are written by people running these systems at a scale (far beyond anything I've run myself) that makes their empirical claims worth taking seriously.
