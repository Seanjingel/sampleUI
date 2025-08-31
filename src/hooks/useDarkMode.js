import { useEffect, useState } from 'react';

const useDarkMode = () => {
    const [theme, setTheme] = useState(() => localStorage.theme || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return { theme, toggleTheme };
};

export default useDarkMode;

