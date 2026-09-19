"use client";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, memo, Suspense, type RefObject } from "react";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
type V = [number, number, number];
const ivory="#e6e5d8", dark="#273839", green="#758478";
function Box({position=[0,0,0],scale=[1,1,1],color=ivory,rotation=[0,0,0],metalness=.1,...rest}:{position?:V;scale?:V;color?:string;rotation?:V;metalness?:number;[key:string]:any}){return <mesh position={position} rotation={rotation} castShadow receiveShadow {...rest}><boxGeometry args={scale}/><meshStandardMaterial color={color} roughness={.55} metalness={metalness}/></mesh>}
function Rod({a,b,r=.04,color=dark}:{a:V;b:V;r?:number;color?:string}){const mid=new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5);const dif=new T.Vector3(...b).sub(new T.Vector3(...a));return <mesh position={mid} quaternion={new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dif.clone().normalize())} castShadow><cylinderGeometry args={[r,r,dif.length(),10]}/><meshStandardMaterial color={color} metalness={.65} roughness={.3}/></mesh>}
// Preserve the supplied geometry, UVs and textures. Convert its +X nose to +Z,
// normalize the complete aircraft to 13.5 scene units, and seat the skids on the pad.
function Helicopter({onReady}:{onReady:()=>void}) {
 const gltf=useLoader(GLTFLoader,"/models/kiowa/scene.gltf");
 const model=useMemo(()=>{
  const root=new T.Group(); const aircraft=gltf.scene.clone(true);
  aircraft.rotation.y=-Math.PI/2; root.add(aircraft); root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(root); const size=bounds.getSize(new T.Vector3());
  const scale=13.5/size.z; aircraft.scale.multiplyScalar(scale); root.updateMatrixWorld(true);
  bounds.setFromObject(root); const center=bounds.getCenter(new T.Vector3());
  aircraft.position.add(new T.Vector3(-center.x,-.055-bounds.min.y,-1-center.z));
  aircraft.traverse(obj=>{if(obj instanceof T.Mesh){
   obj.castShadow=true;obj.receiveShadow=true;
   const materials=Array.isArray(obj.material)?obj.material:[obj.material];
   // Transparent canopy must not occlude the airframe or cast an opaque shadow.
   if(materials.every(mat=>mat.transparent))obj.castShadow=false;
  }});
  root.updateMatrixWorld(true); return root;
 },[gltf]);
 useEffect(()=>{onReady()},[onReady]);
 return <primitive object={model} dispose={null}/>;
}
// Photographic 360-degree midday sky, also used for coherent material reflections.
// Locally hosted so the scene does not depend on a third-party image request.
function MiddaySky(){
 const {gl,scene}=useThree();
 const sky=useLoader(T.TextureLoader,"/environment/midday-sky.jpg");
 useEffect(()=>{
  sky.mapping=T.EquirectangularReflectionMapping;sky.colorSpace=T.SRGBColorSpace;
  sky.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());sky.needsUpdate=true;
  const pmrem=new T.PMREMGenerator(gl);const environment=pmrem.fromEquirectangular(sky);
  scene.background=sky;scene.backgroundBlurriness=0;scene.backgroundIntensity=1.12;
  scene.environment=environment.texture;scene.environmentIntensity=.85;
  return()=>{scene.background=null;scene.environment=null;environment.dispose();pmrem.dispose()};
 },[gl,scene,sky]);
 return null;
}
function makePad(){const c=document.createElement("canvas");c.width=c.height=2048;const x=c.getContext("2d")!;x.fillStyle="#68746c";x.fillRect(0,0,2048,2048);let seed=4;for(let i=0;i<50000;i++){seed=(seed*16807)%2147483647;const px=seed%2048;seed=(seed*16807)%2147483647;x.fillStyle=i%2?"#ffffff08":"#0000000a";x.fillRect(px,seed%2048,2,2)}x.strokeStyle="#dbdcac";x.lineWidth=17;x.beginPath();x.arc(1024,1024,773,0,Math.PI*2);x.stroke();x.lineWidth=4;x.beginPath();x.arc(1024,1024,817,0,Math.PI*2);x.stroke();x.lineWidth=5;x.strokeStyle="#c8ccb951";for(let i=0;i<2048;i+=256){x.beginPath();x.moveTo(i,0);x.lineTo(i,2048);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(2048,i);x.stroke()}x.fillStyle="#e2e1c3";x.font="bold 710px Arial";x.textAlign="center";x.textBaseline="middle";x.fillText("H",1024,1050);x.font="42px Arial";x.fillText("A L T I T U D E   /   0 1",1024,1940);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
function Rooftop({motion}:{motion:boolean}){const map=useMemo(makePad,[]);return <group>
 <Box position={[0,-60.25,0]} scale={[23,119.5,23]} color="#818c83"/>
 <Box position={[0,-.63,0]} scale={[24,1.1,24]} color="#b0b4a4"/>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,-.067,0]}><planeGeometry args={[23.6,23.6]}/><meshStandardMaterial map={map} roughness={.95}/></mesh>
 {[-1,1].map(s=><group key={s}><Box position={[s*11.85,.13,0]} scale={[.18,.4,24]} color="#a5aa9a"/><Box position={[0,.13,s*11.85]} scale={[24,.4,.18]} color="#a5aa9a"/>{Array.from({length:13},(_,i)=><group key={i}><Rod a={[s*11.85,.25,-11+i*1.83]} b={[s*11.85,1,-11+i*1.83]} r={.017} color="#5e7069"/><Rod a={[-11+i*1.83,.25,s*11.85]} b={[-11+i*1.83,1,s*11.85]} r={.017} color="#5e7069"/></group>)}<Rod a={[s*11.85,.98,-11.85]} b={[s*11.85,.98,11.85]} r={.025} color="#6c7970"/><Rod a={[-11.85,.98,s*11.85]} b={[11.85,.98,s*11.85]} r={.025} color="#6c7970"/></group>)}
 {Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return <group key={i} position={[Math.cos(a)*10.8,0,Math.sin(a)*10.8]}><Box position={[0,.06,0]} scale={[.23,.12,.23]} color="#444e43"/><mesh position={[0,.15,0]}><sphereGeometry args={[.075,10,8]}/><meshStandardMaterial color="#dce59a" emissive="#dce59a" emissiveIntensity={1.5}/></mesh></group>})}
 <group position={[-9,.1,-9]}><Box position={[0,1.2,0]} scale={[3,2.4,3.5]} color="#a7aca0"/><Box position={[0,2.45,0]} scale={[3.2,.15,3.7]} color="#6b7970"/><Box position={[.3,.97,1.77]} scale={[1,1.95,.05]} color="#68786f"/>{[-.8,.8].map(v=><mesh key={v} position={[v,2.7,0]}><cylinderGeometry args={[.43,.43,.4,16]}/><meshStandardMaterial color="#7c887d"/></mesh>)}</group>
 <Rod a={[9,0,-9]} b={[9,4.1,-9]} r={.035} color="#d8d5bd"/><WindSock motion={motion}/>
 </group>}
