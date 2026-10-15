// Learning resources are separate from grading and saved progress.
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validVideo(v){return !!v&&/^[A-Za-z0-9_-]{11}$/.test(v.videoId)&&Number.isSafeInteger(v.start)&&v.start>=0&&Number.isSafeInteger(v.end)&&v.end>v.start&&typeof v.channel==='string'&&v.channel.length>0&&typeof v.title==='string'&&v.title.length>0;}
export function videoURL(v){if(!validVideo(v))return null;return `https://www.youtube.com/watch?v=${v.videoId}&t=${v.start}s`;}
export function videoTime(seconds){const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=String(seconds%60).padStart(2,'0');return h?`${h}:${String(m).padStart(2,'0')}:${s}`:`${m}:${s}`;}
export function validateVideos(data,bank){
 if(data?.version!==1||!Array.isArray(data.modules)||!data.questions||typeof data.questions!=='object')throw Error('Invalid learning videos');
 const known=new Set(bank.modules.map(m=>m.id));
 if(data.modules.some(id=>!known.has(id)))throw Error('Unknown video module');
 const ids=new Set(bank.modules.filter(m=>data.modules.includes(m.id)).flatMap(m=>m.questions.map(q=>q.id)));
 for(const id of ids)if(!validVideo(data.questions[id]))throw Error(`Missing learning video: ${id}`);
 for(const [id,v] of Object.entries(data.questions))if(!ids.has(id)||!validVideo(v))throw Error('Invalid learning video mapping');
 return data;
}
export function videoMarkup(v){
 const url=videoURL(v);if(!url)return '';
 // A neutral label avoids naming the correct option before an attempt.
 return `<div class="source-study video-study"><a class="learning-video" href="${url}" target="_blank" rel="noopener noreferrer">Learn this topic on YouTube <span aria-hidden="true">↗</span></a><small>${escapeHTML(v.channel)} · Starts at ${videoTime(v.start)} · Suggested section ${videoTime(v.start)}–${videoTime(v.end)}</small><small>Opens in a new tab. Watch, then return to answer this question.</small></div>`;
}
