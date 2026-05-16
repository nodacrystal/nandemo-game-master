import { createMachine, assign } from 'xstate';

export type SquareKind = 'normal' | 'star' | 'hole';

export interface SugorokuContext {
  players: number;
  currentPlayer: number;
  position: number;
  crystals: number;
  round: number;
  lastDice: number | null;
  lastSquare: SquareKind | null;
  skippedSteps: string[];
}

const initialContext: SugorokuContext = {
  players: 2,
  currentPlayer: 1,
  position: 0,
  crystals: 0,
  round: 1,
  lastDice: null,
  lastSquare: null,
  skippedSteps: [],
};

const resetContext = {
  currentPlayer: 1,
  position: 0,
  crystals: 0,
  round: 1,
  lastDice: null,
  lastSquare: null,
  skippedSteps: [],
};

export const BOARD_SIZE = 12;
export const TARGET_CRYSTALS = 3;
export const MAX_ROUNDS = 6;
export const BOARD: SquareKind[] = [
  'normal', 'normal', 'star', 'normal', 'hole', 'normal',
  'normal', 'star', 'normal', 'hole', 'star', 'normal',
];

export type SugorokuEvent =
  | { type: 'START' }
  | { type: 'SET_PLAYERS'; players: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'CANCEL' }
  | { type: 'ROLL'; value: number }
  | { type: 'RESET' };

export const sugorokuMachine = createMachine({
  id: 'sugoroku',
  initial: 'setupPlayers',
  types: {} as {
    context: SugorokuContext;
    events: SugorokuEvent;
  },
  context: initialContext,
  states: {
    setupPlayers: {
      on: {
        START: { target: 'setupPlayers' },
        SET_PLAYERS: {
          actions: assign({ players: ({ event }) => event.players }),
        },
        NEXT: { target: 'setupBoard' },
        BACK: { target: 'setupPlayers' },
        SKIP: {
          target: 'setupBoard',
          actions: assign({
            skippedSteps: ({ context }) => [...context.skippedSteps, 'setupPlayers'],
          }),
        },
        CANCEL: { target: 'setupPlayers' },
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
        CANCEL: { target: 'setupPlayers' },
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
            BACK: { target: '#sugoroku.setupBoard' },
            CANCEL: { target: '#sugoroku.setupPlayers' },
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
              target: '#sugoroku.win',
            },
            {
              guard: ({ context }) => context.round >= MAX_ROUNDS,
              target: '#sugoroku.lose',
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
          target: 'setupPlayers',
          actions: assign(resetContext),
        },
      },
    },
    lose: {
      on: {
        RESET: {
          target: 'setupPlayers',
          actions: assign(resetContext),
        },
      },
    },
  },
});
