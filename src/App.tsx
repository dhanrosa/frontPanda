/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import heic2any from 'heic2any';
import html2canvas from 'html2canvas-pro';
import './image.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Check,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
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

const TEXT_COLOR_PRESETS = [
  '#000000',
  '#ffffff',
  '#435446',
  '#6b7280',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#0ea5e9',
  '#6366f1',
  '#ec4899',
  '#7c3aed',
];

const MAX_CUSTOM_TEXT_LENGTH = 80;
const EXPORT_WIDTH = 405;
const EXPORT_HEIGHT = 720;

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
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const productionRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [mobileBrandSearchQuery, setMobileBrandSearchQuery] = useState('');
  const [isBrandSearchMode, setIsBrandSearchMode] = useState(false);
  const [isMobileImageEditing, setIsMobileImageEditing] = useState(false);
  const [isMobileTextModalOpen, setIsMobileTextModalOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [previewRenderSize, setPreviewRenderSize] = useState({
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
  });

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
  }, [phoneModels, searchQuery, selectedBrand]);

  const normalizedRotation = ((imageRotation % 360) + 360) % 360;
  const isQuarterTurn = normalizedRotation === 90 || normalizedRotation === 270;

  const effectiveRatio = imageRatio
    ? isQuarterTurn
      ? 1 / imageRatio
      : imageRatio
    : 1;

  const getScaledStroke = (fontSize: number) => {
    if (textStroke <= 0) return 0;
    return Math.max(0.6, Number(((fontSize / 24) * textStroke).toFixed(2)));
  };

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
            console.warn(`Nao consegui achar JSON na aba ${sheet.brand}`);
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

            allModels.push({
              id: `${sheet.brand}-${col1}`.toLowerCase().replace(/\s+/g, '-'),
              name: col1,
              brand: sheet.brand,
              col2: getDirectImageUrl(col2Raw),
              col3: getDirectImageUrl(col3Raw),
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
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updatePreviewRenderSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect?.width || !rect?.height) return;

      setPreviewRenderSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updatePreviewRenderSize();

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updatePreviewRenderSize);
      return () => window.removeEventListener('resize', updatePreviewRenderSize);
    }

    const observer = new ResizeObserver(() => updatePreviewRenderSize());
    observer.observe(container);
    window.addEventListener('resize', updatePreviewRenderSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePreviewRenderSize);
    };
  }, [currentStep, customText, image, isMobileLayout, selectedModel?.id]);

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
  }, [effectiveRatio, image, isQuarterTurn, selectedModel?.id, zoom]);

  useEffect(() => {
    if (!image && currentStep === 3) {
      setIsMobileImageEditing(false);
    }
  }, [currentStep, image]);

  const isHeicFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    return (
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif')
    );
  };

  const preparePreviewFile = async (file: File) => {
    if (!isHeicFile(file)) {
      return file;
    }

    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    });

    const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

    return new File(
      [convertedBlob as BlobPart],
      file.name.replace(/\.(heic|heif)$/i, '.jpg'),
      { type: 'image/jpeg' }
    );
  };

  const loadFile = async (file: File) => {
    const previewFile = await preparePreviewFile(file);
    setOriginalFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;

      const img = new Image();
      img.onload = () => {
        setImageRatio(img.width / img.height);
      };

      img.src = imageData;
      setImage(imageData);
    };

    reader.readAsDataURL(previewFile);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await loadFile(file);
        if (isMobileLayout) {
          setIsMobileImageEditing(true);
        }
      } catch (error) {
        console.error(error);
        alert('Nao foi possivel abrir essa imagem. Tente outro arquivo.');
      } finally {
        e.target.value = '';
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    const isImageFile =
      file &&
      (file.type.startsWith('image/') ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif'));

    if (file && isImageFile) {
      try {
        await loadFile(file);
        if (isMobileLayout) {
          setIsMobileImageEditing(true);
        }
      } catch (error) {
        console.error(error);
        alert('Nao foi possivel abrir essa imagem. Tente outro arquivo.');
      }
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
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setLetterSpacing(0);
    setTextStroke(0);
    setTextStrokeColor('#000000');
  };

  const clearImage = () => {
    setImage(null);
    setOriginalFile(null);
    setImageRatio(null);
    setPosition({ x: 0, y: 0 });
    setZoom(100);
    setImageRotation(0);
    setIsMirrored(false);
  };

  const clearText = () => {
    setCustomText('');
    setTextPosition({ x: 0, y: 0 });
    setTextSize(24);
    setTextColor('#000000');
    setTextFont(GOOGLE_FONTS[0].value);
    setTextRotation(0);
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setLetterSpacing(0);
    setTextStroke(0);
    setTextStrokeColor('#000000');
    setTextOnlyMode(false);
    setIsMobileTextModalOpen(false);
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

    if ('fonts' in document) {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    }

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => setTimeout(resolve, 120));
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
    const { format = 'image/jpeg', quality = 0.9, scale = 1, maxBytes } = options || {};

    await waitForImagesToLoad(element);

    const renderCanvas = async (scaleValue: number) => {
      return html2canvas(element, {
        backgroundColor: null,
        useCORS: true,
        scale: scaleValue,
        imageTimeout: 15000,
        logging: false,
      });
    };

    let currentScale = scale;
    let canvas = await renderCanvas(currentScale);

    const canvasToBlob = async (
      currentCanvas: HTMLCanvasElement,
      mimeType: 'image/png' | 'image/jpeg',
      q?: number
    ) => {
      return new Promise<Blob>((resolve, reject) => {
        currentCanvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Nao foi possivel gerar a imagem.'));
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
      throw new Error('Area de preview nao encontrada.');
    }

    return generateBlobFromElement(exportRef.current, {
      format: 'image/png',
      quality: 0.9,
      scale: 2,
    });
  };

  const generateProductionBlob = async (): Promise<Blob> => {
    if (!productionRef.current) {
      throw new Error('Area de arte final nao encontrada.');
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

  const unitPrice = 25.00;
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
Negrito: ${isBold ? 'Sim' : 'Nao'}
Italico: ${isItalic ? 'Sim' : 'Nao'}
Sublinhado: ${isUnderline ? 'Sim' : 'Nao'}
Espacamento: ${letterSpacing}px
Borda do texto: ${textStroke}px
Cor da borda: ${textStrokeColor}
Rotacao do texto: ${textRotation}°
Rotacao da imagem: ${imageRotation}°
Espelhado: ${isMirrored ? 'Sim' : 'Nao'}
Modo somente texto: ${textOnlyMode ? 'Sim' : 'Nao'}
Quantidade: ${quantity}
Valor unitario: R$ ${unitPrice.toFixed(2)}
Valor total: R$ ${totalPrice.toFixed(2)}

Arte final:
${productionImageUrl}

Previa final:
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
          : 'Nao foi possivel finalizar o pedido.';
      alert(errorMessage);
    } finally {
      setIsUploadingOrder(false);
    }
  };

  const buildTextStyle = (
    fontSize: number,
    styleScale = 1
  ): React.CSSProperties => {
    const scaledStroke = getScaledStroke(fontSize);
    const preservesManualLineBreaks = customText.includes('\n');

    return {
      fontFamily: textFont,
      color: textColor,
      fontSize: `${fontSize}px`,
      letterSpacing: `${letterSpacing * styleScale}px`,
      fontWeight: isBold ? 700 : 400,
      fontStyle: isItalic ? 'italic' : 'normal',
      textDecoration: isUnderline ? 'underline' : 'none',
      WebkitTextStroke:
        scaledStroke > 0 ? `${scaledStroke}px ${textStrokeColor}` : undefined,
      textStroke:
        scaledStroke > 0 ? `${scaledStroke}px ${textStrokeColor}` : undefined,
      textShadow: scaledStroke === 0 ? '0 2px 4px rgba(0,0,0,0.18)' : 'none',
      lineHeight: 1.2,
      textAlign: 'center',
      whiteSpace: preservesManualLineBreaks ? 'pre-wrap' : 'pre',
      wordBreak: 'normal',
      overflowWrap: 'normal',
    };
  };

  const handleCustomTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCustomText(e.target.value.slice(0, MAX_CUSTOM_TEXT_LENGTH));
  };

  const getEditorTextareaFontSize = (value: string, baseSize: number) => {
    const limitedValue = value.slice(0, MAX_CUSTOM_TEXT_LENGTH);
    const lines = limitedValue.split('\n');
    const estimatedLineCount = lines.reduce((total, line) => {
      const visualLength = line.trim().length || line.length;
      return total + Math.max(1, Math.ceil(Math.max(visualLength, 1) / 16));
    }, 0);

    const sizePenalty =
      Math.max(0, limitedValue.length - 12) * 0.2 +
      Math.max(0, estimatedLineCount - 2) * 3.6;

    return Math.max(14, Math.min(42, baseSize + 12 - sizePenalty));
  };

  const textRenderStyle = buildTextStyle(textSize);
  const exportScaleX = EXPORT_WIDTH / previewRenderSize.width;
  const exportScaleY = EXPORT_HEIGHT / previewRenderSize.height;
  const exportStyleScale = (exportScaleX + exportScaleY) / 2;
  const exportTextRenderStyle = buildTextStyle(
    textSize * exportStyleScale,
    exportStyleScale
  );
  const exportTextPosition = {
    x: textPosition.x * exportScaleX,
    y: textPosition.y * exportScaleY,
  };
  const exportImagePosition = {
    x: position.x * exportScaleX,
    y: position.y * exportScaleY,
  };
  const editorTextareaFontSize = getEditorTextareaFontSize(customText, textSize);
  const canFinish = Boolean(selectedModel && (image || customText.trim()));
  const totalSteps = 4;

  const normalizeSearchValue = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\bifone\b/g, 'iphone')
      .replace(/\biphon\b/g, 'iphone')
      .replace(/\bxaomi\b/g, 'xiaomi')
      .replace(/\bxiomi\b/g, 'xiaomi')
      .replace(/\s+/g, ' ')
      .trim();

  const getLevenshteinDistance = (source: string, target: string) => {
    if (source === target) return 0;
    if (!source.length) return target.length;
    if (!target.length) return source.length;

    const matrix = Array.from({ length: source.length + 1 }, () =>
      Array<number>(target.length + 1).fill(0)
    );

    for (let i = 0; i <= source.length; i += 1) matrix[i][0] = i;
    for (let j = 0; j <= target.length; j += 1) matrix[0][j] = j;

    for (let i = 1; i <= source.length; i += 1) {
      for (let j = 1; j <= target.length; j += 1) {
        const cost = source[i - 1] === target[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[source.length][target.length];
  };

  const getRankedModels = (
    rawQuery: string,
    models: PhoneModel[],
    limit?: number
  ) => {
    const query = normalizeSearchValue(rawQuery);
    if (!query) return typeof limit === 'number' ? models.slice(0, limit) : models;

    const ranked = models
      .map((model) => {
        const haystack = normalizeSearchValue(`${model.brand} ${model.name}`);
        const tokens = haystack.split(' ');
        const queryTokens = query.split(' ');
        const allTokensMatch = queryTokens.every((queryToken) =>
          tokens.some((token) => {
            const distance = getLevenshteinDistance(token, queryToken);
            const maxDistance = queryToken.length <= 4 ? 1 : 2;
            return (
              token.includes(queryToken) ||
              queryToken.includes(token) ||
              distance <= maxDistance
            );
          })
        );

        if (!allTokensMatch && !haystack.includes(query)) {
          return null;
        }

        const score = haystack.includes(query)
          ? 1000 - haystack.length
          : queryTokens.reduce((total, queryToken) => {
              const bestDistance = Math.min(
                ...tokens.map((token) => getLevenshteinDistance(token, queryToken))
              );
              return total - bestDistance;
            }, 0);

        return { model, score };
      })
      .filter((item): item is { model: PhoneModel; score: number } => Boolean(item))
      .sort((a, b) => b.score - a.score)
      .map(({ model }) => model);

    return typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
  };

  const mobileSuggestions = useMemo(
    () => getRankedModels(mobileBrandSearchQuery, phoneModels, 6),
    [mobileBrandSearchQuery, phoneModels]
  );

  const mobileModelResults = useMemo(() => {
    const brandModels = phoneModels.filter((model) => model.brand === selectedBrand);
    return getRankedModels(searchQuery, brandModels);
  }, [phoneModels, searchQuery, selectedBrand]);

  const mobileStepConfig = [
    { step: 1, title: 'Marca', description: 'Escolha a marca ou pesquise o aparelho.' },
    { step: 2, title: 'Modelo', description: 'Selecione o modelo exato da sua capinha.' },
    { step: 3, title: 'Editor', description: 'Adicione foto e texto com mais foco no preview.' },
    { step: 4, title: 'Confirmacao', description: 'Revise o pedido e finalize.' },
  ] as const;

  const currentStepMeta =
    mobileStepConfig.find((item) => item.step === currentStep) ?? mobileStepConfig[0];

  const canProceedFromStep = () => {
    if (currentStep === 1) return Boolean(selectedBrand);
    if (currentStep === 2) return Boolean(selectedModel);
    if (currentStep === 3) return canFinish;
    return canFinish;
  };

  const nextStep = () => {
    if (!canProceedFromStep()) return;

    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const selectBrand = (
    brand: string,
    options?: { presetFirstModel?: boolean; advance?: boolean }
  ) => {
    const { presetFirstModel = true, advance = false } = options || {};
    setSelectedBrand(brand);
    setSearchQuery('');
    setMobileBrandSearchQuery('');
    setIsBrandSearchMode(false);

    if (presetFirstModel) {
      const firstModelOfBrand = phoneModels.find((model) => model.brand === brand);
      if (firstModelOfBrand) {
        setSelectedModel(firstModelOfBrand);
      }
    } else {
      setSelectedModel(null);
    }

    if (advance) {
      setCurrentStep(2);
    }
  };

  const selectModelForFlow = (model: PhoneModel, advance = false) => {
    setSelectedBrand(model.brand);
    setSelectedModel(model);
    if (advance) {
      setCurrentStep(3);
    }
  };

  const snapTextToVerticalCenter = (x: number) => {
    const snapDistance = 18;
    return Math.abs(x) <= snapDistance ? 0 : x;
  };

  const renderModelSelector = (mobile = false) => (
    <section className="space-y-4">
      {!mobile && (
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
          Selecione seu Aparelho
        </label>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => selectBrand(brand)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedBrand === brand
                ? mobile
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'bg-indigo-600 text-white shadow-md'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar modelo ou marca..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all ${
            mobile
              ? 'bg-white focus:ring-2 focus:ring-zinc-900'
              : 'bg-zinc-50 focus:ring-2 focus:ring-indigo-500'
          }`}
        />
      </div>

      <div
        className={`grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar ${
          mobile ? 'max-h-44 pr-1' : 'max-h-48 pr-2'
        }`}
      >
        {filteredModels.map((model) => {
          const selected = selectedModel?.id === model.id;

          return (
            <button
              key={model.id}
              onClick={() => {
                setSelectedBrand(model.brand);
                setSelectedModel(model);
              }}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                mobile
                  ? selected
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-700'
                  : selected
                    ? 'border border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border border-zinc-100 bg-white text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{model.name}</span>
                {searchQuery.trim() && (
                  <span className={`text-[11px] ${selected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    {model.brand}
                  </span>
                )}
              </div>
              {selected && <ChevronRight className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderUploadCard = (mobile = false) => (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative cursor-pointer border-2 border-dashed text-center transition-all ${
        mobile
          ? `rounded-[28px] p-6 ${
              isDragging
                ? 'border-zinc-900 bg-zinc-100'
                : 'border-zinc-300 bg-white hover:border-zinc-400'
            }`
          : `group flex flex-col items-center justify-center gap-3 rounded-2xl p-6 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.heic,.heif"
        className="hidden"
      />

      <div
        className={`mx-auto flex items-center justify-center rounded-full bg-zinc-100 ${
          mobile
            ? 'h-14 w-14'
            : 'h-10 w-10 transition-transform group-hover:scale-110'
        }`}
      >
        <Upload className={`${mobile ? 'h-6 w-6 text-zinc-700' : 'h-5 w-5 text-zinc-500'}`} />
      </div>

      <div className={mobile ? 'mt-4' : ''}>
        <p className={`${mobile ? 'text-base' : 'text-sm'} font-medium text-zinc-700`}>
          {mobile ? 'Toque para enviar sua imagem' : 'Carregar Foto'}
        </p>
        <p className={`${mobile ? 'mt-1 text-sm' : 'mt-1 text-xs'} text-zinc-400`}>
          {mobile
            ? 'PNG ou JPG. Depois disso abrimos os ajustes automaticamente.'
            : 'PNG, JPG ate 10MB'}
        </p>
      </div>
    </div>
  );

  const renderPhonePreview = (mobile = false, interactive = true) => (
    <div className="relative">
      <motion.div>
        <div
          ref={containerRef}
          className={`relative overflow-hidden rounded-[48px] flex items-center justify-center ${
            mobile
              ? 'mx-auto h-[360px] w-[202px] sm:h-[390px] sm:w-[220px]'
              : 'h-[720px] w-[405px] rounded-[60px]'
          }`}
        >
          {selectedModel?.col2 && (
            <img
              src={selectedModel.col2}
              className="absolute top-0 left-0 h-full w-full object-fill"
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
                drag={interactive}
                dragConstraints={dragLimits}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (!interactive) return;
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
                      : 'h-auto w-full'
                  } max-h-none max-w-none`}
                />
              </motion.div>
            </div>
          )}

          {customText && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-none absolute inset-y-[12%] left-1/2 w-px -translate-x-1/2 bg-[#435446]/25" />
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
                  if (!interactive) return;
                  setTextPosition((prev) => ({
                    x: snapTextToVerticalCenter(prev.x + info.offset.x),
                    y: prev.y + info.offset.y,
                  }));
                }}
                className="relative max-w-[75%] select-none"
              >
                <div className="relative rounded-sm border-2 border-green-600/60 bg-transparent px-3 py-2">
                  <div style={textRenderStyle}>{customText}</div>

                  <div className="absolute -top-10 left-1/2 flex -translate-x-1/2 gap-2 pointer-events-auto">
                    {interactive && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextRotation((prev) => (prev - 45) % 360);
                          }}
                          className="rounded-full bg-green-600 p-1.5 text-white shadow-lg transition-colors hover:bg-green-600"
                          title="Girar Anti-horario"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextRotation((prev) => (prev + 45) % 360);
                          }}
                          className="rounded-full bg-green-600 p-1.5 text-white shadow-lg transition-colors hover:bg-green-600"
                          title="Girar Horario"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {interactive && (
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
                      className="absolute -right-2 -bottom-2 h-4 w-4 cursor-nwse-resize rounded-sm border border-white bg-green-600"
                    />
                  )}

                  {interactive && (
                    <>
                      <div className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-green-600" />
                      <div className="absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 border-green-600" />
                      <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-green-600" />
                    </>
                  )}
                </div>
<<<<<<< HEAD
              </motion.div>
=======
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
                className="absolute top-157 right-43 w-17 opacity-90 z-50 pointer-events-none"
              />
>>>>>>> 71b73104a5b91c047602c600a9585e2ac88217e4
            </div>
          )}

          {selectedModel?.col3 && (
            <img
              src={selectedModel.col3}
              crossOrigin="anonymous"
              className="absolute inset-0 h-full w-full pointer-events-none"
            />
          )}

          <img
            src="https://res.cloudinary.com/dwexdk5pp/image/upload/v1773958801/logo_pamda_te76in.png"
            crossOrigin="anonymous"
            alt="Pamda"
            className="pointer-events-none absolute top-160 right-43 z-50 w-17 opacity-90"
          />
        </div>
      </motion.div>

      {!mobile && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm font-bold text-zinc-900">
            {selectedModel?.name || 'Selecione um modelo'}
          </p>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {selectedBrand || 'Sem marca'}
          </p>
        </div>
      )}

      {image && interactive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 whitespace-nowrap rounded-full border border-zinc-100 bg-white px-4 py-2 text-xs font-medium text-zinc-400 shadow-sm ${
            mobile
              ? 'mx-auto mt-3 w-fit'
              : 'absolute -top-12 left-1/2 -translate-x-1/2'
          }`}
        >
          <Move className="h-3 w-3" />
          Arraste ou use as setas para ajustar
        </motion.div>
      )}
    </div>
  );

  const renderOrderSummary = () => (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-800">Resumo do pedido</h3>

      <div className="space-y-2 text-sm text-zinc-600">
        <p>
          <strong>Modelo:</strong> {selectedModel?.name || 'Nao selecionado'}
        </p>
        <p>
          <strong>Marca:</strong> {selectedBrand || 'Nao selecionada'}
        </p>
        <p>
          <strong>Texto:</strong> {customText.trim() || 'Sem texto'}
        </p>
        <p>
          <strong>Imagem:</strong> {image ? 'Adicionada' : 'Nao adicionada'}
        </p>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
          Quantidade
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="h-10 w-10 rounded-xl bg-zinc-100 font-bold text-zinc-700 transition-colors hover:bg-zinc-200"
          >
            -
          </button>

          <div className="flex h-10 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-bold text-zinc-800">
            {quantity}
          </div>

          <button
            type="button"
            onClick={() => setQuantity((prev) => prev + 1)}
            className="h-10 w-10 rounded-xl bg-zinc-100 font-bold text-zinc-700 transition-colors hover:bg-zinc-200"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1 border-t border-zinc-100 pt-4 text-sm">
        <p className="flex justify-between text-zinc-600">
          <span>Valor unitario</span>
          <strong>R$ {unitPrice.toFixed(2)}</strong>
        </p>
        <p className="flex justify-between text-base font-bold text-zinc-800">
          <span>Total</span>
          <span>R$ {totalPrice.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );

  const showMobileSuggestions =
    currentStep === 1 &&
    mobileSuggestions.length > 0 &&
    (isMobileSearchActive || Boolean(mobileBrandSearchQuery.trim()));

  const renderMobileBottomBar = ({
    onPrimary,
    primaryLabel,
    primaryDisabled = false,
    showReset = false,
    onReset,
  }: {
    onPrimary: () => void;
    primaryLabel: string;
    primaryDisabled?: boolean;
    showReset?: boolean;
    onReset?: () => void;
  }) => (
    <div className="sticky bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2">
      <div className="mx-auto flex max-w-md items-center gap-2 rounded-[24px] border border-white/80 bg-white/92 p-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <button
          type="button"
          onClick={prevStep}
          className="min-h-11 flex-1 rounded-[18px] border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:bg-zinc-50"
        >
          Voltar
        </button>
        {showReset && (
          <button
            type="button"
            onClick={onReset ?? resetTransform}
            className="min-h-11 rounded-[18px] border border-[#6d7b6b]/15 bg-[#e4ebe1] px-4 text-sm font-semibold text-[#435446] transition-colors hover:bg-[#dbe4d8]"
          >
            Resetar
          </button>
        )}
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className={`min-h-11 flex-1 rounded-[18px] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(67,84,70,0.2)] transition-all ${
            primaryDisabled ? 'bg-zinc-300 shadow-none' : 'bg-[#435446] hover:bg-[#39493b]'
          }`}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );

  const renderMobileImageControls = () => {
    if (!isMobileImageEditing || !image) return null;

    const controlClassName =
      'flex h-12 w-12 items-center justify-center rounded-full border border-[#5f6e5b]/20 bg-[#435446] text-white shadow-[0_14px_30px_rgba(67,84,70,0.22)]';

    return (
      <>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
          <div className="pointer-events-auto grid gap-3">
            <button type="button" onClick={() => moveImage('left')} className={controlClassName}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => moveImage('up')} className={controlClassName}>
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => moveImage('down')} className={controlClassName}>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
          <div className="pointer-events-auto grid gap-3">
            <button
              type="button"
              onClick={() => moveImage('right')}
              className={controlClassName}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
              className={controlClassName}
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMirrored((prev) => !prev)}
              className={controlClassName}
            >
              <FlipHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 -bottom-3 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/92 px-3 py-2 shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
            <button
              type="button"
              onClick={() => setZoom(Math.max(100, zoom - 10))}
              className={controlClassName}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-14 text-center text-xs font-semibold text-zinc-500">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(300, zoom + 10))}
              className={controlClassName}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileImageEditing(false)}
              className="rounded-full bg-[#dce8db] px-4 py-3 text-xs font-semibold text-[#435446]"
            >
              Concluir
            </button>
          </div>
        </div>
      </>
    );
  };

  const handleStepReset = () => {
    if (image) {
      clearImage();
      setIsMobileImageEditing(false);
      return;
    }

    if (customText.trim()) {
      clearText();
      return;
    }

    resetTransform();
  };

  const renderMobileTextModal = () => {
    if (!isMobileTextModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 px-4">
        <div className="w-full max-w-md rounded-[28px] bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                Texto
              </p>
              <h3 className="mt-1 text-base font-bold text-zinc-900">Personalize sua frase</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileTextModalOpen(false)}
              className="rounded-full bg-zinc-100 p-2 text-zinc-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Type className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <textarea
                placeholder="Escreva seu texto..."
                value={customText}
                onChange={handleCustomTextChange}
                maxLength={MAX_CUSTOM_TEXT_LENGTH}
                rows={2}
                className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#435446]"
                style={{
                  fontFamily: textFont,
                  fontWeight: isBold ? 700 : 400,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textDecoration: isUnderline ? 'underline' : 'none',
                  color: textColor,
                  letterSpacing: `${letterSpacing}px`,
                  fontSize: `${editorTextareaFontSize}px`,
                  lineHeight: 1.4,
                }}
              />
              <div className="mt-2 text-right text-[11px] font-medium text-zinc-400">
                {customText.length}/{MAX_CUSTOM_TEXT_LENGTH}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setIsBold((prev) => !prev)}
                className={`flex min-h-10 items-center justify-center rounded-2xl ${
                  isBold ? 'bg-[#435446] text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsItalic((prev) => !prev)}
                className={`flex min-h-10 items-center justify-center rounded-2xl ${
                  isItalic ? 'bg-[#435446] text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsUnderline((prev) => !prev)}
                className={`flex min-h-10 items-center justify-center rounded-2xl ${
                  isUnderline ? 'bg-[#435446] text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                <Underline className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                  Fonte
                </label>
                <select
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-[#435446]"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                  Tamanho
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTextSize((prev) => Math.max(8, prev - 2))}
                    className="rounded-xl bg-white px-3 py-2 text-zinc-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={textSize}
                    onChange={(e) =>
                      setTextSize(Math.max(8, parseInt(e.target.value, 10) || 12))
                    }
                    className="no-spinner min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-2 py-2 text-center text-sm outline-none focus:ring-2 focus:ring-[#435446]"
                  />
                  <button
                    type="button"
                    onClick={() => setTextSize((prev) => Math.min(200, prev + 2))}
                    className="rounded-xl bg-white px-3 py-2 text-zinc-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                    Espaçamento
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLetterSpacing((prev) => Math.max(-2, prev - 0.5))}
                      className="rounded-xl bg-white px-3 py-2 text-xs"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-zinc-700">
                      {letterSpacing}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLetterSpacing((prev) => Math.min(10, prev + 0.5))}
                      className="rounded-xl bg-white px-3 py-2 text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="min-w-[120px] rounded-2xl bg-white px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                    Cor
                  </p>
                  <div className="mt-2 h-10 rounded-xl border border-zinc-200" style={{ backgroundColor: textColor }} />
                </div>
              </div>

              <div className="mt-3">
                <div className="grid grid-cols-6 gap-2">
                  {TEXT_COLOR_PRESETS.map((color) => {
                    const isSelected = textColor.toLowerCase() === color.toLowerCase();

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTextColor(color)}
                        className={`h-9 w-full rounded-xl border transition-transform ${
                          isSelected ? 'scale-105 border-zinc-900' : 'border-zinc-200'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Selecionar cor ${color}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-xl border border-zinc-200 bg-transparent p-1"
                    title="Escolher cor personalizada"
                  />
                  <span className="text-xs font-medium text-zinc-500">Cor personalizada</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div
                    className="h-9 w-9 shrink-0 rounded-xl border border-zinc-200"
                    style={{ backgroundColor: textColor }}
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#435446]"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileTextModalOpen(false)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[22px] bg-[#435446] px-4 text-sm font-semibold text-white"
            >
              <Check className="h-4 w-4" />
              Concluir
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderExportLayers = () => (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${EXPORT_WIDTH}px`,
          height: `${EXPORT_HEIGHT}px`,
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
            width: `${EXPORT_WIDTH}px`,
            height: `${EXPORT_HEIGHT}px`,
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
                  transform: `translate(${exportImagePosition.x}px, ${exportImagePosition.y}px) rotate(${imageRotation}deg) scale(${(zoom / 100) * (isQuarterTurn ? 1.95 : 1)})${isMirrored ? ' scaleX(-1)' : ''}`,
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
              }}
            >
              <div
                style={{
                  transform: `translate(${exportTextPosition.x}px, ${exportTextPosition.y}px) rotate(${textRotation}deg)`,
                  maxWidth: '75%',
                }}
              >
                <div style={exportTextRenderStyle}>{customText}</div>
              </div>
            </div>
          )}

          {selectedModel?.col3 && (
            <img
              src={selectedModel.col3}
              crossOrigin="anonymous"
              alt="Mascara"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                zIndex: 30,
              }}
            />
          )}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${EXPORT_WIDTH}px`,
          height: `${EXPORT_HEIGHT}px`,
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
            width: `${EXPORT_WIDTH}px`,
            height: `${EXPORT_HEIGHT}px`,
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
                  transform: `translate(${exportImagePosition.x}px, ${exportImagePosition.y}px) rotate(${imageRotation}deg) scale(${(zoom / 100) * (isQuarterTurn ? 1.95 : 1)})${isMirrored ? ' scaleX(-1)' : ''}`,
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
              }}
            >
              <div
                style={{
                  transform: `translate(${exportTextPosition.x}px, ${exportTextPosition.y}px) rotate(${textRotation}deg)`,
                  maxWidth: '75%',
                }}
              >
                <div style={exportTextRenderStyle}>{customText}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {isMobileLayout ? (
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#e7e2d7]">
          <header className="sticky top-0 z-40 border-b border-zinc-300/70 bg-[#cdc5b8]/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3">
              <img
                src="https://res.cloudinary.com/dwexdk5pp/image/upload/v1773958801/logo_pamda_te76in.png"
                alt="Logo Pamda Cases"
                className="h-8 w-auto"
              />
              <div className="text-right">
                <p className="font-lexend text-xs font-bold uppercase tracking-[0.24em] text-zinc-700">
                  Pamda Cases
                </p>
                <p className="text-[10px] text-zinc-500">Personalizacao guiada</p>
              </div>
            </div>
          </header>

          <div className="mx-auto flex h-full w-full max-w-md flex-1 flex-col overflow-hidden px-4 pb-4 pt-4">
            <input
              type="file"
              ref={mobileFileInputRef}
              onChange={handleFileChange}
              accept="image/*,.heic,.heif"
              className="hidden"
            />

            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                  Etapa {currentStep}/{totalSteps}
                </p>
              </div>
              <div className="mt-1 flex gap-1.5">
                {mobileStepConfig.map((step) => (
                  <span
                    key={step.step}
                    className={`h-2.5 w-2.5 rounded-full ${
                      step.step === currentStep
                        ? 'bg-[#435446]'
                        : step.step < currentStep
                          ? 'bg-[#92a18d]'
                          : 'bg-zinc-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {currentStep === 1 && (
              <section className="flex flex-1 flex-col justify-center gap-4 overflow-hidden pb-4">
                <div className="rounded-[30px] bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                  <div className="grid grid-cols-2 gap-3">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => selectBrand(brand, { presetFirstModel: false, advance: true })}
                        className="rounded-[26px] border border-white/80 bg-[#f6f3ee] px-4 py-4 text-left shadow-sm"
                      >
                        <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[#435446]">
                          Marca
                        </span>
                        <span className="mt-2 block text-lg font-semibold text-zinc-900">{brand}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsBrandSearchMode((prev) => !prev);
                        setIsMobileSearchActive(true);
                      }}
                        className={`rounded-[26px] border px-4 py-4 text-left shadow-sm ${
                          isBrandSearchMode ? 'border-[#435446]/20 bg-[#dfe7dd]' : 'border-white/80 bg-white'
                        }`}
                    >
                      <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[#435446]">
                        Busca
                      </span>
                      <span className="mt-2 flex items-center gap-2 text-lg font-semibold text-zinc-900">
                        <Search className="h-4 w-4" />
                        Pesquisar
                      </span>
                    </button>
                  </div>
                </div>

                {isBrandSearchMode && (
                  <div className="rounded-[30px] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Ex.: ifone 13, samsung a15..."
                        value={mobileBrandSearchQuery}
                        onFocus={() => setIsMobileSearchActive(true)}
                        onBlur={() => window.setTimeout(() => setIsMobileSearchActive(false), 120)}
                        onChange={(e) => setMobileBrandSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#435446]"
                      />
                    </div>
                    {showMobileSuggestions && (
                      <div className="mt-3 space-y-2">
                        {mobileSuggestions.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              selectModelForFlow(model);
                              setSearchQuery(model.name);
                              setCurrentStep(2);
                              setIsMobileSearchActive(false);
                            }}
                            className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left"
                          >
                            <div>
                              <p className="text-sm font-semibold text-zinc-900">{model.name}</p>
                              <p className="text-xs text-zinc-500">{model.brand}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {currentStep === 2 && (
              <>
                <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden pb-20">
                  <div className="rounded-[30px] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#435446]">
                      Marca escolhida
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-zinc-900">{selectedBrand}</h3>
                    <div className="relative mt-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Buscar modelo dessa marca"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#435446]"
                      />
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 rounded-[30px] bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                    <div className="h-full space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                      {mobileModelResults.map((model) => {
                        const selected = selectedModel?.id === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => selectModelForFlow(model)}
                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left ${
                              selected ? 'border-[#435446]/20 bg-[#435446] text-white' : 'border-zinc-200 bg-white text-zinc-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{model.name}</p>
                              <p className={`text-xs ${selected ? 'text-zinc-200' : 'text-zinc-400'}`}>
                                {model.brand}
                              </p>
                            </div>
                            {selected && <Check className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
                {renderMobileBottomBar({ onPrimary: nextStep, primaryLabel: 'Avancar', primaryDisabled: !selectedModel })}
              </>
            )}

            {currentStep === 3 && (
              <>
                <section className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden pb-24">
                  <div className="rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(240,238,231,0.98)_100%)] px-4 pb-5 pt-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                    <div className="text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">{selectedBrand}</p>
                      <h3 className="mt-1 text-base font-semibold text-zinc-900">{selectedModel?.name}</h3>
                    </div>
                    <div className="relative mx-auto mt-2 flex max-w-[320px] justify-center px-12">
                      {renderPhonePreview(true)}
                      {renderMobileImageControls()}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (image) {
                            setIsMobileImageEditing(true);
                            return;
                          }

                          mobileFileInputRef.current?.click();
                        }}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[22px] border border-white/80 bg-white/94 px-4 text-sm font-semibold text-zinc-800 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-transform"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4ebe1] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                          <Upload className="h-4 w-4 text-[#435446]" />
                        </span>
                        Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMobileTextModalOpen(true)}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[22px] border border-white/80 bg-white/94 px-4 text-sm font-semibold text-zinc-800 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-transform"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4ebe1] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                          <Type className="h-4 w-4 text-[#435446]" />
                        </span>
                        Texto
                      </button>
                    </div>
                    <div className="mt-2.5 rounded-2xl bg-white/80 px-4 py-2 text-center text-sm text-zinc-500">
                      {image || customText.trim() ? 'Use foto e texto com foco total no preview.' : 'Adicione uma foto, um texto ou os dois para continuar.'}
                    </div>
                    {image && (
                      <button type="button" onClick={clearImage} className="mx-auto mt-2.5 flex items-center gap-2 text-sm font-semibold text-red-600">
                        <X className="h-4 w-4" />
                        Remover foto
                      </button>
                    )}
                  </div>
                </section>
                {renderMobileBottomBar({
                  onPrimary: nextStep,
                  primaryLabel: 'Avancar',
                  primaryDisabled: !canFinish,
                  showReset: true,
                  onReset: handleStepReset,
                })}
                {renderMobileTextModal()}
              </>
            )}

            {currentStep === 4 && (
              <>
                <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-20 pr-1 custom-scrollbar">
                  <div className="rounded-[30px] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Preview final</p>
                    <div className="mt-5 flex justify-center">{renderPhonePreview(true, false)}</div>
                  </div>
                  <div className="shrink-0">
                    {renderOrderSummary()}
                  </div>
                  {orderCompleted && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                      Pedido pronto para envio no WhatsApp!
                    </div>
                  )}
                </section>
                {renderMobileBottomBar({ onPrimary: handleFinish, primaryLabel: isUploadingOrder ? 'Enviando...' : 'Finalizar', primaryDisabled: isUploadingOrder || !canFinish })}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col lg:flex-row">
          <aside className="z-10 flex max-h-screen w-full flex-col overflow-y-auto border-b border-zinc-200 bg-bamboo lg:w-96 lg:border-r lg:border-b-0">
            <div className="border-b border-zinc-100/50 p-8 text-center">
              <div className="mb-4">
                <img
                  src="https://res.cloudinary.com/dwexdk5pp/image/upload/v1773958801/logo_pamda_te76in.png"
                  alt="Logo Pamda Cases"
                  className="mx-auto h-auto w-48"
                />
              </div>
              <h2 className="font-lexend text-lg font-bold text-zinc-800">
                Sua capinha, do seu jeito!
              </h2>
            </div>

            <div className="flex-1 space-y-8 bg-white/40 p-6 backdrop-blur-sm">
              {renderModelSelector()}

              <section>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Sua Imagem
                </label>
                {renderUploadCard()}
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
                          <div className="flex rounded-lg bg-zinc-100 p-1">
                            <button
                              onClick={() => setZoom(Math.max(100, zoom - 10))}
                              className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-white"
                            >
                              <ZoomOut className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setZoom(Math.min(300, zoom + 10))}
                              className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-white"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-[9px] font-bold uppercase text-zinc-400">
                            Zoom
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => setIsMirrored(!isMirrored)}
                            className={`rounded-lg p-2.5 transition-all ${
                              isMirrored
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            <FlipHorizontal className="h-4 w-4" />
                          </button>
                          <span className="text-[9px] font-bold uppercase text-zinc-400">
                            Espelhar
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => setImageRotation((prev) => (prev - 90) % 360)}
                            className="rounded-lg bg-zinc-100 p-2.5 text-zinc-600 transition-all hover:bg-zinc-200"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <span className="text-[9px] font-bold uppercase text-zinc-400">
                            Girar Anti
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                            className="rounded-lg bg-zinc-100 p-2.5 text-zinc-600 transition-all hover:bg-zinc-200"
                          >
                            <RotateCw className="h-4 w-4" />
                          </button>
                          <span className="text-[9px] font-bold uppercase text-zinc-400">
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
                      <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Ajuste de Posicao
                      </label>
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => moveImage('up')}
                          className="rounded-lg bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200"
                        >
                          <ChevronUp className="h-5 w-5" />
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => moveImage('left')}
                            className="rounded-lg bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200">
                            <Move className="h-4 w-4 text-zinc-300" />
                          </div>
                          <button
                            onClick={() => moveImage('right')}
                            className="rounded-lg bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => moveImage('down')}
                          className="rounded-lg bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200"
                        >
                          <ChevronDown className="h-5 w-5" />
                        </button>
                      </div>
                    </section>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={resetTransform}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Resetar
                      </button>
                      <button
                        onClick={clearImage}
                        className="rounded-xl border border-zinc-200 p-2.5 text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Personalizar Texto
                  </label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setTextRotation((prev) => (prev - 45) % 360)}
                      className="rounded-lg bg-zinc-100 p-1.5 text-zinc-600 transition-colors hover:bg-zinc-200"
                      title="Girar Anti-horario"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setTextRotation((prev) => (prev + 45) % 360)}
                      className="rounded-lg bg-zinc-100 p-1.5 text-zinc-600 transition-colors hover:bg-zinc-200"
                      title="Girar Horario"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="textOnly"
                      checked={textOnlyMode}
                      onChange={(e) => setTextOnlyMode(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="textOnly"
                      className="cursor-pointer text-xs font-medium text-zinc-600"
                    >
                      Modo Somente Texto (Ocultar Foto)
                    </label>
                  </div>

                  <div className="relative">
                    <Type className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <textarea
                      placeholder="Escreva seu texto..."
                      value={customText}
                      onChange={handleCustomTextChange}
                      maxLength={MAX_CUSTOM_TEXT_LENGTH}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBold(!isBold)}
                      className={`rounded p-2 ${
                        isBold ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsItalic(!isItalic)}
                      className={`rounded p-2 ${
                        isItalic ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUnderline(!isUnderline)}
                      className={`rounded p-2 ${
                        isUnderline
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <Underline className="h-4 w-4" />
                    </button>
                    <div className="mx-1 h-3 w-px bg-zinc-300" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-800">Espacamento</span>
                      <button
                        type="button"
                        onClick={() => setLetterSpacing((prev) => Math.max(-2, prev - 0.5))}
                        className="rounded bg-zinc-100 px-3 py-1 text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs">{letterSpacing}</span>
                      <button
                        type="button"
                        onClick={() => setLetterSpacing((prev) => Math.min(10, prev + 0.5))}
                        className="rounded bg-zinc-100 px-3 py-1 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">
                        Fonte
                      </label>
                      <select
                        value={textFont}
                        onChange={(e) => setTextFont(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
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
                      <label className="text-[10px] font-bold uppercase text-zinc-400">
                        Tamanho
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTextSize((prev) => Math.max(8, prev - 2))}
                          className="rounded-lg bg-zinc-100 px-3 py-2 text-zinc-700 hover:bg-zinc-200"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={textSize}
                          onChange={(e) =>
                            setTextSize(Math.max(8, parseInt(e.target.value) || 12))
                          }
                          className="no-spinner w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-center text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setTextSize((prev) => Math.min(200, prev + 2))}
                          className="rounded-lg bg-zinc-100 px-3 py-2 text-zinc-700 hover:bg-zinc-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">
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

                    <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
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
                            <span className="w-8 text-center text-xs text-zinc-600">
                              {textStroke}px
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-auto space-y-4 border-t border-zinc-100 bg-zinc-50/50 p-6">
              {renderOrderSummary()}
              <button
                onClick={handleFinish}
                disabled={isUploadingOrder || !selectedModel || (!image && !customText.trim())}
                className={`w-full rounded-xl px-6 py-4 font-bold transition-all ${
                  selectedModel && (image || customText.trim())
                    ? 'scale-[1.02] bg-zinc-900 text-white shadow-xl active:scale-100 hover:bg-zinc-800'
                    : 'cursor-not-allowed bg-zinc-200 text-zinc-400'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Download className="h-5 w-5" />
                  {isUploadingOrder ? 'Enviando imagens...' : 'Finalizar Pedido'}
                </span>
              </button>
              {orderCompleted && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                  Pedido pronto para envio no WhatsApp!
                </div>
              )}
            </div>
          </aside>

          <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-100 p-8 lg:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {renderPhonePreview()}
          </main>
        </div>
      )}
      {renderExportLayers()}
    </div>
  );
}
