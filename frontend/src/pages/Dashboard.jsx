import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import API from '../api/Axios';
import PostForm from '../components/post/PostForm';
import PostList from '../components/post/PostList';
import Banner from '../components/Banner';
import DashboardImage from '../assets/Group.jpg';
import CalendarComponent from '../components/CalendarComponent';
import ContactList from "../components/ContactList";
import ChatWindow from "../components/ChatWindow";
import Loader from "../components/Loader";


const Dashboard = () => {
  const { user, userData, loading, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

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

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await API.get("/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(res.data.filter(u => u._id !== userData?._id)); // On ne s'affiche pas soi-même
      } catch (err) {
        setContacts([]);
      }
    };
    fetchContacts();
  }, [user, userData]);

  useEffect(() => {
    if (refreshUserData) refreshUserData();
    // eslint-disable-next-line
  }, []);

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

  const handleContactActionDone = () => {
    // Rafraîchir la liste des contacts après action d'amitié
    if (user) {
      fetchContacts();
    }
  };

  if (loading || isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner
        image={DashboardImage}
        title="Fil d'actualités"
        subtitle="Partagez vos moments avec la communauté"
        height="h-[400px]"
      />
      <div className="max-w-6xl mx-auto py-8 md:flex">
        <div className="flex-grow md:pr-8">
          {/* Formulaire de création de post */}
          <PostForm onPostCreated={fetchPosts} />
          {/* Liste des posts */}
          <PostList posts={posts} onDelete={fetchPosts} />
        </div>
        {/* Colonne de droite : contacts + calendrier */}
        <div className="md:w-[400px] bg-white p-4 rounded-lg shadow-md mt-8 md:mt-0">
          {/* Contacts */}
          <ContactList
            contacts={contacts}
            onContactClick={setSelectedContact}
            currentUserId={userData?._id}
            currentUserData={userData}
            onActionDone={handleContactActionDone}
          />
          {/* Fenêtre de chat */}
          {selectedContact && (
            <ChatWindow
              contact={selectedContact}
              onClose={() => setSelectedContact(null)}
            />
          )}
          {/* Calendrier */}
          <h2 className="text-1xl font-bold mb-4 mt-6">Mes Événements</h2>
          <CalendarComponent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
