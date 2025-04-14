import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import App from "./App";
import "./style.css";

import { createRoot } from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css'

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);