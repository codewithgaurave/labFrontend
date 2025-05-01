import React from "react";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrintReport from "./components/PrintReport";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/print-report" element={<PrintReport />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
