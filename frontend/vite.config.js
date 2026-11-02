import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),plugins:[react()],server:{host:'127.0.0.1',port:Number(process.env.FRONTEND_PORT||5173),strictPort:true,proxy:{'/api':(process.env.BACKEND_URL||'http://127.0.0.1:'+(process.env.PORT||4000)),'/uploads':(process.env.BACKEND_URL||'http://127.0.0.1:'+(process.env.PORT||4000))}},build:{outDir:'dist',emptyOutDir:true}});
