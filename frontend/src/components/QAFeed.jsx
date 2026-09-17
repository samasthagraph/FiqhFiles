import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { API_BASE_URL } from '../config';

const MADHHABS = ["All", "Shafi'i", "Hanafi", "Maliki", "Hanbali", "General / No Preference"];

const QAFeed = ({ limit }) => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMadhhab, setSelectedMadhhab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const url = limit ? `${API_BASE_URL}/questions/public?limit=${limit}` : `${API_BASE_URL}/questions/public`;
                const response = await axios.get(url);
                setQuestions(response.data);
            } catch (error) {
                console.error("Error fetching public questions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [limit]);

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

    // Filter questions by Madhhab and search query
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesMadhhab = selectedMadhhab === 'All' || q.madhhab === selectedMadhhab;
            const matchesSearch = !searchTerm || 
                q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (q.answerText && q.answerText.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesMadhhab && matchesSearch;
        });
    }, [questions, selectedMadhhab, searchTerm]);

    return (
        <section className="py-12 sm:py-16 bg-white" id="feed">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header & Filter Controls */}
                <div className="flex flex-col gap-6 mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900">
                                {limit ? 'Latest Answers' : 'Browse by School of Thought'}
                            </h2>
                            <p className="mt-1 text-sm sm:text-base text-slate-600">
                                Verified rulings and fatwas from qualified scholars.
                            </p>
                        </div>

                        {/* Search Input for archive view */}
                        {!limit && (
                            <div className="relative w-full sm:w-72">
                                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search rulings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Madhhab Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400 mr-1 shrink-0">
                            <FiFilter /> Filter:
                        </div>
                        {MADHHABS.map((madhhab) => {
                            const isSelected = selectedMadhhab === madhhab;
                            const count = countsByMadhhab[madhhab] || 0;
                            return (
                                <button
                                    key={madhhab}
                                    onClick={() => setSelectedMadhhab(madhhab)}
                                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                                    }`}
                                >
                                    <span>{madhhab}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">menu_book</span>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">No fatwas found</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                            {selectedMadhhab !== 'All' 
                                ? `There are currently no published rulings under the ${selectedMadhhab} Madhhab matching your search.` 
                                : 'No published rulings match your query.'}
                        </p>
                        {(selectedMadhhab !== 'All' || searchTerm) && (
                            <button
                                onClick={() => { setSelectedMadhhab('All'); setSearchTerm(''); }}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                            >
                                Show All Madhhabs
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredQuestions.map((q) => (
                            <div key={q._id} className="flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="p-6 flex flex-col h-full">
                                    <div className="flex items-center justify-between gap-x-2 mb-4">
                                        <span className="inline-flex items-center rounded-lg bg-secondary/15 px-2.5 py-1 text-xs font-black text-primary uppercase tracking-tight">
                                            {q.madhhab}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400">
                                            {new Date(q.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-3 line-clamp-3 break-words font-rahna22 text-slate-900 leading-snug" title={q.questionText}>
                                        {q.questionText}
                                    </h3>
                                    <div className="border-t border-primary/10 pt-4 mt-auto">
                                        <div className="flex items-center gap-1.5 mb-2.5">
                                            <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Official Ruling</span>
                                        </div>
                                        <p className="text-sm sm:text-base leading-relaxed text-slate-600 line-clamp-3 break-words font-rahna22 mb-4">
                                            {q.answerText}
                                        </p>
                                        <Link to={`/fatwa/${q._id}`} className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:text-secondary transition-colors">
                                            Read Full Fatwa <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {limit && filteredQuestions.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link to="/fatwas" className="inline-flex items-center justify-center rounded-xl border-2 border-primary/20 bg-white px-8 py-3.5 text-sm font-bold text-primary hover:bg-primary hover:text-white shadow-sm transition-all hover:scale-105 active:scale-95">
                            Browse All in Archive →
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default QAFeed;
