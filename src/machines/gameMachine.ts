import { createMachine, assign } from 'xstate';

export type SquareKind = 'normal' | 'star' | 'hole';

export interface GameContext {
  players: number;
  currentPlayer: number;
  position: number;
  crystals: number;
  round: number;
  lastDice: number | null;
  lastSquare: SquareKind | null;
  skippedSteps: string[];
}

const BOARD_SIZE = 12;
const TARGET_CRYSTALS = 3;
const MAX_ROUNDS = 6;
const BOARD: SquareKind[] = [
  'normal', 'normal', 'star', 'normal', 'hole', 'normal',
  'normal', 'star', 'normal', 'hole', 'star', 'normal',
];

export type GameEvent =
  | { type: 'START' }
  | { type: 'SET_PLAYERS'; players: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'CANCEL' }
  | { type: 'ROLL'; value: number }
  | { type: 'RESET' };

export const gameMachine = createMachine({
  id: 'gameMaster',
  initial: 'title',
  types: {} as {
    context: GameContext;
    events: GameEvent;
  },
  context: {
    players: 2,
    currentPlayer: 1,
    position: 0,
    crystals: 0,
    round: 1,
    lastDice: null,
    lastSquare: null,
    skippedSteps: [],
  },
  states: {
    title: {
      on: {
        START: { target: 'setupPlayers' },
      },
    },
    setupPlayers: {
      on: {
        SET_PLAYERS: {
          actions: assign({ players: ({ event }) => event.players }),
        },
        NEXT: { target: 'setupBoard' },
        BACK: { target: 'title' },
        SKIP: {
          target: 'setupBoard',
          actions: assign({
            skippedSteps: ({ context }) => [...context.skippedSteps, 'setupPlayers'],
          }),
        },
        CANCEL: { target: 'title' },
      },
    },
    setupBoard: {
      on: {
        NEXT: { target: 'playing' },
        BACK: { target: 'setupPlayers' },
        SKIP: {
          target: 'playing',
          actions: assign({
            skippedSteps: ({ context }) => [...context.skippedSteps, 'setupBoard'],
          }),
        },
        CANCEL: { target: 'title' },
      },
    },
    playing: {
      initial: 'turnStart',
      states: {
        turnStart: {
          on: {
            ROLL: {
              target: 'rolled',
              actions: assign(({ context, event }) => {
                const next = Math.min(context.position + event.value, BOARD_SIZE - 1);
                return {
                  lastDice: event.value,
                  position: next,
                  lastSquare: BOARD[next],
                };
              }),
            },
            BACK: { target: '#gameMaster.setupBoard' },
            CANCEL: { target: '#gameMaster.title' },
          },
        },
        rolled: {
          always: [
            {
              guard: ({ context }) => context.lastSquare === 'star',
              target: 'starHit',
            },
            {
              guard: ({ context }) => context.lastSquare === 'hole',
              target: 'holeHit',
            },
            { target: 'normalHit' },
          ],
        },
        starHit: {
          entry: assign({
            crystals: ({ context }) => context.crystals + 1,
          }),
          on: {
            NEXT: { target: 'checkEnd' },
            SKIP: {
              target: 'checkEnd',
              actions: assign({
                skippedSteps: ({ context }) => [...context.skippedSteps, 'starHit'],
              }),
            },
          },
        },
        holeHit: {
          entry: assign({
            position: ({ context }) => Math.max(0, context.position - 1),
          }),
          on: {
            NEXT: { target: 'checkEnd' },
            SKIP: {
              target: 'checkEnd',
              actions: assign({
                skippedSteps: ({ context }) => [...context.skippedSteps, 'holeHit'],
              }),
            },
          },
        },
        normalHit: {
          on: {
            NEXT: { target: 'checkEnd' },
            SKIP: {
              target: 'checkEnd',
              actions: assign({
                skippedSteps: ({ context }) => [...context.skippedSteps, 'normalHit'],
              }),
            },
          },
        },
        checkEnd: {
          always: [
            {
              guard: ({ context }) => context.crystals >= TARGET_CRYSTALS,
              target: '#gameMaster.win',
            },
            {
              guard: ({ context }) => context.round >= MAX_ROUNDS,
              target: '#gameMaster.lose',
            },
            {
              target: 'turnStart',
              actions: assign(({ context }) => {
                const nextPlayer = (context.currentPlayer % context.players) + 1;
                const nextRound = nextPlayer === 1 ? context.round + 1 : context.round;
                return {
                  currentPlayer: nextPlayer,
                  round: nextRound,
                };
              }),
            },
          ],
        },
      },
    },
    win: {
      on: {
        RESET: {
          target: 'title',
          actions: assign({
            currentPlayer: 1,
            position: 0,
            crystals: 0,
            round: 1,
            lastDice: null,
            lastSquare: null,
            skippedSteps: [],
          }),
        },
      },
    },
    lose: {
      on: {
        RESET: {
          target: 'title',
          actions: assign({
            currentPlayer: 1,
            position: 0,
            crystals: 0,
            round: 1,
            lastDice: null,
            lastSquare: null,
            skippedSteps: [],
          }),
        },
      },
    },
  },
});

export { BOARD, BOARD_SIZE, TARGET_CRYSTALS, MAX_ROUNDS };
