// src/data.js

// Parameters
const NUM_TASKS = 25; // Total number of tasks
const KEY_VALUES_PER_TASK = 10; // Number of key_value nodes per task
const SIMILARITY_CONNECTIONS = 70; // Number of similarity edges

// Arrays to hold nodes and edges
let nodes = [];
let edges = [];

// Generate task and key_value nodes
for (let i = 1; i <= NUM_TASKS; i++) {
  let taskId = `task_${i}`;
  nodes.push({ data: { id: taskId, label: `Task efwqefqbwfyqerfbqvweqtfqut${i}`, typeoflabel: 'task' } });

  for (let j = 1; j <= KEY_VALUES_PER_TASK; j++) {
    let keyValueId = `kv_${i}_${j}`;
    nodes.push({ data: { id: keyValueId, label: `KVefrgwtfgytgtrgrtgerfwrgergrewgrtg ${i}-${j}`, typeoflabel: 'key_value' } });

    // Edge from task to its key_value
    edges.push({ data: { id: `e_${taskId}_${keyValueId}`, source: taskId, target: keyValueId } });
  }
}

// Generate similarity edges between key_value nodes
for (let k = 0; k < SIMILARITY_CONNECTIONS; k++) {
  let taskA = Math.floor(Math.random() * NUM_TASKS) + 1;
  let keyA = Math.floor(Math.random() * KEY_VALUES_PER_TASK) + 1;
  let taskB = Math.floor(Math.random() * NUM_TASKS) + 1;
  let keyB = Math.floor(Math.random() * KEY_VALUES_PER_TASK) + 1;

  // Avoid self-loops
  if (taskA === taskB && keyA === keyB) continue;

  let nodeA = `kv_${taskA}_${keyA}`;
  let nodeB = `kv_${taskB}_${keyB}`;

  // Edge with a similarity score
  edges.push({
    data: {
      id: `s_${nodeA}_${nodeB}`,
      source: nodeA,
      target: nodeB,
      similarity_score: parseFloat(Math.random().toFixed(2)), // Score between 0.00 and 1.00
    },
  });
}

// Export the elements array
export const elements = [...nodes, ...edges];
