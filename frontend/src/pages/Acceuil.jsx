import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import BanniereVideo from '../assets/Bannière_vidéo.mp4';
import banniere from '../assets/banniere.png'
import BannierConnecte from '../assets/Carte.png';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';



const Acceuil = () => {
  return (
    <div className="font-sans antialiased">
      {/* Hero Section */}
      <section className="relative min-h-[400px] md:min-h-[630px] flex items-center justify-start overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-10 w-auto min-w-full min-h-full max-w-none"
        >
          {/* Placeholder Video Source */}
          <source src={BanniereVideo} type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute z-20 inset-0 bg-black opacity-50"></div>
        {/* Content */}
        <div className="relative z-30 text-white text-left py-20 pl-20 pr-4">
          <h1 className="text-2xl sm:text-4xl md:text-8xl font-bold mb-4">Bienvenue à<br />ICC ONLINE.</h1>
          <p className="text-base sm:text-lg md:text-xl">
            Découvrez notre vision, nos<br />programmes en rejoignant une<br />communauté dynamique et engagée.
          </p>
        </div>
      </section>

      {/* Connected Family Section */}
      <section className="flex flex-col md:flex-row items-center justify-center py-16 px-4 bg-gray-100">
        <div className="w-full flex flex-col md:w-1/2 text-left px-20 mb-8 md:mb-0 md:pr-8">
          <h2 className="text-3xl font-bold mb-4 text-left">Une famille connectée</h2>
          <p className="text-gray-700 mb-4">
            Impact Centre Chrétien en ligne, est la dimension digitale des églises<br />Impact Centre Chrétien.<br />Campus à part entière, ICC ONLINE regroupe toutes les personnes<br />désirant appartenir à la grande famille Impact Centre Chrétien<br />mais n'ayant pas de campus physique à proximité de chez elles.
          </p>
          <button className="px-6 py-3 border w-fit border-gray-700 rounded-full hover:bg-gray-200">
            En savoir plus
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          {/* Illustration Placeholder */}
          <div className="  rounded-full flex items-center justify-center text-gray-600">
            <img src={BannierConnecte} alt="Illustration" className=" object-contain" />
          </div>
        </div>
      </section>

      {/* Join Online Impact Family Section */}<section className="relative w-full min-h-[400px] md:min-h-[630px] flex items-center justify-start text-white px-4 overflow-hidden">
        <img src={banniere} alt="Bannière" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 w-full max-w-3xl flex flex-col justify-start md:text-left pl-20 pr-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Rejoignez une famille<br />d'impact online
          </h2>
          <p className="text-gray-200 text-xs sm:text-sm md:text-base leading-relaxed">
            Vous êtes loin d'un campus physique d'ICC, vous désirez partager votre foi, échanger sur le thème des cultes suivis en ligne, être soutenus dans la prière et encouragé dans la foi ?<br />
            Vous voulez mieux comprendre la bible et découvrir les projets de Dieu pour votre vie ? Alors Les FIO (Familles d'Impact Online) sont faits pour vous.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Acceuil