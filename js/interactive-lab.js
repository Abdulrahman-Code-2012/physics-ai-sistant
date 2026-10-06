const LABS={
motion:{title:"Force → acceleration",question:"If force doubles while mass stays constant, what happens to acceleration?",correct:"double",defaults:{force:20,mass:5}},
circuit:{title:"Ohm’s law",question:"If resistance doubles while voltage stays constant, what happens to current?",correct:"half",defaults:{voltage:12,resistance:6}},
waves:{title:"Wave equation",question:"If frequency increases while wave speed stays constant, what happens to wavelength?",correct:"shorter",defaults:{frequency:8}}
};

function stage(root){
  const type=root.dataset.ilType||"motion",lab=LABS[type]||LABS.motion;
  if(!root._ilValues)root._ilValues={...lab.defaults};
  const v=root._ilValues;
  let visual="";
  if(type==="motion"){
    const a=v.force/v.mass;
    visual='<div class="il-visual"><div class="il-kicker">MOTION LAB</div><h3>'+lab.title+'</h3><p>Newton’s second law: <b>a = F ÷ m</b>.</p><div class="il-scene"><div class="il-arrow" style="width:'+Math.min(88,12+a*6)+'%"><span>'+v.force.toFixed(0)+' N</span></div><div class="il-block">'+v.mass.toFixed(0)+' kg</div></div><div class="il-metric"><span>Acceleration</span><strong>'+a.toFixed(2)+' m/s²</strong></div><div class="il-mini-graph"><div style="height:'+Math.min(100,10+a*5)+'%"></div></div></div>';
  } else if(type==="circuit"){
    const i=v.voltage/v.resistance;
    visual='<div class="il-visual"><div class="il-kicker">ELECTRICITY LAB</div><h3>'+lab.title+'</h3><p>Ohm’s law: <b>I = V ÷ R</b>.</p><div class="il-circuit"><span>+'+v.voltage.toFixed(0)+' V</span><i></i><b>R '+v.resistance.toFixed(0)+' Ω</b><i></i><span>I '+i.toFixed(2)+' A</span></div><div class="il-metric"><span>Current</span><strong>'+i.toFixed(2)+' A</strong></div></div>';
  } else {
    const f=v.frequency||8,speed=40,lambda=speed/f;
    const pts=[];for(let n=0;n<=100;n++){const x=n/100*400;const y=55+32*Math.sin(n/100*(f/2)*Math.PI*2);pts.push(x.toFixed(1)+","+y.toFixed(1))}
    visual='<div class="il-visual"><div class="il-kicker">WAVES LAB</div><h3>'+lab.title+'</h3><p>Wave equation: <b>v = fλ</b>.</p><svg class="il-wave" viewBox="0 0 440 110"><polyline points="'+pts.join(" ")+'"></polyline></svg><div class="il-metric"><span>Wavelength</span><strong>'+lambda.toFixed(2)+' m</strong></div></div>';
  }
  let controls="";
  if(type==="motion") controls='<label>Force <b>'+v.force.toFixed(0)+' N</b><input data-il-key="force" type="range" min="0" max="50" value="'+v.force+'"></label><label>Mass <b>'+v.mass.toFixed(0)+' kg</b><input data-il-key="mass" type="range" min="1" max="20" value="'+v.mass+'"></label>';
  if(type==="circuit") controls='<label>Voltage <b>'+v.voltage.toFixed(0)+' V</b><input data-il-key="voltage" type="range" min="1" max="24" value="'+v.voltage+'"></label><label>Resistance <b>'+v.resistance.toFixed(0)+' Ω</b><input data-il-key="resistance" type="range" min="1" max="20" value="'+v.resistance+'"></label>';
  if(type==="waves") controls='<label>Frequency <b>'+v.frequency.toFixed(0)+' Hz</b><input data-il-key="frequency" type="range" min="2" max="20" value="'+v.frequency+'"></label><div class="il-static">Wave speed: <b>40 m/s</b></div>';
  const opts=type==="motion"?"double|It doubles|same|It stays the same|half|It halves":type==="circuit"?"half|It halves|same|It stays the same|double|It doubles":"shorter|It gets shorter|same|It stays the same|longer|It gets longer";
  const a=opts.split("|");
  controls+='<div class="il-predict"><strong>PREDICT</strong><p>'+lab.question+'</p>'+[0,2,4].map(i=>'<button data-il-answer="'+a[i]+'">'+a[i+1]+'</button>').join("")+'<div data-il-feedback class="il-feedback"></div></div>';
  root.querySelector("[data-il-stage]").innerHTML='<div class="il-grid">'+visual+'<div class="il-controls">'+controls+'</div></div>';
  root.querySelectorAll("[data-il-key]").forEach(el=>el.oninput=()=>{root._ilValues[el.dataset.ilKey]=Number(el.value);stage(root)});
  root.querySelectorAll("[data-il-answer]").forEach(btn=>btn.onclick=()=>{const ok=btn.dataset.ilAnswer===lab.correct;const fb=root.querySelector("[data-il-feedback]");fb.textContent=ok?"Correct. Now explain the relationship in your own words.":"Not quite. Change the variable, observe the result, and try again.";fb.className="il-feedback "+(ok?"good":"try")});
  root.querySelector("[data-il-lab]").onchange=e=>{root.dataset.ilType=e.target.value;root._ilValues=null;stage(root)};
}
export function renderLearningLab({topic="Physics",source="ai-response"}={}){
  const t=String(topic).toLowerCase();
  const type=t.includes("wave")||t.includes("sound")||t.includes("light")?"waves":(t.includes("electric")||t.includes("circuit")||t.includes("ohm")?"circuit":"motion");
  return '<section class="interactive-learning-lab" data-il-root data-il-type="'+type+'" data-il-source="'+source+'"><div class="il-head"><div><span class="il-eyebrow">Interactive explanation</span><h3>Don’t just read the mistake — test it.</h3><p>Manipulate the variables, make a prediction, then connect the result to the physics equation.</p></div><select data-il-lab><option value="motion">Force & acceleration</option><option value="circuit">Ohm’s law</option><option value="waves">Waves</option></select></div><div data-il-stage></div></section>';
}
export function initLearningLabs(){document.querySelectorAll("[data-il-root]").forEach(r=>{if(!r.dataset.ilReady){r.dataset.ilReady="1";stage(r)}})}
