// Checkers integration for Almohtarifeen.
// Rules adapted from the verified MIT-licensed source:
// https://github.com/elye/web_dynamic_nodejs_checkers_game
// The upstream project is real-time multiplayer; this embedded build keeps the
// complete board/rules locally so it works inside the existing static app.

const DIRS = [[-1,-1],[-1,1],[1,-1],[1,1]];
const inside = (r,c) => r >= 0 && r < 8 && c >= 0 && c < 8;

function makeBoard(){
  const b = Array.from({length:8},()=>Array(8).fill(null));
  for(let r=0;r<3;r++) for(let c=0;c<8;c++) if((r+c)%2) b[r][c]={color:'red',king:false};
  for(let r=5;r<8;r++) for(let c=0;c<8;c++) if((r+c)%2) b[r][c]={color:'black',king:false};
  return b;
}

function directions(piece){
  if(piece.king) return DIRS;
  return piece.color==='red' ? [[1,-1],[1,1]] : [[-1,-1],[-1,1]];
}

function capturesForPiece(board,r,c){
  const p=board[r][c]; if(!p) return [];
  const out=[];
  for(const [dr,dc] of directions(p)){
    const mr=r+dr,mc=c+dc,lr=r+2*dr,lc=c+2*dc;
    if(inside(lr,lc) && board[mr]?.[mc] && board[mr][mc].color!==p.color && !board[lr][lc])
      out.push({from:{r,c},to:{r:lr,c:lc},captured:{r:mr,c:mc}});
  }
  return out;
}

function allCaptures(board,color){
  const out=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c]?.color===color) out.push(...capturesForPiece(board,r,c));
  return out;
}

function legalMovesForPiece(board,r,c,color){
  const p=board[r][c]; if(!p || p.color!==color) return [];
  const forced=allCaptures(board,color).length>0;
  const out=[];
  for(const [dr,dc] of directions(p)){
    const nr=r+dr,nc=c+dc;
    if(!forced && inside(nr,nc) && !board[nr][nc]) out.push({from:{r,c},to:{r:nr,c:nc},capture:null});
    const cr=r+2*dr,cc=c+2*dc;
    if(inside(cr,cc) && board[nr]?.[nc] && board[nr][nc].color!==color && !board[cr][cc])
      out.push({from:{r,c},to:{r:cr,c:cc},capture:{r:nr,c:nc}});
  }
  return out;
}

