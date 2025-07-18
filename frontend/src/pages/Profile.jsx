import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../api/Axios';
import { toast } from 'react-toastify';
import { useLocation, useParams } from 'react-router-dom';
import FriendButton from '../components/FriendButton';
import isOwnProfile from '../utils/isOwnProfile';
import useUserProfile from '../hooks/useUserProfile';
import Loader from '../components/Loader';

const Profile = () => {
  const { id } = useParams();
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const { profileData, setProfileData, loading, error } = useUserProfile(id, userData);
  const [formData, setFormData] = useState({ username: '', email: '', country: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const acceptFriendRequestParam = params.get('acceptFriendRequest');
  const [acceptLoading, setAcceptLoading] = useState(false);
  const ownProfile = isOwnProfile(id, userData);

  useEffect(() => {
    if (refreshUserData) refreshUserData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (profileData && ownProfile) {
      setFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        country: profileData.country || ''
      });
      setImagePreviewUrl(profileData.imageUrl || null);
    }
  }, [profileData, ownProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedImage(null);
      setImagePreviewUrl(profileData?.imageUrl || null);
      e.target.value = null;
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      return toast.error("Le nom d'utilisateur ne peut pas être vide.");
    }
    if (!user || !userData) {
      return toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
    }

    try {
      setIsUpdating(true);
      const token = await user.getIdToken();
      const updatePayload = { ...formData };

      if (selectedImage) {
          const formDataImage = new FormData();
          formDataImage.append("file", selectedImage);
          const uploadRes = await API.post("/upload", formDataImage);
          updatePayload.imageUrl = uploadRes.data.url;
      }

      const res = await API.patch(`/users`, updatePayload, {
         headers: {
            Authorization: `Bearer ${token}`
         }
      });

      setProfileData(res.data.user);
      setSelectedImage(null);
      if (res.data.user.imageUrl) {
          setImagePreviewUrl(res.data.user.imageUrl);
      }
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil :", err);
      const errorMessage = err.response?.data?.message || "Échec de la mise à jour du profil.";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcceptFromNotif = async () => {
    setAcceptLoading(true);
    try {
      await API.post('/users/friends/accept', { userId: profileData._id });
      toast.success('Demande d\'ami acceptée !');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'acceptation");
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleActionDone = async () => {
    await fetchMembers();
    if (refreshUserData) await refreshUserData();
    window.location.reload();
  };

  if (authLoading || loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-600 text-center mt-6">{error}</div>;
  }

  if (!profileData) {
      return <div className="text-gray-600 text-center mt-6">Aucune donnée de profil disponible.</div>;
  }

  return (
    <div className="container mx-auto p-4">


      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <img src={imagePreviewUrl || profileData.imageUrl || 'placeholder.png'} alt="Avatar" className="w-20 h-20 rounded-full mr-4 object-cover" />
          <div>
            <h2 className="text-xl font-semibold">{profileData.username}</h2>
            <p className="text-gray-600">{profileData.email}</p>
            {profileData.role && <p className="text-gray-600">Rôle: {profileData.role}</p>}
            {profileData.country && <p className="text-gray-600">Pays: {profileData.country}</p>}
            {userData && profileData._id !== userData._id && !ownProfile && (
              <div className="mt-2">
                <FriendButton
                  profileUserId={profileData._id}
                  onActionDone={() => refreshUserData && refreshUserData()}
                />
              </div>
            )}
          </div>
        </div>

        {ownProfile && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="text-lg font-semibold mt-6 mb-3">Modifier mon profil</h3>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-sm text-gray-600">Pour changer d'email, contactez l'administrateur.</p>
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">Pays</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                "
              />
              {imagePreviewUrl && !selectedImage && (
                  <p className="text-sm text-gray-500 mt-1">Image actuelle :</p>
              )}
              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Aperçu photo de profil"
                  className="mt-2 w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                />
              )}
            </div>
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile; 