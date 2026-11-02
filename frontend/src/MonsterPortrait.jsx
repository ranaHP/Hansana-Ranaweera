import React,{useEffect,useRef,useState} from 'react';

export default function MonsterPortrait({pictureProps,children,layoutKey}){
 const pointerType=useRef('mouse');
 const normal=useRef(null),[box,setBox]=useState(null),[ready,setReady]=useState(false);
 const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[pinned,setPinned]=useState(false);
 const active=ready&&(hovered||focused||pinned);
 useEffect(()=>{
  const picture=normal.current,img=picture.querySelector('img'),stage=picture.parentElement;
  const measure=()=>{
   if(!img.naturalWidth)return;
   const p=picture.getBoundingClientRect(),s=stage.getBoundingClientRect();
   const scale=Math.min(p.width/img.naturalWidth,p.height/img.naturalHeight);
   const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
   // Coordinates follow the actual contained image, including admin scale/insets.
   setBox({left:p.left-s.left+(p.width-width)/2+width*.31,top:p.top-s.top+height*.015,width:width*.34,height:height*.27});
  };
  const observer=new ResizeObserver(measure);observer.observe(picture);observer.observe(stage);
  img.addEventListener('load',measure);window.addEventListener('resize',measure);measure();
  return()=>{observer.disconnect();img.removeEventListener('load',measure);window.removeEventListener('resize',measure);};
 },[layoutKey]);
 const {key:ignoredKey,...attributes}=pictureProps;
 return <>
  <picture {...attributes} ref={normal} className="monster-normal" data-revealed={active}>{children}</picture>
  <picture {...attributes} className="monster-alternate" data-revealed={active} aria-hidden="true">
   <img src="/assets/seasonal/hansana-monster.png" alt="" decoding="async" onLoad={()=>setReady(true)}/>
  </picture>
  {box&&<button type="button" className="monster-face-trigger" style={box}
   aria-label="Reveal Halloween monster portrait" aria-pressed={active} disabled={!ready}
   onPointerEnter={e=>{if(e.pointerType!=='touch')setHovered(true);}}
   onPointerLeave={()=>setHovered(false)} onFocus={e=>setFocused(e.currentTarget.matches(':focus-visible'))} onBlur={()=>setFocused(false)}
   onPointerDown={e=>{pointerType.current=e.pointerType;}}
   onClick={e=>{if(pointerType.current==='touch'||e.detail===0)setPinned(v=>!v);}}
   onKeyDown={e=>{if(e.key==='Escape'){setPinned(false);setHovered(false);setFocused(false);e.currentTarget.blur();}}}>
   <span className="monster-invitation" data-revealed={active}><span className="monster-hover-copy">Hover my face</span><span className="monster-touch-copy">Tap for my alter ego</span><i>✧</i></span>
  </button>}
 </>;
}
