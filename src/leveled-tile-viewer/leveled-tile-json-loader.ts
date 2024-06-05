import * as ångström from './leveled_image_def_ångström.json';

export interface LevelImageDef {
  Levels: LevelDef[];
}

export interface LevelDef {
  Tiles: LevelTile[];
}

export interface LevelTile {
  X: number;
  Y: number;
  Width: number;
  Height: number;
  dataUrl?: string;
}

export function getLeveledImageDefÅngström() {
  return ångström as LevelImageDef;
}
