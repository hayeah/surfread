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
      id: "documentation",
      label: "Documentation",
      content: (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Documentation</h2>
          <p className="mb-4 text-gray-700">This is the documentation tab with some sample content.</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Install dependencies</li>
              <li>Configure your environment</li>
              <li>Run the development server</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Tips</h3>
            <p className="text-gray-700">Press Shift+Enter in the chat input for multiline messages.</p>
          </div>
        </div>
      ),
    },
    {
      id: "chat",
      label: "Chat",
      content: (
        <div className="p-4">
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold text-blue-800">User</p>
              <p className="text-gray-700">How can I use this feature?</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-gray-800">Assistant</p>
              <p className="text-gray-700">Let me explain the steps...</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold text-blue-800">User</p>
              <p className="text-gray-700">Thanks, that's helpful!</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      content: (
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-600">Enable dark theme for the interface</p>
              </div>
              <button className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50">
                Toggle
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-600">Manage notification preferences</p>
              </div>
              <button className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50">
                Configure
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "examples",
      label: "Examples",
      content: (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">TypeScript Example</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`interface User {
  id: string;
  name: string;
  email: string;
}

function greetUser(user: User) {
  console.log(\`Hello, \${user.name}!\`);
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">React Hook Example</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`const [count, setCount] = useState(0);

useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tasks",
      label: "Tasks",
      content: (
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Task List</h3>
          <div className="space-y-3">
            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-3" />
              <div>
                <p className="font-medium">Implement new feature</p>
                <p className="text-sm text-gray-600">Add drag and drop functionality</p>
              </div>
            </div>
            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-3" />
              <div>
                <p className="font-medium">Write documentation</p>
                <p className="text-sm text-gray-600">Document the new API endpoints</p>
              </div>
            </div>
            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-3" />
              <div>
                <p className="font-medium">Review pull requests</p>
                <p className="text-sm text-gray-600">Review and merge pending PRs</p>
              </div>
            </div>
          </div>
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
