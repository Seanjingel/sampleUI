import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/authService';
import { ToastContainer, toast } from 'react-toastify';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register({ username, email, password });
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMsg);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <div>
                    <label className="block text-gray-700">Username</label>
                    <input
                        type="text"
                        className="mt-1 w-full border border-gray-300 p-2 rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Email address</label>
                    <input
                        type="email"
                        className="mt-1 w-full border border-gray-300 p-2 rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        className="mt-1 w-full border border-gray-300 p-2 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="text-sm">
                    Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                    Register
                </button>
            </form>
            <ToastContainer />
        </>
    );
};

export default RegisterForm;