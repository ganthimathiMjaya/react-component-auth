import List from "devextreme-react/list";
import "./OrdersMasterDetail.css";
import axios from "axios";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import DataGrid, {
    Scrolling, Summary, TotalItem, GroupItem, HeaderFilter, FilterRow,
} from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import Popup from 'devextreme-react/popup';
import 'devextreme/dist/css/dx.light.css';


const OrdersMasterDetail = ({ dataSource, keyExpr, token, BaseUrl, ProjectId, FlowBaseUrl }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rowDetailsVisible, setRowDetailsVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [searchText, setSearchText] = useState("");
    const searchTimeoutRef = useRef(null);
    const [gridStore, setGridStore] = useState(null);
    const [lastUploadTime, setLastUploadTime] = useState(null);
    const [columnMap, setColumnMap] = useState({});
    const gridRef = useRef(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [excludedKeys, setExcludedKeys] = useState([]);
    const requestVersionRef = useRef(0);
    const [columns, setColumns] = useState([]);
    const [gridInstance, setGridInstance] = useState(null);
    const [autoExpandAll, setAutoExpandAll] = useState(true);
    const metaRef = useRef(null);
    const [pendingSheet, setPendingSheet] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    useEffect(() => {
        if (!ProjectId) return;

        const fetchSheets = async () => {
            try {
                const { data } = await axios.get(
                    `${BaseUrl}api/LookupSheetMaster/GetLookupSheetHeaders/${ProjectId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const mapped = data.map(item => ({
                    id: item.ImportId,
                    sheetName: item.SheetName,
                    ProjectId: item.ProjectId,
                    modifiedOn: item.ModifiedOn
                }));

                setOrders(mapped);

                // ✅ Get latest upload time
                if (mapped.length) {
                    const latest = mapped.reduce((a, b) =>
                        new Date(a.modifiedOn) > new Date(b.modifiedOn) ? a : b
                    );
                    setLastUploadTime(latest.modifiedOn);
                }

            } catch (err) {
                console.error("Failed to load orders", err);
                setOrders([]);
            }
        };

        fetchSheets();

    }, [ProjectId, BaseUrl, token]);



    useEffect(() => {
        // reset only GRID-related state
        setSelectedOrder(null);
        setGridStore(null);
        setColumns([]);

        setSelectedRow(null);
        setRowDetailsVisible(false);
        setSearchText("");

        setSelectedRowKeys([]);
        setExcludedKeys([]);
        setSelectAll(false);

        gridInstance?.clearSelection();
        gridInstance?.searchByText("");
        gridInstance?.pageIndex(0);
    }, [ProjectId]);

    /**Temp hide Unwanted openLastViewedSheet **/
    // useEffect(() => {
    //     if (!orders) return;
    //     const openLastViewedSheet = async () => {
    //         try {
    //             const res = await axios.get(
    //                 `${BaseUrl}api/LookupSheetMaster/GetLastViewedSheet`,
    //                 {
    //                     params: {
    //                         userId: 1,
    //                         projectId: ProjectId
    //                     },
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                         "Content-Type": "application/json"
    //                     }
    //                 }
    //             );

    //             const lastViewedSheetId = res?.data;
    //             if (!lastViewedSheetId) return;

    //             const sheet = orders.find(o => o.id === lastViewedSheetId);

    //             if (!sheet) return;
    //             setSelectedOrder(sheet);
    //             await loadColumns(sheet.id, sheet.sheetName);

    //             setTimeout(() => {
    //                 setPendingSheetId(sheet.id);
    //             }, 0);

    //             setSearchText("");

    //         } catch (err) {
    //             console.error("Auto open failed", err);
    //         }
    //     };

    //     openLastViewedSheet();
    // }, [orders]);

    useEffect(() => {
        if (!gridInstance || !pendingSheet?.id || !pendingSheet?.name) return;

        const store = createStore(pendingSheet.id, pendingSheet.name);

        setGridStore(store);
        gridInstance.option("dataSource", store);
        gridInstance.refresh();

        setTimeout(() => {
            gridInstance.endCustomLoading();
        }, 300);

        gridInstance.pageIndex(0);
        gridInstance.clearSelection();
        gridInstance.searchByText("");

        setPendingSheet(null); // ✅ reset

    }, [gridInstance, pendingSheet]);

    const createStore = (sheetId, sheetName) =>
        new CustomStore({
            key: "RowId",
            load: async (loadOptions) => {
                const requestId = ++requestVersionRef.current;

                loadOptions.requireTotalCount = true;


                const response = await fetch(
                    `${BaseUrl}api/LookupSheetMaster/GetLookupExcelData/${sheetId}?projectId=${ProjectId}&sheetName=${sheetName}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(loadOptions)
                    }
                );
                const result = await response.json();
                setTotalCount(result.totalCount ?? 0);
                if (requestId !== requestVersionRef.current) {
                    return { data: [], totalCount: 0 };
                }


                return {
                    data: result.data ?? [],
                    totalCount: result.totalCount ?? 0
                };
            }
        });

    const handleSearchChange = useCallback((value) => {
        setSearchText(value || "");

        if (!gridInstance) return;

        clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            const text = value?.trim();

            if (text?.length >= 3) {
                gridInstance.searchByText(text);
            } else if (!text) {
                gridInstance.searchByText("");
            }
        }, 400);
    }, [gridInstance]);

    const loadColumns = async (sheetId, sheetName) => {
        try {
            // 1️⃣ Get column metadata
            const res = await fetch(
                `${FlowBaseUrl}DataModel/GetDataModelDetailsAsync/2/${ProjectId}?dataModelTableId=19`
            );
            const result = await res.json();
            const meta = result.data;

            // ✅ 👉 ADD IT HERE
            const columnMapObj = meta
                .filter(col =>
                    col.fieldName.startsWith("DynTxtCol") ||
                    col.fieldName.startsWith("DynTxtStr")
                )
                // .filter(col => col.fieldName.startsWith("DynTxtCol"))
                .reduce((acc, col) => {
                    acc[col.fieldName] = col.displayName;
                    return acc;
                }, {});

            setColumnMap(columnMapObj);

            // 2️⃣ Get sample data (VERY IMPORTANT 🔥)
            const dataRes = await fetch(
                `${BaseUrl}api/LookupSheetMaster/GetLookupExcelData/${sheetId}?projectId=${ProjectId}&sheetName=${sheetName}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        skip: 0,
                        take: 50 // 👈 only small sample needed
                    })
                }
            );

            const dataResult = await dataRes.json();
            const rows = dataResult.data || [];

            // 3️⃣ Base column
            const flowTaskColumn = {
                dataField: "RowId",
                caption: "Sheet Row",
                dataType: "number",
                alignment: "left"
            };

            // 4️⃣ Filter ONLY columns that have data 🔥
            const metaColumns = meta
                .filter(col =>
                    col.fieldName.startsWith("DynTxtCol") ||
                    col.fieldName.startsWith("DynTxtStr")
                )
                // .filter(col => col.fieldName.startsWith("DynTxtCol"))
                .filter(col => {
                    return rows.some(row => {
                        const value = row[col.fieldName];
                        return value !== null && value !== undefined && value !== "";
                    });
                })
                .map(col => ({
                    dataField: col.fieldName,
                    caption: col.displayName,
                    dataType: "string",
                    allowFiltering: true,
                    allowGrouping: true,
                    headerFilter: {
                        visible: true,
                        search: { enabled: true }
                    }
                }));

            setColumns([flowTaskColumn, ...metaColumns]);

        } catch (err) {
            console.error("Failed to load columns", err);
            setColumns([]);
        }
    };


    const updateHeaderCheckboxState = (gridInstance, selectAll, excludedKeys, selectedRowKeys) => {
        if (!gridInstance) return;

        const visibleRowKeys = gridInstance.getVisibleRows().map(row => row.key).filter(Boolean);

        const selectedVisible = visibleRowKeys.filter(key =>
            selectAll ? !excludedKeys.includes(key) : selectedRowKeys.includes(key)
        );

        const allVisibleSelected = selectedVisible.length === visibleRowKeys.length;
        const noneVisibleSelected = selectedVisible.length === 0;

        const isTrulyAllSelected = selectAll && excludedKeys.length === 0;
        const isPartiallySelected = selectAll && excludedKeys.length > 0;
        const isManualSomeSelected = !selectAll && selectedRowKeys.length > 0;

        const headerCheckbox = gridInstance.element().querySelector('.dx-header-row .dx-checkbox');
        if (!headerCheckbox) return;

        headerCheckbox.classList.remove("dx-checkbox-checked", "dx-checkbox-indeterminate");

        if (isTrulyAllSelected) {
            headerCheckbox.classList.add("dx-checkbox-checked");
        } else if (isPartiallySelected || (isManualSomeSelected && !allVisibleSelected)) {
            headerCheckbox.classList.add("dx-checkbox-indeterminate");
        } else if (isManualSomeSelected && allVisibleSelected) {
            headerCheckbox.classList.add("dx-checkbox-checked");
        }
    };

    useEffect(() => {
        if (!gridInstance) return;

        setTimeout(() => {
            updateHeaderCheckboxState(gridInstance, selectAll, excludedKeys, selectedRowKeys);
        }, 0);
    }, [selectAll, excludedKeys, selectedRowKeys, gridInstance]);

    const formatRawFilterToReadableText = (filter) => {
        if (!filter) return '';

        if (Array.isArray(filter[0])) {
            // Composite condition like: [ [cond1], 'and', [cond2] ]
            return formatRawFilterToReadableText(filter[0]) + ` ${filter[1].toUpperCase()} ` + formatRawFilterToReadableText(filter[2]);
        }

        if (typeof filter[0] === 'string') {
            const [field, op, value] = filter;
            return `• ${field} ${op} "${value}"`;
        }

        return '';
    };




    // ✅ SAVE LAST VIEWED SHEET (SEPARATE FUNCTION)
    // const saveLastViewedSheet = async (sheet) => {
    //     try {
    //         await axios.post(
    //             `${BaseUrl}api/LookupSheetMaster/UpdateLastViewedSheet`,
    //             {
    //                 userId: 1,               // replace with logged-in user id later
    //                 projectId: ProjectId,
    //                 sheetId: sheet.id
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     "Content-Type": "application/json"
    //                 }
    //             }
    //         );
    //     } catch (error) {
    //         console.error("Failed to save last viewed sheet", error);
    //     }
    // };


    const applySearch = () => {
        if (!gridInstance) return;

        gridInstance.searchByText(searchText);
    };

    const truncate = useCallback((text, max = 30) =>
        text?.length > max ? text.slice(0, max) + "..." : text,
        []);


    const formatLabel = (key) => {
        if (!key) return "";

        return key
            .replace(/_/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const resetGrid = useCallback(() => {
        if (!gridInstance) return;

        gridInstance.clearSelection();
        gridInstance.searchByText("");
        gridInstance.pageIndex(0);

        setSelectedRow(null);
        setRowDetailsVisible(false);
        setSelectedRowKeys([]);
        setExcludedKeys([]);
        setSelectAll(false);
    }, [gridInstance]);

    useEffect(() => {
        resetGrid();
        setColumns([]);
    }, [ProjectId]);

    const handleItemClick = async (sheet) => {
        requestVersionRef.current++;

        if (gridInstance) {
            gridInstance.option("dataSource", []);
            gridInstance.beginCustomLoading("Loading...");
        }

        setSelectedOrder(sheet);
        setLastUploadTime(sheet.modifiedOn);

        resetGrid(); // ✅ move BEFORE loading

        await loadColumns(sheet.id, sheet.sheetName);

        setPendingSheet({
            id: sheet.id,
            name: sheet.sheetName
        });
    };

    const getColumnCaption = (field) => {
        return columnMap[field] || formatLabel(field);
    };

    const formatUploadTime = (iso) => {
        if (!iso) return "No uploads yet";

        const date = new Date(iso); // 👈 THIS is the fix

        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        }).format(date);
    };



    return (
        <div className="arcflow-lookupscreen">
            <div className="lookupscreen-container">
                {/* LEFT PANEL (NO SEARCH) */}
                <div className="lookupscreen-left">
                    <h3 className="lookupscreenpanel-title">Service List</h3>
                    <List
                        dataSource={orders}
                        keyExpr="id"
                        selectionMode="single"
                        selectedItem={selectedOrder}
                        onItemClick={(e) => handleItemClick(e.itemData)}
                        itemRender={(item) => (
                            <div
                                className={`lookupscreen-item ${item.id === selectedOrder?.id ? "active" : ""
                                    }`}
                            >
                                <div className="lookupscreen-id">
                                    {truncate(item.sheetName, 25)}
                                </div>
                            </div>
                        )}
                    />


                </div>

                {/* RIGHT PANEL (SEARCH + HISTORY) */}
                <div className="lookupscreen-right">
                    {orders.length === 0 ? (
                        <div className="lookupscreen-empty-state">
                            <h3>No services available</h3>
                            <p>
                                There are no services configured for this project.
                                <br />
                                Please contact the administrator or add a new service.
                            </p>
                        </div>
                    )

                        /* 2️⃣ Services exist, but none selected */
                        : !selectedOrder ? (
                            <div className="lookupscreen-empty-state">
                                <div className="empty-icon">📄</div>
                                <h3>No service selected</h3>
                                <p>Please select a service from the left panel to view sheet details.</p>
                            </div>
                        )

                            /* 3️⃣ Service selected */
                            : (<div className="lookupscreenexcel-card">
                                {/* Header */}
                                <div className="lookupscreenexcel-header">
                                    <h2>Sheet Name: {selectedOrder.sheetName}</h2>
                                    <div className="upload-time">
                                        🕒 Last uploaded: <strong>{formatUploadTime(lastUploadTime)}</strong>
                                    </div>
                                </div>

                                <div className="lookupscreensearchbox">
                                    <div className="lookupscreensearch">

                                        {/* SEARCH TEXT */}
                                        <div className="lookupscreenlevellist first">
                                            <label>What are you looking for?</label>
                                            <input
                                                type="text"
                                                className="lookupscreen-searchcontrol"
                                                placeholder="Search here..."
                                                value={searchText}
                                                onChange={(e) => {
                                                    setSearchText(e.target.value)
                                                    handleSearchChange(e.target.value)
                                                }}
                                            />

                                        </div>



                                        {/* SEARCH BUTTON */}
                                        <div className="lookupscreenlevellist action" onClick={applySearch}>
                                            <button className="lookupscreenbutton">SEARCH</button>

                                        </div>

                                    </div>
                                </div>
                                {/* <div className="arcflow-lookupscreen-popup "> */}
                                <DataGrid
                                    ref={gridRef}
                                    dataSource={gridStore}
                                    keyExpr={keyExpr}
                                    onInitialized={(e) => setGridInstance(e.component)}
                                    remoteOperations={true}
                                    height="70%"
                                    width="100%"
                                    columnAutoWidth={false}
                                    allowColumnResizing={true}
                                    showBorders={true}
                                    allowColumnReordering={true}
                                    onColumnReordered={(e) => {

                                    }}
                                    // onColumnReordered={handleColumnReorder}
                                    columnHidingEnabled={false}
                                    repaintChangesOnly={true}
                                    columns={columns}
                                    onOptionChanged={(e) => {
                                        if (e.name === "grouping" && e.fullName === "grouping.groupedColumns") { if (Array.isArray(e.value) && e.value.length > 0) { setAutoExpandAll(false); gridInstance?.collapseAll(-1); } else { setAutoExpandAll(true); } }

                                    }}
                                    onRowClick={(e) => {
                                        if (e.rowType !== "data") return;

                                        setSelectedRow(e.data);
                                        setRowDetailsVisible(true);
                                    }}

                                >
                                    <FilterRow visible={true} />
                                    <HeaderFilter visible={true} />

                                    <Scrolling mode="virtual" useNative={false} />
                                    <Summary>
                                        <TotalItem
                                            summaryType="count"
                                            displayFormat="Total Rows: {0}"
                                        />
                                    </Summary>


                                </DataGrid>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        marginTop: "10px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    Total Rows: {totalCount}
                                </div>
                                {/* </div> */}

                                {selectedRow && (
                                    <Popup
                                        visible={rowDetailsVisible}
                                        onHiding={() => setRowDetailsVisible(false)}
                                        showTitle
                                        title={`Row Details`}
                                        dragEnabled={false}
                                        closeOnOutsideClick
                                        showCloseButton
                                        width={420}
                                        height="100%"
                                        position={{
                                            my: "right top",
                                            at: "right top",
                                            of: window,
                                        }}
                                        wrapperAttr={{ class: "lookupscreenright-side-popup" }}
                                    >
                                        <div className="lookupscreenpopup-content">
                                            {Object.entries(selectedRow)
                                                .filter(([key]) =>
                                                    key === "RowId" || columns.some(col => col.dataField === key)
                                                )
                                                .map(([key, value]) => (
                                                    <div className="form-group" key={key}>
                                                        <label>{getColumnCaption(key)}</label>
                                                        <input
                                                            type="text"
                                                            value={value ?? ""}
                                                            readOnly
                                                        />
                                                    </div>
                                                ))}
                                        </div>
                                    </Popup>
                                )}
                            </div>
                            )}
                </div>
            </div>
        </div >
    );
};

export default OrdersMasterDetail;
