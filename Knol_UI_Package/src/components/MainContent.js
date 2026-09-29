
import { TextBox } from "devextreme-react/text-box";
import { Button } from "devextreme-react/button";
import DataGrid, {
  Column,
  Paging,
  FilterRow,
  HeaderFilter,
  SearchPanel,
  Editing, Selection,
} from "devextreme-react/data-grid";
import "devextreme/dist/css/dx.light.css";
import React, { useState, useCallback, useEffect } from "react";
import {
  MdErrorOutline,
  MdNotificationImportant,
  MdOutlineError,
  MdOutlineSort,
  MdSearch,
} from "react-icons/md";
import axios from "axios";
import 'devextreme/dist/css/dx.light.css';
import { TabPanel } from "devextreme-react/tab-panel";
import "../components/MainContent.css";
import { Popup } from "devextreme-react/popup";
import { List } from "devextreme-react/list";
import { ToolbarItem } from 'devextreme-react/popup';

export const MainContent = ({ selectedArticle, onSelectArticle,clearTrigger,baseURL, UserId }) => {
  const { groupId = null, postTypeId = null, actionId = null, ConversationId = null, title = "", InboxItemId = null } = selectedArticle || {};
  const [selectedTab, setSelectedTab] = useState(0);
  const [userSelectedTab, setUserSelectedTab] = useState(false); // Track manual selection
  const [articleListResponse, setArticleListResponse] = useState([]);
  const [hoveredArticle, setHoveredArticle] = useState(null);
  const [clickedArticle, setClickedArticle] = useState(InboxItemId);
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [initialArticleOpened, setInitialArticleOpened] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);


  const showPopup = () => {
    setPopupVisible(!popupVisible);
  };

  const open = Boolean(anchorEl);

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const menuItems = [
    { id: "title", text: "Name" },
    { id: "date", text: "Date Created" },
  ];
  const fetchData = async () => {
    try {
      const response = await axios.post(`${baseURL}ArticleDashboard/GetInboxItems`,
        {
          LoggedUserId: UserId,
          params: {
            GroupId: groupId,
            ActionId: actionId,
            PostTypeId: postTypeId
          }
        }
      );
      let resData = response.data.Data;
      setArticleListResponse(resData);
    } catch (error) {
      console.error('Error making API call:', error);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [selectedArticle]);

  const handlePageChange = (e) => {
    if (e.fullName === "searchPanel.text") {
      setSearchInput(e.value);
    }
    if (e.fullName === "paging.pageIndex" || e.fullName === "paging.pageSize") {
      setSelectedArticleId(null);
      fetchData();
      // onSelectArticle({
      //   groupId: null,
      //   postTypeId: null,
      //   actionId: 0,
      //   ConversationId: "",
      //   title: "",
      //   InboxItemId: 0,
      //   InboxItemTypeId: 0,
      // });
    }
  };

  const handleTabChange = (selectedIndex) => {
    setUserSelectedTab(true); // Mark as manually changed
    setSelectedArticleId(null);
    setSearchInput(""); // Clear SearchPanel input value

    setInitialArticleOpened(false);
    setSelectedTab(selectedIndex);
    onSelectArticle((prevArticle) => ({
      ...prevArticle,
      InboxItemId: 0,
      InboxItemTypeId: 0,
    }));
  };

  const handleMouseEnter = (articleId) => {
    setHoveredArticle(articleId);
  };

  const handleMouseLeave = () => {
    setHoveredArticle(null);
  };

  const handleArticleClick = async (article, action) => {
    setSelectedArticleId(article.Id);

    setClickedArticle(article.Id);
    onSelectArticle({
      groupId: groupId,
      postTypeId: postTypeId,
      actionId: actionId,
      ConversationId,
      title: article.Title,
      InboxItemId: article.Id,
      InboxItemTypeId: article.TypeId,
    });
    try {
      const response = await axios.post(`${baseURL}Article/SubmitUserAction`, {
        params: {
          PostId: article.Id,
          UserId: UserId,
          Action: action
        }
      });
    } catch (error) {
      console.error("Error submitting user action: ", error);
    }

  };
  const unreadArticles = articleListResponse.filter(article => !article.IsRead && article.Title.toLowerCase().includes(searchInput.toLowerCase()));
  const readArticles = articleListResponse.filter(article => article.IsRead && article.Title.toLowerCase().includes(searchInput.toLowerCase()));
  const favoriteArticles = articleListResponse.filter(article => article.IsFav && article.Title.toLowerCase().includes(searchInput.toLowerCase()));

  const sortArticles = (articles) => {
    return articles.sort((a, b) => {
      if (sortBy === 'title') {
        return a.Title.localeCompare(b.Title);
      } else if (sortBy === 'date') {
        return new Date(b.Createddate) - new Date(a.Createddate);
      }
      return 0;
    });
  };

  const filteredArticles = selectedTab === 0
    ? sortArticles(unreadArticles)
    : selectedTab === 1
      ? sortArticles(readArticles)
      : sortArticles(favoriteArticles);

  const getIconForType = (type) => {
    switch (type) {
      case "PWI":
        return <MdOutlineError color="red" size={20} />;
      case "Notification":
        return <MdNotificationImportant color="blue" size={20} />;
      default:
        return <MdErrorOutline color="gray" size={20} />;
    }
  };

  const shouldShowTypeText = (type) => {
    const typesWithText = ["PWI", "Update"];
    return typesWithText.includes(type);
  };

  const tabs = [
    { id: 0, title: `Unread (${unreadArticles.length})` },
    { id: 1, title: `Read (${readArticles.length})` },
    { id: 2, title: `Favorites (${favoriteArticles.length})` },
  ];

  useEffect(() => {
    if (articleListResponse.length === 0 || userSelectedTab) return; // Don't override manual selection

    const unreadArticles = articleListResponse.filter(
      (article) => !article.IsRead && article.Title.toLowerCase().includes(searchInput.toLowerCase())
    );
    const readArticles = articleListResponse.filter(
      (article) => article.IsRead && article.Title.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (unreadArticles.length === 0 && readArticles.length > 0 && selectedTab === 0) {
      setSelectedTab(1); // Switch to "Read" only if the user has not manually changed it
    }

    setInitialArticleOpened(false); // Reset flag for first article open
  }, [articleListResponse, searchInput, selectedTab, userSelectedTab]);


  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [groupId]);

  useEffect(() => {
    setSearchInput("");
  }, [selectedTab]);

  useEffect(() => {
    setSearchInput(""); 
  }, [clearTrigger]);

  return (
    <div id="Knol-MainContent"
      style={{
        minWidth: 300,
        boxShadow: "-5px 0 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1,
      }}
    >
      <div style={{ padding: "0", border: '2px solid #ccc', margin: '10px' }}>
        <TabPanel
          dataSource={tabs}
          selectedIndex={selectedTab}
          onSelectionChanged={(e) => handleTabChange(e.component.option("selectedIndex"))}
          showNavButtons={true}
          loop={true}
          animationEnabled={true}
          focusStateEnabled={false}
        />
      </div>


      <div style={{ marginTop: "16px", paddingLeft: '10px', paddingRight: '10px' }}>
        <DataGrid className="article_datagrid" style={{ width: '100%' }} 
        // onOptionChanged={(e) => {
        //   if (e.fullName === "searchPanel.text") {
        //     setSearchInput(e.value);
        //   }
        // }}
          onOptionChanged={handlePageChange}
          dataSource={filteredArticles}
          keyExpr="Id"
          id="articleLatestList"
          // key={searchInput}
          showBorders={true}
          rowAlternationEnabled={true}
          onRowClick={(e) => handleArticleClick(e.data, "Viewed")}
          focusedRowEnabled={true}
          focusedRowKey={selectedArticleId}
        >
          <SearchPanel id="latestartnotication" visible={true} 
            value={searchInput}
            text={searchInput}
            className="articleInput"
          />
          <HeaderFilter visible={true} />
          <Paging defaultPageSize={15} />
          <Selection mode="single" />

          <Column dataField="Title" caption="" dataType="string" width={250} />

        </DataGrid>
      </div>

    </div>
  );
};

export default MainContent;
