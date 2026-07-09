/* BlockMir — günlük ödül kutusu + meydan okuma modları */

window.BlockMirDaily = (function(){

  const MODES = [

    { id:'blitz', weekday:1, icon:'⚡' },

    { id:'single', weekday:2, icon:'🧩' },

    { id:'lockboard', weekday:3, icon:'🔒' },

    { id:'night', weekday:4, icon:'🌙' },

    { id:'mirror', weekday:5, icon:'🪞' },

    { id:'shrink', weekday:6, icon:'📐' },

    { id:'nightmirror', weekday:0, icon:'🌓' }

  ];

  const MODE_IDS = MODES.map(m=>m.id);

  const BLITZ_SEC = 75;

  const SHRINK_EVERY = 8;

  const LOCK_COUNT = 5;



  /* Her aile = sadece o şeklin 4 yönü (L, küçük L, Z, T) */

  const SINGLE_FAMILIES = {

    L: [

      [[0,0],[0,1],[0,2],[1,2]],

      [[0,0],[1,0],[2,0],[0,1]],

      [[0,0],[1,0],[1,1],[1,2]],

      [[2,0],[0,1],[1,1],[2,1]]

    ],

    smallL: [

      [[0,0],[1,0],[0,1]],

      [[0,0],[0,1],[1,1]],

      [[1,0],[0,1],[1,1]],

      [[0,0],[1,0],[1,1]]

    ],

    z: [

      [[0,0],[1,0],[1,1],[2,1]],

      [[1,0],[2,0],[0,1],[1,1]],

      [[0,0],[0,1],[1,1],[1,2]],

      [[1,0],[0,1],[1,1],[0,2]]

    ],

    T: [

      [[0,0],[1,0],[2,0],[1,1]],

      [[1,0],[0,1],[1,1],[1,2]],

      [[0,1],[1,0],[1,1],[2,1]],

      [[1,0],[1,1],[2,1],[1,2]]

    ]

  };

  const SINGLE_FAMILY_KEYS = ['L','smallL','z','T'];



  const CHEST_POOL = [

    { type:'coins', min:200, max:450, weight:42 },

    { type:'coins', min:480, max:900, weight:20 },

    { type:'coins', min:950, max:1400, weight:6 },

    { type:'hint', amount:2, weight:12 },

    { type:'hint', amount:3, weight:5 },

    { type:'undo', amount:2, weight:10 },

    { type:'undo', amount:3, weight:5 },

    { type:'cosmetic', tier:'rare', weight:10 },

    { type:'cosmetic', tier:'epic', weight:6 },

    { type:'cosmetic', tier:'legendary', weight:2.2 },

    { type:'cosmetic', tier:'mythic', weight:0.6 }

  ];



  function modeByWeekday(d){ return MODES.find(m=>m.weekday===d) || MODES[0]; }

  function todayMode(){ return modeByWeekday(new Date().getDay()); }

  function getMode(id){ return MODES.find(m=>m.id===id); }

  function modeHas(mod, flag){

    if(mod.id==='nightmirror') return flag==='night'||flag==='mirror';

    return mod.id===flag || mod.id.includes(flag);

  }

  function pickSingleFamily(seed){

    const key=SINGLE_FAMILY_KEYS[Math.abs(seed)%SINGLE_FAMILY_KEYS.length];

    const variants=SINGLE_FAMILIES[key];

    return { key, shape:variants[0].map(p=>[p[0],p[1]]) };

  }



  /* rng: () => 0..1 — oyuncuya özel PRNG; CHEST_POOL weight oranlarına göre seçim */
  function rollChest(rng, pickCosmetic, opts){
    opts=opts||{};
    const tierBoost=opts.luckBoost?{rare:1.75,epic:2.15,legendary:2.85,mythic:3.5}:null;
    if(typeof rng!=='function'){
      const legacy=Math.abs(rng|0);
      rng=()=>((legacy=(legacy*1103515245+12345)>>>0)/4294967296);
    }
    const pool=tierBoost?CHEST_POOL.map(item=>{
      if(item.type!=='cosmetic'||!tierBoost[item.tier]) return item;
      return {...item,weight:item.weight*tierBoost[item.tier]};
    }):CHEST_POOL;
    const total=pool.reduce((s,x)=>s+x.weight,0);
    let r=rng()*total;
    for(const item of pool){
      r-=item.weight;
      if(r<=0){
        if(item.type==='coins'){
          const span=item.max-item.min+1;
          return { type:'coins', amount:item.min+Math.floor(rng()*span) };
        }
        if(item.type==='hint') return { type:'hint', amount:item.amount };
        if(item.type==='undo') return { type:'undo', amount:item.amount };
        if(item.type==='cosmetic') return pickCosmetic(item.tier, Math.floor(rng()*0x7fffffff));
      }
    }
    const fb=pool[0];
    const span=fb.max-fb.min+1;
    return { type:'coins', amount:fb.min+Math.floor(rng()*span) };
  }



  return { MODES, MODE_IDS, BLITZ_SEC, SHRINK_EVERY, LOCK_COUNT, SINGLE_FAMILIES, SINGLE_FAMILY_KEYS, modeByWeekday, todayMode, getMode, modeHas, pickSingleFamily, rollChest };

})();

