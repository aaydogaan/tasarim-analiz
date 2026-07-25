import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ContestUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any | null;
  onSuccess: () => void;
}

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const ContestUploadModal: React.FC<ContestUploadModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [entryNote, setEntryNote] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen || !entry) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !entry.design_url) {
      toast.error('Lütfen bilgisayarınızdan bir görsel seçin.');
      return;
    }

    setUploading(true);
    try {
      let finalDesignUrl = entry.design_url || '';

      if (file) {
        // Try Storage upload first
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `contest_${entry.id}_${Date.now()}.${fileExt}`;
          const filePath = `contests/${fileName}`;

          const { error: uploadErr } = await supabase.storage
            .from('analiz-gorselleri')
            .upload(filePath, file, { upsert: true });

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from('analiz-gorselleri')
              .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
              finalDesignUrl = publicUrlData.publicUrl;
            }
          }
        } catch (_) {}

        // Fallback to base64 data url if needed
        if (!finalDesignUrl || finalDesignUrl === entry.design_url) {
          const compressed = await compressImageFile(file);
          if (compressed) finalDesignUrl = compressed;
        }
      }

      const { error: updateErr } = await supabase
        .from('contest_entries')
        .update({
          design_url: finalDesignUrl,
          entry_note: entryNote.trim() || entry.entry_note,
        })
        .eq('id', entry.id);

      if (updateErr) throw updateErr;

      toast.success('🎉 Tasarımınız yarışmaya başarıyla gönderildi!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Yükleme hatası: ${err.message || 'Hata oluştu'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#FF5500] uppercase tracking-wider block mb-1">
                Yarışma Tasarımı Yükle
              </span>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                {entry.contests?.title || 'Tasarım Yarışması'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Bilgisayarınızdan hazırladığınız çalışmayı seçip doğrudan yarışmaya gönderebilirsiniz.
              </p>
            </div>

            {/* PC File Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Bilgisayarınızdan Görsel Seçin *
              </label>

              <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#FF5500] rounded-2xl p-6 text-center transition-colors bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {previewUrl || entry.design_url ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl || entry.design_url}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-zinc-200 dark:border-zinc-700"
                    />
                    <span className="text-xs font-bold text-[#FF5500] block">
                      Görseli Değiştirmek İçin Tıklayın
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#FF5500] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                      Görsel Seçmek İçin Tıklayın veya Sürükleyin
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      PNG, JPG, WEBP (Maks 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Jüriye Notunuz (Opsiyonel)
              </label>
              <textarea
                rows={2}
                placeholder="Tasarımınızın fikrinden veya hikayesinden kısaca bahsedebilirsiniz..."
                value={entryNote}
                onChange={(e) => setEntryNote(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-xs outline-none text-zinc-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Gönder ve Tamamla
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm"
              >
                İptal
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
