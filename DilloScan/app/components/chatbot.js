"use client";

import { useState, useRef, useEffect } from "react";

export default function Chatbot({ ingredients, analysisData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your ingredient analysis assistant. Ask me anything about the ingredients in your scanned label!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      const result = await response.json();

      if (result.success) {
        const botMessage = { role: "assistant", content: result.response };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = {
          role: "assistant",
          content: "Sorry, I encountered an error: " + result.error,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Could not connect to the chat server. Make sure the API is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
      <div className="glass p-6 rounded-3xl shadow-xl max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-green-500">
            Ask an Armadillo!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Curious about ingredients, additives, or what’s hiding on a label? Ask away.
          </p>
        </div>

        {/* Context Info */}
        {ingredients && ingredients.length > 0 && (
            <div
                className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 <strong>Context loaded:</strong> {ingredients.length} ingredient
                {ingredients.length !== 1 ? "s" : ""} from your scan
              </p>
            </div>
        )}

        {/* Messages Container */}
        <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
          {messages.map((message, index) => (
              <div
                  key={index}
                  className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === "user"
                            ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
          ))}

          {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{animationDelay: "0.1s"}}
                    ></div>
                    <div
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{animationDelay: "0.2s"}}
                    ></div>
                  </div>
                </div>
              </div>
          )}

          <div ref={messagesEndRef}/>
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about ingredients, safety, nutrition..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              disabled={loading}
          />
          <button
              onClick={sendMessage}
              disabled={loading}
              className={`px-6 py-3 bg-gradient-to-r from-indigo-500 to-green-400 text-white rounded-full font-semibold 
              transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? "..." : "Send"}
          </button>

        </div>

        {/* Suggested Questions */}
        {!loading && messages.length <= 2 && ingredients && ingredients.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Which ingredients should I avoid?",
                  "What are the healthiest ingredients?",
                  "Are there any allergens?",
                  "Explain the preservatives",
                ].map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => setInput(suggestion)}
                        className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:border-indigo-500 transition-all"
                    >
                      {suggestion}
                    </button>
                ))}
              </div>
            </div>
        )}
      </div>
  );
}
