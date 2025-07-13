// import React, { useState } from "react";
// import axios from "axios";

// export default function Chatbot({ onClose }) {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");

//   // Function to handle user input and get AI response
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage = { sender: "user", text: input };
//     setMessages([...messages, userMessage]);

//     try {
//       const response = await axios.post("https://api.openai.com/v1/chat/completions", {
//         model: "gpt-3.5-turbo",
//         messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: input }],
//       }, {
//         headers: {
//           "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const botMessage = { sender: "bot", text: response.data.choices[0].message.content };
//       setMessages([...messages, userMessage, botMessage]);
//     } catch (error) {
//       console.error("Error fetching AI response:", error);
//       const errorMessage = { sender: "bot", text: "Sorry, I couldn't process that. Please try again." };
//       setMessages([...messages, userMessage, errorMessage]);
//     }

//     setInput("");
//   };

//   return (
//     <div className="fixed bottom-20 right-5 w-72 bg-gray-600 shadow-lg rounded-lg overflow-hidden">
//       {/* Chat Header */}
//       <div className="bg-blue-500 text-black px-4 py-2 flex justify-between items-center">
//         <span>Chatbot</span>
//         <button onClick={onClose} className="text-white">✖</button>
//       </div>

//       {/* Chat Messages */}
//       <div className="h-64 overflow-y-auto p-2">
//         {messages.map((msg, index) => (
//           <div key={index} className={`p-2 rounded-lg my-1 ${msg.sender === "user" ? "bg-blue-600 self-end" : "bg-black self-start"}`}>
//             {msg.text}
//           </div>
//         ))}
//       </div>

//       {/* User Input */}
//       <div className="p-2 flex border-t">
//         <input
//           type="text"
//           className="flex-1 p-1 border rounded"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button onClick={sendMessage} className="bg-blue-500 text-white px-3 ml-1 rounded">➤</button>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          contents: [{ role: "user", parts: [{ text: input }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      let aiResponse =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't understand that.";

      let formattedResponse = formatResponse(aiResponse);
      const botMessage = { sender: "bot", text: formattedResponse };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Error retrieving response. Please try again later." },
      ]);
    }

    setLoading(false);
  };

  const formatResponse = (responseText) => {
    return responseText
      .replace(/([.?!])\s*(?=[A-Z])/g, "$1  ")
      .replace(/\*\*(.*?)\*\*/g, "\n$1")
      .replace(/\n\s*-\s*/g, "\n• ")
      .replace(/\n\s*\*\s*/g, "\n• ")
      .replace(/\n\s*\d+\.\s*/g, "\n• ")
      .replace(/```([\s\S]*?)```/g, "\n[CODE_BLOCK]$1[/CODE_BLOCK]");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
<div className="fixed bottom-5 right-5 w-96 bg-gray-900 text-white shadow-2xl rounded-lg overflow-hidden z-50">
{/* Chat Header */}
      <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
        <span className="font-semibold">Chatbot</span>
        <button onClick={onClose} className="text-white">✖</button>
      </div>

      {/* Chat Messages */}
      <div ref={chatRef} className="h-80 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[85%] ${
              msg.sender === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-700 text-white"
            }`}
          >
            {/* Copy Button for AI Responses
            {msg.sender === "bot" && (
              <button
                onClick={() => copyToClipboard(msg.text.replace(/\[CODE_BLOCK\]/g, "```").replace(/\[\/CODE_BLOCK\]/g, "```"))}
                className="absolute top-1 right-1 bg-gray-600 px-2 py-1 rounded text-xs"
              >
                Copy
              </button>
            )} */}

            {/* Render AI Response with Bullet Points & Code Blocks */}
            {msg.text.split("\n").map((line, i) => {
              if (line.startsWith("[CODE_BLOCK]")) {
                const codeContent = line.replace("[CODE_BLOCK]", "").replace("[/CODE_BLOCK]", "");
                return (
                  <div key={i} className="relative bg-gray-800 p-3 rounded-md mt-2 text-sm">
                    {/* Code Copy Button */}
                    <button
                      onClick={() => copyToClipboard(codeContent)}
                      className="absolute top-1 right-1 bg-gray-600 px-2 py-1 rounded text-xs"
                    >
                      Copy
                    </button>
                    <pre className="bg-black text-white p-2 rounded-md overflow-x-auto text-sm">
                      <code>{codeContent}</code>
                    </pre>
                  </div>
                );
              }
              return <p key={i} className="leading-relaxed">{line}</p>;
            })}
          </div>
        ))}
        {loading && <div className="p-2 text-gray-400">Typing...</div>}
      </div>

      {/* User Input */}
      <div className="p-2 flex border-t bg-gray-800">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg text-black"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 ml-2 rounded-lg">➤</button>
      </div>
    </div>
  );
}
