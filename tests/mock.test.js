import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../docs/networking-mock.html',import.meta.url),'utf8');
const bank=JSON.parse(html.split('<script id="exam-data" type="application/json">')[1].split('</script>')[0]);
const core=html.split('<script>')[1].split('let exam=validateExam')[0];
const {grade,assess,validateExam,complete}=vm.runInNewContext(core+';({grade,assess,validateExam,complete})');
test('streamlined original mock accounts for every original question and both JSON endpoints match',()=>{
 validateExam(bank);assert.equal(bank.questions.length,65);
 const retained=bank.questions.map(q=>q.originalNumber),removed=bank.deduplication.removedQuestions;
 assert.equal(removed.length,35);assert.deepEqual(retained,[...retained].sort((a,b)=>a-b));
 assert.deepEqual([...retained,...removed.map(r=>r.originalNumber)].sort((a,b)=>a-b),Array.from({length:100},(_,i)=>i+1));
 for(const r of removed)for(const n of r.coveredBy)assert.ok(retained.includes(n));
 for(const file of ['networking-original-mock.json','networking-mock-100.json'])assert.deepEqual(bank,JSON.parse(fs.readFileSync(new URL('../docs/'+file,import.meta.url),'utf8')));
 assert.ok(bank.preserveOrder);assert.equal(new Set(bank.questions.map(q=>q.type)).size,5);
});
test('all original practice keys, aliases and explicit matching equivalents mark correctly',()=>{
 for(const q of bank.questions){assert.ok(grade(q,q.type==='short'?q.answer[0]:q.answer),q.id);assert.equal(grade(q,undefined),false);
 if(q.type==='short')for(const a of q.answer)assert.ok(grade(q,' '+a.toUpperCase()+' . '));
 if(q.type==='single')for(let i=0;i<q.options.length;i++)assert.equal(grade(q,i),i===q.answer);
 if(q.type==='matching'){assert.equal(grade(q,q.answer.map(()=>null)),false);if(q.acceptedPerItem)for(let i=0;i<q.items.length;i++)for(const v of q.acceptedPerItem[i]){const a=[...q.answer];a[i]=v;assert.ok(grade(q,a))}}
 }
 const q=n=>bank.questions.find(q=>q.originalNumber===n);
 assert.ok(grade(q(21),['5 GHz','2.4GHz']));assert.equal(grade(q(21),['2.4','2.4GHz']),false);
 assert.ok(grade(q(23),['WIRESHARK','ping','tracert']));assert.equal(grade(q(23),['tracert','traceroute','ping']),false);
 assert.ok(grade(q(27),['WPA3','WPA2']));assert.ok(grade(q(85),[3,0,2,0]));assert.ok(complete(q(85),[3,0,2,0]));
});
test('review-only ambiguity is excluded from the 64-mark score and mistake retries',()=>{
 const ids=bank.questions.map(q=>q.id),answers=Object.fromEntries(bank.questions.map(q=>[q.id,q.type==='short'?q.answer[0]:q.answer]));
 const r=assess(bank,ids,answers);assert.equal(r.score,64);assert.equal(r.total,64);assert.equal(r.questionCount,65);assert.equal(r.reviewOnly,1);
 const q=bank.questions.find(q=>q.originalNumber===32);answers[q.id]=true;assert.equal(assess(bank,ids,answers).score,64);
 const blank=assess(bank,ids,{});assert.equal(blank.score,0);assert.equal(blank.unanswered,64);assert.equal(blank.missed.length,64);assert.ok(!blank.missed.includes(q.id));
 assert.equal(assess(bank,ids.slice(0,3),answers).total,3);
});
test('source numbers, restored option provenance, original formats and isolated storage are present',()=>{
 assert.equal(bank.questions.filter(q=>q.type==='single').length,24);assert.equal(bank.questions.filter(q=>q.type==='blanks').length,3);
 assert.ok(bank.questions.filter(q=>q.type==='matching').every(q=>q.optionProvenance));
 assert.match(html,/Original Q\$\{q.originalNumber\}/);assert.match(html,/uniquiz-cccu-original-mock-deduplicated/);
 assert.doesNotMatch(html,/Fresh 100|6 question formats|uniquiz-progress-v1|uniquiz-writing-v1|C:\\Users\\|sourceRoot|71 minutes remaining|SelectedCombine/);
});
test('the home and networking screens identify the corrected original mock',()=>{
 const app=fs.readFileSync(new URL('../docs/app.js',import.meta.url),'utf8'),index=fs.readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');
 assert.equal((app.match(/href="networking-mock.html"/g)||[]).length,2);assert.match(app,/65 retained original questions/);assert.doesNotMatch(app,/Fresh 100-question mock|New 100-question networking mock/);
 assert.match(index,/app\.js\?v=20261029-studyroom/);
});
