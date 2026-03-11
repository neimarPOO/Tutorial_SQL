import React from 'react';
import { useAppContext } from '../store/AppContext';

const Header = ({ activeTab, setActiveTab }) => {
    const { xp, getTitle } = useAppContext();

    const tabs = [
        { id: 'escola', label: 'Escola do Chef', icon: '📚' },
        { id: 'desafios', label: 'Desafios do Chef', icon: '🍕' },
        { id: 'restaurante', label: 'Meu Restaurante', icon: '📂' },
        { id: 'jaleco', label: 'Meu Jaleco', icon: '🏆' },
    ];

    return (
        <header style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '20px',
            boxShadow: 'var(--shadow-md)',
            borderBottomLeftRadius: 'var(--radius-lg)',
            borderBottomRightRadius: 'var(--radius-lg)',
            marginBottom: '20px'
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '2.5rem' }}>👨‍🍳</span>
                    <div>
                        <h1 style={{ color: 'white', margin: 0, textShadow: '2px 2px 0px var(--primary-dark)' }}>Chef SQL</h1>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                            {getTitle()} | {xp} Pontos de Sabor 🔥
                        </p>
                    </div>
                </div>

                <nav style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '5px'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                backgroundColor: activeTab === tab.id ? 'var(--secondary)' : 'var(--primary-dark)',
                                color: activeTab === tab.id ? 'var(--primary-dark)' : 'white',
                                padding: '10px 16px',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                fontWeight: 'bold',
                                boxShadow: activeTab === tab.id ? '0 4px 0 var(--secondary-dark)' : 'none',
                                transform: activeTab === tab.id ? 'translateY(-2px)' : 'none'
                            }}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;
