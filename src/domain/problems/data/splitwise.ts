// ASM: Reference diagram authored to match PRD §9.1 observed catalogue (10 classes, 9 relationships)
import { Problem } from '../../types';

export const splitwise: Problem = {
  id: 'splitwise',
  title: 'Splitwise (Expense Sharing)',
  difficulty: 'MEDIUM',
  patterns: ['Strategy', 'Factory'],
  description:
    'Design an expense-sharing app where a group of users can split bills equally, by exact amounts, or by percentage, and settle balances.',
  requirements: [
    'Users belong to groups',
    'An expense is split among members',
    'Equal / exact / percent split types',
    'Running balance sheet per group',
  ],
  practicePrompt:
    'Model users, groups, expenses, and pluggable split strategies to track and settle balances.',
  stats: { classes: 10, relationships: 10 },
  referenceDiagram: {
    sourceProblemId: 'splitwise',
    nodes: [
      {
        id: 'sw-split-type',
        kind: 'ENUM',
        name: 'SplitType',
        attributes: [
          { id: 'st-1', visibility: 'public', name: 'EQUAL', type: '', isStatic: false, isFinal: false },
          { id: 'st-2', visibility: 'public', name: 'EXACT', type: '', isStatic: false, isFinal: false },
          { id: 'st-3', visibility: 'public', name: 'PERCENT', type: '', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 50, y: 50 },
      },
      {
        id: 'sw-user',
        kind: 'CLASS',
        name: 'User',
        attributes: [
          { id: 'u-1', visibility: 'private', name: 'id', type: 'String', isStatic: false, isFinal: false },
          { id: 'u-2', visibility: 'private', name: 'name', type: 'String', isStatic: false, isFinal: false },
          { id: 'u-3', visibility: 'private', name: 'email', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 260, y: 50 },
      },
      {
        id: 'sw-group',
        kind: 'CLASS',
        name: 'Group',
        attributes: [
          { id: 'g-1', visibility: 'private', name: 'id', type: 'String', isStatic: false, isFinal: false },
          { id: 'g-2', visibility: 'private', name: 'name', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'g-m1', visibility: 'public', name: 'addMember', parameters: 'User u', returns: 'void', isStatic: false, isAbstract: false },
          { id: 'g-m2', visibility: 'public', name: 'addExpense', parameters: 'Expense e', returns: 'void', isStatic: false, isAbstract: false },
        ],
        position: { x: 500, y: 50 },
      },
      {
        id: 'sw-split',
        kind: 'ABSTRACT',
        name: 'Split',
        attributes: [
          { id: 'sp-1', visibility: 'private', name: 'amount', type: 'double', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'sp-m1', visibility: 'public', name: 'getAmount', parameters: '', returns: 'double', isStatic: false, isAbstract: false },
        ],
        position: { x: 50, y: 240 },
      },
      {
        id: 'sw-equal-split',
        kind: 'CLASS',
        name: 'EqualSplit',
        attributes: [],
        methods: [],
        position: { x: 20, y: 400 },
      },
      {
        id: 'sw-exact-split',
        kind: 'CLASS',
        name: 'ExactSplit',
        attributes: [],
        methods: [],
        position: { x: 140, y: 400 },
      },
      {
        id: 'sw-percent-split',
        kind: 'CLASS',
        name: 'PercentSplit',
        attributes: [
          { id: 'ps-1', visibility: 'private', name: 'percent', type: 'double', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 260, y: 400 },
      },
      {
        id: 'sw-expense',
        kind: 'CLASS',
        name: 'Expense',
        attributes: [
          { id: 'e-1', visibility: 'private', name: 'id', type: 'String', isStatic: false, isFinal: false },
          { id: 'e-2', visibility: 'private', name: 'amount', type: 'double', isStatic: false, isFinal: false },
          { id: 'e-3', visibility: 'private', name: 'splitType', type: 'SplitType', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'e-m1', visibility: 'public', name: 'validate', parameters: '', returns: 'boolean', isStatic: false, isAbstract: false },
        ],
        position: { x: 500, y: 240 },
      },
      {
        id: 'sw-strategy',
        kind: 'INTERFACE',
        name: 'ExpenseSplitStrategy',
        attributes: [],
        methods: [
          { id: 'st-m1', visibility: 'public', name: 'calculateSplits', parameters: 'double total, List<User> members', returns: 'List<Split>', isStatic: false, isAbstract: true },
        ],
        position: { x: 780, y: 240 },
      },
      {
        id: 'sw-equal-strategy',
        kind: 'CLASS',
        name: 'EqualSplitStrategy',
        attributes: [],
        methods: [
          { id: 'es-m1', visibility: 'public', name: 'calculateSplits', parameters: 'double total, List<User> members', returns: 'List<Split>', isStatic: false, isAbstract: false },
        ],
        position: { x: 780, y: 400 },
      },
    ],
    edges: [
      { id: 'sw-rel-1', type: 'INHERIT', sourceId: 'sw-equal-split', targetId: 'sw-split' },
      { id: 'sw-rel-2', type: 'INHERIT', sourceId: 'sw-exact-split', targetId: 'sw-split' },
      { id: 'sw-rel-3', type: 'INHERIT', sourceId: 'sw-percent-split', targetId: 'sw-split' },
      { id: 'sw-rel-4', type: 'AGGREGATE', sourceId: 'sw-group', targetId: 'sw-user' },
      { id: 'sw-rel-5', type: 'COMPOSE', sourceId: 'sw-group', targetId: 'sw-expense' },
      { id: 'sw-rel-6', type: 'ASSOCIATE', sourceId: 'sw-expense', targetId: 'sw-user', label: 'paidBy' },
      { id: 'sw-rel-7', type: 'COMPOSE', sourceId: 'sw-expense', targetId: 'sw-split' },
      { id: 'sw-rel-8', type: 'ASSOCIATE', sourceId: 'sw-expense', targetId: 'sw-strategy' },
      { id: 'sw-rel-9', type: 'REALIZE', sourceId: 'sw-equal-strategy', targetId: 'sw-strategy' },
      { id: 'sw-rel-10', type: 'ASSOCIATE', sourceId: 'sw-expense', targetId: 'sw-split-type', label: 'splitType' },
    ],
    stickyNotes: [],
    inkStrokes: [],
    scratchNotes: 'Reference solution: Pluggable split strategy decouples balance computation from expense records.',
    viewport: { x: 50, y: 50, zoom: 0.8 },
  },
};
