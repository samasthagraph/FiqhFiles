import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { API_BASE_URL } from '../config';
import { clientCache } from '../utils/clientCache';
import VideoPlayer from './VideoPlayer';

const MADHHABS = ["All", "Shafi'i", "Hanafi", "Maliki", "Hanbali", "General / No Preference"];

const QAFeed = ({ limit }) => {
    const cacheKey = `qa_feed_${limit || 'all'}`;
    const cached = clientCache.get(cacheKey);

    const [questions, setQuestions] = useState(cached || []);
    const [isLoading, setIsLoading] = useState(!cached || cached.length === 0);
    const [selectedMadhhab, setSelectedMadhhab] = useState('All');
    const [videosOnly, setVideosOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state for playing video directly from feed
    const [activeVideoModal, setActiveVideoModal] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchQuestions = async () => {
            try {
                const url = limit ? `${API_BASE_URL}/questions/public?limit=${limit}` : `${API_BASE_URL}/questions/public`;
                const response = await axios.get(url);
                if (isMounted) {
                    setQuestions(response.data);
                    clientCache.set(cacheKey, response.data);
                }
            } catch (error) {
                console.error("Error fetching public questions:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        fetchQuestions();
        return () => { isMounted = false; };
    }, [limit, cacheKey]);

    // Calculate count per Madhhab
    const countsByMadhhab = useMemo(() => {
        const counts = { All: questions.length };
        MADHHABS.forEach(m => {
            if (m !== 'All') {
                counts[m] = questions.filter(q => q.madhhab === m).length;
            }
        });
        return counts;
    }, [questions]);

    const totalVideosCount = useMemo(() => {
        return questions.filter(q => q.hasVideo).length;
    }, [questions]);

    // Filter questions by Madhhab, Video-Only, and search query
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesMadhhab = selectedMadhhab === 'All' || q.madhhab === selectedMadhhab;
            const matchesVideo = !videosOnly || q.hasVideo;
            const matchesSearch = !searchTerm || 
                q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (q.answerText && q.answerText.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesMadhhab && matchesVideo && matchesSearch;
        });
    }, [questions, selectedMadhhab, videosOnly, searchTerm]);

    return (
        <section className="py-12 sm:py-16 bg-white" id="feed">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header & Filter Controls */}
                <div className="flex flex-col gap-6 mb-8 pb-6 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-secondary mb-1">
                                <span className="size-1.5 bg-secondary"></span>
                                <span>Verified Jurisprudence Archive</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                {limit ? 'Latest Answers' : 'Browse by School of Thought'}
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600">
                                Authenticated rulings and fatwas catalogued by classical Islamic jurisprudence.
                            </p>
                        </div>

                        {/* Search Input for archive view */}
                        {!limit && (
                            <div className="relative w-full sm:w-80">
                                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search rulings, keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2.5 border border-slate-300 bg-white text-xs sm:text-sm outline-none focus:border-slate-900 transition-all text-slate-900 placeholder:text-slate-400"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Filter Buttons & Video Filter */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 mr-2 shrink-0">
                            <FiFilter className="text-xs" /> Filter By:
                        </div>

                        {/* Madhhab Buttons */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                            {MADHHABS.map((madhhab) => {
                                const isSelected = selectedMadhhab === madhhab && !videosOnly;
                                const count = countsByMadhhab[madhhab] || 0;
                                return (
                                    <button
                                        key={madhhab}
                                        onClick={() => { setSelectedMadhhab(madhhab); setVideosOnly(false); }}
                                        className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                            isSelected
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-300'
                                        }`}
                                    >
                                        <span>{madhhab}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 font-mono font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}

                            {/* Videos Only Filter Button */}
                            <button
                                onClick={() => setVideosOnly(!videosOnly)}
                                className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                    videosOnly
                                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                                        : 'bg-white text-rose-700 hover:bg-rose-50 border-rose-300'
                                }`}
                                title="Show rulings that have published video explanations"
                            >
                                <span>▶ With Video</span>
                                <span className={`text-[10px] px-1.5 py-0.5 font-mono font-bold ${videosOnly ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                                    {totalVideosCount}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin h-10 w-10 border-2 border-slate-900 border-t-transparent"></div>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-slate-200 bg-slate-50/50">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">menu_book</span>
                        <h3 className="text-base font-bold text-slate-900 mb-1">No Mas'alas Found</h3>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                            {videosOnly
                                ? 'No rulings currently have video explanations under this selection.'
                                : selectedMadhhab !== 'All' 
                                    ? `There are currently no published rulings under the ${selectedMadhhab} Madhhab matching your search.` 
                                    : 'No published rulings match your query.'}
                        </p>
                        {(selectedMadhhab !== 'All' || searchTerm || videosOnly) && (
                            <button
                                onClick={() => { setSelectedMadhhab('All'); setVideosOnly(false); setSearchTerm(''); }}
                                className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                Show All Mas'alas
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredQuestions.map((q) => (
                            <div
                                key={q._id}
                                className="flex flex-col border border-slate-200 bg-white hover:border-slate-400 transition-all shadow-2xs hover:shadow-sm"
                            >
                                <div className="p-5 sm:p-6 flex flex-col h-full">
                                    {/* Card Header Tags */}
                                    <div className="flex items-center justify-between gap-x-2 mb-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="inline-block border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-800">
                                                {q.madhhab}
                                            </span>
                                            {q.hasVideo && (
                                                <span className="inline-flex items-center gap-1 border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                                                    <span>▶</span> Video
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                            {new Date(q.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Question Text */}
                                    <h3
                                        className="text-base sm:text-lg font-bold mb-3 line-clamp-3 break-words font-rahna22 text-slate-900 leading-snug"
                                        title={q.questionText}
                                    >
                                        {q.questionText}
                                    </h3>

                                    {/* Answer Snippet Section */}
                                    <div className="mt-auto pt-3 border-t border-slate-100">
                                        <div className="border-l-2 border-primary/40 bg-slate-50/70 pl-3 py-2 my-2">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                Official Ruling Excerpt
                                            </div>
                                            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 line-clamp-3 break-words font-rahna22">
                                                {q.answerText}
                                            </p>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-200">
                                            <Link
                                                to={`/masala/${q._id}`}
                                                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-slate-900 hover:text-primary transition-colors"
                                            >
                                                Read Mas'ala <span>&rarr;</span>
                                            </Link>

                                            {q.hasVideo && (
                                                <button
                                                    onClick={() => setActiveVideoModal(q)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-all cursor-pointer active:scale-95"
                                                    title="Watch video explanation"
                                                >
                                                    <span>▶</span> Watch
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {limit && filteredQuestions.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link
                            to="/masalas"
                            className="inline-flex items-center justify-center border-2 border-slate-900 bg-white px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white shadow-2xs transition-all active:scale-98"
                        >
                            Browse Complete Archive &rarr;
                        </Link>
                    </div>
                )}
            </div>

            {/* Video Lightbox Modal */}
            {activeVideoModal && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[120] flex items-center justify-center p-4 animate-in fade-in duration-150"
                    onClick={() => setActiveVideoModal(null)}
                >
                    <div
                        className="bg-white border border-slate-300 w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="size-7 bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                                    ▶
                                </span>
                                <div>
                                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900 line-clamp-1">
                                        Video Explanation / വീഡിയോ വിവരണം
                                    </h3>
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                                        {activeVideoModal.madhhab} Fiqh
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveVideoModal(null)}
                                className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            <p className="text-xs sm:text-sm font-medium italic text-slate-800 font-rahna22 bg-slate-50 p-3 border-l-2 border-slate-400">
                                "{activeVideoModal.questionText}"
                            </p>

                            <VideoPlayer
                                videoUrl={activeVideoModal.videoUrl}
                                title={`Video Explanation: ${activeVideoModal.questionText}`}
                            />

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                                <span className="text-[11px] font-mono text-slate-500">
                                    Published: {new Date(activeVideoModal.createdAt).toLocaleDateString()}
                                </span>
                                <Link
                                    to={`/masala/${activeVideoModal._id}`}
                                    onClick={() => setActiveVideoModal(null)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-primary transition-all"
                                >
                                    <span>Read Complete Mas'ala Details</span>
                                    <span>&rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default QAFeed;
