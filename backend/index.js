import './config.js';
import {pathToFileURL} from 'node:url';
import {connectStore,ensureSeed} from './store.js';
import {createApp} from './app.js';
export async function launch(uri=process.env.MONGODB_URI){
 if(!uri)throw new Error('Set MONGODB_URI in .env, or use npm run demo.');
 const store=await connectStore(uri);await ensureSeed(store);
 const production=process.env.NODE_ENV==='production';
 const app=await createApp(store,{serveClient:true,production,cookieName:process.env.SESSION_COOKIE_NAME||'portfolio.sid',cookieSecure:process.env.COOKIE_SECURE==='true',origins:(process.env.ALLOWED_ORIGINS||'http://localhost:4000,http://127.0.0.1:4000,http://localhost:5173,http://127.0.0.1:5173').split(',').map(v=>v.trim()),trustProxy:process.env.TRUST_PROXY==='true'});
 const port=Number(process.env.PORT||4000),host=process.env.HOST||'127.0.0.1';
 const server=app.listen(port,host,()=>console.log(`Website: http://${host}:${port}/\nAdmin: http://${host}:${port}/admin`));
 return {store,app,server,async close(){app.locals.closeStreams();await new Promise(r=>server.close(r));await store.close();}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)launch().then(runtime=>{for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await runtime.close();process.exit();});}).catch(e=>{console.error(e.message);process.exit(1);});
