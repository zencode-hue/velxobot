const { METRAMART_GOLD, SHOP_ICON, BOT_FOOTER } = require('./constants');

/**
 * Calls OpenRouter to generate an automated support suggestion using Gemini.
 * @param {string} userMessage - The customer's message.
 * @param {string} username - The display name of the customer.
 * @param {string} category - The ticket category (support, order, application).
 * @returns {Promise<string>} The AI response.
 */
async function generateAIResponse(userMessage, username, category) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return "⚠️ *Metra AI Support is currently offline (API key missing).*";
  }

  const model = "google/gemma-2-9b-it:free"; // Lightweight, rapid, free gemma model
  const systemPrompt = `
You are METRA AI — the automated e-commerce customer support assistant for MetraMart (metramart.xyz).
MetraMart is the world's #1 premium digital marketplace for:
- Streaming Accounts: Netflix Premium 4K, Disney+, Spotify Premium, YouTube Premium.
- AI Tools: ChatGPT Plus, Midjourney, Claude Pro.
- Software: Windows keys, Adobe Creative Cloud.
- Gaming: Xbox Game Pass, PS Plus.

You are assisting a customer named "${username}" inside a private Discord support ticket (Category: ${category}).

━━━ INSTRUCTIONS ━━━
1. Be extremely polite, professional, and helpful.
2. Structure your reply beautifully with emojis.
3. Keep it concise and within 150-250 words.
4. Address the customer directly.
5. Provide a clear, step-by-step recommendation based on their query.
6. Crucial: ALWAYS state clearly at the very beginning that this is an automated initial response from Metra AI to assist them instantly while they wait for a human staff member (who will review their ticket shortly).
7. If they ask about orders, remind them to check their checkout DMs or order dashboard on metramart.xyz.
  `.trim();

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://metramart.xyz",
        "X-Title": "MetraMart Support Bot",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      console.error(`[AI Agent] OpenRouter API error: Status ${res.status}`);
      return "⚠️ *Sorry, I am unable to analyze your query at this moment. A human agent will be with you shortly.*";
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (content && content.trim()) {
      return content.trim();
    }

    return "⚠️ *I couldn't process your message. A human agent will assist you shortly!*";
  } catch (err) {
    console.error("[AI Agent] Error generating response:", err);
    return "⚠️ *Our automated AI assistant encountered an error. A staff member will be with you shortly!*";
  }
}

module.exports = { generateAIResponse };
