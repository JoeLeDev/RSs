import { useState, useRef, useEffect } from "react";

const FilterDropdown = ({ label, options, selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // 👇 Ferme si on clique à l’extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = selected !== "";

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`px-4 py-2 rounded-full border transition flex items-center gap-2 ${
          isActive
            ? "bg-blue-700 border-blue-300 text-white hover:bg-blue-500"
            : "bg-white border-gray-300 text-gray-700 hover:bg-blue-100"
        }`}
      >
        {label}
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.65a.75.75 0 01-1.1 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-56 bg-white rounded-lg shadow border">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                selected === option ? "bg-blue-100 font-medium" : ""
              }`}
            >
              {option}
            </button>
          ))}
          <button
            onClick={() => {
              onSelect("");
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-black hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
