import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useState } from 'react'


const Acceuil = () => {
  return (
    <div>
      <p>Acceuil</p>
        <p>Bienvenue sur l'application de gestion de groupes !</p>
        <p>Connecte-toi pour accéder à toutes les fonctionnalités.</p>
        <p>Tu peux créer des groupes, ajouter des membres et gérer les tâches.</p>
    </div>
  )
}

export default Acceuil
