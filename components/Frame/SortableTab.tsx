import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTabProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
}

export const SortableTab: React.FC<SortableTabProps> = ({
  id,
  label,
  isActive,
  onClick,
  onClose,
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
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <button
          className="hover:bg-gray-600 rounded p-1"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
