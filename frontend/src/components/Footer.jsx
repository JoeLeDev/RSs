import React from 'react';
import InstagramLogo from '../assets/footer/Instagram.png';
import FacebookLogo from '../assets/footer/Facebook.png';
import TiktokLogo from '../assets/footer/Tiktok.jpg';
import YoutubeLogo from '../assets/footer/Youtube.png';

const Footer = () => {
  return (
    <footer className="bg-white py-8 px-4 text-center">
      <h3 className="text-xl font-semibold mb-4">Nos réseaux sociaux</h3>
      <div className="flex justify-center space-x-6 mb-6">
        {/* Social Media Icons */}
        <a href="https://www.instagram.com/icc.online/" aria-label="Instagram"><img src={InstagramLogo} alt="Instagram Logo" className="w-8 h-8 rounded-full" /></a>
        <a href="https://www.tiktok.com/@icc_online?_t=8rc1dpgzcvl&_r=1" aria-label="Tiktok"><img src={TiktokLogo} alt="Tiktok Logo" className="w-8 h-8 rounded-full black" /></a>
        <a href="https://www.youtube.com/@icconline2410" aria-label="Youtube"><img src={YoutubeLogo} alt="Youtube Logo" className="w-8 h-8 rounded-full black" /></a>
        <a href="https://www.facebook.com/profile.php?id=100090020607686&locale=fr_FR" aria-label="Facebook"><img src={FacebookLogo} alt="Facebook Logo" className="w-8 h-8 rounded-full" /></a>
      </div><p className="text-gray-600 mb-4">© 2025 - My ICC ONLINE</p>
      <div className="flex justify-center space-x-6 text-sm text-gray-600">
        <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
        <a href="/politique-confi
dentialite" className="hover:underline">Politique de confidentialité</a>
        <a href="/contact" className="hover:underline">Contact</a>
      </div>
    </footer>
  );
};

export default Footer;
