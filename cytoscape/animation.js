export const setupAnimations = (cy) => {
    // Store original styles for reset
    const originalNodeStyles = new Map();
    const originalEdgeStyles = new Map();
  
    // Click animation for nodes
    cy.on('tap', 'node', function (e) {
      const node = e.target;
      const connectedEdges = node.connectedEdges();
      const connectedNodes = node.connectedNodes();
  
      // Store original styles
      originalNodeStyles.set(node.id(), {
        width: node.style('width'),
        height: node.style('height'),
        'background-color': node.style('background-color')
      });
  
      // Animate clicked node
      node.animate({
        style: {
          width: node.data('typeoflabel') === 'task' ? '55px' : '45px',
          height: node.data('typeoflabel') === 'task' ? '55px' : '45px'
        },
        duration: 500,
        easing: 'ease-in-out'
      });
  
      // Animate connected nodes
      connectedNodes.forEach((connectedNode) => {
        originalNodeStyles.set(connectedNode.id(), {
          width: connectedNode.style('width'),
          height: connectedNode.style('height'),
          'background-color': connectedNode.style('background-color')
        });
  
        connectedNode.animate({
          style: {
            'background-color': '#ffcccc',
            width: parseFloat(connectedNode.style('width')) * 1.05 + 'px',
            height: parseFloat(connectedNode.style('height')) * 1.05 + 'px'
          },
          duration: 500,
          easing: 'ease-in-out'
        });
      });
  
      // Animate edges with subtle effect
      connectedEdges.forEach((edge) => {
        originalEdgeStyles.set(edge.id(), {
          'line-color': edge.style('line-color'),
          width: edge.style('width')
        });
  
        edge.animate({
          style: {
            'line-color': '#99ff99',
            width: parseFloat(edge.style('width')) + 0.5 + 'px',
            'line-opacity': 0.8
          },
          duration: 500,
          easing: 'ease-in-out'
        });
      });
  
      // Reset animations after delay
      setTimeout(() => {
        node.animate({
          style: originalNodeStyles.get(node.id()) || { width: '40px', height: '40px' },
          duration: 500,
          easing: 'ease-in-out'
        });
  
        connectedNodes.forEach((connectedNode) => {
          const originalStyle = originalNodeStyles.get(connectedNode.id());
          connectedNode.animate({
            style: originalStyle || { width: '40px', height: '40px' },
            duration: 500,
            easing: 'ease-in-out'
          });
        });
  
        connectedEdges.forEach((edge) => {
          const originalStyle = originalEdgeStyles.get(edge.id());
          edge.animate({
            style: originalStyle || { 'line-color': '#cccccc', width: '1px' },
            duration: 500,
            easing: 'ease-in-out'
          });
        });
      }, 1500);
    });
  
    // Simplify drag interactions
    cy.on('grab', 'node', (e) => {
      const node = e.target;
      node.addClass('node-dragging');
    });
  
    cy.on('free', 'node', (e) => {
      const node = e.target;
      node.removeClass('node-dragging');
    });
  
    // Define styles for the dragging class
    cy.style()
      .selector('.node-dragging')
      .style({
        'overlay-opacity': 0.1
      })
      .update();
  };
