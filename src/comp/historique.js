import { useEffect, useState } from 'react';
import axios from 'axios';

function Historique() {
  const [articles, setArticles] = useState([]);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/articles-valides')
      .then(res => setArticles(res.data))
      .catch(() => setErreur("Erreur chargement historique."));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📜 Historique des articles validés</h2>
      {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
      {articles.length === 0 ? (
        <p>Aucun article.</p>
      ) : (
        <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              <th>Des1</th><th>Des2</th><th>Des3</th>
              <th>Unité</th>
              <th>Taxe1</th><th>Taxe2</th><th>Taxe3</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id}>
                <td>{a.des1}</td>
                <td>{a.des2}</td>
                <td>{a.des3}</td>
                <td>{a.uniteLabel || 'N/A'}</td>
                <td>{a.taxe1Label || 'N/A'}</td>
                <td>{a.taxe2Label || 'N/A'}</td>
                <td>{a.taxe3Label || 'N/A'}</td>
                <td>{a.date ? new Date(a.date).toLocaleString('fr-TN', {
                  timeZone: 'Africa/Tunis',
                  dateStyle: 'short',
                  timeStyle: 'short'
                }) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Historique;
