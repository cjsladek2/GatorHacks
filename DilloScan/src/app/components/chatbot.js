import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: "user", text: input }];

    // Add fake AI response
    newMessages.push({
      sender: "bot",
      text: "This is a simulated response about the ingredient: " + input,
    });

    setMessages(newMessages);
    setInput("");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Chatbot</h2>
      <div className="border p-4 mb-2 max-h-64 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <span className={`inline-block px-2 py-1 rounded ${
                    msg.sender === "user"
                    ? "bg-blue-500 text-white"   // user messages: blue bg, white text
                    : "bg-gray-200 text-gray-800" // bot messages: light gray bg, dark text
                }`   }>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="border p-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about an ingredient..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
            e.preventDefault(); // prevents adding a newline
            handleSend();
            }
        }}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
