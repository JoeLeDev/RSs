import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import logo from '../assets/header/ICC-.png';

const Header = () => {
  const { user, logout, userData } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex flex-wrap justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-700">
        <img src={logo} alt="logo" className="w-[55px] h-[60px]" />
      </Link>

      <button onClick={toggleMenu} className="md:hidden focus:outline-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          )}
        </svg>
      </button>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:flex md:items-center md:w-auto mt-4 md:mt-0`}>
        <div className="flex flex-col md:flex-row md:gap-4 gap-2 items-center md:items-center">
          {user ? (
            <>
              <Link to="/" className="text-gray-700 hover:text-blue-600" onClick={toggleMenu}>
                Accueil
              </Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600" onClick={toggleMenu}>
                Dashboard
              </Link>
              <Link to="/groups" className="text-gray-700 hover:text-blue-600" onClick={toggleMenu}>
                Groupes
              </Link>
              <Link to="/profile" className="flex items-center" onClick={toggleMenu}>
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
            <Link to="/" className="text-gray-700 hover:text-blue-600" onClick={toggleMenu}>
                Acceuil
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600" onClick={toggleMenu}>
                Connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
