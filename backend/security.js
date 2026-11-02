import {randomBytes,scrypt as callbackScrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(callbackScrypt);
export const randomToken=()=>randomBytes(32).toString('base64url');
export const tokenHash=value=>createHash('sha256').update(value).digest('hex');
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64);return `scrypt$${salt}$${key.toString('hex')}`;}
export async function verifyPassword(password,hash){const [,salt,expected]=hash?.split('$')||[];if(!salt||!expected)return false;try{const actual=await scrypt(password,salt,64);const bytes=Buffer.from(expected,'hex');return bytes.length===actual.length&&timingSafeEqual(bytes,actual);}catch{return false;}}
export function constantEqual(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function securityMiddleware(store,config){
 const cookieName=config.cookieName||'portfolio.sid';
 const cookieOptions={httpOnly:true,sameSite:'strict',secure:config.cookieSecure,path:'/',maxAge:config.sessionHours*3600000};
 const auth=async(req,res,next)=>{try{const token=req.cookies[cookieName];if(!token||token.length>200)return res.status(401).json({error:'Please sign in.'});const session=await store.Session.findOne({tokenHash:tokenHash(token),expiresAt:{$gt:new Date()}}).populate('admin').lean();if(!session?.admin){res.clearCookie(cookieName,{...cookieOptions,maxAge:undefined});return res.status(401).json({error:'Session expired. Please sign in.'});}req.session=session;req.admin=session.admin;next();}catch(e){next(e);}};
 const origin=(req,res,next)=>{const value=req.get('origin');if(value&&!config.origins.includes(value))return res.status(403).json({error:'This request origin is not allowed.'});next();};
 const csrf=(req,res,next)=>{if(!constantEqual(req.get('x-csrf-token'),req.session?.csrf))return res.status(403).json({error:'Invalid security token. Refresh and sign in again.'});next();};
 return {auth,csrf,origin,cookieName,cookieOptions};
}
