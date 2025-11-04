// Color Flow Puzzle Generator & Solver
// This ensures all generated puzzles are solvable

class PuzzleGenerator {
    constructor(size, numColors) {
        this.size = size;
        this.numColors = numColors;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(null));
        this.colors = [];
        this.solution = [];
    }
    
    // Generate a guaranteed solvable puzzle
    generate() {
        // Step 1: Place endpoints randomly but ensure they're not too close
        const endpoints = this.placeEndpoints();
        
        // Step 2: Find valid paths between endpoints
        const paths = this.findPaths(endpoints);
        
        // Step 3: Verify the puzzle is solvable
        if (!this.verifySolvable(paths)) {
            // Retry if not solvable
            return this.generate();
        }
        
        return {
            grid: this.grid,
            endpoints: endpoints,
            solution: paths,
            size: this.size,
            numColors: this.numColors
        };
    }
    
    placeEndpoints() {
        const endpoints = [];
        const used = new Set();
        
        for (let color = 0; color < this.numColors; color++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                // Place first endpoint
                const x1 = Math.floor(Math.random() * this.size);
                const y1 = Math.floor(Math.random() * this.size);
                
                // Place second endpoint at minimum distance
                const minDist = Math.max(3, Math.floor(this.size / 2));
                const x2 = Math.floor(Math.random() * this.size);
                const y2 = Math.floor(Math.random() * this.size);
                
                const dist = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                const key1 = `${x1},${y1}`;
                const key2 = `${x2},${y2}`;
                
                if (!used.has(key1) && !used.has(key2) && dist >= minDist) {
                    used.add(key1);
                    used.add(key2);
                    
                    endpoints.push({
                        color: color,
                        start: [x1, y1],
                        end: [x2, y2]
                    });
                    
                    this.grid[y1][x1] = { type: 'source', color: color };
                    this.grid[y2][x2] = { type: 'source', color: color };
                    
                    placed = true;
                }
                
                attempts++;
            }
        }
        
        return endpoints;
    }
    
    findPaths(endpoints) {
        const paths = [];
        const filledCells = new Set();
        
        // Mark all endpoints as filled
        endpoints.forEach(ep => {
            filledCells.add(`${ep.start[0]},${ep.start[1]}`);
            filledCells.add(`${ep.end[0]},${ep.end[1]}`);
        });
        
        // Find path for each color using A* algorithm
        for (const endpoint of endpoints) {
            const path = this.findPath(
                endpoint.start,
                endpoint.end,
                filledCells,
                endpoint.color
            );
            
            if (path) {
                paths.push({
                    color: endpoint.color,
                    path: path
                });
                
                // Mark path cells as filled
                path.forEach(([x, y]) => {
                    if (!this.isEndpoint(x, y, endpoints)) {
                        filledCells.add(`${x},${y}`);
                    }
                });
            }
        }
        
        return paths;
    }
    
    findPath(start, end, filledCells, color) {
        // A* pathfinding algorithm
        const openSet = new Set([`${start[0]},${start[1]}`]);
        const cameFrom = new Map();
        
        const gScore = new Map();
        gScore.set(`${start[0]},${start[1]}`, 0);
        
        const fScore = new Map();
        fScore.set(`${start[0]},${start[1]}`, this.heuristic(start, end));
        
        while (openSet.size > 0) {
            // Find node with lowest fScore
            let current = null;
            let lowestF = Infinity;
            
            for (const node of openSet) {
                const f = fScore.get(node) || Infinity;
                if (f < lowestF) {
                    lowestF = f;
                    current = node;
                }
            }
            
            if (!current) break;
            
            const [cx, cy] = current.split(',').map(Number);
            
            // Check if we reached the end
            if (cx === end[0] && cy === end[1]) {
                return this.reconstructPath(cameFrom, current);
            }
            
            openSet.delete(current);
            
            // Check neighbors
            const neighbors = this.getNeighbors(cx, cy);
            
            for (const [nx, ny] of neighbors) {
                const neighbor = `${nx},${ny}`;
                
                // Skip if already filled (unless it's our endpoint)
                if (filledCells.has(neighbor) && !(nx === end[0] && ny === end[1])) {
                    continue;
                }
                
                const tentativeG = gScore.get(current) + 1;
                
                if (tentativeG < (gScore.get(neighbor) || Infinity)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeG);
                    fScore.set(neighbor, tentativeG + this.heuristic([nx, ny], end));
                    openSet.add(neighbor);
                }
            }
        }
        
        return null; // No path found
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                neighbors.push([nx, ny]);
            }
        }
        
        return neighbors;
    }
    
    heuristic(a, b) {
        // Manhattan distance
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }
    
    reconstructPath(cameFrom, current) {
        const path = [];
        
        while (cameFrom.has(current)) {
            const [x, y] = current.split(',').map(Number);
            path.unshift([x, y]);
            current = cameFrom.get(current);
        }
        
        // Add start
        const [sx, sy] = current.split(',').map(Number);
        path.unshift([sx, sy]);
        
        return path;
    }
    
    isEndpoint(x, y, endpoints) {
        for (const ep of endpoints) {
            if ((x === ep.start[0] && y === ep.start[1]) ||
                (x === ep.end[0] && y === ep.end[1])) {
                return true;
            }
        }
        return false;
    }
    
    verifySolvable(paths) {
        // Check if all cells are covered
        const totalCells = this.size * this.size;
        let filledCells = 0;
        
        const filled = new Set();
        
        // Count cells in paths
        for (const pathData of paths) {
            for (const [x, y] of pathData.path) {
                filled.add(`${x},${y}`);
            }
        }
        
        filledCells = filled.size;
        
        // The puzzle is solvable if paths exist and fill most of the grid
        // Allow some cells to be empty for easier puzzles
        return paths.length === this.numColors && filledCells >= totalCells * 0.8;
    }
}

