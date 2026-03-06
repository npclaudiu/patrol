import { HashRouter, Link, Route, Routes } from "react-router";

function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                Welcome to Patrol
            </h1>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                The high-performance Git client for massive repositories.
            </p>
            <div className="flex gap-4">
                <Link
                    to="/repos"
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:hover:bg-blue-500"
                >
                    View Repositories
                </Link>
                <Link
                    to="/settings"
                    className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 shadow-md transition hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    Settings
                </Link>
            </div>
        </div>
    );
}

function Repositories() {
    return (
        <div className="p-8">
            <div className="mb-6 flex items-center gap-4">
                <Link to="/" className="text-blue-500 hover:underline">
                    &larr; Back
                </Link>
                <h2 className="text-2xl font-bold">Repositories</h2>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">No repositories added yet.</p>
            </div>
        </div>
    );
}

function Settings() {
    return (
        <div className="p-8">
            <div className="mb-6 flex items-center gap-4">
                <Link to="/" className="text-blue-500 hover:underline">
                    &larr; Back
                </Link>
                <h2 className="text-2xl font-bold">Settings</h2>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">Settings will go here.</p>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/repos" element={<Repositories />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </HashRouter>
    );
}
