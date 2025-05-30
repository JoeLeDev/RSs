import { useState } from "react";
import { toast } from "react-toastify";
import API from "../api/axios";

const ManageGroupModal = ({ group, members, onClose, onUpdate, onDelete }) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentPilotId = group.roles?.find((r) => r.role === "pilote")?.userId?._id || 
                         group.roles?.find((r) => r.role === "pilote")?.userId || "";

  const [selectedPilotId, setSelectedPilotId] = useState(currentPilotId);

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      await onUpdate({ name, description });
      onClose();
    } catch (err) {
      setError("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Es-tu sûr de vouloir supprimer ce groupe ?");
    if (!confirm) return;
    await onDelete();
    toast.success("Groupe supprimé avec succès");
    onClose();
  };

  const handlePilotChange = async (newPilotId) => {
    setSelectedPilotId(newPilotId);
    if (newPilotId === currentPilotId && newPilotId !== "") return;
  
    try {
      await API.patch(`/groups/${group._id}/roles`, {
        memberId: newPilotId || null,
            role: "pilote",
      });
      toast.success("Pilote mis à jour !");
      await onUpdate({ name, description });; // 🔁 remet à jour le groupe dans la modale
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du pilote");
    }
  };

  console.log("Membres reçus :", members);
console.log("Groupe reçu :", group);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4">Gérer le groupe</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Nom du groupe</label>
            <input
              className="w-full border border-gray-300 px-3 py-2 rounded mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-2 rounded mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Enregistrer
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Gestion du pilote */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">
            Définir le pilote du groupe
          </label>
          <select
            value={selectedPilotId}
            onChange={(e) => handlePilotChange(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Aucun pilote</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.username} {member._id === currentPilotId && "(Pilote actuel)"}
              </option>
            ))}
          </select>
        </div>

        {/* Fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ManageGroupModal;
