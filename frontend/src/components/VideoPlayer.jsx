import React from 'react';

/**
 * Parse any video URL to determine its embed type and embeddable URL
 */
export function parseVideoUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const cleanUrl = url.trim();

    // YouTube: standard, short-link, shorts, embed
    const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    if (ytMatch) {
        return {
            type: 'youtube',
            id: ytMatch[1],
            embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`,
            originalUrl: cleanUrl
        };
    }

    // Vimeo
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeoMatch) {
        return {
            type: 'vimeo',
            id: vimeoMatch[1],
            embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
            originalUrl: cleanUrl
        };
    }

    // Direct video file
    if (cleanUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
        return {
            type: 'direct',
            url: cleanUrl,
            originalUrl: cleanUrl
        };
    }

    return {
        type: 'external',
        url: cleanUrl,
        originalUrl: cleanUrl
    };
}

/**
 * Responsive Video Player Component
 */
const VideoPlayer = ({ videoUrl, title = "Mas'ala Video Explanation", className = "" }) => {
    const video = parseVideoUrl(videoUrl);

    if (!video) {
        return (
            <div className={`p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 ${className}`}>
                <span className="material-symbols-outlined text-4xl text-rose-500 mb-2 block">videocam</span>
                <p className="font-bold text-sm">Video explanation published on official channels.</p>
            </div>
        );
    }

    if (video.type === 'youtube' || video.type === 'vimeo') {
        return (
            <div className={`relative w-full overflow-hidden rounded-2xl bg-black shadow-xl border border-slate-200 ${className}`}>
                <div className="relative pt-[56.25%]">
                    <iframe
                        src={video.embedUrl}
                        title={title}
                        className="absolute inset-0 size-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            </div>
        );
    }

    if (video.type === 'direct') {
        return (
            <div className={`w-full overflow-hidden rounded-2xl bg-black shadow-xl border border-slate-200 ${className}`}>
                <video
                    controls
                    src={video.url}
                    className="w-full max-h-[500px] object-contain mx-auto"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    // External video platform (Facebook, Instagram, Drive, etc.)
    return (
        <div className={`p-6 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${className}`}>
            <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="size-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0 mx-auto sm:mx-0">
                    ▶
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h4>
                    <p className="text-xs text-slate-500">Available to watch on external video platform.</p>
                </div>
            </div>
            <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
            >
                <span>Watch on Video Platform</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
        </div>
    );
};

export default VideoPlayer;
