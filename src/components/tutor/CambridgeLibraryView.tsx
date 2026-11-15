import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Headphones,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  ArrowLeft,
  FileText,
  X,
} from 'lucide-react';
import { CAMBRIDGE_READING_TESTS } from '../../data/readingTests';
import { CAMBRIDGE_LISTENING_TESTS } from '../../data/listeningTests';
import {
  CAMBRIDGE_MEDIA_CATALOG,
  type CambridgeBookMedia,
  type CambridgeMediaFile,
} from '../../data/cambridgeMediaCatalog';

export interface CambridgeLibraryViewProps {
  showSinhala: boolean;
  onSelectTest: (
    module: 'reading' | 'listening' | 'tutor' | 'speaking',
    testId?: string
  ) => void;
  onExitToMainApp?: () => void;
}

type ExamCategoryFilter = 'academic' | 'general';
type ModuleFilter = 'all' | 'listening' | 'reading';

interface ModuleStatus {
  completed?: boolean;
  scoreText?: string; // e.g. "✓ 13/40 · Band 4.5"
  questionsCount: number;
  targetTestId?: string;
}

interface BookTestSlot {
  testNumber: 1 | 2 | 3 | 4;
  listening?: ModuleStatus;
  reading?: ModuleStatus;
  hasFullTest?: boolean;
}

interface CambridgeBookData {
  bookNumber: number;
  progressBadge?: string; // e.g. "6/8" or "2/8"
  listeningCount: number;
  readingCount: number;
  academicTests: BookTestSlot[];
  generalTrainingTests: BookTestSlot[];
}

/**
 * Resolves the best matching Listening test ID in CAMBRIDGE_LISTENING_TESTS for a given book & test number.
 */
function resolveListeningTestId(bookNumber: number, testNumber: number): string {
  const exact = CAMBRIDGE_LISTENING_TESTS.find(
    (t) => t.bookNumber === bookNumber && t.testNumber === testNumber
  );
  if (exact) return exact.id;

  const sameBook = CAMBRIDGE_LISTENING_TESTS.find((t) => t.bookNumber === bookNumber);
  if (sameBook) return sameBook.id;

  // Fallback to Cambridge 1 Test {testNumber} Section 1
  const c1Match = CAMBRIDGE_LISTENING_TESTS.find(
    (t) => t.bookNumber === 1 && t.testNumber === testNumber
  );
  return c1Match ? c1Match.id : CAMBRIDGE_LISTENING_TESTS[0]?.id || 'c1-t1-sec1';
}

/**
 * Resolves the best matching Reading passage ID in CAMBRIDGE_READING_TESTS for a given book, test number, and track.
 */
function resolveReadingPassageId(
  bookNumber: number,
  testNumber: number,
  isGeneralTraining = false
): string {
  if (isGeneralTraining) {
    const gtMatch = CAMBRIDGE_READING_TESTS.find(
      (p) =>
        p.cambridgeSource.toLowerCase().includes(`cambridge ielts ${bookNumber}`) &&
        p.cambridgeSource.toLowerCase().includes('general training')
    );
    if (gtMatch) return gtMatch.id;
  }

  const exact = CAMBRIDGE_READING_TESTS.find(
    (p) =>
      p.cambridgeSource.toLowerCase().includes(`cambridge ielts ${bookNumber}`) &&
      p.cambridgeSource.toLowerCase().includes(`test ${testNumber}`)
  );
  if (exact) return exact.id;

  const sameBook = CAMBRIDGE_READING_TESTS.find((p) =>
    p.cambridgeSource.toLowerCase().includes(`cambridge ielts ${bookNumber}`)
  );
  if (sameBook) return sameBook.id;

  // Fallback by test number in Cambridge 1
  const c1TestMatch = CAMBRIDGE_READING_TESTS.find((p) =>
    p.cambridgeSource.toLowerCase().includes(`test ${testNumber}`)
  );
  return c1TestMatch ? c1TestMatch.id : CAMBRIDGE_READING_TESTS[0]?.id || 'c1-t1-pass1';
}

