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
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!fatwa) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
                    <h2 className="text-3xl font-bold text-secondary mb-2">Mas'ala Not Found</h2>
                    <p className="text-slate-500 mb-6">The ruling you are looking for does not exist or has not been answered yet.</p>
                    <Link to="/masalas" className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
                        Browse All Mas'alas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Back Link */}
                    <Link to="/masalas" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-medium">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to all Mas'alas
                    </Link>

                    {/* Fatwa Content */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 overflow-hidden mb-12 border border-primary/10">
                        {/* Header details */}
                        <div className="bg-background-light border-b border-primary/10 px-6 sm:px-8 py-5 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="inline-flex items-center rounded-md bg-primary/20 px-3 py-1 text-sm font-bold text-primary uppercase">
                                    {fatwa.madhhab} Fiqh
                                </span>
                                {fatwa.hasVideo && (
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 text-rose-700 px-3 py-1 text-xs font-black uppercase tracking-wider border border-rose-200">
                                        <span>▶</span> Video Available
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                    Published {new Date(fatwa.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => exportSingleQuestionToDoc(fatwa)}
                                    className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    title="Download this Mas'ala as a Word Doc file"
                                >
                                    <span className="material-symbols-outlined text-base">description</span>
                                    Download Doc
                                </button>
                            </div>
                        </div>

                        <div className="p-6 md:p-12 overflow-hidden">
                            {/* The Question */}
                            <div className="mb-8 md:mb-12 relative overflow-hidden">
                                <h2 className="text-xs sm:text-sm font-black text-secondary uppercase tracking-[0.2em] mb-4">The Question</h2>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-snug sm:leading-relaxed break-words font-rahna22">
                                    "{fatwa.questionText}"
                                </h1>
                            </div>

                            <hr className="border-primary/10 mb-10" />

                            {/* The Answer */}
                            <div className="relative overflow-hidden">
                                <div className="flex items-center gap-2.5 mb-6">
                                    <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                                    <h2 className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest">
                                        The Answer
                                    </h2>
                                </div>
                                <div className="text-xl sm:text-2xl md:text-[1.65rem] text-slate-800 leading-relaxed sm:leading-loose whitespace-pre-wrap break-words font-rahna22 font-medium">
                                    {fatwa.answerText}
                                </div>
                            </div>

                            {/* Published Video Explanation Section */}
                            {fatwa.hasVideo && (
                                <div className="mt-10 pt-8 border-t border-slate-200/80">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <span className="material-symbols-outlined text-rose-600 text-2xl">smart_display</span>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                                Published Video Explanation / വീഡിയോ വിവരണം
                                            </h3>
                                            <p className="text-xs text-slate-500">Official video presentation and explanation for this ruling.</p>
                                        </div>
                                    </div>
                                    <VideoPlayer videoUrl={fatwa.videoUrl} title={`Video Explanation: ${fatwa.questionText}`} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-primary/10">
                        <h3 className="text-2xl font-bold text-slate-900 mb-8">Discussion ({fatwa.comments?.length || 0})</h3>

                        {/* Add Comment Form */}
                        <form onSubmit={handleSubmit(onCommentSubmit)} className="mb-10 bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-primary/10">
                            <h4 className="font-bold text-slate-800 mb-4">Leave a comment</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="sr-only">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        {...register("name", { required: true })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                    />
                                    {errors.name && <span className="text-red-500 text-xs mt-1 block">Name is required</span>}
                                </div>
                                <div>
                                    <label className="sr-only">Comment</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Add your respectful reflection..."
                                        {...register("text", { required: true })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white font-rahna22"
                                    ></textarea>
                                    {errors.text && <span className="text-red-500 text-xs mt-1 block">Comment is required</span>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>

                        {/* Existing Comments */}
                        {fatwa.comments && fatwa.comments.length > 0 ? (
                            <div className="space-y-6">
                                {fatwa.comments.map((comment, index) => (
                                    <div key={index} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                            {comment.name ? comment.name.slice(0, 2).toUpperCase() : '??'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-bold text-sm text-slate-900">{comment.name}</h5>
                                                <span className="text-slate-400 text-xs">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed font-rahna22">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic text-center py-6">No comments yet. Be the first to reflect.</p>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default FatwaDetail;
