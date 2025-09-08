"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMitraSidebar from "./ChatMitraWithSidebar";

// Helper: Extract meaningful chat name from first user message
function extractChatName(messages) {
  const firstUserMsg = messages.find(
    (m) => m.role === "user" && m.text && m.text.trim().length > 0
  );
  if (!firstUserMsg) return "New Conversation";
  let firstSentence = firstUserMsg.text.split(/[.?!]/)[0];
  return firstSentence.length > 30
    ? firstSentence.slice(0, 30) + "..."
    : firstSentence;
}

// Create chat object with proper metadata
function createChat(messages) {
  return {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    firstMessage: extractChatName(messages),
    lastMessage: messages[messages.length - 1]?.text || "",
    messageCount: messages.length,
    messages,
  };
}

export default function Section() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // Array of chat objects
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom on message or typing changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Get current chat object
  const currentChat = chatHistory.find((chat) => chat.id === currentChatId);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userInput = input.trim();
    setError(null);

    const userMessage = { role: "user", text: userInput };
    const updatedMessages = [
      ...(currentChat?.messages || messages),
      userMessage,
    ];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const requestBody = {
        message: userInput,
        history: updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.text,
          text: msg.text,
        })),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (!data.reply)
        throw new Error("Invalid response format: missing reply");

      const assistantMessage = {
        role: "assistant",
        text: data.reply.trim(),
        model: data.model || "unknown",
      };

      const nextMessages = [...updatedMessages, assistantMessage];
      setMessages(nextMessages);

      if (currentChat) {
        // Update existing chat
        const updatedChat = {
          ...currentChat,
          lastMessage: assistantMessage.text,
          messageCount: nextMessages.length,
          messages: nextMessages,
          firstMessage: extractChatName(nextMessages),
        };
        setChatHistory((chats) =>
          chats.map((chat) => (chat.id === currentChat.id ? updatedChat : chat))
        );
      } else {
        // Create new chat
        const newChat = createChat(nextMessages);
        setChatHistory((chats) => [...chats, newChat]);
        setCurrentChatId(newChat.id);
      }
    } catch (err) {
      setError(err.message);
      const errorMessage = {
        role: "assistant",
        text: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
    const newChat = createChat([]);
    setChatHistory((chats) => [...chats, newChat]);
    setCurrentChatId(newChat.id);
  };

  const handleSelectChat = (chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    setCurrentChatId(chatId);
    setMessages(chat?.messages || []);
    setError(null);
  };

  const handleDeleteChat = (chatId) => {
    setChatHistory((chats) => chats.filter((c) => c.id !== chatId));
    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const themeClasses = isDarkMode
    ? {
        bg: "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900",
        containerBg: "bg-slate-900/50",
        border: "border-slate-700/50",
        text: "text-white",
        textSecondary: "text-slate-300",
        textMuted: "text-slate-400",
        inputBg: "bg-slate-800/50",
        inputBorder: "border-slate-600/50",
        inputFocus: "focus:border-purple-500/50 focus:ring-purple-500/20",
        userBg: "bg-gradient-to-r from-purple-600 to-blue-600",
        botBg: "bg-slate-800/50 border-slate-700/50",
        errorBg: "bg-red-900/20 border-red-500/30 text-red-400",
        clearBtn:
          "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border-slate-600/50",
      }
    : {
        bg: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        containerBg: "bg-white/70",
        border: "border-white/20",
        text: "text-slate-800",
        textSecondary: "text-slate-600",
        textMuted: "text-slate-500",
        inputBg: "bg-white/50",
        inputBorder: "border-slate-200/50",
        inputFocus: "focus:border-purple-400/50 focus:ring-purple-400/20",
        userBg: "bg-gradient-to-r from-purple-500 to-blue-500",
        botBg: "bg-white/60 border-slate-200/50",
        errorBg: "bg-red-50/80 border-red-200/50 text-red-600",
        clearBtn:
          "bg-white/50 hover:bg-slate-100/50 text-slate-600 border-slate-200/50",
      };

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-2 sm:p-4 transition-all duration-700`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute top-10 sm:top-20 left-10 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 rounded-full ${
            isDarkMode ? "bg-purple-500/10" : "bg-blue-400/20"
          } blur-xl`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-16 sm:w-24 h-16 sm:h-24 rounded-full ${
            isDarkMode ? "bg-blue-500/10" : "bg-purple-400/20"
          } blur-xl`}
        />
      </div>

      {/* Sidebar */}
      <ChatMitraSidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        isDarkMode={isDarkMode}
        onNewChat={clearConversation}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        chatHistory={chatHistory}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative flex flex-col w-full max-w-4xl h-[45vh] sm:h-[85vh] mt-15 sm:mt-0 ${themeClasses.containerBg} ${themeClasses.border} backdrop-blur-xl rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden`}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`relative z-10 flex items-center justify-between p-3 sm:p-6 ${themeClasses.border} border-b backdrop-blur-sm`}
        >
          <div className="flex items-center space-x-2 sm:space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div
                className={`w-8 sm:w-12 h-8 sm:h-12 rounded-xl sm:rounded-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-r from-purple-500 to-blue-500"
                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                } flex items-center justify-center shadow-lg`}
              >
                <span className="text-lg sm:text-2xl">🤖</span>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute -inset-1 rounded-xl sm:rounded-2xl ${
                  isDarkMode ? "bg-purple-500/20" : "bg-blue-400/20"
                } blur-md -z-10`}
              />
            </motion.div>

            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-xl sm:text-3xl font-bold ${
                  themeClasses.text
                } bg-gradient-to-r ${
                  isDarkMode
                    ? "from-purple-400 to-blue-400"
                    : "from-purple-600 to-blue-600"
                } bg-clip-text text-transparent`}
              >
                ChatMitra AI
              </motion.h1>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-xs sm:text-sm ${themeClasses.textMuted} hidden sm:block`}
              >
                Your intelligent companion
              </motion.p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            {currentChat?.messages?.length > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`px-2 sm:px-3 py-1 rounded-full ${
                  themeClasses.textMuted
                } text-xs backdrop-blur-sm ${
                  isDarkMode ? "bg-slate-800/30" : "bg-white/30"
                }`}
              >
                <span className="hidden xs:inline">💭 </span>
                {Math.floor(currentChat.messages.length / 2)}
                <span className="hidden sm:inline"> exchanges</span>
              </motion.div>
            )}

            {messages.length > 0 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearConversation}
                disabled={isTyping}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl ${themeClasses.clearBtn} border backdrop-blur-sm transition-all duration-200 text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50`}
              >
                Clear
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${themeClasses.clearBtn} border backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              <span className="text-sm sm:text-base">
                {isDarkMode ? "🌞" : "🌙"}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 ${themeClasses.errorBg} border rounded-xl sm:rounded-2xl backdrop-blur-sm flex justify-between items-center shadow-lg`}
            >
              <span className="text-xs sm:text-sm font-medium">⚠️ {error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-4 font-bold hover:scale-110 transition-transform text-sm sm:text-base"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6 scrollbar-hide">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center h-full text-center px-4"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-4xl mt-6 sm:text-8xl mb-4 sm:mb-6"
              >
                🤖
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className={`text-xl sm:text-2xl font-bold ${themeClasses.text} mb-2`}
              >
                Hello! I'm ChatMitra
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className={`${themeClasses.textMuted} max-w-md text-sm sm:text-base`}
              >
                Your intelligent AI companion ready to help with any questions
                or tasks. Let's start an amazing conversation!
              </motion.p>
            </motion.div>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  bounce: 0.3,
                }}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-end space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%]">
                  {msg.role === "assistant" && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                      className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full ${
                        isDarkMode
                          ? "bg-gradient-to-r from-purple-500 to-blue-500"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                      } flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      <span className="text-white text-xs sm:text-sm">🤖</span>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{
                      scale: 0.8,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      delay: msg.role === "assistant" ? 0.3 : 0,
                      type: "spring",
                      bounce: 0.4,
                    }}
                    className={`px-3 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl backdrop-blur-sm shadow-lg relative overflow-hidden ${
                      msg.role === "user"
                        ? `${themeClasses.userBg} text-white shadow-purple-500/25`
                        : msg.isError
                        ? `${themeClasses.errorBg} border`
                        : `${themeClasses.botBg} ${themeClasses.text} border shadow-slate-500/10`
                    } ${
                      msg.role === "user" ? "rounded-br-lg" : "rounded-bl-lg"
                    }`}
                  >
                    {/* Message background effect */}
                    {msg.role === "user" && (
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    )}
                    <span
                      className="relative z-10 text-xs sm:text-sm md:text-base leading-relaxed block break-words"
                      style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}
                    >
                      {msg.text}
                    </span>
                  </motion.div>

                  {msg.role === "user" && (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                      className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full ${
                        isDarkMode
                          ? "bg-gradient-to-r from-slate-600 to-slate-700"
                          : "bg-gradient-to-r from-slate-300 to-slate-400"
                      } flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      <span
                        className={`${
                          isDarkMode ? "text-white" : "text-slate-700"
                        } text-xs sm:text-sm font-bold`}
                      >
                        U
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex w-full justify-start"
            >
              <div className="flex items-end space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full ${
                    isDarkMode
                      ? "bg-gradient-to-r from-purple-500 to-blue-500"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  } flex items-center justify-center flex-shrink-0 shadow-lg`}
                >
                  <span className="text-white text-xs sm:text-sm">🤖</span>
                </motion.div>
                <div
                  className={`px-3 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl rounded-bl-lg ${themeClasses.botBg} ${themeClasses.textSecondary} border backdrop-blur-sm shadow-lg flex items-center space-x-3`}
                >
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -8, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                        className={`w-2 h-2 rounded-full ${
                          isDarkMode ? "bg-purple-400" : "bg-blue-500"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">ChatMitra is </span>
                    <span className="sm:hidden">AI is </span>thinking...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`relative p-3 sm:p-6 ${themeClasses.border} border-t backdrop-blur-sm`}
        >
          <div className="flex items-end space-x-2 sm:space-x-4">
            <div className="flex-1 relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  isTyping ? "Please wait..." : "Type your message..."
                }
                disabled={isTyping}
                maxLength={500}
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl ${themeClasses.inputBg} ${themeClasses.inputBorder} ${themeClasses.inputFocus} ${themeClasses.text} border backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300 shadow-lg resize-none text-sm sm:text-base`}
              />

              {input.length > 400 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute -top-6 sm:-top-8 right-2 text-xs ${
                    themeClasses.textMuted
                  } ${
                    isDarkMode ? "bg-slate-800/80" : "bg-white/80"
                  } px-2 py-1 rounded-lg backdrop-blur-sm`}
                >
                  {input.length}/500
                </motion.div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg text-sm sm:text-base ${
                isTyping || !input.trim()
                  ? `${
                      isDarkMode
                        ? "bg-slate-700/50 text-slate-500"
                        : "bg-slate-200/50 text-slate-400"
                    } cursor-not-allowed`
                  : `${
                      isDarkMode
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    } text-white hover:shadow-2xl hover:shadow-purple-500/25`
              }`}
            >
              {isTyping ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⟳
                </motion.div>
              ) : (
                <motion.span
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 15 }}
                  className="inline-block"
                >
                  <span className="hidden sm:inline">Send ✨</span>
                  <span className="sm:hidden">✨</span>
                </motion.span>
              )}
            </motion.button>
          </div>
        </motion.div>

        <style jsx>{`
          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </motion.div>
    </div>
  );
}
