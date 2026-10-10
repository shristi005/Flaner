// Brand, outings, plans, barriers, tips, icons
const BRAND = {
  name: 'Flâner',
  tag: 'Small steps. Bigger days.',
  sub: 'A gentle companion for getting out, discovering your surroundings, and reconnecting with the world beyond your screen.',
  def: 'flâner (verb): to walk unhurriedly, observing the streets, people and details with a curious, open mind.'
};
const I = {
 leaf:'<path d="M20 4C9 4 4 9 4 16c0 2 .5 3 1 4 1-5 4-8 9-10-4 3-6 6-7 10 8 0 13-5 13-16z"/>',
 left:'<path d="M19 12H5M11 6l-6 6 6 6"/>',right:'<path d="M5 12h14M13 6l6 6-6 6"/>',down:'<path d="M6 9l6 6 6-6"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',users:'<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c0-4 3-6 6.500-6s6.500 2 6.500 6"/><circle cx="17" cy="9" r="2.500"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',chat:'<path d="M21 12a8 8 0 0 1-11.500 7.200L4 20l1-4.500A8 8 0 1 1 21 12z"/>',
 walk:'<circle cx="12" cy="5" r="2"/><path d="M12 8v6l-3 6M12 14l3 6M8 11l4-3 4 3"/>',mirror:'<circle cx="12" cy="10" r="6"/><path d="M12 16v5M9 21h6"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/>',battery:'<rect x="2" y="8" width="17" height="8" rx="2"/><path d="M22 11v2"/>',
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
 dots:'<circle cx="5" cy="12" r="1.500"/><circle cx="12" cy="12" r="1.500"/><circle cx="19" cy="12" r="1.500"/>',cart:'<circle cx="9" cy="20" r="1.500"/><circle cx="18" cy="20" r="1.500"/><path d="M2 3h3l2.500 12h11l2-8H6"/>',
 bank:'<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7z"/>',cup:'<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2"/>',
 spark:'<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 pencil:'<path d="M4 20l1-5L16 4l4 4L9 19z"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z"/>',
 bag:'<path d="M5 8h14l-1 13H6zM9 8a3 3 0 0 1 6 0"/>',smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1.500 3 4 3 4-3 4-3M9 9.500h.01M15 9.500h.01"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-5 2 2-5z"/>',pin:'<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.500"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',check:'<path d="M5 12l5 5 9-10"/>',door:'<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M14 12h.01"/>'
};
const BARS = [
 ['people','eye','People looking at me'],['crowd','users','Crowds'],['talk','chat','Talking to people'],
 ['alone','walk','Going alone'],['look','mirror','How I look'],['safe','shield',"I don't feel safe"],
 ['energy','battery',"I don't have the energy"],['comfy','home','Home is more comfortable'],
 ['phone','phone','My phone keeps pulling me back'],['idk','dots','Something else']
];
const TWEAK = {
 people:['Pick one outfit that feels okay. Done beats perfect.','You only need to do what you came for. Nobody is grading you.'],
 crowd:['Pick a quieter time if you can (mid-morning or late evening).','Choose the smaller shop or the quieter route.'],
 talk:['You only need "hi" and "thanks". That is enough.','Self-checkout or a written list works fine.'],
 alone:['Text someone: "heading out, back soon".','Put on one song you like, then take the earbuds out.'],
 look:['Fresh is enough: face, clean clothes, done.','You do not need to look "ready" to be allowed outside.'],
 energy:['Sit up, drink water, then only think about shoes.','Keep it short. You can head home after the first part.'],
 comfy:['Set a 10-minute timer. You can stop when it ends.','Delivery will still exist tomorrow. Today you get to practice.'],
 phone:['Put your phone on silent, in your pocket or bag.','Leave it there until you reach the first stop.'],
 idk:['No need to figure out the fear today. Just make the step small.'],
 safe:['Choose a familiar, well-lit route.','Tell someone where you are going and when you will be back.']
};
const FEARS = {
 people:['People will stare at me','I will look awkward'],crowd:['It will be too loud and packed','I will feel trapped'],
 talk:['I will not know what to say','Someone will ask me something'],alone:['I will look strange being alone','Something will go wrong with no one there'],
 look:['People will judge how I look','I am not presentable enough'],energy:['I will run out of energy','I will not manage it'],
 comfy:['It will not be worth the effort','I will hate it once I am out'],phone:['I will lose my comfort and feel bored','I will miss something'],
 idk:['I just feel uncomfortable'],safe:['Something unsafe could happen']
};

