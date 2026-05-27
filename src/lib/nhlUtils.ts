import type {
	CoordinatePoint,
	DualTeamStats,
	Game,
	GameDetail,
	PlayEvent,
} from "../types/nhl";

/**
 * Format decimal moneyline odds to American format (+150, -110)
 */
export const formatAmericanOdds = (decimal: number | undefined): string => {
	if (!decimal) return "";
	if (decimal >= 2.0) {
		const val = Math.round((decimal - 1) * 100);
		return `+${val}`;
	}
	const val = Math.round(100 / (decimal - 1));
	return `-${val}`;
};

/**
 * Parse a standard NHL time string ("MM:SS") into elapsed seconds in the period
 */
export const parseTimeInPeriod = (timeStr: string): number => {
	if (!timeStr || !timeStr.includes(":")) return 0;
	const parts = timeStr.split(":");
	return Number.parseInt(parts[0], 10) * 60 + Number.parseInt(parts[1], 10);
};

/**
 * Get color representations based on win probability strength
 */
export const getProbabilityColor = (prob: number): string => {
	if (prob >= 0.75) return "text-emerald-500 shadow-emerald-500/20";
	if (prob >= 0.55) return "text-blue-500 shadow-blue-500/20";
	if (prob >= 0.45) return "text-neutral-400 shadow-neutral-400/20";
	if (prob >= 0.25) return "text-amber-500 shadow-amber-500/20";
	return "text-red-500 shadow-red-500/20";
};

/**
 * Custom play formatter to build granular, human-readable descriptors
 */
export const formatPlayDescription = (
	play: any,
	playerMap: Record<number, string>,
	homeTeamId: number,
	homeAbbrev: string,
	awayAbbrev: string,
): string => {
	const type = play.typeDescKey || "";
	const details = play.details || {};
	const teamId = details.eventOwnerTeamId;
	const teamAbbrev =
		teamId === homeTeamId ? homeAbbrev : teamId ? awayAbbrev : "";
	const teamPrefix = teamAbbrev ? `[${teamAbbrev}] ` : "";

	const getPlayerName = (id: number | undefined): string => {
		if (!id) return "";
		return playerMap[id] || `Player #${id}`;
	};

	const cleanTypeName = (t: string): string => {
		return t
			.split("-")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");
	};

	switch (type) {
		case "goal": {
			const scorer = getPlayerName(details.scoringPlayerId);
			const assist1 = getPlayerName(details.assist1PlayerId);
			const assist2 = getPlayerName(details.assist2PlayerId);
			let desc = `${teamPrefix}GOAL: ${scorer}`;
			const assists = [assist1, assist2].filter(Boolean);
			if (assists.length > 0) {
				desc += ` (Assists: ${assists.join(", ")})`;
			} else {
				desc += " (Unassisted)";
			}
			return desc;
		}
		case "hit": {
			const hitter = getPlayerName(details.hittingPlayerId) || "Player";
			const hittee = getPlayerName(details.hitteePlayerId) || "Player";
			return `${teamPrefix}Hit: ${hitter} on ${hittee}`;
		}
		case "shot-on-goal": {
			const shooter = getPlayerName(details.shootingPlayerId) || "Player";
			const goalie = getPlayerName(details.goalieInNetId);
			let desc = `${teamPrefix}Shot on Goal: ${shooter}`;
			if (goalie) desc += ` (Saved by ${goalie})`;
			return desc;
		}
		case "missed-shot": {
			const shooter = getPlayerName(details.shootingPlayerId) || "Player";
			return `${teamPrefix}Missed Shot: ${shooter}`;
		}
		case "blocked-shot": {
			const blocker = getPlayerName(details.blockingPlayerId) || "Player";
			const shooter = getPlayerName(details.shootingPlayerId) || "Player";
			return `${teamPrefix}Shot Blocked: by ${blocker} (Shot by ${shooter})`;
		}
		case "penalty": {
			const committed = getPlayerName(details.committedByPlayerId) || "Player";
			const drawn = getPlayerName(details.drawnByPlayerId);
			const pType = details.descKey
				? cleanTypeName(details.descKey)
				: "Penalty";
			const mins = details.duration ? `${details.duration} min ` : "";
			let desc = `${teamPrefix}Penalty: ${mins}${pType} on ${committed}`;
			if (drawn) desc += ` (drawn by ${drawn})`;
			return desc;
		}
		case "faceoff": {
			const winner = getPlayerName(details.winningPlayerId) || "Player";
			const loser = getPlayerName(details.losingPlayerId) || "Player";
			return `${teamPrefix}Faceoff Won: ${winner} (vs ${loser})`;
		}
		case "stoppage": {
			const reason = details.reason
				? cleanTypeName(details.reason)
				: "Stoppage";
			return `Stoppage: ${reason}`;
		}
		case "takeaway": {
			const player = getPlayerName(details.playerId) || "Player";
			return `${teamPrefix}Takeaway: ${player}`;
		}
		case "giveaway": {
			const player = getPlayerName(details.playerId) || "Player";
			return `${teamPrefix}Giveaway: ${player}`;
		}
		case "period-start":
			return `Period ${play.periodDescriptor?.number || 1} Start`;
		case "period-end":
			return `Period ${play.periodDescriptor?.number || 1} End`;
		case "game-end":
			return "Game End";
		default:
			return teamPrefix
				? `${teamPrefix}${cleanTypeName(type)}`
				: cleanTypeName(type);
	}
};

