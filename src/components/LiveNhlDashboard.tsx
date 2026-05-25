import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	AlertTriangle,
	Clock,
	MapPin,
	RefreshCw,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

const TEAM_COLORS: Record<string, { main: string; secondary: string }> = {
	"Anaheim Ducks": { main: "#FF8C00", secondary: "#000000" },
	"Arizona Coyotes": { main: "#8C2633", secondary: "#E2D6B5" },
	"Boston Bruins": { main: "#FFB81C", secondary: "#000000" },
	"Buffalo Sabres": { main: "#00539b", secondary: "#FCB514" },
	"Calgary Flames": { main: "#C8102E", secondary: "#F1BE48" },
	"Carolina Hurricanes": { main: "#CC0000", secondary: "#8E8E90" },
	"Chicago Blackhawks": { main: "#CF0A2C", secondary: "#000000" },
	"Colorado Avalanche": { main: "#6F263D", secondary: "#236192" },
	"Columbus Blue Jackets": { main: "#002654", secondary: "#CE1126" },
	"Dallas Stars": { main: "#006847", secondary: "#8F8F8C" },
	"Detroit Red Wings": { main: "#CE1126", secondary: "#FFFFFF" },
	"Edmonton Oilers": { main: "#FF4C00", secondary: "#041E42" },
	"Florida Panthers": { main: "#C8102E", secondary: "#041E42" },
	"Los Angeles Kings": { main: "#A2AAAD", secondary: "#111111" },
	"Minnesota Wild": { main: "#154734", secondary: "#A6192E" },
	"Montreal Canadiens": { main: "#AF1E2D", secondary: "#192168" },
	"Nashville Predators": { main: "#FFB81C", secondary: "#041E42" },
	"New Jersey Devils": { main: "#CE1126", secondary: "#000000" },
	"New York Islanders": { main: "#00539B", secondary: "#F47D30" },
	"New York Rangers": { main: "#0038A8", secondary: "#CE1126" },
	"Ottawa Senators": { main: "#E31837", secondary: "#C69214" },
	"Philadelphia Flyers": { main: "#F74902", secondary: "#000000" },
	"Pittsburgh Penguins": { main: "#FCB514", secondary: "#000000" },
	"San Jose Sharks": { main: "#006D75", secondary: "#EA7200" },
	"Seattle Kraken": { main: "#35a4b8", secondary: "#001628" },
	"St. Louis Blues": { main: "#002F87", secondary: "#FCB514" },
	"Tampa Bay Lightning": { main: "#002868", secondary: "#FFFFFF" },
	"Toronto Maple Leafs": { main: "#003E7E", secondary: "#FFFFFF" },
	"Vancouver Canucks": { main: "#00205B", secondary: "#00843D" },
	"Vegas Golden Knights": { main: "#B4975A", secondary: "#333F42" },
	"Washington Capitals": { main: "#CF0A2C", secondary: "#041E42" },
	"Winnipeg Jets": { main: "#004C97", secondary: "#041E42" },

	// Abbreviation mappings for robust matching
	ANA: { main: "#FF8C00", secondary: "#000000" },
	ARI: { main: "#8C2633", secondary: "#E2D6B5" },
	BOS: { main: "#FFB81C", secondary: "#000000" },
	BUF: { main: "#00539b", secondary: "#FCB514" },
	CGY: { main: "#C8102E", secondary: "#F1BE48" },
	CAR: { main: "#CC0000", secondary: "#8E8E90" },
	CHI: { main: "#CF0A2C", secondary: "#000000" },
	COL: { main: "#6F263D", secondary: "#236192" },
	CBJ: { main: "#002654", secondary: "#CE1126" },
	DAL: { main: "#006847", secondary: "#8F8F8C" },
	DET: { main: "#CE1126", secondary: "#FFFFFF" },
	EDM: { main: "#FF4C00", secondary: "#041E42" },
	FLA: { main: "#C8102E", secondary: "#041E42" },
	LAK: { main: "#A2AAAD", secondary: "#111111" },
	MIN: { main: "#154734", secondary: "#A6192E" },
	MTL: { main: "#AF1E2D", secondary: "#192168" },
	NSH: { main: "#FFB81C", secondary: "#041E42" },
	NJD: { main: "#CE1126", secondary: "#000000" },
	NYI: { main: "#00539B", secondary: "#F47D30" },
	NYR: { main: "#0038A8", secondary: "#CE1126" },
	OTT: { main: "#E31837", secondary: "#C69214" },
	PHI: { main: "#F74902", secondary: "#000000" },
	PIT: { main: "#FCB514", secondary: "#000000" },
	SJS: { main: "#006D75", secondary: "#EA7200" },
	SEA: { main: "#35a4b8", secondary: "#001628" },
	STL: { main: "#002F87", secondary: "#FCB514" },
	TBL: { main: "#002868", secondary: "#FFFFFF" },
	TOR: { main: "#003E7E", secondary: "#FFFFFF" },
	VAN: { main: "#00205B", secondary: "#00843D" },
	VGK: { main: "#B4975A", secondary: "#333F42" },
	WSH: { main: "#CF0A2C", secondary: "#041E42" },
	WPG: { main: "#004C97", secondary: "#041E42" },
};

interface Team {
	id: number;
	name: string;
	abbrev: string;
	logo: string;
	score: number;
}

interface Game {
	game_id: number;
	start_time: string;
	status: string;
	period: number;
	period_type: string;
	home: Team;
	away: Team;
}

interface PlayEvent {
	seconds_elapsed: number;
	seconds_remaining: number;
	period: number;
	event_type: string;
	description: string;
	home_score: number;
	away_score: number;
	home_win_prob: number;
}

