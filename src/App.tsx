import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Thermometer,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PackageCheck,
  PackageOpen,
  SlidersHorizontal,
  Sparkles,
  ClipboardCheck,
  Info,
  Mail,
  User,
  Activity
} from 'lucide-react';
import { validityData, ValidityItem } from './data';
import { calculateExpiration, formatDateToBr } from './utils';

export default function App() {
  // --- Android-Style Interactive Haptic States ---
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'guide' | 'about'>('search');

  // --- Core Subway Data States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductName, setSelectedProductName] = useState<string>('Frango Empanado');
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(0);
  const [packagingState, setPackagingState] = useState<'open' | 'closed'>('closed');
  const [startDate, setStartDate] = useState<Date>(new Date());
  
  // Simulated success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger simulated haptic click sound
  const triggerHaptics = (message?: string) => {
    setHapticFeedback(true);
    setTimeout(() => setHapticFeedback(false), 150);
    
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(820, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.04);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      // Browser audio restriction safeguard
    }

    if (message) {
      showToast(message);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // --- Subway Calculation Helpers ---
  const uniqueProductNames = useMemo(() => {
    const names = new Set<string>();
    // Focus primarily on Proteins as requested by title, but all data remains queryable
    validityData.forEach(item => names.add(item.name));
    return Array.from(names);
  }, []);

  const filteredProductNames = useMemo(() => {
    if (!searchQuery.trim()) return uniqueProductNames;
    return uniqueProductNames.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, uniqueProductNames]);

  const availableBrands = useMemo(() => {
    return validityData.filter(item => item.name === selectedProductName);
  }, [selectedProductName]);

  const activeItem = useMemo(() => {
    if (availableBrands.length === 0) return validityData[0];
    const index = selectedBrandIndex >= availableBrands.length ? 0 : selectedBrandIndex;
    return availableBrands[index];
  }, [availableBrands, selectedBrandIndex]);

  const expirationResult = useMemo(() => {
    return calculateExpiration(activeItem, packagingState, startDate);
  }, [activeItem, packagingState, startDate]);

  const handleSelectProduct = (name: string) => {
    triggerHaptics(`Produto: ${name}`);
    setSelectedProductName(name);
    setSelectedBrandIndex(0);
  };

  const handleSelectBrand = (index: number, brandName: string) => {
    triggerHaptics(`Marca selecionada: ${brandName}`);
    setSelectedBrandIndex(index);
  };

  const handleTogglePackaging = (state: 'open' | 'closed') => {
    const itemValidity = state === 'open' ? activeItem.openValidity : activeItem.closedValidity;
    if (itemValidity === '-') {
      triggerHaptics('Validade indisponível para este estado!');
      return;
    }
    triggerHaptics(`Embalagem ${state === 'open' ? 'Aberta' : 'Fechada'}`);
    setPackagingState(state);
  };

  const handleResetToNow = () => {
    triggerHaptics('Hora de início redefinida');
    setStartDate(new Date());
  };

  const handleCopyToClipboard = () => {
    const expText = expirationResult.expirationDate
      ? formatDateToBr(expirationResult.expirationDate)
      : expirationResult.durationText;

    const formattedCopyText = `====== VALIDADES SUBWAY ======
PRODUTO: ${activeItem.name}
MARCA: ${activeItem.supplier}
ESTADO: Embalagem ${packagingState === 'open' ? 'Aberta' : 'Fechada'}
FAIXA DE TEMP: 1°C a 5°C
REGISTRADO: ${formatDateToBr(startDate)}
VALIDADE ATÉ: ${expText}
==============================`;

    navigator.clipboard.writeText(formattedCopyText).then(() => {
      triggerHaptics('Dados copiados para a área de transferência! 📋');
    });
  };

  return (
    <div className="h-screen bg-[#020617] text-[#f3f4f6] flex flex-col selection:bg-emerald-600 selection:text-white overflow-hidden">
      
      {/* Centered mobile-optimized layout block */}
      <div className="w-full max-w-md mx-auto bg-[#090d16] h-full flex flex-col relative shadow-2xl border-x border-slate-800/60 overflow-hidden">
        
        {/* App Header */}
        <div className="bg-gradient-to-b from-[#026a42] to-[#014c2e] p-4 pb-5 text-white relative shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-white text-[#026a42] px-2.5 py-0.5 rounded-lg font-black font-display text-sm tracking-tighter">
                SUBWAY★
              </span>
              <span className="text-[9px] tracking-widest text-emerald-300 font-bold uppercase font-mono">
                Mtake App
              </span>
            </div>
            <button 
              onClick={() => triggerHaptics('Opções rápidas de conservação')}
              className="p-1.5 rounded-full bg-emerald-800/40 hover:bg-emerald-800 text-emerald-200 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subway Branding Title */}
          <h2 className="text-sm font-bold text-white mt-3.5 flex items-center gap-1.5 font-display tracking-tight">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            Validades SuBway - Proteínas
          </h2>
          <p className="text-[10px] text-emerald-200/90 leading-tight mt-0.5 font-medium">
            Controle de conservação e padrões higiênico-sanitários
          </p>
        </div>

        {/* Interactive App Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 left-4 right-4 bg-slate-900/95 backdrop-blur-md text-white py-2 px-4 rounded-2xl text-xs font-semibold shadow-lg border border-slate-800 text-center z-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Main Container Views with dynamic switching */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-4 scrollbar-none pb-24">
            
            {activeTab === 'search' && (
              <>
                {/* Section 1: Product Selector and Search */}
                <div className="bg-[#111827]/95 rounded-2xl p-3.5 border border-slate-800/80 flex flex-col gap-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">1</span>
                      Selecione o Produto
                    </label>
                    <span className="text-[10px] font-bold text-emerald-400 truncate max-w-[150px]">
                      {selectedProductName}
                    </span>
                  </div>

                  {/* Android Style Search Bar */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-slate-500" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-8.5 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                      placeholder="Pesquise o produto aqui..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-[10px] font-bold"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {/* Clean List for selection instead of raw text */}
                  <div className="max-h-36 overflow-y-auto border border-slate-900 rounded-xl divide-y divide-slate-900/60 bg-[#070a13]/90">
                    {filteredProductNames.length > 0 ? (
                      filteredProductNames.map((name) => {
                        const isSelected = selectedProductName === name;
                        return (
                          <button
                            key={name}
                            onClick={() => handleSelectProduct(name)}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-950/40 text-emerald-300 font-bold'
                                : 'hover:bg-slate-900/40 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-slate-500 text-[10px]">
                        Nenhum produto correspondente.
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Brand/Supplier Selection */}
                <div className="bg-[#111827]/95 rounded-2xl p-3.5 border border-slate-800/80 flex flex-col gap-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                    Marca / Fornecedor
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {availableBrands.map((brand, idx) => {
                      const isSelected = selectedBrandIndex === idx;
                      return (
                        <button
                          key={brand.id}
                          onClick={() => handleSelectBrand(idx, brand.supplier)}
                          className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between h-14 cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold shadow-inner'
                              : 'border-slate-800 bg-[#0d1321] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[11px] truncate leading-tight">{brand.supplier}</span>
                          <span className="text-[8px] text-slate-500 font-mono truncate">Temp: 1°C a 5°C</span>
                          {isSelected && (
                            <span className="absolute top-2 right-2 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Open vs Closed Toggle */}
                <div className="bg-[#111827]/95 rounded-2xl p-3.5 border border-slate-800/80 flex flex-col gap-2.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                    Estado da Embalagem
                  </label>

                  <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-1 rounded-xl border border-slate-900">
                    <button
                      onClick={() => handleTogglePackaging('closed')}
                      disabled={activeItem.closedValidity === '-'}
                      className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                        packagingState === 'closed'
                          ? 'bg-emerald-600 text-white shadow font-extrabold'
                          : 'text-slate-400 hover:text-slate-200 disabled:opacity-20'
                      }`}
                    >
                      <span>Fechada</span>
                      <span className="text-[9px] font-normal text-slate-200 opacity-90">
                        {activeItem.closedValidity === '-' ? 'N/A' : activeItem.closedValidity}
                      </span>
                    </button>

                    <button
                      onClick={() => handleTogglePackaging('open')}
                      disabled={activeItem.openValidity === '-'}
                      className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                        packagingState === 'open'
                          ? 'bg-emerald-600 text-white shadow font-extrabold'
                          : 'text-slate-400 hover:text-slate-200 disabled:opacity-20'
                      }`}
                    >
                      <span>Aberta</span>
                      <span className="text-[9px] font-normal text-slate-200 opacity-90">
                        {activeItem.openValidity === '-' ? 'N/A' : activeItem.openValidity}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Section 4: Highly polished native Android calculation output */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-400 text-slate-950 text-[8px] font-extrabold uppercase tracking-widest rounded-bl-xl font-mono">
                    Temperatura: 1°C a 5°C
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>STATUS DE CONSERVAÇÃO</span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">Tempo de Validade</span>
                    <span className="text-lg font-black text-emerald-400 mt-0.5 leading-none">
                      {packagingState === 'open' ? activeItem.openValidity : activeItem.closedValidity}
                    </span>
                    
                    <div className="w-3/4 border-t border-dashed border-slate-900 my-2"></div>

                    <span className="text-[8px] text-rose-400 font-extrabold uppercase tracking-wider">Limite para Descarte</span>
                    <span className="text-xs font-bold text-rose-400 mt-0.5 font-mono">
                      {expirationResult.expirationDate
                        ? formatDateToBr(expirationResult.expirationDate)
                        : expirationResult.durationText}
                    </span>
                  </div>

                  {/* Android Quick Action to Copy Sticker */}
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    Copiar Dados de Validade
                  </button>

                  {/* Small Clock Quick Offset to reset/change */}
                  <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-900 pt-2 font-mono">
                    <span>Início: {formatDateToBr(startDate)}</span>
                    <button 
                      onClick={handleResetToNow}
                      className="text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Redefinir
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* View Tab 2: Guidelines (Diretrizes) */}
            {activeTab === 'guide' && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Diretrizes de Higiene
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    De acordo com os padrões higiênico-sanitários vigentes, todos os alimentos mantidos sob refrigeração na faixa de <strong>1°C a 5°C</strong> devem estar armazenados em recipientes hermeticamente vedados.
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                    É obrigatória a identificação imediata com etiquetas contendo o nome do produto, data de abertura (se aplicável), data e hora limite para descarte e o responsável pelo registro.
                  </p>
                </div>

                <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800 flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prazos de Linha de Frente (Serviço)</h4>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                    <div className="p-2 bg-slate-950 rounded-lg">
                      <span className="block font-bold text-emerald-400">Proteínas</span>
                      <span>24h ou 48h dependendo do preparo da carne.</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg">
                      <span className="block font-bold text-emerald-400">Pães</span>
                      <span>Até 8h após assado no armário de pães.</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg">
                      <span className="block font-bold text-emerald-400">Cookies</span>
                      <span>8h (Bimbo) ou 24h (Mr. Bey) em serviço.</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg">
                      <span className="block font-bold text-emerald-400">Queijos</span>
                      <span>De 24h (cremoso) a 72h (fatiados).</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Tab 3: About App (Sobre) with corrected text */}
            {activeTab === 'about' && (
              <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
                <div className="text-center pb-2 border-b border-slate-800 flex flex-col items-center">
                  <User className="w-6 h-6 text-emerald-400 mb-1" />
                  <span className="font-display font-black text-emerald-300 text-sm">Milton Costa</span>
                  <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Fundador & CEO Mtake Company</p>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed text-justify">
                  <p>
                    Este aplicativo foi criado pelo programador Milton Costa, fundador e CEO da Mtake Company, para seu uso pessoal, com o objetivo de memorizar datas e validades dos produtos referidos no app, sendo de forma não oficial.
                  </p>
                  <p>
                    O aplicativo não possui nenhuma relação com a empresa ou suas franquias.
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 mt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>SUPORTE & CONTATO</span>
                  </div>
                  <a 
                    href="mailto:mtake1480@gmail.com" 
                    className="text-[10px] text-slate-400 hover:text-emerald-300 transition-colors block font-mono"
                  >
                    mtake1480@gmail.com
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Android Bottom Navigation Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#1e293b]/95 border-t border-slate-800 py-2 px-4 flex justify-around items-center z-40 backdrop-blur-md">
            
            <button
              onClick={() => {
                triggerHaptics('Aba de Consulta Ativa');
                setActiveTab('search');
              }}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'search' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Search className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold uppercase tracking-wider">Consulta</span>
            </button>

            <button
              onClick={() => {
                triggerHaptics('Aba de Diretrizes Ativa');
                setActiveTab('guide');
              }}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'guide' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Info className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold uppercase tracking-wider">Diretrizes</span>
            </button>

            <button
              onClick={() => {
                triggerHaptics('Aba Sobre Ativa');
                setActiveTab('about');
              }}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'about' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <User className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold uppercase tracking-wider">Sobre</span>
            </button>

          </div>

      </div>
    </div>
  );
}
