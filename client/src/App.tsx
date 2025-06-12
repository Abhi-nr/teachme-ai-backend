import React, { useState, useRef } from "react";
import axios from "axios";

const App = () => {
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "Hi! Can you teach me something? What should we talk about?" }
  ]);
  const [input, setInput] = useState("");
  const [concept, setConcept] = useState("");
  const [sessionId] = useState(() => Date.now().toString());
  const recognitionRef = useRef<any>(null);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    const newConcept = chat.length === 1 ? message : concept;
    setConcept(newConcept);
    setChat(prev => [...prev, { from: "user", text: message }]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:3001/api/chat", {
        sessionId,
        userMessage: message,
        concept: newConcept
      });
      setChat(prev => [...prev, { from: "ai", text: res.data.aiMessage }]);
    } catch {
      setChat(prev => [...prev, { from: "ai", text: "Oops! Couldn't reach the AI." }]);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return alert("Speech Recognition not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.onerror = (e: any) => console.error(e);
    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>TeachMe AI 🎓</h2>
      <div style={{ background: "#f9f9f9", padding: 16, minHeight: 300 }}>
        {chat.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.from === "ai" ? "left" : "right", marginBottom: 8 }}>
            <b>{msg.from === "ai" ? "AI: " : "You: "}</b>{msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend(input)}
          style={{ flex: 1, padding: 10 }}
          placeholder="Type or speak..."
        />
        <button onClick={() => handleSend(input)}>Send</button>
        <button onClick={startListening}>🎤 Speak</button>
      </div>
    </div>
  );
};

export default App;