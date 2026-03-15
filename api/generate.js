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

    prompt = `You are a LinkedIn content writer for a creator in this niche: ${niche}

Their audience is people who are stuck, frustrated, and working hard but not getting the results they want. They want a specific path forward, not more inspiration.

The post topic is: ${topic}

Your job is to write 14 scroll-stopping hooks for this topic. A hook is the first one to two lines of a LinkedIn post. It is the only thing most people read before deciding to keep going or scroll past.

Every hook must function as a bridge, not a billboard. A billboard announces. A bridge moves someone from where they are stuck to where they want to be. Every hook must make the exact right reader feel like this was written specifically for them.

Use these 7 hook types, 2 hooks each:

RESULT: Open with a specific situation, number, or measurable outcome that mirrors the reader's frustration. Make the result feel real and relatable. Not aspirational. Grounded.

CURIOSITY: Tease a counterintuitive truth or reveal that something the reader is currently doing is the wrong approach. Create enough tension that scrolling past feels like a mistake.

STORY: Open with one specific moment in time. Not a vague statement. A real scene. Something that happened. Make the reader feel like they are in the room.

CONTRADICTION: Challenge something the reader currently believes is working. Make them feel slightly uncomfortable. Back it up with a simple logical reason in the second sentence.

BOLD CLAIM: Make one direct, confident statement that names the exact problem in a way the reader has never heard it described before.

EDUCATIONAL: Lead with a counterintuitive truth or a specific insight the reader has not considered. The reader should immediately think: I never thought about it that way.

HOW TO: Start with "Here is" and promise a specific, clear path the reader can follow. Name the outcome they will get from following it.

Writing rules every hook must follow:
- 1 to 3 short sentences maximum
- One idea per sentence. Never combine two ideas.
- Name a specific situation, number, person, or pain point. Never be vague.
- Plain simple English. If someone outside the industry cannot understand it, rewrite it.
- No em dashes anywhere
- No corporate language or jargon
- No motivational language that gives the reader nothing to do
- Never start with the word "I"
- The hook must make it impossible to scroll past

Return your response as a JSON array only. No explanation. No preamble. No markdown code fences. Just raw JSON like this:
[
  {"type": "RESULT", "hook": "hook text here"},
  {"type": "CURIOSITY", "hook": "hook text here"}
]`;

  } else if (action === "rewrite") {
    if (!post || !hook) {
      return res.status(400).json({ error: "Post and hook are required." });
    }

    prompt = `You are a LinkedIn content writer. Your job is to take a creator's draft post and completely rewrite it using a new hook, matching a very specific writing style and structure.

The creator's niche: ${niche || "not specified"}

The new hook to use as the very first line:
"${hook}"

The original post to rewrite:
${post}

YOUR JOB:
Rewrite the full post using the new hook as the very first line. Keep the core meaning, ideas, and any real numbers or results from the original. Do not invent new facts. Do not keep the original hook. Replace it completely with the new one.

THE 3 PARTS EVERY REWRITTEN POST MUST HAVE:

Part 1: The hook
Use the exact hook provided, word for word, as the very first line. Do not change a single word of it. Do not add anything before it.

Part 2: The value
Show a clear path from Point A to Point B.

Point A is the exact problem the reader is in right now. Name it specifically. Use the words they would use to describe it to a friend. Not industry language.

The bridge is the specific steps or insights that solve it. Not hints. Not concepts. Real actions the reader can take today with no extra research and no extra tools.

If the post has multiple points, use numbered list format with a short bold title for each point. After each title, write 2 to 4 short sentences explaining the point with specific detail. Something the reader can actually picture themselves doing today.

Point B is the outcome. What specifically changes for them if they do what the post teaches. One honest, specific, believable outcome. No overclaiming.

Part 3: Two CTAs at the end
End every post with these two CTAs exactly as written. Do not change a single word.

CTA 1:
"If you found this useful, repost it and follow [creator] for more tips on how to create better content."

CTA 2:
"And if you are a [describe their ideal client] who wants [specific outcome], I put together a free guide that shows you exactly how to [achieve that outcome]. Drop the word GUIDE in the comments and I will send it straight to you."

Replace [creator] with the name or handle from the original post if it appears. If no name is found, write "the creator."
Replace the bracketed sections in CTA 2 with the most relevant description based on the niche and post content.

Always put a blank line between CTA 1 and CTA 2.

WRITING RULES YOU MUST FOLLOW WITHOUT EXCEPTION:
- Start with the exact hook provided, word for word. The original hook is gone. Completely replaced.
- Short sentences. One idea per sentence. Never combine two ideas.
- Leave a blank line between every single paragraph and between every numbered point.
- Never write more than three lines in a row without a blank line.
- Plain simple English. If someone with no industry knowledge cannot understand it, rewrite it.
- No em dashes anywhere in the post.
- No corporate language or jargon. No words like leverage, synergy, utilise, optimize, or implement strategies.
- No motivational quotes that give the reader nothing to do.
- No vague outcomes like grow your business or attract more clients. Always specific.
- No writing for a general audience. Write for one specific person in one specific situation.
- Never start the first line of the post with the word I.
- Write like a human talking to one specific person. Not like a brand talking to an audience.
- Every line must earn its place. If a line does not move the post forward, cut it.
- Post must be between 200 and 350 words.

QUALITY CHECK BEFORE FINISHING:
Can the reader close their phone after reading this and take one specific action immediately? If no, rewrite the middle section.
Does the first line match the hook exactly? If no, fix it.
Is every sentence in plain simple English? If no, simplify it.
Are there blank lines between every paragraph? If no, add them.
Are there any em dashes? If yes, remove them all.
Does the post end with both CTAs? If no, add them.

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
