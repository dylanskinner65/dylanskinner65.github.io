---
slug: "agents-are-just-a-while-loop"
title: "Agents Are Just a While Loop"
date: "2026-05-09"
description: "Demystifying AI agents by showing they are just a language model in a while loop with tools."
quote: "The cycle of life is a cycle of loops."
quoteAuthor: "Anonymous"
category: "Math & ML"
---

The term "AI Agent" has become heavily overloaded. Depending on who you ask, an agent might be a fully autonomous digital employee, a complex multi-step reasoning system, or simply any LLM with a system prompt. This ambiguity makes it difficult to reason about what agents actually are and how to build them effectively.

<figure class="flex flex-col items-center my-8">
    <img src="/blog_files/agents_loop/intro_picture.jpg" alt="A robotic arm." class="w-full max-w-3xl h-auto rounded-none shadow-2xl border border-foreground/5" />
    <figcaption class="mt-4 text-center italic opacity-60">Photo by <a href="https://unsplash.com/@possessedphotography?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Possessed Photography</a> on <a href="https://unsplash.com/photos/white-robotic-arm-jIBMSMs4_68?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a></figcaption>
</figure>

<div class="thesis">
    An agent is a language model called repeatedly in a loop, with the ability to invoke tools, until it decides it's done.
</div>

I am focusing on the loop specifically because modern agent frameworks often hide it behind layers of abstraction. While these frameworks provide immense value, you cannot effectively reason about their trade-offs until you have seen exactly what is being framed.

## The Loop, Visualized

<div class="flex justify-center my-8">
    <svg class="agent-loop-svg w-full max-w-2xl" width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="transparent" />
        <style>
            .box { fill: var(--diagram-box); stroke: var(--diagram-stroke); stroke-width: 2; transition: all 0.4s ease; }
            .diamond { fill: var(--diagram-diamond); stroke: var(--accent); stroke-width: 2; transition: all 0.4s ease; }
            .text { font-family: 'Open Sans', sans-serif; font-size: 14px; fill: var(--diagram-text); text-anchor: middle; transition: all 0.4s ease; }
            .arrow { stroke: var(--diagram-arrow); stroke-width: 2; fill: var(--diagram-arrow); transition: all 0.4s ease; }
            .exit { stroke: var(--foreground); stroke-width: 2; fill: var(--foreground); transition: all 0.4s ease; }
        </style>
        <rect x="225" y="20" width="150" height="60" rx="5" class="box" />
        <text x="300" y="55" class="text">Call the Model</text>
        <path d="M 300 120 L 400 170 L 300 220 L 200 170 Z" class="diamond" />
        <text x="300" y="165" class="text">Tool calls in</text>
        <text x="300" y="185" class="text">response?</text>
        <rect x="50" y="140" width="120" height="60" rx="5" class="box" />
        <text x="110" y="175" class="text">Execute Tools</text>
        <rect x="50" y="20" width="120" height="60" rx="5" class="box" />
        <text x="110" y="50" class="text">Append results</text>
        <text x="110" y="65" class="text">to history</text>
        <rect x="430" y="140" width="120" height="60" rx="5" class="box" style="stroke: #222;" />
        <text x="490" y="175" class="text" style="font-weight: bold;">Done</text>
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--diagram-arrow)" />
            </marker>
            <marker id="arrowhead-exit" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--foreground)" />
            </marker>
        </defs>
        <line x1="300" y1="80" x2="300" y2="118" class="arrow" marker-end="url(#arrowhead)" />
        <line x1="200" y1="170" x2="172" y2="170" class="arrow" marker-end="url(#arrowhead)" />
        <line x1="110" y1="140" x2="110" y2="82" class="arrow" marker-end="url(#arrowhead)" />
        <line x1="170" y1="50" x2="222" y2="50" class="arrow" marker-end="url(#arrowhead)" />
        <line x1="400" y1="170" x2="428" y2="170" class="exit" marker-end="url(#arrowhead-exit)" />
        <text x="185" y="160" class="text" style="font-size: 12px;">Yes</text>
        <text x="412" y="160" class="text" style="font-size: 12px;">No</text>
    </svg>
</div>

It is important to emphasize that the model is not "running" the loop—our code is. The model is a stateless function that transforms an input sequence into an output sequence. Sometimes that output contains structured requests for tool usage. Our code, the orchestrator, decides whether to fulfill those requests and how to feed the results back into the model's next turn. This division of labor is where all agentic behavior originates.

## The Loop, in Code

To make this concrete, let's look at the three components of a minimal agent loop. We will use a generic `LLMClient` to represent a model-agnostic interface.

### 1. Tool Definition

:::code-tabs
```python
def get_weather(city: str):
    # In a real app, this would call an API
    return f"The weather in {city} is sunny, 72°F."

weather_tool = {
    "name": "get_weather",
    "description": "Get the current weather for a specific city.",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "The city name"}
        },
        "required": ["city"]
    }
}
```

```typescript
async function getWeather(city: string) {
    // In a real app, this would call an API
    return `The weather in ${city} is sunny, 72°F.`;
}

const weatherTool = {
    name: "get_weather",
    description: "Get the current weather for a specific city.",
    parameters: {
        type: "object",
        properties: {
            city: { type: "string", description: "The city name" }
        },
        required: ["city"]
    }
};
```
:::

Notice that the function implementation and the schema provided to the model are separate. The model never executes the function directly; it merely produces a string that we parse as a request to call it.

