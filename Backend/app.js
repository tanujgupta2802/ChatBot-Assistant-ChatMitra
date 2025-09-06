// // import express from "express";
// // import dotenv from "dotenv";

// // import cors from "cors";

// // dotenv.config();

// // import Groq from "groq-sdk";
// // const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// // import { tavily } from "@tavily/core";
// // const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// // const app = express();
// // app.use(express.json());

// // app.use(cors());

// // async function webSearch({ query }) {
// //   console.log("Tool calling with query:", query);

// //   const response = await tvly.search(query, { maxResults: 2 });
// //   console.log("Tavily response:", response);

// //   const finalResult = response.results
// //     .map((r) => `${r.title}\n${r.url}\n${r.content}`)
// //     .join("\n\n");

// //   return finalResult;
// // }

// // app.post("/chat", async (req, res) => {
// //   try {
// //     const userMessage = req.body.message;

// //     const messages = [
// //       {
// //         role: "system",
// //         content: `You are ChatTGP, a smart personal assistant.
// //         You have access to the following tool:
// //         1. webSearch({query}) -> Search latest information on the internet.`,
// //       },
// //       { role: "user", content: userMessage },
// //     ];

// //     // Initial LLM call
// //     const completions = await groq.chat.completions.create({
// //       model: "llama-3.3-70b-versatile",
// //       temperature: 0.7,
// //       messages,
// //       tools: [
// //         {
// //           type: "function",
// //           function: {
// //             name: "webSearch",
// //             description:
// //               "Search the latest information and real-time data on the internet",
// //             parameters: {
// //               type: "object",
// //               properties: {
// //                 query: {
// //                   type: "string",
// //                   description: "The search query to perform search on",
// //                 },
// //               },
// //               required: ["query"],
// //             },
// //           },
// //         },
// //       ],
// //       tool_choice: "auto",
// //     });

// //     let reply = completions.choices[0].message;
// //     messages.push(reply);

// //     const toolCalls = reply.tool_calls;

// //     if (toolCalls && toolCalls.length > 0) {
// //       for (const tool of toolCalls) {
// //         const functionName = tool.function.name;
// //         const functionParams = tool.function.arguments;

// //         if (functionName === "webSearch") {
// //           const toolResult = await webSearch(JSON.parse(functionParams));

// //           messages.push({
// //             tool_call_id: tool.id,
// //             role: "tool",
// //             name: functionName,
// //             content: toolResult,
// //           });
// //         }
// //       }

// //       // Final LLM call after tool execution
// //       const completions2 = await groq.chat.completions.create({
// //         model: "llama-3.3-70b-versatile",
// //         temperature: 0.7,
// //         messages,
// //       });

// //       reply = completions2.choices[0].message;
// //     }

// //     res.json({ reply: reply.content });
// //   } catch (error) {
// //     console.error("Error in /chat:", error);
// //     res.status(500).json({ error: "Something went wrong" });
// //   }
// // });

// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on http://localhost:${PORT}`);
// // });

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

// // Tool function
// async function webSearch({ query }) {
//   console.log("Tool calling with query:", query);

//   const response = await tvly.search(query, { maxResults: 2 });
//   console.log("Tavily response:", response);

//   const finalResult = response.results
//     .map((r) => `${r.title}\n${r.url}\n${r.content}`)
//     .join("\n\n");

//   return finalResult;
// }

// // Chat endpoint
// // app.post("/chat", async (req, res) => {
// //   try {
// //     const userMessage = req.body.message;

// //     const messages = [
// //       {
// //         role: "system",
// //         content: `You are ChatTGP, a smart personal assistant.
// //         You have access to the following tool:
// //         1. webSearch({query}) -> Search latest information on the internet.`,
// //       },
// //       { role: "user", content: userMessage },
// //     ];

// //     // First LLM call
// //     let completions = await groq.chat.completions.create({
// //       model: "llama-3.3-70b-versatile",
// //       temperature: 0.7,
// //       messages,
// //       tools: [
// //         {
// //           type: "function",
// //           function: {
// //             name: "webSearch",
// //             description:
// //               "Search the latest information and real-time data on the internet",
// //             parameters: {
// //               type: "object",
// //               properties: {
// //                 query: {
// //                   type: "string",
// //                   description: "The search query to perform search on",
// //                 },
// //               },
// //               required: ["query"],
// //             },
// //           },
// //         },
// //       ],
// //       tool_choice: "auto",
// //     });

