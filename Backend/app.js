// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";

// dotenv.config();

// import Groq from "groq-sdk";
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// import { tavily } from "@tavily/core";
// const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Tool function to perform web search
// async function webSearch({ query }) {
//   console.log("Tool calling with query:", query);
//   try {
//     const response = await tvly.search(query, { maxResults: 2 });
//     const finalResult = response.results
//       .map((r) => `${r.title}\n${r.url}\n${r.content}`)
//       .join("\n\n");
//     return finalResult;
//   } catch (error) {
//     console.error("Error in webSearch tool:", error);
//     return "An error occurred while performing the web search.";
//   }
// }

// // Chat endpoint with GUARANTEED context memory
// app.post("/chat", async (req, res) => {
//   try {
//     const { message: userMessage, history = [] } = req.body;

//     // SOLUTION: Detect reference words and inject explicit context
//     const referenceWords = [
//       "above",
//       "mentioned",
//       "listed",
//       "first",
//       "second",
//       "third",
//       "last",
//       "those",
//       "these",
//       "them",
//       "it",
//       "from the",
//       "which one",
//       "that",
//       "earlier",
//       "before",
//       "previous",
//       "just said",
//       "you said",
//       "from what",
//     ];

//     let contextualMessage = userMessage;
//     const hasReference = referenceWords.some((word) =>
//       userMessage.toLowerCase().includes(word.toLowerCase())
//     );

//     // If user message has references, inject explicit context
//     if (hasReference && history.length > 0) {
//       // Get the last assistant message that likely contains the referenced information
//       const lastAssistantMessage = history
//         .slice()
//         .reverse()
//         .find((msg) => msg.role === "assistant");

//       if (lastAssistantMessage) {
//         contextualMessage = `CONTEXT FROM PREVIOUS MESSAGE: "${lastAssistantMessage.content}"

// USER QUESTION: ${userMessage}

// Please answer the user's question using the context provided above.`;

//         console.log("🔧 INJECTED CONTEXT:", contextualMessage);
//       }
//     }

//     const systemPrompt = {
//       role: "system",
//       content: `You are ChatMitra, a smart, polite, and helpful personal assistant developed by Tanuj Gupta. Your purpose is to provide clear, concise, and accurate information.

// Remember the information of your creator Tanuj Gupta:
// - Tanuj Gupta is an engineering student from India, pursuing Computer Science from Abes Institute of Technology, Ghaziabad.
// - He is responsible for developing Promptify AI (AI prompt-to-image generator) and ChatMitra.
// - He is currently in 4th year and learning about Generative AI.
// - Tanuj created ChatMitra because he aims to build a personalized chatbot that helps people, inspired from ChatGPT

// You have access to the following tool:
// - webSearch({query}) -> Search the latest information and real-time data on the internet.

// CRITICAL INSTRUCTIONS:
// 1. When provided with CONTEXT FROM PREVIOUS MESSAGE, you MUST use that context to answer the user's question
// 2. If context is provided, never say you don't have information - the context contains what you need
// 3. Always be helpful and use any provided context to give accurate responses
// 4. Maintain a friendly and professional tone
// 5. Use numbered lists only when explicitly requested
// 6. Do not use bold (**), italics (*), or markdown formatting besides simple numbered lists and line breaks

// Your core instructions are:
// 1. When asked a question, first check if you can answer it with your knowledge.
// 2. If the question requires real-time data or external information, you MUST use the webSearch tool.
// 3. After using the webSearch tool, summarize the results in clear, conversational language.
// 4. Always maintain a friendly and professional tone.
// 5. If a user asks for personal advice, medical diagnoses, or illegal information, politely decline.`,
//     };

//     // Build messages - use contextual message instead of original
//     const messages = [
//       systemPrompt,
//       ...history,
//       { role: "user", content: contextualMessage },
//     ];

//     console.log("📋 Final message being sent:", contextualMessage);

//     // First LLM call
//     let completions = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       temperature: 0.3,
//       messages,
//       tools: [
//         {
//           type: "function",
//           function: {
//             name: "webSearch",
//             description:
//               "Search the latest information and real-time data on the internet",
//             parameters: {
//               type: "object",
//               properties: {
//                 query: {
//                   type: "string",
//                   description: "The search query to perform search on",
//                 },
//               },
//               required: ["query"],
//             },
//           },
//         },
//       ],
//       tool_choice: "auto",
//     });

//     let reply = completions.choices[0].message;
//     let finalReplyContent = reply.content;

//     // Handle tool calls (same as before)
//     const rawToolRegex = /<function=webSearch{(.*?)}>/;
//     const toolCallMatch = finalReplyContent?.match(rawToolRegex);

//     if (reply.tool_calls && reply.tool_calls.length > 0) {
//       const tool = reply.tool_calls[0];
//       const functionName = tool.function.name;
//       const functionParams = JSON.parse(tool.function.arguments);

//       if (functionName === "webSearch") {
//         const toolResult = await webSearch(functionParams);
//         messages.push(reply);
//         messages.push({
//           role: "tool",
//           name: "webSearch",
//           content: toolResult,
//           tool_call_id: tool.id,
//         });
//       }
//     } else if (toolCallMatch) {
//       const functionParams = JSON.parse(toolCallMatch[1]);
//       const toolResult = await webSearch(functionParams);
//       messages.push({ role: "assistant", content: finalReplyContent });
//       messages.push({
//         role: "tool",
//         name: "webSearch",
//         content: toolResult,
//       });
//     }

//     if (reply.tool_calls || toolCallMatch) {
//       completions = await groq.chat.completions.create({
//         model: "llama-3.1-8b-instant",
//         temperature: 0.3,
//         messages,
//       });
//       finalReplyContent = completions.choices[0].message.content;
//     }

