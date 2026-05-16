import type { GameDefinition } from '../types';
import { numberHuntMeta } from './meta';
import { numberHuntMachine } from './machine';
import { numberHuntMessageFor } from './messages';

export const numberHuntGame: GameDefinition = {
  meta: numberHuntMeta,
  machine: numberHuntMachine,
  messageFor: numberHuntMessageFor,
};
