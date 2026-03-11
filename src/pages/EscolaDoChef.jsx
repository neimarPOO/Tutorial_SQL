import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';

const ConceptCard = ({ index, concept, icon, analogy, query, description }) => {
    const [understood, setUnderstood] = useState(false);
    const { addXp } = useAppContext();

    const handleUnderstand = () => {
        if (!understood) {
            setUnderstood(true);
            addXp(10); // Reward for learning
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-md)',
            border: '2px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                    fontSize: '2.5rem',
                    backgroundColor: 'var(--background)',
                    width: '70px',
                    height: '70px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '50%',
                    border: '2px dashed var(--primary)'
                }}>
                    {icon}
                </div>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '1.8rem' }}>{concept}</h2>
                    <p style={{ margin: 0, color: 'var(--text-light)', fontWeight: 'bold' }}>{description}</p>
                </div>
            </div>

            <div style={{
                backgroundColor: '#fff3e0',
                padding: '15px',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--primary)'
            }}>
                <div style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}><strong>👨‍🍳 Dica do Chef:</strong><br />{analogy}</div>
            </div>

            {query && (
                <div className="sql-editor" style={{
                    backgroundColor: '#263238',
                    color: '#eceff1',
                    padding: '15px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1.1rem'
                }}>
                    <code>{query}</code>
                </div>
            )}

            <button
                onClick={handleUnderstand}
                className={understood ? "btn-secondary pop-in" : "btn-primary"}
                style={{
                    alignSelf: 'flex-start',
                    marginTop: '10px',
                    opacity: understood ? 0.8 : 1,
                    cursor: understood ? 'default' : 'pointer'
                }}
                disabled={understood}
            >
                {understood ? "Entendido! (+10 XP) ✨" : "Entendi! 👨‍🍳"}
            </button>
        </div>
    );
};

