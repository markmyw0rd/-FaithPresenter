export type TargetResult={target:string;status:'succeeded'|'failed'|'skipped';message:string};
export function runTargets(targets:Array<{target:string;ready:boolean;action:()=>Promise<unknown>}>):Promise<TargetResult[]>;
export function summary(results:TargetResult[]):string;