/**
 * Builds the 21 Cambridge IELTS books (21 down to 1) with authentic question counts and progress statuses
 * matching the user's reference screenshots.
 */
function buildCambridgeBooksCatalog(): CambridgeBookData[] {
  const books: CambridgeBookData[] = [];

  for (let num = 21; num >= 1; num--) {
    if (num === 1) {
      // Exact match to Screenshot 2 (Cambridge IELTS 1)
      books.push({
        bookNumber: 1,
        progressBadge: '2/8',
        listeningCount: 4,
        readingCount: 4,
        academicTests: [
          {
            testNumber: 1,
            listening: {
              questionsCount: 41,
              targetTestId: resolveListeningTestId(1, 1),
            },
            reading: {
              completed: true,
              scoreText: '✓ 13/40 · Band 4.5',
              questionsCount: 40,
              targetTestId: resolveReadingPassageId(1, 1, false),
            },
            hasFullTest: true,
          },
          {
            testNumber: 2,
            listening: {
              questionsCount: 41,
              targetTestId: resolveListeningTestId(1, 2),
            },
            reading: {
              completed: true,
              scoreText: '✓ 0/41 · Band 0.0',
              questionsCount: 41,
              targetTestId: resolveReadingPassageId(1, 2, false),
            },
            hasFullTest: true,
          },
          {
            testNumber: 3,
            listening: {
              questionsCount: 42,
              targetTestId: resolveListeningTestId(1, 3),
            },
            reading: {
              questionsCount: 38,
              targetTestId: resolveReadingPassageId(1, 3, false),
            },
            hasFullTest: true,
          },
          {
            testNumber: 4,
            listening: {
              questionsCount: 42,
              targetTestId: resolveListeningTestId(1, 4),
            },
            reading: {
              questionsCount: 39,
              targetTestId: resolveReadingPassageId(1, 4, false),
            },
            hasFullTest: true,
          },
        ],
        generalTrainingTests: [
          {
            testNumber: 1,
            listening: {
              questionsCount: 41,
              targetTestId: resolveListeningTestId(1, 1),
            },
            reading: {
              questionsCount: 41,
              targetTestId: resolveReadingPassageId(1, 1, true),
            },
            hasFullTest: true,
          },
          {
            testNumber: 2,
            listening: {
              questionsCount: 41,
              targetTestId: resolveListeningTestId(1, 2),
            },
            hasFullTest: false,
          },
          {
            testNumber: 3,
            listening: {
              questionsCount: 42,
              targetTestId: resolveListeningTestId(1, 3),
            },
            hasFullTest: false,
          },
          {
            testNumber: 4,
            listening: {
              questionsCount: 42,
              targetTestId: resolveListeningTestId(1, 4),
            },
            hasFullTest: false,
          },
        ],
      });
    } else if (num === 21) {
      // Book 21 has 6/8 badge in Screenshot 1
      books.push({
        bookNumber: 21,
        progressBadge: '6/8',
        listeningCount: 4,
        readingCount: 4,
        academicTests: ([1, 2, 3, 4] as const).map((tNum) => ({
          testNumber: tNum,
          listening: {
            completed: tNum <= 3,
            scoreText:
              tNum === 1
                ? '✓ 35/40 · Band 8.0'
                : tNum === 2
                ? '✓ 32/40 · Band 7.5'
                : tNum === 3
                ? '✓ 30/40 · Band 7.0'
                : undefined,
            questionsCount: 40,
            targetTestId: resolveListeningTestId(21, tNum),
          },
          reading: {
            completed: tNum <= 3,
            scoreText:
              tNum === 1
                ? '✓ 34/40 · Band 7.5'
                : tNum === 2
                ? '✓ 33/40 · Band 7.5'
                : tNum === 3
                ? '✓ 29/40 · Band 6.5'
                : undefined,
            questionsCount: 40,
            targetTestId: resolveReadingPassageId(21, tNum, false),
          },
          hasFullTest: true,
        })),
        generalTrainingTests: ([1, 2, 3, 4] as const).map((tNum) => ({
          testNumber: tNum,
          listening: {
            questionsCount: 40,
            targetTestId: resolveListeningTestId(21, tNum),
          },
          reading: {
            questionsCount: 40,
            targetTestId: resolveReadingPassageId(21, tNum, true),
          },
          hasFullTest: true,
        })),
      });
    } else {
      books.push({
        bookNumber: num,
        listeningCount: 4,
        readingCount: 4,
        academicTests: ([1, 2, 3, 4] as const).map((tNum) => ({
          testNumber: tNum,
          listening: {
            questionsCount: 40,
            targetTestId: resolveListeningTestId(num, tNum),
          },
          reading: {
            questionsCount: 40,
            targetTestId: resolveReadingPassageId(num, tNum, false),
          },
          hasFullTest: true,
        })),
        generalTrainingTests: ([1, 2, 3, 4] as const).map((tNum) => ({
          testNumber: tNum,
          listening: {
            questionsCount: 40,
            targetTestId: resolveListeningTestId(num, tNum),
          },
          reading: {
            questionsCount: 40,
            targetTestId: resolveReadingPassageId(num, tNum, true),
          },
          hasFullTest: true,
        })),
      });
    }
  }

  return books;
}

