
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import {
    ChevronRight, Star, Plus, RotateCcw, Zap,
    PenLine, Highlighter, Check, X, Trophy, User, Settings,
    BookOpen, Trash2, Sparkles, Loader2, Brain,
    RefreshCw, HelpCircle, Image as ImageIcon, Type, MousePointerClick,
    Camera, Upload, FolderPlus, Play, Share2, Info, Target, ArrowLeft, ArrowRight, Volume2, Languages, WifiOff, Scan
} from 'lucide-react';

// --- Utility for Class Merging ---
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

// --- Robust JSON Parser ---
const parseGeminiJSON = (text) => {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        try {
            const match = text.match(/```json([\s\S]*?)```/);
            if (match && match[1]) {
                return JSON.parse(match[1].trim());
            }
            const firstOpen = text.indexOf('{');
            const firstArray = text.indexOf('[');
            const start = (firstOpen > -1 && firstArray > -1) ? Math.min(firstOpen, firstArray) : Math.max(firstOpen, firstArray);

            const lastClose = text.lastIndexOf('}');
            const lastArray = text.lastIndexOf(']');
            const end = Math.max(lastClose, lastArray);

            if (start > -1 && end > -1) {
                return JSON.parse(text.substring(start, end + 1));
            }
        } catch (e2) {
            console.error("JSON Parse Error:", e2);
        }
    }
    return null;
};

// --- Mock AI Service (Replaces Gemini API) ---
// --- Real AI Service (Gemini API) ---
import { GoogleGenerativeAI } from "@google/generative-ai";
// --- Firebase ---
import { auth, googleProvider, db } from "./lib/firebase";
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Keep genAI instance for local fallback/dev
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const mockAiService = async (prompt, imageBase64 = null) => {
    // 1. Try Vercel API Route (Secure Proxy)
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, imageBase64 })
        });

        if (response.ok) {
            const data = await response.json();
            return data.text;
        } else {
            console.warn("Backend Proxy failed, falling back to client SDK if available.", response.status);
        }
    } catch (e) {
        console.warn("Backend Proxy unreachable, using client fetch fallback.", e);
    }

    // 2. Fallback: Client-side SDK (Localhost / Direct)
    if (!genAI) {
        throw new Error("AI Service Unavailable: No Backend and No Local API Key.");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        let result;
        if (imageBase64) {
            // Extract base64 data
            const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            };
            const augmentedPrompt = prompt + (prompt.includes("JSON") ? "" : ". Return the result in pure JSON format if possible.");
            result = await model.generateContent([augmentedPrompt, imagePart]);
        } else {
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();
        console.log("Gemini API Response (Client):", text);
        return text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("AI Error: " + error.message);
    }
};


// --- CSS & Animation Styles ---
const GlobalStyles = () => null;

// --- Sound System ---
const SoundContext = createContext();
const SoundProvider = ({ children }) => {
    const play = (type) => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        if (type === 'click') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.1); // C#
            osc.frequency.setValueAtTime(659, now + 0.2); // E
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'swoosh') {
            // White noise buffer
            const bufferSize = ctx.sampleRate * 0.2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseGain = ctx.createGain();
            noise.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noiseGain.gain.setValueAtTime(0.05, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            noise.start(now);
        } else if (type === 'pop') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    };
    return <SoundContext.Provider value={play}>{children}</SoundContext.Provider>;
};
const useSound = () => useContext(SoundContext);

// --- Toast System ---
const ToastContext = createContext();
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        let textMessage = "Notification";
        if (typeof message === 'string') textMessage = message;
        else if (message && typeof message.message === 'string') textMessage = message.message;
        else if (message && typeof message.toString === 'function') textMessage = String(message);

        if (textMessage === '[object Object]') textMessage = "Operation completed";

        setToasts(prev => [...prev, { id, message: textMessage, type }]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id) => { setToasts(prev => prev.filter(t => t.id !== id)); };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
                {toasts.map(t => (
                    <div key={t.id} className={cn(
                        "pointer-events-auto animate-pop px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 max-w-sm w-full bg-card",
                        t.type === 'success' ? "border-green-200 text-green-700 dark:text-green-300" :
                            t.type === 'error' ? "border-red-200 text-red-700 dark:text-red-300" : "border-border text-foreground"
                    )}>
                        {t.type === 'success' && <Check className="h-4 w-4" />}
                        {t.type === 'error' && <WifiOff className="h-4 w-4" />}
                        {t.type === 'info' && <Info className="h-4 w-4" />}
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
const useToast = () => useContext(ToastContext);

// --- App Context ---
const AppContext = createContext();
const initialCollections = [{ id: 1, title: "Mening so'zlarim", words: 0, progress: 0, color: "bg-blue-100 text-blue-800", icon: "📁", wordList: [] }];
const initialUser = { name: "Foydalanuvchi", points: 0, streak: 0, wordsLearned: 0, dailyChallenge: { completed: 0, total: 10 }, tutorialSeen: false, achievements: [], targetLang: 'uz' };

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(initialUser);
    const [collections, setCollections] = useState(initialCollections);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [recentCollectionId, setRecentCollectionId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Firebase User
    const [isSyncing, setIsSyncing] = useState(true); // Start as syncing to check auth

    // 1. Auth & Initial Load
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                console.log("Logged in:", firebaseUser.email);
                setCurrentUser(firebaseUser);
                setIsSyncing(true);

                // Load from Cloud (Initial Fetch)
                const docRef = doc(db, "users", firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.user) setUser(curr => ({ ...curr, ...data.user, name: data.user.name || firebaseUser.displayName }));
                    if (data.collections) setCollections(data.collections);
                } else {
                    // New Cloud User: Save current local state to cloud immediately
                    await setDoc(docRef, { user, collections });
                }
                setIsSyncing(false);
            } else {
                console.log("Logged out");
                setCurrentUser(null);
                // Load LocalStorage if not logged in
                const savedUser = localStorage.getItem('vb_user');
                const savedCol = localStorage.getItem('vb_collections');
                if (savedUser) setUser(JSON.parse(savedUser));
                else setUser(initialUser);
                if (savedCol) setCollections(JSON.parse(savedCol));
                setIsSyncing(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Real-time Cloud Listener (Pull)
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                // We avoid infinite loop by check: deep compare could be better but simplistic check helps
                // Actually, relying on optimistic UI + eventual consistency. 
                // For now, let's just sync everything on remote change.
                if (data.collections && JSON.stringify(data.collections) !== JSON.stringify(collections)) {
                    console.log("Cloud update received");
                    setCollections(data.collections);
                }
                // User points/achievements sync
                if (data.user && data.user.points !== user.points) {
                    setUser(u => ({ ...u, ...data.user }));
                }
            }
        });
        return () => unsubscribe();
    }, [currentUser]);
    // Excluded 'collections'/'user' dependency to avoid reacting to local changes here, 
    // BUT we need to push local changes. See #3.

    // 3. Local -> Cloud Sync (Push)
    useEffect(() => {
        if (currentUser && !isSyncing) {
            const saveData = async () => {
                try {
                    await setDoc(doc(db, "users", currentUser.uid), {
                        user: { ...user, name: currentUser.displayName || user.name },
                        collections
                    }, { merge: true });
                } catch (e) {
                    console.error("Sync Error:", e);
                }
            };
            const timeout = setTimeout(saveData, 2000); // 2s debounce
            return () => clearTimeout(timeout);
        }

        // Always save to LocalStorage as backup/cache
        localStorage.setItem('vb_user', JSON.stringify(user));
        localStorage.setItem('vb_collections', JSON.stringify(collections));
        if (recentCollectionId) localStorage.setItem('vb_recent', recentCollectionId);

    }, [user, collections, currentUser, isSyncing, recentCollectionId]);

    // 4. Telegram Integration
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            try {
                const tg = window.Telegram.WebApp;
                tg.ready();
                tg.expand();

                // Fullscreen ONLY on mobile
                if (tg.platform === 'ios' || tg.platform === 'android') {
                    if (tg.requestFullscreen) tg.requestFullscreen();
                } else {
                    if (tg.exitFullscreen) tg.exitFullscreen();
                }

                // Theme & Header
                if (tg.setHeaderColor) tg.setHeaderColor(isDarkMode ? '#0f172a' : '#ffffff');
                if (tg.setBackgroundColor) tg.setBackgroundColor(isDarkMode ? '#0f172a' : '#ffffff');

                // User Name Sync (if not logged in via Firebase)
                if (tg.initDataUnsafe?.user && !currentUser) {
                    setUser(prev => ({ ...prev, name: tg.initDataUnsafe.user.first_name }));
                }

                // Theme Sync
                if (tg.colorScheme === 'dark') { setIsDarkMode(true); document.documentElement.classList.add('dark'); }

            } catch (e) {
                console.warn("Telegram WebApp API Error:", e);
            }
        }
    }, [isDarkMode, currentUser]);

    const loginWithGoogle = async () => {
        try {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                await signInWithRedirect(auth, googleProvider);
            } else {
                await signInWithPopup(auth, googleProvider);
            }
            addToast("Xush kelibsiz!", 'success');
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                // Fallback to redirect if popup fails even on desktop
                try { await signInWithRedirect(auth, googleProvider); } catch (e) { }
            }
            addToast(`Kirishda xatolik: ${error.message}`, 'error');
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(initialUser);
        setCollections(initialCollections);
        window.location.reload(); // Clean state reset
    };

    // ... Original reducers ...
    const toggleTheme = () => { setIsDarkMode(!isDarkMode); document.documentElement.classList.toggle('dark'); };
    const addCollection = (title, icon = "📁", aiData = []) => {
        const newCol = { id: Date.now(), title: title || "Yangi Papka", words: aiData.length || 0, progress: 0, color: "bg-gray-100 text-gray-800", icon, wordList: aiData.map(w => ({ ...w, status: 'new' })) };
        setCollections(prev => [newCol, ...prev]);
    };
    const addToCollection = (collectionId, newWords) => {
        setCollections(prev => prev.map(col => {
            if (col.id === collectionId) {
                const updatedList = [...(col.wordList || []), ...newWords.map(w => ({ ...w, status: 'new' }))];
                return { ...col, words: updatedList.length, wordList: updatedList };
            }
            return col;
        }));
    };
    const removeCollection = (id) => { setCollections(prev => prev.filter(c => c.id !== id)); };

    // ... Word helpers ...
    const updateWordStatus = (collectionId, wordId, status) => {
        setCollections(prev => prev.map(col => {
            if (col.id === collectionId) {
                const updatedList = col.wordList.map(w => w.id === wordId ? { ...w, status } : w);
                const masteredCount = updatedList.filter(w => w.status === 'mastered').length;
                return { ...col, wordList: updatedList, progress: updatedList.length > 0 ? Math.round((masteredCount / updatedList.length) * 100) : 0 };
            }
            return col;
        }));
        setRecentCollectionId(collectionId);
    };

    const updateWordData = (collectionId, wordId, data) => {
        setCollections(prev => prev.map(col => {
            if (col.id === collectionId) {
                const updatedList = col.wordList.map(w => w.id === wordId ? { ...w, ...data } : w);
                return { ...col, wordList: updatedList };
            }
            return col;
        }));
    };

    const addPoints = (amount) => {
        setUser(prev => {
            const newPoints = prev.points + amount;
            const newCompleted = Math.min(prev.dailyChallenge.total, prev.dailyChallenge.completed + (amount > 0 ? 1 : 0));
            const newLearned = prev.wordsLearned + (amount > 0 ? 1 : 0);
            const newAchievements = [...prev.achievements];
            if (newPoints >= 100 && !newAchievements.includes('beginner')) newAchievements.push('beginner');
            if (newLearned >= 50 && !newAchievements.includes('scholar')) newAchievements.push('scholar');
            return { ...prev, points: newPoints, wordsLearned: newLearned, achievements: newAchievements, dailyChallenge: { ...prev.dailyChallenge, completed: newCompleted } };
        });
    };

    const removeWord = (colId, wordId) => {
        setCollections(prev => prev.map(c => {
            if (c.id === colId) {
                const newList = c.wordList.filter(w => w.id !== wordId);
                return { ...c, words: newList.length, wordList: newList };
            }
            return c;
        }));
    };

    return (
        <AppContext.Provider value={{
            user, setUser, collections, isDarkMode, toggleTheme,
            addCollection, addToCollection, removeCollection, addPoints, removeWord, updateWordStatus, updateWordData,
            updateDailyGoal: goal => setUser(p => ({ ...p, dailyChallenge: { ...p.dailyChallenge, total: goal } })),
            setTutorialSeen: () => setUser(p => ({ ...p, tutorialSeen: true })),
            recentCollectionId,
            currentUser, loginWithGoogle, logout
        }}>
            <SoundProvider>
                {children}
            </SoundProvider>
        </AppContext.Provider>
    );
};

