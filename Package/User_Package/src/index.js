import React, {useState, useEffect} from 'react';
import Users from './Pages/Users';
import { Provider } from 'react-redux';
import store from './redux/store';
import './App.css';
import axios from "axios";

function App() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const fetchToken = async () => {
    const data = JSON.stringify({
      userId: "gayathri.muruge@accesshealthcare.com",
      password: "23",
      appKey: 'f1810de6-0fa1-4d07-a3f1-90e5dc192e0e',
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url:"https://iamapi.accesshealthcare.co/api/IAM/GenerateUserAccessToken",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      const accessToken = response.data?.Data?.Token; 
      if (accessToken) {
        setToken(accessToken);
        sessionStorage.setItem("accessToken", accessToken); 
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching token:", err);
      setError(err.message);
    }
  };

  const getQueryParamsFromHash = (param) => {
    const hash = window.location.hash; // Get the hash part of the URL
    const queryString = hash.split("?")[1]; // Extract the query string after `?`
    if (!queryString) return null; // Return null if no query string exists
    const params = new URLSearchParams(queryString);
    return params.get(param);
  };
  useEffect(() => {
    
    fetchToken();
    const interval = setInterval(() => {
      fetchToken();
    }, 300000); 

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const sidebarParam = getQueryParamsFromHash("sidebar");
    const showSidebarstatus = sidebarParam === null || sidebarParam === "true";

    setShowSidebar(showSidebarstatus);
  },[showSidebar, setShowSidebar])
  return (
    <Provider store={store}>
      <div className="app-container">
        <div className="content-container">
      
          <div className="content">
            <Users />
          </div>
        </div>
      </div>
    </Provider>
  );
}

export default App;
