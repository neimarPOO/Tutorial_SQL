import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useAppContext } from '../store/AppContext';
import { execQuery } from '../db/initDb';
import SqlEditor from '../components/SqlEditor';

const MeuRestaurante = () => {
    const { db, addXp } = useAppContext();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [uploadedTables, setUploadedTables] = useState([]);
    const fileInputRef = useRef(null);

    const handleExecute = () => {
        if (!query.trim()) return;

        const queryResult = execQuery(db, query);

        if (queryResult.error) {
            setFeedback({ type: 'error', message: `Erro na sintaxe: ${queryResult.error}` });
            setResult(null);
        } else {
            setFeedback({ type: 'success', message: queryResult.message || "Query executada com sucesso!" });
            setResult(queryResult);
            addXp(5); // Small reward for exploring

            // Update history
            setHistory(prev => {
                const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 5);
                return newHistory;
            });
        }

        // Auto-hide feedback after 3s
        setTimeout(() => setFeedback(null), 3000);
    };

    const loadHistoryQuery = (q) => {
        setQuery(q);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name;
        const tableName = fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'tabela_nova';

        const processData = (dataArray) => {
            if (!dataArray || dataArray.length === 0) {
                alert('Arquivo vazio ou formato inválido.');
                return;
            }

            // Extract columns and sanitize names with de-duplication
            const rawHeaders = Object.keys(dataArray[0]);
            const seen = new Set();
            const columnMapping = rawHeaders.map(original => {
                let base = original.replace(/[^a-zA-Z0-9_]/g, '') || 'coluna';
                let sanitized = base;
                let counter = 1;
                while (seen.has(sanitized)) {
                    sanitized = `${base}_${counter++}`;
                }
                seen.add(sanitized);
                return { original, sanitized };
            });

            if (columnMapping.length === 0) return;

            try {
                // Drop if exists to replace
                db.run(`DROP TABLE IF EXISTS "${tableName}"`);

                // Create table
                const createCols = columnMapping.map(c => `"${c.sanitized}" TEXT`).join(', ');
                db.run(`CREATE TABLE "${tableName}" (id INTEGER PRIMARY KEY AUTOINCREMENT, ${createCols})`);

                // Insert data
                let inserted = 0;
                dataArray.forEach(row => {
                    const values = columnMapping.map(c => {
                        const val = row[c.original];
                        if (val === null || val === undefined || val === '') return 'NULL';
                        return `'${String(val).replace(/'/g, "''")}'`;
                    }).join(', ');
                    
                    try {
                        const quotedColumns = columnMapping.map(c => `"${c.sanitized}"`).join(', ');
                        db.run(`INSERT INTO "${tableName}" (${quotedColumns}) VALUES (${values})`);
                        inserted++;
                    } catch (err) {
                        console.error("Erro ao inserir linha", err);
                    }
                });

                setUploadedTables(prev => [...new Set([...prev, tableName])]);

                const initialQuery = `SELECT * FROM "${tableName}" LIMIT 10;`;
                setQuery(initialQuery);
                setFeedback({ type: 'success', message: `Tabela '${tableName}' criada com sucesso com ${inserted} linhas!` });
                setTimeout(() => setFeedback(null), 5000);

            } catch (error) {
                console.error(error);
                alert('Erro ao importar arquivo para o banco de dados: ' + error.message);
            }
        };

        if (fileName.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => processData(results.data),
                error: (error) => alert('Erro ao ler CSV: ' + error.message)
            });
        } else if (fileName.match(/\.(xlsx|xls)$/i)) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target.result;
                    const workbook = XLSX.read(bstr, { type: 'binary' });
                    // Pega a primeira aba
                    const wsname = workbook.SheetNames[0];
                    const ws = workbook.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);
                    processData(data);
                } catch (error) {
                    alert('Erro ao processar arquivo Excel: ' + error.message);
                }
            };
            reader.onerror = () => alert('Erro na leitura do arquivo.');
            reader.readAsBinaryString(file);
        } else {
            alert("Formato não suportado. Envie um arquivo .CSV, .XLS ou .XLSX");
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="pop-in">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Meu Restaurante 📂</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
                    Importe seus próprios ingredientes (arquivos CSV ou Excel) e teste receitas livres!
                </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Upload Area */}
                    <div style={{
                        backgroundColor: 'var(--surface)',
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-md)',
                        border: '2px dashed var(--primary)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#fff3e0'; }}
                        onDragLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface)'; }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.backgroundColor = 'var(--surface)';
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                fileInputRef.current.files = e.dataTransfer.files;
                                handleFileUpload({ target: fileInputRef.current });
                            }
                        }}
                    >
                        <span style={{ fontSize: '3rem' }}>📥</span>
                        <h3 style={{ margin: '10px 0', color: 'var(--primary-dark)' }}>Clique ou Arraste um arquivo (.CSV ou .XLSX)</h3>
                        <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>A primeira linha do arquivo será usada como nome das colunas.</p>
                        <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                    </div>

                    {uploadedTables.length > 0 && (
                        <div className="pop-in" style={{
                            backgroundColor: '#e8f5e9',
                            padding: '15px',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid #4caf50'
                        }}>
                            <h4 style={{ margin: '0 0 5px 0', color: '#2e7d32' }}>Tabelas Importadas:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#1b5e20' }}>
                                {uploadedTables.map(t => <li key={t}><code>{t}</code></li>)}
                            </ul>
                        </div>
                    )}

                    {/* Editor Area */}
                    <div style={{
                        backgroundColor: 'var(--surface)',
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-md)',
                        border: '2px solid var(--border)'
                    }}>
                        <h2 style={{ color: 'var(--primary-dark)', marginTop: 0 }}>Cozinha Livre (SQL)</h2>
                        <SqlEditor value={query} onChange={setQuery} onExecute={handleExecute} />

                        {history.length > 0 && (
                            <div style={{ marginTop: '15px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-light)' }}>Últimas Receitas:</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {history.map((h, i) => (
                                        <div
                                            key={i}
                                            onClick={() => loadHistoryQuery(h)}
                                            style={{
                                                backgroundColor: '#f5f5f5', padding: '8px 12px', borderRadius: '4px',
                                                fontFamily: 'monospace', fontSize: '0.85rem', cursor: 'pointer',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                border: '1px solid #e0e0e0'
                                            }}
                                            title="Clique para carregar"
                                        >
                                            {h}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {feedback && (
                        <div className="pop-in" style={{
                            backgroundColor: feedback.type === 'success' ? '#e8f5e9' : '#ffebee',
                            color: feedback.type === 'success' ? '#2e7d32' : '#c62828',
                            padding: '15px',
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${feedback.type === 'success' ? '#4caf50' : '#ef5350'}`,
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
                            maxHeight: '600px',
                            overflowY: 'auto'
                        }}>
                            <h3 style={{ marginTop: 0 }}>Resultado 🍽️</h3>
                            {result.values.length === 0 ? (
                                <p>Nenhum dado retornado pela consulta.</p>
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

                    {(!result && !feedback && uploadedTables.length === 0) && (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            height: '100%', color: 'var(--text-light)', border: '2px dashed #e0e0e0', borderRadius: 'var(--radius-lg)', padding: '40px',
                            textAlign: 'center'
                        }}>
                            <span style={{ fontSize: '4rem', opacity: 0.5 }}>🤷‍♂️</span>
                            <h3>Nenhum resultado ainda</h3>
                            <p>Envie uma planilha ou digite uma query ao lado para testar as tabelas existentes (cardapio, clientes, pedidos, ingredientes, chefs).</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeuRestaurante;