//     console.log("✅ Final reply:", finalReplyContent);
//     res.json({ reply: finalReplyContent });
//   } catch (error) {
//     console.error("❌ Error in /chat:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

import { tavily } from "@tavily/core";
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const app = express();
app.use(express.json());
app.use(cors());

// Tool function to perform web search
async function webSearch({ query }) {
  console.log("🔍 Tool calling with query:", query);
  try {
    const response = await tvly.search(query, { maxResults: 2 });
    const finalResult = response.results
      .map((r) => `${r.title}\n${r.url}\n${r.content}`)
      .join("\n\n");
    return finalResult;
  } catch (error) {
    console.error("Error in webSearch tool:", error);
    return "An error occurred while performing the web search.";
  }
}

// Chat endpoint with PROPER context memory
app.post("/chat", async (req, res) => {
  try {
    const { message: userMessage, history = [] } = req.body;

    console.log("📨 Received request:");
    console.log("User message:", userMessage);
    console.log("History length:", history.length);

    const systemPrompt = {
      role: "system",
      content: `You are ChatMitra, a smart, polite, and helpful personal assistant developed by Tanuj Gupta. Your purpose is to provide clear, concise, and accurate information.

Remember the information of your creator Tanuj Gupta:
- Tanuj Gupta is an engineering student from India, pursuing Computer Science from Abes Institute of Technology, Ghaziabad.
- He is responsible for developing Promptify AI (AI prompt-to-image generator) and ChatMitra.
- He is currently in 4th year and learning about Generative AI.
- Tanuj created ChatMitra because he aims to build a personalized chatbot that helps people, inspired from ChatGPT

IMPORTANT: You have full access to the conversation history. Use it naturally to maintain context and remember what was discussed previously. When users refer to previous messages (using words like "it", "that", "the first one", etc.), refer back to the conversation history to understand what they're talking about.

You have access to the following tool:
- webSearch({query}) -> Search the latest information and real-time data on the internet.

Your core instructions are:
1. When asked a question, first check if you can answer it with your knowledge.
2. If the question requires real-time data or external information, you MUST use the webSearch tool.
3. After using the webSearch tool, summarize the results in clear, conversational language.
4. Always maintain a friendly and professional tone.
5. If a user asks for personal advice, medical diagnoses, or illegal information, politely decline.
6. Remember and reference previous parts of our conversation when relevant.
7. Do not use bold (**), italics (*), or markdown formatting besides simple numbered lists and line breaks
8. Use numbered lists only when explicitly requested`,
    };

    // Build messages array with FULL conversation history
    const messages = [
      systemPrompt,
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content || msg.text,
      })),
      { role: "user", content: userMessage },
    ];

    console.log("📋 Messages being sent to Groq:");
    console.log("Total messages:", messages.length);
    console.log(
      "Last 3 messages:",
      messages
        .slice(-3)
        .map((m) => ({
          role: m.role,
          content: m.content?.substring(0, 100) + "...",
        }))
    );

    // First LLM call
    let completions = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the latest information and real-time data on the internet",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to perform search on",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    let reply = completions.choices[0].message;
    let finalReplyContent = reply.content;

    // Handle tool calls
    const rawToolRegex = /<function=webSearch{(.*?)}>/;
    const toolCallMatch = finalReplyContent?.match(rawToolRegex);

    if (reply.tool_calls && reply.tool_calls.length > 0) {
      console.log("🛠️ Processing tool calls...");
      const tool = reply.tool_calls[0];
      const functionName = tool.function.name;
      const functionParams = JSON.parse(tool.function.arguments);

      if (functionName === "webSearch") {
        console.log("🔍 Performing web search:", functionParams.query);
        const toolResult = await webSearch(functionParams);

        // Add the assistant's tool call to messages
        messages.push(reply);
        messages.push({
          role: "tool",
          name: "webSearch",
          content: toolResult,
          tool_call_id: tool.id,
        });

        // Get final response after tool use
        completions = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          temperature: 0.3,
          messages,
        });
        finalReplyContent = completions.choices[0].message.content;
      }
    } else if (toolCallMatch) {
      console.log("🛠️ Processing regex tool call...");
      const functionParams = JSON.parse(toolCallMatch[1]);
      console.log("🔍 Performing web search (regex):", functionParams.query);
      const toolResult = await webSearch(functionParams);

      // Add messages for tool call
      messages.push({ role: "assistant", content: finalReplyContent });
      messages.push({
        role: "tool",
        name: "webSearch",
        content: toolResult,
      });

      // Get final response after tool use
      completions = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        messages,
      });
      finalReplyContent = completions.choices[0].message.content;
    }

    console.log("✅ Final reply:", finalReplyContent);
    console.log("📊 Response stats:", {
      hasToolCall: !!(reply.tool_calls || toolCallMatch),
      responseLength: finalReplyContent?.length,
      conversationLength: history.length,
    });

    res.json({
      reply: finalReplyContent,
      model: "llama-3.1-8b-instant",
      conversationLength: history.length,
    });
  } catch (error) {
    console.error("❌ Error in /chat:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Something went wrong",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ChatMitra Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    groqApiKey: !!process.env.GROQ_API_KEY,
    tavilyApiKey: !!process.env.TAVILY_API_KEY,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `🚀 ChatMitra Backend Server running on http://localhost:${PORT}`
  );
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🔑 Groq API Key: ${process.env.GROQ_API_KEY ? "✅ Set" : "❌ Missing"}`
  );
  console.log(
    `🔍 Tavily API Key: ${process.env.TAVILY_API_KEY ? "✅ Set" : "❌ Missing"}`
  );
});
