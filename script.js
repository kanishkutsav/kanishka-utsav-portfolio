import React, { useEffect, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { motion, AnimatePresence } from "https://esm.sh/framer-motion@11.11.17?external=react";
import { gsap } from "https://esm.sh/gsap@3.12.5";
import { ScrollTrigger } from "https://esm.sh/gsap@3.12.5/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loader=document.getElementById("loader"),bar=document.getElementById("loadBar"),pct=document.getElementById("loadPct");
let progress=0,loaderTimer=null;
if(loader){
  if(reduceMotion){bar.style.width="100%";pct.textContent="100%";loader.classList.add("done")}
  else {loaderTimer=window.setInterval(()=>{progress=Math.min(100,progress+Math.floor(Math.random()*12)+5);bar.style.width=progress+"%";pct.textContent=String(progress).padStart(2,"0")+"%";if(progress>=100){clearInterval(loaderTimer);window.setTimeout(()=>loader.classList.add("done"),250)}},65)}
}
const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");io.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
const counters=document.querySelectorAll("[data-count]");
const cio=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,target=Number(el.dataset.count);if(reduceMotion){el.textContent=target;cio.unobserve(el);return}const start=performance.now(),duration=850;let raf=0;const tick=now=>{const t=Math.min(1,(now-start)/duration);el.textContent=Math.round(target*(1-Math.pow(1-t,3)));if(t<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);cio.unobserve(el)}),{threshold:.7});
counters.forEach(el=>cio.observe(el));
document.querySelectorAll(".role").forEach(role=>role.addEventListener("click",()=>{document.querySelectorAll(".role").forEach(item=>item.classList.remove("active"));role.classList.add("active")}));

// Portrait parallax: CSS variables are updated in one animation frame, never through React state.
const stage=document.getElementById("portraitStage");let raf=0;
if(stage&&!reduceMotion){
 let px=.5,py=.5;
 const move=e=>{const r=stage.getBoundingClientRect();px=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));py=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{stage.style.setProperty("--ry",((px-.5)*18)+"deg");stage.style.setProperty("--rx",((py-.5)*-12)+"deg");stage.style.setProperty("--px",((px-.5)*8)+"px");stage.style.setProperty("--py",((py-.5)*-6)+"px")})};
 const reset=()=>{stage.style.setProperty("--ry","0deg");stage.style.setProperty("--rx","0deg");stage.style.setProperty("--px","0px");stage.style.setProperty("--py","0px")};
 stage.addEventListener("pointermove",move);stage.addEventListener("pointerleave",reset);
 window.addEventListener("pagehide",()=>{cancelAnimationFrame(raf);stage.removeEventListener("pointermove",move);stage.removeEventListener("pointerleave",reset)},{once:true});
}

// Real flashlight: an opaque layer masks the content underneath, with a soft transparent beam.
const torch=document.getElementById("torchOverlay");
if(torch&&!reduceMotion){
 let torchRaf=0, active=false;
 const setTorch=(x,y)=>{torch.style.setProperty("--torch-x",x+"px");torch.style.setProperty("--torch-y",y+"px");torch.style.setProperty("--torch-size",window.innerWidth<600?"108px":"168px")};
 const pointer=e=>{const r=torch.getBoundingClientRect();cancelAnimationFrame(torchRaf);torchRaf=requestAnimationFrame(()=>setTorch(e.clientX-r.left,e.clientY-r.top))};
 const touch=e=>{if(e.pointerType==="touch"){active=!active;torch.style.opacity=active?".88":"1";pointer(e)}else pointer(e)};
 torch.addEventListener("pointermove",pointer);torch.addEventListener("pointerdown",touch);
 const leave=()=>{if(!active){torch.style.setProperty("--torch-x","50%");torch.style.setProperty("--torch-y","45%")}};
 torch.addEventListener("pointerleave",leave);
 window.addEventListener("pagehide",()=>{cancelAnimationFrame(torchRaf);torch.removeEventListener("pointermove",pointer);torch.removeEventListener("pointerdown",touch);torch.removeEventListener("pointerleave",leave)},{once:true});
} else if(torch){torch.remove()}

