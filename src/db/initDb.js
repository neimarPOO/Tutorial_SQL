export const initDb = async () => {
  if (!window.initSqlJs) {
    throw new Error("sql.js was not loaded properly.");
  }

  const SQL = await window.initSqlJs({
    // We can point to the wasm file via CDN to ensure it matches the 1.10.2 version
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
  });

  const db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE cardapio (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      preco REAL NOT NULL,
      ingredientes TEXT
    );

    CREATE TABLE clientes (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      fidelidade TEXT
    );

    CREATE TABLE pedidos (
      id INTEGER PRIMARY KEY,
      cliente_id INTEGER,
      data_pedido TEXT,
      total REAL,
      FOREIGN KEY(cliente_id) REFERENCES clientes(id)
    );

    CREATE TABLE ingredientes (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      calorias INTEGER
    );

    CREATE TABLE chefs (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      especialidade TEXT
    );
  `);

  // Insert initial data
  db.run(`
    INSERT INTO cardapio (nome, categoria, preco, ingredientes) VALUES
      ('Pizza Margherita', 'pizza', 45.00, 'Queijo, Tomate, Manjericão'),
      ('Pizza Calabresa', 'pizza', 48.00, 'Queijo, Calabresa, Cebola'),
      ('Hambúrguer Clássico', 'lanche', 25.00, 'Pão, Carne, Queijo, Alface'),
      ('Sushi Salmão', 'japonesa', 35.00, 'Arroz, Salmão, Alga'),
      ('Bolo de Chocolate', 'sobremesa', 15.00, 'Chocolate, Farinha, Açúcar'),
      ('Salada Caesar', 'saudavel', 22.00, 'Alface, Frango, Parmesão, Croutons');

    INSERT INTO clientes (nome, fidelidade) VALUES
      ('Joãozinho', 'ouro'),
      ('Mariazinha', 'prata'),
      ('Pedrinho', 'bronze');

    INSERT INTO pedidos (cliente_id, data_pedido, total) VALUES
      (1, '2023-10-01', 45.00),
      (2, '2023-10-01', 48.00),
      (3, '2023-10-02', 25.00);

    INSERT INTO ingredientes (nome, calorias) VALUES
      ('Queijo', 113),
      ('Tomate', 18),
      ('Calabresa', 295),
      ('Carne', 250);

    INSERT INTO chefs (nome, especialidade) VALUES
      ('Chef Tomate 🍅', 'Massas e Pizzas'),
      ('Chef Bacon 🥓', 'Carnes e Lanches'),
      ('Chef Sushi 🍣', 'Comida Oriental');
  `);

  return db;
};

// Helper function to execute queries and format results
export const execQuery = (db, query) => {
  try {
    const result = db.exec(query);
    if (result && result.length > 0) {
      return { columns: result[0].columns, values: result[0].values, error: null };
    }
    return { columns: [], values: [], error: null, message: "Comando executado com sucesso! Nenhuma linha retornada." };
  } catch (err) {
    return { columns: [], values: [], error: err.message };
  }
};
