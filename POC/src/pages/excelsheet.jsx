import React, { useState, useEffect,useRef } from "react";
import { useGlobalContext } from "../Context/GlobalContext";

const Excelsheet = () => {
    const { globalDataStore, setGlobalDataStore } = useGlobalContext();    
    const iframexcelref = useRef();
    return (
        <iframe id="iframexcel" ref={iframexcelref}
           src={process.env.REACT_APP_EXCELSHEET_URL+`/home/auth?token=${encodeURIComponent(globalDataStore.UserToken)}`}
          className="w-full h-full border-none"
          title="Excel Viewer"
          style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
        ></iframe>
    )
};

export default Excelsheet;