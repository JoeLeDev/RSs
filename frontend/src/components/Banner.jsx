const Banner = ({ image, title, subtitle, height = "h-[400px]", onScrollClick }) => {
  return (
    <div
      className={`relative w-full bg-cover bg-center flex items-center justify-center ${height}`}
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <div className="relative z-10 text-center text-white px-4">
        <h2 className="text-4xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-lg text-gray-300 mb-4">{subtitle}</p>}

        {onScrollClick && (
          <button
            onClick={onScrollClick}
            className="mt-4 px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition"
          >
            ↓ Voir les groupes
          </button>
        )}
      </div>
    </div>
  );
};


export default Banner;
