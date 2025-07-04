import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import API from '../api/Axios';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { auth } from '../Firebase';
import { Settings } from 'lucide-react';

const Parameters = () => {
  const { user, userData, logout } = useAuth();
  const [email, setEmail] = useState(userData?.email || '');
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'fr');
  const [notifEmail, setNotifEmail] = useState(userData?.notifEmail ?? true);
  const [notifPush, setNotifPush] = useState(userData?.notifPush ?? false);
  const [showDelete, setShowDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const navigate = useNavigate();

  // Changement de mot de passe (Firebase)
  const handlePasswordReset = async () => {
    if (!user?.email) return toast.error("Aucun email utilisateur trouvé.");
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Un email de réinitialisation a été envoyé.");
    } catch (err) {
      toast.error("Erreur lors de l'envoi de l'email : " + (err.message || err));
    }
  };

  // Changement de langue (localStorage)
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem('lang', e.target.value);
    toast.success('Langue changée !');
    // Ici, tu peux déclencher un reload ou une action i18n si tu utilises une lib de traduction
  };

  // Préférences notifications (API PATCH)
  const handleNotifChange = async (type, value) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await API.patch('/users', {
        notifEmail: type === 'email' ? value : notifEmail,
        notifPush: type === 'push' ? value : notifPush,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (type === 'email') setNotifEmail(value);
      if (type === 'push') setNotifPush(value);
      toast.success('Préférences enregistrées !');
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde des préférences.");
    }
  };

  // Suppression de compte (API DELETE + Firebase)
  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoadingDelete(true);
    try {
      const token = await user.getIdToken();
      await API.delete('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Supprime aussi côté Firebase
      await deleteUser(auth.currentUser);
      toast.success('Compte supprimé.');
      logout();
      navigate('/');
    } catch (err) {
      toast.error("Erreur lors de la suppression du compte : " + (err.message || err));
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow my-8">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      {/* Section Email */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Email</h2>
        <input
          type="email"
          value={email}
          className="border px-3 py-2 rounded w-full"
          disabled
        />
        <p className="text-sm text-gray-500 mt-1">Pour changer d'email, contactez le support.</p>
      </section>

      {/* Section Mot de passe */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Mot de passe</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={handlePasswordReset}
        >
          Changer mon mot de passe
        </button>
      </section>

      {/* Section Langue */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Langue</h2>
        <select value={language} onChange={handleLanguageChange} className="border px-3 py-2 rounded">
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </section>

      {/* Section Notifications */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Notifications</h2>
        <div className="flex items-center gap-4 mb-2">
          <input
            type="checkbox"
            checked={notifEmail}
            onChange={e => handleNotifChange('email', e.target.checked)}
            id="notifEmail"
          />
          <label htmlFor="notifEmail">Recevoir les notifications par email</label>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={notifPush}
            onChange={e => handleNotifChange('push', e.target.checked)}
            id="notifPush"
          />
          <label htmlFor="notifPush">Recevoir les notifications push</label>
        </div>
      </section>

      {/* Section Suppression de compte */}
      <section className="mb-8">

        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          onClick={() => setShowDelete(true)}
        >
          Supprimer mon compte
        </button>
        {showDelete && (
          <div className="mt-4 p-4 bg-red-100 rounded">
            <p className="mb-2 text-red-700">Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
            <button
              className="bg-red-700 text-white px-4 py-2 rounded mr-2"
              onClick={handleDeleteAccount}
              disabled={loadingDelete}
            >
              {loadingDelete ? 'Suppression...' : 'Oui, supprimer'}
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setShowDelete(false)}
              disabled={loadingDelete}
            >
              Annuler
            </button>
          </div>
        )}
      </section>

    </div>
  );
};

export default Parameters; 