### 2. The Loop Itself

:::code-tabs
```python
from llm_library import LLMClient

client = LLMClient()
messages = [{"role": "user", "content": "What's the weather in San Francisco?"}]
tools = [weather_tool]

for _ in range(max_iters := 10):
    # A generic call to our newest model
    response = client.chat(
        model="newest-model",
        messages=messages,
        tools=tools
    )
    
    # The model provides its message/reasoning
    messages.append(response.message)
    
    # If the model didn't ask for a tool, we are finished
    if not response.tool_calls:
        break
        
    for call in response.tool_calls:
        # Execute the tool and append the result to history
        result = get_weather(**call.args)
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": result
        })

print(messages[-1]["content"])
```

```typescript
import { LLMClient } from 'llm-library';

const client = new LLMClient();
let messages = [{ role: 'user', content: "What's the weather in San Francisco?" }];
const tools = [weatherTool];

for (let i = 0; i < 10; i++) {
    // A generic call to our newest model
    const response = await client.chat({
        model: "newest-model",
        messages: messages,
        tools: tools
    });

    // The model provides its message/reasoning
    messages.push(response.message);

    // If the model didn't ask for a tool, we are finished
    if (!response.toolCalls) {
        break;
    }

    for (const call of response.toolCalls) {
        // Execute the tool and append the result to history
        const result = await getWeather(call.args.city);
        messages.push({
            role: 'tool',
            toolCallId: call.id,
            content: result
        });
    }
}

console.log(messages[messages.length - 1].content);
```
:::

### 3. Sample Run Output

:::code-tabs
```text
[Model Request] get_weather(city="San Francisco")
[Tool Result] "The weather in San Francisco is sunny, 72°F."
[Model Final Response] The current weather in San Francisco is sunny and 72°F.
```
:::

## Analysis of the Loop

Writing the loop yourself reveals three fundamental truths about agentic systems.

### The model emits structured tool calls; we execute them.
Every safety boundary and control mechanism lives in the gap between the model proposing an action and our code executing it. This is why "human-in-the-loop" is a trivial addition to this pattern: it's just another conditional check before tool execution.

### "Done" is a decision we made, not something the model told us.
We break the loop when the model stops requesting tools. This means the exit condition is emergent. Whenever you see a clever agentic technique, look at the exit condition first—that is usually where the actual logic resides.

### State lives in the conversation history.
The messages array is the agent's memory. Because the model is stateless, every iteration must include the full context of previous turns and tool results. This makes agent behavior remarkably tractable to debug: if the agent made a mistake in iteration 7, you can look exactly at what it "saw" in iteration 6.

## A Small Experiment
Consider adding a second tool, `get_time(city)`, and asking the agent: "What's the weather and local time in Tokyo?" Without changing a single line of the loop logic, the same code will now handle a multi-step request. The model will request the weather, then the time (or both at once), and the loop will iterate until both are resolved. Behavior we might describe as "the agent figured out it needed two pieces of information" emerged purely from a richer tool surface and a capable model.

## What This Minimal Version is Hiding

While the core loop is simple, productionizing it forces you to address several non-trivial design decisions.

### Token budgets and runaway loops
The `max_iters` constant is the only thing preventing a logic error or a confusing prompt from spiraling into an infinite loop of expensive API calls. In production, bounding cost and latency is a primary design decision, not an afterthought.

### Tool design is interface design
The model is the user of your tools. If your tool returns a massive, unformatted JSON blob, the model might run out of context or hallucinate. If your tool description is vague, the model will use it incorrectly. Tool quality almost always dominates agent quality.

### The system prompt is doing more than you think
We didn't write a system prompt in our example. In production, the system prompt defines the agent's "personality," its guardrails, and its reasoning style. The size and complexity of this prompt also determine whether features like prompt caching can effectively reduce your costs.

### Frameworks exist for a reason
While the loop is simple, productionizing it is not. Frameworks like LangGraph, Vercel AI SDK, or Mastra package retries, tracing, durable execution, and multi-tenancy. Understanding the raw loop allows you to evaluate these frameworks on their merits rather than viewing them as black boxes.

### Observability isn't optional
When a 30-line script fails, you look at the console. When a complex agent fails on iteration 7 of a 10-iteration task, log lines won't save you. You need traces that show the exact state of the message history and tool inputs at every single step of the journey.

## Note for readers who like the comparison to MDPs
The agent loop has the *shape* of a Markov Decision Process (MDP), which I've written about [previously](/blog/mdp-bo). You have state (conversation history), actions (model responses), transitions (tool execution), and observations (tool results). However, there are two critical asymmetries: the policy is a frozen LLM rather than something learned through interaction, and the reward signal is implicit in the model's judgment of completion rather than an explicit scalar. Reaching for Reinforcement Learning intuitions about convergence or value functions will likely mislead; agents are better understood as sequential programs with a stochastic decision-maker.

## Conclusion: What to do with this
The most effective way to demystify agents is to run those thirty lines of code. Swap in a tool you actually care about, add a second tool with overlapping functionality, and observe how the model handles them. Pay attention to the moments where you find yourself thinking, "I wish the framework handled this part"—those are your real requirements.

Most of what you will read about agents moving forward is a variation on this fundamental loop. Once you have built the loop yourself, the literature stops being a foreign language and starts being a set of architectural opinions that you can engage with on their merits.
