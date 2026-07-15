(() => {
  const $ = (id) => document.getElementById(id);
  const screens = ['screenMenu','screenClassic','screenGame','screenAdventure','screenCustomize','screenDaily','screenAchievements','screenStats','screenSettings'];
  const LS = 'blockmir_save_';
  const RUN_KEY = LS + 'activeRun';
  const APP_VERSION = '1.1.5';
  const DEBUG_UNLOCK_ALL = false;
  const TUTORIAL_VERSION = 11;
  const ADVENTURE_MAX_LEVEL = 100;
  const ADVENTURE_WORLD_SIZE = 10;
    const I18N = window.BlockMirI18n;
  const SUPPORTED_LANGS = (I18N.LANGS || [{id:'tr'},{id:'en'}]).map(l => l.id);
  function langMeta(id){ return (I18N.LANGS || []).find(l => l.id === id) || {id:'tr',flag:'🇹🇷',native:'Türkçe',rtl:false}; }
  function isTurkish(){ return data.lang === 'tr'; }
  function usesEnglishCatalog(){ return !isTurkish(); }
  const BD = window.BlockMirDaily;
  const { colors, shapes, themes, blockSkins, boosters, effects, adventureWorlds, starRewards, MARKET_SET_NAMES, EN_BY_ID } = window.BlockMirCatalog;
  const LEGACY_LS = ['blockmir_st5_','blockmir_st6_','blockmir_st4_','blockmir_st3_','blockmir_st2_','blockmir_st1_','blockmir_'];
  function readStore(key, fallback=''){
    const fresh = localStorage.getItem(LS + key);
    if(fresh !== null) return fresh;
    for(const p of LEGACY_LS){ const v = localStorage.getItem(p + key); if(v !== null) return v; }
    return fallback;
  }
  function readJson(key, fallback){
    try { return JSON.parse(readStore(key, fallback)); }
    catch(e){ try { return JSON.parse(fallback); } catch(_) { return {}; } }
  }
  function readNumber(key, defaultValue){
    const raw = readStore(key, String(defaultValue));
    if(raw === null || raw === undefined || raw === '') return defaultValue;
    const value = Number(raw);
    return Number.isFinite(value) ? value : defaultValue;
  }
    const legacyBest = readNumber('best',0);
  const legacyAdventure = Math.max(1, readNumber('adventure',1));
  const data = {
    best8:readNumber('best8', legacyBest),
    best10:readNumber('best10',0),
    best:legacyBest,
    coins:readNumber('coins',250),
    adventureMax:readNumber('adventureMax', legacyAdventure),
    adventure:legacyAdventure,
    advStars: readJson('advStars','{}'),
    advTimes: readJson('advTimes','{}'),
    theme:readStore('theme','mir')||'mir',
    skin:readStore('skin','classic')||'classic',
    effect:readStore('effect','star')||'star',
    owned: readJson('owned','{"mir":true,"night":true,"classic":true}'),
    customPhoto: readStore('photo','')||'',
    blur:readNumber('blur',0),
    dark:readNumber('dark',0),
    hints:readNumber('hints',1),
    undos:readNumber('undos',1),
    daily: readStore('daily','')||'',
    dailyChestReward: readJson('dailyChestReward','null'),
    dailyBest: readJson('dailyBest','{}'),
    dailyModsUnlockAll: readStore('dailyModsUnlockAll','0')==='1',
    moves:readNumber('moves',0),
    lines:readNumber('lines',0),
    bestCombo:readNumber('bestCombo',0),
    games:readNumber('games',0),
    classic8Games:readNumber('classic8Games',0),
    classic10Games:readNumber('classic10Games',0),
    playerLevel:readNumber('playerLevel',1),
    xp:readNumber('xp',0),
    levelRewards: readJson('levelRewards','{}'),
    starRewards: readJson('starRewards','{}'),
    claimed: readJson('claimed','{}'),
    tutorial: readStore('tutorial','0')==='1',
    tutorialVersion: readNumber('tutorialVersion', 0),
    langChosen: readStore('langChosen','0')==='1',
    recordTrollIndex:readNumber('recordTrollIndex',0),
    music: readStore('music','1')!=='0',
    sound: readStore('sound','1')!=='0',
    musicVol: readNumber('musicVol', 70),
    sfxVol: readNumber('sfxVol', 100),
    vibrate: readStore('vibrate','1')!=='0',
    graphics: readStore('graphics','max') || 'max',
    lang: SUPPORTED_LANGS.includes(readStore('lang','tr')) ? readStore('lang','tr') : 'tr',
    colorblind: readStore('colorblind','0')==='1',
    chestSalt: readStore('chestSalt','')||'',
    dailyStreak: readNumber('dailyStreak', 0),
    dailyStreakLast: readStore('dailyStreakLast','')||'',
    dailyStreakClaimed: readStore('dailyStreakClaimed','')||'',
    dailyStreakLuckUntil: readStore('dailyStreakLuckUntil','')||'',
    dailyTrophies: readJson('dailyTrophies','{}'),
    firstPlayDone: readStore('firstPlayDone','0')==='1'
  };
  if(!['auto','max','high','medium','low','ultra'].includes(data.graphics)) data.graphics='auto';
  if(!SUPPORTED_LANGS.includes(data.lang)) data.lang='tr';
  if(!data.langChosen && (data.games > 0 || data.tutorialVersion > 0 || data.tutorial)) data.langChosen = true;
  if(readStore('visualPolishV2','0')!=='1'){
    if(data.blur > 0) data.blur = 0;
    if(data.dark > 14) data.dark = 12;
    try{ localStorage.setItem(LS+'visualPolishV2','1'); }catch(_){}
  }
  if(readStore('visualPolishV3','0')!=='1'){
    data.blur = 0;
    data.dark = 0;
    try{ localStorage.setItem(LS+'visualPolishV3','1'); }catch(_){}
  }
  if(readStore('musicVolDefault70','0')!=='1'){
    data.musicVol = 70;
    try{ localStorage.setItem(LS+'musicVolDefault70','1'); localStorage.setItem(LS+'musicVol','70'); }catch(_){}
  }
  if(data.adventureMax < data.adventure) data.adventureMax = data.adventure;
  data.adventureMax = Math.max(1, Math.min(ADVENTURE_MAX_LEVEL, data.adventureMax));
  data.adventure = data.adventureMax;
  if(DEBUG_UNLOCK_ALL){
    data.dailyModsUnlockAll = true;
    data.adventureMax = ADVENTURE_MAX_LEVEL;
    data.adventure = ADVENTURE_MAX_LEVEL;
  }
  if(!data.chestSalt){
    const bytes=new Uint32Array(2);
    if(typeof crypto!=='undefined'&&crypto.getRandomValues) crypto.getRandomValues(bytes);
    else{ bytes[0]=(Math.random()*0xffffffff)>>>0; bytes[1]=Date.now()>>>0; }
    data.chestSalt=bytes[0].toString(16)+bytes[1].toString(16)+Math.random().toString(36).slice(2,10);
    try{ localStorage.setItem(LS+'chestSalt',data.chestSalt); }catch(_){}
  }

  function ownedKey(type,item){ return (type==='themes'?'theme:':type==='blocks'?'block:':type==='effects'?'effect:':'booster:') + item.id; }
  function isOwned(item,type){ return item.free || item.price===0 || !!data.owned[ownedKey(type,item)] || !!data.owned[item.id]; }
  function markOwned(item,type){ data.owned[ownedKey(type,item)] = true; data.owned[item.id] = true; }
  function ownedCount(){
    let n=0;
    themes.forEach(t=>{ if(isOwned(t,'themes')) n++; });
    blockSkins.forEach(s=>{ if(isOwned(s,'blocks')) n++; });
    effects.forEach(e=>{ if(isOwned(e,'effects')) n++; });
    boosters.forEach(b=>{ if(isOwned(b,'boosters')) n++; });
    return n;
  }
  themes.forEach(t=>{ if(t.free || data.owned[t.id]) data.owned[ownedKey('themes',t)] = true; });
  blockSkins.forEach(s=>{ if(s.price===0 || data.owned[s.id]) data.owned[ownedKey('blocks',s)] = true; });
  effects.forEach(e=>{ if(e.price===0 || data.owned[e.id]) data.owned[ownedKey('effects',e)] = true; });
  function tx(key, vars={}){
    const pack=I18N[data.lang] || I18N.en || I18N.tr;
    let text=pack[key] ?? I18N.en?.[key] ?? I18N.tr[key] ?? key;
    Object.keys(vars).forEach(k=>{ text=String(text).split('{'+k+'}').join(vars[k]); });
    return text;
  }
  function catName(item, type){
    const key=`cat_${type}_${item.id}_name`;
    const t=tx(key);
    if(t!==key) return t;
    return isTurkish() ? item.name : (EN_BY_ID[type]?.[item.id]?.name || item.name);
  }
  function catDesc(item, type){
    const key=`cat_${type}_${item.id}_desc`;
    const t=tx(key);
    if(t!==key) return t;
    return isTurkish() ? (item.desc||'') : (EN_BY_ID[type]?.[item.id]?.desc || item.desc||'');
  }
  function achTitle(a){
    const key=`ach_${a.id}_title`;
    const t=tx(key);
    if(t!==key) return t;
    const en=EN_BY_ID.achievements[a.id]?.title;
    return data.lang==='tr' ? (a.title||en||'') : (en||a.title||'');
  }
  function achDesc(a){
    const key=`ach_${a.id}_desc`;
    const t=tx(key);
    if(t!==key) return t;
    const en=EN_BY_ID.achievements[a.id]?.desc;
    return data.lang==='tr' ? (a.desc||en||'') : (en||a.desc||'');
  }
  function starRewardLabel(r){
    const key=`star_${r.id}_name`;
    const t=tx(key);
    if(t!==key) return t;
    return isTurkish() ? r.name : (EN_BY_ID.starRewards[r.id]?.name || r.name);
  }

  function worldField(world, field){
    if(!world) return '';
    const key=`world_${world.id}_${field}`;
    const t=tx(key);
    if(t!==key) return t;
    if(isTurkish()) return world[field]||'';
    return world[field+'En'] || world[field] || '';
  }
  function setText(id,key){
    const el=$(id);
    if(el) el.textContent=tx(key);
  }
  function setLabelText(controlId,key){
    const el=$(controlId);
    if(!el || !el.parentNode) return;
    const node=[...el.parentNode.childNodes].find(n=>n.nodeType===Node.TEXT_NODE && n.nodeValue.trim());
    if(node) node.nodeValue=tx(key)+' ';
  }
  function setButtonText(id,key){
    const el=$(id);
    if(el) el.textContent=tx(key);
  }
  let customizeTab='theme';
  function setCustomizeTab(tab){
    customizeTab=tab==='market'?'market':'theme';
    document.querySelectorAll('.customize-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===customizeTab));
    const themePanel=$('customizeThemePanel'), marketPanel=$('customizeMarketPanel');
    const marketSubTabs=$('customizeMarketSubTabs');
    if(themePanel) themePanel.classList.toggle('active', customizeTab==='theme');
    if(marketPanel) marketPanel.classList.toggle('active', customizeTab==='market');
    if(marketSubTabs){
      const showMarket=customizeTab==='market';
      marketSubTabs.classList.toggle('hidden', !showMarket);
      marketSubTabs.setAttribute('aria-hidden', showMarket?'false':'true');
    }
    const coinPill=$('customizeCoinPill'), resetBtn=$('resetThemeBtn');
    if(coinPill) coinPill.classList.toggle('hidden', customizeTab!=='market');
    if(resetBtn) resetBtn.classList.toggle('hidden', customizeTab!=='theme');
    if(customizeTab==='theme') renderThemes();
    else renderMarket();
    const sc=$('customizeScroll'); if(sc) sc.scrollTop=0;
  }
  function showCustomize(tab){
    if(tab) setCustomizeTab(tab);
    show('screenCustomize');
  }
  function applyMenuButtonLanguage(){
    const simpleButtons=[
      ['classicBtn','classic']
    ];
    simpleButtons.forEach(([id,key])=>{
      const el=$(id);
      if(el) el.textContent=tx(key);
    });
    const daily=$('dailyBtn');
    if(daily){
      let title=$('dailyBtnTitle')||daily.querySelector('span');
      let sub=$('dailyBtnSub')||daily.querySelector('small');
      if(!title || !sub){
        daily.textContent='';
        title=document.createElement('span');
        title.id='dailyBtnTitle';
        sub=document.createElement('small');
        sub.id='dailyBtnSub';
        daily.append(title, sub);
      }
      title.textContent=tx('dailyMenuTitle');
      sub.textContent=tx('dailyMenuSub');
    }
    const adv=$('adventureBtn');
    if(adv){
      let title=adv.querySelector('span');
      let progress=$('advSmall');
      if(!title || !progress){
        adv.textContent='';
        title=document.createElement('span');
        progress=document.createElement('small');
        progress.id='advSmall';
        adv.append(title, progress);
      }
      title.textContent=tx('adventure');
      progress.textContent=Math.min(data.adventureMax||1,ADVENTURE_MAX_LEVEL)+'/'+ADVENTURE_MAX_LEVEL;
    }
  }
  function setOptionTexts(){
    const options=[
      ['auto','graphicsAuto'],['max','graphicsMax'],['high','graphicsHigh'],
      ['medium','graphicsMedium'],['low','graphicsLow'],['ultra','graphicsUltra']
    ];
    ['graphicsSelect','pauseGraphicsSelect'].forEach(id=>{
      const select=$(id);
      if(!select) return;
      options.forEach(([value,key])=>{
        const opt=[...select.options].find(o=>o.value===value);
        if(opt) opt.textContent=tx(key);
      });
    });
  }
  function renderLanguagePicker(){
    const grid=$('langGrid'), panel=$('langGridPanel'), currentBtn=$('langCurrentBtn');
    const meta=langMeta(data.lang);
    if($('langCurrentFlag')) $('langCurrentFlag').textContent=meta.flag;
    if($('langCurrentText')) $('langCurrentText').textContent=meta.native;
    if($('languageDesc')) $('languageDesc').textContent=tx('languageSelected',{name:meta.native});
    if(!grid) return;
    if(!grid.dataset.built){
      grid.innerHTML='';
      (I18N.LANGS || []).forEach(lang=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.dataset.lang=lang.id;
        btn.setAttribute('role','option');
        btn.setAttribute('aria-label', lang.native);
        btn.innerHTML=`<span class="lang-grid-flag">${lang.flag}</span><span class="lang-grid-name">${lang.native}</span><span class="lang-grid-check" aria-hidden="true">✓</span>`;
        btn.onclick=()=>{
          if(!SUPPORTED_LANGS.includes(lang.id)) return;
          data.lang=lang.id;
          panel?.classList.add('hidden');
          if(currentBtn) currentBtn.setAttribute('aria-expanded','false');
          applyLanguage();
          save(true);
          refreshCounters();
          renderMarket();
          renderStats();
          if($('screenDaily')?.classList.contains('active')) renderDaily();
          toast(tx('language')+': '+langMeta(data.lang).native);
        };
        grid.appendChild(btn);
      });
      grid.dataset.built='1';
      if(currentBtn && panel){
        currentBtn.onclick=()=>{
          const open=panel.classList.toggle('hidden');
          currentBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
        };
      }
    }
    grid.querySelectorAll('button[data-lang]').forEach(btn=>{
      const on=btn.dataset.lang===data.lang;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function updateLanguageFlags(){ renderLanguagePicker(); }
  function syncGameOverContinueLabel(){
    const btn=$('continueBtn'); if(!btn) return;
    if(mode==='adventure') btn.textContent=tx('gameOverContinueMap');
    else if(mode==='daily') btn.textContent=tx('gameOverContinueDaily');
    else btn.textContent=tx('gameOverContinueOk');
    syncReviveButton();
  }
  function reviveBaseCost(){ return mode==='classic10' ? 180 : 120; }
  function reviveCost(){ return Math.min(600, reviveBaseCost()+Math.floor(score/400)*40); }
  function canOfferCoinRevive(){ return !reviveUsed && ['classic8','classic10'].includes(mode); }
  function boardFillRatio(){
    const ps=(mode==='daily'&&dailyModActive('shrink'))?(dailyPlayableSize||8):boardSize;
    let filled=0;
    for(let y=0;y<ps;y++) for(let x=0;x<ps;x++) if(grid[y][x]) filled++;
    return ps*ps ? filled/(ps*ps) : 0;
  }
  function applyReviveBonusClear(){
    const ps=(mode==='daily'&&dailyModActive('shrink'))?(dailyPlayableSize||8):boardSize;
    let bestRow=-1, bestRowCount=0, bestCol=-1, bestColCount=0;
    for(let y=0;y<ps;y++){
      let c=0; for(let x=0;x<ps;x++) if(grid[y][x]) c++;
      if(c>bestRowCount){ bestRowCount=c; bestRow=y; }
    }
    for(let x=0;x<ps;x++){
      let c=0; for(let y=0;y<ps;y++) if(grid[y][x]) c++;
      if(c>bestColCount){ bestColCount=c; bestCol=x; }
    }
    if(bestRowCount<1 && bestColCount<1) return false;
    if(bestRowCount>=bestColCount){
      for(let x=0;x<boardSize;x++) grid[bestRow][x]=null;
    }else{
      for(let y=0;y<boardSize;y++) grid[bestCol][y]=null;
    }
    return true;
  }
  function syncReviveButton(){
    const btn=$('reviveBtn');
    if(!btn) return;
    const show=gameOverPending && canOfferCoinRevive();
    btn.classList.toggle('hidden', !show);
    if(!show) return;
    const cost=reviveCost();
    const label=$('reviveBtnLabel')||btn.querySelector('span');
    const sub=$('reviveBtnSub')||btn.querySelector('small');
    if(label) label.textContent=tx('reviveBtn',{n:cost});
    if(sub) sub.textContent=tx('reviveHint');
    const poor=data.coins<cost;
    btn.disabled=poor;
    btn.classList.toggle('revive-disabled', poor);
  }
  function finalizeGameOver(){
    if(!gameOverPending) return;
    gameOverPending=false;
    busy=false;
    const reward=Math.floor(score/80), xpGain=Math.floor(score/55)+15;
    data.coins+=reward;
    addXP(xpGain);
    data.games++;
    if(mode==='classic8') data.classic8Games++;
    if(mode==='classic10') data.classic10Games++;
    clearRunState();
    save(true);
    syncReviveButton();
    maybeRequestReview();
    $('screenGameOver')?.classList.remove('active');
  }
  async function tryRevive(source='coin'){
    if(source!=='coin') return;
    if(!gameOverPending || !canOfferCoinRevive()) return toast(tx('reviveUsed'));
    const cost=reviveCost();
    if(data.coins<cost) return toast(tx('notEnoughCoins'));
    data.coins-=cost;
    reviveUsed=true;
    gameOverPending=false;
    $('screenGameOver').classList.remove('active');
    pieces=[newPiece(),newPiece(),newPiece()];
    undoSnap=null;
    combo=0;
    chainReady=false;
    const bonusClear=boardFillRatio()>=0.7 && applyReviveBonusClear();
    busy=false;
    renderAll();
    if(mode==='adventure') startAdventureTimer();
    save(true);
    saveRunState();
    playTone('coin');
    vibrate('reward');
    toast(bonusClear?tx('reviveBonusClear'):tx('reviveTitle'));
    refreshCounters();
    if(!hasMove()) gameOver();
  }
  // BLOCKMIR_REVIVE_AD: ileride tryRevive('ad') — ödüllü reklam ile devam
  function applyLanguage(){
    if(!SUPPORTED_LANGS.includes(data.lang)) data.lang='tr';
    const meta=langMeta(data.lang);
    document.documentElement.lang = data.lang;
    document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';
    document.body.dataset.lang = data.lang;
    renderLanguagePicker();
    setOptionTexts();
    applyMenuButtonLanguage();
    if($('menuTagline')) $('menuTagline').textContent=tx('menuTagline');
    if($('menuGroupPlay')) $('menuGroupPlay').textContent=tx('menuGroupPlay');
    if($('menuGroupDaily')) $('menuGroupDaily').textContent=tx('menuGroupDaily');
    if($('customizeTitle')) $('customizeTitle').textContent=tx('customizeTitle');
    if($('customizeTabThemeBtn')) $('customizeTabThemeBtn').textContent=tx('customizeTabTheme');
    if($('customizeTabMarketBtn')) $('customizeTabMarketBtn').textContent=tx('customizeTabMarket');
    if($('blurLabel')) $('blurLabel').textContent=tx('blur');
    if($('darkLabel')) $('darkLabel').textContent=tx('dark');
    const map={
      advTimerTitle:'adventureTitle',
      photoPickBtn:'choosePhoto', clearPhotoBtn:'defaultTheme',
      againBtn:'again', menuBtn:'menu', tutorialSkipBtn:'tutSkip',
      privacyCloseBtn:'privacyClose', photoShortcut:'select', privacyBtn:'open', reviewBtn:'open', tutorialOpenBtn:'open'
    };
    Object.entries(map).forEach(([id,key])=>setButtonText(id,key));
    const resumeTitle=document.querySelector('#resumeBtn .resume-title'); if(resumeTitle) resumeTitle.textContent=tx('resumeTitle');
    setText('resumeSmall','resumeDefault');
    setText('dailyHubTitle','dailyHub');
    if(!$('screenGameOver')?.classList.contains('active')) setText('overTitle','gameOver');
    const heads=[
      ['screenClassic','classicTitle'],['screenAdventure','adventureTitle'],['screenCustomize','customizeTitle'],
      ['screenDaily','dailyHub'],['screenAchievements','achievementsTitle'],
      ['screenStats','statsTitle'],['screenSettings','settingsTitle']
    ];
    heads.forEach(([screen,key])=>{ const h=document.querySelector('#'+screen+' .panel-head h2'); if(h) h.textContent=tx(key); });
    const choices=[
      ['classic8Btn','classic8','classic8Desc'],['classic10Btn','classic10','classic10Desc']
    ];
    choices.forEach(([id,title,desc])=>{
      const btn=$(id); if(!btn) return;
      const strong=btn.querySelector('strong'), span=btn.querySelector('span');
      if(strong) strong.textContent=tx(title);
      if(span) span.textContent=tx(desc);
      const em=btn.querySelector('em');
      if(em){
        const b=em.querySelector('b');
        if(em.firstChild) em.firstChild.nodeValue=tx('maxScore')+': ';
        else em.insertBefore(document.createTextNode(tx('maxScore')+': '), b || null);
        if(b) em.appendChild(b);
      }
    });
    const actionMap=[['undoBtn','undo'],['hintBtn','hint'],['restartBtn','restart']];
    actionMap.forEach(([id,key])=>{ const el=$(id)?.querySelector('span'); if(el) el.textContent=tx(key); });
    const restartSmall=$('restartBtn')?.querySelector('small'); if(restartSmall) restartSmall.textContent=tx('startOver');
    setLabelText('photoShortcut','select');
    setLabelText('reviewBtn','open');
    setLabelText('privacyBtn','open');
    setLabelText('tutorialOpenBtn','open');
    if($('tutorialLabel')) $('tutorialLabel').textContent=tx('howTo');
    if($('musicTitle')) $('musicTitle').textContent=tx('music');
    if($('soundTitle')) $('soundTitle').textContent=tx('sound');
    if($('vibrateTitle')) $('vibrateTitle').textContent=tx('vibrate');
    if($('graphicsTitle')) $('graphicsTitle').textContent=tx('graphics');
    if($('musicDesc')) $('musicDesc').textContent=tx('musicDesc');
    if($('soundDesc')) $('soundDesc').textContent=tx('soundDesc');
    if($('musicVolLabel')) $('musicVolLabel').textContent=tx('musicVolLabel');
    if($('sfxVolLabel')) $('sfxVolLabel').textContent=tx('sfxVolLabel');
    if($('vibrateDesc')) $('vibrateDesc').textContent=tx('vibrateDesc');
    if($('graphicsDesc')) $('graphicsDesc').textContent=tx('graphicsDesc');
    if($('languageTitle')) $('languageTitle').textContent=tx('language');
    if($('languageDesc')) $('languageDesc').textContent=tx('languageDesc');
    if($('photoLabel')) $('photoLabel').textContent=tx('boardPhoto');
    if($('reviewLabel')) $('reviewLabel').textContent=tx('reviewGame');
    if($('privacyLabel')) $('privacyLabel').textContent=tx('privacy');
    if($('photoShortcut')) $('photoShortcut').textContent=tx('select');
    if($('reviewBtn')) $('reviewBtn').textContent=tx('open');
    if($('privacyBtn')) $('privacyBtn').textContent=tx('open');
    const tabs=[['themes','tabThemes'],['blocks','tabBlocks'],['effects','tabEffects'],['boosters','tabBoosters']];
    tabs.forEach(([tab,key])=>{ document.querySelectorAll(`.market-tabs button[data-tab="${tab}"]`).forEach(b=>{ b.textContent=tx(key); }); });
    if($('screenTutorial')?.classList.contains('active')) renderTutorial();
    const privacy=$('screenPrivacy');
    if(privacy){
      const h=privacy.querySelector('h2'); if(h) h.textContent=tx('privacyTitle');
      const paras=privacy.querySelectorAll('.privacy-text p');
      ['privacyP1','privacyP2','privacyP3','privacyP4','privacyP5'].forEach((key,i)=>{ if(paras[i]) paras[i].textContent=tx(key); });
    }
    refreshLevelUI();
    if($('navAdFreeLabel')) $('navAdFreeLabel').textContent=tx('navAdFreeBadge');
    if($('navAdFreeBadge')) $('navAdFreeBadge').setAttribute('aria-label', tx('navAdFreeBadge'));
    [['navCustomize','navCustomize'],['navAch','navAch'],['navStats','navStats']].forEach(([id,key])=>{ const btn=$(id); if(!btn) return; const lbl=btn.querySelector('.nav-label'); if(lbl) lbl.textContent=tx(key); });
    syncGameOverContinueLabel();
    if($('colorblindTitle')) $('colorblindTitle').textContent=tx('colorblindTitle');
    if($('colorblindDesc')) $('colorblindDesc').textContent=tx('colorblindDesc');
    if($('pauseTitle')) $('pauseTitle').textContent=tx('pauseTitle');
    if($('pauseSettingsLabel')) $('pauseSettingsLabel').textContent=tx('pauseSettingsLabel');
    if($('pauseResumeBtn')) $('pauseResumeBtn').textContent=tx('continue');
    if($('pauseRestartBtn')) $('pauseRestartBtn').textContent=tx('again');
    if($('pauseMenuBtn')) $('pauseMenuBtn').textContent=tx('menu');
    if($('pauseMusicTitle')) $('pauseMusicTitle').textContent=tx('music');
    if($('pauseSoundTitle')) $('pauseSoundTitle').textContent=tx('sound');
    if($('pauseVibrateTitle')) $('pauseVibrateTitle').textContent=tx('vibrate');
    if($('pauseGraphicsTitle')) $('pauseGraphicsTitle').textContent=tx('graphics');
    if($('settingsVersion')) $('settingsVersion').textContent=tx('version')+' '+APP_VERSION;
    if($('gameOverScoreLabel')) $('gameOverScoreLabel').textContent=tx('scoreLabel');
    if($('navCustomize')) $('navCustomize').setAttribute('aria-label', tx('navCustomize'));
    if($('navAch')) $('navAch').setAttribute('aria-label', tx('navAch'));
    if($('navStats')) $('navStats').setAttribute('aria-label', tx('navStats'));
    if($('dailyChestBox')) $('dailyChestBox').setAttribute('aria-label', tx('dailyChestTap'));
    if($('screenAdventure')?.classList.contains('active')) renderAdventure(false);
    if($('screenDaily')?.classList.contains('active')) renderDaily();
    updateResumeButton();
    syncSettingToggles();
  }
  function syncToggleCard(btnId, cardId, on){
    const btn=$(btnId), card=cardId?$(cardId):null;
    if(btn){ btn.classList.toggle('on', !!on); btn.setAttribute('aria-pressed', on?'true':'false'); }
    if(card) card.classList.toggle('active', !!on);
  }
  function syncVolumeUi(){
    const mv=$('musicVolRange'), mo=$('musicVolOut'), sv=$('sfxVolRange'), so=$('sfxVolOut');
    if(mv){ mv.value=String(data.musicVol||70); if(mo) mo.textContent=(data.musicVol||70)+'%'; }
    if(sv){ sv.value=String(data.sfxVol||100); if(so) so.textContent=(data.sfxVol||100)+'%'; }
  }
  function syncSettingToggles(){
    syncToggleCard('musicToggleBtn','musicCard',data.music);
    syncToggleCard('soundToggleBtn','soundCard',data.sound);
    syncToggleCard('vibrateToggleBtn','vibrateCard',data.vibrate);
    syncToggleCard('pauseMusicToggleBtn','pauseMusicCard',data.music);
    syncToggleCard('pauseSoundToggleBtn','pauseSoundCard',data.sound);
    syncToggleCard('pauseVibrateToggleBtn','pauseVibrateCard',data.vibrate);
    syncColorblindUI();
    syncVolumeUi();
    if($('graphicsSelect')) $('graphicsSelect').value=data.graphics||'max';
    if($('pauseGraphicsSelect')) $('pauseGraphicsSelect').value=data.graphics||'max';
    if($('screenDaily')?.classList.contains('active')) renderDaily();
  }
  function syncColorblindUI(){
    syncToggleCard('colorblindToggleBtn','colorblindCard',data.colorblind);
  }
  let grid, pieces, score, mode='classic8', target=0, linesDone=0, combo=0, chainReady=false, dragging=null, undoSnap=null, busy=false, recordNotified=false, boardSize=8, currentAdventureLevel=1, selectedAdventureLevel=1, selectedAdventureWorldIdx=null, adventureScrollPin=false, levelMoves=0, levelBestCombo=0, levelChainCurrent=0, levelChainPeak=0, levelBurstPeak=0, adventureUndoUsed=false, levelStartTime=0, adventureTimer=null, dailyModId='', dailyLocks=null, dailyShrinkMargin=0, dailyPlayableSize=8, dailyMovesSinceClear=0, dailySingleShape=null, dailySingleFamilyKey='', dailySingleFamilyShapes=null, dailyBlitzEnd=0, dailyBlitzTimer=null, dailyHubTab='reward', dailyChestOpening=false, dailyNightPreviewCells=null, reviveUsed=false, gameOverPending=false, blitzExpiredPending=false, lastClearResult={rows:[],cols:[],n:0,burst:false}, gamePaused=false, pauseStartedAt=0;
  const boardEl = $('board'), trayEl = $('pieceTray'), dragLayer = $('dragLayer');
  let photoQuotaWarned=false;
  let previewEls=[], boardCellEls=[], boardMetricsCache=null;
  let perfAutoLevel=0, fpsFrames=0, fpsStart=0, fpsRaf=0, fpsSampleUntil=0, fpsLowStreak=0, fpsSoftLowStreak=0, fpsGoodSince=0, fpsWarmupSkip=false, ramTightDevice=false;
  const ua=(navigator.userAgent||'').toLowerCase();
  const gpuInfo=readGpuInfo();
  function readGpuInfo(){
    try{
      const canvas=document.createElement('canvas');
      const gl=canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if(!gl) return '';
      const ext=gl.getExtension('WEBGL_debug_renderer_info');
      const vendor=ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      const renderer=ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      return [vendor,renderer].join(' ').toLowerCase();
    }catch(_){ return ''; }
  }
  function isCoarsePointer(){ return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); }
  function isAndroid(){ return ua.includes('android'); }
  function isApple(){
    const m=String(nativeDevice.manufacturer||'').toLowerCase();
    const p=String(nativeDevice.product||'').toLowerCase();
    return m==='apple' || p==='ios' || /iphone|ipad|ipod/.test(ua);
  }
  function effectiveGraphics(){
    const g=data.graphics||'auto';
    if(g==='auto' && autoPerfLevel()===0) return 'max';
    return g;
  }
  function allowFullVisuals(){
    const g=effectiveGraphics();
    return g==='max' || g==='high';
  }
  function deviceMemory(){ return Number(navigator.deviceMemory || 0); }
  function knownJankDevice(){
    return /tecno|pova|infinix|itel|sm-a26|galaxy a26|a26 5g|max\s*19\s*pro\s*s|max\s*19|19\s*pro\s*s|\bs\s*19\b|\bs19\b/.test(nativeText());
  }
  function knownCriticalDevice(){
    const text=nativeText();
    const ram=nativeRamMb();
    return !!nativeDevice.lowRam ||
      /tecno|pova|infinix|itel|max\s*19\s*pro\s*s|max\s*19|19\s*pro\s*s|\bs\s*19\b|\bs19\b|mali[- ]?400|mali[- ]?t720|mali[- ]?t820|ge8100|ge8300|ge8320|ge8322|adreno\s*30[45]|adreno\s*40[45]|adreno\s*50[456]|sc7731|sc983|sc9863|mt8321|mt8167|mt8765|msm8909|apq8009|sdm450|spreadtrum/.test(text) ||
      (ram>0 && ram<3072);
  }
  function tabletSizeClass(){
    const sw=Number(nativeDevice.smallestWidthDp||0);
    const diag=Number(nativeDevice.diagonalIn||0);
    const w=window.innerWidth||document.documentElement.clientWidth||0;
    const h=window.innerHeight||document.documentElement.clientHeight||0;
    const shortSide=Math.min(w,h);
    const longSide=Math.max(w,h);
    if(diag>=9.4 || sw>=720 || shortSide>=820 || longSide>=1100) return 'tablet-10';
    if(diag>=6.8 || sw>=600 || longSide>=1000 || (isAndroid() && shortSide>=600) || (isCoarsePointer() && shortSide>=600)) return 'tablet-7';
    return 'phone';
  }
  function tabletLike(){
    const size=tabletSizeClass();
    return size==='tablet-7' || size==='tablet-10';
  }
  function readNativeDeviceInfo(){
    try{
      if(window.BlockMirAndroid && typeof window.BlockMirAndroid.getDeviceInfo === 'function'){
        const raw=window.BlockMirAndroid.getDeviceInfo();
        return raw ? JSON.parse(raw) : {};
      }
    }catch(_){ }
    return {};
  }
  const nativeDevice=readNativeDeviceInfo();
  function nativeText(){
    return [nativeDevice.manufacturer,nativeDevice.model,nativeDevice.device,nativeDevice.product,gpuInfo,ua].join(' ').toLowerCase();
  }
  function nativeRamMb(){
    const fromNative=Number(nativeDevice.ramMb||0);
    const fromBrowser=Number(deviceMemory()||0) * 1024;
    return fromNative || fromBrowser || 0;
  }
  function screenPixels(){
    const w=Number(nativeDevice.width||window.screen?.width||window.innerWidth||0);
    const h=Number(nativeDevice.height||window.screen?.height||window.innerHeight||0);
    return Math.max(0,w*h);
  }
  function csvDeviceLevel(){
    const text=nativeText();
    const ram=nativeRamMb();
    let level=0;
    if(knownCriticalDevice()) level=3;
    if(ram && ram<3072) level=3;
    else if(ram && ram<4096) level=2;
    else if(ram && ram<6144) level=1;
    if(/mali[- ]?g31|mali[- ]?g52|mali[- ]?g57|mali[- ]?g68|adreno\s*61[023568]|adreno\s*619|powervr|ge8/.test(text)) level=Math.max(level,1);
    if(/mali[- ]?400|mali[- ]?t720|mali[- ]?t820|ge8100|ge8300|ge8320|ge8322|adreno\s*30[45]|adreno\s*40[45]|adreno\s*50[456]|sc7731|sc983|sc9863|mt8321|mt8167|mt8765|msm8909|apq8009|sdm450|spreadtrum/.test(text)) level=Math.max(level,3);
    if(/tecno|pova|sm-a26|galaxy a26|a26 5g|max\s*19/.test(text)) level=Math.max(level,2);
    if(nativeDevice.lowRam) level=3;
    if(screenPixels()>2300000 && (!ram || ram<8192)) level=Math.max(level,1);
    const tablet=tabletSizeClass();
    if(tablet==='tablet-7' && (screenPixels()>1800000 || !ram || ram<6144)) level=Math.max(level,2);
    else if(tablet==='tablet-10' && ram>0 && ram<4096) level=Math.max(level,2);
    else if(tablet==='tablet-10' && ram>=6144) level=Math.min(level,1);
    if(Number(nativeDevice.sdk||0) && Number(nativeDevice.sdk)<29 && !isApple()) level=Math.max(level,2);
    if(isApple()){
      if(ram>=6144) level=0;
      else if(ram>=3584) level=Math.min(level,1);
      else level=Math.min(level,2);
    }
    return Math.max(0, Math.min(3, level));
  }
  function syncRamTightProfile(){
    const ram=nativeRamMb();
    ramTightDevice=ram>0 && ram<3072;
    if(ramTightDevice) perfAutoLevel=Math.max(perfAutoLevel, 2);
  }
  syncRamTightProfile();
  if(readStore('graphicsAutoV113','0')!=='1'){
    const storedByUser=readStore('graphicsUserSet','0')==='1';
    const segment=csvDeviceLevel();
    if(!storedByUser && data.graphics==='max' && segment>=1){
      data.graphics='auto';
      try{ localStorage.setItem(LS+'graphics','auto'); }catch(_){}
    }
    try{ localStorage.setItem(LS+'graphicsAutoV113','1'); }catch(_){}
  }
  if(readStore('bootV505','0')!=='1'){
    try{ localStorage.setItem(LS+'bootV505','1'); }catch(_){}
  }
  function viewportInfo(){
    const vv = window.visualViewport;
    const rawW = (vv && vv.width) || window.innerWidth || document.documentElement.clientWidth || 0;
    const rawH = (vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 0;
    const w = Math.max(280, Math.round(rawW));
    const h = Math.max(320, Math.round(rawH));
    const shortSide = Math.min(w,h);
    const ratio = h / Math.max(1,w);
    return {
      w,h,ratio,
      short:h < 710,
      veryShort:h < 640,
      tall:ratio > 2.05 && h > 760,
      narrow:w < 390,
      landscape:w > h,
      tablet:isCoarsePointer() && shortSide >= 600,
      wide:shortSide >= 820
    };
  }
  function gameChromeHeight(v){
    const tablet=tabletSizeClass();
    let base;
    if(tablet==='tablet-10') base=268 + (v.short?18:0);
    else if(tablet==='tablet-7') base=286 + (v.short?12:0);
    else base=310 + (v.veryShort?10:0) + (v.short?8:0);
    if(mode==='adventure'){
      const steps=goalSteps(levelGoal(currentAdventureLevel||1)).length;
      base += steps>=2 ? 76 : 58;
    }
    if(v.landscape){
      const tabletPad=tablet==='tablet-10'?12:tablet==='tablet-7'?8:0;
      if(mode==='adventure'){
        base=118+48+tabletPad;
      } else if(mode==='daily'){
        base=118+34+tabletPad;
      } else {
        base=56+tabletPad;
      }
      if(v.veryShort) base-=6;
    }
    return base;
  }
  function boardMaxSize(v){
    const chrome=gameChromeHeight(v);
    const safeTop=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top-extra'))||0;
    const safeBottom=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom-extra'))||0;
    const tablet=tabletSizeClass();
    if(v.landscape){
      const sideRatio=tablet==='phone'?0.30:tablet==='tablet-10'?0.28:0.30;
      const sideMax=tablet==='phone'?240:tablet==='tablet-10'?420:320;
      const sideMin=tablet==='phone'?160:tablet==='tablet-10'?280:220;
      const sideW=Math.min(sideMax, Math.max(sideMin, Math.round(v.w*sideRatio)));
      const boardCap=tablet==='tablet-10'
        ? Math.min(720,Math.round(v.h*.76))
        : tablet==='tablet-7'
          ? Math.min(560,Math.round(v.h*.74))
          : Math.min(420,Math.round(v.h*.84));
      if(mode!=='adventure' && mode!=='daily'){
        const topH=52+(tablet!=='phone'?6:0);
        const availH=v.h-topH-safeTop-safeBottom-8;
        const availW=v.w-sideW-28;
        return Math.max(210, Math.min(boardCap, availH, availW));
      }
      const availH=v.h-chrome-safeTop-safeBottom;
      const availW=v.w-sideW-28;
      return Math.max(220, Math.min(boardCap, availH, availW));
    }
    const byHeight=v.h-chrome-safeTop-safeBottom;
    const byWidth=Math.min(v.w*0.94, v.w-24);
    const cap=tablet==='tablet-10'?580:tablet==='tablet-7'?520:480;
    return Math.max(280, Math.min(cap, byHeight, byWidth));
  }
  function syncViewportLayout(){
    const v = viewportInfo();
    const tablet=tabletSizeClass();
    const root = document.documentElement;
    const body = document.body;
    const boardMax=boardMaxSize(v);
    const sideW=v.landscape?(()=>{
      const sideRatio=tablet==='phone'?0.30:tablet==='tablet-10'?0.28:0.30;
      const sideMax=tablet==='phone'?240:tablet==='tablet-10'?420:320;
      const sideMin=tablet==='phone'?160:tablet==='tablet-10'?280:220;
      return Math.min(sideMax, Math.max(sideMin, Math.round(v.w*sideRatio)));
    })():0;
    const appMax=tablet==='tablet-10'?(v.landscape?1100:920):tablet==='tablet-7'?(v.landscape?980:860):560;
    const miniBase=tablet==='tablet-10'?28:tablet==='tablet-7'?25:22;
    root.style.setProperty('--app-h', v.h + 'px');
    root.style.setProperty('--app-w', v.w + 'px');
    root.style.setProperty('--vh', (v.h * 0.01) + 'px');
    root.style.setProperty('--vw', (v.w * 0.01) + 'px');
    root.style.setProperty('--app-max-width', appMax + 'px');
    root.style.setProperty('--board-max', boardMax + 'px');
    root.style.setProperty('--game-chrome', gameChromeHeight(v) + 'px');
    root.style.setProperty('--mini-cell-base', miniBase + 'px');
    if(v.landscape) root.style.setProperty('--game-side-w', sideW + 'px');
    else root.style.removeProperty('--game-side-w');
    if(body){
      body.classList.toggle('vp-short', v.short);
      body.classList.toggle('vp-very-short', v.veryShort);
      body.classList.toggle('vp-tall', v.tall);
      body.classList.toggle('vp-narrow', v.narrow);
      body.classList.toggle('vp-tablet', tablet!=='phone');
      body.classList.toggle('vp-tablet-7', tablet==='tablet-7');
      body.classList.toggle('vp-tablet-10', tablet==='tablet-10');
      body.classList.toggle('vp-wide-tablet', v.wide);
      body.classList.toggle('vp-landscape', v.landscape);
      body.classList.toggle('vp-landscape-phone', tablet==='phone' && v.landscape);
      body.classList.toggle('vp-landscape-tablet', tablet!=='phone' && v.landscape);
      body.classList.toggle('vp-roomy', !v.short && !v.narrow && tablet==='phone');
      body.dataset.tablet = tablet;
    }
    const gameScreen=$('screenGame');
    if(gameScreen) gameScreen.classList.toggle('game-landscape-phone', tablet==='phone' && v.landscape);
    boardMetricsCache = null;
  }
  function adventurePressure(){
    if(mode!=='adventure') return 0;
    const lvl=currentAdventureLevel||selectedAdventureLevel||1;
    if(lvl>=70 && isAndroid() && isCoarsePointer()) return 3;
    if(lvl>=40 && isAndroid() && isCoarsePointer()) return 2;
    return lvl>=35 ? 1 : 0;
  }
  function heavyAdventure(){
    const lvl=currentAdventureLevel||selectedAdventureLevel||1;
    return mode==='adventure' && lvl>=40 && isAndroid() && isCoarsePointer();
  }
  function autoPerfLevel(){
    const mem=deviceMemory();
    const ram=nativeRamMb();
    const tablet=tabletSizeClass();
    const segment=csvDeviceLevel();
    if(segment>=3 || nativeDevice.lowRam || (ram>0 && ram<3072)) return 3;
    if(segment>=2 || (ram>0 && ram<4096)) return 2;
    let level=0;
    if(segment>=1 || (isAndroid() && isCoarsePointer() && (mem && mem<=4))) level=1;
    if(tablet==='tablet-7' || knownJankDevice()) level=Math.max(level,2);
    if(mem && mem>=8 && ram>=6144 && segment===0 && !knownJankDevice()) level=0;
    level=Math.max(level, perfAutoLevel, adventurePressure());
    return Math.max(0, Math.min(3, level));
  }
  function perfLevel(){
    const autoLevel=autoPerfLevel();
    const segment=csvDeviceLevel();
    if(data.graphics==='max') return segment>=3 ? 2 : segment>=2 ? 1 : 0;
    if(data.graphics==='auto') return autoLevel;
    if(data.graphics==='high') return Math.min(Math.max(autoLevel,segment),1);
    if(data.graphics==='medium') return segment>=3 ? 2 : Math.max(1, Math.min(segment,2));
    if(data.graphics==='low') return segment>=3 ? 3 : 2;
    if(data.graphics==='ultra') return 3;
    return autoLevel;
  }
  function fxBudgetLevel(){
    const manual=data.graphics||'max';
    if(manual==='max'){
      const segment=csvDeviceLevel();
      return segment>=3 ? 2 : segment>=2 ? 1 : 0;
    }
    const pressure=adventurePressure();
    const segment=csvDeviceLevel();
    let level=Math.max(perfLevel(), perfAutoLevel, segment);
    if(manual==='high') level=Math.max(level, Math.min(pressure, 1));
    else level=Math.max(level, pressure);
    if(heavyAdventure()) level=Math.max(level, manual==='high' ? 1 : 2);
    if(manual==='max' && segment<3) level=Math.min(level,2);
    if(manual==='high') level=Math.min(Math.max(level, adventurePressure()),2);
    if(manual==='medium') level=Math.max(level,1);
    if(manual==='low') level=Math.max(level,2);
    if(manual==='ultra') level=3;
    return Math.max(0, Math.min(3, level));
  }
  function fxParticleCount(fullCount){
    if(perfUltra() && fxBudgetLevel()<3) return Math.round(fullCount * 1.25);
    if(perfLow() || fxBudgetLevel()>=2) return Math.round(fullCount * 0.5);
    return fullCount;
  }
  function fxParticleScale(){
    if(perfUltra() && fxBudgetLevel()<3) return 1.25;
    if(perfLow() || fxBudgetLevel()>=2) return 0.5;
    return 1;
  }
  function updatePerfMode(){
    syncRamTightProfile();
    const level=perfLevel();
    const fxLevel=fxBudgetLevel();
    const segment=csvDeviceLevel();
    const stripVisuals=!allowFullVisuals();
    const effLevel=stripVisuals ? level : Math.min(level,1);
    const effFxLevel=stripVisuals ? fxLevel : Math.min(fxLevel,1);
    document.body.classList.toggle('ram-tight', ramTightDevice);
    document.body.classList.toggle('perf-lite', effLevel>=1);
    document.body.classList.toggle('perf-low', effLevel>=2);
    document.body.classList.toggle('perf-ultra', effLevel>=3);
    document.body.classList.toggle('fx-lite', effFxLevel>=1);
    document.body.classList.toggle('fx-low', effFxLevel>=2);
    document.body.classList.toggle('fx-ultra', effFxLevel>=3);
    document.body.classList.toggle('seg-mid', segment>=1 && stripVisuals);
    document.body.classList.toggle('seg-low', segment>=2 && stripVisuals);
    document.body.classList.toggle('seg-ultra', segment>=3 && stripVisuals);
    document.body.dataset.perf = level>=3 ? 'ultra' : level>=2 ? 'low' : level>=1 ? 'lite' : 'full';
    document.body.dataset.fxperf = fxLevel>=3 ? 'ultra' : fxLevel>=2 ? 'low' : fxLevel>=1 ? 'lite' : 'full';
    document.body.dataset.devicetier = String(segment);
    document.body.dataset.graphics = effectiveGraphics();
    document.body.dataset.tablet = tabletSizeClass();
  }
  function perfLite(){ return document.body.classList.contains('perf-lite'); }
  function perfLow(){ return document.body.classList.contains('perf-low'); }
  function perfUltra(){ return document.body.classList.contains('perf-ultra'); }
  function leanPreview(){
    if(data.graphics==='max' || data.graphics==='high') return false;
    if(tabletSizeClass()==='tablet-10' && csvDeviceLevel()<2) return false;
    return perfLow() || fxBudgetLevel()>=2 || (tabletSizeClass()==='tablet-7' && mode==='adventure');
  }
  function ultraLowFx(){
    return perfUltra() || fxBudgetLevel()>=3 || (fxBudgetLevel()>=2 && (tabletLike() || knownJankDevice() || adventurePressure()));
  }
  function gameScreenActive(){
    return !!($('screenGame')?.classList.contains('active')) &&
      !$('screenGameOver')?.classList.contains('active') &&
      (!$('screenTutorial')?.classList.contains('active') || document.body.classList.contains('tutorial-play')) &&
      !$('screenPrivacy')?.classList.contains('active');
  }
  function shouldSampleFps(){
    return data.graphics==='auto' && gameScreenActive();
  }
  function stopFpsSampling(){
    if(fpsRaf) cancelAnimationFrame(fpsRaf);
    fpsRaf=0; fpsFrames=0; fpsStart=0; fpsSampleUntil=0;
    fpsLowStreak=0; fpsSoftLowStreak=0; fpsGoodSince=0; fpsWarmupSkip=false;
  }
  function startFpsSampling(duration=6500){
    if(!shouldSampleFps()) return;
    fpsSampleUntil=Math.max(fpsSampleUntil||0, performance.now()+duration);
    if(fpsRaf) return;
    fpsFrames=0; fpsStart=0; fpsWarmupSkip=true;
    fpsRaf=requestAnimationFrame(sampleFps);
  }
  function sampleFps(ts){
    fpsRaf=0;
    if(!shouldSampleFps() || ts>fpsSampleUntil){ stopFpsSampling(); return; }
    if(!fpsStart) fpsStart=ts;
    fpsFrames++;
    if(ts-fpsStart>=2200){
      const fps=fpsFrames*1000/(ts-fpsStart);
      if(fpsWarmupSkip){
        fpsWarmupSkip=false;
      }else if(fps<45){
        fpsLowStreak++;
        fpsSoftLowStreak=0;
        fpsGoodSince=0;
        if(fpsLowStreak>=3) perfAutoLevel=Math.max(perfAutoLevel, 2);
        else if(fpsLowStreak>=2) perfAutoLevel=Math.max(perfAutoLevel, 1);
      }else{
        fpsLowStreak=0;
        if(fps<52){
          fpsSoftLowStreak++;
          fpsGoodSince=0;
          if(fpsSoftLowStreak>=2) perfAutoLevel=Math.max(perfAutoLevel, 1);
        }else{
          fpsSoftLowStreak=0;
          if(fps>=55){
            if(!fpsGoodSince) fpsGoodSince=ts;
            else if(ts-fpsGoodSince>=8000 && perfAutoLevel>0){
              perfAutoLevel--;
              fpsGoodSince=ts;
            }
          }else fpsGoodSince=0;
        }
      }
      if(perfAutoLevel>0) fpsSampleUntil=Math.max(fpsSampleUntil, ts+3200);
      updatePerfMode();
      fpsStart=ts; fpsFrames=0;
    }
    fpsRaf=requestAnimationFrame(sampleFps);
  }
  let viewportRaf=0;
  let trayFitRaf=0;
  function fitLandscapePieceSlots(){
    trayFitRaf=0;
    if(!trayEl) return;
    const nodes=[...trayEl.querySelectorAll('.piece')];
    const v=viewportInfo();
    const tablet=tabletSizeClass();
    if(!v.landscape || tablet==='phone'){
      nodes.forEach(node=>{
        node.style.removeProperty('--miniCell');
        node.style.removeProperty('--tray-mini-cell');
      });
      return;
    }
    if(!nodes.length || trayEl.clientHeight<=0 || trayEl.clientWidth<=0) return;
    const trayStyle=getComputedStyle(trayEl);
    const padY=(parseFloat(trayStyle.paddingTop)||0)+(parseFloat(trayStyle.paddingBottom)||0);
    const padX=(parseFloat(trayStyle.paddingLeft)||0)+(parseFloat(trayStyle.paddingRight)||0);
    const rowGap=parseFloat(trayStyle.rowGap||trayStyle.gap)||6;
    const innerH=Math.max(0,trayEl.clientHeight-padY-rowGap*Math.max(0,nodes.length-1));
    const slotH=Math.max(32,innerH/Math.max(1,nodes.length));
    const innerW=Math.max(80,trayEl.clientWidth-padX-12);
    const cap=tablet==='tablet-10'?24:22;
    nodes.forEach((node,index)=>{
      const piece=pieces?.[Number(node.dataset.i)||index];
      if(!piece) return;
      const size=bounds(piece.shape);
      const gap=2;
      const byHeight=Math.floor((slotH-10-gap*Math.max(0,size.h-1))/Math.max(1,size.h));
      const byWidth=Math.floor((innerW-gap*Math.max(0,size.w-1))/Math.max(1,size.w));
      const cell=Math.max(9,Math.min(cap,byHeight,byWidth));
      node.style.setProperty('--miniCell',cell+'px');
      node.style.setProperty('--tray-mini-cell',cell+'px');
    });
  }
  function scheduleLandscapePieceFit(){
    if(trayFitRaf) cancelAnimationFrame(trayFitRaf);
    trayFitRaf=requestAnimationFrame(fitLandscapePieceSlots);
  }
  function onViewportChanged(){
    if(viewportRaf) return;
    viewportRaf=requestAnimationFrame(()=>{
      viewportRaf=0;
      syncViewportLayout();
      updatePerfMode();
      scheduleLandscapePieceFit();
      if(mode==='adventure' && $('screenGame')?.classList.contains('active')) renderAdventureMissionHud();
    });
  }
  syncViewportLayout();
  updatePerfMode();
  window.addEventListener('resize', onViewportChanged, {passive:true});
  window.addEventListener('orientationchange', ()=>{
    cancelActiveDrag(false);
    [0,90,200,420].forEach(ms=>setTimeout(onViewportChanged,ms));
  }, {passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', onViewportChanged, {passive:true});
    window.visualViewport.addEventListener('scroll', onViewportChanged, {passive:true});
  }
  if(typeof ResizeObserver==='function' && trayEl){
    new ResizeObserver(scheduleLandscapePieceFit).observe(trayEl);
  }
  function maxClassicBest(){ return Math.max(data.best8||0, data.best10||0); }
  const achievements = [
    {id:'first', title:'İlk Hamle', desc:'İlk blok yerleştirildi.', reward:50, done:()=>data.moves>=1},
    {id:'classic8', title:'8x8 Başlangıcı', desc:'Klasik 8x8 oyun oyna.', reward:80, done:()=>data.classic8Games>=1},
    {id:'classic10', title:'10x10 Keşfi', desc:'Klasik 10x10 oyun oyna.', reward:100, done:()=>data.classic10Games>=1},
    {id:'score1000', title:'İlk Büyük Skor', desc:'Klasikte 1.000 max skoru geç.', reward:120, done:()=>maxClassicBest()>=1000},
    {id:'score5000', title:'Skor Avcısı', desc:'Klasikte 5.000 max skoru geç.', reward:250, done:()=>maxClassicBest()>=5000},
    {id:'score10000', title:'BlockMir Ustası', desc:'Klasikte 10.000 max skoru geç.', reward:500, done:()=>maxClassicBest()>=10000},
    {id:'score25000', title:'Efsane Skor', desc:'Klasikte 25.000 max skoru geç.', reward:1000, done:()=>maxClassicBest()>=25000},
    {id:'combo3', title:'Kombo x3', desc:'3 kombo zincirine ulaş.', reward:180, done:()=>data.bestCombo>=3},
    {id:'combo5', title:'Kombo x5', desc:'5 kombo zincirine ulaş.', reward:350, done:()=>data.bestCombo>=5},
    {id:'lines50', title:'Temizlik Başladı', desc:'Toplam 50 satır/sütun temizle.', reward:220, done:()=>data.lines>=50},
    {id:'lines250', title:'Temizlik Ustası', desc:'Toplam 250 satır/sütun temizle.', reward:800, done:()=>data.lines>=250},
    {id:'games10', title:'Alışkanlık Oldu', desc:'10 oyun tamamla.', reward:200, done:()=>data.games>=10},
    {id:'games50', title:'Devamlı Oyuncu', desc:'50 oyun tamamla.', reward:700, done:()=>data.games>=50},
    {id:'adv10', title:'Macera Başladı', desc:'Macera 10. seviyeye ulaş.', reward:250, done:()=>data.adventureMax>=10},
    {id:'adv50', title:'Yol Uzun', desc:'Macera 50. seviyeye ulaş.', reward:650, done:()=>data.adventureMax>=50},
    {id:'adv100', title:'100 Kapısı', desc:'Macera 100. seviyeye ulaş.', reward:1200, done:()=>data.adventureMax>=100},
    {id:'level10', title:'Oyuncu Seviyesi 10', desc:'10. oyuncu seviyesine ulaş.', reward:300, done:()=>data.playerLevel>=10},
    {id:'level20', title:'Seviye 20 Kulübü', desc:'20. oyuncu seviyesine ulaş.', reward:600, done:()=>data.playerLevel>=20},
    {id:'level50', title:'Seviye 50 Ustası', desc:'50. oyuncu seviyesine ulaş.', reward:1800, done:()=>data.playerLevel>=50},
    {id:'collector', title:'Koleksiyoncu', desc:'Market içinde 5 içerik aç.', reward:500, done:()=>ownedCount()>=5},
    {id:'rich', title:'Kasa Doldu', desc:'1000 Block Parası biriktir.', reward:250, done:()=>data.coins>=1000}
  ];
  function comboForGoals(c=combo, best=levelBestCombo){
    const live = c >= 2 ? c : 0;
    const peak = best >= 2 ? best : 0;
    return Math.max(peak, live);
  }
  function adventureChainProgress(){
    return Math.max(levelChainPeak, levelChainCurrent);
  }
  function adventureBurstProgress(){
    return Math.max(levelBurstPeak, 0);
  }
  function adventureChainGain(lineCount){
    return Math.max(1, lineCount|0);
  }
  function totalAdventureStars(){
    return Object.entries(data.advStars||{}).reduce((sum,[lvl,stars])=>{
      const n=+lvl;
      return n>=1 && n<=ADVENTURE_MAX_LEVEL ? sum+(+stars||0) : sum;
    },0);
  }
  function marketListFor(type){ return type==='themes'?themes:type==='blocks'?blockSkins:type==='effects'?effects:boosters; }
  function marketItem(type,id){ return marketListFor(type).find(x=>x.id===id); }
  function grantMarketItem(type,id){
    const item=marketItem(type,id);
    if(item) markOwned(item,type);
  }
  function applyStarRewards(){
    const total=totalAdventureStars(), gained=[];
    starRewards.forEach(r=>{
      if(total<r.stars || data.starRewards[r.id]) return;
      data.starRewards[r.id]=true;
      if(r.coins) data.coins+=r.coins;
      if(r.hints) data.hints+=r.hints;
      if(r.undos) data.undos+=r.undos;
      if(r.type && r.item) grantMarketItem(r.type,r.item);
      (r.bundle||[]).forEach(([type,id])=>grantMarketItem(type,id));
      gained.push(starRewardLabel(r));
    });
    return gained;
  }
  function nextStarReward(){
    const total=totalAdventureStars();
    return starRewards.find(r=>total<r.stars || !data.starRewards[r.id]);
  }
  function xpNeed(level){ return Math.floor(140 + level*38 + Math.pow(level,1.22)*9); }
  function milestoneReward(level){ return Math.floor(level*120 + 600); }
  function addXP(amount, reason=''){
    amount = Math.max(0, Math.floor(amount||0));
    if(!amount) return;
    data.xp += amount;
    let leveled=false, bonus=0, lastLevel=data.playerLevel;
    while(data.xp >= xpNeed(data.playerLevel)){
      data.xp -= xpNeed(data.playerLevel);
      data.playerLevel++; leveled=true;
      if(data.playerLevel % 20 === 0 && !data.levelRewards[data.playerLevel]){
        const r = milestoneReward(data.playerLevel);
        data.levelRewards[data.playerLevel]=true; data.coins += r; bonus += r;
      }
    }
    if(leveled){
      const msg = bonus ? tx('levelUpBonus',{n:data.playerLevel,bonus}) : tx('levelUpToast',{from:lastLevel,to:data.playerLevel});
      toast(msg); playTone('coin'); vibrate('reward');
    }
    refreshLevelUI();
  }
  function refreshLevelUI(){
    const need=xpNeed(data.playerLevel);
    if($('levelText')) $('levelText').textContent = tx('level') + ' ' + data.playerLevel;
    if($('xpText')) $('xpText').textContent = data.xp + ' / ' + need + ' XP';
    if($('xpFill')) $('xpFill').style.width = Math.max(3, Math.min(100, (data.xp/need)*100)) + '%';
  }
  function dailyBestScore(id){ return Math.max(0, Number(data.dailyBest?.[id])||0); }
  function currentBest(){
    if(mode==='daily') return dailyBestScore(dailyModId);
    return mode==='classic10' ? data.best10 : data.best8;
  }
  function dailyModeCfg(){ return (BD&&BD.getMode(dailyModId)) || (BD&&BD.todayMode()) || {id:'blitz'}; }
  function dailyModActive(flag){ return BD&&BD.modeHas(dailyModeCfg(), flag); }
  function isCellPlayable(x,y){
    if(x<0||y<0||x>=boardSize||y>=boardSize) return false;
    if(mode==='daily'){
      if(dailyModActive('shrink') && (x>=dailyPlayableSize||y>=dailyPlayableSize)) return false;
      if(dailyLocks&&dailyLocks[y]&&dailyLocks[y][x]) return false;
    }
    return true;
  }
  function boardMirrorCells(shape, px, py){
    const orig=new Set(shape.map(([dx,dy])=>`${px+dx},${py+dy}`));
    const cells=[];
    shape.forEach(([dx,dy])=>{
      const mx=boardSize-1-(px+dx), my=py+dy, key=`${mx},${my}`;
      if(!orig.has(key)) cells.push([mx,my]);
    });
    return cells;
  }
  function allPlacementCells(shape, px, py, withMirror){
    const cells=shape.map(([dx,dy])=>[px+dx,py+dy]);
    if(withMirror) boardMirrorCells(shape,px,py).forEach(c=>cells.push(c));
    return cells;
  }
  function canPlaceCells(cells){
    const seen=new Set();
    return cells.every(([x,y])=>{
      const k=`${x},${y}`;
      if(seen.has(k)) return false;
      seen.add(k);
      return isCellPlayable(x,y)&&!grid[y][x];
    });
  }
  function canPlaceWithMirror(piece, px, py){
    const mirror=mode==='daily'&&dailyModActive('mirror');
    if(!canPlace(piece,px,py)) return false;
    if(!mirror) return true;
    return canPlaceCells(boardMirrorCells(piece.shape,px,py));
  }
  function dailyPlayableBounds(){
    if(mode==='daily'&&dailyModActive('shrink')) return dailyPlayableSize||8;
    return boardSize;
  }
  function nightVisibleSet(extraCells){
    const vis=new Set();
    for(let y=0;y<boardSize;y++) for(let x=0;x<boardSize;x++){
      if(grid[y][x]) vis.add(`${x},${y}`);
    }
    (extraCells||[]).forEach(([x,y])=>vis.add(`${x},${y}`));
    const dragging=!!(extraCells&&extraCells.length);
    const spread=dragging?4:1;
    const lit=new Set(vis);
    vis.forEach(key=>{
      const [sx,sy]=key.split(',').map(Number);
      for(let dy=-spread;dy<=spread;dy++) for(let dx=-spread;dx<=spread;dx++){
        const dist=Math.abs(dx)+Math.abs(dy);
        if(dist<=spread) lit.add(`${sx+dx},${sy+dy}`);
      }
    });
    const beam=new Set();
    (extraCells||[]).forEach(([bx,by])=>{
      for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++){
        if(Math.abs(dx)+Math.abs(dy)<=2) beam.add(`${bx+dx},${by+dy}`);
      }
    });
    return { lit, beam };
  }
  function updateNightBeam(clientX, clientY, active){
    const shell=document.querySelector('.board-shell');
    if(!shell||mode!=='daily'||!dailyModActive('night')) return;
    if(!active){ shell.style.setProperty('--night-beam-o','0'); return; }
    const r=shell.getBoundingClientRect();
    const x=Math.max(0,Math.min(100,((clientX-r.left)/r.width)*100));
    const y=Math.max(0,Math.min(100,((clientY-r.top)/r.height)*100));
    const cell=currentBoardMetrics().cell||42;
    shell.style.setProperty('--night-beam-x',x+'%');
    shell.style.setProperty('--night-beam-y',y+'%');
    shell.style.setProperty('--night-beam-r',Math.max(48,cell*2.2)+'px');
    shell.style.setProperty('--night-beam-o','1');
  }
  function dailyMaxPieceCells(){
    if(!dailyModActive('shrink')) return 99;
    const p=dailyPlayableSize||8;
    if(p<=5) return 2;
    if(p<=6) return 3;
    if(p<=7) return 4;
    return 5;
  }
  const DAILY_SHRINK_MIN = 5;
  function dailyCanShrinkMore(){
    return (dailyPlayableSize||8) > DAILY_SHRINK_MIN;
  }
  function dailyShrinkEvery(){
    if(mode!=='daily'||!dailyModActive('shrink')) return BD?.SHRINK_EVERY||8;
    if(!dailyCanShrinkMore()) return 99;
    return dailyPlayableSize||boardSize;
  }
  function shapeFitsDailyShrink(shape){
    if(mode!=='daily'||!dailyModActive('shrink')) return true;
    const ps=dailyPlayableSize||8;
    const {w,h}=bounds(shape);
    return shape.length<=dailyMaxPieceCells() && w<=ps && h<=ps;
  }
  function initDailyLocks(){
    dailyLocks=null;
    if(mode!=='daily'||!dailyModActive('lockboard')) return;
    dailyLocks=Array.from({length:boardSize},()=>Array(boardSize).fill(false));
    const seeds=[[1,1],[6,1],[1,6],[6,6],[3,4],[4,3]];
    let placed=0;
    for(const [x,y] of seeds){
      if(placed>=BD.LOCK_COUNT) break;
      if(!dailyLocks[y][x]){ dailyLocks[y][x]=true; placed++; }
    }
    let guard=0;
    let rng=daySeed(dayKey()+'lock')>>>0;
    while(placed<BD.LOCK_COUNT&&guard++<80){
      rng=(rng*1103515245+12345)>>>0;
      const x=1+Math.floor((rng/4294967296)*6);
      rng=(rng*1103515245+12345)>>>0;
      const y=1+Math.floor((rng/4294967296)*6);
      if(!dailyLocks[y][x]){ dailyLocks[y][x]=true; placed++; }
    }
  }
  function daySeed(key=dayKey()){
    let h=0;
    for(let i=0;i<key.length;i++) h=(h*31+key.charCodeAt(i))>>>0;
    return h;
  }
  function chestRng(){
    let s=daySeed(dayKey()+'|'+data.chestSalt+'|chest')>>>0;
    if(!s) s=1;
    return function(){
      s=(s*1664525+1013904223)>>>0;
      return s/4294967296;
    };
  }
  function pickDailyCosmetic(tier, seed){
    const pool=[];
    const catalogTier=(item)=>{
      const p=item.price||0;
      if(p>=3000) return 'mythic';
      if(p>=2000) return 'legendary';
      if(p>=1200) return 'epic';
      if(p>=600) return 'rare';
      return 'common';
    };
    themes.forEach(t=>{ if(!isOwned(t,'themes')&&catalogTier(t)===tier) pool.push({type:'themes',item:t}); });
    blockSkins.forEach(s=>{ if(!isOwned(s,'blocks')&&catalogTier(s)===tier) pool.push({type:'blocks',item:s}); });
    effects.forEach(e=>{ if(!isOwned(e,'effects')&&catalogTier(e)===tier) pool.push({type:'effects',item:e}); });
    if(!pool.length) return { type:'coins', amount:120+(seed%280) };
    const pick=pool[seed%pool.length];
    markOwned(pick.item,pick.type);
    return { type:'cosmetic', item:pick.item, cat:pick.type, tier };
  }
  function applyDailyReward(reward){
    if(!reward) return;
    if(reward.type==='coins'){ data.coins+=reward.amount; }
    else if(reward.type==='hint'){ data.hints+=reward.amount||1; }
    else if(reward.type==='undo'){ data.undos+=reward.amount||1; }
    else if(reward.type==='cosmetic' && reward.item){
      if(reward.cat==='themes') data.theme=reward.item.id;
      else if(reward.cat==='blocks') data.skin=reward.item.id;
      else if(reward.cat==='effects') data.effect=reward.item.id;
    }
    save(true);
    refreshCounters();
  }
  function dailyRewardTitle(reward){
    if(!reward) return '';
    if(reward.type==='coins') return tx('dailyRewardCoins',{n:reward.amount});
    if(reward.type==='hint') return tx('dailyRewardHint',{n:reward.amount||1});
    if(reward.type==='undo') return tx('dailyRewardUndo',{n:reward.amount||1});
    if(reward.type==='cosmetic' && reward.item) return catName(reward.item,reward.cat);
    return tx('dailyRewardUnlock');
  }
  function dailyRewardDesc(reward){
    if(!reward) return '';
    if(reward.type==='cosmetic' && reward.item) return catDesc(reward.item,reward.cat)||tx('dailyRewardUnlock');
    return '';
  }
  function dailyModeName(id){ return tx('dailyMode_'+id); }
  function dailyModeDesc(id, modRef){
    const key='dailyDesc_'+id;
    if(id==='blitz') return tx(key,{n:BD.BLITZ_SEC});
    if(id==='shrink') return tx(key,{n:BD.SHRINK_EVERY});
    if(id==='single'){
      const mod=modRef||BD.getMode(id);
      const dk=mod?dayKeyForWeekday(mod.weekday):dayKey();
      const famKey=(dailyModId===id&&dailySingleFamilyKey)?dailySingleFamilyKey:BD.pickSingleFamily(daySeed(dk+id)).key;
      return tx('dailyDesc_singleFamily',{family:tx('dailySingle_'+famKey)});
    }
    return tx(key);
  }
  function findCatalogItem(cat, id){
    if(cat==='themes') return themes.find(t=>t.id===id);
    if(cat==='blocks') return blockSkins.find(s=>s.id===id);
    if(cat==='effects') return effects.find(e=>e.id===id);
    return null;
  }
  function serializeDailyChestReward(reward){
    if(!reward) return null;
    if(reward.type==='coins') return {t:'coins',amount:reward.amount};
    if(reward.type==='hint'||reward.type==='undo') return {t:reward.type,amount:reward.amount||1};
    if(reward.type==='cosmetic'&&reward.item) return {t:'cosmetic',cat:reward.cat,id:reward.item.id,tier:reward.tier};
    return null;
  }
  function parseDailyChestReward(raw){
    if(!raw||!raw.t) return null;
    if(raw.t==='coins') return {type:'coins',amount:raw.amount};
    if(raw.t==='hint'||raw.t==='undo') return {type:raw.t,amount:raw.amount||1};
    if(raw.t==='cosmetic'){
      const item=findCatalogItem(raw.cat,raw.id);
      if(!item) return {type:'coins',amount:120};
      return {type:'cosmetic',item,cat:raw.cat,tier:raw.tier};
    }
    return null;
  }
  function savedDailyChestReward(){
    const saved=data.dailyChestReward;
    if(!saved||saved.date!==dayKey()) return null;
    return parseDailyChestReward(saved.reward);
  }
  function spawnDailyChestBurst(reward){
    const stage=$('dailyChestStage'); if(!stage) return;
    const burst=$('dailyChestBurst'); if(burst){ burst.innerHTML=''; burst.classList.add('show'); }
    const aura=$('dailyChestAura'); if(aura) aura.classList.add('show');
    if(stage) stage.classList.add('chest-opening');
    const tier=reward?.tier||'common';
    const colors={common:'#cdb8ff',rare:'#56d7ff',epic:'#b66dff',legendary:'#ffd65d',mythic:'#ff7296'};
    const color=colors[tier]||colors.common;
    for(let i=0;i<28;i++){
      const p=document.createElement('span');
      p.className='daily-chest-particle';
      p.style.setProperty('--tx',((Math.random()-.5)*260)+'px');
      p.style.setProperty('--ty',((Math.random()-.8)*280)+'px');
      p.style.setProperty('--c',color);
      p.textContent=i%4===0?'✦':(i%4===1?'🪙':(i%4===2?'★':'✨'));
      (burst||stage).appendChild(p);
      setTimeout(()=>p.remove(),1400);
    }
    const flash=document.createElement('div');
    flash.className='daily-chest-flash';
    stage.appendChild(flash);
    setTimeout(()=>flash.remove(),700);
    playTone('win'); vibrate('reward');
  }
  function dailyModePlayable(id){
    if(DEBUG_UNLOCK_ALL || data.dailyModsUnlockAll) return true;
    return BD.todayMode().id===id;
  }
  function setDailyHubTab(tab){
    dailyHubTab=tab;
    $('dailyPanelReward')?.classList.toggle('active',tab==='reward');
    $('dailyPanelChallenge')?.classList.toggle('active',tab==='challenge');
    $('dailyTabRewardBtn')?.classList.toggle('active',tab==='reward');
    $('dailyTabChallengeBtn')?.classList.toggle('active',tab==='challenge');
  }
  function hideDailyShrinkStrip(){ const el=$('dailyShrinkStrip'); if(el) el.classList.add('hidden'); }
  function renderDailyShrinkGauge(){
    const el=$('dailyShrinkStrip');
    if(mode!=='daily'||!dailyModActive('shrink')) return hideDailyShrinkStrip();
    if(el) el.classList.remove('hidden');
    const max=dailyShrinkEvery();
    const cur=dailyCanShrinkMore()?Math.min(max, dailyMovesSinceClear||0):0;
    const pct=dailyCanShrinkMore()?Math.max(0,Math.min(100,(cur/max)*100)):100;
    const playable=dailyPlayableSize||8;
    if($('dailyShrinkTitle')) $('dailyShrinkTitle').textContent=tx('dailyShrinkTitle');
    if($('dailyShrinkCounter')) $('dailyShrinkCounter').textContent=dailyCanShrinkMore()?`${cur}/${max}`:'MIN';
    if($('dailyShrinkHint')) $('dailyShrinkHint').textContent=dailyCanShrinkMore()?tx('dailyShrinkHint',{n:max}):tx('dailyShrinkMin');
    if($('dailyShrinkBoard')) $('dailyShrinkBoard').textContent=`${playable}×${playable}`;
    if($('dailyShrinkNeedleWrap')) $('dailyShrinkNeedleWrap').style.setProperty('--needle-deg',(-88+(pct*1.76))+'deg');
    const segWrap=$('dailyShrinkSegments');
    if(segWrap){
      segWrap.style.gridTemplateColumns=`repeat(${max}, minmax(0, 1fr))`;
      segWrap.innerHTML='';
      for(let i=1;i<=max;i++){
        const s=document.createElement('i');
        s.className='daily-shrink-seg'+(i<=cur?' on':'')+(i>=max-1?' hot':'');
        segWrap.appendChild(s);
      }
    }
    if(el) el.classList.toggle('daily-shrink-danger', cur>=max-2);
  }
  function applyDailyShrinkStep(){
    if(!dailyCanShrinkMore()){
      dailyMovesSinceClear=0;
      renderDailyShrinkGauge();
      return {rows:[],cols:[],n:0,burst:false};
    }
    const cut=dailyPlayableSize-1;
    if(cut>=0){
      for(let y=0;y<boardSize;y++) if(grid[y]) grid[y][cut]=null;
      for(let x=0;x<boardSize;x++) if(grid[cut]) grid[cut][x]=null;
    }
    dailyPlayableSize=Math.max(DAILY_SHRINK_MIN,(dailyPlayableSize||8)-1);
    dailyShrinkMargin=(dailyShrinkMargin||0)+1;
    dailyMovesSinceClear=0;
    enforceDailyPieceLimits();
    renderBoard();
    renderDailyShrinkGauge();
    const shell=document.querySelector('.board-shell');
    if(shell){
      shell.classList.remove('shrink-step-flash');
      void shell.offsetWidth;
      shell.classList.add('shrink-step-flash');
      setTimeout(()=>shell.classList.remove('shrink-step-flash'), 700);
    }
    toast(tx('dailyShrinkToast',{n:dailyPlayableSize}));
    vibrate('combo');
    return clearLines();
  }
  function syncDailyModeFx(){
    const night=mode==='daily'&&dailyModActive('night');
    document.body.classList.toggle('daily-night-active', !!night);
    if($('screenGame')) $('screenGame').classList.toggle('daily-night-game', !!night);
    const fog=$('nightFogVeil');
    if(fog) fog.classList.toggle('hidden', !night);
    const shell=document.querySelector('.board-shell');
    if(shell && !night) shell.style.removeProperty('--night-beam-o');
    if(mode==='daily'&&dailyModActive('shrink')) renderDailyShrinkGauge();
    else hideDailyShrinkStrip();
    if(night) requestAnimationFrame(refreshNightFog);
  }
  function enforceDailyPieceLimits(){
    if(mode!=='daily') return;
    pieces.forEach((p,i)=>{
      if(!p||p.used) return;
      if(dailyModActive('shrink') && !shapeFitsDailyShrink(p.shape)) pieces[i]=newPiece();
      else if(p.shape.length>dailyMaxPieceCells()) pieces[i]=newPiece();
    });
  }
  function stopDailyBlitzTimer(hide=true){
    if(dailyBlitzTimer){ clearInterval(dailyBlitzTimer); dailyBlitzTimer=null; }
    if(hide && mode!=='adventure') hideAdventureTimer();
  }
  function resetDailyRuntimeState(){
    stopDailyBlitzTimer(false);
    dailyModId='';
    dailyLocks=null;
    dailyShrinkMargin=0;
    dailyPlayableSize=8;
    dailyMovesSinceClear=0;
    dailySingleShape=null;
    dailySingleFamilyKey='';
    dailySingleFamilyShapes=null;
    dailyBlitzEnd=0;
    dailyNightPreviewCells=null;
    delete document.body.dataset.dailyMod;
    document.querySelectorAll('.cell.daily-lock').forEach(cell=>cell.classList.remove('daily-lock'));
    syncDailyModeFx();
  }
  function renderDailyBlitzTimer(){
    if(mode!=='daily'||!dailyModActive('blitz')||!dailyBlitzEnd) return hideAdventureTimer();
    const total=BD.BLITZ_SEC;
    const left=Math.max(0,Math.ceil((dailyBlitzEnd-Date.now())/1000));
    const elapsed=Math.min(total,total-left);
    const progress=Math.max(0,Math.min(100,(elapsed/total)*100));
    const el=$('adventureTimerStrip');
    if(el){
      el.classList.remove('hidden');
      el.classList.add('daily-blitz-timer');
      el.dataset.stars=left<=10?'1':left<=25?'2':'3';
    }
    if($('advTimerTitle')) $('advTimerTitle').textContent=`⚡ ${dailyModeName(dailyModId)}`;
    if($('advTimerClock')) $('advTimerClock').textContent=formatClock(left);
    const fill=$('starRoadFill');
    if(fill){
      fill.style.setProperty('--blitz-w',progress+'%');
      fill.style.width=progress+'%';
    }
    const road=$('adventureTimerStrip')?.querySelector('.star-road');
    if(road) road.style.setProperty('--blitz-head',progress+'%');
    if($('starNode3')){ $('starNode3').textContent='⏱'; $('starNode3').style.left='4%'; }
    if($('starNode2')){ $('starNode2').textContent=left+'s'; $('starNode2').style.left='96%'; }
    if($('starNode1')) $('starNode1').style.display='none';
    if($('limit3')) $('limit3').textContent='';
    if($('limit2')) $('limit2').textContent='';
    if($('limit1')) $('limit1').textContent='';
  }
  function startDailyBlitzTimer(){
    stopDailyBlitzTimer(false);
    if(!dailyModActive('blitz')) return hideAdventureTimer();
    dailyBlitzEnd=Date.now()+BD.BLITZ_SEC*1000;
    renderDailyBlitzTimer();
    dailyBlitzTimer=setInterval(()=>{
      renderDailyBlitzTimer();
      handleBlitzExpiry();
    },200);
  }
  function startDailyChallenge(modId){
    if(!BD||!modId) return;
    if(!dailyModePlayable(modId)) return toast(tx('dailyLockedDay').toUpperCase());
    clearRunState();
    stopAdventureTimer();
    mode='daily';
    dailyModId=modId;
    boardSize=8;
    dailyShrinkMargin=0;
    dailyPlayableSize=8;
    dailyMovesSinceClear=0;
    dailyLocks=null;
    dailyNightPreviewCells=null;
    reviveUsed=false;
    gameOverPending=false;
    const singlePick=BD.pickSingleFamily(daySeed(dayKey()+modId));
    dailySingleFamilyKey=singlePick.key;
    dailySingleFamilyShapes=(BD.SINGLE_FAMILIES[singlePick.key]||[]).map(v=>v.map(p=>[p[0],p[1]]));
    dailySingleShape=singlePick.shape;
    grid=Array.from({length:boardSize},()=>Array(boardSize).fill(null));
    initDailyLocks();
    pieces=[newPiece(),newPiece(),newPiece()];
    score=0; linesDone=0; combo=0; chainReady=false; undoSnap=null; busy=false; recordNotified=false;
    levelMoves=0; levelBestCombo=0; levelStartTime=Date.now();
    document.body.dataset.dailyMod=dailyModId;
    updatePerfMode();
    applyModeLabels();
    show('screenGame');
    renderAll();
    if(dailyModActive('blitz')) startDailyBlitzTimer();
    else hideAdventureTimer();
    syncDailyModeFx();
  }
  function currentBestLabel(){ return (mode==='classic10' ? '10x10 ' : '8x8 ') + tx('bestSuffix'); }
  function isStorageQuotaError(e){
    return e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
  }
  function writeSaveEntries(entries){
    entries.forEach(([key,value])=>localStorage.setItem(LS+key, String(value)));
  }

  let saveTimer=0, saveQueued=false;
  function persistSave(){
    data.best = maxClassicBest();
    const entries=[
      ['best',data.best],['best8',data.best8],['best10',data.best10],
      ['coins',data.coins],['adventure',data.adventureMax],['adventureMax',data.adventureMax],['advStars',JSON.stringify(data.advStars)],['advTimes',JSON.stringify(data.advTimes)],
      ['theme',data.theme],['skin',data.skin],['effect',data.effect],['owned',JSON.stringify(data.owned)],
      ['photo',data.customPhoto],['blur',data.blur],['dark',data.dark],
      ['hints',data.hints],['undos',data.undos],['daily',data.daily],
      ['dailyChestReward',JSON.stringify(data.dailyChestReward)],['dailyBest',JSON.stringify(data.dailyBest)],['dailyModsUnlockAll',data.dailyModsUnlockAll?'1':'0'],['moves',data.moves],['lines',data.lines],['bestCombo',data.bestCombo],
      ['games',data.games],['classic8Games',data.classic8Games],['classic10Games',data.classic10Games],
      ['playerLevel',data.playerLevel],['xp',data.xp],['levelRewards',JSON.stringify(data.levelRewards)],['starRewards',JSON.stringify(data.starRewards)],
      ['claimed',JSON.stringify(data.claimed)],['tutorial',data.tutorial?'1':'0'],['tutorialVersion',data.tutorialVersion||0],['langChosen',data.langChosen?'1':'0'],['recordTrollIndex',data.recordTrollIndex||0],
      ['music',data.music?'1':'0'],['sound',data.sound?'1':'0'],['vibrate',data.vibrate?'1':'0'],['graphics',data.graphics||'max'],['lang',data.lang||'tr'],
      ['musicVol',data.musicVol||70],['sfxVol',data.sfxVol||100],
      ['colorblind',data.colorblind?'1':'0'],
      ['chestSalt',data.chestSalt||''],
      ['dailyStreak',data.dailyStreak||0],['dailyStreakLast',data.dailyStreakLast||''],['dailyStreakClaimed',data.dailyStreakClaimed||''],['dailyStreakLuckUntil',data.dailyStreakLuckUntil||''],
      ['dailyTrophies',JSON.stringify(data.dailyTrophies||{})],['firstPlayDone',data.firstPlayDone?'1':'0']
    ];
    try{
      writeSaveEntries(entries);
    }catch(e){
      if(data.customPhoto && isStorageQuotaError(e)){
        data.customPhoto='';
        if(data.theme==='custom') data.theme='mir';
        try{ localStorage.removeItem(LS+'photo'); }catch(_){}
        try{ writeSaveEntries(entries.map(([k,v])=>k==='photo'?[k,'']:(k==='theme'?[k,data.theme]:[k,v]))); }catch(_){}
        if(!photoQuotaWarned){ photoQuotaWarned=true; toast(tx('quota')); }
        applyTheme();
      }
    }
  }
  function flushSave(){
    if(saveTimer){ clearTimeout(saveTimer); saveTimer=0; }
    if(saveQueued){ saveQueued=false; persistSave(); }
  }
  function save(immediate=false){
    saveQueued=true;
    if(immediate){ flushSave(); return; }
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{ saveTimer=0; if(saveQueued) flushSave(); },700);
  }
  function refreshCounters(){
    data.best = maxClassicBest();
    $('coinsMenu').textContent=data.coins; $('coinsGame').textContent=data.coins; if($('coinsCustomize'))$('coinsCustomize').textContent=data.coins; if($('coinsDaily'))$('coinsDaily').textContent=data.coins; if($('coinsStats'))$('coinsStats').textContent=data.coins;
    if($('bestMenu'))$('bestMenu').textContent=`8x8 ${data.best8} • 10x10 ${data.best10}`;
    if($('bestGame'))$('bestGame').textContent=currentBest();
    if($('classic8Best'))$('classic8Best').textContent=data.best8; if($('classic10Best'))$('classic10Best').textContent=data.best10;
    const advNow=Math.min(data.adventureMax,ADVENTURE_MAX_LEVEL);
    $('advSmall').textContent = advNow + '/' + ADVENTURE_MAX_LEVEL; $('advLevelHead').textContent=advNow;
    $('hintCount').textContent=data.hints; $('undoCount').textContent=data.undos>0?(data.undos+' '+tx('rights')):'0 '+tx('rights');
    refreshLevelUI(); applyTheme(); applyLanguage(); updateResumeButton(); renderMenuStreak(); updateNavAchBadge(); save();
  }
  function refreshGameplayCounters(){
    data.best=maxClassicBest();
    if($('coinsGame')) $('coinsGame').textContent=data.coins;
    if($('bestGame')) $('bestGame').textContent=currentBest();
    if($('hintCount')) $('hintCount').textContent=data.hints;
    if($('undoCount')) $('undoCount').textContent=data.undos>0?(data.undos+' '+tx('rights')):'0 '+tx('rights');
    refreshLevelUI();
    save();
  }
  function adventureWorldIndexForLevel(lvl){ return Math.min(adventureWorlds.length-1, Math.floor((Math.max(1,lvl)-1)/ADVENTURE_WORLD_SIZE)); }
  function isPauseOpen(){ return !!$('screenPause')?.classList.contains('active'); }
  function openPause(){
    if(!gameScreenActive() || gameOverPending || busy || mode==='tutorial' || document.body.classList.contains('tutorial-play') || isPauseOpen()) return;
    playTone('tap');
    saveRunState({force:true});
    cancelActiveDrag(false);
    gamePaused=true;
    pauseStartedAt=Date.now();
    stopAdventureTimer(false);
    stopDailyBlitzTimer(false);
    stopFpsSampling();
    document.body.classList.add('game-paused');
    $('screenPause')?.classList.add('active');
    syncSettingToggles();
  }
  function closePause(resume=true){
    if(!isPauseOpen()){ gamePaused=false; pauseStartedAt=0; document.body.classList.remove('game-paused'); return; }
    $('screenPause')?.classList.remove('active');
    document.body.classList.remove('game-paused');
    if(resume && gamePaused){
      const delta=Math.max(0, Date.now()-pauseStartedAt);
      if(delta>0){
        if(mode==='adventure' && levelStartTime) levelStartTime+=delta;
        if(mode==='daily' && dailyModActive('blitz') && dailyBlitzEnd) dailyBlitzEnd+=delta;
      }
      gamePaused=false;
      pauseStartedAt=0;
      if(gameScreenActive()){
        if(mode==='adventure') startAdventureTimer();
        else if(mode==='daily' && dailyModActive('blitz')) startDailyBlitzTimer();
        startFpsSampling();
      }
      return;
    }
    gamePaused=false;
    pauseStartedAt=0;
  }
  function exitPauseToMenu(){
    closePause(false);
    saveRunState({force:true});
    show('screenMenu');
  }
  function restartFromPause(){
    closePause(false);
    playTone('tap');
    if(mode==='daily') startDailyChallenge(dailyModId);
    else startGame(mode, currentAdventureLevel);
  }
  function show(id){
    if(id!=='screenGame'){
      closePause(false);
      if(gameOverPending) finalizeGameOver();
      if(mode==='tutorial') exitTutorialPlay();
      cancelActiveDrag(false); stopAdventureTimer(); stopDailyBlitzTimer(); hideDailyShrinkStrip(); document.body.classList.remove('daily-night-active'); $('nightFogVeil')?.classList.add('hidden'); if($('screenGame')) $('screenGame').classList.remove('daily-night-game'); const hud=$('adventureMissionHud'); if(hud){ hud.classList.add('hidden'); hud.innerHTML=''; }
    }
    screens.forEach(s=>{ const el=$(s); if(el) el.classList.toggle('active',s===id); }); syncViewportLayout(); requestAnimationFrame(syncViewportLayout);
    if(id!=='screenGame' && $('screenGameOver')?.classList.contains('active')) $('screenGameOver').classList.remove('active');
    if(id!=='screenGame' && isPauseOpen()) closePause(false); refreshCounters(); if(id==='screenGame') startFpsSampling(); else stopFpsSampling(); if(id==='screenCustomize'){ const sc=$('customizeScroll'); if(sc) sc.scrollTop=0; setCustomizeTab(customizeTab); } if(id==='screenAdventure'){ if(!adventureScrollPin){ const sc=$('adventureScroll'); if(sc) sc.scrollTop=0; } renderAdventure(adventureScrollPin); adventureScrollPin=false; } if(id==='screenDaily'){ const sc=$('dailyScroll'); if(sc) sc.scrollTop=0; renderDaily(); } if(id==='screenAchievements'){ const sc=$('achScroll'); if(sc) sc.scrollTop=0; renderAchievements(); } if(id==='screenStats'){ const sc=$('statsScroll'); if(sc) sc.scrollTop=0; renderStats(); } if(id==='screenSettings'){ const sc=$('settingsScroll'); if(sc) sc.scrollTop=0; requestAnimationFrame(()=>updateLanguageFlags()); } syncMusicForScreen(id); }
  function adventureWorld(lvl){ return adventureWorlds[Math.min(adventureWorlds.length-1, Math.floor((Math.max(1,lvl)-1)/ADVENTURE_WORLD_SIZE))]; }
  function adventureCosmeticsActive(){ return mode==='adventure' && $('screenGame')?.classList.contains('active'); }
  function dailyCosmeticsActive(){ return mode==='daily' && $('screenGame')?.classList.contains('active'); }
  function activeAdventureWorld(){ return adventureWorld(currentAdventureLevel||selectedAdventureLevel||data.adventureMax||1); }
  function activeThemeId(){
    if(dailyCosmeticsActive()) return data.customPhoto ? 'custom' : 'mir';
    return adventureCosmeticsActive() ? activeAdventureWorld().theme : data.theme;
  }
  function activeSkinId(){
    if(dailyCosmeticsActive()) return 'classic';
    return adventureCosmeticsActive() ? activeAdventureWorld().skin : data.skin;
  }
  function activeEffectId(){
    if(dailyCosmeticsActive()) return 'star';
    return adventureCosmeticsActive() ? activeAdventureWorld().effect : data.effect;
  }
  function boardFrameForTheme(themeId){
    const map={
      mir:{outer:'#f6d18a',mid:'#7a48dc',inner:'#281048',glow:'#ffd65d55',accent:'#ffca3a'},
      night:{outer:'#5a4a9a',mid:'#27125e',inner:'#050814',glow:'#9d6bff66',accent:'#b8a0ff'},
      forest:{outer:'#8fd56a',mid:'#2d6b42',inner:'#0c271a',glow:'#58ffbf55',accent:'#a8ffb8'},
      ocean:{outer:'#5ee7ff',mid:'#197fcf',inner:'#043a5d',glow:'#22b6b866',accent:'#9ef7ff'},
      sunset:{outer:'#ffd36b',mid:'#ff8a3d',inner:'#47245d',glow:'#ff8a3d55',accent:'#ffe9a8'},
      galaxy:{outer:'#c4a0ff',mid:'#563097',inner:'#16042e',glow:'#8147ff77',accent:'#e8d4ff'},
      strawberry:{outer:'#ff8fab',mid:'#e73764',inner:'#5e0f2a',glow:'#ff4d7455',accent:'#ffc0d0'},
      royal:{outer:'#ffe38a',mid:'#8e4cff',inner:'#2a0a4d',glow:'#f7c65a66',accent:'#fff0b0'},
      luxgold:{outer:'#fff4c8',mid:'#d4a017',inner:'#3a2208',glow:'#ffd65d77',accent:'#ffe38a'},
      velvetnight:{outer:'#c9a0ff',mid:'#5a2dcc',inner:'#1a0838',glow:'#8b3dff66',accent:'#e8d0ff'},
      champagnesalon:{outer:'#fff8e8',mid:'#c9a04a',inner:'#2a1530',glow:'#f7e7b866',accent:'#fff4d0'},
      mirlegend:{outer:'#ffe27a',mid:'#7d3bff',inner:'#170326',glow:'#ffd65d77',accent:'#fff0a8'},
      crystalworld:{outer:'#b8f8ff',mid:'#3a9ec4',inner:'#082236',glow:'#67e8ff66',accent:'#dffcff'},
      goldnight:{outer:'#ffe98a',mid:'#6b4a12',inner:'#090212',glow:'#ffd66a66',accent:'#fff4c0'},
      volcano:{outer:'#ffb13b',mid:'#a71e22',inner:'#1b0303',glow:'#ff3b1f55',accent:'#ffd080'},
      voidgate:{outer:'#b8a0ff',mid:'#4a2890',inner:'#050008',glow:'#7b4dff77',accent:'#d8c8ff'},
      aurora:{outer:'#7dffd8',mid:'#2a8878',inner:'#04151f',glow:'#14e3b566',accent:'#c8fff4'},
      mint:{outer:'#9fffe8',mid:'#2a9e88',inner:'#083a37',glow:'#44e0bd55',accent:'#d4fff4'},
      candy:{outer:'#ffd75d',mid:'#e73764',inner:'#4a1248',glow:'#ff729655',accent:'#fff0a8'},
      paper:{outer:'#fff0dd',mid:'#caa6ff',inner:'#5a4878',glow:'#f7d9bd66',accent:'#fff8f0'},
      custom:{outer:'#ffd86a',mid:'#8d4ede',inner:'#2b124d',glow:'#ff517655',accent:'#ffca3a'}
    };
    return map[themeId]||map.mir;
  }
  function applyTheme(){
    const blurOff=ramTightDevice||perfLow();
    document.documentElement.style.setProperty('--blur', (blurOff?0:data.blur)+'px');
    document.documentElement.style.setProperty('--dark', data.dark/100);
    const themeId=activeThemeId(), skinId=activeSkinId(), effectId=activeEffectId();
    document.body.dataset.effect=effectId; document.body.dataset.skin=skinId;
    document.body.dataset.theme=themeId;
    const frame=boardFrameForTheme(themeId==='custom'?'custom':themeId);
    const root=document.documentElement;
    root.style.setProperty('--bm-frame-outer',frame.outer);
    root.style.setProperty('--bm-frame-mid',frame.mid);
    root.style.setProperty('--bm-frame-inner',frame.inner);
    root.style.setProperty('--bm-frame-glow',frame.glow);
    root.style.setProperty('--bm-frame-accent',frame.accent);
    const usingCustomPhoto = !adventureCosmeticsActive() && !dailyCosmeticsActive() && data.customPhoto && themeId==='custom';
    const dailyPhoto = dailyCosmeticsActive() && data.customPhoto;
    document.body.classList.toggle('has-custom-photo', !!(usingCustomPhoto || dailyPhoto));
    document.body.classList.toggle('colorblind-mode', !!data.colorblind);
    if(usingCustomPhoto) document.documentElement.style.setProperty('--boardPhoto', `url('${data.customPhoto}')`);
    else if(dailyPhoto) document.documentElement.style.setProperty('--boardPhoto', `url('${data.customPhoto}')`);
    else { const t=themes.find(x=>x.id===themeId)||themes[0]; document.documentElement.style.setProperty('--boardPhoto', t.bg); }
  }
  function rnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function newPiece(){
    let shape;
    if(mode==='daily' && dailyModActive('single') && dailySingleFamilyShapes && dailySingleFamilyShapes.length){
      const pick=rnd(dailySingleFamilyShapes);
      shape=pick.map(p=>[p[0],p[1]]);
    } else {
      const maxC=(mode==='daily'&&dailyModActive('shrink'))?dailyMaxPieceCells():99;
      let tries=0;
      do{
        shape=rnd(shapes).map(p=>[p[0],p[1]]);
        tries++;
      }while((shape.length>maxC || !shapeFitsDailyShrink(shape)) && tries<80);
      if(shape.length>maxC || !shapeFitsDailyShrink(shape)){
        const fallbacks=[[[0,0],[1,0]],[[0,0],[0,1]],[[0,0],[1,0],[0,1]]];
        shape=(fallbacks.find(s=>shapeFitsDailyShrink(s))||[[0,0]]).map(p=>[p[0],p[1]]);
      }
    }
    return {shape, color:rnd(colors), used:false};
  }
  function cloneGrid(src=grid){ return (src||[]).map(r=>r.slice()); }
  function clonePieces(src=pieces){ return (src||[]).map(p=>({...p,shape:p.shape.map(a=>a.slice())})); }
  function validRunState(s){
    if(s?.mode==='tutorial') return s.tutLessonKey && Array.isArray(s.grid) && Array.isArray(s.pieces);
    return s && ['classic8','classic10','adventure','daily'].includes(s.mode) && Array.isArray(s.grid) && Array.isArray(s.pieces);
  }
  function cloneUndoSnap(snap){
    if(!snap) return null;
    return {
      grid:cloneGrid(snap.grid), pieces:clonePieces(snap.pieces),
      score:+snap.score||0, linesDone:+snap.linesDone||0, combo:+snap.combo||0, chainReady:!!snap.chainReady,
      levelChainPeak:+snap.levelChainPeak||0, levelChainCurrent:+snap.levelChainCurrent||0, levelBurstPeak:+snap.levelBurstPeak||0,
      dailyMovesSinceClear:snap.dailyMovesSinceClear, dailyShrinkMargin:snap.dailyShrinkMargin, dailyPlayableSize:snap.dailyPlayableSize
    };
  }
  function readRunState(){
    try{ const s=JSON.parse(localStorage.getItem(RUN_KEY)||'null'); return validRunState(s)?s:null; }
    catch(_){ return null; }
  }
  function updateResumeButton(){
    const btn=$('resumeBtn'); if(!btn) return;
    const s=readRunState();
    btn.classList.toggle('hidden', !s);
    if(s && $('resumeSmall')){
      const label=s.mode==='tutorial' ? tx('howTo')
        : s.mode==='adventure' ? `${tx('scoreAdventure')} ${s.currentAdventureLevel||1}`
        : s.mode==='daily' ? dailyModeName(s.dailyModId||'')
        : (s.mode==='classic10'?'10x10':'8x8');
      $('resumeSmall').textContent=`${label} • ${s.score||0} ${tx('score')}`;
    }
  }
  function clearRunState(){
    localStorage.removeItem(RUN_KEY);
    updateResumeButton();
  }
  function saveRunState(opts={}){
    const force=!!opts.force;
    if(mode==='tutorial'){
      if(!grid||!pieces||(!force&&busy)||!tutLessonKey) return;
      const state={
        v:1, mode:'tutorial', boardSize:8, grid:cloneGrid(), pieces:clonePieces(), score, linesDone, combo,
        tutLessonKey, tutPhaseIdx, tutorialIndex, tutInteractiveReady,
        tutLessonsDone:[...tutLessonsDone],
        savedAt:Date.now()
      };
      try{ localStorage.setItem(RUN_KEY, JSON.stringify(state)); updateResumeButton(); }catch(_){}
      return;
    }
    if(!grid || !pieces || (!force && busy) || !['classic8','classic10','adventure','daily'].includes(mode)) return;
    const state={
      v:1, mode, boardSize, grid:cloneGrid(), pieces:clonePieces(), score, linesDone, combo, chainReady,
      undoSnap: cloneUndoSnap(undoSnap),
      recordNotified, currentAdventureLevel, levelMoves, levelBestCombo, levelChainPeak, levelChainCurrent, levelBurstPeak, adventureUndoUsed,
      elapsed: levelStartTime ? Math.max(0, Date.now()-levelStartTime) : 0,
      dailyModId: mode==='daily' ? dailyModId : '',
      dailyLocks: mode==='daily' && dailyLocks ? dailyLocks.map(r=>r.slice()) : null,
      dailyShrinkMargin: mode==='daily' ? dailyShrinkMargin : 0,
      dailyPlayableSize: mode==='daily' ? dailyPlayableSize : 8,
      dailyMovesSinceClear: mode==='daily' ? dailyMovesSinceClear : 0,
      dailySingleFamilyKey: mode==='daily' ? dailySingleFamilyKey : '',
      dailyBlitzRemainingMs: mode==='daily' && dailyModActive('blitz') && dailyBlitzEnd ? Math.max(0, dailyBlitzEnd-Date.now()) : 0,
      savedAt: Date.now()
    };
    try{ localStorage.setItem(RUN_KEY, JSON.stringify(state)); updateResumeButton(); }
    catch(_){ }
  }
  function applyModeLabels(){
    boardEl.dataset.size = boardSize;
    boardEl.style.gridTemplateColumns = `repeat(${boardSize},1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${boardSize},1fr)`;
    if(mode==='adventure'){
      const goal=levelGoal(currentAdventureLevel);
      target=goal.target;
      $('modeLabel').textContent=tx('scoreAdventure')+' '+currentAdventureLevel;
      $('targetText').textContent='';
      const stepCount=goalSteps(goal).length;
      if($('screenGame')){
        $('screenGame').classList.toggle('adventure-active', true);
        $('screenGame').classList.toggle('adv-hud-dense', stepCount>=2);
      }
    } else if(mode==='daily'){
      target=0;
      const mod=BD.getMode(dailyModId)||{icon:'⚔'};
      $('modeLabel').textContent=tx('scoreDaily');
      const badge=$('dailyModeBadge');
      if(badge){ badge.textContent=(mod.icon||'⚔')+' '+dailyModeName(dailyModId); badge.classList.remove('hidden'); }
      if($('scoreCard')) $('scoreCard').classList.add('daily-active');
      $('targetText').textContent=tx('bestSuffix')+' '+dailyBestScore(dailyModId);
      const gs=$('screenGame');
      if(gs) gs.classList.add('daily-mode-active');
      const gt=document.querySelector('.game-top');
      if(gt) gt.classList.add('daily-hud');
      applyTheme();
      if($('screenGame')) $('screenGame').classList.remove('adventure-active','adv-hud-dense');
    } else if(mode==='tutorial'){
      target=0;
      const badge=$('dailyModeBadge'); if(badge) badge.classList.add('hidden');
      if($('scoreCard')) $('scoreCard').classList.remove('daily-active');
      const gs=$('screenGame'); if(gs) gs.classList.remove('daily-mode-active','adventure-active','adv-hud-dense');
      const gt=document.querySelector('.game-top'); if(gt) gt.classList.remove('daily-hud');
      $('modeLabel').textContent=tx('howTo');
      $('targetText').textContent='';
      $('scoreText').textContent='0';
    } else {
      const badge=$('dailyModeBadge'); if(badge) badge.classList.add('hidden');
      if($('scoreCard')) $('scoreCard').classList.remove('daily-active');
      const gs=$('screenGame'); if(gs) gs.classList.remove('daily-mode-active');
      const gt=document.querySelector('.game-top'); if(gt) gt.classList.remove('daily-hud');
      target=0;
      $('modeLabel').textContent=tx('scoreClassic')+(mode==='classic10'?' 10x10':' 8x8');
      $('targetText').textContent=currentBestLabel()+': '+currentBest();
      if($('screenGame')){ $('screenGame').classList.remove('adventure-active','adv-hud-dense'); }
    }
  }
  function resumeSavedRun(){
    const s=readRunState();
    if(!s) return toast(tx('noSaved'));
    if(s.mode==='tutorial'){
      tutorialIndex=+s.tutorialIndex||0;
      tutLessonsDone.clear();
      (s.tutLessonsDone||[]).forEach(k=>tutLessonsDone.add(k));
      tutLessonKey=s.tutLessonKey;
      tutPhaseIdx=+s.tutPhaseIdx||0;
      tutInteractiveReady=!!s.tutInteractiveReady;
      mode='tutorial';
      boardSize=8;
      grid=cloneGrid(s.grid);
      pieces=clonePieces(s.pieces);
      score=+s.score||0;
      linesDone=+s.linesDone||0;
      combo=+s.combo||0;
      busy=false;
      gameOverPending=false;
      blitzExpiredPending=false;
      document.body.classList.add('tutorial-play');
      $('screenTutorial')?.classList.remove('active');
      $('tutPlayDock')?.classList.remove('hidden');
      applyModeLabels();
      show('screenGame');
      renderAll();
      updateTutPlayDock(TUTORIAL_SLIDES[tutorialIndex]);
      updateTutorialNextBtn();
      toast(tx('resumed'));
      return;
    }
    mode=s.mode; boardSize=s.boardSize || (mode==='classic10'?10:8); currentAdventureLevel=Math.max(1, Math.min(ADVENTURE_MAX_LEVEL, s.currentAdventureLevel||data.adventureMax||1)); selectedAdventureLevel=currentAdventureLevel;
    grid=cloneGrid(s.grid); pieces=clonePieces(s.pieces); score=+s.score||0; linesDone=+s.linesDone||0; combo=+s.combo||0; chainReady=!!s.chainReady;
    undoSnap=cloneUndoSnap(s.undoSnap);
    busy=false; recordNotified=!!s.recordNotified; levelMoves=+s.levelMoves||0; levelBestCombo=+s.levelBestCombo||0; levelChainPeak=+s.levelChainPeak||0; levelChainCurrent=+s.levelChainCurrent||0; levelBurstPeak=+s.levelBurstPeak||0; adventureUndoUsed=!!s.adventureUndoUsed;
    levelStartTime=Date.now()-(+s.elapsed||0);
    reviveUsed=false;
    gameOverPending=false;
    blitzExpiredPending=false;
    dailyModId=''; dailyLocks=null; dailyShrinkMargin=0; dailyPlayableSize=8; dailyMovesSinceClear=0;
    dailySingleFamilyKey=''; dailySingleShape=null; dailySingleFamilyShapes=null; dailyNightPreviewCells=null;
    dailyBlitzEnd=0; stopDailyBlitzTimer();
    if(s.mode==='daily'){
      dailyModId=s.dailyModId||'';
      dailyLocks=s.dailyLocks ? s.dailyLocks.map(r=>r.slice()) : null;
      dailyShrinkMargin=+s.dailyShrinkMargin||0;
      dailyPlayableSize=+s.dailyPlayableSize||8;
      dailyMovesSinceClear=+s.dailyMovesSinceClear||0;
      dailySingleFamilyKey=s.dailySingleFamilyKey||'';
      const singlePick=BD.pickSingleFamily(daySeed(dayKey()+dailyModId));
      dailySingleFamilyShapes=(BD.SINGLE_FAMILIES[singlePick.key]||[]).map(v=>v.map(p=>[p[0],p[1]]));
      dailySingleShape=singlePick.shape;
      document.body.dataset.dailyMod=dailyModId;
    } else delete document.body.dataset.dailyMod;
    updatePerfMode();
    applyModeLabels(); show('screenGame'); renderAll();
    if(mode==='adventure') startAdventureTimer();
    else if(mode==='daily'){
      if(dailyModActive('blitz') && (+s.dailyBlitzRemainingMs||0)>0){
        dailyBlitzEnd=Date.now()+s.dailyBlitzRemainingMs;
        startDailyBlitzTimer();
      } else hideAdventureTimer();
      syncDailyModeFx();
    } else hideAdventureTimer();
    if(!hasMove()){ clearRunState(); show('screenMenu'); return toast(tx('gameOverNoMoves')); }
    if(mode==='daily'&&dailyModActive('blitz')&&!(+s.dailyBlitzRemainingMs>0)){ gameOver(); return; }
    toast(tx('resumed'));
  }
  function startGame(m='classic8', lvl=null){
    const nextMode=m==='classic'?'classic8':m;
    clearRunState();
    mode=nextMode;
    if(mode!=='daily') resetDailyRuntimeState();
    boardSize = mode==='classic10' ? 10 : 8;
    if(mode==='adventure'){ boardSize=8; currentAdventureLevel = Math.max(1, Math.min(ADVENTURE_MAX_LEVEL, lvl || data.adventureMax)); selectedAdventureLevel=currentAdventureLevel; }
    updatePerfMode();
    grid=Array.from({length:boardSize},()=>Array(boardSize).fill(null)); pieces=[newPiece(),newPiece(),newPiece()]; score=0; linesDone=0; combo=0; chainReady=false; undoSnap=null; busy=false; recordNotified=false; levelMoves=0; levelBestCombo=0; levelChainCurrent=0; levelChainPeak=0; levelBurstPeak=0; adventureUndoUsed=false; levelStartTime=Date.now(); reviveUsed=false; gameOverPending=false; blitzExpiredPending=false;
    applyModeLabels();
    show('screenGame'); renderAll(); if(mode==='adventure') startAdventureTimer(); else hideAdventureTimer();
  }
  function startAdventureLevel(lvl){
    const maxPlayable=Math.min(data.adventureMax,ADVENTURE_MAX_LEVEL);
    lvl = Math.max(1, Math.min(ADVENTURE_MAX_LEVEL, lvl||selectedAdventureLevel||maxPlayable));
    if(lvl > maxPlayable) return toast(tx('locked').toUpperCase());
    if(lvl < maxPlayable) toast(tx('advReplayToast', {n: lvl}));
    startGame('adventure', lvl);
  }
  function renderAll(){renderBoard(); renderPieces(); updateScore();}
  function maybeRecord(){
    if(mode==='daily'){
      const prev=dailyBestScore(dailyModId);
        if(score>prev){
        if(!data.dailyBest) data.dailyBest={};
        data.dailyBest[dailyModId]=score;
        awardDailyTrophy(dailyModId, score);
        if($('bestGame')) $('bestGame').textContent=score;
        if(!recordNotified && score>0){ recordNotified=true; recordCelebration(); toast(tx('dailyNewRecord')); }
        save();
      }
      return;
    }
    if(mode!=='classic8' && mode!=='classic10') return;
    const key = mode==='classic10' ? 'best10' : 'best8';
    if(score>data[key]){
      data[key]=score; data.best=maxClassicBest();
      if($('bestMenu'))$('bestMenu').textContent=`8x8 ${data.best8} • 10x10 ${data.best10}`;
      if($('bestGame'))$('bestGame').textContent=data[key];
      if(!recordNotified && score>0){ recordNotified=true; recordCelebration(); }
      save();
    }
  }
  function recordCelebration(){
    const phrase = recordPhrase();
    bigRecordMessage(phrase);
    toast(tx('recordToast'));
    const card=document.querySelector('.score-card'); if(card){card.classList.remove('record-pop'); void card.offsetWidth; card.classList.add('record-pop');}
    const pTotal=fxParticleCount(24);
    for(let i=0;i<pTotal;i++){
      const p=document.createElement('div'); p.className='fx-particle fx-goldfx'; p.textContent=i%3===0?'🎉':'✦';
      p.style.left=(window.innerWidth/2 + (Math.random()-.5)*180)+'px'; p.style.top=(110 + Math.random()*160)+'px';
      p.style.setProperty('--tx',((Math.random()-.5)*220)+'px'); p.style.setProperty('--ty',((Math.random()-.75)*240)+'px');
      document.body.appendChild(p); setTimeout(()=>p.remove(),900);
    }
    playTone('win'); vibrate('win');
    if(mode==='classic8'||mode==='classic10'||mode==='daily') offerShareAfterRecord(score);
  }
  function offerShareAfterRecord(sc){
    const old=document.querySelector('.share-record-chip'); if(old) old.remove();
    const chip=document.createElement('button');
    chip.type='button';
    chip.className='share-record-chip';
    chip.textContent=tx('shareScore');
    chip.onclick=()=>{ chip.remove(); playTone('tap'); shareCurrentScore(sc); };
    document.body.appendChild(chip);
    requestAnimationFrame(()=>chip.classList.add('show'));
    setTimeout(()=>chip.remove(),4500);
  }

  function recordPhrase(){
    const count=11;
    let idx=data.recordTrollIndex||0;
    let key;
    if(idx===0) key='recordPhrase1';
    else key='recordPhrase'+String(2+Math.floor(Math.random()*(count-1)));
    data.recordTrollIndex=idx+1;
    save();
    return tx(key);
  }
  function bigRecordMessage(phrase){
    const old=document.querySelector('.record-burst'); if(old) old.remove();
    const m=document.createElement('div');
    m.className='record-burst';
    m.innerHTML=`<div class="record-crown">👑</div><h1>${tx('recordBurstTitle')}</h1><h2>${tx('recordBurstCongrats')}</h2><p>${phrase}</p>`;
    document.body.appendChild(m);
    setTimeout(()=>m.classList.add('show'),20);
    setTimeout(()=>m.remove(),2600);
  }

  function colorIndex(c){ const i=colors.indexOf(c); return i>=0?i:0; }
  function updateScore(){
    $('scoreText').textContent=score;
    maybeRecord();
    if($('bestGame')) $('bestGame').textContent=currentBest();
    if(mode==='adventure'){ $('targetText').textContent=''; renderAdventureTimer(); renderAdventureMissionHud(); syncViewportLayout(); }
    else if(mode==='daily'){ renderDailyBlitzTimer(); renderDailyShrinkGauge(); $('targetText').textContent=tx('bestSuffix')+': '+dailyBestScore(dailyModId); }
    else $('targetText').textContent=currentBestLabel()+': '+currentBest();
  }
  function cellClass(){ const skin=activeSkinId(); return skin==='classic'?'':skin; }
  function refreshNightFog(){
    if(mode!=='daily'||!dailyModActive('night')||!boardCellEls.length) return;
    const {lit,beam}=nightVisibleSet(dailyNightPreviewCells);
    boardCellEls.forEach(el=>{
      const x=+el.dataset.x,y=+el.dataset.y;
      const key=`${x},${y}`;
      el.classList.toggle('daily-night-fog',!lit.has(key));
      el.classList.toggle('daily-night-lit',lit.has(key));
      el.classList.toggle('daily-night-beam',beam.has(key));
    });
  }
  function renderBoard(){
    boardEl.innerHTML=''; boardEl.dataset.size=boardSize;
    boardEl.style.gridTemplateColumns = `repeat(${boardSize},1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${boardSize},1fr)`;
    const shrinkMode=mode==='daily'&&dailyModActive('shrink');
    const playable=shrinkMode?(dailyPlayableSize||8):boardSize;
    boardEl.dataset.playableSize=String(playable);
    const shell=document.querySelector('.board-shell');
    if(shell){
      shell.dataset.playableSize=shrinkMode?String(playable):'';
      shell.classList.toggle('daily-shrink-frame', shrinkMode&&playable<boardSize);
      let badge=shell.querySelector('.daily-playable-badge');
      if(shrinkMode){
        if(!badge){
          badge=document.createElement('span');
          badge.className='daily-playable-badge';
          shell.appendChild(badge);
        }
        badge.textContent=`${playable}×${playable}`;
        badge.classList.toggle('hidden', playable>=boardSize);
      } else if(badge){
        badge.classList.add('hidden');
      }
    }
    const night = mode==='daily' && dailyModActive('night');
    boardEl.classList.toggle('daily-night-mode', night);
    const nightVis = night ? nightVisibleSet(dailyNightPreviewCells) : null;
    const frag=document.createDocumentFragment();
    const cells=[];
    const cls=cellClass();
    for(let y=0;y<boardSize;y++) for(let x=0;x<boardSize;x++){
      const c=document.createElement('div'); c.className='cell'; c.dataset.x=x; c.dataset.y=y;
      if(mode==='daily'&&dailyModActive('lockboard')&&dailyLocks&&dailyLocks[y]&&dailyLocks[y][x]) c.classList.add('daily-lock');
      if(dailyModActive('shrink') && (x>=dailyPlayableSize||y>=dailyPlayableSize)) c.classList.add('daily-shrink-wall');
      if(night){
        const key=`${x},${y}`;
        if(!nightVis.lit.has(key)) c.classList.add('daily-night-fog');
        else c.classList.add('daily-night-lit');
        if(nightVis.beam.has(key)) c.classList.add('daily-night-beam');
      }
      if(grid[y][x]){ c.classList.add('filled'); if(cls) c.classList.add(cls); c.style.setProperty('--c',grid[y][x]); if(data.colorblind) c.dataset.colorIdx=String(colorIndex(grid[y][x])); }
      if(mode==='tutorial'&&tutTarget){
        const active=pieces?.find(p=>p&&!p.used);
        if(active&&active.shape.some(([dx,dy])=>tutTarget.px+dx===x&&tutTarget.py+dy===y)) c.classList.add('hint');
      }
      cells.push(c);
      frag.appendChild(c);
    }
    boardEl.appendChild(frag);
    boardCellEls=cells;
    boardMetricsCache=null;
  }
  function bounds(shape){let maxX=0,maxY=0; shape.forEach(([x,y])=>{maxX=Math.max(maxX,x); maxY=Math.max(maxY,y)}); return {w:maxX+1,h:maxY+1};}
  function boardMetrics(){
    const r=boardEl.getBoundingClientRect();
    const cs=getComputedStyle(boardEl);
    const gap=parseFloat(cs.gap)||3;
    const pad=parseFloat(cs.paddingLeft)||4;
    const cell=(r.width-(pad*2)-(gap*(boardSize-1)))/boardSize;
    return {r,gap,pad,cell,step:cell+gap};
  }
  function currentBoardMetrics(){
    if(!boardMetricsCache) boardMetricsCache=boardMetrics();
    return boardMetricsCache;
  }
  function cellAt(x,y){
    if(x<0 || y<0 || x>=boardSize || y>=boardSize) return null;
    return boardCellEls[y*boardSize+x] || null;
  }
  function pieceNode(piece, cls='piece'){
    const wrap=document.createElement('div'); wrap.className=cls; wrap.style.setProperty('--c', piece.color);
    const {w,h}=bounds(piece.shape); const g=document.createElement('div'); g.className='mini-grid'; g.style.gridTemplateColumns=`repeat(${w}, var(--miniCell, var(--mini-cell-base, 22px)))`; g.style.gridTemplateRows=`repeat(${h}, var(--miniCell, var(--mini-cell-base, 22px)))`;
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const m=document.createElement('div');
      if(piece.shape.some(p=>p[0]===x&&p[1]===y)){m.className='mini-cell '+cellClass(); m.style.setProperty('--c',piece.color); if(data.colorblind) m.dataset.colorIdx=String(colorIndex(piece.color));}
      else {m.className='mini-empty';}
      g.appendChild(m);
    }
    wrap.appendChild(g); return wrap;
  }
  function renderPieces(){
    trayEl.innerHTML='';
    pieces.forEach((p,i)=>{ const n=pieceNode(p,'piece'); if(p.used)n.classList.add('used'); n.dataset.i=i; n.addEventListener('pointerdown', onPieceDown, {passive:false}); trayEl.appendChild(n); });
    scheduleLandscapePieceFit();
  }
  function boardPosFromTopLeft(left, top, metrics=currentBoardMetrics()){
    const {r,pad,step}=metrics;
    // Math.round yerine half-cell offsetli floor kullanarak sınır geçişleri daha tahmin edilebilir olur.
    const x=Math.floor((left-r.left-pad + step/2)/step);
    const y=Math.floor((top-r.top-pad + step/2)/step);
    return {x,y};
  }
  function canPlace(piece, px, py){return piece.shape.every(([dx,dy])=>{const x=px+dx,y=py+dy; return isCellPlayable(x,y)&&!grid[y][x];});}
  function simulatedClear(piece,px,py){
    const rows=[], cols=[];
    const mirror=mode==='daily'&&dailyModActive('mirror');
    const cells=mirror?allPlacementCells(piece.shape,px,py,true):piece.shape.map(([dx,dy])=>[px+dx,py+dy]);
    if(!cells.every(([x,y])=>isCellPlayable(x,y)&&!grid[y][x])) return {rows,cols,count:0};
    const ps=dailyPlayableBounds();
    const temp=grid.map(r=>r.slice());
    cells.forEach(([x,y])=>{ temp[y][x]=piece.color; });
    for(let y=0;y<ps;y++){
      let full=true;
      for(let x=0;x<ps;x++) if(!temp[y][x]){ full=false; break; }
      if(full) rows.push(y);
    }
    for(let x=0;x<ps;x++){
      let full=true;
      for(let y=0;y<ps;y++) if(!temp[y][x]){ full=false; break; }
      if(full) cols.push(x);
    }
    return {rows,cols,count:rows.length+cols.length};
  }
  function clearPreview(){
    boardEl.classList.remove('clear-ready','drop-ready','drop-blocked');
    boardEl.removeAttribute('data-clear-count');
    previewEls.forEach(e=>e.classList.remove('preview-ok','preview-bad','preview-clear','preview-line','preview-mirror','hint-piece'));
    previewEls=[];
    if(mode==='daily'&&dailyModActive('night')){ dailyNightPreviewCells=null; refreshNightFog(); updateNightBeam(0,0,false); }
  }
  function markPreview(el, cls){
    if(!el) return;
    el.classList.add(cls);
    previewEls.push(el);
  }
  function preview(piece,px,py,ok){
    clearPreview();
    boardEl.classList.add(ok?'drop-ready':'drop-blocked');
    const mirror=mode==='daily'&&dailyModActive('mirror');
    const showLinePreview = ok && !leanPreview();
    const clear = showLinePreview ? simulatedClear(piece,px,py) : {rows:[],cols:[],count:0};
    piece.shape.forEach(([dx,dy])=>{
      const x=px+dx,y=py+dy; const el=cellAt(x,y);
      if(el){ markPreview(el,ok?'preview-ok':'preview-bad'); el.style.setProperty('--previewColor',piece.color); }
    });
    if(mirror){
      const mirrorOk=ok&&canPlaceCells(boardMirrorCells(piece.shape,px,py));
      boardMirrorCells(piece.shape,px,py).forEach(([x,y])=>{
        const el=cellAt(x,y);
        if(el){ markPreview(el,mirrorOk?'preview-mirror':'preview-bad'); el.style.setProperty('--previewColor',piece.color); }
      });
    }
    if(mode==='daily'&&dailyModActive('night')){
      dailyNightPreviewCells=ok?allPlacementCells(piece.shape,px,py,mirror):null;
      refreshNightFog();
    }
    if(showLinePreview && clear.count){
      boardEl.classList.add('clear-ready'); boardEl.dataset.clearCount=String(clear.count);
      const rowSet=new Set(clear.rows), colSet=new Set(clear.cols);
      const placedSet=new Set(allPlacementCells(piece.shape,px,py,mirror).map(([x,y])=>`${x},${y}`));
      boardCellEls.forEach(el=>{
        const x=+el.dataset.x,y=+el.dataset.y;
        if(rowSet.has(y)||colSet.has(x)){
          markPreview(el,(rowSet.has(y)||colSet.has(x)) && (grid[y][x] || placedSet.has(`${x},${y}`)) ? 'preview-clear' : 'preview-line');
        }
      });
    }
  }
  function onPieceDown(e){
    e.preventDefault(); e.stopPropagation(); cancelActiveDrag(false); if(busy||gamePaused) return; const i=+e.currentTarget.dataset.i; const p=pieces[i]; if(!p||p.used)return;
    updatePerfMode();
    boardMetricsCache=boardMetrics();
    const metrics=boardMetricsCache; const pv=pieceNode(p,'drag-preview');
    const dragCell=Math.max(30, Math.floor(metrics.cell));
    const dragGap=Math.max(2, Math.floor(metrics.gap));
    pv.style.setProperty('--miniCell', dragCell+'px');
    pv.style.setProperty('--dragGap', dragGap+'px');
    pv.style.left='0px';
    pv.style.top='0px';
    pv.style.setProperty('transform','translate3d(-9999px,-9999px,0)','important');
    pv.style.transformOrigin='0 0';
    dragLayer.appendChild(pv);
    const b=bounds(p.shape);
    const fullW=b.w*dragCell+(b.w-1)*dragGap, fullH=b.h*dragCell+(b.h-1)*dragGap;
    const mini=e.currentTarget.querySelector('.mini-grid'); const mr=mini?mini.getBoundingClientRect():null;
    const sx=mr && mr.width ? Math.max(0,Math.min(1,(e.clientX-mr.left)/mr.width)) : .5;
    const sy=mr && mr.height ? Math.max(0,Math.min(1,(e.clientY-mr.top)/mr.height)) : .5;
    e.currentTarget.classList.add('drag-source');
    document.body.classList.add('is-dragging');
    try{ e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); }catch(_){ }
    const fingerLift = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      ? Math.min(tabletSizeClass()==='tablet-10'?72:tabletSizeClass()==='tablet-7'?64:58, Math.max(34, fullH*.42))
      : 0;
    dragging={i,p,el:pv,source:e.currentTarget,pointerId:e.pointerId,ok:false,px:0,py:0,grabX:sx*fullW,grabY:sy*fullH,lift:fingerLift,lastX:e.clientX,lastY:e.clientY,metrics,raf:0,previewKey:''};
    moveDrag(e.clientX,e.clientY);
    window.addEventListener('pointermove', onPieceMove, {passive:false}); window.addEventListener('pointerup', onPieceUp, {passive:false}); window.addEventListener('pointercancel', onPieceCancel, {passive:false});
  }
  function onPieceMove(e){
    e.preventDefault(); if(!dragging)return;
    dragging.lastX=e.clientX; dragging.lastY=e.clientY;
    if(dragging.raf) return;
    dragging.raf=requestAnimationFrame(()=>{
      if(!dragging) return;
      dragging.raf=0;
      moveDrag(dragging.lastX,dragging.lastY);
    });
  }
  function moveDrag(x,y){
    const d=dragging; d.lastX=x; d.lastY=y;
    const left=x-d.grabX, top=y-d.grabY-d.lift;
    d.left=left; d.top=top;
    d.el.style.setProperty('transform',`translate3d(${left}px,${top}px,0)`,'important');
    const pos=boardPosFromTopLeft(left,top,d.metrics); const ok=canPlaceWithMirror(d.p,pos.x,pos.y);
    d.px=pos.x; d.py=pos.y; d.ok=ok;
    const key=pos.x+','+pos.y+','+(ok?1:0);
    if(key!==d.previewKey){
      d.previewKey=key;
      preview(d.p,pos.x,pos.y,ok);
    }
    if(mode==='daily'&&dailyModActive('night')){
      const m=d.metrics||currentBoardMetrics();
      const b=bounds(d.p.shape);
      const cx=m.r.left+m.pad+(pos.x+(b.w-1)/2)*m.step+m.cell/2;
      const cy=m.r.top+m.pad+(pos.y+(b.h-1)/2)*m.step+m.cell/2;
      updateNightBeam(cx,cy,ok);
    }
  }
  async function onPieceUp(e){
    e.preventDefault(); window.removeEventListener('pointermove',onPieceMove); window.removeEventListener('pointerup',onPieceUp); window.removeEventListener('pointercancel',onPieceCancel); if(!dragging)return;
    const d=dragging;
    if(d.raf){ cancelAnimationFrame(d.raf); d.raf=0; moveDrag(d.lastX,d.lastY); }
    cancelActiveDrag(false);
    if(d.ok){
      if(mode==='tutorial'){
        if(!tutTarget || d.px!==tutTarget.px || d.py!==tutTarget.py){
          boardEl.classList.add('shake');
          setTimeout(()=>boardEl.classList.remove('shake'),280);
          vibrate('bad'); playTone('bad');
          return;
        }
      }
      await placePiece(d.i,d.p,d.px,d.py);
    } else { boardEl.classList.add('shake'); setTimeout(()=>boardEl.classList.remove('shake'),280); vibrate('bad'); playTone('bad'); }
  }
  function onPieceCancel(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    cancelActiveDrag(false);
  }
  function cleanupDragArtifacts(){
    document.body.classList.remove('is-dragging');
    document.querySelectorAll('.drag-source').forEach(el=>el.classList.remove('drag-source'));
    document.querySelectorAll('.drag-preview').forEach(el=>el.remove());
    clearPreview();
  }
  function cancelActiveDrag(feedback=false){
    window.removeEventListener('pointermove',onPieceMove);
    window.removeEventListener('pointerup',onPieceUp);
    window.removeEventListener('pointercancel',onPieceCancel);
    const d=dragging;
    if(d){
      if(d.raf) cancelAnimationFrame(d.raf);
      try{ d.source&&d.source.releasePointerCapture&&d.source.releasePointerCapture(d.pointerId); }catch(_){ }
      dragging=null;
    }
    cleanupDragArtifacts();
    if(feedback && gameScreenActive()){
      boardEl.classList.add('shake');
      setTimeout(()=>boardEl.classList.remove('shake'),220);
    }
  }
  window.addEventListener('blur',()=>cancelActiveDrag(false),{passive:true});
  window.addEventListener('touchcancel',onPieceCancel,{passive:false});
  document.addEventListener('pointerdown',e=>{
    const hasGhost=!!document.querySelector('.drag-preview,.drag-source');
    if(!dragging && hasGhost) cleanupDragArtifacts();
    if(dragging && !(e.target&&e.target.closest&&e.target.closest('.piece'))) cancelActiveDrag(false);
  },true);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) cancelActiveDrag(false); },{passive:true});
  function snapshot(){
    return {
      grid:cloneGrid(), pieces:clonePieces(), score, linesDone, combo, chainReady,
      levelChainPeak, levelBurstPeak, levelChainCurrent,
      dailyMovesSinceClear, dailyShrinkMargin, dailyPlayableSize
    };
  }
  function restore(s){
    grid=cloneGrid(s.grid); pieces=clonePieces(s.pieces); score=s.score; linesDone=s.linesDone; combo=s.combo||0; chainReady=!!s.chainReady;
    levelChainPeak=s.levelChainPeak||0; levelBurstPeak=s.levelBurstPeak||0; levelChainCurrent=s.levelChainCurrent||0;
    if(s.dailyMovesSinceClear!=null) dailyMovesSinceClear=s.dailyMovesSinceClear;
    if(s.dailyShrinkMargin!=null) dailyShrinkMargin=s.dailyShrinkMargin;
    if(s.dailyPlayableSize!=null) dailyPlayableSize=s.dailyPlayableSize;
    dailyNightPreviewCells=null;
    renderAll();
    if(mode==='daily'&&dailyModActive('shrink')) renderDailyShrinkGauge();
  }
  async function placePiece(i,p,px,py){
    if(mode==='tutorial') return placeTutorialPiece(i,p,px,py);
    if(gamePaused) return;
    busy=true; playTone('place'); undoSnap=snapshot();
    saveRunState({force:true});
    const mirror=mode==='daily'&&dailyModActive('mirror');
    const cells=allPlacementCells(p.shape,px,py,mirror);
    const placedSet=new Set();
    cells.forEach(([x,y])=>{
      const key=`${x},${y}`;
      if(!placedSet.has(key)){ placedSet.add(key); grid[y][x]=p.color; }
    });
    const placed=placedSet.size;
    pieces[i]=newPiece();
    data.moves++; levelMoves++; score += placed*10; addXP(2 + placed);
    if(mode==='daily'&&dailyModActive('shrink')) dailyMovesSinceClear++;
    dailyNightPreviewCells=null;
    renderBoard();
    cells.forEach(([x,y])=>{ const el=cellAt(x,y); if(el) el.classList.add('just-placed'); });
    renderPieces(); updateScore();
    const settleDelay=perfLow()?0:(perfLite()?45:95);
    if(settleDelay) await wait(settleDelay);
    await clearLines();
    if(mode==='daily'&&dailyModActive('shrink')){
      if(dailyCanShrinkMore() && dailyMovesSinceClear>=dailyShrinkEvery()) await applyDailyShrinkStep();
      else{
        if(!dailyCanShrinkMore() && dailyMovesSinceClear>0) dailyMovesSinceClear=0;
        renderDailyShrinkGauge();
      }
    }
    if(mode==='adventure' && isAdventureGoalComplete()) return levelWin();
    if(blitzExpiredPending||blitzTimeExpired()){ blitzExpiredPending=false; stopDailyBlitzTimer(); return gameOver(); }
    if(!hasMove()) return gameOver();
    busy=false; refreshGameplayCounters(); saveRunState();
  }
  function linesToClear(){
    const ps=dailyPlayableBounds();
    const rows=[],cols=[];
    for(let y=0;y<ps;y++){
      let full=true;
      for(let x=0;x<ps;x++) if(!grid[y][x]){ full=false; break; }
      if(full) rows.push(y);
    }
    for(let x=0;x<ps;x++){
      let full=true;
      for(let y=0;y<ps;y++) if(!grid[y][x]){ full=false; break; }
      if(full) cols.push(x);
    }
    return {rows,cols};
  }
  async function animateClearWave(rows, cols){
    const rowSet=new Set(rows), colSet=new Set(cols);
    const fxLevel=fxBudgetLevel();
    if(fxLevel>=2){ await wait(90); return; }
    const stagger=fxLevel>=3?10:fxLevel>=2?14:fxLevel>=1?20:26;
    let maxDelay=0;
    boardCellEls.forEach(el=>{
      const x=+el.dataset.x, y=+el.dataset.y;
      if(!rowSet.has(y) && !colSet.has(x)) return;
      let delay=0;
      if(rowSet.has(y)) delay=Math.max(delay, x*stagger);
      if(colSet.has(x)) delay=Math.max(delay, y*stagger);
      maxDelay=Math.max(maxDelay, delay);
      el.classList.add('clear','clear-wave');
      el.style.setProperty('--clear-delay', delay+'ms');
    });
    const tail=fxLevel>=3?110:fxLevel>=2?170:fxLevel>=1?240:300;
    await wait(maxDelay+tail);
    boardCellEls.forEach(el=>{
      el.classList.remove('clear','clear-wave');
      el.style.removeProperty('--clear-delay');
    });
  }
  async function clearLines(){
    const {rows,cols}=linesToClear(); const n=rows.length+cols.length;
    lastClearResult={rows,cols,n,burst:rows.length>0&&cols.length>0};
    if(!n){combo=0;chainReady=false; if(mode==='adventure') levelChainCurrent=0; return lastClearResult;}
    if(mode==='daily'&&dailyModActive('shrink')) dailyMovesSinceClear=0;
    const continuing=chainReady;
    if(continuing) combo++; else combo=1;
    chainReady=true;
    if(mode==='adventure'){
      const gain=adventureChainGain(n);
      levelChainCurrent=continuing ? (levelChainCurrent+gain) : gain;
      levelChainPeak=Math.max(levelChainPeak, levelChainCurrent);
      if(n>=2) levelBurstPeak=Math.max(levelBurstPeak, n);
    }
    const goalCombo=combo>=2?combo:0;
    const coinGain=n*8+(goalCombo>=2?goalCombo*5:0);
    if(mode!=='tutorial'){
      if(goalCombo){ levelBestCombo=Math.max(levelBestCombo,goalCombo); data.bestCombo=Math.max(data.bestCombo,goalCombo); }
      linesDone+=n; data.lines+=n;
      score += n*120 + (goalCombo>=2?(goalCombo-1)*110:0);
      data.coins+=coinGain; addXP(n*12 + (goalCombo>=2?goalCombo*12:0));
    } else {
      score += n * 120 + (goalCombo >= 2 ? (goalCombo - 1) * 110 : 0);
    }
    const word = comboName(n, goalCombo);
    const fxLevel=fxBudgetLevel();
    boardEl.classList.add('board-clearing');
    spawnFx(rows,cols,n,goalCombo||n); comboBurst(word,n,goalCombo); toast(word, mode==='tutorial'?0:coinGain);
    if(goalCombo>=2) playComboTone(goalCombo,n); else playTone('clear');
    vibrate(goalCombo>=2?'combo':'clear');
    if(goalCombo>=3 && fxLevel<3){ document.body.classList.add('screen-shake-soft'); setTimeout(()=>document.body.classList.remove('screen-shake-soft'),340); }
    await animateClearWave(rows, cols);
    boardEl.classList.remove('board-clearing');
    rows.forEach(y=>{for(let x=0;x<boardSize;x++)grid[y][x]=null}); cols.forEach(x=>{for(let y=0;y<boardSize;y++)grid[y][x]=null}); renderBoard(); refreshGameplayCounters(); updateScore();
    return lastClearResult;
  }

  function comboName(lines, comboNow){
    if(comboNow>=7) return tx('comboStorm');
    if(comboNow>=5) return tx('comboTpl', {n: comboNow, msg: tx('comboBoard')});
    if(comboNow>=3) return tx('comboTpl', {n: comboNow, msg: tx('comboRain')});
    if(comboNow>=2) return tx('comboTpl', {n: comboNow, msg: tx('comboChain')});
    if(lines>=5) return tx('clearLegend');
    if(lines>=3) return tx('clearSuper');
    if(lines>=2) return tx('clearDouble');
    return tx('clearMini');
  }

  function effectMeta(effect){
    const map={
      star:{chars:['✦','✧','★'],color:'#ffe66d',wave:true},
      confetti:{chars:['●','◆','■','▲'],color:'#ff6dd8',wave:true},
      bluefx:{chars:['✦','●','〰'],color:'#56d7ff',wave:true},
      sparkfx:{chars:['✦','✹','◆'],color:'#ffd24f',wave:true},
      strawberryfx:{chars:['🍓','✦','♥'],color:'#ff5d8f',wave:true},
      crownfx:{chars:['👑','✦','◆'],color:'#ffd956',wave:true},
      neonfx:{chars:['✧','◇','〰'],color:'#66fff4',wave:true},
      lightningfx:{chars:['⚡','✧','—'],color:'#7ffcff',wave:true,beam:true},
      flamefx:{chars:['🔥','✦','●'],color:'#ff7a32',wave:true},
      crystalfx:{chars:['◇','◆','✧'],color:'#dffbff',wave:true},
      aurorafx:{chars:['✦','❇','◆'],color:'#42ffd2',wave:true,screen:true},
      royalfx:{chars:['✦','⬟','✧'],color:'#d36bff',wave:true},
      rainbowfx:{chars:['●','◆','✦','▲'],color:'#ffffff',wave:true},
      prismfx:{chars:['◇','◆','✧'],color:'#c7f7ff',wave:true},
      blockrainfx:{chars:['▣','▦','■','◆'],color:'#ffdb58',wave:true},
      galaxyfx:{chars:['✦','☄','○','✧'],color:'#b780ff',wave:true},
      supernovafx:{chars:['✹','✺','✦','☀'],color:'#fff176',wave:true,screen:true},
      kingfx:{chars:['👑','✦','🎉','◆'],color:'#ffd64f',wave:true,screen:true},
      stormfx:{chars:['◇','❄','✧','◆'],color:'#bff8ff',wave:true,screen:true},
      goldrainfx:{chars:['👑','✦','●','◆'],color:'#ffd34b',wave:true,screen:true},
      emberfx:{chars:['✹','▲','✦'],color:'#ff6a2f',wave:true,screen:true},
      solarfx:{chars:['☀','✦','●'],color:'#ffd34b',wave:true,screen:true},
      mirfx:{chars:['👑','✦','⬟','BM'],color:'#c86bff',wave:true,screen:true},
      holofx:{chars:['◇','⬡','✦'],color:'#aefcff',wave:true,screen:true},
      legendfx:{chars:['✹','👑','⚡','✦','◆'],color:'#ffffff',wave:true,screen:true},
      nebulafx:{chars:['✦','●','⬟','◇'],color:'#b56bff',wave:true,screen:true},
      quantumfx:{chars:['◇','✦','⬡','—'],color:'#7df7ff',wave:true,screen:true,beam:true},
      aetherfx:{chars:['✦','○','⬟'],color:'#ffe38a',wave:true,screen:true},
      mircorefx:{chars:['BM','✹','👑','◇'],color:'#f2ddff',wave:true,screen:true,beam:true},
      luxburst:{chars:['✦','👑','●','◆'],color:'#ffe38a',wave:true,screen:true},
      champagnefx:{chars:['✧','🥂','✦','○'],color:'#fff3c4',wave:true,screen:true},
      velvetfx:{chars:['✦','⬟','◇','—'],color:'#c9a0ff',wave:true,screen:true}
    };
    return map[effect]||map.star;
  }
  function spawnFx(rows=[],cols=[],n=1,comboNow=1){
    updatePerfMode();
    const metrics=currentBoardMetrics();
    const rect=metrics.r;
    const fxLevel=fxBudgetLevel();
    const manual=effectiveGraphics();
    const maxVisual=manual==='max', highVisual=manual==='high';
    const lite=fxLevel>=1, low=fxLevel>=2, veryLow=fxLevel>=3, heavy=heavyAdventure() && !maxVisual;
    if(shouldSampleFps() && !veryLow && (heavy || comboNow>=3 || n>=3)) startFpsSampling(4200);
    const effect=activeEffectId()||'star'; const cls='fx-'+effect; const meta=effectMeta(effect);
    const pool=meta.chars||['✦'];
    const baseCount=34+n*18+comboNow*14;
    const cap=maxVisual?36:highVisual?28:veryLow?0:low?0:lite?12:heavy?16:38;
    const mult=maxVisual ? .34 : highVisual ? .26 : veryLow ? 0 : low ? .06 : lite ? .16 : heavy ? .2 : .34;
    const minCount=maxVisual?12:highVisual?8:veryLow?0:low?0:lite?4:7;
    const count=Math.min(cap, Math.max(minCount, Math.round(baseCount * mult * fxParticleScale())));
    const lineCenters=[];
    const centerFor=(x,y)=>({
      x:rect.left+metrics.pad+x*metrics.step+metrics.cell/2,
      y:rect.top+metrics.pad+y*metrics.step+metrics.cell/2
    });
    const allowBeams=maxVisual || highVisual || (!low && !heavy && (!lite || comboNow>=4));
    rows.forEach(y=>{ if(cellAt(Math.floor(boardSize/2),y)){ const c=centerFor(Math.floor(boardSize/2),y); lineCenters.push({...c,dir:'row'}); if(allowBeams) createLineBeam('row', c.y, rect, cls); }});
    cols.forEach(x=>{ if(cellAt(x,Math.floor(boardSize/2))){ const c=centerFor(x,Math.floor(boardSize/2)); lineCenters.push({...c,dir:'col'}); if(allowBeams) createLineBeam('col', c.x, rect, cls); }});
    if(!lineCenters.length) lineCenters.push({x:rect.left+rect.width/2,y:rect.top+rect.height/2,dir:'center'});
    if(low || veryLow || count<=0) createLiteLineSweep(rows, cols, rect, metrics, cls, meta.color||'#fff');
    if(veryLow || count<=0){
      boardEl.classList.add('micro-clear');
      setTimeout(()=>boardEl.classList.remove('micro-clear'),150);
      return;
    }
    if((meta.wave || comboNow>=2) && (maxVisual || highVisual || (!low && !heavy && (!lite || comboNow>=4)))){
      const ring=document.createElement('div'); ring.className='fx-wave '+cls;
      const c=lineCenters[0]; ring.style.left=c.x+'px'; ring.style.top=c.y+'px'; ring.style.setProperty('--fxColor',meta.color||'#fff');
      document.body.appendChild(ring); setTimeout(()=>ring.remove(),lite?760:1050);
    }
    if((meta.screen || comboNow>=3 || n>=3) && (maxVisual || highVisual || (!low && !heavy && (!lite || comboNow>=5 || n>=4)))) createScreenFlash(cls, comboNow, n, meta.color||'#fff');
    const frag=document.createDocumentFragment();
    const particles=[];
    for(let i=0;i<count;i++){
      const center=lineCenters[i%lineCenters.length];
      const p=document.createElement('div'); p.className='fx-particle '+cls+' fx-size-'+(i%4); p.textContent=pool[i%pool.length];
      const x=center.x + (Math.random()-.5)*Math.min(270,rect.width*.78); const y=center.y + (Math.random()-.5)*Math.min(240,rect.height*.58);
      const power=((meta.screen||comboNow>=3?230:170) + n*12) * (maxVisual ? .72 : highVisual ? .64 : veryLow ? .32 : low ? .42 : lite ? .58 : heavy ? .62 : 1);
      const tx=(Math.random()-.5)*power, ty=(Math.random()-.72)*(power+90);
      p.style.left=x+'px'; p.style.top=y+'px'; p.style.setProperty('--tx',tx+'px'); p.style.setProperty('--ty',ty+'px'); p.style.setProperty('--fxColor',meta.color||'#fff');
      particles.push(p);
      frag.appendChild(p);
    }
    document.body.appendChild(frag);
    setTimeout(()=>particles.forEach(p=>p.remove()),veryLow?380:low?460:lite?620:820);
    if((comboNow>=2 || n>=2) && !lite && !heavy){ boardEl.classList.add('board-pulse'); setTimeout(()=>boardEl.classList.remove('board-pulse'),360); }
    if((comboNow>=3 || n>=3) && !lite && !heavy){ document.body.classList.add('screen-shake-soft'); setTimeout(()=>document.body.classList.remove('screen-shake-soft'),220); }
  }
  function createLineBeam(dir, pos, rect, cls){
    const b=document.createElement('div'); b.className='fx-line-beam '+dir+' '+cls;
    if(dir==='row'){ b.style.left=rect.left+'px'; b.style.top=(pos-8)+'px'; b.style.width=rect.width+'px'; }
    else { b.style.left=(pos-8)+'px'; b.style.top=rect.top+'px'; b.style.height=rect.height+'px'; }
    document.body.appendChild(b); setTimeout(()=>b.remove(),perfLite()?520:680);
  }
  function createLiteLineSweep(rows=[], cols=[], rect, metrics, cls, color='#fff'){
    const frag=document.createDocumentFragment();
    const els=[];
    const full=metrics.step*boardSize-metrics.gap;
    rows.forEach(y=>{
      const e=document.createElement('div');
      e.className='fx-lite-line row '+cls;
      e.style.left=(rect.left+metrics.pad)+'px';
      e.style.top=(rect.top+metrics.pad+y*metrics.step)+'px';
      e.style.width=full+'px';
      e.style.height=metrics.cell+'px';
      e.style.setProperty('--fxColor',color);
      frag.appendChild(e); els.push(e);
    });
    cols.forEach(x=>{
      const e=document.createElement('div');
      e.className='fx-lite-line col '+cls;
      e.style.left=(rect.left+metrics.pad+x*metrics.step)+'px';
      e.style.top=(rect.top+metrics.pad)+'px';
      e.style.width=metrics.cell+'px';
      e.style.height=full+'px';
      e.style.setProperty('--fxColor',color);
      frag.appendChild(e); els.push(e);
    });
    if(!els.length) return;
    document.body.appendChild(frag);
    setTimeout(()=>els.forEach(e=>e.remove()),360);
  }
  function createScreenFlash(cls, comboNow=1, n=1, color='#fff'){
    const lite=perfLite();
    const f=document.createElement('div'); f.className='fx-screen-flash '+cls; f.style.setProperty('--fxColor',color);
    document.body.appendChild(f); setTimeout(()=>f.remove(),lite?520:850);
    if(!lite && (comboNow>=4 || n>=4 || cls.includes('legend'))){
      const edge=document.createElement('div'); edge.className='fx-edge '+cls; edge.style.setProperty('--fxColor',color);
      document.body.appendChild(edge); setTimeout(()=>edge.remove(),1100);
    }
  }
  function comboBurst(word,n,comboNow){
    const fxLevel=fxBudgetLevel();
    const old=document.querySelector('.combo-burst'); if(old) old.remove();
    const b=document.createElement('div'); b.className='combo-burst level-'+Math.min(5,Math.max(comboNow,n))+(fxLevel>=2?' combo-burst-lite':'');
    b.innerHTML=`<strong>${word}</strong><small>${comboNow>1?tx('comboBurstLine',{n:comboNow}):tx('clearCountLine',{n})}</small>`;
    document.body.appendChild(b); setTimeout(()=>b.classList.add('show'),10); setTimeout(()=>b.remove(),fxLevel>=2?920:fxLevel>=1?980:1180);
  }
  function hasMove(){return pieces.some(p=>!p.used && findMove(p));}
  function moveScore(p,x,y){
    const clear=simulatedClear(p,x,y);
    let scoreMove=clear.count*10000;
    // Kenarları ve mevcut bloklara temas eden hamleleri daha akıllı say; rastgele ilk boşluğu gösterme.
    p.shape.forEach(([dx,dy])=>{
      const cx=x+dx, cy=y+dy;
      const neigh=[[1,0],[-1,0],[0,1],[0,-1]];
      neigh.forEach(([nx,ny])=>{ const ax=cx+nx, ay=cy+ny; if(ax<0||ay<0||ax>=boardSize||ay>=boardSize) scoreMove+=18; else if(grid[ay][ax]) scoreMove+=24; });
      const center=(boardSize-1)/2; scoreMove += 8 - Math.abs(cx-center) - Math.abs(cy-center);
    });
    return scoreMove;
  }
  function findMove(p){
    let best=null;
    for(let y=0;y<boardSize;y++)for(let x=0;x<boardSize;x++){
      const ok = mode==='daily'&&dailyModActive('mirror') ? canPlaceWithMirror(p,x,y) : canPlace(p,x,y);
      if(!ok) continue;
      const s=moveScore(p,x,y); if(!best || s>best.score) best={x,y,score:s};
    }
    return best;
  }
  function toast(text,coins=0){ const t=$('comboToast'); t.textContent=text+(coins?`  +${coins}🪙`:''); t.classList.remove('show'); void t.offsetWidth; t.classList.add('show'); }
  function wait(ms){return new Promise(r=>setTimeout(r,ms))}
  function audioEngine(){ return window.BlockMirAudio; }
  function configureAudio(){
    const a=audioEngine(); if(!a) return Promise.resolve();
    return a.configure({
      music:!!data.music, sound:!!data.sound,
      musicVol:data.musicVol||70, sfxVol:data.sfxVol||100
    }) || Promise.resolve();
  }
  function activeScreenId(){
    return screens.find(s=>{ const el=$(s); return el && el.classList.contains('active'); }) || 'screenMenu';
  }
  let audioUnlocked=false;
  let musicScreenSeq=0;
  function syncMusicForScreen(screenId){
    const a=audioEngine(); if(!a) return;
    if(!data.music){ a.stopMusic(); return; }
    let track='menu';
    if(screenId==='screenGame'){
      track = mode==='adventure' ? 'adventure' : 'game';
    } else if(['screenMenu','screenClassic','screenDaily','screenCustomize','screenAdventure','screenSettings','screenStats','screenAchievements'].includes(screenId)){
      track='menu';
    } else {
      a.stopMusic();
      return;
    }
    const seq=++musicScreenSeq;
    const wantTrack=track;
    ensureAudioReady().then(()=>{
      if(seq!==musicScreenSeq) return;
      configureAudio();
      return a.syncMusic(wantTrack);
    });
  }
  function playTone(kind='tap'){
    if(!data.sound) return;
    ensureAudioReady().then(()=>{
      configureAudio();
      const a=audioEngine();
      const sfx = kind==='tap' ? 'ui' : kind;
      if(a) a.playSfx(sfx);
    });
  }
  function playComboTone(comboNow=2, lines=1){
    if(!data.sound) return;
    ensureAudioReady().then(()=>{
      configureAudio();
      audioEngine()?.playCombo(comboNow, lines);
    });
  }
  function startMusic(){ syncMusicForScreen(activeScreenId()); }
  function stopMusic(){ audioEngine()?.stopMusic(); }
  function syncBgmVolume(){ configureAudio(); }
  function ensureAudioReady(){
    const a=audioEngine();
    return a ? a.ensureReady() : Promise.resolve();
  }
  function unlockAudio(){
    if(audioUnlocked) return;
    audioUnlocked=true;
    ensureAudioReady().then(()=>{
      configureAudio();
      syncMusicForScreen(activeScreenId());
    });
  }
  ['pointerdown','touchstart','click'].forEach(ev=>window.addEventListener(ev,unlockAudio,{once:true,passive:true,capture:true}));
  let lastVibrateAt=0;
  function vibrate(kind='tap'){
    if(!data.vibrate) return;
    const type = typeof kind === 'string' ? kind : (kind>=130?'win':kind>=100?'combo':kind>=60?'clear':'bad');
    const now = performance.now ? performance.now() : Date.now();
    if(type!=='win' && now-lastVibrateAt < 130) return;
    lastVibrateAt = now;
    try{
      if(window.BlockMirAndroid && typeof window.BlockMirAndroid.vibratePattern === 'function'){
        window.BlockMirAndroid.vibratePattern(type);
        return;
      }
      if(window.BlockMirAndroid && typeof window.BlockMirAndroid.vibrate === 'function'){
        const ms = type==='bad'?80:type==='clear'?115:type==='combo'?170:type==='win'?240:type==='reward'?150:70;
        window.BlockMirAndroid.vibrate(ms);
        return;
      }
    }catch(_){}
    if(navigator.vibrate){
      const map={bad:[80],clear:[115],combo:[55,45,95],win:[80,45,140],reward:[70,35,80],tap:[45]};
      navigator.vibrate(map[type]||map.tap);
    }
  }
  function gameOver(){
    if(mode==='tutorial') return;
    closePause(false);
    clearRunState();
    stopAdventureTimer(); stopDailyBlitzTimer();
    busy=true;
    playTone('bad');
    maybeRecord();
    gameOverPending=true;

    // Google Play Games integration (fully exception-safe)
    try {
      if(window.BlockMirAndroid && typeof window.BlockMirAndroid.submitScore === 'function') {
        if(mode==='classic8' || mode==='classic10') {
          window.BlockMirAndroid.submitScore(mode, score);
        } else if(mode==='daily' && typeof dailyModId !== 'undefined' && dailyModId) {
          window.BlockMirAndroid.submitScore(dailyModId, score);
        }
      }
    } catch(e) {
      console.error("Score submission error: ", e);
    }

    const modal=$('screenGameOver'); modal.classList.remove('loss-mode');
    $('resultScore').textContent=score;
    const bestNow = (mode==='classic8'||mode==='classic10'||mode==='daily') ? currentBest() : 0;
    const gap = (mode==='classic8'||mode==='classic10'||mode==='daily') ? Math.max(0,bestNow-score) : 0;
    const pendingReward=Math.floor(score/80), pendingXp=Math.floor(score/55)+15;
    if(mode==='classic8'||mode==='classic10'){
      $('overTitle').textContent=tx('lossBurstTitle').replace(/<br>/g,' ');
      const recordLine = recordNotified ? '<br><b class="mini-record">'+tx('recordJoke')+'</b>' : '';
      const gapLine = gap ? '<br>'+tx('gameOverGap', {n: gap}) : '';
      $('rewardLine').innerHTML=`${tx('gameOverNoMoves')}${recordLine}<br><span class="pending-reward">+${pendingReward} ${tx('gameOverReward')} • +${pendingXp} XP</span><br>${tx('gameOverCleared')}: ${linesDone} • ${tx('gameOverBestCombo')}: x${comboForGoals(combo,levelBestCombo)||data.bestCombo||0}${gapLine}`;
      modal.classList.add('loss-mode'); lossBurst();
    }else if(mode==='daily'){
      $('overTitle').textContent=recordNotified?tx('dailyNewRecord'):tx('lossBurstTitle').replace(/<br>/g,' ');
      const gapLine = gap ? '<br>'+tx('gameOverGap', {n: gap}) : '';
      $('rewardLine').innerHTML=`${dailyModeName(dailyModId)}<br><span class="pending-reward">+${pendingReward} ${tx('gameOverReward')} • +${pendingXp} XP</span><br>${tx('gameOverCleared')}: ${linesDone} • ${tx('bestSuffix')}: ${bestNow}${gapLine}`;
      if(!recordNotified){ modal.classList.add('loss-mode'); lossBurst(); }
    }else{
      $('overTitle').textContent=tx('gameOverAdvTitle');
      const prog=adventureGoalProgressLine();
      $('rewardLine').innerHTML=`${tx('gameOverAdvSummary',{n:currentAdventureLevel,score})}<br>${prog}<br><span class="pending-reward">+${pendingReward} ${tx('gameOverReward')} • +${pendingXp} XP</span><br>${tx('gameOverCleared')}: ${linesDone} • ${tx('gameOverBestCombo')}: x${comboForGoals(combo,levelBestCombo)||data.bestCombo||0}`;
      modal.classList.add('loss-mode'); lossBurst();
    }
    modal.classList.add('active');
    stopFpsSampling();
    syncReviveButton();
    syncGameOverContinueLabel();
    syncShareScoreBtn();
    refreshCounters();
  }
  function lossBurst(kind='classic'){
    const old=document.querySelector('.loss-burst'); if(old) old.remove();
    const lines=[tx('lossBurst1'),tx('lossBurst2'),tx('lossBurst3'),tx('lossBurst4')];
    const b=document.createElement('div'); b.className='loss-burst';
    b.innerHTML=`<strong>${tx('lossBurstTitle')}</strong><small>${rnd(lines)}</small>`;
    document.body.appendChild(b); setTimeout(()=>b.classList.add('show'),20); setTimeout(()=>b.remove(),1700);
    document.body.classList.add('screen-shake-soft'); setTimeout(()=>document.body.classList.remove('screen-shake-soft'),420); vibrate('win');
  }
  function levelWin(){
    stopAdventureTimer();
    clearRunState();
    busy=true;
    playTone('win');
    const goal=levelGoal(currentAdventureLevel);
    const reward=goal.reward;
    const elapsed=Math.max(1, Math.floor((Date.now()-levelStartTime)/1000));
    const stars=calcAdventureStars(goal, elapsed);
    const oldStars=data.advStars[currentAdventureLevel]||0;
    const oldTime=data.advTimes[currentAdventureLevel]||0;
    data.coins+=reward;
    // En iyi yıldız/saati koru; bu denemenin yıldızı ayrıca sonuç ekranında gösterilir.
    if(stars>oldStars || (stars===oldStars && (!oldTime || elapsed<oldTime))){
      data.advStars[currentAdventureLevel]=stars;
      data.advTimes[currentAdventureLevel]=elapsed;
    }else if(!oldTime){
      data.advTimes[currentAdventureLevel]=elapsed;
    }
    const wasFrontier=currentAdventureLevel>=data.adventureMax;
    if(wasFrontier && data.adventureMax<ADVENTURE_MAX_LEVEL)data.adventureMax=currentAdventureLevel+1;
    const milestones=[10,25,50,75,100];
    if(wasFrontier && milestones.includes(currentAdventureLevel)){
      setTimeout(()=>toast(`🎉 ${tx('milestoneToast')}: ${currentAdventureLevel}!`), 400);
    }
    data.adventure=data.adventureMax;
    selectedAdventureLevel = wasFrontier ? data.adventureMax : currentAdventureLevel;
    data.games++;
    addXP(50+Math.floor(currentAdventureLevel/4)+stars*12);
    const starDrops=applyStarRewards();
    const bestStars=data.advStars[currentAdventureLevel]||stars;
    const currentLine = stars?('★'.repeat(stars)+'☆'.repeat(3-stars)):'☆☆☆';
    const bestLine = bestStars?('★'.repeat(bestStars)+'☆'.repeat(3-bestStars)):'☆☆☆';
    $('screenGameOver').classList.remove('loss-mode');
    $('resultScore').textContent=score;
    const starRewardLine=starDrops.length ? `<br>${tx('advStarReward',{rewards:starDrops.join(', ')})}` : '';
    const completionLine=currentAdventureLevel>=ADVENTURE_MAX_LEVEL && wasFrontier ? `<br>${tx('adventureComplete')}` : '';
    const bestExtra=data.advTimes[currentAdventureLevel]?(' • '+formatTime(data.advTimes[currentAdventureLevel])):'';
    $('rewardLine').innerHTML=`${tx('advLevelComplete',{n:currentAdventureLevel})}<br>${tx('advLevelTry',{stars:currentLine,time:elapsed})}<br>${tx('advLevelBest',{stars:bestLine,extra:bestExtra})}<br>+${reward}🪙${stars===0?' • '+tx('advTimerExpired'):''}${starRewardLine}${completionLine}`;
    $('overTitle').textContent=tx('levelClear');
    $('screenGameOver').classList.add('active'); stopFpsSampling();
    refreshCounters();
    syncGameOverContinueLabel();
    maybeRequestReview();
  }

  function hideAdventureTimer(){ const el=$('adventureTimerStrip'); if(el) el.classList.add('hidden'); }
  function startAdventureTimer(){
    stopAdventureTimer(false);
    const el=$('adventureTimerStrip'); if(el) el.classList.remove('hidden');
    renderAdventureTimer();
    adventureTimer=setInterval(renderAdventureTimer,500);
  }
  function stopAdventureTimer(hide=true){ if(adventureTimer){ clearInterval(adventureTimer); adventureTimer=null; } if(hide) hideAdventureTimer(); }
  function resetAdventureTimerStrip(){
    const el=$('adventureTimerStrip');
    if(el) el.classList.remove('daily-blitz-timer');
    const fill=$('starRoadFill');
    if(fill){ fill.style.removeProperty('--blitz-w'); fill.style.width=''; }
    const road=el?.querySelector('.star-road');
    if(road) road.style.removeProperty('--blitz-head');
    if($('starNode1')){ $('starNode1').style.display=''; $('starNode1').textContent='★'; $('starNode1').style.left=''; }
    if($('starNode2')){ $('starNode2').textContent='★★'; $('starNode2').style.left=''; }
    if($('starNode3')){ $('starNode3').textContent='★★★'; $('starNode3').style.left=''; }
  }
  function renderAdventureTimer(){
    if(mode!=='adventure' || !levelStartTime) return hideAdventureTimer();
    resetAdventureTimerStrip();
    const goal=levelGoal(currentAdventureLevel), lim=starLimits(goal,currentAdventureLevel);
    const elapsed=Math.max(0,Math.floor((Date.now()-levelStartTime)/1000));
    let activeStars = elapsed<=lim.three ? 3 : elapsed<=lim.two ? 2 : elapsed<=lim.one ? 1 : 0;
    if(adventureUndoUsed && activeStars>2) activeStars=2;
    if($('advTimerTitle')) $('advTimerTitle').textContent=`${tx('level')} ${currentAdventureLevel} · ${tx('advTimerNow',{n:activeStars?('⭐'.repeat(activeStars)):tx('advTimerExpired')})}`;
    if($('advTimerClock')) $('advTimerClock').textContent=formatClock(elapsed);
    if($('limit3')) $('limit3').textContent='⭐⭐⭐ '+formatClock(lim.three);
    if($('limit2')) $('limit2').textContent='⭐⭐ '+formatClock(lim.two);
    if($('limit1')) $('limit1').textContent='⭐ '+formatClock(lim.one);
    const progress=Math.max(0,Math.min(100,(elapsed/lim.one)*100));
    if($('starRoadFill')) $('starRoadFill').style.width=progress+'%';
    const pos3=Math.max(14,Math.min(88,(lim.three/lim.one)*100));
    const pos2=Math.max(pos3+16,Math.min(94,(lim.two/lim.one)*100));
    const n3=$('starNode3'), n2=$('starNode2'), n1=$('starNode1');
    if(n3)n3.style.left=pos3+'%'; if(n2)n2.style.left=pos2+'%'; if(n1)n1.style.left='96%';
    [['starNode1',1],['starNode2',2],['starNode3',3]].forEach(([id,need])=>{ const node=$(id); if(!node) return; node.classList.toggle('lost',activeStars<need); node.classList.toggle('active',activeStars===need); });
    const wrap=$('adventureTimerStrip'); if(wrap){ wrap.dataset.stars=String(activeStars); wrap.classList.remove('hidden'); }
  }
  function formatClock(sec){ sec=Math.max(0,Math.floor(sec||0)); const m=Math.floor(sec/60), ss=sec%60; return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }
  function useUndo(){ if(gamePaused||!undoSnap || data.undos<=0 || busy) return toast(tx('undoNone')); if(mode==='adventure') adventureUndoUsed=true; data.undos--; restore(undoSnap); undoSnap=null; toast(tx('undoDone')); refreshGameplayCounters(); saveRunState(); if(!hasMove()) gameOver(); }
  function useHint(){
    if(gamePaused||data.hints<=0 || busy) return toast(tx('hintNone'));
    let bestIdx=-1,bestPos=null;
    pieces.forEach((p,i)=>{ if(p.used) return; const pos=findMove(p); if(pos && (!bestPos || pos.score>bestPos.score)){ bestIdx=i; bestPos=pos; } });
    if(bestIdx<0) return toast(tx('hintNoMove'));
    data.hints--; const p=pieces[bestIdx], pos=bestPos;
    clearPreview();
    const trayPiece=trayEl.querySelector(`[data-i="${bestIdx}"]`); if(trayPiece) trayPiece.classList.add('hint-piece');
    preview(p,pos.x,pos.y,true);
    p.shape.forEach(([dx,dy])=>{const el=boardEl.querySelector(`[data-x="${pos.x+dx}"][data-y="${pos.y+dy}"]`); if(el)el.classList.add('hint');});
    toast(tx('hintSmart')); refreshGameplayCounters();
    setTimeout(()=>{ clearPreview(); document.querySelectorAll('.hint').forEach(e=>e.classList.remove('hint')); }, 1800);
  }
  function levelGoal(lvl){
    lvl=Math.max(1,Math.min(ADVENTURE_MAX_LEVEL,lvl||1));
    const tier=Math.floor((lvl-1)/10);
    const worldIdx=Math.min(adventureWorlds.length-1, Math.floor((lvl-1)/ADVENTURE_WORLD_SIZE));
    const world=adventureWorlds[worldIdx];
    const late=Math.max(0,lvl-60);
    const earlyEase = lvl<=20 ? (.64 + lvl*.018) : lvl<=50 ? (.88 + (lvl-20)*.003) : 1;
    const base=Math.round((155 + lvl*38 + Math.pow(lvl,1.18)*10 + tier*125 + late*40) * earlyEase);
    const lineNeed=Math.min(22, 1 + Math.floor((lvl+2)/8) + Math.floor(tier/2));
    const chainNeed=Math.min(6, 2 + Math.floor((lvl-1)/28) + (lvl>75?1:0));
    const burstNeed=Math.min(4, 2 + Math.floor((lvl-1)/40));
    const moveNeed=Math.min(36, 7 + Math.floor(lvl/6) + tier);
    const reward=95 + lvl*9 + tier*48 + (lvl>75?130:0);
    const rotPool = lvl < 16
      ? ['score','burst','lines','chain','score','lines','burst','score']
      : lvl < 45
      ? ['score','burst','lines','chain','moves','mixed','score','lines']
      : ['score','burst','lines','chain','score','moves','mixed','noUndo'];
    const rot=rotPool[(lvl-1)%rotPool.length];
    const mk=(kind, extra={})=>({kind, worldId:world.id, chapter:world.chapter, reward, target:base, ...extra});
    if(lvl===1) return mk('score', {titleKey:'advGoal_l1_title', descKey:'advGoal_l1_desc', target:Math.floor(base*.55)});
    if(lvl===2) return mk('lines', {titleKey:'advGoal_l2_title', descKey:'advGoal_l2_desc', linesTarget:2, target:Math.floor(base*.5)});
    if(lvl===3) return mk('burst', {titleKey:'advGoal_l3_title', descKey:'advGoal_l3_desc', burstTarget:2, target:Math.floor(base*.52)});
    if(lvl===4) return mk('chain', {titleKey:'advGoal_l4_title', descKey:'advGoal_l4_desc', chainTarget:2, target:Math.floor(base*.54)});
    if(lvl===5) return mk('score', {titleKey:'advGoal_l5_title', descKey:'advGoal_l5_desc', vars:{world:worldField(world,'name')}, target:Math.floor(base*.62)});
    if(rot==='score') return mk('score', {titleKey:'advGoal_score_title', descKey:'advGoal_score_desc', target:Math.floor(base*(lvl<20?.78:.86))});
    if(rot==='lines') return mk('lines', {titleKey:'advGoal_lines_title', descKey:'advGoal_lines_desc', vars:{n:lineNeed}, linesTarget:lineNeed, target:Math.floor(base*.82)});
    if(rot==='chain') return mk('chain', {titleKey:'advGoal_chain_title', descKey:'advGoal_chain_desc', vars:{n:chainNeed}, chainTarget:chainNeed, target:Math.floor(base*.78)});
    if(rot==='burst') return mk('burst', {titleKey:'advGoal_burst_title', descKey:'advGoal_burst_desc', vars:{n:burstNeed}, burstTarget:burstNeed, target:Math.floor(base*.76)});
    if(rot==='moves') return mk('moves', {titleKey:'advGoal_moves_title', descKey:'advGoal_moves_desc', vars:{n:moveNeed}, movesTarget:moveNeed, target:Math.floor(base*.72)});
    if(rot==='noUndo') return mk('noUndo', {titleKey:'advGoal_noUndo_title', descKey:'advGoal_noUndo_desc', noUndo:true, target:Math.floor(base*(lvl<50?.82:.88))});
    const mixLines=Math.max(2, Math.floor(lineNeed*.75));
    const mixChain=Math.max(2, chainNeed-1);
    return mk('mixed', {titleKey:'advGoal_mixed_title', descKey:'advGoal_mixed_desc', vars:{lines:mixLines, chain:mixChain}, linesTarget:mixLines, chainTarget:mixChain, target:Math.floor(base*.7)});
  }
  function goalTitle(goal){
    if(goal.titleKey) return tx(goal.titleKey, goal.vars||{});
    return isTurkish() ? (goal.title||goalShort(goal)) : (goal.titleEn||goal.title||goalShort(goal));
  }
  function goalDesc(goal){
    if(goal.descKey) return tx(goal.descKey, goal.vars||{});
    return isTurkish() ? (goal.desc||goalSub(goal)) : (goal.descEn||goal.desc||goalSub(goal));
  }
  function adventureProgressText(goal){
    const chain=adventureChainProgress(), burst=adventureBurstProgress();
    if(goal.kind==='lines') return `💥 ${linesDone}/${goal.linesTarget} • 🎯 ${score}/${goal.target}`;
    if(goal.kind==='chain') return `⛓ ${chain}/${goal.chainTarget} • 🎯 ${score}/${goal.target}`;
    if(goal.kind==='burst') return `💫 ${burst}/${goal.burstTarget} • 🎯 ${score}/${goal.target}`;
    if(goal.kind==='moves') return `🧩 ${levelMoves}/${goal.movesTarget} • 🎯 ${score}/${goal.target}`;
    if(goal.kind==='mixed') return `💥 ${linesDone}/${goal.linesTarget} • ⛓ ${chain}/${goal.chainTarget} • 🎯 ${score}/${goal.target}`;
    if(goal.kind==='noUndo') return `👑 ${adventureUndoUsed?tx('noUndoUsed'):tx('noUndoGoal')} • 🎯 ${score}/${goal.target}`;
    return `🎯 ${score}/${goal.target}`;
  }
  function goalIcon(goal){ return goal.kind==='lines'?'💥':goal.kind==='chain'?'⛓':goal.kind==='burst'?'💫':goal.kind==='moves'?'🧩':goal.kind==='mixed'?'⚡':goal.kind==='noUndo'?'👑':'🎯'; }
  function goalShort(goal){
    if(goal.title) return isTurkish() ? goal.title : (goal.titleEn||goal.title);
    const key='goalKind_'+(goal.kind||'score');
    const t=tx(key);
    return t!==key ? t : (goal.titleEn||goal.title||tx('goalKind_score'));
  }
  function goalSub(goal){ return goalDesc(goal); }
  function goalSteps(goal){
    const steps=[{icon:'🎯', label:`${goal.target} ${tx('goalPts')}`, key:'score', cur:score, need:goal.target}];
    if(goal.linesTarget) steps.unshift({icon:'💥', label:tx('goalLinesLabel',{n:goal.linesTarget}), key:'lines', cur:linesDone, need:goal.linesTarget});
    if(goal.chainTarget) steps.unshift({icon:'⛓', label:tx('goalChainLabel',{n:goal.chainTarget}), key:'chain', cur:adventureChainProgress(), need:goal.chainTarget});
    if(goal.burstTarget) steps.unshift({icon:'💫', label:tx('goalBurstLabel',{n:goal.burstTarget}), key:'burst', cur:adventureBurstProgress(), need:goal.burstTarget});
    if(goal.movesTarget) steps.unshift({icon:'🧩', label:tx('goalBlocksLabel',{n:goal.movesTarget}), key:'moves', cur:levelMoves, need:goal.movesTarget});
    if(goal.noUndo) steps.unshift({icon:'👑', label:tx('noUndoGoal'), key:'noUndo', cur:adventureUndoUsed?0:1, need:1});
    return steps;
  }
  function goalStepDone(step, goal){
    if(step.key==='score') return score >= goal.target;
    if(step.key==='lines') return linesDone >= goal.linesTarget;
    if(step.key==='chain') return adventureChainProgress() >= goal.chainTarget;
    if(step.key==='burst') return adventureBurstProgress() >= goal.burstTarget;
    if(step.key==='moves') return levelMoves >= goal.movesTarget;
    if(step.key==='noUndo') return !adventureUndoUsed;
    return false;
  }
  function adventureGoalProgressLine(){
    const goal=levelGoal(currentAdventureLevel);
    return goalSteps(goal).map(s=>{
      const done=goalStepDone(s, goal);
      return (done?'✓':'○')+' '+s.label;
    }).join(' • ');
  }
  function isAdventureGoalComplete(){
    const goal=levelGoal(currentAdventureLevel);
    if(score < goal.target) return false;
    if(goal.linesTarget && linesDone < goal.linesTarget) return false;
    if(goal.chainTarget && adventureChainProgress() < goal.chainTarget) return false;
    if(goal.burstTarget && adventureBurstProgress() < goal.burstTarget) return false;
    if(goal.movesTarget && levelMoves < goal.movesTarget) return false;
    if(goal.noUndo && adventureUndoUsed) return false;
    return true;
  }
  function starLimits(goal, lvl=currentAdventureLevel){
    const tier=Math.floor((lvl-1)/10);
    let three=15;
    if(goal.kind==='score') three = 12 + Math.ceil(goal.target/230);
    else if(goal.kind==='lines') three = 14 + (goal.linesTarget||2)*3;
    else if(goal.kind==='chain') three = 18 + (goal.chainTarget||2)*5;
    else if(goal.kind==='burst') three = 16 + (goal.burstTarget||2)*4;
    else if(goal.kind==='moves') three = 12 + Math.ceil((goal.movesTarget||12)*1.0);
    else if(goal.kind==='mixed') three = 20 + (goal.linesTarget||2)*3 + (goal.chainTarget||2)*4;
    else if(goal.kind==='noUndo') three = 14 + Math.ceil(goal.target/260);
    three += tier*3 + Math.floor(lvl/25)*4;
    three = Math.max(14, Math.min(90, Math.round(three)));
    const two = Math.round(three*(1.75 + Math.max(0,4-tier)*.03));
    const one = Math.round(three*(2.85 - Math.min(.75,tier*.06)));
    return {three, two, one};
  }
  function formatTime(sec){ sec=Math.max(0,Math.floor(sec||0)); const m=Math.floor(sec/60), ss=sec%60; return m?`${m}:${String(ss).padStart(2,'0')}`:tx('formatTimeSec',{n:ss}); }
  function calcAdventureStars(goal, elapsed){
    const t=starLimits(goal,currentAdventureLevel);
    let stars = elapsed<=t.three ? 3 : elapsed<=t.two ? 2 : elapsed<=t.one ? 1 : 0;
    if(adventureUndoUsed && stars>2) stars=2;
    return Math.max(0, Math.min(3, stars));
  }
  function applyAdventureScreenTheme(world){
    const screen=$('screenAdventure');
    if(!screen || !world) return;
    const parts=(world.grad||'#3a1a78,#12051f').split(',');
    screen.style.setProperty('--adv5-a', parts[0]||'#3a1a78');
    screen.style.setProperty('--adv5-b', parts[1]||'#12051f');
    screen.style.setProperty('--adv5-accent', world.accent||'#ffd65d');
    screen.dataset.world=world.id||'mir';
    const amb=$('adv5Ambient'); if(amb) amb.style.background=`radial-gradient(120% 80% at 50% -10%, ${world.accent}22, transparent 55%), linear-gradient(165deg, ${parts[0]}ee, ${parts[1]}f5)`;
  }
  function missionStepHtml(step, goal, live){
    const cur=live?step.cur:0;
    const pct=step.key==='noUndo' ? (step.cur?0:100) : Math.max(4, Math.min(100, Math.round((cur/(step.need||1))*100)));
    const done=live?goalStepDone(step, goal):false;
    return `<div class="adv5-step ${done?'done':''}"><span class="adv5-step-icon">${done?'✓':step.icon}</span><div class="adv5-step-copy"><b>${step.label}</b><i style="width:${done?100:pct}%"></i></div><em>${live?(done?tx('stepDone'):(step.key==='noUndo'?tx('stepWait'):`${Math.min(cur,step.need)}/${step.need}`)):step.need}</em></div>`;
  }
  function missionStepCompactHtml(step, goal, live){
    const cur=live?step.cur:0;
    const pct=step.key==='noUndo' ? (step.cur?0:100) : Math.max(4, Math.min(100, Math.round((cur/(step.need||1))*100)));
    const done=live?goalStepDone(step, goal):false;
    const val=live?(done?'✓':(step.key==='noUndo'?'—':`${Math.min(cur,step.need)}/${step.need}`)):step.need;
    return `<div class="adv5-hud-mini ${done?'done':''}"><span class="adv5-hud-mini-icon">${done?'✓':step.icon}</span><b>${val}</b><i style="width:${done?100:pct}%"></i></div>`;
  }
  function renderAdventureMissionHud(){
    const hud=$('adventureMissionHud');
    if(!hud) return;
    if(mode!=='adventure'){ hud.classList.add('hidden'); hud.innerHTML=''; return; }
    const goal=levelGoal(currentAdventureLevel), world=adventureWorld(currentAdventureLevel);
    const steps=goalSteps(goal);
    const landscapePhone=viewportInfo().landscape && tabletSizeClass()==='phone';
    const dense=steps.length>=2 || landscapePhone;
    hud.classList.remove('hidden');
    hud.classList.toggle('adv5-mission-hud--dense', dense);
    hud.classList.toggle('adv5-mission-hud--landscape', landscapePhone);
    if($('screenGame')) $('screenGame').classList.toggle('adv-hud-dense', dense);
    const coach=landscapePhone ? '' : missionCoachText(currentAdventureLevel, goal);
    if(dense){
      const cols=steps.length===2?' adv5-cols-2':'';
      const chips=steps.map(s=>missionStepCompactHtml(s, goal, true)).join('');
      hud.innerHTML=`${coach?`<div class="adv5-coach-banner adv5-coach-banner--hud anim-coach"><span>💡</span><p>${coach}</p></div>`:''}<div class="adv5-hud-dense-head">${world.icon} ${goalTitle(goal)}</div><div class="adv5-hud-dense-grid${cols}">${chips}</div>`;
    } else {
      const rows=steps.map(s=>missionStepHtml(s, goal, true)).join('');
      hud.innerHTML=`${coach?`<div class="adv5-coach-banner adv5-coach-banner--hud anim-coach"><span>💡</span><p>${coach}</p></div>`:''}<div class="adv5-hud-top"><span>${world.icon} ${tx('advChapter')} ${world.chapter} · ${goalTitle(goal)}</span></div><div class="adv5-hud-steps">${rows}</div>`;
    }
    syncViewportLayout();
  }
  function worldStarsMissing(min, max, maxPlayable){
    let earned=0, possible=0;
    for(let i=min;i<=max;i++){
      if(i<=maxPlayable){ possible+=3; earned+=(data.advStars[i]||0); }
    }
    return Math.max(0, possible-earned);
  }
  function missionCoachText(lvl, goal){
    if(lvl===3 && goal.kind==='burst') return tx('coachBurst');
    if(lvl===4 && goal.kind==='chain') return tx('coachChain');
    return '';
  }
  function missionCoachBanner(lvl, goal){
    const tip=missionCoachText(lvl, goal);
    return tip ? `<div class="adv5-coach-banner anim-coach" role="note"><span aria-hidden="true">💡</span><p>${tip}</p></div>` : '';
  }
  function renderAdventure(focusMap){
    const pendingStarRewards=applyStarRewards();
    if(pendingStarRewards.length) save();
    const maxPlayable=Math.min(data.adventureMax,ADVENTURE_MAX_LEVEL);
    selectedAdventureLevel = Math.max(1, Math.min(maxPlayable, selectedAdventureLevel || maxPlayable));
    const lvl=selectedAdventureLevel, goal=levelGoal(lvl), world=adventureWorld(lvl);
    const worldIdx=selectedAdventureWorldIdx!=null?selectedAdventureWorldIdx:adventureWorldIndexForLevel(lvl);
    selectedAdventureWorldIdx=worldIdx;
    const viewWorld=adventureWorlds[worldIdx];
    const worldMin=worldIdx*ADVENTURE_WORLD_SIZE+1;
    const worldMax=Math.min(ADVENTURE_MAX_LEVEL,(worldIdx+1)*ADVENTURE_WORLD_SIZE);
    applyAdventureScreenTheme(viewWorld);
    const stars=data.advStars[lvl]||0;
    const bestTime=data.advTimes[lvl]||0;
    const times=starLimits(goal,lvl);
    const starTotal=totalAdventureStars();
    if($('advStarTotal')) $('advStarTotal').textContent=starTotal;
    if($('advLevelHead')) $('advLevelHead').textContent=lvl;
    if($('adv5WorldTitle')) $('adv5WorldTitle').textContent=`${tx('advChapter')} ${viewWorld.chapter} • ${worldField(viewWorld,'name')}`;
    if($('advGridMeta')) $('advGridMeta').textContent=`${worldMin}-${worldMax}`;
    if($('levelTitle')) $('levelTitle').textContent=`${tx('level')} ${lvl}`;
    if($('adv5MissionType')) $('adv5MissionType').textContent=goalShort(goal);
    const starBest = stars ? `${'★'.repeat(stars)}${'☆'.repeat(3-stars)}${bestTime?' • '+formatTime(bestTime):''}` : tx('noneYet');
    const steps=goalSteps(goal).map(s=>missionStepHtml(s, goal, false)).join('');
    const nextReward=nextStarReward();
    const starRoad=nextReward ? `${starTotal}/${nextReward.stars} ★ • ${starRewardLabel(nextReward)}` : `${starTotal}/300 ★ • ${tx('starRoadDone')}`;
    const hero=$('adv5Hero');
    if(hero) hero.innerHTML=`
      <div class="adv5-hero-icon">${viewWorld.icon}</div>
      <div class="adv5-hero-copy">
        <small>${worldField(viewWorld,'tagline')}</small>
        <p>${worldField(viewWorld,'lore')}</p>
      </div>
      <div class="adv5-hero-side"><b>${Math.min(10, Math.max(0, Math.min(maxPlayable, worldMax)-worldMin+1))}</b><small>/10</small></div>`;
    const isReplay=lvl<maxPlayable;
    const replayHintEl=$('adv5ReplayHint');
    if(replayHintEl){
      if(isReplay){
        replayHintEl.textContent=tx('replayStarsHint');
        replayHintEl.classList.remove('hidden');
      } else replayHintEl.classList.add('hidden');
    }
    const startBtn=$('startAdventureBtn');
    startBtn.textContent = (isReplay ? tx('replay') : (lvl===ADVENTURE_MAX_LEVEL?tx('playFinal'):tx('playLevel'))).replace(/^/, '▶ ');
    startBtn.classList.toggle('replay-mode', isReplay);
    if($('adv5CoachSlot')) $('adv5CoachSlot').innerHTML=missionCoachBanner(lvl, goal);
    $('levelDesc').innerHTML=`
      <div class="adv5-mission-card adv5-mission-card-compact">
        <div class="adv5-mission-top"><span class="adv5-goal-icon">${goalIcon(goal)}</span><div><b>${goalTitle(goal)}</b><p>${goalDesc(goal)}</p></div></div>
        <div class="adv5-steps">${steps}</div>
        <div class="adv5-rewards"><span>🪙 ${goal.reward}</span><span>🏆 ${starBest}</span></div>
        <div class="adv5-star-road">⭐ ${starRoad}</div>
        <div class="adv5-star-times">
          <em>⭐⭐⭐ ${formatTime(times.three)}</em>
          <em>⭐⭐ ${formatTime(times.two)}</em>
          <em>⭐ ${formatTime(times.one)}</em>
        </div>
      </div>`;
    const box=$('levelGrid'); box.innerHTML='';
    const mapBox=$('worldMap'); if(mapBox) mapBox.innerHTML='';
    adventureWorlds.forEach((w,idx)=>{
      const min=idx*ADVENTURE_WORLD_SIZE+1, max=Math.min(ADVENTURE_MAX_LEVEL,(idx+1)*ADVENTURE_WORLD_SIZE);
      const active=worldIdx===idx;
      const unlocked=maxPlayable>=min;
      const done=maxPlayable>max;
      const chip=document.createElement('button');
      chip.type='button';
      chip.className='adv5-world-chip '+(active?'active ':'')+(done?'done ':'')+(unlocked?'':'locked');
      chip.style.setProperty('--chip-accent', w.accent);
      const doneInWorld=unlocked?Math.max(0, Math.min(ADVENTURE_WORLD_SIZE, maxPlayable-min+1)):0;
      const starsLeft=done?worldStarsMissing(min, max, maxPlayable):0;
      const statusSmall=done?(starsLeft?'':tx('advWorldDone')):unlocked?`${min}-${max}`:tx('locked');
      const replayLine=starsLeft>0?`<em class="adv5-replay-stars">${tx('replayStarsCta',{n:starsLeft})}</em>`:'';
      chip.innerHTML=`<span class="adv5-chip-icon">${w.icon}</span><b>${w.chapter}</b><span>${worldField(w,'name')}</span><small>${statusSmall}</small>${replayLine}<i style="width:${done?100:(unlocked?doneInWorld/ADVENTURE_WORLD_SIZE*100:0)}%"></i>`;
      chip.onclick=()=>{
        if(!unlocked) return toast(tx('locked').toUpperCase());
        selectedAdventureWorldIdx=idx;
        selectedAdventureLevel=Math.min(maxPlayable, active?lvl:min);
        adventureScrollPin=true;
        renderAdventure(true);
      };
      if(mapBox) mapBox.appendChild(chip);
    });
    for(let i=worldMin;i<=worldMax;i++){
      const locked=i>maxPlayable; const st=data.advStars[i]||0; const b=document.createElement('button');
      const gi=levelGoal(i); const wi=adventureWorld(i);
      b.className='adv5-level-node '+(i<maxPlayable?'done':i===maxPlayable?'current':'')+(i===lvl?' selected':'')+(locked?' locked':'');
      b.style.setProperty('--node-accent', wi.accent);
      b.innerHTML=`<span class="adv5-node-num">${locked?'🔒':i}</span><small>${locked?tx('locked'):(st?('★'.repeat(st)+'☆'.repeat(3-st)):goalIcon(gi))}</small>`;
      b.onclick=()=>{ if(locked) return toast(tx('locked').toUpperCase()); selectedAdventureLevel=i; selectedAdventureWorldIdx=worldIdx; adventureScrollPin=true; renderAdventure(true); };
      box.appendChild(b);
    }
    requestAnimationFrame(()=>{
      const sel=box.querySelector('.selected');
      if(sel) sel.scrollIntoView({block:'nearest', inline:'center', behavior:focusMap?'smooth':'auto'});
      if(focusMap && mapBox){
        const activeChip=mapBox.querySelector('.active');
        activeChip?.scrollIntoView({block:'nearest', inline:'center', behavior:'smooth'});
      }
    });
  }
  function renderThemes(){
    const list=$('themeList'); list.innerHTML=''; const all=[...themes]; if(data.customPhoto) all.unshift({id:'custom',name:tx('customPhotoTheme'),bg:`url('${data.customPhoto}')`,free:true});
    all.forEach(t=>{const c=document.createElement('button'); c.className='theme-card '+(data.theme===t.id?'active':''); c.innerHTML=`<div class="thumb" style="--bg:${t.bg}"></div><b>${t.name}${(!isOwned(t,'themes'))?' • '+t.price+'🪙':(data.theme===t.id?' • '+tx('active'):'')}</b>`; c.onclick=()=>{ if(!isOwned(t,'themes')) return buy(t,'themes',t.price,t.name,()=>{data.theme=t.id}); data.theme=t.id; refreshCounters(); renderThemes(); }; list.appendChild(c);});
    $('blurRange').value=data.blur; $('darkRange').value=data.dark;
  }
  function marketRarity(item,type){
    const price=item.price||0;
    if(price===0 || item.free) return 'free';
    if(type==='boosters') return price>=3000?'epic':price>=1800?'rare':'common';
    if(price>=6500) return 'mythic';
    if(price>=4400) return 'legendary';
    if(price>=2600) return 'epic';
    if(price>=1200) return 'rare';
    return 'common';
  }
  function rarityText(rarity){
    return {free:tx('free'),common:tx('common'),rare:tx('rare'),epic:tx('epic'),legendary:tx('legendary'),mythic:tx('mythic')}[rarity]||tx('common');
  }
  function marketSetName(item,type){
    const sets={};
    Object.keys(MARKET_SET_NAMES.tr||{}).forEach(k=>{
      const key=`mktSet_${k}`;
      const t=tx(key);
      sets[k]= t!==key ? t : (MARKET_SET_NAMES[data.lang]?.[k] || MARKET_SET_NAMES.en?.[k] || MARKET_SET_NAMES.tr[k]);
    });
    return sets[item.id] || (type==='boosters'?tx('marketBoosters'):tx('marketCollection'));
  }
  function starUnlockText(item,type){
    const reward=starRewards.find(r=> (r.type===type && r.item===item.id) || (r.bundle||[]).some(([t,id])=>t===type && id===item.id));
    return reward ? tx('starRewardAt',{n:reward.stars}) : '';
  }
  function blockPreview(item){
    const skin=item.id;
    const colors=['#ff5d7c','#32d7d2','#ffd34b','#a75cff','#43e36f','#ff9a3d','#56d7ff','#ff6dd8','#fff176'];
    const cells=colors.map((c,i)=>`<span class="mini-cell ${skin}" style="--c:${c};--i:${i}"></span>`).join('');
    return `<div class="block-preview rarity-${marketRarity(item,'blocks')}"><div class="block-preview-grid">${cells}</div><i></i></div>`;
  }
  function themeMarketPreview(item){
    return `<div class="theme-market-preview" style="--previewBg:${item.bg}"><span></span><span></span><span></span></div>`;
  }
  function effectMarketPreview(item){
    return `<div class="effect-preview fx-${item.id} rarity-${marketRarity(item,'effects')}"><span>${effectIcon(item.id)}</span><i></i><em></em></div>`;
  }
  function boosterPreview(item){
    return `<div class="booster-preview"><span class="booster-grant">${item.preview||'⚡'}</span></div>`;
  }
  function marketPreview(item,type){
    if(type==='blocks') return blockPreview(item);
    if(type==='effects') return effectMarketPreview(item);
    if(type==='themes') return themeMarketPreview(item);
    return boosterPreview(item);
  }
  function renderMarket(tab=document.querySelector('#customizeMarketSubTabs .active')?.dataset.tab||document.querySelector('.market-tabs .active')?.dataset.tab||'themes'){ if(!['themes','blocks','effects','boosters'].includes(tab)) tab='themes';
    const list=$('marketList'); list.innerHTML='';
    const title=document.createElement('div'); title.className='market-section-title';
    title.textContent = tab==='themes'?tx('marketThemes'):tab==='blocks'?tx('marketBlocks'):tab==='effects'?tx('marketEffects'):tx('marketBoosters');
    list.appendChild(title);
    const add=(item,type)=>{
      const ownedRaw=isOwned(item,type);
      const owned=(type==='boosters' && item.repeatable) ? false : ownedRaw;
      const selected=(type==='themes' && data.theme===item.id) || (type==='blocks' && data.skin===item.id) || (type==='effects' && data.effect===item.id);
      const rarity=marketRarity(item,type);
      const setName=marketSetName(item,type);
      const unlockHint=starUnlockText(item,type);
      const c=document.createElement('div');
      c.className='market-card '+type+' rarity-'+rarity+' '+(owned?'owned ':'')+(selected?'selected ':'')+((type==='boosters' && owned)?'booster-owned ':'')+((type==='boosters' && item.repeatable)?'booster-repeatable ':'');
      const btnText = type==='boosters' ? (owned ? tx('bought') : item.price+' 🪙 '+tx('buy')) : (!owned ? item.price+' 🪙' : (selected ? tx('selected') : tx('choose')));
      const btnClass = type==='boosters' ? (owned ? 'selected-btn booster-bought' : 'booster-btn') : (!owned ? 'buy-btn' : (selected ? 'selected-btn' : 'pick-btn'));
      const icon = type==='themes'?'🎨':type==='blocks'?'🧱':type==='effects'?'✨':'⚡';
      const status = selected ? tx('active') : owned ? tx('opened') : (unlockHint || '');
      const foot = `
        <div class="market-card-foot${type==='boosters'?' booster-foot':''}">
          <span>${setName}</span>
          ${status ? `<em>${status}</em>` : (type==='boosters' && item.repeatable ? `<em>${tx('boosterRepeatable')}</em>` : '')}
        </div>`;
      c.innerHTML=`
        <div class="market-card-head">
          <b>${icon} ${catName(item,type)}</b>
          <span class="rarity-pill">${rarityText(rarity)}</span>
        </div>
        ${marketPreview(item,type)}
        <p>${catDesc(item,type)||descFor(type)}</p>
        ${foot}
        <button class="${btnClass}" ${type==='boosters' && owned?'disabled':''}>${btnText}</button>`;
      c.querySelector('button').onclick=()=>{
        playTone('tap');
        if(type==='boosters') return buyBooster(item);
        if(!owned) return buy(item,type,item.price,catName(item,type),()=>{ if(type==='blocks')data.skin=item.id; else if(type==='effects')data.effect=item.id; else data.theme=item.id; });
        if(type==='blocks') data.skin=item.id; else if(type==='effects') data.effect=item.id; else data.theme=item.id;
        toast(tx('activeItem',{n:catName(item,type)})); playTone('coin');
        refreshCounters(); renderMarket(tab);
      };
      list.appendChild(c);
    };
    if(tab==='themes') themes.forEach(t=>add(t,'themes'));
    if(tab==='blocks') blockSkins.forEach(s=>add(s,'blocks'));
    if(tab==='effects') effects.forEach(e=>add(e,'effects'));
    if(tab==='boosters'){
      boosters.forEach(b=>add(b,'boosters'));
    }
  }
  function effectIcon(id){ const map={star:'✦',confetti:'🎉',bluefx:'💧',sparkfx:'✦',strawberryfx:'🍓',crownfx:'👑',neonfx:'✧',lightningfx:'⚡',flamefx:'🔥',crystalfx:'💎',aurorafx:'❇',royalfx:'⬟',rainbowfx:'🌈',prismfx:'◇',blockrainfx:'▣',galaxyfx:'🌌',stormfx:'❄',supernovafx:'☀',kingfx:'👑',goldrainfx:'💰',emberfx:'✹',solarfx:'☀',mirfx:'BM',holofx:'◇',legendfx:'✹',nebulafx:'⬟',quantumfx:'◇',aetherfx:'✦',mircorefx:'BM',luxburst:'👑',champagnefx:'🥂',velvetfx:'✦'}; return map[id]||'✦'; }
  function descFor(type){ return type==='blocks'?tx('marketDescBlocks'):type==='effects'?tx('marketDescEffects'):tx('marketDescThemes'); }
  function buy(item,type,price,name,after){
    if(data.coins<price) return toast(tx('notEnoughCoins'));
    data.coins-=price;
    markOwned(item,type);
    after&&after();
    toast(name+' '+tx('opened'));
    refreshCounters();
    if(type==='themes') renderThemes();
    renderMarket(type);
  }
  function buyBooster(item){
    const repeatable=!!item.repeatable;
    if(!repeatable && isOwned(item,'boosters')) return toast(tx('bought'));
    if(data.coins<item.price) return toast(tx('notEnoughCoins'));
    data.coins-=item.price;
    if(!repeatable) markOwned(item,'boosters');
    if(item.id==='hint5')data.hints+=5;
    if(item.id==='undo5')data.undos+=5;
    if(item.id==='starter'){data.hints+=3;data.undos+=3;}
    if(item.id==='saveRun'){data.undos+=8;data.hints+=4;}
    if(item.id==='adventurePack'){data.hints+=10;data.undos+=10;}
    toast(tx('boosterBought')); playTone('coin'); refreshCounters(); renderMarket('boosters'); }
  function dayKey(d=new Date()){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function dayKeyForWeekday(weekday, ref=new Date()){
    const d=new Date(ref);
    d.setDate(d.getDate()+(weekday-d.getDay()));
    return dayKey(d);
  }
  function blitzTimeExpired(){
    return mode==='daily'&&dailyModActive('blitz')&&dailyBlitzEnd>0&&Date.now()>=dailyBlitzEnd;
  }
  function handleBlitzExpiry(){
    if(!blitzTimeExpired()) return false;
    stopDailyBlitzTimer();
    if(busy){ blitzExpiredPending=true; return true; }
    gameOver();
    return true;
  }
  function dayTime(value){
    if(!value) return 0;
    if(/^\d{4}-\d{2}-\d{2}$/.test(value)){ const [y,m,d]=value.split('-').map(Number); return new Date(y,m-1,d).setHours(0,0,0,0); }
    const parsed=new Date(value); return isNaN(parsed) ? 0 : new Date(parsed.getFullYear(),parsed.getMonth(),parsed.getDate()).getTime();
  }
  function dailyGap(){ const prev=dayTime(data.daily); if(!prev) return null; return Math.round((dayTime(dayKey())-prev)/86400000); }
  const STREAK_WEEK = 7;
  function addDaysToDayKey(key, days){
    const t=dayTime(key);
    const d=new Date(t);
    d.setDate(d.getDate()+days);
    return dayKey(d);
  }
  function hasStreakChestLuck(){
    const until=data.dailyStreakLuckUntil;
    if(!until) return false;
    return dayTime(dayKey())<=dayTime(until);
  }
  function streakWeekDay(streak){
    if(!streak) return 0;
    const rem=streak%STREAK_WEEK;
    return rem===0?STREAK_WEEK:rem;
  }
  function unclaimedAchievementCount(){
    return achievements.filter(a=>a.done() && !data.claimed[a.id]).length;
  }
  function updateNavAchBadge(){
    const n=unclaimedAchievementCount();
    const el=$('navAchCount');
    if(!el) return;
    el.textContent=n>99?'99+':String(n);
    el.classList.toggle('hidden', n<=0);
  }
  function updateDailyStreak(){
    const today=dayKey();
    const last=data.dailyStreakLast;
    if(last===today) return Math.max(1, data.dailyStreak||1);
    if(!last) data.dailyStreak=1;
    else{
      const gap=Math.round((dayTime(today)-dayTime(last))/86400000);
      data.dailyStreak=gap===1?Math.max(1,(data.dailyStreak||0)+1):1;
    }
    data.dailyStreakLast=today;
    save(true);
    return data.dailyStreak;
  }
  function applyDailyStreakBonus(){
    const today=dayKey();
    if(data.dailyStreakClaimed===today) return 0;
    const n=updateDailyStreak();
    let bonus=0;
    if(n>0 && n%STREAK_WEEK===0){
      bonus=120;
      data.coins+=bonus;
      data.dailyStreakLuckUntil=addDaysToDayKey(today, STREAK_WEEK-1);
      toast(tx('dailyStreakWeekReward',{n:bonus,days:STREAK_WEEK}));
    }
    data.dailyStreakClaimed=today;
    save(true);
    renderMenuStreak();
    return bonus;
  }
  function currentDailyStreak(){
    const today=dayKey();
    if(data.dailyStreakLast===today) return Math.max(0, data.dailyStreak||0);
    if(!data.dailyStreakLast) return 0;
    const gap=Math.round((dayTime(today)-dayTime(data.dailyStreakLast))/86400000);
    return gap===1?Math.max(0,data.dailyStreak||0):0;
  }
  function renderMenuStreak(){
    const streak=currentDailyStreak();
    const el=$('menuStreakBadge');
    if(el){
      el.textContent=streak>0?tx('dailyStreakMenu',{n:streak}):'';
      el.classList.toggle('hidden', streak<=0);
    }
    const sub=$('dailyBtnSub');
    if(sub) sub.textContent=tx('dailyMenuSub');
  }
  function awardDailyTrophy(modId, sc){
    if(!modId||sc<=0||data.dailyTrophies?.[modId]) return;
    if(!data.dailyTrophies) data.dailyTrophies={};
    data.dailyTrophies[modId]={date:dayKey(),score:sc};
    save(true);
    toast(tx('dailyTrophyEarned',{mode:dailyModeName(modId)}));
  }
  function renderDailyStreak(){
    const el=$('dailyStreakStrip');
    if(!el) return;
    const streak=currentDailyStreak();
    const weekDay=streakWeekDay(streak);
    const luck=hasStreakChestLuck();
    const hint=luck?tx('dailyStreakLuckActive'):(streak>0?tx('dailyStreakWeekProgress',{cur:weekDay,total:STREAK_WEEK}):tx('dailyStreakWeekHint'));
    el.innerHTML=`<div class="daily-streak-card"><div class="daily-streak-main"><b>${tx('dailyStreakTitle')}</b><span class="daily-streak-num">🔥 ${streak}</span></div><div class="daily-streak-weekbar" aria-hidden="true">${Array.from({length:STREAK_WEEK},(_,i)=>`<i class="${i<weekDay?'on':''}"></i>`).join('')}</div><small>${hint}</small></div>`;
  }
  function renderDailyTrophies(){
    const grid=$('dailyTrophyGrid');
    if(!grid||!BD) return;
    grid.innerHTML='';
    const head=document.createElement('div');
    head.className='daily-trophy-head';
    head.innerHTML=`<b>${tx('dailyTrophyTitle')}</b><span>${Object.keys(data.dailyTrophies||{}).length}/${BD.MODE_IDS.length}</span>`;
    grid.appendChild(head);
    const row=document.createElement('div');
    row.className='daily-trophy-row';
    BD.MODES.forEach(mod=>{
      const earned=!!data.dailyTrophies?.[mod.id];
      const chip=document.createElement('div');
      chip.className='daily-trophy-chip'+(earned?' earned':'');
      chip.title=earned?tx('dailyTrophyEarned',{mode:dailyModeName(mod.id)}):tx('dailyTrophyLocked',{mode:dailyModeName(mod.id)});
      chip.innerHTML=`<span>${mod.icon}</span><small>${dailyModeName(mod.id)}</small>`;
      row.appendChild(chip);
    });
    grid.appendChild(row);
  }
  function shareModeLabel(){
    if(mode==='classic8') return '8×8';
    if(mode==='classic10') return '10×10';
    if(mode==='daily') return dailyModeName(dailyModId);
    if(mode==='adventure') return tx('scoreAdventure');
    return tx('scoreClassic');
  }
  function shareScoreText(sc){
    const s=sc??score;
    return tx('shareScoreBody',{mode:shareModeLabel(),score:s,app:'BlockMir'});
  }
  async function buildShareScoreCard(sc){
    const s=sc??score;
    const size=400;
    const canvas=document.createElement('canvas');
    canvas.width=size; canvas.height=size;
    const ctx=canvas.getContext('2d');
    if(!ctx) throw new Error('canvas');
    const theme=boardFrameForTheme(activeThemeId());
    const bg=ctx.createLinearGradient(0,0,size,size);
    bg.addColorStop(0, theme.mid);
    bg.addColorStop(1, theme.inner);
    ctx.fillStyle=bg;
    ctx.fillRect(0,0,size,size);
    ctx.strokeStyle=theme.accent;
    ctx.lineWidth=10;
    ctx.strokeRect(14,14,size-28,size-28);
    const img=new Image();
    await new Promise(resolve=>{
      img.onload=()=>resolve();
      img.onerror=()=>resolve();
      img.src='assets/icon-512.png';
    });
    if(img.naturalWidth){
      ctx.save();
      ctx.beginPath();
      ctx.arc(200,96,62,0,Math.PI*2);
      ctx.clip();
      ctx.drawImage(img,138,34,124,124);
      ctx.restore();
      ctx.strokeStyle=theme.outer;
      ctx.lineWidth=4;
      ctx.beginPath();
      ctx.arc(200,96,62,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.textAlign='center';
    ctx.fillStyle='#fff';
    ctx.font='bold 28px system-ui,sans-serif';
    ctx.fillText('BlockMir',200,182);
    const modeLabel=shareModeLabel();
    ctx.font='700 20px system-ui,sans-serif';
    ctx.fillStyle=theme.accent;
    ctx.fillText(modeLabel,200,216);
    ctx.font='bold 72px system-ui,sans-serif';
    ctx.fillStyle='#fff';
    ctx.shadowColor=theme.accent;
    ctx.shadowBlur=18;
    ctx.fillText(String(s),200,300);
    ctx.shadowBlur=0;
    return canvas.toDataURL('image/png');
  }
  async function shareCurrentScore(sc){
    const text=shareScoreText(sc);
    try{
      const dataUrl=await buildShareScoreCard(sc);
      if(window.BlockMirAndroid?.shareImage){
        window.BlockMirAndroid.shareImage(dataUrl, text);
        return;
      }
      if(navigator.canShare){
        const res=await fetch(dataUrl);
        const blob=await res.blob();
        const file=new File([blob],'blockmir-score.png',{type:'image/png'});
        if(navigator.canShare({files:[file]})){
          await navigator.share({title:tx('shareScoreTitle'),text,files:[file]});
          return;
        }
      }
    }catch(_){}
    try{
      if(window.BlockMirAndroid?.shareText){ window.BlockMirAndroid.shareText(text); return; }
    }catch(_){}
    if(navigator.share){
      navigator.share({title:tx('shareScoreTitle'),text}).catch(()=>{});
      return;
    }
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(text).then(()=>toast(tx('shareCopied'))).catch(()=>toast(tx('shareUnavailable')));
      return;
    }
    toast(tx('shareUnavailable'));
  }
  function syncShareScoreBtn(sc){
    const btn=$('shareScoreBtn');
    if(!btn) return;
    const show=(mode==='classic8'||mode==='classic10'||mode==='daily')&&(sc??score)>0;
    btn.classList.toggle('hidden', !show);
    btn.textContent=tx('shareScore');
  }
  function daily(){ show('screenDaily'); }
  function openDailyChest(){
    if(dailyChestOpening) return;
    if(dailyGap()===0) return toast(tx('dailyClaimed'));
    dailyChestOpening=true;
    const reward=BD.rollChest(chestRng(), pickDailyCosmetic, {luckBoost:hasStreakChestLuck()});
    data.daily=dayKey();
    data.dailyChestReward={date:dayKey(),reward:serializeDailyChestReward(reward)};
    save(true);
    const box=$('dailyChestBox'), stage=$('dailyChestStage'), reveal=$('dailyChestReveal');
    if(box) box.classList.add('open','shake');
    if($('dailyChestOpenBtn')) $('dailyChestOpenBtn').disabled=true;
    spawnDailyChestBurst(reward);
    setTimeout(()=>{
      applyDailyReward(reward);
      addXP(35);
      applyDailyStreakBonus();
      if(reveal){
        reveal.classList.remove('hidden');
        reveal.classList.add('pop');
        const tier=reward.tier||(reward.type==='cosmetic'?'rare':reward.type==='coins'&&reward.amount>=900?'epic':'common');
        if($('dailyRevealRarity')) $('dailyRevealRarity').textContent=rarityText(tier);
        if($('dailyRevealTitle')) $('dailyRevealTitle').textContent=dailyRewardTitle(reward);
        if($('dailyRevealDesc')) $('dailyRevealDesc').textContent=dailyRewardDesc(reward);
      }
      if($('dailyChestOpenBtn')) $('dailyChestOpenBtn').textContent=tx('dailyChestDone');
      if($('dailyChestHint')) $('dailyChestHint').textContent=tx('dailyChestDone');
      if(stage) stage.classList.remove('chest-opening');
      if($('dailyChestAura')) $('dailyChestAura').classList.remove('show');
      if($('dailyChestBurst')) $('dailyChestBurst').classList.remove('show');
      toast(dailyRewardTitle(reward));
      dailyChestOpening=false;
      renderDaily();
    },1200);
  }
  function renderDaily(){
    if(!BD) return;
    setDailyHubTab(dailyHubTab);
    renderDailyStreak();
    renderDailyTrophies();
    if($('dailyHubTitle')) $('dailyHubTitle').textContent=tx('dailyHub');
    if($('dailyTabRewardBtn')) $('dailyTabRewardBtn').textContent=tx('dailyTabReward');
    if($('dailyTabChallengeBtn')) $('dailyTabChallengeBtn').textContent=tx('dailyTabChallenge');
    if($('dailyModeBoardTitle')) $('dailyModeBoardTitle').textContent=tx('dailyModeBoardTitle');
    if($('dailyModeBoardSub')) $('dailyModeBoardSub').textContent=tx('dailyModeBoardSub');
    if($('dailyChallengePlayBtn')) $('dailyChallengePlayBtn').textContent=tx('dailyChallengePlay');
    const claimed=dailyGap()===0;
    const hint=$('dailyChestHint'), openBtn=$('dailyChestOpenBtn'), box=$('dailyChestBox'), reveal=$('dailyChestReveal');
    if(hint) hint.textContent=claimed?tx('dailyChestDone'):tx('dailyChestHint');
    if(openBtn){
      openBtn.textContent=claimed?tx('dailyChestDone'):tx('dailyChestOpen');
      openBtn.disabled=claimed||dailyChestOpening;
      openBtn.classList.toggle('hidden', claimed);
    }
    if(box){ box.classList.toggle('open', claimed); box.disabled=claimed; }
    if(reveal) reveal.classList.toggle('hidden', !claimed);
    if(claimed && reveal){
      const savedReward=savedDailyChestReward();
      if(savedReward){
        const tier=savedReward.tier||(savedReward.type==='cosmetic'?'rare':savedReward.type==='coins'&&(savedReward.amount||0)>=900?'epic':'common');
        if($('dailyRevealRarity')) $('dailyRevealRarity').textContent=rarityText(tier);
        if($('dailyRevealTitle')) $('dailyRevealTitle').textContent=dailyRewardTitle(savedReward);
        if($('dailyRevealDesc')) $('dailyRevealDesc').textContent=dailyRewardDesc(savedReward);
      } else if($('dailyRevealTitle')) $('dailyRevealTitle').textContent=tx('dailyChestDone');
    }
    const today=BD.todayMode();
    const todayEl=$('dailyChallengeToday');
    if(todayEl){
      todayEl.innerHTML=`<div class="daily-today-badge">${tx('dailyToday')}</div><div class="daily-today-icon">${today.icon}</div><b>${dailyModeName(today.id)}</b><p>${dailyModeDesc(today.id, today)}</p><span class="daily-today-best">${tx('bestSuffix')}: ${dailyBestScore(today.id)}</span>`;
    }
    const playBtn=$('dailyChallengePlayBtn');
    if(playBtn){
      playBtn.disabled=!dailyModePlayable(today.id);
      playBtn.onclick=()=>{ playTone('tap'); startDailyChallenge(today.id); };
    }
    const list=$('dailyModeScoreList');
    if(list){
      list.innerHTML='';
      const dayNames=[tx('dailyDay0'),tx('dailyDay1'),tx('dailyDay2'),tx('dailyDay3'),tx('dailyDay4'),tx('dailyDay5'),tx('dailyDay6')];
      BD.MODES.slice().sort((a,b)=>a.weekday-b.weekday).forEach(mod=>{
        const isToday=mod.id===today.id;
        const playable=dailyModePlayable(mod.id);
        const row=document.createElement('button');
        row.type='button';
        row.className='daily-mode-row'+(isToday?' today':'')+(playable?' playable':' locked');
        row.innerHTML=`<span class="daily-mode-day">${dayNames[mod.weekday]}</span><span class="daily-mode-icon">${mod.icon}</span><span class="daily-mode-copy"><b>${dailyModeName(mod.id)}</b><small>${dailyModeDesc(mod.id, mod)}</small></span><span class="daily-mode-score">${dailyBestScore(mod.id)}</span>`;
        if(playable) row.onclick=()=>{ playTone('tap'); startDailyChallenge(mod.id); };
        else row.onclick=()=>toast(tx('dailyLockedDay'));
        list.appendChild(row);
      });
    }
  }
  const achIcons={first:'🧩',classic8:'8️⃣',classic10:'🔟',score1000:'🏅',score5000:'🥇',score10000:'👑',score25000:'💎',combo3:'🔥',combo5:'⚡',lines50:'💥',lines250:'🌪',games10:'🎮',games50:'🏆',adv10:'🗺',adv50:'🚀',adv100:'🌟',level10:'⭐',level20:'✨',level50:'💫',collector:'🎨',rich:'🪙'};
  function achTier(id){
    if(/25000|adv100|level50|lines250/.test(id)) return 'legendary';
    if(/10000|adv50|level20|combo5|rich/.test(id)) return 'epic';
    if(/5000|adv10|level10|combo3|lines50|games10/.test(id)) return 'rare';
    return 'common';
  }
  function renderAchievements(){
    const list=$('achList'); if(!list) return;
    list.innerHTML='';
    let doneCount=0, claimedCount=0;
    achievements.forEach(a=>{
      const done=a.done(); if(done) doneCount++;
      const claimed=!!data.claimed[a.id]; if(claimed) claimedCount++;
      const tier=achTier(a.id);
      const row=document.createElement('div');
      row.className='ach-row ach-card-premium tier-'+tier+' '+(done?'done':'')+' '+(claimed?'claimed':'');
      const icon=achIcons[a.id]||'🏅';
      const btnText=claimed?tx('claimedBtn'):done?`+${a.reward} 🪙`:tx('lockedBtn');
      row.innerHTML=`
        <div class="ach-card-icon">${icon}</div>
        <div class="ach-card-copy"><b>${achTitle(a)}</b><p>${achDesc(a)}</p><span class="ach-tier-pill">${rarityText(tier)}</span></div>
        <button type="button" ${claimed||!done?'disabled':''}>${btnText}</button>`;
      row.querySelector('button').onclick=()=>{
        if(!done||claimed) return;
        data.claimed[a.id]=true; data.coins+=a.reward; addXP(75); playTone('coin');
        toast(tx('achReward')+' +'+a.reward+'🪙');
        refreshCounters(); renderAchievements(); updateNavAchBadge();
      };
      list.appendChild(row);
    });
    const hero=document.createElement('div');
    hero.className='ach-hero';
    hero.innerHTML=`<div><small>${tx('achCollection')}</small><b>${doneCount}/${achievements.length}</b><p>${claimedCount} ${tx('rewardsClaimed')}</p></div><span>⭐</span>`;
    list.prepend(hero);
    $('achCount').textContent=doneCount+'/'+achievements.length;
  }
  function renderStats(){
    const box=$('statsList'); if(!box) return;
    box.innerHTML='';
    const totalStars=totalAdventureStars();
    const advMax=Math.min(data.adventureMax,ADVENTURE_MAX_LEVEL);
    const need=xpNeed(data.playerLevel);
    const xpPct=Math.max(3,Math.min(100,(data.xp/need)*100));
    const badgeList=[
      {name:tx('badgeFirstRecord'), on:maxClassicBest()>0},
      {name:tx('badgeComboMaster'), on:data.bestCombo>=3},
      {name:tx('badge10King'), on:data.best10>=1000},
      {name:tx('badgeAdvTravel'), on:advMax>=10},
      {name:tx('badgeStarHunter'), on:totalStars>=30},
      {name:tx('badgeCrownOwner'), on:ownedCount()>=10},
      {name:tx('badgeBlockMaster'), on:data.moves>=250}
    ];
    const unlocked=badgeList.filter(x=>x.on).length;
    const milestones=[10,25,50,75,100];
    const nextReward=nextStarReward();

    const hero=document.createElement('div');
    hero.className='sp-hero';
    hero.innerHTML=`
      <div class="sp-hero-glow" aria-hidden="true"></div>
      <div class="sp-hero-avatar"><img src="assets/icon-512.png" alt=""><span>👑</span></div>
      <div class="sp-hero-copy">
        <small>${tx('statsProfile')}</small>
        <h3>${tx('level')} ${data.playerLevel}</h3>
        <p>${data.xp} / ${need} XP • ${unlocked}/${badgeList.length} ${tx('badges')}</p>
        <div class="sp-xp"><i style="width:${xpPct}%"></i></div>
      </div>
      <div class="sp-hero-coins"><b>${data.coins}</b><small>🪙</small></div>`;
    box.appendChild(hero);

    const records=document.createElement('div');
    records.className='sp-section';
    records.innerHTML=`<div class="sp-section-head"><b>${tx('statsRecords')}</b><span>${tx('boardSizeTag')}</span></div>`;
    const tileGrid=document.createElement('div');
    tileGrid.className='sp-tile-grid';
    [
      ['8x8', data.best8, tx('statsClassicBest')],
      ['10x10', data.best10, tx('statsWideBoard')],
      ['★', totalStars+'/300', tx('statsAdvStars')],
      [tx('statsComboLabel'), 'x'+data.bestCombo, tx('statsBestCombo')]
    ].forEach(([a,b,c])=>{
      const t=document.createElement('div'); t.className='sp-tile';
      t.innerHTML=`<em>${c}</em><b>${b}</b><small>${a}</small>`;
      tileGrid.appendChild(t);
    });
    records.appendChild(tileGrid);
    box.appendChild(records);

    const journey=document.createElement('div');
    journey.className='sp-section sp-journey';
    const advPct=Math.round((advMax/ADVENTURE_MAX_LEVEL)*100);
    journey.innerHTML=`
      <div class="sp-section-head"><b>${tx('statsJourney')}</b><span>${advMax}/${ADVENTURE_MAX_LEVEL}</span></div>
      <div class="sp-journey-bar"><i style="width:${advPct}%"></i></div>
      <div class="sp-milestones">${milestones.map(m=>`<span class="${advMax>=m?'done':''}">${m}</span>`).join('')}</div>
      <p class="sp-journey-note">${nextReward ? tx('statsNextStar')+': '+starRewardLabel(nextReward)+' • '+totalStars+'/'+nextReward.stars+'★' : tx('statsStarDone')}</p>`;
    box.appendChild(journey);

    const badges=document.createElement('div');
    badges.className='sp-section';
    badges.innerHTML=`<div class="sp-section-head"><b>${tx('statsBadges')}</b><span>${unlocked}/${badgeList.length}</span></div>`;
    const badgeWrap=document.createElement('div');
    badgeWrap.className='sp-badges';
    badgeList.forEach(b=>{
      const chip=document.createElement('span');
      chip.className='sp-badge '+(b.on?'on':'off');
      chip.innerHTML=`<i>${b.on?'🏅':'🔒'}</i><b>${b.name}</b>`;
      badgeWrap.appendChild(chip);
    });
    badges.appendChild(badgeWrap);
    box.appendChild(badges);

    const activity=document.createElement('div');
    activity.className='sp-section';
    activity.innerHTML=`<div class="sp-section-head"><b>${tx('statsActivity')}</b><span>v${APP_VERSION}</span></div>`;
    const rows=document.createElement('div');
    rows.className='sp-rows';
    [
      [tx('statsTotalGames'), data.games],
      [tx('statsMoves'), data.moves],
      [tx('statsLines'), data.lines],
      ['8x8', data.classic8Games||0],
      ['10x10', data.classic10Games||0],
      [tx('statsMarketItems'), ownedCount()],
      [tx('hint'), data.hints],
      [tx('undo'), data.undos]
    ].forEach(([k,v])=>{
      const r=document.createElement('div'); r.className='sp-row';
      r.innerHTML=`<span>${k}</span><b>${v}</b>`;
      rows.appendChild(r);
    });
    activity.appendChild(rows);
    box.appendChild(activity);
  }
  function loadImageForTheme(file){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file);
      const img=new Image();
      img.onload=()=>{ URL.revokeObjectURL(url); resolve(img); };
      img.onerror=()=>{ URL.revokeObjectURL(url); reject(new Error('image-load-failed')); };
      img.src=url;
    });
  }
  async function compressThemePhoto(file){
    if(!file || !/^image\//.test(file.type||'')) throw new Error('invalid-image');
    const img=await loadImageForTheme(file);
    const maxSide=1320;
    const minSide=1200;
    const targetBytes=880*1024;
    const width=img.naturalWidth||img.width||1;
    const height=img.naturalHeight||img.height||1;
    const scale=Math.min(1, maxSide/Math.max(width,height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1, Math.round(width*scale));
    canvas.height=Math.max(1, Math.round(height*scale));
    const ctx=canvas.getContext('2d', {alpha:false});
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.fillStyle='#12051f';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const encode=()=>{
      let quality=.82;
      let dataUrl=canvas.toDataURL('image/jpeg', quality);
      while(dataUrl.length>targetBytes && quality>.68){
        quality-=.04;
        dataUrl=canvas.toDataURL('image/jpeg', quality);
      }
      return dataUrl;
    };
    let dataUrl=encode();
    if(dataUrl.length>targetBytes && Math.max(canvas.width,canvas.height)>minSide){
      const shrink=minSide/Math.max(canvas.width,canvas.height);
      const small=document.createElement('canvas');
      small.width=Math.max(1,Math.round(canvas.width*shrink));
      small.height=Math.max(1,Math.round(canvas.height*shrink));
      const smallCtx=small.getContext('2d',{alpha:false});
      smallCtx.imageSmoothingEnabled=true;
      smallCtx.imageSmoothingQuality='high';
      smallCtx.fillStyle='#12051f';
      smallCtx.fillRect(0,0,small.width,small.height);
      smallCtx.drawImage(canvas,0,0,small.width,small.height);
      canvas.width=small.width;
      canvas.height=small.height;
      ctx.drawImage(small,0,0);
      dataUrl=encode();
    }
    return dataUrl;
  }
  async function handlePhoto(file){
    if(!file)return;
    try{
      const photo=await compressThemePhoto(file);
      setCustomPhoto(photo);
    }catch(e){
      data.customPhoto='';
      if(data.theme==='custom') data.theme='mir';
      try{ localStorage.removeItem(LS+'photo'); }catch(_){}
      refreshCounters();
      renderThemes();
      toast(tx('photoFailed'));
    }finally{
      if($('photoInput')) $('photoInput').value='';
    }
  }
  function setCustomPhoto(photo){
    if(!photo || typeof photo !== 'string' || !photo.startsWith('data:image/')) throw new Error('invalid-photo-data');
    data.customPhoto=photo;
    data.theme='custom';
    data.blur=0;
    data.dark=0;
    photoQuotaWarned=false;
    refreshCounters();
    renderThemes();
    toast(tx('photoSelected'));
  }
  function pickPhoto(){
    playTone('tap');
    if(window.BlockMirAndroid && typeof window.BlockMirAndroid.pickPhoto === 'function'){
      window.BlockMirAndroid.pickPhoto();
      return;
    }
    $('photoInput').click();
  }
  window.BlockMirReceiveAndroidPhoto=(photo)=>{
    try{ setCustomPhoto(photo); }
    catch(e){ toast(tx('photoFailed')); }
  };
  window.BlockMirPhotoPickFailed=()=>toast(tx('photoFailed'));
  function reviewKey(){ return LS + 'reviewAsked_' + APP_VERSION.split('.').join('_'); }
  function reviewAttemptKey(){ return LS + 'reviewAttempts_' + APP_VERSION.split('.').join('_'); }
  function reviewLastKey(){ return LS + 'reviewLast_' + APP_VERSION.split('.').join('_'); }
  function requestReview(force=false){
    playTone('tap');
    try{
      if(force && window.BlockMirAndroid && typeof window.BlockMirAndroid.openStoreReview === 'function'){
        window.BlockMirAndroid.openStoreReview();
        localStorage.setItem(reviewKey(), '1');
        toast(tx('reviewAsk'));
        return true;
      }
      if(window.BlockMirAndroid && typeof window.BlockMirAndroid.requestReview === 'function'){
        const attempts=(+localStorage.getItem(reviewAttemptKey())||0)+1;
        localStorage.setItem(reviewAttemptKey(), String(attempts));
        localStorage.setItem(reviewLastKey(), String(Date.now()));
        window.BlockMirAndroid.requestReview();
        if(force) toast(tx('reviewAsk'));
        return true;
      }
    }catch(_){ }
    toast(tx('reviewUnavailable'));
    return false;
  }
  function maybeRequestReview(){
    if(localStorage.getItem(reviewKey())==='1') return;
    const attempts=+localStorage.getItem(reviewAttemptKey())||0;
    if(attempts>=3) return;
    const last=+localStorage.getItem(reviewLastKey())||0;
    if(last && Date.now()-last < 6*60*60*1000) return;
    const enoughPlay = data.games>=2 || data.adventureMax>=4 || maxClassicBest()>=800 || data.moves>=90 || data.lines>=10;
    if(!enoughPlay) return;
    setTimeout(()=>requestReview(false), 1200);
  }
  window.BlockMirReviewFinished=()=>toast(tx('reviewThanks'));
  const TUTORIAL_SLIDES = [
    { scene:'interactive', lesson:'place', title:'tutSlidePlaceTitle' },
    { scene:'interactive', lesson:'chain', title:'tutSlideChainTitle' },
    { scene:'interactive', lesson:'burst', title:'tutSlideBurstTitle' },
    { scene:'overview', title:'tutSlideReadyTitle', chips:['tutChip8','tutChipAdvShort','tutChipDailyShort','tutChipTheme'] }
  ];
  let tutorialIndex = 0;
  let tutInteractiveReady = false;
  const tutLessonsDone = new Set();
  let tutTarget = null, tutPhaseIdx = 0, tutLessonKey = null;
  const TUT_SIZE = 8;
  function tutEmptyGrid(){ return Array.from({ length: TUT_SIZE }, () => Array(TUT_SIZE).fill(null)); }
  function tutFillRowExcept(g, y, skipXs){
    for(let x = 0; x < TUT_SIZE; x++){
      if(skipXs.includes(x)) continue;
      g[y][x] = colors[x % colors.length];
    }
  }
  function tutFillColExcept(g, x, skipYs){
    for(let y = 0; y < TUT_SIZE; y++){
      if(skipYs.includes(y)) continue;
      g[y][x] = colors[y % colors.length];
    }
  }
  const TUT_SHAPE = {
    line2: [[0, 0], [1, 0]],
    line3: [[0, 0], [1, 0], [2, 0]],
    line4: [[0, 0], [1, 0], [2, 0], [3, 0]]
  };
  const TUT_LESSONS = {
    place: { phases: [{ setup(){
      const g = tutEmptyGrid();
      tutFillRowExcept(g, 7, [5, 6, 7]);
      return { grid: g, piece: { shape: TUT_SHAPE.line3, color: colors[0] }, target: { px: 5, py: 7 } };
    } }] },
    chain: { phases: [
      { setup(){
        const g = tutEmptyGrid();
        tutFillRowExcept(g, 6, [6, 7]);
        return { grid: g, piece: { shape: TUT_SHAPE.line2, color: colors[1] }, target: { px: 6, py: 6 } };
      } },
      { setup(){
        const g = tutEmptyGrid();
        tutFillRowExcept(g, 5, [3, 4, 5]);
        return { grid: g, piece: { shape: TUT_SHAPE.line3, color: colors[2] }, target: { px: 3, py: 5 } };
      }, expectCombo: 2 }
    ]},
    burst: { phases: [{ setup(){
      const g = tutEmptyGrid();
      tutFillRowExcept(g, 4, [3, 4, 5]);
      tutFillColExcept(g, 4, [4]);
      return { grid: g, piece: { shape: TUT_SHAPE.line3, color: colors[0] }, target: { px: 3, py: 4 } };
    }, expectBurst: true }] }
  };
  function tutDummyPiece(colorIdx=3){
    return { shape: [[0, 0]], color: colors[colorIdx % colors.length], used: true };
  }
  function loadTutorialPhase(){
    const phase = TUT_LESSONS[tutLessonKey].phases[tutPhaseIdx];
    const s = phase.setup();
    tutTarget = s.target;
    grid = s.grid.map(r => r.slice());
    pieces = [
      { shape: s.piece.shape.map(a => a.slice()), color: s.piece.color, used: false },
      tutDummyPiece(4),
      tutDummyPiece(5)
    ];
    boardMetricsCache = null;
    renderAll();
    requestAnimationFrame(() => { boardMetricsCache = null; syncViewportLayout(); });
  }
  async function tutAdvanceAfterPlacement(clearResult){
    if(mode !== 'tutorial' || !tutLessonKey) return;
    const phase = TUT_LESSONS[tutLessonKey].phases[tutPhaseIdx];
    if(!clearResult.n) return;
    await wait(320);
    if(phase.expectCombo && combo < phase.expectCombo) return;
    if(phase.expectBurst && !clearResult.burst) return;
    if(tutPhaseIdx < TUT_LESSONS[tutLessonKey].phases.length - 1){
      tutPhaseIdx++;
      tutInteractiveReady = false;
      updateTutorialNextBtn();
      loadTutorialPhase();
      return;
    }
    tutInteractiveReady = true;
    tutLessonsDone.add(tutLessonKey);
    updateTutorialNextBtn();
    playTone('win');
    vibrate('reward');
  }
  async function placeTutorialPiece(i, p, px, py){
    busy = true;
    playTone('place');
    p.shape.forEach(([dx, dy]) => { grid[py + dy][px + dx] = p.color; });
    pieces[i].used = true;
    renderBoard();
    p.shape.forEach(([dx, dy]) => { const el = cellAt(px + dx, py + dy); if(el) el.classList.add('just-placed'); });
    renderPieces();
    await wait(95);
    await clearLines();
    await tutAdvanceAfterPlacement(lastClearResult);
    busy = false;
  }
  function updateTutPlayDock(slide){
    if($('tutPlayTitle')) $('tutPlayTitle').textContent = tx(slide?.title || 'tutSlidePlaceTitle');
    const dots = $('tutPlayDots');
    if(dots){
      dots.innerHTML = '';
      TUTORIAL_SLIDES.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'tutorial-dot' + (i === tutorialIndex ? ' active' : '');
        dots.appendChild(d);
      });
    }
    if($('tutPlaySkip')) $('tutPlaySkip').textContent = tx('tutSkip');
  }
  function enterTutorialPlay(lessonId){
    if(!TUT_LESSONS[lessonId]){ tutInteractiveReady = true; updateTutorialNextBtn(); return; }
    cancelActiveDrag(false);
    tutLessonKey = lessonId;
    tutPhaseIdx = 0;
    tutInteractiveReady = false;
    tutTarget = null;
    mode = 'tutorial';
    boardSize = 8;
    busy = false;
    combo = 0;
    chainReady = false;
    score = 0;
    linesDone = 0;
    document.body.classList.add('tutorial-play');
    $('screenTutorial')?.classList.remove('active');
    $('tutPlayDock')?.classList.remove('hidden');
    applyModeLabels();
    loadTutorialPhase();
    show('screenGame');
    updateTutPlayDock(TUTORIAL_SLIDES[tutorialIndex]);
    updateTutorialNextBtn();
  }
  function exitTutorialPlay(){
    if(mode === 'tutorial') mode = 'classic8';
    tutLessonKey = null;
    tutTarget = null;
    tutPhaseIdx = 0;
    document.body.classList.remove('tutorial-play');
    $('tutPlayDock')?.classList.add('hidden');
    cancelActiveDrag(false);
    clearPreview();
  }
  function needsTutorial(){ return (data.tutorialVersion || 0) < TUTORIAL_VERSION; }
  function updateTutorialNextBtn(){
    const slide = TUTORIAL_SLIDES[tutorialIndex];
    const locked = !!(slide?.lesson && !tutInteractiveReady);
    const label = tutorialIndex >= TUTORIAL_SLIDES.length - 1 ? tx('tutStart') : tx('tutNext');
    ['tutorialNextBtn', 'tutPlayNext'].forEach(id => {
      const next = $(id);
      if(!next) return;
      next.disabled = locked;
      next.classList.toggle('tut-next-locked', locked);
      next.textContent = label;
    });
  }
  function startInteractiveLesson(lessonId){ enterTutorialPlay(lessonId); }
  function renderTutorial(){
    const slide = TUTORIAL_SLIDES[tutorialIndex] || TUTORIAL_SLIDES[0];
    if($('tutorialTitle')) $('tutorialTitle').textContent = slide.lesson ? tx(slide.title) : tx(slide.title);
    document.querySelectorAll('#tutorialStage .tut-scene').forEach(el=>{
      el.classList.toggle('active', el.dataset.scene === slide.scene);
    });
    const activeScene = document.querySelector(`#tutorialStage .tut-scene[data-scene="${slide.scene}"]`);
    if(activeScene){
      activeScene.querySelectorAll('[data-chip]').forEach(el=>{
        const idx = +el.dataset.chip;
        if(Number.isFinite(idx) && slide.chips?.[idx]) el.textContent = tx(slide.chips[idx]);
      });
    }
    const dots = $('tutorialProgress');
    if(dots){
      dots.innerHTML = '';
      TUTORIAL_SLIDES.forEach((_,i)=>{
        const d=document.createElement('span');
        d.className = 'tutorial-dot' + (i===tutorialIndex ? ' active' : '');
        dots.appendChild(d);
      });
    }
    const nav = document.querySelector('.lux-nav');
    if(nav) nav.classList.toggle('single-next', tutorialIndex === 0);
    const back = $('tutorialBackBtn');
    if(back){
      back.textContent = tx('tutBack');
      back.classList.toggle('hidden', tutorialIndex === 0);
    }
    const next = $('tutorialNextBtn');
    if(next) next.textContent = tutorialIndex >= TUTORIAL_SLIDES.length - 1 ? tx('tutStart') : tx('tutNext');
    if($('tutorialSkipBtn')) $('tutorialSkipBtn').textContent = tx('tutSkip');
    if(slide.lesson){
      if(tutLessonsDone.has(slide.lesson)){
        exitTutorialPlay();
        tutInteractiveReady = true;
        $('screenTutorial')?.classList.add('active');
      } else {
        startInteractiveLesson(slide.lesson);
      }
    }else{
      exitTutorialPlay();
      tutInteractiveReady = true;
      $('screenTutorial')?.classList.add('active');
    }
    updateTutorialNextBtn();
  }
  function renderLangPick(){
    const grid = $('langPickGrid');
    if($('langPickTitle')) $('langPickTitle').textContent = tx('langPickTitle');
    if($('langPickSub')) $('langPickSub').textContent = tx('langPickSub');
    if(!grid || grid.dataset.built) return;
    grid.innerHTML = '';
    (I18N.LANGS || []).forEach(lang=>{
      if(!SUPPORTED_LANGS.includes(lang.id)) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.lang = lang.id;
      btn.setAttribute('role', 'option');
      btn.innerHTML = `<span class="lp-flag">${lang.flag}</span><span>${lang.native}</span>`;
      btn.onclick = () => chooseLang(lang.id);
      grid.appendChild(btn);
    });
    grid.dataset.built = '1';
  }
  function openLangPick(){
    renderLangPick();
    stopFpsSampling();
    const el = $('screenLangPick');
    el?.classList.remove('lang-pick-visible');
    el?.classList.add('active', 'lang-pick-enter');
    requestAnimationFrame(() => requestAnimationFrame(() => el?.classList.add('lang-pick-visible')));
  }
  function chooseLang(id){
    if(!SUPPORTED_LANGS.includes(id)) return;
    data.lang = id;
    data.langChosen = true;
    applyLanguage();
    save(true);
    playTone('tap');
    $('screenLangPick')?.classList.remove('active');
    if(bootQuickPlayIfNeeded()) return;
    if(needsTutorial()) setTimeout(openTutorial, 280);
    else show('screenMenu');
  }
  function bootQuickPlayIfNeeded(){
    if(data.firstPlayDone || !needsTutorial() || (data.games||0) > 0) return false;
    data.firstPlayDone = true;
    save(true);
    toast(tx('firstPlayHint'));
    setTimeout(()=>startGame('classic8'), 360);
    return true;
  }
  function afterSplashBoot(){
    requestAnimationFrame(() => {
      document.body.classList.add('app-ready');
      if(!data.langChosen) openLangPick();
      else if(bootQuickPlayIfNeeded()) return;
      else if(needsTutorial()) openTutorial();
      else show('screenMenu');
    });
  }
  function openTutorial(){
    cancelActiveDrag(false);
    if($('screenGameOver')?.classList.contains('active')) $('screenGameOver').classList.remove('active');
    tutorialIndex = 0;
    tutInteractiveReady = false;
    tutLessonsDone.clear();
    stopFpsSampling();
    renderTutorial();
  }
  function closeTutorial(start){
    exitTutorialPlay();
    data.tutorial = true;
    data.tutorialVersion = TUTORIAL_VERSION;
    save();
    $('screenTutorial').classList.remove('active');
    if(start) show('screenClassic');
    else show('screenMenu');
    if(gameScreenActive()) startFpsSampling();
  }
  function advanceTutorial(){
    const slide = TUTORIAL_SLIDES[tutorialIndex];
    if(slide?.lesson && !tutInteractiveReady) return;
    if(tutorialIndex >= TUTORIAL_SLIDES.length - 1){ closeTutorial(false); return; }
    tutorialIndex++;
    renderTutorial();
    playTone('tap');
  }
  function openPrivacy(){ stopFpsSampling(); $('screenPrivacy').classList.add('active'); }
  function closePrivacy(){ $('screenPrivacy').classList.remove('active'); if(gameScreenActive()) startFpsSampling(); }
  function closeGameOverFromBack(){
    finalizeGameOver();
    $('screenGameOver').classList.remove('active');
    if(mode==='adventure') show('screenAdventure');
    else if(mode==='daily') show('screenDaily');
    else show('screenMenu');
  }
  function dismissSplash(onDone){
    const splash = document.querySelector('.company-splash');
    const curtain = $('bootPremiumCurtain');
    document.body.classList.add('splash-controlled');
    if(!splash){ afterSplashBoot(); onDone && onDone(); return; }
    const seg = csvDeviceLevel();
    const hold = seg >= 3 ? 1900 : 2400;
    setTimeout(() => {
      splash.style.animation = 'none';
      const img = splash.querySelector('img');
      if(img) img.style.animation = 'none';
      document.body.classList.add('boot-phase-exit');
      curtain?.classList.add('active');
      setTimeout(() => {
        splash.remove();
        curtain?.classList.remove('active');
        document.body.classList.remove('boot-phase-exit', 'splash-controlled');
        afterSplashBoot();
        onDone && onDone();
      }, seg >= 3 ? 620 : 720);
    }, hold);
  }
  function applySettings(deferMusic){
    if($('graphicsSelect')) $('graphicsSelect').value=data.graphics||'max';
    syncSettingToggles();
    applyLanguage();
    updatePerfMode();
    applyTheme();
    if(deferMusic){ if(!data.music) stopMusic(); return; }
    if(data.music) startMusic(); else stopMusic();
  }
  function bindToggleSetting(btnId, cardId, key, after){
    const btn=$(btnId); if(!btn) return;
    btn.onclick=()=>{ data[key]=!data[key]; syncToggleCard(btnId, cardId, data[key]); save(); after&&after(); };
  }
  // buttons
  $('resumeBtn').onclick=()=>{playTone('tap');resumeSavedRun()}; $('classicBtn').onclick=()=>{playTone('tap');resetDailyRuntimeState();show('screenClassic')}; $('classic8Btn').onclick=()=>{playTone('tap');startGame('classic8')}; $('classic10Btn').onclick=()=>{playTone('tap');startGame('classic10')}; $('adventureBtn').onclick=()=>{playTone('tap');selectedAdventureLevel=Math.min(data.adventureMax,ADVENTURE_MAX_LEVEL);selectedAdventureWorldIdx=null;adventureScrollPin=false;show('screenAdventure')}; $('startAdventureBtn').onclick=()=>startAdventureLevel(selectedAdventureLevel);
  if($('navCustomize')) $('navCustomize').onclick=()=>{playTone('tap');showCustomize('theme');};
  if($('customizeTabThemeBtn')) $('customizeTabThemeBtn').onclick=()=>{playTone('tap');setCustomizeTab('theme');};
  if($('customizeTabMarketBtn')) $('customizeTabMarketBtn').onclick=()=>{playTone('tap');setCustomizeTab('market');};
  const showAdFreeInfo=()=>{ playTone('tap'); toast(tx('adFreeInfo')); };
  if($('navAdFreeBadge')){
    $('navAdFreeBadge').onclick=showAdFreeInfo;
    $('navAdFreeBadge').onkeydown=(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); showAdFreeInfo(); } };
  }
  $('navAch').onclick=()=>show('screenAchievements'); $('navStats').onclick=()=>show('screenStats'); $('settingsBtn').onclick=()=>show('screenSettings'); $('dailyBtn').onclick=()=>{playTone('tap');daily()};
  document.querySelectorAll('.backBtn').forEach(b=>b.onclick=()=>show('screenMenu'));
  $('pauseBtn').onclick=()=>{ playTone('tap'); openPause(); };
  if($('pauseResumeBtn')) $('pauseResumeBtn').onclick=()=>{ playTone('tap'); closePause(true); };
  if($('pauseRestartBtn')) $('pauseRestartBtn').onclick=restartFromPause;
  if($('pauseMenuBtn')) $('pauseMenuBtn').onclick=()=>{ playTone('tap'); exitPauseToMenu(); };
  if($('shareScoreBtn')) $('shareScoreBtn').onclick=()=>{ playTone('tap'); shareCurrentScore(); };
  $('restartBtn').onclick=()=>{ if(mode==='daily') startDailyChallenge(dailyModId); else startGame(mode, currentAdventureLevel); };
  $('againBtn').onclick=()=>{ finalizeGameOver(); $('screenGameOver').classList.remove('active'); if(mode==='daily') startDailyChallenge(dailyModId); else startGame(mode, currentAdventureLevel); };
  $('continueBtn').onclick=()=>{ finalizeGameOver(); $('screenGameOver').classList.remove('active'); if(mode==='adventure') show('screenAdventure'); else if(mode==='daily') show('screenDaily'); else startGame(mode); };
  $('menuBtn').onclick=()=>{ finalizeGameOver(); $('screenGameOver').classList.remove('active'); show('screenMenu'); };
  if($('reviveBtn')) $('reviveBtn').onclick=()=>{ playTone('tap'); tryRevive('coin'); };
  $('undoBtn').onclick=useUndo; $('hintBtn').onclick=useHint;
  if($('dailyChestOpenBtn')) $('dailyChestOpenBtn').onclick=()=>{ playTone('tap'); openDailyChest(); };
  if($('dailyChestBox')) $('dailyChestBox').onclick=()=>{ playTone('tap'); openDailyChest(); };
  if($('dailyTabRewardBtn')) $('dailyTabRewardBtn').onclick=()=>{ playTone('tap'); setDailyHubTab('reward'); };
  if($('dailyTabChallengeBtn')) $('dailyTabChallengeBtn').onclick=()=>{ playTone('tap'); setDailyHubTab('challenge'); };
  $('photoInput').onchange=e=>handlePhoto(e.target.files&&e.target.files[0]); $('photoPickBtn').onclick=pickPhoto; $('clearPhotoBtn').onclick=()=>{data.customPhoto='';data.theme='mir';refreshCounters();renderThemes();}; $('resetThemeBtn').onclick=()=>{data.theme='mir';data.blur=0;data.dark=0;refreshCounters();renderThemes();}; $('photoShortcut').onclick=()=>{playTone('tap');showCustomize('theme');};
  if($('tutorialBackBtn')) $('tutorialBackBtn').onclick=()=>{ if(tutorialIndex>0){ tutorialIndex--; renderTutorial(); playTone('tap'); } };
  if($('tutorialNextBtn')) $('tutorialNextBtn').onclick=()=>{ playTone('tap'); advanceTutorial(); };
  if($('tutorialSkipBtn')) $('tutorialSkipBtn').onclick=()=>{ playTone('tap'); closeTutorial(false); };
  if($('tutPlayNext')) $('tutPlayNext').onclick=()=>{ playTone('tap'); advanceTutorial(); };
  if($('tutPlaySkip')) $('tutPlaySkip').onclick=()=>{ playTone('tap'); closeTutorial(false); };
  if($('tutorialOpenBtn')) $('tutorialOpenBtn').onclick=()=>{ playTone('tap'); openTutorial(); };
  $('privacyBtn').onclick=openPrivacy; $('privacyCloseBtn').onclick=closePrivacy;
  
  window.BlockMirPlayGamesStatus = (status) => {
    const tr = data && data.lang === 'tr';
    const ios = isApple();
    const messages = ios ? {
      signed_in: tr ? 'Game Center bağlantısı kuruldu.' : 'Connected to Game Center.',
      sign_in_failed: tr ? 'Sıralama tablosu yakında iOS için eklenecek.' : 'Leaderboards coming soon on iOS.',
      leaderboard_failed: tr ? 'Sıralama tablosu şu an kullanılamıyor.' : 'Leaderboard is not available right now.',
      unknown_leaderboard: tr ? 'Bu mod için sıralama tablosu yok.' : 'No leaderboard for this mode.'
    } : {
      signed_in: tr ? 'Google Play Games bağlantısı kuruldu.' : 'Connected to Google Play Games.',
      sign_in_failed: tr ? 'Google Play Games oturumu açılamadı. Hesabını ve internetini kontrol et.' : 'Could not sign in to Google Play Games. Check your account and connection.',
      leaderboard_failed: tr ? 'Liderlik tablosu açılamadı. Biraz sonra tekrar dene.' : 'The leaderboard could not be opened. Please try again.',
      unknown_leaderboard: tr ? 'Bu oyun modu için liderlik tablosu bulunamadı.' : 'No leaderboard was found for this game mode.'
    };
    if (messages[status]) toast(messages[status]);
  };

  const openGlobalLeaderboard = (customMode) => {
    playTone('tap');
    if (!window.BlockMirAndroid || typeof window.BlockMirAndroid.showLeaderboard !== 'function') {
      toast("Sıralama listesi sadece uygulamada aktiftir!");
      return;
    }
    const targetMode = customMode || mode || 'classic8';
    if (targetMode === 'daily') {
      if (typeof dailyModId !== 'undefined' && dailyModId) {
        window.BlockMirAndroid.showLeaderboard(dailyModId);
      } else {
        window.BlockMirAndroid.showLeaderboard('classic8');
      }
    } else {
      window.BlockMirAndroid.showLeaderboard(targetMode);
    }
  };

  if ($('menuLeaderboardBtn')) $('menuLeaderboardBtn').onclick = () => openGlobalLeaderboard('classic8');
  if ($('classicLeaderboardBtn')) $('classicLeaderboardBtn').onclick = () => {
    const currentClassic = (mode === 'classic8' || mode === 'classic10') ? mode : 'classic8';
    openGlobalLeaderboard(currentClassic);
  };
  if ($('gameLeaderboardBtn')) $('gameLeaderboardBtn').onclick = () => openGlobalLeaderboard(mode);

  if($('reviewBtn')) $('reviewBtn').onclick=()=>requestReview(true);
  $('blurRange').oninput=e=>{data.blur=+e.target.value;refreshCounters()}; $('darkRange').oninput=e=>{data.dark=+e.target.value;refreshCounters()};
  bindToggleSetting('musicToggleBtn','musicCard','music',()=>applySettings());
  bindToggleSetting('soundToggleBtn','soundCard','sound',()=>configureAudio());
  bindToggleSetting('vibrateToggleBtn','vibrateCard','vibrate');
  if($('musicVolRange')) $('musicVolRange').oninput=e=>{ data.musicVol=Math.max(0,Math.min(100,+e.target.value||0)); syncVolumeUi(); configureAudio(); save(true); };
  if($('sfxVolRange')) $('sfxVolRange').oninput=e=>{ data.sfxVol=Math.max(0,Math.min(100,+e.target.value||0)); syncVolumeUi(); configureAudio(); save(true); };
  if($('colorblindToggleBtn')) $('colorblindToggleBtn').onclick=()=>{ data.colorblind=!data.colorblind; syncColorblindUI(); applyTheme(); save(true); toast(data.colorblind?tx('colorblindOn'):tx('colorblindOff')); };
  bindToggleSetting('pauseMusicToggleBtn','pauseMusicCard','music',()=>{ syncSettingToggles(); applySettings(); });
  bindToggleSetting('pauseSoundToggleBtn','pauseSoundCard','sound',()=>{ syncSettingToggles(); configureAudio(); });
  bindToggleSetting('pauseVibrateToggleBtn','pauseVibrateCard','vibrate',()=>syncSettingToggles());
  function onGraphicsChange(value, label){
    data.graphics=value||'auto';
    try{ localStorage.setItem(LS+'graphicsUserSet','1'); }catch(_){}
    perfAutoLevel=0;
    fpsLowStreak=0;
    fpsSoftLowStreak=0;
    fpsGoodSince=0;
    updatePerfMode();
    applyTheme();
    save(true);
    syncSettingToggles();
    toast(tx('graphics')+': '+label);
    if(gameScreenActive()) startFpsSampling();
  }
  if($('graphicsSelect')) $('graphicsSelect').onchange=e=>{ onGraphicsChange(e.target.value, e.target.options[e.target.selectedIndex].textContent); };
  if($('pauseGraphicsSelect')) $('pauseGraphicsSelect').onchange=e=>{ onGraphicsChange(e.target.value, e.target.options[e.target.selectedIndex].textContent); };
  document.querySelectorAll('#customizeMarketSubTabs button').forEach(b=>b.onclick=()=>{playTone('tap');document.querySelectorAll('#customizeMarketSubTabs button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderMarket(b.dataset.tab);});
  window.BlockMirSaveRun=()=>{ saveRunState({force:true}); return true; };
  window.BlockMirPlayCapture={
    isBusy(){ return !!busy; },
    getBestMove(){
      if(!gameScreenActive()) return null;
      let bestIdx=-1,bestPos=null;
      pieces.forEach((p,i)=>{ if(p.used) return; const pos=findMove(p); if(pos && (!bestPos || pos.score>bestPos.score)){ bestIdx=i; bestPos=pos; } });
      return bestIdx<0?null:{idx:bestIdx,x:bestPos.x,y:bestPos.y};
    },
    async autoMoveOnce(){
      if(!gameScreenActive()) return false;
      let guard=0;
      while(busy && guard++<120){ await new Promise(r=>setTimeout(r,40)); }
      if(busy) return false;
      let bestIdx=-1,bestPos=null;
      pieces.forEach((p,i)=>{ if(p.used) return; const pos=findMove(p); if(pos && (!bestPos || pos.score>bestPos.score)){ bestIdx=i; bestPos=pos; } });
      if(bestIdx<0 || !bestPos) return false;
      await placePiece(bestIdx, pieces[bestIdx], bestPos.x, bestPos.y);
      guard=0;
      while(busy && guard++<160){ await new Promise(r=>setTimeout(r,40)); }
      return true;
    }
  };
  if(new URLSearchParams(window.location.search).get('bm_test')==='1'){
    const testClone=value=>JSON.parse(JSON.stringify(value));
    const testPiece=value=>({
      shape:(value?.shape||[[0,0]]).map(cell=>[Number(cell[0])||0,Number(cell[1])||0]),
      color:value?.color||colors[0],
      used:!!value?.used
    });
    const testSnapshot=()=>({
      mode,boardSize,score,linesDone,combo,chainReady,busy,gameOverPending,
      currentAdventureLevel,levelMoves,levelBestCombo,levelChainPeak,levelBurstPeak,
      dailyModId,dailyLocks:testClone(dailyLocks||null),
      dailyLockCount:document.querySelectorAll('.cell.daily-lock').length,
      dailyDataset:document.body.dataset.dailyMod||'',
      grid:testClone(grid||[]),pieces:testClone(pieces||[]),data:testClone(data),
      hasMove:typeof hasMove==='function'?hasMove():false,
      activeScreen:activeScreenId()
    });
    window.BlockMirTestAPI={
      version:1,
      snapshot:testSnapshot,
      start(modeName='classic8',level=null){ startGame(modeName,level); return testSnapshot(); },
      seedLockboard(){
        startGame('classic8');
        mode='daily'; dailyModId='lockboard'; document.body.dataset.dailyMod=dailyModId;
        initDailyLocks(); applyModeLabels(); renderAll();
        return testSnapshot();
      },
      setScenario(cfg={}){
        mode=cfg.mode||'classic8';
        boardSize=Number(cfg.boardSize)||(mode==='classic10'?10:8);
        const source=Array.isArray(cfg.grid)?cfg.grid:[];
        grid=Array.from({length:boardSize},(_,y)=>Array.from({length:boardSize},(_,x)=>source[y]?.[x]||null));
        pieces=(Array.isArray(cfg.pieces)&&cfg.pieces.length?cfg.pieces:[{shape:[[0,0]],color:colors[0]}]).map(testPiece);
        while(pieces.length<3) pieces.push({shape:[[0,0]],color:colors[pieces.length%colors.length],used:true});
        score=Number(cfg.score)||0; linesDone=Number(cfg.linesDone)||0; combo=Number(cfg.combo)||0;
        chainReady=!!cfg.chainReady; undoSnap=null; busy=false; gameOverPending=false;
        levelMoves=Number(cfg.levelMoves)||0; levelBestCombo=Number(cfg.levelBestCombo)||0;
        levelChainCurrent=Number(cfg.levelChainCurrent)||0; levelChainPeak=Number(cfg.levelChainPeak)||0;
        levelBurstPeak=Number(cfg.levelBurstPeak)||0; adventureUndoUsed=!!cfg.adventureUndoUsed;
        currentAdventureLevel=Math.max(1,Math.min(ADVENTURE_MAX_LEVEL,Number(cfg.level)||1));
        if(cfg.data&&typeof cfg.data==='object') Object.assign(data,testClone(cfg.data));
        show('screenGame'); renderAll(); refreshCounters();
        return testSnapshot();
      },
      canPlace(piece,x,y){ return canPlace(testPiece(piece),Number(x)||0,Number(y)||0); },
      simulatedClear(piece,x,y){ return testClone(simulatedClear(testPiece(piece),Number(x)||0,Number(y)||0)); },
      async place(index,x,y){
        const i=Number(index)||0;
        if(!pieces[i]||pieces[i].used) return {ok:false,state:testSnapshot()};
        if(!canPlace(pieces[i],Number(x)||0,Number(y)||0)) return {ok:false,state:testSnapshot()};
        await placePiece(i,pieces[i],Number(x)||0,Number(y)||0);
        return {ok:true,state:testSnapshot()};
      },
      undo(){ useUndo(); return testSnapshot(); },
      saveRun(){ saveRunState({force:true}); return localStorage.getItem(RUN_KEY); },
      clearRun(){ clearRunState(); return localStorage.getItem(RUN_KEY); },
      resumeRun(){ const hadSavedRun=!!readRunState(); resumeSavedRun(); return {ok:hadSavedRun&&activeScreenId()==='screenGame',state:testSnapshot()}; },
      setData(patch={}){ Object.assign(data,testClone(patch)); refreshCounters(); save(true); return testClone(data); },
      buyCatalog(type,id){
        const list=type==='themes'?themes:type==='blocks'?blockSkins:type==='effects'?effects:boosters;
        const item=list.find(entry=>entry.id===id);
        if(!item) return {ok:false,reason:'missing',state:testSnapshot()};
        const before=data.coins;
        if(type==='boosters') buyBooster(item);
        else buy(item,type,item.price||0,catName(item,type));
        return {ok:data.coins<before,before,after:data.coins,owned:isOwned(item,type),item:testClone(item)};
      },
      catalog(){ return {themes:testClone(themes),blocks:testClone(blockSkins),effects:testClone(effects),boosters:testClone(boosters)}; },
      levelGoal(level){ return testClone(levelGoal(level)); },
      allLevelGoals(){ return Array.from({length:ADVENTURE_MAX_LEVEL},(_,i)=>testClone(levelGoal(i+1))); },
      dailyModes(){ return testClone(BD?.MODES||[]); },
      dailyRoll(seed=1){
        let value=(Number(seed)||1)>>>0;
        const rng=()=>((value=(value*1664525+1013904223)>>>0)/4294967296);
        return testClone(BD.rollChest(rng,(tier,n)=>dailyCosmeticReward(tier,n)));
      },
      updateDailyStreak(){ return updateDailyStreak(); },
      applyDailyStreakBonus(){ return applyDailyStreakBonus(); },
      streakBonusFor(value){ return streakBonusFor(Number(value)||0); },
      dayKey(value){ return dayKey(value?new Date(value):new Date()); },
      languages(){ return testClone(I18N.LANGS||[]); },
      setLanguage(lang){ data.lang=SUPPORTED_LANGS.includes(lang)?lang:'tr'; applyLanguage(); return {lang:data.lang,dir:document.documentElement.dir}; },
      translate(lang,key,vars={}){
        const previous=data.lang; data.lang=lang; const value=tx(key,vars); data.lang=previous; return value;
      },
      missingTranslations(keys=[]){
        return (I18N.LANGS||[]).reduce((out,lang)=>{
          const table=I18N[lang.id]||{};
          const missing=keys.filter(key=>typeof table[key]!=='string'||!table[key].trim());
          if(missing.length) out[lang.id]=missing;
          return out;
        },{});
      }
    };
  }
  window.BlockMirAndroidBack=()=>{
    if($('screenLangPick')?.classList.contains('active')) return true;
    if(document.body.classList.contains('tutorial-play')){ closeTutorial(false); return true; }
    if($('screenPrivacy')?.classList.contains('active')){ closePrivacy(); return true; }
    if($('screenTutorial')?.classList.contains('active')){ closeTutorial(false); return true; }
    if($('screenGameOver')?.classList.contains('active')){ closeGameOverFromBack(); return true; }
    if(isPauseOpen()){ closePause(true); return true; }
    if($('screenGame')?.classList.contains('active')){ openPause(); return true; }
    const active=screens.find(s=>$(s)?.classList.contains('active'));
    if(active && active!=='screenMenu'){ show('screenMenu'); return true; }
    return false;
  };
  function blockNativeCallout(e){ e.preventDefault(); }
  ['contextmenu','selectstart','gesturestart'].forEach(ev=>document.addEventListener(ev,blockNativeCallout,{passive:false}));
  window.addEventListener('pagehide',()=>{ flushSave(); saveRunState({force:true}); stopFpsSampling(); });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){ flushSave(); saveRunState({force:true}); stopFpsSampling(); return; }
    if(gameScreenActive()) startFpsSampling();
    if(audioUnlocked && data.music) ensureAudioReady().then(()=> syncMusicForScreen(activeScreenId()));
  });
  applySettings(true); refreshCounters(); show('screenMenu'); dismissSplash(()=>{ if(data.music) startMusic(); });
})();
