import React, { useState } from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';

interface SignupViewProps {
    onSignup: (name: string, email: string, avatarUrl?: string) => void;
    onNavigateToLogin: () => void;
}

// Backend OAuth URL
const BACKEND_URL = 'http://localhost:3000';

export const SignupView: React.FC<SignupViewProps> = ({ onSignup, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network request
        setTimeout(() => {
            onSignup(name, email);
            setIsLoading(false);
        }, 800);
    };

    const handleGoogleSignup = () => {
        setIsLoading(true);
        // Redirect to backend OAuth endpoint (same endpoint for login/signup)
        window.location.href = `${BACKEND_URL}/auth/google`;
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col antialiased text-text-main-light dark:text-text-main-dark overflow-x-hidden relative transition-colors duration-200">
            {/* Navbar */}
            <nav className="w-full flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 z-10 absolute top-0 left-0">
                <div className="flex items-center gap-3 text-primary dark:text-white group cursor-pointer select-none">
                    <div className="size-8 flex items-center justify-center rounded-lg text-primary dark:text-white">
                        <Logo className="w-full h-full text-current" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">FocusFlow</h2>
                </div>
                <div className="hidden sm:block">
                    <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm mr-2">Already a member?</span>
                    <button onClick={onNavigateToLogin} className="text-primary dark:text-white font-semibold text-sm hover:underline decoration-2 underline-offset-4">Log in</button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-0">
                {/* Abstract Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                    <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-gradient-to-br from-neutral-200/40 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-10"></div>
                    <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-neutral-200/40 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-10"></div>
                </div>

                <div className="w-full max-w-[440px] flex flex-col">
                    {/* Header */}
                    <div className="mb-8 text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-white tracking-tight mb-3">Create your account</h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal">Start organizing your life with calm efficiency.</p>
                    </div>

                    {/* Card */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-white/50 dark:border-white/10 p-6 sm:p-8 w-full animate-zoom-in">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <label className="flex flex-col gap-1.5 w-full">
                                <span className="text-primary dark:text-gray-200 text-sm font-semibold ml-1">Full Name</span>
                                <input
                                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-primary dark:text-white h-12 px-4 placeholder:text-text-secondary-light/50 focus:border-primary dark:focus:border-white focus:ring-1 focus:ring-primary dark:focus:ring-white outline-none shadow-sm transition-all text-base"
                                    placeholder="Jane Doe"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 w-full">
                                <span className="text-primary dark:text-gray-200 text-sm font-semibold ml-1">Email Address</span>
                                <input
                                    className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-primary dark:text-white h-12 px-4 placeholder:text-text-secondary-light/50 focus:border-primary dark:focus:border-white focus:ring-1 focus:ring-primary dark:focus:ring-white outline-none shadow-sm transition-all text-base"
                                    placeholder="jane@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 w-full group">
                                <span className="text-primary dark:text-gray-200 text-sm font-semibold ml-1">Password</span>
                                <div className="relative flex items-center">
                                    <input
                                        className="w-full rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-primary dark:text-white h-12 pl-4 pr-12 placeholder:text-text-secondary-light/50 focus:border-primary dark:focus:border-white focus:ring-1 focus:ring-primary dark:focus:ring-white outline-none shadow-sm transition-all text-base"
                                        placeholder="Create a strong password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        className="absolute right-4 text-text-secondary-light hover:text-primary dark:hover:text-white transition-colors flex items-center"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <Icon name={showPassword ? "visibility_off" : "visibility"} size={20} />
                                    </button>
                                </div>
                                {/* Strength meter decoration */}
                                <div className="w-full flex gap-1 mt-2 px-1">
                                    <div className={`h-1 flex-1 rounded-full transition-all ${password.length > 0 ? 'bg-green-500/80' : 'bg-border-light dark:bg-border-dark'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full transition-all ${password.length > 8 ? 'bg-green-500/80' : 'bg-border-light dark:bg-border-dark'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full transition-all ${password.length > 12 ? 'bg-green-500/80' : 'bg-border-light dark:bg-border-dark'}`}></div>
                                    <div className="h-1 flex-1 rounded-full bg-border-light dark:bg-border-dark"></div>
                                </div>
                                <p className="text-xs text-text-secondary-light mt-1 ml-1">Must be at least 8 characters</p>
                            </label>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 w-full h-12 bg-primary hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-primary rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="size-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                                ) : 'Sign Up'}
                            </button>
                        </form>

                        <div className="relative flex py-6 items-center">
                            <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                            <span className="flex-shrink-0 mx-4 text-text-secondary-light text-sm font-medium">Or continue with</span>
                            <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleGoogleSignup}
                                type="button"
                                disabled={isLoading}
                                className="w-full h-12 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-center gap-3 hover:bg-background-light dark:hover:bg-surface-dark transition-colors group disabled:opacity-70"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
                                <span className="text-primary dark:text-white font-semibold text-sm">Sign up with Google</span>
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                className="w-full h-12 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-center gap-3 hover:bg-background-light dark:hover:bg-surface-dark transition-colors group disabled:opacity-70"
                            >
                                <svg className="w-5 h-5 fill-current text-primary dark:text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 12.6c0-2.4 2-3.6 2.1-3.6-.1-.3-1.3-4.5-4.4-4.5-1.3 0-2.5.8-3.1.8-.7 0-1.8-.7-3-.7-3 0-5.8 2.4-5.8 6.5 0 2.6 1 4.9 2.5 7 1.1 1.5 2.3 3.2 3.9 3.2 1.5 0 2.1-1 4-1s 2.4 1 4 1c1.7 0 2.8-1.5 3.9-3.1.6-1.1 1.1-2.1 1.1-2.2-.1-.1-2.2-1.3-2.2-4.4zm-4-9.3c.7-.9 1.1-2.1 1-3.3-1.1 0-2.3.6-3.1 1.5-.7.8-1.2 2-1.1 3.2 1.1.1 2.4-.5 3.2-1.4z"></path></svg>
                                <span className="text-primary dark:text-white font-semibold text-sm">Sign up with Apple</span>
                            </button>
                        </div>

                        <p className="text-xs text-center text-text-secondary-light mt-6 leading-relaxed px-4">
                            By clicking "Sign Up", you agree to our <a href="#" className="underline hover:text-primary dark:hover:text-white">Terms of Service</a> and <a href="#" className="underline hover:text-primary dark:hover:text-white">Privacy Policy</a>.
                        </p>
                    </div>

                    <div className="mt-6 text-center sm:hidden">
                        <p className="text-sm text-text-secondary-light">
                            Already have an account?
                            <button onClick={onNavigateToLogin} className="text-primary dark:text-white font-bold hover:underline ml-1">Log in</button>
                        </p>
                    </div>
                </div>
            </main>

            {/* Quote */}
            <div className="hidden lg:flex fixed right-10 bottom-10 max-w-xs flex-col gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <div className="size-10 bg-primary/10 dark:bg-white/10 rounded-full flex items-center justify-center">
                    <Icon name="format_quote" className="text-primary dark:text-white" />
                </div>
                <p className="text-sm italic text-primary dark:text-white">"Simplicity is the ultimate sophistication."</p>
                <p className="text-xs font-bold text-primary/60 dark:text-white/60">— Leonardo da Vinci</p>
            </div>
        </div>
    );
};