import type {SlideStyle,Theme} from './workspace-model';
export const defaultStyle:SlideStyle={font:'Arial',fontSize:88,bold:true,italic:false,uppercase:false,color:'#ffffff',align:'center',vertical:'center',lineHeight:1.2,x:8,y:8,width:84,height:84,shadow:true,outline:0,outlineColor:'#000000',plate:'none',plateColor:'#000000',plateOpacity:70,platePadding:12,backgroundColor:'#090b12',dim:0};
export const fonts=['Arial','Georgia','Verdana','Trebuchet MS'] as const;
export const builtInThemes:{name:string;theme:Theme;style:SlideStyle}[]=[
 {name:'Classic worship',theme:'violet',style:{...defaultStyle}},
 {name:'Cinematic lower third',theme:'plain',style:{...defaultStyle,fontSize:72,x:8,y:63,width:84,height:29,align:'left',plate:'box',plateOpacity:60,dim:20}},
 {name:'Warm line highlights',theme:'plain',style:{...defaultStyle,color:'#493213',plate:'lines',plateColor:'#fff0d4',plateOpacity:95,shadow:false,fontSize:76,uppercase:true,lineHeight:1.5}},
 {name:'Scripture reading',theme:'forest',style:{...defaultStyle,font:'Georgia',fontSize:70,bold:false,align:'left',lineHeight:1.4}},
 {name:'Bold announcement',theme:'ocean',style:{...defaultStyle,fontSize:120,uppercase:true,outline:2,dim:15}},
];
export function boundBox(s:SlideStyle,patch:Partial<SlideStyle>):SlideStyle{const n={...s,...patch};n.width=Math.max(10,Math.min(100,n.width));n.height=Math.max(10,Math.min(100,n.height));n.x=Math.max(0,Math.min(100-n.width,n.x));n.y=Math.max(0,Math.min(100-n.height,n.y));return n;}
