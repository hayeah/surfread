import React, { useState, useRef, useEffect } from "react";
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
  tabs: Tab[];
}

const TabContainer: React.FC<TabContainerProps> = ({ tabs: propTabs }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    setTabs(propTabs);
    setActiveTab(propTabs[0]?.id || "");
  }, [propTabs]);

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

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const smoothScrollTo = (container: HTMLElement, targetX: number, duration: number) => {
    const startX = container.scrollLeft;
    const distanceX = targetX - startX;
    const startTime = performance.now();

    const scrollStep = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const ease = easeInOutCubic(progress);

      container.scrollLeft = startX + distanceX * ease;

      if (progress < 1) {
        requestAnimationFrame(scrollStep);
      }
    };

    requestAnimationFrame(scrollStep);
  };

  const handleTabClick = (tabId: string) => {
    if (!isDragging) {
      setActiveTab(tabId);

      const container = document.querySelector('.panel-container') as HTMLElement;
      const panel = document.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;

      if (container && panel) {
        const containerRect = container.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();

        // Check if panel is fully visible
        const panelLeftVisible = panelRect.left >= containerRect.left;
        const panelRightVisible = panelRect.right <= containerRect.right;
        const isFullyVisible = panelLeftVisible && panelRightVisible;

        if (!isFullyVisible) {
          let targetScroll = container.scrollLeft;

          // If right edge is hidden, scroll minimally to show it
          if (!panelRightVisible) {
            const overflowRight = panelRect.right - containerRect.right;
            targetScroll += overflowRight;
          }

          // If left edge is hidden, scroll to show it
          if (!panelLeftVisible) {
            const overflowLeft = containerRect.left - panelRect.left;
            targetScroll -= overflowLeft;
          }

          smoothScrollTo(container, targetScroll, 150);
        }
      }
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
              label={tabs.find(tab => tab.id === draggedItem)!.label}
              isActive={false}
              onClick={() => handleTabClick(draggedItem)}
              onClose={() => handleCloseTab(draggedItem)}
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
        <div className="absolute inset-0 overflow-x-auto panel-container">
          <div className="flex h-full min-w-min">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                data-tab-id={tab.id}
                className={`w-[400px] flex-shrink-0 px-4 h-full flex flex-col ${activeTab === tab.id
                  ? 'border-2 border-blue-500/20'
                  : 'border-r border-gray-200'
                  }`}
              >
                <div
                  className="flex-1 overflow-y-auto"
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabContainer;
