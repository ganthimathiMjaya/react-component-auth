import React, { useState, useEffect } from "react";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useFlowContext } from "../context/context";
import '../CSS/Flowchart.css';
import 'devextreme/dist/css/dx.light.css';
import { TextBox } from "devextreme-react";


const FlowChart = () => {
  const { flowData, updateFlowData, setUserTrackData} = useFlowContext();
  const { id, name, nodes, edges } = flowData;
  const [currentTime, setCurrentTime] = useState("");
  const [isStartNodeInitialized, setIsStartNodeInitialized] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [formState, setFormState] = useState({
    activeFieldIndex: null,
    responses: {},
  });
  const [inputValues, setInputValues] = useState({});
  const [historyStack, setHistoryStack] = useState({});
  const [navigationStack, setNavigationStack] = useState([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(formattedTime);
    };

    updateTime(); // Set the initial time
    const intervalId = setInterval(updateTime, 60000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);


  useEffect(() => {
    // console.log("useEffect triggered");
    // Execute only once after nodes and edges are fetched
    if (!isStartNodeInitialized && nodes.length && edges.length) {
      const startNode = nodes.find((node) => node.id === "start");
      if (!startNode) {
        console.error("Start node not found.");
        return;
      }

      const initialNode = {
        id: startNode.id,
        data: { label: startNode?.data?.label || "Default start label" },
        actions: edges
          .filter((edge) => edge.source === startNode.id)
          .map((edge) => nodes.find((node) => node.id === edge.target)),
      };

      setCurrentNode(initialNode); // Update the current node
      addChatMessage(initialNode); // Add to chat history

      setIsStartNodeInitialized(true); // Mark as initialized
    }
  }, [nodes, edges, isStartNodeInitialized]);

  const addChatMessage = (node) => {
    setChatHistory((prev) => [
      ...prev,
      {
        id: node?.id || "unknown",
        label: node?.data?.label || "Node",
        actions: node?.actions || [],
      },
    ]);
  };

  // Fix: Properly define getAvailableActions within the component
  const getAvailableActions = (node) => {
    // console.log("Available Actions for Node:", node.id);
    if (!node) return [];
    return edges
      .filter((edge) => edge.source === node.id)
      .map((edge) => nodes.find((n) => n?.id === edge.target))
      .filter((n) => n);
  };

  console.log("flowData",flowData)

  const handleActionClick = async (selectedNode) => {
    if (!selectedNode) {
      console.error("Selected node is invalid or undefined.");
      return;
    }

    const isBacktracking =
    navigationStack.includes(selectedNode.id) || // Existing logic
    !edges.some((edge) => edge.source === currentNode?.id && edge.target === selectedNode.id); // New logic

  // Get the correct parent node for backtracking
  const parentNode = isBacktracking
    ? nodes.find((node) => edges.some((edge) => edge.source === node.id && edge.target === selectedNode.id))
    : currentNode;

  // Update the navigation stack
  setNavigationStack((prevStack) => {
    if (isBacktracking) {
      // If backtracking, truncate the stack up to the selected node
      const index = prevStack.indexOf(selectedNode.id);
      return index !== -1 ? prevStack.slice(0, index + 1) : prevStack;
    } else {
      // If normal navigation, add the selected node to the stack
      return [...prevStack, selectedNode.id];
    }
  });

  // Call setUserTrackData with the correct parent node and isBacktracking flag
  setUserTrackData(selectedNode, parentNode, isBacktracking);

    const isEndNode = selectedNode.id.startsWith("End");

    // Save current chat history to the history stack
    if (!isEndNode) {
      setHistoryStack((prev) => ({
        ...prev,
        [currentNode.id]: { chatHistory, formState, inputValues },
      }));
    } else {
      // Save the End node to the history stack immediately
      const nodedatavalue = selectedNode.data?.nodedatavalue;
      if (nodedatavalue) {
        const parsedData = JSON.parse(nodedatavalue);
        const message = parsedData.blocks?.[0]?.text || "No message available.";

        setHistoryStack((prev) => ({
          ...prev,
          [selectedNode.id]: {
            chatHistory: [
              ...chatHistory,
              {
                id: selectedNode.id,
                label: message,
                actions: [],
              },
            ],
            formState: {}, // End nodes typically don't have form states
            inputValues: {}, // End nodes typically don't have input values
          },
        }));
      }
    }

    // Restore chat history if the node was previously selected
    if (historyStack[selectedNode.id]) {
      console.log("Restoring previous history for node:", selectedNode.id);
      const { chatHistory, formState, inputValues } = historyStack[selectedNode.id];
      setChatHistory(chatHistory);
      setFormState(formState);
      setInputValues(inputValues);
    } else {
      if (isEndNode) {
        // Handle end node separately
        const nodedatavalue = selectedNode.data?.nodedatavalue;
        if (nodedatavalue) {
          const parsedData = JSON.parse(nodedatavalue);
          const message = parsedData.blocks?.[0]?.text || "No message available.";

          // Log the end node details in the chat history
          setChatHistory((prev) => [
            ...prev,
            {
              id: selectedNode.id, // Log the end node ID
              label: message,
              actions: [],
            },
          ]);
        }

        try {
          await postChatData();
          // console.log("End node chat data saved successfully!");
        } catch (error) {
          console.error("Failed to save End node chat data:", error);
        }

      } else {
        // Handle normal nodes
        if (selectedNode.data?.keyValuePairs?.length) {
          startFormInteraction(selectedNode);
        } else {
          proceedToNextNode(selectedNode);
        }
      }
    }

    // Update the current node
    setCurrentNode(selectedNode);
  };

  const postChatData = async () => {
    const requestData = {
      ClaimPathwayID: id,
      ClaimPathwayName: name,
      ClaimPathwayTransactionID: uuidv4(), // Generate a unique UUID
      FlowID: 1, // Hardcoded for now
      RawData: JSON.stringify(historyStack), // Raw history stack data
      ActualData: JSON.stringify(chatHistory), // Chat history data
    };

    const response = await axios.post(
      "http://10.20.76.74:5123/storepathwaydata",
      requestData
    );
    
    return response.data;
  };

  // console.log("HistoryStack", historyStack);


  const startFormInteraction = (node) => {

    setFormState({
      activeFieldIndex: 0,
      responses: {},
    });
    setCurrentNode(node);
    askFormField(node, 0);
  };

  // Function to ask a question based on the keyValuePairs in the node
  const askFormField = (node, fieldIndex) => {
    if (!node.data?.keyValuePairs || node.data.keyValuePairs.length === 0) {
      console.error("No keyValuePairs found in the node.");
      return;
    }

    const field = node.data.keyValuePairs[fieldIndex];
    // console.log("Asking form field:", field); // Debug log
    if (field) {
      setChatHistory((prev) => {
        // Check if the question already exists in the chat history
        const questionExists = prev.some(
          (message) => message.id === `form-question-${node.id}-${fieldIndex}`
        );
        if (!questionExists) {
          return [
            ...prev,
            {
              id: `form-question-${node.id}-${fieldIndex}`,
              label: field.Key, // Use Key as the question text
              actions: [],
              // isSystemMessage: true, // Mark as system-side
              userResponse: null, // Placeholder for user response
            },
          ];
        }
        return prev;
      });
    } else {
      console.error("Invalid form field.");
    }
  };

  // Function to handle user input submission
  const handleInputSubmit = (questionId) => {
    // console.log("handleInputSubmit called with questionId:", questionId); // Debug log
    const inputValue = inputValues[questionId] || "";
    if (inputValue.trim() === "") return; // Don't process empty input

    const parts = questionId.split('-');
    const nodeId = parts.slice(2, parts.length - 1).join('-');
    const fieldIndex = parts[parts.length - 1];
    // console.log("Parsed nodeId:", nodeId, "fieldIndex:", fieldIndex); // Debug log
    const node = nodes.find((n) => n.id === nodeId);
    // console.log("Found node:", node); // Debug log
    const field = node?.data?.keyValuePairs?.[fieldIndex];
    // console.log("Found field:", field); // Debug log

    if (!field) {
      console.error("Invalid field or node.");
      return;
    }

    // Update system-side bubble to show user's response
    setChatHistory((prev) =>
      prev.map((message) =>
        message.id === questionId
          ? {
            ...message,
            userResponse: inputValue, // Attach user's input
          }
          : message
      )
    );

    // Collect form responses
    const newResponses = {
      ...formState.responses,
      [field.Key]: inputValue, // Ensure numeric or text inputs are correctly stored
    };

    if (formState.activeFieldIndex + 1 < node.data.keyValuePairs.length) {
      // Move to the next form field
      setFormState({
        activeFieldIndex: formState.activeFieldIndex + 1,
        responses: newResponses,
      });
      askFormField(node, formState.activeFieldIndex + 1);
    } else {
      // Form completed
      completeFormInteraction(newResponses);
    }

    setInputValues((prev) => ({ ...prev, [questionId]: inputValue })); // Keep input field value
  };

  const completeFormInteraction = (responses) => {
    updateFlowData(currentNode.id, {
      // cp_status: "Current",
      responses,
      isFormSubmitted: true,
    });
    setFormState({ activeFieldIndex: null, responses: {} });
    const nextNodes = getAvailableActions(currentNode);
    // console.log("nextNodes", nextNodes);

    proceedToNextNode(currentNode);

  };

  const proceedToNextNode = (node) => {
    // console.log("Proceeding to next node:", node);
    // updateFlowData(currentNode.id, { cp_status: "Completed" });
    // updateFlowData(node.id, { cp_status: "Current" });

    setCurrentNode(node);

    // Add the system's next question or prompt to chat history
    addChatMessage({
      ...node,
      actions: getAvailableActions(node),
    });
  };

  // console.log(currentNode,"CurrentNode");

  // console.log(chatHistory, "chatHistory");

  return (
    <div
      style={{
        width: "450px",
        margin: "auto",
        borderRadius: "12px",
        // boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        position: "relative",
        backgroundColor: "#fff", // To mimic Paper's default background
      }}
    >
      <div style={{ padding: "4px" }}>
        <h4 sx={{ fontWeight: "bold", fontSize: "16px" }}>
          {id}-{name}
        </h4>
        <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "16px 0" }} />
        <div
          style={{
            marginTop: "16px",
            backgroundColor: "white",
            borderRadius: "8px",
            height: "100%",
            overflowY: "auto",
            display: "flex",
            fontSize: '11px',
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >

          {chatHistory.map((message, index) => (
            <div
              key={message.id}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: "14px",
                fontSize: '12px',
              }}
            >
              {/* Icon for system/user */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontSize: '11px',
                  justifyContent: "flex-start",
                  marginRight: "6px",
                }}
              >
                <div
                  style={{
                    width: "0px",
                    height: "30px",
                    borderRadius: "50%",
                    fontSize: '11px',
                    backgroundColor: "#e0e0e0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src="/arc-chat-icon-removebg-preview.png"
                    alt="System"
                    style={{ width: "32px", height: "24px" }}
                  />
                </div>
                <h4
                  variant="caption"
                  sx={{
                    marginTop: "4px",
                    color: "#a0a0a0",
                    fontSize: "11px",
                  }}
                >
                  {currentTime}
                </h4>
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: "80%",
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: '11px',
                  backgroundColor: "#113e70", // System: white; User: blue
                  color: "#fff", // System: black text; User: white text
                  position: "relative",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Optional: Add shadow for system messages
                }}
              >
                {/* Conditionally render "Call Notes" header for "End" node */}
                {message.id.startsWith("End") && (
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '8px', // Space between header and message
                    }}
                  >
                    Call Notes
                  </div>
                )}

                {/* Message Content */}
                <h4
                  variant="body2"
                  sx={{
                    fontWeight: "normal", // System: normal; User: bold
                  }}
                >
                  {message.label}
                </h4>

                {message.actions.length > 0 && (
                  <div className="systemchatbubble"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                      cursor: "pointer"
                    }}
                  >
                    {message.actions.map((action) => (
                      <div
                        key={action.id}
                        style={{
                          // marginTop: "8px",
                          padding: "8px",
                          fontSize: "11px",
                          borderRadius: "4px",
                          borderBottom: "1px solid #ccc",
                          color: "black",
                
                             backgroundColor: '#94c694'
                        }}
                      >
                        <div
                          onClick={() => handleActionClick(action)}
                          style={{
                            color: "inherit",
                            fontWeight: "bold",
                            textTransform: "none",
                          }}
                        >
                          {action.data.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.id.startsWith("form-question-") && (
                  <TextBox
                    value={inputValues[message.id] || ""}
                    onValueChanged={(e) =>
                      setInputValues((prev) => ({
                        ...prev,
                        [message.id]: e.value,
                      }))
                    }
                    placeholder="Type your answer here..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent form submission or newline insertion.
                        handleInputSubmit(message.id); // Call the submit function.
                      }
                    }}
                    elementAttr={{
                      style: {
                        padding: "8px",
                        fontSize: "14px",
                        marginTop: "8px",
                        backgroundColor: "#fff", // White background for the text input box
                      },
                    }}
                    buttons={[
                      {
                        name: "endAdornment",
                        location: "after",
                        options: {
                          icon:
                            chatHistory.find((msg) => msg.id === message.id)
                              ?.userResponse
                              ? "edit" // Edit icon
                              : "send", // Send icon
                          onClick: () => {
                            if (
                              chatHistory.find((msg) => msg.id === message.id)?.userResponse
                            ) {
                              setInputValues((prev) => ({
                                ...prev,
                                [message.id]: "",
                              }));
                            } else {
                              handleInputSubmit(message.id);
                            }
                          },
                          stylingMode: "text", // For a minimal button style
                        },
                      },
                    ]}
                    width="100%"
                  />
                )}
              </div>

            </div>

          ))
          }
        </div>
      </div>
    </div>
  );
};

export default FlowChart;