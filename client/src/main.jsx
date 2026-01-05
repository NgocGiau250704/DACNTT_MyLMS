// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'
// import { Provider } from 'react-redux'
// // import tailwind from './index.css'
// import App from './App.jsx'
// import appStore from './app/store.js'
// import { Toaster } from 'sonner'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       <Provider store={appStore}>
//         <App />
//         <Toaster/>
//       </Provider>
//     </BrowserRouter>
//   </StrictMode>,
// )
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import "./index.css";
import appStore from "./app/store";
import { BrowserRouter } from "react-router-dom";
import { useLoadUserQuery } from "./features/api/authApi";

const Custom = ({ children }) => {
  const { isLoading } = useLoadUserQuery();
  return isLoading ? <div>Loading...</div> : <>{children}</>;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={appStore}>
      <Custom>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Custom>
    </Provider>
  </React.StrictMode>
);
