import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../api/Axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', country: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !userData) return;

      try {
        setLoading(true);
        const res = await API.get(`/users/${userData._id}`);
        setProfileData(res.data);
        setFormData({
          username: res.data.username || '',
          email: res.data.email || '',
          country: res.data.country || ''
        });
        if (res.data.imageUrl) {
          setImagePreviewUrl(res.data.imageUrl);
        }
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil :", err);
        setError("Impossible de charger les informations du profil.");
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
       fetchProfile();
    }
  }, [user, userData, authLoading]);

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

  if (authLoading || loading) {
    return <div className="text-center mt-6">Chargement du profil...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center mt-6">{error}</div>;
  }

  if (!profileData) {
      return <div className="text-gray-600 text-center mt-6">Aucune donnée de profil disponible.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <img src={imagePreviewUrl || profileData.imageUrl || 'placeholder.png'} alt="Avatar" className="w-20 h-20 rounded-full mr-4 object-cover" />
          <div>
            <h2 className="text-xl font-semibold">{profileData.username}</h2>
            <p className="text-gray-600">{profileData.email}</p>
            {profileData.role && <p className="text-gray-600">Rôle: {profileData.role}</p>}
            {profileData.country && <p className="text-gray-600">Pays: {profileData.country}</p>}
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Modifier mon profil</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
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
      </div>
    </div>
  );
};

export default Profile; 