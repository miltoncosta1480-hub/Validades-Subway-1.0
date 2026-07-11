import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Thermometer,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Tag,
  MapPin,
  Building2,
  PackageCheck,
  PackageOpen
} from 'lucide-react';
import { validityData, ValidityItem } from './data';
import { calculateExpiration, formatDateToBr, LabelType } from './utils';

export default function App() {
  // 1. Product Selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductName, setSelectedProductName] = useState<string>('Frango Empanado');

  // Get all unique product names to populate a clean selector/list
  const uniqueProductNames = useMemo(() => {
    const names = new Set<string>();
    validityData.forEach(item => names.add(item.name));
    return Array.from(names);
  }, []);

  // Filter product list based on query
  const filteredProductNames = useMemo(() => {
    if (!searchQuery.trim()) return uniqueProductNames;
    return uniqueProductNames.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, uniqueProductNames]);

  // 2. Brand Selection state
  // Automatically select the first available supplier when product name changes
  const availableBrands = useMemo(() => {
    return validityData.filter(item => item.name === selectedProductName);
  }, [selectedProductName]);

  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(0);

  // If the selected brand index is out of bounds for the current product, reset to 0
  const activeItem = useMemo(() => {
    if (availableBrands.length === 0) return validityData[0];
    const index = selectedBrandIndex >= availableBrands.length ? 0 : selectedBrandIndex;
    return availableBrands[index];
  }, [availableBrands, selectedBrandIndex]);

  // 3. Packaging State (Open vs Closed)
  const [packagingState, setPackagingState] = useState<'open' | 'closed'>('closed');

  // Custom calculation start date state (defaults to current date-time)
  const [startDate, setStartDate] = useState<Date>(new Date());

  // Quick adjust start date to now
  const resetToNow = () => {
    setStartDate(new Date());
  };

  // Sync custom start date input
  const handleDateChange = (dateValue: string) => {
    if (!dateValue) return;
    setStartDate(new Date(dateValue));
  };

  // Calculate the expiration outcome
  const expirationResult = useMemo(() => {
    return calculateExpiration(activeItem, packagingState, startDate);
  }, [activeItem, packagingState, startDate]);

  // Helper to handle auto-selecting a product name
  const selectProduct = (name: string) => {
    setSelectedProductName(name);
    setSelectedBrandIndex(0); // Reset brand index to first brand of new product
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans antialiased flex flex-col">
      {/* Decorative Brand Accent Stripe */}
      <div className="h-1.5 bg-subway-yellow w-full" />

      {/* Simplified, Clean Header */}
      <header className="bg-subway-green text-white shadow-sm py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white text-subway-green px-3 py-1 rounded-lg font-display font-black text-xl tracking-tight shadow-sm">
              SUBWAY<span className="text-subway-yellow">★</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">Validades de Produtos</h1>
              <p className="text-[11px] text-subway-yellow-light font-medium flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> Foco na conservação de <span className="underline font-bold text-white">1°C a 5°C</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold bg-[#014c2e] text-emerald-200 border border-emerald-800/40 px-2 py-1 rounded">
            Versão 05/2020
          </span>
        </div>
      </header>

      {/* Main Focus Search Tool */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: The Interactive Step Form (7 Columns) */}
          <div className="md:col-span-7 flex flex-col gap-5">
            
            {/* Step 1: Product Search & Selection */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-subway-green text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Selecione o Produto
                </label>
                {selectedProductName && (
                  <span className="text-xs font-bold text-subway-green bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Selecionado
                  </span>
                )}
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  id="product-search"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-subway-green focus:bg-white transition-all font-medium"
                  placeholder="Pesquise o produto... (ex: Frango, Bacon)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Dynamic Matches List */}
              <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 scrollbar-thin">
                {filteredProductNames.length > 0 ? (
                  filteredProductNames.map((name) => {
                    const isSelected = selectedProductName === name;
                    const category = validityData.find(i => i.name === name)?.category || 'Proteína';
                    return (
                      <button
                        key={name}
                        onClick={() => selectProduct(name)}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors font-medium flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-subway-green font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {category}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-subway-green shrink-0" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    Nenhum produto corresponde à busca "{searchQuery}".
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Brand/Supplier Selection */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-subway-green text-white text-[11px] flex items-center justify-center font-bold">2</span>
                Selecione a Marca (Fornecedor)
              </label>

              <p className="text-[11px] text-slate-400 font-medium">
                Marcas disponíveis para o produto <strong className="text-slate-600">"{selectedProductName}"</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableBrands.map((brand, idx) => {
                  const isSelected = selectedBrandIndex === idx;
                  return (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrandIndex(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-subway-green bg-emerald-50/50 text-subway-green font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs">{brand.supplier}</span>
                      <span className="text-[9px] text-slate-400 mt-1 font-normal">
                        Temp. Primária: {brand.primaryStorage}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 text-subway-green">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Packaging State Choice */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-subway-green text-white text-[11px] flex items-center justify-center font-bold">3</span>
                Estado da Embalagem
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Fechada Option */}
                <button
                  onClick={() => setPackagingState('closed')}
                  disabled={activeItem.closedValidity === '-'}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 disabled:opacity-40 disabled:pointer-events-none ${
                    packagingState === 'closed'
                      ? 'border-subway-green bg-emerald-50 text-subway-green font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <PackageCheck className="w-5 h-5" />
                  <div className="text-xs">Embalagem Fechada</div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {activeItem.closedValidity === '-' ? 'Não disponível' : `Padrão: ${activeItem.closedValidity}`}
                  </div>
                </button>

                {/* Aberta Option */}
                <button
                  onClick={() => setPackagingState('open')}
                  disabled={activeItem.openValidity === '-'}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 disabled:opacity-40 disabled:pointer-events-none ${
                    packagingState === 'open'
                      ? 'border-subway-green bg-emerald-50 text-subway-green font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <PackageOpen className="w-5 h-5" />
                  <div className="text-xs">Embalagem Aberta</div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {activeItem.openValidity === '-' ? 'Não disponível' : `Padrão: ${activeItem.openValidity}`}
                  </div>
                </button>
              </div>
            </div>

            {/* Step 4: Customizable Start Time (Optional Helper) */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Alterar Hora de Início (opcional)
                </label>
                <button
                  onClick={resetToNow}
                  className="text-[11px] text-subway-green font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Usar Agora
                </button>
              </div>
              <input
                type="datetime-local"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-subway-green text-slate-700 font-medium"
                value={startDate.toISOString().substring(0, 16)}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

          </div>

          {/* RIGHT PANEL: The Real-time Dynamic Result Card (5 Columns) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            
            {/* Dynamic Expiration Display Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 flex flex-col gap-4 sticky top-6">
              
              <div className="text-center pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold text-subway-green bg-subway-green/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Resultado da Consulta
                </span>
                <h3 className="text-xl font-display font-bold text-slate-800 mt-2">
                  {activeItem.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Marca: {activeItem.supplier}
                </p>
              </div>

              {/* Temperature Alert Focus Badge */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <Thermometer className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800">Temperatura de Conservação</h4>
                  <p className="text-[11px] text-amber-700 font-semibold">
                    Sob refrigeração constante de <strong className="font-extrabold text-amber-900">1°C a 5°C</strong>.
                  </p>
                </div>
              </div>

              {/* Big Expiration Output Block */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Validade do Produto ({packagingState === 'open' ? 'Aberta' : 'Fechada'})
                </span>
                
                {/* Large Duration Text */}
                <span className="text-2xl font-black text-subway-green mt-1">
                  {packagingState === 'open' ? activeItem.openValidity : activeItem.closedValidity}
                </span>

                <div className="w-full border-t border-dashed border-slate-200 my-3"></div>

                {/* Concrete Limit Expiration Timestamp */}
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Válido até</span>
                <span className="text-base font-extrabold text-rose-700 tracking-tight mt-0.5">
                  {expirationResult.expirationDate
                    ? formatDateToBr(expirationResult.expirationDate)
                    : expirationResult.durationText}
                </span>

                <span className="text-[10px] text-slate-400 font-mono mt-2">
                  Início: {formatDateToBr(startDate)}
                </span>
              </div>

              {/* Comparison Section (Shows both closed & open at a glance) */}
              <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 flex flex-col gap-2">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Comparativo de Conservação (1-5°C):
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-sky-50 rounded-lg border border-sky-100 flex flex-col">
                    <span className="text-[9px] text-sky-600 font-bold uppercase">Fechada</span>
                    <strong className="text-sky-800 mt-0.5 font-bold">
                      {activeItem.closedValidity === '-' ? 'N/A' : activeItem.closedValidity}
                    </strong>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 flex flex-col">
                    <span className="text-[9px] text-amber-600 font-bold uppercase">Aberta</span>
                    <strong className="text-amber-800 mt-0.5 font-bold">
                      {activeItem.openValidity === '-' ? 'N/A' : activeItem.openValidity}
                    </strong>
                  </div>
                </div>

                {activeItem.notes && (
                  <div className="text-[10px] text-slate-400 mt-1 italic flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{activeItem.notes}</span>
                  </div>
                )}
              </div>

              {/* Subway Safety Standards Label */}
              <div className="text-[10px] text-slate-400 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg text-center">
                ⚠️ Mantenha os recipientes hermeticamente vedados e etiquetados corretamente para evitar contaminação cruzada.
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* FOOTER METADATA AND SOURCE */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-white">SUBWAY<span className="text-subway-yellow">★</span></span>
            <span>Tabela de Validades Digital — Base: Versão 05/2020</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Foco regulatório de temperatura de 1°C a 5°C para o controle higiênico-sanitário em lanchonetes e fast-food.
          </p>
        </div>
      </footer>
    </div>
  );
}
