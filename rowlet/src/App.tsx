import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Document from "./components/Document";
import Register from "./components/Register";
import Login from "./components/Login";
import Verify from "./components/Verify";
import AllDocuments from "./components/AllDocuments";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doc" element={<Document />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/all-docs" element={<AllDocuments />} />
      </Routes>
    </div>
  );
}

export default App;
