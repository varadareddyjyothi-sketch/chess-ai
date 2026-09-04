import { ChessPuzzle } from '../types/chess';

export const PUZZLES_DATA: ChessPuzzle[] = [
  {
    id: 'puz-01',
    title: 'Back Rank Deflection Mate',
    rating: 1250,
    fen: '6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1',
    solution: ['b1b8#'],
    description: 'White to play and mate in 1 move.',
    tacticalMotif: 'Back Rank Mate',
    hint: 'Look for a Rook check on the 8th rank taking advantage of Black\'s trapped King behind pawns.',
  },
  {
    id: 'puz-02',
    title: 'Royal Fork Surprise',
    rating: 1420,
    fen: 'r3r1k1/pp3ppp/8/8/3N4/8/PPP2PPP/R3K2R w KQ - 0 1',
    solution: ['d4e6'],
    description: 'White to play and fork Black\'s King and Rook.',
    tacticalMotif: 'Knight Fork',
    hint: 'Move your Knight to a square that checks the King while attacking an undefended piece.',
  },
  {
    id: 'puz-03',
    title: 'Queen Sacrifice Smothered Mate',
    rating: 1680,
    fen: '6rk/5Npp/8/8/8/8/5PPP/6K1 w - - 0 1',
    solution: ['f7h6+'],
    description: 'White to play. Execute a lethal double check leading to smothered checkmate.',
    tacticalMotif: 'Smothered Mate',
    hint: 'Use your Knight to deliver a double check that forces Black\'s King into the corner.',
  },
  {
    id: 'puz-04',
    title: 'Boden\'s Mate Diagonal Crossfire',
    rating: 1850,
    fen: '2kr3r/pp3ppp/2p5/8/8/2B5/PPP2PPP/2K1R3 w - - 0 1',
    solution: ['c3a5'],
    description: 'White to play and force mate along criss-crossing diagonals.',
    tacticalMotif: 'Bishops Crossfire',
    hint: 'Reposition your Bishop to control the long diagonal slicing across Black\'s King.',
  },
];
