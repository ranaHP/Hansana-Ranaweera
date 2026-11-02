import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';import {launch} from '../backend/index.js';
const runtime=await launch();const vite=await createServer({configFile:fileURLToPath(new URL('../frontend/vite.config.js',import.meta.url))});await vite.listen();console.log('React: http://127.0.0.1:'+(process.env.FRONTEND_PORT||5173)+'/');
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await vite.close();await runtime.close();process.exit();});
