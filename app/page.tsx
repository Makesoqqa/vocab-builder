"use client"

import { useState, useEffect } from "react"
// We will replace these component imports with inline components for now or create them later
// For this step I will assume components exist or I will inline the essential UI parts
// The user provided 'shadcn' imports. I need to make sure those files exist or I mock them.
// To avoid "Module not found", I will create a simple mock for the UI components in 'components/ui' 
// OR I can inline the styles using Tailwind directly if components are missing.
// However, the user provided exact code expecting these components. 
// I must create the 'components/ui' files in the next steps.

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, ChevronRight, Star, Plus, RotateCcw, Zap, PenLine, Highlighter, Check, Camera } from "lucide-react"

// ... (Rest of the user's provided page.tsx code)
// I will copy the ENTIRE logic provided by the user, and add the functionality requested
// (Camera scan, DB fetch).

const AnimatedHome = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-all duration-300 ${isActive ? "animate-[bounce_0.6s_ease-in-out]" : ""}`}
        />
    </svg>
)

const AnimatedGraduationCap = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className={`${isActive ? "animate-[wiggle_0.5s_ease-in-out]" : ""}`}>
            <path
                d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.1"
            />
            <path
                d="M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
    </svg>
)

const AnimatedTrophy = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className={`${isActive ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
            <path
                d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6 9H3C3 10.0609 3.42143 11.0783 4.17157 11.8284C4.92172 12.5786 5.93913 13 7 13L6 9ZM18 9H21C21 10.0609 20.5786 11.0783 19.8284 11.8284C19.0783 12.5786 18.0609 13 17 13L18 9Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 15V19M9 22H15M6 9V6C6 5.46957 6.21071 4.96086 6.58579 4.58579C6.96086 4.21071 7.46957 4 8 4H16C16.5304 4 17.0391 4.21071 17.4142 4.58579C17.7893 4.96086 18 5.46957 18 6V9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
    </svg>
)

const AnimatedMenu = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className={`${isActive ? "animate-[spin_0.5s_ease-in-out]" : ""}`}>
            <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2" fill="currentColor" />
            <circle cx="12" cy="5" r="1" stroke="currentColor" strokeWidth="2" fill="currentColor" />
            <circle cx="12" cy="19" r="1" stroke="currentColor" strokeWidth="2" fill="currentColor" />
        </g>
    </svg>
)

