import React, { createContext, useContext, useState, useEffect } from 'react';
import { initDb } from '../db/initDb';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const [xp, setXp] = useState(0);
    const [medals, setMedals] = useState([]); // Array of strings/emojis
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [savedAnswers, setSavedAnswers] = useState({}); // { 1: "SELECT * FROM cardapio", ... }

    // Load state from local storage and init DB
    useEffect(() => {
        const loadedXp = parseInt(localStorage.getItem('chef_sql_xp')) || 0;
        const loadedMedals = JSON.parse(localStorage.getItem('chef_sql_medals')) || [];
        const loadedChallenges = JSON.parse(localStorage.getItem('chef_sql_challenges')) || [];
        const loadedAnswers = JSON.parse(localStorage.getItem('chef_sql_answers')) || {};

        setXp(loadedXp);
        setMedals(loadedMedals);
        setCompletedChallenges(loadedChallenges);
        setSavedAnswers(loadedAnswers);

        initDb().then(database => setDb(database));
    }, []);

    const addXp = (amount) => {
        const newXp = xp + amount;
        setXp(newXp);
        localStorage.setItem('chef_sql_xp', newXp);
    };

    const addMedal = (medal) => {
        if (!medals.includes(medal)) {
            const newMedals = [...medals, medal];
            setMedals(newMedals);
            localStorage.setItem('chef_sql_medals', JSON.stringify(newMedals));
        }
    };

    const completeChallenge = (challengeId) => {
        if (!completedChallenges.includes(challengeId)) {
            const newCompleted = [...completedChallenges, challengeId];
            setCompletedChallenges(newCompleted);
            localStorage.setItem('chef_sql_challenges', JSON.stringify(newCompleted));
        }
    };

    const saveAnswer = (challengeId, ans) => {
        const newAnswers = { ...savedAnswers, [challengeId]: ans };
        setSavedAnswers(newAnswers);
        localStorage.setItem('chef_sql_answers', JSON.stringify(newAnswers));
    };

    // Title logic based on XP
    const getTitle = () => {
        if (xp < 100) return "Ajudante de Cozinha 🥚";
        if (xp < 300) return "Cozinheiro 🍳";
        if (xp < 600) return "Sous Chef 🔪";
        return "Chef SQL Supremo 👑";
    };

    return (
        <AppContext.Provider value={{ db, xp, medals, addXp, addMedal, getTitle, completedChallenges, completeChallenge, savedAnswers, saveAnswer }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
