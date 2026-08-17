/* BlockMir catalog data */
window.BlockMirCatalog = (function(){
const colors = ['#ff5d7c','#32d7d2','#a75cff','#ffd34b','#43e36f','#ff9a3d'];
  const shapes = [
    [[0,0]], [[0,0],[1,0]], [[0,0],[0,1]], [[0,0],[1,0],[2,0]], [[0,0],[0,1],[0,2]],
    [[0,0],[1,0],[0,1]], [[0,0],[1,0],[1,1]], [[1,0],[0,1],[1,1]], [[0,0],[0,1],[1,1]],
    [[0,0],[1,0],[2,0],[0,1]], [[0,0],[0,1],[0,2],[1,2]], [[0,0],[1,0],[2,0],[2,1]], [[1,0],[1,1],[1,2],[0,2]],
    [[0,0],[1,0],[0,1],[1,1]], [[0,0],[1,0],[2,0],[3,0]], [[0,0],[0,1],[0,2],[0,3]],
    [[0,0],[1,0],[2,0],[1,1]], [[1,0],[0,1],[1,1],[2,1]], [[0,0],[0,1],[0,2],[1,1]], [[1,0],[1,1],[1,2],[0,1]],
    [[0,0],[1,0],[1,1],[2,1]], [[1,0],[2,0],[0,1],[1,1]], [[0,0],[0,1],[1,1],[1,2]], [[1,0],[0,1],[1,1],[0,2]]
  ];
  const themes = [
    {id:'mir', name:'Mir Soft', bg:"url('assets/mir-soft.jpg')", free:true, desc:'Sıcak fotoğraf dokulu ana tema.'},
    {id:'night', name:'Gece Gökyüzü', bg:'linear-gradient(145deg,#071029,#27125e 70%,#02040d)', free:true, desc:'Koyu, sakin gece görünümü.'},
    {id:'forest', name:'Orman', bg:'linear-gradient(145deg,#0c271a,#4d7c35)', price:500, desc:'Yeşil, ferah orman tahtası.'},
    {id:'ocean', name:'Okyanus', bg:'linear-gradient(145deg,#043a5d,#22b6b8)', price:650, desc:'Mavi deniz camı hissi.'},
    {id:'sunset', name:'Gün Batımı', bg:'linear-gradient(145deg,#47245d,#ff8a3d 65%,#ffd36b)', price:800, desc:'Sıcak turuncu premium arka plan.'},
    {id:'galaxy', name:'Galaksi', bg:'radial-gradient(circle,#8147ff,#16042e 60%,#010013)', price:1050, desc:'Mor uzay/parıltı teması.'},
    {id:'strawberry', name:'Çilek Neon', bg:'linear-gradient(145deg,#5e0f2a,#ff4d74)', price:1200, desc:'BlockMir çilek renkleri.'},
    {id:'royal', name:'Kraliyet Moru', bg:'linear-gradient(145deg,#2a0a4d,#8e4cff 70%,#f7c65a)', price:1500, desc:'Taçlı maskot havasına uygun.'},
    {id:'mint', name:'Nane Cam', bg:'linear-gradient(145deg,#083a37,#44e0bd)', price:1650, desc:'Temiz ve modern cam görünüm.'},
    {id:'candy', name:'Şeker Parti', bg:'linear-gradient(145deg,#ff4f8b,#35d3ff 55%,#ffe468)', price:1850, desc:'Renkli ve canlı parti teması.'},
    {id:'paper', name:'Pastel Kağıt', bg:'linear-gradient(145deg,#f7d9bd,#caa6ff 55%,#76e7d3)', price:1400, desc:'Daha sakin pastel görünüm.'},
    {id:'aurora', name:'Kuzey Işıkları', bg:'linear-gradient(145deg,#04151f,#14e3b5 45%,#8d4fff 85%)', price:2200, desc:'Yeşil-mor aurora parıltısı.'},
    {id:'crystalworld', name:'Kristal Saray', bg:'linear-gradient(145deg,#082236,#67e8ff 45%,#a58cff)', price:2500, desc:'Buz ve kristal ışıklı macera tahtası.'},
    {id:'goldnight', name:'Altın Gece', bg:'radial-gradient(circle at 30% 20%,#ffd66a,#43205d 45%,#090212)', price:2750, desc:'Premium altın gece tahtası.'},
    {id:'volcano', name:'Volkan', bg:'linear-gradient(145deg,#1b0303,#a71e22 60%,#ffb13b)', price:3100, desc:'Sıcak lav ve ateş havası.'},
    {id:'voidgate', name:'Boşluk Kapısı', bg:'radial-gradient(circle at 65% 20%,#7b4dff,#15042b 46%,#020008)', price:3900, desc:'Koyu uzay, yoğun ışık ve premium derinlik.'},
    {id:'mirlegend', name:'Mir Efsanesi', bg:'radial-gradient(circle at 30% 18%,#ffe27a,#7d3bff 36%,#170326 72%,#05000b)', price:6000, desc:'100 bölüm yolunun efsanevi teması.'},
    {id:'luxgold', name:'Altın Lüks Salon', bg:'radial-gradient(circle at 28% 16%,#fff4c8,#d4a017 32%,#3a2208 68%,#0a0602)', price:6600, desc:'Şampanya altını, kadife sıcaklık ve premium salon hissi.'},
    {id:'velvetnight', name:'Kadife Gece', bg:'radial-gradient(circle at 70% 12%,#8b3dff44,#1a0838 38%,#06020f)', price:7100, desc:'Derin mor kadife, yumuşak lüks gece atmosferi.'},
    {id:'champagnesalon', name:'Şampanya Işıltısı', bg:'linear-gradient(145deg,#2a1530,#f7e7b8 42%,#c9a04a 72%,#1a0f28)', price:7800, desc:'Altın köpük parıltıları ve zarif lüks tonlar.'}
  ];
  const blockSkins = [
    {id:'classic', name:'Klasik Parlak', price:0, desc:'Temel parlak blok görünümü.'},
    {id:'neon', name:'Neon Bloklar', price:800, desc:'Daha güçlü ışık saçan bloklar.'},
    {id:'pixel', name:'Retro Pixel', price:950, desc:'Klasik oyun piksel görünümü.'},
    {id:'candy', name:'Şeker Blok', price:1050, desc:'Yumuşak candy renk efekti.'},
    {id:'ice', name:'Buz Kristal', price:1150, desc:'Soğuk cam/buz görünümü.'},
    {id:'gold', name:'Altın Bloklar', price:1250, desc:'Altın parıltılı özel bloklar.'},
    {id:'glass', name:'Cam Blok', price:1400, desc:'Şeffaf parlak cam etkisi.'},
    {id:'lava', name:'Lav Enerji', price:1500, desc:'Kırmızı sıcak enerji efekti.'},
    {id:'emerald', name:'Zümrüt', price:1650, desc:'Yeşil premium taş efekti.'},
    {id:'toypop', name:'Oyuncak Pop', price:1750, desc:'Daha yuvarlak, sevimli oyuncak blok havası.'},
    {id:'royalblock', name:'Kraliyet Bloku', price:2050, desc:'Taçlı mor-altın premium görünüm.'},
    {id:'rainbow', name:'Gökkuşağı', price:2200, desc:'Renk değiştiren özel blok.'},
    {id:'pearl', name:'İnci Parlak', price:2300, desc:'Yumuşak inci ve premium parlaklık.'},
    {id:'shadow', name:'Gölge Neon', price:2400, desc:'Koyu zeminde neon kenar ışığı.'},
    {id:'diamond', name:'Elmas', price:2650, desc:'Keskin kristal ve ışık efekti.'},
    {id:'prism', name:'Prizma Çekirdek', price:3000, desc:'Kristal prizma, sert ışık kırılımı.'},
    {id:'cosmic', name:'Kozmik Blok', price:3200, desc:'Mor galaksi içinde yıldızlı blok görünümü.'},
    {id:'magma', name:'Magma Çekirdek', price:3550, desc:'İçten yanan lav çekirdeği.'},
    {id:'obsidian', name:'Obsidyen Neon', price:4000, desc:'Koyu cam üstünde neon kenar ışığı.'},
    {id:'holo', name:'Holo Cam', price:4500, desc:'Şeffaf hologram katmanı ve keskin ışık çizgileri.'},
    {id:'crowncore', name:'Taç Çekirdeği', price:5050, desc:'Altın-mor yolun premium bloku.'},
    {id:'sunstone', name:'Güneş Taşı', price:5500, desc:'Sıcak altın çekirdek ve güçlü parıltı hissi.'},
    {id:'nebula', name:'Nebula Çekirdeği', price:6400, desc:'Koyu uzay tabanı üstünde yoğun renk patlaması.'},
    {id:'quantum', name:'Kuantum Cam', price:7100, desc:'Işık kıran cam katmanları ve soğuk neon çekirdek.'},
    {id:'aether', name:'Aether Işık', price:8000, desc:'Şeffaf enerji, altın kenar ve premium aura.'},
    {id:'mircore', name:'Mir Çekirdeği', price:9400, desc:'BlockMir imza koleksiyonu için mor-altın blok.'},
    {id:'luxmarble', name:'Lüks Mermer', price:9800, desc:'Beyaz-altın mermer damarları, premium salon bloku.'},
    {id:'platinum', name:'Platin Işık', price:10500, desc:'Soğuk gümüş-platin metalik parlaklık.'},
    {id:'onyxgold', name:'Oniks Altın', price:11200, desc:'Siyah oniks üzerinde sıcak altın kenar ışığı.'}
  ];
  const boosters = [
    {id:'hint5', name:'İpucu Paketi', preview:'💡 +5', desc:'Tahtada en iyi kareyi gösterir. Oyuna 5 ipucu hakkı ekler.', price:2200, repeatable:true},
    {id:'undo5', name:'Geri Al Paketi', preview:'↩ +5', desc:'Son hamleni geri alır. Oyuna 5 geri al hakkı ekler.', price:2650, repeatable:true},
    {id:'starter', name:'Başlangıç Seti', preview:'🎁 3+3', desc:'3 ipucu ve 3 geri al hakkı verir. Her hesapta bir kez alınır.', price:4500},
    {id:'saveRun', name:'Kurtarma Seti', preview:'🛟 8+4', desc:'Zor elde kurtarır: 8 geri al ve 4 ipucu. Her hesapta bir kez.', price:7200},
    {id:'adventurePack', name:'Macera Seti', preview:'🗺 10+10', desc:'Macera modu için 10 ipucu ve 10 geri al. Her hesapta bir kez.', price:10500}
  ];
  const effects = [
    {id:'star', name:'Yıldız Parıltısı', price:0, desc:'Küçük ama net yıldız parlamaları.'},
    {id:'confetti', name:'Mini Konfeti', price:500, desc:'Renkli konfeti ve kutlama parçacıkları.'},
    {id:'bluefx', name:'Mavi Işık', price:750, desc:'Temiz mavi ışık çizgileri ve dalga efekti.'},
    {id:'sparkfx', name:'Altın Kıvılcım', price:900, desc:'Altın kıvılcım ve hızlı parıltı geçişleri.'},
    {id:'strawberryfx', name:'Çilek Parıltısı', price:1150, desc:'BlockMir’e özel pembe/çilek parçacıkları.'},
    {id:'crownfx', name:'Taç Patlaması', price:1600, desc:'Taç ikonları, altın ışık ve kraliyet patlaması.'},
    {id:'neonfx', name:'Neon Dalga', price:1850, desc:'Mor/turkuaz neon dalga ekranı sarar.'},
    {id:'lightningfx', name:'Şimşek Çizgisi', price:2200, desc:'Satır boyunca elektrik ve yıldırım çizgileri.'},
    {id:'flamefx', name:'Alev Halkası', price:2350, desc:'Sıcak alev halkası ve kor parçaları.'},
    {id:'crystalfx', name:'Elmas Kırılımı', price:2550, desc:'Cam/elmas kırığı gibi keskin parçacıklar.'},
    {id:'aurorafx', name:'Aurora Perdesi', price:2750, desc:'Yeşil-mor perde ve yıldız tozu.'},
    {id:'royalfx', name:'Mor Enerji', price:3000, desc:'Kraliyet moru enerji küresi ve glow patlaması.'},
    {id:'rainbowfx', name:'Gökkuşağı Patlaması', price:3300, desc:'Çok renkli dalga ve parlak renk yağmuru.'},
    {id:'prismfx', name:'Prizma Yağmuru', price:3550, desc:'Kristal parçalar ve renk kırılması.'},
    {id:'blockrainfx', name:'Blok Yağmuru', price:3800, desc:'Minik blok ikonları ekrana yağar.'},
    {id:'galaxyfx', name:'Galaksi Dalgası', price:4150, desc:'Uzay dalgası, yıldız tozu ve spiral parçalar.'},
    {id:'stormfx', name:'Kristal Fırtınası', price:5000, desc:'Kristal yağmuru ve soğuk ışık fırtınası.'},
    {id:'supernovafx', name:'Süpernova', price:4950, desc:'Tam ekran yıldız patlaması ve güçlü ışık flaşı.'},
    {id:'kingfx', name:'Kral Konfeti', price:5400, desc:'Taç, altın konfeti ve premium kutlama efekti.'},
    {id:'goldrainfx', name:'Altın Taç Yağmuru', price:6000, desc:'Altın taç ve para parıltıları.'},
    {id:'emberfx', name:'Kor Fırtınası', price:6550, desc:'Alev izi, kor ve güçlü bitiriş hissi.'},
    {id:'solarfx', name:'Güneş Darbesi', price:6900, desc:'Sıcak ışık halkası ve altın ekran parlaması.'},
    {id:'mirfx', name:'BlockMir Fırtınası', price:7100, desc:'Marka özel mor-altın tam ekran fırtına efekti.'},
    {id:'holofx', name:'Holo Kırılım', price:7450, desc:'Şeffaf cam çizgileri ve hologram parçacıkları.'},
    {id:'legendfx', name:'Efsane Patlama', price:8050, desc:'En güçlü tam ekran patlama ve kombo şovu.'},
    {id:'nebulafx', name:'Nebula Çöküşü', price:8750, desc:'Koyu uzay dalgası, renk kırılması ve zirve flaşı.'},
    {id:'quantumfx', name:'Kuantum Kırılım', price:9200, desc:'Parçalanan ışık halkaları ve keskin ekran flaşı.'},
    {id:'aetherfx', name:'Aether Dalgası', price:10100, desc:'Yumuşak enerji dalgası, altın iz ve derin parıltı.'},
    {id:'mircorefx', name:'Mir Çekirdek Patlaması', price:11000, desc:'Mor-altın halka ve üst seviye kombo gösterisi.'},
    {id:'luxburst', name:'Lüks Altın Patlama', price:11800, desc:'Altın parçacık yağmuru ve tam ekran şampanya flaşı.'},
    {id:'champagnefx', name:'Şampanya Kıvılcımı', price:12500, desc:'Köpük altın kıvılcımlar ve zarif lüks dalga.'},
    {id:'velvetfx', name:'Kadife Işık Dalgası', price:13200, desc:'Mor kadife parıltı, yumuşak premium ekran glow.'}
  ];
  const adventureWorlds = [
    {id:'mir', chapter:'I', name:'Mir Bahçesi', nameEn:'Mir Garden', icon:'🌿', tagline:'İlk adımlar, yumuşak ışık', taglineEn:'First steps, soft light', lore:'BlockMir evreninin kapısı. Burada zincir ve patlama görevlerini öğrenirsin.', loreEn:'The gateway to the BlockMir universe. Learn chain and burst missions here.', theme:'forest', skin:'classic', effect:'star', grad:'#1a5c42,#0d1f3a', accent:'#58ffbf'},
    {id:'candy', chapter:'II', name:'Şeker Patikası', nameEn:'Candy Trail', icon:'🍬', tagline:'Renkli tahtalar ve tatlı hedefler', taglineEn:'Colorful boards and sweet goals', lore:'Şeker blokları arasında hızlı skor avı başlar.', loreEn:'A fast score hunt begins among candy blocks.', theme:'candy', skin:'toypop', effect:'confetti', grad:'#ff4d8d,#5b1a78', accent:'#ffb3d9'},
    {id:'night', chapter:'III', name:'Geonun Derinliği', nameEn:'Depth of Night', icon:'🌙', tagline:'Neon ışıklar, keskin hamleler', taglineEn:'Neon lights, sharp moves', lore:'Gece ormanında tek şans görevleri seni bekliyor.', loreEn:'One-chance missions await in the night forest.', theme:'night', skin:'shadow', effect:'neonfx', grad:'#1a0f3d,#050814', accent:'#9d6bff'},
    {id:'crystal', chapter:'IV', name:'Kristal Dağ', nameEn:'Crystal Mountain', icon:'💎', tagline:'Buzlu tahta, parlak temizlikler', taglineEn:'Icy board, bright clears', lore:'Kristal yankılar her çizgiyi daha değerli kılar.', loreEn:'Crystal echoes make every line more valuable.', theme:'crystalworld', skin:'ice', effect:'crystalfx', grad:'#1d6f8a,#0a1e33', accent:'#7df7ff'},
    {id:'ocean', chapter:'V', name:'Okyanus Rotası', nameEn:'Ocean Route', icon:'🌊', tagline:'Dalga dalga ilerleyen görevler', taglineEn:'Missions that roll like waves', lore:'Derin sularda zincir ustası olman gerekir.', loreEn:'You must master chains in the deep waters.', theme:'ocean', skin:'glass', effect:'bluefx', grad:'#0d4f7a,#031526', accent:'#56d7ff'},
    {id:'volcano', chapter:'VI', name:'Volkan Çemberi', nameEn:'Volcano Ring', icon:'🔥', tagline:'Ateşli patlamalar, yüksek risk', taglineEn:'Fiery bursts, high risk', lore:'Volkanın kalbinde çifte patlama görevleri zorlaşır.', loreEn:'Double-burst missions get harder at the volcano\'s heart.', theme:'volcano', skin:'magma', effect:'flamefx', grad:'#7a2208,#1a0505', accent:'#ff7a32'},
    {id:'aurora', chapter:'VII', name:'Aurora Köprüsü', nameEn:'Aurora Bridge', icon:'🌌', tagline:'Işık huzmeleri ve usta sınavları', taglineEn:'Light beams and master trials', lore:'Kuzey ışıkları altında karma görevler seni sınar.', loreEn:'Mixed missions test you under the northern lights.', theme:'aurora', skin:'prism', effect:'aurorafx', grad:'#1f5f78,#0b1230', accent:'#42ffd2'},
    {id:'galaxy', chapter:'VIII', name:'Galaksi Kapısı', nameEn:'Galaxy Gate', icon:'🪐', tagline:'Uzayın sessiz baskısı', taglineEn:'The silent pressure of space', lore:'Yıldız tozu arasında hız ve kontrol bir arada.', loreEn:'Speed and control together among stardust.', theme:'galaxy', skin:'cosmic', effect:'galaxyfx', grad:'#2a1260,#05000f', accent:'#b780ff'},
    {id:'crown', chapter:'IX', name:'Taç Krallığı', nameEn:'Crown Kingdom', icon:'👑', tagline:'Altın hedefler, kraliyet ödülleri', taglineEn:'Golden goals, royal rewards', lore:'Taç salonunda her yıldız bir onur madalyasıdır.', loreEn:'In the crown hall, every star is an honor medal.', theme:'goldnight', skin:'royalblock', effect:'goldrainfx', grad:'#5c3d00,#1a1000', accent:'#ffd65d'},
    {id:'peak', chapter:'X', name:'Mir Zirvesi', nameEn:'Mir Summit', icon:'✨', tagline:'Efsanevi final yolu', taglineEn:'The legendary final path', lore:'Yüzüncü kapıya giden son yolculuk. Her hamle efsane yazılır.', loreEn:'The last journey to the hundredth gate. Every move writes legend.', theme:'mirlegend', skin:'crowncore', effect:'legendfx', grad:'#4a1a8a,#12051f', accent:'#f2ddff'}
  ];
  const starRewards = [
    {id:'s10', stars:10, name:'+300 Block Parası', coins:300},
    {id:'s25', stars:25, name:'Aurora Tahtası', type:'themes', item:'aurora', coins:120},
    {id:'s45', stars:45, name:'Cam Blok', type:'blocks', item:'glass'},
    {id:'s70', stars:70, name:'Kristal Efekti', type:'effects', item:'crystalfx', hints:2},
    {id:'s100', stars:100, name:'Prizma Çekirdek', type:'blocks', item:'prism', coins:250},
    {id:'s140', stars:140, name:'Galaksi Dalgası', type:'effects', item:'galaxyfx', undos:2},
    {id:'s180', stars:180, name:'Obsidyen Neon', type:'blocks', item:'obsidian', coins:400},
    {id:'s220', stars:220, name:'Boşluk Kapısı', type:'themes', item:'voidgate', hints:3, undos:3},
    {id:'s260', stars:260, name:'Süpernova', type:'effects', item:'supernovafx', coins:500},
    {id:'s300', stars:300, name:'Mir Efsanesi Seti', bundle:[['themes','mirlegend'],['blocks','crowncore'],['effects','legendfx']], coins:1000}
  ];
  const masterStarRewards = [
    {id:'m30', stars:30, name:'Lüks Altın Salon', nameEn:'Gold Luxury Salon', type:'themes', item:'luxgold', coins:400},
    {id:'m90', stars:90, name:'Platin Işık', nameEn:'Platinum Light', type:'blocks', item:'platinum', coins:250},
    {id:'m150', stars:150, name:'Lüks Altın Patlama', nameEn:'Luxury Gold Burst', type:'effects', item:'luxburst', coins:500},
    {id:'m240', stars:240, name:'Kadife Gece', nameEn:'Velvet Night', type:'themes', item:'velvetnight', hints:3, undos:3},
    {id:'m300', stars:300, name:'Usta Seti', nameEn:'Master Set', bundle:[['themes','champagnesalon'],['blocks','onyxgold'],['effects','champagnefx']], coins:1500}
  ];

  const MARKET_SET_NAMES = {
    tr: {
      forest:'Mir Bahçesi',classic:'Mir Bahçesi',star:'Mir Bahçesi',
      candy:'Şeker Seti',toypop:'Şeker Seti',confetti:'Şeker Seti',
      night:'Gece Seti',shadow:'Gece Seti',neonfx:'Gece Seti',
      crystalworld:'Kristal Seti',ice:'Kristal Seti',crystalfx:'Kristal Seti',
      ocean:'Okyanus Seti',glass:'Okyanus Seti',bluefx:'Okyanus Seti',
      volcano:'Volkan Seti',magma:'Volkan Seti',flamefx:'Volkan Seti',emberfx:'Volkan Seti',
      aurora:'Aurora Seti',prism:'Aurora Seti',aurorafx:'Aurora Seti',prismfx:'Aurora Seti',holo:'Holo Seti',holofx:'Holo Seti',
      quantum:'Kuantum Seti',quantumfx:'Kuantum Seti',aether:'Aether Seti',aetherfx:'Aether Seti',
      galaxy:'Galaksi Seti',cosmic:'Galaksi Seti',galaxyfx:'Galaksi Seti',nebula:'Nebula Seti',nebulafx:'Nebula Seti',
      goldnight:'Altın Set',royalblock:'Altın Set',goldrainfx:'Altın Set',sunstone:'Güneş Seti',solarfx:'Güneş Seti',
      mirlegend:'Mir Efsanesi',crowncore:'Mir Efsanesi',legendfx:'Mir Efsanesi',mirfx:'Mir Efsanesi',mircore:'Mir Efsanesi',mircorefx:'Mir Efsanesi'
    },
    en: {
      forest:'Mir Garden',classic:'Mir Garden',star:'Mir Garden',
      candy:'Candy Set',toypop:'Candy Set',confetti:'Candy Set',
      night:'Night Set',shadow:'Night Set',neonfx:'Night Set',
      crystalworld:'Crystal Set',ice:'Crystal Set',crystalfx:'Crystal Set',
      ocean:'Ocean Set',glass:'Ocean Set',bluefx:'Ocean Set',
      volcano:'Volcano Set',magma:'Volcano Set',flamefx:'Volcano Set',emberfx:'Ember Set',
      aurora:'Aurora Set',prism:'Aurora Set',aurorafx:'Aurora Set',prismfx:'Aurora Set',holo:'Holo Set',holofx:'Holo Set',
      quantum:'Quantum Set',quantumfx:'Quantum Set',aether:'Aether Set',aetherfx:'Aether Set',
      galaxy:'Galaxy Set',cosmic:'Galaxy Set',galaxyfx:'Galaxy Set',nebula:'Nebula Set',nebulafx:'Nebula Set',
      goldnight:'Gold Set',royalblock:'Gold Set',goldrainfx:'Gold Set',sunstone:'Sun Set',solarfx:'Sun Set',
      mirlegend:'Mir Legend',crowncore:'Mir Legend',legendfx:'Mir Legend',mirfx:'Mir Legend',mircore:'Mir Legend',mircorefx:'Mir Legend'
    }
  };
  const EN_BY_ID = {"themes":{"mir":{"name":"Mir Soft","desc":"Warm photo-textured main theme."},"night":{"name":"Night Sky","desc":"Dark, calm night look."},"forest":{"name":"Forest","desc":"Fresh green forest board."},"ocean":{"name":"Ocean","desc":"Cool blue sea-glass feel."},"sunset":{"name":"Sunset","desc":"Warm orange premium background."},"galaxy":{"name":"Galaxy","desc":"Purple space glow theme."},"strawberry":{"name":"Strawberry Neon","desc":"BlockMir strawberry colors."},"royal":{"name":"Royal Purple","desc":"Fits the crowned mascot vibe."},"mint":{"name":"Mint Glass","desc":"Clean modern glass look."},"candy":{"name":"Candy Party","desc":"Colorful lively party theme."},"paper":{"name":"Pastel Paper","desc":"Softer pastel look."},"aurora":{"name":"Northern Lights","desc":"Green-purple aurora glow."},"crystalworld":{"name":"Crystal Palace","desc":"Ice and crystal adventure board."},"goldnight":{"name":"Golden Night","desc":"Premium golden night board."},"volcano":{"name":"Volcano","desc":"Hot lava and fire atmosphere."},"voidgate":{"name":"Void Gate","desc":"Deep space with intense light."},"mirlegend":{"name":"Mir Legend","desc":"Legendary theme of the 100-level path."},"luxgold":{"name":"Gold Luxury Salon","desc":"Champagne gold, velvet warmth and premium salon feel."},"velvetnight":{"name":"Velvet Night","desc":"Deep purple velvet, soft luxury night atmosphere."},"champagnesalon":{"name":"Champagne Sparkle","desc":"Golden bubble glints and elegant luxury tones."}},"blocks":{"classic":{"name":"Classic Shine","desc":"Basic bright block look."},"neon":{"name":"Neon Blocks","desc":"Stronger glowing blocks."},"pixel":{"name":"Retro Pixel","desc":"Classic game pixel look."},"candy":{"name":"Candy Block","desc":"Soft candy color effect."},"ice":{"name":"Ice Crystal","desc":"Cold glass/ice look."},"gold":{"name":"Gold Blocks","desc":"Golden shimmering blocks."},"glass":{"name":"Glass Block","desc":"Transparent shiny glass effect."},"lava":{"name":"Lava Energy","desc":"Hot red energy effect."},"emerald":{"name":"Emerald","desc":"Green premium stone effect."},"toypop":{"name":"Toy Pop","desc":"Rounder, cute toy block feel."},"royalblock":{"name":"Royal Block","desc":"Crowned purple-gold premium look."},"rainbow":{"name":"Rainbow","desc":"Color-shifting special block."},"pearl":{"name":"Pearl Shine","desc":"Soft pearl premium brightness."},"shadow":{"name":"Shadow Neon","desc":"Neon edge glow on dark ground."},"diamond":{"name":"Diamond","desc":"Sharp crystal and light effect."},"prism":{"name":"Prism Core","desc":"Crystal prism, hard light refraction."},"cosmic":{"name":"Cosmic Block","desc":"Starlit block in purple galaxy."},"magma":{"name":"Magma Core","desc":"Burning lava core inside."},"obsidian":{"name":"Obsidian Neon","desc":"Neon edge on dark glass."},"holo":{"name":"Holo Glass","desc":"Transparent hologram layer."},"crowncore":{"name":"Crown Core","desc":"Premium gold-purple path block."},"sunstone":{"name":"Sunstone","desc":"Warm golden core and strong glow."},"nebula":{"name":"Nebula Core","desc":"Intense color burst on dark space."},"quantum":{"name":"Quantum Glass","desc":"Light-bending glass layers."},"aether":{"name":"Aether Light","desc":"Transparent energy with gold edge."},"mircore":{"name":"Mir Core","desc":"Signature purple-gold BlockMir block."},"luxmarble":{"name":"Luxury Marble","desc":"White-gold marble veins, premium salon block."},"platinum":{"name":"Platinum Light","desc":"Cool silver-platinum metallic shine."},"onyxgold":{"name":"Onyx Gold","desc":"Warm gold edge glow on black onyx."}},"boosters":{"hint5":{"name":"Hint Pack","desc":"Shows the best square on the board. Adds 5 hint uses."},"undo5":{"name":"Undo Pack","desc":"Takes back your last move. Adds 5 undo uses."},"starter":{"name":"Starter Set","desc":"Grants 3 hints and 3 undos. One purchase per account."},"saveRun":{"name":"Rescue Set","desc":"Saves a tough run: 8 undos and 4 hints. One purchase per account."},"adventurePack":{"name":"Adventure Set","desc":"For adventure mode: 10 hints and 10 undos. One purchase per account."}},"effects":{"star":{"name":"Star Sparkle","desc":"Small but clear star glints."},"confetti":{"name":"Mini Confetti","desc":"Colorful confetti celebration particles."},"bluefx":{"name":"Blue Light","desc":"Clean blue light lines and wave effect."},"sparkfx":{"name":"Gold Spark","desc":"Gold sparks and fast shimmer transitions."},"strawberryfx":{"name":"Strawberry Sparkle","desc":"BlockMir pink/strawberry particles."},"crownfx":{"name":"Crown Burst","desc":"Crown icons, golden light and royal burst."},"neonfx":{"name":"Neon Wave","desc":"Purple/teal neon wave across the screen."},"lightningfx":{"name":"Lightning Line","desc":"Electricity and lightning along rows."},"flamefx":{"name":"Flame Ring","desc":"Hot flame ring and ember particles."},"crystalfx":{"name":"Diamond Shatter","desc":"Sharp glass/diamond shard particles."},"aurorafx":{"name":"Aurora Curtain","desc":"Green-purple curtain and stardust."},"royalfx":{"name":"Purple Energy","desc":"Royal purple energy sphere and glow burst."},"rainbowfx":{"name":"Rainbow Burst","desc":"Multi-color wave and bright color rain."},"prismfx":{"name":"Prism Rain","desc":"Crystal shards and color refraction."},"blockrainfx":{"name":"Block Rain","desc":"Tiny block icons rain on screen."},"galaxyfx":{"name":"Galaxy Wave","desc":"Space wave, stardust and spiral particles."},"stormfx":{"name":"Crystal Storm","desc":"Crystal rain and cold light storm."},"supernovafx":{"name":"Supernova","desc":"Full-screen star burst and strong light flash."},"kingfx":{"name":"King Confetti","desc":"Crown, gold confetti and premium celebration."},"goldrainfx":{"name":"Golden Crown Rain","desc":"Golden crown and coin glints."},"emberfx":{"name":"Ember Storm","desc":"Flame trail, embers and strong finish feel."},"solarfx":{"name":"Solar Strike","desc":"Warm light ring and golden screen glow."},"mirfx":{"name":"BlockMir Storm","desc":"Brand purple-gold full-screen storm."},"holofx":{"name":"Holo Fracture","desc":"Transparent glass lines and hologram particles."},"legendfx":{"name":"Legend Blast","desc":"Strongest full-screen blast and combo show."},"nebulafx":{"name":"Nebula Collapse","desc":"Dark space wave, color break and peak flash."},"quantumfx":{"name":"Quantum Fracture","desc":"Shattered light rings and sharp screen flash."},"aetherfx":{"name":"Aether Wave","desc":"Soft energy wave, gold trail and deep glow."},"mircorefx":{"name":"Mir Core Blast","desc":"Purple-gold ring and top-tier combo show."},"luxburst":{"name":"Luxury Gold Burst","desc":"Gold particle rain and full-screen champagne flash."},"champagnefx":{"name":"Champagne Spark","desc":"Bubble gold sparks and elegant luxury wave."},"velvetfx":{"name":"Velvet Light Wave","desc":"Purple velvet shimmer, soft premium screen glow."}},"achievements":{"first":{"title":"First Move","desc":"Place your first block."},"classic8":{"title":"8x8 Start","desc":"Play a classic 8x8 game."},"classic10":{"title":"10x10 Discovery","desc":"Play a classic 10x10 game."},"score1000":{"title":"First Big Score","desc":"Beat 1,000 best score in classic."},"score5000":{"title":"Score Hunter","desc":"Beat 5,000 best score in classic."},"score10000":{"title":"BlockMir Master","desc":"Beat 10,000 best score in classic."},"score25000":{"title":"Legend Score","desc":"Beat 25,000 best score in classic."},"combo3":{"title":"Combo x3","desc":"Reach a 3-combo streak."},"combo5":{"title":"Combo x5","desc":"Reach a 5-combo streak."},"lines50":{"title":"Clearing Begins","desc":"Clear 50 rows/columns total."},"lines250":{"title":"Clear Master","desc":"Clear 250 rows/columns total."},"games10":{"title":"Getting Hooked","desc":"Complete 10 games."},"games50":{"title":"Regular Player","desc":"Complete 50 games."},"adv10":{"title":"Adventure Begins","desc":"Reach adventure level 10."},"adv50":{"title":"Long Road","desc":"Reach adventure level 50."},"adv100":{"title":"Gate 100","desc":"Reach adventure level 100."},"level10":{"title":"Player Level 10","desc":"Reach player level 10."},"level20":{"title":"Level 20 Club","desc":"Reach player level 20."},"level50":{"title":"Level 50 Master","desc":"Reach player level 50."},"collector":{"title":"Collector","desc":"Unlock 5 market items."},"rich":{"title":"Vault Full","desc":"Save 1,000 Block Coins."}},"starRewards":{"s10":{"name":"+300 Block Coins"},"s25":{"name":"Aurora Board"},"s45":{"name":"Glass Block"},"s70":{"name":"Crystal Effect"},"s100":{"name":"Prism Core"},"s140":{"name":"Galaxy Wave"},"s180":{"name":"Obsidian Neon"},"s220":{"name":"Void Gate"},"s260":{"name":"Supernova"},"s300":{"name":"Mir Legend Set"}}};
  return { colors, shapes, themes, blockSkins, boosters, effects, adventureWorlds, starRewards, masterStarRewards, MARKET_SET_NAMES, EN_BY_ID };
})();
