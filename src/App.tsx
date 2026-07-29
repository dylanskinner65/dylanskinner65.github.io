import { MotionConfig } from "framer-motion";
import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { ThemeProvider } from "./hooks/ThemeContext";

const Home = lazy(() =>
	import("./pages/Home").then((m) => ({ default: m.Home })),
);
const Blog = lazy(() =>
	import("./pages/Blog").then((m) => ({ default: m.Blog })),
);
const DynamicPost = lazy(() =>
	import("./pages/DynamicPost").then((m) => ({ default: m.DynamicPost })),
);
const Projects = lazy(() =>
	import("./pages/Projects").then((m) => ({ default: m.Projects })),
);
const DynamicProject = lazy(() =>
	import("./pages/DynamicProject").then((m) => ({ default: m.DynamicProject })),
);
const Talks = lazy(() =>
	import("./pages/Talks").then((m) => ({ default: m.Talks })),
);
const DynamicTalk = lazy(() =>
	import("./pages/DynamicTalk").then((m) => ({ default: m.DynamicTalk })),
);
const NhlPredictor = lazy(() =>
	import("./pages/NhlPredictor").then((m) => ({ default: m.NhlPredictor })),
);
const Search = lazy(() =>
	import("./pages/Search").then((m) => ({ default: m.Search })),
);

function App() {
	return (
		<MotionConfig reducedMotion="user">
			<ThemeProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<MainLayout />}>
							<Route index element={<Home />} />
							<Route path="blog" element={<Blog />} />
							<Route path="blog/:slug" element={<DynamicPost />} />
							<Route path="projects" element={<Projects />} />
							<Route path="projects/:slug" element={<DynamicProject />} />
							<Route path="talks" element={<Talks />} />
							<Route path="talks/:slug" element={<DynamicTalk />} />
							<Route path="live-nhl" element={<NhlPredictor />} />
							<Route path="search" element={<Search />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</ThemeProvider>
		</MotionConfig>
	);
}

export default App;
