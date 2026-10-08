import { lazy, Suspense, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Bell, Bookmark, BriefcaseBusiness, LogOut,
  Check, CheckCircle2, ChevronDown, CircleHelp, FileText, Gauge, LayoutDashboard, Mail,
  Globe2, Lightbulb, Link, LockKeyhole, Menu, MoreHorizontal, Plus, Search, Settings,
  ShieldCheck, SlidersHorizontal, Sparkles, Target, Trash2, Upload, UserRound, X,
} from 'lucide-react'

type NavItem = 'Overview' | 'Resume analysis' | 'Job matches' | 'Career path' | 'Settings' | 'Help center'
type Language = 'id' | 'en'
type Profile = { fullName: string; email: string; targetRole: string; location: string; linkedin: string; skills?: string[] }
type Preferences = { emailUpdates: boolean; jobAlerts: boolean; weeklyDigest: boolean }
type AuthUser = { id: number; name: string; email: string }
type Notice = { id: string; titleId: string; titleEn: string; bodyId: string; bodyEn: string; route: NavItem; unread: boolean }

const translations = {
  en: {
    workspace: 'Workspace', preferences: 'Preferences', overview: 'Overview', resumeAnalysis: 'Resume analysis',
    jobMatches: 'Job matches', careerPath: 'Career path', settings: 'Settings', helpCenter: 'Help center',
    promoTitle: 'Make your next move', promoBody: 'Get personalized insights to grow your career faster.', promoCta: 'Explore career path',
    proPlan: 'Career profile', search: 'Search anything', greeting: 'Good morning', overviewSubtitle: 'Here’s your career progress at a glance.',
    workspaceLabel: 'Your workspace', uploadResume: 'Upload resume', resumeScore: 'Resume score', matches: 'Job matches', roles: 'roles',
    profileViews: 'Profile views', views: 'views', profileStrength: 'Profile strength', strong: 'Strong', monthly: '+12 this month',
    newThisWeek: '3 new this week', weeklyGrowth: '+18% this week', topPercent: 'Top 18% of profiles',
    scoreProgress: 'Resume score progress', scoreProgressDesc: 'Your profile is getting stronger over time', last8Weeks: 'Last 8 weeks',
    scoreLegend: 'Resume score', points8Weeks: '+30 points in 8 weeks', latestResume: 'Your latest resume', analyzedAgo: 'Status of your latest upload',
    updatedToday: 'Updated today', analyzed: 'Analyzed', overallScore: 'Overall score', viewAnalysis: 'View full analysis',
    topJobMatches: 'Top job matches', jobMatchesDesc: 'Roles that fit your experience and skills', viewAll: 'View all', remote: 'Remote', fullTime: 'Full-time',
    quickInsights: 'Quick insights', insightsDesc: 'Small changes, big impact', measurableTitle: 'Add measurable impact',
    measurableDesc: '3 bullet points could use more specific results.', linkedinTitle: 'Complete your LinkedIn URL',
    linkedinDesc: 'Profiles with LinkedIn links get 2× more views.', skillsTitle: 'Your skills are looking great',
    skillsDesc: 'Your top skills match 8 trending roles.', recommendations: 'See all recommendations',
    privacy: 'Your career data is stored in your local SQL database', lastSynced: 'Saved to database', backendConnected: 'Database connected', localMode: 'Offline mode · changes stay in this browser',
    syncLoading: 'Connecting to your workspace…', syncSaving: 'Saving changes…', syncSaved: 'All changes saved', syncOffline: 'Database unavailable · changes stay in this browser', retrySync: 'Try again',
    savedRolesLabel: 'Saved roles', noHistory: 'Upload a resume to start your score history.', awaitResume: 'Upload a PDF or DOCX to see results.', skillsDetected: 'Skills detected', roleMatchNote: 'Skills-based estimate, not an employment guarantee.',
    uploadTitle: 'Upload your resume', uploadDesc: 'Extract skills and compare them with roles in the database.', dropFile: 'Drop your file here, or', browse: 'browse',
    fileTypes: 'PDF or DOCX · Max 10 MB', filePrivacy: 'The file is stored in private server storage and is not publicly accessible.', chooseFile: 'Choose a file',
    invalidFile: 'Please choose a PDF or DOCX document.', uploadSuccess: 'Resume analyzed. Skills and job matches have been updated.', uploading: 'Reading your resume…',
    caughtUp: 'You’re all caught up.', settingsToast: 'Settings are up to date.', helpToast: 'Help center opened.',
    accountToast: 'Account menu opened.', showingWeeks: 'Showing your last 8 weeks.', languageLabel: 'Language',
    languageId: 'Bahasa Indonesia', languageEn: 'English', close: 'Close', notifications: 'Notifications', openMenu: 'Open navigation',
    profile: 'Profile', profileSettings: 'Profile settings', accountSettings: 'Account', notificationSettings: 'Notifications',
    preferencesSettings: 'Preferences & privacy', fullName: 'Full name', email: 'Email address', targetRole: 'Target role',
    location: 'Location', linkedin: 'LinkedIn profile', saveChanges: 'Save changes', saved: 'Your changes are saved to your private SQL workspace.',
    emailUpdates: 'Email updates', jobAlerts: 'Job alerts', weeklyDigest: 'Weekly career digest', privacyNote: 'Profile and preferences are saved in the project database.',
    notificationCenter: 'Notification center', markAllRead: 'Mark all as read', noNotifications: 'You’re all caught up.',
    searchPlaceholder: 'Search pages, jobs, and actions…', allJobs: 'All jobs', savedJobs: 'Saved', saveJob: 'Save role',
    workArrangement: 'Work arrangement', allArrangements: 'All arrangements', remoteLabel: 'Remote', hybridLabel: 'Hybrid', onSiteLabel: 'On-site', unspecifiedLabel: 'Not specified',
    employmentType: 'Employment type', allEmploymentTypes: 'All types', fullTimeType: 'Full-time', partTimeType: 'Part-time', contractType: 'Contract', internshipType: 'Internship', otherType: 'Other',
    minimumCvMatch: 'Minimum CV match', anyMatch: 'Any match score', match60: '60% or higher', match75: '75% or higher', match90: '90% or higher', sortBy: 'Sort by', bestMatch: 'Best match', newestFirst: 'Newest first', roleAZ: 'Role A–Z',
    clearFilters: 'Clear filters', resultsFound: 'roles found', cvFilterReady: 'Personalized from your CV', cvFilterPrompt: 'Upload a CV to enable match score filtering.', noFilteredJobs: 'No roles match these filters. Try widening your search.',
    savedLabel: 'Saved', details: 'View details', apply: 'Prepare application', requiredSkills: 'Key skills',
    careerRoadmap: 'Career roadmap', milestones: 'Milestones', markComplete: 'Mark complete', completed: 'Completed',
    scoreBreakdown: 'Score breakdown', strengths: 'Your strengths', improvements: 'Recommended improvements',
    impact: 'Experience & impact', experience: 'Experience', skills: 'Skills', education: 'Education', contact: 'Contact details',
    analysisSummary: 'Your resume review', demoNotice: 'Resume reading uses local PDF/DOCX text extraction and transparent skill keyword matching; it does not call a generative AI service.',
    uploadPrivacy: 'The original resume is stored privately until deleted. Extracted text is discarded after analysis; only its score and skills are kept.',
    deleteResume: 'Delete CV data', confirmDeleteResume: 'Delete all uploaded CV files, analysis history, and skills copied into your profile? This cannot be undone.',
    deleteResumeSuccess: 'Uploaded CV files, analysis history, and extracted skills were deleted.', deleteResumeFailed: 'Could not delete CV data. Your saved results were not changed.',
    helpTitle: 'How can we help?', helpSubtitle: 'Quick answers for your Careerly workspace.',
    faqUpload: 'How does resume analysis work?', faqUploadAnswer: 'The Laravel service reads text from PDF and DOCX files, detects listed skills, calculates a transparent skills-based resume score, and compares skills with job requirements.',
    faqPrivacy: 'Where is my profile data saved?', faqPrivacyAnswer: 'Profile, preferences, job tracking, notifications, and resume analysis records are stored in the configured SQL database. Resume files stay in private Laravel storage until you delete them; extracted resume text is not retained.',
    faqAlerts: 'Are job alerts delivered by email?', faqAlertsAnswer: 'In-app notices are stored in your account. Opted-in job alerts and weekly digests are scheduled daily and weekly while the app scheduler runs; configure SMTP for inbox delivery.',
    trackJob: 'Add to application tracker', inTracker: 'In application tracker', trackerUpdated: 'Application tracker updated.', exportProfile: 'Download my profile data', exportReady: 'Your profile data has been downloaded.',
    emailUpdatesDesc: 'Occasional product and account updates.', jobAlertsDesc: 'New roles that fit your profile.', weeklyDigestDesc: 'A weekly summary of career progress.', noResults: 'No matching results found.', noSavedJobs: 'You have not saved any roles yet.',
    nextThreeMonths: 'Your next 90 days', roadmapDescription: 'A practical plan built around your target role.', progress: 'Progress',
    stepResume: 'Refresh your resume', stepResumeDesc: 'Update your headline and add measurable results to recent work.',
    stepPortfolio: 'Publish a portfolio case study', stepPortfolioDesc: 'Show your process, decisions, and impact in one clear story.',
    stepNetwork: 'Connect with three peers', stepNetworkDesc: 'Build genuine relationships in your professional community.',
    stepInterview: 'Practice your portfolio walkthrough', stepInterviewDesc: 'Prepare a concise story for your strongest project.',
  },
  id: {
    workspace: 'Ruang kerja', preferences: 'Preferensi', overview: 'Ringkasan', resumeAnalysis: 'Analisis CV',
    jobMatches: 'Rekomendasi kerja', careerPath: 'Jalur karier', settings: 'Pengaturan', helpCenter: 'Pusat bantuan',
    promoTitle: 'Rencanakan langkah berikutnya', promoBody: 'Dapatkan wawasan personal untuk mengembangkan karier lebih cepat.', promoCta: 'Jelajahi jalur karier',
    proPlan: 'Profil karier', search: 'Cari apa saja', greeting: 'Selamat pagi', overviewSubtitle: 'Lihat perkembangan karier Anda sekilas.',
    workspaceLabel: 'Ruang kerja Anda', uploadResume: 'Unggah CV', resumeScore: 'Skor CV', matches: 'Kecocokan kerja', roles: 'posisi',
    profileViews: 'Tampilan profil', views: 'kunjungan', profileStrength: 'Kekuatan profil', strong: 'Kuat', monthly: '+12 bulan ini',
    newThisWeek: '3 baru pekan ini', weeklyGrowth: '+18% pekan ini', topPercent: 'Termasuk 18% profil teratas',
    scoreProgress: 'Perkembangan skor CV', scoreProgressDesc: 'Profil Anda terus berkembang dari waktu ke waktu', last8Weeks: '8 minggu terakhir',
    scoreLegend: 'Skor CV', points8Weeks: 'Naik 30 poin dalam 8 minggu', latestResume: 'CV terbaru Anda', analyzedAgo: 'Status unggahan terakhir',
    updatedToday: 'Diperbarui hari ini', analyzed: 'Dianalisis', overallScore: 'Skor keseluruhan', viewAnalysis: 'Lihat analisis lengkap',
    topJobMatches: 'Rekomendasi kerja teratas', jobMatchesDesc: 'Posisi yang sesuai dengan pengalaman dan keahlian Anda', viewAll: 'Lihat semua', remote: 'Jarak jauh', fullTime: 'Penuh waktu',
    quickInsights: 'Insight singkat', insightsDesc: 'Perubahan kecil, dampak besar', measurableTitle: 'Tambahkan hasil yang terukur',
    measurableDesc: '3 poin pengalaman Anda bisa dilengkapi hasil yang lebih spesifik.', linkedinTitle: 'Lengkapi tautan LinkedIn',
    linkedinDesc: 'Profil dengan tautan LinkedIn mendapat 2× lebih banyak kunjungan.', skillsTitle: 'Keahlian Anda sudah kuat',
    skillsDesc: 'Keahlian utama Anda cocok dengan 8 posisi yang sedang naik daun.', recommendations: 'Lihat semua rekomendasi',
    privacy: 'Data karier tersimpan di database SQL lokal Anda', lastSynced: 'Tersimpan ke database', backendConnected: 'Database terhubung', localMode: 'Mode offline · perubahan tersimpan di browser ini',
    syncLoading: 'Menghubungkan ke ruang kerja…', syncSaving: 'Menyimpan perubahan…', syncSaved: 'Semua perubahan tersimpan', syncOffline: 'Database tidak tersedia · perubahan tersimpan di browser ini', retrySync: 'Coba lagi',
    savedRolesLabel: 'Posisi tersimpan', noHistory: 'Unggah CV untuk mulai melihat riwayat skor.', awaitResume: 'Unggah PDF atau DOCX untuk melihat hasil.', skillsDetected: 'Keahlian terdeteksi', roleMatchNote: 'Perkiraan berdasarkan keterampilan, bukan jaminan diterima kerja.',
    uploadTitle: 'Unggah CV Anda', uploadDesc: 'Ambil keterampilan dari CV lalu cocokkan dengan lowongan di database.', dropFile: 'Letakkan file di sini, atau', browse: 'pilih file',
    fileTypes: 'PDF atau DOCX · Maks. 10 MB', filePrivacy: 'File disimpan di server secara privat dan tidak dapat diakses publik.', chooseFile: 'Pilih file',
    invalidFile: 'Pilih file PDF atau DOCX.', uploadSuccess: 'CV dianalisis. Keterampilan dan kecocokan kerja sudah diperbarui.', uploading: 'Membaca CV…',
    caughtUp: 'Tidak ada notifikasi baru.', settingsToast: 'Pengaturan Anda sudah terbaru.', helpToast: 'Pusat bantuan dibuka.',
    accountToast: 'Menu akun dibuka.', showingWeeks: 'Menampilkan data 8 minggu terakhir.', languageLabel: 'Bahasa',
    languageId: 'Bahasa Indonesia', languageEn: 'English', close: 'Tutup', notifications: 'Notifikasi', openMenu: 'Buka navigasi',
    profile: 'Profil', profileSettings: 'Pengaturan profil', accountSettings: 'Akun', notificationSettings: 'Notifikasi',
    preferencesSettings: 'Preferensi & privasi', fullName: 'Nama lengkap', email: 'Alamat email', targetRole: 'Posisi yang dituju',
    location: 'Lokasi', linkedin: 'Profil LinkedIn', saveChanges: 'Simpan perubahan', saved: 'Perubahan tersimpan di ruang kerja SQL pribadi Anda.',
    emailUpdates: 'Pembaruan melalui email', jobAlerts: 'Pemberitahuan lowongan', weeklyDigest: 'Ringkasan karier mingguan',
    privacyNote: 'Profil dan preferensi tersimpan di database project.', notificationCenter: 'Pusat notifikasi', markAllRead: 'Tandai semua sudah dibaca',
    noNotifications: 'Semua sudah diperiksa.', searchPlaceholder: 'Cari halaman, pekerjaan, dan fitur…', allJobs: 'Semua pekerjaan',
    savedJobs: 'Tersimpan', saveJob: 'Simpan posisi',
    workArrangement: 'Sistem kerja', allArrangements: 'Semua sistem kerja', remoteLabel: 'Remote', hybridLabel: 'Hybrid', onSiteLabel: 'Di kantor', unspecifiedLabel: 'Tidak disebutkan',
    employmentType: 'Tipe pekerjaan', allEmploymentTypes: 'Semua tipe', fullTimeType: 'Penuh waktu', partTimeType: 'Paruh waktu', contractType: 'Kontrak', internshipType: 'Magang', otherType: 'Lainnya',
    minimumCvMatch: 'Kecocokan CV minimum', anyMatch: 'Semua skor', match60: '60% ke atas', match75: '75% ke atas', match90: '90% ke atas', sortBy: 'Urutkan', bestMatch: 'Paling cocok', newestFirst: 'Terbaru', roleAZ: 'Posisi A–Z',
    clearFilters: 'Hapus filter', resultsFound: 'posisi ditemukan', cvFilterReady: 'Rekomendasi dipersonalisasi dari CV Anda', cvFilterPrompt: 'Unggah CV untuk mengaktifkan filter skor kecocokan.', noFilteredJobs: 'Tidak ada posisi yang sesuai. Coba perluas filter Anda.',
    savedLabel: 'Tersimpan', details: 'Lihat detail', apply: 'Siapkan lamaran',
    requiredSkills: 'Keahlian utama', careerRoadmap: 'Peta jalan karier', milestones: 'Tahapan', markComplete: 'Tandai selesai',
    completed: 'Selesai', scoreBreakdown: 'Rincian skor', strengths: 'Kekuatan Anda', improvements: 'Saran peningkatan',
    impact: 'Pengalaman & dampak', experience: 'Pengalaman', skills: 'Keahlian', education: 'Pendidikan', contact: 'Kontak',
    analysisSummary: 'Tinjauan CV Anda', demoNotice: 'CV dibaca dengan ekstraksi teks PDF/DOCX dan pencocokan kata kunci keterampilan yang transparan; sistem ini tidak memanggil AI generatif.',
    uploadPrivacy: 'File CV asli tersimpan secara privat sampai dihapus. Teks hasil ekstraksi dibuang setelah analisis; hanya skor dan keahliannya yang disimpan.',
    deleteResume: 'Hapus data CV', confirmDeleteResume: 'Hapus semua file CV, riwayat analisis, dan keahlian CV yang tersalin ke profil? Tindakan ini tidak dapat dibatalkan.',
    deleteResumeSuccess: 'File CV, riwayat analisis, dan keahlian hasil ekstraksi berhasil dihapus.', deleteResumeFailed: 'Data CV gagal dihapus. Hasil tersimpan Anda tidak diubah.',
    helpTitle: 'Ada yang bisa kami bantu?', helpSubtitle: 'Jawaban singkat seputar ruang kerja Careerly.',
    faqUpload: 'Bagaimana analisis CV bekerja?', faqUploadAnswer: 'Layanan Laravel membaca teks PDF dan DOCX, mendeteksi keterampilan, menghitung skor berbasis keterampilan, lalu membandingkannya dengan persyaratan pekerjaan.',
    faqPrivacy: 'Di mana data profil saya disimpan?', faqPrivacyAnswer: 'Profil, preferensi, pekerjaan tersimpan, notifikasi, dan catatan analisis disimpan di database SQL. File CV berada di penyimpanan privat Laravel sampai Anda menghapusnya; teks hasil ekstraksi tidak disimpan.',
    faqAlerts: 'Apakah pemberitahuan lowongan dikirim lewat email?', faqAlertsAnswer: 'Notifikasi dalam aplikasi tersimpan pada akun Anda. Pemberitahuan lowongan dan ringkasan mingguan dijadwalkan saat penjadwal aktif; atur SMTP agar email masuk ke kotak masuk.',
    trackJob: 'Tambahkan ke pelacak lamaran', inTracker: 'Ada di pelacak lamaran', trackerUpdated: 'Pelacak lamaran diperbarui.', exportProfile: 'Unduh data profil saya', exportReady: 'Data profil berhasil diunduh.',
    emailUpdatesDesc: 'Pembaruan sesekali tentang produk dan akun.', jobAlertsDesc: 'Lowongan baru yang sesuai dengan profil Anda.', weeklyDigestDesc: 'Ringkasan perkembangan karier setiap pekan.', noResults: 'Tidak ada hasil yang cocok.', noSavedJobs: 'Anda belum menyimpan posisi apa pun.',
    nextThreeMonths: 'Rencana 90 hari ke depan', roadmapDescription: 'Langkah praktis sesuai posisi yang Anda tuju.', progress: 'Progres',
    stepResume: 'Perbarui CV Anda', stepResumeDesc: 'Rapikan ringkasan profil dan tambahkan hasil kerja yang terukur.',
    stepPortfolio: 'Terbitkan studi kasus portofolio', stepPortfolioDesc: 'Ceritakan proses, keputusan, dan dampak proyek dengan jelas.',
    stepNetwork: 'Terhubung dengan tiga rekan', stepNetworkDesc: 'Bangun relasi yang tulus di komunitas profesi Anda.',
    stepInterview: 'Latih presentasi portofolio', stepInterviewDesc: 'Siapkan cerita singkat untuk proyek terbaik Anda.',
  },
} as const

