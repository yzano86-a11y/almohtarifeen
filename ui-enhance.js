const css=document.createElement('link');css.rel='stylesheet';css.href='./ui-enhance.css';document.head.appendChild(css);
const SUITS=new Set(['♠','♥','♦','♣']);
const splitCard=value=>{const t=value.trim();const m=t.match(/(10|[2-9]|J|Q|K|A)([♠♥♦♣])$/);return m?{rank:m[1],suit:m[2]}:null};
const countForRank=r=>{const n=Number(r);return Number.isFinite(n)&&n>=2&&n<=10?n:0};
function cardFace(rank,suit){
  const root=document.createElement('span');root.className='premium-card-face';
  const corner=document.createElement('span');corner.className='card-corner';corner.innerHTML=`<b>${rank}</b><i>${suit}</i>`;
  const center=document.createElement('span');center.className='card-center';
  const n=countForRank(rank);
  if(n){for(let i=0;i<n;i++){const p=document.createElement('i');p.textContent=suit;p.className='pip';center.appendChild(p)}}
  else {center.innerHTML=`<b class="face-rank">${rank}</b><i class="face-suit">${suit}</i>`}
  const bottom=document.createElement('span');bottom.className='card-corner bottom';bottom.innerHTML=`<b>${rank}</b><i>${suit}</i>`;
  root.append(corner,center,bottom);return root;
}
function decorateHand(){document.querySelectorAll('#hand .cardplay').forEach(btn=>{if(btn.dataset.decorated)return;const c=splitCard(btn.textContent);if(!c)return;btn.textContent='';btn.append(cardFace(c.rank,c.suit));btn.dataset.decorated='1';});}
function decorateTrick(){document.querySelectorAll('#trick .played').forEach(card=>{if(card.dataset.decorated)return;const raw=card.textContent.replace(/\s+/g,' ').trim();const m=raw.match(/(10|[2-9]|J|Q|K|A)([♠♥♦♣])$/);if(!m)return;const rank=m[1],suit=m[2],label=raw.slice(0,raw.length-m[0].length).trim();card.textContent='';const l=document.createElement('small');l.textContent=label;card.append(l,cardFace(rank,suit));card.dataset.decorated='1';});}
function enhance(){decorateHand();decorateTrick();}
const obs=new MutationObserver(enhance);obs.observe(document.body,{subtree:true,childList:true});enhance();
