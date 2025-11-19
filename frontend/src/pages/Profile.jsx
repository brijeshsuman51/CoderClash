import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";

function Profile() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalSolved, setTotalSolved] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/user/profile');
                setProfileData(response.data.user);
                setSolvedProblems(response.data.user.problemSolved || []);
                setTotalSolved(response.data.totalSolved || 0);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const getDifficultyBadgeColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'badge-success';
            case 'medium': return 'badge-warning';
            case 'hard': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return '?';
        const trimmed = name.trim();
        if (!trimmed) return '?';
        return trimmed[0].toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <nav className="navbar bg-base-100 shadow-lg px-4">
                <div className="flex-1">
                    <NavLink to="/" className="btn btn-ghost text-xl">CoderClash</NavLink>
                </div>
                <div className="flex-none gap-4">
                    <NavLink to="/" className="btn btn-ghost">Home</NavLink>
                    <NavLink to="/profile/edit" className="btn btn-primary">Edit Profile</NavLink>
                </div>
            </nav>

            <div className="container mx-auto p-6">

                {/* Profile Header */}

                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <div className="flex items-center gap-6">
                            <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-24 h-24 pl-9 pt-6  flex items-center justify-center">
                                    <span className="text-4xl">{getInitials(profileData?.firstName)}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">{profileData?.firstName} {profileData?.lastName || ''}</h1>
                                <p className="text-gray-500">{profileData?.emailId}</p>
                                {profileData?.age && (
                                    <p className="text-sm text-gray-400">Age: {profileData.age}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Solved Problem Difficulty Card*/}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-primary">Total Solved</h2>
                            <p className="text-4xl font-bold">{totalSolved}</p>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-success">Easy</h2>
                            <p className="text-4xl font-bold">
                                {solvedProblems.filter(p => p?.difficulty === 'easy').length}
                            </p>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-warning">Medium</h2>
                            <p className="text-4xl font-bold">
                                {solvedProblems.filter(p => p?.difficulty === 'medium').length}
                            </p>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-error">Hard</h2>
                            <p className="text-4xl font-bold">
                                {solvedProblems.filter(p => p?.difficulty === 'hard').length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Solved Problems List */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Solved Problems</h2>
                        {solvedProblems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No problems solved yet. Start solving to see your progress here!</p>
                                <NavLink to="/" className="btn btn-primary mt-4">Browse Problems</NavLink>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {solvedProblems.map((problem) => (
                                    <div key={problem?._id} className="card bg-base-200 shadow-md">
                                        <div className="card-body">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <NavLink 
                                                        to={`/problem/${problem?._id}`} 
                                                        className="text-xl font-semibold hover:text-primary"
                                                    >
                                                        {problem?.title}
                                                    </NavLink>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className={`badge ${getDifficultyBadgeColor(problem?.difficulty)}`}>
                                                        {problem?.difficulty}
                                                    </div>
                                                    <div className="badge badge-info">
                                                        {problem?.tags}
                                                    </div>
                                                    <div className="badge badge-success gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Solved
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
