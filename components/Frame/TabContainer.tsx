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
import { ChatInput } from "./ChatInput";

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

  const handleCloseTab = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    if (newTabs.length === 0) {
      return; // Don't close the last tab
    }

    if (activeTab === tabId) {
      // If closing active tab, activate the next available tab
      const index = tabs.findIndex(tab => tab.id === tabId);
      const nextTab = tabs[index + 1] || tabs[index - 1];
      setActiveTab(nextTab.id);
    }

    setTabs(newTabs);
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
        <div className="flex bg-gray-900 text-white overflow-x-auto">
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
                onClose={() => handleCloseTab(tab.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-x-auto">
          <div className="flex h-full min-w-min">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className="w-[400px] flex-shrink-0 border-r border-gray-200 px-4 h-full flex flex-col"
              >
                <div
                  className="flex-1 overflow-y-auto"
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.content}
                </div>
                {activeTab === tab.id && (
                  <ChatInput
                    onSend={(message) => {
                      console.log(`Message from tab ${tab.id}:`, message);
                      // Handle the message here
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabContainer;
