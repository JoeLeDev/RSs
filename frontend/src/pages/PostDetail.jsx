import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/Axios";
import { useAuth } from "../contexts/AuthContext";
import PostList from "../components/post/PostList";
import PostForm from "../components/post/PostForm";
import Loader from "../components/Loader";

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/posts/${id}`);
      setPost(res.data);
      setError("");
    } catch (err) {
      setError("Post introuvable ou erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Détail du post</h1>
      {/* On réutilise PostList pour l'affichage d'un seul post */}
      <PostList posts={[post]} onDelete={fetchPost} />
    </div>
  );
};

export default PostDetail; 