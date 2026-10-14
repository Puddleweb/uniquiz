let indexPromise;
export function sourceLabel(source){return `${source.label||'Slide'} ${source.page}`}
export function validSlideId(value){return typeof value==='string'&&/^[a-f0-9]{16}-[1-9]\d*$/.test(value)}
export function validPreview(entry){return entry&&/^slides\/[a-f0-9]{16}-[1-9]\d*\.webp$/.test(entry.image)&&typeof entry.title==='string'&&typeof entry.text==='string'&&Number.isInteger(entry.page)&&entry.page>0}
async function getIndex(){
 if(!indexPromise)indexPromise=fetch('./slide-index.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Slide index unavailable');return r.json()}).catch(e=>{indexPromise=null;throw e});
 return indexPromise;
}
export async function showSource(source,opener){
 const dialog=document.createElement('dialog');dialog.className='slide-dialog';dialog.setAttribute('aria-labelledby','slide-heading');
 const header=document.createElement('div');header.className='slide-dialog-header';
 const heading=document.createElement('h2');heading.id='slide-heading';heading.textContent=`${source.title} · ${sourceLabel(source)}`;
 const close=document.createElement('button');close.className='secondary';close.textContent='Back to question';close.type='button';close.addEventListener('click',()=>dialog.close());
 header.append(heading,close);const content=document.createElement('div');content.className='slide-content';content.setAttribute('aria-live','polite');dialog.append(header,content);
 dialog.addEventListener('close',()=>{dialog.remove();opener?.focus({preventScroll:true})},{once:true});
 document.body.append(dialog);dialog.showModal();close.focus();
 async function load(){
  content.replaceChildren();const status=document.createElement('p');status.textContent='Loading the source page…';content.append(status);
  try{
   if(!validSlideId(source.slideId))throw Error('Missing slide reference');
   const entry=(await getIndex())[source.slideId];if(!validPreview(entry)||entry.page!==source.page||entry.title!==source.title)throw Error('Mismatched slide reference');
   if(!dialog.isConnected)return;
   const image=document.createElement('img');image.className='source-slide-image';image.alt=`${entry.title}, ${sourceLabel(source)}. Extracted text is available below.`;
   const loaded=new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Slide image unavailable'))});image.src=entry.image;await loaded;
   if(!dialog.isConnected)return;content.replaceChildren(image);
   const full=document.createElement('a');full.href=entry.image;full.target='_blank';full.rel='noopener';full.textContent='Open full-size image in a new tab';content.append(full);
   const note=document.createElement('p');note.className='hint';note.textContent='Read the page, then return to choose your answer. Viewing it does not submit an answer.';content.append(note);
   const details=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');summary.textContent='Read extracted slide text';text.className='slide-transcript';text.textContent=entry.text||'This page contains a diagram or image with no extractable text.';details.append(summary,text);content.append(details);
  }catch{
   if(!dialog.isConnected)return;status.textContent='This slide could not load. Check your connection and try again. Your answer and progress are unchanged.';content.replaceChildren(status);
   const retry=document.createElement('button');retry.className='secondary';retry.textContent='Try loading the slide again';retry.addEventListener('click',load);content.append(retry);
  }
 }
 await load();
}
