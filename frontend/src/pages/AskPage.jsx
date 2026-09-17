import Header from '../components/Header';
import QuestionForm from '../components/QuestionForm';

const AskPage = () => {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
                <QuestionForm />
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 py-12 text-white border-t border-primary/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Fiqh File Logo" className="h-10 w-auto object-contain brightness-0 invert" />
                            <h2 className="text-2xl font-black tracking-tight text-secondary"> </h2>
                        </div>
                        <p className="text-sm text-slate-400 text-center">
                            © {new Date().getFullYear()} Fiqh Files Knowledge Platform. All answers are provided by verified scholars.
                        </p>
                        <div className="flex gap-6">
                            <a className="text-slate-400 hover:text-secondary transition-colors text-sm font-medium" href="#">Privacy Policy</a>
                            <a className="text-slate-400 hover:text-secondary transition-colors text-sm font-medium" href="#">Terms of Use</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AskPage;
