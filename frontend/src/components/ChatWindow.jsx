import React, { useState, useEffect, useRef } from "react";
import API from "../api/Axios";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";

const ChatWindow = ({ contact, onClose }) => {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Charger la conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !contact) return;
      setLoading(true);
      const token = await user.getIdToken();
      const res = await API.get(`/messages/${contact._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      setLoading(false);
    };
    fetchMessages();
  }, [contact, user]);

  // Scroll en bas à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Envoyer un message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const token = await user.getIdToken();
    await API.post(
      "/messages",
      { recipient: contact._id, content: message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessage("");
    // Recharge la conversation
    const res = await API.get(`/messages/${contact._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessages(res.data);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b">
        <span className="font-bold">{contact.username}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
      </div>
      <div className="p-3 h-52 overflow-y-auto flex-1">
        {loading ? (
          <Loader />
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center">Début de la conversation</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === userData?._id;
            return (
              <div
                key={msg._id}
                className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    `px-4 py-2 rounded-2xl max-w-[70%] break-words shadow ` +
                    (isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                    )
                  }
                >
                  <span>{msg.content}</span>
                  <div className={`text-xs mt-1 ${isMe ? "text-right text-blue-100/80" : "text-left text-gray-500"}`}>
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
        <input
          type="text"
          placeholder="Écris un message..."
          className="w-full border rounded px-2 py-1"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Envoyer</button>
      </form>
    </div>
  );
};

export default ChatWindow; 