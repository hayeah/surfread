import React from "react";

interface RightDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const RightDrawer: React.FC<RightDrawerProps> = ({ isOpen, onToggle, children }) => {
  return (
    <div
      className={`fixed right-0 top-0 h-full transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } bg-gray-800 text-white w-64 shadow-lg z-10`}
    >
      <button 
        onClick={onToggle} 
        className="absolute -left-8 top-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-l"
      >
        {isOpen ? "→" : "←"}
      </button>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default RightDrawer;
