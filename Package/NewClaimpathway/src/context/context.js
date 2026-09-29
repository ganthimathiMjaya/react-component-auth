import React, { createContext, useState, useContext, useEffect } from "react";

// Create a new context
const FlowContext = createContext();

const FlowProvider = ({ children ,claimId, testing}) => {
  const [flowData, setFlowData] = useState({
    nodes: [],
    edges: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch("http://10.20.76.74:5124/fetchdetails", {
          const response = await fetch("https://devclaimpathway.accesshealthcare.co/fetchdetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: claimId }), // Send the required ID
        });
  
        const data = await response.json();
  
        if (data.id && data.name && data.data) {
          setFlowData({
            id: data.id,
            name: data.name,
            nodes: (data.data.nodes || []).map((node) => ({
              ...node,
              usertrackdata: {
                uservisted: node.id === "start" ? true : false, 
                userselected: node.id === "start" ? true : false
              },
            })),
            edges: data.data.edges || [],

          });

        } else {
          console.error("Unexpected data structure from API");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData(); // Initial fetch
  
  }, []);
 
  const Data = {nodes:flowData.nodes,edges:flowData.edges}

  console.log("flag check" ,Data)
  // console.log("flowData",flowData);
  
  
  const updateFlowData = (nodeId, changes) => {
    setFlowData((prevData) => ({
      ...prevData,
      nodes: prevData.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...changes } : node
      ),
    }));
  };

  const getAllDescendants = (nodeId, nodes, edges) => {
    const directChildren = edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => edge.target);
  
    const allDescendants = [...directChildren];
  
    directChildren.forEach((childId) => {
      allDescendants.push(...getAllDescendants(childId, nodes, edges));
    });
  
    return allDescendants;
  };

  
  const resetUserSelectedForDescendants = (nodeId) => {
    setFlowData((prevData) => {
      const descendantIds = getAllDescendants(nodeId, prevData.nodes, prevData.edges);
  
      return {
        ...prevData,
        nodes: prevData.nodes.map((node) =>
          descendantIds.includes(node.id)
            ? {
                ...node,
                usertrackdata: {
                  ...node.usertrackdata,
                  userselected: false, // Reset selected state
                },
              }
            : node
        ),
      };
    });
  };

  const setUserTrackData = (selectedNode, prevNode, isBacktracking) => {
    setFlowData((prevData) => {
      const { nodes, edges } = prevData;
  
      // Step 1: Mark the clicked node as selected and visited
      let updatedNodes = nodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              usertrackdata: {
                ...node.usertrackdata,
                userselected: false, // Reset first to ensure no conflicts
                uservisted: true,
              },
            }
          : node
      );
  
      if (!prevNode) {
        // If there is no previous node, just set the selected node and return
        updatedNodes = updatedNodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, usertrackdata: { ...node.usertrackdata, userselected: true } }
            : node
        );
        return { ...prevData, nodes: updatedNodes };
      }
  
      console.log("Is backtracking?", isBacktracking); // Debugging log
  
      if (isBacktracking) {
        // Step 2: Get all descendants of the previously selected node
        const descendants = getAllDescendants(prevNode.id, nodes, edges);
  
        console.log("Descendants of", prevNode.id, ":", descendants); // Debugging log
  
        // Step 3: Reset userselected for all descendants
        updatedNodes = updatedNodes.map((node) =>
          descendants.includes(node.id)
            ? { ...node, usertrackdata: { ...node.usertrackdata, userselected: false } }
            : node
        );
  
        // Step 4: Find sibling nodes
        const siblings = edges
          .filter((edge) => edge.source === prevNode.id)
          .map((edge) => edge.target);
  
        console.log("Siblings of", prevNode.id, ":", siblings); // Debugging log
  
        // Step 5: Reset userselected for all siblings **except** the currently clicked node
        updatedNodes = updatedNodes.map((node) =>
          siblings.includes(node.id) && node.id !== selectedNode.id
            ? { ...node, usertrackdata: { ...node.usertrackdata, userselected: false } }
            : node
        );
  
        // Step 6: Also reset userselected for all descendants of siblings
        siblings.forEach((siblingId) => {
          if (siblingId !== selectedNode.id) {
            const siblingDescendants = getAllDescendants(siblingId, nodes, edges);
            updatedNodes = updatedNodes.map((node) =>
              siblingDescendants.includes(node.id)
                ? { ...node, usertrackdata: { ...node.usertrackdata, userselected: false } }
                : node
            );
          }
        });
      }
  
      // Step 7: Ensure the clicked node is explicitly set as selected
      updatedNodes = updatedNodes.map((node) =>
        node.id === selectedNode.id
          ? { ...node, usertrackdata: { ...node.usertrackdata, userselected: true } }
          : node
      );
  
      // Step 8: Mark direct child nodes of the selected node as visited
      const childNodes = edges
        .filter((edge) => edge.source === selectedNode.id)
        .map((edge) => edge.target);
  
      updatedNodes = updatedNodes.map((node) =>
        childNodes.includes(node.id)
          ? { ...node, usertrackdata: { ...node.usertrackdata, uservisted: true } }
          : node
      );
  
      console.log("Updated nodes after backtracking:", updatedNodes); // Debugging log
  
      return { ...prevData, nodes: updatedNodes };
    });
  };
  
  

  return (
    <FlowContext.Provider value={{
      flowData,
      Data,
      updateFlowData,
      setUserTrackData,
      resetUserSelectedForDescendants
    }}>
      {children}
    </FlowContext.Provider>
  );
};

const useFlowContext = () => {
  return useContext(FlowContext);
};

export { FlowProvider, useFlowContext };