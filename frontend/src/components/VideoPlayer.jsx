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
 * Professional, clean Video Player Component (no excessive rounded borders)
 */
const VideoPlayer = ({ videoUrl, title = "Mas'ala Video Explanation", className = "" }) => {
    const video = parseVideoUrl(videoUrl);

    if (!video) {
        return null;
    }

    if (video.type === 'youtube' || video.type === 'vimeo') {
        return (
            <div className={`relative w-full overflow-hidden bg-black border border-slate-300 shadow-sm ${className}`}>
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
            <div className={`w-full overflow-hidden bg-black border border-slate-300 shadow-sm ${className}`}>
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
        <div className={`p-4 bg-slate-50 border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
            <div className="flex items-center gap-3">
                <span className="text-rose-600 font-bold text-base">▶</span>
                <span className="font-bold text-slate-800 text-sm">{title}</span>
            </div>
            <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-primary text-white px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
                <span>Watch on Video Platform</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
        </div>
    );
};

export default VideoPlayer;
