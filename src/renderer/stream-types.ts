import type {Slide} from './workspace-model';import type {Playback} from './live-types';
export type StreamState={sequence:number;revision:number;appliedRevision:number;status:'closed'|'opening'|'ready'|'error';slide:Slide|null;serviceId:string;serviceTitle:string;mode:string;church:string;blackout:boolean;message:string;playback?:Playback};
