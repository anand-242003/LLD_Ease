import { Problem } from '../types';
import { parkingLot } from './data/parkingLot';
import { splitwise } from './data/splitwise';
import { elevatorSystem } from './data/elevatorSystem';
import { vendingMachine } from './data/vendingMachine';
import { libraryManagement } from './data/libraryManagement';
import { ticTacToe } from './data/ticTacToe';
import { lruCache } from './data/lruCache';
import { restaurantReservation } from './data/restaurantReservation';
import { movieTicketBooking } from './data/movieTicketBooking';
import { chessGame } from './data/chessGame';

export const PROBLEMS: Problem[] = [
  parkingLot,
  splitwise,
  elevatorSystem,
  vendingMachine,
  libraryManagement,
  ticTacToe,
  // Phase 36 (PHASES.md §0.9) — new problems added to the library.
  lruCache,
  restaurantReservation,
  movieTicketBooking,
  chessGame,
];

export function getProblems(): Problem[] {
  return PROBLEMS;
}

export function getProblem(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}

export {
  parkingLot,
  splitwise,
  elevatorSystem,
  vendingMachine,
  libraryManagement,
  ticTacToe,
  lruCache,
  restaurantReservation,
  movieTicketBooking,
  chessGame,
};
