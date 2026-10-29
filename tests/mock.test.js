import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../docs/networking-mock.html',import.meta.url),'utf8');
const bank=JSON.parse(html.split('<script id="exam-data" type="application/json">')[1].split('</script>')[0]);
const core=html.split('<script>')[1].split('let exam=validateExam')[0];
const {grade,assess,validateExam,complete}=vm.runInNewContext(core+';({grade,assess,validateExam,complete})');
test('mixed-format mock contains 100 unique valid objectives and matches the downloadable bank',()=>{
 validateExam(bank);assert.equal(bank.questions.length,100);assert.equal(new Set(bank.questions.map(q=>q.type)).size,6);
 const downloadable=JSON.parse(fs.readFileSync(new URL('../docs/networking-mock-100.json',import.meta.url),'utf8'));assert.deepEqual(bank,downloadable);
});
test('all 100 marking keys, equivalent short forms and incorrect alternatives behave as specified',()=>{
 for(const q of bank.questions){assert.ok(grade(q,q.type==='short'?q.answer[0]:q.answer),q.id);assert.equal(grade(q,undefined),false);
 if(q.type==='short')for(const a of q.answer)assert.ok(grade(q,'  '+a.toUpperCase()+' . '));
 if(q.type==='single')for(let i=0;i<q.options.length;i++)assert.equal(grade(q,i),i===q.answer);
 if(q.type==='truefalse')assert.equal(grade(q,!q.answer),false);
 if(q.type==='multiple'){assert.ok(grade(q,[...q.answer].reverse()));assert.equal(grade(q,[q.answer[0]]),false);assert.equal(grade(q,[0,1,2,3]),false)}
 if(['matching','ordering'].includes(q.type)){const a=[...q.answer];[a[0],a[1]]=[a[1],a[0]];assert.equal(grade(q,a),false);assert.equal(complete(q,q.answer.map(()=>0)),false)}
 }
});
test('full and subset marks, topic priorities and blank questions have correct denominators',()=>{
 const ids=bank.questions.map(q=>q.id),answers=Object.fromEntries(bank.questions.map(q=>[q.id,q.type==='short'?q.answer[0]:q.answer]));
 assert.equal(assess(bank,ids,answers).score,100);const blank=assess(bank,ids,{});assert.equal(blank.score,0);assert.equal(blank.unanswered,100);
 delete answers[ids[0]];assert.equal(assess(bank,ids,answers).score,99);assert.equal(assess(bank,ids.slice(0,3),answers).total,3);
});
test('mock is discoverable, isolated from existing progress and free of private source content',()=>{
 const app=fs.readFileSync(new URL('../docs/app.js',import.meta.url),'utf8'),index=fs.readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');
 assert.equal((app.match(/href="networking-mock.html"/g)||[]).length,2);assert.match(index,/20261029-mock100/);
 assert.match(html,/uniquiz-mock-v1:/);assert.doesNotMatch(html,/uniquiz-progress-v1|uniquiz-writing-v1|C:\\Users\\|sourceRoot|puddlelake6@/);
});
