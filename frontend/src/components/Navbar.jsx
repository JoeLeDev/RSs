import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-700">
        My ICC Online
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
              Accueil
            </Link>
            <Link to="/groups" className="text-gray-700 hover:text-blue-600">
              Groupes
            </Link>
            <Link to="/profile" className="flex items-center">
              {userData?.imageUrl ? (
                <img
                  src={userData.imageUrl}
                  alt="Photo de profil"
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold">
                  {userData?.username ? userData.username.charAt(0).toUpperCase() : ''}
                </div>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
          <Link to="/Acceuil" className="text-gray-700 hover:text-blue-600">
              Acceuil
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Connexion
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