const AnimatedScan = ({ isActive }: { isActive: boolean }) => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className={`${isActive ? "animate-[pulse_1s_ease-in-out]" : ""}`}>
            <path
                d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 8V16M8 12H16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${isActive ? "opacity-80" : ""}`}
            />
        </g>
    </svg>
)

function HomePage({ collections, dailyChallenge }: any) {
    return (
        <div className="mx-auto max-w-md space-y-6 p-4">
            {/* Search */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="So'z qidiring..." className="pl-9 bg-card border-border" />
                </div>
                <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Daily Challenge */}
            <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg">
                <div className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <Badge variant="secondary" className="mb-2 bg-primary-foreground/20 text-primary-foreground">
                                Kunlik mashq
                            </Badge>
                            <h2 className="text-2xl font-bold text-balance">Yangi so'zlarni o'rganing</h2>
                            <p className="mt-1 text-sm text-primary-foreground/80">Bugungi darsni yakunlang</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{dailyChallenge.completed}</div>
                            <div className="text-sm text-primary-foreground/80">/ {dailyChallenge.total}</div>
                        </div>
                    </div>
                    <Progress value={(dailyChallenge.completed / dailyChallenge.total) * 100} className="mb-4 h-2 bg-primary-foreground/30" />
                    <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                        Davom etish
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>

            {/* Collections Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">To'plamlaringiz</h3>
                <Button variant="ghost" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Yangi
                </Button>
            </div>

            {/* Collections Grid */}
            <div className="space-y-3">
                {collections.map((collection: any) => (
                    <Card key={collection.id} className="overflow-hidden border-border bg-card transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 p-4">
                            <div
                                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${collection.color} text-2xl`}
                            >
                                {collection.icon}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-card-foreground">{collection.title}</h4>
                                        <p className="text-sm text-muted-foreground">{collection.words} so'z</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-medium text-accent-foreground">
                                        <Star className="h-4 w-4 fill-accent text-accent" />
                                        {collection.progress}%
                                    </div>
                                </div>
                                <Progress value={collection.progress} className="h-1.5" />
                            </div>
                            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">Yaqinda o'rgangan so'zlar</h3>
                <div className="space-y-2">
                    {[
                        { word: "Eloquent", translation: "Nutqi chiroyli", mastered: true },
                        { word: "Serendipity", translation: "Tasodifiy omad", mastered: true },
                        { word: "Ephemeral", translation: "Vaqtinchalik", mastered: false },
                    ].map((item, idx) => (
                        <Card key={idx} className="border-border bg-card p-4 flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-foreground">{item.word}</h4>
                                <p className="text-sm text-muted-foreground">{item.translation}</p>
                            </div>
                            {item.mastered ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <RotateCcw className="h-5 w-5 text-yellow-500" />
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

function LearnPage() {
    return (
        <div className="mx-auto max-w-md space-y-6 p-4">
            <h1 className="text-2xl font-bold text-foreground">O'rganish</h1>
            <Card className="border-border bg-card p-5">
                <div className="space-y-4">
                    <Button className="w-full justify-start gap-2" variant="outline">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Flashcards
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                        <Highlighter className="h-5 w-5 text-blue-500" />
                        Juftlik topish
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                        <PenLine className="h-5 w-5 text-green-500" />
                        So'z yozish
                    </Button>
                </div>
            </Card>
        </div>
    )
}

function ScannerPage() {
    // Mock camera open functionality for demo
    const startScan = () => {
        // In real implementation this would open camera
        alert("Kamera ochilmoqda... (Haqiqiy devaysda)");
    }

    return (
        <div className="mx-auto max-w-md space-y-6 p-4">
            <h1 className="text-2xl font-bold text-foreground">Skaner</h1>
            <Card className="border-border bg-card p-5 text-center">
                <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-muted">
                    <AnimatedScan isActive={true} />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Matnni skan qiling</h2>
                <p className="mt-2 text-muted-foreground">Kamera orqali yangi so'zlarni qo'shing</p>
                <Button className="mt-4 w-full" onClick={startScan}>
                    <Camera className="mr-2 h-4 w-4" />
                    Skanlashni boshlash
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">Yoki rasmni yuklang</p>
            </Card>
        </div>
    )
}

function LeaderboardPage() {
    return (
        <div className="mx-auto max-w-md space-y-6 p-4">
            <h1 className="text-2xl font-bold text-foreground">Reyting</h1>
            <Card className="border-border bg-card">
                <div className="p-4">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">Top 10</h3>
                    <div className="space-y-3">
                        {[
                            { rank: 1, name: "User1", score: 1250 },
                            { rank: 2, name: "User2", score: 1100 },
                            { rank: 3, name: "User3", score: 950 },
                        ].map((user) => (
                            <div key={user.rank} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge className="w-8 justify-center bg-primary text-primary-foreground">{user.rank}</Badge>
                                    <span className="font-medium text-foreground">{user.name}</span>
                                </div>
                                <span className="text-muted-foreground">{user.score} ball</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}

function MenuPage({ toggleDarkMode, isDarkMode }: any) {
    return (
        <div className="mx-auto max-w-md space-y-6 p-4">
            <h1 className="text-2xl font-bold text-foreground">Menyu</h1>
            <Card className="border-border bg-card">
                <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                        <svg
                            className="h-5 w-5 text-blue-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Profil</h4>
                        <p className="text-sm text-muted-foreground">Hisob ma'lumotlari</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
            </Card>
            <Card className="border-border bg-card mt-4">
                <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                        <svg
                            className="h-5 w-5 text-purple-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Sozlamalar</h4>
                        <p className="text-sm text-muted-foreground">Ilovani moslash</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
            </Card>

            {/* Dark Mode Toggle */}
            <Card className="border-border bg-card p-5 mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isDarkMode ? "bg-slate-800" : "bg-yellow-100"
                                }`}
                        >
                            {isDarkMode ? (
                                <svg className="h-5 w-5 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            ) : (
                                <svg
                                    className="h-5 w-5 text-yellow-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">{isDarkMode ? "Tungi rejim" : "Kunduzgi rejim"}</h4>
                            <p className="text-sm text-muted-foreground">Mavzu rangini o'zgartirish</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`relative h-8 w-14 rounded-full transition-colors ${isDarkMode ? "bg-primary" : "bg-muted"}`}
                    >
                        <div
                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${isDarkMode ? "translate-x-7" : "translate-x-1"
                                }`}
                        />
                    </button>
                </div>
            </Card>
        </div>
    )
}

export default function App() {
    const [activeTab, setActiveTab] = useState("home")
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Load Telegram user theme if available
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            if (window.Telegram.WebApp.colorScheme === 'dark') {
                setIsDarkMode(true);
            }
        }
    }, []);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev)

    const collections = [
        {
            id: 1,
            title: "IELTS Vocabulary",
            words: 250,
            progress: 65,
            color: "bg-gradient-to-br from-blue-100 to-blue-200",
            icon: "📚",
        },
        {
            id: 2,
            title: "Business English",
            words: 180,
            progress: 40,
            color: "bg-gradient-to-br from-green-100 to-green-200",
            icon: "💼",
        },
        {
            id: 3,
            title: "Daily Conversations",
            words: 320,
            progress: 85,
            color: "bg-gradient-to-br from-purple-100 to-purple-200",
            icon: "💬",
        },
    ]

    const dailyChallenge = {
        completed: 15,
        total: 20,
    }

    return (
        <div className={`min-h-screen bg-background pb-24 ${isDarkMode ? "dark" : ""}`}>
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Vocab Builder</h1>
                        <p className="text-xs text-muted-foreground">So'z boyligingizni oshiring</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                            12 streak
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {activeTab === "home" && <HomePage collections={collections} dailyChallenge={dailyChallenge} />}
                {activeTab === "learn" && <LearnPage />}
                {activeTab === "scan" && <ScannerPage />}
                {activeTab === "leaderboard" && <LeaderboardPage />}
                {activeTab === "menu" && <MenuPage toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />}
            </main>

            {/* Navigation */}
            <nav className="fixed bottom-4 left-0 right-0 z-50 px-4">
                <div className="mx-auto max-w-md">
                    <div className="relative flex items-center justify-center">
                        <div className="flex w-full items-center justify-around rounded-full bg-[#212529]/80 backdrop-blur-2xl px-4 py-3 shadow-xl border border-white/10">
                            <button
                                onClick={() => setActiveTab("home")}
                                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${activeTab === "home" ? "bg-[#f5f6f7] text-[#212529]" : "text-[#939896] hover:text-[#f5f6f7]"
                                    }`}
                            >
                                <AnimatedHome isActive={activeTab === "home"} />
                            </button>

                            <button
                                onClick={() => setActiveTab("learn")}
                                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${activeTab === "learn" ? "bg-[#f5f6f7] text-[#212529]" : "text-[#939896] hover:text-[#f5f6f7]"
                                    }`}
                            >
                                <AnimatedGraduationCap isActive={activeTab === "learn"} />
                            </button>

                            {/* Scanner FAB in center */}
                            <div className="mx-2" />

                            <button
                                onClick={() => setActiveTab("leaderboard")}
                                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${activeTab === "leaderboard" ? "bg-[#f5f6f7] text-[#212529]" : "text-[#939896] hover:text-[#f5f6f7]"
                                    }`}
                            >
                                <AnimatedTrophy isActive={activeTab === "leaderboard"} />
                            </button>

                            <button
                                onClick={() => setActiveTab("menu")}
                                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${activeTab === "menu" ? "bg-[#f5f6f7] text-[#212529]" : "text-[#939896] hover:text-[#f5f6f7]"
                                    }`}
                            >
                                <AnimatedMenu isActive={activeTab === "menu"} />
                            </button>
                        </div>

                        <button
                            onClick={() => setActiveTab("scan")}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f6f7] text-[#212529] shadow-lg transition-all ${activeTab === "scan" ? "scale-110" : "hover:scale-105"
                                } active:scale-95`}
                        >
                            <AnimatedScan isActive={activeTab === "scan"} />
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    )
}
