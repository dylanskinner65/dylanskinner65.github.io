import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { ThemeProvider } from "./hooks/ThemeContext";
import { Blog } from "./pages/Blog";
import { DynamicPost } from "./pages/DynamicPost";
import { DynamicProject } from "./pages/DynamicProject";
import { Home } from "./pages/Home";
import { NhlPredictor } from "./pages/NhlPredictor";
import { Projects } from "./pages/Projects";
import { Search } from "./pages/Search";

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
						<Route path="live-nhl" element={<NhlPredictor />} />
						<Route path="search" element={<Search />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
