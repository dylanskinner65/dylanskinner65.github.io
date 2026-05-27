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
import { getTeamAbbreviation, getTeamColor } from "../lib/nhlConstants";
import {
	formatAmericanOdds,
	formatPlayDescription,
	getAggregatedStats,
	getCoordinates,
	getGameStatusText,
	getGoalScorerColor,
	getProbabilityColor,
	parseTimeInPeriod,
} from "../lib/nhlUtils";
import { supabase } from "../lib/supabase";
import type {
	Game,
	GameDetail,
	GameOdds,
	NhlEventType,
	PlayEvent,
	StatRowProps,
} from "../types/nhl";

function StatRow({
	label,
	homeVal,
	awayVal,
	homeColor,
	awayColor,
}: StatRowProps) {
	const total = homeVal + awayVal;
	const homePct = total > 0 ? (homeVal / total) * 100 : 50;
	const awayPct = total > 0 ? (awayVal / total) * 100 : 50;

	return (
		<div className="space-y-1.5 py-2.5 border-b border-foreground/5 last:border-0">
			<div className="flex justify-between items-center text-xs md:text-sm font-bold">
				<span
					className="tabular-nums font-black transition-all"
					style={{ color: homeColor }}
				>
					{homeVal}
				</span>
				<span className="opacity-55 uppercase tracking-wider text-[10px] md:text-xs italic select-none">
					{label}
				</span>
				<span
					className="tabular-nums font-black transition-all"
					style={{ color: awayColor }}
				>
					{awayVal}
				</span>
			</div>
			<div className="h-2 w-full rounded-full bg-foreground/5 flex overflow-hidden select-none">
				<div
					className="h-full rounded-l transition-all duration-300"
					style={{ width: `${homePct}%`, backgroundColor: homeColor }}
				/>
				<div
					className="h-full rounded-r transition-all duration-300"
					style={{ width: `${awayPct}%`, backgroundColor: awayColor }}
				/>
			</div>
		</div>
	);
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
	const [isOnline, setIsOnline] = useState(true);
	const [dateOffset, setDateOffset] = useState<number>(0); // Horizontal calendar offset range (-3 to 3)

	const getLocalDateBounds = (offsetDays: number) => {
		const d = new Date();
		d.setDate(d.getDate() + offsetDays);

		const start = new Date(d);
		start.setHours(0, 0, 0, 0);

		const end = new Date(d);
		end.setHours(23, 59, 59, 999);

		return {
			start: start.toISOString(),
			end: end.toISOString(),
		};
	};

	const [games, setGames] = useState<Game[]>([]);
	const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
	const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
	const [gameOdds, setGameOdds] = useState<GameOdds | null>(null);

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

	// Definitions removed - imported from src/lib/nhlUtils.ts

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

	// Fetch today's schedule from Supabase
	const fetchSchedule = async (isManual = false, offset = dateOffset) => {
		if (isManual) setIsLoading(true);
		try {
			const bounds = getLocalDateBounds(offset);

			const { data: dbGames, error } = await supabase
				.from("games")
				.select(
					"id, game_date, status, home_team, away_team, home_score, away_score, play_by_play",
				)
				.gte("game_date", bounds.start)
				.lte("game_date", bounds.end)
				.order("game_date", { ascending: true });

			if (error) throw error;

			const apiGames: Game[] = (dbGames || []).map((g) => {
				const pbp = g.play_by_play
					? typeof g.play_by_play === "string"
						? JSON.parse(g.play_by_play)
						: g.play_by_play
					: {};

				const period = pbp?.periodDescriptor?.number || 1;
				const periodType = pbp?.periodDescriptor?.periodType || "REG";

				const homeAbbrev =
					pbp?.homeTeam?.abbrev || getTeamAbbreviation(g.home_team);
				const awayAbbrev =
					pbp?.awayTeam?.abbrev || getTeamAbbreviation(g.away_team);

				const homeLogo =
					pbp?.homeTeam?.logo ||
					`https://assets.nhle.com/logos/nhl/svg/${homeAbbrev}_dark.svg`;
				const awayLogo =
					pbp?.awayTeam?.logo ||
					`https://assets.nhle.com/logos/nhl/svg/${awayAbbrev}_dark.svg`;

				return {
					game_id: Number(g.id),
					start_time: g.game_date,
					status: g.status,
					period: period,
					period_type: periodType,
					home: {
						id: pbp?.homeTeam?.id || 0,
						name: g.home_team,
						abbrev: homeAbbrev,
						logo: homeLogo,
						score: g.home_score || 0,
					},
					away: {
						id: pbp?.awayTeam?.id || 0,
						name: g.away_team,
						abbrev: awayAbbrev,
						logo: awayLogo,
						score: g.away_score || 0,
					},
				};
			});

			setIsOnline(true);
			if (apiGames.length > 0) {
				setGames(apiGames);
				setErrorMsg(null);
				if (
					!selectedGameId ||
					!apiGames.some((g: Game) => g.game_id === selectedGameId)
				) {
					handleSelectGame(apiGames[0].game_id);
				}
			} else {
				setGames([]);
				handleSelectGame(null);
				setErrorMsg(
					"No active or scheduled NHL games found in this date's schedule.",
				);
			}
		} catch (err: any) {
			console.error("Error fetching schedule from Supabase:", err);
			setGames([]);
			handleSelectGame(null);
			setErrorMsg(
				`Error communicating with Supabase database: ${err.message || err}`,
			);
		}
		if (isManual) setIsLoading(false);
	};

	const handleDateTabChange = (offset: number) => {
		setDateOffset(offset);
		fetchSchedule(false, offset);
	};

	// Fetch full trajectory for the selected game from Supabase
	const fetchGameDetail = async (gameId: number) => {
		try {
			// 1. Fetch the game record from 'games' table
			const { data: gameRow, error: gameError } = await supabase
				.from("games")
				.select(
					"id, home_team, away_team, home_score, away_score, play_by_play",
				)
				.eq("id", String(gameId))
				.single();

			if (gameError) throw gameError;

			// 2. Fetch both pregame and in-game predictions from 'predictions' table
			const { data: dbPredictions, error: predError } = await supabase
				.from("predictions")
				.select(
					"event_count, home_win_probability, away_win_probability, prediction_stage",
				)
				.eq("game_id", String(gameId))
				.in("prediction_stage", ["pregame", "in_game"])
				.order("event_count", { ascending: true });

			if (predError) throw predError;

			// Extract all pregame rows and grab the LATEST one to align with the active predictions run
			const pregameRows =
				dbPredictions?.filter((p) => p.prediction_stage === "pregame") || [];
			const pregameRow =
				pregameRows.length > 0 ? pregameRows[pregameRows.length - 1] : null;
			const homePregameProb = pregameRow
				? pregameRow.home_win_probability
				: 0.5;
			const awayPregameProb = pregameRow
				? pregameRow.away_win_probability
				: 0.5;

			// 3. Fetch initial closing odds from 'game_odds' table (where is_closing = true)
			const { data: dbOdds, error: oddsError } = await supabase
				.from("game_odds")
				.select(
					"bookmaker, home_moneyline, away_moneyline, over_under, is_closing",
				)
				.eq("game_id", String(gameId))
				.eq("is_closing", true)
				.order("id", { ascending: true });

			if (!oddsError && dbOdds && dbOdds.length > 0) {
				setGameOdds(dbOdds[0]);
			} else {
				setGameOdds(null);
			}

			const pbp = gameRow.play_by_play
				? typeof gameRow.play_by_play === "string"
					? JSON.parse(gameRow.play_by_play)
					: gameRow.play_by_play
				: {};

			const plays = pbp.plays || [];
			const homeTeamId = pbp.homeTeam?.id;

			const homeAbbrev =
				pbp?.homeTeam?.abbrev || getTeamAbbreviation(gameRow.home_team);
			const awayAbbrev =
				pbp?.awayTeam?.abbrev || getTeamAbbreviation(gameRow.away_team);
			const homeLogo =
				pbp?.homeTeam?.logo ||
				`https://assets.nhle.com/logos/nhl/svg/${homeAbbrev}_dark.svg`;
			const awayLogo =
				pbp?.awayTeam?.logo ||
				`https://assets.nhle.com/logos/nhl/svg/${awayAbbrev}_dark.svg`;

			// Build a fast O(1) player lookup mapping from rosterSpots
			const playerMap: Record<number, string> = {};
			if (pbp.rosterSpots) {
				pbp.rosterSpots.forEach((spot: any) => {
					const first = spot.firstName?.default || "";
					const last = spot.lastName?.default || "";
					playerMap[spot.playerId] = `${first} ${last}`.trim();
				});
			}

			let runningHomeScore = 0;
			let runningAwayScore = 0;

			// Find the first available in-game prediction
			const inGamePredictions =
				dbPredictions?.filter((p) => p.prediction_stage === "in_game") || [];

			// Start the timeline win probability at the pregame win probability
			const initialHomeProb =
				inGamePredictions.length > 0
					? inGamePredictions[0].home_win_probability
					: homePregameProb;

			let lastHomeWinProb = initialHomeProb;

			// Map to PlayEvent[]
			const trajectory: PlayEvent[] = plays.map((play: any, idx: number) => {
				const eventIndex = idx + 1;
				// Filter specifically for in-game predictions matching this event index
				const probRow = dbPredictions?.find(
					(p) =>
						p.prediction_stage === "in_game" && p.event_count === eventIndex,
				);
				// Carry forward the last calculated probability if this specific play event index doesn't have an explicit entry
				const homeWinProb = probRow
					? probRow.home_win_probability
					: lastHomeWinProb;
				lastHomeWinProb = homeWinProb;

				const period = play.periodDescriptor?.number || 1;
				const timeStr = play.timeInPeriod || "00:00";
				const periodSeconds = parseTimeInPeriod(timeStr);

				let secondsElapsed = 0;
				let secondsRemaining = 3600;
				if (period <= 3) {
					secondsElapsed = (period - 1) * 1200 + periodSeconds;
					secondsRemaining = Math.max(0, 3600 - secondsElapsed);
				} else {
					secondsElapsed = 3600 + periodSeconds;
					secondsRemaining = 0;
				}

				if (play.typeDescKey === "goal") {
					if (play.details?.eventOwnerTeamId === homeTeamId) {
						runningHomeScore++;
					} else {
						runningAwayScore++;
					}
				}

				return {
					seconds_elapsed: secondsElapsed,
					seconds_remaining: secondsRemaining,
					period: period,
					// Fix: Force uppercase event types so that chart nodes and stats counters match correctly
					event_type: (
						play.typeDescKey || "unknown"
					).toUpperCase() as NhlEventType,
					description: formatPlayDescription(
						play,
						playerMap,
						homeTeamId,
						homeAbbrev,
						awayAbbrev,
					),
					home_score: runningHomeScore,
					away_score: runningAwayScore,
					home_win_prob: homeWinProb,
				};
			});

			setGameDetail({
				game_id: gameId,
				home_team: {
					name: gameRow.home_team,
					logo: homeLogo,
					score: gameRow.home_score || 0,
					rolling_win_pct: homePregameProb,
				},
				away_team: {
					name: gameRow.away_team,
					logo: awayLogo,
					score: gameRow.away_score || 0,
					rolling_win_pct: awayPregameProb,
				},
				trajectory: trajectory,
			});

			setErrorMsg(null);
			setIsOnline(true);
		} catch (err: any) {
			console.error("Error fetching game detail from Supabase:", err);
			setErrorMsg(
				`Failed to load trajectory from Supabase: ${err.message || err}`,
			);
			setGameDetail(null);
		}
	};

	const handleSelectGame = (gameId: number | null) => {
		setSelectedGameId(gameId);
		setGameDetail(null); // Clear previous detail instantly to avoid visual lag/jitter
		setGameOdds(null); // Clear previous odds instantly
		setHoveredIndex(null);
		setClickedIndex(null);
		if (gameId) {
			fetchGameDetail(gameId);
		}
	};

	// Initial loading
	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchSchedule is stable and initial load only needs apiHost change
	useEffect(() => {
		fetchSchedule();
	}, [apiHost]);

	// Real-time polling logic
	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchGameDetail is stable and polling triggers periodically
	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval> | null = null;

		// Poll only if the active game is LIVE and polling is enabled
		const activeGame = games.find((g) => g.game_id === selectedGameId);
		const isLive =
			activeGame?.status === "LIVE" || activeGame?.status === "CRIT";

		if (isPolling && selectedGameId && isLive) {
			intervalId = setInterval(() => {
				fetchGameDetail(selectedGameId);
				// Also refresh schedule scores directly from Supabase
				fetchSchedule();
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
	const selectedGameStatus = (selectedGame?.status || "").toLowerCase();
	const isGameLive =
		selectedGameStatus === "live" || selectedGameStatus === "crit";

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

			{/* NHL-Style Horizontal Rolling Date Strip */}
			<div className="w-full overflow-hidden mb-6 border-b border-foreground/5 pb-2">
				<div className="flex gap-3 overflow-x-auto pt-2 pb-2 scrollbar-thin select-none snap-x snap-mandatory">
					{(() => {
						const dates = [];
						for (let i = -1; i <= 0; i++) {
							const d = new Date();
							d.setDate(d.getDate() + i);
							dates.push({
								offset: i,
								dayName:
									i === 0
										? "TODAY"
										: i === -1
											? "YESTERDAY"
											: d
													.toLocaleDateString([], { weekday: "short" })
													.toUpperCase(),
								dayNum: d.getDate(),
								monthName: d
									.toLocaleDateString([], { month: "short" })
									.toUpperCase(),
								isToday: i === 0,
							});
						}
						return dates.map((d) => (
							<button
								key={d.offset}
								type="button"
								onClick={() => handleDateTabChange(d.offset)}
								className={`flex flex-col items-center p-3 px-4 rounded-xl border shrink-0 w-24 snap-center transition-all cursor-pointer select-none outline-none ${
									dateOffset === d.offset
										? "bg-accent/15 border-accent text-accent shadow-lg shadow-accent/5 scale-105"
										: "bg-foreground/[0.02] border-foreground/5 hover:bg-foreground/[0.04] text-foreground/60"
								}`}
							>
								<span className="text-[9px] font-black tracking-widest leading-none mb-1">
									{d.dayName}
								</span>
								<span className="text-lg font-black leading-none my-0.5">
									{d.dayNum}
								</span>
								<span className="text-[8px] font-bold opacity-50 tracking-wider leading-none">
									{d.monthName}
								</span>
							</button>
						));
					})()}
				</div>
			</div>

			{/* Games Selector (Horizontal Carousel) */}
			<div className="mb-8 w-full overflow-hidden">
				<h3 className="text-sm font-bold opacity-40 uppercase tracking-widest mb-3 italic">
					{(() => {
						if (dateOffset === 0) return "Today's NHL Matchups";
						if (dateOffset === -1) return "Yesterday's NHL Matchups";
						if (dateOffset === 1) return "Tomorrow's NHL Matchups";
						const d = new Date();
						d.setDate(d.getDate() + dateOffset);
						return `${d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}'s NHL Matchups`;
					})()}
				</h3>
				{games.length === 0 ? (
					<div className="p-8 rounded-xl bg-foreground/[0.02] border border-foreground/5 text-center text-sm opacity-50">
						{isLoading
							? "Loading schedule..."
							: (() => {
									if (dateOffset === 0) return "No games scheduled for today.";
									if (dateOffset === -1)
										return "No games scheduled for yesterday.";
									if (dateOffset === 1)
										return "No games scheduled for tomorrow.";
									const d = new Date();
									d.setDate(d.getDate() + dateOffset);
									const dateStr = d.toLocaleDateString([], {
										weekday: "long",
										month: "short",
										day: "numeric",
									});
									return `No games scheduled for ${dateStr}.`;
								})()}
					</div>
				) : (
					<div className="flex gap-4 overflow-x-auto pb-3 w-full snap-x snap-mandatory scroll-smooth">
						{games.map((game) => (
							<button
								type="button"
								key={game.game_id}
								onClick={() => handleSelectGame(game.game_id)}
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
									{(() => {
										const statusLower = (game.status || "").toLowerCase();
										if (statusLower === "live" || statusLower === "crit") {
											return (
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
											);
										}
										if (statusLower === "final" || statusLower === "off") {
											return (
												<span className="text-neutral-400 font-extrabold">
													FINAL
													{game.period > 3
														? ` / ${game.period === 4 ? "OT" : `${game.period - 3}OT`}`
														: ""}
												</span>
											);
										}
										return <span className="text-blue-400">PRE-GAME</span>;
									})()}
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
							<div className="text-center shrink-0 flex flex-col items-center justify-center">
								{(() => {
									const statusText = getGameStatusText(
										gameDetail,
										selectedGame,
										activeIndex,
										isGameLive,
									);
									const isLiveOrIntermission =
										statusText.startsWith("LIVE") ||
										statusText.includes("Intermission") ||
										statusText.includes("Period");
									const isFinal = statusText.includes("FINAL");

									return (
										<span
											className={`px-3.5 py-1.5 rounded-lg border text-xs font-extrabold uppercase tracking-wider italic ${
												isLiveOrIntermission
													? "bg-accent/10 border-accent/20 text-accent animate-pulse"
													: isFinal
														? "bg-foreground/5 border-foreground/5 text-neutral-400 font-extrabold"
														: "bg-foreground/5 border-foreground/5 text-neutral-400"
											}`}
										>
											{statusText}
										</span>
									);
								})()}
								{gameOdds && (
									<div className="mt-3.5 inline-flex flex-col items-center px-3 py-1.5 rounded-xl bg-foreground/[0.03] border border-foreground/5 text-[10px] font-extrabold text-neutral-400 select-none italic">
										<div className="uppercase tracking-widest text-[8px] opacity-50 mb-0.5 font-black">
											Vegas Closing Line (Puck Drop)
										</div>
										<div className="flex gap-2">
											<span>
												{selectedGame.away.abbrev}{" "}
												{formatAmericanOdds(gameOdds.away_moneyline)}
											</span>
											<span className="opacity-35 font-normal">|</span>
											<span>
												{selectedGame.home.abbrev}{" "}
												{formatAmericanOdds(gameOdds.home_moneyline)}
											</span>
										</div>
										{gameOdds.over_under && (
											<div className="text-[9px] opacity-65 mt-0.5">
												O/U {gameOdds.over_under}
											</div>
										)}
									</div>
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
							<div className="flex flex-col items-center shrink-0 px-1 text-center justify-center">
								{(() => {
									const statusText = getGameStatusText(
										gameDetail,
										selectedGame,
										activeIndex,
										isGameLive,
									);
									const isLiveOrIntermission =
										statusText.startsWith("LIVE") ||
										statusText.includes("Intermission") ||
										statusText.includes("Period");
									const isFinal = statusText.includes("FINAL");

									return (
										<span
											className={`px-2 py-0.5 rounded border text-[8px] font-extrabold uppercase tracking-widest ${
												isLiveOrIntermission
													? "bg-accent/10 border-accent/20 text-accent animate-pulse"
													: isFinal
														? "bg-foreground/5 border-foreground/5 text-neutral-400 font-extrabold"
														: "bg-foreground/5 border-foreground/5 text-neutral-400"
											}`}
										>
											{statusText}
										</span>
									);
								})()}
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

						{gameOdds && (
							<div className="flex md:hidden flex-col items-center mt-4 p-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/5 text-[9px] font-extrabold text-neutral-400 w-full select-none italic">
								<div className="uppercase tracking-widest text-[8px] opacity-50 mb-0.5 font-black">
									Vegas Closing Line (Puck Drop)
								</div>
								<div className="flex gap-2">
									<span>
										{selectedGame.away.abbrev}{" "}
										{formatAmericanOdds(gameOdds.away_moneyline)}
									</span>
									<span className="opacity-35 font-normal">|</span>
									<span>
										{selectedGame.home.abbrev}{" "}
										{formatAmericanOdds(gameOdds.home_moneyline)}
									</span>
									{gameOdds.over_under && (
										<>
											<span className="opacity-35 font-normal">|</span>
											<span>O/U {gameOdds.over_under}</span>
										</>
									)}
								</div>
							</div>
						)}

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
							Win Probability
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

										{/* Dynamic Period Grid Dividers */}
										{(() => {
											const tMax = gameDetail?.trajectory?.length
												? Math.max(
														3600,
														gameDetail.trajectory[
															gameDetail.trajectory.length - 1
														].seconds_elapsed,
													)
												: 3600;

											const xP1 = (1200 / tMax) * 760 + 20;
											const xP2 = (2400 / tMax) * 760 + 20;
											const xP3 = (3600 / tMax) * 760 + 20;

											// Only show the OT divider and label if the OT section has grown wide enough (>= 55px) to not cause label overlap
											const showOTDivider = tMax > 3600 && 780 - xP3 >= 55;

											return (
												<>
													{/* End of Period 1 Divider */}
													<line
														x1={xP1}
														y1="20"
														x2={xP1}
														y2="230"
														stroke="currentColor"
														strokeOpacity="0.15"
														strokeDasharray="4"
													/>
													<text
														x={xP1 + 5}
														y="32"
														className="fill-foreground/45 font-bold text-[11px] md:text-[9px] italic select-none"
													>
														END P1
													</text>

													{/* End of Period 2 Divider */}
													<line
														x1={xP2}
														y1="20"
														x2={xP2}
														y2="230"
														stroke="currentColor"
														strokeOpacity="0.15"
														strokeDasharray="4"
													/>
													<text
														x={xP2 + 5}
														y="32"
														className="fill-foreground/45 font-bold text-[11px] md:text-[9px] italic select-none"
													>
														END P2
													</text>

													{/* End of Period 3 Divider */}
													<line
														x1={xP3}
														y1="20"
														x2={xP3}
														y2="230"
														stroke="currentColor"
														strokeOpacity="0.15"
														strokeDasharray="4"
													/>
													<text
														x={xP3 - 48} // Always draw to the left of the line to prevent any overlap
														y="32"
														className="fill-foreground/45 font-bold text-[11px] md:text-[9px] italic select-none"
													>
														END P3
													</text>

													{/* End of Overtime Divider (Only if OT has sufficient width) */}
													{showOTDivider && (
														<>
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
																className="fill-foreground/45 font-bold text-[11px] md:text-[9px] italic select-none"
															>
																END OT
															</text>
														</>
													)}
												</>
											);
										})()}

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
													coords,
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

					{/* Two-column layout for Event Feed and Stats Aggregation */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Left Column: Interactive Play-by-Play Event Feed Scroller */}
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
																		onMouseEnter={() =>
																			setHoveredIndex(realIdx)
																		}
																		onMouseLeave={() => setHoveredIndex(null)}
																		onClick={() =>
																			setClickedIndex(
																				realIdx === clickedIndex
																					? null
																					: realIdx,
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

						{/* Right Column: Game Stats Aggregation Card */}
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<h3 className="text-sm font-bold opacity-40 uppercase tracking-widest italic">
									Live Team Stats Aggregation
								</h3>
								{activeIndex !== null && (
									<span className="text-xs font-bold text-accent animate-pulse select-none bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
										Scrubber Active
									</span>
								)}
							</div>

							<div className="border border-foreground/5 rounded-2xl p-4 md:p-6 bg-foreground/[0.01] shadow-inner space-y-6">
								{(() => {
									const stats = getAggregatedStats(
										gameDetail,
										selectedGame,
										activeIndex,
									);
									const homeColor = getTeamColor(
										selectedGame.home.name,
										selectedGame.home.abbrev,
									);
									const awayColor = getTeamColor(
										selectedGame.away.name,
										selectedGame.away.abbrev,
									);

									// Determine status text based on active scrubber
									let statusText = "Showing Final Game Stats";
									if (activeIndex !== null && gameDetail) {
										const activeEvent = gameDetail.trajectory[activeIndex];
										if (activeEvent) {
											const p = activeEvent.period;
											const min = Math.floor(
												((3600 - activeEvent.seconds_remaining) % 1200) / 60,
											);
											const sec = String(
												Math.floor((3600 - activeEvent.seconds_remaining) % 60),
											).padStart(2, "0");
											statusText = `Stats up to: ${p <= 3 ? `P${p}` : p === 4 ? "OT" : `${p - 3}OT`} • ${min}:${sec}`;
										}
									}

									return (
										<>
											<div className="flex justify-between items-center border-b border-foreground/5 pb-3">
												<div className="flex items-center gap-2">
													<img
														src={selectedGame.home.logo}
														alt=""
														className="w-6 h-6 shrink-0"
													/>
													<span className="font-extrabold italic text-sm">
														{selectedGame.home.abbrev}
													</span>
												</div>
												<span className="text-[10px] md:text-xs font-bold opacity-50 px-2.5 py-1 rounded-lg bg-foreground/5 select-none uppercase tracking-wider tabular-nums">
													{statusText}
												</span>
												<div className="flex items-center gap-2">
													<span className="font-extrabold italic text-sm">
														{selectedGame.away.abbrev}
													</span>
													<img
														src={selectedGame.away.logo}
														alt=""
														className="w-6 h-6 shrink-0"
													/>
												</div>
											</div>

											<div className="space-y-1">
												<StatRow
													label="Goals"
													homeVal={stats.home.goals}
													awayVal={stats.away.goals}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
												<StatRow
													label="Shots on Goal"
													homeVal={stats.home.shots}
													awayVal={stats.away.shots}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
												<StatRow
													label="Blocked Shots"
													homeVal={stats.home.blocked}
													awayVal={stats.away.blocked}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
												<StatRow
													label="Faceoff Wins"
													homeVal={stats.home.faceoffs}
													awayVal={stats.away.faceoffs}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
												<StatRow
													label="Hits"
													homeVal={stats.home.hits}
													awayVal={stats.away.hits}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
												<StatRow
													label="Takeaways"
													homeVal={stats.home.takeaways}
													awayVal={stats.away.takeaways}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
												<StatRow
													label="Giveaways"
													homeVal={stats.home.giveaways}
													awayVal={stats.away.giveaways}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
												<StatRow
													label="Penalties"
													homeVal={stats.home.penalties}
													awayVal={stats.away.penalties}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
												<StatRow
													label="Missed Shots"
													homeVal={stats.home.missed}
													awayVal={stats.away.missed}
													homeColor={homeColor}
													awayColor={awayColor}
												/>
											</div>
										</>
									);
								})()}
							</div>
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
