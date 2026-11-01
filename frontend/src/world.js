import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Original abstract scene. No textures, remote assets, or real infrastructure data.
export function mountWorld(canvas,stage){
let api;const events=new AbortController();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,scene,camera,root,frame=0,paused=false,enabled=true,inView=false,disposed=false,lastTime=0,elapsed=0;
let active=0,turn=-.3,targetTurn=-.3,dragging=false,lastX=0;
const sets=[],signals=[],floaters=[];
let observer,resizeObserver,environment,pmrem;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<650?1.25:1.65));
  renderer.setClearColor(0xe5e9e7,1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  scene=new THREE.Scene();scene.background=new THREE.Color(0xe5e9e7);scene.fog=new THREE.Fog(0xe5e9e7,18,36);
  camera=new THREE.PerspectiveCamera(35,1,.1,80);camera.position.set(10,8.5,12);camera.lookAt(0,.3,0);
  pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();environment=pmrem.fromScene(room,.04).texture;scene.environment=environment;scene.environmentIntensity=.65;room.dispose();
  const hemi=new THREE.HemisphereLight(0xf8fffd,0xa5b4aa,1.4);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(-6,12,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:35});sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;sun.shadow.radius=4;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xc8dcff,.7);fill.position.set(8,5,-4);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.ShadowMaterial({color:0x517564,opacity:.17}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.13;floor.receiveShadow=true;scene.add(floor);
  root=new THREE.Group();root.rotation.y=turn;root.scale.setScalar(1.22);scene.add(root);
  const materials={white:new THREE.MeshStandardMaterial({color:0xf5f7f4,roughness:.44,metalness:.04}),stone:new THREE.MeshStandardMaterial({color:0xc8d6cf,roughness:.62,metalness:.06}),slate:new THREE.MeshStandardMaterial({color:0x78969e,roughness:.4,metalness:.28}),blue:new THREE.MeshStandardMaterial({color:0x345de3,roughness:.3,metalness:.15}),mint:new THREE.MeshStandardMaterial({color:0x99ccb4,roughness:.38,metalness:.12}),dark:new THREE.MeshStandardMaterial({color:0x344b58,roughness:.4,metalness:.18}),glass:new THREE.MeshPhysicalMaterial({color:0xc9dfe1,roughness:.12,metalness:.05,transmission:.45,thickness:.3,transparent:true,opacity:.72})};
  const box=(group,w,h,d,x,y,z,material='white',radius=.09)=>{const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(radius,h*.4)),materials[material]);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
  const sphere=(group,r,x,y,z,material='blue')=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),materials[material]);mesh.position.set(x,y,z);mesh.castShadow=true;group.add(mesh);return mesh;};
  const tube=(group,points,material='slate',radius=.035)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,40,radius,7,false),materials[material]);mesh.castShadow=true;group.add(mesh);return curve;};
  const torus=(group,r,tubeSize,x,y,z,material='white')=>{const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,tubeSize,14,64),materials[material]);mesh.position.set(x,y,z);mesh.castShadow=true;group.add(mesh);return mesh;};
  const column=(group,r,h,x,y,z,material='white')=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,40),materials[material]);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
  const base=(g)=>{box(g,7.5,.3,5.2,0,-.72,0,'stone',.14);box(g,7.15,.11,4.85,0,-.505,0,'white',.05);};
  // BUILD — connected layers, visible service boundaries, and a bridge.
  const build=new THREE.Group();base(build);
  for(let i=0;i<4;i++)box(build,1.75,.19,1.65,-1.5,.02+i*.49,-.3,i===3?'blue':i===1?'slate':'white');
  for(const x of [-2.09,-.91])for(const z of [-.88,.28])column(build,.035,1.7,x,.78,z,'slate');
  box(build,1.35,.72,1.35,1.7,-.05,.75,'white');box(build,1.1,.1,1.1,1.7,.38,.75,'mint');sphere(build,.29,1.7,.79,.75,'slate');
  const arch=new THREE.Mesh(new THREE.TorusGeometry(.85,.13,14,64,Math.PI),materials.white);arch.position.set(.65,.14,-1.4);arch.castShadow=true;build.add(arch);
  box(build,.26,.72,.28,-.2,-.2,-1.4,'white');box(build,.26,.72,.28,1.5,-.2,-1.4,'white');
  const path0=tube(build,[[-1.5,-.38,.9],[-1.1,-.38,1.5],[.5,-.38,1.5],[1.7,-.38,.75]],'slate',.028);
  const path1=tube(build,[[.65,-.38,-1.4],[1.4,-.38,-1.8],[2.6,-.38,-1.4],[2.6,-.38,.75],[1.7,-.38,.75]],'slate',.028);
  for(const [curve,offset] of [[path0,0],[path1,.5]]){const ball=sphere(build,.075,0,0,0,'blue');signals.push({group:build,ball,curve,offset});}
  column(build,.4,.1,-2.65,-.36,1.6,'stone');const buildOrb=sphere(build,.23,-2.65,.13,1.6,'mint');floaters.push({group:build,mesh:buildOrb,y:.13,offset:1});
  sets.push(build);root.add(build);
  // OPERATE — a central signal ring and connected, observable nodes.
  const operate=new THREE.Group();base(operate);
  column(operate,1.1,.2,0,-.27,0,'stone');column(operate,.85,.14,0,-.1,0,'white');
  const ring=torus(operate,1.12,.16,0,1.23,0,'slate');ring.rotation.y=.2;
  const inner=torus(operate,.69,.09,0,1.23,0,'glass');inner.rotation.y=.2;
  sphere(operate,.32,0,1.23,0,'blue');
  for(let i=0;i<4;i++){const angle=i*Math.PI/2+.5,x=Math.cos(angle)*2.5,z=Math.sin(angle)*1.7;box(operate,.9,.45,.9,x,-.19,z,'white');box(operate,.63,.06,.63,x,.07,z,i%2?'mint':'slate');const curve=tube(operate,[[x,.18,z],[x*.6,.4,z*.6],[0,1.23,0]],'slate',.022);const ball=sphere(operate,.065,0,0,0,'blue');signals.push({group:operate,ball,curve,offset:i*.24});}
  floaters.push({group:operate,mesh:inner,y:1.23,offset:2});sets.push(operate);root.add(operate);
  // EXPLORE — modular physical experimentation, a growing tower and open forms.
  const explore=new THREE.Group();base(explore);
  column(explore,.85,.21,-1.4,-.3,0,'stone');
  for(let i=0;i<4;i++){column(explore,.53,.32,-1.4,.02+i*.47,0,'white');const collar=torus(explore,.55,.055,-1.4,.08+i*.47,0,'mint');collar.rotation.x=Math.PI/2;for(let j=0;j<3;j++){const a=j*Math.PI*2/3+i*.6;const leaf=new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),materials.mint);leaf.scale.set(1.6,.45,1);leaf.position.set(-1.4+Math.cos(a)*.58,.12+i*.47,Math.sin(a)*.58);leaf.rotation.z=a;explore.add(leaf);}}
  box(explore,1.5,.22,1.5,1.55,-.24,.35,'white');const cube=box(explore,.8,.8,.8,1.55,.66,.35,'glass');cube.rotation.set(.3,.4,.15);const core=sphere(explore,.23,1.55,.66,.35,'blue');floaters.push({group:explore,mesh:cube,y:.66,offset:0},{group:explore,mesh:core,y:.66,offset:0});
  const arc=torus(explore,.8,.08,1.5,.8,.3,'slate');arc.rotation.set(.4,.7,.4);
  const path2=tube(explore,[[-1.4,-.36,1.1],[-.5,-.36,1.75],[1,-.36,1.5],[1.55,-.36,.35]],'slate',.03);const ball=sphere(explore,.075,0,0,0,'blue');signals.push({group:explore,ball,curve:path2,offset:.2});
  box(explore,.65,.13,.65,2.5,-.29,-1.3,'slate');box(explore,.4,.4,.4,2.5,.03,-1.3,'mint');sets.push(explore);root.add(explore);
  sets.forEach((g,i)=>{g.visible=i===0;});
  const tick=(now)=>{frame=0;if(disposed||!enabled||!inView||document.hidden)return;const delta=Math.max(0,Math.min((now-lastTime)/1000||0,.05));lastTime=now;if(!paused&&!reduced.matches)elapsed+=delta;turn+=(targetTurn-turn)*.055;root.rotation.y=turn+(paused||reduced.matches?0:Math.sin(elapsed*.15)*.045);root.position.y=paused||reduced.matches?0:Math.sin(elapsed*.6)*.025;
    for(const signal of signals){if(signal.group.visible)signal.ball.position.copy(signal.curve.getPointAt(((elapsed*.13+signal.offset)%1+1)%1));}
    for(const f of floaters)if(f.group.visible)f.mesh.position.y=f.y+(paused||reduced.matches?0:Math.sin(elapsed*1.15+f.offset)*.09);
    renderer.render(scene,camera);if(!paused&&!reduced.matches)frame=requestAnimationFrame(tick);
  };
  function draw(){if(!frame&&enabled&&inView&&!document.hidden&&!disposed){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
  function resize(){if(disposed)return;const {width,height}=stage.getBoundingClientRect();if(width<2||height<2)return;renderer.setSize(width,height,false);camera.aspect=width/height;const narrow=width<650;camera.position.set(narrow?12.5:10,narrow?11:8.5,narrow?15:12);camera.fov=narrow?40:35;camera.lookAt(0,.2,0);camera.updateProjectionMatrix();draw();}
  observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView){resize();draw();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px'});observer.observe(stage);
  resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else draw();};document.addEventListener('visibilitychange',visibility);
  const motionChange=()=>{cancelAnimationFrame(frame);frame=0;draw();};reduced.addEventListener('change',motionChange);
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';},{signal:events.signal});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;targetTurn+=(e.clientX-lastX)*.006;lastX=e.clientX;turn=targetTurn;draw();},{signal:events.signal});
  const endDrag=()=>{dragging=false;canvas.style.cursor='grab';};canvas.addEventListener('pointerup',endDrag,{signal:events.signal});canvas.addEventListener('pointercancel',endDrag,{signal:events.signal});canvas.style.cursor='grab';
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;stage.classList.remove('world-ready');},{signal:events.signal});
  canvas.addEventListener('webglcontextrestored',()=>{stage.classList.add('world-ready');resize();draw();},{signal:events.signal});
  api={setPalette(p){renderer.setClearColor(p.background,1);scene.background.set(p.background);scene.fog.color.set(p.background);for(const k of ['white','stone','slate','blue','mint'])materials[k].color.set(p[k]);draw();},setScene(index){active=index;sets.forEach((g,i)=>g.visible=i===index);targetTurn=-.3+index*.2;draw();},setPaused(value){paused=value;cancelAnimationFrame(frame);frame=0;draw();},setEnabled(value){enabled=value;if(!value){cancelAnimationFrame(frame);frame=0;}else{resize();draw();}},dispose(){events.abort();disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motionChange);scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){for(const mat of Array.isArray(obj.material)?obj.material:[obj.material])mat.dispose();}});environment.dispose();pmrem.dispose();renderer.dispose();}};
  stage.classList.add('world-ready');resize();
}catch(error){stage.classList.remove('world-ready');stage.dataset.rendering='fallback';api={setPalette(){},setScene(){},setPaused(){},setEnabled(){},dispose(){}};}

return api;
}

