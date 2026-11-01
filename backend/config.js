import dotenv from 'dotenv';
import {fileURLToPath} from 'node:url';
// Backend-local configuration takes priority; process environment always wins.
dotenv.config({path:[fileURLToPath(new URL('.env',import.meta.url)),fileURLToPath(new URL('../.env',import.meta.url))],quiet:true});
