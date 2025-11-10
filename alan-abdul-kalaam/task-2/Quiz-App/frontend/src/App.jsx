import { useState, useEffect, useMemo, useCallback } from "react";
import UsernameEntry from "./components/UsernameEntry";
import CategorySelection from "./components/CategorySelection";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import UserStats from "./components/UserStats";
import "./App.css";

const SCREEN_META = {
  username: {
    title: "Register participant",
    description: "Introduce yourself to begin the assessment workflow.",
  },
  category: {
    title: "Select a knowledge area",
    description: "Choose a category to load curated question sets.",
  },
  quiz: {
    title: "Answer assessment items",
    description: "Review each question carefully before submitting.",
  },
  result: {
    title: "Review assessment results",
    description: "Analyse performance metrics and continue learning.",
  },
};

function App() {
  const [currentScreen, setCurrentScreen] = useState("username"); // username, category, quiz, result
  const [username, setUsername] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/${username}`);
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }, [API_BASE_URL, username]);

  // Fetch user stats when username is set
  useEffect(() => {
    if (username) {
      fetchUserStats();
    }
  }, [fetchUserStats, username]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentScreen]);

  const handleUsernameSubmit = (name) => {
    setUsername(name);
    setCurrentScreen("category");
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/random/${category}`);
      const data = await response.json();
      setQuizData(data);
      setUserAnswers(new Array(data.questions.length).fill(null));
      setCurrentScreen("quiz");
    } catch (error) {
      console.error("Error fetching quiz:", error);
      alert("Error loading quiz. Please try again.");
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    try {
      // Submit quiz and get results
      const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quizData._id,
          answers: userAnswers,
        }),
      });
      const result = await response.json();
      setQuizResult(result);

      // Update user stats
      await fetch(`${API_BASE_URL}/stats/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          category: selectedCategory,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctCount,
          incorrectAnswers: result.incorrectCount,
        }),
      });

      // Refresh user stats
      await fetchUserStats();
      setCurrentScreen("result");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Error submitting quiz. Please try again.");
    }
  };

  const handlePlayAgain = () => {
    setSelectedCategory("");
    setQuizData(null);
    setUserAnswers([]);
    setQuizResult(null);
    setCurrentScreen("category");
  };

  const handleChangeUser = () => {
    setUsername("");
    setSelectedCategory("");
    setQuizData(null);
    setUserAnswers([]);
    setQuizResult(null);
    setUserStats(null);
    setCurrentScreen("username");
  };

  const steps = useMemo(
    () => [
      { id: "username", label: "Participant" },
      { id: "category", label: "Categories" },
      { id: "quiz", label: "Assessment" },
      { id: "result", label: "Results" },
    ],
    []
  );

  useEffect(() => {
    const base = "QuizMaster";
    const metaTitle = SCREEN_META[currentScreen]?.title || "Assessment console";

    let contextualTitle = metaTitle;

    if (currentScreen === "category" && username) {
      contextualTitle = `${username} · ${metaTitle}`;
    } else if (currentScreen === "quiz") {
      contextualTitle = `${metaTitle} · ${selectedCategory || "Assessment"}`;
    } else if (currentScreen === "result") {
      contextualTitle = `${selectedCategory || "Assessment"} results`;
    }

    document.title = `${contextualTitle} · ${base}`;
  }, [currentScreen, selectedCategory, username]);

  const activeStepIndex = steps.findIndex((step) => step.id === currentScreen);
  const { title, description } = SCREEN_META[currentScreen];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="mb-10">
        <div className="text-2xl font-semibold text-gray-900">QuizMaster</div>
        <p className="text-sm text-gray-500">Assessment Console</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-gray-400">
            Workflow
          </h2>
          <nav className="mt-3 flex flex-col gap-1">
            {steps.map((step, index) => {
              const isActive = step.id === currentScreen;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-900/5"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </nav>
        </div>

        <div>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-gray-400">
            Session
          </h2>
          <div className="mt-3 space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
              <span>Current user</span>
              <span className="font-medium text-gray-900">
                {username || "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
              <span>Category</span>
              <span className="font-medium text-gray-900">
                {selectedCategory || "Not selected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
        <p className="font-medium text-gray-900">Quick tips</p>
        <ul className="mt-3 space-y-2 list-disc pl-5">
          <li>Save progress by completing a full submission.</li>
          <li>Switch categories anytime from the results screen.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-80 max-w-[85vw] flex-col bg-white px-6 py-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Navigation
                </div>
                <p className="text-xs text-gray-500">
                  Track your current workflow step.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600"
              >
                <span className="sr-only">Close navigation</span>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-full max-w-xs shrink-0 border-r border-gray-200 bg-white px-6 py-10 lg:flex">
          <SidebarContent />
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex flex-col gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 lg:hidden"
              >
                <span className="sr-only">Open navigation</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <div className="text-base font-semibold text-gray-900 sm:text-lg">
                  {title}
                </div>
                <p className="mt-1 max-w-xl text-sm text-gray-500">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="tag">
                Step {activeStepIndex + 1} of {steps.length}
              </span>
              {username && (
                <button
                  onClick={handleChangeUser}
                  className="btn-secondary whitespace-nowrap"
                >
                  Switch User
                </button>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
              <div className="flex flex-col gap-2 lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Workflow overview
                </p>
                <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white px-3 py-2">
                  {steps.map((step, index) => {
                    const isActive = step.id === currentScreen;
                    return (
                      <span
                        key={step.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                          isActive
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.75rem] font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        {step.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {currentScreen === "username" && (
                <section className="surface-card">
                  <UsernameEntry onSubmit={handleUsernameSubmit} />
                </section>
              )}

              {currentScreen === "category" && (
                <>
                  {userStats && (
                    <section className="surface-card surface-card--minimal">
                      <UserStats
                        stats={userStats}
                        username={username}
                        onChangeUser={handleChangeUser}
                      />
                    </section>
                  )}
                  <section className="surface-card">
                    <CategorySelection
                      onSelectCategory={handleCategorySelect}
                      apiBaseUrl={API_BASE_URL}
                    />
                  </section>
                </>
              )}

              {currentScreen === "quiz" && quizData && (
                <section className="surface-card">
                  <QuizScreen
                    quizData={quizData}
                    userAnswers={userAnswers}
                    onAnswerChange={handleAnswerChange}
                    onSubmit={handleQuizSubmit}
                  />
                </section>
              )}

              {currentScreen === "result" && quizResult && (
                <>
                  {userStats && (
                    <section className="surface-card surface-card--minimal">
                      <UserStats
                        stats={userStats}
                        username={username}
                        onChangeUser={handleChangeUser}
                      />
                    </section>
                  )}
                  <section className="surface-card">
                    <ResultScreen
                      result={quizResult}
                      category={selectedCategory}
                      onPlayAgain={handlePlayAgain}
                      onChangeUser={handleChangeUser}
                    />
                  </section>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
