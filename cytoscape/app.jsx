// src/App.js

import React from 'react';
import Graph from './Graph';
import { elements } from './data';

function App() {
  return (
    <div className="App">
      <Graph elements={elements} />
    </div>
  );
}

export default App;
