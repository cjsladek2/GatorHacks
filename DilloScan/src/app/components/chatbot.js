"use client";

import { useState, useEffect, useRef } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null); // for auto-scroll

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botMsg = {
        text: `This is a simulated response about the ingredient: ${userMsg.text}`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-6 rounded-3xl bg-gradient-to-br from-white/90 to-[#f8fbff]/90 dark:from-gray-900/80 dark:to-gray-800/80 shadow-xl border border-white/40 dark:border-gray-700 backdrop-blur-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-green-50 dark:from-[#151529] dark:to-[#1b1b33]">
        <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-green-500">
          Ask an Armadillo!
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Curious about ingredients, additives, or what’s hiding on a label? Ask away.
        </p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-700">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center italic mt-20">
            Start by typing an ingredient below...
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-pop flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-300 ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-indigo-400/20 to-green-300/20 text-gray-800 dark:text-gray-200 border border-indigo-200 dark:border-indigo-700"
                  : "bg-gray-100 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 shadow-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 p-4 bg-white/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 backdrop-blur-md"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about an ingredient..."
          className="flex-grow px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 placeholder-gray-400 text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-green-400 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}
