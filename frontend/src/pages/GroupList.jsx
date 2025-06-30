import { useEffect, useState, useRef } from "react";
import API from "../api/Axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Settings } from "lucide-react";
import ManageGroupModal from "../components/ManageModal";
import { useAuth } from "../contexts/AuthContext";
import { Search } from "lucide-react";
import FilterDropdown from "../components/FilterDropdown";
import GroupImage from "../assets/group.jpg";
import Banner from "../components/Banner";
import { MapPin, Users, Calendar } from "lucide-react";
import ContactList from "../components/ContactList";
import ChatWindow from "../components/ChatWindow";

const days = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const GroupList = () => {
  const { user, userData } = useAuth();
  const [groups, setGroups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchGroups = async () => {
    const token = await user.getIdToken();
    const res = await API.get("/groups", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGroups(res.data);
    setFiltered(res.data);
  };

  useEffect(() => { if (user) fetchGroups(); }, [user]);

  useEffect(() => {
    let result = [...groups];

    if (meetingDay) {
      result = result.filter((group) => group.meetingDay === meetingDay);
    }

    if (membershipFilter === "joined") {
      result = result.filter((group) =>
        group.members.some((m) =>
          typeof m === "object" ? m._id === userData?._id : m === userData?._id
        )
      );
    } else if (membershipFilter === "not_joined") {
      result = result.filter(
        (group) =>
          !group.members.some((m) =>
            typeof m === "object" ? m._id === userData?._id : m === userData?._id
          )
      );
    }

    if (search.trim() !== "") {
      const lower = search.toLowerCase();
      result = result.filter(
        (group) =>
          group.name.toLowerCase().includes(lower) ||
          group.description.toLowerCase().includes(lower)
      );
    }

    setFiltered(result);
  }, [user, groups, meetingDay, membershipFilter, search, userData]);

  const handleCreateGroup = async () => {
    if (!name || !meetingDay) return toast.error("Le nom et le jour sont requis");

    try {
      const token = await user.getIdToken();
      await API.post("/groups", { name, description, meetingDay, meetingLocation }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Groupe créé !");
      setShowModal(false);
      setName("");
      setDescription("");
      setMeetingLocation("");
      fetchGroups();
    } catch (err) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleUpdateGroup = async (data) => {
    try {
      const token = await user.getIdToken();
      await API.patch(`/groups/${groupToEdit._id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Groupe mis à jour !");
      setShowManageModal(false);
      fetchGroups(); // Rafraîchit la liste des groupes
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const token = await user.getIdToken();
      await API.delete(`/groups/${groupToEdit._id}`, {headers: { Authorization: `Bearer ${token}` }});
      toast.success("Groupe supprimé !");
      setShowManageModal(false);
      fetchGroups();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getTitle = () => {
    const day = meetingDay;
    const membership = membershipFilter;

    if (membership === "joined" && day) return `Mes groupes du ${day}`;
    if (membership === "not_joined" && day) return `Groupes disponibles du ${day}`;
    if (membership === "joined") return `Mes groupes`;
    if (membership === "not_joined") return `Groupes disponibles`;
    if (day) return `Groupes du ${day}`;
    return "Tous les groupes";
  };
  const scrollRef = useRef(null);

  return (
    <div className="w-screen mx-auto">
      <Banner
        image={GroupImage}
        title={getTitle()}
        subtitle="Rejoignez un groupe qui vous correspond !"
        height="h-[400px]"
      />

      <div className="min-h-screen bg-gray-100">
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4 mb-6 ml-5 block max-w-xs text-center"
        >
          + Créer un groupe
        </button>
        <div
          ref={scrollRef}
          className="flex flex-wrap justify-center items-center gap-4 mb-6 max-w-5xl mx-auto"
        >
          {/* 🔍 Barre de recherche stylée avec icône */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* 📅 Dropdown jour de réunion */}
          <FilterDropdown
            label={meetingDay || "Jour de réunion"}
            options={days}
            selected={meetingDay}
            onSelect={setMeetingDay}
          />

          {/* 👥 Dropdown filtre d'appartenance */}
          <FilterDropdown
            label={
              membershipFilter === "joined"
                ? "Mes groupes"
                : membershipFilter === "not_joined"
                ? "Groupes disponibles"
                : "Tous les groupes"
            }
            options={["Mes groupes", "Groupes disponibles"]}
            selected={
              membershipFilter === "joined"
                ? "Mes groupes"
                : membershipFilter === "not_joined"
                ? "Groupes disponibles"
                : ""
            }
            onSelect={(val) =>
              setMembershipFilter(
                val === "Mes groupes"
                  ? "joined"
                  : val === "Groupes disponibles"
                  ? "not_joined"
                  : "all"
              )
            }
          />

          {/* ♻️ Bouton Reset */}
          <button
            onClick={() => {
              setSearch("");
              setMeetingDay("");
              setMembershipFilter("all");
            }}
            className="px-4 py-2 rounded-full bg-gray-300 hover:bg-gray-400 text-sm"
          >
            Réinitialiser
          </button>
        </div>
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filtered.map((group) => (
              <div
                key={group._id}
                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
              >
                {/* Affichage du pilote si présent */}
                {group.roles && group.roles.length > 0 && (() => {
                  const pilotRole = group.roles.find(r => r.role === 'pilote');
                  // Assurez-vous que pilotRole.userId est peuplé avec les données utilisateur complètes
                  const pilot = pilotRole?.userId; // Supposant que userId est peuplé
                  
                  if (pilot) {
                    return (
                      <div className="flex items-center mb-3 text-sm text-gray-700">
                        {/* Photo de profil du pilote */}
                        {pilot.imageUrl ? (
                          <img
                            src={pilot.imageUrl}
                            alt={`${pilot.username} avatar`}
                            className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                          />
                        ) : (
                          // Placeholder si pas de photo
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold mr-2">
                            {pilot.username ? pilot.username.charAt(0).toUpperCase() : ''}
                          </div>
                        )}
                        <span>Pilote : {pilot.username}</span>
                      </div>
                    );
                  }
                  return null;
                })()}

                <h2 className="text-xl font-semibold text-blue-700">
                  {group.name}
                </h2>
                <p className="text-gray-600 mt-2">{group.description}</p>
                <div className="mt-4 text-sm text-gray-500">
                  <div className="mt-4 text-sm text-gray-500 space-y-1">
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {group.members.length} membre
                      {group.members.length > 1 ? "s" : ""}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {group.meetingLocation || "Non définie"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {group.meetingDay}
                    </p>
                  </div>
                </div>
                <Link to={`/groups/${group._id}`}>
                  <button className="mt-4 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm">
                    Voir le groupe
                  </button>
                </Link>
                {(userData?.role === "admin" || group.roles?.some(r => r.role === "pilote" && r.userId === userData?._id)) && (
                  <button
                    onClick={async () => {
                      try {
                        const token = await user.getIdToken();
                        const res = await API.get(`/groups/${group._id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setGroupToEdit(res.data);
                        setShowManageModal(true);
                      } catch (error) {
                        toast.error("Erreur lors du chargement du groupe");
                      }
                    }}
                    className="mt-2 flex items-center gap-2 text-sm bg-yellow-600 text-white hover:bg-yellow-700 px-2 py-1 rounded"
                  >
                    <Settings className="w-4 h-4" />
                    Gérer
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MODALE */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
              <h2 className="text-xl font-bold mb-4">Créer un groupe</h2>

              <input
                type="text"
                placeholder="Nom du groupe"
                className="w-full mb-3 px-4 py-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                placeholder="Description (optionnel)"
                className="w-full mb-4 px-4 py-2 border rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <select
                value={meetingDay}
                onChange={(e) => setMeetingDay(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded"
              >
                <option value="">Sélectionner un jour de réunion</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
        {showManageModal && groupToEdit && (
          <ManageGroupModal
            group={groupToEdit}
            members={groupToEdit.members}
            onClose={() => setShowManageModal(false)}
            onUpdate={handleUpdateGroup}
            onDelete={handleDeleteGroup}
          />
        )}
      </div>

      {/* Liste des contacts à droite */}
      <div className="max-w-6xl mx-auto py-8 md:flex">
        <div className="md:w-[400px] bg-white p-4 rounded-lg shadow-md">
          {/* Contacts */}
          <ContactList contacts={groups} onContactClick={setSelectedContact} />
          {/* Fenêtre de chat */}
          {selectedContact && (
            <ChatWindow
              contact={selectedContact}
              onClose={() => setSelectedContact(null)}
            />
          )}
          {/* Calendrier */}
          <h2 className="text-2xl font-bold mb-4 mt-6">Mes Événements</h2>
          <CalendarComponent />
        </div>
      </div>
    </div>
  );
};

export default GroupList;
