import mongoose from 'mongoose';
import {readFile} from 'node:fs/promises';
import {SiteSchema} from '../shared/schema.js';

export async function connectStore(uri){
 const connection=await mongoose.createConnection(uri,{serverSelectionTimeoutMS:10000}).asPromise();
 const {Schema}=mongoose;
 const Admin=connection.model('Admin',new Schema({email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true}},{timestamps:true}));
 const Session=connection.model('Session',new Schema({tokenHash:{type:String,required:true,unique:true},admin:{type:Schema.Types.ObjectId,ref:'Admin',required:true},csrf:{type:String,required:true},expiresAt:{type:Date,required:true,index:{expires:0}}},{timestamps:true}));
 const historySchema=new Schema({revision:Number,createdAt:Date,actor:String,content:Schema.Types.Mixed},{_id:false});
 const Site=connection.model('Site',new Schema({_id:{type:String,default:'main'},draft:{type:Schema.Types.Mixed,required:true},published:{type:Schema.Types.Mixed,required:true},draftVersion:{type:Number,default:1},publishedRevision:{type:Number,default:1},publishedAt:Date,draftUpdatedAt:Date,halloweenRestore:Schema.Types.Mixed,seasonalRestore:Schema.Types.Mixed,history:[historySchema]},{timestamps:true,minimize:false}));
 const Media=connection.model('Media',new Schema({filename:String,originalName:String,url:String,mime:String,size:Number,archived:{type:Boolean,default:false},actor:String},{timestamps:true}));
 await Promise.all([Admin.init(),Session.init(),Site.init(),Media.init()]);
 const store={connection,Admin,Session,Site,Media,async close(){await connection.close();}};
 return store;
}
export async function ensureSeed(store){
 if(await store.Site.exists({_id:'main'}))return false;
 const content=SiteSchema.parse(JSON.parse(await readFile(new URL('../seed/site.json',import.meta.url),'utf8')));
 const now=new Date();
 try{await store.Site.create({_id:'main',draft:content,published:content,draftVersion:1,publishedRevision:1,publishedAt:now,draftUpdatedAt:now,history:[{revision:1,createdAt:now,actor:'Initial content',content}]});}catch(error){if(error.code!==11000)throw error;}
 return true;
}
export async function saveDraft(store,content,expectedVersion){
 const parsed=SiteSchema.parse(content);
 return store.Site.findOneAndUpdate({_id:'main',draftVersion:expectedVersion},{$set:{draft:parsed,draftUpdatedAt:new Date()},$inc:{draftVersion:1}},{returnDocument:'after'}).lean();
}
export async function publishDraft(store,expectedVersion,actor){
 const document=await store.Site.findById('main').lean();
 if(!document||document.draftVersion!==expectedVersion)return null;
 const content=SiteSchema.parse(document.draft),now=new Date(),revision=document.publishedRevision+1;
 return store.Site.findOneAndUpdate({_id:'main',draftVersion:expectedVersion,publishedRevision:document.publishedRevision},{$set:{published:content,publishedAt:now},$inc:{publishedRevision:1},$push:{history:{$each:[{revision,createdAt:now,actor,content}],$slice:-12}}},{returnDocument:'after'}).lean();
}

// A live mode change must not publish unrelated saved or unsaved draft content.
export async function toggleSeasonalTheme(store,theme,{enabled,expectedVersion,expectedRevision},actor){
 if(!['halloween','christmas'].includes(theme))throw new Error('Unknown seasonal theme');
 const doc=await store.Site.findById('main').lean();
 if(!doc||doc.draftVersion!==expectedVersion||doc.publishedRevision!==expectedRevision)return null;
 const restore=structuredClone(doc.seasonalRestore||doc.halloweenRestore||{});
 const change=(content,key)=>{
  const site=structuredClone(content),a=site.appearance;
  const seasonal=['halloween','christmas'];
  if(enabled&&!seasonal.includes(a.preset))restore[key]={preset:a.preset,seasonalDecor:a.seasonalDecor};
  const previous=restore[key]&&!seasonal.includes(restore[key].preset)?restore[key]:null;
  site.appearance={...a,preset:enabled?theme:a.preset===theme?(previous?.preset||'original'):a.preset,
   seasonalDecor:enabled?true:a.preset===theme?(previous?.seasonalDecor??true):a.seasonalDecor,
   schedule:{...a.schedule,enabled:false}};
  return SiteSchema.parse(site);
 };
 const draft=change(doc.draft,'draft'),published=change(doc.published,'published');
 const now=new Date(),revision=doc.publishedRevision+1;
 return store.Site.findOneAndUpdate({_id:'main',draftVersion:expectedVersion,publishedRevision:expectedRevision},
  {$set:{draft,published,seasonalRestore:restore,draftUpdatedAt:now,publishedAt:now},$inc:{draftVersion:1,publishedRevision:1},
   $push:{history:{$each:[{revision,createdAt:now,actor,content:published}],$slice:-12}}},{returnDocument:'after'}).lean();
}


export const toggleHalloween=(store,body,actor)=>toggleSeasonalTheme(store,'halloween',body,actor);
export const toggleChristmas=(store,body,actor)=>toggleSeasonalTheme(store,'christmas',body,actor);
