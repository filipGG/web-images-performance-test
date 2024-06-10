import * as FP_DEF_512 from './fp_def_512.json';

export interface FPDefinition {
  Tiles: FPTile[];
}

export interface FPTile {
  X: number;
  Y: number;
  Width: number;
  Height: number;
  Layers: FPTileLayer[];
}

export interface FPTileLayer {
  Name: string;
  Images?: FPTileLayerImages;
}

export interface FPTileLayerImages {
  Full: string;
  Half: string;
  Quarter: string;
}

export function loadFPDef512(): FPDefinition {
  return FP_DEF_512 as FPDefinition;
}
