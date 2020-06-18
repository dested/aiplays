import _1 from './assets/game/blocks.png';
import _2 from './assets/game/misc-2.png';
import _3 from './assets/game/selectionBox.png';

export type AssetKeys = 'game.blocks' | 'game.misc_2' | 'game.selectionBox';
export const Assets: {[key in AssetKeys]: {asset: Promise<typeof import('*.png')>; height: number; width: number}} = {
  'game.blocks': {asset: _1, width: 130, height: 149},
  'game.misc_2': {asset: _2, width: 293, height: 394},
  'game.selectionBox': {asset: _3, width: 36, height: 20},
};
