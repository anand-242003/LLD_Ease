// ASM: Reference diagram authored to match PRD §9.1 observed catalogue (6 classes, 5 relationships)
import { Problem } from '../../types';

export const ticTacToe: Problem = {
  id: 'tic-tac-toe',
  title: 'Tic-Tac-Toe',
  difficulty: 'EASY',
  patterns: ['OOP fundamentals'],
  description:
    'Design an object-oriented 3x3 Tic-Tac-Toe game supporting two players, turn alternation, and win/draw detection.',
  requirements: [
    'Grid board with customizable size',
    'Two players with distinct piece symbols (X, O)',
    'Turn-based piece placement and validation',
    'Row, column, and diagonal win detection',
  ],
  practicePrompt:
    'Model the game board, player pieces, moves, and winning rules.',
  stats: { classes: 6, relationships: 5 },
  referenceDiagram: {
    sourceProblemId: 'tic-tac-toe',
    nodes: [
      {
        id: 'ttt-piece-type',
        kind: 'ENUM',
        name: 'PieceType',
        attributes: [
          { id: 'pt-1', visibility: 'public', name: 'X', type: '', isStatic: false, isFinal: false },
          { id: 'pt-2', visibility: 'public', name: 'O', type: '', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 50, y: 50 },
      },
      {
        id: 'ttt-piece',
        kind: 'CLASS',
        name: 'PlayingPiece',
        attributes: [
          { id: 'p-1', visibility: 'private', name: 'type', type: 'PieceType', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 300, y: 50 },
      },
      {
        id: 'ttt-piece-x',
        kind: 'CLASS',
        name: 'PlayingPieceX',
        attributes: [],
        methods: [],
        position: { x: 200, y: 220 },
      },
      {
        id: 'ttt-piece-o',
        kind: 'CLASS',
        name: 'PlayingPieceO',
        attributes: [],
        methods: [],
        position: { x: 400, y: 220 },
      },
      {
        id: 'ttt-board',
        kind: 'CLASS',
        name: 'Board',
        attributes: [
          { id: 'b-1', visibility: 'private', name: 'size', type: 'int', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'b-m1', visibility: 'public', name: 'addPiece', parameters: 'int row, int col, PlayingPiece piece', returns: 'boolean', isStatic: false, isAbstract: false },
          { id: 'b-m2', visibility: 'public', name: 'isFull', parameters: '', returns: 'boolean', isStatic: false, isAbstract: false },
        ],
        position: { x: 620, y: 50 },
      },
      {
        id: 'ttt-game',
        kind: 'CLASS',
        name: 'TicTacToeGame',
        attributes: [],
        methods: [
          { id: 'g-m1', visibility: 'public', name: 'playTurn', parameters: '', returns: 'void', isStatic: false, isAbstract: false },
        ],
        position: { x: 620, y: 260 },
      },
    ],
    edges: [
      { id: 'ttt-rel-1', type: 'INHERIT', sourceId: 'ttt-piece-x', targetId: 'ttt-piece' },
      { id: 'ttt-rel-2', type: 'INHERIT', sourceId: 'ttt-piece-o', targetId: 'ttt-piece' },
      { id: 'ttt-rel-3', type: 'ASSOCIATE', sourceId: 'ttt-piece', targetId: 'ttt-piece-type' },
      { id: 'ttt-rel-4', type: 'AGGREGATE', sourceId: 'ttt-board', targetId: 'ttt-piece' },
      { id: 'ttt-rel-5', type: 'COMPOSE', sourceId: 'ttt-game', targetId: 'ttt-board' },
    ],
    stickyNotes: [],
    inkStrokes: [],
    scratchNotes: 'Reference solution: Clean object-oriented decomposition separating board representation from player pieces.',
    viewport: { x: 50, y: 50, zoom: 0.8 },
  },
};