// //     let reply = completions.choices[0].message;
// //     messages.push(reply);

// //     // -------- Handle structured tool_calls ----------
// //     const toolCalls = reply.tool_calls;

// //     if (toolCalls && toolCalls.length > 0) {
// //       for (const tool of toolCalls) {
// //         const functionName = tool.function.name;
// //         const functionParams = JSON.parse(tool.function.arguments);

// //         if (functionName === "webSearch") {
// //           const toolResult = await webSearch(functionParams);

// //           messages.push({
// //             tool_call_id: tool.id,
// //             role: "tool",
// //             name: functionName,
// //             content: toolResult,
// //           });
// //         }
// //       }

// //       // Second LLM call after tool execution
// //       completions = await groq.chat.completions.create({
// //         model: "llama-3.3-70b-versatile",
// //         temperature: 0.7,
// //         messages,
// //       });

// //       reply = completions.choices[0].message;
// //     }

// //     // -------- Handle raw inline <function=...> in reply content ----------
// //     let replyText = reply.content;

// //     const inlineToolRegex = /<function=(\w+){(.*?)}>/;
// //     const toolCallMatch = replyText.match(inlineToolRegex);

// //     if (toolCallMatch) {
// //       const functionName = toolCallMatch[1];
// //       const functionParams = JSON.parse("{" + toolCallMatch[2] + "}");

// //       if (functionName === "webSearch") {
// //         const toolResult = await webSearch(functionParams);
// //         replyText = toolResult;
// //       }
// //     }

// //     // Send final clean reply
// //     res.json({ reply: replyText });
// //   } catch (error) {
// //     console.error("Error in /chat:", error);
// //     res.status(500).json({ error: "Something went wrong" });
// //   }
// // });

// app.post("/chat", async (req, res) => {
//   try {
//     const userMessage = req.body.message;

//     const messages = [
//       {
//         role: "system",
//         content: `You are ChatTGP, a smart personal assistant developed by Tanuj Gupta.
// You have access to the following tool:
// 1. webSearch({query}) -> Search latest information on the internet.`,
//       },
//       { role: "user", content: userMessage },
//     ];

//     // First LLM call
//     let completions = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       temperature: 0.7,
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

//     // Handle structured tool calls only
//     if (reply.tool_calls && reply.tool_calls.length > 0) {
//       for (const tool of reply.tool_calls) {
//         if (tool.function.name === "webSearch") {
//           const params = JSON.parse(tool.function.arguments);
//           const toolResult = await webSearch(params);

//           // Add the tool output to messages
//           messages.push({
//             role: "tool",
//             name: "webSearch",
//             content: toolResult,
//             tool_call_id: tool.id,
//           });
//         }
//       }

//       // Call the model again after executing the tool
//       completions = await groq.chat.completions.create({
//         model: "llama-3.3-70b-versatile",
//         temperature: 0.7,
//         messages,
//       });

//       reply = completions.choices[0].message;
//     }

//     res.json({ reply: reply.content });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// // app.post("/chat", async (req, res) => {
// //   try {
// //     const userMessage = req.body.message;

// //     const messages = [
// //       {
// //         role: "system",
// //         content: `You are ChatTGP, a smart personal assistant.
// // You have access to the following tool:
// // 1. webSearch({query}) -> Search latest information on the internet.`,
// //       },
// //       { role: "user", content: userMessage },
// //     ];

// //     // First LLM call
// //     let completions = await groq.chat.completions.create({
// //       model: "llama-3.3-70b-versatile",
// //       temperature: 0.7,
// //       messages,
// //       tools: [
// //         {
// //           type: "function",
// //           function: {
// //             name: "webSearch",
// //             description:
// //               "Search the latest information and real-time data on the internet",
// //             parameters: {
// //               type: "object",
// //               properties: {
// //                 query: {
// //                   type: "string",
// //                   description: "The search query to perform search on",
// //                 },
// //               },
// //               required: ["query"],
// //             },
// //           },
// //         },
// //       ],
// //       tool_choice: "auto",
// //     });

