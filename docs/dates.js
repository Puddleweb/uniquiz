export function displayDate(value,time=false){
 if(!value)return 'To be confirmed';
 const dateOnly=/^\d{4}-\d{2}-\d{2}$/.test(value);
 const formatted=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',...(time&&!dateOnly?{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}:{}),timeZone:'Europe/London'}).format(new Date(dateOnly?value+'T12:00:00Z':value));
 return formatted+(time&&dateOnly?' — time to be confirmed':'');
}
export function isPastDeadline(value,now=new Date()){
 if(!value)return false;
 if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value<new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 return new Date(value)<now;
}
export function feedbackText(assessment){return displayDate(assessment.feedback)+(assessment.feedback&&assessment.feedbackVia?' via '+assessment.feedbackVia:'')}
