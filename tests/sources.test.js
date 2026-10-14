import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {sourceLabel,validSlideId,validPreview} from '../docs/source-viewer.js';
const bank=JSON.parse(readFileSync(new URL('../docs/questions.json',import.meta.url)));
const slides=JSON.parse(readFileSync(new URL('../docs/slide-index.json',import.meta.url)));
test('every question points to an existing preview of its exact cited page',()=>{
 for(const m of bank.modules)for(const q of m.questions){
  assert.ok(validSlideId(q.source.slideId),q.id);const s=slides[q.source.slideId];assert.ok(validPreview(s),q.id);
  assert.equal(s.page,q.source.page);assert.equal(s.title,q.source.title);assert.equal(s.label,q.source.label);
  assert.ok(existsSync(new URL('../docs/'+s.image,import.meta.url)),q.id);
 }
});
test('preview paths cannot load external or private files',()=>{
 assert.equal(validSlideId('../secret'),false);assert.equal(validSlideId('abc-0'),false);
 for(const image of ['https://other.test/a.webp','file:///C:/secret','slides/../secret.webp'])assert.ok(!validPreview({image,title:'Test',text:'',page:1}));
 assert.equal(sourceLabel({label:'Page',page:3}),'Page 3');
});
