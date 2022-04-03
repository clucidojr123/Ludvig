import { Routes, Route } from "react-router-dom";
// import Home from "./components/Home";
// import Counter from "./components/Counter";
import Document from "./components/Document";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Document />} />
        {/* <Route path="counter" element={<Counter />} />
        <Route path="document" element={<Document />} /> */}
      </Routes>
    </div>
  );
}

export default App;
