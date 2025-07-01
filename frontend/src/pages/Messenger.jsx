import React, { useState, useEffect } from "react";
import API from "../api/Axios";
import { useAuth } from "../contexts/AuthContext";
import ConversationView from "../components/ConversationView";
import { useParams } from "react-router-dom";

// Placeholder pour la liste des conversations
const ConversationList = ({ conversations, onSelect, selectedId }) => (
  <div className="w-full h-full flex flex-col">
    <div className="p-4 border-b">
      <input
        type="text"
        placeholder="Rechercher dans Messenger"
        className="w-full px-3 py-2 rounded bg-gray-100 border focus:outline-none"
      />
    </div>
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">Aucune discussion</div>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv._id}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 ${selectedId === conv._id ? "bg-gray-200" : ""}`}
            onClick={() => onSelect(conv)}
          >
            <img
              src={conv.user.imageUrl || "/default-avatar.png"}
              alt={conv.user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{conv.user.username}</div>
              <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">{conv.time}</div>
          </div>
        ))
      )}
    </div>
  </div>
);

const Messenger = () => {
  const { user, userData } = useAuth();
  const { id: urlId } = useParams();
  const [members, setMembers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  // Récupérer tous les membres
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user) return;
      const token = await user.getIdToken();
      const res = await API.get("/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data.filter(u => u._id !== userData?._id));
    };
    fetchMembers();
  }, [user, userData]);

  // Récupérer toutes les conversations (messages)
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      const token = await user.getIdToken();
      const res = await API.get("/messages/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messages = res.data;
      // Grouper par autre utilisateur
      const convMap = {};
      messages.forEach(msg => {
        const other =
          msg.sender._id === userData._id ? msg.recipient : msg.sender;
        if (
          !convMap[other._id] ||
          new Date(msg.timestamp) > new Date(convMap[other._id].timestamp)
        ) {
          convMap[other._id] = {
            _id: other._id,
            user: other,
            lastMessage: msg.content,
            time: new Date(msg.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            rawTime: msg.timestamp
          };
        }
      });
      // Ordonner par date décroissante
      const convArr = Object.values(convMap).sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));
      setConversations(convArr);
    };
    fetchConversations();
  }, [user, userData]);

  useEffect(() => {
    if (!urlId) return;
    // Cherche d'abord dans les conversations
    const conv = conversations.find(c => c.user._id === urlId);
    if (conv) {
      setSelected(conv);
    } else {
      // Sinon, cherche dans les membres
      const member = members.find(m => m._id === urlId);
      if (member) {
        setSelected({ _id: member._id, user: member });
      }
    }
  }, [urlId, conversations, members]);

  // Membres filtrés par recherche et sans conversation existante
  const filteredMembers = members.filter(
    m =>
      m.username.toLowerCase().includes(search.toLowerCase()) &&
      !conversations.some(conv => conv.user._id === m._id)
  );

  const visibleComments = showHidden ? conversations : conversations.filter(c => !c.hidden);

  return (
    <div className="flex h-[80vh] bg-white rounded-lg shadow overflow-hidden mt-8 mb-8 max-w-5xl mx-auto border">
      {/* Colonne de gauche */}
      <div className="w-80 border-r h-full bg-gray-50 flex flex-col">
        <div className="p-4 text-xl font-bold border-b">Discussions</div>
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Rechercher un membre"
            className="w-full px-3 py-2 rounded bg-gray-100 border focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Conversations en cours */}
          {visibleComments.map(conv => (
            <div
              key={conv._id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 ${selected?._id === conv._id ? "bg-gray-200" : ""}`}
              onClick={() => setSelected(conv)}
            >
              <img
                src={conv.user.imageUrl || "/default-avatar.png"}
                alt={conv.user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{conv.user.username}</div>
                <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">{conv.time}</div>
            </div>
          ))}
          {/* Membres trouvés par recherche (pas encore de conversation) */}
          {filteredMembers.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-400">Nouveau message</div>
          )}
          {filteredMembers.map(m => (
            <div
              key={m._id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100`}
              onClick={() => setSelected({ _id: m._id, user: m })}
            >
              <img
                src={m.imageUrl || "/default-avatar.png"}
                alt={m.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{m.username}</div>
                <div className="text-xs text-gray-400 truncate">Nouveau message</div>
              </div>
            </div>
          ))}
          {visibleComments.length === 0 && filteredMembers.length === 0 && (
            <div className="text-center text-gray-400 mt-8">Aucune discussion</div>
          )}
        </div>
      </div>
      {/* Colonne de droite */}
      <div className="flex-1 h-full flex flex-col">
        {selected ? (
          <ConversationView contact={selected.user} />
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-gray-400">
            <span className="text-5xl mb-4">💬</span>
            <div className="text-lg font-semibold">Aucune discussion sélectionnée</div>
            <div className="text-sm">Sélectionnez ou recherchez un membre à gauche pour commencer à discuter.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger; 