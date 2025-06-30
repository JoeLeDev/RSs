import React, { useState } from "react";

const ChatWindow = ({ contact, onClose }) => {
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    // Ici tu pourras brancher l'envoi de message plus tard
    setMessage("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b">
        <span className="font-bold">{contact.username}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
      </div>
      <div className="p-3 h-64 overflow-y-auto flex-1">
        {/* Ici tu affiches les messages */}
        <p className="text-gray-400 text-center">Début de la conversation</p>
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