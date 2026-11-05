import React,{useEffect,useRef,useState} from 'react';

function Ghost(){return <svg viewBox="0 0 80 110" fill="none"><path d="M12 99V39C12 1 68 1 68 39V99L57 91L45 103L33 93L22 102Z" fill="#d3edf0" fillOpacity=".75"/><path d="M18 91V39C18 10 60 8 62 37" stroke="#f2ffff" strokeOpacity=".65"/><ellipse cx="30" cy="42" rx="4" ry="7" fill="#14212c"/><ellipse cx="50" cy="42" rx="4" ry="7" fill="#14212c"/><ellipse cx="40" cy="64" rx="5" ry="6" fill="#375564"/></svg>;}
function StreetLamp(){return <svg viewBox="0 0 85 420" fill="none"><defs><linearGradient id="night-post" x2="1"><stop stopColor="#0c1520"/><stop offset=".5" stopColor="#40505b"/><stop offset="1" stopColor="#15212a"/></linearGradient></defs><path d="M39 80H47V407H39Z" fill="url(#night-post)"/><path d="M32 405H54L62 420H24Z" fill="#18252f"/><path d="M43 83V34Q43 14 68 20" stroke="#3b4b56" strokeWidth="7"/><path d="M52 21L72 16L84 33H48Z" fill="#283844"/><path d="M51 34H80L76 48H56Z" fill="#edc68a" fillOpacity=".85"/><path d="M51 34H80" stroke="#ffdfa7" strokeWidth="2"/></svg>;}
function WallLamp(){return <svg viewBox="0 0 70 85" fill="none"><path d="M31 5H39V78H31Z" fill="#37444b"/><path d="M13 21L34 7L57 21L51 64H19Z" fill="#23333e" stroke="#60717a"/><path d="M20 26H49L45 57H24Z" fill="#ecc992"/><path d="M34 25V59M19 42H50" stroke="#3a4549" strokeWidth="3"/><path d="M17 65H52L43 75H26Z" fill="#1b2a33"/></svg>;}

export function NightPortraitScene(){return <div className="night-portrait-scene" aria-hidden="true"><div className="night-window"><i/><i/><i/><i/></div><div className="night-hero-moon"/><img src="/assets/seasonal/after-hours-street.svg" alt="" className="night-street-art"/><span className="night-street-sign">CURIOSITY LANE <b>↗</b></span><div className="night-wall-sconce"><WallLamp/></div><div className="night-hero-pool"/></div>;}

