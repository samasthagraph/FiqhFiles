import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FiLogOut,
    FiTrash2,
    FiSearch,
    FiExternalLink,
    FiPlus,
    FiFilter,
    FiMessageSquare,
    FiMenu,
    FiX,
    FiDownload,
    FiVideo,
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight
} from 'react-icons/fi';
import { API_BASE_URL } from '../config';
import { exportSingleQuestionToDoc, exportQuestionsListToDoc } from '../utils/docxExport';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 500];

const AdminDashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [manageQuestionText, setManageQuestionText] = useState('');
    const [manageName, setManageName] = useState('');
    const [managePhone, setManagePhone] = useState('');
    const [manageMadhhab, setManageMadhhab] = useState('General / No Preference');
    const [manageStatus, setManageStatus] = useState('Pending');
    const [isSavingQuestionOnly, setIsSavingQuestionOnly] = useState(false);
    const [questionSaveSuccess, setQuestionSaveSuccess] = useState(false);
    const [manageHasVideo, setManageHasVideo] = useState(false);
    const [manageVideoUrl, setManageVideoUrl] = useState('');
    const [manageIsDownloaded, setManageIsDownloaded] = useState(false);
    const [isAnswering, setIsAnswering] = useState(false);

    // Filters and Search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMadhhab, setFilterMadhhab] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterVideo, setFilterVideo] = useState('All');
    const [filterDownloaded, setFilterDownloaded] = useState('All');

    // Multi-Selection State for bulk operations
    const [selectedIds, setSelectedIds] = useState([]);

    // Pagination
    const [rowsPerPage, setRowsPerPage] = useState(() => {
        const saved = localStorage.getItem('fiqh_rows_per_page');
        const parsed = parseInt(saved, 10);
        return PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : 20;
    });
    const [currentPage, setCurrentPage] = useState(1);

    // Navigation and Modals
    const [activeTab, setActiveTab] = useState('questions');
    const [showNewModal, setShowNewModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Quick Video Edit Modal
    const [videoModalQuestion, setVideoModalQuestion] = useState(null);
    const [videoModalHasVideo, setVideoModalHasVideo] = useState(false);
    const [videoModalUrl, setVideoModalUrl] = useState('');
    const [isSavingVideoModal, setIsSavingVideoModal] = useState(false);

    // New Question Data
    const [newQuestionData, setNewQuestionData] = useState({
        name: '',
        phone: '',
        questionText: '',
        madhhab: 'General / No Preference',
        answerText: '',
        hasVideo: false,
        videoUrl: ''
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

    // Reset pagination to page 1 whenever any filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterMadhhab, filterStatus, filterVideo, filterDownloaded, rowsPerPage]);

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

    // Open manage view and initialize state
    const openManageView = (q) => {
        setSelectedQuestion(q);
        setManageQuestionText(q.questionText || '');
        setManageName(q.name || '');
        setManagePhone(q.phone || '');
        setManageMadhhab(q.madhhab || 'General / No Preference');
        setManageStatus(q.status || 'Pending');
        setAnswerText(q.answerText || '');
        setManageHasVideo(Boolean(q.hasVideo));
        setManageVideoUrl(q.videoUrl || '');
        setManageIsDownloaded(Boolean(q.isDownloaded));
        setQuestionSaveSuccess(false);
    };

    // Save Question Details Only (allows editing question without submitting answer)
    const handleSaveQuestionOnly = async () => {
        if (!manageQuestionText.trim()) {
            alert('Question text cannot be empty.');
            return;
        }
        setIsSavingQuestionOnly(true);
        setQuestionSaveSuccess(false);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(
                `${API_BASE_URL}/admin/questions/${selectedQuestion._id}`,
                {
                    questionText: manageQuestionText.trim(),
                    name: manageName.trim() || selectedQuestion.name,
                    phone: managePhone.trim() || selectedQuestion.phone,
                    madhhab: manageMadhhab,
                    status: manageStatus,
                    hasVideo: manageHasVideo,
                    videoUrl: manageVideoUrl,
                    isDownloaded: manageIsDownloaded
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updated = res.data;
            setSelectedQuestion(updated);
            setQuestions(prev => prev.map(q => q._id === selectedQuestion._id ? updated : q));
            setQuestionSaveSuccess(true);
            setTimeout(() => setQuestionSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving question details:', error);
            alert('Failed to save question edits.');
        } finally {
            setIsSavingQuestionOnly(false);
        }
    };

    // Submit answer and question updates from Manage view
    const handleAnswerSubmit = async () => {
        setIsAnswering(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(
                `${API_BASE_URL}/admin/questions/${selectedQuestion._id}`,
                {
                    questionText: manageQuestionText.trim() || selectedQuestion.questionText,
                    name: manageName.trim() || selectedQuestion.name,
                    phone: managePhone.trim() || selectedQuestion.phone,
                    madhhab: manageMadhhab,
                    status: manageStatus,
                    answerText,
                    hasVideo: manageHasVideo,
                    videoUrl: manageVideoUrl,
                    isDownloaded: manageIsDownloaded
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updated = res.data;
            setQuestions(prev => prev.map(q => q._id === selectedQuestion._id ? updated : q));
            setSelectedQuestion(null);
            setAnswerText('');
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to save changes. Please try again.');
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
            setQuestions(prev => prev.map(q => q._id === id ? { ...q, isUrgent: res.data.isUrgent } : q));
            if (selectedQuestion?._id === id) {
                setSelectedQuestion(prev => ({ ...prev, isUrgent: res.data.isUrgent }));
            }
        } catch (error) {
            console.error('Error toggling urgency:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_BASE_URL}/admin/questions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(prev => prev.filter(q => q._id !== id));
            setSelectedIds(prev => prev.filter(item => item !== id));
            if (selectedQuestion?._id === id) setSelectedQuestion(null);
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete question.');
        }
    };

    // Open Quick Video Modal
    const openVideoModal = (q) => {
        setVideoModalQuestion(q);
        setVideoModalHasVideo(Boolean(q.hasVideo));
        setVideoModalUrl(q.videoUrl || '');
    };

    // Save Video Modal
    const handleSaveVideoModal = async (e) => {
        if (e) e.preventDefault();
        if (!videoModalQuestion) return;
        setIsSavingVideoModal(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(
                `${API_BASE_URL}/admin/questions/${videoModalQuestion._id}/video`,
                {
                    hasVideo: videoModalHasVideo,
                    videoUrl: videoModalUrl
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updated = res.data;
            setQuestions(prev => prev.map(q => q._id === videoModalQuestion._id ? updated : q));
            if (selectedQuestion?._id === videoModalQuestion._id) {
                setSelectedQuestion(updated);
            }
            setVideoModalQuestion(null);
        } catch (error) {
            console.error('Error updating video status:', error);
            alert('Failed to update video status.');
        } finally {
            setIsSavingVideoModal(false);
        }
    };

    // Single Question Doc Export with automatic download tracking
    const handleExportSingle = async (q) => {
        try {
            await exportSingleQuestionToDoc(q);

            // Mark as downloaded in backend
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(
                `${API_BASE_URL}/admin/questions/${q._id}/downloaded`,
                { isDownloaded: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updated = res.data;
            setQuestions(prev => prev.map(item => item._id === q._id ? updated : item));
        } catch (error) {
            console.error('Error tracking download:', error);
        }
    };

    // Bulk Export of ALL filtered questions
    const handleExportBulk = async () => {
        if (filteredQuestions.length === 0) return;
        try {
            await exportQuestionsListToDoc(filteredQuestions, "Fiqh File - Questions & Mas'ala Export");

            // Mark all exported IDs as downloaded
            const token = localStorage.getItem('adminToken');
            const ids = filteredQuestions.map(q => q._id);
            await axios.post(
                `${API_BASE_URL}/admin/questions/mark-downloaded`,
                { ids },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const now = new Date().toISOString();
            setQuestions(prev => prev.map(q => ids.includes(q._id) ? { ...q, isDownloaded: true, downloadedAt: now } : q));
        } catch (error) {
            console.error('Error bulk tracking download:', error);
        }
    };

    // Bulk Export of specifically SELECTED questions
    const handleExportSelected = async () => {
        if (selectedIds.length === 0) return;
        const selectedList = questions.filter(q => selectedIds.includes(q._id));
        try {
            await exportQuestionsListToDoc(
                selectedList,
                `Fiqh File - Selected Mas'alas Export (${selectedList.length} Records)`
            );

            // Mark all selected IDs as downloaded
            const token = localStorage.getItem('adminToken');
            await axios.post(
                `${API_BASE_URL}/admin/questions/mark-downloaded`,
                { ids: selectedIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const now = new Date().toISOString();
            setQuestions(prev => prev.map(q => selectedIds.includes(q._id) ? { ...q, isDownloaded: true, downloadedAt: now } : q));
        } catch (error) {
            console.error('Error exporting selected questions:', error);
            alert('Failed to export selected questions.');
        }
    };

    // Toggle individual selection
    const toggleSelectQuestion = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Select or deselect all questions visible on current page
    const handleSelectAllPage = () => {
        const pageIds = paginatedQuestions.map(q => q._id);
        const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
        if (allPageSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    // Select all filtered questions across all pages
    const handleSelectAllFiltered = () => {
        const filteredIds = filteredQuestions.map(q => q._id);
        setSelectedIds(filteredIds);
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
            setNewQuestionData({
                name: '',
                phone: '',
                questionText: '',
                madhhab: 'General / No Preference',
                answerText: '',
                hasVideo: false,
                videoUrl: ''
            });
        } catch (error) {
            console.error('Error creating question:', error);
            alert('Failed to create question.');
        }
    };

    const handleRowsPerPageChange = (val) => {
        const num = parseInt(val, 10);
        setRowsPerPage(num);
        localStorage.setItem('fiqh_rows_per_page', num);
    };

    // Filter questions
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = !searchTerm ||
                q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.phone.includes(searchTerm);

            const matchesMadhhab = filterMadhhab === 'All' || q.madhhab === filterMadhhab;

            const matchesStatus = filterStatus === 'All' || q.status === filterStatus;

            const matchesVideo = filterVideo === 'All' ||
                (filterVideo === 'WithVideo' && q.hasVideo) ||
                (filterVideo === 'NoVideo' && !q.hasVideo);

            const matchesDownloaded = filterDownloaded === 'All' ||
                (filterDownloaded === 'Downloaded' && q.isDownloaded) ||
                (filterDownloaded === 'NotDownloaded' && !q.isDownloaded);

            return matchesSearch && matchesMadhhab && matchesStatus && matchesVideo && matchesDownloaded;
        });
    }, [questions, searchTerm, filterMadhhab, filterStatus, filterVideo, filterDownloaded]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / rowsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredQuestions.length);
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    const allComments = questions.flatMap(q =>
        (q.comments || []).map(c => ({ ...c, questionId: q._id, questionText: q.questionText }))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalQuestions = questions.length;
    const pendingQuestions = questions.filter(q => q.status === 'Pending').length;
    const answeredQuestions = questions.filter(q => q.status === 'Answered').length;
    const videoQuestionsCount = questions.filter(q => q.hasVideo).length;
    const downloadedQuestionsCount = questions.filter(q => q.isDownloaded).length;
    const totalCommentsCount = allComments.length;

    const madhhabStats = questions.reduce((acc, q) => {
        acc[q.madhhab] = (acc[q.madhhab] || 0) + 1;
        return acc;
    }, {});

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const SidebarLink = ({ id, icon, label, badge }) => (
        <button
            onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === id
                    ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
        >
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">{icon}</span>
                <span>{label}</span>
            </div>
            {badge !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                    {badge}
                </span>
            )}
        </button>
    );

    // Single Question Management / Response View
    if (selectedQuestion) {
        return (
            <div className="font-display bg-background-light text-slate-900 min-h-screen">
                <div className="relative flex h-auto min-h-screen w-full flex-col">
                    <header className="flex items-center justify-between border-b border-primary/10 bg-white px-4 md:px-20 py-3 sticky top-0 z-50">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Fiqh File" className="h-8 w-auto object-contain" />
                            <h2 className="text-base md:text-lg font-black text-primary">Fiqh Files Admin Panel</h2>
                        </div>
                        <button
                            onClick={() => setSelectedQuestion(null)}
                            className="text-slate-500 hover:text-slate-800 font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm transition-colors cursor-pointer"
                        >
                            Back to Questions
                        </button>
                    </header>

                    <main className="flex-1 flex justify-center py-6 md:py-8 px-4">
                        <div className="max-w-[860px] flex-1 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Manage Mas'ala</h1>
                                    <p className="text-slate-500 text-sm">Review submission details, attach video links, and publish answers.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleExportSingle(selectedQuestion)}
                                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                        <FiDownload /> Download Doc (.docx)
                                    </button>
                                </div>
                            </div>

                            {/* Question Details Card (Editable) */}
                            <div className="rounded-2xl border border-primary/20 bg-white p-5 md:p-6 shadow-sm space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                            {getInitials(manageName || selectedQuestion.name)}
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                value={manageName}
                                                onChange={(e) => setManageName(e.target.value)}
                                                placeholder="Submitter Name"
                                                className="font-bold text-sm text-slate-900 border border-slate-200 hover:border-slate-300 focus:border-primary rounded-lg px-2.5 py-1 outline-none transition-colors"
                                                title="Edit Submitter Name"
                                            />
                                            <input
                                                type="text"
                                                value={managePhone}
                                                onChange={(e) => setManagePhone(e.target.value)}
                                                placeholder="Phone number"
                                                className="text-xs text-slate-500 border border-slate-200 hover:border-slate-300 focus:border-primary rounded-lg px-2.5 py-1 outline-none transition-colors block"
                                                title="Edit Submitter Phone"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        {/* Madhhab Selector */}
                                        <select
                                            value={manageMadhhab}
                                            onChange={(e) => setManageMadhhab(e.target.value)}
                                            className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 outline-none cursor-pointer hover:border-primary"
                                            title="Edit Madhhab"
                                        >
                                            <option value="General / No Preference">General / No Preference</option>
                                            <option value="Shafi'i">Shafi'i</option>
                                            <option value="Hanafi">Hanafi</option>
                                            <option value="Maliki">Maliki</option>
                                            <option value="Hanbali">Hanbali</option>
                                        </select>

                                        {/* Status Selector */}
                                        <select
                                            value={manageStatus}
                                            onChange={(e) => setManageStatus(e.target.value)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                                                manageStatus === 'Answered'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}
                                            title="Edit Status"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Answered">Answered</option>
                                        </select>
                                    </div>
                                </div>

                                {/* The Question Textarea (Editable) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
                                            The Question / ചോദ്യം (Editable)
                                        </h3>
                                        <span className="text-[11px] text-slate-400">
                                            You can edit or correct the question wording anytime
                                        </span>
                                    </div>

                                    <textarea
                                        rows="4"
                                        value={manageQuestionText}
                                        onChange={(e) => setManageQuestionText(e.target.value)}
                                        placeholder="Edit question text here..."
                                        className="w-full p-4 rounded-xl border-2 border-primary/20 bg-slate-50/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base md:text-lg leading-relaxed font-rahna22 resize-y shadow-inner text-slate-900 border-l-4 border-l-primary"
                                    />

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] text-slate-400">
                                                {manageQuestionText.length} characters
                                            </span>
                                            {questionSaveSuccess && (
                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                                                    <FiCheck /> Question updated successfully!
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSaveQuestionOnly}
                                            disabled={isSavingQuestionOnly || !manageQuestionText.trim()}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-primary text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95"
                                        >
                                            {isSavingQuestionOnly ? 'Saving Question...' : 'Save Question Edits'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Video & Tracking Settings Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <FiVideo className="text-rose-500" /> Video & Document Status
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Video Toggle & URL */}
                                    <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={manageHasVideo}
                                                onChange={(e) => setManageHasVideo(e.target.checked)}
                                                className="size-4 text-rose-600 rounded focus:ring-rose-500"
                                            />
                                            <span className="text-sm font-bold text-rose-900">Mark as Published Video</span>
                                        </label>
                                        {manageHasVideo && (
                                            <div>
                                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                                    Video URL (YouTube, Vimeo, etc.)
                                                </label>
                                                <input
                                                    type="url"
                                                    value={manageVideoUrl}
                                                    onChange={(e) => setManageVideoUrl(e.target.value)}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    className="w-full bg-white border border-rose-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-300"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Download Status Toggle */}
                                    <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={manageIsDownloaded}
                                                onChange={(e) => setManageIsDownloaded(e.target.checked)}
                                                className="size-4 text-emerald-600 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-bold text-emerald-900">Tracked as Exported to Doc</span>
                                        </label>
                                        <p className="text-xs text-slate-500">
                                            {selectedQuestion.isDownloaded && selectedQuestion.downloadedAt
                                                ? `Last downloaded: ${new Date(selectedQuestion.downloadedAt).toLocaleString()}`
                                                : 'Uncheck if you need to re-download or re-process this document.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Response Editor */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                                        Official Response Content
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => toggleUrgency(selectedQuestion._id)}
                                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                            selectedQuestion.isUrgent
                                                ? 'bg-red-50 text-red-600 border-red-200'
                                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {selectedQuestion.isUrgent ? 'priority_high' : 'notification_important'}
                                        </span>
                                        {selectedQuestion.isUrgent ? 'Urgent Priority' : 'Mark as Urgent'}
                                    </button>
                                </div>

                                <textarea
                                    className="w-full h-80 p-4 md:p-6 rounded-xl border border-primary/10 bg-slate-50/30 outline-none focus:ring-2 focus:ring-primary/20 text-base md:text-lg leading-relaxed shadow-inner break-words resize-y font-rahna22"
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    placeholder="Begin writing the formal mas'ala response..."
                                />

                                <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
                                    <button
                                        onClick={() => setSelectedQuestion(null)}
                                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAnswerSubmit}
                                        disabled={isAnswering}
                                        className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
                                    >
                                        {isAnswering ? 'Saving...' : 'Save & Publish Official Mas\'ala'}
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
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 md:static transition-transform duration-300 flex flex-col`}>
                <div className="p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Fiqh File Logo" className="h-9 w-auto object-contain" />
                        <h2 className="text-xl font-black tracking-tight text-primary">Fiqh Files</h2>
                    </div>
                    <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
                        <FiX size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    <SidebarLink id="questions" icon="chat_bubble" label="Questions" badge={totalQuestions} />
                    <SidebarLink id="dashboard" icon="dashboard" label="Dashboard" />
                    <SidebarLink id="comments" icon="comment" label="Comments" badge={totalCommentsCount} />
                    <SidebarLink id="scholars" icon="person" label="Scholars" />
                    <SidebarLink id="settings" icon="settings" label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2.5">
                            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">account_circle</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Super Admin</p>
                                <p className="text-[10px] text-slate-400">graphadmin</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        >
                            <FiLogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button className="md:hidden p-2 text-slate-500 hover:text-primary" onClick={() => setIsSidebarOpen(true)}>
                            <FiMenu size={24} />
                        </button>
                        <div className="relative w-full max-w-md hidden md:block">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Search questions, names, phones..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <h2 className="md:hidden font-bold text-primary">Fiqh Files Admin</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                            <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Live DB Connected</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
                        >
                            <FiLogOut size={14} /> Logout
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 space-y-5">
                    {/* View: Questions */}
                    {activeTab === 'questions' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {/* Top Title & Primary Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Questions</h1>
                                    <p className="text-slate-500 text-sm">
                                        Select required questions to export in bulk, attach video links, and manage rulings.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <button
                                        onClick={handleExportBulk}
                                        disabled={filteredQuestions.length === 0}
                                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
                                        title="Download ALL filtered questions as Word Doc (.docx)"
                                    >
                                        <FiDownload size={14} /> Export All ({filteredQuestions.length})
                                    </button>
                                    <button
                                        onClick={() => setShowNewModal(true)}
                                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    >
                                        <FiPlus size={15} /> New Record
                                    </button>
                                </div>
                            </div>

                            {/* Bulk Selection Action Bar (Visible when any questions are selected) */}
                            {selectedIds.length > 0 && (
                                <div className="bg-primary/5 border-2 border-primary/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-md">
                                            {selectedIds.length}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {selectedIds.length} {selectedIds.length === 1 ? 'question' : 'questions'} selected
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                You can download these specific selected questions as a Word Doc file now.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <button
                                            onClick={handleSelectAllFiltered}
                                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm"
                                        >
                                            Select All Filtered ({filteredQuestions.length})
                                        </button>
                                        <button
                                            onClick={() => setSelectedIds([])}
                                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 cursor-pointer"
                                        >
                                            Clear Selection
                                        </button>
                                        <button
                                            onClick={handleExportSelected}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                        >
                                            <FiDownload size={15} /> Download Selected Doc ({selectedIds.length})
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Filter and Control Bar */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                                {/* Mobile Search */}
                                <div className="block md:hidden">
                                    <div className="relative w-full">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                        <input
                                            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Search queries..."
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                    {/* Left Filter Dropdowns */}
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <FiFilter size={13} /> Filters:
                                        </span>

                                        {/* Video Filter */}
                                        <select
                                            value={filterVideo}
                                            onChange={(e) => setFilterVideo(e.target.value)}
                                            className={`text-xs font-bold rounded-lg border py-1.5 px-3 outline-none cursor-pointer transition-colors ${
                                                filterVideo !== 'All' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                                            }`}
                                        >
                                            <option value="All">All Videos ({totalQuestions})</option>
                                            <option value="WithVideo">▶ With Published Video ({videoQuestionsCount})</option>
                                            <option value="NoVideo">No Video ({totalQuestions - videoQuestionsCount})</option>
                                        </select>

                                        {/* Doc Downloaded Filter */}
                                        <select
                                            value={filterDownloaded}
                                            onChange={(e) => setFilterDownloaded(e.target.value)}
                                            className={`text-xs font-bold rounded-lg border py-1.5 px-3 outline-none cursor-pointer transition-colors ${
                                                filterDownloaded !== 'All' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                                            }`}
                                        >
                                            <option value="All">All Doc Status</option>
                                            <option value="Downloaded">✓ Doc Exported ({downloadedQuestionsCount})</option>
                                            <option value="NotDownloaded">Not Downloaded ({totalQuestions - downloadedQuestionsCount})</option>
                                        </select>

                                        {/* Status Filter */}
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1.5 px-3 outline-none cursor-pointer"
                                        >
                                            <option value="All">All Status</option>
                                            <option value="Pending">Pending ({pendingQuestions})</option>
                                            <option value="Answered">Answered ({answeredQuestions})</option>
                                        </select>

                                        {/* Madhhab Filter */}
                                        <select
                                            value={filterMadhhab}
                                            onChange={(e) => setFilterMadhhab(e.target.value)}
                                            className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1.5 px-3 outline-none cursor-pointer"
                                        >
                                            <option value="All">All Madhhabs</option>
                                            <option value="Shafi'i">Shafi'i</option>
                                            <option value="Hanafi">Hanafi</option>
                                            <option value="Maliki">Maliki</option>
                                            <option value="Hanbali">Hanbali</option>
                                            <option value="General / No Preference">General</option>
                                        </select>

                                        {(searchTerm || filterVideo !== 'All' || filterDownloaded !== 'All' || filterStatus !== 'All' || filterMadhhab !== 'All') && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFilterVideo('All');
                                                    setFilterDownloaded('All');
                                                    setFilterStatus('All');
                                                    setFilterMadhhab('All');
                                                }}
                                                className="text-xs font-bold text-red-500 hover:text-red-700 underline px-2 cursor-pointer"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>

                                    {/* Right Rows Per Page Selector */}
                                    <div className="flex items-center gap-2 ml-auto">
                                        <span className="text-xs font-bold text-slate-500">Rows per page:</span>
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => handleRowsPerPageChange(e.target.value)}
                                            className="text-xs font-bold bg-slate-50 border border-slate-300 text-slate-800 rounded-lg py-1.5 px-2.5 outline-none cursor-pointer hover:border-primary focus:border-primary"
                                        >
                                            {PAGE_SIZE_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Questions Table */}
                            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[900px]">
                                        <thead className="bg-slate-50/75 border-b border-slate-200">
                                            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                {/* Select All Checkbox Column */}
                                                <th className="w-12 px-4 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={paginatedQuestions.length > 0 && paginatedQuestions.every(q => selectedIds.includes(q._id))}
                                                        onChange={handleSelectAllPage}
                                                        className="size-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                                                        title="Select or deselect all on this page"
                                                    />
                                                </th>
                                                <th className="px-5 py-4">Profile</th>
                                                <th className="px-6 py-4">Content</th>
                                                <th className="px-4 py-4">Madhhab</th>
                                                <th className="px-4 py-4">Status & Indicators</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan="6" className="py-20 text-center text-slate-400 font-bold animate-pulse">
                                                        Fetching Data from Cloud MySQL...
                                                    </td>
                                                </tr>
                                            ) : paginatedQuestions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="py-16 text-center text-slate-400">
                                                        <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">search_off</span>
                                                        <p className="font-bold text-sm">No questions found matching your criteria.</p>
                                                        <button
                                                            onClick={() => {
                                                                setSearchTerm('');
                                                                setFilterVideo('All');
                                                                setFilterDownloaded('All');
                                                                setFilterStatus('All');
                                                                setFilterMadhhab('All');
                                                            }}
                                                            className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
                                                        >
                                                            Reset all filters
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedQuestions.map(q => {
                                                    const isRowSelected = selectedIds.includes(q._id);
                                                    return (
                                                        <tr
                                                            key={q._id}
                                                            className={`transition-colors ${
                                                                isRowSelected
                                                                    ? 'bg-primary/5 hover:bg-primary/10'
                                                                    : 'hover:bg-slate-50/70'
                                                            }`}
                                                        >
                                                            {/* Checkbox Column */}
                                                            <td className="w-12 px-4 py-4 text-center align-middle">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isRowSelected}
                                                                    onChange={() => toggleSelectQuestion(q._id)}
                                                                    className="size-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                                                                />
                                                            </td>

                                                            {/* Profile Column */}
                                                            <td className="px-5 py-4 align-top">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-black uppercase shrink-0">
                                                                        {getInitials(q.name)}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs md:text-sm font-bold text-slate-900 truncate">
                                                                            {q.name}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                                            {q.phone}
                                                                        </p>
                                                                        <p className="text-[9px] text-slate-400 font-medium">
                                                                            {new Date(q.createdAt).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Content Column */}
                                                            <td className="px-6 py-4 max-w-xs md:max-w-sm align-top">
                                                                <p className="text-xs md:text-sm font-medium line-clamp-2 leading-relaxed text-slate-700 font-rahna22">
                                                                    "{q.questionText}"
                                                                </p>
                                                                {q.answerText && (
                                                                    <p className="text-[11px] font-medium text-emerald-700 line-clamp-1 mt-1 font-rahna22">
                                                                        <span className="font-bold font-sans text-[10px] uppercase text-emerald-600 mr-1">Ans:</span>
                                                                        {q.answerText}
                                                                    </p>
                                                                )}
                                                            </td>

                                                            {/* Madhhab Column */}
                                                            <td className="px-4 py-4 align-top">
                                                                <span className="text-[9px] md:text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full uppercase whitespace-nowrap">
                                                                    {q.madhhab}
                                                                </span>
                                                            </td>

                                                            {/* Status & Badges Column */}
                                                            <td className="px-4 py-4 align-top">
                                                                <div className="flex flex-col gap-1.5 items-start">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className={`text-[9px] md:text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                                            q.status === 'Answered'
                                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                                : 'bg-amber-100 text-amber-700'
                                                                        }`}>
                                                                            {q.status}
                                                                        </span>
                                                                        {q.isUrgent && (
                                                                            <span className="size-2 bg-red-500 rounded-full animate-ping" title="Urgent Priority"></span>
                                                                        )}
                                                                    </div>

                                                                    {/* Video Badge */}
                                                                    {q.hasVideo && (
                                                                        <button
                                                                            onClick={() => openVideoModal(q)}
                                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                                                                            title={q.videoUrl ? `Video URL: ${q.videoUrl} (Click to edit)` : "Marked with published video (Click to edit)"}
                                                                        >
                                                                            <span>▶</span> Video Published
                                                                        </button>
                                                                    )}

                                                                    {/* Doc Downloaded Badge */}
                                                                    {q.isDownloaded && (
                                                                        <span
                                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                            title={q.downloadedAt ? `Downloaded on ${new Date(q.downloadedAt).toLocaleString()}` : "Document file downloaded"}
                                                                        >
                                                                            <FiCheck size={10} /> Doc Exported
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Actions Column (Always Visible) */}
                                                            <td className="px-6 py-4 align-top text-right">
                                                                <div className="flex items-center justify-end gap-1.5 md:gap-2">
                                                                    {/* Video published toggle / edit button */}
                                                                    <button
                                                                        onClick={() => openVideoModal(q)}
                                                                        title={q.hasVideo ? (q.videoUrl ? `Video: ${q.videoUrl} (Click to edit)` : "Video Published (Click to edit)") : "Attach / Mark published video"}
                                                                        className={`p-1.5 md:p-2 transition-all rounded-lg border shadow-sm cursor-pointer ${
                                                                            q.hasVideo
                                                                                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:scale-105'
                                                                                : 'bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200'
                                                                        }`}
                                                                    >
                                                                        <FiVideo size={14} />
                                                                    </button>

                                                                    {/* Doc download button */}
                                                                    <button
                                                                        onClick={() => handleExportSingle(q)}
                                                                        title={q.isDownloaded ? `Downloaded on ${q.downloadedAt ? new Date(q.downloadedAt).toLocaleDateString() : 'earlier'} (Click to download again)` : "Download as Word Doc (.docx)"}
                                                                        className={`p-1.5 md:p-2 transition-all rounded-lg border shadow-sm cursor-pointer ${
                                                                            q.isDownloaded
                                                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:scale-105'
                                                                                : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200'
                                                                        }`}
                                                                    >
                                                                        <FiDownload size={14} />
                                                                    </button>

                                                                    {/* Public View link */}
                                                                    <button
                                                                        onClick={() => navigate(`/masala/${q._id}`)}
                                                                        title="View Public Mas'ala Page"
                                                                        className="p-1.5 md:p-2 text-slate-400 hover:text-primary transition-colors bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer hover:border-primary/30"
                                                                    >
                                                                        <FiExternalLink size={14} />
                                                                    </button>

                                                                    {/* Manage Button */}
                                                                    <button
                                                                        onClick={() => openManageView(q)}
                                                                        className="bg-slate-900 text-white text-[10px] md:text-xs px-3 md:px-3.5 py-1.5 md:py-2 rounded-lg font-black uppercase tracking-wider hover:bg-primary transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
                                                                    >
                                                                        Manage
                                                                    </button>

                                                                    {/* Delete Button */}
                                                                    <button
                                                                        onClick={() => handleDelete(q._id)}
                                                                        title="Delete record"
                                                                        className="p-1.5 md:p-2 text-slate-300 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer hover:border-red-200"
                                                                    >
                                                                        <FiTrash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Bottom Pagination Bar */}
                                <div className="border-t border-slate-200 bg-slate-50/60 px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="text-xs text-slate-500 font-medium">
                                        Showing <span className="font-bold text-slate-800">{filteredQuestions.length === 0 ? 0 : startIndex + 1}</span> to{' '}
                                        <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
                                        <span className="font-bold text-slate-800">{filteredQuestions.length}</span> questions
                                        {selectedIds.length > 0 && (
                                            <span className="ml-2 font-bold text-primary">({selectedIds.length} selected)</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {/* First Page */}
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={safeCurrentPage <= 1}
                                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
                                            title="First Page"
                                        >
                                            <FiChevronsLeft size={16} />
                                        </button>

                                        {/* Previous Page */}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={safeCurrentPage <= 1}
                                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
                                            title="Previous Page"
                                        >
                                            <FiChevronLeft size={16} />
                                        </button>

                                        {/* Current Page Display */}
                                        <div className="px-3 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
                                            Page {safeCurrentPage} of {totalPages}
                                        </div>

                                        {/* Next Page */}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={safeCurrentPage >= totalPages}
                                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
                                            title="Next Page"
                                        >
                                            <FiChevronRight size={16} />
                                        </button>

                                        {/* Last Page */}
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={safeCurrentPage >= totalPages}
                                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
                                            title="Last Page"
                                        >
                                            <FiChevronsRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Dashboard Overview */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Site Overview</h1>
                                <p className="text-slate-500 text-sm md:text-base">Overall platform performance and query distribution.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                                            <FiSearch size={18} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Total Queries</p>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">{totalQuestions}</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold">
                                            <span className="material-symbols-outlined text-lg">pending</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Pending</p>
                                    </div>
                                    <p className="text-3xl font-black text-amber-600">{pendingQuestions}</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Answered</p>
                                    </div>
                                    <p className="text-3xl font-black text-emerald-600">{answeredQuestions}</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 font-bold">
                                            <FiVideo size={18} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Videos Linked</p>
                                    </div>
                                    <p className="text-3xl font-black text-rose-600">{videoQuestionsCount}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                    <h3 className="text-base font-bold text-slate-900 mb-5">Distribution by Madhhab</h3>
                                    <div className="space-y-4">
                                        {Object.entries(madhhabStats).map(([key, value]) => (
                                            <div key={key}>
                                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                                    <span className="text-slate-700">{key}</span>
                                                    <span className="text-slate-500">{value} ({totalQuestions ? Math.round((value / totalQuestions) * 100) : 0}%)</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${totalQuestions ? (value / totalQuestions) * 100 : 0}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                    <h3 className="text-base font-bold text-slate-900 mb-5">Recent Submissions</h3>
                                    <div className="space-y-3">
                                        {questions.slice(0, 5).map(q => (
                                            <div
                                                key={q._id}
                                                className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-slate-100"
                                                onClick={() => openManageView(q)}
                                            >
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black shrink-0">
                                                    {getInitials(q.name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate font-rahna22">{q.questionText}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{q.name} • {new Date(q.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                    q.status === 'Answered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {q.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Comments */}
                    {activeTab === 'comments' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900">Community Comments</h1>
                                <p className="text-slate-500 text-sm">Feedback and reflections posted on mas'ala answers.</p>
                            </div>

                            <div className="space-y-4">
                                {allComments.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <FiMessageSquare className="mx-auto text-5xl text-slate-200 mb-3" />
                                        <p className="text-slate-400 font-bold">No comments received yet.</p>
                                    </div>
                                ) : (
                                    allComments.map((comment, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start hover:shadow-md transition-shadow">
                                            <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                <FiMessageSquare size={18} />
                                            </div>
                                            <div className="flex-1 w-full">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-slate-900 text-sm">{comment.name}</h4>
                                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3 font-rahna22">"{comment.text}"</p>
                                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                                    <p className="text-slate-500 truncate pr-3 font-rahna22">
                                                        <span className="font-bold text-slate-700 font-sans">Mas'ala:</span> {comment.questionText}
                                                    </p>
                                                    <button
                                                        onClick={() => navigate(`/masala/${comment.questionId}`)}
                                                        className="font-bold text-primary hover:underline shrink-0"
                                                    >
                                                        VIEW
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: Scholars */}
                    {activeTab === 'scholars' && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                            <span className="material-symbols-outlined text-6xl text-slate-200">groups</span>
                            <h2 className="text-2xl font-black mt-4 text-slate-800">Scholars Panel</h2>
                            <p className="text-slate-400 text-sm mt-1">Manage scholar accounts and access permissions.</p>
                        </div>
                    )}

                    {/* View: Settings */}
                    {activeTab === 'settings' && (
                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Portal Settings</h2>
                                <p className="text-slate-500 text-sm">Configure portal preferences and defaults.</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Default Rows Per Page</p>
                                        <p className="text-xs text-slate-400">Fixed increment for paginating question tables.</p>
                                    </div>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => handleRowsPerPageChange(e.target.value)}
                                        className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none"
                                    >
                                        {PAGE_SIZE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt} rows</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Active Admin Username</p>
                                        <p className="text-xs text-slate-400">Configured in backend server environment.</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">
                                        graphadmin
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="mt-auto p-6 border-t border-slate-200 text-center text-slate-400 text-xs">
                    © {new Date().getFullYear()} Fiqh Files Admin Portal. All rights reserved.
                </footer>
            </main>

            {/* Quick Video Edit Modal */}
            {videoModalQuestion && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-2">
                                <div className="size-9 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center font-bold">
                                    <FiVideo size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900">Published Video</h3>
                            </div>
                            <button
                                onClick={() => setVideoModalQuestion(null)}
                                className="text-slate-400 hover:text-slate-800 p-1"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveVideoModal} className="space-y-4">
                            <p className="text-xs text-slate-600 line-clamp-2 italic font-rahna22 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                "{videoModalQuestion.questionText}"
                            </p>

                            <label className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 bg-rose-50/50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={videoModalHasVideo}
                                    onChange={(e) => setVideoModalHasVideo(e.target.checked)}
                                    className="size-4 text-rose-600 rounded focus:ring-rose-500"
                                />
                                <span className="text-sm font-bold text-rose-950">Mark Question as having Published Video</span>
                            </label>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600">Video Link / URL (Optional)</label>
                                <input
                                    type="url"
                                    value={videoModalUrl}
                                    onChange={(e) => setVideoModalUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-rose-300 transition-all"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setVideoModalQuestion(null)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingVideoModal}
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer transition-all"
                                >
                                    {isSavingVideoModal ? 'Saving...' : 'Save Video Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Question Modal */}
            {showNewModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">New Question Record</h2>
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="text-slate-400 hover:text-slate-900 p-1"
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateQuestion} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">Name</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Full Name"
                                        value={newQuestionData.name}
                                        onChange={(e) => setNewQuestionData({ ...newQuestionData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">Phone</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Phone Number"
                                        value={newQuestionData.phone}
                                        onChange={(e) => setNewQuestionData({ ...newQuestionData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">Madhhab</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none cursor-pointer"
                                    value={newQuestionData.madhhab}
                                    onChange={(e) => setNewQuestionData({ ...newQuestionData, madhhab: e.target.value })}
                                >
                                    <option value="General / No Preference">General / No Preference</option>
                                    <option value="Shafi'i">Shafi'i</option>
                                    <option value="Hanafi">Hanafi</option>
                                    <option value="Maliki">Maliki</option>
                                    <option value="Hanbali">Hanbali</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">Question / ചോദിച്ച കാര്യം</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none font-rahna22"
                                    placeholder="Paste or write question text here..."
                                    value={newQuestionData.questionText}
                                    onChange={(e) => setNewQuestionData({ ...newQuestionData, questionText: e.target.value })}
                                />
                            </div>

                            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newQuestionData.hasVideo}
                                        onChange={(e) => setNewQuestionData({ ...newQuestionData, hasVideo: e.target.checked })}
                                        className="size-4 text-rose-600 rounded"
                                    />
                                    <span className="text-xs font-bold text-slate-700">Has published video</span>
                                </label>
                                {newQuestionData.hasVideo && (
                                    <input
                                        type="url"
                                        placeholder="Video URL (optional)"
                                        value={newQuestionData.videoUrl}
                                        onChange={(e) => setNewQuestionData({ ...newQuestionData, videoUrl: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="px-5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-slate-900 hover:bg-primary text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                                >
                                    Save Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
