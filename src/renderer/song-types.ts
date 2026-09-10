import type {Theme} from './workspace-model';
export type SongData={title:string;author:string;copyright:string;theme:Theme;sections:{id:string;label:string;text:string}[];arrangement:string[]};
export type SongRecord={id:string;version:number;updatedAt:string;deletedAt:string|null;data:SongData};
export type SongSummary={id:string;version:number;updatedAt:string;deletedAt:string|null;title:string;author:string;sectionCount:number};
