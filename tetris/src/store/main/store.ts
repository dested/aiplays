import {action, observable} from 'mobx';

export class MainStore {}

export const mainStore = new MainStore();
export type MainStoreProps = {mainStore?: MainStore};
export const MainStoreName = 'mainStore';
