import React, { useState } from 'react';
import Header from './components/Header';
import EscolaDoChef from './pages/EscolaDoChef';
import DesafiosDoChef from './pages/DesafiosDoChef';
import MeuRestaurante from './pages/MeuRestaurante';
import MeuJaleco from './pages/MeuJaleco';
import { useAppContext } from './store/AppContext';

function App() {
  const [activeTab, setActiveTab] = useState('escola');
  const { db } = useAppContext();

  if (!db) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <h1 className="bounce" style={{ fontSize: '3rem' }}>🍳</h1>
        <h2>Esquentando as panelas...</h2>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {activeTab === 'escola' && <EscolaDoChef />}
        {activeTab === 'desafios' && <DesafiosDoChef />}
        {activeTab === 'restaurante' && <MeuRestaurante />}
        {activeTab === 'jaleco' && <MeuJaleco />}
      </main>
    </div>
  );
}

export default App;
