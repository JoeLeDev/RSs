import { useEffect, useState } from 'react';
import API from '../api/Axios';
import isOwnProfile from '../utils/isOwnProfile';

export default function useUserProfile(id, userData) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userData) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let res;
        if (isOwnProfile(id, userData)) {
          res = await API.get('/users/me');
        } else {
          res = await API.get(`/users/${id}`);
        }
        setProfileData(res.data);
        setError(null);
      } catch (err) {
        setError('Impossible de charger les informations du profil.');
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, userData]);

  return { profileData, setProfileData, loading, error };
} 