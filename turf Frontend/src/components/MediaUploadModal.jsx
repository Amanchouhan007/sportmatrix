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

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
            const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5005';
            const response = await fetch(`${API_URL}/upload/multiple`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.data) {
                const newItems = result.data.map(item => ({
                    type: item.type, // 'image' or 'video'
                    url: item.url.startsWith('/') ? `${SERVER_URL}${item.url}` : item.url,
                    thumbnail: item.type === 'video' ? '' : (item.url.startsWith('/') ? `${SERVER_URL}${item.url}` : item.url),
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
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
                await fetch(`${API_URL}/upload/${filename}`, {
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center pt-16 pb-4 px-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-3xl bg-white border border-[#E5E7EB] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-[#16A34A]">
                            <HiPhotograph className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#111827] italic tracking-tight uppercase">Turf Media Manager</h2>
                            <p className="text-xs text-[#6B7280] font-semibold">Upload Photos & Videos (MP4, WEBM, PNG, JPG)</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#6B7280] hover:text-[#111827] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

                    {/* Upload Drop Zone */}
                    <div className="border-2 border-dashed border-[#16A34A]/40 hover:border-[#16A34A] rounded-2xl p-6 text-center bg-green-50/40 hover:bg-green-50 transition-all cursor-pointer group"
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
                            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#16A34A] shadow-xs group-hover:scale-110 transition-transform">
                                <HiUpload className="w-6 h-6" />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-blue-600 shadow-xs group-hover:scale-110 transition-transform">
                                <HiVideoCamera className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider mb-1">
                            Click or Drag & Drop Photos & Videos
                        </h3>
                        <p className="text-xs text-[#6B7280] font-semibold">
                            Supports high-res Photos (JPG, PNG, WEBP) & Full HD Videos (MP4, WEBM, MOV) up to 100MB
                        </p>

                        {isUploading && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-[#16A34A]">
                                <div className="w-4 h-4 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
                                <span>{uploadProgress}</span>
                            </div>
                        )}
                    </div>

                    {/* Or URL Input */}
                    <form onSubmit={handleAddCustomUrl} className="bg-[#F7F9FC] p-4 border border-[#E5E7EB] rounded-2xl space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Or Add Direct Photo / Video Web URL:</span>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <select
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                className="px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#16A34A]"
                            >
                                <option value="image">📷 Photo</option>
                                <option value="video">🎥 Video</option>
                            </select>
                            <input
                                type="url"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="Paste photo or video URL (https://...)"
                                className="flex-1 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#16A34A]"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-[#B5F000] cursor-pointer"
                            >
                                Add Media
                            </button>
                        </div>
                    </form>

                    {/* Current Media List Grid */}
                    <div>
                        <h4 className="text-xs font-black text-[#6B7280] uppercase tracking-widest mb-3 flex items-center justify-between">
                            <span>Uploaded Media Items ({mediaList.length})</span>
                            <span className="text-[10px] text-[#9CA3AF]">First item is primary display</span>
                        </h4>

                        {mediaList.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 border border-[#E5E7EB] rounded-2xl text-[#6B7280] text-xs font-semibold">
                                No media uploaded yet. Upload a photo or video above!
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {mediaList.map((item, idx) => (
                                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-[#E5E7EB] bg-slate-900 aspect-video flex items-center justify-center shadow-xs">
                                        {item.type === 'video' ? (
                                            <div className="w-full h-full relative bg-slate-950">
                                                <video src={item.url} className="w-full h-full object-cover" muted />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="w-8 h-8 rounded-full bg-slate-900/90 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xs pl-0.5">
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
                                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6B7280]">
                        {mediaList.filter(m => m.type === 'video').length} Videos • {mediaList.filter(m => m.type === 'image').length} Photos
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-white hover:bg-slate-100 text-[#111827] font-bold text-xs uppercase tracking-wider rounded-full transition-colors border border-[#E5E7EB] cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-wider rounded-full transition-all border border-[#B5F000] cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                            <HiCheckCircle className="w-4 h-4 text-[#16A34A]" />
                            Save Gallery
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
