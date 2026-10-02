import {workshopActivities,normaliseDraft} from './writing-activities.js?v=20261002';
const requestedModule=new URLSearchParams(location.search).get('module');
const moduleId=['networking','database'].includes(requestedModule)?requestedModule:'pps';
const activities=workshopActivities(moduleId);
if(moduleId==='networking'){document.title='Network design workshop | UniQuiz';document.querySelector('#workshop-module').textContent='Computer Networking · Week 2';document.querySelector('h1').textContent='Network design workshop';document.querySelector('#workshop-intro').textContent='Practise explaining network design decisions using fictional scenarios. Write an attempt, then compare it with a checklist and example reasoning. This supports design and report skills; it is self-review, not an official mark or a prediction of the exam format.';}
if(moduleId==='database'){document.title='Database design workshop | UniQuiz';document.querySelector('#workshop-module').textContent='Database Design - Week 2';document.querySelector('h1').textContent='Database design workshop';document.querySelector('#workshop-intro').textContent='Practise modelling requirements and writing SQL with synthetic scenarios. Write an attempt before opening the guidance. These exercises support design and implementation skills; review is your own assessment, not an automated mark. SQL is not executed here.';}
const key='uniquiz-writing-v1',host=document.querySelector('#exercise'),nav=document.querySelector('.workshop-nav');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let drafts={},current=activities[0],canSave=true;
function storageWarning(){canSave=false;document.querySelector('#storage-status').textContent='Draft saving is unavailable. You can practise, but copy any writing you want to keep before leaving.'}
try{const parsed=JSON.parse(localStorage.getItem(key)||'{}');if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))drafts=parsed;}catch{storageWarning()}
function save(){if(canSave)try{localStorage.setItem(key,JSON.stringify(drafts))}catch{storageWarning()}}
function draft(){return drafts[current.id]??=normaliseDraft(null,current.checklist.length)}
function show(id,focus=false){
 current=activities.find(a=>a.id===id)||activities[0];drafts[current.id]=normaliseDraft(drafts[current.id],current.checklist.length);
 const d=draft();nav.innerHTML=activities.map(a=>`<button class="secondary" data-id="${a.id}" aria-pressed="${a.id===current.id}">${esc(a.title)}</button>`).join('');
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.id,true));
 host.innerHTML=`<h2 tabindex="-1" id="activity-title">${esc(current.title)}</h2><p class="scenario">${esc(current.prompt)}</p><label for="response"><strong>Your response</strong></label><textarea id="response" maxlength="12000" placeholder="Write your attempt here…">${esc(d.text)}</textarea><p class="hint">You can switch exercises and return to your draft.</p><div class="actions"><button id="review" class="primary">Review my attempt</button><button id="reset" class="secondary">Start this exercise again</button></div><p id="attempt-status" role="status"></p><div id="review-panel"></div><p class="source">Learning source: ${esc(current.source)}</p>`;
 host.querySelector('#response').oninput=e=>{draft().text=e.target.value;draft().reviewed=false;draft().checks=current.checklist.map(()=>false);host.querySelector('#review-panel').replaceChildren();host.querySelector('#attempt-status').textContent='';save()};
 host.querySelector('#review').onclick=()=>{if(!draft().text.trim()){host.querySelector('#attempt-status').textContent='Write an attempt before opening the review.';host.querySelector('#response').focus();return}draft().reviewed=true;save();review(true)};
 host.querySelector('#reset').onclick=()=>{if(!confirm('Clear this exercise draft and checklist?'))return;drafts[current.id]=normaliseDraft(null,current.checklist.length);save();show(current.id,true)};
 if(d.reviewed&&d.text.trim())review(false);if(focus)host.querySelector('#activity-title').focus();
}
function review(focus){
 const d=draft(),panel=host.querySelector('#review-panel');
 panel.innerHTML=`<section class="feedback"><h3 id="review-title" tabindex="-1">Check your reasoning</h3><p>Compare your attempt honestly. These checks are your own assessment, not automatic marking.</p>${current.checklist.map((text,i)=>`<label class="check"><input type="checkbox" data-check="${i}" ${d.checks[i]?'checked':''}><span>${esc(text)}</span></label>`).join('')}<p id="result" role="status"></p><h3>One possible approach</h3><p>${esc(current.example)}</p><p>${esc(current.reflection)}</p><p class="hint">Edit your response to try again. Editing hides the guidance and resets this checklist.</p></section>`;
 function result(){const n=draft().checks.filter(Boolean).length;panel.querySelector('#result').textContent=`${n} of ${current.checklist.length} criteria self-checked. ${n===current.checklist.length?'Consider whether your reasoning is supported throughout.':'Use the unchecked points to guide your next attempt.'}`}
 panel.querySelectorAll('input').forEach(input=>input.onchange=()=>{draft().checks[Number(input.dataset.check)]=input.checked;save();result()});result();if(focus)panel.querySelector('#review-title').focus();
}
show(current.id);