// Entry points on the home screen
const ENTRIES = [
 {k:'go', ic:'door', t:'I have somewhere to go', d:'Groceries, errands, college, appointments'},
 {k:'explore', ic:'compass', t:'I want to explore', d:'Walks, nearby discoveries, new places'},
 {k:'nudge', ic:'smile', t:'I need a little nudge', d:'When you feel stuck, overwhelmed or reluctant to leave'}
];
// e = which entry points show this outing
const TASKS = {
 groceries:{ic:'cart', n:'Get groceries', past:'Got groceries', title:'Your grocery outing', dur:'25–35 minutes', e:['go'], ph:'e.g. I want to go before it gets busy.'},
 errand:{ic:'bank', n:'Run an errand', past:'Ran an errand', title:'Your errand', dur:'20–40 minutes', e:['go'], ph:'e.g. Post a parcel and pay a bill.'},
 appt:{ic:'pin', n:'Go to college or an appointment', past:'Went to college or an appointment', title:'Your appointment', dur:'depends on your day', e:['go'], ph:'e.g. A 10am dentist visit.'},
 meet:{ic:'users', n:'Meet someone', past:'Met someone', title:'Meeting someone', dur:'45–90 minutes', e:['go'], ph:'e.g. Coffee with an old friend.'},
 cafe:{ic:'cup', n:'Go somewhere', past:'Went somewhere', title:'Your outing', dur:'30–60 minutes', e:['go','explore'], ph:'e.g. A café I keep meaning to try.'},
 walk:{ic:'walk', n:'Go for a walk', past:'Went for a walk', title:'Your walk', dur:'15–30 minutes', e:['explore'], ph:'e.g. Just a short loop.'},
 hood:{ic:'compass', n:'Explore my neighbourhood', past:'Explored my neighbourhood', title:'Exploring your neighbourhood', dur:'30–60 minutes', e:['explore'], ph:'e.g. I have lived here a year and barely know it.'},
 nature:{ic:'leaf', n:'Spend time in nature', past:'Spent time in nature', title:'Time in nature', dur:'30–60 minutes', e:['explore'], ph:'e.g. Somewhere green, with birds.'},
 other:{ic:'spark', n:'Something else', past:'Did something new', title:'Your outing', dur:'20–45 minutes', e:['go','explore'], ph:'e.g. I need to visit the bank, but I keep postponing it.'}
};
const TIMES = [['15','About 15 minutes'],['30','About 30 minutes'],['60','About an hour'],['open','No rush']];
const TIME_LABEL = {'15':'About 15 minutes','30':'About 30 minutes','60':'About an hour','open':'No rush'};
const ENERGY = [['low','Low'],['ok','Okay'],['good','Good']];
const ENERGY_LABEL = {low:'Low energy',ok:'Okay energy',good:'Good energy'};
const FEELINGS = ['Just what I needed','Better than expected','A little difficult, but worthwhile','Not what I expected','I only managed a small step'];
const EVERYDAY = ['groceries','errand','appt'].map(k => TASKS[k].past);
const NOTICE = ['Find something green','Listen for three different sounds','Look up for a moment','Notice something you have never seen before'];
const PREP = 'Freshen up if you want to|Comfortable enough is enough';
// Built-in plans, used only if the AI model is unavailable
const PLAN = {
 groceries:{before:['Make your shopping list',PREP,'Get dressed comfortably','Take your bag, keys and payment method'], midT:'At the shop', mid:['Walk to your chosen shop','Pick up what you need','Pay and pack your bag']},
 errand:{before:['Check opening hours before you leave',PREP,'Get dressed comfortably','Put on your shoes'], midT:'At your stop', mid:['Go to the place','Do the one thing you came for','Leave when you are done'], itemsT:'What to bring', items:['Phone, keys and wallet','Any documents or forms you need']},
 appt:{before:['Check the time and place',PREP,'Get dressed comfortably','Put on your shoes'], midT:'When you arrive', mid:['Arrive a few minutes early','Let them know you are here','Take a slow breath before you go in'], itemsT:'What to bring', items:['Phone, keys and wallet','Anything you were asked to bring']},
 meet:{before:['Send a quick "on my way" message',PREP,'Get dressed comfortably','Put on your shoes'], midT:'Meeting up', mid:['Walk to the meeting spot','Say hi. That is the whole goal','Head home whenever you like']},
 cafe:{before:['Pick where you are going',PREP,'Get dressed comfortably','Put on your shoes'], midT:'Once you are there', mid:['Look around at your own pace','Order something small, or just sit','Stay as long as feels okay']},
 walk:{before:['Pick a direction. Any direction.','Put on comfortable shoes','Take your keys'], go:['Step outside','Start walking'], midT:'The walk', mid:['Walk for about 10 minutes','Turn around when you feel like it','Take a different way home if you can'], notice:true},
 hood:{before:['Put on comfortable shoes','Take your keys','Decide you have no destination'], go:['Step outside','Start walking'], midT:'Exploring', mid:['Choose a street you do not usually take','Walk without a goal','Stop wherever something catches your eye'], notice:true},
 nature:{before:['Think of the greenest place nearby','Put on shoes you can walk in','Bring water if you like'], go:['Step outside','Head toward somewhere green'], midT:'Time outside', mid:['Walk or sit somewhere green','Stay for at least five minutes','Take one slow breath'], notice:true},
 other:{before:['Write down what you need to do',PREP,'Put on your shoes'], midT:'Your outing', mid:['Head to the place','Do the thing you came for','Head back when you are ready']}
};
const IDEAS = [
 {t:'Walk to the nearest green space and sit for three minutes', task:'walk'},
 {t:'Take a different route to a place you already go', task:'hood'},
 {t:'Find three things in your favourite colour', task:'hood'},
 {t:'Step outside and notice five different sounds', task:'nature'},
 {t:'Buy one small thing you need from a local shop', task:'groceries'},
 {t:'Browse a library or bookshop for ten minutes', task:'cafe'},
 {t:'Have a drink outside for ten minutes, phone in your bag', task:'cafe'},
 {t:'Look up and spot something above eye level you never noticed', task:'hood'}
];
const QUOTE = {t:"Courage doesn't always roar. Sometimes it's the quiet voice at the end of the day saying, 'I'll try again tomorrow.'", by:'Mary Anne Radmacher'};
