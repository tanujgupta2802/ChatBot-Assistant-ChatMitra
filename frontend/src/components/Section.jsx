// "use client";

// import React, { useState, useRef, useEffect } from "react";

// export default function Section() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [conversationHistory, setConversationHistory] = useState([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isTyping]);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     // Add user message to UI
//     const userMessage = { role: "user", text: input };
//     setMessages((prev) => [...prev, userMessage]);
//     setIsTyping(true);

//     try {
//       console.log("=== SENDING REQUEST ===");
//       console.log("User message:", input);
//       console.log("Conversation history being sent:", conversationHistory);
//       console.log("History length:", conversationHistory.length);

//       const requestBody = {
//         message: input,
//         history: conversationHistory, // Changed from conversationHistory to history to match backend
//       };
//       console.log("Full request body:", requestBody);

//       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await res.json();
//       console.log("=== RECEIVED RESPONSE ===");
//       console.log("Response data:", data);

//       // Add assistant response to UI
//       const assistantMessage = { role: "assistant", text: data.reply };
//       setMessages((prev) => [...prev, assistantMessage]);

//       // Update conversation history manually
//       const updatedHistory = [
//         ...conversationHistory,
//         { role: "user", content: input }, // Using 'content' for backend compatibility
//         { role: "assistant", content: data.reply },
//       ];
//       setConversationHistory(updatedHistory);
//       console.log("Updated conversation history:", updatedHistory);
//     } catch (err) {
//       console.error("Error:", err);
//       const errorMessage = {
//         role: "assistant",
//         text: "Something went wrong. Please try again.",
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsTyping(false);
//     }

//     setInput("");
//   };

//   // Clear conversation function
//   const clearConversation = () => {
//     setMessages([]);
//     setConversationHistory([]);
//   };

//   return (
//     <div className="mt-30 sm:mt-50">
//       <div className="flex flex-col max-w-2xl mx-auto mt-6 p-4 sm:p-6">
//         {/* Heading */}
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-center text-2xl sm:text-4xl text-indigo-600 font-extrabold flex-1">
//             ChatMitra AI Assistant
//           </h1>
//           {messages.length > 0 && (
//             <button
//               onClick={clearConversation}
//               className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
//               title="Clear conversation"
//             >
//               Clear
//             </button>
//           )}
//         </div>

//         {/* Chat box */}
//         <div className="w-full p-2 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
//           {messages.length === 0 && (
//             <div className="text-gray-400 text-center mt-1">
//               <p>Ask me anything... 👋</p>
//               <p className="text-xs mt-2">I'll remember our conversation!</p>
//             </div>
//           )}
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex w-full ${
//                 msg.role === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`max-w-[75%] px-4 py-2 rounded-2xl break-words text-sm sm:text-base ${
//                   msg.role === "user"
//                     ? "bg-indigo-600 text-white rounded-br-none"
//                     : "bg-gray-200 text-gray-800 rounded-bl-none"
//                 }`}
//                 style={{ whiteSpace: "pre-wrap" }} // Preserve line breaks
//               >
//                 {msg.text}
//               </div>
//             </div>
//           ))}

//           {/* Typing indicator */}
//           {isTyping && (
//             <div className="flex w-full justify-start">
//               <div className="max-w-[75%] px-4 py-2 rounded-2xl break-words text-sm sm:text-base bg-gray-200 text-gray-600 rounded-bl-none italic">
//                 <div className="flex items-center space-x-1">
//                   <span>ChatMitra is typing</span>
//                   <div className="flex space-x-1">
//                     <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
//                     <div
//                       className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
//                       style={{ animationDelay: "0.1s" }}
//                     ></div>
//                     <div
//                       className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
//                       style={{ animationDelay: "0.2s" }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={chatEndRef} />
//         </div>

//         {/* Input + Send button */}
//         <div className="flex gap-2 sm:gap-3 mt-2">
//           <input
//             className="flex-1 border border-gray-300 px-4 py-2 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 placeholder-gray-500"
//             type="text"
//             placeholder="Type your message..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
//             disabled={isTyping}
//           />
//           <button
//             onClick={handleSend}
//             disabled={isTyping || !input.trim()}
//             className={`px-6 py-2 rounded-2xl font-semibold transition-colors ${
//               isTyping || !input.trim()
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-indigo-600 text-white hover:bg-indigo-700"
//             }`}
//           >
//             Send
//           </button>
//         </div>

//         {/* Debug info (only in development) */}
//         {process.env.NODE_ENV === "development" &&
//           conversationHistory.length > 0 && (
//             <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
//               <details>
//                 <summary className="cursor-pointer">
//                   Debug: Conversation History ({conversationHistory.length}{" "}
//                   messages)
//                 </summary>
//                 <pre className="mt-2 text-xs overflow-x-auto">
//                   {JSON.stringify(conversationHistory, null, 2)}
//                 </pre>
//               </details>
//             </div>
//           )}

//         {/* Custom style to hide scrollbar */}
//         <style jsx>{`
//           .scrollbar-hide::-webkit-scrollbar {
//             display: none;
//           }
//           .scrollbar-hide {
//             -ms-overflow-style: none; /* IE and Edge */
//             scrollbar-width: none; /* Firefox */
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useRef, useEffect } from "react";

