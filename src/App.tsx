import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Blog } from "./pages/Blog";
import { DynamicPost } from "./pages/DynamicPost";
import { DynamicProject } from "./pages/DynamicProject";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";
import { Search } from "./pages/Search";
import { ThemeProvider } from "./hooks/ThemeContext";

function App() {
	return (
		<ThemeProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<MainLayout />}>
						<Route index element={<Home />} />
						<Route path="blog" element={<Blog />} />
						<Route path="blog/:slug" element={<DynamicPost />} />
						<Route path="projects" element={<Projects />} />
						<Route path="projects/:slug" element={<DynamicProject />} />
						<Route path="search" element={<Search />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