function WindSock({motion}:{motion:boolean}){const sock=useRef<T.Group>(null);useFrame(s=>{if(sock.current&&motion)sock.current.rotation.y=Math.sin(s.clock.elapsedTime*.65)*.1});return <group ref={sock} position={[9,3.9,-9]} rotation={[0,0,Math.PI/2-.12]}>{[0,1,2,3,4].map(i=><mesh key={i} position={[0,i*.24,0]}><cylinderGeometry args={[.2-i*.023,.224-i*.023,.245,16,1,true]}/><meshStandardMaterial color={i%2?"#e9e4d0":"#d58049"} side={T.DoubleSide}/></mesh>)}</group>}
// Dense nearby clouds fade into the photographic sky before the camera's far plane.
// A small, filtered 3D noise texture keeps the volume inexpensive to sample.
function CloudDeck({motion}:{motion:boolean}){
 const material=useRef<T.ShaderMaterial>(null);
 const noise=useMemo(()=>{
  const edge=48,data=new Uint8Array(edge*edge*edge);let seed=71;
  for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=Math.floor(seed/2147483647*255)}
  const texture=new T.Data3DTexture(data,edge,edge,edge);texture.format=T.RedFormat;
  texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;
  texture.wrapS=texture.wrapT=texture.wrapR=T.RepeatWrapping;
  texture.unpackAlignment=1;texture.needsUpdate=true;return texture;
 },[]);
 const uniforms=useMemo(()=>({cloudNoise:{value:noise},drift:{value:0}}),[noise]);
 useFrame((_,delta)=>{if(motion&&material.current)material.current.uniforms.drift.value+=Math.min(delta,.05)*.45});
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-8,0]} frustumCulled={false}>
 <planeGeometry args={[2800,2800]}/>
 <shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false} side={T.DoubleSide}
 vertexShader={`
  varying vec3 cloudWorld;
  void main(){vec4 world=modelMatrix*vec4(position,1.0);cloudWorld=world.xyz;
   gl_Position=projectionMatrix*viewMatrix*world;}
 `}
 fragmentShader={`
  precision highp sampler3D;
  uniform sampler3D cloudNoise;uniform float drift;varying vec3 cloudWorld;
  float billow(vec3 p){
   p.xz+=vec2(drift,drift*.28);
   return texture(cloudNoise,p*.007).r*.68+texture(cloudNoise,p*.019+vec3(.17)).r*.32;
  }
  float density(vec3 p){
   float height=clamp((-p.y-8.0)/30.0,0.0,1.0);
   float profile=smoothstep(0.0,.18,height)*(1.0-smoothstep(.72,1.0,height));
   return smoothstep(.33,.69,billow(p))*profile;
  }
  void main(){
   vec3 ray=normalize(cloudWorld-cameraPosition);
   float stepLength=30.0/(max(-ray.y,.025)*12.0);
   vec3 lightDirection=normalize(vec3(38.0,54.0,24.0));
   vec3 accumulated=vec3(0.0);float transmission=1.0;
   for(int i=0;i<12;i++){
    vec3 p=cloudWorld+ray*(float(i)+.5)*stepLength;
    float d=density(p);
    float lit=clamp(.58+(d-density(p+lightDirection*7.0))*1.4,.22,1.0);
    vec3 cloudColor=mix(vec3(.43,.54,.64),vec3(.98,.98,.95),lit);
    float opacity=1.0-exp(-d*stepLength*.36);
    accumulated+=cloudColor*opacity*transmission;
    transmission*=1.0-opacity;
    if(transmission<.015)break;
   }
   // A dense lower bank closes gaps; nothing below the clouds can show through.
   float broad=billow(vec3(cloudWorld.x,-28.0,cloudWorld.z)*.43);
   vec3 lowerBank=mix(vec3(.63,.71,.77),vec3(.92,.94,.94),broad);
   vec3 color=accumulated+lowerBank*transmission;
   // Composite over the actual panorama rather than ending in a fixed haze color.
   // Both fades finish before far-plane clipping, including the elevated mobile camera.
   float distanceToCloud=length(cloudWorld.xz-cameraPosition.xz);
   float distanceFade=1.0-smoothstep(70.0,320.0,distanceToCloud);
   float horizonFade=smoothstep(.025,.18,-ray.y);
   gl_FragColor=vec4(color,distanceFade*horizonFade);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }
 `}/>
 </mesh>;
}
function Birds({motion}:{motion:boolean}){const refs=useRef<T.Group>(null);useFrame(s=>{if(refs.current&&motion){refs.current.position.x=Math.sin(s.clock.elapsedTime*.035)*50;refs.current.position.z=Math.cos(s.clock.elapsedTime*.035)*30}});return <group ref={refs} position={[0,20,-65]}>{Array.from({length:7},(_,i)=><group key={i} position={[i*2.7,i%3*.7,-65+i%2*2]}><Rod a={[-.45,.13,0]} b={[0,0,0]} r={.022} color="#526d70"/><Rod a={[0,0,0]} b={[.45,.13,.1]} r={.022} color="#526d70"/></group>)}</group>}
const poses=[new T.Vector3(12.8,6.5,15),new T.Vector3(-5.7,4.2,8),new T.Vector3(-9,4.1,-.8),new T.Vector3(-5,4.7,-12.8),new T.Vector3(7,12,-8),new T.Vector3(13.5,6.5,14.5)];
const targets=[new T.Vector3(0,2.05,-.8),new T.Vector3(0,2.45,1.5),new T.Vector3(0,2.3,-.5),new T.Vector3(0,2.8,-4.8),new T.Vector3(0,2.2,-1),new T.Vector3(0,2.05,-.8)];
function CameraRig({progress,motion}:{progress:RefObject<number>;motion:boolean}){const {camera,size}=useThree();const smooth=useRef(0);const path=useMemo(()=>new T.CatmullRomCurve3(poses,false,"catmullrom",.3),[]);const targetPath=useMemo(()=>new T.CatmullRomCurve3(targets,false,"catmullrom",.25),[]);const look=useRef(new T.Vector3());
 useEffect(()=>{const c=camera as T.PerspectiveCamera;const mobile=size.width<800;c.fov=mobile?53:39;c.setViewOffset(size.width,size.height,mobile?-size.width*.02:-size.width*.13,mobile?-size.height*.12:-size.height*.06,size.width,size.height);c.updateProjectionMatrix()},[camera,size]);
 useFrame((_,d)=>{smooth.current=motion?T.MathUtils.damp(smooth.current,progress.current,5,Math.min(d,.05)):progress.current;const p=path.getPoint(smooth.current);if(size.width<800)p.multiplyScalar(Math.max(1.35,1.55*Math.sqrt((size.height/size.width)/(844/390))));camera.position.copy(p);look.current.copy(targetPath.getPoint(smooth.current));camera.lookAt(look.current);});
 return null}
function Scene({progress,motion,onReady}:{progress:RefObject<number>;motion:boolean;onReady:()=>void}){
 return <Canvas shadows dpr={[1,1.7]} camera={{position:[12.8,6.5,15],fov:39,near:.1,far:800}} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}} onCreated={({gl})=>{gl.toneMapping=T.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;gl.shadowMap.type=T.PCFSoftShadowMap}}>
 <fog attach="fog" args={["#bccfdd",130,390]}/>
 <hemisphereLight args={["#daeaff","#676a60",.65]}/>
 <directionalLight position={[38,54,24]} intensity={3.1} color="#fff8ee" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-near={1} shadow-camera-far={110} shadow-bias={-.00015} shadow-normalBias={.014}/>
 <CloudDeck motion={motion}/><Rooftop motion={motion}/><Suspense fallback={null}><MiddaySky/><Helicopter onReady={onReady}/></Suspense><Birds motion={motion}/><CameraRig progress={progress} motion={motion}/>
 </Canvas>;
}
export default memo(Scene);
