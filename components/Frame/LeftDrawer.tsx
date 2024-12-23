import React from "react";
import DrawerButton from "./DrawerButton";

interface LeftDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const LeftDrawer: React.FC<LeftDrawerProps> = ({ isOpen, onToggle, children }) => {
  return (
    <>
      <div
        className={`fixed left-0 top-0 h-full transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } bg-white text-black w-[600px] shadow-lg z-40`}
      >
        <DrawerButton
          onClick={onToggle}
          isOpen={isOpen}
          position="left"
          className="absolute right-4 top-4"
        />
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Reading Area</h1>
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          {children}
        </div>
      </div>

      {/* Handle for opening the drawer */}
      <DrawerButton
        onClick={onToggle}
        isOpen={isOpen}
        position="left"
        className={`fixed left-0 top-1/2 -translate-y-1/2 bg-white shadow transition-opacity duration-300 z-50 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
    </>
  );
};

export default LeftDrawer;
