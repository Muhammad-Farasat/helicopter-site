"use client";
import { useEffect, useRef, useState, useCallback, Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, RotateCcw, Pause, Play, Wind } from "lucide-react";
const Scene = dynamic(() => import("./scene"), { ssr: false, loading: () => <div className="scene-loading">Preparing the rooftop<span /></div> });
const chapters = [
  { name: "The aircraft", title: "A different\npoint of view.", label: "MEET THE OH–58D", text: "Above the noise. Beyond the ordinary.", detail: "An exploration in flight.", spec: "360°", specLabel: "A new perspective" },
  { name: "The cockpit", title: "The city.\nFront row.", label: "01 / THE COCKPIT", text: "A close look through the Kiowa’s cockpit canopy.", detail: "Get closer to the pilot’s point of view.", spec: "01", specLabel: "Panoramic cockpit" },
  { name: "The cabin", title: "Purpose in\nevery detail.", label: "02 / THE CABIN", text: "Explore the airframe, landing skids, and equipment.", detail: "Follow the airframe, from nose to tail.", spec: "02", specLabel: "Airframe" },
  { name: "The tail", title: "Balance.\nBy design.", label: "03 / THE TAIL", text: "Every line has a purpose. Every detail, a role.", detail: "Explore the tail boom and anti-torque rotor.", spec: "03", specLabel: "Tail assembly" },
  { name: "The rotor", title: "A little\ncloser to flight.", label: "04 / THE ROTOR", text: "The engineering that changes your perspective.", detail: "Rise above the four-blade rotor assembly.", spec: "04", specLabel: "Main rotor" },
  { name: "Full circle", title: "Room for\na new horizon.", label: "05 / FULL CIRCLE", text: "Same rooftop. A whole new perspective.", detail: "You’ve explored the Kiowa. Take another look.", spec: "360°", specLabel: "The complete aircraft" },
];
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}> { state={failed:false}; static getDerivedStateFromError(){return {failed:true}} render(){return this.state.failed?<div className="scene-error"><h2>The 3D view couldn’t start.</h2><p>Enable hardware acceleration in your browser, then reload.</p><button onClick={()=>location.reload()}>Reload experience</button></div>:this.props.children} }
export default function Home(){
 const onSceneReady=useCallback(()=>setReady(true),[]);
 const progress=useRef(0); const [position,setPosition]=useState(0); const [motion,setMotion]=useState(true); const [ready,setReady]=useState(false);
 useEffect(()=>{const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches; if(reduce)setMotion(false); const scroll=()=>{progress.current=Math.min(1,window.scrollY/(document.documentElement.scrollHeight-window.innerHeight));setPosition(progress.current)};window.addEventListener("scroll",scroll,{passive:true});scroll();return()=>window.removeEventListener("scroll",scroll)},[]);
 const active=Math.min(5,Math.floor(position*5+.35)); const chapter=chapters[active];
 const go=(i:number)=>window.scrollTo({top:(document.documentElement.scrollHeight-window.innerHeight)*i/5,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
 return <main className="journey"><div className="experience">
 <div className="scene"><SceneBoundary><Scene progress={progress} motion={motion} onReady={onSceneReady}/></SceneBoundary>{!ready&&<div className="model-loading" role="status">Loading your OH–58D Kiowa…</div>}</div>
 <div className="top-shade"/>
 <header className="header"><a href="#" className="brand" onClick={e=>{e.preventDefault();go(0)}} aria-label="Altitude home"><span className="brand-symbol">A</span>ALTITUDE<span className="brand-dot">®</span></a><span className="header-center">A HIGHER PERSPECTIVE</span><span className="edition">OH–58D <span> / </span> EXPLORER</span></header>
 <section className={"chapter-copy "+(active===0?"intro":"")} key={active}><p className="eyebrow"><span/> {chapter.label}</p><h1>{chapter.title.split("\n").map((s,i)=><span key={i}>{s}</span>)}</h1><p className="description">{chapter.text}</p>{active===0?<button className="explore-button" onClick={()=>go(1)}>Explore the helicopter <ArrowUpRight size={18}/></button>:<p className="detail">{chapter.detail}</p>}</section>
 <aside className="scene-meta"><span className="live-dot"/> ROOFTOP 01 <span className="meta-divider"/> <Wind size={14}/> MIDDAY SKIES</aside>
 <nav className="chapter-rail" aria-label="Aircraft views">{chapters.map((c,i)=><button key={c.name} className={active===i?"active":""} aria-current={active===i?"step":undefined} onClick={()=>go(i)} aria-label={c.name}><span className="rail-name">{c.name}</span><span className="rail-mark"/></button>)}</nav>
 <div className="view-caption"><span className="caption-rule"/><span>OH–58D<br/><small>KIOWA</small></span></div>
 <div className="lower-controls"><button className="motion-button" onClick={()=>setMotion(!motion)} aria-label={motion?"Pause scene animation":"Play scene animation"}>{motion?<Pause size={14}/>:<Play size={14}/>}<span>{motion?"Motion on":"Motion off"}</span></button><button className="reset-button" onClick={()=>go(0)} aria-label="Restart exploration"><RotateCcw size={16}/></button></div>
 <details className="model-credit"><summary>Model credits</summary><p><a href="https://sketchfab.com/3d-models/oh-58d-kiowa-usa-27ea773bd6c74548b19c697feb84afea" target="_blank" rel="noreferrer">OH-58D Kiowa (USA)</a> by <a href="https://sketchfab.com/42manako" target="_blank" rel="noreferrer">42manako</a>. <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer">CC BY-NC 4.0</a>. Scaled and positioned for this scene.<br/><a href="https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky" target="_blank" rel="noreferrer">Sky photography</a> by Greg Zaal / Jarod Guest, Poly Haven (CC0).</p></details>
 </div><div className="scroll-space" aria-hidden="true"/></main>
}