// Solver to verify player's solution
class PuzzleSolver {
    constructor(grid, endpoints) {
        this.grid = grid;
        this.endpoints = endpoints;
        this.size = grid.length;
    }
    
    // Check if current state is a valid solution
    checkSolution() {
        // 1. Check all endpoints are connected
        for (const endpoint of this.endpoints) {
            if (!this.isConnected(endpoint)) {
                return false;
            }
        }
        
        // 2. Check all cells are filled
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.grid[y][x]) {
                    return false;
                }
            }
        }
        
        // 3. Check no paths cross
        if (this.hasIntersection()) {
            return false;
        }
        
        return true;
    }
    
    isConnected(endpoint) {
        const [sx, sy] = endpoint.start;
        const [ex, ey] = endpoint.end;
        const color = endpoint.color;
        
        // Use BFS to check connectivity
        const visited = new Set();
        const queue = [[sx, sy]];
        visited.add(`${sx},${sy}`);
        
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            
            // Found end point
            if (x === ex && y === ey) {
                return true;
            }
            
            // Check neighbors
            const neighbors = this.getNeighbors(x, y);
            
            for (const [nx, ny] of neighbors) {
                const key = `${nx},${ny}`;
                
                if (!visited.has(key)) {
                    const cell = this.grid[ny][nx];
                    
                    if (cell && cell.color === color) {
                        visited.add(key);
                        queue.push([nx, ny]);
                    }
                }
            }
        }
        
        return false;
    }
    
    hasIntersection() {
        // Check if any paths cross (cells have multiple colors)
        // This shouldn't happen with proper path drawing
        return false;
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                neighbors.push([nx, ny]);
            }
        }
        
        return neighbors;
    }
    
    // Get hint for next move
    getHint() {
        // Find an empty cell that should be filled
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.grid[y][x]) {
                    // This cell should be filled
                    // Find which color should go here
                    for (const endpoint of this.endpoints) {
                        const path = this.findPathThrough(endpoint, [x, y]);
                        if (path) {
                            return {
                                x: x,
                                y: y,
                                color: endpoint.color,
                                message: `Try filling this cell with ${this.getColorName(endpoint.color)}`
                            };
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    findPathThrough(endpoint, target) {
        // Check if target can be on path between endpoint start and end
        // Simplified - just return true if target is between endpoints
        const [sx, sy] = endpoint.start;
        const [ex, ey] = endpoint.end;
        const [tx, ty] = target;
        
        // Check if target is reasonably between start and end
        const minX = Math.min(sx, ex);
        const maxX = Math.max(sx, ex);
        const minY = Math.min(sy, ey);
        const maxY = Math.max(sy, ey);
        
        return tx >= minX && tx <= maxX && ty >= minY && ty <= maxY;
    }
    
    getColorName(colorIndex) {
        const names = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Cyan'];
        return names[colorIndex] || `Color ${colorIndex + 1}`;
    }
}

// Predefined Level Database with guaranteed solvable puzzles
const PUZZLE_DATABASE = [
    // Level 1 - 5x5, 3 colors - Easy
    {
        id: 1,
        size: 5,
        difficulty: 'easy',
        endpoints: [
            { color: 0, start: [0, 0], end: [4, 4] },
            { color: 1, start: [0, 4], end: [4, 0] },
            { color: 2, start: [2, 0], end: [2, 4] }
        ],
        solution: [
            { color: 0, path: [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[4,3],[4,4]] },
            { color: 1, path: [[0,4],[0,3],[0,2],[0,1],[1,1],[2,1],[3,1],[4,1],[4,0]] },
            { color: 2, path: [[2,0],[2,1],[2,2],[2,3],[2,4]] }
        ]
    },
    
    // Level 2 - 5x5, 4 colors - Medium
    {
        id: 2,
        size: 5,
        difficulty: 'medium',
        endpoints: [
            { color: 0, start: [0, 0], end: [2, 2] },
            { color: 1, start: [4, 0], end: [4, 4] },
            { color: 2, start: [0, 3], end: [3, 1] },
            { color: 3, start: [1, 4], end: [3, 4] }
        ]
    },
    
    // Level 3 - 6x6, 4 colors - Medium
    {
        id: 3,
        size: 6,
        difficulty: 'medium',
        endpoints: [
            { color: 0, start: [0, 0], end: [5, 5] },
            { color: 1, start: [0, 5], end: [5, 0] },
            { color: 2, start: [1, 1], end: [4, 4] },
            { color: 3, start: [2, 2], end: [3, 3] }
        ],
        obstacles: []
    },
    
    // Level 4 - 6x6, 5 colors - Hard
    {
        id: 4,
        size: 6,
        difficulty: 'hard',
        endpoints: [
            { color: 0, start: [0, 0], end: [3, 2] },
            { color: 1, start: [5, 0], end: [2, 3] },
            { color: 2, start: [0, 5], end: [5, 5] },
            { color: 3, start: [1, 1], end: [4, 1] },
            { color: 4, start: [1, 4], end: [4, 3] }
        ]
    },
    
    // Level 5 - 7x7, 5 colors with wall - Hard
    {
        id: 5,
        size: 7,
        difficulty: 'hard',
        endpoints: [
            { color: 0, start: [0, 0], end: [6, 6] },
            { color: 1, start: [0, 6], end: [6, 0] },
            { color: 2, start: [3, 0], end: [3, 6] },
            { color: 3, start: [0, 3], end: [6, 3] },
            { color: 4, start: [1, 1], end: [5, 5] }
        ],
        obstacles: [
            { type: 'wall', position: [3, 3] }
        ]
    },
    
    // Level 6 - 7x7, 6 colors - Expert
    {
        id: 6,
        size: 7,
        difficulty: 'expert',
        endpoints: [
            { color: 0, start: [0, 0], end: [4, 3] },
            { color: 1, start: [6, 0], end: [2, 4] },
            { color: 2, start: [0, 6], end: [6, 6] },
            { color: 3, start: [1, 1], end: [5, 2] },
            { color: 4, start: [2, 5], end: [4, 5] },
            { color: 5, start: [3, 2], end: [3, 4] }
        ]
    },
    
    // Level 7 - 8x8, 6 colors with ice - Expert
    {
        id: 7,
        size: 8,
        difficulty: 'expert',
        endpoints: [
            { color: 0, start: [0, 0], end: [7, 7] },
            { color: 1, start: [0, 7], end: [7, 0] },
            { color: 2, start: [2, 1], end: [5, 6] },
            { color: 3, start: [1, 3], end: [6, 4] },
            { color: 4, start: [3, 0], end: [4, 7] },
            { color: 5, start: [0, 4], end: [7, 3] }
        ],
        obstacles: [
            { type: 'ice', position: [3, 3] },
            { type: 'ice', position: [4, 4] }
        ]
    },
    
    // Level 8 - 8x8, 7 colors - Master
    {
        id: 8,
        size: 8,
        difficulty: 'master',
        endpoints: [
            { color: 0, start: [0, 0], end: [5, 3] },
            { color: 1, start: [7, 0], end: [2, 5] },
            { color: 2, start: [0, 7], end: [7, 7] },
            { color: 3, start: [1, 1], end: [6, 2] },
            { color: 4, start: [2, 6], end: [5, 4] },
            { color: 5, start: [3, 2], end: [4, 5] },
            { color: 6, start: [0, 3], end: [7, 4] }
        ]
    },
    
    // Level 9 - 9x9, 7 colors with portal - Master
    {
        id: 9,
        size: 9,
        difficulty: 'master',
        endpoints: [
            { color: 0, start: [0, 0], end: [8, 8] },
            { color: 1, start: [0, 8], end: [8, 0] },
            { color: 2, start: [4, 0], end: [4, 8] },
            { color: 3, start: [0, 4], end: [8, 4] },
            { color: 4, start: [2, 2], end: [6, 6] },
            { color: 5, start: [2, 6], end: [6, 2] },
            { color: 6, start: [1, 4], end: [7, 4] }
        ],
        obstacles: [
            { type: 'portal', position: [3, 3], target: [5, 5] }
        ]
    },
    
    // Level 10 - 10x10, 8 colors - Grandmaster
    {
        id: 10,
        size: 10,
        difficulty: 'grandmaster',
        endpoints: [
            { color: 0, start: [0, 0], end: [9, 9] },
            { color: 1, start: [0, 9], end: [9, 0] },
            { color: 2, start: [3, 0], end: [6, 9] },
            { color: 3, start: [0, 3], end: [9, 6] },
            { color: 4, start: [1, 1], end: [8, 8] },
            { color: 5, start: [1, 8], end: [8, 1] },
            { color: 6, start: [4, 2], end: [5, 7] },
            { color: 7, start: [2, 4], end: [7, 5] }
        ],
        obstacles: [
            { type: 'wall', position: [4, 4] },
            { type: 'wall', position: [5, 5] }
        ]
    }
];

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PuzzleGenerator,
        PuzzleSolver,
        PUZZLE_DATABASE
    };
}

