import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from '@vitest/browser/context';

// This is a basic test that checks DOM manipulation in the browser
test('basic browser interaction', async () => {
  // Create a simple component to test
  const TestComponent = () => {
    return (
      <div>
        <h1>Hello SurfRead</h1>
        <button onClick={() => {
          const element = document.createElement('p');
          element.textContent = 'Button was clicked!';
          element.setAttribute('data-testid', 'result');
          document.body.appendChild(element);
        }}>
          Click me
        </button>
      </div>
    );
  };

  // Render the component
  const screen = render(<TestComponent />);

  // Check that the heading is present
  await expect.element(screen.getByText('Hello SurfRead')).toBeInTheDocument();

  // Click the button
  await screen.getByText('Click me').click();

  // Check that the text appeared after clicking
  await expect.element(screen.getByTestId('result')).toHaveTextContent('Button was clicked!');
});
