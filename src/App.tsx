/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import './image.css';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Upload,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Image as ImageIcon,
  X,
  Download,
  ChevronRight,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Apple,
  Type,
  FlipHorizontal,
  RotateCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { PhoneModel } from './constants';

const GOOGLE_FONTS = [
  { name: 'Lexend', value: "'Lexend', sans-serif" },
  { name: 'Arial', value: 'sans-serif' },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Oswald', value: "'Oswald', sans-serif" },
  { name: 'Lora', value: "'Lora', serif" },
  { name: 'Comfortaa', value: "'Comfortaa', cursive" },
  { name: 'Caveat', value: "'Caveat', cursive" },
  { name: 'Pacifico', value: "'Pacifico', cursive" },
  { name: 'Dancing Script', value: "'Dancing Script', cursive" },
  { name: 'Satisfy', value: "'Satisfy', cursive" },
  { name: 'Great Vibes', value: "'Great Vibes', cursive" },
  { name: 'Indie Flower', value: "'Indie Flower', cursive" },
  { name: 'Permanent Marker', value: "'Permanent Marker', cursive" },
  { name: 'Shadows Into Light', value: "'Shadows Into Light', cursive" },
  { name: 'Amatic SC', value: "'Amatic SC', cursive" },
  { name: 'Special Elite', value: "'Special Elite', cursive" },
  { name: 'Bangers', value: "'Bangers', cursive" },
  { name: 'Lobster', value: "'Lobster', cursive" },
  { name: 'Sacramento', value: "'Sacramento', cursive" },
  { name: 'Cookie', value: "'Cookie', cursive" },
];