export const CambridgeLibraryView: React.FC<CambridgeLibraryViewProps> = ({
  onSelectTest,
  onExitToMainApp,
}) => {
  // Top Filter Controls (Screenshot 1)
  const [categoryFilter, setCategoryFilter] = useState<ExamCategoryFilter>('academic');
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>('all');
  const [bookSearchQuery, setBookSearchQuery] = useState<string>('');

  // Selected Book State: null = 21-1 Books Grid (Screenshot 1); number = Book Detail View (Screenshot 2)
  const [selectedBookNumber, setSelectedBookNumber] = useState<number | null>(null);

  // Optional Original PDF & Audio Media Drawer/Modal
  const [showMediaSuite, setShowMediaSuite] = useState<boolean>(false);
  const [selectedMediaBook, setSelectedMediaBook] = useState<CambridgeBookMedia>(
    CAMBRIDGE_MEDIA_CATALOG[0]
  );
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(
    CAMBRIDGE_MEDIA_CATALOG[0]?.pdfs[0]?.url || null
  );
  const [currentAudio, setCurrentAudio] = useState<CambridgeMediaFile | null>(
    CAMBRIDGE_MEDIA_CATALOG[0]?.audios[0] || null
  );
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [sheetSubmitted, setSheetSubmitted] = useState<boolean>(false);

  const allBooks = useMemo(() => buildCambridgeBooksCatalog(), []);

  const filteredBooks = useMemo(() => {
    const q = bookSearchQuery.trim().toLowerCase();
    if (!q) return allBooks;
    return allBooks.filter(
      (b) =>
        String(b.bookNumber).includes(q) ||
        `cambridge ${b.bookNumber}`.includes(q) ||
        `book ${b.bookNumber}`.includes(q)
    );
  }, [allBooks, bookSearchQuery]);

  const activeBookData = useMemo(() => {
    if (selectedBookNumber === null) return null;
    return allBooks.find((b) => b.bookNumber === selectedBookNumber) || null;
  }, [allBooks, selectedBookNumber]);

  const handleOpenBookMedia = (bookNum: number) => {
    const foundMedia =
      CAMBRIDGE_MEDIA_CATALOG.find((m) => String(m.bookNumber) === String(bookNum)) ||
      CAMBRIDGE_MEDIA_CATALOG[0];
    if (foundMedia) {
      setSelectedMediaBook(foundMedia);
      setActivePdfUrl(foundMedia.pdfs[0]?.url || null);
      setCurrentAudio(foundMedia.audios[0] || null);
    }
    setShowMediaSuite(true);
  };

  // Renders an individual Test Card (Test 1, Test 2, Test 3, Test 4) matching Screenshot 2
  const renderTestCard = (slot: BookTestSlot, keyPrefix: string) => {
    const showListening = moduleFilter === 'all' || moduleFilter === 'listening';
    const showReading = moduleFilter === 'all' || moduleFilter === 'reading';
    const showFullTest = moduleFilter === 'all' && slot.hasFullTest && slot.listening && slot.reading;

    return (
      <div
        key={`${keyPrefix}-test-${slot.testNumber}`}
        className="bg-white rounded-2xl border border-[#e6e8ec] p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
      >
        <div className="space-y-2.5">
          <h3 className="text-[15px] font-extrabold text-slate-900 pb-1">
            Test {slot.testNumber}
          </h3>

          {/* Listening Module Button */}
          {showListening && slot.listening && (
            <button
              type="button"
              onClick={() => onSelectTest('listening', slot.listening?.targetTestId)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all cursor-pointer group ${
                slot.listening.completed
                  ? 'bg-[#effaf3] border-[#a9dfc0] hover:bg-[#e3f6ea]'
                  : 'bg-white border-[#e6e8ec] hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <span className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
                <span className="text-sm leading-none" aria-hidden="true">
                  🎧
                </span>
                <span>Listening</span>
              </span>

              {slot.listening.completed && slot.listening.scoreText ? (
                <span className="text-xs font-bold text-slate-700">
                  {slot.listening.scoreText}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                  {slot.listening.questionsCount} questions →
                </span>
              )}
            </button>
          )}

          {/* Reading Module Button */}
          {showReading && slot.reading && (
            <button
              type="button"
              onClick={() => onSelectTest('reading', slot.reading?.targetTestId)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all cursor-pointer group ${
                slot.reading.completed
                  ? 'bg-[#effaf3] border-[#a9dfc0] hover:bg-[#e3f6ea]'
                  : 'bg-white border-[#e6e8ec] hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <span className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
                <span className="text-sm leading-none" aria-hidden="true">
                  📖
                </span>
                <span>Reading</span>
              </span>

              {slot.reading.completed && slot.reading.scoreText ? (
                <span className="text-xs font-bold text-slate-700">
                  {slot.reading.scoreText}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                  {slot.reading.questionsCount} questions →
                </span>
              )}
            </button>
          )}

          {/* Full Test (L + R, exam conditions) Button */}
          {showFullTest && (
            <button
              type="button"
              onClick={() => onSelectTest('listening', slot.listening?.targetTestId)}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-dashed border-[#d5d9e0] bg-white hover:border-[#d92d20]/50 hover:bg-red-50/20 text-left transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2 text-[13px] font-extrabold text-[#d92d20]">
                <span className="text-sm leading-none" aria-hidden="true">
                  🏁
                </span>
                <span>Full test</span>
              </span>
              <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                L + R, exam conditions →
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#fcfcfd] text-slate-900 font-sans">
      {/* Standalone Page Header (No Sidebar) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedBookNumber(null);
              setShowMediaSuite(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-[#dc2626] group-hover:bg-[#b91c1c] flex items-end justify-center gap-0.5 pb-1.5 transition-colors shadow-2xs">
              <span className="w-1 h-2 bg-white rounded-xs" />
              <span className="w-1 h-3 bg-white rounded-xs" />
              <span className="w-1 h-4 bg-white rounded-xs" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
              IELTS Free Practice
            </span>
          </button>

          <div className="flex items-center gap-3">
            {selectedBookNumber !== null && (
              <button
                type="button"
                onClick={() => setSelectedBookNumber(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                All Books (21–1)
              </button>
            )}
            {onExitToMainApp && (
              <button
                type="button"
                onClick={onExitToMainApp}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Main Hub</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-7 space-y-7">
      {/* ===================================================================== */}
      {/* VIEW 1: CAMBRIDGE IELTS 21–1 MAIN BOOKS GRID (MATCHES SCREENSHOT 1)   */}
      {/* ===================================================================== */}
      {activeBookData === null && !showMediaSuite && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Top 3-Part Filter Bar (Academic/GT | All/Listening/Reading | Search Book) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-1">
            {/* Left Segmented Pill: Academic | General Training */}
            <div className="inline-flex items-center bg-[#f1f3f5] p-1 rounded-full self-start">
              <button
                type="button"
                onClick={() => setCategoryFilter('academic')}
                className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-[13px] transition-all cursor-pointer ${
                  categoryFilter === 'academic'
                    ? 'bg-white text-slate-900 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Academic
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('general')}
                className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-[13px] transition-all cursor-pointer ${
                  categoryFilter === 'general'
                    ? 'bg-white text-slate-900 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                General Training
              </button>
            </div>

            {/* Center Segmented Pill: All | Listening | Reading */}
            <div className="inline-flex items-center bg-[#f1f3f5] p-1 rounded-full self-start md:self-auto">
              <button
                type="button"
                onClick={() => setModuleFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-[13px] transition-all cursor-pointer ${
                  moduleFilter === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setModuleFilter('listening')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-[13px] transition-all cursor-pointer ${
                  moduleFilter === 'listening'
                    ? 'bg-white text-slate-900 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Listening
              </button>
              <button
                type="button"
                onClick={() => setModuleFilter('reading')}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-[13px] transition-all cursor-pointer ${
                  moduleFilter === 'reading'
                    ? 'bg-white text-slate-900 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                Reading
              </button>
            </div>

            {/* Right Search Box: Search a book number, e.g. 20 */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                placeholder="Search a book number, e.g. 20"
                className="w-full px-4 py-2 rounded-xl border border-[#e2e5ea] bg-white text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              />
              {bookSearchQuery && (
                <button
                  type="button"
                  onClick={() => setBookSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Clear book search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Main Heading & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
              Cambridge IELTS 21–1
            </h1>
            <p className="text-sm sm:text-[15px] text-slate-500">
              Pick any book, then any test and module — every test is free, no sign-up needed.
            </p>
          </div>

          {/* 8-Column Grid of Books 21 down to 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3.5 sm:gap-4">
            {filteredBooks.map((book) => (
              <button
                key={book.bookNumber}
                type="button"
                onClick={() => {
                  setSelectedBookNumber(book.bookNumber);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="relative bg-white rounded-2xl border border-[#e6e8ec] hover:border-slate-300 px-3 py-5 flex flex-col items-center justify-center text-center shadow-[0_1px_2px_rgba(16,24,40,0.02)] hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Top-Right Completion Badge (e.g. 6/8 on Book 21, 2/8 on Book 1) */}
                {book.progressBadge && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#f1f3f5] text-slate-700 text-[11px] font-bold leading-none">
                    {book.progressBadge}
                  </span>
                )}

                {/* Large Red Book Number */}
                <span className="text-[28px] sm:text-[32px] font-extrabold text-[#d92d20] leading-tight group-hover:scale-105 transition-transform">
                  {book.bookNumber}
                </span>

                {/* Subtitle: Cambridge {num} */}
                <span className="text-xs sm:text-[13px] text-slate-600 font-medium mt-2">
                  Cambridge {book.bookNumber}
                </span>

                {/* Bottom Module Counts: 🎧 4 📖 4 */}
                <div className="flex items-center justify-center gap-2.5 mt-2 text-xs text-slate-500 font-medium">
                  {(moduleFilter === 'all' || moduleFilter === 'listening') && (
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden="true">🎧</span>
                      <span>{book.listeningCount}</span>
                    </span>
                  )}
                  {(moduleFilter === 'all' || moduleFilter === 'reading') && (
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden="true">📖</span>
                      <span>{book.readingCount}</span>
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: SELECTED CAMBRIDGE BOOK DETAIL VIEW (MATCHES SCREENSHOT 2)    */}
      {/* ===================================================================== */}
      {activeBookData !== null && !showMediaSuite && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Top Back Link + Quick Book Switcher + Original PDF Viewer Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedBookNumber(null)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cambridge IELTS 21–1</span>
            </button>

            <div className="flex items-center gap-2">
              {activeBookData.bookNumber <= 18 && (
                <button
                  type="button"
                  onClick={() => handleOpenBookMedia(activeBookData.bookNumber)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#d92d20]" />
                  <span>Original PDF &amp; Audio (Book {activeBookData.bookNumber})</span>
                </button>
              )}
            </div>
          </div>

          {/* Book Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Cambridge IELTS {activeBookData.bookNumber}
            </h1>
            <p className="text-sm sm:text-[15px] text-slate-500">
              Choose a test, then a module. You can take them in any order.
            </p>
          </div>

          {/* Academic Section */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Academic
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {activeBookData.academicTests.map((slot) =>
                renderTestCard(slot, `book-${activeBookData.bookNumber}-academic`)
              )}
            </div>
          </section>

          {/* General Training Section */}
          <section className="space-y-4 pt-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              General Training
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {activeBookData.generalTrainingTests.map((slot) =>
                renderTestCard(slot, `book-${activeBookData.bookNumber}-gt`)
              )}
            </div>
          </section>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: ORIGINAL PDF BOOKS & REAL EXAM AUDIOS SUITE                   */}
      {/* ===================================================================== */}
      {showMediaSuite && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowMediaSuite(false)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                Back to {activeBookData ? `Cambridge IELTS ${activeBookData.bookNumber}` : 'Cambridge IELTS 21–1'}
              </span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Select Cambridge Book PDF &amp; Audio:
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CAMBRIDGE_MEDIA_CATALOG.map((b) => (
                <button
                  key={b.folderName}
                  type="button"
                  onClick={() => {
                    setSelectedMediaBook(b);
                    if (b.pdfs.length > 0) setActivePdfUrl(b.pdfs[0].url);
                    if (b.audios.length > 0) setCurrentAudio(b.audios[0]);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedMediaBook.folderName === b.folderName
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>Book {b.bookNumber || b.folderName.replace('Cambridge IELTS ', '')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {selectedMediaBook.audios.length > 0 && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-600 text-white">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">
                          Official Cambridge Exam Audio
                        </div>
                        <div className="text-sm font-bold text-white truncate max-w-sm">
                          {currentAudio ? currentAudio.name : 'Select a listening track'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs">
                      <span className="text-[10px] text-slate-400 px-1">Speed:</span>
                      {[0.85, 1.0, 1.15, 1.25].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setAudioSpeed(s);
                            const aud = document.getElementById(
                              'cambridge-audio-element'
                            ) as HTMLAudioElement;
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

                  {currentAudio && (
                    <audio
                      id="cambridge-audio-element"
                      controls
                      src={currentAudio.url}
                      className="w-full h-10 rounded-xl"
                      onPlay={(e) => (e.currentTarget.playbackRate = audioSpeed)}
                    />
                  )}

                  <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none text-xs">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">Track:</span>
                    {selectedMediaBook.audios.map((aud) => (
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

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-900">
                      {selectedMediaBook.title} Complete Edition
                    </span>
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

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Digital IELTS Answer Sheet</h3>
                    <p className="text-[11px] text-slate-500">
                      Type your answers (Questions 1 to 40)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswers({});
                      setSheetSubmitted(false);
                    }}
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[560px] overflow-y-auto pr-1 pt-3">
                  {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => (
                    <div key={num} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-400 w-6 text-right font-bold">
                        {num}.
                      </span>
                      <input
                        type="text"
                        placeholder="Answer"
                        value={userAnswers[num] || ''}
                        onChange={(e) =>
                          setUserAnswers((prev) => ({ ...prev, [num]: e.target.value }))
                        }
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => setSheetSubmitted(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Answer Sheet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
