import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLogOut, FiTrash2, FiSearch, FiExternalLink, FiPlus, FiFilter, FiMessageSquare, FiMenu, FiX } from 'react-icons/fi';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [isAnswering, setIsAnswering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showNewModal, setShowNewModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [newQuestionData, setNewQuestionData] = useState({
        name: '', phone: '', questionText: '', madhhab: 'General / No Preference', answerText: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchQuestions(token);
    }, [navigate]);

    const fetchQuestions = async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/questions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleAnswerSubmit = async () => {
        if (!answerText.trim()) return;
        setIsAnswering(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_BASE_URL}/admin/questions/${selectedQuestion._id}`,
                { answerText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQuestions(questions.map(q => q._id === selectedQuestion._id ? { ...q, status: 'Answered', answerText } : q));
            setSelectedQuestion(null);
            setAnswerText('');
        } catch (error) {
            console.error('Error submitting answer:', error);
        } finally {
            setIsAnswering(false);
        }
    };

    const toggleUrgency = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(`${API_BASE_URL}/admin/questions/${id}/urgent`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(questions.map(q => q._id === id ? { ...q, isUrgent: res.data.isUrgent } : q));
        } catch (error) {
            console.error('Error toggling urgency:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_BASE_URL}/admin/questions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(questions.filter(q => q._id !== id));
            if (selectedQuestion?._id === id) setSelectedQuestion(null);
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.post(`${API_BASE_URL}/admin/questions`, newQuestionData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions([res.data, ...questions]);
            setShowNewModal(false);
            setNewQuestionData({ name: '', phone: '', questionText: '', madhhab: 'General / No Preference', answerText: '' });
        } catch (error) {
            console.error('Error creating question:', error);
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.phone.includes(searchTerm)
    );

    const allComments = questions.flatMap(q =>
        (q.comments || []).map(c => ({ ...c, questionId: q._id, questionText: q.questionText }))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalQuestions = questions.length;
    const pendingQuestions = questions.filter(q => q.status === 'Pending').length;
    const answeredQuestions = questions.filter(q => q.status === 'Answered').length;
    const totalCommentsCount = allComments.length;

    const madhhabStats = questions.reduce((acc, q) => {
        acc[q.madhhab] = (acc[q.madhhab] || 0) + 1;
        return acc;
    }, {});

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const SidebarLink = ({ id, icon, label }) => (
        <button
            onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );

    if (selectedQuestion) {
        return (
            <div className="font-display bg-background-light text-slate-900 min-h-screen">
                <div className="relative flex h-auto min-h-screen w-full flex-col">
                    <header className="flex items-center justify-between border-b border-primary/10 bg-white px-4 md:px-20 py-3 sticky top-0 z-50">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Fiqh File" className="h-8 w-auto object-contain" />
                            <h2 className="text-base md:text-lg font-black text-primary">Fiqh Files Admin Panel</h2>
                        </div>
                        <button onClick={() => setSelectedQuestion(null)} className="text-slate-500 hover:text-slate-800 font-bold px-3 py-1 bg-slate-100 rounded-lg text-sm">Close</button>
                    </header>
                    <main className="flex-1 flex justify-center py-6 md:py-8 px-4">
                        <div className="max-w-[800px] flex-1 space-y-8">
                            <h1 className="text-2xl md:text-3xl font-extrabold">Finalizing Response</h1>
                            <div className="rounded-xl border border-primary/10 bg-white p-4 md:p-6 shadow-sm overflow-hidden">
                                <h2 className="text-lg md:text-xl font-bold mb-4">The Question</h2>
                                <p className="italic border-l-4 border-primary pl-4 md:text-lg break-words leading-relaxed font-rahna22">"{selectedQuestion.questionText}"</p>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-sm font-black uppercase tracking-widest text-primary">Response Content</h2>
                                <textarea
                                    className="w-full h-80 p-4 md:p-6 rounded-xl border border-primary/10 bg-white outline-none focus:ring-2 focus:ring-primary/20 text-base md:text-lg leading-relaxed shadow-inner break-words resize-y font-rahna22"
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    placeholder="Begin writing the formal mas'ala response..."
                                />
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
                                    <button onClick={() => toggleUrgency(selectedQuestion._id)} className={`flex items-center gap-2 text-sm font-bold ${selectedQuestion.isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
                                        <span className="material-symbols-outlined">{selectedQuestion.isUrgent ? 'priority_high' : 'notification_important'}</span>
                                        {selectedQuestion.isUrgent ? 'Urgent Priority' : 'Mark as Urgent'}
                                    </button>
                                    <button
                                        onClick={handleAnswerSubmit}
                                        disabled={isAnswering || !answerText.trim()}
                                        className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all"
                                    >
                                        {isAnswering ? 'Publishing...' : 'Publish Official Mas\'ala'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background-light text-slate-900 font-display">
            {/* Sidebar Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 flex flex-col`}>
                <div className="p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Fiqh File Logo" className="h-9 w-auto object-contain" />
                        <h2 className="text-xl font-black tracking-tight text-primary"></h2>
                    </div>
                    <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}><FiX size={24} /></button>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    <SidebarLink id="dashboard" icon="dashboard" label="Dashboard" />
                    <SidebarLink id="questions" icon="chat_bubble" label="Questions" />
                    <SidebarLink id="comments" icon="comment" label="Comments" />
                    <SidebarLink id="scholars" icon="person" label="Scholars" />
                    <SidebarLink id="settings" icon="settings" label="Settings" />
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">account_circle</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold truncate w-24">Super Admin</p>
                            <button onClick={handleLogout} className="text-[10px] uppercase font-black text-red-500 hover:tracking-widest transition-all">Logout</button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Sidebar Backdrop Mobile */}
            {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <button className="md:hidden p-2 text-slate-500 hover:text-primary" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
                        <div className="relative w-full max-w-md hidden md:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input
                                className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Search queries..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <h2 className="md:hidden font-bold text-primary">Fiqh Files Admin</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live</span>
                        </div>
                        <div className="size-8 rounded-full bg-primary/10 flex md:hidden items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-sm">person</span>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {/* View: Dashboard Overview */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Site Overview</h1>
                                <p className="text-slate-500 text-sm md:text-lg">Overall platform performance metrics.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-4 mb-2 md:mb-4">
                                        <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><FiSearch /></div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Queries</p>
                                    </div>
                                    <p className="text-2xl md:text-4xl font-black">{totalQuestions}</p>
                                </div>
                                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-4 mb-2 md:mb-4">
                                        <div className="size-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600"><span className="material-symbols-outlined text-lg">pending</span></div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Pending</p>
                                    </div>
                                    <p className="text-2xl md:text-4xl font-black">{pendingQuestions}</p>
                                </div>
                                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-4 mb-2 md:mb-4">
                                        <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><span className="material-symbols-outlined text-lg">check_circle</span></div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Answered</p>
                                    </div>
                                    <p className="text-2xl md:text-4xl font-black">{answeredQuestions}</p>
                                </div>
                                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-4 mb-2 md:mb-4">
                                        <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><FiMessageSquare /></div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Comments</p>
                                    </div>
                                    <p className="text-2xl md:text-4xl font-black">{totalCommentsCount}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl">
                                    <h3 className="text-lg md:text-xl font-bold mb-6">Distribution by Madhhab</h3>
                                    <div className="space-y-4">
                                        {Object.entries(madhhabStats).map(([key, value]) => (
                                            <div key={key}>
                                                <div className="flex justify-between text-[11px] md:text-sm font-bold mb-2">
                                                    <span>{key}</span>
                                                    <span>{value} ({Math.round((value / totalQuestions) * 100)}%)</span>
                                                </div>
                                                <div className="w-full h-2 md:h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${(value / totalQuestions) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                    <h3 className="text-lg md:text-xl font-bold mb-6">Latest Questions</h3>
                                    <div className="space-y-4">
                                        {questions.slice(0, 5).map(q => (
                                            <div key={q._id} className="flex items-center gap-3 md:gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer" onClick={() => setSelectedQuestion(q)}>
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">{getInitials(q.name)}</div>
                                                <div className="flex-1">
                                                    <p className="text-xs md:text-sm font-bold line-clamp-1">{q.questionText}</p>
                                                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase font-bold">{new Date(q.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${q.status === 'Answered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{q.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Questions */}
                    {activeTab === 'questions' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black">Questions</h1>
                                    <p className="text-slate-500 text-sm">Reviewing mas'ala requests.</p>
                                </div>
                                <button onClick={() => setShowNewModal(true)} className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all outline-none"><FiPlus /> New Record</button>
                            </div>

                            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[700px] md:min-w-full">
                                        <thead className="bg-slate-50/50 border-b border-slate-200">
                                            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                <th className="px-6 md:px-8 py-4 md:py-5">Profile</th>
                                                <th className="px-6 md:px-8 py-4 md:py-5">Content</th>
                                                <th className="px-6 md:px-8 py-4 md:py-5">Madhhab</th>
                                                <th className="px-6 md:px-8 py-4 md:py-5">Status</th>
                                                <th className="px-6 md:px-8 py-4 md:py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {isLoading ? (
                                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold animate-pulse">Fetching Data...</td></tr>
                                            ) : filteredQuestions.map(q => (
                                                <tr key={q._id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 md:px-8 py-4 md:py-5">
                                                        <div className="flex items-center gap-3 md:gap-4">
                                                            <div className="size-8 md:size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-[10px] md:text-xs font-black uppercase shadow-sm">{getInitials(q.name)}</div>
                                                            <div><p className="text-xs md:text-sm font-black text-slate-900 line-clamp-1">{q.name}</p><p className="text-[9px] md:text-[10px] font-bold text-slate-400">{q.phone}</p></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-4 md:py-5 max-w-[200px] md:max-w-xs"><p className="text-xs md:text-sm font-medium line-clamp-2 leading-relaxed text-slate-600 font-rahna22">"{q.questionText}"</p></td>
                                                    <td className="px-6 md:px-8 py-4 md:py-5"><span className="text-[9px] md:text-[10px] font-black bg-slate-100 px-2 md:px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{q.madhhab}</span></td>
                                                    <td className="px-6 md:px-8 py-4 md:py-5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] md:text-[10px] font-black uppercase px-2 md:px-3 py-1 rounded-full ${q.status === 'Answered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {q.status}
                                                            </span>
                                                            {q.isUrgent && <div className="size-2 bg-red-500 rounded-full animate-ping"></div>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-4 md:py-5 text-right">
                                                        <div className="flex justify-end gap-2 md:gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => navigate(`/fatwa/${q._id}`)} className="p-1.5 md:p-2 text-slate-400 hover:text-primary transition-colors bg-white border border-slate-100 rounded-lg shadow-sm"><FiExternalLink size={14} /></button>
                                                            <button onClick={() => { setSelectedQuestion(q); setAnswerText(q.answerText || ''); }} className="bg-slate-900 text-white text-[9px] md:text-[10px] px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md">Manage</button>
                                                            <button onClick={() => handleDelete(q._id)} className="p-1.5 md:p-2 text-slate-300 hover:text-red-500 transition-colors bg-white border border-slate-100 rounded-lg shadow-sm"><FiTrash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Comments */}
                    {activeTab === 'comments' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-black">Community Comments</h1>
                                <p className="text-slate-500 text-sm">Feedback on your mas'ala responses.</p>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                {allComments.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                                        <span className="material-symbols-outlined text-6xl text-slate-200">chat_bubble</span>
                                        <p className="text-slate-400 font-bold mt-4">No comments received yet.</p>
                                    </div>
                                ) : (
                                    allComments.map((comment, idx) => (
                                        <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 md:gap-6 items-start hover:shadow-lg transition-all group">
                                            <div className="size-10 md:size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><FiMessageSquare /></div>
                                            <div className="flex-1 w-full">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-black text-slate-900 text-sm md:text-base">{comment.name}</h4>
                                                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm md:text-base text-slate-600 mb-4 leading-relaxed font-rahna22">"{comment.text}"</p>
                                                <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-between">
                                                    <p className="text-[10px] md:text-[11px] font-bold text-slate-500 truncate pr-4 font-rahna22">Topic: {comment.questionText}</p>
                                                    <button onClick={() => navigate(`/fatwa/${comment.questionId}`)} className="text-[10px] font-black text-primary hover:underline shrink-0">VIEW</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Placeholder Views */}
                    {activeTab === 'scholars' && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                            <span className="material-symbols-outlined text-6xl text-slate-200">groups</span>
                            <h2 className="text-2xl font-black mt-4">Scholars Panel</h2>
                            <p className="text-slate-400">Manage scholar accounts and access levels.</p>
                        </div>
                    )}
                </div>

                <footer className="mt-auto p-6 md:p-8 border-t border-slate-200 text-center text-slate-400 text-[10px] md:text-xs">
                    © {new Date().getFullYear()} Fiqh Files Admin Portal. All rights reserved.
                </footer>
            </main>

            {/* New Question Modal */}
            {showNewModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-lg shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6 md:mb-10">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">New Record</h2>
                            <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-900 text-2xl font-black">×</button>
                        </div>
                        <form onSubmit={handleCreateQuestion} className="space-y-4 md:space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Contact</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input required className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-sm outline-none transition-all" placeholder="Full Name" value={newQuestionData.name} onChange={(e) => setNewQuestionData({ ...newQuestionData, name: e.target.value })} />
                                    <input required className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-sm outline-none transition-all" placeholder="Phone" value={newQuestionData.phone} onChange={(e) => setNewQuestionData({ ...newQuestionData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Jurisprudence</label>
                                <select className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-sm outline-none appearance-none" value={newQuestionData.madhhab} onChange={(e) => setNewQuestionData({ ...newQuestionData, madhhab: e.target.value })}>
                                    <option>General / No Preference</option><option>Shafi'i</option><option>Hanafi</option><option>Maliki</option><option>Hanbali</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">The Request</label>
                                <textarea required rows="3" className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-sm outline-none resize-none" placeholder="Paste the question text here..." value={newQuestionData.questionText} onChange={(e) => setNewQuestionData({ ...newQuestionData, questionText: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all hover:scale-[1.02] active:scale-[0.98]">Save to Database</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
