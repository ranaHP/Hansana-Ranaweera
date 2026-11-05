import {z} from 'zod';
const text=z.string().max(8000);
export const safeUrl=z.string().max(2048).refine(v=>!v||(/^\/(?!\/)/.test(v))||/^#[\w-]+$/.test(v)||/^(https?:\/\/|mailto:|tel:)/i.test(v),'Use a relative URL, https/http URL, email, telephone or section anchor.');
const color=z.string().regex(/^#[\da-f]{6}$/i,'Use a six-digit hex color.');
const palette=z.object(Object.fromEntries(['page','field','paper','ink','muted','blue','line','mint','hero','soft'].map(k=>[k,color])));
const id=z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/);
const tags=z.array(z.string().max(200)).max(35);
const project=z.object({id,title:text,category:text,status:text,summary:text,stack:tags,challenge:text,role:text,approach:text,decisions:text,outcome:text,learning:text,flow:tags,flowNote:text,note:text,number:z.string().max(10).optional(),image:safeUrl.optional(),link:safeUrl.optional()}).strict();
const allowedTags=['div','header','footer','nav','main','aside','section','article','a','button','span','p','h1','h2','h3','h4','h5','h6','em','strong','b','i','small','picture','source','img','canvas','figure','figcaption','time','details','summary','code','pre','kbd','br','ul','ol','li','svg','path','circle','ellipse','rect','line','polyline','polygon','g','defs','pattern','text'];
const attr=z.string().max(12000).refine(v=>!/[<>]/.test(v),'Invalid attribute.');
export const NodeSchema=z.lazy(()=>z.union([
 z.object({type:z.literal('text'),value:z.string().max(2)}).strict(),
 z.object({type:z.literal('copy'),key:z.string().max(150)}).strict(),
 z.object({type:z.literal('binding'),value:z.string().max(400)}).strict(),
 z.object({type:z.literal('element'),tag:z.enum(allowedTags),attrs:z.record(z.string().max(80),attr).refine(a=>Object.entries(a).every(([k,v])=>!/^on/i.test(k)&&!['dangerouslySetInnerHTML','srcDoc'].includes(k)&&(!['href','src','srcset'].includes(k)||v.includes('{{')||safeUrl.safeParse(v).success)&&(!(k==='style')||!/url\s*\(|expression|@import|javascript/i.test(v))),'Unsafe element attribute.'),children:z.array(NodeSchema).max(500)}).strict()
]));
const itemArray=schema=>z.array(schema).max(80);
const mmdd=z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
export const SiteSchema=z.object({
 schemaVersion:z.literal(1),
 profile:z.object({firstName:text,lastName:text,positioning:text,location:text,role:text,company:text,industry:text,period:text,email:z.email(),resume:safeUrl,linkedin:safeUrl,github:safeUrl,originalPortrait:safeUrl,originalPortraitFallback:safeUrl}).strict(),
 seo:z.object({title:z.string().min(1).max(200),description:z.string().max(500),canonical:safeUrl,ogImage:safeUrl}).strict(),
 appearance:z.object({preset:z.enum(['original','halloween','christmas','night','custom']),customColors:palette,font:z.enum(['system','arial','trebuchet','serif']),radius:z.number().min(0).max(50),sectionSpacing:z.number().min(25).max(140),animations:z.boolean(),seasonalDecor:z.boolean(),backgroundImage:safeUrl,schedule:z.object({enabled:z.boolean(),timezone:z.string().refine(t=>{try{new Intl.DateTimeFormat('en',{timeZone:t});return true;}catch{return false;}},'Unknown timezone.'),rules:itemArray(z.object({id,theme:z.enum(['original','halloween','christmas','night']),start:mmdd,end:mmdd,enabled:z.boolean()}).strict())}).strict()}).strict(),
 hero:z.object({portrait:safeUrl,portraitFallback:safeUrl,portraitAlt:text,minHeight:z.number().min(0).max(1100),padding:z.number().min(12).max(90),nameSize:z.number().min(32).max(110),imageScale:z.number().min(.5).max(1.8),imageX:z.number().min(-200).max(200),imageY:z.number().min(-200).max(200),imageTop:z.number().min(-100).max(160),imageBottom:z.number().min(-500).max(100),imageInsetX:z.number().min(-50).max(15),mobileNameSize:z.number().min(30).max(70),mobileImageScale:z.number().min(.5).max(1.8),mobilePortraitRatio:z.number().min(.6).max(1.8),showIcons:z.boolean(),iconOpacity:z.number().min(0).max(1),showPlanning:z.boolean(),backgroundImage:safeUrl}).strict(),
 heroIcons:itemArray(z.object({id,label:text,image:safeUrl,x:z.number().min(0).max(95),y:z.number().min(0).max(95),visible:z.boolean(),tilt:z.number().min(-30).max(30)}).strict()),
 navigation:itemArray(z.object({id,label:text,href:safeUrl,visible:z.boolean()}).strict()),
 sections:itemArray(z.object({id,label:text,visible:z.boolean()}).strict()),
 world:z.object({enabled:z.boolean(),defaultScene:z.number().int().min(0).max(2),paused:z.boolean(),background:color,white:color,stone:color,slate:color,blue:color,mint:color,followTheme:z.boolean()}).strict(),
 worldScenes:itemArray(z.object({id,title:text,kicker:text,description:text}).strict()).length(3),
 data:z.object({projects:itemArray(project),lab:itemArray(project),skills:itemArray(z.object({id,title:text,level:text,summary:text,detail:text}).strict()),experience:itemArray(z.object({id,period:text,title:text,company:text,description:text}).strict()),education:itemArray(z.object({id,title:text,institution:text,period:text,description:text}).strict()),certificates:itemArray(z.object({id,title:text,issuer:text,group:text,logo:safeUrl,evidenceImage:safeUrl,year:text,evidenceLabel:text,verificationUrl:safeUrl,description:text}).strict()),additionalCourses:itemArray(z.object({id,title:text,issuer:text,year:text}).strict()),methods:itemArray(z.object({id,title:text,question:text,description:text}).strict()),notes:itemArray(z.object({id,title:text,type:text,summary:text,sections:itemArray(z.object({id,heading:text,text}).strict()),note:text}).strict()),recognition:itemArray(z.object({id,year:text,text}).strict())}).strict(),
 labels:z.record(z.string().max(100),text),
 copy:z.record(z.string().max(150),text),
 copyMeta:z.record(z.string().max(150),z.object({group:z.string().max(100),label:z.string().max(250)}).strict()),
 document:z.array(NodeSchema).max(100)
}).strict().superRefine((site,ctx)=>{
 const lists=[site.navigation,site.sections,site.heroIcons,...Object.values(site.data)];
 for(const list of lists){const ids=list.map(v=>v.id);if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Each collection must have unique IDs.'});}
 if(new TextEncoder().encode(JSON.stringify(site)).length>600000)ctx.addIssue({code:'custom',message:'Content exceeds 600 KB. Upload images instead of embedding them.'});
});
export const CredentialsSchema=z.object({email:z.email(),password:z.string().min(1).max(128)}).strict();
export const NewPassword=z.string().min(12,'Use at least 12 characters.').max(128).regex(/[a-zA-Z]/,'Include a letter.').regex(/\d/,'Include a number.');
