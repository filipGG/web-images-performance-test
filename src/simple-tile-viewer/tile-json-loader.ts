import * as ImageDef256 from './image_def_256.json';
//import * as ImageDef512 from './image_def_512.json';
import * as ImageDef512 from './image_def_512_v2.json';

export interface ImageData {
  full: ImageDataUrl;
  half: ImageDataUrl;
  quarter: ImageDataUrl;
}

export interface ImageDataUrl {
  Quality: string;
  dataUrl: string;
}

export interface ImageDefTile {
  X: number;
  Y: number;
  Width: number;
  Height: number;
  dataUrl?: ImageData;
}

export interface ImageDef {
  Tiles: ImageDefTile[];
}

export function getImageDef256() {
  return ImageDef256 as ImageDef;
}

export function getImageDef512() {
  return ImageDef512 as ImageDef;
}
