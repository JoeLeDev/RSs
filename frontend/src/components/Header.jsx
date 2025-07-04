import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import logo from '../assets/header/ICC-.png';
import { Home, LayoutDashboard, Users, Calendar, MessageCircle, Bell, Settings } from 'lucide-react';
import API from '../api/Axios';
import { io } from 'socket.io-client';
import { toast as toastify } from 'react-toastify';

const Header = () => {
  const { user, logout, userData } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const socketRef = useRef();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await API.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => { fetchNotifications(); }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifOpen]);

  useEffect(() => {
    if (!userData?._id) return;
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5001', { withCredentials: true });
      socketRef.current.on('connect', () => {
        console.log('Socket.io connecté !');
      });
      socketRef.current.on('disconnect', () => {
        console.log('Socket.io déconnecté !');
      });
    }
    socketRef.current.emit('register', userData._id);

    socketRef.current.off('notification');
    const handler = (notif) => {
      console.log('Notif reçue instantanément', notif);
      fetchNotifications();
      toastify.info(notif.content, { autoClose: 5000 });
    };
    socketRef.current.on('notification', handler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('notification', handler);
      }
    };
  }, [userData]);

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        const token = await user.getIdToken();
        await API.patch(`/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchNotifications();
      } catch {}
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = await user.getIdToken();
      await API.patch('/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      toastify.error("Erreur lors du marquage des notifications.");
    }
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

              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 flex items-center gap-1" onClick={toggleMenu}>
                <LayoutDashboard className="w-4 h-4 text-blue-700" /> Dashboard
              </Link>
              <Link to="/groups" className="text-gray-700 hover:text-blue-600 flex items-center gap-1" onClick={toggleMenu}>
                <Users className="w-4 h-4 text-blue-700" /> Groupes
              </Link>
              <Link to="/members" className="text-gray-700 hover:text-blue-600 flex items-center gap-1" onClick={toggleMenu}>
                <Users className="w-4 h-4 text-blue-700" /> Membres
              </Link>
              <Link to="/events" className="text-gray-700 hover:text-blue-600 flex items-center gap-1" onClick={toggleMenu}>
                <Calendar className="w-4 h-4 text-blue-700" /> Événements
              </Link>
              <Link to="/messenger" className="text-gray-700 hover:text-blue-600 flex items-center gap-1" onClick={toggleMenu}>
                <MessageCircle className="w-4 h-4 text-blue-700" /> Messenger
              </Link>
              <Link to="/settings" className="text-gray-700 hover:text-blue-600 flex items-center gap-1" onClick={toggleMenu}>
                <Settings className="w-4 h-4 text-blue-700" /> Paramètres
              </Link>
              <button
                className="relative text-gray-700 hover:text-blue-600 flex items-center gap-1 focus:outline-none"
                title="Notifications"
                onClick={() => setNotifOpen((v) => !v)}
              >
                <Bell className="w-5 h-5 text-blue-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1 py-0.5 min-w-[14px] h-[16px] flex items-center justify-center border border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div ref={notifRef} className="absolute right-8 top-16 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg border z-50 animate-fade-in">
                  <div className="p-3 border-b font-semibold text-gray-700 flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:underline px-2 py-1 rounded"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 && (
                    <div className="p-4 text-gray-500 text-center">Aucune notification</div>
                  )}
                  {notifications.map((notif) => (
                    <button
                      key={notif._id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full text-left px-4 py-3 border-b last:border-b-0 flex flex-col hover:bg-blue-50 transition ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30 font-bold'}`}
                    >
                      <span className="text-sm">{notif.content}</span>
                      <span className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </button>
                  ))}
                </div>
              )}
              <Link to="/profile" className="flex items-center" onClick={toggleMenu}>
                {userData?.imageUrl ? (
                  <img
                    src={userData.imageUrl}
                    alt="Photo de profil"
                    className="w-8 h-8 rounded-full object-cover border border-gray-700"
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
            <Link to="/" className="text-gray-700 hover:text-blue-600 flex items-center gap-1" onClick={toggleMenu}>
                <Home className="w-4 h-4" /> Acceuil
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
