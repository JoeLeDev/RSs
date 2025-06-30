import React, { useState, useEffect, useRef } from "react";
import API from "../api/Axios";
import { useAuth } from "../contexts/AuthContext";

const ConversationView = ({ contact }) => {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !contact) return;
      const token = await user.getIdToken();
      const res = await API.get(`/messages/${contact._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    };
    fetchMessages();
  }, [contact, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b flex items-center gap-3">
        <img
          src={contact.imageUrl || "/default-avatar.png"}
          alt={contact.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-bold text-lg">{contact.username}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">Début de la conversation</p>
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
                    "px-4 py-2 rounded-2xl max-w-[70%] break-words shadow " +
                    (isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none")
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
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-white">
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

export default ConversationView; 