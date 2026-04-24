const fs = require('fs');
const path = './src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex1 = /\{gorunum === 'app' && adim < 3 \? \([\s\S]*?className="hidden" onChange=\{e => e\.target\.files && handleDosya\(e\.target\.files\[0\]\)\} \/>\s*<\/main>\s*<\/div>\s*\) : gorunum === 'app' && adim >= 3 \? \(\s*<main className=\{`flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-4 pt-24 pb-20 mt-4 relative z-10 transition-all duration-700`\}>/m;

const replacement1 = `{gorunum === 'app' && (
            <div className="relative min-h-screen bg-[#FAFAFA] flex text-slate-800 font-sans z-10 w-full items-start">
              {/* Sidebar */}
              <aside className="w-[260px] hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
                <div className="p-6 pb-2">
                  <div onClick={goHome} className="flex items-center gap-2 cursor-pointer mb-8">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5500] to-[#FF8800] flex items-center justify-center shadow-lg shadow-[#FF5500]/20">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">RevizeAI</span>
                  </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                  <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Analiz</p>
                  <button onClick={() => setDashboardTab('genel')} className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors \${dashboardTab === 'genel' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-slate-600 hover:bg-slate-50'}\`}>
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4" />
                      <span className="text-sm">Genel Bakış</span>
                    </div>
                    {kullanici ? <span className="bg-[#FF5500] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">3</span> : null}
                  </button>
                  <button onClick={() => setDashboardTab('analizlerim')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${dashboardTab === 'analizlerim' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-slate-600 hover:bg-slate-50'}\`}>
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Analizlerim</span>
                  </button>
                  <button onClick={() => setDashboardTab('raporlar')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${dashboardTab === 'raporlar' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-slate-600 hover:bg-slate-50'}\`}>
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Raporlar</span>
                  </button>
                  <button onClick={() => setDashboardTab('gecmis')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${dashboardTab === 'gecmis' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-slate-600 hover:bg-slate-50'}\`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Geçmiş</span>
                  </button>

                  <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-8">Ayarlar</p>
                  <button onClick={() => setDashboardTab('tercihler')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors \${dashboardTab === 'tercihler' ? 'bg-[#FF5500]/10 text-[#FF5500] font-medium' : 'text-slate-600 hover:bg-slate-50'}\`}>
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Tercihler</span>
                  </button>
                </nav>

                <div className="p-4 mt-auto">
                  <div className="bg-gradient-to-br from-[#FF5500] to-[#FF8800] rounded-xl p-4 text-white shadow-lg shadow-[#FF5500]/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-white" />
                        <h4 className="font-bold text-sm">Pro'ya Geç</h4>
                      </div>
                      <p className="text-xs text-white/80 mb-3">Sınırsız analiz ve PDF raporları için yükseltin.</p>
                      <button className="w-full bg-white text-[#FF5500] hover:bg-slate-50 text-xs font-bold py-2 rounded-lg transition-colors shadow-sm">
                        Planları İncele
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                      {kullanici ? (
                        <span className="font-bold text-slate-600 text-xs">{kullanici.email?.charAt(0).toUpperCase()}</span>
                      ) : (
                        <User className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{kullanici ? kullanici.email : 'Misafir Kullanıcı'}</p>
                      <p className="text-[10px] text-slate-500">Ücretsiz Plan</p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1 flex flex-col min-w-0 w-full min-h-screen">
                {/* Topbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="lg:hidden p-2 text-slate-500 hover:text-slate-900">
                      <div className="w-5 h-0.5 bg-current mb-1.5" />
                      <div className="w-5 h-0.5 bg-current mb-1.5" />
                      <div className="w-5 h-0.5 bg-current" />
                    </button>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
                        Merhaba, {kullanici ? kullanici.email?.split('@')[0] : 'Tasarımcı'} 👋
                      </h1>
                      <p className="text-sm text-slate-500 font-medium hidden sm:block">Bugün ne analiz edelim?</p>
                      <h2 className="text-lg font-bold sm:hidden cursor-pointer text-slate-900" onClick={goHome}>RevizeAI.</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDashboardTab('gecmis')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200">
                      <Clock className="w-4 h-4" />
                      <span>Geçmişim</span>
                    </button>
                    <button onClick={() => { sifirla(); setDashboardTab('genel'); }} className="flex items-center gap-2 px-4 py-2 bg-[#FF5500] hover:bg-[#e64d00] text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-[#FF5500]/20">
                      <Plus className="w-4 h-4" />
                      <span>Yeni Analiz</span>
                    </button>
                  </div>
                </header>

                {/* Dashboard Scrollable Content */}
                <div className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto pb-24">
                  {dashboardTab !== 'genel' ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-slate-400" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 mb-2">Bu bölüm henüz hazır değil</h2>
                      <p className="text-slate-500 max-w-md">Çok yakında "{dashboardTab.charAt(0).toUpperCase() + dashboardTab.slice(1)}" özelliği burada olacak. Lütfen şimdilik "Genel Bakış" sekmesinden analizlerinize devam edin.</p>
                      <button onClick={() => setDashboardTab('genel')} className="mt-6 px-6 py-2.5 bg-[#FF5500] text-white rounded-lg font-semibold hover:bg-[#e64d00] transition-colors shadow-md shadow-[#FF5500]/20">
                        Genel Bakış'a Dön
                      </button>
                    </div>
                  ) : adim < 3 ? (
                    <>
                      {/* Row 1: Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#FF5500]/30 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                              <BarChart2 className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                          </div>
                          <h3 className="text-slate-500 text-sm font-medium mb-1">Toplam Analiz</h3>
                          <p className="text-3xl font-bold text-slate-900 tracking-tight">142</p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#FF5500]/30 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">Bu Ay</span>
                          </div>
                          <h3 className="text-slate-500 text-sm font-medium mb-1">Tespit Edilen Hata</h3>
                          <p className="text-3xl font-bold text-slate-900 tracking-tight">84</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#FF5500]/30 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
                              <Check className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+5.2</span>
                          </div>
                          <h3 className="text-slate-500 text-sm font-medium mb-1">Ort. Kalite Skoru</h3>
                          <p className="text-3xl font-bold text-slate-900 tracking-tight">82.4</p>
                        </div>
                      </div>

                      {/* Row 2: Upload Area & Stepper */}
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Main Upload / Action Card */}
                        <div className="flex-1 bg-white border border-slate-200 rounded-[24px] shadow-sm p-6 lg:p-8 relative">
                          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#FF5500]" />
                            Tasarım Analiz İstasyonu
                          </h3>
                          
                          {adim === 1 ? (
                            <div className="space-y-6">
                              {/* Tasarım Türü */}
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">1. Format Seçimi</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {(Object.keys(kriterlerMap) as TasarimTuru[]).map(turu => (
                                    <button
                                      key={turu}
                                      onClick={() => setTasarimTuru(turu)}
                                      className={\`px-4 py-3 rounded-xl border \${tasarimTuru === turu ? 'bg-[#FF5500] border-[#FF5500] text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#FF5500]/50'} transition-all text-sm font-semibold whitespace-nowrap shadow-sm\`}
                                    >
                                      {turu}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Upload / Link Toggle */}
                              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                                <button
                                  onClick={() => setUploadMod('dosya')}
                                  className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all \${uploadMod === 'dosya' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
                                >
                                  <Upload className="w-4 h-4" /> Dosya Yükle
                                </button>
                                <button
                                  onClick={() => setUploadMod('link')}
                                  className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all \${uploadMod === 'link' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
                                >
                                  <LinkIcon className="w-4 h-4" /> URL ile
                                </button>
                              </div>

                              {/* Dropzone / Input */}
                              <div className="mt-4">
                                {uploadMod === 'link' ? (
                                  <div className="w-full flex">
                                    <input
                                      type="url"
                                      value={imageUrl}
                                      onChange={(e) => setImageUrl(e.target.value)}
                                      placeholder="Tasarım linkini yapıştırın (örn. mydesign.png)"
                                      className="flex-1 bg-white border border-slate-300 rounded-l-xl px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                                    />
                                    <button
                                      onClick={() => handleLink(imageUrl)}
                                      className="bg-[#FF5500] hover:bg-[#e64d00] text-white px-6 font-bold rounded-r-xl transition-colors shadow-md"
                                    >
                                      Bağlan
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleDosya(e.dataTransfer.files[0]); }}
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full h-64 border-2 border-dashed border-slate-300 hover:border-[#FF5500] bg-slate-50 hover:bg-[#FF5500]/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
                                  >
                                    <div className="w-16 h-16 mb-4 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                      <Upload className="w-8 h-8 text-[#FF5500]" />
                                    </div>
                                    <p className="text-slate-700 font-bold mb-1">Tasarımınızı Sürükleyin veya Seçin</p>
                                    <p className="text-slate-500 text-sm">PNG, JPG veya WEBP (Maks 10MB)</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="w-full md:w-1/3 aspect-square rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm group">
                                {gorselBase64 ? (
                                  <>
                                    <img src={gorselBase64} alt="Yüklenen" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <button onClick={() => setAdim(1)} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                                        <RotateCcw className="w-4 h-4" /> Değiştir
                                      </button>
                                    </div>
                                  </>
                                ) : null}
                              </div>
                              <div className="flex-1 flex flex-col justify-center space-y-4">
                                <h4 className="text-lg font-bold text-slate-900">Analiz için Son Ayarlar</h4>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Hedef Sektör</label>
                                    <input
                                      type="text"
                                      value={isletme}
                                      onChange={(e) => setIsletme(e.target.value)}
                                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
                                      placeholder="Örn: E-Ticaret, Yazılım, Tekstil"
                                    />
                                  </div>
                                  <AnalizEtButton
                                    onClick={analizEt}
                                    yukleniyor={yukleniyor}
                                    metin="Yapay Zeka ile Analiz Et"
                                    kullanici={kullanici}
                                    authAc={() => setAuthAcik(true)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Stepper Sidebar */}
                        <div className="w-full lg:w-[280px] bg-white border border-slate-200 rounded-[24px] shadow-sm p-6 flex flex-col">
                          <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Süreç</h4>
                          <div className="space-y-8 relative">
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100" />
                            
                            <div className="flex gap-4 relative z-10">
                              <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors \${adim > 1 ? 'bg-emerald-500 text-white' : 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]'}\`}>
                                {adim > 1 ? <Check className="w-4 h-4" /> : "1"}
                              </div>
                              <div>
                                <h5 className={\`font-bold text-sm \${adim >= 1 ? 'text-slate-900' : 'text-slate-400'}\`}>Tasarım Formatı</h5>
                                <p className="text-xs text-slate-500 mt-0.5">{adim > 1 ? 'Format ve görsel seçildi' : 'Tasarımın türünü belirleyin'}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 relative z-10">
                              <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors \${adim > 2 ? 'bg-emerald-500 text-white' : adim === 2 ? 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]' : 'bg-slate-100 text-slate-400'}\`}>
                                {adim > 2 ? <Check className="w-4 h-4" /> : "2"}
                              </div>
                              <div>
                                <h5 className={\`font-bold text-sm \${adim >= 2 ? 'text-slate-900' : 'text-slate-400'}\`}>Derinlemesine Analiz</h5>
                                <p className="text-xs text-slate-500 mt-0.5">{adim > 2 ? 'Analiz tamamlandı' : adim === 2 ? 'Hedef kitle parametreleri' : 'Bekleniyor...'}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 relative z-10">
                              <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors \${adim === 3 ? 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]' : 'bg-slate-100 text-slate-400'}\`}>
                                3
                              </div>
                              <div>
                                <h5 className={\`font-bold text-sm \${adim === 3 ? 'text-slate-900' : 'text-slate-400'}\`}>Sonuç ve Rapor</h5>
                                <p className="text-xs text-slate-500 mt-0.5">{adim === 3 ? 'Rapor hazırlandı' : 'Bekleniyor...'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Mini Info Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
                          <h4 className="text-sm font-semibold text-slate-500 mb-2">Önerilen Hedef Sektörler</h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">E-Ticaret</span>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Moda</span>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Teknoloji</span>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-[24px] p-6 flex flex-col justify-between shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-slate-500">Analiz Derinliği</h4>
                            <span className="text-[10px] font-bold text-[#FF5500] bg-[#FF5500]/10 px-2 py-1 rounded-md uppercase tracking-wider">Seviye 3</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-[#FF5500] rounded-full relative">
                              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-pulse" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-[24px] p-6 flex flex-col justify-between shadow-sm">
                          <h4 className="text-sm font-semibold text-slate-500 mb-2">Son Analiz Skoru</h4>
                          <div className="flex items-end gap-2 mb-3">
                            <span className="text-3xl font-bold tracking-tight text-slate-900">92<span className="text-sm text-slate-400 font-medium">/100</span></span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-[92%] bg-emerald-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                      
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleDosya(e.target.files[0])} />
                    </>
                  ) : (
                    <div className="w-full transition-all duration-700">`;

let updatedContent = content.replace(regex1, replacement1);

const regex3 = /\)\}\s*<\/main>\s*\) : null\}/m;

updatedContent = updatedContent.replace(regex3, `)}
                    </div>
                  )}
                </div>
              </main>
            </div>
          )}`);

fs.writeFileSync(path, updatedContent, 'utf8');
console.log('Update successful');