/**
 * Dynamic live team stats aggregation up to the active index
 */
export const getAggregatedStats = (
	gameDetail: GameDetail | null,
	selectedGame: Game | undefined,
	activeIndex: number | null,
): DualTeamStats => {
	const stats: DualTeamStats = {
		home: {
			goals: 0,
			shots: 0,
			blocked: 0,
			takeaways: 0,
			giveaways: 0,
			faceoffs: 0,
			penalties: 0,
			hits: 0,
			missed: 0,
		},
		away: {
			goals: 0,
			shots: 0,
			blocked: 0,
			takeaways: 0,
			giveaways: 0,
			faceoffs: 0,
			penalties: 0,
			hits: 0,
			missed: 0,
		},
	};

	if (!gameDetail || !selectedGame) return stats;

	// Aggregate up to active scrubber index, or total game if inactive
	const limitIdx =
		activeIndex !== null ? activeIndex : gameDetail.trajectory.length - 1;

	for (let i = 0; i <= limitIdx; i++) {
		const event = gameDetail.trajectory[i];
		const desc = event.description || "";

		// Match bracket team prefix like "[BUF]" or "[NSH]"
		const match = desc.match(/^\[([A-Z0-9]+)\]/);
		if (!match) continue;

		const teamAbbrev = match[1];
		const isHome = teamAbbrev === selectedGame.home.abbrev;
		const target = isHome ? stats.home : stats.away;

		const type = event.event_type;
		if (type === "GOAL") {
			target.goals++;
		} else if (type === "SHOT-ON-GOAL") {
			target.shots++;
		} else if (type === "BLOCKED-SHOT") {
			target.blocked++;
		} else if (type === "TAKEAWAY") {
			target.takeaways++;
		} else if (type === "GIVEAWAY") {
			target.giveaways++;
		} else if (type === "FACEOFF") {
			target.faceoffs++;
		} else if (type === "PENALTY") {
			target.penalties++;
		} else if (type === "HIT") {
			target.hits++;
		} else if (type === "MISSED-SHOT") {
			target.missed++;
		}
	}

	return stats;
};

/**
 * Dynamic live game status display text resolving period end intermissions
 */
export const getGameStatusText = (
	gameDetail: GameDetail | null,
	selectedGame: Game | undefined,
	activeIndex: number | null,
	isGameLive: boolean,
): string => {
	if (!gameDetail || !selectedGame) return "VS";

	const activeIdx =
		activeIndex !== null ? activeIndex : gameDetail.trajectory.length - 1;
	const event = gameDetail.trajectory[activeIdx];
	if (!event) return "VS";

	const isTied = event.home_score === event.away_score;
	const type = (event.event_type || "").toLowerCase();
	const selectedGameStatus = (selectedGame.status || "").toLowerCase();

	// Period end or intermission handling
	if (
		type === "period-end" ||
		type === "period_end" ||
		type === "period-end-intermission"
	) {
		if (selectedGameStatus === "live" || selectedGameStatus === "crit") {
			if (event.period === 1) return "1st Intermission";
			if (event.period === 2) return "2nd Intermission";
			if (event.period === 3) return "End of Regulation";
			return `End of Period ${event.period}`;
		}

		if (isTied) {
			if (event.period === 3) return "END OF REGULATION";
			if (event.period > 3) {
				const otNum = event.period - 3;
				return otNum === 1 ? "END OF OT" : `END OF ${otNum}OT`;
			}
		} else {
			if (event.period >= 3) {
				return event.period === 3
					? "FINAL"
					: event.period === 4
						? "FINAL / OT"
						: `FINAL / ${event.period - 3}OT`;
			}
		}
	}

	if (type === "game-end" || type === "game_end") {
		if (event.period > 3) {
			return event.period === 4
				? "FINAL / OT"
				: `FINAL / ${event.period - 3}OT`;
		}
		return "FINAL";
	}

	// If it's a live game state, display LIVE or period details
	if (isGameLive) {
		const periodStr =
			event.period <= 3
				? `Period ${event.period}`
				: event.period === 4
					? "OT"
					: `${event.period - 3}OT`;
		return `LIVE / ${periodStr}`;
	}

	// Fallback to FINAL for completed games
	if (selectedGameStatus === "final" || selectedGameStatus === "off") {
		if (event.period > 3) {
			return event.period === 4
				? "FINAL / OT"
				: `FINAL / ${event.period - 3}OT`;
		}
		return "FINAL";
	}

	return "VS";
};

/**
 * Map coordinates for win probability SVG trajectory chart
 */
export const getCoordinates = (traj: PlayEvent[]): CoordinatePoint[] => {
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
		const y = svgHeight - (pt.home_win_prob * (svgHeight - 40) + 20);

		return { x, y, pt, idx: i };
	});
};

/**
 * Determine scoring team's color for goal marker on the timeline chart
 */
export const getGoalScorerColor = (
	idx: number,
	coords: CoordinatePoint[],
	homeColor: string,
	awayColor: string,
): string => {
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
