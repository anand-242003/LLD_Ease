import { Problem } from '../../types';

export const parkingLot: Problem = {
  id: 'parking-lot',
  title: 'Parking Lot',
  difficulty: 'MEDIUM',
  patterns: ['Strategy', 'Factory', 'Singleton'],
  description:
    'Design a multi-floor parking lot that admits different vehicle sizes, issues tickets, and charges a fee on exit.',
  requirements: [
    'Multiple floors, each with typed spots',
    'Cars, bikes and trucks map to spot sizes',
    'Ticket on entry, fee + payment on exit',
    'Pluggable pricing and payment methods',
  ],
  practicePrompt:
    'Model the classes & relationships for a multi-floor parking lot system with vehicle allocation, tickets, and payments.',
  stats: { classes: 15, relationships: 13 },
  referenceDiagram: {
    sourceProblemId: 'parking-lot',
    nodes: [
      {
        id: 'node-vehicle-type',
        kind: 'ENUM',
        name: 'VehicleType',
        attributes: [
          { id: 'vt-1', visibility: 'public', name: 'CAR', type: '', isStatic: false, isFinal: false },
          { id: 'vt-2', visibility: 'public', name: 'BIKE', type: '', isStatic: false, isFinal: false },
          { id: 'vt-3', visibility: 'public', name: 'TRUCK', type: '', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 50, y: 50 },
      },
      {
        id: 'node-spot-type',
        kind: 'ENUM',
        name: 'SpotType',
        attributes: [
          { id: 'st-1', visibility: 'public', name: 'COMPACT', type: '', isStatic: false, isFinal: false },
          { id: 'st-2', visibility: 'public', name: 'LARGE', type: '', isStatic: false, isFinal: false },
          { id: 'st-3', visibility: 'public', name: 'MOTORCYCLE', type: '', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 320, y: 50 },
      },
      {
        id: 'node-vehicle',
        kind: 'ABSTRACT',
        name: 'Vehicle',
        attributes: [
          { id: 'v-1', visibility: 'private', name: 'licensePlate', type: 'String', isStatic: false, isFinal: false },
          { id: 'v-2', visibility: 'private', name: 'type', type: 'VehicleType', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'v-m1', visibility: 'public', name: 'getType', parameters: '', returns: 'VehicleType', isStatic: false, isAbstract: false },
        ],
        position: { x: 50, y: 220 },
      },
      {
        id: 'node-car',
        kind: 'CLASS',
        name: 'Car',
        attributes: [],
        methods: [],
        position: { x: 20, y: 400 },
      },
      {
        id: 'node-bike',
        kind: 'CLASS',
        name: 'Bike',
        attributes: [],
        methods: [],
        position: { x: 140, y: 400 },
      },
      {
        id: 'node-truck',
        kind: 'CLASS',
        name: 'Truck',
        attributes: [],
        methods: [],
        position: { x: 260, y: 400 },
      },
      {
        id: 'node-parking-spot',
        kind: 'CLASS',
        name: 'ParkingSpot',
        attributes: [
          { id: 'ps-1', visibility: 'private', name: 'id', type: 'String', isStatic: false, isFinal: false },
          { id: 'ps-2', visibility: 'private', name: 'type', type: 'SpotType', isStatic: false, isFinal: false },
          { id: 'ps-3', visibility: 'private', name: 'occupied', type: 'boolean', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'ps-m1', visibility: 'public', name: 'assign', parameters: 'Vehicle v', returns: 'boolean', isStatic: false, isAbstract: false },
          { id: 'ps-m2', visibility: 'public', name: 'free', parameters: '', returns: 'void', isStatic: false, isAbstract: false },
        ],
        position: { x: 420, y: 220 },
      },
      {
        id: 'node-parking-floor',
        kind: 'CLASS',
        name: 'ParkingFloor',
        attributes: [
          { id: 'pf-1', visibility: 'private', name: 'floorId', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'pf-m1', visibility: 'public', name: 'findSpot', parameters: 'SpotType type', returns: 'ParkingSpot', isStatic: false, isAbstract: false },
        ],
        position: { x: 420, y: 420 },
      },
      {
        id: 'node-parking-lot',
        kind: 'CLASS',
        name: 'ParkingLot',
        attributes: [
          { id: 'pl-1', visibility: 'private', name: 'name', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'pl-m1', visibility: 'public', name: 'parkVehicle', parameters: 'Vehicle v', returns: 'Ticket', isStatic: false, isAbstract: false },
          { id: 'pl-m2', visibility: 'public', name: 'unpark', parameters: 'Ticket t', returns: 'double', isStatic: false, isAbstract: false },
        ],
        position: { x: 700, y: 220 },
      },
      {
        id: 'node-ticket',
        kind: 'CLASS',
        name: 'Ticket',
        attributes: [
          { id: 't-1', visibility: 'private', name: 'id', type: 'String', isStatic: false, isFinal: false },
          { id: 't-2', visibility: 'private', name: 'entryTime', type: 'long', isStatic: false, isFinal: false },
          { id: 't-3', visibility: 'private', name: 'amount', type: 'double', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 't-m1', visibility: 'public', name: 'close', parameters: 'long exitTime', returns: 'double', isStatic: false, isAbstract: false },
        ],
        position: { x: 700, y: 440 },
      },
      {
        id: 'node-fee-strategy',
        kind: 'INTERFACE',
        name: 'FeeStrategy',
        attributes: [],
        methods: [
          { id: 'fs-m1', visibility: 'public', name: 'calculate', parameters: 'Ticket t', returns: 'double', isStatic: false, isAbstract: true },
        ],
        position: { x: 960, y: 220 },
      },
      {
        id: 'node-hourly-fee',
        kind: 'CLASS',
        name: 'HourlyFeeStrategy',
        attributes: [],
        methods: [
          { id: 'hfs-m1', visibility: 'public', name: 'calculate', parameters: 'Ticket t', returns: 'double', isStatic: false, isAbstract: false },
        ],
        position: { x: 960, y: 400 },
      },
      {
        id: 'node-payment-strategy',
        kind: 'INTERFACE',
        name: 'PaymentStrategy',
        attributes: [],
        methods: [
          { id: 'pay-m1', visibility: 'public', name: 'pay', parameters: 'double amount', returns: 'boolean', isStatic: false, isAbstract: true },
        ],
        position: { x: 1220, y: 220 },
      },
      {
        id: 'node-card-payment',
        kind: 'CLASS',
        name: 'CardPayment',
        attributes: [],
        methods: [
          { id: 'cp-m1', visibility: 'public', name: 'pay', parameters: 'double amount', returns: 'boolean', isStatic: false, isAbstract: false },
        ],
        position: { x: 1160, y: 400 },
      },
      {
        id: 'node-cash-payment',
        kind: 'CLASS',
        name: 'CashPayment',
        attributes: [],
        methods: [
          { id: 'cash-m1', visibility: 'public', name: 'pay', parameters: 'double amount', returns: 'boolean', isStatic: false, isAbstract: false },
        ],
        position: { x: 1300, y: 400 },
      },
    ],
    edges: [
      { id: 'pl-rel-1', type: 'INHERIT', sourceId: 'node-car', targetId: 'node-vehicle' },
      { id: 'pl-rel-2', type: 'INHERIT', sourceId: 'node-bike', targetId: 'node-vehicle' },
      { id: 'pl-rel-3', type: 'INHERIT', sourceId: 'node-truck', targetId: 'node-vehicle' },
      { id: 'pl-rel-4', type: 'ASSOCIATE', sourceId: 'node-parking-spot', targetId: 'node-vehicle', label: 'vehicle', targetMultiplicity: '0..1' },
      { id: 'pl-rel-5', type: 'COMPOSE', sourceId: 'node-parking-floor', targetId: 'node-parking-spot', targetMultiplicity: '1..*' },
      { id: 'pl-rel-6', type: 'COMPOSE', sourceId: 'node-parking-lot', targetId: 'node-parking-floor', label: 'floor' },
      { id: 'pl-rel-7', type: 'COMPOSE', sourceId: 'node-parking-lot', targetId: 'node-ticket' },
      { id: 'pl-rel-8', type: 'ASSOCIATE', sourceId: 'node-ticket', targetId: 'node-parking-spot' },
      { id: 'pl-rel-9', type: 'ASSOCIATE', sourceId: 'node-ticket', targetId: 'node-fee-strategy' },
      { id: 'pl-rel-10', type: 'REALIZE', sourceId: 'node-hourly-fee', targetId: 'node-fee-strategy' },
      { id: 'pl-rel-11', type: 'ASSOCIATE', sourceId: 'node-parking-lot', targetId: 'node-payment-strategy', label: 'paymentStrategy' },
      { id: 'pl-rel-12', type: 'REALIZE', sourceId: 'node-card-payment', targetId: 'node-payment-strategy' },
      { id: 'pl-rel-13', type: 'REALIZE', sourceId: 'node-cash-payment', targetId: 'node-payment-strategy' },
    ],
    stickyNotes: [],
    inkStrokes: [],
    scratchNotes: 'Reference solution trade-offs: Strategy pattern enables pluggable fee algorithms and payment methods without modifying ParkingLot.',
    viewport: { x: 50, y: 50, zoom: 0.8 },
  },
};
