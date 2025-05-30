import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bienvenue {user?.email || 'invité'} 👋</h1>


        <div className="bg-white shadow-md rounded-xl p-6">
          <p className="text-gray-700">Ici tu verras bientôt la liste des groupes disponibles ✨</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
