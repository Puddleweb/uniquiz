import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>fs.readFileSync(new URL('../docs/'+path,import.meta.url),'utf8');
test('the revision-room theme and home navigation are available on every main surface',()=>{
 for(const page of ['index.html','writing-practice.html','networking-mock.html']){const html=read(page);assert.match(html,/theme\.css\?v=20261029-studyroom/);assert.match(html,/class="site-header"/);assert.match(html,/aria-label="UniQuiz home"/);assert.match(html,/name="viewport"/)}
 const index=read('index.html');for(const id of ['home-button','info-button','refresh-button'])assert.match(index,new RegExp('id="'+id+'"'));
 assert.match(read('app.js'),/data-module=/);assert.match(read('app.js'),/data-mode="all"/);assert.match(read('app.js'),/data-mode="quick"/);assert.match(read('app.js'),/data-mode="mistakes"/);
});
test('saved progress and workshop drafts retain their existing storage contracts',()=>{
 assert.match(read('app.js'),/key='uniquiz-progress-v1'/);assert.match(read('writing-practice.js'),/key='uniquiz-writing-v1'/);
 assert.match(read('networking-mock.html'),/uniquiz-cccu-original-mock-deduplicated/);assert.match(read('networking-mock.html'),/uniquiz-mock-v1:/);
});
test('the new colour pairs meet readable text contrast and reduced-motion support remains available',()=>{
 const luminance=h=>{const v=h.match(/../g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722};
 for(const [fg,bg] of [['193c35','f7f6f0'],['61716a','f7f6f0'],['d4ddcc','193c35'],['c6e1be','193c35']]){const l=[luminance(fg),luminance(bg)].sort((a,b)=>b-a);assert.ok((l[0]+.05)/(l[1]+.05)>=4.5)}
 const css=read('theme.css');assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/@media\(max-width:650px\)/);assert.match(css,/:focus-visible/);
});