// GSAP owns scroll reveals and SVG drawing; Framer Motion owns the CTA and overlay transitions.
if(!reduceMotion){
 gsap.utils.toArray(".section-kicker,.statement h2,.featured-head,.case-grid,.role,.impact-card,.skill-columns>div,.edu-card,.about-grid").forEach((el,i)=>{
  gsap.fromTo(el,{y:26,opacity:0},{y:0,opacity:1,duration:.75,ease:"power2.out",delay:0,scrollTrigger:{trigger:el,start:"top 88%",once:true}});
 });
 gsap.fromTo(".string-art .strings path",{strokeDashoffset:360},{strokeDashoffset:0,duration:1.3,stagger:.13,ease:"power2.out",scrollTrigger:{trigger:".collaborate",start:"top 72%",once:true}});
 gsap.fromTo(".string-art .hand",{y:9,rotation:-2,transformOrigin:"50% 90%"},{y:0,rotation:0,duration:1.1,ease:"back.out(1.5)",scrollTrigger:{trigger:".collaborate",start:"top 72%",once:true}});
 gsap.to(".string-art .hand",{y:-2,rotation:1,duration:2.8,yoyo:true,repeat:-1,ease:"sine.inOut",scrollTrigger:{trigger:".collaborate",start:"top bottom",end:"bottom top",toggleActions:"play pause resume pause"}});
}

function CollaborationButton(){
 const [open,setOpen]=useState(false),buttonRef=useRef(null),closeRef=useRef(null),previousFocus=useRef(null);
 useEffect(()=>{
  if(!open)return;
  previousFocus.current=document.activeElement;
  closeRef.current?.focus();
  const key=e=>{if(e.key==="Escape")setOpen(false);if(e.key==="Tab"){const nodes=[...document.querySelectorAll(".contact-dialog a,.contact-dialog button")].filter(n=>!n.disabled);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
  document.addEventListener("keydown",key);return()=>{document.removeEventListener("keydown",key);previousFocus.current?.focus?.()};
 },[open]);
 const links=[
  {label:"EMAIL",value:"kanishka.utsav@gmail.com",href:"mailto:kanishka.utsav@gmail.com"},
  {label:"LINKEDIN",value:"LinkedIn profile ↗",href:"https://www.linkedin.com/in/kanishkautsav/"},
  {label:"PHONE",value:"+91 85740 06311",href:"tel:+918574006311"},
  {label:"START A PROJECT",value:"Send a project brief ↗",href:"mailto:kanishka.utsav@gmail.com?subject=Project%20enquiry"}
 ];
 return React.createElement(React.Fragment,null,
  React.createElement(motion.button,{ref:buttonRef,className:"collab-cta",type:"button","aria-haspopup":"dialog","aria-expanded":open,onClick:()=>setOpen(true),whileHover:reduceMotion?{}:{y:-3,rotateX:2,scale:1.025,boxShadow:"0 15px 0 #b9b7b0,0 26px 38px rgba(0,0,0,.24)"},whileTap:reduceMotion?{}:{scale:.98,y:1},transition:{type:"spring",stiffness:320,damping:22}}, "LET’S COLLABORATE ↗"),
  React.createElement(AnimatePresence,null,open&&React.createElement(motion.div,{className:"contact-dialog-backdrop",role:"presentation",onMouseDown:e=>{if(e.target===e.currentTarget)setOpen(false)},initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:reduceMotion?0:.2}},
   React.createElement(motion.section,{className:"contact-dialog",role:"dialog","aria-modal":"true","aria-labelledby":"dialog-title",initial:reduceMotion?{}:{opacity:0,y:24,scale:.97},animate:{opacity:1,y:0,scale:1},exit:reduceMotion?{}:{opacity:0,y:12,scale:.98},transition:{type:"spring",stiffness:280,damping:25}},
    React.createElement("button",{ref:closeRef,className:"dialog-close",type:"button","aria-label":"Close contact dialog",onClick:()=>setOpen(false)},"×"),
    React.createElement("span",{className:"dialog-kicker"},"THE NEXT CHAPTER STARTS HERE"),
    React.createElement("h2",{id:"dialog-title"},"LET’S MAKE<br/>SOMETHING MATTER."),
    React.createElement("p",null,"Tell me what you’re building, where the challenge is, and what success should look like."),
    React.createElement("div",{className:"dialog-links"},links.map(item=>React.createElement("a",{key:item.label,href:item.href,target:item.href.startsWith("http")?"_blank":undefined,rel:item.href.startsWith("http")?"noreferrer":undefined},React.createElement("span",{style:{display:"block",fontSize:"9px",opacity:.55,marginBottom:"8px",letterSpacing:".12em"}},item.label),item.value))
    )
   )
  ))
 );
}
const host=document.getElementById("collabButtonHost");
if(host)createRoot(host).render(React.createElement(CollaborationButton));

// Compact accessible mobile nav, including Escape and correct expanded state.
const menu=document.querySelector(".menu"),nav=document.querySelector(".nav nav");
if(menu&&nav){
 menu.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));nav.classList.toggle("mobile-open",!open);menu.setAttribute("aria-label",open?"Open menu":"Close menu");menu.textContent=open?"☰":"×"});
 nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("mobile-open");menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Open menu");menu.textContent="☰"}));
}
