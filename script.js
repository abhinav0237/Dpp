const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cols=['#FF5C7A','#2D3BFF','#00A676','#FF9F1C','#8A4FFF','#0B0B14','#00A3FF'];
const PP=[{n:'You',r:'Builder'},{n:'Abhijith K',r:'Water engineer · Kochi'},{n:'Aadithyan R',r:'Robotics student · Thrissur'},{n:'Vishal M',r:'Open-hardware maker · Palakkad'},{n:'Anjana S',r:'Civil engineer · Kozhikode'},{n:'Devika Menon',r:'Solar researcher · Ernakulam'},{n:'Nithin Raj',r:'Network engineer · Kannur'}];
const av=(i,on)=>`<div class="av ${on?'on':''}" style="background:${cols[i]}">${PP[i].n[0]}</div>`;
const now=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1800)}

/* state */
const seed=()=>({feed:[
 {id:1,by:1,t:'Infrastructure',x:'Our village borewell sensors now report water levels over LoRa. Hardware cost per node is under ₹1,800.',time:'2h',l:42,cm:[{by:6,x:'Which gateway are you using?'}],img:[0,'Sensor node v2'],proj:['Rural sensor mesh',72]},
 {id:2,by:2,t:'Industry',x:'We cut a small factory’s changeover time from 40 to 12 minutes with a low-cost vision check. Writing up the method this week.',time:'5h',l:68,cm:[]},
 {id:3,by:3,t:'Innovation',x:'Looking for two people to test a 3D-printed solar charge controller for community clinics. Any electronics background helps.',time:'1d',l:31,cm:[],img:[1,'Charge controller prototype']},
 {id:4,by:5,t:'Infrastructure',x:'Which is better for hill-region villages with patchy coverage?',time:'1d',l:19,cm:[],poll:{o:[['LoRa mesh',34],['Cellular IoT',12],['Satellite',9]],v:-1}},
 {id:5,by:4,t:'Infrastructure',x:'Photo-based crack logging on a 40-year-old bridge: three months of data show growth under 0.2 mm. Sharing the template soon.',time:'2d',l:57,cm:[],img:[2,'Crack log, month 3']}],
 saved:[],joined:[2],bio:'Computer science and design student building AR tools and open infrastructure projects.',fol:[]});
let S;try{S=JSON.parse(localStorage.getItem('nm3'))||seed()}catch(e){S=seed()}
const save=()=>{try{localStorage.setItem('nm3',JSON.stringify(S))}catch(e){}};

