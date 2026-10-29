import Header from '../components/Header';
import QuestionForm from '../components/QuestionForm';
import { Link } from 'react-router-dom';

const AskPage = () => {
    return (
        <div className="relative flex min-h-screen flex-col bg-background-light">
            <Header />

            <main className="flex-1">
                <QuestionForm />
            </main>

            {/* Executive Footer */}
            <footer className="bg-slate-900 py-10 text-white border-t border-slate-800">
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

export default AskPage;