// //     let reply = completions.choices[0].message;

// //     // -------- Handle structured tool calls (like webSearch) ----------
// //     if (reply.tool_calls && reply.tool_calls.length > 0) {
// //       for (const tool of reply.tool_calls) {
// //         if (tool.function.name === "webSearch") {
// //           const params = JSON.parse(tool.function.arguments);
// //           const toolResult = await webSearch(params);

// //           // Add the tool output to messages
// //           messages.push({
// //             role: "tool",
// //             name: "webSearch",
// //             content: toolResult,
// //             tool_call_id: tool.id,
// //           });

// //           // Call the model again after executing the tool to get final reply
// //           completions = await groq.chat.completions.create({
// //             model: "llama-3.3-70b-versatile",
// //             temperature: 0.7,
// //             messages,
// //           });

// //           reply = completions.choices[0].message;

// //           // Immediately return this clean final reply
// //           return res.json({ reply: reply.content });
// //         }
// //       }
// //     }

// //     // If no tool call, just send normal reply
// //     res.json({ reply: reply.content });
// //   } catch (error) {
// //     console.error("Error in /chat:", error);
// //     res.status(500).json({ error: "Something went wrong" });
// //   }
// // });

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
  console.log("Tool calling with query:", query);

  try {
    const response = await tvly.search(query, { maxResults: 2 });
    console.log("Tavily response:", response);

    const finalResult = response.results
      .map((r) => `${r.title}\n${r.url}\n${r.content}`)
      .join("\n\n");

    return finalResult;
  } catch (error) {
    console.error("Error in webSearch tool:", error);
    return "An error occurred while performing the web search.";
  }
}

