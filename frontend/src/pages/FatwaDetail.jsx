import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '../config';
import { clientCache } from '../utils/clientCache';
import { exportSingleQuestionToDoc } from '../utils/docxExport';
import VideoPlayer from '../components/VideoPlayer';

const FatwaDetail = () => {
    const { id } = useParams();
    const cachedItem = clientCache.get(`masala_detail_${id}`) || clientCache.findQuestion(id);

    const [fatwa, setFatwa] = useState(cachedItem || null);
    const [isLoading, setIsLoading] = useState(!cachedItem);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchFatwa = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/questions/public/${id}`);
            setFatwa(response.data);
            clientCache.set(`masala_detail_${id}`, response.data);
        } catch (error) {
            console.error("Error fetching fatwa details:", error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFatwa();
    }, [fetchFatwa]);

    const onCommentSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/questions/${id}/comments`, data);
            reset();
            fetchFatwa(); // Refresh comments
        } catch (error) {
            console.error("Error submitting comment:", error);
            alert("Failed to submit comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex justify-center items-center">
                    <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (!fatwa) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex flex-col justify-center items-center text-center p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Mas'ala Not Found</h2>
                    <p className="text-slate-500 mb-6 text-sm">The ruling you are looking for does not exist or has not been answered yet.</p>
                    <Link to="/masalas" className="bg-primary text-white px-6 py-2.5 font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors">
                        Browse All Mas'alas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Back Link */}
                    <Link to="/masalas" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors mb-6">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to all Mas'alas
                    </Link>

                    {/* Main Mas'ala Container (Clean, Non-Rounded, Professional) */}
                    <article className="bg-white border border-slate-300 shadow-sm mb-10">
                        {/* Header details bar */}
                        <div className="bg-slate-100/80 border-b border-slate-300 px-6 py-3.5 flex flex-wrap justify-between items-center gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center bg-slate-200 text-slate-800 px-2.5 py-1 text-xs font-bold uppercase tracking-wider border border-slate-300">
                                    {fatwa.madhhab} Fiqh
                                </span>
                                {fatwa.hasVideo && (
                                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 text-xs font-bold uppercase tracking-wider border border-rose-200">
                                        <span>▶</span> Video Available
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-slate-500 text-xs font-medium">
                                    Published {new Date(fatwa.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => exportSingleQuestionToDoc(fatwa)}
                                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    title="Download this Mas'ala as a Word Doc file"
                                >
                                    <span className="material-symbols-outlined text-sm">description</span>
                                    Download Doc
                                </button>
                            </div>
                        </div>

                        {/* Content Body: strictly ordered as Question -> Video -> Answer */}
                        <div className="p-6 md:p-8 space-y-6">

                            {/* 1. THE QUESTION */}
                            <div className="space-y-2">
                                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    The Question / ചോദ്യം
                                </h2>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug break-words font-rahna22">
                                    "{fatwa.questionText}"
                                </h1>
                            </div>

                            {/* 2. THE VIDEO (directly embedded without redundant headings/descriptions) */}
                            {fatwa.hasVideo && fatwa.videoUrl && (
                                <div className="pt-2 pb-2">
                                    <VideoPlayer videoUrl={fatwa.videoUrl} title={fatwa.questionText} />
                                </div>
                            )}

                            {/* Thin Divider */}
                            <hr className="border-slate-200 my-4" />

                            {/* 3. THE ANSWER (Compact, Professional Font & Alignment) */}
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-primary text-base">verified</span>
                                    <h2 className="text-xs font-black text-primary uppercase tracking-widest">
                                        The Answer / മറുപടി
                                    </h2>
                                </div>
                                <div className="text-sm sm:text-base text-slate-800 leading-relaxed sm:leading-7 whitespace-pre-wrap break-words font-rahna22 text-left">
                                    {fatwa.answerText}
                                </div>
                            </div>

                        </div>
                    </article>

                    {/* Discussion & Comments Section (Clean, Non-Rounded) */}
                    <div className="bg-white border border-slate-300 p-6 md:p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Discussion & Comments ({fatwa.comments?.length || 0})</h3>

                        {/* Add Comment Form */}
                        <form onSubmit={handleSubmit(onCommentSubmit)} className="mb-8 bg-slate-50 p-5 sm:p-6 border border-slate-200">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Leave a reflection</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="sr-only">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        {...register("name", { required: true })}
                                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:outline-none focus:border-primary bg-white text-sm"
                                    />
                                    {errors.name && <span className="text-red-500 text-xs mt-1 block">Name is required</span>}
                                </div>
                                <div>
                                    <label className="sr-only">Comment</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Add your respectful reflection..."
                                        {...register("text", { required: true })}
                                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:outline-none focus:border-primary bg-white font-rahna22 text-sm"
                                    ></textarea>
                                    {errors.text && <span className="text-red-500 text-xs mt-1 block">Comment is required</span>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-slate-900 hover:bg-primary text-white px-5 py-2 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Reflection'}
                                </button>
                            </div>
                        </form>

                        {/* Existing Comments */}
                        {fatwa.comments && fatwa.comments.length > 0 ? (
                            <div className="space-y-4">
                                {fatwa.comments.map((comment, index) => (
                                    <div key={index} className="flex gap-3.5 p-3.5 bg-slate-50 border border-slate-200">
                                        <div className="size-8 bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                            {comment.name ? comment.name.slice(0, 2).toUpperCase() : '??'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-bold text-xs text-slate-900">{comment.name}</h5>
                                                <span className="text-slate-400 text-[10px]">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-rahna22">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-xs italic text-center py-4">No comments yet.</p>
                        )}
                    </div>

                </div>
            </main>

            {/* Executive Footer */}
            <footer className="bg-slate-900 py-10 text-white border-t border-slate-800 mt-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Fiqh File Logo" className="h-9 w-auto object-contain brightness-0 invert" />
                            <div>
                                <span className="block text-sm font-black tracking-wider uppercase text-white">
                                    Fiqh Files Archive
                                </span>
                                <span className="block text-[10px] text-slate-400 tracking-wider uppercase">
                                    Samastha Graph Initiative
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                            © {new Date().getFullYear()} Fiqh Files • Samastha Graph. All rulings authenticated by qualified scholars.
                        </p>
                        <div className="flex gap-5 text-xs">
                            <Link to="/masalas" className="text-slate-400 hover:text-white transition-colors">Archive</Link>
                            <Link to="/ask" className="text-slate-400 hover:text-white transition-colors">Ask Question</Link>
                            <Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors">Portal</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FatwaDetail;