// --- SRS (Spaced Repetition) Helper ---
const calculateNextReview = (word, grade) => {
    // grade: 0=Again, 3=Hard, 4=Good, 5=Easy
    let { interval = 0, repetition = 0, ef = 2.5 } = word;

    if (grade >= 3) {
        if (repetition === 0) interval = 1;
        else if (repetition === 1) interval = 6;
        else interval = Math.round(interval * ef);

        repetition += 1;
        // Adjust Ease Factor
        ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        if (ef < 1.3) ef = 1.3;
    } else {
        repetition = 0;
        interval = 1; // Reset to 1 day
    }

    const nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000);
    return { ...word, interval, repetition, ef, nextReview, status: grade >= 4 ? 'mastered' : 'learning' };
};
const useApp = () => useContext(AppContext);

// --- UI Primitives ---
const Button = ({ className, variant = "default", size = "default", isLoading, children, onClick, ...props }) => {
    const play = useSound();
    const handleClick = (e) => {
        if (play) play('click');
        if (onClick) onClick(e);
    };
    const variants = { default: "bg-primary text-primary-foreground active:scale-95", outline: "border border-input bg-background active:scale-95", ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95", secondary: "bg-secondary text-secondary-foreground active:scale-95" };
    const sizes = { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", icon: "h-10 w-10 p-0" };
    return <button className={cn("inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-200 disabled:opacity-50", variants[variant], sizes[size], className)} disabled={isLoading || props.disabled} onClick={handleClick} {...props}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{children}</button>;
};
const Card = ({ className, ...props }) => <div className={cn("rounded-2xl border border-input bg-card text-card-foreground shadow-sm", className)} {...props} />;
const Input = ({ className, ...props }) => <input className={cn("flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2", className)} {...props} />;
const Badge = ({ className, variant = "default", ...props }) => {
    const variants = { default: "bg-primary text-primary-foreground", secondary: "bg-secondary text-secondary-foreground" };
    return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)} {...props} />;
};
const Progress = ({ value, className, ...props }) => <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}><div className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} /></div>;
const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-md bg-muted/50", className)} />;

const AnimatedHome = ({ isActive, className }) => <BookOpen className={cn(className, isActive && "text-white")} />;
const AnimatedGraduationCap = ({ isActive, className }) => <Brain className={cn(className, isActive && "text-white")} />;
const AnimatedTrophy = ({ isActive, className }) => <Trophy className={cn(className, isActive && "text-white")} />;
const AnimatedMenu = ({ isActive, className }) => <Settings className={cn(className, isActive && "text-white")} />;
const AnimatedScan = ({ isActive, className }) => <Scan className={cn(className, isActive && "text-white")} />;
const StreakBadge = () => { const { user } = useApp(); return <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-0"><Zap className="h-3 w-3 fill-current" />{user.streak}</Badge>; };

const Onboarding = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const steps = [{ title: "Xush kelibsiz!", desc: "Vocab Builder.", icon: Sparkles }, { title: "Scan qiling", desc: "Kitobdan so'zlarni oling.", icon: Camera }, { title: "Takrorlang", desc: "Kartochkalar.", icon: RotateCcw }];
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm p-6 animate-fade-in">
            <div className="max-w-sm w-full text-center space-y-6">
                <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-pop">{React.createElement(steps[step].icon, { className: "h-12 w-12 text-primary" })}</div>
                <div><h2 className="text-2xl font-bold mb-2">{steps[step].title}</h2><p className="text-muted-foreground">{steps[step].desc}</p></div>
                <Button className="w-full h-12 text-lg mt-8" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onFinish()}>{step === steps.length - 1 ? "Boshlash" : "Keyingi"}</Button>
            </div>
        </div>
    );
};

