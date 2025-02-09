import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import cise from 'cytoscape-cise';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import expandCollapse from 'cytoscape-expand-collapse';

// Import the CSS for expand-collapse cues
import 'cytoscape-expand-collapse/cytoscape-expand-collapse.css';

// Register the extensions
cytoscape.use(expandCollapse);
cytoscape.use(fcose);
cytoscape.use(cise);
cytoscape.use(dagre);
cytoscape.use(coseBilkent);

const getLayoutConfig = (layoutType) => {
  switch (layoutType) {
    // Removed fcose and replaced with cise
    case 'cise':
      return {
        name: 'cise',
        animate: false,
        fit: true,
        padding: 30,
        clusters: function (node) {
          // Use the parent node's ID as the cluster ID
          return node.data('parent') || node.data('id');
        },
        idealInterClusterEdgeLengthCoefficient: 1.4,
        allowNodesInsideCircle: false,
        maxRatioOfNodesInsideCircle: 0.1,
        springCoeff: 0.45,
        nodeSeparation: 75,
        parentCycleSizeCoeff: 0.5,
        allowShortestPath: false,
        refresh: 10,
      };
    case 'fcose':
      // Keep fcose as an option in case you want to try it again
      return {
        name: 'fcose',
        quality: 'default',
        randomize: true,
        animate: false,
        fit: true,
        padding: 30,
        nodeDimensionsIncludeLabels: true,
        packComponents: false,
        nodeSeparation: 150,
        componentSpacing: 200,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nodeRepulsion: 4500,
        gravity: 0.25,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
      };
    case 'cose-bilkent':
      // ... (unchanged)
    case 'dagre':
      // ... (unchanged)
    case 'cose':
      // ... (unchanged)
    default:
      // ... (unchanged)
  }
};