const EscolaDoChef = () => {
    const concepts = [
        {
            concept: "SQL (A Linguagem do Chef)",
            icon: "🗣️",
            description: "A língua oficial falada na nossa cozinha de dados.",
            analogy: "SQL significa 'Structured Query Language'. É como você faz os pedidos para o Banco de Dados. Em vez de falar português, você usa SQL para dizer: 'Chef, me traga todas as pizzas cadastradas!' de um jeito que ele entenda perfeitamente.",
            query: ""
        },
        {
            concept: "Banco de Dados",
            icon: "🏪",
            description: "Onde tudo fica guardado.",
            analogy: "É como o seu restaurante inteiro: guarda tudo organizado, desde os ingredientes até o cardápio e os clientes!",
            query: ""
        },
        {
            concept: "Tabela",
            icon: "📋",
            description: "Coleções de informações similares.",
            analogy: "É o cardápio! Cada tabela tem um tema (pizzas, clientes, pedidos...). Você não mistura a receita do bolo com a da lasanha, né?",
            query: ""
        },
        {
            concept: "Linha (Registro)",
            icon: "🍕",
            description: "A informação completa detalhada.",
            analogy: "É um prato específico no cardápio, como a 'Pizza Margherita'. Ela ocupa uma linha inteira e tem tudo sobre ela.",
            query: ""
        },
        {
            concept: "Coluna (Campo)",
            icon: "🏷️",
            description: "Classificações para os dados.",
            analogy: "São as características do prato: nome, preço, ingredientes. Todas as pizzas têm um preço, certo?",
            query: ""
        },
        {
            concept: "SELECT",
            icon: "👀",
            description: "Comando para buscar dados.",
            analogy: "É como quando você olha o cardápio e escolhe o que quer ver.",
            query: "SELECT nome, preco FROM cardapio;"
        },
        {
            concept: "WHERE",
            icon: "🔍",
            description: "Comando para filtrar o que você quer ver.",
            analogy: "É o garçom filtrando os pratos: 'Chef, me mostra só as pizzas que NÃO têm cebola, por favor!'",
            query: "SELECT * FROM cardapio WHERE categoria = 'pizza';"
        },
        {
            concept: "ORDER BY",
            icon: "↕️",
            description: "Comando para ordenar os resultados.",
            analogy: "Imagine que os clientes querem ler o cardápio do prato mais barato ao mais caro.\n\nPasso a passo:\n1️⃣ Primeiro o Chef pega a lista de pratos.\n2️⃣ Depois, ele olha a coluna 'preco'.\n3️⃣ Por fim, ele reorganiza tudo para subir os mais baratos primeiro (ASC) ou os mais caros primeiro (DESC).",
            query: "SELECT * FROM cardapio ORDER BY preco DESC;"
        },
        {
            concept: "JOIN",
            icon: "🤝",
            description: "Comando para juntar tabelas diferentes usando uma conexão entre elas.",
            analogy: "Serve para combinar o cardápio com os pedidos! Assim não entregamos a comida para a mesa errada.\n\nPasso a passo:\n1️⃣ Pegamos a Tabela A (clientes) e a Tabela B (pedidos).\n2️⃣ Encontramos o que liga as duas (ex: o ID do cliente está anotado dentro da tabela do pedido).\n3️⃣ O Chef junta tudo numa mesa só. Agora você vê na mesma linha que o 'Joãozinho' pediu a 'Pizza Margherita'!",
            query: "SELECT c.nome, p.total FROM clientes c JOIN pedidos p ON c.id = p.cliente_id;"
        },
        {
            concept: "INSERT",
            icon: "➕",
            description: "Comando para adicionar novos dados na tabela.",
            analogy: "Como adicionar uma nova receita oficial ao cardápio do restaurante.\n\nPasso a passo:\n1️⃣ Diga em qual tabela vai inserir (`INSERT INTO cardapio`).\n2️⃣ Diga quais colunas você vai preencher (`(nome, preco)`).\n3️⃣ Entregue os valores certinhos, na mesma ordem (`VALUES ('Bolo', 25.0)`). E pronto, prato lançado!",
            query: "INSERT INTO cardapio (nome, preco) VALUES ('Bolo de Rolo', 25.0);"
        },
        {
            concept: "UPDATE",
            icon: "✏️",
            description: "Comando para mudar os dados de uma linha que já existe.",
            analogy: "A inflação pegou! É hora de atualizar o preço daquele prato no cardápio.\n\nPasso a passo:\n1️⃣ Escolha a tabela que vai mudar (`UPDATE cardapio`).\n2️⃣ Diga o que vai mudar (`SET preco = 50.0`).\n3️⃣ CRÍTICO: Use o `WHERE` para dizer QUAL prato vai mudar (`WHERE nome = 'Pizza Calabresa'`). \n⚠️ Se você esquecer o WHERE, todos os pratos do restaurante vão custar 50!",
            query: "UPDATE cardapio SET preco = 50.0 WHERE nome = 'Pizza Calabresa';"
        },
        {
            concept: "DELETE",
            icon: "🗑️",
            description: "Comando para apagar dados para sempre.",
            analogy: "Tirar um prato do cardápio pra sempre (depois que foi pro lixo, não tem como desfazer!).\n\nPasso a passo:\n1️⃣ Diga a tabela (`DELETE FROM cardapio`).\n2️⃣ CRÍTICO: Diga QUAL prato apagar (`WHERE nome = 'Pizza de Abacaxi'`).\n3️⃣ Cuidado! Se você esquecer o `WHERE`, você joga o cardápio INTEIRO no lixo! Nunca faça isso na cozinha dos outros!",
            query: "DELETE FROM cardapio WHERE nome = 'Pizza de Abacaxi';"
        }
    ];

    return (
        <div className="pop-in">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Escola do Chef 📚</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto' }}>
                    Bem-vindo à cozinha teórica! Aqui você aprende a receita do sucesso para mexer nos dados como um verdadeiro Mestre Cuca do código!
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {concepts.map((item, id) => (
                    <ConceptCard key={id} index={id} {...item} />
                ))}
            </div>
        </div>
    );
};

export default EscolaDoChef;
