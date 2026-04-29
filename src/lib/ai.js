import { GoogleGenerativeAI } from '@google/generative-ai';
import { getProducts, getOrder, getDeals } from './api.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are VelxoBot, the official AI assistant for Velxo Shop (velxo.shop).

Velxo Shop is a digital marketplace selling streaming subscriptions (Netflix, Spotify, IPTV), 
AI tools (ChatGPT Plus), software licenses, and gaming keys. All products are delivered 
instantly to the customer's email after payment.

Your job is to:
1. Help customers find products and understand pricing
2. Look up order status when given an order ID (format: VLX-XXXXXX)
3. Explain payment methods (Crypto, Binance Gift Card, Wallet Balance, Discord Manual)
4. Guide customers through the Binance gift card payment process step by step
5. Explain the affiliate and partner programs
6. Handle support requests and escalate to human staff when needed
7. Answer questions about delivery, refunds, and policies

Policies:
- All sales are final for digital products
- Invalid/not working credentials: replacement within 24 hours
- Contact support within 24 hours with order ID
- Promo affiliates earn 10% store credit; Partner affiliates earn 15%+ in crypto

Always be helpful, concise, and professional. Never make up order information.
If a customer has a problem you cannot solve, tell them to use /support to open a ticket.

Shop URL: https://velxo.shop
Support email: support@velxo.shop`;

function extractOrderId(text) {
  const match = text.match(/VLX-[A-Z0-9]{6}/i);
  return match ? match[0].toUpperCase() : null;
}

export async function getAIResponse(userMessage, conversationHistory = []) {
  let contextInjection = '';

  const orderId = extractOrderId(userMessage);
  if (orderId) {
    try {
      const order = await getOrder(orderId);
      if (order?.id) {
        contextInjection += `\n[LIVE ORDER DATA for ${orderId}]: Status=${order.status}, Product=${order.productName}, Amount=$${order.amount}, Date=${order.createdAt}`;
      }
    } catch (_) {}
  }

  if (/deal|vault|discount|sale/i.test(userMessage)) {
    try {
      const deals = await getDeals();
      if (deals?.length) {
        contextInjection += `\n[LIVE DEALS]: ${deals.slice(0, 5).map(d => `${d.productName} $${d.dealPrice}`).join(', ')}`;
      }
    } catch (_) {}
  }

  if (/price|how much|cost|product|available/i.test(userMessage)) {
    try {
      const products = await getProducts();
      if (products?.length) {
        contextInjection += `\n[LIVE PRODUCTS]: ${products.slice(0, 10).map(p => `${p.name} $${p.price}`).join(', ')}`;
      }
    } catch (_) {}
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT + contextInjection,
  });

  // Build chat history for context (Gemini format)
  const history = conversationHistory.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
