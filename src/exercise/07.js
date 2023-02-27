// Production performance monitoring
// http://localhost:3000/isolated/exercise/07.js

import React, { Profiler, useState } from 'react';
import reportProfile from 'report-profile';

const Counter = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  return <button onClick={increment}>{count}</button>;
};

const App = () => {
  return (
    <div>
      <Profiler id="counter" onRender={reportProfile}>
        <div>
          Profiled counter
          <Counter />
        </div>
      </Profiler>

      <div>
        Unprofiled counter
        <Counter />
      </div>
    </div>
  );
};

export default App;