export default function Section() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();

    // Clear any previous errors
    setError(null);

    // Add user message to UI immediately
    const userMessage = { role: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      console.log("=== SENDING REQUEST ===");
      console.log("User message:", userInput);
      console.log("Current conversation history:", conversationHistory);
      console.log("History length:", conversationHistory.length);

      // Prepare request with consistent data format
      const requestBody = {
        message: userInput,
        history: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content || msg.text, // Ensure content field exists
          text: msg.text || msg.content, // Keep text for UI compatibility
        })),
      };

      console.log("Request payload:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("=== RECEIVED RESPONSE ===");
      console.log("Response data:", data);

      // Validate response
      if (!data.reply) {
        throw new Error("Invalid response format: missing reply");
      }

      // Add assistant response to UI
      const assistantMessage = {
        role: "assistant",
        text: data.reply.trim(),
        model: data.model || "unknown",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation history with both content and text fields for compatibility
      const newUserHistory = {
        role: "user",
        content: userInput,
        text: userInput,
      };
      const newAssistantHistory = {
        role: "assistant",
        content: data.reply.trim(),
        text: data.reply.trim(),
      };

      const updatedHistory = [
        ...conversationHistory,
        newUserHistory,
        newAssistantHistory,
      ];

      // Limit conversation history to prevent memory issues (last 20 messages = 10 exchanges)
      const maxHistoryLength = 20;
      const trimmedHistory =
        updatedHistory.length > maxHistoryLength
          ? updatedHistory.slice(-maxHistoryLength)
          : updatedHistory;

      setConversationHistory(trimmedHistory);
      console.log("Updated conversation history:", trimmedHistory);
      console.log("Total messages in history:", trimmedHistory.length);
    } catch (err) {
      console.error("❌ Error in handleSend:", err);

      // Set error state for user feedback
      setError(err.message);

      // Add error message to chat
      const errorMessage = {
        role: "assistant",
        text: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setInput(""); // Clear input field
    }
  };

  // Clear conversation function
  const clearConversation = () => {
    setMessages([]);
    setConversationHistory([]);
    setError(null);
    console.log("🗑️ Conversation cleared");
  };

  // Retry last message function
  const retryLastMessage = () => {
    if (messages.length < 2) return;

    // Find the last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");
    if (lastUserMessage) {
      setInput(lastUserMessage.text);
      // Remove the last exchange from both UI and history
      setMessages((prev) => {
        const lastUserIndex = prev.lastIndexOf(lastUserMessage);
        return prev.slice(0, lastUserIndex);
      });

      // Also remove from conversation history
      setConversationHistory((prev) => prev.slice(0, -2));
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-30 sm:mt-50">
      <div className="flex flex-col max-w-2xl mx-auto mt-6 p-4 sm:p-6">
        {/* Header with title and controls */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-center text-2xl sm:text-4xl text-indigo-600 font-extrabold flex-1">
            ChatMitra AI Assistant
          </h1>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <>
                <button
                  onClick={retryLastMessage}
                  className="text-sm px-3 py-1 rounded-lg bg-yellow-200 text-yellow-700 hover:bg-yellow-300 transition-colors"
                  title="Retry last message"
                  disabled={isTyping}
                >
                  Retry
                </button>
                <button
                  onClick={clearConversation}
                  className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                  title="Clear conversation"
                  disabled={isTyping}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm">⚠️ {error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Status indicator */}
        {conversationHistory.length > 0 && (
          <div className="mb-2 text-xs text-gray-500 text-center">
            💭 Conversation memory: {Math.floor(conversationHistory.length / 2)}{" "}
            exchanges
          </div>
        )}
        {/* Heading */}
        <h1 className="text-center text-2xl sm:text-4xl text-indigo-600 font-extrabold mb-4">
          ChatMitra AI Assistant
        </h1>

        {/* Chat box */}
        <div className="w-full p-2 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center mt-8">
              <div className="text-4xl mb-2">🤖</div>
              <p className="text-lg">Hello! I'm ChatMitra</p>
              <p className="text-sm mt-2">
                Ask me anything and I'll remember our conversation!
              </p>
              <div className="mt-4 text-xs text-gray-300">
                <p>
                  Try asking: "What are the primary colors?" then "What's the
                  first one?"
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl break-words text-sm sm:text-base shadow-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : msg.isError
                    ? "bg-red-100 text-red-800 border border-red-300 rounded-bl-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none border"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.text}
                {/* Show model info for assistant messages in development */}
                {process.env.NODE_ENV === "development" &&
                  msg.role === "assistant" &&
                  msg.model &&
                  !msg.isError && (
                    <div className="text-xs text-gray-500 mt-1 opacity-70">
                      {msg.model}
                    </div>
                  )}
              </div>
            </div>
          ))}

          {/* Enhanced typing indicator */}
          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="max-w-[75%] px-4 py-3 rounded-2xl text-sm bg-gray-100 text-gray-600 rounded-bl-none border">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-gray-500">
                    ChatMitra is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area with enhanced styling */}
        <div className="flex gap-2 sm:gap-3 mt-4">
          <input
            className="flex-1 border-2 border-gray-200 px-4 py-3 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all"
            type="text"
            placeholder={isTyping ? "Please wait..." : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isTyping}
            maxLength={500}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all transform ${
              isTyping || !input.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed scale-100"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-lg"
            }`}
          >
            {isTyping ? "..." : "Send"}
          </button>
        </div>

        {/* Character counter */}
        {input.length > 400 && (
          <div className="text-xs text-gray-500 text-right mt-1">
            {input.length}/500 characters
          </div>
        )}

        {/* Enhanced debug info for development */}
        {process.env.NODE_ENV === "development" &&
          conversationHistory.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  🔧 Debug: Conversation History ({conversationHistory.length}{" "}
                  messages, {Math.floor(conversationHistory.length / 2)}{" "}
                  exchanges)
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="text-xs text-gray-600">
                    <strong>Backend URL:</strong>{" "}
                    {process.env.NEXT_PUBLIC_BACKEND_URL || "Not set"}
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(conversationHistory, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            </div>
          )}

        {/* Connection status indicator */}
        <div className="mt-2 text-center">
          <div className="inline-flex items-center space-x-1 text-xs text-gray-400">
            <div
              className={`w-2 h-2 rounded-full ${
                error ? "bg-red-400" : "bg-green-400"
              }`}
            ></div>
            <span>{error ? "Connection issues" : "Connected"}</span>
          </div>
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .scrollbar-hide {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
      </div>
    </div>
  );
}
