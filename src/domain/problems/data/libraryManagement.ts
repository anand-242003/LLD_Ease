// ASM: Reference diagram authored to match PRD §9.1 observed catalogue (8 classes, 7 relationships)
import { Problem } from '../../types';

export const libraryManagement: Problem = {
  id: 'library-management',
  title: 'Library Management',
  difficulty: 'MEDIUM',
  patterns: ['Aggregate Root'],
  description:
    'Design a library management system to track books, members, borrow limits, reservations, and overdue fines.',
  requirements: [
    'Catalog with book titles, authors, and copies',
    'Member accounts with borrowing limits',
    'Book checkout, return, and reservation flow',
    'Overdue fine calculation',
  ],
  practicePrompt:
    'Model books, copies, members, lending records, and reservations for a library.',
  stats: { classes: 8, relationships: 8 },
  referenceDiagram: {
    sourceProblemId: 'library-management',
    nodes: [
      {
        id: 'lm-book-status',
        kind: 'ENUM',
        name: 'BookStatus',
        attributes: [
          { id: 'bs-1', visibility: 'public', name: 'AVAILABLE', type: '', isStatic: false, isFinal: false },
          { id: 'bs-2', visibility: 'public', name: 'LOANED', type: '', isStatic: false, isFinal: false },
          { id: 'bs-3', visibility: 'public', name: 'RESERVED', type: '', isStatic: false, isFinal: false },
          { id: 'bs-4', visibility: 'public', name: 'LOST', type: '', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 50, y: 50 },
      },
      {
        id: 'lm-book-item',
        kind: 'CLASS',
        name: 'BookItem',
        attributes: [
          { id: 'bi-1', visibility: 'private', name: 'barcode', type: 'String', isStatic: false, isFinal: false },
          { id: 'bi-2', visibility: 'private', name: 'status', type: 'BookStatus', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'bi-m1', visibility: 'public', name: 'checkout', parameters: '', returns: 'boolean', isStatic: false, isAbstract: false },
        ],
        position: { x: 300, y: 50 },
      },
      {
        id: 'lm-book',
        kind: 'CLASS',
        name: 'Book',
        attributes: [
          { id: 'b-1', visibility: 'private', name: 'isbn', type: 'String', isStatic: false, isFinal: false },
          { id: 'b-2', visibility: 'private', name: 'title', type: 'String', isStatic: false, isFinal: false },
          { id: 'b-3', visibility: 'private', name: 'author', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 560, y: 50 },
      },
      {
        id: 'lm-account',
        kind: 'ABSTRACT',
        name: 'Account',
        attributes: [
          { id: 'acc-1', visibility: 'private', name: 'id', type: 'String', isStatic: false, isFinal: false },
          { id: 'acc-2', visibility: 'private', name: 'name', type: 'String', isStatic: false, isFinal: false },
          { id: 'acc-3', visibility: 'private', name: 'email', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 50, y: 240 },
      },
      {
        id: 'lm-member',
        kind: 'CLASS',
        name: 'Member',
        attributes: [
          { id: 'mem-1', visibility: 'private', name: 'totalCheckedOut', type: 'int', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 20, y: 420 },
      },
      {
        id: 'lm-librarian',
        kind: 'CLASS',
        name: 'Librarian',
        attributes: [
          { id: 'lib-1', visibility: 'private', name: 'employeeId', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [],
        position: { x: 180, y: 420 },
      },
      {
        id: 'lm-lending',
        kind: 'CLASS',
        name: 'BookLending',
        attributes: [
          { id: 'bl-1', visibility: 'private', name: 'creationDate', type: 'long', isStatic: false, isFinal: false },
          { id: 'bl-2', visibility: 'private', name: 'dueDate', type: 'long', isStatic: false, isFinal: false },
          { id: 'bl-3', visibility: 'private', name: 'returnDate', type: 'long', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'bl-m1', visibility: 'public', name: 'calculateFine', parameters: '', returns: 'double', isStatic: false, isAbstract: false },
        ],
        position: { x: 380, y: 240 },
      },
      {
        id: 'lm-library',
        kind: 'CLASS',
        name: 'Library',
        attributes: [
          { id: 'l-1', visibility: 'private', name: 'name', type: 'String', isStatic: false, isFinal: false },
        ],
        methods: [
          { id: 'l-m1', visibility: 'public', name: 'searchByTitle', parameters: 'String title', returns: 'List<Book>', isStatic: false, isAbstract: false },
        ],
        position: { x: 680, y: 240 },
      },
    ],
    edges: [
      { id: 'lm-rel-1', type: 'COMPOSE', sourceId: 'lm-library', targetId: 'lm-book' },
      { id: 'lm-rel-2', type: 'COMPOSE', sourceId: 'lm-book', targetId: 'lm-book-item' },
      { id: 'lm-rel-3', type: 'INHERIT', sourceId: 'lm-member', targetId: 'lm-account' },
      { id: 'lm-rel-4', type: 'INHERIT', sourceId: 'lm-librarian', targetId: 'lm-account' },
      { id: 'lm-rel-5', type: 'ASSOCIATE', sourceId: 'lm-member', targetId: 'lm-lending' },
      { id: 'lm-rel-6', type: 'ASSOCIATE', sourceId: 'lm-lending', targetId: 'lm-book-item' },
      { id: 'lm-rel-7', type: 'AGGREGATE', sourceId: 'lm-library', targetId: 'lm-account' },
      { id: 'lm-rel-8', type: 'ASSOCIATE', sourceId: 'lm-book-item', targetId: 'lm-book-status', label: 'status' },
    ],
    stickyNotes: [],
    inkStrokes: [],
    scratchNotes: 'Reference solution: Book is the catalog entity while BookItem represents physical inventory copies with individual barcodes.',
    viewport: { x: 50, y: 50, zoom: 0.8 },
  },
};
