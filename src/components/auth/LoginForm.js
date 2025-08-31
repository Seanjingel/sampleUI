import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login } from '../../api/authService';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login: loginContext } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login({ username, password });
            const token = response?.token || response?.data?.token;

            if (token) {
                // Pass navigate to loginContext so it can redirect to overview
                loginContext(token, { username }, navigate); 
                localStorage.setItem('username', username);
                return;
            }

            // Handle specific error messages
            if (response?.message?.toLowerCase().includes('user not found')) {
                toast.error('User not found. Please register first.');
            } else if (response?.message?.toLowerCase().includes('success')) {
                toast.error('Login failed. No token received.');
            } else {
                toast.error('Login failed. Invalid response from server.');
            }
        } catch (error) {
            toast.error('Login failed. Please check your credentials and try again.');
            
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div>
                <label className="block text-gray-700">Username</label>
                <input
                    type="username"
                    className="mt-1 w-full border border-gray-300 p-2 rounded"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
            <div className="flex justify-between items-center text-sm">
                <div>
                    Not a member?{' '}
                    <button
                        type="button"
                        className="text-indigo-600 hover:underline focus:outline-none"
                        onClick={props.onRegisterClick}
                    >
                        Register
                    </button>
                </div>
                <div>
                    <Link to="#" className="text-indigo-600 hover:underline">Forgot password?</Link>
                </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                Login
            </button>
            <ToastContainer />
        </form>
    );
};

export default LoginForm;
