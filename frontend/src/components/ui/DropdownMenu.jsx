import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-1 text-gray-600 hover:text-black"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border z-10">
          {children}
        </div>
      )}
    </div>
  );
};

DropdownMenu.Item = ({ children, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm text-left"
  >
    {icon}
    {children}
  </button>
);

export default DropdownMenu;