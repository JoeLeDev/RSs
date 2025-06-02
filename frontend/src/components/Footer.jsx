import React from 'react';
import InstagramLogo from '../Assets/footer/Instagram.png';
import TwitterLogo from '../Assets/footer/Twitter.png';
import FacebookLogo from '../Assets/footer/Facebook.png';

const Footer = () => {
  return (
    <footer className="bg-white py-8 px-4 text-center">
      <h3 className="text-xl font-semibold mb-4">Nos réseaux sociaux</h3>
      <div className="flex justify-center space-x-6 mb-6">
        {/* Social Media Icons */}
        <a href="#" aria-label="Instagram"><img src={InstagramLogo} alt="Instagram Logo" className="w-8 h-8 rounded-full" /></a>
        <a href="#" aria-label="Twitter"><img src={TwitterLogo} alt="Twitter Logo" className="w-8 h-8 rounded-full black" /></a>
        <a href="#" aria-label="Facebook"><img src={FacebookLogo} alt="Facebook Logo" className="w-8 h-8 rounded-full" /></a>
      </div>
      <p className="text-gray-600 mb-4">© 2025 - My ICC ONLINE</p>
      <div className="flex justify-center space-x-6 text-sm text-gray-600">
        <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
        <a href="/politique-confidentialite" className="hover:underline">Politique de confidentialité</a>
        <a href="/contact" className="hover:underline">Contact</a>
      </div>
    </footer>
  );
};

export default Footer;
