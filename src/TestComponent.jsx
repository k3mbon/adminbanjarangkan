import React, { useState } from 'react';

function TestComponent() {
  const [test, setTest] = useState('Hello World');
  
  return (
    <div>
      <h1>{test}</h1>
      <button onClick={() => setTest('Button clicked!')}>
        Click me
      </button>
    </div>
  );
}

export default TestComponent;