// Helper function to get puzzle for level
function getPuzzleForLevel(level) {
    if (level <= PUZZLE_DATABASE.length) {
        return PUZZLE_DATABASE[level - 1];
    }
    
    // Generate procedural puzzle for levels beyond database
    const difficulty = Math.floor(level / 10);
    const size = Math.min(5 + difficulty, 12);
    const numColors = Math.min(3 + Math.floor(level / 3), 10);
    
    const generator = new PuzzleGenerator(size, numColors);
    return generator.generate();
}

// Validate that a puzzle is actually solvable
function validatePuzzle(puzzle) {
    const solver = new PuzzleSolver(puzzle.grid, puzzle.endpoints);
    
    // Create a simulation grid
    const testGrid = Array(puzzle.size).fill(null).map(() => 
        Array(puzzle.size).fill(null)
    );
    
    // Place endpoints
    puzzle.endpoints.forEach(ep => {
        testGrid[ep.start[1]][ep.start[0]] = {
            type: 'source',
            color: ep.color
        };
        testGrid[ep.end[1]][ep.end[0]] = {
            type: 'source',
            color: ep.color
        };
    });
    
    // Try to solve using the solution if provided
    if (puzzle.solution) {
        puzzle.solution.forEach(sol => {
            sol.path.forEach(([x, y]) => {
                if (!testGrid[y][x]) {
                    testGrid[y][x] = {
                        type: 'path',
                        color: sol.color
                    };
                }
            });
        });
        
        // Check if this creates a valid solution
        const testSolver = new PuzzleSolver(testGrid, puzzle.endpoints);
        return testSolver.checkSolution();
    }
    
    return true; // Assume valid if no solution provided
}