type Pattern = string[];

type Grid = {
  style: string;
  pattern: Pattern;
}

enum CellState {
  DUG,
  REVEALED,
  PARTIAL,
  UNREVEALED,
}

const GRIDS: Grid[] = [
  {
    style: 'straight, 2 spaces',
    pattern: [ 'xoo' ],
  },
  {
    style: 'straight, 3 spaces',
    pattern: [ 'xooo' ],
  },
  {
    style: 'simple sawtooth',
    pattern: [
      'oxoo',
      'xxoo',
      'oxoo',
    ],
  },
  {
    style: 'double-tall sawtooth',
    pattern: [
      'ooxoo',
      'xxxoo',
      'ooxoo',
    ],
  },
  {
    style: 'two-sided sawtooth',
    pattern: [
      'ooxoo',
      'oxxxo',
      'ooxoo',
    ],
  },
  {
    style: 'offset sawtooth',
    pattern: [
      'oxxoo',
      'ooxxo',
      'ooxoo',
    ],
  },
  {
    style: 'fish hook',
    pattern: [
      'oxoooo',
      'oxxxxo',
      'oxooxo',
      'oxoooo',
    ],
  },
  {
    style: 'stair step',
    pattern: [
      'xoooox',
      'xxoooo',
      'oxxooo',
      'ooxxoo',
      'oooxxo',
      'ooooxx',
    ],
  },
];

const shortHandToState = (char: string): CellState => {
  if (char == 'x') return CellState.DUG;
  return CellState.UNREVEALED;
};

const patternAt = (pattern: Pattern, x: number, y: number): string => {
  return pattern[x % pattern.length].charAt(y % pattern[0].length);
};

const stateAt = (pattern: Pattern, x: number, y: number): CellState => {
  return shortHandToState(patternAt(pattern, x, y));
};

type GridResult = {
  style: string;
  state: CellState[][];
  totals: {
    total: number;
    dug: number;
    revealed: number;
    unrevealed: number;
    partial: number;
  };
  computed: {
    effort: number;
    coverage: number;
    efficiency: number;
  };
}

const reveal = (state: CellState[][], x: number, y: number) => {
  // if (x >= SIMULATE_SIZE || y >= SIMULATE_SIZE) return;
  if (x < 0 || y < 0) return;
  if (state[x] == undefined) state[x] = [];
  if (state[x][y] != CellState.DUG) {
    state[x][y] = CellState.REVEALED;
  }
};

const partialReveal = (state: CellState[][], x: number, y: number) => {
  // if (x >= SIMULATE_SIZE || y >= SIMULATE_SIZE) return;
  if (x < 0 || y < 0) return;
  if (state[x] == undefined) state[x] = [];
  if (state[x][y] != CellState.DUG && state[x][y] != CellState.REVEALED) {
    state[x][y] = CellState.PARTIAL;
  }
};

const setNeighbours = (state: CellState[][], x: number, y: number) => {
  reveal(state, x - 1, y); // up
  reveal(state, x + 1, y); // down
  reveal(state, x, y - 1); // left
  reveal(state, x, y + 1); // right
  partialReveal(state, x - 1, y - 1); // up left
  partialReveal(state, x - 1, y + 1); // up right
  partialReveal(state, x + 1, y - 1); // down left
  partialReveal(state, x + 1, y + 1); // down right
}

const SIMULATE_SIZE = 40;

const processGrid = (grid: Grid): GridResult => {
  const state: CellState[][] = [];
  for (let x = 0; x < SIMULATE_SIZE + 8; x++) {
    if (!state[x]) state[x] = [];
    for (let y = 0; y < SIMULATE_SIZE + 8; y++) {
      const cell = stateAt(grid.pattern, x, y);
      if (cell == CellState.DUG) {
        state[x][y] = cell;
        setNeighbours(state, x, y);
      }
      if (state[x][y] == undefined) state[x][y] = CellState.UNREVEALED;
    }
  }

  const OFFSET = 4;
  const trimmedState = state.slice(OFFSET, SIMULATE_SIZE + OFFSET);
  trimmedState.forEach((row, i) => {
    trimmedState[i] = row.slice(OFFSET, SIMULATE_SIZE + OFFSET);
  });

  let dug = 0;
  let revealed = 0;
  let unrevealed = 0;
  let partial = 0;
  let total = 0;
  trimmedState.forEach((row) => {
    row.forEach((cell) => {
      if (cell == CellState.PARTIAL) {
        partial++;
      } else if (cell == CellState.REVEALED) {
        revealed++;
      } else if (cell == CellState.UNREVEALED) {
        unrevealed++;
      } else if (cell == CellState.DUG) {
        dug++;
      }
      total++;
    });
  });

  return {
    style: grid.style,
    state: trimmedState,
    totals: {
      total,
      dug,
      revealed,
      unrevealed,
      partial,
    },
    computed: {
      effort: (dug/total),
      coverage: ((revealed + (partial / 4))/total),
      efficiency: (dug/(revealed + (partial / 4))),
    },
  };
};

const visualize = (state: CellState[][]) => {
  state.forEach((row: CellState[]) => {
    let line = '';
    row.forEach((cell: CellState) => {
      if (cell == CellState.DUG) {
        line += '⬜️';
      } else if (cell == CellState.REVEALED) {
        line += '🟩';
      } else if (cell == CellState.PARTIAL) {
        line += '🟧';
      } else {
        line += '🟥';
      }
    });
    if (line) console.log(line);
  });
};

const round = (num: number, places: number) => {
  return parseFloat(parseFloat(num.toString()).toFixed(places))
};

GRIDS.forEach((grid) => {
  const results = processGrid(grid);
  visualize(results.state);
  console.log({
    style: results.style,
    totals: results.totals,
    computed: {
      effort: round(results.computed.effort, 4),
      coverage: round(results.computed.coverage, 4),
      efficiency: round(results.computed.efficiency, 4),
    },
  });
});

// for (let x = 0; x < 10; x++) {
//   console.log(x, patternAt(GRIDS[1].pattern, x, x));
// }