type Copy = { [Key in keyof typeof translations.id]: string }

const jobs = [
  { id: 'linear-product', role: 'Product Designer', company: 'Linear', match: 96, color: 'bg-violet-100 text-violet-700', mark: 'L', location: 'Remote', type: 'Full-time', salary: '$120k–$160k', skills: ['Product design', 'Figma', 'Design systems'], descriptionId: 'Rancang pengalaman produk yang intuitif bersama tim produk dan engineering.', descriptionEn: 'Create intuitive product experiences with the product and engineering teams.' },
  { id: 'notion-ux', role: 'UX Designer', company: 'Notion', match: 89, color: 'bg-neutral-100 text-neutral-800', mark: 'N', location: 'Remote', type: 'Full-time', salary: '$110k–$145k', skills: ['UX research', 'Prototyping', 'Figma'], descriptionId: 'Bantu jutaan pengguna bekerja lebih baik melalui pengalaman yang sederhana.', descriptionEn: 'Help millions of people work better through thoughtful, simple experiences.' },
  { id: 'vercel-senior', role: 'Senior Product Designer', company: 'Vercel', match: 84, color: 'bg-zinc-900 text-white', mark: '▲', location: 'New York · Hybrid', type: 'Full-time', salary: '$145k–$190k', skills: ['Design systems', 'Prototyping', 'Collaboration'], descriptionId: 'Pimpin arah desain dan bangun sistem desain untuk platform developer.', descriptionEn: 'Lead design direction and build design systems for a developer platform.' },
  { id: 'figma-product', role: 'Product Designer', company: 'Figma', match: 82, color: 'bg-[#fff1eb] text-[#d56543]', mark: 'F', location: 'Remote', type: 'Full-time', salary: '$130k–$170k', skills: ['Product design', 'Figma', 'User research'], descriptionId: 'Bentuk alat kolaborasi kreatif yang digunakan tim di seluruh dunia.', descriptionEn: 'Shape creative collaboration tools used by teams around the world.' },
  { id: 'airbnb-ux', role: 'UX Designer', company: 'Airbnb', match: 78, color: 'bg-[#fff0f2] text-[#e34e67]', mark: 'A', location: 'Remote', type: 'Full-time', salary: '$125k–$165k', skills: ['UX research', 'Accessibility', 'Prototyping'], descriptionId: 'Rancang perjalanan pengguna yang membantu orang merasa diterima di mana saja.', descriptionEn: 'Design guest journeys that help people feel at home anywhere.' },
  { id: 'stripe-design', role: 'Product Designer', company: 'Stripe', match: 76, color: 'bg-[#eef0ff] text-[#635bca]', mark: 'S', location: 'San Francisco · Hybrid', type: 'Full-time', salary: '$140k–$185k', skills: ['Product design', 'Design systems', 'Analytics'], descriptionId: 'Sederhanakan pengalaman pembayaran dan keuangan digital bagi bisnis.', descriptionEn: 'Simplify payments and financial experiences for businesses around the world.' },
]

type Job = Omit<(typeof jobs)[number], 'salary'> & { salary: string | null; source?: string; applyUrl?: string | null; postedAt?: string | null; remote?: boolean }
type ScorePoint = { week: string; score: number }
type ResumeAnalysis = { score: number; skills: string[]; summary: string; strengths: string[]; improvements: string[]; matches: Array<{ id: string; role: string; company: string; match: number; matchedSkills: string[] }> }
const ScoreHistoryChart = lazy(() => import('./components/ScoreHistoryChart'))
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const defaultProfile: Profile = { fullName: 'ahmadtibyan77', email: '', targetRole: 'Full Stack Developer', location: 'Jakarta, Indonesia', linkedin: '', skills: [] }
const defaultPreferences: Preferences = { emailUpdates: false, jobAlerts: true, weeklyDigest: true }
const defaultNotices: Notice[] = [
  { id: 'notice-score', titleId: 'Skor CV diperbarui setelah analisis', titleEn: 'Resume score updates after analysis', bodyId: 'Unggah PDF atau DOCX agar sistem membaca CV Anda.', bodyEn: 'Upload a PDF or DOCX so the system can read your resume.', route: 'Resume analysis', unread: true },
  { id: 'notice-jobs', titleId: 'Rekomendasi pekerjaan', titleEn: 'Job recommendations', bodyId: 'Kecocokan dihitung dari keterampilan pada profil dan CV.', bodyEn: 'Matches are calculated from skills in your profile and resume.', route: 'Job matches', unread: true },
  { id: 'notice-profile', titleId: 'Lengkapi profil karier', titleEn: 'Complete your career profile', bodyId: 'Tambahkan keterampilan dan posisi yang dituju.', bodyEn: 'Add skills and a target role.', route: 'Settings', unread: false },
]

function normalizeProfile(profile: Profile): Profile {
  return { ...defaultProfile, ...profile, skills: Array.isArray(profile.skills) ? profile.skills : [] }
}

