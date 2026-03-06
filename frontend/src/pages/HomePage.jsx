import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router";
import { logoutUser, toggleGuestMode } from '../authSlice';
import { fetchAllProblems, fetchSolvedProblems, clearProblems } from '../problemsSlice';

function HomePage() {
    const dispatch = useDispatch();
    const { user, isGuestMode } = useSelector((state) => state.auth);
    const { problems, solvedProblems, loading, solvedLoading } = useSelector((state) => state.problems);
	const [theme, setTheme] = useState(() => {
		if (typeof document !== 'undefined') {
			return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
		}
		return 'dark'
	});
    const [filters, setFilters] = useState({
        difficulty: 'all',
        tag: 'all',
        status: 'all'
    });

	const getInitials = (name) => {
		if (!name || typeof name !== 'string') return '?'
		const trimmed = name.trim()
		if (!trimmed) return '?'
		return trimmed[0].toUpperCase()
	}

	const toggleTheme = () => {
		const next = theme === 'dark' ? 'light' : 'dark'
		setTheme(next)
		try {
			localStorage.setItem('theme', next)
		} catch {}
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', next)
		}
	}
    useEffect(() => {
        dispatch(fetchAllProblems());

        if (user) {
            dispatch(fetchSolvedProblems());
        }
    }, [user, dispatch]);

    const handleLogout = () => {
        dispatch(logoutUser());
        dispatch(clearProblems());
    };

    const filterProblems = (Array.isArray(problems) ? problems : []).filter(problem => {
        const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
        const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
        const statusMatch = filters.status === 'all' ||
            (filters.status === 'solved' && 
             Array.isArray(solvedProblems) && 
             solvedProblems.some(sp => sp._id === problem._id));
        
        return difficultyMatch && tagMatch && statusMatch;
    });

    const getDifficultyBadgeColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'badge-success';
            case 'medium': return 'badge-warning';
            case 'hard': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <nav className="navbar bg-base-100 shadow-lg px-4">
                <div className="flex-1">
                    <NavLink to="/" className="btn btn-ghost text-xl">CoderClash</NavLink>
                </div>

				<div className="flex-none flex items-center gap-4">
					<button
						type="button"
						aria-label="Toggle theme"
						className="btn btn-ghost btn-circle"
						onClick={toggleTheme}
						title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
					>
						{theme === 'dark' ? (
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                          </svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                          </svg>
						)}
					</button>

					{user ? (
						<div className="dropdown dropdown-end">
							<div tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
								<div className="bg-primary text-primary-content rounded-full w-10 h-10 pt-1 flex items-center justify-center">
									<span className="text-xl">{getInitials(user?.firstName)}</span>
								</div>
							</div>
							<ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
								<li className="menu-title px-2 pt-2 pb-0">{user?.firstName}</li>
								<li><NavLink to="/profile">Profile</NavLink></li>
								{user?.role === 'admin' && <li><NavLink to="/admin">Admin</NavLink></li>}
								<li><button onClick={handleLogout}>Logout</button></li>
							</ul>
						</div>
					) : (
						// <div className="flex gap-2">
                        <>
							{!isGuestMode && (
								<button
									onClick={() => dispatch(toggleGuestMode())}
									className={`btn gap-2 ${theme === 'dark' ? 'btn-warning text-warning-content' : 'btn-warning'}`}
									title="Access as Guest - View admin features without making changes"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
										<circle cx="12" cy="12" r="3"></circle>
									</svg>
									Guest Mode
								</button>
							)}
							{isGuestMode && (
								<button
									onClick={() => dispatch(toggleGuestMode())}
									className={`btn gap-2 ${theme === 'dark' ? 'btn-warning text-warning-content' : 'btn-warning'}`}
									title="Exit Guest Mode"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
										<line x1="1" y1="1" x2="23" y2="23"></line>
									</svg>
									Exit Guest
								</button>
							)}                        {isGuestMode ? (
                            <NavLink to="/admin" className="btn btn-outline btn-warning">
                                Admin Panel
                            </NavLink>
                        	)					:	<><NavLink to="/login" className="btn btn-primary">Sign In</NavLink>
							<NavLink to="/signup" className="btn btn-primary">Sign Up</NavLink></>
                        }
                            </>
						// </div>
					)}
				</div>
            </nav>

            <div className="container mx-auto p-4">
                <div className="flex flex-wrap gap-4 mb-6">
                    {user && (
                        <select
                            className="select select-bordered"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All Problems</option>
                            <option value="solved">Solved Problems</option>
                        </select>
                    )}

                    <select
                        className="select select-bordered"
                        value={filters.difficulty}
                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>

                    <select
                        className="select select-bordered"
                        value={filters.tag}
                        onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                    >
                        <option value="all">All Tags</option>
                        <option value="array">Array</option>
                        <option value="string">String</option>
                        <option value="linkedList">Linked List</option>
                        <option value="graph">Graph</option>
                        <option value="dp">Dp</option>
                    </select>
                </div>

                <div className="grid gap-4">
                    {filterProblems.map(problem => (
                        <div key={problem?._id} className="card bg-base-100 shadow-xl transform hover:-translate-y-2 cursor-pointer">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <h2 className="card-title">
                                        <NavLink to={`/problem/${problem?._id}`} className="hover:text-primary">
                                            {problem?.title}
                                        </NavLink>
                                    </h2>
                                    {Array.isArray(solvedProblems) && solvedProblems.some(sp => sp._id === problem?._id) && (
                                        <div className="badge badge-success gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Solved
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <div className={`badge ${getDifficultyBadgeColor(problem?.difficulty)}`}>
                                        {problem?.difficulty}
                                    </div>
                                    <div className="badge badge-info">
                                        {problem?.tags}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;