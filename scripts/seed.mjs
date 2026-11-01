import '../backend/config.js';import {connectStore,ensureSeed} from '../backend/store.js';
if(!process.env.MONGODB_URI)throw new Error('Set MONGODB_URI in .env first.');const s=await connectStore(process.env.MONGODB_URI);try{console.log(await ensureSeed(s)?'Initial website imported.':'Existing website preserved.');}finally{await s.close();}
