import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Network from "./pages/Network";
import Events from "./pages/Events";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/network" element={<Network />} />
        <Route path="/events" element={<Events />} />
      </Route>
    </Routes>
  );
}
