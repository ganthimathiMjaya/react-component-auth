import React, { useState, useEffect } from "react";
import { SelectBox, TextBox, CheckBox, Button } from "devextreme-react";
import { useDispatch } from "react-redux";
import actions from "../redux/actions/actions";
import { useNavigate } from "react-router-dom";

const OverlayForm = ({
  GetAppRepositoryByAppId,
  setIsOverlayPageOpen,
  mode,
  repoDetails,
  setSnackbar,
  refreshData,
}) => {
  const [isParentPage, setIsParentPage] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [newRepo, setNewRepo] = useState({
    appId: repoDetails?.AppId ?? '35fb0de3-0f90-4acd-8994-63766ec99c6c',
    orgId: '9ba8241f-ab2c-4c1b-98be-81a97b165f00',
    Name: repoDetails?.Name ?? "",
    routeURL: repoDetails?.RouteURL ?? "",
    repositoryId: repoDetails?.RespositoryId ?? "",
    uniqueId: repoDetails?.UniqueId ?? "",
    parentId: repoDetails?.ParentId ?? "",
    priorityId: 0,
    componentType: repoDetails?.ComponentType ?? "Pages",
    repoConfig: repoDetails?.RepoConfig ?? "",
    icon: {
      fileCaption: "work_queue_white.png",
      fileId: "",
      fileByte: "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAA2NJREFUeF7tnDFuFTEQhue/B0hwBmiQ4AiUUICIoAEKRIFooIFU0CAKRBFogEggQckRQKKBMxCJ3MNkw654eYT33uyMPev1v00a2zP7fzNj+2VtCJ9QBRBqncaFAIKDgADmBCCldFNEzovIBRE5Ffxu3ub3ROSLiHwF8MprcLcMSCl9F5EzXo5NfJwfAM56+OgCIKX0UUQueThU0RifAFy2+msGkFK6JiLvrI5U2n8LwK7Fdw8ALUb/oLk5CzwA/BKRE5YoqLjvPoCTFv89ACSLA7X3BWDS0NS5Ey+lRACGKMoOwBohy++2Dnht9ghgTfTmBk4ABKAroLkjsnTJYwYwA5gBOgWWWs+tJLAEBZcEAiAAXUViCZr4TxG17UxZgliCfEuQbrT6WlszPPtGrD5JdR4TgE4v99YE4C6pbkAC0Onl3poA3CXVDUgAOr3cWxOAu6S6AScPwOpg6Z1paXvZ9wEEsDqjCCD4pw8CIADdpDe3n7+ZAcwAZoBOgaXWcysJXIYGlwQCIABdRWIJ4j/lj0RMbTvv7MtQXT7V19oKnACMzKcA4OcMT8VvimUPwOlNGx/XziMDujPC3VnhFp9dAFuWF/cA0N0PsWNxouK+t6z3RpgBdOI1dk/EEC8u90W4AOghtHRi3nxCfqDoBqCH0M0FF0Xk3AxPz++LyLeDG2E+W++HWCy5rgAqruVhrhNAmPR/DBMAAQQrEGy+aAYc3Ovx+DDtgMO/fAqWoF78R73o24RQcA5YEn8IfEIoMQn/R3xC6BXIOgesEZ8QcmbAhuI3DyFLBijFfwLgYasrIncASvGfAbjfqvjuO2Gl+C8A3G1ZfFcASvF3ANxuXXw3AErx3wC4QfGdNmJK8d8DuErx/ypgmoSV4s9S97DPUih+X0Iiri6m+AslpDQAin+0khYvQQQQDKAzTwiBJWgwTQiBkzAhTCADRkL4AODKLDcEI1/KtBEbCeEtgOsj/Z1dNxcAIybm1wC6r6qbf9wAjIDwEsCd1gm4AhgB4TmAey1DcAcwAsJTAA9ahZAFwAgIzX4jlA2AAkKz4ncaZQWwAYSmxS8CYAWE5sUvBuAYCBS/X3VkL0GLqxt+nv7vWq8ogFaXmqvemwCCo4IACCBYgWDzzAACCFYg2DwzgACCFQg2/xsomiZ/EXOLWwAAAABJRU5ErkJggg==",
      remarks: ""
    }
  });

  const componentTypes = [
    { value: "", label: "Select Component Type" },
    { value: "Pages", label: "Page" },
    { value: "Components", label: "Components" },
    { value: "Workflow", label: "Workflow" },
    { value: "Rules", label: "Rules" },
  ];

  const closeOverlayPage = () => {
    setIsOverlayPageOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRepo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    console.log(e.value);
    setIsParentPage(e.value);  // Update the state based on checkbox value
  };

  const dispatch = useDispatch();

  const validateFields = () => {
    console.log("newrepo", newRepo);
    const newErrors = {};
    if (!newRepo.Name.trim()) {
      const lblName = getRepositoryNameLabel();
      newErrors.Name = lblName + " is required.";
    }
    if (newRepo.componentType === "Pages" && !newRepo.routeURL.trim()) {
      newErrors.routeURL = "Route URL is required for Pages.";
    }
    if (newRepo.componentType !== "Pages" && !newRepo.uniqueId.trim()) {
      newErrors.uniqueId = "Unique ID is required.";
    }
    // if (isParentPage && newRepo.parentId === "") {
    //   newErrors.parentId = "Parent Page selection is required.";
    // }

    // if (newRepo.componentType === "Components" && newRepo.parentId === "") {
    //   newErrors.parentId = "Parent Page must be selected for Components.";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRepository = async () => {
    try {
      const response = await dispatch(actions.CREATE_APP_REPOSITORY(newRepo));
      if (!response?.payload?.error) {
        refreshData();
        setSnackbar({
          open: true,
          message: "Created Successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error in creating repository",
        severity: "error",
      });
      console.error("Error in creating repository:", error);
    }
  };

  const handleUpdateRepository = async () => {
    console.log("test1232", newRepo);
    try {
      const updatedRepo = {
        ...newRepo,
        repositoryId: repoDetails?.RespositoryId,
      };
      const response = await dispatch(
        actions.UPDATE_APP_REPOSITORY(updatedRepo)
      );
      if (!response?.payload?.error) {
        refreshData();
        setSnackbar({
          open: true,
          message: "Updated Successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error in updating repository:", error);
      setSnackbar({
        open: true,
        message: "Error in updating repository",
        severity: "error",
      });
    }
  };

  const handleSave = () => {
    if (!validateFields()) return;
    if (mode === "Edit") {
      handleUpdateRepository();
    } else {
      handleCreateRepository();
    }
    closeOverlayPage();
  };

  useEffect(() => {
    if (newRepo.componentType === "Pages") {
      setNewRepo((prevState) => ({
        ...prevState,
        routeURL: repoDetails?.RouteURL ?? "",
      }));
    } else {
      setNewRepo((prevState) => ({
        ...prevState,
        uniqueId: repoDetails?.UniqueId ?? "",
      }));
    }
    if (repoDetails?.ParentId !== "" && mode === "Edit") {
      setIsParentPage(true);
    } else if (newRepo.componentType === "Components") {
      setIsParentPage(true);
    } else {
      setIsParentPage(false);
    }
  }, [newRepo.componentType, repoDetails?.ParentId]);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Fetch and filter options based on componentType
    const fetchOptions = () => {
      let filteredOptions = [];
      if (newRepo.componentType === "Pages" || newRepo.componentType === "Components") {
        filteredOptions = GetAppRepositoryByAppId?.Data?.filter(
          (item) => item.Name !== "" && item.ComponentType === "Pages"
        );
      } else if (newRepo.componentType === "Workflow") {
        filteredOptions = GetAppRepositoryByAppId?.Data?.filter(
          (item) => item.Name !== "" && item.ComponentType === "Workflow"
        );
      } else {
        filteredOptions = GetAppRepositoryByAppId?.Data?.filter(
          (item) => item.Name !== "" && item.ComponentType === "Rules"
        );
      }
      setOptions(filteredOptions);
    };

    fetchOptions();
  }, [newRepo.componentType]);

  const getRepositoryNameLabel = () => {
    switch (newRepo.componentType) {
      case "Pages":
        return "Page Name";
      case "Components":
        return "Component Name";
      case "Workflow":
        return "Workflow Name";
      case "Rules":
        return "Rule Set Name";
      default:
        return "Repository Name";
    }
  };

  const getUniqueIdLabel = () => {
    switch (newRepo.componentType) {
      case "Page":
        return "Page Unique ID";
      case "Components":
        return "Component Unique ID";
      case "Workflow":
        return "Workflow Unique ID";
      case "Rules":
        return "Rule Set Unique ID";
      default:
        return "Unique ID";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
      }}
    >
      <div
        className="addnewRespostory"

      >
        <div
          className="respositry_header"
        >
          <h2 style={{ fontSize: "16px", margin: 0 }}>
            {mode === "Edit" ? "Edit Repository" : "Add New Repository"}
          </h2>
          <button
            onClick={closeOverlayPage}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <i className="dx-icon dx-icon-close" style={{ fontSize: "20px" }}></i>
          </button>
        </div>
        <form className="Respositoryformfield">
          <SelectBox
            items={componentTypes}
            displayExpr="label"
            valueExpr="value"
            value={newRepo.componentType}
            onValueChanged={(e) => setNewRepo({ ...newRepo, componentType: e.value })}
            placeholder="Select Component Type"
          />
          {/* <Autocomplete
            options={componentTypes}
            getOptionLabel={(option) => option.label || ""}
            value={
              componentTypes.find(
                (type) => type.value === newRepo.componentType
              ) || null
            }
            onChange={(event, newValue) => {
              if (newValue) {
                setNewRepo((prevState) => ({
                  ...prevState,
                  componentType: newValue.value,
                }));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Component Type"
                margin="normal"
                size="small"
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "14px",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "14px",
                  },
                }}
              />
            )}
            fullWidth
            sx={{
              marginBottom: 1,
              "& .MuiAutocomplete-inputRoot": {
                fontSize: "14px",
              },
            }}
          /> */}

          <TextBox
            style={{ marginTop: '3%' }}
            value={newRepo.Name}
            onValueChanged={(e) => handleChange({ target: { name: "Name", value: e.value } })}
            placeholder={getRepositoryNameLabel()}
            validationMessageMode="always"
            isValid={!errors.Name}
            stylingMode="outlined"
            width="100%"
            label={getRepositoryNameLabel()}
            labelMode="floating"
          />
          {errors.Name && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.Name}
            </div>
          )}
          {newRepo.componentType === "Pages" && (
            <>
              <div className="routeurlbox">

                {/* <div>
                  <label>Upload</label>
                  <TextBox
                    placeholder="Upload"
                    labelMode="floating"
                    stylingMode="outlined"
                    width="100%"

                  />

                </div> */}

                <TextBox
                  value={newRepo.routeURL}
                  onValueChanged={(e) => handleChange({ target: { name: "routeURL", value: e.value } })}
                  placeholder="Route URL"
                  label="Route URL"
                  labelMode="floating"
                  stylingMode="outlined"
                  width="100%"
                  validationMessageMode="always"
                  isValid={!errors.routeURL}
                />

                {/* <div>
                  <label>Upload</label>
                  <TextBox
                    placeholder="Upload"
                    labelMode="floating"
                    stylingMode="outlined"
                    width="100%"

                  />

                </div> */}
              </div>
              {errors.routeURL && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {errors.routeURL}
                </div>
              )}
            </>
          )}


          {newRepo.componentType !== "Pages" && (
            <>
              <TextBox
                value={newRepo.uniqueId}
                onValueChanged={(e) => handleChange({ target: { name: "uniqueId", value: e.value } })}
                placeholder={getUniqueIdLabel()}
                label={getUniqueIdLabel()}
                labelMode="floating"
                stylingMode="outlined"
                width="100%"
                validationMessageMode="always"
                isValid={!errors.uniqueId}
              />
              {errors.uniqueId && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {errors.uniqueId}
                </div>
              )}
            </>
          )}

          <div className="setparentcontrol">
            <CheckBox
              value={isParentPage}  // Bind the checkbox state to `isParentPage`
              onValueChanged={(e) => handleCheckboxChange(e)}  // Handle the state change
              text="Set Parent Page"
              stylingMode="outlined"
              width="auto"
              size={20}  // Size of the checkbox icon
              labelMode="outside"  // To place the label outside the checkbox
              labelStyle={{ fontSize: '14px' }}
            />
          </div>
          {isParentPage && (
            <SelectBox
              dataSource={options}  // Set filtered options as the data source
              displayExpr="Name"  // Show the Name field in the dropdown
              valueExpr="RespositoryId"  // Set the unique identifier for value
              value={newRepo.parentId}  // Bind to the parentId from the state
              onValueChanged={(e) => {
                setNewRepo((prevState) => ({
                  ...prevState,
                  parentId: e.value,  // Update parentId based on selected value
                }));
              }}
              placeholder="Select Parent Page"  // Placeholder text
              invalid={!!errors.parentId}  // Show error if there's an issue
              showClearButton={true}  // Option to clear the selected value
              stylingMode="outlined"  // Styling mode for SelectBox
              width="100%"  // Full width
            />
          )}
          {/* {isParentPage && (
            <Autocomplete
              options={
                newRepo.componentType === "Pages" ||
                  newRepo.componentType === "Components"
                  ? GetAppRepositoryByAppId?.Data?.filter(
                    (item) =>
                      item.Name !== "" && item.ComponentType === "Pages"
                  )
                  : newRepo.componentType === "Workflow"
                    ? GetAppRepositoryByAppId?.Data?.filter(
                      (item) =>
                        item.Name !== "" && item.ComponentType === "Workflow"
                    )
                    : GetAppRepositoryByAppId?.Data?.filter(
                      (item) =>
                        item.Name !== "" && item.ComponentType === "Rules"
                    )
              }
              getOptionLabel={(option) => option?.Name || ""}
              value={
                GetAppRepositoryByAppId?.Data?.find(
                  (item) => item.Id === newRepo.parentId
                ) || null
              }
              onChange={(event, newValue) => {
                setNewRepo((prevState) => ({
                  ...prevState,
                  parentId: newValue?.RepositoryId || "",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Parent Page"
                  margin="normal"
                  error={!!errors.parentId}
                  helperText={errors.parentId}
                  size="small"
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "14px",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "14px",
                    },
                  }}
                />
              )}
              fullWidth
              sx={{
                marginBottom: 1,
                "& .MuiAutocomplete-inputRoot": {
                  fontSize: "14px",
                },
              }}
            />
          )} */}

        </form>
        <div className="respositry_footer">
          <button
            className="dx-button dx-button-contained dx-button-primary add-user-button"
            style={{
              fontSize: "14px",
              textAlign: "center !important"
            }}
            onClick={handleSave}
          >
            {mode === "Edit" ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverlayForm;