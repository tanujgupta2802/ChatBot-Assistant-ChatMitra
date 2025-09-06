"use client";

import React, { useState, useRef, useEffect } from "react";

export default function Section() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // NEW: typing state
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setIsTyping(true); // show "sending..." immediately

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsTyping(false); // hide "sending..." once reply received
    }

    setInput("");
  };

  return (
    <div className="mt-30 sm:mt-50">
      <div className="flex flex-col max-w-2xl mx-auto mt-6 p-4 sm:p-6">
        {/* Heading */}
        <h1 className="text-center text-2xl sm:text-4xl text-indigo-600 font-extrabold mb-4">
          ChatTGP AI Assistant
        </h1>

        {/* Chat box */}
        <div className="w-full p-2 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-1">
              Ask me anything... 👋
            </p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl break-words text-sm sm:text-base ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="max-w-[75%] px-4 py-2 rounded-2xl break-words text-sm sm:text-base bg-gray-200 text-gray-600 rounded-bl-none italic">
                sending...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input + Send button */}
        <div className="flex gap-2 sm:gap-3 mt-2">
          <input
            className="flex-1 border border-gray-300 px-4 py-2 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 placeholder-gray-500"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Send
          </button>
        </div>

        {/* Custom style to hide scrollbar */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
        `}</style>
      </div>
    </div>
  );
}
