import React, { useState } from "react";
import LeftDrawer from "./LeftDrawer";
import RightDrawer from "./RightDrawer";
import TabContainer from "./TabContainer";

interface AppFrameProps {
  leftDrawerContent?: React.ReactNode;
  rightDrawerContent?: React.ReactNode;
  tabs?: Array<{
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
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);

  return (
    <div className="h-screen w-screen flex relative bg-gray-100">
      <LeftDrawer
        isOpen={leftDrawerOpen}
        onToggle={() => setLeftDrawerOpen(!leftDrawerOpen)}
      >
        {leftDrawerContent}
      </LeftDrawer>

      <main
        className={`flex-1 transition-all duration-300 ${
          leftDrawerOpen ? "ml-64" : "ml-0"
        } ${rightDrawerOpen ? "mr-64" : "mr-0"}`}
      >
        <TabContainer initialTabs={tabs} />
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