const Graph = ({ elements }) => {
  const cyContainerRef = useRef(null);
  const cyRef = useRef(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null);
  const [layoutType, setLayoutType] = useState('cise'); // Set default layout to 'cise'

  const processElements = useCallback((elements) => {
    const clusters = {};
    const nodes = [];
    const edges = [];

    const taskNodes = {};
    elements.forEach((element) => {
      if ((element.group === 'nodes' || !element.group) && element.data.typeoflabel === 'task') {
        taskNodes[element.data.id] = element;
      }
    });

    elements.forEach((element) => {
      if (element.group === 'nodes' || !element.group) {
        const nodeId = element.data.id;
        const nodeType = element.data.typeoflabel;

        // For task nodes, create a cluster node and set the task node's parent
        if (nodeType === 'task') {
          const clusterId = `cluster-${nodeId}`;
          clusters[clusterId] = {
            data: { id: clusterId, label: `Cluster ${element.data.label}` },
            group: 'nodes',
          };
          // Set the parent of the task node to the cluster node
          element.data.parent = clusterId;
        }

        // For key_value nodes, find the connected task and set parent accordingly
        if (nodeType === 'key_value') {
          // Find the task connected to this key_value node
          const connectedTaskEdge = elements.find(
            (el) =>
              el.group === 'edges' &&
              (el.data.source === nodeId || el.data.target === nodeId) &&
              (taskNodes[el.data.source] || taskNodes[el.data.target])
          );
          if (connectedTaskEdge) {
            const taskId = taskNodes[connectedTaskEdge.data.source]
              ? connectedTaskEdge.data.source
              : connectedTaskEdge.data.target;
            const clusterId = `cluster-${taskId}`;
            // Ensure the cluster exists
            clusters[clusterId] = clusters[clusterId] || {
              data: { id: clusterId, label: `Cluster ${taskNodes[taskId].data.label}` },
              group: 'nodes',
            };
            // Set the parent of the key_value node to the cluster node
            element.data.parent = clusterId;
          }
        }
        nodes.push(element);
      } else if (element.group === 'edges') {
        edges.push(element);
      }
    });

    const clusterNodes = Object.values(clusters);

    return [...clusterNodes, ...nodes, ...edges];
  }, []);

  const applyFilters = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      // ... (filtering logic as before)
    });

    // Re-run layout
    const layoutConfig = getLayoutConfig(layoutType);
    cy.layout(layoutConfig).run();
  }, [activeFilter, similarityThreshold, layoutType]);

  useEffect(() => {
    const processedElements = processElements(elements);

    if (!cyRef.current) {
      const cy = cytoscape({
        container: cyContainerRef.current,
        elements: processedElements,
        style: [
          // ... (same styles as before)
        ],
      });
      cyRef.current = cy;

      // Initialize expand-collapse extension with given options
      cy.expandCollapse({
        layoutBy: null, // We'll handle the layout manually
        fisheye: false,
        animate: true,
        animationDuration: 1000,
        ready: function () {
          console.log('Expand-Collapse extension ready');
        },
        undoable: false,
        cueEnabled: true,
        expandCollapseCuePosition: 'top-left',
        expandCollapseCueSize: 12,
        expandCollapseCueLineSize: 8,
        expandCollapseCueSensitivity: 1,
        zIndex: 999,
      });

      setupEventListeners();

      // Run initial layout
      const layoutConfig = getLayoutConfig(layoutType);
      cy.layout(layoutConfig).run();
    } else {
      const cy = cyRef.current;

      // Remove existing elements
      cy.elements().remove();

      // Add new elements
      cy.add(processedElements);

      // Run layout again
      const layoutConfig = getLayoutConfig(layoutType);
      cy.layout(layoutConfig).run();

      setupEventListeners();
    }

    applyFilters();
  }, [elements, processElements, applyFilters, layoutType]);

  useEffect(() => {
    applyFilters();
  }, [activeFilter, similarityThreshold, layoutType, applyFilters]);

  const handleThresholdChange = (e) => {
    setSimilarityThreshold(parseFloat(e.target.value));
  };

  const handleFilterClick = (filterName) => {
    setActiveFilter((prevFilter) =>
      prevFilter === filterName ? null : filterName
    );
  };

  const handleLayoutChange = (e) => {
    setLayoutType(e.target.value);
  };

  const setupEventListeners = () => {
    const cy = cyRef.current;
    if (!cy) return;

    // Remove previous event listeners to prevent duplication
    cy.off('mouseover');
    cy.off('mouseout');
    cy.off('dblclick');

    cy.on('mouseover', 'edge', function (e) {
      e.target.style('text-opacity', 1);
    });
    cy.on('mouseout', 'edge', function (e) {
      e.target.style('text-opacity', 0);
    });

    // Expand/Collapse using cues (handled by the extension automatically)

    // Double-click to expand/collapse nodes using the API methods
    cy.on('dblclick', 'node', function (e) {
      const node = e.target;
      const api = cy.expandCollapse('get');

      if (api.isCollapsible(node)) {
        api.collapse(node);
      } else if (api.isExpandable(node)) {
        api.expand(node);
      }
    });

    // Prevent default browser behavior on double-click
    cy.on('dblclick', function (event) {
      event.originalEvent.preventDefault();
    });
  };

  const isFilterDisabled = (filterName) => {
    return activeFilter && activeFilter !== filterName;
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>
          Similarity Threshold: {similarityThreshold}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={similarityThreshold}
            onChange={handleThresholdChange}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <button
          onClick={() => handleFilterClick('tasks')}
          disabled={isFilterDisabled('tasks')}
          style={{ marginRight: '10px' }}
        >
          {activeFilter === 'tasks' ? 'Show All Nodes' : 'Show Only Tasks'}
        </button>
        <button
          onClick={() => handleFilterClick('keyValues')}
          disabled={isFilterDisabled('keyValues')}
          style={{ marginRight: '10px' }}
        >
          {activeFilter === 'keyValues' ? 'Show All Nodes' : 'Show Only Key Values'}
        </button>
        <button
          onClick={() => handleFilterClick('hideNonSimilarKeyValues')}
          disabled={isFilterDisabled('hideNonSimilarKeyValues')}
          style={{ marginRight: '10px' }}
        >
          {activeFilter === 'hideNonSimilarKeyValues'
            ? 'Show All Nodes'
            : 'Hide Non-Similar Key Values'}
        </button>
        <label style={{ marginLeft: '10px' }}>
          Layout:
          <select
            value={layoutType}
            onChange={handleLayoutChange}
            style={{ marginLeft: '5px' }}
          >
            <option value="cise">CiSE</option>
            <option value="fcose">fCoSE</option>
            <option value="cose-bilkent">CoSE-Bilkent</option>
            <option value="dagre">Dagre</option>
            <option value="cose">CoSE</option>
            <option value="random">Random</option>
          </select>
        </label>
      </div>
      <div
        ref={cyContainerRef}
        style={{ width: '100%', height: '900px', border: '1px solid #ccc' }}
      />
    </div>
  );
};

export default Graph;