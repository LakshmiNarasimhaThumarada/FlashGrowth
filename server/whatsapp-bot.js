/**
 * FLASH GROWTH — WHATSAPP CUSTOM AI AUTO-RESPONDER BOT
 * 
 * This script automates customer chat replies on WhatsApp by scanning a QR code with your phone.
 * It uses the Google Gemini API to analyze the customer's query and provide detailed answers
 * about Flash Growth company overview, the 4 growth packs, and their specific services.
 * 
 * 📦 PREREQUISITES & INSTALLATION:
 * Run the following commands in your terminal (inside the 'server' directory):
 * 
 *   npm install whatsapp-web.js qrcode-terminal @google/generative-ai dotenv
 * 
 * 🚀 RUNNING THE BOT:
 *   1. Make sure you have a GEMINI_API_KEY set in your server/.env file.
 *      (Get a free key from Google AI Studio: https://aistudio.google.com/)
 *   2. Start the script:
 *      node whatsapp-bot.js
 *   3. Scan the QR code printed in the terminal using WhatsApp's "Linked Devices" option on your phone.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Ensure Gemini API Key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('\n❌ ERROR: GEMINI_API_KEY is not defined in your environment/dotenv file.');
  console.error('Please get a key from Google AI Studio and add it to your .env file.\n');
  process.exit(1);
}

// System instructions detailing Flash Growth packs, services, and policies
const SYSTEM_INSTRUCTION = `
You are the official AI Assistant for "Flash Growth", a premium digital marketing and business growth agency. 
Your goal is to be helpful, professional, and guide prospective clients towards choosing the right growth packs or booking a strategy session.

Here are the facts about Flash Growth:
- Tagline: "Grow Fast, Grow Bold"
- Contact Email: flashgrowth06@gmail.com
- Main Website: https://flashgrowth.com (under development)
- Office Address: 100 Pine St, San Francisco, CA

We offer 4 distinct "Growth Packs" designed to scale businesses. Here are the packs and their services:

1. BUSINESS PACK
   - Brand strategy, identity, and market positioning.
   - Services:
     * Brand Strategy & Positioning: Deep-dive competitive research, target persona mapping, and brand architecture.
     * Logo & Visual Identity System: Premium logo design, color palettes, typography styling, and visual assets.
     * Comprehensive Brand Guidelines: Usage manuals, asset packs, rules for digital and print formats.
     * Competitor Landscape Analysis: Market research, differentiator planning, and SWOT breakdown.

2. MARKETING PACK
   - Multi-channel campaigns, social growth, and paid media.
   - Services:
     * Paid Ads Management (Meta & Google): Ad copywriting, asset testing, keyword bidding, and conversion setup.
     * Social Media Strategy & Grid Design: Monthly content calendars, visual guidelines, and audience engagement plans.
     * Email Marketing & Lead Nurturing: Automation flows, newsletter designs, list segmentation, and copywriting.
     * Influencer Marketing Campaign Setup: Outreach templates, brief creation, tracking links, and contract management.

3. CONTENT PACK
   - Premium video production, copy, and graphic assets.
   - Services:
     * Website Copy & SEO Blogging: Conversion-focused copywriting for main pages and high-intent blog posts.
     * Promo Video Production & Editing: High-end scriptwriting, cinematic editing, sound design, and color grading.
     * Social Media Graphic Assets: Templates, carousels, stories, and display banners designed to convert.
     * Professional Product Showcase Assets: High-fidelity product rendering or curated photography assets.

4. GROWTH PACK
   - SEO optimization, CRO audits, and analytical infrastructure.
   - Services:
     * Technical & On-Page SEO Audit: Site architecture audits, speed optimization, and search rankings improvement.
     * Conversion Rate Optimization (CRO): A/B testing plans, landing page rewrites, and user journey optimization.
     * Custom Analytics & Funnel Setup: GA4, GTM, and custom event tracking implementation.
     * Revenue Funnel Strategy & Audits: End-to-end user path analysis and optimization advice.

OUR SERVICE FLOW:
- Clients select their desired services from our packs on our website and request a callback.
- We do not show upfront pricing on the website; instead, our team contacts them to provide a custom strategy consultation and tailored quote.
- Advise clients to fill out the contact form on our website or share their details here (Name, Email, Phone, and the services they want) so our senior growth advisor can contact them within 2 hours.

HOW YOU SHOULD BEHAVE:
- Keep your answers concise, professional, and clean (ideal for mobile chat screens).
- If they ask about pricing, explain that we provide custom tailored quotes based on their unique business needs, and we'd love to connect them with a growth advisor for a free consultation.
- Be extremely polite, engaging, and clear.
`;

// Initialize Google Generative AI (using gemini-2.5-flash-lite as it is fast and efficient)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
  systemInstruction: SYSTEM_INSTRUCTION
});

// Cache chat sessions to maintain context history
const chatSessions = new Map();

// Initialize WhatsApp Web Client with Local Authentication (saves logins to avoid scanning QR every time)
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Print QR code in console for login
client.on('qr', (qr) => {
  console.log('\n--- SCAN THIS QR CODE WITH WHATSAPP TO LOG IN ---');
  qrcode.generate(qr, { small: true });
  console.log('--------------------------------------------------\n');
});

client.on('ready', () => {
  console.log('\n⚡ Flash Growth WhatsApp Bot is online and ready to chat!');
  console.log('Using Gemini AI to process customer messages.\n');
});

// Handle incoming messages
client.on('message', async (msg) => {
  // Prevent the bot from replying to its own messages, group chats, status updates, or broadcasts
  if (msg.fromMe || msg.from.includes('@g.us') || msg.isStatus || msg.from.includes('status')) return;

  // Ignore empty or invalid messages
  if (!msg.body || typeof msg.body !== 'string' || msg.body.trim() === '') return;

  const chat = await msg.getChat();
  console.log(`[Message Received] From: ${msg.from} (${chat.name}): "${msg.body}"`);

  // Show a typing indicator to look natural
  chat.sendStateTyping();

  try {
    let session = chatSessions.get(msg.from);
    if (!session) {
      // Start a new chat session for this user
      session = model.startChat({
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      });
      chatSessions.set(msg.from, session);
    }

    // Send user message to Gemini
    const result = await session.sendMessage(msg.body);
    const responseText = result.response.text();

    // Reply back to the user
    await msg.reply(responseText);
    console.log(`[Reply Sent] To: ${msg.from} (${chat.name}): "${responseText.replace(/\n/g, ' ')}"`);
  } catch (err) {
    console.error(`[AI Error for ${msg.from}]:`, err);
    await msg.reply('Hi there! I am experiencing a brief technical glitch. Please reach out to our team at hello@flashgrowth.com or fill out our website contact form, and we will get right back to you! 🚀');
  }
});

// Start the WhatsApp Client
client.initialize();
