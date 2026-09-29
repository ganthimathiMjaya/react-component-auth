import React, { useState, useEffect } from "react";
import { TreeView } from "devextreme-react/tree-view";
import { Button } from "devextreme-react/button";
import OverlayForm from "./OverlayForm";
import sampleFormat from "../utils/sampleFormat.txt";

const TreeViewComponent = ({
  appRepoDetails,
  setSnackbar,
  refreshData,
}) => {
  const [fileContent, setFileContent] = useState("");
  const [isOverlayPageOpen, setIsOverlayPageOpen] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [treeData, setTreeData] = useState([]);

  // Load file content for "Copy" functionality
  const readFile = async () => {
    try {
      const response = await fetch(sampleFormat);
      const text = await response.text();
      setFileContent(text);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  useEffect(() => {
    readFile();
    setTreeData(mapTreeData(appRepoDetails.Data)); // Initialize tree data
  }, [appRepoDetails]);

  const handleEdit = (repository) => {
    setSelectedRepository(repository);
    setIsOverlayPageOpen(true); // Open overlay for editing
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbar({
          open: true,
          message: "Content copied to clipboard!",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Failed to copy:", error);
      });
  };

  // Map tree data to DevExtreme format with action buttons
  const mapTreeData = (nodes) =>
    nodes.map((node) => ({
      id: node.Id,
      text: node.Name,
      expanded: true, // All nodes expanded by default
      items: node.Children ? mapTreeData(node.Children) : [],
      ComponentType: node.ComponentType, // To display type (e.g., "Pages")
      actions: (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            icon="copy"
            text=""
            onClick={() => copyToClipboard(fileContent)}
            stylingMode="text"
            hint="Copy"
          />
          <Button
            icon="edit"
            text=""
            onClick={() => handleEdit(node)}
            stylingMode="text"
            hint="Edit"
          />
        </div>
      ),
    }));

  const renderTreeItem = (itemData) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <span>{itemData.text}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "gray" }}>{itemData.ComponentType}</span>
          {itemData.actions}
        </div>
      </div>
    );
  };

  const onDragChange = (e) => {
    console.log("Drag started from:", e.fromIndex, "to:", e.toIndex);
  };

  const onReorder = (e) => {
    const { fromIndex, toIndex, dropInsideItem } = e;

    console.log(
      "Reordered from index:",
      fromIndex,
      "to index:",
      toIndex,
      "Drop inside item:",
      dropInsideItem
    );

    // Update tree data (manipulate the data structure accordingly)
    const updatedTreeData = [...treeData];
    const draggedItem = updatedTreeData.splice(fromIndex, 1)[0]; // Remove dragged item
    if (dropInsideItem) {
      updatedTreeData[toIndex].items.push(draggedItem); // Drop inside another item
    } else {
      updatedTreeData.splice(toIndex, 0, draggedItem); // Drop between items
    }
    setTreeData(updatedTreeData); // Update the tree data state
  };

  return (
    <div>
      {/* Render DevExtreme TreeView with drag-and-drop */}
      <TreeView
        items={treeData}
        dataStructure="tree"
        keyExpr="id"
        displayExpr="text"
        parentIdExpr="ParentId"
        itemRender={renderTreeItem} // Custom rendering for each node
        onItemClick={(e) => console.log("Clicked node:", e.itemData)}
        allowItemReordering={true} // Enable drag-and-drop
        onDragChange={onDragChange}
        onReorder={onReorder}
      />

      {/* Overlay form for editing */}
      {isOverlayPageOpen && selectedRepository && (
        <OverlayForm
          GetAppRepositoryByAppId={appRepoDetails}
          setIsOverlayPageOpen={setIsOverlayPageOpen}
          repoDetails={selectedRepository}
          mode="Edit"
          setSnackbar={setSnackbar}
          refreshData={refreshData}
        />
      )}
    </div>
  );
};

export default TreeViewComponent;
