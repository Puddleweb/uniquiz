import test from 'node:test';
import assert from 'node:assert/strict';
import {activities,normaliseDraft,workshopActivities} from '../docs/writing-activities.js';
test('stored writing drafts cannot inject fields or malformed checklist states',()=>{
 assert.deepEqual(normaliseDraft({text:42,reviewed:'yes',checks:[true,'true',false],answer:1},4),{text:'',reviewed:false,checks:[true,false,false,false]});
 assert.equal(normaliseDraft({text:'x'.repeat(13000)},4).text.length,12000);
});
test('writing activities have stable unique IDs, sources and self-review guidance',()=>{
 assert.equal(new Set(activities.map(a=>a.id)).size,activities.length);
 for(const a of activities){assert.ok(a.prompt&&a.source&&a.example&&a.reflection);assert.equal(a.checklist.length,4)}
});

test('workshops keep modules separate and preserve existing activity IDs',()=>{
 assert.equal(workshopActivities('pps').length,3);
 assert.equal(workshopActivities('networking').length,3);
 assert.ok(workshopActivities('networking').every(a=>a.id.startsWith('networking-w2-')));
 assert.deepEqual(workshopActivities('unknown'),workshopActivities('pps'));
});

test('database workshop exposes only its own original exercises',()=>{assert.equal(workshopActivities('database').length,2);assert.ok(workshopActivities('database').every(a=>a.module==='database'));});
