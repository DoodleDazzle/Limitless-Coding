import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import "./firebase/config" // Import Firebase config to initialize it

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

