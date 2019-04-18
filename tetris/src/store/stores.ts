import {gameStore, GameStoreProps} from './game/store';
import {mainStore, MainStoreProps} from './main/store';

export type AppStore = MainStoreProps | GameStoreProps;
export const stores: AppStore = {mainStore, gameStore};
