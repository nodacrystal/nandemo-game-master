import type { GameDefinition } from '../types';
import { sugorokuMeta } from './meta';
import { sugorokuMachine } from './machine';
import { sugorokuMessageFor } from './messages';

export const sugorokuGame: GameDefinition = {
  meta: sugorokuMeta,
  machine: sugorokuMachine,
  messageFor: sugorokuMessageFor,
};
