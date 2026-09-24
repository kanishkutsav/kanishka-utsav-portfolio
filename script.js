const loader=document.getElementById('loader'), bar=document.getElementById('loadBar'), pct=document.getElementById('loadPct');let n=0;const timer=setInterval(()=>{n+=Math.floor(Math.random()*12)+5;if(n>=100){n=100;clearInterval(timer);setTimeout(()=>loader.classList.add('done'),350)}bar.style.width=n+'%';pct.textContent=String(n).padStart(2,'0')+'%'},70);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>io.observe(x));
const counters=document.querySelectorAll('[data-count]');const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;const target=+el.dataset.count;let v=0;const step=Math.max(1,Math.ceil(target/35));const t=setInterval(()=>{v+=step;if(v>=target){v=target;clearInterval(t)}el.textContent=v},35);cio.unobserve(el)}),{threshold:.7});counters.forEach(x=>cio.observe(x));
document.querySelectorAll('.role').forEach(r=>r.addEventListener('click',()=>{document.querySelectorAll('.role').forEach(x=>x.classList.remove('active'));r.classList.add('active')}));

/* V3 — mouse/touch parallax for immersive portrait */
(function(){
  const stage=document.getElementById('portraitStage');
  if(!stage) return;
  let raf=0, tx=0, ty=0;
  const setTilt=(x,y)=>{
    tx=Math.max(-12,Math.min(12,(x-0.5)*24));
    ty=Math.max(-9,Math.min(9,(y-0.5)*-18));
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{stage.style.setProperty('--ry',tx+'deg');stage.style.setProperty('--rx',ty+'deg');stage.style.setProperty('--px',((x-.5)*12)+'px');stage.style.setProperty('--py',((y-.5)*-8)+'px');});
  };
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();setTilt((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)});
  stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--ry','0deg');stage.style.setProperty('--rx','0deg');stage.style.setProperty('--px','0px');stage.style.setProperty('--py','0px')});
  stage.addEventListener('touchmove',e=>{const t=e.touches[0],r=stage.getBoundingClientRect();setTilt((t.clientX-r.left)/r.width,(t.clientY-r.top)/r.height)},{passive:true});
  stage.addEventListener('touchend',()=>{stage.style.setProperty('--ry','0deg');stage.style.setProperty('--rx','0deg');stage.style.setProperty('--px','0px');stage.style.setProperty('--py','0px')});
})();
