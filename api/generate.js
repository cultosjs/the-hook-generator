export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, niche, topic, post, hook } = req.body;

  if (!action) {
    return res.status(400).json({ error: "Action is required." });
  }

  let prompt = "";

  if (action === "hooks") {
    if (!niche || !topic) {
      return res.status(400).json({ error: "Niche and topic are required." });
    }

    prompt = `You are a LinkedIn ghostwriter who writes in a very specific, proven style. Your job is to write hooks that stop the scroll and make the exact right person feel like this post was written specifically for them.

Here is the niche: ${niche}
Here is the post topic: ${topic}

Study these real examples of high-converting hooks written in the exact style you must match:

RESULT hooks:
- "A client posted every week for 11 months straight. Zero inbound leads. Here's why views lie:"
- "My clients were posting 14 times a week and still stuck at $20K a month. 18 months of consistent content. Zero compounding."
- "A leadership coach came to me posting 3 times a week for 6 months straight. Good engagement. Decent follower growth. Zero inbound clients from content."

CURIOSITY hooks:
- "You see these numbers and think I need to post more. That's the wrong lesson."
- "Most business owners grind for new ideas every week. Nothing compounds. Nothing converts. Nothing stacks."
- "Your content isn't broken. Your system is."

STORY hooks:
- "I built a complete content system. I was too afraid to publish a single word of it, for 18 months."
- "Before The Cult Brand, I was a video editor. Slow devices. Low pay. Long hours. I hated every second."

CONTRADICTION hooks:
- "Most business owners blame themselves for inconsistent content. The real problem has nothing to do with discipline."
- "Motivational content is the reason you have no clients."
- "Showing your client results is not building trust. Showing what you actually did to get those results is."

BOLD CLAIM hooks:
- "Most coaches post content every week and get zero clients from it. Not because they are bad at what they do. Because their content is a billboard, not a bridge."
- "The algorithm is not why clients aren't coming."
- "Your content isn't the problem. Your system is."

EDUCATIONAL hooks:
- "The reason your content is not getting clients has nothing to do with how often you post. It is who you are posting for."
- "Every piece of content you write needs to do 3 things. Only 3. And they are simple."
- "Most business owners believe consistency plus value equals clients. It doesn't."

HOW TO hooks:
- "Here is exactly how to turn one client result into a post that brings in three more."
- "Here is the simplest way to know if your content is a billboard or a bridge."
- "Here is what I found when I audited their content system in 30 minutes."

Now generate exactly 14 hooks for the niche and topic provided. Use all 7 types, 2 hooks each.

Rules you must follow without exception:
- Every hook must be 1 to 3 short punchy sentences. Maximum.
- Name a specific person, situation, number, or pain point. Never be vague.
- The hook must make the exact right reader feel like you wrote it for them specifically.
- Short sentences. One idea per sentence. Never combine two ideas.
- Never use em dashes.
- Never use corporate language or buzzwords.
- RESULT hooks must include a specific number, timeframe, or measurable outcome.
- HOW TO hooks must start with "Here is" not "How to".
- CONTRADICTION hooks must challenge something the reader currently believes.
- EDUCATIONAL hooks must state a sharp insight or truth the reader has not considered.
- The hook must create enough tension or curiosity that stopping is the only option.

Return your response as a JSON array only. No explanation. No preamble. No markdown code fences. Just raw JSON:
[
  {"type": "RESULT", "hook": "hook text here"},
  {"type": "CURIOSITY", "hook": "hook text here"}
]`;

  } else if (action === "rewrite") {
    if (!post || !hook) {
      return res.status(400).json({ error: "Post and hook are required." });
    }

    prompt = `You are a LinkedIn ghostwriter who writes in a very specific, proven style. Your job is to take a draft post and completely rewrite it using a new hook, matching the exact writing style and format shown in the examples below.

The new hook to use as the very first line:
"${hook}"

The original post to rewrite:
${post}

Here are full examples of the exact style, structure, format, and tone you must match:

EXAMPLE 1:
Most business owners blame themselves for inconsistent content.
The real problem has nothing to do with discipline.

Most owners treat inconsistency as a personal failing.
They try harder the next month.
That approach does not work.

Effort is not the constraint. The system is.

Here are 6 rules to build a consistent content system that never breaks:

1. Stop Treating Inconsistency as a Character Flaw
This is the single most expensive belief in content creation.
Inconsistency is not a willpower problem.
It is an engineering problem.
When you treat it as one, you stop trying harder and start building smarter.

2. The Compounding Law of Visibility
Influence requires three things: repetition, track record, and exposure.
Every single one compounds over time.
A creator who posts three strong weeks then vanishes for six builds almost nothing.
The math requires duration and regularity, not inspiration bursts.

3. Architecture Beats Motivation
I used to rely on blocked time and good intentions.
I now rely on a process that runs whether I have energy or not.
Every time you feel not in the mood to post, your system should not care.

Systems beat willpower every time.

EXAMPLE 2:
Most coaches post content every week and get zero clients from it.
Not because they are bad at what they do.
Because their content is a billboard, not a bridge.

A billboard says: here I am, here is what I do, here is what I have achieved.
A bridge takes someone from where they are to where they want to be.

One of them gets likes.
The other one gets clients.

Here is the simplest way to know which one you are writing:
After someone reads your post, can they close their phone and take one specific action right now?

If yes, you wrote a bridge.
If no, you wrote a billboard with more words on it.

That one question will change how you write content forever.
Run every post through it before you hit publish.

Content that moves people gets clients.
Content that talks at people gets likes.

EXAMPLE 3:
The reason your content is not getting clients has nothing to do with how often you post.
It is who you are posting for.

Most coaches and consultants write content for everybody.
And when you write for everybody, nobody feels like you are talking to them.
They read it. They nod. They scroll on.

Here is the fix:
Before you write your next post, finish this sentence:
"This post is for people who are..."

Not "business owners who want more clients."
But "consultants doing $8K to $15K a month who are still closing every client manually and have no system to bring leads in from content."

The first one speaks to no one in particular.
The second one makes a very specific person stop scrolling and think: this person is talking directly to me.

That feeling is everything.
Because the moment someone feels seen in your content, they trust you faster than any follower count or credentials ever could.

The more specific you get about who you are writing for, the more the right people feel like you wrote it just for them.
That is what stops the scroll.
That is what fills your DMs.

Now rewrite the original post using the new hook as the very first line. Keep the core meaning, ideas, and any real numbers or results from the original. Do not invent new facts.

Rules you must follow without exception:
- Start with the exact hook provided, word for word. Do not change a single word of it.
- Completely replace the original hook. The new hook is the first line. Nothing from the old hook appears.
- Short sentences. One idea per sentence. Never combine two ideas into one sentence.
- Leave a blank line between every paragraph or numbered point.
- Use numbered lists with bold titles when explaining multiple points or steps.
- After each numbered title, write 2 to 4 short sentences explaining the point with specific detail.
- Give the reader something real and actionable. Not concepts. Not inspiration. Real steps or real insight they can use today.
- End with a 2 to 3 line summary that reframes the whole post in one sharp truth.
- End with one clear CTA. Use a format like: Comment the word X and I will send you Y. Or: DM me X and I will show you Y.
- No em dashes anywhere.
- No corporate jargon. No buzzwords.
- No motivational quotes or vague inspiration.
- Write like a real person who has done the work and is now explaining it plainly.
- The post must be between 200 and 350 words.

Return only the rewritten post as plain text. No explanation. No labels. No preamble.`;

  } else {
    return res.status(400).json({ error: "Invalid action." });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 2000
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json();
      return res.status(500).json({ error: err.error?.message || "Generation failed. Try again." });
    }

    const data = await groqRes.json();
    const raw  = data.choices?.[0]?.message?.content || "";

    if (action === "hooks") {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const hooks   = JSON.parse(cleaned);
      return res.status(200).json({ hooks });
    } else {
      return res.status(200).json({ rewritten: raw.trim() });
    }

  } catch (err) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
