// ASM: Reference diagram authored to match PRD §9.1 observed catalogue (7 classes, 4 relationships)
import { Problem } from '../../types';

export const elevatorSystem: Problem = {
  id: 'elevator-system',
  title: 'Elevator System',
  difficulty: 'HARD',
  patterns: ['Strategy', 'State'],
  description:
    'Design the control system for a bank of elevators serving a multi-storey building, dispatching cars to floor requests efficiently.',
  requirements: [
    'Several elevators, one controller',
    'Up / down / idle movement',
    'Queue of pending requests per car',
    'Pluggable dispatch (scheduling) strategy',
  ],
  practicePrompt:
    'Model elevator cars, states, dispatch controller, and scheduling strategies.',
  stats: { classes: 7, relationships: 4 },
  referenceDiagram: {
    sourceProblemId: 'elevator-system',
    nodes: [
      {
        id: 'elev-direction',
        kind: 'ENUM',
        name: 'Direction',
        attributes: [
          { id: 'd-1', visibility: 'public', name: 'UP', type: '', isStatic: false, isFinal: false },
          { id: 'd-2', visibility: 'public', name: 'DOWN', type: '', isStatic: false, isFinal: false },
          { id: 'd-3', visibility: 'public', name: 'IDLE', type: '', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 50, y: 50 },
      },
      {
        id: 'elev-status',
        kind: 'ENUM',
        name: 'ElevatorStatus',
        attributes: [
          { id: 'es-1', visibility: 'public', name: 'MOVING', type: '', isStatic: false, isFinal: false },
          { id: 'es-2', visibility: 'public', name: 'STOPPED', type: '', isStatic: false, isFinal: false },
          { id: 'es-3', visibility: 'public', name: 'MAINTENANCE', type: '', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 260, y: 50 },
      },
      {
        id: 'elev-car',
        kind: 'CLASS',
        name: 'ElevatorCar',
        attributes: [
          { id: 'ec-1', visibility: 'private', name: 'id', type: 'int', isStatic: false, isFinal: false },
          { id: 'ec-2', visibility: 'private', name: 'currentFloor', type: 'int', isStatic: false, isFinal: false },
          { id: 'ec-3', visibility: 'private', name: 'direction', type: 'Direction', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'ec-m1', visibility: 'public', name: 'moveTo', parameters: 'int floor', returns: 'void', isStatic: false, isAbstract: false },
        ],
        position: { x: 50, y: 220 },
      },
      {
        id: 'elev-controller',
        kind: 'CLASS',
        name: 'ElevatorController',
        attributes: [
          { id: 'ctrl-1', visibility: 'private', name: 'id', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'ctrl-m1', visibility: 'public', name: 'requestElevator', parameters: 'int floor, Direction dir', returns: 'void', isStatic: false, isAbstract: false },
        ],
        position: { x: 400, y: 220 },
      },
      {
        id: 'elev-request',
        kind: 'CLASS',
        name: 'FloorRequest',
        attributes: [
          { id: 'fr-1', visibility: 'private', name: 'floor', type: 'int', isStatic: false, isFinal: false },
          { id: 'fr-2', visibility: 'private', name: 'direction', type: 'Direction', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 50, y: 420 },
      },
      {
        id: 'elev-strategy',
        kind: 'INTERFACE',
        name: 'DispatchStrategy',
        attributes: [],
        methods: [
          { id: 'ds-m1', visibility: 'public', name: 'selectCar', parameters: 'List<ElevatorCar> cars, FloorRequest req', returns: 'ElevatorCar', isStatic: false, isAbstract: true },
        ],
        position: { x: 720, y: 220 },
      },
      {
        id: 'elev-scan-strategy',
        kind: 'CLASS',
        name: 'ScanDispatchStrategy',
        attributes: [],
        methods: [
          { id: 'sds-m1', visibility: 'public', name: 'selectCar', parameters: 'List<ElevatorCar> cars, FloorRequest req', returns: 'ElevatorCar', isStatic: false, isAbstract: false },
        ],
        position: { x: 720, y: 400 },
      },
    ],
    edges: [
      { id: 'elev-rel-1', type: 'COMPOSE', sourceId: 'elev-controller', targetId: 'elev-car' },
      { id: 'elev-rel-2', type: 'ASSOCIATE', sourceId: 'elev-controller', targetId: 'elev-strategy' },
      { id: 'elev-rel-3', type: 'COMPOSE', sourceId: 'elev-car', targetId: 'elev-request' },
      { id: 'elev-rel-4', type: 'REALIZE', sourceId: 'elev-scan-strategy', targetId: 'elev-strategy' },
    ],
    stickyNotes: [],
    inkStrokes: [],
    scratchNotes: 'Reference solution: Controller coordinates elevator cars through pluggable dispatch algorithms (SCAN / LOOK).',
    viewport: { x: 50, y: 50, zoom: 0.8 },
  },
};