// --- Scanners ---
const HighlightedScanner = ({ onBack }) => {
    const { collections, addToCollection } = useApp();
    const { addToast } = useToast();
    const [image, setImage] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedWords, setScannedWords] = useState([]);
    const [targetCollection, setTargetCollection] = useState(collections[0]?.id || "");
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const processImage = async () => {
        if (!image) return;
        setIsScanning(true);
        try {
            // Simulating Gemini API for Highlight Detection
            const prompt = "Identify words that are VISUALLY HIGHLIGHTED or underlined. Return a strictly valid JSON array of objects with 'word' and 'translation' (Uzbek) fields. Example: [{\"word\": \"Apple\", \"translation\": \"Olma\"}]";
            const resText = await mockAiService(prompt, image);
            const data = parseGeminiJSON(resText);
            if (Array.isArray(data) && data.length > 0) {
                setScannedWords(data.map((w, i) => ({ ...w, id: Date.now() + i })));
                addToast(`${data.length} ta so'z topildi (Gemini AI)`, 'success');
            } else {
                addToast("Highlight qilingan so'zlar topilmadi", 'error');
            }
        } catch (e) {
            addToast(e?.message || "Xatolik", 'error');
        }
        setIsScanning(false);
    };

    const handleSave = () => {
        if (!targetCollection) { addToast("Saqlash uchun papka tanlang", 'error'); return; }
        addToCollection(parseInt(targetCollection), scannedWords);
        addToast("So'zlar saqlandi!", 'success');
        onBack();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center p-6 animate-scale-in">
            <Button variant="ghost" className="absolute top-4 left-4" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Chiqish</Button>
            {!image ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl p-8 space-y-4 bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center animate-pulse"><Highlighter className="h-12 w-12 text-yellow-600" /></div>
                    <div className="text-center space-y-2">
                        <h3 className="font-bold text-xl">Highlighted Words</h3>
                        <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">Gemini AI yordamida markerlangan so'zlarni ajratib olish</p>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <Button className="mt-4"><Camera className="mr-2 h-4 w-4" /> Rasmga olish</Button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-black/5 shrink-0 border border-border">
                        <img src={image} alt="Preview" className="h-full w-full object-contain" />
                        <Button size="icon" variant="secondary" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={() => { setImage(null); setScannedWords([]) }}><X className="h-4 w-4" /></Button>
                    </div>

                    {scannedWords.length === 0 && !isScanning && (
                        <div className="text-center py-4">
                            <Button onClick={processImage} size="lg" className="w-full h-14 text-lg bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow-lg shadow-yellow-500/20"><Sparkles className="mr-2 h-5 w-5" /> Scan with Gemini</Button>
                        </div>
                    )}

                    {isScanning && (
                        <div className="space-y-4 p-4">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <div className="flex items-center justify-center gap-2 text-sm text-yellow-600 font-medium animate-pulse"><Loader2 className="h-4 w-4 animate-spin" /> Gemini AI tahlil qilmoqda...</div>
                        </div>
                    )}

                    {scannedWords.length > 0 && (
                        <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-2xl border border-border shadow-sm">
                            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-bold">{scannedWords.length} ta natija</h3></div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {scannedWords.map((w) => (
                                    <div key={w.id} className="flex items-start justify-between p-3 rounded-xl bg-background border border-border">
                                        <div><div className="font-bold text-lg">{w.word}</div><div className="text-sm text-muted-foreground">{w.translation}</div></div>
                                        <Check className="h-5 w-5 text-green-500 mt-1" />
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-border bg-background space-y-3">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Saqlash joyi</label>
                                <select className="w-full h-12 rounded-xl border border-input bg-background px-3 font-medium" value={targetCollection} onChange={(e) => setTargetCollection(e.target.value)}>{collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
                                <Button onClick={handleSave} className="w-full h-12 text-lg">Saqlash</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SelectionScanner = ({ onBack }) => {
    const { collections, addToCollection } = useApp();
    const { addToast } = useToast();
    const [image, setImage] = useState(null);
    const [detectedWords, setDetectedWords] = useState([]); // Array of { id, word, box_2d }
    const [selectedIds, setSelectedIds] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [targetCollection, setTargetCollection] = useState(collections[0]?.id || "");
    const fileInputRef = useRef(null);

    // Optimized Image Resizer
    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1000; // Limit to 1000px for speed & token efficiency

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsProcessing(true); // Start loading immediately
            try {
                const resizedImage = await resizeImage(file);
                setImage(resizedImage);
                // Wait a brief moment for state to settle or run directly
                analyzeText(resizedImage);
            } catch (err) {
                console.error("Resize error:", err);
                setIsProcessing(false);
            }
        }
    };

    const analyzeText = async (imgSrc) => {
        setIsProcessing(true);
        setDetectedWords([]);
        try {
            // Prompt for coordinates
            const prompt = `Return a JSON array of detected words in this image. For each word, return an object with:
            - "word": The detected string.
            - "box_2d": An array of 4 distinct integers [ymin, xmin, ymax, xmax] representing the bounding box in a 1000x1000 normalized grid.
            Example: [{"word": "Hello", "box_2d": [100, 200, 150, 300]}]`;

            const resText = await mockAiService(prompt, imgSrc);
            const parsed = parseGeminiJSON(resText);

            let words = [];
            if (Array.isArray(parsed)) {
                // Validate structure
                words = parsed.filter(w => w.word && Array.isArray(w.box_2d));
            }

            setDetectedWords(words.map((w, i) => ({ id: i, ...w })));
            if (words.length > 0) addToast(`${words.length} ta so'z aniqlandi`, 'success');
            else addToast("Matn aniqlanmadi", 'info');

        } catch (e) { console.error(e); addToast("Xatolik", 'error'); }
        setIsProcessing(false);
    };

    const handleToggleWord = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSave = () => {
        // Sort by position (roughly top-to-bottom, left-to-right) or just ID if sequence matches reading order
        // Simple sort by ymin then xmin
        const sortedSelected = selectedIds
            .map(id => detectedWords.find(w => w.id === id))
            .filter(Boolean)
            .sort((a, b) => {
                const yDiff = a.box_2d[0] - b.box_2d[0];
                if (Math.abs(yDiff) > 50) return yDiff; // Different lines
                return a.box_2d[1] - b.box_2d[1]; // Same line, sort by x
            });

        if (sortedSelected.length === 0) return;

        // Batch save: Create a separate card for each selected word
        const newWords = sortedSelected.map(w => ({
            id: Date.now() + Math.random(),
            word: w.word,
            translation: "",
            status: 'new'
        }));

        addToCollection(parseInt(targetCollection) || collections[0].id, newWords);
        addToast(`${newWords.length} ta so'z saqlandi!`, 'success');
        onBack();
    };

    const selectedCount = selectedIds.length;
    const selectedTextPreview = selectedIds.slice(0, 3)
        .map(id => detectedWords.find(w => w.id === id)?.word)
        .join(", ");

    // Top bar text logic
    const topBarText = selectedCount > 0
        ? (selectedCount > 1 ? `${selectedCount} ta so'z: ${selectedTextPreview}${selectedCount > 3 ? '...' : ''}` : selectedIds.map(id => detectedWords.find(w => w.id === id)?.word).join(" "))
        : "";

    return (
        <div className="flex flex-col h-[100dvh] bg-background animate-fade-in fixed inset-0 z-50">
            {/* Top Input Area (Quizlet Style) */}
            <div className={`p-4 shadow-sm border-b transition-colors z-20 ${selectedCount > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted/30'}`}>
                <div className="flex justify-between items-start mb-2">
                    <Button variant="ghost" size="sm" onClick={onBack} className={selectedCount > 0 ? "text-white hover:text-white/80" : ""}><X className="h-5 w-5" /></Button>
                    <div className="flex-1 px-4">
                        <div className="min-h-[1.5rem] font-medium text-lg text-center break-words leading-tight">
                            {topBarText || <span className="text-muted-foreground/50 opacity-60">So'zlarni tanlang...</span>}
                        </div>
                        <div className={`text-center text-xs uppercase tracking-widest font-bold mt-1 ${selectedCount > 0 ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Term</div>
                    </div>
                    {selectedCount > 0 && <Button onClick={handleSave} size="sm" variant="secondary" className="rounded-full font-bold shadow-sm px-4">Done</Button>}
                </div>
            </div>

            {/* Main Area: Image & OCR Overlay */}
            <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center">
                {!image ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8 text-center animate-fade-in">
                        <div onClick={() => fileInputRef.current?.click()} className="h-24 w-24 rounded-full bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform border-4 border-blue-50 dark:border-blue-900/10"><Camera className="h-10 w-10" /></div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg">Rasm yuklang</h3>
                            <p className="text-muted-foreground text-sm">Matnni avtomatik aniqlaymiz</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full bg-black/5 overflow-auto flex items-center justify-center p-4">
                        {/* Wrapper must equal image size exactly. inline-block helps, but setting width to fit-content is safer */}
                        <div className="relative inline-block max-w-full shadow-2xl rounded-lg">
                            {/* Image governs the size. display: block prevents bottom gap */}
                            <img src={image} alt="Scan" className="max-w-full max-h-[85vh] object-contain block select-none rounded-lg" />

                            {/* Overlay Container - Absolute to the wrapper */}
                            {!isProcessing && detectedWords.map(word => {
                                const [ymin, xmin, ymax, xmax] = word.box_2d;
                                // 1000 scale -> percent
                                const top = ymin / 10;
                                const left = xmin / 10;
                                const height = (ymax - ymin) / 10;
                                const width = (xmax - xmin) / 10;
                                const isSelected = selectedIds.includes(word.id);

                                return (
                                    <div
                                        key={word.id}
                                        onClick={() => handleToggleWord(word.id)}
                                        className={`absolute cursor-pointer transition-all duration-150 rounded-[2px] ${isSelected ? 'bg-blue-600/50 border-2 border-blue-400 z-20 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10 border border-white/40 hover:bg-white/30 hover:border-white/80 z-10'}`}
                                        style={{
                                            top: `${top}%`,
                                            left: `${left}%`,
                                            width: `${width}%`,
                                            height: `${height}%`,
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600">AI</div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-lg">Rasm tahlil qilinmoqda...</p>
                                        <p className="text-muted-foreground text-xs">So'zlar va joylashuv aniqlanmoqda</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button size="icon" variant="destructive" className="absolute top-4 right-4 z-50 rounded-full shadow-lg h-10 w-10" onClick={() => { setImage(null); setDetectedWords([]); }}><X className="h-5 w-5" /></Button>
                    </div>
                )}
            </div>

            {/* Bottom Toolbar */}
            <div className="p-4 bg-background border-t flex justify-around items-center z-20">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-muted" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </Button>
                <div onClick={() => fileInputRef.current?.click()} className="h-16 w-16 -mt-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all cursor-pointer">
                    <Camera className="h-8 w-8" />
                </div>
                <Button variant="ghost" className="h-12 w-12 rounded-full hover:bg-muted" size="icon"><Settings className="h-6 w-6 text-muted-foreground" /></Button>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
    );
};

const ManualEntryScanner = ({ onBack }) => {
    const { collections, addToCollection } = useApp();
    const { addToast } = useToast();
    const [word, setWord] = useState("");
    const [translation, setTranslation] = useState("");
    const [definition, setDefinition] = useState("");
    const [targetCollection, setTargetCollection] = useState(collections[0]?.id || "");
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    const handleAutoFill = async () => {
        if (!word) return;
        setIsAutoFilling(true);
        try {
            const prompt = `Define "${word}". Return a strictly valid JSON object with the following fields: 
            - "translation": The Uzbek translation of the word.
            - "definition": A short English definition of the word.
            Example: {"translation": "Olma", "definition": "A round fruit."}`;

            const res = await mockAiService(prompt);
            const data = parseGeminiJSON(res);
            const parsed = typeof data === 'string' ? parseGeminiJSON(data) : data;

            if (parsed) {
                if (parsed.translation) setTranslation(parsed.translation);
                if (parsed.definition) setDefinition(parsed.definition);
            }
        } catch (e) { console.error(e); }
        setIsAutoFilling(false);
    };

    const handleSave = () => {
        if (!word || !translation) return addToast("To'ldiring", 'error');
        addToCollection(parseInt(targetCollection), [{ id: Date.now(), word, translation, definition, status: 'new' }]);
        addToast("Saqlandi!", 'success');
        setWord(""); setTranslation(""); setDefinition("");
    };

    return (
        <div className="flex flex-col h-full space-y-6 pt-4 animate-slide-up">
            <Button variant="ghost" onClick={onBack} className="self-start pl-0 gap-2"><ArrowLeft className="h-5 w-5" /> Orqaga</Button>

            <div className="text-center space-y-2">
                <div className="h-20 w-20 mx-auto rounded-full bg-purple-100 flex items-center justify-center"><Type className="h-10 w-10 text-purple-600" /></div>
                <h3 className="font-bold text-2xl">Manual Entry</h3>
                <p className="text-muted-foreground">So'zni kiriting, AI tarjima qiladi</p>
            </div>

            <Card className="p-6 space-y-4 shadow-lg border-primary/5">
                <div className="relative">
                    <label className="text-xs font-bold text-muted-foreground ml-1 mb-1 block">SO'Z (ENGLISH)</label>
                    <div className="relative">
                        <Input value={word} onChange={e => setWord(e.target.value)} placeholder="Apple..." className="h-14 text-lg pl-4 pr-12" />
                        <Button size="sm" variant="ghost" onClick={handleAutoFill} disabled={!word || isAutoFilling} className="absolute right-2 top-2 h-10 w-10 rounded-lg text-purple-600 hover:bg-purple-50">
                            {isAutoFilling ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-muted-foreground ml-1 mb-1 block">TARJIMA</label>
                    <Input value={translation} onChange={e => setTranslation(e.target.value)} placeholder="Olma..." className="h-14 text-lg" />
                </div>

                <div>
                    <label className="text-xs font-bold text-muted-foreground ml-1 mb-1 block">TA'RIF (DEFINITION)</label>
                    <textarea
                        value={definition}
                        onChange={e => setDefinition(e.target.value)}
                        placeholder="Izoh..."
                        className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-muted-foreground ml-1 mb-1 block">PAPKA</label>
                    <select className="w-full h-14 rounded-xl border border-input bg-background px-3 font-medium text-lg" value={targetCollection} onChange={(e) => setTargetCollection(e.target.value)}>{collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
                </div>

                <Button onClick={handleSave} className="w-full h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white mt-4">Saqlash</Button>
            </Card>
        </div>
    );
};

const ScannerPage = () => {
    const [method, setMethod] = useState(null);
    if (method === 'highlight') return <HighlightedScanner onBack={() => setMethod(null)} />;
    if (method === 'select') return <SelectionScanner onBack={() => setMethod(null)} />;
    if (method === 'manual') return <ManualEntryScanner onBack={() => setMethod(null)} />;
    return (
        <div className="space-y-6 p-4 animate-fade-in pb-32">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Scanner</h2>
                <p className="text-muted-foreground">Yangi so'zlarni qo'shish usulini tanlang</p>
            </div>
            <div className="grid gap-4">
                {[
                    { id: 'highlight', title: "Highlighted Words", desc: "Markerlangan so'zlarni ajratish", icon: Highlighter, color: "bg-yellow-100 text-yellow-700" },
                    { id: 'select', title: "Select from Image", desc: "Rasmdan so'zlarni tanlash", icon: MousePointerClick, color: "bg-blue-100 text-blue-700" },
                    { id: 'manual', title: "Manual Entry", desc: "Qo'lda kiritish (AI yordamida)", icon: Type, color: "bg-purple-100 text-purple-700" }
                ].map(opt => (
                    <Card key={opt.id} onClick={() => setMethod(opt.id)} className="p-6 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-all border-border/50 hover:border-primary/20 hover:-translate-y-1 active:scale-[0.98]">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${opt.color} shadow-sm`}>
                            <opt.icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-lg">{opt.title}</h3>
                            <p className="text-sm text-muted-foreground leading-tight">{opt.desc}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                    </Card>
                ))}
            </div>
        </div>
    );
};
// --- Games ---
const FlashcardsPage = ({ words, collectionId, onBack, onSwitchGame }) => {
    const { updateWordStatus, updateWordData, addPoints } = useApp();
    const { addToast } = useToast();
    const playSound = useSound();

    // Session State
    const [queue, setQueue] = useState([]);
    const [index, setIndex] = useState(0);
    const [stats, setStats] = useState({ correct: [], wrong: [] });
    const [isFinished, setIsFinished] = useState(false);

    // Card State
    const [isFlipped, setIsFlipped] = useState(false);
    const [aiExplanation, setAiExplanation] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Gesture State
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const sessionStarted = useRef(false);

    useEffect(() => {
        if (sessionStarted.current) return;
        // SRS Queue Logic
        const now = Date.now();
        const dueReviews = words.filter(w => w.status !== 'new' && w.nextReview && w.nextReview <= now);
        const newWords = words.filter(w => w.status === 'new').slice(0, 10);

        let finalQueue = [...dueReviews, ...newWords];

        // Use unique set to avoid duplicates if falling back
        const uniqueIds = new Set(finalQueue.map(w => w.id));

        // Fill up to 10 words if queue is small with random learning/mastered words
        if (finalQueue.length < 5) {
            const filler = words.filter(w => !uniqueIds.has(w.id)).sort(() => 0.5 - Math.random()).slice(0, 10 - finalQueue.length);
            finalQueue = [...finalQueue, ...filler];
        }

        // If STILL empty (user has 0 words), show toast
        if (finalQueue.length === 0) {
            addToast("Papkada so'zlar yo'q.", 'error');
            onBack();
            return;
        }

        setQueue(finalQueue);
        sessionStarted.current = true;
    }, [words]);

    const currentWord = queue[index];

    // Auto-Translate Effect
    useEffect(() => {
        if (!currentWord) return;
        if (!currentWord.translation && !isTranslating) {
            const fetchTranslation = async () => {
                setIsTranslating(true);
                try {
                    const res = await mockAiService(`Translate "${currentWord.word}" to Uzbek. Return JSON: {"translation": "...", "definition": "..."}`);
                    const data = parseGeminiJSON(res);
                    if (data && data.translation) {
                        updateWordData(collectionId, currentWord.id, {
                            translation: data.translation,
                            definition: data.definition || currentWord.definition
                        });
                    }
                } catch (e) { console.error("Auto-translate error", e); }
                setIsTranslating(false);
            };
            fetchTranslation();
        }
    }, [currentWord]);

    const handleGrade = (grade) => {
        const updatedWord = calculateNextReview(currentWord, grade);
        updateWordData(collectionId, currentWord.id, updatedWord);
        addPoints(grade >= 4 ? 10 : 2);

        // Track stats
        if (grade >= 4) {
            setStats(prev => ({ ...prev, correct: [...prev.correct, currentWord.id] }));
            playSound && playSound('success');
        } else {
            setStats(prev => ({ ...prev, wrong: [...prev.wrong, currentWord.id] }));
            playSound && playSound('error');
        }

        setDragX(0); setIsFlipped(false); setAiExplanation(null);

        if (index < queue.length - 1) {
            setIndex(i => i + 1);
        } else {
            setIsFinished(true);
        }
    };

    // --- Summary Actions ---
    const handleKeepReviewing = () => {
        const wrongWords = words.filter(w => stats.wrong.includes(w.id));
        if (wrongWords.length === 0) {
            addToast("Barchasi o'zlashtirildi!", 'success');
            onBack();
            return;
        }
        setQueue(wrongWords);
        setIndex(0);
        setStats({ correct: [], wrong: [] });
        setIsFinished(false);
        addToast(`${wrongWords.length} ta so'z qayta tiklanmoqda`, 'info');
    };

    const handleRestart = () => {
        setIndex(0);
        setStats({ correct: [], wrong: [] });
        setIsFinished(false);
    };

    // --- Render Summary ---
    if (isFinished) {
        const total = stats.correct.length + stats.wrong.length;
        const percentage = total > 0 ? Math.round((stats.correct.length / total) * 100) : 0;

        return (
            <div className="p-6 h-[calc(100vh-80px)] flex flex-col items-center justify-center space-y-8 animate-fade-in relative">
                <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4"><X className="h-6 w-6" /></Button>

                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-primary">Nice work!</h2>
                    <p className="text-muted-foreground font-medium text-lg">Now let's try some practice questions.</p>
                </div>

                <div className="flex items-center gap-8 w-full max-w-sm justify-center">
                    <div className="relative h-32 w-32 flex items-center justify-center">
                        <svg className="h-full w-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" className="stroke-orange-100 fill-none" strokeWidth="12" />
                            <circle cx="64" cy="64" r="56" className="stroke-orange-500 fill-none" strokeWidth="12" strokeDasharray={351} strokeDashoffset={351 - (351 * percentage) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-3xl font-black text-primary">{percentage}%</span>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold flex justify-between items-center w-32">
                            <span>Know</span> <span>{stats.correct.length}</span>
                        </div>
                        <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold flex justify-between items-center w-32">
                            <span>Still learning</span> <span>{stats.wrong.length}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-sm space-y-3 pt-6">
                    <Button onClick={() => onSwitchGame && onSwitchGame('writing')} className="w-full h-14 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                        Practice with questions
                    </Button>

                    {stats.wrong.length > 0 && (
                        <Button onClick={handleKeepReviewing} variant="outline" className="w-full h-14 text-lg rounded-full border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                            Keep reviewing {stats.wrong.length} terms
                        </Button>
                    )}

                    <Button variant="ghost" onClick={handleRestart} className="w-full text-indigo-500 hover:bg-transparent hover:text-indigo-600">
                        Restart Flashcards
                    </Button>
                </div>
            </div>
        );
    }

    // Gesture Handlers (Unified for Mouse & Touch)
    const handlePointerDown = (e) => {
        setIsDragging(true);
        startX.current = e.clientX || e.touches?.[0].clientX;
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const clientX = e.clientX || e.touches?.[0].clientX;
        if (clientX) setDragX(clientX - startX.current);
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        if (dragX > 100) handleGrade(4); // Right -> Good
        else if (dragX < -100) handleGrade(0); // Left -> Again
        else setDragX(0);
    };

    const handleSpeak = (e) => {
        e.stopPropagation();
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slightly slower for clarity
        window.speechSynthesis.speak(utterance);
    };

    const askAi = async (e) => {
        e.stopPropagation();
        try {
            const res = await mockAiService(`Explain "${currentWord.word}" simply in Uzbek.`);
            setAiExplanation(typeof res === 'string' ? res : JSON.stringify(res));
        } catch (e) { addToast("Xatolik", 'error'); }
    };

    if (!currentWord) return <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    // Rotate calculation for swipe feel
    const rotate = dragX * 0.05;

    return (
        <div className="mx-auto max-w-md space-y-6 p-6 h-[calc(100vh-80px)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <Button variant="ghost" onClick={onBack} className="pl-0 gap-2 hover:bg-transparent hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /> <span className="text-lg">Orqaga</span></Button>
                <Badge variant="outline" className="text-sm px-3 py-1 font-mono">{index + 1} / {queue.length}</Badge>
            </div>

            {/* Card Container */}
            <div className="flex-1 relative perspective-1000 select-none pb-4"
                onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={() => isDragging && handlePointerUp()}
                onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}
            >
                <div
                    className={`w-full h-full relative transition-transform duration-300 transform-style-3d cursor-pointer will-change-transform`}
                    style={{
                        transform: `translateX(${dragX}px) rotate(${rotate}deg) rotateY(${isFlipped ? 180 : 0}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onClick={() => {
                        if (!isDragging && Math.abs(dragX) < 10) {
                            setIsFlipped(!isFlipped);
                            playSound && playSound('swoosh');
                        }
                    }}
                >
                    {/* Front Card */}
                    <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl">
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                            <Badge variant="secondary" className="opacity-60 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium tracking-wide text-xs px-3 py-1 uppercase">{currentWord.level || "Word"}</Badge>
                            <Button size="icon" variant="ghost" className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full" onClick={handleSpeak}>
                                <Volume2 className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 flex items-center justify-center w-full">
                            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent break-words max-w-full leading-tight">{currentWord.word}</h2>
                        </div>

                        <div className="mt-auto pt-8">
                            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-[0.2em] animate-pulse">Tap to flip</p>
                        </div>

                        {/* Swipe hints */}
                        <div className={`absolute top-12 left-8 border-4 border-green-500 text-green-500 font-black px-4 py-2 rounded-xl rotate-[-15deg] text-4xl uppercase opacity-0 transition-opacity duration-200 ${dragX > 50 ? 'opacity-100' : ''}`}>Bilaman</div>
                        <div className={`absolute top-12 right-8 border-4 border-red-500 text-red-500 font-black px-4 py-2 rounded-xl rotate-[15deg] text-4xl uppercase opacity-0 transition-opacity duration-200 ${dragX < -50 ? 'opacity-100' : ''}`}>Qayta</div>
                    </Card>

                    {/* Back Card */}
                    <Card className="absolute inset-0 backface-hidden flex flex-col p-8 bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl border-2 border-primary/10 rotate-y-180" style={{ transform: 'rotateY(180deg)' }}>
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 w-full">
                            {isTranslating ? (
                                <div className="space-y-4 animate-pulse"><div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto"></div><span className="text-sm font-medium text-muted-foreground">Tarjima izlanmoqda...</span></div>
                            ) : (
                                <div className="space-y-4 w-full">
                                    <h3 className="text-4xl font-bold text-primary break-words leading-tight">{currentWord.translation || "..."}</h3>
                                    {currentWord.definition && <div className="w-12 h-1 bg-border rounded-full mx-auto"></div>}
                                    <p className="text-muted-foreground text-lg leading-relaxed font-medium px-4">{currentWord.definition}</p>
                                </div>
                            )}

                            {aiExplanation && <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl text-sm text-left w-full border border-indigo-100 dark:border-indigo-900/20 text-indigo-900 dark:text-indigo-200 shadow-inner">{aiExplanation}</div>}
                        </div>

                        {!aiExplanation && !isTranslating && (
                            <Button variant="ghost" onClick={askAi} className="mt-6 mx-auto text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 gap-2">
                                <Sparkles className="h-4 w-4" /> <span>Batafsil tushuntirish</span>
                            </Button>
                        )}
                    </Card>
                </div>
            </div>

            {/* SRS Controls - Only visible when flipped */}
            {isFlipped ? (
                <div className="grid grid-cols-4 gap-3 animate-slide-up pb-2">
                    <div className="flex flex-col gap-1 group">
                        <Button onClick={(e) => { e.stopPropagation(); handleGrade(0); }} variant="outline" className="h-14 bg-red-50 hover:bg-red-100 border-red-200 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:border-red-900/30 rounded-2xl flex flex-col items-center justify-center gap-0 transition-all hover:scale-105">
                            <span className="font-bold text-xs">Qayta</span>
                        </Button>
                        <span className="text-[10px] text-center text-muted-foreground font-medium group-hover:text-red-500 transition-colors">1 min</span>
                    </div>
                    <div className="flex flex-col gap-1 group">
                        <Button onClick={(e) => { e.stopPropagation(); handleGrade(3); }} variant="outline" className="h-14 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-600 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 dark:border-orange-900/30 rounded-2xl flex flex-col items-center justify-center gap-0 transition-all hover:scale-105">
                            <span className="font-bold text-xs">Qiyin</span>
                        </Button>
                        <span className="text-[10px] text-center text-muted-foreground font-medium group-hover:text-orange-500 transition-colors">1 kun</span>
                    </div>
                    <div className="flex flex-col gap-1 group">
                        <Button onClick={(e) => { e.stopPropagation(); handleGrade(4); }} variant="outline" className="h-14 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 dark:border-blue-900/30 rounded-2xl flex flex-col items-center justify-center gap-0 transition-all hover:scale-105">
                            <span className="font-bold text-xs">Yaxshi</span>
                        </Button>
                        <span className="text-[10px] text-center text-muted-foreground font-medium group-hover:text-blue-500 transition-colors">3 kun</span>
                    </div>
                    <div className="flex flex-col gap-1 group">
                        <Button onClick={(e) => { e.stopPropagation(); handleGrade(5); }} variant="outline" className="h-14 bg-green-50 hover:bg-green-100 border-green-200 text-green-600 dark:bg-green-900/10 dark:hover:bg-green-900/20 dark:border-green-900/30 rounded-2xl flex flex-col items-center justify-center gap-0 transition-all hover:scale-105">
                            <span className="font-bold text-xs">Oson</span>
                        </Button>
                        <span className="text-[10px] text-center text-muted-foreground font-medium group-hover:text-green-500 transition-colors">7 kun</span>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center text-sm font-medium text-muted-foreground/60 px-6 py-4 border-t border-border/40">
                    <span className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Qayta</span>
                    <span className="flex items-center gap-2">Bilaman <ArrowRight className="h-4 w-4" /></span>
                </div>
            )}
        </div>
    );
};

const MatchingGamePage = ({ words, onBack }) => {
    const { addToast } = useToast();
    const { addPoints } = useApp();
    const playSound = useSound();
    const [selected, setSelected] = useState([]);
    const [matched, setMatched] = useState([]);
    const [items, setItems] = useState([]);

    useEffect(() => {
        // Prepare game items: Take top 6 words and mix them up
        const gameWords = words.sort(() => 0.5 - Math.random()).slice(0, 6);
        const list = [
            ...gameWords.map(w => ({ id: w.id, text: w.word, type: 'word' })),
            ...gameWords.map(w => ({ id: w.id, text: w.translation || '?', type: 'def' }))
        ].sort(() => 0.5 - Math.random());
        setItems(list);
    }, [words]);

    const handleSelect = (item) => {
        if (matched.includes(item.id)) return;
        if (selected.length === 1) {
            if (selected[0].text === item.text) return; // Same item clicked
            const first = selected[0];
            if (first.id === item.id) {
                // Match!
                setMatched([...matched, item.id]);
                setSelected([]);
                addPoints(5);
                addToast("To'g'ri!", 'success');
                playSound && playSound('success');
                if (matched.length + 1 === items.length / 2) {
                    setTimeout(() => { addToast("G'alaba! +30 ball", 'success'); onBack(); }, 1000);
                }
            } else {
                // Wrong
                setSelected([...selected, item]);
                playSound && playSound('error');
                setTimeout(() => setSelected([]), 1000);
            }
        } else {
            setSelected([item]);
            playSound && playSound('pop');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col p-4 animate-scale-in max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={onBack} className="pl-0"><ArrowLeft className="mr-2 h-4 w-4" /> Chiqish</Button>
                <h2 className="text-xl font-bold ml-auto">Juftlikni top</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 flex-1 content-start">
                {items.map((item, idx) => {
                    const isSelected = selected.some(s => s.text === item.text);
                    const isMatched = matched.includes(item.id);
                    return (
                        <Card
                            key={idx}
                            onClick={() => !isMatched && handleSelect(item)}
                            className={`p-2 h-24 flex items-center justify-center text-center text-sm font-bold cursor-pointer transition-all duration-300
                                ${isMatched ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
                                ${isSelected ? 'bg-primary text-primary-foreground scale-105 shadow-xl ring-2 ring-primary' : 'bg-card hover:bg-muted'}
                            `}
                        >
                            {item.text}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

const WritingPracticePage = ({ words, onBack }) => {
    const { addToast } = useToast();
    const { addPoints } = useApp();
    const playSound = useSound();
    const [queue, setQueue] = useState(words.sort(() => 0.5 - Math.random()).slice(0, 10));
    const [index, setIndex] = useState(0);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState('idle'); // idle, correct, wrong

    const currentWord = queue[index];

    const handleCheck = () => {
        if (input.trim().toLowerCase() === currentWord.word.toLowerCase()) {
            setStatus('correct');
            addPoints(10);
            addToast("To'g'ri!", 'success');
            playSound && playSound('success');
            setTimeout(() => {
                if (index < queue.length - 1) {
                    setIndex(i => i + 1);
                    setInput("");
                    setStatus('idle');
                } else {
                    addToast("Mashq tugadi!", 'success');
                    onBack();
                }
            }, 1000);
        } else {
            setStatus('wrong');
            addToast("Xato, qayta urinib ko'ring", 'error');
            playSound && playSound('error');
        }
    };

    if (!currentWord) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <div className="fixed inset-0 z-[60] bg-background p-6 h-full min-h-[100dvh] flex flex-col max-w-md mx-auto overscroll-none">
            <Button variant="ghost" onClick={onBack} className="self-start mb-4 pl-0"><ArrowLeft className="mr-2 h-5 w-5" /> Chiqish</Button>

            <div className="flex-1 space-y-8">
                <div className="space-y-2 text-center">
                    <span className="text-sm text-muted-foreground uppercase tracking-widest">Tarjimani toping</span>
                    <h2 className="text-3xl font-bold">{currentWord.translation}</h2>
                    {status === 'wrong' && <p className="text-red-500 animate-pulse">Javob: {currentWord.word}</p>}
                </div>

                <div className="space-y-4">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className={`h-14 text-center text-xl ${status === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : status === 'wrong' ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="Inglizcha..."
                    />
                    <Button size="lg" className="w-full h-14 text-lg" onClick={handleCheck} disabled={status === 'correct'}>
                        {status === 'correct' ? <Check className="h-6 w-6" /> : "Tekshirish"}
                    </Button>
                </div>
            </div>

            <div className="text-center text-sm text-muted-foreground mb-4">
                {index + 1} / {queue.length}
            </div>
        </div>
    );
};

// --- Middle Pages ---
const FolderDetail = ({ folderId, onBack, onNavigate }) => {
    const { collections, addToCollection, removeWord } = useApp();
    const { addToast } = useToast();
    const [isAddingWord, setIsAddingWord] = useState(false);
    const [addMode, setAddMode] = useState('single'); // 'single' | 'bulk'
    const [newWord, setNewWord] = useState({ word: "", translation: "" });
    const [bulkText, setBulkText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const folder = collections.find(c => c.id === folderId);
    if (!folder) return null;

    const handleAddWord = () => {
        if (!newWord.word || !newWord.translation) return;
        addToCollection(folderId, [{ id: Date.now(), ...newWord, status: 'new' }]);
        setNewWord({ word: "", translation: "" }); setIsAddingWord(false); addToast("So'z qo'shildi", 'success');
    };

    const handleBulkImport = async () => {
        if (!bulkText.trim()) return;
        setIsAnalyzing(true);
        try {
            // Robust prompt for parsing AND translating
            const prompt = `Act as a dictionary data parser. 
            Step 1: Extract English words/phrases from the text. Ignore numbers/bullets (a, b, 1. etc).
            Step 2: If the text already has a translation, use it. IF NOT, TRANSLATE the English word to UZBEK yourself.
            
            Return ONLY a raw JSON array of objects:
            [{"word": "english_word", "translation": "uzbek_translation"}]
            
            Text to parse and translate:
            ${bulkText}`;

            const resText = await mockAiService(prompt, null); // Pass null for image
            const parsed = parseGeminiJSON(resText);

            if (Array.isArray(parsed) && parsed.length > 0) {
                const newItems = parsed.map((w, i) => ({
                    id: Date.now() + i,
                    word: w.word,
                    translation: w.translation || "",
                    status: 'new'
                }));
                addToCollection(folderId, newItems);
                addToast(`${newItems.length} ta so'z qo'shildi!`, 'success');
                setIsAddingWord(false);
                setBulkText("");
            } else {
                addToast("So'zlar topilmadi yoki format noto'g'ri", 'error');
            }
        } catch (e) {
            console.error(e);
            addToast("Xatolik yuz berdi", 'error');
        }
        setIsAnalyzing(false);
    };

    return (
        <div className="p-4 space-y-6 pb-32 animate-slide-up">
            <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button><div><h2 className="text-2xl font-bold">{folder.title}</h2><p className="text-muted-foreground">{folder.words} ta so'z</p></div></div>
            <div className="flex gap-2"><Button className="flex-1" onClick={() => onNavigate('learn', { folderId })}> <Play className="h-4 w-4 mr-2" /> O'rganish</Button><Button variant="outline" onClick={() => setIsAddingWord(true)}><Plus className="h-4 w-4" /></Button></div>

            {isAddingWord && (
                <Card className="p-4 space-y-4 bg-muted/30 border-2 border-primary/20">
                    <div className="flex p-1 bg-background rounded-lg border">
                        <button onClick={() => setAddMode('single')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${addMode === 'single' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}`}>Bittalab</button>
                        <button onClick={() => setAddMode('bulk')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${addMode === 'bulk' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}`}>Ro'yxatdan</button>
                    </div>

                    {addMode === 'single' ? (
                        <div className="space-y-3 animate-fade-in">
                            <Input placeholder="So'z (English)" value={newWord.word} onChange={e => setNewWord({ ...newWord, word: e.target.value })} autoFocus />
                            <Input placeholder="Tarjima" value={newWord.translation} onChange={e => setNewWord({ ...newWord, translation: e.target.value })} />
                            <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setIsAddingWord(false)}>Bekor</Button><Button size="sm" onClick={handleAddWord}>Saqlash</Button></div>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-fade-in">
                            <textarea
                                className="w-full h-32 p-3 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="So'zlarni bu yerga tashlang...&#10;Masalan:&#10;a) situation b) per annum&#10;1. apple - olma"
                                value={bulkText}
                                onChange={e => setBulkText(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsAddingWord(false)}>Bekor</Button>
                                <Button size="sm" onClick={handleBulkImport} isLoading={isAnalyzing} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                                    <Sparkles className="h-4 w-4 mr-2" /> Sehrli Import
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <div className="space-y-2">{folder.wordList.map((word) => (
                <Card key={word.id} className="p-3 flex justify-between items-center group">
                    <div><div className="font-medium">{word.word}</div><div className="text-sm text-muted-foreground">{word.translation}</div></div>
                    <div className="flex items-center gap-2">
                        <Badge variant={word.status === 'mastered' ? 'default' : 'secondary'}>{word.status === 'mastered' ? "Bilaman" : "O'rganish"}</Badge>
                        <button onClick={(e) => { e.stopPropagation(); removeWord(folderId, word.id); }} className="p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                </Card>
            ))}</div>
        </div>
    );
};

// LearnPage defined BEFORE MainContent to fix ReferenceError
const LearnPage = ({ initialFolderId }) => {
    const { collections } = useApp();
    const [step, setStep] = useState(initialFolderId ? 'method' : 'folder');
    const [selectedFolderId, setSelectedFolderId] = useState(initialFolderId || null);
    const [mode, setMode] = useState(null);
    const folder = collections.find(c => c.id === selectedFolderId);

    if (step === 'game' && folder) {
        const props = { words: folder.wordList, collectionId: folder.id, onBack: () => setStep('method') };
        if (mode === 'flashcards') return <FlashcardsPage {...props} onSwitchGame={(newMode) => { setMode(newMode); setStep('game'); }} />;
        if (mode === 'matching') return <MatchingGamePage {...props} />;
        if (mode === 'writing') return <WritingPracticePage {...props} />;
    }

    if (step === 'method') {
        return (
            <div className="p-4 space-y-6 animate-slide-up pb-32">
                <Button variant="ghost" onClick={() => setStep('folder')} className="pl-0"><ArrowLeft className="mr-2 h-4 w-4" /> Papkalar</Button>

                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Mashq usullari</h2>
                    <p className="text-muted-foreground">O'zingizga qulay usulni tanlang</p>
                </div>

                <div className="grid gap-4">
                    <Card onClick={() => { setMode('flashcards'); setStep('game'); }} className="p-5 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-all border-border/50 hover:border-green-200 active:scale-[0.98]">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-green-100 text-green-600">
                            <RotateCcw className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Kartochkalar</h3>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Xotirani charxlash</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                    </Card>

                    <Card onClick={() => { setMode('matching'); setStep('game'); }} className="p-5 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-all border-border/50 hover:border-yellow-200 active:scale-[0.98]">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-yellow-100 text-yellow-600">
                            <Zap className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Juftlikni topish</h3>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Tezkor o'yin</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                    </Card>

                    <Card onClick={() => { setMode('writing'); setStep('game'); }} className="p-5 flex items-center gap-5 cursor-pointer hover:shadow-lg transition-all border-border/50 hover:border-blue-200 active:scale-[0.98]">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-blue-100 text-blue-600">
                            <PenLine className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Yozish mashqi</h3>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">To'g'ri yozish</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 pb-32">
            <h2 className="text-2xl font-bold">Qaysi papkadan o'rganamiz?</h2>
            {collections.length === 0 ? <div className="text-center text-muted-foreground py-10">Papkalar yo'q.</div> :
                collections.map(c => (<Card key={c.id} onClick={() => { setSelectedFolderId(c.id); setStep('method'); }} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30"><div className="text-2xl">{c.icon}</div><div className="flex-1"><h3 className="font-bold">{c.title}</h3><p className="text-sm text-muted-foreground">{c.words} ta so'z</p></div><ChevronRight className="h-5 w-5 text-muted-foreground" /></Card>))}
        </div>
    );
};

const MenuPage = () => {
    const { user, setUser, isDarkMode, toggleTheme, currentUser, loginWithGoogle, logout } = useApp();
    const { addToast } = useToast();

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Vocab Builder',
                text: 'Mening so\'z boyligimni oshirishda yordam beradigan ilova!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            addToast("Ulashish imkoni yo'q", 'info');
        }
    };

    return (
        <div className="p-4 space-y-6 pb-32 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight">Menu</h2>

            <Card className="p-6 flex items-center gap-4 shadow-sm border-border">
                {currentUser ? (
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary">
                        <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="h-16 w-16 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center text-xl font-bold">
                        {user.name.substring(0, 2).toUpperCase()}
                    </div>
                )}
                <div>
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <div className="text-sm text-yellow-600 font-medium bg-yellow-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        {currentUser ? "Bulutli Hisob" : "Mehmon Rejimi"}
                    </div>
                </div>
            </Card>

            {!currentUser && (
                <Button onClick={loginWithGoogle} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <div className="h-5 w-5 bg-white rounded-full p-0.5"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" /></div>
                    Google bilan kirish
                </Button>
            )}

            <div className="space-y-3">
                <h3 className="font-semibold text-lg ml-1">Yutuqlar</h3>
                <Card className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"><Star className="h-5 w-5 text-muted-foreground" /></div>
                    <div><h4 className="font-bold">Boshlovchi</h4><p className="text-xs text-muted-foreground">100 ball to'plandi</p></div>
                </Card>
                <Card className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"><BookOpen className="h-5 w-5 text-muted-foreground" /></div>
                    <div><h4 className="font-bold">Olim</h4><p className="text-xs text-muted-foreground">50 ta so'z o'rganildi</p></div>
                </Card>
            </div>

            <Card onClick={handleShare} className="p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99] border-blue-100 hover:border-blue-300 group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors"><Share2 className="h-5 w-5" /></div>
                    <span className="font-medium">Do'stlar bilan ulashish</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
            </Card>

            <Card className="p-5 flex items-center justify-between border-yellow-100 hover:border-yellow-300">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full"><div className="h-5 w-5 rounded-full bg-yellow-400 border-2 border-white shadow-sm" /></div>
                    <div>
                        <div className="font-medium">Kunduzgi rejim</div>
                        <div className="text-xs text-muted-foreground">Ko'z uchun qulay (Hozir: {isDarkMode ? "Tungi" : "Kunduzgi"})</div>
                    </div>
                </div>
                <div
                    onClick={toggleTheme}
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${!isDarkMode ? 'bg-zinc-200' : 'bg-green-500'}`}
                >
                    <div className={`absolute top-1 bg-white shadow-sm w-5 h-5 rounded-full transition-all duration-300 ${!isDarkMode ? 'left-1' : 'left-6'}`} />
                </div>
            </Card>

            {currentUser ? (
                <Card className="p-5 flex items-center justify-between border-red-100 hover:border-red-300 cursor-pointer" onClick={logout}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-full"><Trash2 className="h-5 w-5" /></div>
                        <span className="font-medium text-red-600">Tizimdan chiqish</span>
                    </div>
                </Card>
            ) : (
                <Card className="p-5 flex items-center justify-between border-red-100 hover:border-red-300 cursor-pointer" onClick={() => { localStorage.clear(); window.location.reload(); }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-full"><Trash2 className="h-5 w-5" /></div>
                        <span className="font-medium text-red-600">Ma'lumotlarni o'chirish (Local)</span>
                    </div>
                </Card>
            )}
        </div>
    );
};

const LeaderboardPage = () => {
    const { user } = useApp();
    return (
        <div className="p-4 space-y-4 pb-32">
            <h2 className="text-2xl font-bold">Reyting</h2>
            <div className="space-y-2">{[1, 2, 3].map(i => <Card key={i} className="p-4 flex items-center gap-4"><div className="font-bold w-6 text-muted-foreground">#{i}</div><div className="flex-1 font-medium text-muted-foreground">User {i}</div><div className="font-bold">... XP</div></Card>)}</div>
            <div className="fixed bottom-24 left-4 right-4"><Card className="p-4 flex items-center gap-4 bg-primary text-primary-foreground"><div className="font-bold w-6">#15</div><div className="flex-1 font-bold">{user.name}</div><div className="font-bold">{user.points} XP</div></Card></div>
        </div>
    );
};

const HomePage = ({ onNavigate }) => {
    const { user, addCollection, removeCollection, collections, currentUser, loginWithGoogle } = useApp();
    const { addToast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAiMode, setIsAiMode] = useState(false);
    const [view, setView] = useState('list');
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    const handleCreate = async () => {
        if (!folderName.trim()) return;
        if (isAiMode) {
            setIsGenerating(true);
            try {
                const resText = await mockAiService(`Create a vocabulary list about "${folderName}"`);
                const data = parseGeminiJSON(resText);
                if (data && data.wordList) { addCollection(data.title, data.icon, data.wordList.map((w, i) => ({ ...w, id: Date.now() + i }))); addToast("AI papka yaratdi!", 'success'); }
                else addToast("Xatolik", 'error');
            } catch (e) { addToast("Xatolik", 'error'); }
            setIsGenerating(false);
        } else {
            addCollection(folderName, "📁", []); addToast("Papka yaratildi", 'success');
        }
        setFolderName(""); setIsAdding(false);
    };

    if (view === 'detail' && selectedFolderId) return <FolderDetail folderId={selectedFolderId} onBack={() => setView('list')} onNavigate={onNavigate} />;

    return (
        <div className="mx-auto max-w-md space-y-6 p-4 pb-32">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold">Xush kelibsiz!</h1><p className="text-xs text-muted-foreground">{user.name}</p></div>
                {!currentUser && <Button size="sm" variant="outline" onClick={loginWithGoogle} className="gap-2"><User className="h-4 w-4" /> Kirish</Button>}
                {currentUser && <div className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden border"><img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" /></div>}
            </div>
            <Card className="p-5 border-0 bg-primary text-primary-foreground shadow-lg"><div className="flex justify-between mb-2"><span className="text-sm font-medium opacity-90">Kunlik maqsad</span><span className="font-bold">{user.dailyChallenge.completed}/{user.dailyChallenge.total}</span></div><Progress value={(user.dailyChallenge.completed / user.dailyChallenge.total) * 100} className="h-2 bg-primary-foreground/20" /></Card>
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Papkalaringiz</h3><Button onClick={() => setIsAdding(true)} variant="ghost" size="sm" className="gap-1 text-primary"><Plus className="h-4 w-4" /> Yangi</Button></div>
            {isAdding && (
                <Card className="p-4 border-2 border-primary/20 animate-fade-in">
                    <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Nomi..." autoFocus />
                    <div className="flex gap-2 mt-3 justify-end"><Button variant="ghost" onClick={() => setIsAdding(false)}>Bekor</Button><Button onClick={handleCreate}>Yaratish</Button></div>
                </Card>
            )}
            <div className="grid grid-cols-1 gap-3">
                {collections.map((col) => (
                    <div key={col.id} className="relative group">
                        <Card onClick={() => { setSelectedFolderId(col.id); setView('detail'); }} className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${col.color}`}>{col.icon}</div>
                            <div className="flex-1 space-y-1"><div className="flex justify-between items-center"><h4 className="font-semibold">{col.title}</h4><span className="text-xs font-medium text-muted-foreground">{col.progress}%</span></div><Progress value={col.progress} className="h-1" /></div>
                        </Card>
                        <button onClick={(e) => { e.stopPropagation(); removeCollection(col.id); }} className="absolute -right-2 -top-2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-md"><X className="h-3 w-3" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MainContent = ({ activeTab, setActiveTab }) => {
    const { user, setTutorialSeen } = useApp();
    const [navData, setNavData] = useState(null);
    const handleNavigate = (tab, data) => { setActiveTab(tab); setNavData(data); };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
            {!user.tutorialSeen && <Onboarding onFinish={setTutorialSeen} />}
            <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-md items-center justify-between px-4"><div><h1 className="text-xl font-bold tracking-tight">Vocab Builder</h1></div><StreakBadge /></div></header>
            <main className="pb-24">
                {activeTab === "home" && <HomePage onNavigate={handleNavigate} />}
                {activeTab === "learn" && <LearnPage initialFolderId={navData?.folderId} />}
                {activeTab === "scan" && <ScannerPage />}
                {activeTab === "leaderboard" && <LeaderboardPage />}
                {activeTab === "menu" && <MenuPage />}
            </main>
            <nav className="fixed bottom-6 left-0 right-0 z-50 px-4">
                <div className="mx-auto max-w-md relative flex items-center justify-center">
                    <div className="flex w-full items-center justify-around rounded-full bg-[#212529]/90 backdrop-blur-md px-4 py-3 shadow-2xl border border-white/10">
                        {['home', 'learn', 'scan', 'leaderboard', 'menu'].map(t => (
                            <button key={t} onClick={() => { setActiveTab(t); setNavData(null); }} className={cn("p-2 rounded-full transition-all", activeTab === t ? "text-white bg-white/20" : "text-gray-400 hover:text-white", t === 'scan' && "bg-blue-600 text-white shadow-lg shadow-blue-500/40 p-3 hover:bg-blue-500 scale-110 -translate-y-1 mx-2")}>
                                {t === 'home' && <AnimatedHome isActive={activeTab === 'home'} className="h-6 w-6" />}
                                {t === 'learn' && <AnimatedGraduationCap isActive={activeTab === 'learn'} className="h-6 w-6" />}
                                {t === 'scan' && <Scan className="h-6 w-6" />}
                                {t === 'leaderboard' && <AnimatedTrophy isActive={activeTab === 'leaderboard'} className="h-6 w-6" />}
                                {t === 'menu' && <AnimatedMenu isActive={activeTab === 'menu'} className="h-6 w-6" />}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState("home");
    return (
        <ToastProvider>
            <AppProvider>
                <GlobalStyles />
                <MainContent activeTab={activeTab} setActiveTab={setActiveTab} />
            </AppProvider>
        </ToastProvider>
    );
}
