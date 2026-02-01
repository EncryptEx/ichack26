import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // add authentication logic later
        console.log('Login:', formData);
        // for now just redirect to homepage
        navigate('/');
    };

    return (
        <div className="auth-container">
            <div className="auth-blob"></div>
            
            <div className="auth-content">
                <div className="auth-header">
                    <h1 className="auth-title">Ready to win at Sleep?</h1>
                    <p className="auth-subtitle">Track your sleep, beat your friends</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button">
                        Log in
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
