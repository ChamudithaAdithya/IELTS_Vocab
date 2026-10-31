import React, { useState } from 'react';
import { 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Clock, 
  FileText, 
  HardDrive,
  Search,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Maximize2,
  Layers
} from 'lucide-react';
import { CAMBRIDGE_READING_TESTS } from '../../data/readingTests';
import { CAMBRIDGE_LISTENING_TESTS } from '../../data/listeningTests';
import { ALL_CAMBRIDGE_TESTS } from '../../data/cambridgeTests';
import { CAMBRIDGE_SPEAKING_TESTS } from '../../data/speakingTests';
import { CAMBRIDGE_MEDIA_CATALOG, type CambridgeBookMedia, type CambridgeMediaFile } from '../../data/cambridgeMediaCatalog';

export interface CambridgeLibraryViewProps {
  showSinhala: boolean;
  onSelectTest: (module: 'reading' | 'listening' | 'tutor' | 'speaking', testId?: string) => void;
}

export const CambridgeLibraryView: React.FC<CambridgeLibraryViewProps> = ({
  showSinhala,
  onSelectTest
}) => {
  // Main view mode: 'interactive' (Simulators) or 'media-suite' (Full Original PDFs & Audio Files)
  const [activeTab, setActiveTab] = useState<'interactive' | 'media-suite'>('interactive');

  // Interactive filters
  const [selectedEra, setSelectedEra] = useState<'all' | 'current' | 'modern' | 'classic'>('all');
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Media Suite State (Original PDFs & Real Audios)
  const [selectedMediaBook, setSelectedMediaBook] = useState<CambridgeBookMedia>(CAMBRIDGE_MEDIA_CATALOG[0]);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(
    CAMBRIDGE_MEDIA_CATALOG[0]?.pdfs[0]?.url || null
  );
  const [currentAudio, setCurrentAudio] = useState<CambridgeMediaFile | null>(
    CAMBRIDGE_MEDIA_CATALOG[0]?.audios[0] || null
  );
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [sheetSubmitted, setSheetSubmitted] = useState<boolean>(false);

  const books = [
    { id: 'all', title: 'All Books' },
    { id: '18', title: 'Book 18', era: 'current', year: '2023', badge: 'Latest' },
    { id: '17', title: 'Book 17', era: 'current', year: '2022' },
    { id: '16', title: 'Book 16', era: 'current', year: '2021' },
    { id: '15', title: 'Book 15', era: 'current', year: '2020' },
    { id: '14', title: 'Book 14', era: 'modern', year: '2019' },
    { id: '13', title: 'Book 13', era: 'modern', year: '2018' },
    { id: '12', title: 'Book 12', era: 'modern', year: '2017' },
    { id: '11', title: 'Book 11', era: 'modern', year: '2016' },
    { id: '10', title: 'Book 10', era: 'classic', year: '2015', badge: 'Classic' },
    { id: '9', title: 'Book 9', era: 'classic', year: '2013' },
    { id: '8', title: 'Book 8', era: 'classic', year: '2011' },
    { id: '7', title: 'Book 7', era: 'classic', year: '2009' },
    { id: '6', title: 'Book 6', era: 'classic', year: '2007' },
    { id: '5', title: 'Book 5', era: 'classic', year: '2006' },
    { id: '4', title: 'Book 4', era: 'classic', year: '2005' },
    { id: '3', title: 'Book 3', era: 'classic', year: '2002' },
    { id: '2', title: 'Book 2', era: 'classic', year: '2000' },
    { id: '1', title: 'Book 1', era: 'classic', year: '1997-2001', badge: 'Complete Suite' },
  ];

  const extractBookNumber = (source: string): string => {
    const match = source.match(/Cambridge(?:\s+IELTS)?\s+(\d+)/i);
    return match ? match[1] : '18';
  };

  const getEra = (bookNum: string): 'current' | 'modern' | 'classic' => {
    const num = parseInt(bookNum, 10);
    if (num >= 15) return 'current';
    if (num >= 11) return 'modern';
    return 'classic';
  };

  // Collect all test items from official Cambridge test data
  const allItems = [
    // Reading Tests
    ...CAMBRIDGE_READING_TESTS.map(t => {
      const bNum = extractBookNumber(t.cambridgeSource);
      return {
        id: t.id,
        module: 'reading' as const,
        bookNumber: bNum,
        era: getEra(bNum),
        source: t.cambridgeSource,
        title: t.title,
        skill: 'Reading',
        icon: BookOpen,
        iconColor: 'text-teal-600 bg-teal-50 border-teal-200',
        tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
        duration: '20 mins (Passage)',
        questionsCount: `${t.questions.length} Questions (TFNG & MCQ)`,
        description: 'Full passage reading test with paragraph markers, verbatim line citations, and bilingual explanations.',
        descriptionSi: 'ඡේද සලකුණු, පේළි සාක්ෂි සහ සිංහල පැහැදිලි කිරීම් සහිත නිල කියවීමේ පරීක්ෂණය.'
      };
    }),

    // Listening Tests
    ...CAMBRIDGE_LISTENING_TESTS.map(l => {
      const bNum = extractBookNumber(l.cambridgeSource);
      return {
        id: l.id,
        module: 'listening' as const,
        bookNumber: bNum,
        era: getEra(bNum),
        source: l.cambridgeSource,
        title: l.title,
        skill: 'Listening',
        icon: Headphones,
        iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
        tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
        duration: '8 mins (Section)',
        questionsCount: `${l.questions.length} Items (Note Completion)`,
        description: 'Audio simulation with distractor traps, playback speed controllers (0.85x, 1.0x, 1.15x), and full transcripts.',
        descriptionSi: 'වාචික රැවටිලි (distractors) පැහැදිලි කිරීම, ශබ්ද වේග පාලනය සහ සම්පූර්ණ පිටපත සහිත ශ්‍රවණ පරීක්ෂණය.'
      };
    }),

    // Writing Tests
    ...ALL_CAMBRIDGE_TESTS.map(w => {
      const bNum = extractBookNumber(w.cambridgeBook);
      return {
        id: w.id,
        module: 'tutor' as const,
        bookNumber: bNum,
        era: getEra(bNum),
        source: w.cambridgeBook,
        title: `${w.category}: ${w.question.substring(0, 70)}...`,
        skill: w.taskType === 'task1' ? 'Writing Task 1' : 'Writing Task 2 (Essay)',
        icon: PenTool,
        iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        duration: `${w.suggestedTimeMinutes} mins (${w.minimumWords}+ words)`,
        questionsCount: 'Band 8.5–9.0 Model Answer Included',
        description: w.question,
        descriptionSi: 'සම්පූර්ණ ප්‍රශ්නය, ලකුණු නිර්ණායක සහ Band 8.5–9.0 ආදර්ශ පිළිතුර සහිත රචනා පුහුණුව.'
      };
    }),

    // Speaking Tests
    ...CAMBRIDGE_SPEAKING_TESTS.map(sp => {
      const bNum = sp.id.startsWith('c1-') ? '1' : '18';
      return {
        id: sp.id,
        module: 'speaking' as const,
        bookNumber: bNum,
        era: getEra(bNum),
        source: bNum === '1' ? 'Cambridge IELTS 1 (Speaking)' : `Cambridge IELTS Standard (Part ${sp.part})`,
        title: sp.topic,
        skill: `Speaking (Part ${sp.part})`,
        icon: Mic,
        iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
        tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
        duration: sp.part === 2 ? '3–4 mins (1m prep + 2m speech)' : '4–5 mins',
        questionsCount: sp.cueCardPoints ? `${sp.cueCardPoints.length} Prompt Points` : `${sp.questions.length} Questions`,
        description: sp.questions.join(' • '),
        descriptionSi: 'තත්පර 60 ක සූදානම් වීමේ ටයිමරය, මිනිත්තු 2 ක කථන පටිගත කිරීම සහ Band 8.5 හඬ ආදර්ශ සහිත සම්මුඛ පරීක්ෂණය.'
      };
    })
  ];

  const filteredItems = allItems.filter(item => {
    const matchesEra = selectedEra === 'all' || item.era === selectedEra;
    const matchesBook = selectedBook === 'all' || item.bookNumber === selectedBook;
    const matchesSkill = selectedSkill === 'all' || item.skill.toLowerCase().includes(selectedSkill.toLowerCase());
    const matchesQuery = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skill.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEra && matchesBook && matchesSkill && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Complete Cambridge IELTS Past Papers Archive (Books 1 to 18)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Cambridge Official Past Papers Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Directly connected to your local library in <code className="text-indigo-200 bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs">D:\Cambridge Books for ILTS</code>.
            Includes 100% of your original 100+ page Cambridge PDF books, 86 authentic exam audio recordings, and computer-delivered practice tests.
          </p>

          {showSinhala && (
            <p className="text-xs text-indigo-200/90 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
              💡 ඔබගේ පරිගණකයේ ඇති <span className="font-mono font-semibold text-white">Cambridge IELTS 1 සිට 18 දක්වා</span> සියලුම PDF පොත් සහ ශ්‍රව්‍ය පටිගත කිරීම් (Audios) පහතින් ක්‍රියාත්මක කළ හැක.
            </p>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-slate-400 font-medium">Cambridge Books</div>
              <div className="text-xl font-bold text-white mt-0.5">17 Books (1–18)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-slate-400 font-medium">Original PDF Books</div>
              <div className="text-xl font-bold text-teal-300 mt-0.5">22 Full PDFs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-slate-400 font-medium">Real Exam Audios</div>
              <div className="text-xl font-bold text-purple-300 mt-0.5">86 MP3 Tracks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-slate-400 font-medium">Full Practice Tests</div>
              <div className="text-xl font-bold text-amber-300 mt-0.5">72 Mock Tests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Switcher: Interactive Tests vs. Original PDF & Audio Suite */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('interactive')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'interactive'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interactive Computer-Delivered Simulators</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono">
            Auto-Scored + Sinhala
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media-suite')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'media-suite'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span>Original Cambridge PDF Books & Real Audios (1–18)</span>
          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-mono">
            Full 100+ Pages & 86 MP3s
          </span>
        </button>
      </div>

      {/* VIEW 1: INTERACTIVE SIMULATORS */}
      {activeTab === 'interactive' && (
        <div className="space-y-6">
          {/* 3-Tier Era Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => { setSelectedEra('current'); setSelectedBook('all'); }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedEra === 'current'
                  ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Current Standard
                </span>
                <span className="text-xs font-bold text-slate-500">2020 – 2026</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">Cambridge 15 – 18</h3>
              <p className="text-xs text-slate-600 mt-1">
                Matches today’s computer-delivered & paper IELTS tests. Modern question calibration.
              </p>
            </div>

            <div 
              onClick={() => { setSelectedEra('modern'); setSelectedBook('all'); }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedEra === 'modern'
                  ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Modern Archive
                </span>
                <span className="text-xs font-bold text-slate-500">2016 – 2019</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">Cambridge 11 – 14</h3>
              <p className="text-xs text-slate-600 mt-1">
                High-difficulty reading passages (Intelligence, Tourism NZ, Cork) and listening note completion.
              </p>
            </div>

            <div 
              onClick={() => { setSelectedEra('classic'); setSelectedBook('all'); }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedEra === 'classic'
                  ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Classic Foundations
                </span>
                <span className="text-xs font-bold text-slate-500">1996 – 2015</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">Cambridge 1 – 10</h3>
              <p className="text-xs text-slate-600 mt-1">
                Classical architectural and scientific history passages (Pyramid of Djoser, Timekeeping).
              </p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Book:
                </span>
                {books.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBook(b.id);
                      if (b.era) setSelectedEra(b.era as any);
                      else setSelectedEra('all');
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedBook === b.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {b.title}
                    {b.badge && (
                      <span className="ml-1 text-[9px] bg-indigo-500 text-white px-1 py-0.2 rounded-full">
                        {b.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search topic or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Skill Module:
              </span>
              {[
                { id: 'all', label: 'All Skills' },
                { id: 'reading', label: '📖 Reading Passages' },
                { id: 'listening', label: '🎧 Listening Sections' },
                { id: 'writing', label: '✍️ Writing (Task 1 & 2)' },
                { id: 'speaking', label: '🗣️ Speaking Room' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSkill(s.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedSkill === s.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400 font-medium">
                Showing {filteredItems.length} practice tests
              </span>
            </div>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-indigo-300"
                >
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl border ${item.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                          {item.skill}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Book {item.bookNumber}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {item.source}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {showSinhala && item.descriptionSi && (
                      <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                        {item.descriptionSi}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <FileText className="w-3 h-3 text-slate-400" />
                        {item.questionsCount}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectTest(item.module, item.id)}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-xs"
                    >
                      <span>Launch Practice Test</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: ORIGINAL PDF BOOKS & REAL EXAM AUDIOS (100% OF LOCAL FILES) */}
      {activeTab === 'media-suite' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Book Selector Bar for All 17 Cambridge Books */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Select Cambridge Book from Your Drive:
              </span>
              <span className="text-xs text-slate-500 font-medium">
                17 Books Indexed Directly from D:\Cambridge Books for ILTS
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CAMBRIDGE_MEDIA_CATALOG.map(b => (
                <button
                  key={b.folderName}
                  type="button"
                  onClick={() => {
                    setSelectedMediaBook(b);
                    if (b.pdfs.length > 0) setActivePdfUrl(b.pdfs[0].url);
                    if (b.audios.length > 0) setCurrentAudio(b.audios[0]);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedMediaBook.folderName === b.folderName
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>Book {b.bookNumber || b.folderName.replace('Cambridge IELTS ', '')}</span>
                  <span className="ml-1.5 text-[10px] opacity-75 font-normal">
                    ({b.pdfs.length} PDFs, {b.audios.length} Audio)
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Book Detail Card & Audio Player */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: PDF Viewer & Audio Bar */}
            <div className="lg:col-span-2 space-y-4">
              {/* Audio Player Component if Book has Audios */}
              {selectedMediaBook.audios.length > 0 && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-600 text-white">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Official Cambridge Exam Audio</div>
                        <div className="text-sm font-bold text-white truncate max-w-sm">
                          {currentAudio ? currentAudio.name : 'Select a listening track'}
                        </div>
                      </div>
                    </div>

                    {/* Speed Controls */}
                    <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs">
                      <span className="text-[10px] text-slate-400 px-1">Speed:</span>
                      {[0.85, 1.0, 1.15, 1.25].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setAudioSpeed(s);
                            const aud = document.getElementById('cambridge-audio-element') as HTMLAudioElement;
                            if (aud) aud.playbackRate = s;
                          }}
                          className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                            audioSpeed === s
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HTML Audio Element */}
                  {currentAudio && (
                    <audio
                      id="cambridge-audio-element"
                      controls
                      src={currentAudio.url}
                      className="w-full h-10 rounded-xl"
                      onPlay={(e) => (e.currentTarget.playbackRate = audioSpeed)}
                    />
                  )}

                  {/* Audio Track Selector Dropdown */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none text-xs">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">Track:</span>
                    {selectedMediaBook.audios.map(aud => (
                      <button
                        key={aud.url}
                        type="button"
                        onClick={() => setCurrentAudio(aud)}
                        className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                          currentAudio?.url === aud.url
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {aud.name.replace('.mp3', '')} ({aud.sizeMB}MB)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Viewer Box */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {/* PDF Header Controls */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-900">
                      {selectedMediaBook.title} Complete Edition
                    </span>
                    {selectedMediaBook.pdfs.length > 1 && (
                      <select
                        value={activePdfUrl || ''}
                        onChange={(e) => setActivePdfUrl(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium"
                      >
                        {selectedMediaBook.pdfs.map(p => (
                          <option key={p.url} value={p.url}>
                            {p.name} ({p.sizeMB} MB)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {activePdfUrl && (
                    <a
                      href={activePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Open PDF in Full Window</span>
                    </a>
                  )}
                </div>

                {/* PDF Embedded Frame */}
                {activePdfUrl ? (
                  <div className="h-[700px] w-full bg-slate-100 flex flex-col">
                    <iframe
                      src={activePdfUrl}
                      title="Cambridge IELTS PDF Viewer"
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No PDF file in this directory.
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Digital 40-Question Answer Sheet */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Digital IELTS Answer Sheet</h3>
                    <p className="text-[11px] text-slate-500">Type your answers (Questions 1 to 40)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setUserAnswers({}); setSheetSubmitted(false); }}
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    title="Clear answers"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>

                {/* 40 Answer Input Slots */}
                <div className="grid grid-cols-2 gap-2 max-h-[560px] overflow-y-auto pr-1 pt-3">
                  {Array.from({ length: 40 }, (_, i) => i + 1).map(num => (
                    <div key={num} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-400 w-6 text-right font-bold">
                        {num}.
                      </span>
                      <input
                        type="text"
                        placeholder="Answer"
                        value={userAnswers[num] || ''}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, [num]: e.target.value }))}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => setSheetSubmitted(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Answer Sheet</span>
                </button>

                {sheetSubmitted && (
                  <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                    <div className="font-bold">Answer Sheet Logged!</div>
                    <div>
                      {Object.keys(userAnswers).length} of 40 questions attempted. Refer to the official Answer Key at the back of the Cambridge PDF (pages 120–140) to mark your score.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
