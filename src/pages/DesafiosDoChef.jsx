import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { execQuery } from '../db/initDb';
import SqlEditor from '../components/SqlEditor';

const desafios = [
    {
        id: 1,
        titulo: "1. O Cardápio Completo",
        historia: "O Chef Tomate esqueceu os pratos do seu próprio restaurante! Ajude a encontrar todos eles.",
        objetivo: "Mostre todos os pratos (todas as colunas) da tabela `cardapio`.",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            return p.includes('select') && p.includes('*') && p.includes('cardapio') && result.columns.length >= 4;
        }
    },
    {
        id: 2,
        titulo: "2. Só as Pizzas!",
        historia: "O dono quer revisar os preços, mas ele só quer ver as pizzas!",
        objetivo: "Filtre a tabela `cardapio` para mostrar apenas os pratos onde categoria='pizza'.",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            return p.includes('where') && p.includes('pizza') && result.values.length > 0;
        }
    },
    {
        id: 3,
        titulo: "3. Do Mais Barato ao Mais Caro",
        historia: "Os clientes querem saber as opções mais em conta.",
        objetivo: "Ordene os pratos do `cardapio` pelo preco (crescente).",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            return p.includes('order by') && p.includes('preco') && result.values.length > 0;
        }
    },
    {
        id: 4,
        titulo: "4. Promoção: Menos de R$ 30",
        historia: "Quais pratos podemos colocar no combo promocional?",
        objetivo: "Selecione o nome e preco dos pratos do `cardapio` que custam menos de 30.",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            return p.includes('where') && p.includes('30') && result.values.length > 0;
        }
    },
    {
        id: 5,
        titulo: "5. O Prato Mais Caro",
        historia: "O Chef Sushi jura que o prato dele é o mais caro. Descubra qual é!",
        objetivo: "Use a função MAX() no preco da tabela `cardapio`.",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            return p.includes('max') && result.values.length === 1 && result.values[0][0] === 48;
        }
    },
    {
        id: 6,
        titulo: "6. A Busca pelo Ingrediente Secreto",
        historia: "O Chef acha que esqueceu de anotar o 'Manjericão'. Filtre o prato certo!",
        objetivo: "Selecione todos os dados do `cardapio` que possuem 'Manjericão' (use LIKE '%Manjericão%').",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            return p.includes('like') && p.includes('manjericão') && result.values.length > 0;
        }
    },
    {
        id: 7,
        titulo: "7. Nova Receita Polêmica",
        historia: "O Chef Tomate enlouqueceu e quer abacaxi na pizza!",
        objetivo: "Faça um INSERT INTO `cardapio` com (nome, categoria, preco). Valores: 'Pizza de Abacaxi', 'pizza', 40.0",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            const check = execQuery(db, "SELECT * FROM cardapio WHERE nome LIKE '%Abacaxi%'");
            return p.includes('insert') && check.values.length > 0;
        }
    },
    {
        id: 8,
        titulo: "8. A Inflação do Hambúrguer",
        historia: "A carne ficou mais cara, e o Hambúrguer Clássico também subiu.",
        objetivo: "Faça um UPDATE no `cardapio` mudando o preco para 35 WHERE nome = 'Hambúrguer Clássico'.",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            const check = execQuery(db, "SELECT preco FROM cardapio WHERE nome = 'Hambúrguer Clássico'");
            return p.includes('update') && check.values.length > 0 && check.values[0][0] === 35;
        }
    },
    {
        id: 9,
        titulo: "9. Contagem de Pratos",
        historia: "Existem quantos pratos cadastrados no nosso menu?",
        objetivo: "Use COUNT(*) na tabela `cardapio`.",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            return p.includes('count') && p.includes('cardapio') && result.values.length === 1 && result.values[0][0] >= 5;
        }
    },
    {
        id: 10,
        titulo: "10. O Desafio Final: Tudo Junto!",
        historia: "O dono do restaurante quer um relatório completo das pizzas mais caras.",
        objetivo: "Encontre os pratos da categoria 'pizza' que custam mais que 40, ordenados do mais caro ao mais barato (DESC).",
        tabelas: ["cardapio"],
        verificacao: (result, db, query) => {
            const p = query.toLowerCase();
            return p.includes('where') && p.includes('desc') && p.includes('categoria') && p.includes('pizza') && p.includes('40') && result.values.length > 0;
        }
    }
];