function greetingForTime(language: Language, date: Date): string {
  const hour = date.getHours()

  if (language === 'id') {
    if (hour >= 4 && hour < 10) return 'Selamat pagi'
    if (hour >= 10 && hour < 15) return 'Selamat siang'
    if (hour >= 15 && hour < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

function App() {
  const [now, setNow] = useState(() => new Date())
  const [language, setLanguage] = useState<Language>(() => window.localStorage.getItem('careerly-language') === 'en' ? 'en' : 'id')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [activeNav, setActiveNav] = useState<NavItem>('Overview')
  const [authStatus, setAuthStatus] = useState<'loading' | 'signedOut' | 'signedIn'>('loading')
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [csrfToken, setCsrfToken] = useState('')
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [notices, setNotices] = useState<Notice[]>(defaultNotices)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [trackedJobs, setTrackedJobs] = useState<string[]>([])
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([])
  const [resumeName, setResumeName] = useState('')
  const [resumeScore, setResumeScore] = useState<number | null>(null)
  const [resumeSkills, setResumeSkills] = useState<string[]>([])
  const [resumeSummary, setResumeSummary] = useState('')
  const [resumeStrengths, setResumeStrengths] = useState<string[]>([])
  const [resumeImprovements, setResumeImprovements] = useState<string[]>([])
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiConsent, setAiConsent] = useState(false)
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([])
  const [jobListings, setJobListings] = useState<Job[]>(() => jobs.map(job => ({ ...job, source: 'Careerly sample' })))
  const [backendReady, setBackendReady] = useState(false)
  const [backendConnected, setBackendConnected] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'loading' | 'saving' | 'saved' | 'offline'>('loading')
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [jobFilter, setJobFilter] = useState<'all' | 'saved'>('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [toast, setToast] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const t = translations[language]

  useEffect(() => {
    const updateTime = () => setNow(new Date())
    const timer = window.setInterval(updateTime, 60_000)
    window.addEventListener('focus', updateTime)
    document.addEventListener('visibilitychange', updateTime)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', updateTime)
      document.removeEventListener('visibilitychange', updateTime)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.title = language === 'id' ? 'Careerly — Analisis CV & Karier' : 'Careerly — AI Resume & Career Analyzer'
  }, [language])

  useEffect(() => {
    let cancelled = false
    const loadSession = async () => {
      try {
        const csrfResponse = await fetch(API_BASE + '/auth/csrf', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        if (!csrfResponse.ok) throw new Error('Backend belum aktif.')
        const csrfData = await csrfResponse.json()
        if (cancelled) return
        setCsrfToken(csrfData.token ?? '')
        const response = await fetch(API_BASE + '/auth/me', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        if (response.ok) {
          const result = await response.json()
          setAuthUser(result.user)
          setAuthStatus('signedIn')
        } else {
          setAuthUser(null)
          setAuthStatus('signedOut')
        }
      } catch {
        if (!cancelled) setAuthStatus('signedOut')
      }
    }
    void loadSession()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (authStatus !== 'signedIn') return
    let cancelled = false
    const loadWorkspace = async () => {
      try {
        const response = await fetch(API_BASE + '/workspace', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        if (response.status === 401) {
          setAuthUser(null)
          setAuthStatus('signedOut')
          return
        }
        if (!response.ok) throw new Error('Could not load the SQL workspace.')
        const workspace = await response.json()
        if (cancelled) return
        setProfile(normalizeProfile(workspace.profile ?? defaultProfile))
        setPreferences(workspace.preferences ?? defaultPreferences)
        setNotices(workspace.notifications ?? defaultNotices)
        setSavedJobs(workspace.savedJobs ?? [])
        setTrackedJobs(workspace.trackedJobs ?? [])
        setCompletedMilestones(workspace.completedMilestones ?? [])
        setResumeName(workspace.resumeName ?? '')
        setResumeScore(workspace.resumeScore ?? null)
        setResumeSkills(workspace.resumeSkills ?? [])
        setResumeSummary(workspace.resumeSummary ?? '')
        setResumeStrengths(workspace.resumeStrengths ?? [])
        setResumeImprovements(workspace.resumeImprovements ?? [])
        setAiEnabled(Boolean(workspace.aiEnabled))
        setLanguage(workspace.language === 'en' ? 'en' : 'id')
        setScoreHistory(workspace.scoreHistory ?? [])
        setBackendConnected(true)
        setSyncStatus('saved')
        const params = new URLSearchParams()
        for (const skill of workspace.profile?.skills ?? []) params.append('skills[]', skill)
        if (workspace.profile?.targetRole) params.set('targetRole', workspace.profile.targetRole)
        const jobResponse = await fetch(API_BASE + '/jobs?' + params.toString(), { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        if (jobResponse.ok) {
          const jobData = await jobResponse.json()
          if (!cancelled && Array.isArray(jobData.jobs)) setJobListings(jobData.jobs)
        }
      } catch {
        if (!cancelled) {
          setBackendConnected(false)
          setSyncStatus('offline')
        }
      } finally {
        if (!cancelled) setBackendReady(true)
      }
    }
    void loadWorkspace()
    return () => { cancelled = true }
  }, [authStatus])

  useEffect(() => {
    if (!backendReady || !backendConnected) return
    const timeout = window.setTimeout(async () => {
      setSyncStatus('saving')
      try {
        const response = await fetch(API_BASE + '/workspace', {
          method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken },
          body: JSON.stringify({ profile, preferences, notifications: notices, savedJobs, trackedJobs, completedMilestones, language }),
        })
        if (!response.ok) throw new Error('Could not save the workspace.')
        const params = new URLSearchParams()
        for (const skill of profile.skills ?? []) params.append('skills[]', skill)
        if (profile.targetRole) params.set('targetRole', profile.targetRole)
        const jobsResponse = await fetch(API_BASE + '/jobs?' + params.toString(), { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          if (Array.isArray(jobsData.jobs)) setJobListings(jobsData.jobs)
        }
        setBackendConnected(true)
        setSyncStatus('saved')
      } catch {
        setBackendConnected(false)
        setSyncStatus('offline')
      }
    }, 450)
    return () => window.clearTimeout(timeout)
  }, [authStatus, csrfToken, backendReady, backendConnected, profile, preferences, notices, savedJobs, trackedJobs, completedMilestones, language])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowSearch(true)
      }
      if (event.key === 'Escape') {
        setShowSearch(false)
        setShowNotifications(false)
        setShowAccountMenu(false)
        setShowUpload(false)
        setShowAuthModal(false)
        setSelectedJob(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
    setShowLanguageMenu(false)
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }
  const retrySync = () => {
    setSyncStatus('saving')
    setBackendConnected(true)
  }
  const selectFile = async (file?: File) => {
    if (!file) return
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      notify(t.invalidFile)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      notify(language === 'id' ? 'Ukuran file maksimal 10 MB.' : 'The file must be 10 MB or smaller.')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ai_consent', aiConsent ? '1' : '0')
      const response = await fetch(API_BASE + '/resumes', { method: 'POST', body: formData, credentials: 'same-origin', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken } })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message ?? (language === 'id' ? 'CV gagal dianalisis.' : 'Resume analysis failed.'))
      const analysis = result as ResumeAnalysis & { resumeName: string }
      setResumeName(analysis.resumeName)
      setResumeScore(analysis.score)
      setResumeSkills(analysis.skills)
      setResumeSummary(analysis.summary ?? '')
      setResumeStrengths(analysis.strengths ?? [])
      setResumeImprovements(analysis.improvements ?? [])
      setProfile(current => ({ ...current, skills: analysis.skills }))
      setScoreHistory(current => [...current, { week: new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }).format(new Date()), score: analysis.score }].slice(-8))
      const params = new URLSearchParams()
      for (const skill of analysis.skills) params.append('skills[]', skill)
      if (profile.targetRole) params.set('targetRole', profile.targetRole)
      const jobsResponse = await fetch(API_BASE + '/jobs?' + params.toString(), { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      const jobsData = await jobsResponse.json()
      if (jobsResponse.ok && Array.isArray(jobsData.jobs)) setJobListings(jobsData.jobs)
      setBackendConnected(true)
      setJobFilter('all')
      setSearchTerm('')
      setActiveNav('Job matches')
      setShowUpload(false)
      setAiConsent(false)
      notify(t.uploadSuccess)
    } catch (error) {
      notify(error instanceof Error ? error.message : t.invalidFile)
    } finally {
      setUploading(false)
    }
  }
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => { void selectFile(event.target.files?.[0]); event.target.value = '' }
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); setDragging(false); void selectFile(event.dataTransfer.files[0])
  }
  const removeResumeData = async () => {
    if (!resumeName || !window.confirm(t.confirmDeleteResume)) return

    try {
      const response = await fetch(API_BASE + '/resumes', { method: 'DELETE', credentials: 'same-origin', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken } })
      if (!response.ok) throw new Error(t.deleteResumeFailed)
      setResumeName('')
      setResumeScore(null)
      setResumeSkills([])
      setResumeSummary('')
      setResumeStrengths([])
      setResumeImprovements([])
      setScoreHistory([])
      setProfile(current => ({ ...current, skills: [] }))
      setBackendConnected(true)
      setSyncStatus('saved')
      notify(t.deleteResumeSuccess)
    } catch {
      setBackendConnected(false)
      setSyncStatus('offline')
      notify(t.deleteResumeFailed)
    }
  }

  const navItems: { label: NavItem; icon: typeof LayoutDashboard }[] = [
    { label: 'Overview', icon: LayoutDashboard }, { label: 'Resume analysis', icon: FileText },
    { label: 'Job matches', icon: Target }, { label: 'Career path', icon: BriefcaseBusiness },
  ]
  const navLabel: Record<NavItem, string> = {
    Overview: t.overview, 'Resume analysis': t.resumeAnalysis, 'Job matches': t.jobMatches, 'Career path': t.careerPath,
    Settings: t.settings, 'Help center': t.helpCenter,
  }
  const firstName = profile.fullName.trim().split(/\s+/)[0] || 'ahmadtibyan77'
  const initials = profile.fullName.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'A'
  const title = activeNav === 'Overview' ? `${greetingForTime(language, now)}, ${firstName}` : navLabel[activeNav]
  const subtitle = activeNav === 'Overview'
    ? t.overviewSubtitle
    : language === 'id' ? `Temukan ${navLabel[activeNav].toLowerCase()} dan langkah berikutnya di sini.` : `Your ${navLabel[activeNav].toLowerCase()} and next steps, all in one place.`
  const today = new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(now)
  const unreadCount = notices.filter(notice => notice.unread).length
  const goTo = (page: NavItem) => {
    setActiveNav(page)
    setShowAccountMenu(false)
    setShowNotifications(false)
    setShowSearch(false)
    setMobileMenu(false)
  }
  const sendTestEmail = async () => {
    try {
      const response = await fetch(API_BASE + '/account/test-email', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken },
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message ?? 'Email uji gagal diproses.')
      notify(result.message ?? 'Email uji berhasil diproses.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Email uji gagal diproses.')
    }
  }
  const handleAuthenticated = (user: AuthUser, token: string) => {
    setBackendReady(false)
    setBackendConnected(false)
    setAuthUser(user)
    setCsrfToken(token)
    setAuthStatus('signedIn')
    setShowAuthModal(false)
    setShowUpload(true)
  }
  const requestUpload = () => {
    setAiConsent(false)
    if (authStatus === 'signedIn' && authUser) {
      setShowUpload(true)
      return
    }
    setShowAuthModal(true)
  }
  const handleLogout = async () => {
    try {
      await fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken } })
    } catch {
      // Clear the local session view even when the server is temporarily unreachable.
    }
    setAuthUser(null)
    setCsrfToken('')
    setAuthStatus('signedOut')
    setShowAuthModal(false)
    setShowUpload(false)
    setBackendReady(false)
    setBackendConnected(false)
    setProfile(defaultProfile)
    setPreferences(defaultPreferences)
    setNotices(defaultNotices)
    setSavedJobs([])
    setTrackedJobs([])
    setCompletedMilestones([])
    setResumeName('')
    setResumeScore(null)
    setResumeSkills([])
    setResumeSummary('')
    setResumeStrengths([])
    setResumeImprovements([])
    setScoreHistory([])
    setJobListings(jobs.map(job => ({ ...job, source: 'Careerly sample' })))
    setAiEnabled(false)
    setShowAccountMenu(false)
  }
  const toggleSavedJob = (jobId: string) => setSavedJobs(current => current.includes(jobId) ? current.filter(id => id !== jobId) : [...current, jobId])
  const visibleJobs = jobListings.filter(job => (jobFilter === 'all' || savedJobs.includes(job.id)) && `${job.role} ${job.company} ${job.location} ${job.type} ${job.skills.join(' ')}`.toLowerCase().includes(searchTerm.toLowerCase()))

  const isPasswordResetPage = window.location.pathname.endsWith('/reset-password') && Boolean(new URLSearchParams(window.location.search).get('token'))
  if (authStatus === 'loading' && !isPasswordResetPage) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f8fc]"><div className="flex items-center gap-3 rounded-2xl border border-[#eeeef3] bg-white px-5 py-4 text-[12px] text-[#77798a] shadow-sm"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#6257e8]" />{language === 'id' ? 'Memuat ruang kerja…' : 'Loading your workspace…'}</div></div>
  }
  if (isPasswordResetPage && authStatus !== 'signedIn') {
    return <AuthPage variant="page" language={language} csrfToken={csrfToken} onCsrfToken={setCsrfToken} onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#202333]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col border-r border-[#eeeef3] bg-white px-5 py-6 transition-transform md:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <a href="#overview" className="mb-10 flex items-center gap-2.5 px-1" aria-label="Careerly home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#6257e8] text-white"><Sparkles size={19} /></span>
          <span className="text-[19px] font-bold tracking-[-0.7px]">careerly<span className="text-[#6559e8]">.</span></span>
        </a>
        <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[1.35px] text-[#a1a3b1]">{t.workspace}</div>
        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => goTo(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${activeNav === label ? 'bg-[#f0efff] text-[#5c52da]' : 'text-[#77798a] hover:bg-[#f8f8fb] hover:text-[#303247]'}`}>
              <Icon size={17} strokeWidth={1.8} />{navLabel[label]}
              {label === 'Job matches' && <span className="ml-auto rounded-full bg-[#e6e3ff] px-2 py-0.5 text-[10px] font-bold text-[#5c52da]">{jobListings.filter(job => job.match > 0).length}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-9 mb-3 px-2 text-[10px] font-bold uppercase tracking-[1.35px] text-[#a1a3b1]">{t.preferences}</div>
        <nav className="space-y-1">
          <button onClick={() => goTo('Settings')} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium ${activeNav === 'Settings' ? 'bg-[#f0efff] text-[#5c52da]' : 'text-[#77798a] hover:bg-[#f8f8fb]'}`}><Settings size={17} />{t.settings}</button>
          <button onClick={() => goTo('Help center')} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium ${activeNav === 'Help center' ? 'bg-[#f0efff] text-[#5c52da]' : 'text-[#77798a] hover:bg-[#f8f8fb]'}`}><CircleHelp size={17} />{t.helpCenter}</button>
        </nav>
        <div className="mt-auto rounded-2xl bg-[#f6f5ff] p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#6559e8] shadow-sm"><Sparkles size={16} /></div>
          <p className="text-[13px] font-semibold">{t.promoTitle}</p>
          <p className="mt-1 text-[11px] leading-[1.6] text-[#85869a]">{t.promoBody}</p>
          <button onClick={() => goTo('Career path')} className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#5e54db]">{t.promoCta} <ArrowRight size={13} /></button>
        </div>
        <button onClick={() => goTo('Settings')} className="mt-5 flex items-center gap-3 border-t border-[#efeff3] pt-5 text-left">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f6dfd4] text-[12px] font-bold text-[#805b4c]">{initials}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold">{authUser ? profile.fullName : (language === 'id' ? 'Mode pratinjau' : 'Preview mode')}</span><span className="mt-0.5 block text-[10px] text-[#999aa7]">{authUser ? t.proPlan : 'Careerly'}</span></span><MoreHorizontal size={17} className="text-[#999aa7]" />
        </button>
      </aside>
      {mobileMenu && <button aria-label="Close menu" onClick={() => setMobileMenu(false)} className="fixed inset-0 z-20 bg-black/20 md:hidden" />}

      <main className="min-h-screen md:ml-[250px]">
        <header className="sticky top-0 z-10 flex h-[70px] items-center justify-between border-b border-[#eeeef3] bg-white/90 px-5 backdrop-blur md:px-10">
          <div className="flex items-center gap-3"><button className="text-[#727486] md:hidden" aria-label={t.openMenu} onClick={() => setMobileMenu(true)}><Menu size={21} /></button><button onClick={() => setShowSearch(true)} className="hidden items-center gap-2 rounded-lg bg-[#f7f7fa] px-3 py-2 text-left text-[11px] text-[#888a99] transition hover:bg-[#f1f0f8] sm:flex"><Search size={14} /><span>{t.search}</span><kbd className="ml-5 rounded border border-[#e8e8ee] bg-white px-1.5 py-0.5 text-[9px]">⌘ K</kbd></button></div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button aria-label={t.languageLabel} aria-expanded={showLanguageMenu} onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="flex h-9 items-center gap-2 rounded-xl border border-[#ecebf2] bg-white px-2.5 text-[11px] font-semibold text-[#56586a] shadow-[0_1px_2px_#20233308] transition hover:border-[#d8d4fb] hover:bg-[#faf9ff]">
                <Globe2 size={15} className="text-[#6559e8]" /><span>{language.toUpperCase()}</span><ChevronDown size={13} className="text-[#9293a1]" />
              </button>
              <AnimatePresence>
                {showLanguageMenu && <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.98 }} className="absolute right-0 top-11 z-40 w-[218px] rounded-2xl border border-[#eeeef3] bg-white p-2 shadow-[0_18px_50px_#24213a20]">
                  <div className="px-2.5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[1px] text-[#9a9ba8]">{t.languageLabel}</div>
                  <button onClick={() => changeLanguage('id')} className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[12px] transition ${language === 'id' ? 'bg-[#f3f1ff] text-[#554bd0]' : 'text-[#5f6170] hover:bg-[#f8f8fb]'}`}><span className="text-[16px]">🇮🇩</span><span className="flex-1">{t.languageId}</span>{language === 'id' && <Check size={14} />}</button>
                  <button onClick={() => changeLanguage('en')} className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[12px] transition ${language === 'en' ? 'bg-[#f3f1ff] text-[#554bd0]' : 'text-[#5f6170] hover:bg-[#f8f8fb]'}`}><span className="text-[16px]">🇬🇧</span><span className="flex-1">{t.languageEn}</span>{language === 'en' && <Check size={14} />}</button>
                </motion.div>}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setShowAccountMenu(false) }} aria-label={t.notifications} aria-expanded={showNotifications} className="relative grid h-9 w-9 place-items-center rounded-xl text-[#747688] hover:bg-[#f7f7fa]"><Bell size={18} />{unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#ef7b67] px-1 text-[8px] font-bold text-white">{unreadCount}</span>}</button>
              <AnimatePresence>{showNotifications && <motion.div initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-[-42px] top-11 z-40 w-[min(350px,calc(100vw-28px))] overflow-hidden rounded-2xl border border-[#eeeef3] bg-white shadow-[0_18px_50px_#24213a20] sm:right-0">
                <div className="flex items-center justify-between border-b border-[#f0f0f4] px-4 py-3"><div><h3 className="text-[12px] font-semibold">{t.notificationCenter}</h3><p className="mt-0.5 text-[10px] text-[#999aa8]">{unreadCount} {language === 'id' ? 'belum dibaca' : 'unread'}</p></div><button onClick={() => setNotices(current => current.map(notice => ({ ...notice, unread: false })))} className="text-[10px] font-semibold text-[#6257e8]">{t.markAllRead}</button></div>
                <div className="max-h-[340px] overflow-y-auto">{notices.length === 0 ? <p className="px-4 py-8 text-center text-[11px] text-[#999aa8]">{t.noNotifications}</p> : notices.map(notice => <button key={notice.id} onClick={() => { setNotices(current => current.map(item => item.id === notice.id ? { ...item, unread: false } : item)); goTo(notice.route) }} className="flex w-full gap-3 border-b border-[#f4f4f7] px-4 py-3 text-left transition hover:bg-[#fafaff]"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notice.unread ? 'bg-[#695ee8]' : 'bg-transparent'}`} /><span><span className="block text-[11px] font-semibold">{language === 'id' ? notice.titleId : notice.titleEn}</span><span className="mt-1 block text-[10px] leading-relaxed text-[#9293a1]">{language === 'id' ? notice.bodyId : notice.bodyEn}</span><span className="mt-1.5 block text-[9px] text-[#b0b1bc]">{language === 'id' ? 'Hari ini' : 'Today'}</span></span></button>)}</div>
                <button onClick={() => goTo('Settings')} className="w-full px-4 py-3 text-left text-[10px] font-semibold text-[#6257e8] hover:bg-[#fafaff]">{t.notificationSettings} <ArrowRight className="ml-1 inline" size={12} /></button>
              </motion.div>}</AnimatePresence>
            </div>
            <span className="hidden h-6 w-px bg-[#ececf1] sm:block" />
            <div className="relative">
              <button onClick={() => { setShowAccountMenu(!showAccountMenu); setShowNotifications(false) }} aria-label={t.profile} aria-expanded={showAccountMenu} className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f6dfd4] text-[10px] font-bold text-[#805b4c]">{initials}</span><ChevronDown size={14} className="hidden text-[#8b8d9b] sm:block" /></button>
              <AnimatePresence>{showAccountMenu && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute right-0 top-11 z-40 w-[220px] rounded-2xl border border-[#eeeef3] bg-white p-2 shadow-[0_18px_50px_#24213a20]"><div className="border-b border-[#f0f0f4] px-2.5 pb-3 pt-2"><p className="truncate text-[12px] font-semibold">{authUser ? profile.fullName : (language === 'id' ? 'Mode pratinjau' : 'Preview mode')}</p>{authUser && <p className="mt-1 truncate text-[10px] text-[#999aa8]">{authUser.email}</p>}</div><button onClick={() => goTo('Settings')} className="mt-2 flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-[11px] text-[#5f6170] hover:bg-[#f8f8fb]"><UserRound size={15} />{t.profileSettings}</button><button onClick={() => goTo('Settings')} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-[11px] text-[#5f6170] hover:bg-[#f8f8fb]"><Settings size={15} />{t.settings}</button>{authUser && <button onClick={() => void handleLogout()} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-[11px] text-[#b34f4b] hover:bg-[#fff6f5]"><LogOut size={15} />{language === 'id' ? 'Keluar' : 'Sign out'}</button>}</motion.div>}</AnimatePresence>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-10">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[1.25px] text-[#9395a3]"><span>{today}</span><span className="h-1 w-1 rounded-full bg-[#c8c8d0]" /><span className="text-[#6559e8]">{t.workspaceLabel}</span></div><h1 className="text-[27px] font-semibold tracking-[-1.1px] md:text-[31px]">{title}<span className="text-[#6559e8]">.</span></h1><p className="mt-1.5 text-[13px] text-[#8b8d9c]">{subtitle}</p></div>
            {activeNav !== 'Settings' && activeNav !== 'Help center' && <button onClick={requestUpload} className="flex items-center gap-2 rounded-xl bg-[#6257e8] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_14px_rgba(98,87,232,0.2)] transition hover:bg-[#5147d2]"><Plus size={16} /> {t.uploadResume}</button>}
          </div>

          {activeNav === 'Overview' && <>
          <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Gauge} label={t.resumeScore} value={resumeScore === null ? '—' : String(resumeScore)} suffix={resumeScore === null ? '' : '/100'} trend={resumeName || t.awaitResume} tint="violet" />
            <StatCard icon={Target} label={t.matches} value={String(jobListings.filter(job => job.match > 0).length)} suffix={t.roles} trend={profile.targetRole || t.awaitResume} tint="blue" />
            <StatCard icon={BriefcaseBusiness} label={t.savedRolesLabel} value={String(savedJobs.length)} suffix={t.roles} trend={`${trackedJobs.length} ${t.trackJob.toLowerCase()}`} tint="peach" />
            <StatCard icon={CheckCircle2} label={t.skillsDetected} value={String(resumeSkills.length)} suffix={t.skills.toLowerCase()} trend={resumeSkills.length ? t.backendConnected : t.awaitResume} tint="green" />
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <div className="rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6">
              <div className="mb-1 flex items-center justify-between"><div><h2 className="text-[14px] font-semibold">{t.scoreProgress}</h2><p className="mt-1 text-[11px] text-[#999aa8]">{t.scoreProgressDesc}</p></div><button onClick={() => notify(t.showingWeeks)} className="flex items-center gap-1 rounded-lg border border-[#ededf2] px-2.5 py-1.5 text-[10px] text-[#77798a]">{t.last8Weeks} <ChevronDown size={12} /></button></div>
              <div className="mt-4 h-[205px] w-full">{scoreHistory.length === 0 ? <div className="grid h-full place-items-center rounded-xl bg-[#fafaff] px-5 text-center text-[11px] text-[#999aa8]">{t.noHistory}</div> : <Suspense fallback={<div className="grid h-full place-items-center text-[10px] text-[#999aa8]">{t.syncLoading}</div>}><ScoreHistoryChart data={scoreHistory} legend={t.scoreLegend} /></Suspense>}</div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-[#9294a1]"><span className="h-2 w-2 rounded-full bg-[#6d60e9]" /> {t.scoreLegend} <span className="ml-auto font-medium text-[#5b54c8]">{scoreHistory.length ? `${scoreHistory.length} ${t.last8Weeks.toLowerCase()}` : t.noHistory}</span></div>
            </div>
            <div className="rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6">
              <div className="flex items-start justify-between"><div><h2 className="text-[14px] font-semibold">{t.latestResume}</h2><p className="mt-1 text-[11px] text-[#999aa8]">{t.analyzedAgo}</p></div><button onClick={requestUpload} aria-label={t.uploadResume} className="grid h-8 w-8 place-items-center rounded-lg border border-[#ededf2] text-[#77798a] hover:bg-[#f7f7fa]"><MoreHorizontal size={17} /></button></div>
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#fafaff] p-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eeecff] text-[#675ce5]"><FileText size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{resumeName || t.awaitResume}</p><p className="mt-1 text-[10px] text-[#a0a1ae]">{resumeName ? resumeName.split('.').pop()?.toUpperCase() : t.uploadResume}</p></div><span className="rounded-full bg-[#e7f6ed] px-2 py-1 text-[9px] font-semibold text-[#3c9561]">{resumeName ? t.analyzed : t.awaitResume}</span></div>
              <div className="mt-5 flex items-center justify-between"><div><p className="text-[10px] text-[#999aa8]">{t.overallScore}</p><p className="mt-1 text-[27px] font-semibold tracking-[-1px]">{resumeScore ?? '—'}<span className="text-[12px] font-normal text-[#999aa8]">{resumeScore === null ? '' : ' / 100'}</span></p></div><div className="relative grid h-[66px] w-[66px] place-items-center rounded-full" style={{ background: `conic-gradient(#6b5fe8 0deg ${(resumeScore ?? 0) * 3.6}deg, #eeedf6 ${(resumeScore ?? 0) * 3.6}deg 360deg)` }}><div className="grid h-[53px] w-[53px] place-items-center rounded-full bg-white text-[13px] font-semibold">{resumeScore === null ? '—' : `${resumeScore}%`}</div></div></div>
              <button onClick={() => goTo('Resume analysis')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8e6fb] py-2.5 text-[11px] font-semibold text-[#5d53d8] transition hover:bg-[#f8f7ff]">{t.viewAnalysis} <ArrowRight size={14} /></button>
            </div>
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <div className="rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-[14px] font-semibold">{t.topJobMatches}</h2><p className="mt-1 text-[11px] text-[#999aa8]">{t.jobMatchesDesc}</p></div><button onClick={() => goTo('Job matches')} className="flex items-center gap-1 text-[10px] font-semibold text-[#6156dd]">{t.viewAll} <ArrowRight size={13} /></button></div>
              <div className="divide-y divide-[#f0f0f4]">{jobListings.filter(job => job.match > 0).slice(0, 3).map(job => <button key={job.id} onClick={() => setSelectedJob(job)} className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-[#fcfcfe]"><span className={`grid h-9 w-9 place-items-center rounded-xl text-[13px] font-bold ${job.color}`}>{job.mark}</span><span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold">{job.role}</span><span className="mt-1 block text-[10px] text-[#999aa8]">{job.company} <span className="mx-1">·</span> {job.location} <span className="mx-1">·</span> {job.type}</span></span><span className="mr-2 rounded-full bg-[#edfaf1] px-2 py-1 text-[9px] font-semibold text-[#42935f]">{job.match}% {t.matches.toLowerCase()}</span><ArrowUpRight size={14} className="text-[#a2a3af]" /></button>)}</div>
            </div>
            <div className="rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6">
              <div className="flex items-center justify-between"><div><h2 className="text-[14px] font-semibold">{t.quickInsights}</h2><p className="mt-1 text-[11px] text-[#999aa8]">{t.insightsDesc}</p></div><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff5e9] text-[#e29a3b]"><Lightbulb size={16} /></span></div>
              <div className="mt-5 space-y-4"><Insight icon={Check} title={t.skillsDetected} text={resumeSkills.join(', ') || t.awaitResume} color="text-[#56a873] bg-[#edf8f0]" /><Insight icon={Link} title={t.targetRole} text={profile.targetRole || t.awaitResume} color="text-[#5382c4] bg-[#edf3fb]" /><Insight icon={ShieldCheck} title={t.savedRolesLabel} text={`${savedJobs.length} ${t.roles} · ${trackedJobs.length} ${t.trackJob.toLowerCase()}`} color="text-[#8c70d0] bg-[#f3effc]" /></div>
              <button onClick={() => goTo('Resume analysis')} className="mt-5 text-[10px] font-semibold text-[#6156dd]">{t.recommendations} <ArrowRight className="ml-1 inline" size={12} /></button>
            </div>
          </section>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 text-[10px] text-[#a0a1ae]"><span className="flex items-center gap-1.5"><LockKeyhole size={12} /> {t.privacy}</span><span>{t.lastSynced}</span></div>
          </>}
          {activeNav === 'Resume analysis' && <ResumeAnalysisPage t={t} resumeName={resumeName} resumeScore={resumeScore} resumeSkills={resumeSkills} resumeSummary={resumeSummary} resumeStrengths={resumeStrengths} resumeImprovements={resumeImprovements} aiEnabled={aiEnabled} jobs={jobListings} onUpload={requestUpload} onDelete={() => void removeResumeData()} />}
          {activeNav === 'Job matches' && <JobMatchesPage t={t} jobs={visibleJobs} savedJobs={savedJobs} trackedJobs={trackedJobs} filter={jobFilter} setFilter={setJobFilter} searchTerm={searchTerm} setSearchTerm={setSearchTerm} hasResume={Boolean(resumeName)} resumeName={resumeName} resumeSkills={resumeSkills} onToggleSaved={toggleSavedJob} onSelectJob={setSelectedJob} />}
          {activeNav === 'Career path' && <CareerPathPage t={t} targetRole={profile.targetRole} resumeSkills={resumeSkills} resumeScore={resumeScore} completed={completedMilestones} onToggle={id => setCompletedMilestones(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])} />}
          {activeNav === 'Settings' && <SettingsPage t={t} language={language} onLanguage={changeLanguage} profile={profile} setProfile={setProfile} preferences={preferences} setPreferences={setPreferences} savedJobs={savedJobs} trackedJobs={trackedJobs} completedMilestones={completedMilestones} notices={notices} resumeName={resumeName} resumeScore={resumeScore} resumeSkills={resumeSkills} scoreHistory={scoreHistory} onSave={() => notify(t.saved)} onExportComplete={() => notify(t.exportReady)} onTestEmail={() => void sendTestEmail()} />}
          {activeNav === 'Help center' && <HelpPage t={t} />}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#eeeef3] pt-4 text-[10px] text-[#999aa8]">{authStatus === 'signedOut' ? <><span className="h-2 w-2 rounded-full bg-[#9b8fea]" />{language === 'id' ? 'Mode pratinjau · masuk saat ingin mengunggah dan menyimpan CV' : 'Preview mode · sign in when you want to upload and save a resume'}</> : <><span className={`h-2 w-2 rounded-full ${syncStatus === 'saved' ? 'bg-emerald-500' : syncStatus === 'saving' || syncStatus === 'loading' ? 'bg-blue-400' : 'bg-amber-500'}`} />{syncStatus === 'loading' ? t.syncLoading : syncStatus === 'saving' ? t.syncSaving : syncStatus === 'saved' ? t.syncSaved : t.syncOffline}{syncStatus === 'offline' && <button onClick={retrySync} className="rounded-md px-2 py-1 font-semibold text-[#6257e8] hover:bg-[#f0efff]">{t.retrySync}</button>}</>}</div>
        </div>
      </main>

      <AnimatePresence>{showAuthModal && <AuthPage variant="modal" language={language} csrfToken={csrfToken} onCsrfToken={setCsrfToken} onAuthenticated={handleAuthenticated} onClose={() => setShowAuthModal(false)} />}</AnimatePresence>
      <AnimatePresence>{showUpload && <motion.div className="fixed inset-0 z-50 grid place-items-center bg-[#17172a]/40 p-4 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget && !uploading) { setAiConsent(false); setShowUpload(false) } }}><motion.div role="dialog" aria-modal="true" aria-labelledby="upload-title" className="w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl" initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}><div className="mb-5 flex items-start justify-between"><div><span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f0efff] text-[#6257e8]"><Upload size={18} /></span><h2 id="upload-title" className="text-[18px] font-semibold tracking-[-0.5px]">{t.uploadTitle}</h2><p className="mt-1 text-[12px] text-[#9293a1]">{t.uploadDesc}</p></div><button onClick={() => { setAiConsent(false); setShowUpload(false) }} aria-label={t.close} disabled={uploading} className="text-[#9293a1]"><X size={19} /></button></div><div onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => !uploading && inputRef.current?.click()} className={`cursor-pointer rounded-2xl border border-dashed px-5 py-10 text-center transition ${dragging ? 'border-[#6257e8] bg-[#f7f6ff]' : 'border-[#dcdce7] bg-[#fbfbfd] hover:border-[#aaa3f0]'}`}><span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-white text-[#6257e8] shadow-sm"><Upload size={18} /></span><p className="text-[12px] font-semibold">{uploading ? t.uploading : <>{t.dropFile} <span className="text-[#6257e8]">{t.browse}</span></>}</p><p className="mt-1.5 text-[10px] text-[#a0a1ae]">{t.fileTypes}</p><input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onClick={event => event.stopPropagation()} onChange={onFileChange} /></div><p className="mt-4 flex items-center gap-1.5 text-[10px] text-[#999aa8]"><LockKeyhole size={12} />{t.filePrivacy}</p>{aiEnabled && <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-xl border border-[#eeeef3] bg-[#fafaff] p-3 text-[10px] leading-relaxed text-[#77798a]"><input type="checkbox" checked={aiConsent} onChange={event => setAiConsent(event.target.checked)} className="mt-0.5 accent-[#6257e8]" /><span>{language === 'id' ? 'Saya setuju teks CV dikirim ke OpenAI untuk analisis AI. Teks CV tidak disimpan oleh aplikasi, tetapi penyedia dapat menyimpan data API sementara sesuai kebijakan retensi mereka.' : 'I agree to send resume text to OpenAI for AI analysis. The app does not retain resume text, but the provider may retain API data temporarily under its retention policies.'}</span></label>}<button onClick={() => !uploading && inputRef.current?.click()} disabled={uploading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6257e8] py-3 text-[12px] font-semibold text-white hover:bg-[#5147d2] disabled:cursor-wait disabled:opacity-60">{uploading ? t.uploading : t.chooseFile} <ArrowRight size={15} /></button></motion.div></motion.div>}</AnimatePresence>
      <AnimatePresence>{showSearch && <SearchOverlay t={t} pages={(Object.keys(navLabel) as NavItem[]).map(id => ({ id, label: navLabel[id] }))} jobs={jobListings} query={searchTerm} setQuery={setSearchTerm} onChoosePage={goTo} onChooseJob={job => { setShowSearch(false); setSelectedJob(job) }} onClose={() => setShowSearch(false)} />}</AnimatePresence>
      <AnimatePresence>{selectedJob && <JobDetailsDialog t={t} job={selectedJob} saved={savedJobs.includes(selectedJob.id)} tracked={trackedJobs.includes(selectedJob.id)} onToggleSaved={() => toggleSavedJob(selectedJob.id)} onToggleTracked={() => { setTrackedJobs(current => current.includes(selectedJob.id) ? current.filter(id => id !== selectedJob.id) : [...current, selectedJob.id]); notify(t.trackerUpdated) }} onClose={() => setSelectedJob(null)} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#27263b] px-4 py-3 text-[11px] font-medium text-white shadow-xl" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><CheckCircle2 size={15} className="text-[#8ee2a9]" />{toast}</motion.div>}</AnimatePresence>
    </div>
  )
}


function AuthPage({ language, csrfToken, onCsrfToken, onAuthenticated, variant, onClose }: {
  language: Language
  csrfToken: string
  onCsrfToken: (token: string) => void
  onAuthenticated: (user: AuthUser, token: string) => void
  variant: 'page' | 'modal'
  onClose?: () => void
}) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(() => {
    const query = new URLSearchParams(window.location.search)
    return window.location.pathname.endsWith('/reset-password') && query.get('token') ? 'reset' : 'login'
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get('email') ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const serverReady = Boolean(csrfToken)
  const isId = language === 'id'

  useEffect(() => {
    if (csrfToken) return
    let active = true
    fetch(API_BASE + '/auth/csrf', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(async response => {
        if (!response.ok) throw new Error('Server belum aktif.')
        const result = await response.json()
        if (active) {
          onCsrfToken(result.token ?? '')
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [csrfToken, onCsrfToken])

  const submit = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!csrfToken) {
      setError(isId ? 'Server belum siap. Jalankan ulang project lalu coba lagi.' : 'The server is not ready. Restart the project and try again.')
      return
    }
    if (mode === 'register' && password !== passwordConfirmation) {
      setError(isId ? 'Konfirmasi kata sandi belum cocok.' : 'The password confirmation does not match.')
      return
    }
    setBusy(true)
    try {
      const query = new URLSearchParams(window.location.search)
      const endpoint = mode === 'register' ? '/auth/register' : mode === 'login' ? '/auth/login' : mode === 'forgot' ? '/auth/forgot-password' : '/auth/reset-password'
      const payload: Record<string, string> = { email }
      if (mode === 'register') {
        payload.name = name
        payload.password = password
        payload.password_confirmation = passwordConfirmation
      } else if (mode === 'login') {
        payload.password = password
      } else if (mode === 'reset') {
        payload.token = query.get('token') ?? ''
        payload.password = password
        payload.password_confirmation = passwordConfirmation
      }
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        const validationErrors = (result as { errors?: Record<string, string[]> }).errors
        const firstValidationError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null
        throw new Error(firstValidationError ?? result.message ?? (isId ? 'Permintaan belum berhasil.' : 'The request could not be completed.'))
      }
      if (mode === 'login' || mode === 'register') {
        const csrfResponse = await fetch(API_BASE + '/auth/csrf', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        const csrfData = await csrfResponse.json().catch(() => ({}))
        const nextToken = csrfData.token ?? csrfToken
        onCsrfToken(nextToken)
        onAuthenticated(result.user, nextToken)
      } else if (mode === 'forgot') {
        setNotice(result.message ?? (isId ? 'Jika email terdaftar, instruksi akan dikirim.' : 'If the email is registered, instructions will be sent.'))
      } else {
        setNotice(result.message ?? (isId ? 'Kata sandi berhasil diperbarui.' : 'Your password has been updated.'))
        window.history.replaceState({}, '', '/')
        setMode('login')
        setPassword('')
        setPasswordConfirmation('')
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : (isId ? 'Terjadi kesalahan.' : 'Something went wrong.'))
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'register'
    ? (isId ? 'Buat akun Careerly' : 'Create your Careerly account')
    : mode === 'forgot'
      ? (isId ? 'Pulihkan akun Anda' : 'Recover your account')
      : mode === 'reset'
        ? (isId ? 'Buat kata sandi baru' : 'Set a new password')
        : variant === 'modal' ? (isId ? 'Masuk untuk mengunggah CV' : 'Sign in to upload your resume') : (isId ? 'Selamat datang kembali' : 'Welcome back')
  const description = mode === 'register'
    ? (isId ? 'Simpan profil, analisis CV, dan rencana karier Anda dengan aman.' : 'Securely save your profile, resume analysis, and career plan.')
    : mode === 'forgot'
      ? (isId ? 'Kami akan mengirim tautan pemulihan jika alamat email terdaftar.' : 'We will send a recovery link if this email is registered.')
      : mode === 'reset'
        ? (isId ? 'Pilih kata sandi kuat yang belum pernah digunakan.' : 'Choose a strong password you have not used before.')
        : variant === 'modal' ? (isId ? 'Masuk atau daftar agar CV dan hasil analisis tersimpan aman di ruang kerja Anda.' : 'Sign in or create an account to keep your resume and analysis in your private workspace.') : (isId ? 'Masuk untuk membuka ruang kerja karier pribadi Anda.' : 'Sign in to open your private career workspace.')

  const authCard = (
      <div className="w-full max-w-[430px] rounded-[28px] border border-[#eeeef3] bg-white p-7 shadow-[0_24px_90px_#2522450b] sm:p-9">
        <div className={`mb-8 ${variant === 'page' ? 'lg:hidden' : ''}`}><span className="flex items-center gap-2 text-lg font-bold text-[#24243b]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#6257e8] text-white"><Sparkles size={18} /></span>careerly<span className="-ml-2 text-[#6559e8]">.</span></span></div>
        <div className="mb-7"><h2 id="auth-title" className="text-[25px] font-semibold tracking-[-0.8px] text-[#202333]">{title}</h2><p className="mt-2 text-[12px] leading-relaxed text-[#898b9a]">{description}</p></div>
        {!serverReady && <div className="mb-4 rounded-xl bg-[#fff8ed] px-3 py-2.5 text-[10px] leading-relaxed text-[#9a7138]">{isId ? 'Backend belum terhubung. Jalankan project dengan npm run dev agar login tersedia.' : 'Backend is not connected. Start the project with npm run dev to enable sign-in.'}</div>}
        {error && <div role="alert" className="mb-4 rounded-xl bg-[#fff3f2] px-3 py-2.5 text-[11px] leading-relaxed text-[#b34f4b]">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl bg-[#eff9f2] px-3 py-2.5 text-[11px] leading-relaxed text-[#41875b]">{notice}</div>}
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && <label className="block text-[10px] font-semibold text-[#767889]">{isId ? 'Nama lengkap' : 'Full name'}<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={event => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e9e9ef] px-3.5 py-3 text-[12px] outline-none focus:border-[#aaa2f0]" /></label>}
          <label className="block text-[10px] font-semibold text-[#767889]">{isId ? 'Alamat email' : 'Email address'}<span className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#e9e9ef] px-3.5 focus-within:border-[#aaa2f0]"><Mail size={15} className="text-[#a0a1ae]" /><input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="h-11 w-full bg-transparent text-[12px] outline-none" /></span></label>
          {mode !== 'forgot' && <label className="block text-[10px] font-semibold text-[#767889]">{isId ? 'Kata sandi' : 'Password'}<input required type="password" minLength={mode === 'login' ? 1 : 10} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e9e9ef] px-3.5 py-3 text-[12px] outline-none focus:border-[#aaa2f0]" />{mode !== 'login' && <span className="mt-1 block text-[9px] font-normal text-[#999aa8]">{isId ? 'Minimal 10 karakter.' : 'At least 10 characters.'}</span>}</label>}
          {(mode === 'register' || mode === 'reset') && <label className="block text-[10px] font-semibold text-[#767889]">{isId ? 'Konfirmasi kata sandi' : 'Confirm password'}<input required type="password" minLength={10} autoComplete="new-password" value={passwordConfirmation} onChange={event => setPasswordConfirmation(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e9e9ef] px-3.5 py-3 text-[12px] outline-none focus:border-[#aaa2f0]" /></label>}
          {mode === 'login' && <div className="flex justify-end"><button type="button" onClick={() => { setMode('forgot'); setError(''); setNotice('') }} className="text-[10px] font-semibold text-[#6257e8]">{isId ? 'Lupa kata sandi?' : 'Forgot password?'}</button></div>}
          <button disabled={busy || !csrfToken} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6257e8] py-3.5 text-[12px] font-semibold text-white transition hover:bg-[#5147d2] disabled:cursor-wait disabled:opacity-60">{busy ? (isId ? 'Memproses…' : 'Working…') : mode === 'register' ? (isId ? 'Buat akun' : 'Create account') : mode === 'forgot' ? (isId ? 'Kirim tautan pemulihan' : 'Send recovery link') : mode === 'reset' ? (isId ? 'Simpan kata sandi baru' : 'Save new password') : (isId ? 'Masuk ke Careerly' : 'Sign in to Careerly')}<ArrowRight size={14} /></button>
        </form>
        <div className="mt-6 border-t border-[#f0f0f4] pt-5 text-center text-[10px] text-[#8c8d9b]">{mode === 'login' ? (isId ? 'Belum punya akun?' : 'New to Careerly?') : mode === 'register' ? (isId ? 'Sudah punya akun?' : 'Already have an account?') : (isId ? 'Kembali ke masuk' : 'Back to sign in')} <button onClick={() => { setMode(mode === 'register' || mode === 'forgot' || mode === 'reset' ? 'login' : 'register'); setError(''); setNotice('') }} className="ml-1 font-semibold text-[#6257e8]">{mode === 'login' ? (isId ? 'Daftar' : 'Create account') : (isId ? 'Masuk' : 'Sign in')}</button></div>
      </div>
  )
  if (variant === 'modal') {
    return <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-[#17172a]/45 p-4 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) onClose?.() }}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative max-h-[calc(100vh-2rem)] w-full max-w-[460px] overflow-y-auto" initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}>
        <button type="button" onClick={onClose} aria-label={isId ? 'Tutup' : 'Close'} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white text-[#9293a1] shadow-sm hover:bg-[#f7f7fa]"><X size={17} /></button>
        {authCard}
      </motion.div>
    </motion.div>
  }
  return <main className="grid min-h-screen bg-[#f7f8fc] lg:grid-cols-[1fr_1fr]">
    <section className="relative hidden overflow-hidden bg-[#211d47] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#6c5ce7]/40 blur-3xl" />
      <div className="relative flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#7569f2]"><Sparkles size={20} /></span><span className="text-xl font-bold">careerly<span className="text-[#b6b0ff]">.</span></span></div>
      <div className="relative max-w-[500px]"><p className="mb-5 text-[11px] font-semibold uppercase tracking-[2px] text-[#b6b0ff]">{isId ? 'Perjalanan karier, lebih terarah' : 'A clearer path to your next role'}</p><h1 className="text-[42px] font-semibold leading-[1.12] tracking-[-1.5px]">{isId ? 'Bangun langkah karier yang terasa milik Anda.' : 'Build a career plan that feels like yours.'}</h1><p className="mt-5 max-w-[420px] text-[14px] leading-relaxed text-white/70">{isId ? 'Analisis CV, cocokkan keahlian, dan kelola langkah lamaran dalam satu ruang kerja.' : 'Review your resume, match your skills, and manage next steps in one workspace.'}</p><div className="mt-8 flex items-center gap-3 text-[11px] text-white/70"><ShieldCheck size={16} className="text-[#9ce2b5]" />{isId ? 'Data ruang kerja dipisahkan per akun' : 'Workspace data is isolated by account'}</div></div>
      <p className="relative text-[10px] text-white/45">Careerly · {isId ? 'Analisis CV & karier' : 'Resume & career analyzer'}</p>
    </section>
    <section className="grid place-items-center px-5 py-10">{authCard}</section>
  </main>
}

function SettingsPage({ t, language, onLanguage, profile, setProfile, preferences, setPreferences, savedJobs, trackedJobs, completedMilestones, notices, resumeName, resumeScore, resumeSkills, scoreHistory, onSave, onExportComplete, onTestEmail }: {
  t: Copy; language: Language; onLanguage: (language: Language) => void; profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>; preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>; savedJobs: string[]; trackedJobs: string[];
  completedMilestones: string[]; notices: Notice[]; resumeName: string; resumeScore: number | null;
  resumeSkills: string[]; scoreHistory: ScorePoint[]; onSave: () => void; onExportComplete: () => void; onTestEmail: () => void;
}) {
  const [tab, setTab] = useState<'profile' | 'notifications' | 'privacy'>('profile')
  const tabs = [
    { id: 'profile' as const, label: t.profileSettings },
    { id: 'notifications' as const, label: t.notificationSettings },
    { id: 'privacy' as const, label: t.preferencesSettings },
  ]
  const fieldClass = 'mt-1.5 w-full rounded-xl border border-[#e9e9ef] bg-white px-3.5 py-2.5 text-[12px] text-[#303247] outline-none transition placeholder:text-[#b1b2bd] focus:border-[#aaa2f0] focus:ring-4 focus:ring-[#6a5ee810]'
  const updateProfile = (key: Exclude<keyof Profile, 'skills'>, value: string) => setProfile(current => ({ ...current, [key]: value }))
  const exportProfile = () => {
    const file = new Blob([JSON.stringify({ profile, preferences, savedJobs, trackedJobs, completedMilestones, notifications: notices, language, resume: { name: resumeName, score: resumeScore, skills: resumeSkills, scoreHistory }, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'careerly-profile-data.json'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    onExportComplete()
  }
  return <div className="mx-auto max-w-[1080px]">
    <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-[#eeeef3] bg-white p-2">{tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-[11px] font-semibold transition ${tab === item.id ? 'bg-[#f0efff] text-[#5b51d7]' : 'text-[#858696] hover:bg-[#f8f8fb]'}`}>{item.label}</button>)}</div>
    {tab === 'profile' && <form onSubmit={event => { event.preventDefault(); onSave() }} className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <section className="rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6"><div className="mb-5"><h2 className="text-[14px] font-semibold">{t.profileSettings}</h2><p className="mt-1 text-[11px] text-[#999aa8]">{language === 'id' ? 'Informasi ini membantu mempersonalisasi rekomendasi karier Anda.' : 'This information helps personalize your career recommendations.'}</p></div>
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#fafaff] p-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#f6dfd4] text-[14px] font-bold text-[#805b4c]">{profile.fullName.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'AM'}</span><div><p className="text-[12px] font-semibold">{profile.fullName || t.profile}</p><p className="mt-1 text-[10px] text-[#999aa8]">{t.proPlan}</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-[10px] font-semibold text-[#767889]">{t.fullName}<input required value={profile.fullName} onChange={event => updateProfile('fullName', event.target.value)} className={fieldClass} autoComplete="name" /></label>
          <label className="text-[10px] font-semibold text-[#767889]">{t.email}<input type="email" value={profile.email} onChange={event => updateProfile('email', event.target.value)} className={fieldClass} autoComplete="email" /></label>
          <label className="text-[10px] font-semibold text-[#767889]">{t.targetRole}<input value={profile.targetRole} onChange={event => updateProfile('targetRole', event.target.value)} className={fieldClass} /></label>
          <label className="text-[10px] font-semibold text-[#767889]">{t.location}<input value={profile.location} onChange={event => updateProfile('location', event.target.value)} className={fieldClass} autoComplete="address-level2" /></label>
          <label className="text-[10px] font-semibold text-[#767889] sm:col-span-2">{t.linkedin}<input value={profile.linkedin} onChange={event => updateProfile('linkedin', event.target.value)} className={fieldClass} placeholder="linkedin.com/in/username" /></label>
          <label className="text-[10px] font-semibold text-[#767889] sm:col-span-2">{t.skills}<textarea value={(profile.skills ?? []).join(', ')} onChange={event => setProfile(current => ({ ...current, skills: event.target.value.split(',').map(skill => skill.trim()).filter(Boolean).slice(0, 50) }))} className={`${fieldClass} min-h-20 resize-y`} placeholder={language === 'id' ? 'React, Laravel, SQL, komunikasi' : 'React, Laravel, SQL, communication'} /><span className="mt-1 block text-[9px] font-normal text-[#999aa8]">{language === 'id' ? 'Pisahkan setiap keahlian dengan koma. Hasil ekstraksi CV juga akan mengisi bidang ini.' : 'Separate skills with commas. Skills extracted from your resume will also appear here.'}</span></label>
        </div>
        <div className="mt-6 flex justify-end"><button type="submit" className="rounded-xl bg-[#6257e8] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#5147d2]">{t.saveChanges}</button></div>
      </section>
      <aside className="h-fit rounded-2xl border border-[#eeeef3] bg-white p-5"><div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-[#f0efff] text-[#6257e8]"><UserRound size={17} /></div><h3 className="text-[12px] font-semibold">{language === 'id' ? 'Profil karier' : 'Career profile'}</h3><p className="mt-2 text-[10px] leading-relaxed text-[#9293a1]">{language === 'id' ? 'Gunakan email dan tautan profesional yang dapat digunakan perekrut untuk menghubungi Anda.' : 'Use a professional email and profile link where recruiters can reach you.'}</p><div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f8f7ff] p-3 text-[10px] leading-relaxed text-[#77798a]"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#6358df]" />{t.privacyNote}</div></aside>
    </form>}
    {tab === 'notifications' && <section className="max-w-[760px] rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6"><div className="mb-5"><h2 className="text-[14px] font-semibold">{t.notificationSettings}</h2><p className="mt-1 text-[11px] text-[#999aa8]">{language === 'id' ? 'Pilih pembaruan yang ingin Anda terima.' : 'Choose which updates you would like to receive.'}</p></div><div className="divide-y divide-[#f1f1f5]">
      <PreferenceToggle checked={preferences.jobAlerts} title={t.jobAlerts} description={t.jobAlertsDesc} onChange={checked => setPreferences(current => ({ ...current, jobAlerts: checked }))} />
      <PreferenceToggle checked={preferences.weeklyDigest} title={t.weeklyDigest} description={t.weeklyDigestDesc} onChange={checked => setPreferences(current => ({ ...current, weeklyDigest: checked }))} />
      </div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f8f7ff] p-4"><p className="max-w-[480px] flex-1 text-[10px] leading-relaxed text-[#858696]"><Bell size={14} className="mr-1 inline text-[#6358df]" />{language === 'id' ? 'Pemberitahuan lowongan berjalan harian dan ringkasan karier mingguan. SMTP perlu diatur pada backend agar email masuk ke kotak masuk. MAIL_MAILER=log hanya mencatat email di log server.' : 'Job alerts run daily and career summaries weekly. Configure SMTP in the backend for inbox delivery. MAIL_MAILER=log only records emails in the server log.'}</p><button onClick={onTestEmail} className="rounded-xl border border-[#e8e6fb] bg-white px-3.5 py-2.5 text-[10px] font-semibold text-[#5d53d8] hover:bg-[#f8f7ff]">{language === 'id' ? 'Uji konfigurasi email' : 'Test email setup'}</button></div></section>}
    {tab === 'privacy' && <section className="max-w-[760px] rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6"><div className="mb-5"><h2 className="text-[14px] font-semibold">{t.preferencesSettings}</h2><p className="mt-1 text-[11px] text-[#999aa8]">{t.privacyNote}</p></div><div className="flex items-center justify-between gap-4 rounded-xl border border-[#f0f0f4] p-4"><div><p className="text-[11px] font-semibold">{t.languageLabel}</p><p className="mt-1 text-[10px] text-[#999aa8]">{language === 'id' ? 'Bahasa tampilan aplikasi' : 'Application display language'}</p></div><select value={language} onChange={event => onLanguage(event.target.value as Language)} className="rounded-lg border border-[#e9e9ef] bg-white px-3 py-2 text-[11px] font-medium text-[#56586a] outline-none"><option value="id">🇮🇩 Bahasa Indonesia</option><option value="en">🇬🇧 English</option></select></div><div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-[#f0f0f4] p-4"><div><p className="text-[11px] font-semibold">{t.exportProfile}</p><p className="mt-1 text-[10px] text-[#999aa8]">{language === 'id' ? 'Unduh salinan data profil dalam format JSON.' : 'Download a copy of your profile data as JSON.'}</p></div><button onClick={exportProfile} className="rounded-lg border border-[#e8e6fb] px-3 py-2 text-[10px] font-semibold text-[#5d53d8] hover:bg-[#f8f7ff]">{language === 'id' ? 'Unduh data' : 'Export data'}</button></div><div className="mt-4 rounded-xl bg-[#f8f8fb] p-4"><p className="flex items-center gap-2 text-[11px] font-semibold"><LockKeyhole size={14} className="text-[#6257e8]" />{language === 'id' ? 'Database SQL lokal' : 'Local SQL database'}</p><p className="mt-2 text-[10px] leading-relaxed text-[#9293a1]">{language === 'id' ? 'Profil, preferensi, notifikasi, pelacak pekerjaan, dan hasil analisis CV disimpan terpisah untuk akun Anda di database SQL.' : 'Profile, preferences, notifications, job tracking, and resume analysis are saved separately for your account in the SQL database.'}</p></div></section>}
  </div>
}

function PreferenceToggle({ checked, title, description, onChange }: { checked: boolean; title: string; description: string; onChange: (checked: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-5 py-4"><span><span className="block text-[11px] font-semibold text-[#35374b]">{title}</span><span className="mt-1 block text-[10px] text-[#999aa8]">{description}</span></span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="peer sr-only" /><span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-[#6257e8]' : 'bg-[#dcdde5]'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} /></span></label>
}

function ResumeAnalysisPage({ t, resumeName, resumeScore, resumeSkills, resumeSummary, resumeStrengths, resumeImprovements, aiEnabled, jobs, onUpload, onDelete }: { t: Copy; resumeName: string; resumeScore: number | null; resumeSkills: string[]; resumeSummary: string; resumeStrengths: string[]; resumeImprovements: string[]; aiEnabled: boolean; jobs: Job[]; onUpload: () => void; onDelete: () => void }) {
  const matchedJobs = jobs.filter(job => job.match > 0).slice(0, 5)
  const score = resumeScore ?? 0
  return <div className="mx-auto max-w-[1080px] space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e5ff] bg-[#f7f6ff] p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#6257e8]"><Sparkles size={17} /></span><p className="max-w-[740px] text-[10px] leading-relaxed text-[#77798a]">{aiEnabled ? (t === translations.id ? 'Analisis berbasis aturan tersedia. Analisis AI juga dapat digunakan setelah Anda mengaktifkan persetujuan pada saat unggah.' : 'Rule-based analysis is available. AI analysis can also be used when you opt in during upload.') : t.demoNotice}</p></div><div className="flex flex-wrap gap-2"><button onClick={onUpload} className="shrink-0 rounded-xl bg-[#6257e8] px-3.5 py-2.5 text-[10px] font-semibold text-white">{t.uploadResume}</button>{resumeName && <button onClick={onDelete} className="flex items-center gap-1.5 rounded-xl border border-[#f0d9d7] bg-white px-3 py-2.5 text-[10px] font-semibold text-[#b34f4b] hover:bg-[#fff8f7]"><Trash2 size={13} />{t.deleteResume}</button>}</div></div>
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6"><div className="flex items-start justify-between"><div><h2 className="text-[14px] font-semibold">{t.analysisSummary}</h2><p className="mt-1 text-[10px] text-[#999aa8]">{resumeName || t.awaitResume}</p></div><span className="rounded-full bg-[#eaf8ef] px-2.5 py-1 text-[9px] font-semibold text-[#469365]">{resumeScore === null ? '—' : `${resumeScore} / 100`}</span></div><div className="mt-7 flex items-center gap-5"><div className="grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#6b5fe8 0deg ${score * 3.6}deg, #eeedf6 ${score * 3.6}deg 360deg)` }}><div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-white text-center"><span><strong className="block text-[25px] tracking-[-1px]">{resumeScore ?? '—'}</strong><small className="text-[9px] text-[#999aa8]">/100</small></span></div></div><div><p className="text-[13px] font-semibold">{resumeScore === null ? t.awaitResume : t.skillsDetected}</p><p className="mt-1.5 text-[10px] leading-relaxed text-[#9293a1]">{resumeSummary || t.demoNotice}</p></div></div><div className="mt-7"><p className="mb-2 text-[11px] font-semibold">{t.skillsDetected}</p>{resumeSkills.length ? <div className="flex flex-wrap gap-2">{resumeSkills.map(skill => <span key={skill} className="rounded-lg bg-[#f4f2ff] px-2.5 py-1.5 text-[10px] text-[#6257e8]">{skill}</span>)}</div> : <p className="text-[10px] text-[#999aa8]">{t.awaitResume}</p>}</div>{(resumeStrengths.length > 0 || resumeImprovements.length > 0) && <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-[#f2faf5] p-3"><p className="text-[10px] font-semibold text-[#3e8757]">{t.strengths}</p><ul className="mt-2 list-disc space-y-1 pl-4 text-[10px] leading-relaxed text-[#6e8475]">{resumeStrengths.map(item => <li key={item}>{item}</li>)}</ul></div><div className="rounded-xl bg-[#fff8f0] p-3"><p className="text-[10px] font-semibold text-[#b57936]">{t.improvements}</p><ul className="mt-2 list-disc space-y-1 pl-4 text-[10px] leading-relaxed text-[#927d65]">{resumeImprovements.map(item => <li key={item}>{item}</li>)}</ul></div></div>}</section>
      <section className="rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6"><h2 className="text-[14px] font-semibold">{t.topJobMatches}</h2><p className="mt-1 text-[10px] text-[#999aa8]">{t.roleMatchNote}</p><div className="mt-4 divide-y divide-[#f1f1f5]">{matchedJobs.map(job => <div key={job.id} className="flex items-center gap-3 py-3"><span className={`grid h-9 w-9 place-items-center rounded-xl text-[12px] font-bold ${job.color}`}>{job.mark}</span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{job.role}</p><p className="mt-1 truncate text-[9px] text-[#999aa8]">{job.company} · {job.skills.join(', ')}</p></div><span className="rounded-full bg-[#edfaf1] px-2 py-1 text-[9px] font-semibold text-[#42935f]">{job.match}%</span></div>)}{matchedJobs.length === 0 && <p className="py-8 text-center text-[10px] text-[#999aa8]">{t.awaitResume}</p>}</div></section>
    </div>
    <div className="flex items-start gap-2 rounded-xl bg-[#f8f8fb] p-3 text-[10px] leading-relaxed text-[#8d8f9d]"><LockKeyhole size={13} className="mt-0.5 shrink-0" />{t.uploadPrivacy}</div>
  </div>
}

function JobMatchesPage({ t, jobs: visibleJobs, savedJobs, trackedJobs, filter, setFilter, searchTerm, setSearchTerm, hasResume, resumeName, resumeSkills, onToggleSaved, onSelectJob }: {
  t: Copy; jobs: Job[]; savedJobs: string[]; trackedJobs: string[]; filter: 'all' | 'saved';
  setFilter: (filter: 'all' | 'saved') => void; searchTerm: string; setSearchTerm: (term: string) => void;
  hasResume: boolean; resumeName: string; resumeSkills: string[];
  onToggleSaved: (id: string) => void; onSelectJob: (job: Job) => void;
}) {
  const [workMode, setWorkMode] = useState<'all' | 'remote' | 'hybrid' | 'onsite' | 'unspecified'>('all')
  const [employment, setEmployment] = useState<'all' | 'full-time' | 'part-time' | 'contract' | 'internship' | 'other'>('all')
  const [minimumMatch, setMinimumMatch] = useState(0)
  const [sortBy, setSortBy] = useState<'match' | 'newest' | 'role'>('match')

  const workModeOf = (job: Job) => {
    const text = `${job.location} ${job.type}`.toLowerCase()
    if (/hybrid|hibrid/.test(text)) return 'hybrid'
    if (job.remote || /remote|jarak jauh/.test(text)) return 'remote'
    if (/on[- ]?site|onsite|office|kantor/.test(text)) return 'onsite'
    return 'unspecified'
  }
  const employmentOf = (job: Job) => {
    const type = job.type.toLowerCase().replace(/[_–—]/g, '-')
    if (/intern|magang/.test(type)) return 'internship'
    if (/part.?time|paruh waktu/.test(type)) return 'part-time'
    if (/contract|freelance|temporary|kontrak/.test(type)) return 'contract'
    if (/full.?time|permanent|penuh waktu/.test(type)) return 'full-time'
    return 'other'
  }
  const filteredJobs = visibleJobs.filter(job => {
    const modeMatches = workMode === 'all' || workModeOf(job) === workMode
    const typeMatches = employment === 'all' || employmentOf(job) === employment
    const matchMatches = minimumMatch === 0 || (hasResume && job.match >= minimumMatch)
    return modeMatches && typeMatches && matchMatches
  })
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') return (Date.parse(b.postedAt ?? '') || 0) - (Date.parse(a.postedAt ?? '') || 0)
    if (sortBy === 'role') return a.role.localeCompare(b.role)
    return b.match - a.match
  })
  const activeFilterCount = Number(workMode !== 'all') + Number(employment !== 'all') + Number(minimumMatch > 0)
  const clearFilters = () => {
    setWorkMode('all')
    setEmployment('all')
    setMinimumMatch(0)
    setSortBy('match')
    setSearchTerm('')
    setFilter('all')
  }
  const modeOptions = [
    { value: 'all' as const, label: t.allArrangements },
    { value: 'remote' as const, label: t.remoteLabel },
    { value: 'hybrid' as const, label: t.hybridLabel },
    { value: 'onsite' as const, label: t.onSiteLabel },
    { value: 'unspecified' as const, label: t.unspecifiedLabel },
  ]
  const employmentOptions = [
    { value: 'all' as const, label: t.allEmploymentTypes },
    { value: 'full-time' as const, label: t.fullTimeType },
    { value: 'part-time' as const, label: t.partTimeType },
    { value: 'contract' as const, label: t.contractType },
    { value: 'internship' as const, label: t.internshipType },
    { value: 'other' as const, label: t.otherType },
  ]
  const selectClass = 'mt-1.5 w-full rounded-xl border border-[#e9e9ef] bg-white px-3 py-2.5 text-[10px] font-medium text-[#55576a] outline-none transition focus:border-[#aaa2f0] disabled:cursor-not-allowed disabled:bg-[#f7f7fa] disabled:text-[#a3a4af]'

  return <div className="mx-auto max-w-[1080px]">
    <p className="mb-4 rounded-xl border border-[#e8e5ff] bg-[#f7f6ff] px-4 py-3 text-[10px] leading-relaxed text-[#77798a]">{t === translations.id ? 'Lowongan langsung bersumber dari Arbeitnow dan contoh lokal. Sumber live saat ini terutama berisi posisi Eropa dan remote; periksa lokasi serta syarat kerja sebelum melamar.' : 'Live listings are sourced from Arbeitnow, alongside local examples. The live feed currently focuses mainly on European and remote roles; check location and eligibility before applying.'}</p>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2 rounded-xl border border-[#eeeef3] bg-white p-1">{(['all', 'saved'] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-3.5 py-2 text-[10px] font-semibold transition ${filter === value ? 'bg-[#f0efff] text-[#5b51d7]' : 'text-[#858696] hover:bg-[#f8f8fb]'}`}>{value === 'all' ? t.allJobs : `${t.savedJobs} (${savedJobs.length})`}</button>)}</div>
      <label className="flex w-full items-center gap-2 rounded-xl border border-[#eeeef3] bg-white px-3 py-2.5 text-[#999aa8] sm:w-[300px]"><Search size={14} /><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder={t.searchPlaceholder} className="w-full bg-transparent text-[10px] text-[#35374b] outline-none placeholder:text-[#a5a6b1]" /></label>
    </div>
    <section className="mb-5 rounded-2xl border border-[#eeeef3] bg-white p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0efff] text-[#6257e8]"><SlidersHorizontal size={15} /></span><div><h2 className="text-[11px] font-semibold">{t.workArrangement} · {t.employmentType}</h2><p className="mt-0.5 text-[9px] text-[#999aa8]">{hasResume ? `${t.cvFilterReady} · ${resumeName} · ${resumeSkills.length} ${t.skills.toLowerCase()}` : t.cvFilterPrompt}</p></div></div>
        {(activeFilterCount > 0 || searchTerm || filter === 'saved' || sortBy !== 'match') && <button onClick={clearFilters} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold text-[#6257e8] transition hover:bg-[#f7f6ff]"><X size={12} />{t.clearFilters}</button>}
      </div>
      <div className="mb-4">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.8px] text-[#999aa8]">{t.workArrangement}</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.workArrangement}>{modeOptions.map(option => <button key={option.value} type="button" aria-pressed={workMode === option.value} onClick={() => setWorkMode(option.value)} className={`rounded-lg border px-3 py-2 text-[9px] font-semibold transition ${workMode === option.value ? 'border-[#ded9ff] bg-[#f1efff] text-[#5b51d7]' : 'border-[#eeeef3] bg-white text-[#77798a] hover:bg-[#fafaff]'}`}>{option.label}</button>)}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-[9px] font-semibold text-[#77798a]">{t.employmentType}<select value={employment} onChange={event => setEmployment(event.target.value as typeof employment)} className={selectClass}>{employmentOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="text-[9px] font-semibold text-[#77798a]">{t.minimumCvMatch}<select value={minimumMatch} onChange={event => setMinimumMatch(Number(event.target.value))} disabled={!hasResume} className={selectClass}><option value={0}>{t.anyMatch}</option><option value={60}>{t.match60}</option><option value={75}>{t.match75}</option><option value={90}>{t.match90}</option></select></label>
        <label className="text-[9px] font-semibold text-[#77798a]">{t.sortBy}<select value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)} className={selectClass}><option value="match">{t.bestMatch}</option><option value="newest">{t.newestFirst}</option><option value="role">{t.roleAZ}</option></select></label>
      </div>
      <div className="mt-3 flex items-center justify-between text-[9px] text-[#999aa8]"><span>{sortedJobs.length} {t.resultsFound}</span>{hasResume && <span>{t.minimumCvMatch}: {minimumMatch === 0 ? t.anyMatch : `${minimumMatch}%+`}</span>}</div>
    </section>
    {sortedJobs.length === 0 ? <div className="rounded-2xl border border-dashed border-[#dcdce7] bg-white py-16 text-center"><BriefcaseBusiness size={24} className="mx-auto text-[#aaa8c6]" /><p className="mt-3 text-[12px] font-semibold">{filter === 'saved' && savedJobs.length === 0 ? t.noSavedJobs : t.noFilteredJobs}</p><p className="mt-1 text-[10px] text-[#999aa8]">{t.jobMatchesDesc}</p><button onClick={clearFilters} className="mt-4 rounded-lg border border-[#e8e6fb] px-3 py-2 text-[10px] font-semibold text-[#5d53d8] hover:bg-[#f8f7ff]">{t.clearFilters}</button></div> : <div className="grid gap-4 md:grid-cols-2">{sortedJobs.map(job => <article key={job.id} className="rounded-2xl border border-[#eeeef3] bg-white p-5 transition hover:border-[#dcd8fa] hover:shadow-[0_10px_30px_#2522450a]"><div className="flex items-start gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[14px] font-bold ${job.color}`}>{job.mark}</span><div className="min-w-0 flex-1"><p className="text-[12px] font-semibold">{job.role}</p><p className="mt-1 text-[10px] text-[#999aa8]">{job.company} · {job.location}</p><p className="mt-1 text-[9px] text-[#a2a3af]">{job.source || 'Careerly'}</p></div><button aria-label={savedJobs.includes(job.id) ? t.savedLabel : t.saveJob} onClick={() => onToggleSaved(job.id)} className={`grid h-8 w-8 place-items-center rounded-lg border ${savedJobs.includes(job.id) ? 'border-[#e6e2ff] bg-[#f5f3ff] text-[#6156dd]' : 'border-[#ededf2] text-[#999aa8] hover:text-[#6156dd]'}`}><Bookmark size={15} fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} /></button></div><div className="mt-4 flex items-center gap-2"><span className="rounded-full bg-[#edfaf1] px-2 py-1 text-[9px] font-semibold text-[#42935f]">{job.match}% {t.matches.toLowerCase()}</span><span className="text-[9px] text-[#9293a1]">{job.type}</span><span className="text-[9px] text-[#9293a1]">{job.salary || (t === translations.id ? 'Gaji tidak dicantumkan' : 'Salary not listed')}</span></div><p className="mt-3 line-clamp-2 text-[10px] leading-relaxed text-[#858696]">{t === translations.id ? job.descriptionId : job.descriptionEn}</p><div className="mt-3 flex flex-wrap gap-1.5">{job.skills.map(skill => <span key={skill} className="rounded-md bg-[#f7f7fa] px-2 py-1 text-[9px] text-[#77798a]">{skill}</span>)}</div><div className="mt-4 flex items-center justify-between border-t border-[#f1f1f5] pt-3"><span className="text-[9px] text-[#999aa8]">{trackedJobs.includes(job.id) ? `✓ ${t.inTracker}` : ''}</span><button onClick={() => onSelectJob(job)} className="flex items-center gap-1 text-[10px] font-semibold text-[#6156dd]">{t.details}<ArrowRight size={12} /></button></div></article>)}</div>}
  </div>
}

function CareerPathPage({ t, targetRole, resumeSkills, resumeScore, completed, onToggle }: { t: Copy; targetRole: string; resumeSkills: string[]; resumeScore: number | null; completed: string[]; onToggle: (id: string) => void }) {
  const steps = [
    { id: 'refresh-resume', title: t.stepResume, description: t.stepResumeDesc },
    { id: 'portfolio', title: t.stepPortfolio, description: t.stepPortfolioDesc },
    { id: 'network', title: t.stepNetwork, description: t.stepNetworkDesc },
    { id: 'interview', title: t.stepInterview, description: t.stepInterviewDesc },
  ]
  const progress = Math.round((steps.filter(step => completed.includes(step.id)).length / steps.length) * 100)
  return <div className="mx-auto grid max-w-[1080px] gap-5 lg:grid-cols-[1.2fr_0.8fr]"><section className="rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-[14px] font-semibold">{t.careerRoadmap}</h2><p className="mt-1 text-[10px] text-[#999aa8]">{t.roadmapDescription}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f0efff] text-[#6257e8]"><Target size={17} /></span></div><div className="mb-6 rounded-xl bg-[#f8f7ff] p-4"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold">{t.nextThreeMonths}</span><span className="text-[10px] font-bold text-[#5b51d7]">{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#6d60e9] transition-all" style={{ width: `${progress}%` }} /></div></div><div className="space-y-1">{steps.map((step, index) => { const isDone = completed.includes(step.id); return <div key={step.id} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex w-7 shrink-0 flex-col items-center"><span className={`z-[1] grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${isDone ? 'bg-[#e9f7ee] text-[#4b9a67]' : 'bg-[#f1efff] text-[#675ce5]'}`}>{isDone ? <Check size={14} /> : index + 1}</span>{index < steps.length - 1 && <span className="absolute top-7 h-[calc(100%-18px)] w-px bg-[#ededf3]" />}</div><div className="flex min-w-0 flex-1 items-start justify-between gap-3 rounded-xl border border-[#f0f0f4] p-3"><div><p className="text-[11px] font-semibold">{step.title}</p><p className="mt-1 text-[10px] leading-relaxed text-[#9293a1]">{step.description}</p></div><button onClick={() => onToggle(step.id)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold ${isDone ? 'bg-[#eaf8ef] text-[#42935f]' : 'bg-[#f7f6ff] text-[#6156dd]'}`}>{isDone ? t.completed : t.markComplete}</button></div></div>})}</div></section><aside className="h-fit rounded-2xl border border-[#eeeef3] bg-white p-5 md:p-6"><div className="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-[#fff5e9] text-[#e29a3b]"><Lightbulb size={17} /></div><h2 className="text-[13px] font-semibold">{t.targetRole}</h2><p className="mt-1 text-[10px] text-[#999aa8]">{targetRole || t.awaitResume}</p><div className="mt-5"><p className="mb-2 text-[10px] font-semibold">{t.skillsDetected}</p>{resumeSkills.length ? <div className="flex flex-wrap gap-1.5">{resumeSkills.map(skill => <span key={skill} className="rounded-md bg-[#f4f2ff] px-2 py-1 text-[9px] text-[#6257e8]">{skill}</span>)}</div> : <p className="text-[10px] text-[#999aa8]">{t.awaitResume}</p>}</div><div className="mt-5 flex items-center justify-between rounded-xl bg-[#f8f7ff] p-3"><span className="text-[10px] text-[#77798a]">{t.overallScore}</span><strong className="text-[12px]">{resumeScore === null ? '—' : `${resumeScore} / 100`}</strong></div><p className="mt-4 text-[9px] leading-relaxed text-[#9293a1]">{t.roleMatchNote}</p></aside></div>
}

function HelpPage({ t }: { t: Copy }) {
  return <div className="mx-auto max-w-[860px]"><div className="mb-5"><h2 className="text-[20px] font-semibold tracking-[-0.6px]">{t.helpTitle}</h2><p className="mt-1 text-[11px] text-[#999aa8]">{t.helpSubtitle}</p></div><div className="space-y-3">{[[t.faqUpload, t.faqUploadAnswer], [t.faqPrivacy, t.faqPrivacyAnswer], [t.faqAlerts, t.faqAlertsAnswer]].map(([question, answer]) => <details key={question} className="group rounded-2xl border border-[#eeeef3] bg-white p-4"><summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-semibold">{question}<ChevronDown size={15} className="text-[#999aa8] transition group-open:rotate-180" /></summary><p className="mt-3 max-w-[720px] text-[10px] leading-relaxed text-[#858696]">{answer}</p></details>)}</div></div>
}

function SearchOverlay({ t, pages, jobs: searchJobs, query, setQuery, onChoosePage, onChooseJob, onClose }: {
  t: Copy; pages: { id: NavItem; label: string }[]; jobs: Job[]; query: string; setQuery: (query: string) => void;
  onChoosePage: (page: NavItem) => void; onChooseJob: (job: Job) => void; onClose: () => void;
}) {
  const matchingPages = pages.filter(page => page.label.toLowerCase().includes(query.toLowerCase()))
  const matchingJobs = searchJobs.filter(job => `${job.role} ${job.company}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
  return <motion.div className="fixed inset-0 z-[70] flex items-start justify-center bg-[#17172a]/35 px-4 pt-[13vh] backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><motion.div role="dialog" aria-modal="true" className="w-full max-w-[570px] overflow-hidden rounded-2xl border border-[#eeeef3] bg-white shadow-2xl" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}><div className="flex items-center gap-3 border-b border-[#f0f0f4] px-4"><Search size={17} className="text-[#8c8d9b]" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={t.searchPlaceholder} className="h-14 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#a1a2af]" /><kbd className="rounded border border-[#ececf1] px-1.5 py-1 text-[9px] text-[#999aa8]">ESC</kbd></div><div className="max-h-[55vh] overflow-y-auto p-2">{matchingPages.map(page => <button key={page.id} onClick={() => onChoosePage(page.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] text-[#626477] hover:bg-[#f7f6ff]"><LayoutDashboard size={15} className="text-[#8179dc]" />{page.label}<ArrowRight size={13} className="ml-auto text-[#b1b1bd]" /></button>)}{matchingJobs.map(job => <button key={job.id} onClick={() => onChooseJob(job)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#f7f6ff]"><span className={`grid h-7 w-7 place-items-center rounded-lg text-[10px] font-bold ${job.color}`}>{job.mark}</span><span><span className="block text-[11px] font-semibold">{job.role}</span><span className="mt-0.5 block text-[9px] text-[#999aa8]">{job.company} · {job.match}% {t.matches.toLowerCase()}</span></span><BriefcaseBusiness size={14} className="ml-auto text-[#b1b1bd]" /></button>)}{matchingPages.length === 0 && matchingJobs.length === 0 && <p className="py-9 text-center text-[11px] text-[#999aa8]">{t.noResults}</p>}</div><div className="border-t border-[#f0f0f4] px-4 py-2 text-[9px] text-[#a0a1ae]">{languageHint(t)}</div></motion.div></motion.div>
}

function languageHint(t: Copy) {
  return t.languageLabel === 'Bahasa' ? 'Tekan Esc untuk menutup' : 'Press Esc to close'
}

function JobDetailsDialog({ t, job, saved, tracked, onToggleSaved, onToggleTracked, onClose }: {
  t: Copy; job: Job; saved: boolean; tracked: boolean; onToggleSaved: () => void; onToggleTracked: () => void; onClose: () => void;
}) {
  return <motion.div className="fixed inset-0 z-[65] grid place-items-center bg-[#17172a]/40 p-4 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><motion.div role="dialog" aria-modal="true" className="w-full max-w-[500px] rounded-2xl border border-[#eeeef3] bg-white p-5 shadow-2xl md:p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 7 }}><div className="flex items-start gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[14px] font-bold ${job.color}`}>{job.mark}</span><div className="min-w-0 flex-1"><h2 className="text-[15px] font-semibold">{job.role}</h2><p className="mt-1 text-[10px] text-[#999aa8]">{job.company} · {job.location}</p></div><button onClick={onClose} aria-label={t.close} className="text-[#999aa8]"><X size={18} /></button></div><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-[#edfaf1] px-2.5 py-1 text-[9px] font-semibold text-[#42935f]">{job.match}% {t.matches.toLowerCase()}</span><span className="rounded-full bg-[#f7f7fa] px-2.5 py-1 text-[9px] text-[#77798a]">{job.type}</span><span className="rounded-full bg-[#f7f7fa] px-2.5 py-1 text-[9px] text-[#77798a]">{job.salary}</span></div><p className="mt-5 text-[11px] leading-relaxed text-[#77798a]">{t === translations.id ? job.descriptionId : job.descriptionEn}</p><h3 className="mt-5 text-[11px] font-semibold">{t.requiredSkills}</h3><div className="mt-2 flex flex-wrap gap-1.5">{job.skills.map(skill => <span key={skill} className="rounded-md bg-[#f7f7fa] px-2.5 py-1.5 text-[9px] text-[#77798a]">{skill}</span>)}</div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><button onClick={onToggleSaved} className="flex items-center justify-center gap-2 rounded-xl border border-[#e8e6fb] px-3 py-2.5 text-[10px] font-semibold text-[#6156dd]"><Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />{saved ? t.savedLabel : t.saveJob}</button><div className="flex gap-2">{job.applyUrl && <a href={job.applyUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 rounded-xl border border-[#e8e6fb] px-3 py-2.5 text-[10px] font-semibold text-[#6156dd]">{t === translations.id ? 'Lamar di sumber' : 'Apply at source'}<ArrowUpRight size={12} /></a>}<button onClick={onToggleTracked} className="rounded-xl bg-[#6257e8] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#5147d2]">{tracked ? '✓ ' + t.inTracker : t.trackJob}</button></div></div><p className="mt-3 text-[9px] leading-relaxed text-[#a0a1ae]">{t === translations.id ? 'Tindakan ini memperbarui pelacak lokal dan tidak mengirim lamaran ke perusahaan.' : 'This updates your local tracker and does not submit an application to the company.'}</p></motion.div></motion.div>
}

function StatCard({ icon: Icon, label, value, suffix, trend, tint }: { icon: typeof Gauge; label: string; value: string; suffix: string; trend: string; tint: 'violet' | 'blue' | 'peach' | 'green' }) {
  const styles = { violet: 'bg-[#f0efff] text-[#685de4]', blue: 'bg-[#edf4ff] text-[#5985cd]', peach: 'bg-[#fff2e9] text-[#e89b67]', green: 'bg-[#eaf8ef] text-[#50a574]' }
  return <div className="rounded-2xl border border-[#eeeef3] bg-white p-4 md:p-5"><div className="mb-4 flex items-center justify-between"><span className="text-[11px] font-medium text-[#8f91a0]">{label}</span><span className={`grid h-8 w-8 place-items-center rounded-lg ${styles[tint]}`}><Icon size={16} /></span></div><div className="flex items-end gap-1.5"><span className="text-[25px] font-semibold leading-none tracking-[-1px]">{value}</span>{suffix && <span className="pb-0.5 text-[10px] text-[#a0a1ae]">{suffix}</span>}</div><div className="mt-3 flex items-center gap-1 text-[10px] text-[#54a475]"><ArrowUpRight size={12} />{trend}</div></div>
}

function Insight({ icon: Icon, title, text, color }: { icon: typeof Check; title: string; text: string; color: string }) {
  return <div className="flex gap-3"><span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${color}`}><Icon size={14} /></span><span><span className="block text-[11px] font-semibold">{title}</span><span className="mt-1 block text-[10px] leading-[1.5] text-[#999aa8]">{text}</span></span></div>
}

export default App
