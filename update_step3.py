import sys

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = """              {/* ADIM 3 \u2014 Premium Dashboard (Modern Mockup Style) */}
              {adim === 3 && sonuc && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full space-y-4 md:space-y-6 max-w-7xl mx-auto"
                >
                  {/* Demo Mode Banner */}
                  {sonuc._demo && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[11px] font-medium">
                      <span className="text-lg">⚡</span>
                      <span><strong>Demo Modu</strong> \u2014 Gemini API kotası doldu. Sabah 03:00'da sıfırlanır. Gösterilen sonuçlar örnek verilerdir.</span>
                    </div>
                  )}

                  {/* Header Row (User / Restart / Share) */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4 pl-2">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-brand-orange)]/10 flex items-center justify-center relative">
                        <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-[2px] border-white rounded-full"></div>
                        <span className="text-xl font-black text-[var(--color-brand-dark)]">{isletme.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-[var(--color-brand-dark)] font-bold text-base leading-tight">Analiz Raporu</h3>
                        <p className="text-[var(--color-brand-dark)]/40 text-xs font-medium">Hoş geldin, projen hazır 👋</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={sifirla} className="px-4 py-2 rounded-xl text-[var(--color-brand-dark)]/60 hover:bg-[var(--color-brand-light)] font-semibold text-sm transition-colors border border-transparent hover:border-[var(--color-brand-dark)]/5 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Yeni Analiz
                      </button>
                      <button
                        disabled={yayinlaniyor || vitrindeYayinlandi}
                        onClick={async () => {
                          if (vitrindeYayinlandi) return;
                          setYayinlaniyor(true);
                          const basarili = await vitrindeYayinla();
                          setTimeout(() => {
                             if (basarili) setGorunum('vitrin');
                             setYayinlaniyor(false);
                          }, 1500);
                        }}
                        className="px-5 py-2 rounded-xl bg-[var(--color-brand-orange)] text-white font-bold text-sm shadow-[0_4px_12px_rgba(255,77,0,0.2)] hover:bg-[#e64500] transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {vitrindeYayinlandi ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        Toplulukta Keşfet
                      </button>
                    </div>
                  </div>

                  {/* Main Dashboard Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                    
                    {/* LEFT STACK - Metrics + Gauge */}
                    <div className="col-span-1 md:col-span-8 space-y-4 md:space-y-6">
                      {/* Top Top Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        {[
                          { label: "Baskın Renk", value: sonuc.teknikOzet?.baskinRenkSayisi || 3, sub: "adet", icon: <Palette />, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
                          { label: "Detay Yoğunluğu", value: `%${sonuc.teknikOzet?.detayYogunlugu || 45}`, sub: "karışıklık", icon: <Grid />, color: "text-[#38bdf8]", bg: "bg-[#38bdf8]/10" },
                          { label: "Kontrast Değeri", value: sonuc.teknikOzet?.kontrastDegeri || 'Yüksek', sub: "okunabilirlik", icon: <TypeIcon />, color: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/10" }
                        ].map((m, i) => (
                          <div key={i} className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                            <div className="flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-full ${m.bg} ${m.color} flex items-center justify-center mb-4`}>
                                {React.cloneElement(m.icon as any, { className: "w-6 h-6" })}
                              </div>
                              <p className="text-[var(--color-brand-dark)]/40 text-[10px] uppercase font-bold tracking-widest text-center">{m.label}</p>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-black text-[var(--color-brand-dark)] tracking-tight">{m.value}</span>
                              </div>
                              <span className="text-[var(--color-brand-dark)]/40 text-xs font-semibold bg-gray-50 px-2 py-0.5 rounded-full mt-2">{m.sub}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Middle Gauge & Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Gauge Card */}
                        <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-[var(--color-brand-dark)]/40" />
                              <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Genel Skor</span>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-dark)]/40 border border-[var(--color-brand-dark)]/10 px-3 py-1 rounded-full hover:bg-[var(--color-brand-light)]">Detaylar</button>
                          </div>
                          <ScoreRing score={sonuc.genelPuan} />
                          <div className="mt-8 pt-4 border-t border-[var(--color-brand-dark)]/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <span className="text-green-500 text-sm font-bold">+</span>
                            </div>
                            <div>
                              <p className="text-[var(--color-brand-dark)] text-sm font-bold">Harika!</p>
                              <p className="text-[var(--color-brand-dark)]/40 text-[10px]">Genel kalite standartını yakaladınız.</p>
                            </div>
                            <ChevronRight className="w-4 h-4 ml-auto text-[var(--color-brand-dark)]/30" />
                          </div>
                        </div>

                        {/* Summary / Productivity Card */}
                        <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-4 h-4 text-[var(--color-brand-dark)]/40" />
                              <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Gelişim Dağılımı</span>
                            </div>
                          </div>
                          <div className="space-y-4 flex-1 flex flex-col justify-center">
                            {kriterler.slice(0, 4).map((k) => (
                               <div key={k.key}>
                                 <div className="flex justify-between items-end mb-1.5">
                                   <span className="text-[var(--color-brand-dark)]/60 text-[11px] font-bold">{k.label}</span>
                                   <span className="text-[var(--color-brand-dark)] text-sm font-black">{sonuc[k.key]?.puan}/25</span>
                                 </div>
                                 <div className="h-[6px] w-full bg-[var(--color-brand-light)] rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }} 
                                      animate={{ width: `${(sonuc[k.key]?.puan / 25) * 100}%` }}
                                      transition={{ duration: 1, delay: 0.5 }}
                                      className="h-full bg-[#10b981] rounded-full" 
                                    />
                                 </div>
                               </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT STACK - Image & Colors */}
                    <div className="col-span-1 md:col-span-4 space-y-4 md:space-y-6">
                      {/* Image Preview (Like Crops Stocked) */}
                      <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b border-[var(--color-brand-dark)]/5 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[var(--color-brand-dark)]/40" />
                              <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Orijinal Tasarım</span>
                           </div>
                           <button className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-dark)]/40 border border-[var(--color-brand-dark)]/10 px-3 py-1 rounded-full hover:bg-[var(--color-brand-light)]">Büyüt</button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center items-center bg-[var(--color-brand-light)]/50 group cursor-zoom-in min-h-[220px]" onClick={() => gorsel && setSeciliGorsel(gorsel)}>
                          <img src={gorsel!} alt="Orijinal" className="max-w-full max-h-[250px] object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-500 shadow-sm" />
                        </div>
                        
                        {/* Sub Colors */}
                        {sonuc.renkPaleti?.length > 0 && (
                          <div className="p-4 border-t border-[var(--color-brand-dark)]/5 bg-white">
                             <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                 {sonuc.renkPaleti.slice(0, 5).map((hex: string, i: number) => (
                                   <div key={i} className="flex flex-col items-center gap-1 group">
                                       <div className="w-8 h-8 rounded-full border border-[var(--color-brand-dark)]/10 shadow-inner" style={{ backgroundColor: hex }} />
                                       <span className="text-[8px] font-mono font-bold text-[var(--color-brand-dark)]/30 opacity-0 group-hover:opacity-100 transition-opacity">{hex.toUpperCase()}</span>
                                   </div>
                                 ))}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ROW - Feedback & AI Pro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                    {/* Detailed Feedback (Like Weather/Tasks) */}
                    <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                       <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-2">
                           <AlertCircle className="w-4 h-4 text-[var(--color-brand-dark)]/40" />
                           <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Analiz Özeti</span>
                         </div>
                       </div>
                       <div className="space-y-4">
                          <div className="bg-[var(--color-brand-light)] p-4 rounded-xl">
                            <p className="text-[var(--color-brand-dark)]/80 text-[13px] font-semibold leading-relaxed">"{sonuc.genelYorum}"</p>
                          </div>
                          {sonuc.gucluYon && (
                            <div className="flex items-start gap-3 border border-[var(--color-brand-dark)]/5 rounded-xl p-4">
                               <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                 <Check className="w-3 h-3 text-emerald-500" />
                               </div>
                               <div>
                                 <p className="text-[var(--color-brand-dark)]/40 text-[9px] font-bold uppercase tracking-widest mb-1">Güçlü Yön</p>
                                 <p className="text-[var(--color-brand-dark)]/70 text-xs leading-relaxed">{sonuc.gucluYon}</p>
                               </div>
                            </div>
                          )}
                          {sonuc.zayifYon && (
                            <div className="flex items-start gap-3 border border-[var(--color-brand-dark)]/5 rounded-xl p-4">
                               <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                 <AlertCircle className="w-3 h-3 text-amber-500" />
                               </div>
                               <div>
                                 <p className="text-[var(--color-brand-dark)]/40 text-[9px] font-bold uppercase tracking-widest mb-1">Geliştirilebilir</p>
                                 <p className="text-[var(--color-brand-dark)]/70 text-xs leading-relaxed">{sonuc.zayifYon}</p>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>

                    {/* AI Suggestion */}
                    <div className="bg-white rounded-[24px] border border-[var(--color-brand-dark)]/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                       <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-[#ff4d00]" />
                           <span className="text-[var(--color-brand-dark)]/80 font-bold text-sm tracking-wide">Yapay Zeka Önerisi</span>
                         </div>
                         <span className="bg-[#ff4d00] text-white text-[9px] font-extrabold px-2 py-1 rounded-[6px] uppercase tracking-wider">PRO ÖZELLİK</span>
                       </div>
                       <div className="flex-1 border border-[#ff4d00]/10 bg-gradient-to-br from-[#ff4d00]/[0.02] to-transparent rounded-2xl p-5 mb-4">
                          <p className="text-[var(--color-brand-dark)]/70 text-[13px] leading-relaxed font-medium">
                            {sonuc.oneri}
                          </p>
                       </div>
                       <button className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-900 to-[var(--color-brand-dark)] text-white font-bold text-sm transition-transform hover:scale-[1.01] shadow-xl flex items-center justify-center gap-2">
                           Tasarımı AI İle İyileştir <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                  </div>

                  {/* Footer Padding for aesthetics */}
                  <div className="h-6 w-full" />
                </motion.div>
              )}
"""

lines = lines[:867] + [new_content + "\\n"] + lines[1206:]
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
