'use client';

import { useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;           // base64 or ''
  onChange: (base64: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'wide' | 'cover'; // square=1:1, wide=16:9, cover=4:3
  maxPx?: number;          // max width/height before resize (default 800)
  quality?: number;        // jpeg quality 0-1 (default 0.82)
  className?: string;
}

function resizeToBase64(file: File, maxPx: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        const { width, height } = img;
        let w = width;
        let h = height;
        if (w > maxPx || h > maxPx) {
          if (w > h) {
            h = Math.round((h / w) * maxPx);
            w = maxPx;
          } else {
            w = Math.round((w / h) * maxPx);
            h = maxPx;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas error')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({
  value,
  onChange,
  label,
  aspectRatio = 'wide',
  maxPx = 800,
  quality = 0.82,
  className = '',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'cover'  ? 'aspect-[4/3]' :
    'aspect-video';

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    try {
      const b64 = await resizeToBase64(file, maxPx, quality);
      onChange(b64);
    } catch {
      // silently ignore resize errors
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-gray-200 group`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium shadow flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium shadow flex items-center gap-1.5 hover:bg-red-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full ${aspectClass} border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-red-400 hover:bg-red-50/30 transition-colors group`}
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
            <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-500 group-hover:text-red-600 transition-colors">Upload Image</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP</p>
          </div>
        </button>
      )}
    </div>
  );
}
