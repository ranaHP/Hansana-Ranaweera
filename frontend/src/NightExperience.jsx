import React,{useEffect,useRef} from 'react';

export function NightCertificateGhost(){return <span className="night-certificate-ghost" aria-hidden="true"><Ghost/></span>;}
export function NightArchiveLights(){return <div className="night-archive-lights" aria-hidden="true"><span><WallLamp/></span><span><WallLamp/></span><p>THE ARCHIVE AFTER DARK · MOVE OR TAP TO EXPLORE</p></div>;}
export function NightHeroLamp(){return <div className="night-hero-lighting" aria-hidden="true"><div className="night-hero-wall-wash"/><span className="night-hero-wall-lamp night-hero-wall-left"><WallLamp/></span><span className="night-hero-wall-lamp night-hero-wall-right"><WallLamp/></span></div>;}
function Ghost(){return <svg viewBox="0 0 80 110" fill="none"><path d="M12 99V39C12 1 68 1 68 39V99L57 91L45 103L33 93L22 102Z" fill="#d3edf0" fillOpacity=".75"/><path d="M18 91V39C18 10 60 8 62 37" stroke="#f2ffff" strokeOpacity=".65"/><ellipse cx="30" cy="42" rx="4" ry="7" fill="#14212c"/><ellipse cx="50" cy="42" rx="4" ry="7" fill="#14212c"/><ellipse cx="40" cy="64" rx="5" ry="6" fill="#375564"/></svg>;}
function WallLamp(){return <svg viewBox="0 0 70 85" fill="none"><defs><linearGradient id="night-wall-metal"><stop stopColor="#080c10"/><stop offset=".5" stopColor="#6b7171"/><stop offset="1" stopColor="#19212a"/></linearGradient><radialGradient id="night-wall-glass"><stop stopColor="#fffce8"/><stop offset=".35" stopColor="#ffe3a2"/><stop offset="1" stopColor="#ac712d"/></radialGradient></defs><rect x="29" y="4" width="12" height="76" rx="3" fill="url(#night-wall-metal)"/><path d="M14 23L34 8L56 23L50 65H20Z" fill="url(#night-wall-metal)" stroke="#7b8588" strokeWidth=".6"/><path d="M21 27H48L44 58H25Z" fill="url(#night-wall-glass)"/><path d="M24 28L27 57H30L27 28Z" fill="#fff" fillOpacity=".3"/><path d="M34 25V61M20 43H49" stroke="#252e32" strokeWidth="3"/><path d="M17 65H52L43 75H26Z" fill="url(#night-wall-metal)"/><path d="M19 23H51M25 66H46" stroke="#bec4bd" strokeOpacity=".4"/><circle cx="35" cy="79" r="1.3" fill="#7b8487"/></svg>;}

export function NightPortraitScene(){return <div className="night-portrait-scene" aria-hidden="true"><div className="night-window"><i/><i/><i/><i/></div><div className="night-hero-moon"/><img src="/assets/seasonal/after-hours-street.svg" alt="" className="night-street-art"/><span className="night-street-sign">CURIOSITY LANE <b>↗</b></span><div className="night-wall-sconce"><WallLamp/></div><div className="night-hero-pool"/></div>;}

const neighbors=[{id:'north',x:.965,y:.59},{id:'west',x:.035,y:.74},{id:'wanderer',x:.7,y:.86,mobileX:.82,mobileY:.8}];
// Match the approved preset: torch on, fully illuminated, at dusk.
export default function NightExperience({motionEnabled=true}){
 const pointer=useRef({x:0,y:0}),frame=useRef(0);
 useEffect(()=>{
  const html=document.documentElement;
  html.dataset.nightTorch='on';html.dataset.nightWall='on';html.dataset.nightAll='on';html.dataset.nightMotion=motionEnabled?'on':'off';
  html.style.setProperty('--night-depth',0);
  html.style.setProperty('--night-torch-mask','#000');html.style.setProperty('--night-wall-mask','#000');html.style.setProperty('--night-street-mask','transparent');
  html.style.setProperty('--night-torch-shadow','transparent');html.style.setProperty('--night-wall-shadow','transparent');html.style.setProperty('--night-street-shadow','#000');
  return()=>{for(const key of ['nightTorch','nightStreet','nightWall','nightAll','nightMotion'])delete html.dataset[key];for(const v of ['--night-depth','--night-x','--night-y','--night-torch-mask','--night-street-mask','--night-wall-mask','--night-torch-shadow','--night-street-shadow','--night-wall-shadow'])html.style.removeProperty(v);};
 },[motionEnabled]);
 useEffect(()=>{
  const update=()=>{
   frame.current=0;const {x,y}=pointer.current;
   document.documentElement.style.setProperty('--night-x',x+'px');document.documentElement.style.setProperty('--night-y',y+'px');
   for(const area of document.querySelectorAll('.night-dark-card')){const r=area.getBoundingClientRect();if(r.bottom>=0&&r.top<=innerHeight){area.style.setProperty('--archive-x',(x-r.left)+'px');area.style.setProperty('--archive-y',(y-r.top)+'px');}}
  };
  const schedule=()=>{if(!frame.current)frame.current=requestAnimationFrame(update);};
  const move=e=>{if(e.type==='pointermove'&&e.pointerType!=='mouse')return;pointer.current={x:e.clientX,y:e.clientY};schedule();};
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerdown',move,{passive:true});
  pointer.current={x:innerWidth*.7,y:innerHeight*.35};update();
  return()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('pointermove',move);document.removeEventListener('pointerdown',move);cancelAnimationFrame(frame.current);};
 },[]);
 return <>
  <div className="night-environment" aria-hidden="true"><div className="night-sky"/><div className="night-stars"/><div className="night-haze"/><div className="night-brickwork night-reveal-mask"/><div className="night-wall-pool"/></div>
  <div className="night-neighbors night-reveal-mask" aria-hidden="true">{neighbors.map(n=><div key={n.id} className="night-ghost is-found" style={{'--ghost-x':n.x*100+'%','--ghost-y':n.y*100+'%','--ghost-mobile-x':(n.mobileX??n.x)*100+'%','--ghost-mobile-y':(n.mobileY??n.y)*100+'%',animationDelay:n.x*-10+'s'}}><Ghost/></div>)}</div>
  <div className="night-torch-halo" aria-hidden="true"/><div className="night-torch-point" aria-hidden="true"/>
 </>;
}
