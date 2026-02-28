import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./pages/Home";
import { Blog } from "./pages/Blog";
import { Projects } from "./pages/Projects";
import { DynamicPost } from "./pages/DynamicPost";
import { DynamicProject } from "./pages/DynamicProject";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<DynamicPost />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<DynamicProject />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
