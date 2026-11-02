import React from 'react';

function FlyingBat(){return <svg viewBox="0 0 100 50" fill="currentColor">
 <path className="bat-wing wing-left" d="M49 24C33 21 17 7 2 2C7 15 7 27 1 38C16 29 22 30 25 42C34 32 41 34 49 48Z"/>
 <path className="bat-wing wing-right" d="M51 24C67 21 83 7 98 2C93 15 93 27 99 38C84 29 78 30 75 42C66 32 59 34 51 48Z"/>
 <path d="M44 24L43 12L49 19H52L58 12L57 25L53 48H47Z"/>
 </svg>;}
function Web(){return <svg viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth=".7">
 <path d="M0 0V160M0 0L49 152M0 0L94 129M0 0L129 94M0 0L152 49M0 0H160"/>
 {[28,55,84,115,150].map(r=><path key={r} d={`M0 ${r}Q${r*.12} ${r*.73} ${r*.31} ${r*.95}Q${r*.35} ${r*.68} ${r*.59} ${r*.81}Q${r*.55} ${r*.56} ${r*.81} ${r*.59}Q${r*.68} ${r*.35} ${r*.95} ${r*.31}Q${r*.74} ${r*.12} ${r} 0`}/>)}
 </svg>;}
function Spider(){return <svg viewBox="0 0 60 70" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
 <g className="spider-legs"><path d="M24 29L12 17L5 3M23 34L8 28L2 17M23 40L8 43L2 56M25 44L15 55L12 68M36 29L48 17L55 3M37 34L52 28L58 17M37 40L52 43L58 56M35 44L45 55L48 68"/></g>
 <ellipse cx="30" cy="38" rx="11" ry="15" fill="currentColor"/><circle cx="30" cy="23" r="7" fill="currentColor"/>
 <g fill="#f4b975" stroke="none"><circle cx="27" cy="22" r="1.3"/><circle cx="33" cy="22" r="1.3"/></g>
 </svg>;}
export default function HalloweenHaunts(){return <div className="halloween-haunts" aria-hidden="true">
 <div className="haunt-web web-northwest"><Web/></div><div className="haunt-web web-northeast"><Web/></div><div className="haunt-web web-southwest"><Web/></div>
 {[0,1,2,3].map(i=><div key={i} className={'sky-bat sky-bat-'+i}><FlyingBat/></div>)}
 {[0,1,2].map(i=><div key={i} className={'edge-lantern edge-lantern-'+i}><span/><img src="/assets/seasonal/pumpkin.svg" alt=""/></div>)}
 <div className="spider-dangle"><span className="spider-thread"/><Spider/></div>
 <div className="spider-dangle spider-dangle-small"><span className="spider-thread"/><Spider/></div>
 </div>;}
