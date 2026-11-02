import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {rateLimit} from 'express-rate-limit';
import multer from 'multer';
import {fileTypeFromBuffer} from 'file-type';
import {mkdir,writeFile,unlink,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {z,ZodError} from 'zod';
import {SiteSchema,CredentialsSchema,NewPassword} from '../shared/schema.js';
import {saveDraft,publishDraft,toggleHalloween} from './store.js';
import {resolveTheme} from '../shared/themes.js';
import {hashPassword,verifyPassword,randomToken,tokenHash,securityMiddleware} from './security.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const versionSchema=z.object({expectedVersion:z.number().int().positive()}).strict();
const conflict=res=>res.status(409).json({error:'A newer draft was saved in another window. Reload before saving.'});
export async function createApp(store,options={}){
 const config={production:false,origins:['http://127.0.0.1:5173','http://localhost:5173','http://127.0.0.1:4000','http://localhost:4000'],cookieSecure:false,sessionHours:12,uploadsDir:path.join(root,'backend/uploads'),...options};
 await mkdir(config.uploadsDir,{recursive:true});
 const app=express(),s=securityMiddleware(store,config),streams=new Set();
 app.disable('x-powered-by');if(config.trustProxy)app.set('trust proxy',1);
 app.use(helmet({contentSecurityPolicy:config.production?{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'",'data:','https:','http:'],connectSrc:["'self'"],frameSrc:["'self'"],objectSrc:["'none'"],baseUri:["'self'"],formAction:["'self'"],upgradeInsecureRequests:config.cookieSecure?[]:null}}:false}));
 app.use(cookieParser());app.use(express.json({limit:'800kb',type:'application/json'}));
 app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');next();});
 const writeOrigin=(req,res,next)=>['GET','HEAD','OPTIONS'].includes(req.method)?next():s.origin(req,res,next);
 app.use('/api',writeOrigin);
 const loginLimit=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Too many sign-in attempts. Try again in 15 minutes.'}});
 const writeLimit=rateLimit({windowMs:60*1000,limit:120,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Too many updates. Wait a moment.'}});
 app.get('/api/health',(req,res)=>res.json({status:'ok',database:store.connection.readyState===1?'connected':'unavailable'}));
 app.post('/api/auth/login',loginLimit,async(req,res)=>{const {email,password}=CredentialsSchema.parse(req.body);const admin=await store.Admin.findOne({email:email.toLowerCase()}).lean();const dummy='scrypt$0123456789abcdef0123456789abcdef$'+'00'.repeat(64);const valid=await verifyPassword(password,admin?.passwordHash||dummy);if(!admin||!valid)return res.status(401).json({error:'Email or password is incorrect.'});const token=randomToken(),csrf=randomToken();await store.Session.create({tokenHash:tokenHash(token),admin:admin._id,csrf,expiresAt:new Date(Date.now()+config.sessionHours*3600000)});res.cookie(s.cookieName,token,s.cookieOptions);res.json({user:{email:admin.email},csrf});});
 app.get('/api/auth/session',s.auth,(req,res)=>res.json({user:{email:req.admin.email},csrf:req.session.csrf}));
 app.post('/api/auth/logout',s.auth,s.csrf,async(req,res)=>{await store.Session.deleteOne({_id:req.session._id});res.clearCookie(s.cookieName,{...s.cookieOptions,maxAge:undefined});res.json({ok:true});});
 app.get('/api/site',async(req,res)=>{const doc=await store.Site.findById('main').select('published publishedRevision publishedAt').lean();if(!doc)return res.status(503).json({error:'The website is being initialized.'});res.json({site:doc.published,revision:doc.publishedRevision,publishedAt:doc.publishedAt});});
 app.get('/api/site/stream',async(req,res)=>{res.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});res.flushHeaders();res.write('retry: 3000\n\n');streams.add(res);const timer=setInterval(()=>res.write(': keepalive\n\n'),25000);req.on('close',()=>{clearInterval(timer);streams.delete(res);});});
 app.use('/api/admin',s.auth,writeLimit,(req,res,next)=>['GET','HEAD'].includes(req.method)?next():s.csrf(req,res,next));
 app.get('/api/admin/site',async(req,res)=>{const doc=await store.Site.findById('main').lean();res.json({site:doc.draft,draftVersion:doc.draftVersion,revision:doc.publishedRevision,draftUpdatedAt:doc.draftUpdatedAt,publishedAt:doc.publishedAt,halloweenEnabled:resolveTheme(doc.published.appearance).preset==='halloween'});});
 app.put('/api/admin/site',async(req,res)=>{const body=z.object({site:SiteSchema,expectedVersion:z.number().int().positive()}).strict().parse(req.body);const saved=await saveDraft(store,body.site,body.expectedVersion);if(!saved)return conflict(res);res.json({site:saved.draft,draftVersion:saved.draftVersion,revision:saved.publishedRevision,draftUpdatedAt:saved.draftUpdatedAt});});
 app.post('/api/admin/publish',async(req,res)=>{const {expectedVersion}=versionSchema.parse(req.body);const saved=await publishDraft(store,expectedVersion,req.admin.email);if(!saved)return conflict(res);for(const stream of streams)stream.write(`data: ${JSON.stringify({revision:saved.publishedRevision})}\n\n`);res.json({revision:saved.publishedRevision,publishedAt:saved.publishedAt,halloweenEnabled:resolveTheme(saved.published.appearance).preset==='halloween'});});
 app.patch('/api/admin/halloween',async(req,res)=>{
  const body=z.object({enabled:z.boolean(),expectedVersion:z.number().int().positive(),expectedRevision:z.number().int().positive()}).strict().parse(req.body);
  const saved=await toggleHalloween(store,body,req.admin.email);
  if(!saved)return conflict(res);
  for(const stream of streams)stream.write(`data: ${JSON.stringify({revision:saved.publishedRevision})}\n\n`);
  res.json({appearance:saved.draft.appearance,draftVersion:saved.draftVersion,revision:saved.publishedRevision,publishedAt:saved.publishedAt,halloweenEnabled:resolveTheme(saved.published.appearance).preset==='halloween'});
 });
 app.get('/api/admin/history',async(req,res)=>{const doc=await store.Site.findById('main').select('history').lean();res.json({history:doc.history.map(({revision,createdAt,actor})=>({revision,createdAt,actor})).reverse()});});
 app.post('/api/admin/restore',async(req,res)=>{const {revision,expectedVersion}=z.object({revision:z.number().int().positive(),expectedVersion:z.number().int().positive()}).strict().parse(req.body);const doc=await store.Site.findById('main').lean();const snapshot=doc.history.find(h=>h.revision===revision);if(!snapshot)return res.status(404).json({error:'Revision is no longer retained.'});const saved=await saveDraft(store,snapshot.content,expectedVersion);if(!saved)return conflict(res);res.json({site:saved.draft,draftVersion:saved.draftVersion,revision:saved.publishedRevision});});
 app.get('/api/admin/export',async(req,res)=>{const doc=await store.Site.findById('main').lean();res.set('Content-Disposition','attachment; filename="portfolio-content-backup.json"');res.json({format:'hansana-portfolio-backup-v1',exportedAt:new Date().toISOString(),draft:doc.draft,published:doc.published});});
 app.post('/api/admin/password',loginLimit,async(req,res)=>{const {currentPassword,newPassword}=z.object({currentPassword:z.string().max(128),newPassword:NewPassword}).strict().parse(req.body);if(!await verifyPassword(currentPassword,req.admin.passwordHash))return res.status(400).json({error:'Current password is incorrect.'});await store.Admin.updateOne({_id:req.admin._id},{$set:{passwordHash:await hashPassword(newPassword)}});await store.Session.deleteMany({admin:req.admin._id});res.clearCookie(s.cookieName,{...s.cookieOptions,maxAge:undefined});res.json({ok:true});});
 const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1}});
 app.post('/api/admin/media',upload.single('file'),async(req,res)=>{if(!req.file)return res.status(400).json({error:'Choose an image or PDF.'});const type=await fileTypeFromBuffer(req.file.buffer);const allowed=['image/png','image/jpeg','image/webp','image/avif','image/gif','application/pdf'];if(!type||!allowed.includes(type.mime))return res.status(400).json({error:'Upload a PNG, JPEG, WebP, AVIF, GIF or PDF. SVG uploads are not accepted.'});const filename=randomToken()+'.'+type.ext,location=path.join(config.uploadsDir,filename);await writeFile(location,req.file.buffer,{flag:'wx'});try{const media=await store.Media.create({filename,originalName:path.basename(req.file.originalname).replace(/[\x00-\x1f]/g,'').slice(0,150),url:'/uploads/'+filename,mime:type.mime,size:req.file.size,actor:req.admin.email});res.status(201).json({media});}catch(error){await unlink(location);throw error;}});
 app.get('/api/admin/media',async(req,res)=>{const uploaded=await store.Media.find().sort({createdAt:-1}).lean();const builtins=[];async function scan(dir,prefix){for(const item of await readdir(dir,{withFileTypes:true})){if(item.isDirectory())await scan(path.join(dir,item.name),prefix+'/'+item.name);else if(/\.(png|webp|jpe?g|svg|pdf|gif|avif)$/i.test(item.name)){const info=await stat(path.join(dir,item.name));builtins.push({_id:'builtin:'+prefix+'/'+item.name,originalName:item.name,url:prefix+'/'+item.name,size:info.size,builtin:true,archived:false,mime:/\.pdf$/i.test(item.name)?'application/pdf':'image'});}}}await scan(path.join(root,'frontend/public/assets'),'/assets');res.json({media:[...uploaded,...builtins]});});
 app.patch('/api/admin/media/:id',async(req,res)=>{if(!mongooseId(req.params.id))return res.status(400).json({error:'Invalid media ID.'});const {archived}=z.object({archived:z.boolean()}).strict().parse(req.body);const media=await store.Media.findByIdAndUpdate(req.params.id,{$set:{archived}},{returnDocument:'after'});if(!media)return res.status(404).json({error:'Media not found.'});res.json({media});});
 app.use('/uploads',express.static(config.uploadsDir,{dotfiles:'deny',fallthrough:false,immutable:true,maxAge:'1y',setHeaders(res){res.set('X-Content-Type-Options','nosniff');}}));
 app.use('/assets',express.static(path.join(root,'frontend/public/assets'),{dotfiles:'deny',maxAge:'1d'}));
 app.use('/api',(req,res)=>res.status(404).json({error:'API endpoint not found.'}));
 if(config.serveClient){app.use(express.static(path.join(root,'frontend/dist'),{dotfiles:'deny'}));app.get('/{*path}',(req,res)=>res.sendFile('index.html',{root:path.join(root,'frontend/dist')}));}
 app.use((error,req,res,next)=>{if(error instanceof ZodError)return res.status(400).json({error:'Please correct the highlighted content.',issues:error.issues.map(i=>({path:i.path.join('.'),message:i.message}))});if(error instanceof multer.MulterError)return res.status(error.code==='LIMIT_FILE_SIZE'?413:400).json({error:error.code==='LIMIT_FILE_SIZE'?'Maximum upload size is 10 MB.':'Upload could not be accepted.'});if(error.type==='entity.too.large')return res.status(413).json({error:'Content is too large. Upload media rather than embedding it.'});if(error instanceof SyntaxError&&'body'in error)return res.status(400).json({error:'Invalid JSON.'});if(error.status===404)return res.status(404).json({error:'File not found.'});console.error('Request failed:',error.name);res.status(500).json({error:'The request could not be completed.'});});
 app.locals.closeStreams=()=>{for(const stream of streams)stream.end();streams.clear();};
 return app;
}
function mongooseId(value){return /^[a-f\d]{24}$/i.test(value);}



