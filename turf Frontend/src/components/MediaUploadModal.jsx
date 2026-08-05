import { useState, useRef } from 'react';
import { HiX, HiUpload, HiTrash, HiPhotograph, HiVideoCamera, HiCheckCircle } from 'react-icons/hi';

export default function MediaUploadModal({ isOpen, onClose, currentMedia = [], onSaveMedia }) {
    const [mediaList, setMediaList] = useState(currentMedia);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [customType, setCustomType] = useState('image');
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress('Uploading media...');

        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));

            const response = await fetch('http://localhost:5000/api/v1/upload/multiple', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.data) {
                const newItems = result.data.map(item => ({
                    type: item.type, // 'image' or 'video'
                    url: item.url.startsWith('/') ? `http://localhost:5000${item.url}` : item.url,
                    thumbnail: item.type === 'video' ? '' : (item.url.startsWith('/') ? `http://localhost:5000${item.url}` : item.url),
                    filename: item.originalName || item.filename
                }));

                setMediaList(prev => [...prev, ...newItems]);
                setUploadProgress('Upload completed successfully!');
            } else {
                setUploadProgress('Upload failed: ' + (result.message || 'Error uploading file'));
            }
        } catch (err) {
            console.error('File upload error:', err);
            // Fallback for offline/local blob preview
            const fallbackItems = files.map(file => {
                const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name);
                const localUrl = URL.createObjectURL(file);
                return {
                    type: isVideo ? 'video' : 'image',
                    url: localUrl,
                    thumbnail: isVideo ? '' : localUrl,
                    filename: file.name
                };
            });
            setMediaList(prev => [...prev, ...fallbackItems]);
            setUploadProgress('Added locally preview mode.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddCustomUrl = (e) => {
        e.preventDefault();
        if (!customUrl.trim()) return;

        const isVideo = customType === 'video' || /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(customUrl) || customUrl.includes('youtube.com') || customUrl.includes('vimeo.com');

        const newItem = {
            type: isVideo ? 'video' : 'image',
            url: customUrl.trim(),
            thumbnail: isVideo ? '' : customUrl.trim(),
            filename: isVideo ? 'Video Link' : 'Image Link'
        };

        setMediaList(prev => [...prev, newItem]);
        setCustomUrl('');
    };

    const handleRemoveMedia = async (index) => {
        const itemToRemove = mediaList[index];
        if (itemToRemove && itemToRemove.url && itemToRemove.url.includes('/uploads/')) {
            const filename = itemToRemove.url.split('/uploads/').pop();
            try {
                await fetch(`http://localhost:5000/api/v1/upload/${filename}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error('Error deleting file from disk:', e);
            }
        }
        setMediaList(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSaveMedia(mediaList);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <HiPhotograph className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white italic tracking-tight uppercase">Turf Media Manager</h2>
                            <p className="text-xs text-slate-400 font-bold">Upload Photos & Videos (MP4, WEBM, PNG, JPG)</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    
                    {/* Upload Drop Zone */}
                    <div className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-6 text-center bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] transition-all cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div className="flex justify-center items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <HiUpload className="w-6 h-6" />
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                <HiVideoCamera className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                            Click or Drag & Drop Photos & Videos
                        </h3>
                        <p className="text-xs text-slate-400 font-bold">
                            Supports high-res Photos (JPG, PNG, WEBP) & Full HD Videos (MP4, WEBM, MOV) up to 100MB
                        </p>

                        {isUploading && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
                                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                <span>{uploadProgress}</span>
                            </div>
                        )}
                    </div>

                    {/* Or URL Input */}
                    <form onSubmit={handleAddCustomUrl} className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Or Add Direct Photo / Video Web URL:</span>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <select
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                className="px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs font-bold text-white outline-none focus:border-emerald-500"
                            >
                                <option value="image">📷 Photo</option>
                                <option value="video">🎥 Video</option>
                            </select>
                            <input
                                type="url"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="Paste photo or video URL (https://...)"
                                className="flex-1 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs font-medium text-white outline-none focus:border-emerald-500"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all"
                            >
                                Add Media
                            </button>
                        </div>
                    </form>

                    {/* Current Media List Grid */}
                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                            <span>Uploaded Media Items ({mediaList.length})</span>
                            <span className="text-[10px] text-slate-500">First item is primary display</span>
                        </h4>

                        {mediaList.length === 0 ? (
                            <div className="p-8 text-center bg-slate-950/40 border border-white/5 rounded-xl text-slate-500 text-xs font-bold">
                                No media uploaded yet. Upload a photo or video above!
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {mediaList.map((item, idx) => (
                                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video flex items-center justify-center shadow-md">
                                        {item.type === 'video' ? (
                                            <div className="w-full h-full relative bg-slate-950">
                                                <video src={item.url} className="w-full h-full object-cover" muted />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="w-9 h-9 rounded-full bg-slate-900/90 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-sm pl-0.5">
                                                        ▶
                                                    </span>
                                                </div>
                                                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[9px] font-black text-emerald-400 uppercase flex items-center gap-1">
                                                    🎥 Video
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                <img src={item.url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                                                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[9px] font-black text-cyan-400 uppercase flex items-center gap-1">
                                                    📷 Photo
                                                </span>
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveMedia(idx)}
                                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete Media"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                        {mediaList.filter(m => m.type === 'video').length} Videos • {mediaList.filter(m => m.type === 'image').length} Photos
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-wider rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
                        >
                            <HiCheckCircle className="w-4 h-4" />
                            Save Gallery
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
