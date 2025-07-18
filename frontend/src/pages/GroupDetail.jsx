import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Users, Calendar, MapPin, Settings } from "lucide-react";
import { toast } from "react-toastify";
import API from "../api/Axios";
import { useAuth } from "../contexts/AuthContext";
import { defineAbilityFor } from "../abilities/ability";
import ManageGroupModal from "../components/ManageModal";
import PostForm from "../components/post/PostForm";
import PostList from "../components/post/PostList";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";


const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState([]);

  const fetchGroup = async () => {
    const token = await user.getIdToken();
    const res = await API.get(`/groups/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGroup(res.data);
  };

  useEffect(() => { if (user) fetchGroup(); }, [user, id]);

  useEffect(() => {
    if (user) {
      console.log("UID Firebase de l'utilisateur connecté:", user.uid);
    }
  }, [user]);

  const isMember = () => group?.members?.some(m => m._id === userData?._id);

  const handleJoin = async () => {
    const token = await user.getIdToken();
    await API.patch(`/groups/${id}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchGroup();
  };

  const handleLeave = async () => {
    const token = await user.getIdToken();
    await API.patch(`/groups/${id}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchGroup();
  };

  const isAdmin = userData?.role === "admin";
  const isPilot = group?.roles?.some(
    (r) =>
      r.role === "pilote" && (r.userId === userData?._id || r.userId?._id === userData?._id)
  );

  const canManageMembers = isAdmin || isPilot;

  const fetchPosts = async () => {
    try {
      const res = await API.get(`/posts/group/${id}?page=1`);
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Erreur lors du chargement des posts :", err);
    }
  };

  useEffect(() => {
    if (group?._id) {
      fetchPosts();
    }
  }, [group?._id]);

  const handleUpdate = async (data) => {
    const res = await API.patch(`/groups/${id}`, data);
    setGroup(res.data);
  };

  const handleDelete = async () => {
    await API.delete(`/groups/${id}`);
    toast.success("Groupe supprimé avec succès");
    navigate("/groups");
  };

  const handleOpenManageModal = async () => {
    try {
      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);
      setShowModal(true);
    } catch (err) {
      toast.error("Erreur lors du chargement du groupe");
    }
  };

  if (error) return <p className="text-red-600 text-center mt-6">{error}</p>;
  if (!group) return <Loader />;

  const ability = defineAbilityFor(userData, group);

  if (loading || isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière */}
      <div
        className="bg-blue-700 text-white py-16 px-6 text-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://source.unsplash.com/1600x400/?community,people')",
        }}
      >
        <h1 className="text-4xl font-bold mb-2 drop-shadow-sm">{group.name}</h1>
        <p className="flex justify-center gap-4 text-blue-100 items-center">
          <Calendar className="w-5 h-5" /> {group.meetingDay}
          <Users className="w-5 h-5" /> {group.members?.length} membre
          {group.members?.length > 1 ? "s" : ""}
          <MapPin className="w-5 h-5" /> {group.meetingLocation}
          {loading || isLoading && <Loader />}
        </p>

        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          {ability.can("update", "Group") && (
            <button
              onClick={handleOpenManageModal}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-yellow-300"
            >
              <Settings className="w-4 h-4" /> Gérer le groupe
            </button>
          )}

          <button
            onClick={isMember() ? handleLeave : handleJoin}
            className={`px-4 py-2 rounded text-white transition ${
              isMember()
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isMember() ? "Quitter le groupe" : "Rejoindre le groupe"}
          </button>

          {canManageMembers && (
            <Link to={`/groups/${group._id}/members`}>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Gérer les membres
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Détails */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{group.description}</p>
        </div>


        {isMember() && (
          <PostForm groupId={group._id} user={user} onPostCreated={fetchPosts} />
        )}

        <PostList groupId={group._id} currentUser={user} posts={posts} onDelete={fetchPosts} />
      </div>

      {showModal && (
        <ManageGroupModal
          group={group}
          members={group.members}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default GroupDetail;
