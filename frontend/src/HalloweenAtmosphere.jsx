import React,{useEffect,useState} from 'react';
import HalloweenHaunts from './HalloweenHaunts.jsx';

// Local artwork and bounded CSS motion; no canvas or global pointer loop.
export function HalloweenPortrait(){
 return <div className="halloween-portrait-scene" aria-hidden="true">
  <div className="halloween-moon"><span/><i/><i/><i/></div>
  <img className="halloween-landscape" src="/assets/seasonal/midnight-landscape.svg" alt=""/>
  {[0,1,2].map(i=><img key={i} className={'halloween-bat bat-'+i} src="/assets/seasonal/bat.svg" alt=""/>)}
  <div className="halloween-orbit"/>
  <img className="halloween-pumpkin pumpkin-large" src="/assets/seasonal/pumpkin.svg" alt=""/>
  <img className="halloween-pumpkin pumpkin-small" src="/assets/seasonal/pumpkin.svg" alt=""/>
 </div>;
}

export default function HalloweenAtmosphere({motionEnabled=true}){
 const [paused,setPaused]=useState(false);
 useEffect(()=>{document.documentElement.dataset.hauntMotion=paused||!motionEnabled?'paused':'running';return()=>{delete document.documentElement.dataset.hauntMotion;};},[paused,motionEnabled]);
 return <><div className="halloween-atmosphere" aria-hidden="true">
  <div className="halloween-aurora aurora-purple"/>
  <div className="halloween-aurora aurora-amber"/>
  <div className="halloween-starfield"/>
  <div className="halloween-fog fog-one"/><div className="halloween-fog fog-two"/>
  {Array.from({length:18},(_,i)=><i key={i} className="halloween-firefly" style={{left:((i*37+9)%100)+'%',top:((i*23+7)%100)+'%',animationDelay:-(i%7)+'s',animationDuration:(8+i%5)+'s'}}/>)}
 </div><HalloweenHaunts/><button type="button" className="haunt-motion-control" aria-label={paused?'Resume Halloween ambience':'Pause Halloween ambience'} aria-pressed={paused} disabled={!motionEnabled} onClick={()=>setPaused(v=>!v)}><span aria-hidden="true">{paused?'▷':'Ⅱ'}</span><span className="haunt-control-label">{!motionEnabled?'Motion off':paused?'Resume ambience':'Pause ambience'}</span></button></>;
}
