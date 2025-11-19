import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavLink, useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { checkAuth } from "../authSlice";

const editProfileSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters").max(20, "First name must be at most 20 characters"),
    lastName: z.string().min(3, "Last name must be at least 3 characters").max(20, "Last name must be at most 20 characters").optional().or(z.literal("")),
    age: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z.number().min(6, "Age must be at least 6").max(80, "Age must be at most 80").optional()
    ),
});

function EditProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(editProfileSchema),
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosClient.get('/user/profile');
                const profileData = response.data.user;
                setValue('firstName', profileData.firstName || '');
                setValue('lastName', profileData.lastName || '');
                setValue('age', profileData.age || '');
            } catch (error) {
                console.error("Error fetching profile:", error);
                setApiError("Failed to load profile data");
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user, setValue]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setApiError(null);
            setSuccessMessage(null);

            const updateData = {
                firstName: data.firstName,
                lastName: data.lastName || undefined,
                age: data.age || undefined,
            };

            const response = await axiosClient.put('/user/profile', updateData);
            
            setSuccessMessage("Profile updated successfully!");
            
            dispatch(checkAuth());
            
            setTimeout(() => {
                navigate('/profile');
            }, 1000);
        } catch (error) {
            let errorMessage = 'Failed to update profile';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'string') {
                    if (errorData.includes('Error:')) {
                        errorMessage = errorData.split('Error:')[1].trim();
                    } else {
                        errorMessage = errorData;
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setApiError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <nav className="navbar bg-base-100 shadow-lg px-4">
                <div className="flex-1">
                    <NavLink to="/" className="btn btn-ghost text-xl">CoderClash</NavLink>
                </div>
                <div className="flex-none gap-4">
                    <NavLink to="/" className="btn btn-ghost">Home</NavLink>
                    <NavLink to="/profile" className="btn btn-ghost">Profile</NavLink>
                </div>
            </nav>

            <div className="container mx-auto p-6 max-w-2xl">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">Edit Profile</h2>

                        {apiError && (
                            <div className="alert alert-error mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{apiError}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="alert alert-success mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Email */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    value={user?.emailId || ''}
                                    className="input input-bordered w-full bg-base-200"
                                    disabled
                                />
                                <label className="label">
                                    <span className="label-text-alt text-gray-500">Email cannot be changed</span>
                                </label>
                            </div>

                            {/* First Name */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">First Name *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="John"
                                    className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
                                    {...register('firstName')}
                                />
                                {errors.firstName && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.firstName.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Last Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    className={`input input-bordered w-full ${errors.lastName ? 'input-error' : ''}`}
                                    {...register('lastName')}
                                />
                                {errors.lastName && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.lastName.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Age */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Age</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="25"
                                    min="6"
                                    max="80"
                                    className={`input input-bordered w-full ${errors.age ? 'input-error' : ''}`}
                                    {...register('age')}
                                />
                                {errors.age && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.age.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Role */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Role</span>
                                </label>
                                <input
                                    type="text"
                                    value={user?.role || ''}
                                    className="input input-bordered w-full bg-base-200 capitalize"
                                    disabled
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="form-control mt-6">
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;

