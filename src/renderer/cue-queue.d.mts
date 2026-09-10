import type{Item,Slide,SlideTransition}from'./workspace-model';
export type ShowCue={id:string;itemId:string;itemTitle:string;itemIndex:number;slideIndex:number;number:number;label:string;transition:SlideTransition;slide:Slide};
export function buildCueQueue(items:Item[]):ShowCue[];
export function showShortcut(event:KeyboardEvent,armed:boolean):boolean;
