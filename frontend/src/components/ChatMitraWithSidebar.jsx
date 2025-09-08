"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ChatMitraSidebar = ({
  isOpen,
  onToggle,
  isDarkMode = false,
  onNewChat,
  onSelectChat,
  currentChatId,
  chatHistory = [],
  onDeleteChat,
}) => {
  const themeClasses = isDarkMode
    ? {
        bg: "bg-slate-900/95",
        containerBg: "bg-slate-800/50",
        border: "border-slate-700/50",
        text: "text-white",
        textSecondary: "text-slate-300",
        textMuted: "text-slate-400",
        hover: "hover:bg-slate-700/50",
        active: "bg-slate-700/70",
        newChatBg:
          "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
        toggleBg: "bg-slate-800/80 hover:bg-slate-700/80",
        scrollbar: "scrollbar-dark",
      }
    : {
        bg: "bg-white/95",
        containerBg: "bg-white/60",
        border: "border-slate-200/50",
        text: "text-slate-800",
        textSecondary: "text-slate-600",
        textMuted: "text-slate-500",
        hover: "hover:bg-slate-100/50",
        active: "bg-slate-200/70",
        newChatBg:
          "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
        toggleBg: "bg-white/80 hover:bg-slate-100/80",
        scrollbar: "scrollbar-light",
      };

  const formatTimestamp = (timestamp) => {
    // Add check for invalid or null timestamps
    if (!timestamp) return "No date";

    const now = new Date();
    const chatTime = new Date(timestamp);

    // Check if the date is valid before proceeding
    if (isNaN(chatTime)) {
      return "Invalid Date";
    }

    const diff = now - chatTime;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return minutes + "m ago";
    if (hours < 24) return hours + "h ago";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + "d ago";
    return chatTime.toLocaleDateString();
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    if (onNewChat) {
      onNewChat({
        id: newChatId,
        createdAt: new Date().toISOString(),
        firstMessage: "",
        lastMessage: "",
        messageCount: 0,
      });
    }
  };

  const handleSelectChat = (chatId) => {
    if (onSelectChat) onSelectChat(chatId);
  };

  // Fixed delete handler with proper event handling
  const handleDeleteChat = (e, chatId) => {
    // Stop event propagation using standard methods
    e.preventDefault();
    e.stopPropagation();

    const chatToDelete = chatHistory.find((chat) => chat.id === chatId);
    const chatName = generateChatName(chatToDelete?.firstMessage);

    if (
      onDeleteChat
    ) {
      console.log("Deleting chat:", chatId);
      onDeleteChat(chatId);
    }
  };

  const generateChatName = (firstMessage) => {
    if (!firstMessage || firstMessage.trim() === "") return "New Conversation";
    return firstMessage.length > 30
      ? firstMessage.substring(0, 30) + "..."
      : firstMessage;
  };

  return (
    <>
      {/* Toggle Button */}
      {/* Adjust top/left for smaller screens to prevent overlapping */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`fixed z-50 p-3 rounded-xl ${themeClasses.toggleBg} ${themeClasses.border} border backdrop-blur-sm shadow-lg transition-all duration-300 flex items-center space-x-2 top-4 left-4 sm:top-2 sm:left-2`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            // Close icon
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={themeClasses.text}
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            // Menu/Hamburger icon
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={themeClasses.text}
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </motion.div>

        {!isOpen && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${themeClasses.text} text-sm font-medium hidden sm:block`}
          >
            Chat History
          </motion.span>
        )}
      </motion.button>

      {/* Backdrop for mobile */}
      <AnimatePresence key="backdrop-presence">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence key="sidebar-presence">
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 h-full w-80 ${themeClasses.bg} ${themeClasses.border} border-r backdrop-blur-xl z-40 flex flex-col shadow-2xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative z-10 p-6 ${themeClasses.border} border-b backdrop-blur-sm`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  {/* <div
                    className={`w-10 h-10 rounded-xl ${
                      isDarkMode
                        ? "bg-gradient-to-r from-purple-500 to-blue-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    } flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-lg">🤖</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute -inset-1 rounded-xl ${
                      isDarkMode ? "bg-purple-500/20" : "bg-blue-400/20"
                    } blur-md -z-10`}
                  /> */}
                </motion.div>

                <div className="text-right flex-1">
                  <h2
                    className={`text-xl font-bold ${
                      themeClasses.text
                    } bg-gradient-to-r ${
                      isDarkMode
                        ? "from-purple-400 to-blue-400"
                        : "from-purple-600 to-blue-600"
                    } bg-clip-text text-transparent`}
                  >
                    Chat History
                  </h2>
                  <p className={`text-sm ${themeClasses.textMuted}`}>
                    {chatHistory.length} conversation
                    {chatHistory.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* New Chat Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChat}
                className={`w-full px-4 py-3 rounded-xl ${themeClasses.newChatBg} text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
              >
                <motion.span
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </motion.span>
                <span>New Chat</span>
              </motion.button>
            </motion.div>

            {/* Chat List */}
            <div
              className={`flex-1 overflow-y-auto p-4 space-y-2 ${themeClasses.scrollbar}`}
            >
              <AnimatePresence mode="popLayout" key="chat-history-list">
                {chatHistory.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      type: "spring",
                      bounce: 0.3,
                    }}
                    whileHover={{ scale: 1.02 }}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      currentChatId === chat.id
                        ? themeClasses.active
                        : `${themeClasses.containerBg} ${themeClasses.hover}`
                    } ${
                      themeClasses.border
                    } border backdrop-blur-sm shadow-sm hover:shadow-lg`}
                  >
                    {/* Active indicator */}
                    {currentChatId === chat.id && (
                      <motion.div
                        layoutId="activeChat"
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${
                          isDarkMode
                            ? "bg-gradient-to-b from-purple-500 to-blue-500"
                            : "bg-gradient-to-b from-blue-500 to-purple-500"
                        }`}
                      />
                    )}

                    {/* Chat content that triggers selection */}
                    <div
                      className="flex items-start justify-between"
                      onClick={() => handleSelectChat(chat.id)}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3
                            className={`font-semibold text-sm ${themeClasses.text} truncate`}
                          >
                            {generateChatName(chat.firstMessage)}
                          </h3>
                          {chat.messageCount > 0 && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode
                                  ? "bg-slate-700 text-slate-300"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {chat.messageCount}
                            </span>
                          )}
                        </div>

                        {chat.lastMessage && (
                          <p
                            className={`text-xs ${themeClasses.textMuted} truncate mb-2`}
                          >
                            {chat.lastMessage}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${themeClasses.textMuted}`}>
                            {formatTimestamp(chat.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Delete button - separated from clickable area with additional protection */}
                      <div
                        className="flex-shrink-0"
                        onClick={(e) => e.stopPropagation()} // Additional protection
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 shadow-sm hover:shadow-md"
                          aria-label="Delete conversation"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Hover effect */}
                    <motion.div
                      className={`absolute inset-0 rounded-xl ${
                        isDarkMode ? "bg-purple-500/5" : "bg-blue-500/5"
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty state */}
              {chatHistory.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-40 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-3"
                  >
                    💬
                  </motion.div>
                  <p className={`text-sm ${themeClasses.textMuted}`}>
                    No conversations yet
                  </p>
                  <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                    Start a new chat to begin!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-4 ${themeClasses.border} border-t backdrop-blur-sm`}
            >
              <div className={`text-center text-xs ${themeClasses.textMuted}`}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-block"
                >
                  ✨
                </motion.div>
                <span className="mx-2">ChatMitra AI</span>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: 1,
                  }}
                  className="inline-block"
                >
                  🚀
                </motion.div>
              </div>
            </motion.div>

            {/* Custom scrollbar styles */}
            <style jsx>{`
              .scrollbar-dark {
                scrollbar-width: thin;
                scrollbar-color: rgba(147, 51, 234, 0.3) rgba(51, 65, 85, 0.1);
              }
              .scrollbar-dark::-webkit-scrollbar {
                width: 4px;
              }
              .scrollbar-dark::-webkit-scrollbar-track {
                background: rgba(51, 65, 85, 0.1);
                border-radius: 2px;
              }
              .scrollbar-dark::-webkit-scrollbar-thumb {
                background: rgba(147, 51, 234, 0.3);
                border-radius: 2px;
              }
              .scrollbar-dark::-webkit-scrollbar-thumb:hover {
                background: rgba(147, 51, 234, 0.5);
              }

              .scrollbar-light {
                scrollbar-width: thin;
                scrollbar-color: rgba(59, 130, 246, 0.3)
                  rgba(148, 163, 184, 0.1);
              }
              .scrollbar-light::-webkit-scrollbar {
                width: 4px;
              }
              .scrollbar-light::-webkit-scrollbar-track {
                background: rgba(148, 163, 184, 0.1);
                border-radius: 2px;
              }
              .scrollbar-light::-webkit-scrollbar-thumb {
                background: rgba(59, 130, 246, 0.3);
                border-radius: 2px;
              }
              .scrollbar-light::-webkit-scrollbar-thumb:hover {
                background: rgba(59, 130, 246, 0.5);
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatMitraSidebar;
