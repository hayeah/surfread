import React from "react";
import AppFrame from "../components/Frame/AppFrame";

const FrameTest: React.FC = () => {
  const leftDrawerContent = (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Left Drawer</h2>
      <ul className="space-y-2">
        <li>Menu Item 1</li>
        <li>Menu Item 2</li>
        <li>Menu Item 3</li>
      </ul>
    </div>
  );

  const rightDrawerContent = (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Right Drawer</h2>
      <div className="space-y-2">
        <p>Settings Panel</p>
        <p>Configuration Options</p>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "tab1",
      label: "Welcome",
      content: (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to App Frame</h1>
          <p className="text-gray-600">
            This is a test page demonstrating the app frame functionality:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-600">
            <li>Hideable left and right drawers</li>
            <li>Draggable tabs (try dragging them!)</li>
            <li>Responsive layout</li>
          </ul>
        </div>
      ),
    },
    {
      id: "tab2",
      label: "Features",
      content: (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Features</h2>
          <div className="space-y-4">
            <p>• Built with Next.js and TailwindCSS</p>
            <p>• Drag and drop powered by dnd-kit</p>
            <p>• Smooth transitions and animations</p>
          </div>
        </div>
      ),
    },
    {
      id: "tab3",
      label: "About",
      content: (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p>A flexible and reusable app frame component for building complex applications.</p>
        </div>
      ),
    },
  ];

  return (
    <AppFrame
      leftDrawerContent={leftDrawerContent}
      rightDrawerContent={rightDrawerContent}
      tabs={tabs}
    />
  );
};

export default FrameTest;
