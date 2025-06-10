import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import API from '../api/Axios';
import PostForm from '../components/post/PostForm';
import PostList from '../components/post/PostList';
import Banner from '../components/Banner';
import DashboardImage from '../assets/Group.jpg';

const Dashboard = () => {
  const { userData, user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const res = await API.get('/posts/dashboard');
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Erreur lors du chargement des posts du dashboard :", err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchPosts();
    }
  }, [user, loading]);

  const handlePostCreated = () => {
    // Action à effectuer après la création d'un post (par exemple, rafraîchir la liste)
    fetchPosts();
  };

  const handlePostDeletedOrUpdated = () => {
    // Action à effectuer après suppression/mise à jour (rafraîchir la liste)
    fetchPosts();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner
        image={DashboardImage}
        title="Dashboard"
        subtitle="Partagez vos moments avec la communauté"
        height="h-[400px]"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Formulaire de création de post */}
        <PostForm onPostCreated={fetchPosts} />
        
        {/* Liste des posts */}
        <PostList posts={posts} onDelete={fetchPosts} />
      </div>
    </div>
  );
};

export default Dashboard;
