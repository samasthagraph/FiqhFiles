import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa';

const FatwaDetail = () => {
    const { id } = useParams();
    const [fatwa, setFatwa] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchFatwa = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/questions/public/${id}`);
            setFatwa(response.data);
        } catch (error) {
            console.error("Error fetching fatwa details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFatwa();
    }, [id]);

    const onCommentSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await axios.post(`http://localhost:5001/api/questions/${id}/comments`, data);
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
                    <h2 className="text-3xl font-bold text-secondary mb-2">Fatwa Not Found</h2>
                    <p className="text-slate-500 mb-6">The ruling you are looking for does not exist or has not been answered yet.</p>
                    <Link to="/fatwas" className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
                        Browse All Fatwas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Back Link */}
                    <Link to="/fatwas" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-medium">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to all Fatwas
                    </Link>

                    {/* Fatwa Content */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 overflow-hidden mb-12 border border-primary/10">
                        {/* Header details */}
                        <div className="bg-background-light border-b border-primary/10 px-8 py-6 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center rounded-md bg-primary/20 px-3 py-1 text-sm font-bold text-primary uppercase">
                                    {fatwa.madhhab} Fiqh
                                </span>
                            </div>
                            <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                Published {new Date(fatwa.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
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
                                <div className="text-xl sm:text-2xl md:text-[1.65rem] text-slate-800 dark:text-slate-200 leading-relaxed sm:leading-loose whitespace-pre-wrap break-words font-rahna22 font-medium">
                                    {fatwa.answerText}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-primary/10">
                        <h3 className="text-2xl font-bold text-slate-900 mb-8">Discussion ({fatwa.comments?.length || 0})</h3>

                        {/* Add Comment Form */}
                        <form onSubmit={handleSubmit(onCommentSubmit)} className="mb-10 bg-slate-50/70 dark:bg-slate-800/40 p-6 sm:p-8 rounded-2xl border border-primary/10">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Leave a comment</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="sr-only">Name</label>
                                    <input
                                        type="text"
                                        {...register('name', { required: 'Name is required' })}
                                        placeholder="Your Name"
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900 transition-all text-sm outline-none shadow-sm"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="sr-only">Comment</label>
                                    <textarea
                                        rows="3"
                                        {...register('text', { required: 'Comment cannot be empty' })}
                                        placeholder="Share your respectful thoughts or clarifications..."
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900 transition-all text-sm outline-none shadow-sm resize-y leading-relaxed font-rahna22"
                                    ></textarea>
                                    {errors.text && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.text.message}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>

                        {/* Existing Comments list */}
                        <div className="space-y-6">
                            {(!fatwa.comments || fatwa.comments.length === 0) ? (
                                <p className="text-slate-500 text-center py-8">No comments yet. Be the first to share your thoughts.</p>
                            ) : (
                                fatwa.comments.map((comment, index) => (
                                    <div key={index} className="flex gap-4 p-4 rounded-xl hover:bg-background-light transition-colors border border-transparent hover:border-primary/5">
                                        <div className="flex-shrink-0 mt-1">
                                            <span className="material-symbols-outlined text-3xl text-slate-300">account_circle</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h5 className="font-bold text-slate-800">{comment.name}</h5>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-rahna22">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default FatwaDetail;
