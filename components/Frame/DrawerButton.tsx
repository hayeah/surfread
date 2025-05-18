import React from "react";

interface DrawerButtonProps {
  onClick: () => void;
  isOpen: boolean;
  position: "left" | "right";
  className?: string;
}

const DrawerButton: React.FC<DrawerButtonProps> = ({
  onClick,
  isOpen,
  position,
  className = "",
}) => {
  const isLeft = position === "left";

  return (
    <button
      onClick={onClick}
      className={`p-2 hover:bg-gray-100 rounded ${
        isLeft ? "rounded-r" : "rounded-l"
      } ${className}`}
    >
      <span style={{ display: "inline-block" }}>
        {isLeft ? (isOpen ? "←" : "→") : (isOpen ? "→" : "←")}
      </span>
    </button>
  );
};

export default DrawerButton;
