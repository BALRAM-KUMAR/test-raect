import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import cise from 'cytoscape-cise';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import { setupAnimations } from './animations';

cytoscape.use(fcose);
cytoscape.use(cise);
cytoscape.use(dagre);
cytoscape.use(coseBilkent);

const getLayoutConfig = (layoutType) => {
    switch (layoutType) {
        case 'fcose':
            return {
                name: 'fcose',
                animate: false,
                fit: true,
                padding: 30,
                nodeDimensionsIncludeLabels: true,
                quality: 'proof',
                randomize: false,
            };
        case 'cose-bilkent':
            return {
                name: 'cose-bilkent',
                animate: true,
                fit: true,
                padding: 30,
                randomize: false,
                nodeRepulsion: 4500,
                idealEdgeLength: 50,
            };
        case 'cise':
            return {
                name: 'cise',
                animate: true,
                fit: true,
                padding: 30,
                clusters: node => node.data('cluster'), // Ensure your elements have 'cluster' data
                animateWithspringcool: true,
            };
        case 'dagre':
            return {
                name: 'dagre',
                animate: true,
                fit: true,
                padding: 30,
                nodeSep: 50,
                rankSep: 50,
            };
        case 'cose':
            return {
                name: 'cose',
                animate: true,
                fit: true,
                padding: 30,
            };
        default:
            return {
                name: layoutType,
                animate: true,
                fit: true,
                padding: 30,
                randomize: layoutType === 'random',
            };
    }
};

const Graph = ({ elements }) => {
    const cyContainerRef = useRef(null);
    const cyInstanceRef = useRef(null);
    const [similarityThreshold, setSimilarityThreshold] = useState(0);
    const [activeFilter, setActiveFilter] = useState(null);
    const [layoutType, setLayoutType] = useState('fcose');

    const applyFilters = useCallback(() => {
        const cy = cyInstanceRef.current;
        if (!cy) return;

        cy.batch(() => {
            // Filter edges first based on threshold and node visibility
            cy.edges().forEach(edge => {
                const sourceVisible = edge.source().visible();
                const targetVisible = edge.target().visible();
                let shouldShowEdge = sourceVisible && targetVisible;

                if (edge.data('similarity_score') !== undefined) {
                    shouldShowEdge = shouldShowEdge && edge.data('similarity_score') >= similarityThreshold;
                }

                edge.style('display', shouldShowEdge ? 'element' : 'none');
            });

            // Then filter nodes based on updated edges
            cy.nodes().forEach(node => {
                const type = node.data('typeoflabel');
                let shouldShow = true;

                if (activeFilter) {
                    if (activeFilter === 'tasks' && type !== 'task') {
                        shouldShow = false;
                    }
                    if (activeFilter === 'keyValues' && type !== 'key_value') {
                        shouldShow = false;
                    }
                    if (activeFilter === 'hideNonSimilarKeyValues') {
                        if (type === 'key_value') {
                            // Check if node has any VISIBLE similarity edges after threshold
                            const hasVisibleSimilarEdges = node.connectedEdges().some(edge =>
                                edge.data('similarity_score') !== undefined &&
                                edge.visible() // Check if edge is actually displayed
                            );
                            shouldShow = hasVisibleSimilarEdges;
                        }
                    }
                }

                node.style('display', shouldShow ? 'element' : 'none');
            });

            // Re-filter edges to account for node visibility changes
            cy.edges().forEach(edge => {
                const sourceVisible = edge.source().visible();
                const targetVisible = edge.target().visible();
                edge.style('display', sourceVisible && targetVisible ? 'element' : 'none');
            });
        });

        // Re-run layout
        const layoutConfig = getLayoutConfig(layoutType);
        cy.layout(layoutConfig).run();
    }, [activeFilter, similarityThreshold, layoutType]);

    useEffect(() => {
        if (!cyInstanceRef.current) {
            cyInstanceRef.current = cytoscape({
                container: cyContainerRef.current,
                elements,
                style: [
                    // Node styles
                    {
                        selector: 'node',
                        style: {
                            'shape': 'ellipse',
                            'background-color': ele =>
                                ele.data('typeoflabel') === 'task' ? '#ff7f0e' : '#1f77b4',
                            'label': 'data(label)',
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'color': '#000',
                            'text-outline-width': 1,
                            'text-outline-color': '#fff',
                            'font-size': 12,
                            'font-weight': 'bold',
                            'width': 'label',
                            'height': 'label',
                            'padding': 10,
                            'text-wrap': 'wrap',
                            'text-max-width': 80, // You can adjust this value
                        },

                    },
                    // Edge styles
                    {
                        selector: 'edge',
                        style: {
                            'width': ele => {
                                const score = ele.data('similarity_score') || 0;
                                const minWidth = 2;
                                const scale = 5; // Adjust scaling factor as needed
                                return minWidth + score * scale;
                            },
                            'line-color': ele =>
                                ele.data('similarity_score') ? '#2ca02c' : '#ccc',
                            'curve-style': 'bezier',
                            'target-arrow-shape': 'triangle',
                            'arrow-scale': 0.8,
                            'label': ele => {
                                return ele.data('similarity_score') !== undefined
                                    ? `Sim: ${ele.data('similarity_score')}`
                                    : '';
                            },
                            'font-size': 10,
                            'text-background-color': '#fff',
                            'text-background-opacity': 0.7,
                            'text-background-padding': 2,
                            'text-margin-y': -10,
                        },
                    },
                    // Hide edge labels by default for performance
                    {
                        selector: 'edge',
                        style: {
                            'text-opacity': 0,
                        },
                    },
                    // Show edge labels on hover
                    {
                        selector: 'edge:hover',
                        style: {
                            'text-opacity': 1,
                        },
                    },
                ],
            });
            setupEventListeners();
            setupAnimations(cyInstanceRef.current);
        } else {
            cyInstanceRef.current.json({ elements });
        }
        applyFilters();
    }, [elements]);

    useEffect(() => {
        applyFilters();
    }, [activeFilter, similarityThreshold, layoutType, applyFilters]);

    const handleThresholdChange = e => {
        setSimilarityThreshold(parseFloat(e.target.value));
    };

    const handleFilterClick = filterName => {
        setActiveFilter(prevFilter => (prevFilter === filterName ? null : filterName));
    };

    const handleLayoutChange = e => {
        setLayoutType(e.target.value);
    };

    const setupEventListeners = () => {
        const cy = cyInstanceRef.current;
        cy.on('mouseover', 'edge', function (e) {
            e.target.style('text-opacity', 1);
        });
        cy.on('mouseout', 'edge', function (e) {
            e.target.style('text-opacity', 0);
        });
    };

    const isFilterDisabled = filterName => {
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
                    {activeFilter === 'hideNonSimilarKeyValues' ? 'Show All Nodes' : 'Hide Non-Similar Key Values'}
                </button>
                <label style={{ marginLeft: '10px' }}>
                    Layout:
                    <select value={layoutType} onChange={handleLayoutChange} style={{ marginLeft: '5px' }}>
                        <option value="fcose">fCoSE</option>
                        <option value="cose-bilkent">CoSE-Bilkent</option>
                        <option value="cise">CiSE</option>
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
