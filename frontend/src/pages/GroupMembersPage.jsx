import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/Axios";
import { useAuth } from "../contexts/AuthContext";
import { Trash2, Users, Crown } from "lucide-react";

const GroupMembersPage = () => {
  const { id } = useParams(); // Group ID
  const navigate = useNavigate();
  const { user, userData, loading: authLoading } = useAuth();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch group details and members
  const fetchGroupAndMembers = async () => {
    if (!user) return; // Wait for auth user
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      // Fetch group details (needed to check pilot role)
      const groupRes = await API.get(`/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroup(groupRes.data);

      // The group object from the backend *should* already contain populated members
      // But if not, you could fetch separately:
      // const membersRes = await API.get(`/groups/${id}/members`, { headers: { Authorization: `Bearer ${token}` } });
      setMembers(groupRes.data.members || []); // Assuming members are populated in group fetch

    } catch (err) {
      console.error("Erreur lors du chargement du groupe ou des membres :", err);
      setError("Erreur lors du chargement des informations du groupe.");
      toast.error("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchGroupAndMembers();
    }
  }, [user, id]); // Depend on user and id

  // Check if current user can kick members (admin or pilot)
  const canKick = () => {
    if (authLoading || !userData || !group) return false; // Wait for user data and group data
    const isAdmin = userData?.role === "admin";
    const isPilot = group?.roles?.some(
      (r) => r.role === "pilote" && r.userId === userData?._id
    );
    return isAdmin || isPilot;
  };

  // Handle kicking a member
  const handleKickMember = async (memberId, username) => {
    if (!canKick()) {
      toast.error("Tu n'as pas la permission de retirer des membres.");
      return;
    }

    const confirmKick = window.confirm(`Es-tu sûr de vouloir retirer ${username} du groupe ?`);
    if (!confirmKick) return;

    try {
      const token = await user.getIdToken();
      await API.patch(`/groups/${id}/kick`, { userId: memberId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${username} a été retiré du groupe.`);
      fetchGroupAndMembers(); // Refresh the list
    } catch (err) {
      console.error("Erreur lors de l'expulsion :", err);
      toast.error("Erreur lors du retrait du membre.");
    }
  };

  // Handle changing a member's role
  const handleChangeRole = async (memberId, newRole) => {
    if (!canKick()) {
      toast.error("Tu n'as pas la permission de changer les rôles.");
      return;
    }
    if (userData?._id === memberId) {
      toast.error("Tu ne peux pas changer ton propre rôle ici.");
      return;
    }

    try {
      const token = await user.getIdToken();
      await API.patch(`/groups/${id}/roles`, { memberId, role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Rôle du membre mis à jour en ${newRole}.`);
      fetchGroupAndMembers(); // Refresh the list
    } catch (err) {
      console.error("Erreur lors du changement de rôle :", err);
      toast.error("Erreur lors de la mise à jour du rôle.");
    }
  };

  if (loading || authLoading) return <p className="text-center mt-8">Chargement des membres...</p>;
  if (error) return <p className="text-red-600 text-center mt-8">{error}</p>;
  if (!group) return <p className="text-center mt-8">Groupe introuvable.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Membres du groupe: {group.name}</h1>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Liste des membres ({members.length})</h2>
        
        {
            (!members || members.length === 0) && (
                <p className="text-gray-600">Aucun membre dans ce groupe.</p>
            )
        }

        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member._id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
              {/* Photo de profil du membre */}
              <div className="flex items-center">
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={`${member.username} avatar`}
                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                  />
                ) : (
                  // Placeholder si pas de photo
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold mr-3">
                    {member.username ? member.username.charAt(0).toUpperCase() : ''}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800">{member.username}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                   {/* Display role and icon */}
                   <div className="flex items-center gap-1 text-sm">
                     {(() => {
                       const memberRole = group?.roles?.find(r => r.userId === member._id || r.userId?._id === member._id)?.role || 'membre';
                       
                       if (memberRole === 'pilote') {
                         return (
                           <span className="flex items-center gap-1 text-blue-600 font-semibold">
                             <Crown className="w-4 h-4" /> Pilote
                           </span>
                         );
                       } else {
                         return (
                           <span className="flex items-center gap-1 text-gray-500">
                             <Users className="w-4 h-4" /> membre
                           </span>
                         );
                       }
                     })()}
                   </div>
                </div>
                {canKick() && userData?._id !== member._id && (
                  <div className="flex items-center gap-2">
                     {/* Role Change Dropdown */}
                    <select
                      value={group?.roles?.find(r => r.userId === member._id || r.userId?._id === member._id)?.role || 'membre'}
                      onChange={(e) => handleChangeRole(member._id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="membre">membre</option>
                      <option value="pilote">Pilote</option>
                    </select>

                     {/* Kick Button */}
                    <button
                      onClick={() => handleKickMember(member._id, member.username)}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                      title="Retirer du groupe"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupMembersPage; 