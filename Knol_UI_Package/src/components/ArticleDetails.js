import React, { useEffect, useState, useRef } from "react";
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import { Button } from "devextreme-react/button";
import { VscEye } from "react-icons/vsc";
import { MdRemoveRedEye } from "react-icons/md";
import axios from 'axios';
import 'devextreme/dist/css/dx.light.css';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { Popup } from 'devextreme-react/popup';
import parse from 'html-react-parser';
import { Popover } from "devextreme-react/popover";
import ContentLoader from 'react-content-loader';

const ShimmerTitle = () => (
  <ContentLoader 
    speed={1}  // Slow down the shimmer animation
    width="100%"
    height={30}  // Increase height for a bigger effect
    backgroundColor="#e0e0e0"  // Darker background for better contrast
    foregroundColor="#d6d6d6"  // Slightly lighter foreground
  >
    {/* Title Bar */}
    <rect x="10" y="10" rx="4" ry="4" width="60%" height="20" /> 
    {/* First Line */}
   
   
  </ContentLoader>
);
const ArticleDetails = ({ selectedArticle, toggleMainContent, knowledgebaseId, isArrowBack, searchValue, clearTrigger, baseURL, knolChatURL, UserId }) => {
  const { groupId, postTypeId, actionId, ConversationId, InboxItemId, InboxItemTypeId, title } = selectedArticle || {};
  const [pdfUrl, setPdfUrl] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isTable, setIsTable] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highLightContent, setHightlightContent] = useState('');
  const buttonRef = useRef(null);
  const [searchResult, setSearchResult] = useState([]);
  const [relatedQuestions, setReleatedQuestions] = useState([]);
  const [articleListResponse, setArticleListResponse] = useState([]);
  const [selectedFile, setSelectedFile] = useState({
    fileName: "",
    content: "",
  });
  const [isLiked, setIsLiked] = useState(false);
  const [IsFav, setIsFav] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (articleListResponse) {
      setIsLiked(articleListResponse.isLiked || false);
      setIsFav(articleListResponse.IsFav || false);
      setLikeCount(articleListResponse.LikeCount || 0);
    }
  }, [articleListResponse]);
  const handleActionClick = async (action) => {
    try {
      await axios.post(`${baseURL}Article/SubmitUserAction`, {
        params: {
          PostId: InboxItemId,
          UserId: UserId,
          Action: action
        }
      });

      // Update UI based on the action
      if (action === 'Liked') {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      } else if (action === 'Favorite') {
        setIsFav(!IsFav);
      }

    } catch (error) {
      console.error("Error submitting user action: ", error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    setSearchResult([]);
    setReleatedQuestions([]);
  }, [clearTrigger]);

  useEffect(() => {
    if (searchValue) {
      setLoading(true);
      const token = "IjE5ODdjZTg0ZWQzNzExZWY5MzFiMDI0MmFjMTIwMDA0Ig.Z7NAPQ.gH9N9bFLDYABXCGdv3PKIZQWWG8";
      const url = `${knolChatURL}/chunk/retrieval_test`;
      const payload = {
        "kb_id": [
          knowledgebaseId],
        "highlight": true,
        "question": searchValue,
        "page": 1,
        "size": 10
      };

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          setSearchResult(data)
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          console.error("Error:", error)
        });

      fetchAskData();


      const urls = `${knolChatURL}/conversation/related_questions`;
      const payloads = {
        question: searchValue,
      };
      try {
        const response = axios.post(urls, payloads, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`
          },
        });
        setReleatedQuestions(response.data.data);
      } catch (err) {
        console.error("API call error:", err);
      }

      // Perform API call or filter data based on searchValue
    } else {
      setReleatedQuestions([]);
      setSearchResult([]);
    }
  }, [searchValue, knowledgebaseId]);

  const fetchAskData = async () => {
    try {
      const askData = JSON.stringify({
        kb_ids: [knowledgebaseId],
        question: searchValue,
      });
  
      const askResponse = await fetch(
        `${knolChatURL}/conversation/ask`,
        {
          method: "POST",
          headers: {
            Authorization:
              "IjE5ODdjZTg0ZWQzNzExZWY5MzFiMDI0MmFjMTIwMDA0Ig.Z7NAPQ.gH9N9bFLDYABXCGdv3PKIZQWWG8",
            "Content-Type": "application/json",
          },
          body: askData,
        }
      );
  
      if (!askResponse.ok) {
        throw new Error(`HTTP error! Status: ${askResponse.status}`);
      }
  
      // Read the streaming response
      const reader = askResponse.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
  
      let accumulatedText = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.info("Stream processing done.");
          break;
        }
  
        accumulatedText += value; // Append streamed data
  
        // Process each new JSON message
        const jsonChunks = accumulatedText
          .split("\n")
          .filter((chunk) => chunk.trim() !== ""); // Remove empty lines
  
        for (const chunk of jsonChunks) {
          try {
            if (chunk.startsWith("data:")) {
              const jsonData = JSON.parse(chunk.replace("data:", "").trim()); // Remove 'data:' prefix
              if (jsonData?.data?.answer) {
                setAnswer((prev) => prev + jsonData.data.answer);
              }
            }
          } catch (e) {
            console.warn("Error parsing chunk:", chunk, e);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    
  };
  const handleClickOpenDialog = (file) => {
    setFileLoading(true); // Start loading indicator

    const targetIdentifier = "6faa083c-0d34-4e55-86ce-9b421371f07c";

    const fileCaption = file.docnm_kwd;
    const fileType = fileCaption.split(".").pop().toLowerCase();
    let mimeType;
    let viewerUrl;

    switch (fileType) {
      case "pdf":
        mimeType = "application/pdf";
        break;
      case "doc":
      case "docx":
        // For .doc or .docx, use either Google Docs Viewer or Office Viewer
        viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          "YOUR_FILE_URL"
        )}`;
        break;
      case "xlsx":
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
      default:
        mimeType = "application/octet-stream";
    }

    let data = JSON.stringify({
      AttachmentIdentifier: targetIdentifier,
      FileCaption: fileCaption,
      FileId: file.doc_id,
      FileByte: "",
      AllowedFileCount: 1,
      Remarks: "",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${baseURL}File/GetFiles`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
      responseType: "blob",
    };

    axios
      .request(config)
      .then((response) => {
        const blob = new Blob([response.data], { type: mimeType });

        if (fileType === "doc" || fileType === "docx") {
          viewerUrl = `https://www.mass.gov/doc/andys-test-for-url-issue-0/download`;
          setPdfUrl(viewerUrl);

        } else {
          const blobURL = URL.createObjectURL(blob);
          setPdfUrl(blobURL);
        }
        setFileLoading(false);

      })
      .catch((error) => {
        setFileLoading(false); // Stop loader in case of error
        console.error("Error making API call:", error);
      });

    // setSelectedFile(file.content);
    setOpenDialog(true);
  };
  const checkAndCallApi = async (attachments) => {
    const targetIdentifier = "6faa083c-0d34-4e55-86ce-9b421371f07c"; // Your target identifier

    attachments.forEach((attachment) => {
      if (attachment.AttachmentIdentifier === targetIdentifier) {
        setPdfUrl(null);
        const fileCaption = attachment.FileCaption;
        const fileType = fileCaption.split('.').pop().toLowerCase();;
        let mimeType;
        let viewerUrl;

        switch (fileType) {
          case 'pdf':
            mimeType = 'application/pdf';
            break;
          case 'doc':
          case 'docx':
            // For .doc or .docx, use either Google Docs Viewer or Office Viewer
            viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent('YOUR_FILE_URL')}`;
            break;
          case 'xlsx':
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
          default:
            mimeType = 'application/octet-stream';
        }

        let data = JSON.stringify({
          "AttachmentIdentifier": attachment.AttachmentIdentifier,
          "FileCaption": attachment.FileCaption,
          "FileId": attachment.FileId,
          "FileByte": attachment.FileByte,
          "AllowedFileCount": attachment.AllowedFileCount,
          "Remarks": attachment.Remarks
        });

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${baseURL}File/GetFiles`,
          headers: {
            'Content-Type': 'application/json'
          },
          data: data,
          responseType: 'blob'
        };

        axios.request(config)
          .then((response) => {

            const blob = new Blob([response.data], { type: mimeType });

            if (fileType === 'doc' || fileType === 'docx') {
              viewerUrl = `https://www.mass.gov/doc/andys-test-for-url-issue-0/download`;
              // viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(URL.createObjectURL(blob))}`;
              setPdfUrl(viewerUrl);
            } else {
              const blobURL = URL.createObjectURL(blob);
              setPdfUrl(blobURL);
            }
            setFileLoading(false); // Stop loader after file loads

          })
          .catch((error) => {
            setFileLoading(false); // Stop loader in case of error
            console.error('Error making API call:', error);
          });
      }
    });
  };

  const fetchData = async () => {
    try {
      setPdfUrl(null);
      const response = await axios.post(`${baseURL}ArticleDashboard/GetInboxItemDetails`,
        {
          LoggedUserId: UserId,
          params: {
            InboxItemId: InboxItemId,
            InboxItemTypeId: InboxItemTypeId
          }
        }
      );
      let resData = response.data.Data;
      await checkAndCallApi(resData.Attachments);
      setArticleListResponse(resData);
    } catch (error) {
      console.error('Error making API call:', error);
    }
  };
  useEffect(() => {
    fetchData();
    setReleatedQuestions([]);
    setSearchResult([]);
  }, [selectedArticle]);

  const {
    HeaderTitle,
    PublishDate,
    DocTitle,
    PublishTime,
    DocContent,
    // LikeCount,
    ViewCount,
    // IsFav,
    // isLiked,
    isViewed
  } = articleListResponse || {};
  const highlightEmphasizedText = (chunkHighlight, chunk) => {
    // Parse and dynamically replace <em> tags with highlighted spans
    return parse(chunkHighlight, {
      replace: (domNode) => {
        if (domNode.name === 'em') {
          return (
            <span
              key={domNode.startIndex}
              ref={buttonRef}
              style={{ color: "red", fontWeight: "bold", cursor: "pointer" }}
              onMouseEnter={() => {
                const tableCheck = chunk?.content_with_weight?.trim().startsWith("<table>");
                setIsTable(tableCheck); // Set the isTable state
                setVisible(true);
                setVisible(true)
                setHightlightContent(chunk.content_with_weight);
              }}
              onMouseLeave={() => setVisible(false)}
            >
              {domNode.children[0]?.data}
            </span>
          );
        }
      },
    });
  };
  return (
    <div>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmF1dG87ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLXBvc2l0aW9uLXg6MCU7YmFja2dyb3VuZC1wb3NpdGlvbi15OjAlO2JhY2tncm91bmQtc2l6ZTphdXRvO2JhY2tncm91bmQtb3JpZ2luOnBhZGRpbmctYm94O2JhY2tncm91bmQtY2xpcDpib3JkZXItYm94O2JhY2tncm91bmQ6c2Nyb2xsIHJnYigyNTUsIDI1NSwgMjU1KSBub25lICByZXBlYXQ7d2lkdGg6MjAwcHg7aGVpZ2h0OjIwMHB4OzthbmltYXRpb246bm9uZSI+PGc+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgxLCAwLCAwLCAxLCAwLCAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC4wODMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMDgzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYwMjU0MDM3ODQ0Mzg3LDAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuNDk5OTk5OTk5OTk5OTk5OTQsMC44NjYwMjU0MDM3ODQ0Mzg3LDMxLjY5ODcyOTgxMDc3ODA1OCwtMTguMzAxMjcwMTg5MjIxOTQpIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgwLjg2NjAyNSwgMC41LCAtMC41LCAwLjg2NjAyNSwgMzEuNjk4NywgLTE4LjMwMTMpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjE2NjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC4xNjY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjUwMDAwMDAwMDAwMDAwMDEsMC44NjYwMjU0MDM3ODQ0Mzg2LC0wLjg2NjAyNTQwMzc4NDQzODYsMC41MDAwMDAwMDAwMDAwMDAxLDY4LjMwMTI3MDE4OTIyMTkyLC0xOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KDAuNSwgMC44NjYwMjUsIC0wLjg2NjAyNSwgMC41LCA2OC4zMDEzLCAtMTguMzAxMyk7O2FuaW1hdGlvbjpub25lIj48cmVjdCBmaWxsPSIjNzFjYWZlIiBoZWlnaHQ9IjEyIiB3aWR0aD0iNiIgcnk9IjYiIHJ4PSIzIiB5PSIyNCIgeD0iNDciIG9wYWNpdHk9IjAuMjUiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMjU7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCg2LjEyMzIzMzk5NTczNjc2NmUtMTcsMSwtMSw2LjEyMzIzMzk5NTczNjc2NmUtMTcsMTAwLDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgwLCAxLCAtMSwgMCwgMTAwLCAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC4zMzMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMzMzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuNDk5OTk5OTk5OTk5OTk5ODMsMC44NjYwMjU0MDM3ODQ0Mzg3LC0wLjg2NjAyNTQwMzc4NDQzODcsLTAuNDk5OTk5OTk5OTk5OTk5ODMsMTE4LjMwMTI3MDE4OTIyMTkyLDMxLjY5ODcyOTgxMDc3ODA1NSkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjUsIDAuODY2MDI1LCAtMC44NjYwMjUsIC0wLjUsIDExOC4zMDEsIDMxLjY5ODcpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjQxNjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC40MTY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMC44NjYwMjU0MDM3ODQ0Mzg3LDAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuODY2MDI1NDAzNzg0NDM4NywxMTguMzAxMjcwMTg5MjIxOTQsNjguMzAxMjcwMTg5MjIxOTQpIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgtMC44NjYwMjUsIDAuNSwgLTAuNSwgLTAuODY2MDI1LCAxMTguMzAxLCA2OC4zMDEzKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC41IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjU7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMSwxLjIyNDY0Njc5OTE0NzM1MzJlLTE2LC0xLjIyNDY0Njc5OTE0NzM1MzJlLTE2LC0xLDEwMCwxMDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgtMSwgMCwgMCwgLTEsIDEwMCwgMTAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC41ODMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuNTgzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuODY2MDI1NDAzNzg0NDM4NiwtMC41MDAwMDAwMDAwMDAwMDAxLDAuNTAwMDAwMDAwMDAwMDAwMSwtMC44NjYwMjU0MDM3ODQ0Mzg2LDY4LjMwMTI3MDE4OTIyMTkyLDExOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjg2NjAyNSwgLTAuNSwgMC41LCAtMC44NjYwMjUsIDY4LjMwMTMsIDExOC4zMDEpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjY2NjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC42NjY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMC41MDAwMDAwMDAwMDAwMDA0LC0wLjg2NjAyNTQwMzc4NDQzODQsMC44NjYwMjU0MDM3ODQ0Mzg0LC0wLjUwMDAwMDAwMDAwMDAwMDQsMzEuNjk4NzI5ODEwNzc4MTA0LDExOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjUsIC0wLjg2NjAyNSwgMC44NjYwMjUsIC0wLjUsIDMxLjY5ODcsIDExOC4zMDEpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjc1IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjc1OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEuODM2OTcwMTk4NzIxMDI5N2UtMTYsLTEsMSwtMS44MzY5NzAxOTg3MjEwMjk3ZS0xNiw3LjEwNTQyNzM1NzYwMTAwMmUtMTUsMTAwKSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMCwgLTEsIDEsIDAsIDAsIDEwMCk7O2FuaW1hdGlvbjpub25lIj48cmVjdCBmaWxsPSIjNzFjYWZlIiBoZWlnaHQ9IjEyIiB3aWR0aD0iNiIgcnk9IjYiIHJ4PSIzIiB5PSIyNCIgeD0iNDciIG9wYWNpdHk9IjAuODMzMzM0IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjgzMzMzNDs7YW5pbWF0aW9uOm5vbmUiPjwvcmVjdD48L2c+CjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNTAwMDAwMDAwMDAwMDAwMSwtMC44NjYwMjU0MDM3ODQ0Mzg2LDAuODY2MDI1NDAzNzg0NDM4NiwwLjUwMDAwMDAwMDAwMDAwMDEsLTE4LjMwMTI3MDE4OTIyMTk0LDY4LjMwMTI3MDE4OTIyMTkyKSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMC41LCAtMC44NjYwMjUsIDAuODY2MDI1LCAwLjUsIC0xOC4zMDEzLCA2OC4zMDEzKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC45MTY2NjciIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuOTE2NjY3OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYwMjU0MDM3ODQ0Mzg0LC0wLjUwMDAwMDAwMDAwMDAwMDQsMC41MDAwMDAwMDAwMDAwMDA0LDAuODY2MDI1NDAzNzg0NDM4NCwtMTguMzAxMjcwMTg5MjIxOTQsMzEuNjk4NzI5ODEwNzc4MTA0KSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMC44NjYwMjUsIC0wLjUsIDAuNSwgMC44NjYwMjUsIC0xOC4zMDEzLCAzMS42OTg3KTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMSIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpOzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGc+PC9nPjwvZz48IS0tIFtsZGlvXSBnZW5lcmF0ZWQgYnkgaHR0cHM6Ly9sb2FkaW5nLmlvIC0tPjwvc3ZnPg==" alt="Loading..." style={{ width: "50px", height: "50px" }} />
        </div>
      ) : searchResult && searchResult?.data?.chunks?.length > 0 ? (
        searchResult?.data?.chunks?.map((chunk, index) => (
          <div key={index} style={{ padding: "15px", margin: "10px 10px" }} className="rounded-2xl shadow-xl  bg-white">
            <p className="text-gray-600 mt-2">
              {highlightEmphasizedText(chunk?.highlight?.length > 200 ? `${chunk?.highlight?.substring(0, 200)}...` : chunk?.highlight, chunk)}
            </p>
            <div className="knolchatContent">
              <p className="text-gray-600 mt-1">
                {chunk?.docnm_kwd && (
                  <a
                    href={`/${chunk?.docnm_kwd}`} // Use chunk value to build the dynamic link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                    onClick={(e) => {
                      e.preventDefault(); // Prevents navigation
                      handleClickOpenDialog(chunk); // Opens the dialog with tooltip content
                    }}
                  >
                    {chunk.docnm_kwd}
                  </a>
                )}
              </p>
            </div>
            {relatedQuestions?.length > 0 && (
              <div className="Relatedinformation">
                <div className="inforealtedlevel">
                  <h3>Related Question</h3>
                  <div className="question_keyword">
                    {relatedQuestions.map((question, index) => (
                      <div key={index} className="keywordname">
                        {question}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <Popover
              visible={visible}
              position='left'
              onHiding={() => setVisible(false)}
              target={buttonRef.current}
              showCloseButton={true}
              width={500}
              height={400}
            >
              <div className="panelbox" style={{ backgroundColor: "#fff", overflow: "auto" }}>
                {isTable ? (
                  <div
                    style={{
                      overflowX: "auto",
                      maxWidth: "100%",
                      border: "1px solid #ccc",
                      padding: "8px",
                    }}
                    dangerouslySetInnerHTML={{ __html: highLightContent }}
                  />
                ) : (
                  <p style={{ padding: "10px" }}>{highLightContent}</p>
                )}
              </div>
            </Popover>
            <Popup
              visible={openDialog} // Popup visibility based on the openDialog state
              onHidden={handleCloseDialog} // Close the popup when hidden
              // title={selectedFile?.fileName} // Title of the popup is the file name
              width={1024} // Set width of the popup
              height={600} // Set height of the popup
              showTitle={true} // Show the popup title
              dragEnabled={true} // Make the popup draggable
              closeOnOutsideClick={true} // Close the popup when clicking outside
            >
              <div>
                {fileLoading ? (
                  <div className="centerloading" style={{ width: '13%', height: '100px' }}>
                    <img className="centerloading" style={{ width: "50px", height: "50px" }} src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmF1dG87ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLXBvc2l0aW9uLXg6MCU7YmFja2dyb3VuZC1wb3NpdGlvbi15OjAlO2JhY2tncm91bmQtc2l6ZTphdXRvO2JhY2tncm91bmQtb3JpZ2luOnBhZGRpbmctYm94O2JhY2tncm91bmQtY2xpcDpib3JkZXItYm94O2JhY2tncm91bmQ6c2Nyb2xsIHJnYigyNTUsIDI1NSwgMjU1KSBub25lICByZXBlYXQ7d2lkdGg6MjAwcHg7aGVpZ2h0OjIwMHB4OzthbmltYXRpb246bm9uZSI+PGc+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgxLCAwLCAwLCAxLCAwLCAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC4wODMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMDgzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYwMjU0MDM3ODQ0Mzg3LDAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuNDk5OTk5OTk5OTk5OTk5OTQsMC44NjYwMjU0MDM3ODQ0Mzg3LDMxLjY5ODcyOTgxMDc3ODA1OCwtMTguMzAxMjcwMTg5MjIxOTQpIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgwLjg2NjAyNSwgMC41LCAtMC41LCAwLjg2NjAyNSwgMzEuNjk4NywgLTE4LjMwMTMpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjE2NjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC4xNjY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjUwMDAwMDAwMDAwMDAwMDEsMC44NjYwMjU0MDM3ODQ0Mzg2LC0wLjg2NjAyNTQwMzc4NDQzODYsMC41MDAwMDAwMDAwMDAwMDAxLDY4LjMwMTI3MDE4OTIyMTkyLC0xOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KDAuNSwgMC44NjYwMjUsIC0wLjg2NjAyNSwgMC41LCA2OC4zMDEzLCAtMTguMzAxMyk7O2FuaW1hdGlvbjpub25lIj48cmVjdCBmaWxsPSIjNzFjYWZlIiBoZWlnaHQ9IjEyIiB3aWR0aD0iNiIgcnk9IjYiIHJ4PSIzIiB5PSIyNCIgeD0iNDciIG9wYWNpdHk9IjAuMjUiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMjU7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCg2LjEyMzIzMzk5NTczNjc2NmUtMTcsMSwtMSw2LjEyMzIzMzk5NTczNjc2NmUtMTcsMTAwLDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgwLCAxLCAtMSwgMCwgMTAwLCAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC4zMzMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMzMzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuNDk5OTk5OTk5OTk5OTk5ODMsMC44NjYwMjU0MDM3ODQ0Mzg3LC0wLjg2NjAyNTQwMzc4NDQzODcsLTAuNDk5OTk5OTk5OTk5OTk5ODMsMTE4LjMwMTI3MDE4OTIyMTkyLDMxLjY5ODcyOTgxMDc3ODA1NSkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjUsIDAuODY2MDI1LCAtMC44NjYwMjUsIC0wLjUsIDExOC4zMDEsIDMxLjY5ODcpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjQxNjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC40MTY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMC44NjYwMjU0MDM3ODQ0Mzg3LDAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuODY2MDI1NDAzNzg0NDM4NywxMTguMzAxMjcwMTg5MjIxOTQsNjguMzAxMjcwMTg5MjIxOTQpIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgtMC44NjYwMjUsIDAuNSwgLTAuNSwgLTAuODY2MDI1LCAxMTguMzAxLCA2OC4zMDEzKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC41IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjU7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMSwxLjIyNDY0Njc5OTE0NzM1MzJlLTE2LC0xLjIyNDY0Njc5OTE0NzM1MzJlLTE2LC0xLDEwMCwxMDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgtMSwgMCwgMCwgLTEsIDEwMCwgMTAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC41ODMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuNTgzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuODY2MDI1NDAzNzg0NDM4NiwtMC41MDAwMDAwMDAwMDAwMDAxLDAuNTAwMDAwMDAwMDAwMDAwMSwtMC44NjYwMjU0MDM3ODQ0Mzg2LDY4LjMwMTI3MDE4OTIyMTkyLDExOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjg2NjAyNSwgLTAuNSwgMC41LCAtMC44NjYwMjUsIDY4LjMwMTMsIDExOC4zMDEpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjY2NjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC42NjY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMC41MDAwMDAwMDAwMDAwMDA0LC0wLjg2NjAyNTQwMzc4NDQzODQsMC44NjYwMjU0MDM3ODQ0Mzg0LC0wLjUwMDAwMDAwMDAwMDAwMDQsMzEuNjk4NzI5ODEwNzc4MTA0LDExOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjUsIC0wLjg2NjAyNSwgMC44NjYwMjUsIC0wLjUsIDMxLjY5ODcsIDExOC4zMDEpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjc1IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjc1OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEuODM2OTcwMTk4NzIxMDI5N2UtMTYsLTEsMSwtMS44MzY5NzAxOTg3MjEwMjk3ZS0xNiw3LjEwNTQyNzM1NzYwMTAwMmUtMTUsMTAwKSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMCwgLTEsIDEsIDAsIDAsIDEwMCk7O2FuaW1hdGlvbjpub25lIj48cmVjdCBmaWxsPSIjNzFjYWZlIiBoZWlnaHQ9IjEyIiB3aWR0aD0iNiIgcnk9IjYiIHJ4PSIzIiB5PSIyNCIgeD0iNDciIG9wYWNpdHk9IjAuODMzMzM0IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjgzMzMzNDs7YW5pbWF0aW9uOm5vbmUiPjwvcmVjdD48L2c+CjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNTAwMDAwMDAwMDAwMDAwMSwtMC44NjYwMjU0MDM3ODQ0Mzg2LDAuODY2MDI1NDAzNzg0NDM4NiwwLjUwMDAwMDAwMDAwMDAwMDEsLTE4LjMwMTI3MDE4OTIyMTk0LDY4LjMwMTI3MDE4OTIyMTkyKSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMC41LCAtMC44NjYwMjUsIDAuODY2MDI1LCAwLjUsIC0xOC4zMDEzLCA2OC4zMDEzKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC45MTY2NjciIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuOTE2NjY3OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYwMjU0MDM3ODQ0Mzg0LC0wLjUwMDAwMDAwMDAwMDAwMDQsMC41MDAwMDAwMDAwMDAwMDA0LDAuODY2MDI1NDAzNzg0NDM4NCwtMTguMzAxMjcwMTg5MjIxOTQsMzEuNjk4NzI5ODEwNzc4MTA0KSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMC44NjYwMjUsIC0wLjUsIDAuNSwgMC44NjYwMjUsIC0xOC4zMDEzLCAzMS42OTg3KTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMSIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpOzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGc+PC9nPjwvZz48IS0tIFtsZGlvXSBnZW5lcmF0ZWQgYnkgaHR0cHM6Ly9sb2FkaW5nLmlvIC0tPjwvc3ZnPg==" alt="Loading..." />
                  </div>) : (
                  <div>
                    <iframe
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      width="1000"
                      height="600"
                      title="File Preview"
                    ></iframe>
                  </div>
                )}

              </div>
            </Popup>
          </div>
        ))
      ) : searchResult?.data?.chunks?.length === 0 ? (<div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <div
          style={{
            fontSize: '1.25rem', // Equivalent to h6 font size
            color: '#666',       // Equivalent to `textSecondary`
            textAlign: 'center', // Align text
          }}
        >
          No data available
        </div>
      </div>) : (
        <div
          direction="row"
          width="100%"
          className="w-full border border-slate-200"
          style={{
            maxWidth: "100%",
          }}
        >
          {selectedArticle?.groupId && selectedArticle?.postTypeId && selectedArticle?.InboxItemId && selectedArticle?.InboxItemTypeId ? (
            <>
              <div
                justifyContent="space-between"
                alignItems="flex-start"
                style={{
                  justifyContent: "space-between",
                  display: "flex",
                  padding: "5px",
                  width: "100%",
                  gap: "10px",
                  borderBottom: "1px solid #DBDBDB",
                }}
              >
                <div style={{ display: 'flex' }} display="flex" alignItems="baseline" width="100%" gap={1}>
                  {isArrowBack ?
                    <Button style={{ padding: 0, marginTop: 2, border: 'none' }} onClick={toggleMainContent} icon="arrowleft" />
                    : <Button style={{ padding: 0, marginTop: 2, border: 'none' }} onClick={toggleMainContent} icon="arrowright" />
                  }
                  <div style={{ marginLeft: '8px', width: '100%' }}>
                    <div
                      style={{
                        fontSize: window.innerWidth < 600 ? '14px' : '16px', // Responsive font size
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {HeaderTitle || <ShimmerTitle/>}
                    </div>
                    <div
                      style={{
                        fontSize: window.innerWidth < 600 ? '10px' : '12px', // Responsive font size
                        color: '#666', // Matches `textSecondary` color
                      }}
                    >
                      {PublishDate}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                      onClick={() => handleActionClick('Liked')}
                    >
                      {isLiked ? <AiFillLike size={20} /> : <AiOutlineLike size={20} />}
                    </div>
                    <span style={{ fontSize: "12px" }}>{likeCount}</span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    >
                      {isViewed ? <MdRemoveRedEye fontSize="20px" /> : <VscEye fontSize="20x" />}
                    </div>
                    <span style={{ fontSize: "12px" }}>{ViewCount}</span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                      onClick={() => handleActionClick('Favorite')}
                    >
                      {IsFav ? <AiFillStar size={20} /> : <AiOutlineStar size={20} />}
                    </div>
                    <span style={{ fontSize: "12px" }}>Favorite</span>
                  </div>
                </div>
              </div>

              <div direction="row"
                style={{
                  padding: "16px",
                }}>
                <div>
                  {/* <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                    }}
                  >
                    {DocTitle || 'No Document Title Available'}
                  </div> */}
                  <div
                    style={{
                      fontSize: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    {DocContent || <ShimmerTitle/>}
                  </div>
                </div>

                {DocContent &&
                  <div>
                    <div style={{
                      height: "50vh", display: "flex", justifyContent: "center",
                    }}>
                      {pdfUrl ? (
                        <iframe src={`${pdfUrl}#toolbar=0`} width="100%" height="calc(100vh - 60px)" title="File Preview"></iframe>

                      ) : (
                        <img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmF1dG87ZGlzcGxheTpibG9jaztiYWNrZ3JvdW5kLXBvc2l0aW9uLXg6MCU7YmFja2dyb3VuZC1wb3NpdGlvbi15OjAlO2JhY2tncm91bmQtc2l6ZTphdXRvO2JhY2tncm91bmQtb3JpZ2luOnBhZGRpbmctYm94O2JhY2tncm91bmQtY2xpcDpib3JkZXItYm94O2JhY2tncm91bmQ6c2Nyb2xsIHJnYigyNTUsIDI1NSwgMjU1KSBub25lICByZXBlYXQ7d2lkdGg6MjAwcHg7aGVpZ2h0OjIwMHB4OzthbmltYXRpb246bm9uZSI+PGc+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwwLDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgxLCAwLCAwLCAxLCAwLCAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC4wODMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMDgzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYwMjU0MDM3ODQ0Mzg3LDAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuNDk5OTk5OTk5OTk5OTk5OTQsMC44NjYwMjU0MDM3ODQ0Mzg3LDMxLjY5ODcyOTgxMDc3ODA1OCwtMTguMzAxMjcwMTg5MjIxOTQpIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgwLjg2NjAyNSwgMC41LCAtMC41LCAwLjg2NjAyNSwgMzEuNjk4NywgLTE4LjMwMTMpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjE2NjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC4xNjY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjUwMDAwMDAwMDAwMDAwMDEsMC44NjYwMjU0MDM3ODQ0Mzg2LC0wLjg2NjAyNTQwMzc4NDQzODYsMC41MDAwMDAwMDAwMDAwMDAxLDY4LjMwMTI3MDE4OTIyMTkyLC0xOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KDAuNSwgMC44NjYwMjUsIC0wLjg2NjAyNSwgMC41LCA2OC4zMDEzLCAtMTguMzAxMyk7O2FuaW1hdGlvbjpub25lIj48cmVjdCBmaWxsPSIjNzFjYWZlIiBoZWlnaHQ9IjEyIiB3aWR0aD0iNiIgcnk9IjYiIHJ4PSIzIiB5PSIyNCIgeD0iNDciIG9wYWNpdHk9IjAuMjUiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMjU7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCg2LjEyMzIzMzk5NTczNjc2NmUtMTcsMSwtMSw2LjEyMzIzMzk5NTczNjc2NmUtMTcsMTAwLDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgwLCAxLCAtMSwgMCwgMTAwLCAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC4zMzMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuMzMzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuNDk5OTk5OTk5OTk5OTk5ODMsMC44NjYwMjU0MDM3ODQ0Mzg3LC0wLjg2NjAyNTQwMzc4NDQzODcsLTAuNDk5OTk5OTk5OTk5OTk5ODMsMTE4LjMwMTI3MDE4OTIyMTkyLDMxLjY5ODcyOTgxMDc3ODA1NSkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjUsIDAuODY2MDI1LCAtMC44NjYwMjUsIC0wLjUsIDExOC4zMDEsIDMxLjY5ODcpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjQxNjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC40MTY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMC44NjYwMjU0MDM3ODQ0Mzg3LDAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuNDk5OTk5OTk5OTk5OTk5OTQsLTAuODY2MDI1NDAzNzg0NDM4NywxMTguMzAxMjcwMTg5MjIxOTQsNjguMzAxMjcwMTg5MjIxOTQpIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgtMC44NjYwMjUsIDAuNSwgLTAuNSwgLTAuODY2MDI1LCAxMTguMzAxLCA2OC4zMDEzKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC41IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjU7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMSwxLjIyNDY0Njc5OTE0NzM1MzJlLTE2LC0xLjIyNDY0Njc5OTE0NzM1MzJlLTE2LC0xLDEwMCwxMDApIiBzdHlsZT0idHJhbnNmb3JtOm1hdHJpeCgtMSwgMCwgMCwgLTEsIDEwMCwgMTAwKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC41ODMzMzQiIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuNTgzMzM0OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuODY2MDI1NDAzNzg0NDM4NiwtMC41MDAwMDAwMDAwMDAwMDAxLDAuNTAwMDAwMDAwMDAwMDAwMSwtMC44NjYwMjU0MDM3ODQ0Mzg2LDY4LjMwMTI3MDE4OTIyMTkyLDExOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjg2NjAyNSwgLTAuNSwgMC41LCAtMC44NjYwMjUsIDY4LjMwMTMsIDExOC4zMDEpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjY2NjY2NyIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpO29wYWNpdHk6MC42NjY2Njc7O2FuaW1hdGlvbjpub25lIj48L3JlY3Q+PC9nPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMC41MDAwMDAwMDAwMDAwMDA0LC0wLjg2NjAyNTQwMzc4NDQzODQsMC44NjYwMjU0MDM3ODQ0Mzg0LC0wLjUwMDAwMDAwMDAwMDAwMDQsMzEuNjk4NzI5ODEwNzc4MTA0LDExOC4zMDEyNzAxODkyMjE5NCkiIHN0eWxlPSJ0cmFuc2Zvcm06bWF0cml4KC0wLjUsIC0wLjg2NjAyNSwgMC44NjYwMjUsIC0wLjUsIDMxLjY5ODcsIDExOC4zMDEpOzthbmltYXRpb246bm9uZSI+PHJlY3QgZmlsbD0iIzcxY2FmZSIgaGVpZ2h0PSIxMiIgd2lkdGg9IjYiIHJ5PSI2IiByeD0iMyIgeT0iMjQiIHg9IjQ3IiBvcGFjaXR5PSIwLjc1IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjc1OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTEuODM2OTcwMTk4NzIxMDI5N2UtMTYsLTEsMSwtMS44MzY5NzAxOTg3MjEwMjk3ZS0xNiw3LjEwNTQyNzM1NzYwMTAwMmUtMTUsMTAwKSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMCwgLTEsIDEsIDAsIDAsIDEwMCk7O2FuaW1hdGlvbjpub25lIj48cmVjdCBmaWxsPSIjNzFjYWZlIiBoZWlnaHQ9IjEyIiB3aWR0aD0iNiIgcnk9IjYiIHJ4PSIzIiB5PSIyNCIgeD0iNDciIG9wYWNpdHk9IjAuODMzMzM0IiBzdHlsZT0iZmlsbDpyZ2IoMTEzLCAyMDIsIDI1NCk7b3BhY2l0eTowLjgzMzMzNDs7YW5pbWF0aW9uOm5vbmUiPjwvcmVjdD48L2c+CjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNTAwMDAwMDAwMDAwMDAwMSwtMC44NjYwMjU0MDM3ODQ0Mzg2LDAuODY2MDI1NDAzNzg0NDM4NiwwLjUwMDAwMDAwMDAwMDAwMDEsLTE4LjMwMTI3MDE4OTIyMTk0LDY4LjMwMTI3MDE4OTIyMTkyKSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMC41LCAtMC44NjYwMjUsIDAuODY2MDI1LCAwLjUsIC0xOC4zMDEzLCA2OC4zMDEzKTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMC45MTY2NjciIHN0eWxlPSJmaWxsOnJnYigxMTMsIDIwMiwgMjU0KTtvcGFjaXR5OjAuOTE2NjY3OzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC44NjYwMjU0MDM3ODQ0Mzg0LC0wLjUwMDAwMDAwMDAwMDAwMDQsMC41MDAwMDAwMDAwMDAwMDA0LDAuODY2MDI1NDAzNzg0NDM4NCwtMTguMzAxMjcwMTg5MjIxOTQsMzEuNjk4NzI5ODEwNzc4MTA0KSIgc3R5bGU9InRyYW5zZm9ybTptYXRyaXgoMC44NjYwMjUsIC0wLjUsIDAuNSwgMC44NjYwMjUsIC0xOC4zMDEzLCAzMS42OTg3KTs7YW5pbWF0aW9uOm5vbmUiPjxyZWN0IGZpbGw9IiM3MWNhZmUiIGhlaWdodD0iMTIiIHdpZHRoPSI2IiByeT0iNiIgcng9IjMiIHk9IjI0IiB4PSI0NyIgb3BhY2l0eT0iMSIgc3R5bGU9ImZpbGw6cmdiKDExMywgMjAyLCAyNTQpOzthbmltYXRpb246bm9uZSI+PC9yZWN0PjwvZz4KPGc+PC9nPjwvZz48IS0tIFtsZGlvXSBnZW5lcmF0ZWQgYnkgaHR0cHM6Ly9sb2FkaW5nLmlvIC0tPjwvc3ZnPg=='
                          alt="Loading..." style={{
                            display: "block",
                            width: "100px",
                            height: "100px",
                          }} />)}
                    </div>
                  </div>
                }
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
              }}
            >
              <div
                style={{
                  fontSize: '1.25rem', // Equivalent to h6 font size
                  color: '#666',       // Equivalent to `textSecondary`
                  textAlign: 'center', // Align text
                }}
              >
                Please select an article to view details.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleDetails;
