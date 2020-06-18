import {AssetKeys, Assets} from './assets';
import {safeKeys} from './utils/utilts';

export interface Asset<TKeys = string> {
  animated: boolean;
  base: {x: number; y: number};
  image: HTMLImageElement;
  images: HTMLImageElement[];
  name: TKeys;
  size: {height: number; width: number};
}

export interface AssetItem<TKeys> {
  base: {x: number; y: number};
  frameIndex?: number;
  realName: TKeys;
  size: {height: number; width: number};
  url: typeof import('*.png');
}

class AssetManager<TKeys extends string> {
  assetQueue: {[key in TKeys]: AssetItem<TKeys>} = {} as any;
  assets: {[key in TKeys]: Asset<TKeys>} = {} as any;

  addAsset(
    name: TKeys,
    url: typeof import('*.png'),
    size: {height: number; width: number},
    base: {x: number; y: number} = {x: 0, y: 0}
  ) {
    this.assetQueue[name] = {base, size, url, realName: name};
  }

  imageLoaded(img: HTMLImageElement, name: TKeys) {
    const assetQueue = this.assetQueue[name];

    const asset: Asset<TKeys> = this.assets[assetQueue.realName] || {
      size: null,
      base: null,
      name,
      image: null,
      images: null,
      animated: assetQueue.frameIndex !== undefined,
    };

    asset.size = assetQueue.size || {width: img.width, height: img.height};
    asset.base = assetQueue.base || {
      x: asset.size.width / 2,
      y: asset.size.height / 2,
    };

    if (assetQueue.frameIndex !== undefined) {
      asset.images = asset.images || [];
      asset.images[assetQueue.frameIndex] = img;
    } else {
      asset.image = img;
    }

    this.assets[assetQueue.realName] = asset;
  }

  async load() {
    for (const asset of safeKeys(Assets)) {
      TetrisAttackAssets.addAsset(asset, await Assets[asset].asset, {
        width: Assets[asset].width,
        height: Assets[asset].height,
      });
    }
    await TetrisAttackAssets.start();
  }

  async start() {
    const promises: Promise<void>[] = [];
    for (const name in this.assetQueue) {
      if (this.assetQueue.hasOwnProperty(name)) {
        promises.push(
          new Promise((res) => {
            const img = new Image();
            img.onload = () => {
              this.imageLoaded(img, name);
              res();
            };
            img.src = (this.assetQueue[name].url as unknown) as string;
          })
        );
      }
    }
    return await Promise.all(promises);
  }
}

export const TetrisAttackAssets = new AssetManager<AssetKeys>();

export function makeSheet(
  url: typeof import('*.png'),
  dimensions: {height: number; width: number},
  gap: {height: number; width: number}
): Promise<HTMLCanvasElement[][]> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const w = image.width / (dimensions.width + gap.width);
      const h = image.height / (dimensions.height + gap.height);

      const assetSheet: HTMLCanvasElement[][] = [];

      for (let y = 0; y < h; y++) {
        assetSheet[y] = [];
        for (let x = 0; x < w; x++) {
          const canvas = document.createElement('canvas');
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          const context = canvas.getContext('2d')!;
          context.drawImage(
            image,
            x * dimensions.width + gap.width * x,
            y * dimensions.height + gap.height * y,
            dimensions.width,
            dimensions.height,
            0,
            0,
            dimensions.width,
            dimensions.height
          );
          assetSheet[y][x] = canvas;
        }
      }
      resolve(assetSheet);
    };
    image.src = url;
  });
}
// http://www.mariouniverse.com/sprites-snes-ta/