const SHEETS_COLORS = [
  '#000000',
  '#ffffff',
  '#4285f4',
  '#34a853',
  '#fbbc05',
  '#ea4335',
  '#673ab7',
  '#3f51b5',
  '#00bcd4',
  '#009688',
  '#ff5722',
  '#795548',
  '#9e9e9e',
  '#607d8b',
  '#e91e63',
  '#9c27b0',
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragLimits, setDragLimits] = useState({
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
});

  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<PhoneModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);

  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textFont, setTextFont] = useState(GOOGLE_FONTS[0].value);
  const [textSize, setTextSize] = useState(24);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textRotation, setTextRotation] = useState(0);
  const [imageRotation, setImageRotation] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);

  const brands = useMemo(() => {
  return [...new Set(phoneModels.map((model) => model.brand).filter(Boolean))];
}, [phoneModels]);

  const filteredModels = useMemo(() => {
    return phoneModels.filter(
      (m) =>
        m.brand === selectedBrand &&
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedBrand, searchQuery, phoneModels]);

const normalizedRotation = ((imageRotation % 360) + 360) % 360;

const isQuarterTurn =
  normalizedRotation === 90 || normalizedRotation === 270;

const effectiveRatio = imageRatio
  ? (isQuarterTurn ? 1 / imageRatio : imageRatio)
  : 1;

  function mapSheetRowToPhoneModel(row: any): PhoneModel | null {
    if (!row.marca || !row.modelo) return null;

    return {
      id: String(row.modelo).toLowerCase().replace(/\s+/g, '-'),
      name: String(row.modelo).trim(),
      brand: String(row.marca).trim(),
      color: row.cor ? String(row.cor).trim() : '#1a1a1a',
      cameraLayout: (row.cameralayout || 'single-top-left') as PhoneModel['cameraLayout'],
      hasLogo: String(row.haslogo).toLowerCase() === 'true',
    };
  }

  const getDirectImageUrl = (url: string) => {
    if (!url || typeof url !== 'string') return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.includes('drive.google.com')) {
      const idMatch = trimmedUrl.match(/\/d\/([^\/]+)/) || trimmedUrl.match(/id=([^&]+)/);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
      }
    }
    return trimmedUrl;
  };

  useEffect(() => {
    async function loadSheet() {
      try {
        const sheetId = '1Cf_TF8OR34ojUbgGJ0tztN3uPoOJjGiv9hH6MyYPih0';

        const sheets = [
          { brand: 'APPLE', gid: '0' },
          { brand: 'SAMSUNG', gid: '439184733' },
          { brand: 'MOTOROLA', gid: '1348668329' },
          { brand: 'XIAOMI', gid: '814945176' },
          { brand: 'REALME', gid: '1793242541' },
        ];

        const allModels: PhoneModel[] = [];

        for (const sheet of sheets) {
          const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${sheet.gid}`;

          const res = await fetch(url);
          const text = await res.text();

          const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
          if (!match) {
            console.warn(`Não consegui achar JSON na aba ${sheet.brand}`);
            continue;
          }

          const json = JSON.parse(match[1]);
          const rawRows = json.table?.rows ?? [];

          if (!rawRows.length) continue;

          // remove cabeçalho
          const dataRows = rawRows.slice(1);

          dataRows.forEach((row: any) => {
            const col1 = String(row.c?.[0]?.v ?? '').trim(); // nome
            const col2Raw = String(row.c?.[1]?.v ?? '').trim(); // coluna 2
            const col3Raw = String(row.c?.[2]?.v ?? '').trim(); // coluna 3

            if (!col1) return;

            const col2 = getDirectImageUrl(col2Raw);
            const col3 = getDirectImageUrl(col3Raw);

            allModels.push({
              id: `${sheet.brand}-${col1}`.toLowerCase().replace(/\s+/g, '-'),
              name: col1,
              brand: sheet.brand,

              col2: col2,
              col3: col3,

              color: '#1a1a1a',
              cameraLayout: 'single-top-left',
              hasLogo: sheet.brand.toLowerCase() === 'apple',
            });
          });
        }

        setPhoneModels(allModels);

        if (allModels.length > 0) {
          const firstBrand = allModels[0].brand;
          const firstModel =
            allModels.find((model) => model.brand === firstBrand) ?? allModels[0];

          setSelectedBrand(firstBrand);
          setSelectedModel(firstModel);
        } else {
          setPhoneModels([]);
          setSelectedBrand('');
          setSelectedModel(null);
        }

      } catch (err) {
        console.error('Erro ao buscar sheets:', err);
        setPhoneModels([]);
        setSelectedBrand('');
        setSelectedModel(null);
      }
    }

    loadSheet();
  }, []);
  useEffect(() => {
  if (!imageAreaRef.current || !image || !effectiveRatio) return;

  const updateLimits = () => {
    const areaRect = imageAreaRef.current?.getBoundingClientRect();
    if (!areaRect) return;

    const areaWidth = areaRect.width;
    const areaHeight = areaRect.height;

    let fittedWidth = 0;
    let fittedHeight = 0;

    if (effectiveRatio >= 0.95) {
      fittedHeight = areaHeight;
      fittedWidth = areaHeight * effectiveRatio;
    } else {
      fittedWidth = areaWidth;
      fittedHeight = areaWidth / effectiveRatio;
    }

    const scaleMultiplier = (zoom / 100) * (isQuarterTurn ? 1.02 : 1);

    const finalWidth = fittedWidth * scaleMultiplier;
    const finalHeight = fittedHeight * scaleMultiplier;

    const overflowX = Math.max(0, (finalWidth - areaWidth) / 2);
    const overflowY = Math.max(0, (finalHeight - areaHeight) / 2);

    setDragLimits({
      left: -overflowX,
      right: overflowX,
      top: -overflowY,
      bottom: overflowY,
    });

    setPosition((prev) => ({
      x: Math.max(-overflowX, Math.min(overflowX, prev.x)),
      y: Math.max(-overflowY, Math.min(overflowY, prev.y)),
    }));
  };

  const raf = requestAnimationFrame(updateLimits);
  window.addEventListener('resize', updateLimits);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', updateLimits);
  };
}, [image, zoom, effectiveRatio, isQuarterTurn, selectedModel?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const imageData = event.target?.result as string;

      // 🔍 cria imagem para pegar proporção
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setImageRatio(ratio);
      };

      img.src = imageData;

      // 📸 salva imagem normalmente
      setImage(imageData);
    };

    reader.readAsDataURL(file);
  }
};

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);

  const file = e.dataTransfer.files?.[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const imageData = event.target?.result as string;

      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setImageRatio(ratio);
      };

      img.src = imageData;
      setImage(imageData);
    };

    reader.readAsDataURL(file);
  }
};

  const resetTransform = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
    setCustomText('');
    setTextPosition({ x: 0, y: 0 });
    setTextSize(24);
    setTextColor('#000000');
    setTextFont(GOOGLE_FONTS[0].value);
    setTextRotation(0);
    setImageRotation(0);
    setTextOnlyMode(false);
    setIsMirrored(false);
  };

  const moveImage = (direction: 'up' | 'down' | 'left' | 'right') => {
  const step = 30;

  setPosition((prev) => {
    let newX = prev.x;
    let newY = prev.y;

    if (direction === 'up') newY -= step;
    if (direction === 'down') newY += step;
    if (direction === 'left') newX -= step;
    if (direction === 'right') newX += step;

    return {
      x: Math.max(dragLimits.left, Math.min(dragLimits.right, newX)),
      y: Math.max(dragLimits.top, Math.min(dragLimits.bottom, newY)),
    };
  });
};

   const handleDownload = () => {
    if (!image) return;
    alert('Funcionalidade de exportação de mockup seria implementada aqui!');
  };

  const CameraModule = ({ layout }: { layout: PhoneModel['cameraLayout'] }) => {
    switch (layout) {
      case 'iphone-11':
        return (
          <div className="absolute top-6 left-6 w-28 h-28 bg-white/10 backdrop-blur-md rounded-[2.5rem] p-3 z-30 flex flex-col items-center justify-center gap-2 shadow-[inset_0_0_20px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.1)] border border-white/20">
            <div className="relative w-11 h-11 bg-zinc-900 rounded-full border-[4px] border-zinc-800 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-tr from-blue-900/40 to-transparent opacity-60" />
              <div className="absolute w-3 h-3 bg-blue-400/20 rounded-full blur-[2px]" />
            </div>
            <div className="relative w-11 h-11 bg-zinc-900 rounded-full border-[4px] border-zinc-800 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-tr from-blue-900/40 to-transparent opacity-60" />
              <div className="absolute w-3 h-3 bg-blue-400/20 rounded-full blur-[2px]" />
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-2">
              <div className="w-3 h-3 bg-amber-100 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
              <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
            </div>
          </div>
        );

      case 'single-top-left':
        return (
          <div className="absolute top-8 left-8 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner z-30 border border-white/10">
            <div className="w-8 h-8 bg-zinc-950 rounded-full border-2 border-zinc-800 shadow-inner" />
          </div>
        );

      case 'dual-vertical-left':
        return (
          <div className="absolute top-8 left-8 w-16 h-32 bg-white/10 backdrop-blur-sm rounded-[1.8rem] flex flex-col items-center justify-around py-4 shadow-inner z-30 border border-white/10">
            <div className="w-10 h-10 bg-zinc-950 rounded-full border-2 border-zinc-800 shadow-inner" />
            <div className="w-10 h-10 bg-zinc-950 rounded-full border-2 border-zinc-800 shadow-inner" />
          </div>
        );

      case 'dual-diagonal-left':
        return (
          <div className="absolute top-8 left-8 w-28 h-28 bg-white/10 backdrop-blur-sm rounded-[2.2rem] p-4 z-30 grid grid-cols-2 gap-2 border border-white/10">
            <div className="w-10 h-10 bg-zinc-950 rounded-full self-start justify-self-start border-2 border-zinc-800" />
            <div className="w-10 h-10 bg-zinc-950 rounded-full self-end justify-self-end border-2 border-zinc-800" />
          </div>
        );

      case 'triple-square-left':
        return (
          <div className="absolute top-8 left-8 w-32 h-32 bg-white/10 backdrop-blur-md rounded-[2.8rem] p-5 z-30 grid grid-cols-2 gap-3 border border-white/10">
            <div className="w-10 h-10 bg-zinc-950 rounded-full border-2 border-zinc-800" />
            <div className="w-10 h-10 bg-zinc-950 rounded-full border-2 border-zinc-800" />
            <div className="w-10 h-10 bg-zinc-950 rounded-full border-2 border-zinc-800 col-span-2 justify-self-center" />
          </div>
        );

      case 'vertical-strip-left':
        return (
          <div className="absolute top-8 left-6 flex flex-col gap-4 z-30">
            <div className="w-11 h-11 bg-zinc-950 rounded-full border-2 border-zinc-800 shadow-lg" />
            <div className="w-11 h-11 bg-zinc-950 rounded-full border-2 border-zinc-800 shadow-lg" />
            <div className="w-11 h-11 bg-zinc-950 rounded-full border-2 border-zinc-800 shadow-lg" />
          </div>
        );

      case 'centered-circle':
        return (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner z-30 border border-white/10">
            <div className="w-20 h-20 bg-zinc-950 rounded-full border-4 border-zinc-800 shadow-inner flex items-center justify-center">
              <div className="w-6 h-6 bg-zinc-900 rounded-full opacity-50" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row font-sans">
      <aside className="w-full lg:w-96 bg-bamboo border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col z-10 max-h-screen overflow-y-auto">
        <div className="p-8 border-b border-zinc-100/50 text-center">
          <div className="mb-4">
            <img
  src="https://res.cloudinary.com/dwexdk5pp/image/upload/v1773958801/logo_pamda_te76in.png"
  alt="Logo Pamda Cases"
  className="w-48 h-auto mx-auto"
/>
          </div>
          <h2 className="font-lexend font-bold text-zinc-800 text-lg">
            Sua capinha, do seu jeito!
          </h2>
        </div>

        <div className="p-6 space-y-8 bg-white/40 backdrop-blur-sm flex-1">
          <section className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Selecione seu Aparelho
            </label>

            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setSearchQuery('');

                    const firstModelOfBrand = phoneModels.find(
                      (model) => model.brand === brand
                    );

                    if (firstModelOfBrand) {
                      setSelectedModel(firstModelOfBrand);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedBrand === brand
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`flex items-center justify-between p-3 rounded-xl text-left transition-all ${selectedModel?.id === model.id
                    ? 'bg-indigo-50 border-indigo-200 border text-indigo-700'
                    : 'bg-white border border-zinc-100 hover:border-zinc-300 text-zinc-700'
                    }`}
                >
                  <span className="text-sm font-medium">{model.name}</span>
                  {selectedModel?.id === model.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 block">
              Sua Imagem
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all duration-200
                flex flex-col items-center justify-center gap-3 text-center
                ${isDragging
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700">Carregar Foto</p>
                <p className="text-xs text-zinc-400 mt-1">PNG, JPG até 10MB</p>
              </div>
            </div>
          </section>

          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Ajustes da Imagem
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Zoom: {zoom}%
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex bg-zinc-100 rounded-lg p-1">
                        <button
                          onClick={() => setZoom(Math.max(100, zoom - 10))}
                          className="p-1.5 hover:bg-white rounded-md transition-colors text-zinc-600"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setZoom(Math.min(300, zoom + 10))}
                          className="p-1.5 hover:bg-white rounded-md transition-colors text-zinc-600"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">
                        Zoom
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setIsMirrored(!isMirrored)}
                        className={`p-2.5 rounded-lg transition-all ${isMirrored
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">
                        Espelhar
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setImageRotation((prev) => (prev - 90) % 360)}
                        className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">
                        Girar Anti
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                        className="p-2.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">
                        Girar Hor
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <input
                      type="range"
                      min="100"
                      max="300"
                      value={zoom}
                      onChange={(e) => setZoom(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </section>

                <section>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 block">
                    Ajuste de Posição
                  </label>
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => moveImage('up')}
                      className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveImage('left')}
                        className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 rounded-lg border border-zinc-200 flex items-center justify-center">
                        <Move className="w-4 h-4 text-zinc-300" />
                      </div>
                      <button
                        onClick={() => moveImage('right')}
                        className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => moveImage('down')}
                      className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </section>

                <div className="pt-4 flex gap-2">
                  <button
                    onClick={resetTransform}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resetar
                  </button>
                  <button
                    onClick={() => {
  setImage(null);
  setImageRatio(null);
  setPosition({ x: 0, y: 0 });
}}
                    className="p-2.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Personalizar Texto
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => setTextRotation((prev) => (prev - 45) % 360)}
                  className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
                  title="Girar Anti-horário"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextRotation((prev) => (prev + 45) % 360)}
                  className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
                  title="Girar Horário"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="textOnly"
                  checked={textOnlyMode}
                  onChange={(e) => setTextOnlyMode(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="textOnly"
                  className="text-xs font-medium text-zinc-600 cursor-pointer"
                >
                  Modo Somente Texto (Ocultar Foto)
                </label>
              </div>

              <div className="relative">
                <Type className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                <textarea
                  placeholder="Escreva seu texto..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">
                    Fonte
                  </label>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {GOOGLE_FONTS.map((font) => (
                      <option
                        key={font.name}
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
  <label className="text-[10px] font-bold text-zinc-400 uppercase">
    Tamanho
  </label>
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => setTextSize((prev) => Math.max(8, prev - 2))}
      className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
    >
      -
    </button>

    <input
      type="number"
      value={textSize}
      onChange={(e) => setTextSize(Math.max(8, parseInt(e.target.value) || 12))}
      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-center outline-none focus:ring-2 focus:ring-indigo-500"
    />

    <button
      type="button"
      onClick={() => setTextSize((prev) => Math.min(200, prev + 2))}
      className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
    >
      +
    </button>
  </div>
</div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">
                  Cor
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {SHEETS_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-6 h-6 rounded-full border border-zinc-200 transition-transform hover:scale-110 ${textColor === color ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          
        </div>

        <div className="mt-auto p-6 border-t border-zinc-100 bg-zinc-50/50">
          <button
            disabled={!image}
            onClick={handleDownload}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all
              ${image
                ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl scale-[1.02] active:scale-100'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }
            `}
          >
            <Download className="w-5 h-5" />
            Finalizar Pedido
          </button>
        </div>
      </aside>

      <main className="flex-1 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden bg-zinc-100">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />


        <div className="relative">
          <motion.div
          // layout
          // className="relative w-[340px] h-[680px] rounded-[3.5rem] p-1.5 bg-zinc-300 shadow-2xl overflow-visible"
          >
        <div
  ref={containerRef}
  className="relative w-[405px] h-[720px] overflow-hidden flex items-center justify-center"
>
  {/* BASE (col2) - SEMPRE visível */}
{selectedModel?.col2 && (
  <img
    src={selectedModel.col2}
    className="absolute top-0 left-0 w-full h-full object-fill"
  />
)}

{/* IMAGEM DO USUÁRIO */}
{!textOnlyMode && image && (
  <div
    ref={imageAreaRef}
    className="absolute overflow-hidden"
    style={{
      top: '3.5%',
      bottom: '3.5%',
      left: '8%',
      right: '8%',
    }}
  >
    <motion.div
  drag
  dragConstraints={dragLimits}
  dragElastic={0}
  dragMomentum={false}
  animate={{
  x: position.x,
  y: position.y,
  scale: (zoom / 100) * (isQuarterTurn ? 1.95 : 1),
  rotate: imageRotation,
}}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }}
  onDragEnd={(_, info) => {
    setPosition((prev) => {
      const nextX = prev.x + info.offset.x;
      const nextY = prev.y + info.offset.y;

      return {
        x: Math.max(dragLimits.left, Math.min(dragLimits.right, nextX)),
        y: Math.max(dragLimits.top, Math.min(dragLimits.bottom, nextY)),
      };
    });
  }}
  style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <img
  src={image}
  draggable={false}
    style={{
      transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
    }}
    className={`pointer-events-none select-none ${
  effectiveRatio && effectiveRatio >= 0.95
    ? 'h-full w-auto'
    : 'w-full h-auto'
} max-w-none max-h-none`}
  />
</motion.div>
  </div>
)}

{customText && (
  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
    <motion.div
      drag
      dragElastic={0}
      dragMomentum={false}
      style={{
        x: textPosition.x,
        y: textPosition.y,
        rotate: textRotation,
        pointerEvents: 'auto',
        cursor: 'move',
      }}
      onDragEnd={(_, info) => {
        setTextPosition((prev) => ({
          x: prev.x + info.offset.x,
          y: prev.y + info.offset.y,
        }));
      }}
      className="relative max-w-[75%] select-none"
    >
      <div className="relative px-3 py-2 border-2 border-green-600/60 rounded-sm bg-transparent">
        <div
          style={{
            fontFamily: textFont,
            color: textColor,
            fontSize: `${textSize}px`,
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            textShadow: '0 2px 4px rgba(0,0,0,0.18)',
          }}
        >
          {customText}
        </div>

<div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setTextRotation((prev) => (prev - 45) % 360);
    }}
    className="p-1.5 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
    title="Girar Anti-horário"
  >
    <RotateCcw className="w-3.5 h-3.5" />
  </button>

  <button
    onClick={(e) => {
      e.stopPropagation();
      setTextRotation((prev) => (prev + 45) % 360);
    }}
    className="p-1.5 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
    title="Girar Horário"
  >
    <RotateCw className="w-3.5 h-3.5" />
  </button>
</div>

        <motion.div
          drag
          dragElastic={0}
          dragMomentum={false}
          onDrag={(_, info) => {
            const delta = info.delta.x + info.delta.y;
            setTextSize((prev) =>
              Math.max(8, Math.min(200, prev + delta * 0.25))
            );
          }}
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-600 border border-white rounded-sm cursor-nwse-resize"
        />

        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-green-600" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-green-600" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-green-600" />
      </div>
    </motion.div>
  </div>
)}
  {/* MÁSCARA */}
  {selectedModel?.col3 && (
    <img
      src={selectedModel.col3}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )}
</div>

          </motion.div>
          {/* <div className="absolute -top-1 -left-1 w-16 h-16 bg-white/20 blur-[1px] rounded-tl-[3.5rem] z-50 pointer-events-none border-t-4 border-l-4 border-white/40" />
            <div className="absolute -top-1 -right-1 w-16 h-16 bg-white/20 blur-[1px] rounded-tr-[3.5rem] z-50 pointer-events-none border-t-4 border-r-4 border-white/40" />
            <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-white/20 blur-[1px] rounded-bl-[3.5rem] z-50 pointer-events-none border-b-4 border-l-4 border-white/40" />
            <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-white/20 blur-[1px] rounded-br-[3.5rem] z-50 pointer-events-none border-b-4 border-r-4 border-white/40" />

            <div className="absolute inset-0 border-[14px] border-white/30 rounded-[3.5rem] z-50 pointer-events-none shadow-[inset_0_0_30px_rgba(255,255,255,0.6)]" />
            <div className="absolute inset-0 border-[2px] border-white/50 rounded-[3.5rem] z-50 pointer-events-none" />

            <div
              className="relative w-full h-full rounded-[3.2rem] overflow-hidden transition-colors duration-500"
              style={{ backgroundColor: selectedModel?.color || '#1a1a1a' }}
              ref={containerRef}
            >
              {selectedModel?.hasLogo && !image && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 z-10">
                  <Apple className="w-16 h-16 text-black fill-current" />
                </div>
              )}

              {selectedModel && <CameraModule layout={selectedModel.cameraLayout} />}

              <div className="absolute inset-0 z-20 overflow-hidden">
                {!textOnlyMode &&
                  (image ? (
                    <motion.div
                      drag
                      dragConstraints={dragConstraints}
                      dragElastic={0}
                      dragMomentum={false}
                      animate={{
                        scale: (zoom / 100) * (imageRotation % 180 !== 0 ? 2 : 1),
                        rotate: imageRotation,
                        x: position.x,
                        y: position.y,
                      }}
                      onDrag={(_, info) => {
                        setPosition((prev) => ({
                          x: prev.x + info.delta.x,
                          y: prev.y + info.delta.y,
                        }));
                      }}
                      className="w-full h-full flex items-center justify-center cursor-move"
                    >
                      <img
                        src={image}
                        alt="Preview"
                        className={`w-full h-full pointer-events-none select-none object-cover transition-transform duration-300 ${isMirrored ? 'scale-x-[-1]' : 'scale-x-[1]'
                          }`}
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 backdrop-blur-[1px]">
                      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <ImageIcon className="w-10 h-10 text-white/20" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                        Área de Impressão
                      </p>
                    </div>
                  ))}

                {customText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <motion.div
                      drag
                      dragConstraints={containerRef}
                      dragElastic={0}
                      dragMomentum={false}
                      style={{
                        x: textPosition.x,
                        y: textPosition.y,
                        rotate: textRotation,
                        pointerEvents: 'auto',
                        cursor: 'move',
                      }}
                      onDragEnd={(_, info) => {
                        setTextPosition((prev) => ({
                          x: prev.x + info.offset.x,
                          y: prev.y + info.offset.y,
                        }));
                      }}
                      className="select-none whitespace-nowrap group"
                    >
                      <div className="relative p-3 border-2 border-blue-500/50 rounded-sm transition-colors max-w-[280px]">
                        <div
                          style={{
                            fontFamily: textFont,
                            color: textColor,
                            fontSize: `${textSize}px`,
                            fontWeight: 'bold',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            lineHeight: 1.2,
                            textAlign: 'center',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            hyphens: 'auto',
                          }}
                          className="flex items-center justify-center"
                        >
                          {customText}
                          <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5 animate-blink" />
                        </div>

                        <motion.div
                          drag
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          dragElastic={0}
                          onDrag={(_, info) => {
                            const delta = info.delta.x + info.delta.y;
                            setTextSize((prev) => Math.max(8, prev + delta * 0.5));
                          }}
                          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white shadow-sm cursor-nwse-resize z-50"
                        />

                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTextRotation((prev) => (prev - 45) % 360);
                            }}
                            className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                            title="Girar Anti-horário"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTextRotation((prev) => (prev + 45) % 360);
                            }}
                            className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                            title="Girar Horário"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-blue-500" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-blue-500" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-blue-500" />
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 z-40 pointer-events-none" />
              <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-40 pointer-events-none" />
            </div>
          */}

          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm font-bold text-zinc-900">
              {selectedModel?.name || 'Selecione um modelo'}
            </p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">
              {selectedBrand || 'Sem marca'}
            </p>
          </div>

          {image && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-2 text-xs font-medium text-zinc-400 bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-100"
            >
              <Move className="w-3 h-3" />
              Arraste ou use as setas para ajustar
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}