// Chat endpoint to handle conversation and tool use
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Start with the initial message history
    const messages = [
      //       {
      //         role: "system",
      //         content: `You are ChatTGP, a smart, polite, and helpful personal assistant developed by Tanuj Gupta. Your purpose is to provide clear, concise, and accurate information.

      //         Remember the information of your creator Tanuj Gupta in following ways:
      //         1. Tanuj Gupta is a engineering student from India Pusuing Computer science from Abes Institute of Technology, Ghaziabad.
      //         2. He is responsible for developing Promptify AI: AI prompt to image generator and ChatTGP.
      //         3. He is currently in 4th year and Learning about Generative AI.
      //         4. Current SCGPA Score is 7.53.

      // You have access to the following tool:
      // 1. webSearch({query}) -> Search the latest information and real-time data on the internet.

      // Your core instructions are as follows:
      // - When asked a question, first determine if you can answer it accurately using your internal knowledge.
      // - If the question requires **real-time data, current events, or external information** that you may not have, you **MUST** use the \`webSearch\` tool. Examples include live stock prices, today's weather, recent news, or details about a person's current activities.
      // - After using the \`webSearch\` tool, you must synthesize the results and present them in a conversational and easy-to-understand format. Do not simply paste the search results.
      // - If a question does not require a web search (e.g., "What is the capital of France?"), do not use the tool.
      // - Always maintain a friendly and professional tone.
      // -**Strict Formatting Rule:** You MUST NOT use any bolding (**), italics, or other markdown formatting besides bullet points and new lines in your responses.
      // - If a user asks for personal advice, medical diagnoses, or illegal information, you must politely decline and state that you cannot fulfill the request.
      // -**For lists, you MUST use a hyphen (-) followed by a space for each item, on a new line.**
      // - **For lists, you MUST use a single asterisk (*) followed by a space, with each item on a new line. You must use a new line break before each asterisk.**
      // -**For all answers, you MUST use a numbered list. Each list item MUST start with "1  and it MUST be on its own new line. After each line, you MUST use a new line break.**

      // Example of tool use:
      // User: "What is the weather in New Delhi?"
      // Assistant Action: Use \`webSearch({query: "weather in New Delhi"})\`
      // Assistant Response:
      // Here is the latest weather for New Delhi:
      // * Current temperature is 31°C, with a "feels like" temperature of 37°C.
      // * There is a 65% chance of thunderstorms.
      // * Humidity is at 69%.
      // * The wind is blowing from the southeast at 9 mph.
      // * The high for today is 31°C and the low is 26°C.

      // Example of tool use:
      // User: "What's the latest news on AI?"
      // Assistant Action: Use \`webSearch({query: "latest news on AI"})\``,
      //       },
      {
        role: "system",
        content: `You are ChatMitra, a smart, polite, and helpful personal assistant developed by Tanuj Gupta. Your purpose is to provide clear, concise, and accurate information.

Remember the information of your creator Tanuj Gupta:
- Tanuj Gupta is an engineering student from India, pursuing Computer Science from Abes Institute of Technology, Ghaziabad.
- He is responsible for developing Promptify AI (AI prompt-to-image generator) and ChatMitra.
- He is currently in 4th year and learning about Generative AI.
- His current SGPA score is 7.53.
- Tanuj created ChatMitra because he aims to build a personalized chatbot that helps people, inspired from ChatGPT

You have access to the following tool:
- webSearch({query}) -> Search the latest information and real-time data on the internet.

Your core instructions are:
1. When asked a question, first check if you can answer it with your knowledge.
2. If the question requires real-time data or external information (e.g., live stock prices, weather, news, or someone's current activity), you MUST use the webSearch tool.
3. After using the webSearch tool, summarize the results in clear, conversational language. Do not just paste search results.
4. If the question does not require web search (e.g., "What is the capital of France?"), do not use the tool.
5. Always maintain a friendly and professional tone.
6. Formatting Rules (strict):
   - Use normal paragraphs for explanations.
   - Use numbered lists only when the user explicitly asks for points or steps.
   - Each numbered list item must start with "1.", "2.", "3." etc. Each item must be on its own line.
   - Do not use bold (**), italics (*), or markdown formatting besides simple numbered lists and line breaks.
7. If a user asks for personal advice, medical diagnoses, or illegal information, politely decline.

Example (weather):
User: "What is the weather in New Delhi?"
Assistant Action: Use webSearch({query: "weather in New Delhi"})
Assistant Response:
Here is the latest weather for New Delhi:
1. Current temperature is 31°C, feels like 37°C
2. 65% chance of thunderstorms
3. Humidity: 69%
4. Wind: southeast at 9 mph
5. High: 31°C, Low: 26°C

Example (AI news):
User: "What's the latest news on AI?"
Assistant Action: Use webSearch({query: "latest news on AI"})
Assistant Response:
Here are the latest updates on AI:
1. OpenAI released a new model with improved reasoning ability
2. Google announced new AI features in Gmail
3. Meta is testing an AI-powered chatbot inside Instagram`,
      },
      { role: "user", content: userMessage },
    ];

    // First LLM call: The model decides if a tool is needed.
    let completions = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
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

    // Handle both structured and raw inline tool calls with a single check.
    const rawToolRegex = /<function=webSearch{(.*?)}>/;
    const toolCallMatch = finalReplyContent?.match(rawToolRegex);

    if (reply.tool_calls && reply.tool_calls.length > 0) {
      // Handle structured tool calls (preferred)
      const tool = reply.tool_calls[0];
      const functionName = tool.function.name;
      const functionParams = JSON.parse(tool.function.arguments);

      if (functionName === "webSearch") {
        const toolResult = await webSearch(functionParams);
        messages.push(reply); // Add the model's request to use a tool
        messages.push({
          role: "tool",
          name: "webSearch",
          content: toolResult,
          tool_call_id: tool.id,
        });
      }
    } else if (toolCallMatch) {
      // Handle raw inline function calls (the root of your problem)
      const functionParams = JSON.parse(toolCallMatch[1]);
      const toolResult = await webSearch(functionParams);

      messages.push({ role: "assistant", content: finalReplyContent });
      messages.push({
        role: "tool",
        name: "webSearch",
        content: toolResult,
      });
    }

    // If a tool was used (either structured or raw), call the model again to get a final, clean reply.
    if (reply.tool_calls || toolCallMatch) {
      completions = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        messages,
      });
      finalReplyContent = completions.choices[0].message.content;
    }

    // Send the final, clean reply to the user.
    res.json({ reply: finalReplyContent });
  } catch (error) {
    console.error("Error in /chat:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
