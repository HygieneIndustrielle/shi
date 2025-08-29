import { useState, useEffect } from 'react';
import axios from 'axios';

function Admin() {
  const baseURL = 'https://shi-backend-ez28.onrender.com';

  // Listes existantes
  const [unites, setUnites] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [types, setTypes] = useState([]);
  const [nature, setNature] = useState([]);
  const [activite, setActivite] = useState([]);
  const [famille, setFamille] = useState([]);
  const [danger, setDanger] = useState([]);
  const [sousfamille, setSousfamille] = useState([]);

  // Nouvelles listes
  const [conditionnements, setConditionnements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [chefsProduit, setChefsProduit] = useState([]);
  const [dasList, setDasList] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [unitesAchat, setUnitesAchat] = useState([]);
  const [unitesVente, setUnitesVente] = useState([]);
  const [codesComptables, setCodesComptables] = useState([]);

  // Inputs existants
  const [nouvelleUnite, setNouvelleUnite] = useState('');
  const [nouvelleTaxe, setNouvelleTaxe] = useState('');
  const [nouvelleMarque, setNouvelleMarque] = useState('');
  const [nouvelleType, setNouvelleType] = useState('');
  const [nouvelleNature, setNouvelleNature] = useState('');
  const [nouvelleActivite, setNouvelleActivite] = useState('');
  const [nouvelleFamille, setNouvelleFamille] = useState('');
  const [nouvelleDanger, setNouvelleDanger] = useState('');
  const [nouvelleSousfamille, setNouvelleSousfamille] = useState('');

  // Inputs nouveaux référentiels (nom)
  const [nouveauConditionnement, setNouveauConditionnement] = useState('');
  const [nouvelleApplication, setNouvelleApplication] = useState('');
  const [nouvelleClassification, setNouvelleClassification] = useState('');
  const [nouveauChefProduit, setNouveauChefProduit] = useState('');
  const [nouveauDAS, setNouveauDAS] = useState('');
  const [nouveauDepartement, setNouveauDepartement] = useState('');

  // Inputs unités achat/vente (label)
  const [nouvelleUniteAchat, setNouvelleUniteAchat] = useState('');
  const [nouvelleUniteVente, setNouvelleUniteVente] = useState('');

  // Inputs code comptable (code + nom optionnel)
  const [nouveauCodeComptable, setNouveauCodeComptable] = useState('');
  const [nouveauCodeComptableNom, setNouveauCodeComptableNom] = useState('');

  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    const endpoints = [
      ['unites', axios.get(`${baseURL}/unites-stock`)],
      ['taxes', axios.get(`${baseURL}/taxes`)],
      ['marques', axios.get(`${baseURL}/marque`)],
      ['types', axios.get(`${baseURL}/type`)],
      ['nature', axios.get(`${baseURL}/nature`)],
      ['activite', axios.get(`${baseURL}/activite`)],
      ['famille', axios.get(`${baseURL}/famille`)],
      ['danger', axios.get(`${baseURL}/danger`)],
      ['sousfamille', axios.get(`${baseURL}/sousfamille`)],

      // nouveaux
      ['conditionnement', axios.get(`${baseURL}/conditionnement`)],
      ['application', axios.get(`${baseURL}/application`)],
      ['classification', axios.get(`${baseURL}/classification-article`)],
      ['chef_produit', axios.get(`${baseURL}/chef-produit`)],
      ['das', axios.get(`${baseURL}/das`)],
      ['departement', axios.get(`${baseURL}/departement`)],
      ['unite_achat', axios.get(`${baseURL}/unite-achat`)],
      ['unite_vente', axios.get(`${baseURL}/unite-vente`)],
      ['code_comptable', axios.get(`${baseURL}/code-comptable`)],
    ];

    const results = await Promise.allSettled(endpoints.map(([, p]) => p));

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        const name = endpoints[i][0];
        const status = r.reason?.response?.status;
        const url = r.reason?.config?.url;
        console.error(`❌ Endpoint KO: ${name} (${status}) -> ${url}`, r.reason?.message);
      }
    });

    const get = (idx) => (results[idx].status === 'fulfilled' ? results[idx].value.data : []);

    setUnites(get(0));
    setTaxes(get(1));
    setMarques(get(2));
    setTypes(get(3));
    setNature(get(4));
    setActivite(get(5));
    setFamille(get(6));
    setDanger(get(7));
    setSousfamille(get(8));

    setConditionnements(get(9));
    setApplications(get(10));
    setClassifications(get(11));
    setChefsProduit(get(12));
    setDasList(get(13));
    setDepartements(get(14));
    setUnitesAchat(get(15));
    setUnitesVente(get(16));
    setCodesComptables(get(17));

    if (results.some((r) => r.status === 'rejected')) {
      setErreur('❌ Erreur chargement des données (voir console).');
    } else {
      setErreur('');
    }
  };

  const afficherMessage = (txt) => {
    setMessage(txt);
    setErreur('');
    setTimeout(() => setMessage(''), 3000);
  };

  const afficherErreur = (txt) => {
    setErreur(txt);
    setMessage('');
    setTimeout(() => setErreur(''), 3000);
  };

  // ─────────── Unités de stock (label) ───────────
  const ajouterUnite = async () => {
    const label = nouvelleUnite.trim();
    if (!label) return;
    try {
      await axios.post(`${baseURL}/unites-stock`, { label });
      setNouvelleUnite('');
      afficherMessage('✅ Unité ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout unité.');
    }
  };
  const supprimerUnite = async (id) => {
    try {
      await axios.delete(`${baseURL}/unites-stock/${id}`);
      afficherMessage('✅ Unité supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Impossible de supprimer : unité utilisée dans un article.');
      else afficherErreur('❌ Erreur suppression unité.');
    }
  };

    // ─────────── Taxes (taux) ───────────
  const ajouterTaxe = async () => {
    const taux = nouvelleTaxe.trim();
    if (!taux) return;
    try {
      await axios.post(`${baseURL}/taxes`, { taux });
      setNouvelleTaxe('');
      afficherMessage('✅ Taxe ajoutée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 409) {
        afficherErreur('❌ Cette taxe existe déjà.');
      } else {
        afficherErreur('❌ Erreur ajout taxe.');
      }
    }
  };

  const supprimerTaxe = async (id) => {
    try {
      await axios.delete(`${baseURL}/taxes/${id}`);
      afficherMessage('✅ Taxe supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) {
        afficherErreur('❌ Impossible de supprimer : taxe utilisée dans un article.');
      } else {
        afficherErreur('❌ Erreur suppression taxe.');
      }
    }
  };





  // ─────────── Nature (nom) ───────────
  const ajouterNature = async () => {
    const nom = nouvelleNature.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/nature`, { nom });
      setNouvelleNature('');
      afficherMessage('✅ Nature ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout nature.');
    }
  };
  const supprimerNature = async (id) => {
    try {
      await axios.delete(`${baseURL}/nature/${id}`);
      afficherMessage('✅ Nature supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Impossible de supprimer : nature utilisée dans un article.');
      else afficherErreur('❌ Erreur suppression nature.');
    }
  };

  // ─────────── Activité (nom) ───────────
  const ajouterActivite = async () => {
    const nom = nouvelleActivite.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/activite`, { nom });
      setNouvelleActivite('');
      afficherMessage('✅ Activité ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout activité.');
    }
  };
  const supprimerActivite = async (id) => {
    try {
      await axios.delete(`${baseURL}/activite/${id}`);
      afficherMessage('✅ Activité supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Impossible de supprimer : activité utilisée dans un article.');
      else afficherErreur('❌ Erreur suppression activité.');
    }
  };

  // ─────────── Marques (nom) ───────────
  const ajouterMarque = async () => {
    const nom = nouvelleMarque.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/marque`, { nom });
      setNouvelleMarque('');
      afficherMessage('✅ Marque ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout marque.');
    }
  };
  const supprimerMarque = async (id) => {
    try {
      await axios.delete(`${baseURL}/marque/${id}`);
      afficherMessage('✅ Marque supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Impossible de supprimer : marque utilisée dans un article.');
      else afficherErreur('❌ Erreur suppression marque.');
    }
  };

  // ─────────── Type (nom) ───────────
  const ajouterType = async () => {
    const nom = nouvelleType.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/type`, { nom });
      setNouvelleType('');
      afficherMessage('✅ Type ajouté.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout type.');
    }
  };
  const supprimerType = async (id) => {
    try {
      await axios.delete(`${baseURL}/type/${id}`);
      afficherMessage('✅ Type supprimé.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Impossible de supprimer : type utilisé dans un article.');
      else afficherErreur('❌ Erreur suppression type.');
    }
  };

  // ─────────── Famille (nom) ───────────
  const ajouterFamille = async () => {
    const nom = nouvelleFamille.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/famille`, { nom });
      setNouvelleFamille('');
      afficherMessage('✅ Famille ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout famille.');
    }
  };
  const supprimerFamille = async (id) => {
    try {
      await axios.delete(`${baseURL}/famille/${id}`);
      afficherMessage('✅ Famille supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Impossible de supprimer : famille utilisée dans un article.');
      else afficherErreur('❌ Erreur suppression famille.');
    }
  };

  // ─────────── Danger (nom) ───────────
  const ajouterDanger = async () => {
    const nom = nouvelleDanger.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/danger`, { nom });
      setNouvelleDanger('');
      afficherMessage('✅ Danger ajouté.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout danger.');
    }
  };
  const supprimerDanger = async (id) => {
    try {
      await axios.delete(`${baseURL}/danger/${id}`);
      afficherMessage('✅ Danger supprimé.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Impossible de supprimer : danger utilisé dans un article.');
      else afficherErreur('❌ Erreur suppression danger.');
    }
  };

  // ─────────── Sous-famille (nom) ───────────
  const ajouterSousfamille = async () => {
    const nom = nouvelleSousfamille.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/sousfamille`, { nom });
      setNouvelleSousfamille('');
      afficherMessage('✅ Sous-famille ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout sous-famille.');
    }
  };
  const supprimerSousfamille = async (id) => {
    try {
      await axios.delete(`${baseURL}/sousfamille/${id}`);
      afficherMessage('✅ Sous-famille supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Impossible de supprimer : sous-famille utilisée dans un article.');
      else afficherErreur('❌ Erreur suppression sous-famille.');
    }
  };

  // ======== NOUVELLES TABLES ========

  // Conditionnement (nom)
  const ajouterConditionnement = async () => {
    const nom = nouveauConditionnement.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/conditionnement`, { nom });
      setNouveauConditionnement('');
      afficherMessage('✅ Conditionnement ajouté.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout conditionnement.');
    }
  };
  const supprimerConditionnement = async (id) => {
    try {
      await axios.delete(`${baseURL}/conditionnement/${id}`);
      afficherMessage('✅ Conditionnement supprimé.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Conditionnement utilisé.');
      else afficherErreur('❌ Erreur suppression conditionnement.');
    }
  };

  // Application (nom)
  const ajouterApplication = async () => {
    const nom = nouvelleApplication.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/application`, { nom });
      setNouvelleApplication('');
      afficherMessage('✅ Application ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout application.');
    }
  };
  const supprimerApplication = async (id) => {
    try {
      await axios.delete(`${baseURL}/application/${id}`);
      afficherMessage('✅ Application supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Application utilisée.');
      else afficherErreur('❌ Erreur suppression application.');
    }
  };

  // Classification article (nom)
  const ajouterClassification = async () => {
    const nom = nouvelleClassification.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/classification-article`, { nom });
      setNouvelleClassification('');
      afficherMessage('✅ Classification ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout classification.');
    }
  };
  const supprimerClassification = async (id) => {
    try {
      await axios.delete(`${baseURL}/classification-article/${id}`);
      afficherMessage('✅ Classification supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Classification utilisée.');
      else afficherErreur('❌ Erreur suppression classification.');
    }
  };

  // Chef produit (nom)
  const ajouterChefProduit = async () => {
    const nom = nouveauChefProduit.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/chef-produit`, { nom });
      setNouveauChefProduit('');
      afficherMessage('✅ Chef produit ajouté.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout chef produit.');
    }
  };
  const supprimerChefProduit = async (id) => {
    try {
      await axios.delete(`${baseURL}/chef-produit/${id}`);
      afficherMessage('✅ Chef produit supprimé.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Chef produit utilisé.');
      else afficherErreur('❌ Erreur suppression chef produit.');
    }
  };

  // DAS (nom)
  const ajouterDAS = async () => {
    const nom = nouveauDAS.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/das`, { nom });
      setNouveauDAS('');
      afficherMessage('✅ DAS ajouté.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout DAS.');
    }
  };
  const supprimerDAS = async (id) => {
    try {
      await axios.delete(`${baseURL}/das/${id}`);
      afficherMessage('✅ DAS supprimé.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ DAS utilisé.');
      else afficherErreur('❌ Erreur suppression DAS.');
    }
  };

  // Département (nom)
  const ajouterDepartement = async () => {
    const nom = nouveauDepartement.trim();
    if (!nom) return;
    try {
      await axios.post(`${baseURL}/departement`, { nom });
      setNouveauDepartement('');
      afficherMessage('✅ Département ajouté.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout département.');
    }
  };
  const supprimerDepartement = async (id) => {
    try {
      await axios.delete(`${baseURL}/departement/${id}`);
      afficherMessage('✅ Département supprimé.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Département utilisé.');
      else afficherErreur('❌ Erreur suppression département.');
    }
  };

  // Unité d'achat (label)
  const ajouterUniteAchat = async () => {
    const label = nouvelleUniteAchat.trim();
    if (!label) return;
    try {
      await axios.post(`${baseURL}/unite-achat`, { label });
      setNouvelleUniteAchat('');
      afficherMessage('✅ Unité d\'achat ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout unité d\'achat.');
    }
  };
  const supprimerUniteAchat = async (id) => {
    try {
      await axios.delete(`${baseURL}/unite-achat/${id}`);
      afficherMessage('✅ Unité d\'achat supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Unité d\'achat utilisée.');
      else afficherErreur('❌ Erreur suppression unité d\'achat.');
    }
  };

  // Unité de vente (label)
  const ajouterUniteVente = async () => {
    const label = nouvelleUniteVente.trim();
    if (!label) return;
    try {
      await axios.post(`${baseURL}/unite-vente`, { label });
      setNouvelleUniteVente('');
      afficherMessage('✅ Unité de vente ajoutée.');
      chargerDonnees();
    } catch {
      afficherErreur('❌ Erreur ajout unité de vente.');
    }
  };
  const supprimerUniteVente = async (id) => {
    try {
      await axios.delete(`${baseURL}/unite-vente/${id}`);
      afficherMessage('✅ Unité de vente supprimée.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Unité de vente utilisée.');
      else afficherErreur('❌ Erreur suppression unité de vente.');
    }
  };

  // Code comptable (code + nom optionnel)
  const ajouterCodeComptable = async () => {
    const code = nouveauCodeComptable.trim();
    const nom  = nouveauCodeComptableNom.trim();
    if (!code) return;
    try {
      await axios.post(`${baseURL}/code-comptable`, { code, nom });
      setNouveauCodeComptable('');
      setNouveauCodeComptableNom('');
      afficherMessage('✅ Code comptable ajouté.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 409) afficherErreur('❌ Ce code comptable existe déjà.');
      else afficherErreur('❌ Erreur ajout code comptable.');
    }
  };
  const supprimerCodeComptable = async (id) => {
    try {
      await axios.delete(`${baseURL}/code-comptable/${id}`);
      afficherMessage('✅ Code comptable supprimé.');
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 400) afficherErreur('❌ Code comptable utilisé.');
      else afficherErreur('❌ Erreur suppression code comptable.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Page Admin – Gérer les unités, taxes, marques et référentiels</h2>

      {message && <div style={{ color: 'green', marginBottom: 10 }}>{message}</div>}
      {erreur && <div style={{ color: 'red', marginBottom: 10 }}>{erreur}</div>}

      {/* Unités de stock */}
      <section>
        <label className='ide'>Unités:</label>
        <h3>Ajouter une unité de stock</h3>
        <input
          type="text"
          value={nouvelleUnite}
          onChange={(e) => setNouvelleUnite(e.target.value)}
          placeholder="Ex. pièce, kg, boîte"
        />
        <button onClick={ajouterUnite} disabled={!nouvelleUnite.trim()}>Ajouter</button>
        <ul>
          {unites.map((u) => (
            <li key={u.id}>
              {u.label}{' '}
              <button onClick={() => supprimerUnite(u.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />
      {/* Unité d'achat */}
      <section>
        <h3>Ajouter une unité d'achat</h3>
        <input
          type="text"
          value={nouvelleUniteAchat}
          onChange={(e) => setNouvelleUniteAchat(e.target.value)}
          placeholder="Ex. Pièce, Kg, Litre…"
        />
        <button onClick={ajouterUniteAchat} disabled={!nouvelleUniteAchat.trim()}>Ajouter</button>
        <ul>
          {unitesAchat.map((u) => (
            <li key={u.id}>
              {u.label}{' '}
              <button onClick={() => supprimerUniteAchat(u.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Unité de vente */}
      <section>
        <h3>Ajouter une unité de vente</h3>
        <input
          type="text"
          value={nouvelleUniteVente}
          onChange={(e) => setNouvelleUniteVente(e.target.value)}
          placeholder="Ex. Boîte, Carton, Palette…"
        />
        <button onClick={ajouterUniteVente} disabled={!nouvelleUniteVente.trim()}>Ajouter</button>
        <ul>
          {unitesVente.map((u) => (
            <li key={u.id}>
              {u.label}{' '}
              <button onClick={() => supprimerUniteVente(u.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />
<label className='ide'>Comptables:</label>
      {/* Code comptable */}
      <section>
        <h3>Ajouter un code comptable</h3>
        <input
          type="text"
          value={nouveauCodeComptable}
          onChange={(e) => setNouveauCodeComptable(e.target.value)}
          placeholder="Code (ex. 701, 607…)"
        />
        <input
          type="text"
          value={nouveauCodeComptableNom}
          onChange={(e) => setNouveauCodeComptableNom(e.target.value)}
          placeholder="Libellé (optionnel)"
          style={{ marginLeft: 8 }}
        />
        <button onClick={ajouterCodeComptable} disabled={!nouveauCodeComptable.trim()}>Ajouter</button>
        <ul>
          {codesComptables.map((cc) => (
            <li key={cc.id}>
              <strong>{cc.code}</strong>{cc.nom ? ` — ${cc.nom}` : ''}{' '}
              <button onClick={() => supprimerCodeComptable(cc.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />
      {/* Taxes */}
      <section>
        <h3>Ajouter une taxe</h3>
        <input
          type="number"
          step="0.01"
          value={nouvelleTaxe}
          onChange={(e) => setNouvelleTaxe(e.target.value)}
          placeholder="Ex. 7 ou 19"
        />
        <button onClick={ajouterTaxe} disabled={!nouvelleTaxe.trim()}>Ajouter</button>
        <ul>
          {taxes.map((t) => (
            <li key={t.id}>
              {t.taux} %{' '}
              <button onClick={() => supprimerTaxe(t.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />
<label className='ide'>Familles Statistique:</label>
      {/* Marques */}
      <section>
        <h3>Ajouter une marque</h3>
        <input
          type="text"
          value={nouvelleMarque}
          onChange={(e) => setNouvelleMarque(e.target.value)}
          placeholder="Entrer la marque"
        />
        <button onClick={ajouterMarque} disabled={!nouvelleMarque.trim()}>Ajouter</button>
        <ul>
          {marques.map((m) => (
            <li key={m.id}>
              {m.nom}{' '}
              <button onClick={() => supprimerMarque(m.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Type */}
      <section>
        <h3>Ajouter un type</h3>
        <input
          type="text"
          value={nouvelleType}
          onChange={(e) => setNouvelleType(e.target.value)}
          placeholder="Entrer le type"
        />
        <button onClick={ajouterType} disabled={!nouvelleType.trim()}>Ajouter</button>
        <ul>
          {types.map((t) => (
            <li key={t.id}>
              {t.nom}{' '}
              <button onClick={() => supprimerType(t.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Nature */}
      <section>
        <h3>Ajouter une nature</h3>
        <input
          type="text"
          value={nouvelleNature}
          onChange={(e) => setNouvelleNature(e.target.value)}
          placeholder="Entrer la nature"
        />
        <button onClick={ajouterNature} disabled={!nouvelleNature.trim()}>Ajouter</button>
        <ul>
          {nature.map((n) => (
            <li key={n.id}>
              {n.nom}{' '}
              <button onClick={() => supprimerNature(n.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Activité */}
      <section>
        <h3>Ajouter une activité</h3>
        <input
          type="text"
          value={nouvelleActivite}
          onChange={(e) => setNouvelleActivite(e.target.value)}
          placeholder="Entrer l'activité"
        />
        <button onClick={ajouterActivite} disabled={!nouvelleActivite.trim()}>Ajouter</button>
        <ul>
          {activite.map((a) => (
            <li key={a.id}>
              {a.nom}{' '}
              <button onClick={() => supprimerActivite(a.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Famille */}
      <section>
        <h3>Ajouter une famille</h3>
        <input
          type="text"
          value={nouvelleFamille}
          onChange={(e) => setNouvelleFamille(e.target.value)}
          placeholder="Entrer une famille"
        />
        <button onClick={ajouterFamille} disabled={!nouvelleFamille.trim()}>Ajouter</button>
        <ul>
          {famille.map((f) => (
            <li key={f.id}>
              {f.nom}{' '}
              <button onClick={() => supprimerFamille(f.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Danger */}
      <section>
        <h3>Ajouter un danger</h3>
        <input
          type="text"
          value={nouvelleDanger}
          onChange={(e) => setNouvelleDanger(e.target.value)}
          placeholder="Entrer un danger"
        />
        <button onClick={ajouterDanger} disabled={!nouvelleDanger.trim()}>Ajouter</button>
        <ul>
          {danger.map((d) => (
            <li key={d.id}>
              {d.nom}{' '}
              <button onClick={() => supprimerDanger(d.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Sous-famille */}
      <section>
        <h3>Ajouter une sous-famille</h3>
        <input
          type="text"
          value={nouvelleSousfamille}
          onChange={(e) => setNouvelleSousfamille(e.target.value)}
          placeholder="Entrer la sous-famille"
        />
        <button onClick={ajouterSousfamille} disabled={!nouvelleSousfamille.trim()}>Ajouter</button>
        <ul>
          {sousfamille.map((sf) => (
            <li key={sf.id}>
              {sf.nom}{' '}
              <button onClick={() => supprimerSousfamille(sf.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Conditionnement */}
      <section>
        <h3>Ajouter un conditionnement</h3>
        <input
          type="text"
          value={nouveauConditionnement}
          onChange={(e) => setNouveauConditionnement(e.target.value)}
          placeholder="Ex. Carton, Palette…"
        />
        <button onClick={ajouterConditionnement} disabled={!nouveauConditionnement.trim()}>Ajouter</button>
        <ul>
          {conditionnements.map((c) => (
            <li key={c.id}>
              {c.nom}{' '}
              <button onClick={() => supprimerConditionnement(c.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Application */}
      <section>
        <h3>Ajouter une application</h3>
        <input
          type="text"
          value={nouvelleApplication}
          onChange={(e) => setNouvelleApplication(e.target.value)}
          placeholder="Ex. Industrielle, Domestique…"
        />
        <button onClick={ajouterApplication} disabled={!nouvelleApplication.trim()}>Ajouter</button>
        <ul>
          {applications.map((a) => (
            <li key={a.id}>
              {a.nom}{' '}
              <button onClick={() => supprimerApplication(a.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Classification article */}
      <section>
        <h3>Ajouter une classification article</h3>
        <input
          type="text"
          value={nouvelleClassification}
          onChange={(e) => setNouvelleClassification(e.target.value)}
          placeholder="Ex. MP, PF, PI…"
        />
        <button onClick={ajouterClassification} disabled={!nouvelleClassification.trim()}>Ajouter</button>
        <ul>
          {classifications.map((c) => (
            <li key={c.id}>
              {c.nom}{' '}
              <button onClick={() => supprimerClassification(c.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Chef produit */}
      <section>
        <h3>Ajouter un chef produit</h3>
        <input
          type="text"
          value={nouveauChefProduit}
          onChange={(e) => setNouveauChefProduit(e.target.value)}
          placeholder="Nom du chef produit"
        />
        <button onClick={ajouterChefProduit} disabled={!nouveauChefProduit.trim()}>Ajouter</button>
        <ul>
          {chefsProduit.map((cp) => (
            <li key={cp.id}>
              {cp.nom}{' '}
              <button onClick={() => supprimerChefProduit(cp.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* DAS */}
      <section>
        <h3>Ajouter un DAS</h3>
        <input
          type="text"
          value={nouveauDAS}
          onChange={(e) => setNouveauDAS(e.target.value)}
          placeholder="Ex. DAS 1, DAS 2…"
        />
        <button onClick={ajouterDAS} disabled={!nouveauDAS.trim()}>Ajouter</button>
        <ul>
          {dasList.map((d) => (
            <li key={d.id}>
              {d.nom}{' '}
              <button onClick={() => supprimerDAS(d.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      {/* Département */}
      <section>
        <h3>Ajouter un département</h3>
        <input
          type="text"
          value={nouveauDepartement}
          onChange={(e) => setNouveauDepartement(e.target.value)}
          placeholder="Ex. Ventes, Production…"
        />
        <button onClick={ajouterDepartement} disabled={!nouveauDepartement.trim()}>Ajouter</button>
        <ul>
          {departements.map((dep) => (
            <li key={dep.id}>
              {dep.nom}{' '}
              <button onClick={() => supprimerDepartement(dep.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      


    </div>
  );
}

export default Admin;

