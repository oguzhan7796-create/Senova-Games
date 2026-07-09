/* BlockMir v3.5.2 — Ana oyun SFX/kombo + temiz procedural müzik (WAV yok) */
window.BlockMirAudio = (function(){
  const PROFILES = {
    menu: {
      pattern: [261.63, 329.63, 392, null, 329.63, 392, 523.25, null, 293.66, 349.23, 440, null, 349.23, 293.66, 261.63, null],
      interval: 430,
      noteGain: 0.14
    },
    game: {
      pattern: [261.63, 329.63, 392, 523.25, 392, 329.63, 261.63, null, 349.23, 440, 523.25, null, 440, 392, 349.23, null],
      interval: 420,
      noteGain: 0.15
    },
    adventure: {
      pattern: [220, 261.63, 329.63, null, 261.63, 329.63, 392, null, 246.94, 293.66, 349.23, null, 293.66, 261.63, 220, null],
      interval: 440,
      noteGain: 0.13
    }
  };

  let ctx = null;
  let musicNodes = null;
  let currentProfile = null;
  let musicSeq = 0;
  let settings = { music: true, sound: true, musicVol: 70, sfxVol: 100 };

  function getCtx(){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = ctx || new AC();
    return ctx;
  }

  async function resumeCtx(){
    const c = getCtx();
    if(!c) return null;
    if(c.state === 'suspended'){
      try{ await c.resume(); }catch(_){ }
    }
    return c;
  }

  function musicMul(){ return Math.max(0, Math.min(1, (settings.musicVol || 100) / 100)); }
  function sfxMul(){ return Math.max(0, Math.min(1, (settings.sfxVol || 100) / 100)); }

  function playSfxProcedural(kind){
    try{
      const c = getCtx(); if(!c || !settings.sound) return;
      if(c.state === 'suspended') c.resume();
      const o = c.createOscillator(), g = c.createGain();
      const now = c.currentTime;
      const map = { tap: [420, .035], ui: [420, .035], place: [520, .055], clear: [760, .12], combo: [920, .16], bad: [120, .08], coin: [1080, .09], win: [660, .22] };
      const [freq, dur] = map[kind] || map.tap;
      o.type = kind === 'bad' ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(freq, now);
      if(kind === 'combo' || kind === 'win') o.frequency.exponentialRampToValueAtTime(freq * 1.45, now + dur);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(.22 * sfxMul(), now + .012);
      g.gain.linearRampToValueAtTime(0, now + dur);
      o.connect(g); g.connect(c.destination);
      o.start(now); o.stop(now + dur + .02);
    }catch(_){ }
  }

  function playComboProcedural(comboNow, lines){
    try{
      const c = getCtx(); if(!c || !settings.sound) return;
      if(c.state === 'suspended') c.resume();
      const now = c.currentTime;
      const level = Math.min(8, Math.max(2, Math.round(comboNow || 2)));
      const root = 520 + level * 55 + Math.min(4, lines || 1) * 28;
      const ratios = [1, 1.25, 1.5, 2, 2.5].slice(0, Math.min(5, 2 + Math.floor(level / 2)));
      ratios.forEach((ratio, idx) => {
        const o = c.createOscillator(), g = c.createGain();
        const t = now + idx * .045;
        o.type = level >= 5 ? 'sawtooth' : 'triangle';
        o.frequency.setValueAtTime(root * ratio, t);
        o.frequency.exponentialRampToValueAtTime(root * ratio * (1.06 + idx * .02), t + .12);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime((.112 + Math.min(.07, level * .009)) * sfxMul(), t + .014);
        g.gain.linearRampToValueAtTime(0, t + .22 + idx * .018);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + .26 + idx * .018);
      });
    }catch(_){ playSfxProcedural('combo'); }
  }

  function playMusicNote(freq, step, prof, nodes){
    if(!nodes || !freq || !ctx) return;
    try{
      const now = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, now);
      if(p) p.pan.setValueAtTime(step % 2 ? .15 : -.15, now);
      const peak = prof.noteGain * musicMul();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + .028);
      g.gain.linearRampToValueAtTime(0, now + .32);
      o.connect(g);
      if(p){ g.connect(p); p.connect(nodes.gain); } else g.connect(nodes.gain);
      o.start(now); o.stop(now + .35);
      setTimeout(() => { try{ o.disconnect(); g.disconnect(); p && p.disconnect(); }catch(_){} }, 420);
    }catch(_){ }
  }

  function stopMusicInternal(){
    if(!musicNodes) return;
    const nodes = musicNodes;
    musicNodes = null;
    currentProfile = null;
    try{
      if(nodes.timer){ clearInterval(nodes.timer); nodes.timer = null; }
      if(nodes.gain && ctx){
        const t = ctx.currentTime;
        nodes.gain.gain.cancelScheduledValues(t);
        nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, t);
        nodes.gain.gain.linearRampToValueAtTime(0, t + .06);
      }
      setTimeout(() => { try{ nodes.gain && nodes.gain.disconnect(); }catch(_){} }, 90);
    }catch(_){ }
  }

  function syncMusicGain(){
    if(musicNodes && musicNodes.gain && ctx){
      musicNodes.gain.gain.cancelScheduledValues(ctx.currentTime);
      musicNodes.gain.gain.setValueAtTime(musicMul(), ctx.currentTime);
    }
  }

  function startMusicProfile(profileKey, seq){
    if(seq !== musicSeq || !settings.music) return;
    const prof = PROFILES[profileKey] || PROFILES.menu;
    const c = getCtx(); if(!c) return;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(musicMul(), c.currentTime + .18);
    gain.connect(c.destination);
    musicNodes = { gain, timer: null, step: 0, prof, seq };
    currentProfile = profileKey;
    const tick = () => {
      if(!musicNodes || musicNodes.seq !== seq || !settings.music) return;
      const note = prof.pattern[musicNodes.step % prof.pattern.length];
      playMusicNote(note, musicNodes.step, prof, musicNodes);
      musicNodes.step++;
    };
    tick();
    musicNodes.timer = setInterval(tick, prof.interval);
  }

  return {
    configure(next){
      settings = Object.assign({}, settings, next || {});
      if(!settings.music) stopMusicInternal();
      else syncMusicGain();
      return Promise.resolve();
    },
    ensureReady(){ return resumeCtx(); },
    unlock(){ return this.ensureReady(); },
    playSfx(kind){ if(!settings.sound) return; playSfxProcedural(kind); },
    playCombo(level, lines){ if(!settings.sound) return; playComboProcedural(level, lines); },
    syncMusic(track){
      const key = PROFILES[track] ? track : 'menu';
      if(!settings.music){ musicSeq++; stopMusicInternal(); return Promise.resolve(); }
      const seq = ++musicSeq;
      if(currentProfile === key && musicNodes){
        return resumeCtx().then(() => { if(seq === musicSeq) syncMusicGain(); });
      }
      stopMusicInternal();
      return resumeCtx().then(c => {
        if(!c || seq !== musicSeq) return;
        return new Promise(r => setTimeout(r, 75));
      }).then(() => {
        if(seq !== musicSeq || !settings.music) return;
        startMusicProfile(key, seq);
      });
    },
    stopMusic(){ musicSeq++; stopMusicInternal(); },
    syncVolume(){ syncMusicGain(); }
  };
})();
