import { List } from "devextreme-react/list";
import React, { useState, useEffect } from "react";
import ArticleDetails from "../components/ArticleDetails";
import MainContent from "../components/MainContent";
import { SelectBox } from "devextreme-react/select-box";
import "../App.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Tooltip from "devextreme-react/tooltip";
import { Button } from "devextreme-react/button";
import { Tabs } from "devextreme-react/tabs";
import { ChatSection } from "../components/ChatSection";
import ContentLoader from 'react-content-loader';

const TabShimmer = () => (
  <div
    style={{
      fontSize: "13px",
      padding: "0 10px",
      minWidth: "40px",
      minHeight: "25px",
      margin: "0 10px 0 0",
      fontWeight: "bold",
      border: "1px solid #e0e0e0",
      borderRadius: "3px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
    }}
  >
    <ContentLoader
      speed={1.5}
      width={60}
      height={15}
      backgroundColor="#e0e0e0"
      foregroundColor="#d6d6d6"
    >
      <rect x="0" y="0" rx="4" ry="4" width="60" height="15" />
    </ContentLoader>
  </div>
);

const settings = ["Profile", "Account", "Dashboard", "Logout"];

export default function MiniDrawer({ customerId, projectId, token, searchValue, baseURL, knolChatURL }) {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [clearTrigger, setClearTrigger] = useState(false);
  const [knowledgebaseId, setKnowledgebaseId] = useState("");
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [listResponse, setListResponse] = useState([]);
  const [isMainContentVisible, setIsMainContentVisible] = useState(true);
  const [isArrowBack, setIsArrowBack] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const decodedToken = jwtDecode(token);
  const [isLoading, setIsLoading] = useState(true);
  const UserId = decodedToken?.UserId;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };


  const handleClearClick = () => {
    // Clear the search term
    setSearchTerm('');
    setSubmittedSearchTerm('');
    setClearTrigger((prev) => !prev);
  };
  const handleSearchClick = () => {
    setSubmittedSearchTerm(searchTerm); // Pass the search value on button click
  };
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [selectedArticle, setSelectedArticle] = React.useState({
    groupId: null,
    postTypeId: null,
    ConversationId: "",
    actionId: 0,
    title: "",
    InboxItemId: 0,
    InboxItemTypeId: 0,
  });
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  const fetchKnowledgeData = async () => {
    const response = await axios.post(`${baseURL}Groups/GetKnowledgeBaseInfo`,
      {
        "loggedUserId": UserId,
        "params": {
          "CustomerId": customerId,
          "ProjectId": projectId
        }
      }
    );
    let resData = response?.data?.Data?.KnowledgebaseId;
    setKnowledgebaseId(resData);
  }

  useEffect(() => {
    if (selectedGroup?.ArticleInfo?.length > 0 && !selectedTab) {
      const defaultTab = selectedGroup.ArticleInfo[0];
      setSelectedTab(defaultTab.PostTypeId);

      setSelectedArticle((prev) => ({
        ...prev,
        postTypeId: defaultTab.PostTypeId,
        ConversationId: defaultTab.ConversationId || prev.ConversationId,
        title: defaultTab.PostTypeName || prev.title,
        InboxItemId: 0,
        actionId: 0,
        InboxItemTypeId: 0,
      }));
    }
  }, [selectedGroup, selectedTab, setSelectedTab, setSelectedArticle]);

  const handleTabChange = ({ itemData }) => {
    const newValue = itemData.PostTypeId;

    setIsMainContentVisible(true);
    setIsArrowBack(true);
    setSelectedTab(newValue);
    setClearTrigger(prev => !prev);
    setSearchTerm("");
    setSubmittedSearchTerm("");
    const selectedArticleDetails = selectedGroup?.ArticleInfo?.find(
      (article) => article.PostTypeId === newValue
    );

    setSelectedArticle((prev) => ({
      ...prev,
      postTypeId: newValue,
      ConversationId:
        selectedArticleDetails?.ConversationId || prev.ConversationId,
      title: selectedArticleDetails?.PostTypeName || prev.title,
      InboxItemId: 0,
      actionId: 0,
      InboxItemTypeId: 0,
    }));
  };

  const tabItems =
    selectedGroup?.ArticleInfo?.map((article) => ({
      PostTypeId: article.PostTypeId,
      text: `${article.PostTypeName} (${article.DocumentCreatedCount})`,
    })) || [];



  const handleOpenUserMenu = () => {
    setMenuVisible((prev) => !prev); // Toggle menu visibility
  };



  const toggleMainContent = () => {
    setIsMainContentVisible(!isMainContentVisible);
    setIsArrowBack(!isArrowBack);
  };

  // Handler to update state based on dropdown selection
  const handleGroupChange = (event) => {
    const groupId = event.value;
    setSelectedGroupId(groupId);

    const group = listResponse.find((group) => group.GroupId === groupId);
    setSelectedGroup(group);

    const initialPostTypeId = group?.ArticleInfo?.[0]?.PostTypeId || null;

    setSelectedTab(initialPostTypeId);
    setSelectedArticle({
      groupId,
      postTypeId: initialPostTypeId,
      ConversationId: group?.ConversationId || "",
      actionId: 0,
      title: "",
      InboxItemId: 0,
      InboxItemTypeId: 0,
    });
  };

  // const handleTabChange = (event, newValue) => {
  //   setIsMainContentVisible(true);
  //   setIsArrowBack(true);
  //   setSelectedTab(newValue);

  //   const selectedArticleDetails = selectedGroup?.ArticleInfo?.find(
  //     (article) => article.PostTypeId === newValue
  //   );

  //   setSelectedArticle((prev) => ({
  //     ...prev,
  //     postTypeId: newValue,
  //     ConversationId:
  //       selectedArticleDetails?.ConversationId || prev.ConversationId,
  //     title: selectedArticleDetails?.PostTypeName || prev.title,
  //     InboxItemId: 0,
  //     actionId: 0,
  //     InboxItemTypeId: 0,
  //   }));
  // };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };


  const fetchData = async () => {
    setIsLoading(true);
    try {
    const decodedToken = jwtDecode(token);
    const UserId = decodedToken?.UserId;
    const response = await axios.post(
      `${baseURL}ArticleDashboard/GetUserInboxGroupInfoByCustomerandProject`,
      {
        "LoggedUserId": UserId,
        "Params": {
          "CustomerId": customerId,
          "ProjectId": projectId
        }
      }
    );

    let resData = response.data.Data;
    if (resData?.Groups && resData.Groups.length > 0) {
      const defaultGroup = resData.Groups[0];

      const defaultPostTypeId =
        defaultGroup?.ArticleInfo?.[0]?.PostTypeId || null;

      setSelectedGroupId(defaultGroup.GroupId);
      setSelectedGroup(defaultGroup);
      setSelectedTab(defaultPostTypeId);

      setSelectedArticle({
        groupId: defaultGroup.GroupId,
        postTypeId: defaultPostTypeId,
        ConversationId: defaultGroup?.ConversationId || "",
        actionId: 0,
        title: "",
        InboxItemId: 0,
        InboxItemTypeId: 0,
      });
    }
    setListResponse(resData?.Groups);
  } catch (error) {
    console.error("Error fetching data", error);
  } finally {
    setIsLoading(false);
  }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Clear search value automatically when switching tabs
    setSearchTerm("");
    setSubmittedSearchTerm("");
  }, [selectedTab]);
  return (
    <div style={{ background: "#F0F0F0" }} id="knol-categoryTab">
      <div
        component="main"
        style={{
          flexGrow: 1,
          padding: "5px",
          paddingBottom: "16px",
          overflow: "auto",
          backgroundColor: "#F0F0F0",
          minHeight: "100vh", // Replicates `min-h-screen`
        }}
        bgcolor="#F0F0F0"
        className="min-h-screen"
      >
        <div
          align="center"
          justify="space-between"
          style={{ margin: "8px 0", display: 'flex' }}
        >
           <Tabs
      style={{ textAlign: "left" }}
      className="knoltab-slection"
      dataSource={isLoading ? Array(4).fill({}) : tabItems} // Placeholder items when loading
      selectedIndex={tabItems.findIndex((tab) => tab.PostTypeId === selectedTab)}
      onItemClick={handleTabChange}
      itemRender={(item, index) =>
        isLoading ? (
          <TabShimmer key={index} />
        ) : (
          <div
            className="category-tab"
            style={{
              fontSize: "13px",
              padding: "0 10px",
              minWidth: "40px",
              minHeight: "25px",
              color: item.PostTypeId === selectedTab ? "#ffffff" : "black",
              backgroundColor:
                item.PostTypeId === selectedTab ? "#121559" : "transparent",
              margin: "0 10px 0 0",
              textTransform: "capitalize",
              fontWeight: "bold",
              border: "1px solid #113E70",
              borderRadius: "3px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {item.text}
          </div>
        )
      }
    />
          {/* <Tabs
            style={{ textAlign: "left" }}
            className="knoltab-slection"
            dataSource={tabItems}
            selectedIndex={tabItems.findIndex((tab) => tab.PostTypeId === selectedTab)}
            onItemClick={handleTabChange}
            itemRender={(item) => (
              <div className="category-tab"
                style={{
                  fontSize: "13px",
                  padding: "0 10px",
                  minWidth: "40px",
                  minHeight: "25px",
                  color: item.PostTypeId === selectedTab ? "#ffffff" : "black",
                  backgroundColor:
                    item.PostTypeId === selectedTab ? "#121559" : "transparent",
                  margin: "0 10px 0 0",
                  textTransform: "capitalize",
                  fontWeight: "bold",
                  border: "1px solid #113E70",
                  borderRadius: "3px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {item.text}
              </div>
            )}
          /> */}
          <div className="searchbox">
            <input type="text" className="searchpanel" placeholder="search" value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearchClick();
                }
              }}
            />
            <img className="chatbuttonpanel" src="data:image/png;base64,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" style={{ cursor: "pointer" }}
              onClick={handleSearchClick} // Attach the click handler
            />
            {searchTerm && (
              <button
                className="close-btn"
                style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '16px' }}
                onClick={handleClearClick}
              >
                ✖
              </button>
            )}
          </div>
        </div>
        <div
          className="flex flex-col md:flex-row gap-5"
          style={{ height: "90vh", display: "flex" }}
        >
          {isMainContentVisible && (
            <div
              className="w-full md:w-1/4 bg-white left_art"
              style={{
                height: "calc(90vh - 50px)",
                // overflowY: "auto",
              }}
            >
              <MainContent
                selectedArticle={selectedArticle}
                onSelectArticle={setSelectedArticle}
                clearTrigger={clearTrigger} // Pass trigger to reset search field
                searchValue={submittedSearchTerm}
                baseURL={baseURL}
                UserId={UserId}
              />
            </div>
          )}

          <div
            className="flex-1 bg-white right_art"
            style={{
              height: "calc(90vh - 50px)",
              overflowY: "auto",
            }}
          >
            <ArticleDetails
              selectedArticle={selectedArticle}
              toggleMainContent={toggleMainContent}
              isArrowBack={isArrowBack}
              knowledgebaseId={knowledgebaseId}
              searchValue={submittedSearchTerm}
              clearTrigger={clearTrigger}
              baseURL={baseURL}
              UserId={UserId}
              knolChatURL={knolChatURL}
            />
          </div>
        </div>
        {!isChatOpen && (
          <div
            style={{
              background: "white",
              position: "fixed",
              bottom: 22,
              right: 42,
              width: 60,
              height: 60,
              cursor: "pointer",
              transition: "transform .4s",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "10px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
            onClick={toggleChat}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <img
              src="data:image/jpeg;base64,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"
              alt="Open Chat"
              style={{
                width: "70px",
                height: "auto",
              }}
            />
          </div>
        )} {isChatOpen && (
          <div
            style={{
              position: "fixed",
              bottom: 70,
              top: 70,
              right: 16,
              width: 450,
              height: "88%",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "#f0f0f0",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  color: "black",
                }}
              >
                {/* Left Section */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img
                    src="data:image/jpeg;base64,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"
                    alt="Chat Icon"
                    style={{ width: "100px", height: "auto" }}
                  />
                </div>

                {/* Right Section */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={toggleChat}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "24px",
                        color: "#113E70",
                        fontWeight: "bold",
                        lineHeight: "1",
                      }}
                    >
                      &times; {/* Unicode character for a close icon */}
                    </span>
                  </button>
                </div>
              </div>
              <button
                onClick={toggleChat}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Add your icon or content here */}
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                background: "white",
              }}
            >
              <ChatSection selectedArticle={selectedArticle}  UserId={UserId} baseURL={baseURL} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
