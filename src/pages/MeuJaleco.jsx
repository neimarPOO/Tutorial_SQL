import React from 'react';
import { useAppContext } from '../store/AppContext';

const titles = [
    { xpThreshold: 0, title: "Ajudante de Cozinha 🥚", max: 100 },
    { xpThreshold: 100, title: "Cozinheiro 🍳", max: 300 },
    { xpThreshold: 300, title: "Sous Chef 🔪", max: 600 },
    { xpThreshold: 600, title: "Chef SQL Supremo 👑", max: 600 }
];

const MeuJaleco = () => {
    const { xp, getTitle, medals, completedChallenges } = useAppContext();

    // Find current tier
    const currentTierIndex = titles.findIndex(t => xp < t.xpThreshold) > 0
        ? titles.findIndex(t => xp < t.xpThreshold) - 1
        : (xp >= 600 ? 3 : 0);

    const currentTier = titles[currentTierIndex];

    // Calculate progress percentage
    let progress = 0;
    if (currentTierIndex < titles.length - 1) {
        const nextTier = titles[currentTierIndex + 1];
        const range = nextTier.xpThreshold - currentTier.xpThreshold;
        const currentProgress = xp - currentTier.xpThreshold;
        progress = (currentProgress / range) * 100;
    } else {
        progress = 100; // Max level
    }

    const msgs = [
        "A chapa tá esquentando, continue assim! 🔥",
        "Você está fritando esses bugs como ninguém! 🍳",
        "Essa query ficou mais bonita que bolo de vitrine! 🍰",
        "Sua sintaxe está uma verdadeira delícia! 🍣"
    ];
    const randomMsg = msgs[xp % msgs.length];

    return (
        <div className="pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Meu Jaleco 🏆</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                    "{randomMsg}"
                </p>
            </div>

            <div style={{
                backgroundColor: 'var(--surface)',
                padding: '30px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '3px solid var(--primary)',
                textAlign: 'center',
                maxWidth: '800px',
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '10px' }}>👨‍🍳</div>
                <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', margin: 0 }}>{getTitle()}</h2>

                <div style={{ margin: '30px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold' }}>
                        <span>🔥 {xp} Pontos de Sabor</span>
                        <span>{currentTierIndex < titles.length - 1 ? `Próximo Título: ${titles[currentTierIndex + 1].xpThreshold} pts` : 'Nível Máximo!'}</span>
                    </div>
                    <div style={{ width: '100%', height: '24px', backgroundColor: '#e0e0e0', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '2px solid #bdbdbd' }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: 'var(--primary)',
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)',
                            backgroundSize: '1rem 1rem'
                        }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{
                    flex: '1 1 300px',
                    backgroundColor: 'var(--surface)',
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '2px dashed var(--secondary-dark)'
                }}>
                    <h3 style={{ color: '#f57f17', marginTop: 0 }}>Medalhas Conquistadas ({medals.length})</h3>
                    {medals.length === 0 ? (
                        <p style={{ color: 'var(--text-light)' }}>Complete desafios para ganhar medalhas exclusivas!</p>
                    ) : (
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            {medals.map((m, i) => (
                                <div key={i} className="bounce" style={{
                                    fontSize: '3rem',
                                    backgroundColor: '#fff8e1',
                                    width: '80px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    border: '3px solid #ffd54f',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }} title="Medalha de Honra ao Mérito Culinário">
                                    {m}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{
                    flex: '1 1 300px',
                    backgroundColor: 'var(--surface)',
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '2px dashed #4caf50'
                }}>
                    <h3 style={{ color: '#2e7d32', marginTop: 0 }}>Desafios Concluídos ({completedChallenges.length}/10)</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
                            const completed = completedChallenges.includes(num);
                            return (
                                <div key={num} style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: completed ? '#4caf50' : '#e0e0e0',
                                    color: completed ? 'white' : '#9e9e9e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    boxShadow: completed ? '0 2px 4px rgba(76, 175, 80, 0.4)' : 'none'
                                }}>
                                    {completed ? '✓' : num}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeuJaleco;
