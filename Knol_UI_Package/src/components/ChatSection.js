import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../components/chat.css";
import { Popup } from 'devextreme-react/popup';
import { Popover } from "devextreme-react/popover";


export const ChatSection = ({selectedArticle, baseURL, UserId}) => {
  const { groupId, postTypeId, actionId, ConversationId, title } =
    selectedArticle || {};
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef(null);
  const handlePopoverHide = () => {
    setVisiblePopoverIndex(null);
    setVisible(false);
  };
  const [visiblePopoverIndex, setVisiblePopoverIndex] = useState(null); // State for tracking the visible popover
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [textList, setTextList] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation_Id, setConversationId] = useState("");
  const [token, setToken] = useState("");
  const [isSendDisabled, setIsSendDisabled] = useState(false);
  const [tooltipContents, setTooltipContents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const popoverTimeoutRef = useRef(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true); // Loader state for iframe
  const [selectedFile, setSelectedFile] = useState({
    fileName: "",
    content: "",
  });
  const [pdfUrl, setPdfUrl] = useState(null);


  const handleClickOpenDialog = (file) => {
    const targetIdentifier = "6faa083c-0d34-4e55-86ce-9b421371f07c";

    const fileCaption = file.fileName;
    const fileType = fileCaption?.split(".").pop().toLowerCase();
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
      FileId: file.FileId,
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
          // viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(URL.createObjectURL(blob))}`;
          setPdfUrl(viewerUrl);
        } else {
          const blobURL = URL.createObjectURL(blob);
          setPdfUrl(blobURL);
        }
      })
      .catch((error) => {
        console.error("Error making API call:", error);
      });

    setSelectedFile(file.content);
    setIsIframeLoading(true); // Show loader before opening dialog
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    getGroupByID();
    getConversation(conversation_Id);
  }, [conversation_Id]);

  const getGroupByID = async () => {
    axios
      .post(
        `${baseURL}Groups/GetGroupById`,
        {
          LoggedUserId: UserId,
          params: {
            GroupId: groupId,
          },
        },
        {
          headers: {
            authorization: token,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response?.data?.Data) {
          let conID = response?.data?.Data?.GroupDetails?.ConversationId
          if (conID === null) {
            setConversationId(ConversationId)
          } else {
            setConversationId(conID)
          }

        } else {

        }
      })
      .catch((error) => { });
  };

  const getConversation = async (id) => {
    // setConversationId(id);
    axios
      .post(
        `${baseURL}Chat/GetChatHistory`,
        {
          LoggedUserId: UserId,
          params: {
            GroupId: groupId,
            ConversationId: id,
          },
        },
        {
          headers: {
            authorization: token,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response?.data?.Data) {
          const filteredMessages = response.data.Data.message.filter(
            (msg, index) => !(index === 0 && msg.role === "assistant")
        );
        setMessages(filteredMessages);
          // setMessages(response?.data?.Data?.message);
          // setMessages(response?.data?.Data?.message?.slice(1));

          const reference = response.data.Data.reference;
          let chunks = [];

          if (Array.isArray(reference)) {
            // If reference is an array, flatten the chunks from each reference item
            chunks = reference?.flatMap((item) => item.chunks || []);
          } else if (reference && reference.chunks) {
            // If reference is an object, get chunks directly
            chunks = reference.chunks;
          }

          // Map chunks to tooltip contents
          const contents = chunks?.map((chunk) => ({
            content: chunk.content || "", // Default to empty string if missing
            fileName: chunk.document_name || "",
            imageUrl: chunk.image_url || "",
            fileId: chunk.doc_id,
          }));

          setTooltipContents(contents);
        } else {
          setMessages([]);
          setTooltipContents([]); // Clear tooltip contents if no data
        }
      })
      .catch((error) => { });
  };

  const handleSendMessage = async () => {
    const messageToSend = newMessage.trim();
    if (!messageToSend) return;

    setIsSendDisabled(true);
    setMsgLoading(true);

    const newMessages = {
      content: messageToSend,
      role: "user",
      status: "pending",
    };
    const updatedMessages = [...messages, newMessages];
    setMessages(updatedMessages);
    setNewMessage("");

    let data = JSON.stringify({
      LoggedUserId: UserId,
      params: {
        GroupId: groupId,
        ConversationId: conversation_Id,
        Content: messageToSend,
      },
    });

    try {
      const response = await axios.post(
        `${baseURL}Chat/SendChatQuery`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const assistantMessage = {
        content: response?.data?.Data == null ? "No Content": response?.data?.Data,
        // content: response.data.Data,
        role: "assistant",
      };
      if(groupId){
        getGroupByID();
      }
      setMessages((prevMessages) => {
        const userMessageIndex = prevMessages.length - 1;
        const updatedMessages = [...prevMessages];
        updatedMessages[userMessageIndex].status = "sent";
        return [...updatedMessages, assistantMessage];
      });
    } catch (error) {
      setMessages((prevMessages) => {
        const userMessageIndex = prevMessages.length - 1;
        const updatedMessages = [...prevMessages];
        updatedMessages[userMessageIndex].status = "failed";
        return updatedMessages;
      });
    } finally {
      setIsSendDisabled(false);
      setMsgLoading(false);
    }
  };
  const renderMessageContent = (content) => {
    const markerPattern = /##(\d)\$\$/g;
    const formattedContent = content?.replace(/\n\n\*/g, "<br />• ")?.replace(/\n\n/g, "<br /><br />").replace(/\\"/g, '"');

    const segments = formattedContent?.split(markerPattern);

    return segments?.map((segment, idx) => {
      const isMarker = idx % 2 === 1; // Odd indices are markers

      if (isMarker) {
        const markerIndex = parseInt(segment, 10); // Extract the number in the marker
        const tooltipContent = tooltipContents[markerIndex]; // Extract the tooltip content
        const isTable = tooltipContent?.content?.trim().startsWith("<table>");

        return (
          <span
            key={idx}
            style={{ position: "relative", display: "inline-block" }}
          >
            {/* Info Icon using DevExtreme */}
            {/* <i
              className="dx-icon-info"
              ref={buttonRef}
              onClick={() => {
                setVisiblePopoverIndex(markerIndex);
                setVisible(true)
              }
              }
              style={{
                color: "gray",
                fontSize: "18px",
                verticalAlign: "text-bottom",
                margin: "0 4px",
                cursor: "pointer",
              }}
            /> */}
            {visiblePopoverIndex === markerIndex && (
              <Popover
                visible={visible}
                position={'left'}
                onHiding={handlePopoverHide}
                target={buttonRef.current}
                showCloseButton={true}
                width={500}
                height={400}
              >
                <div className="panelbox">
                  <div style={{  backgroundColor: "#fff",overflow:"auto" }}>
                    {tooltipContent?.imageUrl && (
                      <img
                        src={tooltipContent.imageUrl}
                        alt={tooltipContent.fileName || "Image"}
                        style={{ maxWidth: "200px", maxHeight: "200px", marginBottom: "8px" }}
                      />
                    )}
                    {isTable ? (
                      <div
                        style={{
                          overflowX: "auto",
                          maxWidth: "100%",
                          border: "1px solid #ccc",
                          padding: "8px",
                        }}
                        dangerouslySetInnerHTML={{ __html: tooltipContent?.content }}
                      />
                    ) : (
                      <p>{tooltipContent?.content || "No additional information"}</p>
                    )}
                    {tooltipContent?.fileName && (
                      <div>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault(); // Prevents navigation
                            handleClickOpenDialog(tooltipContent); // Opens the dialog with tooltip content
                          }}
                          style={{ color: "#1a73e8", textDecoration: "underline" }}
                        >
                          {tooltipContent?.fileName}
                        </a>
                      </div>

                    )}
                  </div>

                </div>
              </Popover>
            )}


           
          </span>
        );
      }

      // Render normal text
      return (
        <span
          key={idx}
          style={{
            display: "inline",
            lineHeight: "1.6",
            wordBreak: "break-word",
          }}
          dangerouslySetInnerHTML={{ __html: segment }}
        />
      );
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: "0 12px 12px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          alignItems: "center",
          padding: "0.5rem",
        }}
      >
        <div style={{ width: "100%", clear: "both", display: "table", marginBottom: "40px" }}>
          {messages?.map((message, index) => (
            <div
              key={index}
              style={{
                width: "100%",
                padding: "8px 0",
                display: "flex",
                justifyContent:
                  message?.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "97%",
                  marginBottom:'15px',
                  justifyContent:
                    message?.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {message?.role === "assistant" && (
                  <img
                    src="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAE7mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNS0wMS0xN1QxMjoyODoxNiswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMjUtMDEtMTdUMTI6MzI6MDUrMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjUtMDEtMTdUMTI6MzI6MDUrMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjIyMDllNWQzLWI2NzktNmU0Ni04OTNhLTNmZTFkZjRiMjliNCIgeG1wTU06RG9jdW1lbnRJRD0i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"
                    alt="Assistant Avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      marginRight: "8px",
                    }}
                  />
                )}
                <div
                  style={{
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      message?.role === "user" ? "flex-end" : "flex-start",
                    backgroundColor:
                      message?.role === "user" ? "#f0f0f0" : "#cfe9ff",
                    borderRadius: "8px",
                    maxWidth: "100%",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    marginLeft: message?.role === "assistant" ? "0" : "auto",
                    marginRight: message?.role === "user" ? "0" : "auto",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      margin: 0,
                      wordBreak: "break-word",
                      lineHeight: "1.6",
                    }}
                  >
                    {renderMessageContent(message?.content)}
                  </p>
                </div>
              </div>
              {message?.role === "user" && (
                <img
                  src="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAE7mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNS0wMS0xN1QxMjoyODoxNiswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMjUtMDEtMTdUMTI6MzI6MDUrMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjUtMDEtMTdUMTI6MzI6MDUrMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjIyMDllNWQzLWI2NzktNmU0Ni04OTNhLTNmZTFkZjRiMjliNCIgeG1wTU06RG9jdW1lbnRJRD0i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"
                  alt="User Avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    marginLeft: "8px",
                  }}
                />
              )}
            </div>
          ))}
          <div className="chatboxend" ref={messagesEndRef} />
          {msgLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "4px solid #ccc",
                  borderTop: "4px solid #007bff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span style={{ paddingLeft: "8px" }}>searching...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div style={{ position: "absolute", width: "97%", marginTop: "10px", bottom: "0", display: "flex", justifyContent: "space-between",height:"58px",paddingLeft:'20px',zIndex:'1',backgroundColor:'#fff'}}>
        {/* Input box */}
        <input
          type="text"
          placeholder="Type a Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          style={{
            width: "423px",
            fontSize: "16px",
            padding: "12px",
            borderRadius: "25px",
            paddingRight:"35px",
            border: "1px solid rgb(204, 204, 204)",
            outline: "none",
            position: "absolute",
            bottom: "0",
            marginBottom: "5px",
            zIndex:'0',
            boxSizing: "border-box",
            marginLeft:'-5px',
            
          }}
          id="Chat-input"
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={isSendDisabled}
          style={{
            position:"absolute",
            right:"27px",
            // top: "50%",
            transform:"translateY(-50%)",
            background:"none",
            border:"none",
            cursor:isSendDisabled ? "not-allowed" : "pointer",
            color: "#15426c",
            fontSize: "16px",
            bottom: "5px",
            float: "right",
          }}
          aria-label="Send message"
        >
          &#10148; {/* Unicode character for a send icon */}
        </button>
      </div>
      <Popup
        visible={openDialog} // Popup visibility based on the openDialog state
        onHidden={handleCloseDialog} // Close the popup when hidden
        title={selectedFile?.fileName} // Title of the popup is the file name
        width={1024} // Set width of the popup
        height={600} // Set height of the popup
        showTitle={true} // Show the popup title
        dragEnabled={true} // Make the popup draggable
        closeOnOutsideClick={true} // Close the popup when clicking outside
      >
        <div>
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            width="1000"
            onLoad={() => setIsIframeLoading(false)} // Hide loader when iframe loads
            style={isIframeLoading ? { visibility: "hidden" } : { visibility: "visible" }}
            height="600"
            title="File Preview"
          ></iframe>
        </div>
      </Popup>
    </div>
  );
};
