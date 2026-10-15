import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validVideo,videoURL,videoTime,validateVideos,videoMarkup} from '../docs/learning-videos.js';
const read=file=>JSON.parse(readFileSync(new URL('../docs/'+file,import.meta.url)));
const bank=read('questions.json'),data=read('learning-videos.json');
test('every networking and database question has a reviewed video; PPS stays unchanged',()=>{
 assert.deepEqual(data.modules,['networking','database']);assert.equal(validateVideos(data,bank),data);
 assert.equal(Object.keys(data.questions).length,bank.modules.filter(m=>data.modules.includes(m.id)).reduce((n,m)=>n+m.questions.length,0));
 assert.ok(bank.modules.find(m=>m.id==='pps').questions.every(q=>!data.questions[q.id]));
 const missing=structuredClone(data);delete missing.questions[Object.keys(missing.questions)[0]];assert.throws(()=>validateVideos(missing,bank));
});
test('links use a fixed HTTPS YouTube destination and integer start times',()=>{
 const v=Object.values(data.questions)[0];assert.match(videoURL(v),/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}&t=\d+s$/);
 for(const bad of [{...v,videoId:'../private'},{...v,start:-1},{...v,start:1.5},{...v,end:v.start},{...v,channel:null}]){assert.equal(validVideo(bad),false);assert.equal(videoURL(bad),null);}
 assert.equal(videoTime(92),'1:32');assert.equal(videoTime(3723),'1:02:03');
});
test('learning links do not reveal titles or answers and safely open a separate tab',()=>{
 const v={...Object.values(data.questions)[0],title:'ANSWER SPOILER',channel:'<script>test</script>'};const html=videoMarkup(v);
 assert.ok(!html.includes('ANSWER SPOILER'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
 assert.match(html,/target="_blank" rel="noopener noreferrer"/);assert.match(html,/Learn this topic/);
});
