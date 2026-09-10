// Shared by desktop validation and the renderer. Only enumerated fonts and hex colours.
const defaultStyle={font:'Arial',fontSize:88,bold:true,italic:false,uppercase:false,color:'#ffffff',align:'center',vertical:'center',lineHeight:1.2,x:8,y:8,width:84,height:84,shadow:true,outline:0,outlineColor:'#000000',plate:'none',plateColor:'#000000',plateOpacity:70,platePadding:12,backgroundColor:'#090b12',dim:0};
const fonts=['Arial','Georgia','Verdana','Trebuchet MS'];
function validateStyle(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid slide style.');
 const out={...defaultStyle};
 const enums={font:fonts,align:['left','center','right'],vertical:['top','center','bottom'],plate:['none','box','lines']};
 const ranges={fontSize:[24,160],lineHeight:[1,2],x:[0,90],y:[0,90],width:[10,100],height:[10,100],outline:[0,6],plateOpacity:[0,100],platePadding:[0,24],dim:[0,85]};
 for(const key of Object.keys(defaultStyle)){
  if(value[key]===undefined)continue;const v=value[key];
  if(enums[key]){if(!enums[key].includes(v))throw Error('Invalid '+key);out[key]=v;}
  else if(ranges[key]){if(typeof v!=='number'||!Number.isFinite(v)||v<ranges[key][0]||v>ranges[key][1])throw Error('Invalid '+key);out[key]=Math.round(v*100)/100;}
  else if(typeof defaultStyle[key]==='boolean'){if(typeof v!=='boolean')throw Error('Invalid '+key);out[key]=v;}
  else{if(typeof v!=='string'||!/^#[0-9a-fA-F]{6}$/.test(v))throw Error('Use a six-digit hex colour for '+key);out[key]=v.toLowerCase();}
 }
 if(out.x+out.width>100.01||out.y+out.height>100.01)throw Error('Text box must stay inside the slide.');
 return out;
}
module.exports={defaultStyle,fonts,validateStyle};
