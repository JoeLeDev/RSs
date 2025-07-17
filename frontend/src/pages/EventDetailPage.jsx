import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedEvent, setEditedEvent] = useState({
    title: '',
    description: '',
    image: null,
    start: '',
    end: '',
  });

  const API_URL = `${import.meta.env.VITE_API_URL}/events`;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!user || !user.getIdToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${id}`, config);
        setEvent({
          ...data,
          start: new Date(data.start),
          end: new Date(data.end),
        });
        setEditedEvent({
          title: data.title,
          description: data.description || '',
          image: data.image || null,
          start: data.start ? new Date(data.start).toISOString().slice(0, 16) : '',
          end: data.end ? new Date(data.end).toISOString().slice(0, 16) : '',
        });
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement de l'événement :", err);
        setError("Impossible de charger l'événement.");
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les détails de l'événement.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, user, toast]);

  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setEditedEvent(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setEditedEvent(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.getIdToken || !event) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const formData = new FormData();

      formData.append('title', editedEvent.title);
      formData.append('description', editedEvent.description);
      formData.append('start', editedEvent.start);
      formData.append('end', editedEvent.end);
      if (editedEvent.image instanceof File) {
        formData.append('image', editedEvent.image);
      } else if (editedEvent.image === null) {
        formData.append('image', '');
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/events/${event._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setEvent({
        ...response.data,
        start: new Date(response.data.start),
        end: new Date(response.data.end),
      });
      setEditedEvent({
        title: response.data.title,
        description: response.data.description || '',
        image: response.data.image || null,
        start: response.data.start ? new Date(response.data.start).toISOString().slice(0, 16) : '',
        end: response.data.end ? new Date(response.data.end).toISOString().slice(0, 16) : '',
      });
      setShowEditModal(false);
      toast({
        title: "Succès !",
        description: "Événement mis à jour avec succès.",
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'événement :", err);
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: err.response?.data?.message || "Impossible de mettre à jour l'événement.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    if (event) {
      setEditedEvent({
        title: event.title,
        description: event.description || '',
        image: event.image || null,
        start: event.start ? event.start.toISOString().slice(0, 16) : '',
        end: event.end ? event.end.toISOString().slice(0, 16) : '',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des détails de l'événement...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Erreur : {error}</div>;
  }

  if (!event) {
    return <div className="text-center py-4">Aucun événement trouvé.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-8">
      {event.image && (
        <div className="mb-6">
          <img 
            src={`${import.meta.env.VITE_API_URL}/${event.image}`} 
            alt={event.title} 
            className=" h-64 object-cover rounded-lg"
          />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{event.title}</h1>
      
      {event.description && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Détails</h2>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Début :</span> {event.start.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
        </p>
        <p className="text-gray-600 mb-4">
          <span className="font-semibold">Fin :</span> {event.end.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/events')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retour au calendrier
        </button>
        <button
          onClick={() => {
            if (event) {
              setEditedEvent({
                title: event.title,
                description: event.description || '',
                image: event.image || null,
                start: event.start ? event.start.toISOString().slice(0, 16) : '',
                end: event.end ? event.end.toISOString().slice(0, 16) : '',
              });
            }
            setShowEditModal(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Modifier l'événement
        </button>
      </div>

      {showEditModal && event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Modifier l'événement</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={editedEvent.title}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={editedEvent.description}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image actuelle</label>
                {editedEvent.image && typeof editedEvent.image === 'string' && (
                  <img src={editedEvent.image} alt="Current" className="mt-1 mb-2 w-24 h-24 object-cover rounded-md" />
                )}
                <input
                  type="file"
                  name="image"
                  onChange={handleEditInputChange}
                  accept="image/*"
                  className="mt-1 block w-full"
                />
                {editedEvent.image && (
                  <button
                    type="button"
                    onClick={() => setEditedEvent(prev => ({ ...prev, image: null }))}
                    className="text-red-500 text-sm mt-1"
                  >
                    Supprimer l'image actuelle
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de début</label>
                <input
                  type="datetime-local"
                  name="start"
                  value={editedEvent.start}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                <input
                  type="datetime-local"
                  name="end"
                  value={editedEvent.end}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage; 