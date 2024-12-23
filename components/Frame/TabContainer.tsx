import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTab } from "./SortableTab";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabContainerProps {
  initialTabs?: Tab[];
}

const TabContainer: React.FC<TabContainerProps> = ({ initialTabs }) => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs || [
    { id: "1", label: "Tab 1", content: <div>Content 1</div> },
    { id: "2", label: "Tab 2", content: <div>Content 2</div> },
  ]);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || "1");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before activating drag
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setDraggedItem(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setDraggedItem(null);
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setTabs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleTabClick = (tabId: string) => {
    if (!isDragging) {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <DragOverlay dropAnimation={null}>
          {draggedItem && (
            <SortableTab
              id={draggedItem}
              label={tabs.find(tab => tab.id === draggedItem)?.label}
              isActive={false}
            />
          )}
        </DragOverlay>
        <div className="flex bg-gray-900 text-white">
          <SortableContext
            items={tabs.map(tab => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                id={tab.id}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => handleTabClick(tab.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      
      <div className="flex-1 p-4 bg-white">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default TabContainer;
