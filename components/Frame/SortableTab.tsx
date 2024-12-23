import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTabProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const SortableTab: React.FC<SortableTabProps> = ({
  id,
  label,
  isActive,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        px-4 py-2 cursor-move select-none
        ${isActive ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}
        border-r border-gray-600
      `}
      onClick={onClick}
    >
      {label}
    </div>
  );
};
