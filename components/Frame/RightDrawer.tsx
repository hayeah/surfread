import React from "react";
import DrawerButton from "./DrawerButton";
import { useEpubStore } from "@/store/epubStore";

interface RightDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const RightDrawer: React.FC<RightDrawerProps> = ({ isOpen, onToggle, children }) => {
  return (
    <>
      <div
        className={`fixed right-0 top-0 h-full transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          } bg-white text-black w-64 shadow-lg z-40`}
      >
        <DrawerButton
          onClick={onToggle}
          isOpen={isOpen}
          position="right"
          className="absolute right-4 top-4"
        />
        <div className="h-full overflow-y-auto p-4">{children}</div>
      </div>

      {/* Handle for opening the drawer */}
      <DrawerButton
        onClick={onToggle}
        isOpen={isOpen}
        position="right"
        className={`fixed right-0 top-1/2 -translate-y-1/2 bg-white shadow transition-opacity duration-300 z-50 ${isOpen ? "opacity-0" : "opacity-100"
          }`}
      />
    </>
  );
};

export default RightDrawer;
