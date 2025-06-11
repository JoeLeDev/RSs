import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    image: null
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState({ title: '', description: '', image: '', start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const API_URL = `${API_BASE_URL}/api/events`;

  const fetchEvents = async () => {
    console.log("fetchEvents: Début du chargement des événements.");
    if (!user || !user.getIdToken) {
      console.log("fetchEvents: Utilisateur non connecté ou getIdToken manquant.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await user.getIdToken();
      console.log("Token obtenu:", token);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      };
      console.log("Configuration de la requête:", config);
      console.log("URL de l'API:", API_URL);
      const { data } = await axios.get(API_URL, config);
      console.log("Données reçues:", data);
      const formattedEvents = data.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        image: event.image,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
      setError(null);
      console.log("fetchEvents: Événements chargés avec succès.");
    } catch (err) {
      console.error("fetchEvents: Erreur détaillée lors du chargement des événements :", err);
      console.error("fetchEvents: Configuration de la requête qui a échoué:", err.config);
      setError("Impossible de charger les événements.");
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger les événements.",
      });
    } finally {
      setLoading(false);
      console.log("fetchEvents: Fin du chargement des événements.");
    }
  };

  useEffect(() => {
    console.log("useEffect: Déclenchement de fetchEvents.");
    fetchEvents();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setNewEvent(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setNewEvent(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('start', newEvent.start);
      formData.append('end', newEvent.end);
      if (newEvent.image) {
        formData.append('image', newEvent.image);
      }

      const response = await axios.post(`${API_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setEvents([...events, {
        ...response.data,
        id: response.data._id,
        start: new Date(response.data.start),
        end: new Date(response.data.end)
      }]);
      setNewEvent({
        title: '',
        description: '',
        start: '',
        end: '',
        image: null
      });
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la création de l'événement"
      });
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEditedEvent({
      title: event.title,
      description: event.description || '',
      image: event.image || '',
      start: event.start.toISOString().slice(0, 16),
      end: event.end.toISOString().slice(0, 16),
    });
  };

  const handleUpdateEvent = async (eventId, updatedData) => {
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      Object.keys(updatedData).forEach(key => {
        if (key === 'image' && updatedData[key] instanceof File) {
          formData.append('image', updatedData[key]);
        } else {
          formData.append(key, updatedData[key]);
        }
      });

      const response = await axios.put(`${API_URL}/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setEvents(events.map(event => 
        event.id === eventId ? { ...response.data, id: response.data._id } : event
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'événement"
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (selectedEvent) {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        console.log("Tentative de suppression de l'événement avec ID :", eventId);
        await axios.delete(`${API_URL}/${eventId}`, config);
        setEvents(events.filter(event => event.id !== eventId));
        setSelectedEvent(null);
        setEditedEvent({ title: '', description: '', image: '', start: '', end: '' });
        setError(null);
        toast({
          title: "Succès !",
          description: "Événement supprimé avec succès.",
        });
      } catch (err) {
        console.error("Erreur lors de la suppression de l'événement :", err);
        setError("Impossible de supprimer l'événement.");
        toast({
          variant: "destructive",
          title: "Erreur de suppression",
          description: err.response?.data?.message || "Impossible de supprimer l'événement.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setSelectedEvent(null);
    setEditedEvent({ title: '', description: '', image: '', start: '', end: '' });
  };

  const handleToggleSelectEvent = (eventId) => {
    setSelectedEventIds(prevSelected =>
      prevSelected.includes(eventId)
        ? prevSelected.filter(id => id !== eventId)
        : [...prevSelected, eventId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedEventIds.length === 0) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedEventIds.length} événements sélectionnés ?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { ids: selectedEventIds }
      };
      console.log("Tentative de suppression en masse des événements avec IDs :", selectedEventIds);
      await axios.delete(`${API_URL}/bulk`, config);
      setEvents(events.filter(event => !selectedEventIds.includes(event.id)));
      setSelectedEventIds([]);
      setSelectedEvent(null);
      setEditedEvent({ title: '', description: '', image: '', start: '', end: '' });
      setError(null);
      toast({
        title: "Succès !",
        description: "Événements supprimés avec succès.",
      });
    } catch (err) {
      console.error("Erreur lors de la suppression en masse des événements :", err);
      setError("Impossible de supprimer les événements sélectionnés.");
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: err.response?.data?.message || "Impossible de supprimer les événements sélectionnés.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des événements...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Erreur : {error}</div>;
  }

  return (
    <div style={{ minHeight: '700px' }}>
      {/* Bouton pour afficher le formulaire */}
      <button
        onClick={() => setShowForm(true)}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Créer un événement
      </button>

      {/* Bouton de suppression en masse */}
      {selectedEventIds.length > 0 && (
        <button
          onClick={handleBulkDelete}
          className="ml-4 mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          disabled={loading}
        >
          Supprimer ({selectedEventIds.length}) événements sélectionnés
        </button>
      )}

      {/* Formulaire d'ajout d'événement */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter un événement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de début</label>
                <input
                  type="datetime-local"
                  name="start"
                  value={newEvent.start}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                <input
                  type="datetime-local"
                  name="end"
                  value={newEvent.end}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="mb-4 p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Modifier ou Supprimer l'événement</h2>
          <input
            type="text"
            placeholder="Titre de l'événement"
            className="border p-2 rounded w-full mb-2"
            value={editedEvent.title}
            onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
          />
          <textarea
            placeholder="Description de l'événement"
            className="border p-2 rounded w-full mb-2"
            value={editedEvent.description}
            onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="URL de l'image"
            className="border p-2 rounded w-full mb-2"
            value={editedEvent.image}
            onChange={(e) => setEditedEvent({ ...editedEvent, image: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border p-2 rounded w-full mb-2"
            value={editedEvent.start}
            onChange={(e) => setEditedEvent({ ...editedEvent, start: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border p-2 rounded w-full mb-4"
            value={editedEvent.end}
            onChange={(e) => setEditedEvent({ ...editedEvent, end: e.target.value })}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => handleUpdateEvent(selectedEvent.id, editedEvent)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </button>
            <button
              onClick={() => handleDeleteEvent(selectedEvent.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              disabled={loading}
            >
              {loading ? "Suppression..." : "Supprimer"}
            </button>
            <button
              onClick={() => {
                if (selectedEvent && selectedEvent.id) {
                  navigate(`/events/${selectedEvent.id}`);
                } else {
                  toast({
                    variant: "destructive",
                    title: "Erreur de navigation",
                    description: "Impossible d'afficher les détails de l'événement car l'identifiant est manquant.",
                  });
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Voir les détails
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={{
            next: 'Suivant',
            previous: 'Précédent',
            today: 'Aujourd\'hui',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
            noEventsInRange: 'Pas d\'événements dans cette période.',
            showMore: total => `+ ${total} de plus`
          }}
          culture='fr'
          onSelectEvent={handleSelectEvent}
          components={{
            event: ({ event }) => (
              <div className="p-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedEventIds.includes(event.id)}
                  onChange={() => handleToggleSelectEvent(event.id)}
                  className="mr-2"
                />
                <div className="flex-grow">
                  <div className="font-semibold">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-gray-600">{event.description}</div>
                  )}
                </div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default CalendarComponent; 