/* nav + routing */
const NAV=[['home','Feed','M3 11l9-8 9 8M5 10v10h14V10'],['explore','Explore','M21 21l-5-5M11 4a7 7 0 100 14 7 7 0 000-14'],['hubs','Hubs','M9 4a3.5 3.5 0 100 7 3.5 3.5 0 000-7M2 20c0-4 3-6 7-6s7 2 7 6M17 5a3.5 3.5 0 010 7M22 20c0-3-1.5-5-4-5.7'],['chat','Chat','M4 5h16v11H9l-5 4z'],['alerts','Alerts','M6 17V11a6 6 0 1112 0v6l2 2H4zM10 21h4'],['profile','Profile','M12 4a4 4 0 100 8 4 4 0 000-8M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7']];
$('#nav').insertAdjacentHTML('beforeend',NAV.map(n=>`<a href="#${n[0]}" data-p="${n[0]}"><svg viewBox="0 0 24 24"><path d="${n[2]}"/></svg>${n[1]}${n[0]==='chat'?'<span class="badge" id="ub"></span>':n[0]==='alerts'?'<span class="badge" id="ab"></span>':''}</a>`).join(''));
function route(){let p=location.hash.slice(1);if(!NAV.some(n=>n[0]===p))p='home';
 $$('.page').forEach(e=>e.classList.toggle('on',e.id===p));
 $$('nav a').forEach(a=>a.dataset.p===p?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
 if(p==='chat'&&!$('#chatBox').classList.contains('open')&&innerWidth>760)openConv(cur);window.scrollTo(0,0)}
addEventListener('hashchange',route);

/* alerts */
const AL=[{t:'Vishal M invited you to test the solar kit',tm:'1h',r:0,to:'chat'},{t:'Anjana S commented on your post',tm:'3h',r:0,to:'home'},{t:'Resilient Roads has 3 new posts',tm:'1d',r:1,to:'hubs'}];
function notify(t,to){AL.unshift({t,tm:'now',r:0,to:to||'home'});renderAlerts()}
function renderAlerts(){$('#alist').innerHTML=AL.map((a,i)=>`<button class="nrow ${a.r?'':'un'}" data-al="${i}"><span class="name" style="flex:1;font-weight:500">${esc(a.t)}</span><span class="meta">${a.tm}</span></button>`).join('');
 const n=AL.filter(a=>!a.r).length;const b=$('#ab');b.textContent=n;b.style.display=n?'':'none'}
$('#alist').onclick=e=>{const b=e.target.closest('[data-al]');if(b){const a=AL[b.dataset.al];a.r=1;renderAlerts();location.hash=a.to}};
$('#readAll').onclick=()=>{AL.forEach(a=>a.r=1);renderAlerts()};

/* feed */
function postH(p){const u=PP[p.by],pl=p.poll,tot=pl?pl.o.reduce((a,o)=>a+o[1],0):0;
 return `<article class="card post"><div class="row">${av(p.by)}<div><div class="name">${u.n}</div><div class="meta">${u.r} · ${p.time}</div></div><span class="tag">${p.t}</span></div><p>${esc(p.x)}</p>
${p.img?`<div class="vis v${p.img[0]}">${p.img[1]}</div>`:''}
${pl?`<div class="poll">${pl.o.map((o,i)=>`<button class="opt" data-vote="${p.id}:${i}"><i style="width:${pl.v>=0?Math.round(o[1]/tot*100):0}%"></i><span>${o[0]}${pl.v===i?' ✓':''}</span><span>${pl.v>=0?Math.round(o[1]/tot*100)+'%':''}</span></button>`).join('')}<div class="meta" style="margin-top:6px">${tot} votes</div></div>`:''}
${p.proj?`<div class="proj"><b>${p.proj[0]}</b><div class="bar"><i style="width:${p.proj[1]}%"></i></div><div class="meta">${p.proj[1]}% of the build complete</div></div>`:''}
<div class="acts"><button data-like="${p.id}" class="${p.liked?'liked':''}" aria-pressed="${!!p.liked}">${p.liked?'♥':'♡'} ${p.l}</button><button data-cmt="${p.id}">Comment ${p.cm.length}</button><button data-save="${p.id}" class="${S.saved.includes(p.id)?'saved':''}">${S.saved.includes(p.id)?'Saved':'Save'}</button><button data-share="${p.id}">Share</button></div>
${p.open?`<div class="cm">${p.cm.map(c=>`<p><b>${PP[c.by].n}</b> ${esc(c.x)}</p>`).join('')}<form class="row cf" data-id="${p.id}" style="margin-top:6px"><input class="field" aria-label="Write a comment" placeholder="Add a comment"><button class="btn sm">Reply</button></form></div>`:''}</article>`}
function renderFeed(){$('#feed').innerHTML=S.feed.map(postH).join('');
 const tab=$('[data-tab][aria-pressed=true]').dataset.tab,L=S.feed.filter(p=>tab==='mine'?p.by===0:S.saved.includes(p.id));
 $('#mine').innerHTML=L.length?L.map(postH).join(''):`<div class="card meta">${tab==='mine'?'You have not posted yet. Share your first update from the Feed.':'Nothing saved. Use Save on any post to keep it here.'}</div>`;
 $('#sPosts').textContent=S.feed.filter(p=>p.by===0).length;save()}
const byId=id=>S.feed.find(p=>p.id==id);
document.addEventListener('click',e=>{const b=e.target.closest('button,a[data-q]');if(!b)return;const d=b.dataset;
 if(d.like){const p=byId(d.like);p.liked=!p.liked;p.l+=p.liked?1:-1;renderFeed()}
 else if(d.cmt){const p=byId(d.cmt);p.open=!p.open;renderFeed()}
 else if(d.save){const i=S.saved.indexOf(+d.save);i<0?S.saved.push(+d.save):S.saved.splice(i,1);renderFeed();toast(i<0?'Saved':'Removed from saved')}
 else if(d.share)toast('Link copied')
 else if(d.vote){const[id,i]=d.vote.split(':'),p=byId(id);if(p.poll.v<0){p.poll.v=+i;p.poll.o[i][1]++;renderFeed()}}
 else if(d.tab){$$('[data-tab]').forEach(x=>x.setAttribute('aria-pressed',x===b));renderFeed()}
 else if(d.fol){const i=S.fol.indexOf(+d.fol);i<0?S.fol.push(+d.fol):S.fol.splice(i,1);renderFollow()}
 else if(d.q){$('#q').value=d.q;renderProj()}
 else if(d.story)openStory(+d.story)});
document.addEventListener('submit',e=>{const f=e.target.closest('.cf');if(!f)return;e.preventDefault();const v=f.querySelector('input').value.trim();if(!v)return;const p=byId(f.dataset.id);p.cm.push({by:0,x:v});renderFeed()});
$('#postBtn').onclick=()=>{const v=$('#draft').value.trim();if(!v){toast('Write something to post');return}
 const p={id:Date.now(),by:0,t:$('#topic').value,x:v,time:'now',l:0,cm:[]};if($('#asPoll').checked)p.poll={o:[['Yes',0],['No',0],['Not sure',0]],v:-1};
 S.feed.unshift(p);$('#draft').value='';$('#asPoll').checked=false;renderFeed();toast('Posted');
 setTimeout(()=>{p.l++;renderFeed();notify('Vishal M liked your post')},2500)};

/* stories + follow */
const SN=['Testing the solar kit on a rainy day','Roadside crack survey at dawn','Our LoRa gateway is on the roof','New robotics lab bench is ready','Reading about smart grids tonight','Cold-chain sensor demo at 4 pm'];
$('#stories').innerHTML=PP.slice(1).map((u,i)=>`<button class="st" data-story="${i+1}"><span class="ring">${av(i+1)}</span>${u.n.split(' ')[0]}</button>`).join('');
let st;function openStory(i){$('#svH').innerHTML=av(i)+`<div><div class="name">${PP[i].n}</div></div>`;$('#svT').textContent=SN[i-1];const s=$('#sv');s.classList.add('on');const b=s.querySelector('.pb i');b.style.animation='none';b.offsetWidth;b.style.animation='';clearTimeout(st);st=setTimeout(()=>s.classList.remove('on'),4000)}
$('#sv').onclick=()=>{clearTimeout(st);$('#sv').classList.remove('on')};
function renderFollow(){$('#follow').innerHTML=[3,5,6].map(i=>`<div class="row sp" style="margin-bottom:10px"><div class="row">${av(i)}<div><div class="name">${PP[i].n}</div><div class="meta">${PP[i].r.split(' · ')[0]}</div></div></div><button class="btn sm ${S.fol.includes(i)?'on':'ghost'}" data-fol="${i}">${S.fol.includes(i)?'Following':'Follow'}</button></div>`).join('');$('#sFol').textContent=128+S.fol.length;save()}

/* explore */
const projects=[['Rural sensor mesh','Infrastructure','Low-power water-level network for villages.',4],['Clinic solar kit','Innovation','Printable solar charge controllers for clinics.',2],['Bridge crack tracker','Infrastructure','Phone photos to log crack growth.',6],['Factory changeover lab','Industry','Cut line downtime in small workshops.',3],['Open maker tools','Innovation','Shared library of repair-friendly designs.',5],['Cold-chain monitor','Industry','Temperature logging for local food producers.',2],['Smart road signs','Infrastructure','Solar-lit signs for hill roads.',3],['Campus AR navigator','Innovation','Indoor wayfinding with AR for large buildings.',4]];
let filt='All';
$('#chips').innerHTML=['All','Infrastructure','Industry','Innovation'].map(c=>`<button class="chip" aria-pressed="${c==='All'}">${c}</button>`).join('');
$('#chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;filt=b.textContent;$$('#chips .chip').forEach(x=>x.setAttribute('aria-pressed',x===b));renderProj()};
$('#q').oninput=()=>renderProj();
function renderProj(){const q=$('#q').value.toLowerCase();const L=projects.filter(p=>(filt==='All'||p[1]===filt)&&(p[0]+p[2]).toLowerCase().includes(q));
 $('#projects').innerHTML=L.length?L.map(p=>`<div class="card"><span class="tag" style="margin:0">${p[1]}</span><h3 style="margin:10px 0 6px">${p[0]}</h3><p class="meta" style="margin:0 0 12px">${p[2]}</p><div class="row sp"><span class="meta">${p[3]} open roles</span><button class="btn ghost sm" data-join="${p[0]}">Offer help</button></div></div>`).join(''):'<p class="meta">No projects match. Try a different word or filter.</p>'}
$('#projects').onclick=e=>{const b=e.target.closest('[data-join]');if(b){b.textContent='Offer sent';b.classList.add('on');toast('Sent to '+b.dataset.join)}};

/* hubs */
const hubs=[['Resilient Roads','Low-cost materials and monitoring for roads and bridges.','1.2k'],['Small Factory Lab','Practical automation for workshops with tight budgets.','860'],['Open Hardware Clinic','Sharing designs for health and energy devices.','2.4k'],['Connectivity for All','Affordable internet access for remote areas.','1.7k']];
function renderHubs(){$('#hubList').innerHTML=hubs.map((h,i)=>{const j=S.joined.includes(i);return `<div class="card"><div class="row"><div class="av" style="background:${cols[i+1]}">${h[0][0]}</div><div><div class="name">${h[0]}</div><div class="meta">${h[2]} members</div></div></div><p style="margin:12px 0">${h[1]}</p><button class="btn ${j?'on':''}" data-hub="${i}" aria-pressed="${j}">${j?'Joined':'Join hub'}</button></div>`}).join('');$('#sHubs').textContent=S.joined.length;save()}
$('#hubList').onclick=e=>{const b=e.target.closest('[data-hub]');if(b){const i=+b.dataset.hub,k=S.joined.indexOf(i);k<0?S.joined.push(i):S.joined.splice(k,1);renderHubs();toast(k<0?'Joined '+hubs[i][0]:'Left '+hubs[i][0])}};

/* chat */
const convs=[{n:'Abhijith K',r:'Water engineer · online',m:[1],on:1,u:1,msgs:[[1,'Hi! Saw your comment on the sensor project.','10:12'],[1,'Could you review the node wiring diagram?','10:13']]},
 {n:'Aadithyan R',r:'Robotics student · online',m:[2],on:1,u:1,msgs:[[2,'The vision check code is on the hub now.','09:40']]},
 {n:'Vishal M',r:'Open-hardware maker · away',m:[3],on:0,u:0,msgs:[[3,'Thanks for offering to test the solar kit!','Yesterday'],[0,'Happy to. Send the parts list.','Yesterday']]},
 {n:'Clinic Solar Team',r:'Vishal, Devika, Anjana and you',m:[3,5,4],on:0,u:0,g:1,msgs:[[5,'Panel readings are up 8% after the new angle.','08:55'],[4,'Great. I will update the site plan.','09:02']]}];
const R=['Sounds good, let’s do that.','Great, I’ll share the files tonight.','Can we talk about it tomorrow morning?','Thanks! That helps a lot.','Let me check and get back to you.'];
let cur=0;
function renderConvs(){const q=$('#cs').value.toLowerCase();$('#convs').innerHTML=convs.map((c,i)=>c.n.toLowerCase().includes(q)?`<button class="conv" data-c="${i}" aria-current="${i===cur}">${c.g?'<div class="av" style="background:#00A676">#</div>':av(c.m[0],c.on)}<div class="t"><div class="name">${c.n}</div><div class="meta">${esc(c.msgs[c.msgs.length-1][1])}</div></div>${c.u?'<span class="badge">'+c.u+'</span>':''}</button>`:'').join('');
 const n=convs.reduce((a,c)=>a+c.u,0),b=$('#ub');b.textContent=n;b.style.display=n?'':'none'}
function renderMsgs(){const c=convs[cur];$('#cName').textContent=c.n;$('#cRole').textContent=c.r;
 $('#msgs').innerHTML=c.msgs.map(m=>`<div class="m ${m[0]?'':'me'}">${c.g&&m[0]?'<b>'+PP[m[0]].n+'</b>':''}${esc(m[1])}<small>${m[2]}${m[0]?'':' ✓✓'}</small></div>`).join('');$('#msgs').scrollTop=1e5}
function openConv(i){cur=i;convs[i].u=0;renderConvs();renderMsgs();$('#chatBox').classList.add('open')}
$('#convs').onclick=e=>{const b=e.target.closest('.conv');if(b)openConv(+b.dataset.c)};
$('#cs').oninput=renderConvs;$('#back').onclick=()=>$('#chatBox').classList.remove('open');
$('.compose').onclick=e=>{const b=e.target.closest('[data-e]');if(b){$('#msgIn').value+=b.dataset.e;$('#msgIn').focus()}};
$('#form').onsubmit=e=>{e.preventDefault();const v=$('#msgIn').value.trim();if(!v)return;const i=cur,c=convs[i],who=c.m[Math.floor(Math.random()*c.m.length)];
 c.msgs.push([0,v,now()]);$('#msgIn').value='';renderMsgs();renderConvs();
 $('#typing').textContent=PP[who].n.split(' ')[0]+' is typing…';
 setTimeout(()=>{$('#typing').textContent='';c.msgs.push([who,R[Math.floor(Math.random()*R.length)],now()]);if(cur===i&&location.hash==='#chat')renderMsgs();else{c.u++;notify(PP[who].n+' replied in chat','chat')}renderConvs()},1400)};

/* profile */
$('#bioT').textContent=S.bio;
$('#bioBtn').onclick=()=>{const v=$('#bioIn').value.trim();if(!v){toast('Type a new bio first');return}S.bio=v;$('#bioT').textContent=v;$('#bioIn').value='';save();toast('Bio saved')};
$('#theme').onclick=()=>{const r=document.documentElement,d=matchMedia('(prefers-color-scheme:dark)').matches,n=r.dataset.theme||(d?'dark':'light');r.dataset.theme=n==='dark'?'light':'dark'};

renderFeed();renderFollow();renderProj();renderHubs();renderConvs();renderMsgs();renderAlerts();route();
