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
    prompt = `You are an expert LinkedIn content strategist.

Niche: ${niche}
Post Topic: ${topic}

Generate exactly 10 LinkedIn hook variations for this topic. Each hook should be the first line of a LinkedIn post designed to stop the scroll and make people want to read more.

Use these 5 hook types, 2 hooks each:
1. RESULT - Leads with a specific, tangible outcome or number
2. CURIOSITY - Teases something surprising or counterintuitive
3. STORY - Opens a personal or relatable moment
4. CONTRADICTION - Challenges a common belief in the niche
5. BOLD CLAIM - Makes a direct, confident statement

Rules:
- Each hook must be 1 to 2 sentences maximum
- Each hook must be specific to the niche and topic provided
- No fluff, no generic advice, no filler words
- Write in plain human language, not corporate speak
- Do not use em dashes

Return your response as a JSON array only. No explanation. No preamble. No markdown code fences. Just raw JSON like this:
[
  {"type": "RESULT", "hook": "Your hook text here"},
  {"type": "CURIOSITY", "hook": "Your hook text here"}
]`;

  } else if (action === "rewrite") {
    if (!post || !hook) {
      return res.status(400).json({ error: "Post and hook are required." });
    }
    prompt = `You are an expert LinkedIn ghostwriter.

The user has chosen this hook to lead their post:
"${hook}"

Here is their original post:
${post}

Rewrite the full post using the chosen hook as the very first line. Keep the core message and any specific details, results, or stories from the original post. Do not invent new facts.

Rules:
- Start with the exact hook provided, word for word
- Keep the post between 150 and 300 words
- Use short punchy sentences. One idea per sentence.
- No em dashes
- No corporate jargon
- End with one clear call to action pointing to a free tool or resource
- Write in plain human language that anyone can understand
- Leave a blank line between every paragraph

Return only the rewritten post as plain text. No explanation. No preamble. No labels.`;
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
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 1500
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
