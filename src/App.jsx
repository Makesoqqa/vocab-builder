import React, { useState, useEffect, useRef } from 'react';
import {
    Upload, CheckCircle, Edit3, Trash2, Loader2, Image as ImageIcon, X,
    ChevronLeft, Home, GraduationCap, Trophy, User, Plus, Folder, Library,
    ArrowLeft, Trash, RefreshCw, Zap, Check, Moon, Sun, ArrowRight
} from 'lucide-react';

// API kaliti muhit tomonidan avtomatik taqdim etiladi
const apiKey = "";

// --- SOUND ENGINE (Web Audio API) ---
const playSound = (type) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'wrong') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'finish') {
            const notes = [400, 500, 600, 800];
            notes.forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'triangle';
                o.frequency.value = freq;
                g.gain.setValueAtTime(0.05, now + i * 0.1);
                g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
                o.start(now + i * 0.1);
                o.stop(now + i * 0.1 + 0.4);
            });
        } else if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    } catch (e) {
        console.error("Audio error:", e);
    }
};

export default function App() {
    const [activeTab, setActiveTab] = useState('scan');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detectedWords, setDetectedWords] = useState([]);
    const [step, setStep] = useState(1);
    const [viewingFolder, setViewingFolder] = useState(null);

    // --- THEME STATE ---
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('app_theme') || 'light';
        } catch {
            return 'light';
        }
    });

    // --- LEARNING STATE ---
    const [learnState, setLearnState] = useState('select_method');
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [flashcardDirection, setFlashcardDirection] = useState('eng_uz'); // 'eng_uz', 'uz_eng', 'def_uz', 'uz_def'
    const [sessionQueue, setSessionQueue] = useState([]);
    const [nextRoundQueue, setNextRoundQueue] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [sessionScore, setSessionScore] = useState(0);

    // Flashcard Swipe States
    const [isFlipped, setIsFlipped] = useState(false);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [swipeResult, setSwipeResult] = useState(null);
    const startX = useRef(0);

    const [matchSelected, setMatchSelected] = useState(null);
    const [fillInput, setFillInput] = useState('');
    const [fillFeedback, setFillFeedback] = useState(null);
    const [animState, setAnimState] = useState('');

    const [folders, setFolders] = useState(() => {
        try {
            const saved = localStorage.getItem('vocab_folders');
            return saved ? JSON.parse(saved) : ['Asosiy lug\'at', 'IELTS Prep', 'Sayohat'];
        } catch (e) {
            return ['Asosiy lug\'at', 'IELTS Prep', 'Sayohat'];
        }
    });

    const [vocabulary, setVocabulary] = useState(() => {
        try {
            const saved = localStorage.getItem('vocab_data');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    const [selectedFolder, setSelectedFolder] = useState('Asosiy lug\'at');
    const [newFolderName, setNewFolderName] = useState('');
    const [showAddFolder, setShowAddFolder] = useState(false);

    useEffect(() => {
        localStorage.setItem('vocab_folders', JSON.stringify(folders));
    }, [folders]);

    useEffect(() => {
        localStorage.setItem('vocab_data', JSON.stringify(vocabulary));
    }, [vocabulary]);

    useEffect(() => {
        localStorage.setItem('app_theme', theme);
    }, [theme]);

    useEffect(() => {
        if (selectedFile && step === 1) {
            uploadImage();
        }
    }, [selectedFile]);

    useEffect(() => {
        if (animState) {
            const timer = setTimeout(() => setAnimState(''), 500);
            return () => clearTimeout(timer);
        }
    }, [animState]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDetectedWords([]);
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const uploadImage = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const base64Data = await fileToBase64(selectedFile || document.getElementById('fileInput').files[0]);

            const prompt = `Ushbu rasmda marker (highlight) bilan bo'yalgan inglizcha so'zlarni aniqlang. 
      Faqat bo'yalgan so'zlarni toping. Natijani FAQAT JSON formatida qaytaring: 
      {"words": [{"text": "word", "confidence": 0.95}]}`;

            const payload = {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: "image/png", data: base64Data } }
                    ]
                }],
                generationConfig: { responseMimeType: "application/json" }
            };

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (resultText) {
                const parsed = JSON.parse(resultText);
                setDetectedWords(parsed.words.map(w => ({ ...w, confirmed: true })));
                setStep(2);
                playSound('finish');
            }
        } catch (error) {
            console.error("Xatolik:", error);
            alert("Rasm tahlilida xato yuz berdi.");
            setSelectedFile(null);
            setPreviewUrl(null);
            playSound('wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFolder = (e) => {
        if (e) e.preventDefault();
        const name = newFolderName.trim();
        if (name && !folders.includes(name)) {
            setFolders(prev => [...prev, name]);
            setSelectedFolder(name);
            setNewFolderName('');
            setShowAddFolder(false);
            playSound('click');
        }
    };

    const deleteFolder = (folderName, e) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(`"${folderName}" to'plamini o'chirmoqchimisiz?`);
        if (confirmDelete) {
            setFolders(prev => prev.filter(f => f !== folderName));
            setVocabulary(prev => {
                const newVocab = { ...prev };
                delete newVocab[folderName];
                return newVocab;
            });
            if (selectedFolder === folderName) setSelectedFolder(folders[0] || '');
            playSound('wrong');
        }
    };

    const handleFinalSave = () => {
        const wordsToSave = detectedWords.filter(w => w.confirmed).map(w => w.text);
        if (wordsToSave.length === 0) return;

        setVocabulary(prev => {
            const currentFolderWords = prev[selectedFolder] || [];
            const updatedWords = [...new Set([...currentFolderWords, ...wordsToSave])];
            return { ...prev, [selectedFolder]: updatedWords };
        });

        alert(`${wordsToSave.length} ta so'z saqlandi!`);
        playSound('finish');
        setStep(1);
        setSelectedFile(null);
        setPreviewUrl(null);
        setDetectedWords([]);
    };

    const deleteWordFromFolder = (folderName, wordToDelete) => {
        setVocabulary(prev => ({
            ...prev,
            [folderName]: prev[folderName].filter(w => w !== wordToDelete)
        }));
        playSound('click');
    };

    const selectLearningMethod = (method) => {
        setSelectedMethod(method);
        if (method === 'flashcard') {
            setLearnState('select_direction');
        } else {
            setLearnState('select_folder');
        }
        playSound('click');
    };

    const selectDirection = (direction) => {
        setFlashcardDirection(direction);
        setLearnState('select_folder');
        playSound('click');
    };

    const startLearningSession = async (folderName) => {
        playSound('click');
        const words = vocabulary[folderName] || [];
        if (words.length === 0) {
            setAnimState('shake');
            playSound('wrong');
            alert("Bu papkada so'zlar yo'q!");
            return;
        }

        setLearnState('loading');
        setNextRoundQueue([]);

        const sessionWords = words.sort(() => 0.5 - Math.random()).slice(0, 10);

        try {
            let instruction = "";
            if (selectedMethod === 'flashcard') {
                instruction = `All items MUST be of type 'flashcard'. Structure: {"word": "english_word", "translation": "uzbek_translation", "definition": "short_simple_english_definition", "type": "flashcard"}`;
            } else if (selectedMethod === 'filling') {
                instruction = `All items MUST be of type 'filling'. Structure: {"word": "english_word", "translation": "uzbek_translation", "type": "filling", "puzzle": "w_rd"} (replace 1-2 letters with underscore).`;
            } else if (selectedMethod === 'match') {
                instruction = `All items MUST be of type 'match'. Structure: {"word": "english_word", "translation": "uzbek_translation", "type": "match", "options": ["english_word", "wrong1", "wrong2", "wrong3"]} (options should be 4 english words including correct one).`;
            }

            const prompt = `Create a learning session for these English words: ${JSON.stringify(sessionWords)}. 
      Return ONLY JSON array. 
      ${instruction}
      Ensure translations are in Uzbek. Definitions should be in simple English.`;

            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            };

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            const sessionData = JSON.parse(data.candidates[0].content.parts[0].text);

            setSessionQueue(sessionData);
            setCurrentCardIndex(0);
            setSessionScore(0);
            setLearnState('playing');
            playSound('finish');
        } catch (e) {
            console.error(e);
            alert("Sessiyani yuklashda xatolik.");
            setLearnState('select_method');
        }
    };

    const handleDragStart = (e) => {
        setIsDragging(true);
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        startX.current = clientX;
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = clientX - startX.current;
        setDragX(diff);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const threshold = 100;

        if (dragX > threshold) {
            finishSwipe('right');
        } else if (dragX < -threshold) {
            finishSwipe('left');
        } else {
            setDragX(0);
        }
    };

    const finishSwipe = (direction) => {
        setSwipeResult(direction);
        setDragX(direction === 'right' ? 500 : -500);

        if (direction === 'right') playSound('correct');
        else playSound('wrong');

        const currentCard = sessionQueue[currentCardIndex];
        let updatedNextQueue = [...nextRoundQueue];

        if (direction === 'right') {
            setSessionScore(prev => prev + 10);
        } else {
            updatedNextQueue.push(currentCard);
            setNextRoundQueue(updatedNextQueue);
        }

        setTimeout(() => {
            if (currentCardIndex + 1 >= sessionQueue.length) {
                if (updatedNextQueue.length > 0) {
                    setSessionQueue(updatedNextQueue);
                    setNextRoundQueue([]);
                    setCurrentCardIndex(0);
                } else {
                    setLearnState('summary');
                    playSound('finish');
                }
            } else {
                setCurrentCardIndex(prev => prev + 1);
            }

            setSwipeResult(null);
            setDragX(0);
            setIsFlipped(false);
        }, 300);
    };

    const handleClick = () => {
        if (Math.abs(dragX) < 5) {
            setIsFlipped(!isFlipped);
            playSound('click');
        }
    };

    const handleCardResult = (result) => {
        const currentCard = sessionQueue[currentCardIndex];
        if (result === 'mastered') {
            setAnimState('pop');
            playSound('correct');
            setSessionScore(prev => prev + 10);
            setTimeout(() => {
                if (currentCardIndex + 1 >= sessionQueue.length) {
                    setLearnState('summary');
                    playSound('finish');
                } else {
                    setCurrentCardIndex(prev => prev + 1);
                }
            }, 600);
        } else {
            setAnimState('shake');
            playSound('wrong');
            setTimeout(() => {
                const updatedQueue = [...sessionQueue, currentCard];
                setSessionQueue(updatedQueue);
                setCurrentCardIndex(prev => prev + 1);
            }, 600);
        }
        setTimeout(() => {
            setIsFlipped(false);
            setFillInput('');
            setFillFeedback(null);
            setMatchSelected(null);
        }, 600);
    };

    const renderFolderDetail = (folderName) => {
        const words = vocabulary[folderName] || [];
        return (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-500 pb-32">
                <header className="flex items-center gap-4">
                    <button onClick={() => { setViewingFolder(null); playSound('click'); }} className={`p-3 border-2 border-b-4 rounded-xl transition-all active:border-b-0 active:translate-y-1 active:scale-95 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-white hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] text-[#afafaf] hover:bg-[#f7f7f7]'}`}><ArrowLeft size={24} strokeWidth={3} /></button>
                    <div className="flex-1"><h2 className={`text-2xl font-black truncate ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>{folderName}</h2><p className={`font-bold ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>{words.length} ta so'z</p></div>
                </header>
                {words.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-20 rounded-[2.5rem] border-2 border-dashed animate-in zoom-in duration-300 ${theme === 'dark' ? 'bg-[#131f24] border-[#2b3b45] text-[#52656d]' : 'bg-[#f7f7f7] border-[#e5e5e5] text-[#afafaf]'}`}><Library size={48} className="mb-4 opacity-20" /><p className="font-bold">Hali so'zlar yo'q</p><button onClick={() => { setViewingFolder(null); setStep(1); setActiveTab('scan'); playSound('click'); }} className="mt-4 text-[#1cb0f6] font-black uppercase text-sm hover:underline">+ So'z qo'shish</button></div>
                ) : (
                    <div className="space-y-3">
                        {words.map((word, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center justify-between p-5 border-2 border-b-4 rounded-2xl group hover:border-[#1cb0f6] transition-all animate-in slide-in-from-bottom-2 duration-500 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]'}`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <span className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>{word}</span>
                                <button onClick={() => deleteWordFromFolder(folderName, word)} className={`p-2 rounded-lg transition-all active:scale-90 ${theme === 'dark' ? 'text-[#52656d] hover:text-[#ff4b4b] hover:bg-[#2b3b45]' : 'text-[#afafaf] hover:text-[#ff4b4b] hover:bg-[#fff5f5]'}`}><Trash size={20} strokeWidth={3} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderScanScreen = () => (
        <div className="space-y-8 animate-in slide-in-from-left-10 fade-in zoom-in-95 duration-500 pb-32 h-full flex flex-col">
            {step === 1 ? (
                <>
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 shrink-0">
                        {previewUrl ? (
                            <div className="space-y-8">
                                <div className={`relative p-2 border-2 border-b-8 rounded-[2.5rem] overflow-hidden shadow-xl ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]'}`}><img src={previewUrl} alt="Preview" className="w-full max-h-80 object-contain rounded-2xl opacity-60" /><div className="absolute inset-0 flex flex-col items-center justify-center"><div className={`p-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 border-2 border-[#1cb0f6] animate-bounce ${theme === 'dark' ? 'bg-[#202f36]/90' : 'bg-white/90'}`}><Loader2 className="w-10 h-10 text-[#1cb0f6] animate-spin" strokeWidth={3} /><p className="font-black text-[#1cb0f6] uppercase tracking-wider text-sm">Tahlil qilinmoqda...</p></div></div></div>
                                <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); setLoading(false); playSound('click'); }} className={`w-full py-4 border-2 border-b-4 rounded-2xl font-black text-xl active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wide ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-[#52656d] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] text-[#afafaf] hover:bg-[#f7f7f7]'}`}>Bekor qilish</button>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center py-10 border-2 border-b-8 border-dashed rounded-[2.5rem] cursor-pointer transition-all group active:border-b-2 active:translate-y-1 active:scale-[0.98] ${theme === 'dark' ? 'bg-[#131f24] border-[#2b3b45] hover:bg-[#202f36]' : 'bg-[#ddf4ff] border-[#1cb0f6] hover:bg-[#c6ebff]'}`}>
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${theme === 'dark' ? 'bg-[#202f36] text-[#1cb0f6] shadow-none' : 'bg-white text-[#1cb0f6] shadow-[0_4px_0_#1cb0f6]'}`}><Upload size={32} strokeWidth={3} /></div>
                                <span className={`text-xl font-black uppercase tracking-wide ${theme === 'dark' ? 'text-white' : 'text-[#1cb0f6]'}`}>Yangi rasm</span>
                                <p className={`font-bold mt-2 text-sm text-center ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#1899d6]'}`}>Tahlil darhol boshlanadi</p>
                                <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        )}
                    </div>

                    <div className={`h-px my-2 shrink-0 ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#e5e5e5]'}`}></div>

                    <section className="space-y-4 flex-1 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between px-2 shrink-0">
                            <h2 className={`text-xl font-black uppercase tracking-wide flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}><Library className="text-[#58cc02]" size={20} strokeWidth={3} /> To'plamlaring</h2>
                            <button onClick={() => { setShowAddFolder(!showAddFolder); playSound('click'); }} className={`p-2 rounded-xl border-2 border-b-4 transition-all active:border-b-0 active:translate-y-1 active:scale-95 ${showAddFolder ? 'bg-[#ff4b4b] border-[#d33131] text-white' : (theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-[#52656d]' : 'bg-[#f7f7f7] border-[#e5e5e5] text-[#afafaf]')}`}>{showAddFolder ? <X size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}</button>
                        </div>

                        {showAddFolder && <form onSubmit={handleAddFolder} className={`border-2 border-b-4 border-[#ffc800] p-4 rounded-3xl space-y-3 animate-in slide-in-from-top-4 duration-300 shrink-0 ${theme === 'dark' ? 'bg-[#202f36]' : 'bg-[#fff8e1]'}`}><p className="text-sm font-black text-[#ffc800] uppercase tracking-wider text-center">Yangi to'plam nomi</p><div className="flex gap-2"><input type="text" autoFocus placeholder="Masalan: IELTS..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className={`flex-1 px-4 py-2 rounded-xl border-2 font-bold focus:outline-none focus:border-[#ffc800] ${theme === 'dark' ? 'bg-[#131f24] border-[#2b3b45] text-white' : 'bg-white border-[#e5e5e5]'}`} /><button type="submit" className="px-4 py-2 bg-[#ffc800] border-b-4 border-[#e1af00] text-white rounded-xl font-black uppercase text-xs active:scale-95 transition-transform">OK</button></div></form>}

                        <div className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden custom-scrollbar p-1 pb-24 w-full h-full">
                            {folders.map((folder, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => { setViewingFolder(folder); playSound('click'); }}
                                    className={`relative group border-2 border-b-8 p-4 rounded-3xl flex items-center gap-4 hover:border-[#1cb0f6] transition-all cursor-pointer active:border-b-2 active:translate-y-1 active:scale-95 duration-200 w-full max-w-full ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]'}`}
                                >
                                    <button onClick={(e) => deleteFolder(folder, e)} className="absolute -top-2 -right-2 w-7 h-7 bg-[#ff4b4b] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"><X size={14} strokeWidth={4} /></button>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${idx % 3 === 0 ? 'bg-[#58cc02]' : idx % 3 === 1 ? 'bg-[#1cb0f6]' : 'bg-[#ce82ff]'}`}><Folder size={28} fill="currentColor" /></div>
                                    <div className="flex-1 text-left min-w-0"><span className={`block font-black text-lg truncate ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>{folder}</span><span className={`text-xs font-bold uppercase tracking-tighter ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>{(vocabulary[folder] || []).length} so'z</span></div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 pb-20">
                    <header className="flex items-center gap-4"><button onClick={() => { setStep(1); playSound('click'); }} className={`p-3 border-2 border-b-4 rounded-xl transition-all active:border-b-0 active:translate-y-1 active:scale-95 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-[#52656d] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] text-[#afafaf] hover:bg-[#f7f7f7]'}`}><ChevronLeft size={24} strokeWidth={3} /></button><div><h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>Tekshiruv!</h2><p className={`font-bold ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Har bir so'z to'g'ri o'qildimi?</p></div></header>
                    <div className="space-y-4">
                        {detectedWords.map((word, index) => (
                            <div key={index} className={`flex items-center gap-4 p-5 border-2 border-b-4 rounded-2xl transition-all animate-in slide-in-from-bottom-2 ${word.confirmed ? (theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]') : 'border-[#ff4b4b] opacity-50 bg-[#fff5f5]'}`} style={{ animationDelay: `${index * 50}ms` }}>
                                <button onClick={() => { toggleConfirm(index); playSound('click'); }} className={`w-10 h-10 rounded-xl border-b-4 flex items-center justify-center transition-all active:scale-90 ${word.confirmed ? 'bg-[#58cc02] border-[#46a302] text-white' : (theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]')}`}>{word.confirmed && <CheckCircle size={22} strokeWidth={3} />}</button>
                                <div className="flex-1"><input type="text" value={word.text} onChange={(e) => { const updated = [...detectedWords]; updated[index].text = e.target.value; setDetectedWords(updated); }} className={`w-full bg-transparent font-black text-xl focus:outline-none ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`} /></div>
                                <button onClick={() => { setDetectedWords(detectedWords.filter((_, i) => i !== index)); playSound('click'); }} className={`p-3 rounded-xl active:scale-90 transition-transform ${theme === 'dark' ? 'text-[#52656d] hover:text-[#ff4b4b]' : 'text-[#afafaf] hover:text-[#ff4b4b]'}`}><Trash2 size={22} /></button>
                            </div>
                        ))}
                    </div>
                    <div className={`p-6 rounded-[2.5rem] border-2 space-y-4 shadow-inner ${theme === 'dark' ? 'bg-[#131f24] border-[#2b3b45]' : 'bg-[#f7f7f7] border-[#e5e5e5]'}`}><div className="flex items-center justify-between"><h3 className={`text-lg font-black uppercase tracking-wide text-xs ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>To'plamni tanlang:</h3><button onClick={() => { setShowAddFolder(!showAddFolder); playSound('click'); }} className={`p-1 border-2 border-b-4 rounded-lg text-[#1cb0f6] active:translate-y-0.5 active:border-b-0 transition-all active:scale-90 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]'}`}><Plus size={18} strokeWidth={3} /></button></div>{showAddFolder && <form onSubmit={handleAddFolder} className={`border-2 border-b-4 border-[#1cb0f6] p-4 rounded-3xl space-y-3 animate-in fade-in duration-300 ${theme === 'dark' ? 'bg-[#202f36]' : 'bg-white'}`}><p className="text-[10px] font-black text-[#1cb0f6] uppercase tracking-wider text-center">Yangi to'plam</p><div className="flex gap-2"><input type="text" autoFocus placeholder="Nomi..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className={`flex-1 px-3 py-1.5 rounded-xl border-2 font-bold text-sm focus:border-[#1cb0f6] outline-none ${theme === 'dark' ? 'bg-[#131f24] border-[#2b3b45] text-white' : 'border-[#e5e5e5]'}`} /><button type="submit" className="px-3 py-1.5 bg-[#1cb0f6] text-white rounded-xl font-black uppercase text-[10px] active:scale-95">OK</button></div></form>}<div className="flex flex-wrap gap-2">{folders.map((folder) => (<button key={folder} onClick={() => { setSelectedFolder(folder); playSound('click'); }} className={`px-4 py-2 rounded-xl font-bold text-sm border-2 border-b-4 transition-all active:scale-95 ${selectedFolder === folder ? 'bg-[#1cb0f6] border-[#1899d6] text-white' : (theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-[#52656d]' : 'bg-white border-[#e5e5e5] text-[#afafaf]')}`}>{folder}</button>))}</div></div>
                    <div className="pt-6"><button onClick={handleFinalSave} className="w-full py-5 bg-[#58cc02] border-b-8 border-[#46a302] text-white rounded-[2rem] font-black text-2xl hover:brightness-105 active:border-b-0 active:translate-y-2 transition-all uppercase tracking-wider shadow-lg active:scale-[0.98]">Saqlash</button></div>
                </div>
            )}
        </div>
    );

    const renderLearnScreen = () => {
        if (learnState === 'select_method') {
            return (
                <div className="space-y-8 animate-in slide-in-from-right-full duration-500 ease-out pb-32">
                    <div className="text-center space-y-4">
                        <h1 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>O'rganish uslubi</h1>
                        <p className={`font-bold ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Bugun qanday shug'ullanamiz?</p>
                    </div>
                    <div className="grid gap-4">
                        {[{ id: 'flashcard', title: 'Kartochkalar', sub: 'Xotirani charxlash', icon: <RefreshCw size={28} />, color: 'bg-[#58cc02]' }, { id: 'match', title: 'Juftlikni topish', sub: 'Tezkor o\'yin', icon: <Zap size={28} fill="currentColor" />, color: 'bg-[#ffc800]' }, { id: 'filling', title: 'Yozish mashqi', sub: 'To\'g\'ri yozish', icon: <Edit3 size={28} />, color: 'bg-[#1cb0f6]' }].map((item, idx) => (
                            <button
                                key={item.id}
                                onClick={() => selectLearningMethod(item.id)}
                                className={`flex items-center gap-4 border-2 border-b-8 p-5 rounded-[2rem] active:border-b-2 active:translate-y-1 active:scale-[0.98] transition-all animate-in slide-in-from-bottom-2 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] hover:bg-[#f7f7f7]'}`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-md`}>{item.icon}</div>
                                <div className="text-left flex-1"><span className={`block font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>{item.title}</span><span className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>{item.sub}</span></div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (learnState === 'select_direction') {
            return (
                <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-32">
                    <header className="flex items-center gap-4">
                        <button onClick={() => { setLearnState('select_method'); playSound('click'); }} className={`p-3 border-2 border-b-4 rounded-xl transition-all active:border-b-0 active:translate-y-1 active:scale-95 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-[#52656d] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] text-[#afafaf] hover:bg-[#f7f7f7]'}`}><ChevronLeft size={24} strokeWidth={3} /></button>
                        <div className="flex-1"><h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>Yo'nalish</h2><p className={`font-bold ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Tilni tanlang</p></div>
                    </header>

                    <div className="grid gap-4">
                        <button onClick={() => selectDirection('eng_uz')} className={`flex items-center gap-4 border-2 border-b-8 p-6 rounded-[2rem] active:border-b-2 active:translate-y-1 active:scale-[0.98] transition-all ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] hover:bg-[#f7f7f7]'}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1cb0f6] shadow-md font-black text-lg ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#ddf4ff]'}`}>ENG</div>
                            <ArrowRight size={24} className={theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'} />
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1cb0f6] shadow-md font-black text-lg ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#ddf4ff]'}`}>UZ</div>
                            <div className="text-left flex-1 ml-2"><span className={`block font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>ENG &rarr; UZ</span><span className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Tarjima qilish</span></div>
                        </button>

                        <button onClick={() => selectDirection('uz_eng')} className={`flex items-center gap-4 border-2 border-b-8 p-6 rounded-[2rem] active:border-b-2 active:translate-y-1 active:scale-[0.98] transition-all ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] hover:bg-[#f7f7f7]'}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1cb0f6] shadow-md font-black text-lg ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#ddf4ff]'}`}>UZ</div>
                            <ArrowRight size={24} className={theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'} />
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1cb0f6] shadow-md font-black text-lg ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#ddf4ff]'}`}>ENG</div>
                            <div className="text-left flex-1 ml-2"><span className={`block font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>UZ &rarr; ENG</span><span className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Xotirani sinash</span></div>
                        </button>

                        <button onClick={() => selectDirection('def_uz')} className={`flex items-center gap-4 border-2 border-b-8 p-6 rounded-[2rem] active:border-b-2 active:translate-y-1 active:scale-[0.98] transition-all ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] hover:bg-[#f7f7f7]'}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1cb0f6] shadow-md font-black text-lg ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#ddf4ff]'}`}>DEF</div>
                            <ArrowRight size={24} className={theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'} />
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1cb0f6] shadow-md font-black text-lg ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#ddf4ff]'}`}>UZ</div>
                            <div className="text-left flex-1 ml-2"><span className={`block font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>DEF &rarr; UZ</span><span className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Ta'rifdan topish</span></div>
                        </button>

                        <button onClick={() => selectDirection('uz_def')} className={`flex items-center gap-4 border-2 border-b-8 p-6 rounded-[2rem] active:border-b-2 active:translate-y-1 active:scale-[0.98] transition-all ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] hover:bg-[#f7f7f7]'}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1cb0f6] shadow-md font-black text-lg ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#ddf4ff]'}`}>UZ</div>
                            <ArrowRight size={24} className={theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'} />
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#1cb0f6] shadow-md font-black text-lg ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#ddf4ff]'}`}>DEF</div>
                            <div className="text-left flex-1 ml-2"><span className={`block font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>UZ &rarr; DEF</span><span className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Ta'rifni topish</span></div>
                        </button>
                    </div>
                </div>
            );
        }

        if (learnState === 'select_folder') {
            return (
                <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-32">
                    <header className="flex items-center gap-4">
                        <button onClick={() => { setLearnState(selectedMethod === 'flashcard' ? 'select_direction' : 'select_method'); playSound('click'); }} className={`p-3 border-2 border-b-4 rounded-xl transition-all active:border-b-0 active:translate-y-1 active:scale-95 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-[#52656d] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] text-[#afafaf] hover:bg-[#f7f7f7]'}`}><ChevronLeft size={24} strokeWidth={3} /></button>
                        <div className="flex-1"><h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>Mavzu tanlang</h2><p className={`font-bold ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Qaysi to'plamdan boshlaymiz?</p></div>
                    </header>
                    <div className="grid gap-3">
                        {folders.map((folder, idx) => (
                            <button
                                key={idx}
                                onClick={() => startLearningSession(folder)}
                                className={`flex items-center justify-between border-2 border-b-8 p-5 rounded-[2rem] hover:border-[#1cb0f6] active:border-b-2 active:translate-y-1 active:scale-[0.98] transition-all group animate-in slide-in-from-bottom-2 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]'}`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${idx % 3 === 0 ? 'bg-[#58cc02]' : idx % 3 === 1 ? 'bg-[#1cb0f6]' : 'bg-[#ce82ff]'}`}><Folder size={24} fill="currentColor" /></div>
                                    <span className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>{folder}</span>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${theme === 'dark' ? 'text-[#52656d] bg-[#131f24]' : 'text-[#afafaf] bg-[#f7f7f7]'}`}>{(vocabulary[folder] || []).length}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (learnState === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center py-40 space-y-6">
                    <Loader2 className="w-16 h-16 text-[#1cb0f6] animate-spin" strokeWidth={3} />
                    <p className="font-black text-[#1cb0f6] uppercase tracking-wider animate-pulse">O'yin yuklanmoqda...</p>
                </div>
            );
        }

        if (learnState === 'summary') {
            return (
                <div className="text-center space-y-8 py-20 animate-in zoom-in duration-500">
                    <div className="inline-block p-6 bg-[#ffc800] rounded-full text-white shadow-[0_8px_0_#e1af00] mb-4 animate-bounce"><Trophy size={64} /></div>
                    <div><h1 className={`text-4xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>Sessiya tugadi!</h1><p className={`font-bold text-xl ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Jami ball: {sessionScore}</p></div>
                    <button onClick={() => { setLearnState('select_method'); playSound('click'); }} className="w-full py-5 bg-[#58cc02] border-b-8 border-[#46a302] text-white rounded-[2rem] font-black text-2xl active:border-b-0 active:translate-y-2 active:scale-[0.98] transition-all uppercase tracking-wider">Menyuga qaytish</button>
                </div>
            );
        }

        if (learnState === 'playing') {
            const card = sessionQueue[currentCardIndex];
            const progress = ((currentCardIndex) / sessionQueue.length) * 100;

            const getBgColor = () => {
                if (Math.abs(dragX) < 20) return '';
                if (dragX > 20) return 'bg-[#58cc02] bg-opacity-20 border-[#58cc02]';
                if (dragX < -20) return 'bg-[#ff4b4b] bg-opacity-20 border-[#ff4b4b]';
                return '';
            };

            const isEngToUz = flashcardDirection === 'eng_uz';
            const isUzToEng = flashcardDirection === 'uz_eng';
            const isDefToUz = flashcardDirection === 'def_uz';
            const isUzToDef = flashcardDirection === 'uz_def';

            let frontText = card.word;
            let backText = card.translation;
            let frontLabel = "Inglizcha";
            let backLabel = "O'zbekcha";

            if (isUzToEng) {
                frontText = card.translation;
                backText = card.word;
                frontLabel = "O'zbekcha";
                backLabel = "Inglizcha";
            } else if (isDefToUz) {
                frontText = card.definition;
                backText = card.translation;
                frontLabel = "Ta'rif";
                backLabel = "O'zbekcha";
            } else if (isUzToDef) {
                frontText = card.translation;
                backText = card.definition;
                frontLabel = "O'zbekcha";
                backLabel = "Ta'rif";
            }

            return (
                <div className="space-y-8 pb-32">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setLearnState('select_method'); playSound('click'); }}><X size={28} className={theme === 'dark' ? 'text-[#2b3b45] hover:text-[#52656d]' : 'text-[#e5e5e5] hover:text-[#afafaf]'} strokeWidth={3} /></button>
                        <div className={`flex-1 h-4 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#e5e5e5]'}`}><div className="h-full bg-[#58cc02] transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                    </div>

                    <div className="min-h-[400px] flex flex-col justify-center animate-in fade-in slide-in-from-right duration-300">
                        {selectedMethod === 'flashcard' && (
                            <div className="relative h-[450px] w-full flex items-center justify-center perspective-1000">
                                <div
                                    onTouchStart={handleDragStart}
                                    onTouchMove={handleDragMove}
                                    onTouchEnd={handleDragEnd}
                                    onMouseDown={handleDragStart}
                                    onMouseMove={handleDragMove}
                                    onMouseUp={handleDragEnd}
                                    onMouseLeave={handleDragEnd}
                                    onClick={handleClick}
                                    style={{
                                        transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                                    }}
                                    className={`
                    w-full h-full border-4 border-b-8 rounded-[3rem] 
                    flex flex-col items-center justify-center p-8 shadow-xl cursor-pointer 
                    select-none absolute top-0
                    ${getBgColor()}
                    ${isFlipped ? (theme === 'dark' ? 'bg-[#202f36] border-[#1cb0f6]' : 'bg-[#f0f9ff] border-[#1cb0f6]') : (theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]')}
                  `}
                                >
                                    <span className={`text-4xl font-black text-center mb-4 transition-all ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>
                                        {isFlipped ? backText : frontText}
                                    </span>
                                    <span className={`text-sm font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full ${theme === 'dark' ? 'text-[#52656d] bg-[#131f24]' : 'text-[#afafaf] bg-[#f7f7f7]'}`}>
                                        {isFlipped ? backLabel : frontLabel}
                                    </span>

                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-[#ff4b4b] font-black text-2xl opacity-0 transition-opacity ${dragX < -50 ? 'opacity-100' : ''}`}>QAYTARISH</div>
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#58cc02] font-black text-2xl opacity-0 transition-opacity ${dragX > 50 ? 'opacity-100' : ''}`}>BILAMAN</div>
                                </div>
                                <div className={`w-[90%] h-[90%] border-2 border-dashed rounded-[2.5rem] absolute -z-10 mt-4 opacity-50 scale-95 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]'}`}></div>
                            </div>
                        )}

                        {selectedMethod === 'filling' && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2"><h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>So'zni to'ldiring</h2><div className={`p-4 rounded-2xl inline-block border-2 border-[#1899d6] text-[#1899d6] font-black text-lg ${theme === 'dark' ? 'bg-[#131f24]' : 'bg-[#ddf4ff]'}`}>{card.translation}</div></div>
                                <div className="text-center py-8"><span className={`text-4xl font-black tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>{card.puzzle}</span></div>
                                <div className="space-y-4">
                                    <input type="text" placeholder="So'zni yozing..." value={fillInput} onChange={(e) => setFillInput(e.target.value)} className={`w-full p-4 text-center text-xl font-black rounded-2xl border-2 focus:border-[#1cb0f6] outline-none transition-all ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-white' : 'bg-white border-[#e5e5e5]'}`} />
                                    <button onClick={() => { if (fillInput.toLowerCase().trim() === card.word.toLowerCase()) { handleCardResult('mastered'); } else { handleCardResult('retry'); } }} className="w-full py-4 bg-[#1cb0f6] border-b-4 border-[#1899d6] text-white rounded-2xl font-black uppercase tracking-wide active:border-b-0 active:translate-y-1 active:scale-95">Tekshirish</button>
                                </div>
                            </div>
                        )}

                        {selectedMethod === 'match' && (
                            <div className="space-y-6">
                                <h2 className={`text-center text-xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>Tarjimasini toping</h2>
                                <div className={`p-4 border-2 border-[#ffc800] rounded-2xl text-center mb-4 ${theme === 'dark' ? 'bg-[#131f24]' : 'bg-[#fff8e1]'}`}><span className="text-2xl font-black text-[#ffc800]">{card.translation}</span></div>
                                <div className="grid grid-cols-2 gap-3">
                                    {card.options.map((opt, i) => (
                                        <button key={i} onClick={() => { if (opt === card.word) { handleCardResult('mastered'); } else { handleCardResult('retry'); } }} className={`p-6 border-2 border-b-4 rounded-2xl font-bold active:border-b-0 active:translate-y-1 active:scale-95 transition-all ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] text-white hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] text-[#4b4b4b] hover:bg-[#f7f7f7]'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    };

    const renderProfileScreen = () => (
        <div className="space-y-8 animate-in fade-in duration-500 pb-32">
            <div className="text-center space-y-4">
                <h1 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>Profil</h1>
            </div>

            <div className={`p-6 rounded-[2.5rem] border-2 border-b-8 flex items-center gap-4 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]'}`}>
                <div className="w-20 h-20 bg-[#1cb0f6] rounded-full flex items-center justify-center text-white text-3xl font-black border-2 border-b-4 border-[#1899d6]">
                    <User size={40} />
                </div>
                <div>
                    <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>Foydalanuvchi</h2>
                    <p className={`font-bold ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>O'quvchi</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>Sozlamalar</h3>
                <button
                    onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); playSound('click'); }}
                    className={`w-full flex items-center justify-between p-5 rounded-[2rem] border-2 border-b-8 transition-all active:border-b-2 active:translate-y-1 ${theme === 'dark' ? 'bg-[#202f36] border-[#2b3b45] hover:bg-[#2b3b45]' : 'bg-white border-[#e5e5e5] hover:bg-[#f7f7f7]'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-[#2b3b45] text-[#1cb0f6]' : 'bg-[#ddf4ff] text-[#1cb0f6]'}`}>
                            {theme === 'dark' ? <Moon size={24} strokeWidth={3} /> : <Sun size={24} strokeWidth={3} />}
                        </div>
                        <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>
                            {theme === 'dark' ? 'Tungi rejim' : 'Kunduzgi rejim'}
                        </span>
                    </div>
                    <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1cb0f6]' : 'bg-[#e5e5e5]'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </button>
            </div>
        </div>
    );

    const renderOtherScreens = (title, icon) => (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-in fade-in duration-500">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-[#202f36] text-[#52656d]' : 'bg-[#f7f7f7] text-[#afafaf]'}`}>{icon}</div>
            <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#4b4b4b]'}`}>{title}</h2>
            <p className={`font-bold text-center px-10 tracking-tight ${theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]'}`}>Bu bo'lim hali tayyor emas!</p>
        </div>
    );

    return (
        <div className={`min-h-screen font-sans selection:bg-[#ddf4ff] overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#131f24]' : 'bg-white'}`}>
            <nav className={`border-b-2 sticky top-0 z-20 ${theme === 'dark' ? 'bg-[#131f24] border-[#2b3b45]' : 'bg-white border-[#e5e5e5]'}`}>
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button onClick={() => { setStep(1); setViewingFolder(null); playSound('click'); }}><X size={28} className={theme === 'dark' ? 'text-[#52656d] hover:text-white' : 'text-[#afafaf] hover:text-[#4b4b4b]'} /></button>
                    <div className={`flex-1 h-4 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#2b3b45]' : 'bg-[#e5e5e5]'}`}>
                        <div className="h-full bg-[#58cc02] transition-all duration-700" style={{ width: activeTab === 'scan' ? (step === 1 ? '30%' : '60%') : '100%' }}></div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border-2 font-black text-sm ${theme === 'dark' ? 'bg-[#131f24] border-[#ffc800] text-[#ffc800]' : 'bg-[#fff8e1] border-[#ffc800] text-[#ffc800]'}`}>
                        <span>🔥</span> 12
                    </div>
                </div>
            </nav>

            <main className="max-w-xl mx-auto p-6 py-4">
                {activeTab === 'learn' ? renderLearnScreen() :
                    activeTab === 'profile' ? renderProfileScreen() :
                        viewingFolder ? renderFolderDetail(viewingFolder) :
                            activeTab === 'scan' ? renderScanScreen() :
                                renderOtherScreens(activeTab === 'stats' ? 'Reyting' : activeTab, <Trophy size={48} />)}
            </main>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-xl z-40">
                <div className={`backdrop-blur-xl border-2 rounded-[2.5rem] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex justify-between items-center transition-all duration-300 ${theme === 'dark' ? 'bg-[#131f24]/80 border-[#2b3b45]' : 'bg-white/70 border-[#e5e5e5]'}`}>
                    <button onClick={() => { setActiveTab('scan'); setViewingFolder(null); setStep(1); playSound('click'); }} className={`flex flex-col items-center justify-center w-1/4 py-3 transition-all rounded-[2rem] ${activeTab === 'scan' ? 'bg-[#1cb0f6] text-white shadow-[0_4px_0_#1899d6]' : (theme === 'dark' ? 'text-[#52656d] hover:bg-[#202f36]' : 'text-[#afafaf] hover:bg-[#f7f7f7]')}`}>
                        <Home size={26} strokeWidth={activeTab === 'scan' ? 3 : 2} />
                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activeTab === 'scan' ? 'text-white' : (theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]')}`}>Home</span>
                    </button>
                    <button onClick={() => { setActiveTab('learn'); playSound('click'); }} className={`flex flex-col items-center justify-center w-1/4 py-3 transition-all rounded-[2rem] ${activeTab === 'learn' ? 'bg-[#1cb0f6] text-white shadow-[0_4px_0_#1899d6]' : (theme === 'dark' ? 'text-[#52656d] hover:bg-[#202f36]' : 'text-[#afafaf] hover:bg-[#f7f7f7]')}`}>
                        <GraduationCap size={26} strokeWidth={activeTab === 'learn' ? 3 : 2} />
                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activeTab === 'learn' ? 'text-white' : (theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]')}`}>O'rgan</span>
                    </button>
                    <button onClick={() => { setActiveTab('stats'); playSound('click'); }} className={`flex flex-col items-center justify-center w-1/4 py-3 transition-all rounded-[2rem] ${activeTab === 'stats' ? 'bg-[#1cb0f6] text-white shadow-[0_4px_0_#1899d6]' : (theme === 'dark' ? 'text-[#52656d] hover:bg-[#202f36]' : 'text-[#afafaf] hover:bg-[#f7f7f7]')}`}>
                        <Trophy size={26} strokeWidth={activeTab === 'stats' ? 3 : 2} />
                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activeTab === 'stats' ? 'text-white' : (theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]')}`}>Reyting</span>
                    </button>
                    <button onClick={() => { setActiveTab('profile'); playSound('click'); }} className={`flex flex-col items-center justify-center w-1/4 py-3 transition-all rounded-[2rem] ${activeTab === 'profile' ? 'bg-[#1cb0f6] text-white shadow-[0_4px_0_#1899d6]' : (theme === 'dark' ? 'text-[#52656d] hover:bg-[#202f36]' : 'text-[#afafaf] hover:bg-[#f7f7f7]')}`}>
                        <User size={26} strokeWidth={activeTab === 'profile' ? 3 : 2} />
                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activeTab === 'profile' ? 'text-white' : (theme === 'dark' ? 'text-[#52656d]' : 'text-[#afafaf]')}`}>Profil</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
