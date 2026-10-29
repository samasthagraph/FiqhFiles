import { useState } from 'react';
import axios from 'axios';
import { useForm as useHookForm } from 'react-hook-form';
import { API_BASE_URL } from '../config';

const MAX_QUESTION_CHARS = 500;

const QuestionForm = () => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useHookForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const questionTextValue = watch("questionText") || "";
    const charCount = questionTextValue.length;

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
        <section className="py-12 sm:py-20 bg-white" id="ask">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 font-fn-kanaka-semibold">
                        ചോദ്യങ്ങൾ സമർപ്പിക്കുക
                    </h2>
                    <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-600 font-rahna22">
                        നിങ്ങളുടെ ചോദ്യങ്ങൾ പണ്ഡിതന്മാർ പരിശോധിച്ച് മറുപടി നൽകുന്നതാണ്. വിവരങ്ങൾ തികച്ചും സ്വകാര്യമായിരിക്കും.
                    </p>
                </div>

                {isSuccess ? (
                    <div className="bg-background-light p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-primary/10 shadow-xl shadow-primary/5 text-center">
                        <span className="material-symbols-outlined text-5xl sm:text-6xl text-emerald-600 mb-3 sm:mb-4">check_circle</span>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">ജസാക്കല്ലാഹു ഖൈർ!</h3>
                        <p className="text-sm sm:text-base text-slate-600 font-rahna22">നിങ്ങളുടെ ചോദ്യം വിജയകരമായി സമർപ്പിച്ചു.</p>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="mt-6 px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                        >
                            മറ്റൊരു ചോദ്യം ചോദിക്കുക
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6 bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-primary/10 shadow-xl shadow-primary/5">
                        <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 sm:mb-2" htmlFor="name">
                                    പേര് (Name) <span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        {...register("name", { required: "പേര് നൽകുക (Name is required)" })}
                                        className="block w-full rounded-xl border border-slate-200 px-4 py-3 sm:py-3.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 outline-none transition-all shadow-sm"
                                        id="name"
                                        placeholder="നിങ്ങളുടെ പേര്"
                                        type="text"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 sm:mb-2" htmlFor="phone">
                                    ഫോൺ നമ്പർ (Phone) <span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        {...register("phone", {
                                            required: "ഫോൺ നമ്പർ നൽകുക (Phone number is required)",
                                            pattern: { value: /^[0-9+\-\s()]+$/, message: "ശരിയായ ഫോൺ നമ്പർ നൽകുക" }
                                        })}
                                        className="block w-full rounded-xl border border-slate-200 px-4 py-3 sm:py-3.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 outline-none transition-all shadow-sm"
                                        id="phone"
                                        placeholder="+91 00000 00000"
                                        type="tel"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 sm:mb-2" htmlFor="madhhab">
                                മദ്ഹബ് (School of Thought) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    {...register("madhhab", { required: "മദ്ഹബ് തിരഞ്ഞെടുക്കുക" })}
                                    className="block w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 sm:py-3.5 pr-10 text-base sm:text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 outline-none transition-all shadow-sm cursor-pointer"
                                    id="madhhab"
                                >
                                    <option value="">മദ്ഹബ് തിരഞ്ഞെടുക്കുക</option>
                                    <option value="Shafi'i">Shafi'i (ശാഫിഈ)</option>
                                    <option value="Hanafi">Hanafi (ഹനഫി)</option>
                                    <option value="Maliki">Maliki (മാലികി)</option>
                                    <option value="Hanbali">Hanbali (ഹംബലി)</option>
                                    <option value="General / No Preference">General / പൊതുവായത്</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                    <span className="material-symbols-outlined text-lg">expand_more</span>
                                </div>
                                {errors.madhhab && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.madhhab.message}</p>}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <label className="block text-xs sm:text-sm font-bold text-slate-800" htmlFor="questionText">
                                    നിങ്ങളുടെ സംശയം / ചോദ്യം (Your Question) <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs font-semibold ${charCount > MAX_QUESTION_CHARS ? 'text-red-600 font-bold' : charCount > MAX_QUESTION_CHARS * 0.8 ? 'text-amber-600' : 'text-slate-400'}`}>
                                    {charCount} / {MAX_QUESTION_CHARS} അക്ഷരങ്ങൾ
                                </span>
                            </div>
                            <div>
                                <textarea
                                    {...register("questionText", {
                                        required: "ചോദ്യം വ്യക്തമായി രേഖപ്പെടുത്തുക",
                                        minLength: { value: 15, message: "ചോദ്യത്തിൽ കുറഞ്ഞത് 15 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം" },
                                        maxLength: { value: MAX_QUESTION_CHARS, message: `പരമാവധി ${MAX_QUESTION_CHARS} അക്ഷരങ്ങൾ മാത്രമേ അനുവദിക്കൂ` }
                                    })}
                                    maxLength={MAX_QUESTION_CHARS}
                                    className="block w-full rounded-xl border border-slate-200 p-3.5 sm:p-4 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 outline-none transition-all shadow-sm leading-relaxed resize-y font-rahna22 min-h-[120px] sm:min-h-[140px]"
                                    id="questionText"
                                    placeholder="നിങ്ങളുടെ സംശയം വിശദമായി ഇവിടെ ടൈപ്പ് ചെയ്യുക (പരമാവധി 500 അക്ഷരങ്ങൾ)..."
                                    rows="4"
                                ></textarea>
                                <div className="flex items-center justify-between mt-1.5">
                                    {errors.questionText ? (
                                        <p className="text-red-500 text-xs font-medium">{errors.questionText.message}</p>
                                    ) : (
                                        <p className="text-[11px] sm:text-xs text-slate-400 font-rahna22">
                                            പരമാവധി {MAX_QUESTION_CHARS} അക്ഷരങ്ങൾക്കുള്ളിൽ സംശയം വ്യക്തമായി ചുരുക്കി എഴുതുക.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-primary py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-primary/25 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer mt-2"
                            type="submit"
                        >
                            {isSubmitting ? 'സമർപ്പിക്കുന്നു...' : 'ചോദ്യം സമർപ്പിക്കുക (Submit Question)'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default QuestionForm;
