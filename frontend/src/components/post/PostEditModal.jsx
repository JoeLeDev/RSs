// src/components/post/PostEditModal.jsx
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import API from "../../api/Axios";
import { toast } from "react-toastify";

const PostEditModal = ({ post, onClose, onPostUpdated }) => {
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!content.trim()) {
      return toast.error("Le contenu ne peut pas être vide");
    }

    try {
      setLoading(true);
      const res = await API.patch(`/posts/${post._id}`, { content });
      toast.success("Post mis à jour !");
      onPostUpdated(res.data); // 🔁 met à jour depuis le parent
      onClose();
    } catch (err) {
      console.error("Erreur update post", err);
      toast.error("Échec de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    >
      <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>
        <Dialog.Title className="text-lg font-semibold mb-4">
          Modifier le post
        </Dialog.Title>
        <textarea
          className="w-full border rounded px-3 py-2 resize-none min-h-[100px] focus:outline-none focus:ring"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "En cours..." : "Enregistrer"}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default PostEditModal;
