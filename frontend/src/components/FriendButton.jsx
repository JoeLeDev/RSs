import React, { useState, useEffect } from 'react';
import API from '../api/Axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

// Statuts possibles : 'ami', 'envoyee', 'reçue', 'aucun'
const getRelationStatus = (currentUserId, profileUserId, friends, sent, received) => {
  if (!currentUserId || !profileUserId) return 'aucun';
  if (currentUserId === profileUserId) return 'self';
  if (friends?.some(f => (f._id || f) === profileUserId)) return 'ami';
  if (sent?.some(f => (f._id || f) === profileUserId)) return 'envoyee';
  if (received?.some(f => (f._id || f) === profileUserId)) return 'reçue';
  return 'aucun';
};

const FriendButton = ({
  profileUserId,
  onActionDone = () => {},
}) => {
  const { userData, refreshUserData } = useAuth();
  const currentUserId = userData?._id;
  const [loading, setLoading] = useState(false);
  // État local pour le statut du bouton (optimistic update)
  const [status, setStatus] = useState(
    getRelationStatus(currentUserId, profileUserId, userData?.friends, userData?.friendRequestsSent, userData?.friendRequestsReceived)
  );

  // Resynchronise l'état local avec le contexte utilisateur à chaque changement
  useEffect(() => {
    setStatus(getRelationStatus(currentUserId, profileUserId, userData?.friends, userData?.friendRequestsSent, userData?.friendRequestsReceived));
  }, [currentUserId, profileUserId, userData]);

  if (!currentUserId || !profileUserId || currentUserId === profileUserId) return null;

  const handleAdd = async () => {
    setLoading(true);
    try {
      await API.post('/users/friends/request', { userId: profileUserId });
      toast.success('Demande envoyée !');
      setStatus('envoyee'); // optimistic update
      if (refreshUserData) await refreshUserData();
      onActionDone();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await API.post('/users/friends/accept', { userId: profileUserId });
      toast.success('Ami ajouté !');
      setStatus('ami'); // optimistic update
      if (refreshUserData) await refreshUserData();
      onActionDone();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg && msg.includes('Pas de demande reçue')) {
        toast.info('La demande avait déjà été acceptée ou supprimée.');
        setStatus('aucun');
        if (refreshUserData) await refreshUserData();
        onActionDone();
      } else {
        toast.error(msg || "Erreur d'acceptation");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await API.post('/users/friends/reject', { userId: profileUserId });
      toast.success('Demande refusée');
      setStatus('aucun'); // optimistic update
      if (refreshUserData) await refreshUserData();
      onActionDone();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de refus");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await API.post('/users/friends/cancel', { userId: profileUserId });
      toast.success('Demande annulée');
      setStatus('aucun'); // optimistic update
      if (refreshUserData) await refreshUserData();
      onActionDone();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'annulation");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await API.post('/users/friends/remove', { userId: profileUserId });
      toast.success('Ami retiré');
      setStatus('aucun'); // optimistic update
      if (refreshUserData) await refreshUserData();
      onActionDone();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de suppression");
    } finally {
      setLoading(false);
    }
  };

  // Affichage selon le statut local
  if (status === 'ami') {
    return (
      <button onClick={handleRemove} disabled={loading} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
        Retirer des amis
      </button>
    );
  }
  if (status === 'envoyee') {
    return (
      <button onClick={handleCancel} disabled={loading} className="px-3 py-1 bg-gray-400 text-white rounded text-sm">
        Demande envoyée
      </button>
    );
  }
  if (status === 'reçue') {
    return (
      <div className="flex gap-2">
        <button onClick={handleAccept} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Accepter</button>
        <button onClick={handleReject} disabled={loading} className="px-3 py-1 bg-gray-400 text-white rounded text-sm">Refuser</button>
      </div>
    );
  }
  return (
    <button onClick={handleAdd} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
      Ajouter en ami
    </button>
  );
};

export default FriendButton;