export function startCheckers(){
  const old=document.getElementById('checkersOverlay');
  if(old) old.remove();

  const root=document.createElement('section');
  root.id='checkersOverlay';
  root.dir='rtl';
  root.style.cssText='position:fixed;inset:0;z-index:10000;background:linear-gradient(180deg,#07101d,#0d1727);color:#fff;display:flex;flex-direction:column;overflow:auto;font-family:inherit;';
  root.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;position:sticky;top:0;background:rgba(7,16,29,.96);z-index:2;border-bottom:1px solid rgba(255,255,255,.08)">
      <div><b style="font-size:20px">داما</b><div id="ckStatus" style="opacity:.72;font-size:12px;margin-top:3px">الأحمر يبدأ — لاعبان على نفس الجهاز</div></div>
      <div style="display:flex;gap:8px"><button id="ckNew" style="border:0;border-radius:12px;padding:9px 12px;background:#d9a441;color:#111;font-weight:800">لعبة جديدة</button><button id="ckClose" style="border:0;border-radius:12px;padding:9px 12px;background:#26364b;color:#fff">رجوع</button></div>
    </div>
    <div style="width:min(94vw,560px);margin:18px auto;padding:0 8px 28px">
      <div id="ckScore" style="display:flex;justify-content:space-between;margin-bottom:10px;font-weight:800"><span>🔴 الأحمر: <b id="ckRed">12</b></span><span>⚫ الأسود: <b id="ckBlack">12</b></span></div>
      <div id="ckBoard" style="display:grid;grid-template-columns:repeat(8,1fr);width:100%;aspect-ratio:1;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.1)"></div>
      <p style="font-size:12px;opacity:.65;text-align:center;margin:12px 0 0">الأخذ إجباري • القفزات المتعددة مدعومة • الترقية إلى ملك مدعومة</p>
    </div>`;
  document.body.appendChild(root);

  let board=makeBoard(), turn='red', selected=null, forcedPiece=null, finished=false;
  const boardEl=root.querySelector('#ckBoard'), statusEl=root.querySelector('#ckStatus');
  const redEl=root.querySelector('#ckRed'), blackEl=root.querySelector('#ckBlack');

  function count(color){let n=0;for(const row of board)for(const p of row)if(p?.color===color)n++;return n;}
  function finishIfNeeded(){
    const opponent=turn==='red'?'black':'red';
    if(count(opponent)===0 || allMoves(opponent).length===0){finished=true;statusEl.textContent=`🏆 ${turn==='red'?'الأحمر':'الأسود'} فاز!`;return true;}
    return false;
  }
  function allMoves(color){const out=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]?.color===color)out.push(...legalMovesForPiece(board,r,c,color));return out;}

  function render(){
    boardEl.innerHTML=''; redEl.textContent=count('red'); blackEl.textContent=count('black');
    const forced=allCaptures(board,turn);
    if(!finished) statusEl.textContent=forcedPiece?`🔴/⚫ ${turn==='red'?'الأحمر':'الأسود'} — يجب متابعة الأخذ بالقطعة نفسها`:forced.length?`دور ${turn==='red'?'الأحمر':'الأسود'} — الأخذ إجباري`:`دور ${turn==='red'?'الأحمر':'الأسود'}`;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
      const cell=document.createElement('button'); cell.type='button';
      const dark=(r+c)%2===1; cell.style.cssText=`border:0;margin:0;padding:0;position:relative;display:flex;align-items:center;justify-content:center;background:${dark?'#8b5a3c':'#ead0a2'};min-width:0;`;
      if(selected && selected.r===r && selected.c===c) cell.style.boxShadow='inset 0 0 0 4px #f4c95d';
      const p=board[r][c];
      if(p){const piece=document.createElement('span');piece.textContent=p.king?'♛':'';piece.style.cssText=`width:70%;height:70%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:clamp(14px,5vw,30px);font-weight:900;background:${p.color==='red'?'#d84a4a':'#151a22'};color:${p.color==='red'?'#fff':'#f0f0f0'};box-shadow:inset 0 3px 4px rgba(255,255,255,.18),0 4px 8px rgba(0,0,0,.35);`;
        if(p.color===turn&&!finished) piece.style.cursor='pointer'; cell.appendChild(piece);
      }
      cell.onclick=()=>tap(r,c); boardEl.appendChild(cell);
    }
  }

  function tap(r,c){
    if(finished) return;
    const p=board[r][c];
    if(selected){
      const moves=legalMovesForPiece(board,selected.r,selected.c,turn);
      const move=moves.find(m=>m.to.r===r&&m.to.c===c);
      if(move){execute(move);return;}
    }
    if(p?.color===turn && (!forcedPiece || (forcedPiece.r===r&&forcedPiece.c===c))){
      selected={r,c}; render();
    }
  }

  function execute(move){
    const p=board[move.from.r][move.from.c]; board[move.to.r][move.to.c]={...p}; board[move.from.r][move.from.c]=null;
    if(move.capture) board[move.capture.r][move.capture.c]=null;
    let promoted=false;
    if(!p.king && ((p.color==='red'&&move.to.r===7)||(p.color==='black'&&move.to.r===0))){board[move.to.r][move.to.c].king=true;promoted=true;}
    selected=null;
    const more=!promoted && move.capture && capturesForPiece(board,move.to.r,move.to.c).length>0;
    if(more){forcedPiece={r:move.to.r,c:move.to.c};selected=forcedPiece;}
    else {forcedPiece=null;turn=turn==='red'?'black':'red';}
    finishIfNeeded(); render();
  }

  root.querySelector('#ckNew').onclick=()=>{board=makeBoard();turn='red';selected=null;forcedPiece=null;finished=false;render();};
  root.querySelector('#ckClose').onclick=()=>root.remove();
  render();
  return root;
}
