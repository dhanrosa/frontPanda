/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import html2canvas from 'html2canvas-pro';
import './image.css';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Upload,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  X,
  Download,
  ChevronRight,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Type,
  FlipHorizontal,
  RotateCw,
  Bold,
  Italic,
  Underline,
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

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragLimits, setDragLimits] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });

  const [isUploadingOrder, setIsUploadingOrder] = useState(false);
  const [zoom, setZoom] = useState(100);
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
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textRotation, setTextRotation] = useState(0);
  const [imageRotation, setImageRotation] = useState(0);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textStroke, setTextStroke] = useState(0);
  const [textStrokeColor, setTextStrokeColor] = useState('#000000');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const productionRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const brands = useMemo(() => {
    return [...new Set(phoneModels.map((model) => model.brand).filter(Boolean))];
  }, [phoneModels]);

  const filteredModels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      return phoneModels.filter((m) =>
        `${m.brand} ${m.name}`.toLowerCase().includes(query)
      );
    }

    return phoneModels.filter((m) => m.brand === selectedBrand);
  }, [selectedBrand, searchQuery, phoneModels]);

  const normalizedRotation = ((imageRotation % 360) + 360) % 360;
  const isQuarterTurn = normalizedRotation === 90 || normalizedRotation === 270;

  const effectiveRatio = imageRatio
    ? isQuarterTurn
      ? 1 / imageRatio
      : imageRatio
    : 1;

  const exportImageTransform = useMemo(() => {
    const mirror = isMirrored ? ' scaleX(-1)' : '';
    return `translate(${position.x}px, ${position.y}px) rotate(${imageRotation}deg) scale(${(zoom / 100) * (isQuarterTurn ? 1.95 : 1)})${mirror}`;
  }, [position.x, position.y, imageRotation, zoom, isQuarterTurn, isMirrored]);

  const getDirectImageUrl = (url: string) => {
    if (!url || typeof url !== 'string') return '';
    const trimmedUrl = url.trim();

    if (trimmedUrl.includes('drive.google.com')) {
      const idMatch =
        trimmedUrl.match(/\/d\/([^\/]+)/) || trimmedUrl.match(/id=([^&]+)/);

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

          const match = text.match(
            /google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/
          );

          if (!match) {
            console.warn(`Não consegui achar JSON na aba ${sheet.brand}`);
            continue;
          }

          const json = JSON.parse(match[1]);
          const rawRows = json.table?.rows ?? [];

          if (!rawRows.length) continue;

          const dataRows = rawRows.slice(1);

          dataRows.forEach((row: any) => {
            const col1 = String(row.c?.[0]?.v ?? '').trim();
            const col2Raw = String(row.c?.[1]?.v ?? '').trim();
            const col3Raw = String(row.c?.[2]?.v ?? '').trim();

            if (!col1) return;

            const col2 = getDirectImageUrl(col2Raw);
            const col3 = getDirectImageUrl(col3Raw);

            allModels.push({
              id: `${sheet.brand}-${col1}`.toLowerCase().replace(/\s+/g, '-'),
              name: col1,
              brand: sheet.brand,
              col2,
              col3,
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
      setOriginalFile(file);

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
      setOriginalFile(file);

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

  const waitForImagesToLoad = async (root: HTMLElement) => {
    const images = Array.from(root.querySelectorAll('img'));

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });
      })
    );

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  };

  const generateBlobFromElement = async (
    element: HTMLElement,
    options?: {
      format?: 'image/png' | 'image/jpeg';
      quality?: number;
      scale?: number;
      maxBytes?: number;
    }
  ): Promise<Blob> => {
    const {
      format = 'image/jpeg',
      quality = 0.9,
      scale = 1,
      maxBytes,
    } = options || {};

    await waitForImagesToLoad(element);
    await new Promise((resolve) => setTimeout(resolve, 120));

    let currentScale = scale;

    const renderCanvas = async (scaleValue: number) => {
      return html2canvas(element, {
        backgroundColor: null,
        useCORS: true,
        scale: scaleValue,
        imageTimeout: 15000,
        logging: false,
      });
    };

    let canvas = await renderCanvas(currentScale);

    const canvasToBlob = async (
      currentCanvas: HTMLCanvasElement,
      mimeType: 'image/png' | 'image/jpeg',
      q?: number
    ) => {
      return new Promise<Blob>((resolve, reject) => {
        currentCanvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Não foi possível gerar a imagem.'));
            return;
          }
          resolve(blob);
        }, mimeType, q);
      });
    };

    if (format === 'image/jpeg') {
      return canvasToBlob(canvas, 'image/jpeg', quality);
    }

    let blob = await canvasToBlob(canvas, 'image/png');

    while (maxBytes && blob.size > maxBytes && currentScale > 1) {
      currentScale = Math.max(1, Number((currentScale - 0.25).toFixed(2)));
      canvas = await renderCanvas(currentScale);
      blob = await canvasToBlob(canvas, 'image/png');

      if (currentScale === 1) break;
    }

    if (maxBytes && blob.size > maxBytes) {
      throw new Error(
        `A arte final em PNG passou do limite de 10 MB. Tamanho atual: ${(blob.size / 1024 / 1024).toFixed(2)} MB`
      );
    }

    return blob;
  };

  const generatePreviewBlob = async (): Promise<Blob> => {
    if (!exportRef.current) {
      throw new Error('Área de preview não encontrada.');
    }

    return generateBlobFromElement(exportRef.current, {
      format: 'image/jpeg',
      quality: 0.9,
      scale: 1,
    });
  };

  const generateProductionBlob = async (): Promise<Blob> => {
    if (!productionRef.current) {
      throw new Error('Área de arte final não encontrada.');
    }

    return generateBlobFromElement(productionRef.current, {
      format: 'image/png',
      scale: 3,
      maxBytes: 10 * 1024 * 1024,
    });
  };

  const CLOUDINARY_CLOUD_NAME = 'dwexdk5pp';
  const CLOUDINARY_UPLOAD_PRESET = 'pamda_unsigned';

  const uploadToCloudinary = async (
    file: File | Blob,
    folder: string,
    fileName?: string
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    if (fileName) {
      formData.append('public_id', fileName);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Cloudinary:', data);
      throw new Error(
        data?.error?.message || 'Erro ao enviar imagem para o Cloudinary.'
      );
    }

    return data.secure_url as string;
  };

  const uploadOrderAssets = async () => {
    const productionBlob = await generateProductionBlob();
    const previewBlob = await generatePreviewBlob();

    const productionImageUrl = await uploadToCloudinary(
      productionBlob,
      'pamda-pedidos/arte-final',
      `arte-final-${Date.now()}`
    );

    const previewImageUrl = await uploadToCloudinary(
      previewBlob,
      'pamda-pedidos/preview',
      `preview-${Date.now()}`
    );

    return {
      productionImageUrl,
      previewImageUrl,
    };
  };

  const unitPrice = 54.9;
  const totalPrice = unitPrice * quantity;

  const handleFinish = async () => {
    try {
      if (!selectedModel) {
        alert('Selecione o modelo do celular.');
        return;
      }

      if (!image && !customText.trim()) {
        alert('Envie uma imagem ou adicione um texto para personalizar.');
        return;
      }

      setIsUploadingOrder(true);

      const { productionImageUrl, previewImageUrl } = await uploadOrderAssets();

      const message = `
*Novo pedido - Pamda Cases*
Modelo: ${selectedModel.name}
Marca: ${selectedBrand}
Texto personalizado: ${customText.trim() || 'Sem texto'}
Fonte: ${textFont}
Tamanho do texto: ${textSize}px
Cor do texto: ${textColor}
Negrito: ${isBold ? 'Sim' : 'Não'}
Itálico: ${isItalic ? 'Sim' : 'Não'}
Sublinhado: ${isUnderline ? 'Sim' : 'Não'}
Espaçamento: ${letterSpacing}px
Borda do texto: ${textStroke}px
Cor da borda: ${textStrokeColor}
Rotação do texto: ${textRotation}°
Rotação da imagem: ${imageRotation}°
Espelhado: ${isMirrored ? 'Sim' : 'Não'}
Modo somente texto: ${textOnlyMode ? 'Sim' : 'Não'}
Quantidade: ${quantity}
Valor unitário: R$ ${unitPrice.toFixed(2)}
Valor total: R$ ${totalPrice.toFixed(2)}

Arte final:
${productionImageUrl}

Prévia final:
${previewImageUrl}
      `;

      const whatsappUrl = `https://wa.me/5541933003156?text=${encodeURIComponent(
        message
      )}`;

      setOrderCompleted(true);
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Não foi possível finalizar o pedido.';
      alert(errorMessage);
    } finally {
      setIsUploadingOrder(false);
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
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedBrand === brand
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
                placeholder="Buscar modelo ou marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedBrand(model.brand);
                    setSelectedModel(model);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    selectedModel?.id === model.id
                      ? 'bg-indigo-50 border-indigo-200 border text-indigo-700'
                      : 'bg-white border border-zinc-100 hover:border-zinc-300 text-zinc-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{model.name}</span>
                    {searchQuery.trim() && (
                      <span className="text-[11px] text-zinc-400">{model.brand}</span>
                    )}
                  </div>
                  {selectedModel?.id === model.id && (
                    <ChevronRight className="w-4 h-4" />
                  )}
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
                ${
                  isDragging
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
                        className={`p-2.5 rounded-lg transition-all ${
                          isMirrored
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
                      setOriginalFile(null);
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

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`p-2 rounded ${
                    isBold ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-2 rounded ${
                    isItalic
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`p-2 rounded ${
                    isUnderline
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <Underline className="w-4 h-4" />
                </button>

                <div className="w-px h-3 bg-zinc-300 mx-1" />

                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-800">Espaçamento</span>

                  <button
                    type="button"
                    onClick={() => setLetterSpacing((prev) => Math.max(-2, prev - 0.5))}
                    className="px-3 py-1 bg-zinc-100 rounded text-xs"
                  >
                    -
                  </button>

                  <span className="text-xs w-8 text-center">{letterSpacing}</span>

                  <button
                    type="button"
                    onClick={() => setLetterSpacing((prev) => Math.min(10, prev + 0.5))}
                    className="px-3 py-1 bg-zinc-100 rounded text-xs"
                  >
                    +
                  </button>
                </div>
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
                      onChange={(e) =>
                        setTextSize(Math.max(8, parseInt(e.target.value) || 12))
                      }
                      className="no-spinner w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-center outline-none focus:ring-2 focus:ring-indigo-500"
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

                <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-12 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-1"
                      title="Escolher cor do texto"
                    />

                    <div className="flex-1">
                      <p className="text-xs font-semibold text-zinc-600">Cor do texto</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div
                          className="h-5 w-5 rounded-full border border-zinc-300"
                          style={{ backgroundColor: textColor }}
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={textStrokeColor}
                        onChange={(e) => setTextStrokeColor(e.target.value)}
                        className="h-12 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-1"
                        title="Cor da borda"
                      />

                      <div className="flex-1">
                        <p className="text-xs font-semibold text-zinc-600">
                          Cor e espessura da borda
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="8"
                            value={textStroke}
                            onChange={(e) => setTextStroke(parseInt(e.target.value))}
                            className="w-full"
                          />

                          <span className="text-xs w-8 text-center text-zinc-600">
                            {textStroke}px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-100 bg-zinc-50/50 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-800 mb-3">Resumo do pedido</h3>

            <div className="space-y-2 text-sm text-zinc-600">
              <p>
                <strong>Modelo:</strong> {selectedModel?.name || 'Não selecionado'}
              </p>
              <p>
                <strong>Marca:</strong> {selectedBrand || 'Não selecionada'}
              </p>
              <p>
                <strong>Texto:</strong> {customText.trim() || 'Sem texto'}
              </p>
              <p>
                <strong>Imagem:</strong> {image ? 'Adicionada' : 'Não adicionada'}
              </p>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Quantidade
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 font-bold hover:bg-zinc-200 transition-colors"
                >
                  -
                </button>

                <div className="flex-1 h-10 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-sm font-bold text-zinc-800">
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 font-bold hover:bg-zinc-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-1 text-sm">
              <p className="flex justify-between text-zinc-600">
                <span>Valor unitário</span>
                <strong>R$ {unitPrice.toFixed(2)}</strong>
              </p>
              <p className="flex justify-between text-zinc-800 text-base font-bold">
                <span>Total</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            disabled={isUploadingOrder || !selectedModel || (!image && !customText.trim())}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all
              ${
                selectedModel && (image || customText.trim())
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl scale-[1.02] active:scale-100'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }
            `}
          >
            <Download className="w-5 h-5" />
            {isUploadingOrder ? 'Enviando imagens...' : 'Finalizar Pedido'}
          </button>

          {orderCompleted && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700 text-center">
              Pedido pronto para envio no WhatsApp!
            </div>
          )}
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
          <motion.div>
            <div
              ref={containerRef}
              className="relative w-[405px] h-[720px] overflow-hidden flex items-center justify-center rounded-[60px]"
            >
              {selectedModel?.col2 && (
                <img
                  src={selectedModel.col2}
                  className="absolute top-0 left-0 w-full h-full object-fill"
                />
              )}

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
                    dragMomentum={0}
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
                      x: position.x,
                      y: position.y,
                      scale: (zoom / 100) * (isQuarterTurn ? 1.95 : 1),
                      rotate: imageRotation,
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
                    dragMomentum={0}
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
                          letterSpacing: `${letterSpacing}px`,
                          fontWeight: isBold ? 700 : 400,
                          fontStyle: isItalic ? 'italic' : 'normal',
                          textDecoration: isUnderline ? 'underline' : 'none',
                          textShadow:
                            textStroke > 0
                              ? [
                                  `${textStroke}px 0 ${textStrokeColor}`,
                                  `-${textStroke}px 0 ${textStrokeColor}`,
                                  `0 ${textStroke}px ${textStrokeColor}`,
                                  `0 -${textStroke}px ${textStrokeColor}`,
                                  `${textStroke}px ${textStroke}px ${textStrokeColor}`,
                                  `-${textStroke}px -${textStroke}px ${textStrokeColor}`,
                                  `${textStroke}px -${textStroke}px ${textStrokeColor}`,
                                  `-${textStroke}px ${textStroke}px ${textStrokeColor}`,
                                ].join(', ')
                              : '0 2px 4px rgba(0,0,0,0.18)',
                          lineHeight: 1.2,
                          textAlign: 'center',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
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
                        dragMomentum={0}
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

              {selectedModel?.col3 && (
                <img
                  src={selectedModel.col3}
                  crossOrigin="anonymous"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              )}

              <img
                src="https://res.cloudinary.com/dwexdk5pp/image/upload/v1773958801/logo_pamda_te76in.png"
                crossOrigin="anonymous"
                alt="Pamda"
                className="absolute top-160 right-43 w-17 opacity-90 z-50 pointer-events-none"
              />
            </div>
          </motion.div>

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

        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '405px',
            height: '720px',
            transform: 'translateX(-200vw)',
            pointerEvents: 'none',
            overflow: 'hidden',
            opacity: 1,
            zIndex: -1,
          }}
        >
          <div
            ref={exportRef}
            style={{
              position: 'relative',
              width: '405px',
              height: '720px',
              overflow: 'hidden',
              background: 'transparent',
            }}
          >
            {selectedModel?.col2 && (
              <img
                src={selectedModel.col2}
                crossOrigin="anonymous"
                alt="Base"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
            )}

            {!textOnlyMode && image && (
              <div
                style={{
                  position: 'absolute',
                  top: '3.5%',
                  bottom: '3.5%',
                  left: '8%',
                  right: '8%',
                  overflow: 'hidden',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: exportImageTransform,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={image}
                    alt="Arte do cliente"
                    style={{
                      ...(effectiveRatio && effectiveRatio >= 0.95
                        ? { height: '100%', width: 'auto' }
                        : { width: '100%', height: 'auto' }),
                      maxWidth: 'none',
                      maxHeight: 'none',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            )}

            {customText && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    transform: `translate(${textPosition.x}px, ${textPosition.y}px) rotate(${textRotation}deg)`,
                    maxWidth: '75%',
                  }}
                >
                  <div
                    style={{
                      fontFamily: textFont,
                      color: textColor,
                      fontSize: `${textSize}px`,
                      letterSpacing: `${letterSpacing}px`,
                      fontWeight: isBold ? 700 : 400,
                      fontStyle: isItalic ? 'italic' : 'normal',
                      textDecoration: isUnderline ? 'underline' : 'none',
                      textShadow:
                        textStroke > 0
                          ? [
                              `${textStroke}px 0 ${textStrokeColor}`,
                              `-${textStroke}px 0 ${textStrokeColor}`,
                              `0 ${textStroke}px ${textStrokeColor}`,
                              `0 -${textStroke}px ${textStrokeColor}`,
                              `${textStroke}px ${textStroke}px ${textStrokeColor}`,
                              `-${textStroke}px -${textStroke}px ${textStrokeColor}`,
                              `${textStroke}px -${textStroke}px ${textStrokeColor}`,
                              `-${textStroke}px ${textStroke}px ${textStrokeColor}`,
                            ].join(', ')
                          : '0 2px 4px rgba(0,0,0,0.18)',
                      lineHeight: 1.2,
                      textAlign: 'center',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {customText}
                  </div>
                </div>
              </div>
            )}

            {selectedModel?.col3 && (
              <img
                src={selectedModel.col3}
                crossOrigin="anonymous"
                alt="Máscara"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  pointerEvents: 'none',
                  zIndex: 30,
                }}
              />
            )}

            <img
              src="https://res.cloudinary.com/dwexdk5pp/image/upload/v1773958801/logo_pamda_te76in.png"
              crossOrigin="anonymous"
              alt="Pamda"
              className="absolute top-160 right-43 w-17 opacity-90 z-50 pointer-events-none"
            />
          </div>
        </div>

        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '405px',
            height: '720px',
            transform: 'translateX(-400vw)',
            pointerEvents: 'none',
            overflow: 'hidden',
            opacity: 1,
            zIndex: -1,
          }}
        >
          <div
            ref={productionRef}
            style={{
              position: 'relative',
              width: '405px',
              height: '720px',
              overflow: 'hidden',
              background: 'transparent',
            }}
          >
            {!textOnlyMode && image && (
              <div
                style={{
                  position: 'absolute',
                  top: '3.5%',
                  bottom: '3.5%',
                  left: '8%',
                  right: '8%',
                  overflow: 'hidden',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: exportImageTransform,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={image}
                    alt="Arte do cliente"
                    style={{
                      ...(effectiveRatio && effectiveRatio >= 0.95
                        ? { height: '100%', width: 'auto' }
                        : { width: '100%', height: 'auto' }),
                      maxWidth: 'none',
                      maxHeight: 'none',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            )}

            {customText && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    transform: `translate(${textPosition.x}px, ${textPosition.y}px) rotate(${textRotation}deg)`,
                    maxWidth: '75%',
                  }}
                >
                  <div
                    style={{
                      fontFamily: textFont,
                      color: textColor,
                      fontSize: `${textSize}px`,
                      letterSpacing: `${letterSpacing}px`,
                      fontWeight: isBold ? 700 : 400,
                      fontStyle: isItalic ? 'italic' : 'normal',
                      textDecoration: isUnderline ? 'underline' : 'none',
                      textShadow:
                        textStroke > 0
                          ? [
                              `${textStroke}px 0 ${textStrokeColor}`,
                              `-${textStroke}px 0 ${textStrokeColor}`,
                              `0 ${textStroke}px ${textStrokeColor}`,
                              `0 -${textStroke}px ${textStrokeColor}`,
                              `${textStroke}px ${textStroke}px ${textStrokeColor}`,
                              `-${textStroke}px -${textStroke}px ${textStrokeColor}`,
                              `${textStroke}px -${textStroke}px ${textStrokeColor}`,
                              `-${textStroke}px ${textStroke}px ${textStrokeColor}`,
                            ].join(', ')
                          : '0 2px 4px rgba(0,0,0,0.18)',
                      lineHeight: 1.2,
                      textAlign: 'center',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {customText}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
