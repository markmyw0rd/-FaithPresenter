export function isEditableTarget(target){return Boolean(target&&typeof target.closest==='function'&&target.closest('input,textarea,select,[contenteditable=true]'));}
export function productionShortcut(event,armed){
 if(!armed||event.repeat||!event.ctrlKey||!event.altKey||event.metaKey||isEditableTarget(event.target))return null;
 if(event.key==='Enter')return'take';
 const key=String(event.key).toLowerCase();
 return({c:'clear',b:'blackout',r:'restore',l:'church'})[key]||null;
}
