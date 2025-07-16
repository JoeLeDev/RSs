import React, { useEffect, useState } from 'react';
import API from '../api/Axios';
import { useAuth } from '../contexts/AuthContext';
import FriendButton from '../components/FriendButton';

const Members = () => {
  const { user, userData, refreshUserData } = useAuth();
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await API.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      setMembers(res.data.filter(u => u._id !== userData?._id));
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [user]);

  useEffect(() => {
    if (refreshUserData) refreshUserData();
    // eslint-disable-next-line
  }, []);

  const handleActionDone = async () => {
    if (refreshUserData) await refreshUserData();
    await fetchMembers();
  };

  const filteredMembers = members.filter(m => {
    if (search && !m.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (!userData) return true;
    if (filter === 'Amis') return userData.friends?.some(f => (f._id || f) === m._id);
    if (filter === 'Membres') return !userData.friends?.some(f => (f._id || f) === m._id);
    if (filter === "Demandes d'amis") return userData.friendRequestsReceived?.some(f => (f._id || f) === m._id);
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Membres de la plateforme</h1>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="Tous">Tous</option>
          <option value="Amis">Amis</option>
          <option value="Membres">Membres</option>
          <option value="Demandes d'amis">Demandes d'amis</option>
        </select>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <ul className="space-y-3">
          {filteredMembers.map(member => (
            <li key={member._id} className="flex items-center gap-4 bg-white p-3 rounded shadow">
              {member.imageUrl && member.imageUrl.trim() !== "" ? (
                <img src={member.imageUrl} alt={member.username} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xl font-semibold">
                  {member.username ? member.username.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <span className="flex-1 font-semibold">{member.username}</span>
              <FriendButton
                profileUserId={member._id}
                onActionDone={handleActionDone}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Members; 