import type {Slide} from './workspace-model';
export type Playback={playing:boolean;position:number;at:number;loop:boolean;volume?:number;muted?:boolean};
export type LiveState={sequence:number;revision:number;appliedRevision:number;status:'closed'|'opening'|'ready'|'error';displayId:number|null;displayLabel:string;windowed:boolean;slide:Slide|null;serviceId:string;serviceTitle:string;mode:string;church:string;blackout:boolean;slideshow?:{running:boolean;index:number;total:number;interval:number;loop:boolean};mediaError?:string;playback?:Playback;message:string};
