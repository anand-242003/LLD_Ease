// ASM: Reference diagram authored to match PRD §9.1 observed catalogue (8 classes, 6 relationships)
import { Problem } from '../../types';

export const vendingMachine: Problem = {
  id: 'vending-machine',
  title: 'Vending Machine',
  difficulty: 'MEDIUM',
  patterns: ['State'],
  description:
    'Design a vending machine that accepts coins, lets the user pick a product, dispenses it, and returns change — modelled as a state machine.',
  requirements: [
    'Idle / has-money / dispensing states',
    'Coin denominations',
    'Product inventory with stock',
    'Behaviour changes with current state',
  ],
  practicePrompt:
    'Model a coin-operated vending machine using the State design pattern.',
  stats: { classes: 8, relationships: 6 },
  referenceDiagram: {
    sourceProblemId: 'vending-machine',
    nodes: [
      {
        id: 'vm-coin',
        kind: 'ENUM',
        name: 'Coin',
        attributes: [
          { id: 'c-1', visibility: 'public', name: 'PENNY', type: '', isStatic: false, isFinal: false },
          { id: 'c-2', visibility: 'public', name: 'NICKEL', type: '', isStatic: false, isFinal: false },
          { id: 'c-3', visibility: 'public', name: 'DIME', type: '', isStatic: false, isFinal: false },
          { id: 'c-4', visibility: 'public', name: 'QUARTER', type: '', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 50, y: 50 },
      },
      {
        id: 'vm-product',
        kind: 'CLASS',
        name: 'Product',
        attributes: [
          { id: 'p-1', visibility: 'private', name: 'id', type: 'String', isStatic: false, isFinal: false },
          { id: 'p-2', visibility: 'private', name: 'name', type: 'String', isStatic: false, isFinal: false },
          { id: 'p-3', visibility: 'private', name: 'price', type: 'double', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 300, y: 50 },
      },
      {
        id: 'vm-inventory',
        kind: 'CLASS',
        name: 'Inventory',
        attributes: [
          { id: 'inv-1', visibility: 'private', name: 'stock', type: 'Map<String, Integer>', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'inv-m1', visibility: 'public', name: 'getCount', parameters: 'String id', returns: 'int', isStatic: false, isAbstract: false },
        ],
        position: { x: 300, y: 220 },
      },
      {
        id: 'vm-machine',
        kind: 'CLASS',
        name: 'VendingMachine',
        attributes: [
          { id: 'm-1', visibility: 'private', name: 'balance', type: 'double', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'm-m1', visibility: 'public', name: 'insertCoin', parameters: 'Coin c', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'm-m2', visibility: 'public', name: 'selectProduct', parameters: 'String id', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'm-m3', visibility: 'public', name: 'refund', parameters: '', returns: 'double', isStatic: false, isAbstract: false },
        ],
        position: { x: 550, y: 220 },
      },
      {
        id: 'vm-state',
        kind: 'INTERFACE',
        name: 'VendingState',
        attributes: [],
        methods: [
          { id: 'vs-m1', visibility: 'public', name: 'insertCoin', parameters: 'Coin c', returns: 'void', isStatic: false, isAbstract: true },
          { id: 'vs-m2', visibility: 'public', name: 'selectProduct', parameters: 'String id', returns: 'void', isStatic: false, isAbstract: true },
          { id: 'vs-m3', visibility: 'public', name: 'dispense', parameters: '', returns: 'void', isStatic: false, isAbstract: true },
        ],
        position: { x: 850, y: 220 },
      },
      {
        id: 'vm-idle-state',
        kind: 'CLASS',
        name: 'IdleState',
        attributes: [],
        methods: [
          { id: 'is-m1', visibility: 'public', name: 'insertCoin', parameters: 'Coin c', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'is-m2', visibility: 'public', name: 'selectProduct', parameters: 'String id', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'is-m3', visibility: 'public', name: 'dispense', parameters: '', returns: 'void', isStatic: false, isAbstract: false },
        ],
        position: { x: 720, y: 420 },
      },
      {
        id: 'vm-has-money-state',
        kind: 'CLASS',
        name: 'HasMoneyState',
        attributes: [],
        methods: [
          { id: 'hm-m1', visibility: 'public', name: 'insertCoin', parameters: 'Coin c', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'hm-m2', visibility: 'public', name: 'selectProduct', parameters: 'String id', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'hm-m3', visibility: 'public', name: 'dispense', parameters: '', returns: 'void', isStatic: false, isAbstract: false },
        ],
        position: { x: 880, y: 420 },
      },
      {
        id: 'vm-dispensing-state',
        kind: 'CLASS',
        name: 'DispensingState',
        attributes: [],
        methods: [
          { id: 'ds-m1', visibility: 'public', name: 'insertCoin', parameters: 'Coin c', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'ds-m2', visibility: 'public', name: 'selectProduct', parameters: 'String id', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'ds-m3', visibility: 'public', name: 'dispense', parameters: '', returns: 'void', isStatic: false, isAbstract: false },
        ],
        position: { x: 1040, y: 420 },
      },
    ],
    edges: [
      { id: 'vm-rel-1', type: 'COMPOSE', sourceId: 'vm-machine', targetId: 'vm-inventory' },
      { id: 'vm-rel-2', type: 'ASSOCIATE', sourceId: 'vm-machine', targetId: 'vm-state' },
      { id: 'vm-rel-3', type: 'AGGREGATE', sourceId: 'vm-inventory', targetId: 'vm-product' },
      { id: 'vm-rel-4', type: 'REALIZE', sourceId: 'vm-idle-state', targetId: 'vm-state' },
      { id: 'vm-rel-5', type: 'REALIZE', sourceId: 'vm-has-money-state', targetId: 'vm-state' },
      { id: 'vm-rel-6', type: 'REALIZE', sourceId: 'vm-dispensing-state', targetId: 'vm-state' },
    ],
    stickyNotes: [],
    inkStrokes: [],
    scratchNotes: 'Reference solution: State pattern models machine transitions between Idle, HasMoney, and Dispensing.',
    viewport: { x: 50, y: 50, zoom: 0.8 },
  },
};
