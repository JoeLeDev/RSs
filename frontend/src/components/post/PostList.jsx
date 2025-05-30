import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../api/axios";
import { MoreVertical, Trash, Pencil, FileText, ThumbsUp, MessageCircle } from "lucide-react";
import PostEditModal from "./PostEditModal";
import CommentSection from "./CommentSection";
import { toast } from "react-toastify";

const PostList = ({ posts = [], onDelete }) => {
  const { user, userData } = useAuth();
  const [showMenuId, setShowMenuId] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [showComments, setShowComments] = useState({});

  const handleDelete = async (postId) => {
    try {
      const confirmed = window.confirm("Supprimer ce post ?");
      if (!confirmed) return;
      await API.delete(`/posts/${postId}`);
      onDelete();
    } catch (err) {
      console.error("Erreur delete", err);
    }
  };

  const handleUpdatePost = () => {
    onDelete();
    setEditPost(null);
  };

  const handleLike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/like`);
      onDelete(); // Rafraîchir la liste des posts
    } catch (err) {
      toast.error("Erreur lors du like");
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/unlike`);
      onDelete(); // Rafraîchir la liste des posts
    } catch (err) {
      toast.error("Erreur lors du unlike");
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const isLiked = (post) => {
    return post.likes?.some(likeId => likeId?.toString() === userData?._id?.toString());
  };

  if (!posts.length)
    return (
      <p className="text-center text-gray-500">Aucun post pour le moment.</p>
    );

  return (
    <div className="space-y-6 px-4 max-w-4xl mx-auto pb-12">
      {posts.map((post) => {
        if (!post.author) return null; // Sécurité : ignorer les posts orphelins
        return (
          <div
            key={post._id}
            className="bg-white p-6 rounded-xl shadow-sm relative"
          >
            {(userData?._id === post.author._id || userData?.role === "admin") && (
              <div className="absolute top-3 right-3">
                <button
                  onClick={() =>
                    setShowMenuId((prev) => (prev === post._id ? null : post._id))
                  }
                >
                  <MoreVertical className="w-5 h-5 text-gray-500 hover:text-black" />
                </button>
                {showMenuId === post._id && (
                  <div className="absolute right-0 mt-2 bg-white border rounded shadow z-10">
                    <button
                      onClick={() => setEditPost(post)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-sm text-red-600"
                    >
                      <Trash className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Section Auteur avec photo de profil */}
            <div className="flex items-center mb-3">
              {/* Photo de profil de l'auteur */}
              {post.author.imageUrl ? (
                <img
                  src={post.author.imageUrl}
                  alt={`${post.author.username} avatar`}
                  className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                />
              ) : (
                // Placeholder si pas de photo
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold mr-3">
                  {post.author.username ? post.author.username.charAt(0).toUpperCase() : ''}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-800">
                  {post.author?.username || "Utilisateur"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {post.author?.role === "pilote" && (
                    <span className="text-green-500 font-semibold">Pilote</span>
                  )}
                </p>
              </div>
            </div>

            <p className="text-gray-700 whitespace-pre-line mb-4">{post.content}</p>

            {post.fileUrl && (
              <div className="mt-3">
                {post.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={post.fileUrl}
                    alt="Media"
                    className="max-h-64 rounded object-contain border"
                  />
                ) : post.fileUrl.endsWith(".mp4") ? (
                  <video controls className="w-full max-h-64 rounded border">
                    <source src={post.fileUrl} type="video/mp4" />
                  </video>
                ) : post.fileUrl.endsWith(".mp3") ? (
                  <audio controls className="w-full mt-2">
                    <source src={post.fileUrl} type="audio/mpeg" />
                  </audio>
                ) : (
                  <a
                    href={post.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline flex items-center gap-2 mt-2"
                  >
                    <FileText className="w-4 h-4" />
                    Voir le fichier
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mt-4 border-t pt-4">
              <button
                onClick={() => isLiked(post) ? handleUnlike(post._id) : handleLike(post._id)}
                className={`flex items-center gap-2 ${
                  isLiked(post) ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>{post.likes?.length || 0}</span>
              </button>
              <button
                onClick={() => toggleComments(post._id)}
                className="flex items-center gap-2 text-gray-500"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments?.length || 0}</span>
              </button>
            </div>

            {showComments[post._id] && (
              <CommentSection post={post} onUpdate={onDelete} />
            )}

            <p className="text-gray-500 text-sm mt-2">
              {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        );
      })}

      {editPost && (
        <PostEditModal
          post={editPost}
          onClose={() => setEditPost(null)}
          onPostUpdated={handleUpdatePost}
        />
      )}
    </div>
  );
};

export default PostList;
