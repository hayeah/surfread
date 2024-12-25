import React, { useState, useEffect } from "react";
import LeftDrawer from "./LeftDrawer";
import RightDrawer from "./RightDrawer";
import TabContainer from "./TabContainer";

interface AppFrameProps {
  leftDrawerContent?: React.ReactNode;
  rightDrawerContent?: React.ReactNode;
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
}

const AppFrame: React.FC<AppFrameProps> = ({
  leftDrawerContent,
  rightDrawerContent,
  tabs,
}) => {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setLeftDrawerOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex relative bg-gray-100 z-0">
      <LeftDrawer
        isOpen={leftDrawerOpen}
        onToggle={() => setLeftDrawerOpen(!leftDrawerOpen)}
      >
        {leftDrawerContent}
      </LeftDrawer>

      <main className={`flex-1 transition-all duration-300 ${leftDrawerOpen ? "ml-[600px]" : "ml-0"
        }`}>
        <TabContainer tabs={tabs} />
      </main>

      <RightDrawer
        isOpen={rightDrawerOpen}
        onToggle={() => setRightDrawerOpen(!rightDrawerOpen)}
      >
        {rightDrawerContent}
      </RightDrawer>
    </div>
  );
};

export default AppFrame;
