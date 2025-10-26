"use client";

export default function NavBar() {
  return (
    <nav className="flex gap-6 text-gray-700 dark:text-gray-300 font-medium">
      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent("switchTab", { detail: "image" }));
          document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="hover:text-indigo-500 transition"
      >
        Scan Label
      </button>

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent("switchTab", { detail: "ingredients" }));
          document.getElementById("ingredients")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="hover:text-indigo-500 transition"
      >
        Ingredients
      </button>

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent("switchTab", { detail: "chat" }));
          document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="hover:text-indigo-500 transition"
      >
        Health Chat
      </button>
    </nav>
  );
}