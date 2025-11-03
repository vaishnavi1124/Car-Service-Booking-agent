


// // frontend/src/App.tsx
// import Home from "./components/Home";
// import "./index.css"; // make sure Tailwind/global styles are imported

// function App() {
//   return (
//     <div className="min-h-screen flex flex-col font-sans antialiased">
//       <Home />
//     </div>
//   );
// }

// export default App;




// frontend/src/App.tsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Admin from "./components/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}