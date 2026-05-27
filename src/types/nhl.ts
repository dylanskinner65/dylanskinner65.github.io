export interface Team {
	id: number;
	name: string;
	abbrev: string;
	logo: string;
	score: number;
}

export interface Game {
	game_id: number;
	start_time: string;
	status: string;
	period: number;
	period_type: string;
	home: Team;
	away: Team;
}

export type NhlEventType =
	| "GOAL"
	| "SHOT-ON-GOAL"
	| "BLOCKED-SHOT"
	| "TAKEAWAY"
	| "GIVEAWAY"
	| "FACEOFF"
	| "PENALTY"
	| "HIT"
	| "MISSED-SHOT"
	| "PERIOD-START"
	| "PERIOD-END"
	| "GAME-END"
	| "STOPPAGE"
	| "UNKNOWN";

export interface PlayEvent {
	seconds_elapsed: number;
	seconds_remaining: number;
	period: number;
	event_type: NhlEventType;
	description: string;
	home_score: number;
	away_score: number;
	home_win_prob: number;
}

export interface GameDetail {
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

export interface GameOdds {
	bookmaker: string;
	home_moneyline: number;
	away_moneyline: number;
	over_under: number;
	is_closing: boolean;
}

export interface StatRowProps {
	label: string;
	homeVal: number;
	awayVal: number;
	homeColor: string;
	awayColor: string;
}

export interface AggregatedStats {
	goals: number;
	shots: number;
	blocked: number;
	takeaways: number;
	giveaways: number;
	faceoffs: number;
	penalties: number;
	hits: number;
	missed: number;
}

export interface DualTeamStats {
	home: AggregatedStats;
	away: AggregatedStats;
}

export interface CoordinatePoint {
	x: number;
	y: number;
	pt: PlayEvent;
	idx: number;
}
