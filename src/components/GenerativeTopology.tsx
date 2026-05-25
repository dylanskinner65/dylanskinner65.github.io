import { useEffect, useRef, useState } from "react";

// Pre-define 16 vertices of a 4D Hypercube (Tesseract) centered at the origin
const VERTICES_4D: number[][] = [];
for (const x of [-1, 1]) {
	for (const y of [-1, 1]) {
		for (const z of [-1, 1]) {
			for (const w of [-1, 1]) {
				VERTICES_4D.push([x, y, z, w]);
			}
		}
	}
}

// Connect vertices that differ by exactly 1 coordinate (32 edges in a Tesseract)
const EDGES_4D: [number, number][] = [];
for (let i = 0; i < 16; i++) {
	for (let j = i + 1; j < 16; j++) {
		let diffs = 0;
		for (let k = 0; k < 4; k++) {
			if (VERTICES_4D[i][k] !== VERTICES_4D[j][k]) diffs++;
		}
		if (diffs === 1) {
			EDGES_4D.push([i, j]);
		}
	}
}

export function GenerativeTopology() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
	const [points, setPoints] = useState<{ x: number; y: number; z: number }[]>(
		[],
	);

	// Animation state
	const anglesRef = useRef({ xy: 0, zw: 0, xw: 0, x3d: 0, y3d: 0 });
	const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

	// Resize handler
	useEffect(() => {
		if (!containerRef.current) return;
		const handleResize = () => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (rect) {
				setDimensions({
					width: rect.width || 400,
					height: rect.height || 400,
				});
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		// Setup mouse move tracking
		const handleMouseMove = (e: MouseEvent) => {
			const cx = window.innerWidth / 2;
			const cy = window.innerHeight / 2;
			// Normalize cursor from -1 to 1
			mouseRef.current.targetX = (e.clientX - cx) / cx;
			mouseRef.current.targetY = (e.clientY - cy) / cy;
		};
		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	// Mathematical rotation loop
	useEffect(() => {
		let animationId: number;

		const loop = () => {
			// Base incremental angles
			anglesRef.current.xy += 0.003;
			anglesRef.current.zw += 0.005;
			anglesRef.current.xw += 0.002;

			// Smooth cursor interpolation (damping)
			mouseRef.current.x +=
				(mouseRef.current.targetX - mouseRef.current.x) * 0.05;
			mouseRef.current.y +=
				(mouseRef.current.targetY - mouseRef.current.y) * 0.05;

			// Set 3D rotation angles tied to mouse offset
			anglesRef.current.x3d = mouseRef.current.y * 0.8;
			anglesRef.current.y3d = mouseRef.current.x * 0.8;

			const { xy, zw, xw, x3d, y3d } = anglesRef.current;

			// Compute 4D-to-3D projection
			const projectedPoints = VERTICES_4D.map((vertex) => {
				const [x, y, z, w] = vertex;

				// Rotation in XY Plane
				const cosXY = Math.cos(xy);
				const sinXY = Math.sin(xy);
				const x1 = x * cosXY - y * sinXY;
				const y1 = x * sinXY + y * cosXY;

				// Rotation in ZW Plane
				const cosZW = Math.cos(zw);
				const sinZW = Math.sin(zw);
				const z1 = z * cosZW - w * sinZW;
				const w1 = z * sinZW + w * cosZW;

				// Rotation in XW Plane
				const cosXW = Math.cos(xw);
				const sinXW = Math.sin(xw);
				const x2 = x1 * cosXW - w1 * sinXW;
				const w2 = x1 * sinXW + w1 * cosXW;

				// 4D Perspective Division (Hyperperspective Projection onto 3D Space)
				const wDistance = 2.2;
				const perspectiveScale = 1 / (wDistance - w2);
				const x3 = x2 * perspectiveScale;
				const y3 = y1 * perspectiveScale;
				const z3 = z1 * perspectiveScale;

				// Apply 3D Rotations (Mouse interactions)
				// Rotate around X-axis
				const cosX3D = Math.cos(x3d);
				const sinX3D = Math.sin(x3d);
				const y4 = y3 * cosX3D - z3 * sinX3D;
				const z4 = y3 * sinX3D + z3 * cosX3D;

				// Rotate around Y-axis
				const cosY3D = Math.cos(y3d);
				const sinY3D = Math.sin(y3d);
				const x5 = x3 * cosY3D + z4 * sinY3D;
				const z5 = -x3 * sinY3D + z4 * cosY3D;

				return { x: x5, y: y4, z: z5 };
			});

			setPoints(projectedPoints);
			animationId = requestAnimationFrame(loop);
		};

		loop();
		return () => cancelAnimationFrame(animationId);
	}, []);

	// Project 3D points onto responsive 2D screen coordinates
	const scale = Math.min(dimensions.width, dimensions.height) * 0.35;
	const cx = dimensions.width / 2;
	const cy = dimensions.height / 2;
	const zOffset = 2.0;

	const projected2D = points.map((p) => {
		// 3D Perspective Projection to 2D
		const depth = 1 / (zOffset - p.z);
		return {
			x: p.x * depth * scale + cx,
			y: p.y * depth * scale + cy,
			z: p.z, // Keep depth for shading
		};
	});

	return (
		<div
			ref={containerRef}
			className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0"
		>
			<svg
				width={dimensions.width}
				height={dimensions.height}
				viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
				className="w-full h-full opacity-60 dark:opacity-30 transition-opacity duration-1000"
				role="img"
				aria-label="Generative Topology Background"
			>
				<title>Generative Topology Background</title>
				<defs>
					<radialGradient id="meshGradient" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
						<stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* Floating ambient glow backing the Tesseract */}
				<circle
					cx={cx}
					cy={cy}
					r={scale * 1.5}
					fill="url(#meshGradient)"
					className="animate-pulse"
					style={{ animationDuration: "8s" }}
				/>

				{/* Render the 32 hypercube edges */}
				{projected2D.length === 16 &&
					EDGES_4D.map(([i, j], edgeIdx) => {
						const p1 = projected2D[i];
						const p2 = projected2D[j];

						// Depth shading calculations: Edges in the foreground are brighter/thicker
						const avgZ = (p1.z + p2.z) / 2;
						const opacity = Math.max(0.08, (avgZ + 1) / 2); // Shift from 0.08 to ~0.8
						const strokeWidth = Math.max(0.5, ((avgZ + 1.2) / 2) * 1.5);

						return (
							<line
								// biome-ignore lint/suspicious/noArrayIndexKey: unique static identifier derived from indices
								key={`edge-${edgeIdx}`}
								x1={p1.x}
								y1={p1.y}
								x2={p2.x}
								y2={p2.y}
								stroke="var(--accent)"
								strokeWidth={strokeWidth}
								strokeOpacity={opacity}
								className="transition-all duration-300"
							/>
						);
					})}

				{/* Render the 16 vertices as small glowing nodes */}
				{projected2D.map((p, nodeIdx) => {
					const radius = Math.max(1, ((p.z + 1.2) / 2) * 3);
					const opacity = Math.max(0.1, (p.z + 1) / 2);

					return (
						<circle
							// biome-ignore lint/suspicious/noArrayIndexKey: unique static identifier derived from index
							key={`node-${nodeIdx}`}
							cx={p.x}
							cy={p.y}
							r={radius}
							fill="var(--accent)"
							fillOpacity={opacity}
						/>
					);
				})}
			</svg>
		</div>
	);
}
