import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Document from "./components/Document";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
// import Verify from "./components/Verify";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        {/* <Route path="/verify" element={<Verify />} /> */}
        <Route path="/doc/edit/:docID" element={<Document />} />
      </Routes>
    </div>
  );
}

export default App;
