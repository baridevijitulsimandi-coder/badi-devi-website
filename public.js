const configured = !!(window.supabase && window.SUPABASE_URL && !window.SUPABASE_URL.includes('PASTE_') && window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.includes('PASTE_'));
const db = configured ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);
if ($('year')) $('year').textContent = new Date().getFullYear();
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function rows(table, order='sort_order') { if(!db) return []; let q=db.from(table).select('*'); if(order) q=q.order(order,{ascending:true}); const {data,error}=await q; if(error){console.warn(error.message);return []} return data||[]; }
async function content(key) { if(!db) return null; const {data,error}=await db.from('site_content').select('content_value').eq('content_key',key).maybeSingle(); if(error) console.warn(error.message); return data?.content_value||null; }
function showSocial(s) {
  if(!s) return;
  const items=[['instagram','◎','इंस्टाग्राम','रील्स और तस्वीरें','instagram'],['facebook','f','फेसबुक','फोटो और अपडेट','facebook'],['youtube','▶','यूट्यूब','पूजा कार्यक्रम के वीडियो','youtube'],['whatsapp','◉','व्हाट्सऐप','सूचनाएँ और संपर्क','whatsapp']];
  if(!s.instagram)s.instagram='https://www.instagram.com/badidevijetulsimandi/';
  const configuredItems=items.filter(x=>s[x[0]]);
  if(!configuredItems.length) return;
  $('socialGrid').innerHTML=configuredItems.map(x=>`<a class="social ${x[4]}" href="${esc(s[x[0]])}" target="_blank" rel="noopener"><span class="social-symbol">${x[1]}</span><span><strong>${x[2]}</strong><small>${x[3]}</small></span></a>`).join('');
}
function renderGallery(items) {
  if(!items.length) return;
  $('galleryCards').innerHTML=items.map(x=>`<article class="media-card">${x.media_type==='video'?`<video controls preload="metadata" src="${esc(x.media_url)}"></video>`:`<img loading="lazy" src="${esc(x.media_url)}" alt="${esc(x.title)}">`}<div class="media-body"><h3>${esc(x.title)}</h3><p>${esc(x.description)} ${x.year_label?`· ${esc(x.year_label)}`:''}</p></div></article>`).join('');
}
function renderVideos(items) {
  if(!items.length) return;
  $('videoCards').innerHTML=items.map(x=>`<article class="media-card"><a class="video-placeholder" href="${esc(x.video_url)}" target="_blank" rel="noopener" aria-label="${esc(x.title)}"><span>▶</span></a><div class="media-body"><h3>${esc(x.title)}</h3><p>${esc(x.creator_name||'')} ${x.platform?`· ${esc(x.platform)}`:''}</p></div></article>`).join('');
}
function renderAnnouncements(items) {
  if(!items.length) return;
  $('announcementsSection').hidden=false;
  $('announcementList').innerHTML=items.map(x=>`<article class="announcement"><strong>${esc(x.title)}</strong><p>${esc(x.body)}</p><small>${x.created_at?new Date(x.created_at).toLocaleDateString('hi-IN'):''}</small></article>`).join('');
}
function renderEvents(items) {
  if(!items.length) return;
  $('eventList').innerHTML=items.map(x=>`<div class="event-row"><span class="event-date">${esc(x.event_date||'तिथि')}</span><span><strong>${esc(x.title)}</strong><small>${esc(x.event_time||'')} ${esc(x.description||'')}</small></span></div>`).join('');
}
function renderCommittee(items) {
  if(!items.length) return;
  $('committeeList').innerHTML=items.map(x=>`<div class="committee-row"><strong>${esc(x.role||'समिति सदस्य')}: ${esc(x.name)}</strong><span>${x.phone?`संपर्क: ${esc(x.phone)}`:''} ${esc(x.bio||'')}</span></div>`).join('');
}
async function init() {
  const form=$('contactForm');
  if(form) form.addEventListener('submit',e=>{e.preventDefault();$('formStatus').textContent=db?'संदेश भेजने की सुविधा सेटअप की जाँच के बाद सक्रिय की जाएगी।':'यह फ़ॉर्म संदेश भेजने के लिए अभी सक्रिय नहीं है। Supabase सेटअप के बाद इसे जोड़ा जाएगा।';});
  if(!db) return;
  const [hero,history,loc,social,contact,gallery,videos,events,committee,announcements]=await Promise.all([content('hero'),content('history'),content('location'),content('social'),content('contact'),rows('gallery'),rows('creator_videos'),rows('events'),rows('committee_members'),rows('announcements','created_at')]);
  if(hero){if(hero.title){$('heroTitle').textContent=hero.title;$('brandTitle').textContent=hero.title;}if(hero.subtitle){$('heroSub').textContent=hero.subtitle;$('brandSub').textContent=hero.subtitle+' · पटना';}if(hero.tagline)$('heroTag').textContent=hero.tagline;if(hero.description)$('heroDesc').textContent=hero.description;if(hero.background_url){const heroEl=document.querySelector('.hero');heroEl.style.backgroundImage=`linear-gradient(180deg,rgba(69,7,13,.97) 0%,rgba(101,13,22,.94) 38%,rgba(101,13,22,.12) 100%),url("${hero.background_url}")`;heroEl.style.backgroundPosition='center top,center bottom';heroEl.style.backgroundRepeat='no-repeat';}}
  if(history){$('historyBody').textContent=history.body||$('historyBody').textContent;const h=$('historyGallery');if(history.image_url)h.innerHTML=`<img loading="lazy" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-top:10px" src="${esc(history.image_url)}" alt="इतिहास की तस्वीर">`;}
  if(loc){if(loc.address)$('address').textContent=loc.address;if(loc.map_url)$('mapLink').href=loc.map_url;}
  if(contact){const bits=[contact.phone?'फ़ोन: '+contact.phone:'',contact.email?'ईमेल: '+contact.email:''].filter(Boolean);if(bits.length)$('contact').querySelector('.muted-text').textContent=bits.join(' · ')+'।';}
  showSocial(social);renderGallery(gallery);renderVideos(videos);renderEvents(events);renderCommittee(committee);renderAnnouncements(announcements.filter(x=>x.active));
}
init();