const neighbors=[{id:'north',x:.965,y:.59},{id:'west',x:.035,y:.74},{id:'wanderer',x:.7,y:.86,mobileX:.82,mobileY:.8}];
export default function NightExperience({motionEnabled=true}){
 const [expanded,setExpanded]=useState(false);
 const [torch,setTorch]=useState(true),[street,setStreet]=useState(true),[wall,setWall]=useState(true),[all,setAll]=useState(false),[depth,setDepth]=useState(.8),[paused,setPaused]=useState(false),[found,setFound]=useState([]);
 const pointer=useRef({x:0,y:0}),frame=useRef(0),foundIds=useRef(new Set());
 useEffect(()=>{
  const html=document.documentElement;
  html.dataset.nightTorch=torch?'on':'off';html.dataset.nightStreet=street||all?'on':'off';html.dataset.nightWall=wall||all?'on':'off';html.dataset.nightAll=all?'on':'off';html.dataset.nightMotion=paused||!motionEnabled?'off':'on';
  html.style.setProperty('--night-depth',depth);html.style.setProperty('--night-torch-shadow',torch?'transparent':'#000');html.style.setProperty('--night-street-shadow',street||all?'transparent':'#000');html.style.setProperty('--night-wall-shadow',wall||all?'transparent':'#000');html.style.setProperty('--night-torch-mask',torch?'#000':'transparent');html.style.setProperty('--night-street-mask',street||all?'#000':'transparent');html.style.setProperty('--night-wall-mask',wall||all?'#000':'transparent');
  if(all){foundIds.current=new Set(neighbors.map(n=>n.id));setFound([...foundIds.current]);}
 },[torch,street,wall,all,depth,paused,motionEnabled]);
 useEffect(()=>{
  const update=()=>{
   frame.current=0;const {x,y}=pointer.current,html=document.documentElement;
   html.style.setProperty('--night-x',x+'px');html.style.setProperty('--night-y',y+'px');
   if(torch&&!all)for(const n of neighbors){const gx=innerWidth<650?(n.mobileX??n.x):n.x,gy=innerWidth<650?(n.mobileY??n.y):n.y;if(Math.hypot(x-innerWidth*gx,y-innerHeight*gy)<90&&!foundIds.current.has(n.id)){foundIds.current.add(n.id);setFound([...foundIds.current]);}}
  };
  const move=e=>{
   if(e.target instanceof Element&&e.target.closest('[data-night-control]'))return;
   if(e.type==='pointermove'&&e.pointerType!=='mouse')return;
   pointer.current={x:e.clientX,y:e.clientY};if(!frame.current)frame.current=requestAnimationFrame(update);
  };
  const key=e=>{if(e.defaultPrevented||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;if(e.target instanceof Element&&e.target.closest('input,textarea,select,[contenteditable=true]')||document.querySelector('dialog[open]'))return;if(e.key.toLowerCase()==='f')setTorch(v=>!v);if(e.key.toLowerCase()==='l')setAll(v=>!v);};
  const resize=()=>{pointer.current={x:Math.min(pointer.current.x,innerWidth*.9),y:Math.min(pointer.current.y,innerHeight*.9)};if(!frame.current)frame.current=requestAnimationFrame(update);};
  window.addEventListener('resize',resize);document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerdown',move,{passive:true});document.addEventListener('keydown',key);
  pointer.current={x:innerWidth*.7,y:innerHeight*.35};update();
  return()=>{window.removeEventListener('resize',resize);document.removeEventListener('pointermove',move);document.removeEventListener('pointerdown',move);document.removeEventListener('keydown',key);cancelAnimationFrame(frame.current);};
 },[torch,all]);
 useEffect(()=>()=>{const h=document.documentElement;for(const key of ['nightTorch','nightStreet','nightWall','nightAll','nightMotion'])delete h.dataset[key];for(const v of ['--night-depth','--night-x','--night-y','--night-torch-mask','--night-street-mask','--night-wall-mask','--night-torch-shadow','--night-street-shadow','--night-wall-shadow'])h.style.removeProperty(v);},[]);
 return <>
  <div className="night-environment" aria-hidden="true"><div className="night-sky"/><div className="night-stars"/><div className="night-haze"/><div className="night-brickwork night-reveal-mask"/><div className="night-street-pool"/><div className="night-wall-pool"/><div className="night-road-reflection"/></div>
  <div className="night-neighbors night-reveal-mask" aria-hidden="true">{neighbors.map(n=><div key={n.id} className={'night-ghost '+(found.includes(n.id)?'is-found':'')} style={{'--ghost-x':n.x*100+'%','--ghost-y':n.y*100+'%','--ghost-mobile-x':(n.mobileX??n.x)*100+'%','--ghost-mobile-y':(n.mobileY??n.y)*100+'%',animationDelay:n.x*-10+'s'}}><Ghost/></div>)}</div>
  <div className="night-shadow-overlay" aria-hidden="true"/><div className="night-torch-halo" aria-hidden="true"/><div className="night-torch-point" aria-hidden="true"/>
  <div className="night-lamp night-street-lamp" data-night-control><div aria-hidden="true"><StreetLamp/></div><button type="button" aria-label="Streetlight" aria-pressed={street||all} title="Switch streetlight" onClick={()=>{if(all){setAll(false);setStreet(false);}else setStreet(v=>!v);}}><span className="sr-only">Streetlight</span></button></div>
  <button type="button" className="night-lamp night-switch-wall" data-night-control aria-label="Wall light" aria-pressed={wall||all} title="Switch wall light" onClick={()=>{if(all){setAll(false);setWall(false);}else setWall(v=>!v);}}><WallLamp/></button>
  <aside className="night-controls" data-expanded={expanded} data-night-control aria-label="Night exploration controls"><div className="night-controls-heading"><span>☾ AFTER HOURS</span><small role="status" aria-live="polite">{found.length} / 3 neighbors found</small><button type="button" className="night-expand" aria-label={expanded?'Close night controls':'Open night controls'} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'−':'+'}</button></div><p>Move your torch into the dark. On touch, tap to shine.</p><div className="night-control-actions"><button type="button" aria-label="Torch" aria-pressed={torch} aria-keyshortcuts="F" onClick={()=>setTorch(v=>!v)}>◉ Torch {torch?'on':'off'}</button><button type="button" aria-label="Light the street" aria-pressed={all} aria-keyshortcuts="L" onClick={()=>setAll(v=>!v)}>{all?'Return to shadows':'Light the street'}</button><button type="button" aria-label={paused?'Resume night ambience':'Pause night ambience'} aria-pressed={paused} disabled={!motionEnabled} onClick={()=>setPaused(v=>!v)}>{paused?'▷':'Ⅱ'}</button></div><label className="night-time"><span>Dusk</span><input type="range" min="0" max="1" step=".05" aria-label="Night depth" value={depth} onChange={e=>setDepth(Number(e.target.value))}/><span>Midnight</span></label></aside>
 </>;
}
