import React from "react";

interface LeftDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const LeftDrawer: React.FC<LeftDrawerProps> = ({ isOpen, onToggle, children }) => {
  return (
    <div
      className={`fixed left-0 top-0 h-full transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } bg-gray-800 text-white w-64 shadow-lg z-10`}
    >
      <button 
        onClick={onToggle} 
        className="absolute -right-8 top-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-r"
      >
        {isOpen ? "←" : "→"}
      </button>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default LeftDrawer;
