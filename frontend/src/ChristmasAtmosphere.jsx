import React,{useEffect,useState} from 'react';

function Gift({color='#a64145',ribbon='#e8c88e'}){return <svg viewBox="0 0 90 92" fill="none"><path d="M12 39H79V86H12Z" fill={color}/><path d="M8 31H83V44H8Z" fill={color}/><path d="M39 31H51V86H39Z" fill={ribbon}/><path d="M8 35H83" stroke="#fff" strokeOpacity=".14"/><path d="M45 30C17 34 16 7 27 10C39 12 45 30 45 30ZM46 30C73 33 75 7 64 10C53 12 46 30 46 30Z" stroke={ribbon} strokeWidth="5"/><path d="M16 81H35M56 81H74" stroke="#000" strokeOpacity=".08" strokeWidth="2"/></svg>;}
function Reindeer(){return <svg viewBox="0 0 240 130" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M46 75Q77 56 118 68L148 43L158 24L173 25L181 40L169 57L162 85L130 97L89 94L70 86L51 106L25 105M95 92L78 119L52 119M139 92L159 112L181 112M154 80L180 91L210 83M49 72L30 60L22 66M161 25L153 8L147 2M154 12L142 11M159 19L167 5L176 1M167 10L181 12"/><path d="M51 77Q78 64 116 74L151 50L162 35L172 35L164 56L156 80L128 90L91 88Z" fill="currentColor" stroke="none"/><circle cx="176" cy="37" r="2.6" fill="#b9494c" stroke="none"/></svg>;}

export function ChristmasPortrait(){return <div className="christmas-portrait-scene" aria-hidden="true"><div className="christmas-halo"/><img className="christmas-winter-art" src="/assets/seasonal/winter-garden.svg" alt=""/><div className="christmas-hero-deer"><Reindeer/></div><div className="christmas-gift hero-gift-one"><Gift/></div><div className="christmas-gift hero-gift-two"><Gift color="#c7d5bf" ribbon="#94753e"/></div><div className="christmas-gift hero-gift-three"><Gift color="#e9d2aa" ribbon="#99464b"/></div><div className="christmas-tree"><i/><i/><i/><b>✦</b><span/><span/><span/></div></div>;}

export default function ChristmasAtmosphere({motionEnabled=true}){
 const [paused,setPaused]=useState(false);
 useEffect(()=>{document.documentElement.dataset.christmasMotion=paused||!motionEnabled?'paused':'running';return()=>{delete document.documentElement.dataset.christmasMotion;};},[paused,motionEnabled]);
 return <><div className="christmas-atmosphere" aria-hidden="true"><div className="christmas-glow"/><div className="christmas-stars"/>
  <div className="christmas-snow">{Array.from({length:26},(_,i)=><i key={i} style={{left:((i*37+3)%100)+'%',animationDelay:-(i%13)+'s',animationDuration:(14+i%9)+'s',width:(i%3+2)+'px',height:(i%3+2)+'px'}}/>)}</div>
  <div className="christmas-garland">{Array.from({length:18},(_,i)=><span key={i} style={{animationDelay:-(i%4)+'s'}}/>)}</div>
  <div className="christmas-reindeer-flight"><Reindeer/><Reindeer/><span>✦</span></div>
  {[0,1,2,3].map(i=><div key={i} className={'christmas-gift edge-gift edge-gift-'+i}><Gift color={i%2?'#d2dfc7':'#a64145'} ribbon={i%2?'#9b7840':'#e8c88e'}/></div>)}
 </div><button type="button" className="christmas-motion-control" aria-label={paused?'Resume Christmas ambience':'Pause Christmas ambience'} aria-pressed={paused} disabled={!motionEnabled} onClick={()=>setPaused(v=>!v)}><span aria-hidden="true">{paused?'▷':'Ⅱ'}</span><span>{!motionEnabled?'Motion off':paused?'Resume ambience':'Pause ambience'}</span></button></>;
}