const DesafiosDoChef = () => {
    const { db, addXp, addMedal, completedChallenges, completeChallenge, savedAnswers, saveAnswer } = useAppContext();
    const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [errorCount, setErrorCount] = useState(0);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string, shake: boolean }
    const [modalTable, setModalTable] = useState(null); // { name: string, data: {columns, values} }

    const desafioAtual = desafios[currentChallengeIdx];

    useEffect(() => {
        // Load the saved answer for the current challenge, if any. Otherwise clear.
        if (savedAnswers[desafioAtual.id]) {
            setQuery(savedAnswers[desafioAtual.id]);
        } else {
            setQuery("");
        }

        setResult(null);
        setFeedback(null);
        setErrorCount(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentChallengeIdx]); // Somente executar quando trocar de desafio

    const handleExecute = () => {
        if (!query.trim()) return;

        // Save progress explicitly on execution
        saveAnswer(desafioAtual.id, query);

        const queryResult = execQuery(db, query);

        if (queryResult.error) {
            setFeedback({ type: 'error', message: `Mancada culinária: ${queryResult.error}`, shake: true });
            setTimeout(() => setFeedback(prev => ({ ...prev, shake: false })), 500);
            setErrorCount(prev => prev + 1);
            setResult(null);
            return;
        }

        // If it's a mutation query (INSERT/UPDATE/DELETE), run a SELECT to show the user what happened
        let visibleResult = queryResult;
        const lowQuery = query.toLowerCase();
        if ((lowQuery.includes('insert') || lowQuery.includes('update') || lowQuery.includes('delete')) && desafioAtual.tabelas.length > 0) {
            const tableName = desafioAtual.tabelas[0];
            const checkQuery = `SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 5`; // Show the latest changes
            const afterMutationResult = execQuery(db, checkQuery);
            if (!afterMutationResult.error) {
                visibleResult = afterMutationResult;
            }
        }

        setResult(visibleResult);

        try {
            const success = desafioAtual.verificacao(queryResult, db, query);
            if (success) {
                setFeedback({ type: 'success', message: "Perfeito! Ficou uma delícia! Você é um Chef SQL! ✅", shake: false });
                if (!completedChallenges.includes(desafioAtual.id)) {
                    completeChallenge(desafioAtual.id);
                    addXp(50);
                    if (desafioAtual.id === 5) addMedal('🍕');
                    if (desafioAtual.id === 10) addMedal('👑');
                }
            } else {
                setFeedback({ type: 'error', message: "Hmm, esse prato ficou salgado... não trouxe os resultados esperados. Tente de novo! ❌", shake: true });
                setTimeout(() => setFeedback(prev => ({ ...prev, shake: false })), 500);
                setErrorCount(prev => prev + 1);
            }
        } catch (e) {
            setFeedback({ type: 'error', message: "Algo deu errado na avaliação da receita.", shake: true });
            setTimeout(() => setFeedback(prev => ({ ...prev, shake: false })), 500);
        }
    };

    const handlePreviewTable = (tableName) => {
        const queryResult = execQuery(db, `SELECT * FROM ${tableName}`);
        if (!queryResult.error) {
            setModalTable({ name: tableName, data: queryResult });
        }
    };

    const proximoDesafio = () => {
        if (currentChallengeIdx < desafios.length - 1) {
            setCurrentChallengeIdx(prev => prev + 1);
        }
    };

    const getDica = () => {
        if (errorCount < 2) return null;
        if (desafioAtual.id === 1) return "Dica: Use SELECT * FROM cardapio;";
        if (desafioAtual.id === 2) return "Dica: SELECT * FROM cardapio WHERE categoria = 'pizza';";
        if (desafioAtual.id === 3) return "Dica: SELECT * FROM cardapio ORDER BY preco ASC;";
        if (desafioAtual.id === 4) return "Dica: SELECT nome, preco FROM cardapio WHERE preco < 30;";
        if (desafioAtual.id === 5) return "Dica: SELECT MAX(preco) FROM cardapio;";
        if (desafioAtual.id === 6) return "Dica: SELECT * FROM cardapio WHERE ingredientes LIKE '%Manjericão%';";
        if (desafioAtual.id === 7) return "Dica: INSERT INTO cardapio (nome, categoria, preco) VALUES ('...', '...', 10.0);";
        if (desafioAtual.id === 8) return "Dica: UPDATE cardapio SET preco = 35 WHERE nome = '...';";
        if (desafioAtual.id === 9) return "Dica: SELECT COUNT(*) FROM cardapio;";
        if (desafioAtual.id === 10) return "Dica: SELECT * FROM cardapio WHERE categoria='pizza' AND preco > 40 ORDER BY preco DESC;";
        return "Tente rever a aula desse conceito!";
    };

    return (
        <div className="pop-in">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Desafios do Chef 🍳</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>Resolva as receitas (queries) para ganhar Pontos de Sabor!</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ width: '100%' }}>
                    {/* Navegação de Desafios */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {desafios.map((d, i) => (
                            <button
                                key={d.id}
                                onClick={() => setCurrentChallengeIdx(i)}
                                style={{
                                    padding: '10px 15px',
                                    borderRadius: 'var(--radius-full)',
                                    border: 'none',
                                    backgroundColor: currentChallengeIdx === i ? 'var(--primary)' :
                                        completedChallenges.includes(d.id) ? 'var(--accent)' : 'var(--border)',
                                    color: (currentChallengeIdx === i || completedChallenges.includes(d.id)) ? 'white' : 'var(--text)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: currentChallengeIdx === i ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
                                }}
                            >
                                {d.id} {completedChallenges.includes(d.id) ? '✅' : ''}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        backgroundColor: 'var(--surface)',
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-md)',
                        border: '2px solid var(--secondary)'
                    }}>
                        <h2 style={{ color: 'var(--primary-dark)', marginTop: 0 }}>{desafioAtual.titulo}</h2>
                        <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '15px', borderLeft: '4px solid var(--primary)' }}>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontStyle: 'italic' }}>"{desafioAtual.historia}"</p>
                        </div>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Objetivo: {desafioAtual.objetivo}</p>
                        
                        <div style={{ color: 'var(--text)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                            <span style={{ fontWeight: 'bold' }}>Tabelas disponíveis:</span>
                            {desafioAtual.tabelas.map(t => (
                                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <code style={{ backgroundColor: '#eeeeee', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', border: '1px solid #ddd' }}>{t}</code>
                                    <button 
                                        onClick={() => handlePreviewTable(t)}
                                        style={{
                                            background: '#fff', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', 
                                            padding: '4px 8px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                        title={`Ver todos os dados de ${t}`}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#fff3e0'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}
                                    >
                                        👁️ Ver Dados
                                    </button>
                                </span>
                            ))}
                        </div>

                        {getDica() && (
                            <div className="pop-in" style={{
                                marginTop: '15px', backgroundColor: '#e8f5e9', padding: '10px',
                                borderRadius: '8px', border: '1px solid var(--accent)', color: 'var(--accent-dark)'
                            }}>
                                <strong>💡 Dica Quente:</strong> {getDica()}
                            </div>
                        )}

                        <div style={{ marginTop: '20px' }}>
                            <SqlEditor value={query} onChange={setQuery} onExecute={handleExecute} />
                        </div>
                    </div>
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {feedback && (
                        <div className={feedback.shake ? 'shake' : 'bounce'} style={{
                            backgroundColor: feedback.type === 'success' ? '#e8f5e9' : '#ffebee',
                            color: feedback.type === 'success' ? '#2e7d32' : '#c62828',
                            padding: '20px',
                            borderRadius: 'var(--radius-lg)',
                            border: `2px solid ${feedback.type === 'success' ? '#4caf50' : '#ef5350'}`,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            {feedback.message}
                        </div>
                    )}

                    {result && !result.error && (
                        <div className="pop-in" style={{
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-lg)',
                            padding: '20px',
                            boxShadow: 'var(--shadow-sm)',
                            overflowX: 'auto',
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}>
                            <h3 style={{ marginTop: 0 }}>Resultado (Sua Culinária) 🍽️</h3>
                            {result.values.length === 0 ? (
                                <p>A tabela retornou vazia! (Ou foi um comando que não retorna dados, como INSERT/UPDATE/DELETE)</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--primary-dark)', color: 'white' }}>
                                            {result.columns.map((col, idx) => (
                                                <th key={idx} style={{ padding: '12px', border: '1px solid #ffccbc' }}>{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.values.map((row, rowIdx) => (
                                            <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? '#fafafa' : 'white' }}>
                                                {row.map((val, valIdx) => (
                                                    <td key={valIdx} style={{ padding: '10px', border: '1px solid #eeeeee' }}>{val}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {feedback && feedback.type === 'success' && currentChallengeIdx < desafios.length - 1 && (
                        <button className="btn-secondary pop-in" onClick={proximoDesafio} style={{ alignSelf: 'flex-end', fontSize: '1.2rem', padding: '15px 30px' }}>
                            Próximo Desafio ➡️
                        </button>
                    )}
                </div>
            </div>

            {/* Modal para Preview de Tabelas */}
            {modalTable && (
                <div className="pop-in" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)',
                        width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '1.5rem' }}>Tabela Original: <code style={{ backgroundColor: '#eee', padding: '4px 8px', borderRadius: '4px' }}>{modalTable.name}</code></h3>
                            <button onClick={() => setModalTable(null)} style={{
                                background: 'var(--border)', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text)',
                                width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontWeight: 'bold'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#ccc'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--border)'}
                            >✖</button>
                        </div>
                        
                        <div style={{ overflowX: 'auto', overflowY: 'auto', flexGrow: 1, backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--primary-dark)', color: 'white' }}>
                                        {modalTable.data.columns.map((col, idx) => (
                                            <th key={idx} style={{ padding: '15px 12px', borderBottom: '2px solid var(--primary)' }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalTable.data.values.length === 0 ? (
                                        <tr>
                                            <td colSpan={modalTable.data.columns.length} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Tabela vazia.</td>
                                        </tr>
                                    ) : (
                                        modalTable.data.values.map((row, rowIdx) => (
                                            <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? '#fafafa' : 'white' }}>
                                                {row.map((val, valIdx) => (
                                                    <td key={valIdx} style={{ padding: '12px', border: '1px solid #eeeeee' }}>{val}</td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesafiosDoChef;