interface GameDetail {
	game_id: number;
	home_team: {
		name: string;
		logo: string;
		score: number;
		rolling_win_pct: number;
	};
	away_team: {
		name: string;
		logo: string;
		score: number;
		rolling_win_pct: number;
	};
	trajectory: PlayEvent[];
}

export function LiveNhlDashboard() {
	// Reads from the securely injected Vite build-time environment variable VITE_NHL_API_HOST.
	// This environment variable is populated from your GitHub Repository Secrets during deployment,
	// allowing anyone (including you on your phone) to connect to your live Pi securely
	// without revealing the IP/domain in your public repository code.
	const [apiHost] = useState(() => {
		return (
			(import.meta.env.VITE_NHL_API_HOST as string) || "http://localhost:8000"
		);
	});
	const [isOnline, setIsOnline] = useState(false);

	// Helper to dynamically resolve team color by name or abbreviation
	const getTeamColor = (teamName: string, abbrev: string) => {
		return (
			TEAM_COLORS[teamName]?.main || TEAM_COLORS[abbrev]?.main || "#3b82f6"
		);
	};

	const [games, setGames] = useState<Game[]>([]);
	const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
	const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);

	const [isLoading, setIsLoading] = useState(false);
	const [isPolling, setIsPolling] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [expandedPeriods, setExpandedPeriods] = useState<
		Record<number, boolean>
	>({
		1: true,
		2: true,
		3: true,
		4: true,
	});

	// Interactive chart scrubber states
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [clickedIndex, setClickedIndex] = useState<number | null>(null);

	const svgRef = useRef<SVGSVGElement>(null);
	const isDraggingRef = useRef(false);

	// Automatically expand the period of the scrubbed/hovered event
	const activeIndex = hoveredIndex !== null ? hoveredIndex : clickedIndex;
	useEffect(() => {
		if (activeIndex !== null && gameDetail) {
			const activeEvent = gameDetail.trajectory[activeIndex];
			if (activeEvent) {
				const p = activeEvent.period;
				setExpandedPeriods((prev) => {
					if (!prev[p]) {
						return { ...prev, [p]: true };
					}
					return prev;
				});
			}
		}
	}, [activeIndex, gameDetail]);

	// Check backend server connection status
	const checkServerStatus = async (host: string) => {
		try {
			const res = await fetch(host, { mode: "cors" });
			if (res.ok) {
				setIsOnline(true);
				setErrorMsg(null);
				return true;
			}
		} catch {
			setIsOnline(false);
		}
		return false;
	};

	// Fetch today's schedule
	const fetchSchedule = async (isManual = false) => {
		if (isManual) setIsLoading(true);
		try {
			const isUp = await checkServerStatus(apiHost);
			if (!isUp) {
				if (isManual) setIsLoading(false);
				setGames([]);
				setSelectedGameId(null);
				setGameDetail(null);
				setErrorMsg(
					"Raspberry Pi prediction server is offline. Verify that the Docker container is running and Tailscale Funnel is active.",
				);
				return;
			}

			const res = await fetch(`${apiHost}/api/games/today`, { mode: "cors" });
			if (res.ok) {
				const data = await res.json();
				const apiGames = data.games || [];
				if (apiGames.length > 0) {
					setGames(apiGames);
					setErrorMsg(null);
					if (
						!selectedGameId ||
						!apiGames.some((g: Game) => g.game_id === selectedGameId)
					) {
						setSelectedGameId(apiGames[0].game_id);
					}
				} else {
					setGames([]);
					setSelectedGameId(null);
					setGameDetail(null);
					setErrorMsg(
						"No active or scheduled NHL games found in today's schedule.",
					);
				}
			} else {
				setGames([]);
				setSelectedGameId(null);
				setGameDetail(null);
				setErrorMsg("Failed to fetch game schedule from prediction server.");
			}
		} catch {
			setGames([]);
			setSelectedGameId(null);
			setGameDetail(null);
			setErrorMsg("Error communicating with prediction server.");
		}
		if (isManual) setIsLoading(false);
	};

	// Fetch full trajectory for the selected game
	const fetchGameDetail = async (gameId: number) => {
		if (isOnline) {
			try {
				const res = await fetch(`${apiHost}/api/game/${gameId}`, {
					mode: "cors",
				});
				if (res.ok) {
					const data = await res.json();
					setGameDetail(data);
					setErrorMsg(null);
					return;
				}
			} catch {
				setErrorMsg("Failed to load trajectory for selected game.");
			}
		} else {
			setErrorMsg(
				"Cannot load live details while the prediction server is offline.",
			);
		}
		setGameDetail(null);
	};

	// Initial loading
	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchSchedule is stable and initial load only needs apiHost change
	useEffect(() => {
		fetchSchedule();
	}, [apiHost]);

	// Load game details when game changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchGameDetail is stable and game changes trigger once
	useEffect(() => {
		if (selectedGameId) {
			fetchGameDetail(selectedGameId);
			// Reset scrubber indexes
			setHoveredIndex(null);
			setClickedIndex(null);
		}
	}, [selectedGameId]);

	// Real-time polling logic
	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchGameDetail is stable and polling triggers periodically
	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval> | null = null;

		// Poll only if the active game is LIVE and polling is enabled
		const activeGame = games.find((g) => g.game_id === selectedGameId);
		const isLive = activeGame?.status === "LIVE";

		if (isPolling && selectedGameId && isLive) {
			intervalId = setInterval(() => {
				fetchGameDetail(selectedGameId);
				// Also refresh schedule score
				fetch(`${apiHost}/api/games/today`, { mode: "cors" })
					.then((res) => res.json())
					.then((data) => {
						const apiGames = data.games || [];
						if (apiGames.length > 0) setGames(apiGames);
					})
					.catch(() => {});
			}, 15000); // Poll every 15s
		} else {
			setIsPolling(false);
		}

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [isPolling, selectedGameId, games]);

	// Find game statuses
	const selectedGame = games.find((g) => g.game_id === selectedGameId);
	const isGameLive = selectedGame?.status === "LIVE";

	// Chart coordinate mapping helpers
	const getCoordinates = (traj: PlayEvent[]) => {
		if (!traj || traj.length === 0) return [];

		const svgWidth = 800;
		const svgHeight = 250;
		const maxTime = 3600; // 60 minutes

		return traj.map((pt, i) => {
			// Map X based on elapsed time (up to 3600s or maximum elapsed in OT)
			const seconds = pt.seconds_elapsed;
			const tMax = Math.max(maxTime, traj[traj.length - 1].seconds_elapsed);
			const x = (seconds / tMax) * (svgWidth - 40) + 20; // 20px padding left/right

			// Map Y based on win probability (0 is at top, so subtract from height)
			// Y coordinates: 20px padding top/bottom
			const y = svgHeight - (pt.home_win_prob * (svgHeight - 40) + 20);

			return { x, y, pt, idx: i };
		});
	};

	const coords = gameDetail ? getCoordinates(gameDetail.trajectory) : [];

	// Build SVG Path string
	const getPathD = () => {
		if (coords.length === 0) return "";
		let d = `M ${coords[0].x} ${coords[0].y}`;
		for (let i = 1; i < coords.length; i++) {
			d += ` L ${coords[i].x} ${coords[i].y}`;
		}
		return d;
	};

	// Build SVG Area path from 50% line (y = 125) to curve
	const getArea50D = () => {
		if (coords.length === 0) return "";
		const baselineY = 125;
		let d = `M ${coords[0].x} ${baselineY}`;
		for (let i = 0; i < coords.length; i++) {
			d += ` L ${coords[i].x} ${coords[i].y}`;
		}
		d += ` L ${coords[coords.length - 1].x} ${baselineY} Z`;
		return d;
	};

	// Find goal events to plot custom nodes on the chart
	const goalEvents = coords.filter((c) => c.pt.event_type === "GOAL");

	// Active highlighted play state (hovered or clicked)
	const activeCoord = activeIndex !== null ? coords[activeIndex] : null;

	// Handle chart pointer interactions
	const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
		if (coords.length === 0 || !svgRef.current) return;
		isDraggingRef.current = true;
		e.currentTarget.setPointerCapture(e.pointerId);

		const rect = svgRef.current.getBoundingClientRect();
		const svgWidth = 800;
		const clickX = ((e.clientX - rect.left) / rect.width) * svgWidth;

		let nearestIdx = 0;
		let minDist = Infinity;
		coords.forEach((coord, i) => {
			const dist = Math.abs(coord.x - clickX);
			if (dist < minDist) {
				minDist = dist;
				nearestIdx = i;
			}
		});

		setClickedIndex(nearestIdx);
		setHoveredIndex(nearestIdx);
	};

	const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
		if (coords.length === 0 || !svgRef.current) return;

		const rect = svgRef.current.getBoundingClientRect();
		const svgWidth = 800;
		const clickX = ((e.clientX - rect.left) / rect.width) * svgWidth;

		let nearestIdx = 0;
		let minDist = Infinity;
		coords.forEach((coord, i) => {
			const dist = Math.abs(coord.x - clickX);
			if (dist < minDist) {
				minDist = dist;
				nearestIdx = i;
			}
		});

		setHoveredIndex(nearestIdx);
		if (isDraggingRef.current) {
			setClickedIndex(nearestIdx);
		}
	};

	const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
		isDraggingRef.current = false;
		e.currentTarget.releasePointerCapture(e.pointerId);
		setHoveredIndex(null);
	};

	const handlePointerLeave = () => {
		if (!isDraggingRef.current) {
			setHoveredIndex(null);
		}
	};

	// Get dynamic coloring representing home win probability strengths
	const getProbabilityColor = (prob: number) => {
		if (prob >= 0.75) return "text-emerald-500 shadow-emerald-500/20";
		if (prob >= 0.55) return "text-blue-500 shadow-blue-500/20";
		if (prob >= 0.45) return "text-neutral-400 shadow-neutral-400/20";
		if (prob >= 0.25) return "text-amber-500 shadow-amber-500/20";
		return "text-red-500 shadow-red-500/20";
	};

	// Determine scoring team's color for goal marker
	const getGoalScorerColor = (
		idx: number,
		homeColor: string,
		awayColor: string,
	) => {
		if (idx === 0) {
			const curr = coords[0].pt;
			if (curr.home_score > 0) return homeColor;
			if (curr.away_score > 0) return awayColor;
			return "#3b82f6";
		}
		const curr = coords[idx].pt;
		const prev = coords[idx - 1].pt;
		if (curr.home_score > prev.home_score) return homeColor;
		if (curr.away_score > prev.away_score) return awayColor;
		return curr.home_win_prob >= 0.5 ? homeColor : awayColor;
	};

	return (
		<div className="w-full bg-background text-foreground rounded-2xl border border-foreground/5 p-4 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
			{/* Decorative ambient backgrounds */}
			<div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
			<div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

			{/* Header controls & Homelab configuration */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-foreground/5 pb-6 mb-8">
				<div>
					<div className="flex items-center gap-3">
						<span className="flex h-3.5 w-3.5 relative">
							{isOnline ? (
								<>
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
									<span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
								</>
							) : (
								<span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500" />
							)}
						</span>
						<h1 className="text-2xl md:text-3xl font-extrabold italic tracking-tight text-foreground">
							NHL LIVE WIN PREDICTOR
						</h1>
					</div>
					<p className="text-sm opacity-60 mt-1.5 flex items-center gap-1.5 font-medium">
						<MapPin size={14} className="text-accent" />
						{isOnline
							? "Raspberry Pi Homelab Environment"
							: "Prediction Server Offline"}
					</p>
				</div>

				<div className="flex items-center gap-3 w-full md:w-auto">
					<button
						type="button"
						onClick={() => fetchSchedule(true)}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
						title="Refresh Data"
					>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
						Refresh
					</button>
				</div>
			</div>

			{/* Error Message */}
			{errorMsg && (
				<div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-8 text-sm text-red-200">
					<AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
					<div>{errorMsg}</div>
				</div>
			)}

			{/* Games Selector (Horizontal Carousel) */}
			<div className="mb-8 w-full overflow-hidden">
				<h3 className="text-sm font-bold opacity-40 uppercase tracking-widest mb-3 italic">
					Today's NHL Matchups
				</h3>
				{games.length === 0 ? (
					<div className="p-8 rounded-xl bg-foreground/[0.02] border border-foreground/5 text-center text-sm opacity-50">
						{isLoading
							? "Loading schedule..."
							: "No games scheduled for today."}
					</div>
				) : (
					<div className="flex gap-4 overflow-x-auto pb-3 w-full snap-x snap-mandatory scroll-smooth">
						{games.map((game) => (
							<button
								type="button"
								key={game.game_id}
								onClick={() => setSelectedGameId(game.game_id)}
								className={`p-4 rounded-xl border shrink-0 w-56 md:w-64 text-left transition-all snap-center ${
									selectedGameId === game.game_id
										? "bg-accent/10 border-accent shadow-lg shadow-accent/5"
										: "bg-foreground/[0.02] border-foreground/5 hover:bg-foreground/[0.04]"
								}`}
							>
								<div className="flex justify-between items-center text-xs opacity-50 mb-2 font-bold">
									<span>
										{new Date(game.start_time).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
									{game.status === "LIVE" ? (
										<span className="flex items-center gap-1 text-red-400 font-extrabold animate-pulse">
											<span className="h-1.5 w-1.5 bg-red-500 rounded-full" />
											LIVE (
											{game.period <= 3
												? `P${game.period}`
												: game.period === 4
													? "OT"
													: `${game.period - 3}OT`}
											)
										</span>
									) : game.status === "FINAL" || game.status === "OFF" ? (
										<span className="text-neutral-400 font-extrabold">
											FINAL
											{game.period > 3
												? ` / ${game.period === 4 ? "OT" : `${game.period - 3}OT`}`
												: ""}
										</span>
									) : (
										<span className="text-blue-400">PRE-GAME</span>
									)}
								</div>

								<div className="space-y-2 font-bold italic">
									<div className="flex justify-between items-center text-sm">
										<span className="flex items-center gap-2 truncate">
											<img
												src={game.away.logo}
												alt=""
												className="w-5 h-5 shrink-0"
											/>
											{game.away.abbrev}
										</span>
										<span>{game.away.score}</span>
									</div>
									<div className="flex justify-between items-center text-sm">
										<span className="flex items-center gap-2 truncate">
											<img
												src={game.home.logo}
												alt=""
												className="w-5 h-5 shrink-0"
											/>
											{game.home.abbrev}
										</span>
										<span>{game.home.score}</span>
									</div>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Main Panel Detail (Scoreboard & Interactive Scrubber Line Chart) */}
			{gameDetail && selectedGame && (
				<div className="space-y-8">
					{/* Glassmorphic Real-time Scoreboard Card */}
					<div className="p-4 md:p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5 relative overflow-hidden shadow-lg shadow-black/10">
						<div className="absolute top-0 right-0 p-3 flex items-center gap-2">
							{isGameLive && (
								<button
									type="button"
									onClick={() => setIsPolling(!isPolling)}
									className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 ${
										isPolling
											? "bg-emerald-500 text-white"
											: "bg-foreground/5 border border-foreground/5 hover:bg-foreground/10"
									}`}
								>
									<Activity
										size={12}
										className={isPolling ? "animate-pulse" : ""}
									/>
									{isPolling ? "Real-time updates ON" : "Turn real-time ON"}
								</button>
							)}
						</div>

						{/* Desktop Scoreboard Layout */}
						<div className="hidden md:flex flex-row justify-between items-center gap-6 mt-6 md:mt-0">
							{/* Away Team Details */}
							<div className="flex items-center gap-4 flex-1 justify-end font-bold italic">
								<div className="text-right">
									<h4 className="text-2xl font-black">
										{selectedGame.away.name}
									</h4>
									<p className="text-xs opacity-50 font-medium">
										Prior strength:{" "}
										{Math.round(gameDetail.away_team.rolling_win_pct * 100)}%
										win
									</p>
								</div>
								<img
									src={selectedGame.away.logo}
									alt=""
									className="w-20 h-20 drop-shadow-xl"
								/>
								<span className="text-5xl font-black">
									{selectedGame.away.score}
								</span>
							</div>

							{/* Matchup Mid-Separator */}
							<div className="text-center shrink-0">
								<span className="px-3.5 py-1.5 rounded-lg bg-foreground/5 border border-foreground/5 text-xs font-extrabold uppercase tracking-wider text-neutral-400 italic">
									VS
								</span>
								{isGameLive ? (
									<p className="text-xs opacity-60 font-bold mt-2 flex items-center gap-1 justify-center">
										<Clock size={12} />
										{selectedGame.period <= 3
											? `Period ${selectedGame.period}`
											: selectedGame.period === 4
												? "OT"
												: `${selectedGame.period - 3}OT`}
									</p>
								) : (
									<p className="text-xs opacity-60 font-bold mt-2 flex items-center gap-1 justify-center">
										FINAL
										{selectedGame.period > 3
											? ` / ${selectedGame.period === 4 ? "OT" : `${selectedGame.period - 3}OT`}`
											: ""}
									</p>
								)}
							</div>

							{/* Home Team Details */}
							<div className="flex items-center gap-4 flex-1 justify-start font-bold italic">
								<span className="text-5xl font-black">
									{selectedGame.home.score}
								</span>
								<img
									src={selectedGame.home.logo}
									alt=""
									className="w-20 h-20 drop-shadow-xl"
								/>
								<div className="text-left">
									<h4 className="text-2xl font-black">
										{selectedGame.home.name}
									</h4>
									<p className="text-xs opacity-50 font-medium">
										Prior strength:{" "}
										{Math.round(gameDetail.home_team.rolling_win_pct * 100)}%
										win
									</p>
								</div>
							</div>
						</div>

						{/* Mobile Scoreboard Layout (Classic Horizontal Row) */}
						<div className="flex md:hidden flex-row justify-between items-center w-full gap-2 font-bold italic mt-8">
							{/* Away Team (Compact) */}
							<div className="flex flex-col items-center flex-1 min-w-0">
								<img
									src={selectedGame.away.logo}
									alt=""
									className="w-12 h-12 drop-shadow-lg"
								/>
								<span className="text-sm font-black uppercase mt-1 truncate max-w-full">
									{selectedGame.away.abbrev}
								</span>
								<span className="text-[10px] opacity-40 font-semibold mt-0.5">
									{Math.round(gameDetail.away_team.rolling_win_pct * 100)}% win
								</span>
							</div>

							{/* Away Score */}
							<div className="text-3xl font-black font-mono shrink-0 px-2">
								{selectedGame.away.score}
							</div>

							{/* Mid Divider & Time */}
							<div className="flex flex-col items-center shrink-0 px-1 text-center">
								<span className="px-2 py-0.5 rounded bg-foreground/5 border border-foreground/5 text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">
									VS
								</span>
								{isGameLive ? (
									<p className="text-[9px] opacity-60 font-bold mt-1 flex items-center gap-0.5 justify-center">
										<Clock size={9} />
										{selectedGame.period <= 3
											? `P${selectedGame.period}`
											: selectedGame.period === 4
												? "OT"
												: `${selectedGame.period - 3}OT`}
									</p>
								) : (
									<p className="text-[9px] opacity-60 font-bold mt-1">
										FINAL
										{selectedGame.period > 3
											? ` / ${selectedGame.period === 4 ? "OT" : `${selectedGame.period - 3}OT`}`
											: ""}
									</p>
								)}
							</div>

							{/* Home Score */}
							<div className="text-3xl font-black font-mono shrink-0 px-2">
								{selectedGame.home.score}
							</div>

							{/* Home Team (Compact) */}
							<div className="flex flex-col items-center flex-1 min-w-0">
								<img
									src={selectedGame.home.logo}
									alt=""
									className="w-12 h-12 drop-shadow-lg"
								/>
								<span className="text-sm font-black uppercase mt-1 truncate max-w-full">
									{selectedGame.home.abbrev}
								</span>
								<span className="text-[10px] opacity-40 font-semibold mt-0.5">
									{Math.round(gameDetail.home_team.rolling_win_pct * 100)}% win
								</span>
							</div>
						</div>

						{/* Glowing Live Win Probability Gauge */}
						<div className="border-t border-foreground/5 mt-6 pt-5 flex flex-col items-center justify-center">
							<span className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1.5 italic">
								Active Live Win Probability
							</span>
							{gameDetail.trajectory.length > 0 &&
								(() => {
									const latestProb =
										gameDetail.trajectory[gameDetail.trajectory.length - 1]
											.home_win_prob;
									const isHomeFavored = latestProb >= 0.5;
									const displayProb = isHomeFavored
										? latestProb
										: 1 - latestProb;
									const displayTeamName = isHomeFavored
										? selectedGame.home.name
										: selectedGame.away.name;

									const homeColor = getTeamColor(
										selectedGame.home.name,
										selectedGame.home.abbrev,
									);
									const awayColor = getTeamColor(
										selectedGame.away.name,
										selectedGame.away.abbrev,
									);

									return (
										<div className="flex flex-col items-center w-full max-w-md">
											<span
												className={`text-3xl md:text-4xl font-extrabold italic drop-shadow-lg transition-all duration-300 ${getProbabilityColor(
													latestProb,
												)}`}
											>
												{Math.round(displayProb * 100)}%
											</span>
											<span className="text-xs font-bold opacity-60 italic mt-0.5 text-center">
												{displayTeamName} chance to win
											</span>

											{/* Premium Tactile Dual-Color Probability Bar */}
											<div className="w-full h-3 bg-foreground/5 rounded-full overflow-hidden mt-5 flex relative border border-foreground/10 shadow-inner">
												<div
													className="h-full transition-all duration-500 ease-out"
													style={{
														width: `${(1 - latestProb) * 100}%`,
														backgroundColor: awayColor,
													}}
												/>
												<div
													className="h-full transition-all duration-500 ease-out"
													style={{
														width: `${latestProb * 100}%`,
														backgroundColor: homeColor,
													}}
												/>
												{/* Glowing Dividing Indicator Dot */}
												<div
													className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md shadow-white/80 transition-all duration-500 ease-out pointer-events-none"
													style={{
														left: `calc(${(1 - latestProb) * 100}% - 8px)`,
													}}
												/>
											</div>
										</div>
									);
								})()}
						</div>
					</div>

					{/* Interactive Chart Container */}
					<div className="bg-foreground/[0.01] border border-foreground/5 rounded-2xl p-4 md:p-6 shadow-inner relative">
						<h3 className="text-sm font-bold opacity-40 uppercase tracking-widest mb-4 italic">
							Live Win Probability Scrubber Timeline
						</h3>

						{gameDetail.trajectory.length >= 2 ? (
							<>
								{/* Custom Responsive SVG Chart with Pointer Events */}
								<div className="w-full relative">
									<svg
										ref={svgRef}
										onPointerDown={handlePointerDown}
										onPointerMove={handlePointerMove}
										onPointerUp={handlePointerUp}
										onPointerCancel={handlePointerUp}
										onPointerLeave={handlePointerLeave}
										viewBox="0 0 800 250"
										className="w-full h-auto cursor-crosshair select-none outline-none touch-none"
										role="img"
										aria-label="NHL Win Probability Trajectory Chart"
									>
										<title>NHL Win Probability Trajectory Chart</title>
										{/* SVG Definitions for Clip Paths */}
										<defs>
											{/* Clips to divide above/below 50% line (y = 125) */}
											<clipPath id="top-clip">
												<rect x="0" y="0" width="800" height="125" />
											</clipPath>
											<clipPath id="bottom-clip">
												<rect x="0" y="125" width="800" height="125" />
											</clipPath>
										</defs>

										{/* Y-Axis Grid Lines & Markers */}
										<line
											x1="20"
											y1="20"
											x2="780"
											y2="20"
											stroke="currentColor"
											strokeOpacity="0.05"
											strokeDasharray="4"
										/>
										<text
											x="12"
											y="24"
											className="fill-foreground/40 font-bold text-[11px] md:text-[9px]"
										>
											100%
										</text>

										<line
											x1="20"
											y1="125"
											x2="780"
											y2="125"
											stroke="currentColor"
											strokeOpacity="0.15"
											strokeDasharray="2"
										/>
										<text
											x="12"
											y="129"
											className="fill-foreground/50 font-black text-[12px] md:text-[10px]"
										>
											50%
										</text>

										<line
											x1="20"
											y1="230"
											x2="780"
											y2="230"
											stroke="currentColor"
											strokeOpacity="0.05"
											strokeDasharray="4"
										/>
										<text
											x="12"
											y="234"
											className="fill-foreground/40 font-bold text-[11px] md:text-[9px]"
										>
											0%
										</text>

										{/* Period Grid Dividers (at 1200s, 2400s, 3600s) */}
										<line
											x1="273.3"
											y1="20"
											x2="273.3"
											y2="230"
											stroke="currentColor"
											strokeOpacity="0.15"
											strokeDasharray="4"
										/>
										<text
											x="278.3"
											y="32"
											className="fill-foreground/45 font-bold text-[11px] md:text-[9px] italic"
										>
											END P1
										</text>

										<line
											x1="526.6"
											y1="20"
											x2="526.6"
											y2="230"
											stroke="currentColor"
											strokeOpacity="0.15"
											strokeDasharray="4"
										/>
										<text
											x="531.6"
											y="32"
											className="fill-foreground/45 font-bold text-[11px] md:text-[9px] italic"
										>
											END P2
										</text>

										<line
											x1="780"
											y1="20"
											x2="780"
											y2="230"
											stroke="currentColor"
											strokeOpacity="0.15"
											strokeDasharray="4"
										/>
										<text
											x="740"
											y="32"
											className="fill-foreground/45 font-bold text-[11px] md:text-[9px] italic"
										>
											END P3
										</text>

										{/* Home Area Fill (Top Half - y < 125) using solid home team color */}
										{coords.length > 0 &&
											(() => {
												const homeColor = getTeamColor(
													selectedGame.home.name,
													selectedGame.home.abbrev,
												);
												return (
													<path
														d={getArea50D()}
														fill={homeColor}
														fillOpacity="0.5"
														clipPath="url(#top-clip)"
														className="transition-all duration-300"
													/>
												);
											})()}

										{/* Away Area Fill (Bottom Half - y > 125) using solid away team color */}
										{coords.length > 0 &&
											(() => {
												const awayColor = getTeamColor(
													selectedGame.away.name,
													selectedGame.away.abbrev,
												);
												return (
													<path
														d={getArea50D()}
														fill={awayColor}
														fillOpacity="0.5"
														clipPath="url(#bottom-clip)"
														className="transition-all duration-300"
													/>
												);
											})()}

										{/* The Win Probability Line Curve (Single Solid White Line, matching the original black line style) */}
										{coords.length > 0 && (
											<path
												d={getPathD()}
												fill="none"
												stroke="#ffffff"
												strokeWidth="3"
												className="transition-all duration-300 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
											/>
										)}

										{/* Goal Milestones Markers with Team Color styling */}
										{(() => {
											const homeColor = getTeamColor(
												selectedGame.home.name,
												selectedGame.home.abbrev,
											);
											const awayColor = getTeamColor(
												selectedGame.away.name,
												selectedGame.away.abbrev,
											);

											return goalEvents.map((goal) => {
												const scorerColor = getGoalScorerColor(
													goal.idx,
													homeColor,
													awayColor,
												);
												return (
													<g key={`goal-${goal.idx}`}>
														{/* biome-ignore lint/a11y/useSemanticElements: circle is a valid interactive SVG sub-element */}
														<circle
															cx={goal.x}
															cy={goal.y}
															r="6"
															fill={scorerColor}
															className="stroke-background stroke-2 hover:scale-125 cursor-pointer transition-all outline-none"
															role="button"
															tabIndex={0}
															onClick={(e) => {
																e.stopPropagation();
																setClickedIndex(goal.idx);
															}}
															onKeyDown={(e) => {
																if (e.key === "Enter" || e.key === " ") {
																	e.stopPropagation();
																	setClickedIndex(goal.idx);
																}
															}}
															aria-label={`Goal scored at ${Math.round(goal.pt.seconds_elapsed / 60)} minutes`}
														/>
														<circle
															cx={goal.x}
															cy={goal.y}
															r="12"
															fill={scorerColor}
															fillOpacity={0.2}
															className="animate-pulse pointer-events-none"
														/>
													</g>
												);
											});
										})()}

										{/* Scrubber tracker lines & glowing cursor focus circle */}
										{activeCoord &&
											(() => {
												const homeColor = getTeamColor(
													selectedGame.home.name,
													selectedGame.home.abbrev,
												);
												const awayColor = getTeamColor(
													selectedGame.away.name,
													selectedGame.away.abbrev,
												);
												const activeProb = activeCoord.pt.home_win_prob;
												const activeColor =
													activeProb >= 0.5 ? homeColor : awayColor;

												return (
													<g>
														{/* Vertical Tracker Line */}
														<line
															x1={activeCoord.x}
															y1="20"
															x2={activeCoord.x}
															y2="230"
															stroke="currentColor"
															strokeOpacity="0.2"
															strokeDasharray="2"
														/>
														{/* Glowing Scrubber Core Pin with dynamic team coloring */}
														<circle
															cx={activeCoord.x}
															cy={activeCoord.y}
															r="7"
															fill="#0b0f19"
															stroke={activeColor}
															strokeWidth="3"
															style={{
																filter: `drop-shadow(0 0 8px ${activeColor})`,
															}}
														/>
													</g>
												);
											})()}
									</svg>
								</div>

								{/* Dynamic Glassmorphic Floating Tooltip Card */}
								<AnimatePresence>
									{activeCoord && (
										<motion.div
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.95 }}
											className="mt-4 p-3 md:p-4 rounded-xl bg-foreground/[0.02] border border-foreground/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs md:text-sm"
										>
											<div className="space-y-1 select-none">
												<div className="flex items-center gap-2">
													<span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-black text-[10px] md:text-xs uppercase tracking-wider italic">
														{activeCoord.pt.period <= 3
															? `P${activeCoord.pt.period}`
															: activeCoord.pt.period === 4
																? "OT"
																: `${activeCoord.pt.period - 3}OT`}{" "}
														-{" "}
														{Math.floor(
															((3600 - activeCoord.pt.seconds_remaining) %
																1200) /
																60,
														)}
														:
														{String(
															Math.floor(
																(3600 - activeCoord.pt.seconds_remaining) % 60,
															),
														).padStart(2, "0")}
													</span>
													<span className="text-xs md:text-sm font-black italic">
														Score: {activeCoord.pt.home_score} -{" "}
														{activeCoord.pt.away_score}
													</span>
												</div>
												<p className="text-xs md:text-sm opacity-80 leading-relaxed font-semibold italic">
													"{activeCoord.pt.description}"
												</p>
											</div>

											{(() => {
												const prob = activeCoord.pt.home_win_prob;
												const isHomeFavored = prob >= 0.5;
												const displayProb = isHomeFavored ? prob : 1 - prob;
												const displayTeamAbbrev = isHomeFavored
													? selectedGame.home.abbrev
													: selectedGame.away.abbrev;

												return (
													<div className="shrink-0 flex items-center gap-3 bg-background/40 border border-foreground/5 p-1.5 px-3 md:p-2 md:px-4 rounded-lg">
														<span className="text-[10px] md:text-xs opacity-50 font-bold italic uppercase tracking-wider">
															{displayTeamAbbrev} chance to win:
														</span>
														<span
															className={`text-lg md:text-xl font-black italic transition-all ${getProbabilityColor(prob)}`}
														>
															{Math.round(displayProb * 100)}%
														</span>
													</div>
												);
											})()}
										</motion.div>
									)}
								</AnimatePresence>
							</>
						) : (
							<div className="flex flex-col items-center justify-center p-12 py-16 text-center border border-foreground/5 rounded-xl bg-foreground/[0.01] my-4 select-none">
								<Clock className="text-accent mb-3 animate-pulse" size={24} />
								<p className="text-sm font-black italic opacity-60">
									No real-time play-by-play events recorded yet.
								</p>
								<p className="text-xs opacity-40 mt-1.5 max-w-[280px] leading-relaxed">
									Live tracking and win probability curves will begin once the
									game is underway.
								</p>
							</div>
						)}
					</div>

					{/* Interactive Play-by-Play Event Feed Scroller */}
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<h3 className="text-sm font-bold opacity-40 uppercase tracking-widest italic">
								Play-by-Play Scroller Log
							</h3>
							<div className="flex gap-2 text-xs font-bold text-accent">
								<button
									type="button"
									onClick={() =>
										setExpandedPeriods({ 1: true, 2: true, 3: true, 4: true })
									}
									className="hover:opacity-85"
								>
									Expand All
								</button>
								<span className="opacity-20">|</span>
								<button
									type="button"
									onClick={() =>
										setExpandedPeriods({
											1: false,
											2: false,
											3: false,
											4: false,
										})
									}
									className="hover:opacity-85"
								>
									Collapse All
								</button>
							</div>
						</div>

						<div className="max-h-[280px] md:max-h-[350px] overflow-y-auto border border-foreground/5 rounded-2xl p-2 md:p-3 space-y-4 bg-foreground/[0.01] scrollbar-thin">
							{(() => {
								// Group events by period chronologically
								const periods: Record<
									number,
									{ event: PlayEvent; realIdx: number }[]
								> = {};
								gameDetail.trajectory.forEach((event, idx) => {
									const p = event.period;
									if (!periods[p]) periods[p] = [];
									periods[p].push({ event, realIdx: idx });
								});

								return Object.keys(periods)
									.sort()
									.map((pStr) => {
										const p = Number(pStr);
										const pEvents = periods[p];

										return (
											<div key={p} className="space-y-2">
												{/* Period Sticky Header */}
												{/* biome-ignore lint/a11y/useSemanticElements: div acts as an accordion header */}
												<div
													onClick={() =>
														setExpandedPeriods((prev) => ({
															...prev,
															[p]: !prev[p],
														}))
													}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															setExpandedPeriods((prev) => ({
																...prev,
																[p]: !prev[p],
															}));
														}
													}}
													tabIndex={0}
													role="button"
													className="flex justify-between items-center p-2.5 md:p-3 rounded-xl bg-background border border-foreground/10 cursor-pointer hover:bg-foreground/[0.03] select-none transition-all sticky top-0 z-10 shadow-lg shadow-black/20 backdrop-blur-md outline-none text-xs md:text-sm"
												>
													<div className="flex items-center gap-2 font-bold italic text-xs md:text-sm text-foreground">
														<span className="h-2 w-2 rounded-full bg-accent shrink-0"></span>
														{p <= 3
															? `Period ${p}`
															: p === 4
																? "OT"
																: `${p - 3}OT`}{" "}
														<span className="opacity-40 text-[10px] md:text-xs font-normal">
															({pEvents.length} events)
														</span>
													</div>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="3"
														className={`text-accent transition-all ${expandedPeriods[p] ? "rotate-180" : ""}`}
														role="img"
														aria-label="Toggle Period Section"
													>
														<title>Toggle Section</title>
														<path d="m6 9 6 6 6-6" />
													</svg>
												</div>

												{/* Collapsible event list inside period */}
												{expandedPeriods[p] && (
													<div className="space-y-2 mt-2">
														{pEvents.map(({ event, realIdx }) => {
															const isSelected = activeIndex === realIdx;

															return (
																<button
																	type="button"
																	key={realIdx}
																	onMouseEnter={() => setHoveredIndex(realIdx)}
																	onMouseLeave={() => setHoveredIndex(null)}
																	onClick={() =>
																		setClickedIndex(
																			realIdx === clickedIndex ? null : realIdx,
																		)
																	}
																	className={`w-full p-2.5 md:p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 md:gap-4 transition-all duration-200 select-none ${
																		isSelected
																			? "bg-accent/15 border-accent/40 shadow-lg scale-[0.995]"
																			: "bg-background/40 border-foreground/5 hover:bg-foreground/[0.02]"
																	}`}
																>
																	<div className="space-y-1 md:space-y-1.5 min-w-0 flex-1">
																		<div className="flex items-center gap-2">
																			<span className="text-[10px] md:text-xs opacity-50 font-bold uppercase tracking-wider italic">
																				{event.period <= 3
																					? `P${event.period}`
																					: event.period === 4
																						? "OT"
																						: `${event.period - 3}OT`}{" "}
																				•{" "}
																				{Math.floor(
																					((3600 - event.seconds_remaining) %
																						1200) /
																						60,
																				)}
																				:
																				{String(
																					Math.floor(
																						(3600 - event.seconds_remaining) %
																							60,
																					),
																				).padStart(2, "0")}
																			</span>

																			{event.event_type === "GOAL" && (
																				<span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] md:text-[10px] font-black uppercase italic tracking-widest animate-pulse">
																					Goal
																				</span>
																			)}
																			{event.event_type === "PENALTY" && (
																				<span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] md:text-[10px] font-black uppercase italic tracking-widest">
																					Penalty
																				</span>
																			)}
																		</div>

																		<p className="text-xs md:text-sm font-semibold italic leading-relaxed opacity-90 truncate md:whitespace-normal">
																			"{event.description}"
																		</p>
																	</div>

																	{(() => {
																		const prob = event.home_win_prob;
																		const isHomeFavored = prob >= 0.5;
																		const displayProb = isHomeFavored
																			? prob
																			: 1 - prob;
																		const displayTeamAbbrev = isHomeFavored
																			? selectedGame.home.abbrev
																			: selectedGame.away.abbrev;

																		return (
																			<div className="shrink-0 text-right space-y-0.5 md:space-y-1 font-bold italic pl-2">
																				<span className="text-[9px] md:text-xs opacity-50">
																					{displayTeamAbbrev}
																				</span>
																				<p
																					className={`text-sm md:text-base font-black transition-all ${getProbabilityColor(prob)}`}
																				>
																					{Math.round(displayProb * 100)}%
																				</p>
																			</div>
																		);
																	})()}
																</button>
															);
														})}
													</div>
												)}
											</div>
										);
									});
							})()}
						</div>
					</div>
				</div>
			)}

			{/* Loading state spinner */}
			{isLoading && (
				<div className="flex flex-col items-center justify-center p-20 gap-3">
					<RefreshCw className="animate-spin text-accent" size={32} />
					<span className="text-sm opacity-60 font-semibold italic">
						Processing play-by-play datasets...
					</span>
				</div>
			)}
		</div>
	);
}
