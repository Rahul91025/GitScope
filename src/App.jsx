import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Info from "./pages/Info";
import RepoDetail from "./components/RepoDetail";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/summary/:username" element={<Info />} />
      <Route path="/summary/:username/repo/:reponame" element={<RepoDetail />} />
    </Routes>
  </Router>
);

export default App;
