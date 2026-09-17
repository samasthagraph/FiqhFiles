import { useState } from 'react';
import axios from 'axios';
import { useForm as useHookForm } from 'react-hook-form';
import { API_BASE_URL } from '../config';

const QuestionForm = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useHookForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/questions`, data);
            setIsSuccess(true);
            reset();
            setTimeout(() => setIsSuccess(false), 5000);
        } catch (error) {
            console.error("Error submitting question:", error);
            alert('Failed to submit question. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 bg-white dark:bg-slate-900/50" id="ask">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Submit Your Question</h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">Your privacy is our priority. Personal details are never published.</p>
                </div>

                {isSuccess ? (
                    <div className="bg-background-light dark:bg-background-dark p-8 rounded-2xl border border-primary/10 shadow-xl shadow-primary/5 text-center">
                        <span className="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Jazakallah Khair!</h3>
                        <p className="text-slate-600 dark:text-slate-400">Your inquiry has been submitted successfully.</p>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="mt-6 px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold transition-all"
                        >
                            Submit Another Inquiry
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-primary/10 shadow-xl shadow-primary/5">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2" htmlFor="name">
                                    Full Name
                                </label>
                                <div>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-800/50 outline-none transition-all text-sm shadow-sm"
                                        id="name"
                                        placeholder="Abdullah Rahman"
                                        type="text"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2" htmlFor="phone">
                                    Phone Number
                                </label>
                                <div>
                                    <input
                                        {...register("phone", {
                                            required: "Phone number is required",
                                            pattern: { value: /^[0-9+\-\s()]+$/, message: "Invalid phone number" }
                                        })}
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-800/50 outline-none transition-all text-sm shadow-sm"
                                        id="phone"
                                        placeholder="+1 (555) 000-0000"
                                        type="tel"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2" htmlFor="madhhab">
                                School of Thought (Madhhab)
                            </label>
                            <div>
                                <select
                                    {...register("madhhab", { required: "Please select a Madhhab" })}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3.5 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-800/50 outline-none transition-all text-sm shadow-sm cursor-pointer"
                                    id="madhhab"
                                >
                                    <option value="">Select your Madhhab</option>
                                    <option value="Shafi'i">Shafi'i</option>
                                    <option value="Hanafi">Hanafi</option>
                                    <option value="Maliki">Maliki</option>
                                    <option value="Hanbali">Hanbali</option>
                                    <option value="General / No Preference">General / No Preference</option>
                                </select>
                                {errors.madhhab && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.madhhab.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2" htmlFor="questionText">
                                Your Question
                            </label>
                            <div>
                                <textarea
                                    {...register("questionText", { required: "Question is required", minLength: { value: 20, message: "Please provide more details" } })}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-800/50 outline-none transition-all text-sm shadow-sm leading-relaxed resize-y font-rahna22"
                                    id="questionText"
                                    placeholder="Type your detailed inquiry here..."
                                    rows="4"
                                ></textarea>
                                {errors.questionText && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.questionText.message}</p>}
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-primary py-4 text-base font-bold text-white shadow-xl shadow-primary/25 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer"
                            type="submit"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default QuestionForm;
