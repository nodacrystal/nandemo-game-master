import type { GameDefinition } from './types';
import { numberHuntGame } from './numberHunt';
import { sugorokuGame } from './sugoroku';

export const games: GameDefinition[] = [
  sugorokuGame,
  numberHuntGame,
];

export const gameById = new Map(games.map((game) => [game.meta.id, game]));
