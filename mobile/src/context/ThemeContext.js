import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('darkMode');
            if (savedTheme !== null) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const toggleDarkMode = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const colors = {
        light: {
            background: '#FFFFFF',
            surface: '#FFFFFF',
            card: '#F8F8F8',
            text: '#000000',
            textSecondary: '#666666',
            textTertiary: '#999999',
            border: '#E0E0E0',
            primary: '#F5A962',
            secondary: '#FFF4EC',
            success: '#6BCF7F',
            error: '#FF6B6B',
            warning: '#FF9A5A',
            chartBar: '#F5A962',
            modalOverlay: 'rgba(0, 0, 0, 0.5)',
        },
        dark: {
            background: '#0A0A0A',
            surface: '#1A1A1A',
            card: '#252525',
            text: '#FFFFFF',
            textSecondary: '#CCCCCC',
            textTertiary: '#999999',
            border: '#333333',
            primary: '#F5A962',
            secondary: '#2D2520',
            success: '#6BCF7F',
            error: '#FF6B6B',
            warning: '#FF9A5A',
            chartBar: '#F5A962',
            modalOverlay: 'rgba(0, 0, 0, 0.85)',
        },
    };

    const theme = {
        isDarkMode,
        colors: isDarkMode ? colors.dark : colors.light,
        toggleDarkMode,
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
