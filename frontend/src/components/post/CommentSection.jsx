import { useState } from "react";
import { Trash, Pencil, EyeOff } from "lucide-react";
import API from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

const CommentSection = ({ post, onUpdate }) => {
  const { user, userData } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    try {
      setAddLoading(true);
      await API.post(`/posts/${post._id}/comments`, { content: newComment });
      setNewComment("");
      onUpdate();
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async (commentId) => {
    try {
      setEditLoading(true);
      await API.patch(`/posts/${post._id}/comments/${commentId}`, {
        content: editingContent,
      });
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error("Erreur lors de la modification du commentaire:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await API.delete(`/posts/${post._id}/comments/${commentId}`);
      onUpdate();
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
    }
  };

  const handleHide = async (commentId) => {
    try {
      await API.patch(`/posts/${post._id}/comments/${commentId}/hide`);
      onUpdate();
    } catch (error) {
      console.error("Erreur lors du masquage du commentaire:", error);
    }
  };

  const canDelete = (comment) => {
    return (
      (comment?.author?._id === userData?._id) || userData?.role === "admin"
    );
  };

  const canEdit = (comment) => comment?.author?._id === userData?._id;

  const canHide = post?.author?._id === userData?._id;

  if (!post?.comments) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      {post.comments.map((comment) =>
        !comment.hidden && (
          <div key={comment._id} className="border p-2 rounded bg-gray-50">
            {editingId === comment._id ? (
              <div className="flex gap-2">
                <input
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="border px-2 py-1 flex-1"
                />
                <button
                  onClick={() => handleEdit(comment._id)}
                  disabled={editLoading}
                >
                  💾
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  <strong>{comment?.author?.username || "Utilisateur"}</strong> :{" "}
                  {comment.content}
                </p>
                <div className="flex gap-2 text-sm mt-1 text-gray-500">
                  {canEdit(comment) && (
                    <button
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditingContent(comment.content);
                      }}
                    >
                      <Pencil className="w-4 h-4 inline" />
                    </button>
                  )}
                  {canDelete(comment) && (
                    <button onClick={() => handleDelete(comment._id)}>
                      <Trash className="w-4 h-4 inline" />
                    </button>
                  )}
                  {canHide && (
                    <button onClick={() => handleHide(comment._id)}>
                      <EyeOff className="w-4 h-4 inline" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )
      )}

      <div className="mt-2 flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="border px-2 py-1 flex-1"
        />
        <button
          onClick={handleAdd}
          disabled={addLoading}
          className="bg-blue-600 text-white px-4 rounded"
        >
          {addLoading ? "Ajout..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
