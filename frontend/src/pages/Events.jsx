import React from 'react';
import CalendarComponent from '../components/CalendarComponent'; // Nous allons créer ce composant

const Events = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Calendrier des Événements</h1>
      <CalendarComponent />
    </div>
  );
};

export default Events; 