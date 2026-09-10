export type Theme='violet'|'ocean'|'forest'|'plain';
export type SlideStyle={font:'Arial'|'Georgia'|'Verdana'|'Trebuchet MS';fontSize:number;bold:boolean;italic:boolean;uppercase:boolean;color:string;align:'left'|'center'|'right';vertical:'top'|'center'|'bottom';lineHeight:number;x:number;y:number;width:number;height:number;shadow:boolean;outline:number;outlineColor:string;plate:'none'|'box'|'lines';plateColor:string;plateOpacity:number;platePadding:number;backgroundColor:string;dim:number};
export type SavedTheme={id:string;version:number;updatedAt:string;deletedAt:string|null;name:string;theme:Theme;style:SlideStyle};
export type Media={id:string;name:string;kind:'image'|'video'|'audio';size:number;extension?:string;mime?:string;missing?:boolean};
export type SlideTransition={kind:'cut'|'fade';duration:number};
export type Presentation={label?:string;role?:'verse'|'chorus'|'bridge'|'tag'|'intro'|'outro'|'other';shortcut?:string;media?:{id:string;kind:'image'|'video'|'audio'};style?:SlideStyle;transition?:SlideTransition};
export type Slide={id:string;text:string;theme:Theme;presentation?:Presentation};
export type Item={id:string;title:string;slides:Slide[]};
export type WorkspaceData={schemaVersion:number;title:string;items:Item[]};
export type ServiceRecord={id:string;version:number;updatedAt:string;data:WorkspaceData};
export type ServiceSummary={id:string;title:string;createdAt:string;updatedAt:string;version:number;deletedAt:string|null;itemCount:number;slideCount:number};
export type ServiceVersion={version:number;savedAt:string};
export const empty=():WorkspaceData=>({schemaVersion:1,title:'Untitled service',items:[]});
export const newSlide=(text='Your slide text'):Slide=>({id:crypto.randomUUID(),text,theme:'violet'});
export const newItem=(title='New item'):Item=>({id:crypto.randomUUID(),title,slides:[newSlide()]});
export function moveItem(data:WorkspaceData,id:string,delta:number):WorkspaceData{
 const index=data.items.findIndex(item=>item.id===id);const next=index+delta;
 if(index<0||next<0||next>=data.items.length)return data;
 const items=[...data.items];[items[index],items[next]]=[items[next],items[index]];return {...data,items};
}
export function sample():WorkspaceData{return {schemaVersion:1,title:'Practice service · sample',items:[{...newItem('Welcome'),slides:[newSlide('WELCOME\nWe are glad you are here'),newSlide('Please take a moment\nto prepare for worship')]},{...newItem('Opening prayer'),slides:[newSlide('Let us pray together')]},{...newItem('Announcements'),slides:[newSlide('CHURCH FAMILY\nConnect. Serve. Grow.')]},{...newItem('Closing'),slides:[newSlide('Thank you for joining us\nHave a blessed week')]}]};}
