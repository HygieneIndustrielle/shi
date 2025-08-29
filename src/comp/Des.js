import { useState, useEffect, useCallback, useRef } from 'react';
import '../App.css';
import axios from 'axios';
import banner from '../assets/footer_banner.gif';
const API = 'http://localhost:3000/api';

function Des() {
  
  // Champs texte
  const [des1, setDes1] = useState('');
  const [des2, setDes2] = useState('');
  const [des3, setDes3] = useState('');

  // Sélections de base (toujours des strings)
  const [uniteStock, setUniteStock] = useState('0');
  const [taxe1, setTaxe1] = useState('0');
  const [taxe2, setTaxe2] = useState('0');
  const [taxe3, setTaxe3] = useState('0');
  const [marque, setMarque] = useState('0');

  // Nouveaux champs existants
  const [type, setType] = useState('0');
  const [nature, setNature] = useState('0');
  const [activite, setActivite] = useState('0');
  const [famille, setFamille] = useState('0');
  const [danger, setDanger] = useState('0');
  const [sousfamille, setSousfamille] = useState('0');

  // --- 9 champs ajoutés précédemment ---
  const [conditionnement, setConditionnement] = useState('0');
  const [application, setApplication] = useState('0');
  const [classificationArticle, setClassificationArticle] = useState('0');
  const [chefProduit, setChefProduit] = useState('0');
  const [das, setDas] = useState('0');
  const [departement, setDepartement] = useState('0');
  const [uniteAchat, setUniteAchat] = useState('0');
  const [uniteVente, setUniteVente] = useState('0');
  const [codeComptable, setCodeComptable] = useState('0');

  // --- NOUVEAUX CHAMPS (cette demande) ---
  // radios: non_gere | gere | gere_titre
  const [gestionStock, setGestionStock] = useState('non_gere');
  // select: pas_de_gestion | avec_gestion
  const [gestion, setGestion] = useState('pas_de_gestion');

  // Listes
  const [listeUnites, setListeUnites] = useState([]);
  const [listeTaxes, setListeTaxes] = useState([]);
  const [listeMarques, setListeMarques] = useState([]);

  const [listeType, setListeType] = useState([]);
  const [listeNature, setListeNature] = useState([]);
  const [listeActivite, setListeActivite] = useState([]);
  const [listeFamille, setListeFamille] = useState([]);
  const [listeDanger, setListeDanger] = useState([]);
  const [listeSousfamille, setListeSousfamille] = useState([]);

  // Listes pour les 9 nouveaux champs
  const [listeConditionnement, setListeConditionnement] = useState([]);
  const [listeApplication, setListeApplication] = useState([]);
  const [listeClassification, setListeClassification] = useState([]);
  const [listeChefProduit, setListeChefProduit] = useState([]);
  const [listeDAS, setListeDAS] = useState([]);
  const [listeDepartement, setListeDepartement] = useState([]);
  const [listeUniteAchat, setListeUniteAchat] = useState([]);
  const [listeUniteVente, setListeUniteVente] = useState([]);
  const [listeCodeComptable, setListeCodeComptable] = useState([]);

  // Articles
  const [articlesTemp, setArticlesTemp] = useState([]);

  // Édition
  const [editIndex, setEditIndex] = useState(null);

  // Messages
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  // Filtre
  const [filtreStatut, setFiltreStatut] = useState('en_cours');

  // Refs
  const des1Ref = useRef(null);
  const des2Ref = useRef(null);
  const des3Ref = useRef(null);

  const afficherErreur = (msg) => {
    setErreur(msg);
    setSucces('');
    setTimeout(() => setErreur(''), 3000);
  };

  const afficherSucces = (msg) => {
    setSucces(msg);
    setErreur('');
    setTimeout(() => setSucces(''), 3000);
  };

  const resetForm = () => {
    setDes1(''); setDes2(''); setDes3('');
    setUniteStock('0'); setTaxe1('0'); setTaxe2('0'); setTaxe3('0');
    setMarque('0');
    setType('0'); setNature('0'); setActivite('0');
    setFamille('0'); setDanger('0'); setSousfamille('0');

    setConditionnement('0'); setApplication('0'); setClassificationArticle('0');
    setChefProduit('0'); setDas('0'); setDepartement('0');
    setUniteAchat('0'); setUniteVente('0'); setCodeComptable('0');

    // reset des champs Gestion
    setGestionStock('non_gere');
    setGestion('pas_de_gestion');

    setEditIndex(null);
  };

  const verif = () => {
    if (des1.length > 30) { des1Ref.current?.focus(); afficherErreur('Des1 : max 30 caractères.'); return false; }
    if (des2.length > 30) { des2Ref.current?.focus(); afficherErreur('Des2 : max 30 caractères.'); return false; }
    if (des3.length > 30) { des3Ref.current?.focus(); afficherErreur('Des3 : max 30 caractères.'); return false; }
    return true;
  };

  // Chargement articles selon filtre
  const chargerArticles = useCallback(() => {
    if (filtreStatut === 'valide') {
      axios.get(`${API}/articles-valides`)
        .then(res => setArticlesTemp(res.data))
        .catch(() => afficherErreur('Erreur chargement articles validés.'));
    } else if (filtreStatut === 'en_cours') {
      axios.get(`${API}/articles`)
        .then(res => setArticlesTemp(res.data))
        .catch(() => afficherErreur('Erreur chargement articles en cours.'));
    } else {
      Promise.all([axios.get(`${API}/articles`), axios.get(`${API}/articles-valides`)])
        .then(([r1, r2]) => setArticlesTemp([...r1.data, ...r2.data]))
        .catch(() => afficherErreur('Erreur chargement tous les articles.'));
    }
  }, [filtreStatut]);

  // Chargement listes + articles
  useEffect(() => {
    chargerArticles();

    axios.get(`${API}/unites-stock`).then(r => setListeUnites(r.data)).catch(() => afficherErreur('Erreur unités.'));
    axios.get(`${API}/taxes`).then(r => setListeTaxes(r.data)).catch(() => afficherErreur('Erreur taxes.'));
    axios.get(`${API}/marque`).then(r => setListeMarques(r.data)).catch(() => afficherErreur('Erreur marque.'));

    axios.get(`${API}/type`).then(r => setListeType(r.data)).catch(() => afficherErreur('Erreur types.'));
    axios.get(`${API}/nature`).then(r => setListeNature(r.data)).catch(() => afficherErreur('Erreur natures.'));
    axios.get(`${API}/activite`).then(r => setListeActivite(r.data)).catch(() => afficherErreur('Erreur activités.'));
    axios.get(`${API}/famille`).then(r => setListeFamille(r.data)).catch(() => afficherErreur('Erreur familles.'));
    axios.get(`${API}/danger`).then(r => setListeDanger(r.data)).catch(() => afficherErreur('Erreur dangers.'));
    axios.get(`${API}/sousfamille`).then(r => setListeSousfamille(r.data)).catch(() => afficherErreur('Erreur sous-familles.'));

    // 9 listes
    axios.get(`${API}/conditionnement`).then(r => setListeConditionnement(r.data)).catch(() => afficherErreur('Erreur conditionnements.'));
    axios.get(`${API}/application`).then(r => setListeApplication(r.data)).catch(() => afficherErreur('Erreur applications.'));
    axios.get(`${API}/classification-article`).then(r => setListeClassification(r.data)).catch(() => afficherErreur('Erreur classifications.'));
    axios.get(`${API}/chef-produit`).then(r => setListeChefProduit(r.data)).catch(() => afficherErreur('Erreur chefs produit.'));
    axios.get(`${API}/das`).then(r => setListeDAS(r.data)).catch(() => afficherErreur('Erreur DAS.'));
    axios.get(`${API}/departement`).then(r => setListeDepartement(r.data)).catch(() => afficherErreur('Erreur départements.'));
    axios.get(`${API}/unite-achat`).then(r => setListeUniteAchat(r.data)).catch(() => afficherErreur('Erreur unités d\'achat.'));
    axios.get(`${API}/unite-vente`).then(r => setListeUniteVente(r.data)).catch(() => afficherErreur('Erreur unités de vente.'));
    axios.get(`${API}/code-comptable`).then(r => setListeCodeComptable(r.data)).catch(() => afficherErreur('Erreur codes comptables.'));
  }, [chargerArticles]);

  // Soumission formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verif()) return;

    const toNumOrNull = (v) => (v === '0' ? null : Number(v));
    const article = {
      des1, des2, des3,
      uniteStock: toNumOrNull(uniteStock),
      taxe1: toNumOrNull(taxe1),
      taxe2: toNumOrNull(taxe2),
      taxe3: toNumOrNull(taxe3),
      marque: toNumOrNull(marque),
      type: toNumOrNull(type),
      nature: toNumOrNull(nature),
      activite: toNumOrNull(activite),
      famille: toNumOrNull(famille),
      danger: toNumOrNull(danger),
      sousfamille: toNumOrNull(sousfamille),

      // 9 champs
      conditionnement: toNumOrNull(conditionnement),
      application: toNumOrNull(application),
      classificationArticle: toNumOrNull(classificationArticle),
      chefProduit: toNumOrNull(chefProduit),
      das: toNumOrNull(das),
      departement: toNumOrNull(departement),
      uniteAchat: toNumOrNull(uniteAchat),
      uniteVente: toNumOrNull(uniteVente),
      codeComptable: toNumOrNull(codeComptable),
      gestion_stock: gestionStock,         
      gestion: gestion,                       

      date: new Date().toISOString(),
    };

    try {
      if (editIndex !== null) {
        const id = articlesTemp[editIndex]?.id;
        if (!id) throw new Error('Article introuvable');
        await axios.put(`${API}/articles/${id}`, article);
        afficherSucces('Article modifié.');
      } else {
        await axios.post(`${API}/articles`, article);
        afficherSucces('Article ajouté.');
      }
      resetForm();
      chargerArticles();
    } catch (err) {
      afficherErreur("Erreur lors de l'enregistrement.");
    }
  };

  // Helper pour pick la première valeur définie (édition)
  const pickId = (...vals) => {
    for (const v of vals) if (v != null) return String(v);
    return '0';
  };

  // Édition
  const handleEdit = (index) => {
    const item = articlesTemp[index];
    if (!item) return;

    setDes1(item.des1 || '');
    setDes2(item.des2 || '');
    setDes3(item.des3 || '');

    setUniteStock(item.uniteStock != null ? String(item.uniteStock) : '0');
    setTaxe1(item.taxe1 != null ? String(item.taxe1) : '0');
    setTaxe2(item.taxe2 != null ? String(item.taxe2) : '0');
    setTaxe3(item.taxe3 != null ? String(item.taxe3) : '0');

    setMarque(
      item.marque_id != null ? String(item.marque_id)
      : item.marque != null ? String(item.marque)
      : '0'
    );

    const safe = (a, b) => (a != null ? String(a) : (b != null ? String(b) : '0'));
    setType(safe(item.type, item.type_id));
    setNature(safe(item.nature, item.nature_id));
    setActivite(safe(item.activite, item.activite_id));
    setFamille(safe(item.famille, item.famille_id));
    setDanger(safe(item.danger, item.danger_id));
    setSousfamille(safe(item.sousfamille, item.sousfamille_id));

    // 9 champs
    setConditionnement(pickId(item.conditionnement, item.conditionnement_id));
    setApplication(pickId(item.application, item.application_id));
    setClassificationArticle(pickId(item.classificationArticle, item.classification_article, item.classification_article_id));
    setChefProduit(pickId(item.chefProduit, item.chef_produit, item.chef_produit_id));
    setDas(pickId(item.das, item.DAS, item.das_id, item.DAS_id));
    setDepartement(pickId(item.departement, item.departement_id));
    setUniteAchat(pickId(item.uniteAchat, item.unite_achat, item.unite_achat_id));
    setUniteVente(pickId(item.uniteVente, item.unite_vente, item.unite_vente_id));
    setCodeComptable(pickId(item.codeComptable, item.code_comptable, item.code_comptable_id));

    // === champs de gestion (gère camel/snake) ===
    const gs = item.gestionStock ?? item.gestion_stock;
    const g  = item.gestion ?? item.GESTION; // au cas où

    setGestionStock(typeof gs === 'string' ? gs : 'non_gere');
    setGestion(typeof g === 'string' ? g : 'pas_de_gestion');

    setEditIndex(index);
  };

  // Suppression
  const handleDelete = async (index) => {
    const item = articlesTemp[index];
    if (!item) return;
    try {
      await axios.delete(`${API}/articles/${item.id}`);
      afficherSucces('Article supprimé.');
      chargerArticles();
    } catch {
      afficherErreur('Erreur suppression.');
    }
  };

  // Validation
  const handleVerifier = async (item) => {
    const requiredOk =
      item.des1 && item.des2 && item.des3 &&
      item.taxe1 != null && item.taxe2 != null && item.taxe3 != null &&
      (item.marque_id != null || item.marque != null);

    if (!requiredOk) {
      afficherErreur('Des1, Des2, Des3, taxes et marque sont obligatoires pour valider.');
      return;
    }
    try {
      await axios.patch(`${API}/articles/${item.id}/valider`);
      afficherSucces('Article validé.');
      chargerArticles();
    } catch {
      afficherErreur('Erreur validation.');
    }
  };

  // helper générique pour texte d’option (nom/label/code)
  const optText = (it) => it.nom ?? it.label ?? it.code ?? it.taux ?? String(it.id);

  // mapping jolis labels pour affichage
  const LABEL_GESTION_STOCK = {
    non_gere: 'Art non géré',
    gere: 'Art géré',
    gere_titre: 'Art géré titre'
  };
  const LABEL_GESTION = {
    pas_de_gestion: 'Pas de gestion',
    avec_gestion: 'Avec gestion'
  };

  return (
    


    <div>
      {erreur && <div className="message erreur">{erreur}</div>}
      {succes && <div className="message succes">{succes}</div>}

      <h2>{editIndex !== null ? 'Modifier un article' : 'Ajouter un article'}</h2>
      <form onSubmit={handleSubmit}>
        <label className='ide'>Identification:</label>
        <label>Désignation 1 :</label>
        <input ref={des1Ref} value={des1} onChange={e => setDes1(e.target.value)} maxLength={30} /><br />

        <label>Désignation 2 :</label>
        <input ref={des2Ref} value={des2} onChange={e => setDes2(e.target.value)} maxLength={30} /><br />

        <label>Désignation 3 :</label>
        <input ref={des3Ref} value={des3} onChange={e => setDes3(e.target.value)} maxLength={30} /><br />

        <label className='ide'>Unités:</label>
        <label>Unité de stock :</label>
        <select value={uniteStock} onChange={e => setUniteStock(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeUnites.map(u => <option key={u.id} value={String(u.id)}>{u.label}</option>)}
        </select><br />

        <label>Unité d'achat :</label>
        <select value={uniteAchat} onChange={e => setUniteAchat(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeUniteAchat.map(u => <option key={u.id} value={String(u.id)}>{optText(u)}</option>)}
        </select><br />

        <label>Unité de vente :</label>
        <select value={uniteVente} onChange={e => setUniteVente(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeUniteVente.map(u => <option key={u.id} value={String(u.id)}>{optText(u)}</option>)}
        </select><br />

        <label className='ide'>Familles Statistique:</label>

        <label>Marque :</label>
        <select value={marque} onChange={e => setMarque(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeMarques.map(m => <option key={m.id} value={String(m.id)}>{m.nom}</option>)}
        </select><br />

        <label>Type :</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeType.map(t => <option key={t.id} value={String(t.id)}>{t.nom}</option>)}
        </select><br />

        <label>Nature :</label>
        <select value={nature} onChange={e => setNature(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeNature.map(n => <option key={n.id} value={String(n.id)}>{n.nom}</option>)}
        </select><br />

        <label>Activité :</label>
        <select value={activite} onChange={e => setActivite(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeActivite.map(a => <option key={a.id} value={String(a.id)}>{a.nom}</option>)}
        </select><br />

        <label>Famille :</label>
        <select value={famille} onChange={e => setFamille(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeFamille.map(f => <option key={f.id} value={String(f.id)}>{f.nom}</option>)}
        </select><br />

        <label>Danger :</label>
        <select value={danger} onChange={e => setDanger(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeDanger.map(d => <option key={d.id} value={String(d.id)}>{d.nom}</option>)}
        </select><br />

        <label>Sous-famille :</label>
        <select value={sousfamille} onChange={e => setSousfamille(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeSousfamille.map(sf => <option key={sf.id} value={String(sf.id)}>{sf.nom}</option>)}
        </select><br />

        {/* --- 9 nouveaux champs --- */}
        <label>Conditionnement :</label>
        <select value={conditionnement} onChange={e => setConditionnement(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeConditionnement.map(c => <option key={c.id} value={String(c.id)}>{optText(c)}</option>)}
        </select><br />

        <label>Application :</label>
        <select value={application} onChange={e => setApplication(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeApplication.map(a => <option key={a.id} value={String(a.id)}>{optText(a)}</option>)}
        </select><br />

        <label>Classification article :</label>
        <select value={classificationArticle} onChange={e => setClassificationArticle(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeClassification.map(c => <option key={c.id} value={String(c.id)}>{optText(c)}</option>)}
        </select><br />

        <label>Chef produit :</label>
        <select value={chefProduit} onChange={e => setChefProduit(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeChefProduit.map(cp => <option key={cp.id} value={String(cp.id)}>{optText(cp)}</option>)}
        </select><br />

        <label>DAS :</label>
        <select value={das} onChange={e => setDas(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeDAS.map(d => <option key={d.id} value={String(d.id)}>{optText(d)}</option>)}
        </select><br />

        <label>Département :</label>
        <select value={departement} onChange={e => setDepartement(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeDepartement.map(dep => <option key={dep.id} value={String(dep.id)}>{optText(dep)}</option>)}
        </select><br />

        <label className='ide'>Comptables:</label>
        <label>Code comptable :</label>
        <select value={codeComptable} onChange={e => setCodeComptable(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeCodeComptable.map(cc => <option key={cc.id} value={String(cc.id)}>{optText(cc)}</option>)}
        </select><br />

        <label>Taxe 1 :</label>
        <select value={taxe1} onChange={e => setTaxe1(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeTaxes.map(t => <option key={t.id} value={String(t.id)}>{t.taux}</option>)}
        </select><br />

        <label>Taxe 2 :</label>
        <select value={taxe2} onChange={e => setTaxe2(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeTaxes.map(t => <option key={t.id} value={String(t.id)}>{t.taux}</option>)}
        </select><br />

        <label>Taxe 3 :</label>
        <select value={taxe3} onChange={e => setTaxe3(e.target.value)}>
          <option value="0">-- Sélectionner --</option>
          {listeTaxes.map(t => <option key={t.id} value={String(t.id)}>{t.taux}</option>)}
        </select><br />

        {/* ====== BLOC GESTION ====== */}
        <label className='ide'>Gestion:</label>

        <label>Gestion de stock :</label><br />
        <label>
          Art non géré
          <input
            type="radio"
            name="gestion_stock"
            value="non_gere"
            checked={gestionStock === 'non_gere'}
            onChange={(e) => setGestionStock(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: 12 }}>
          Art géré
          <input
            type="radio"
            name="gestion_stock"
            value="gere"
            checked={gestionStock === 'gere'}
            onChange={(e) => setGestionStock(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: 12 }}>
          Art géré titre
          <input
            type="radio"
            name="gestion_stock"
            value="gere_titre"
            checked={gestionStock === 'gere_titre'}
            onChange={(e) => setGestionStock(e.target.value)}
          />
        </label>

        <br /><br />
        <label>Gestion :</label><br />
        <select value={gestion} onChange={(e) => setGestion(e.target.value)}>
          <option value="pas_de_gestion">pas de gestion</option>
          <option value="avec_gestion">avec gestion</option>
        </select>

        <br /><br />
        <button type="submit" className='bts'>
          {editIndex !== null ? 'Enregistrer modification' : 'Ajouter dans la base'}
        </button>
        {editIndex !== null && <button type="button" onClick={resetForm}>Annuler</button>}
      </form>

      <hr />
      <label>Filtrer les articles :</label>
      <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
        <option value="en_cours">En cours</option>
        <option value="valide">Validés</option>
        <option value="tous">Tous</option>
      </select>

      <h3>Liste des articles</h3>
      <TableArticles
        data={articlesTemp}
        unites={listeUnites}
        taxes={listeTaxes}
        marques={listeMarques}
        types={listeType}
        natures={listeNature}
        activites={listeActivite}
        familles={listeFamille}
        dangers={listeDanger}
        sousfamilles={listeSousfamille}

        // 9 listes
        conditionnements={listeConditionnement}
        applications={listeApplication}
        classifications={listeClassification}
        chefsProduit={listeChefProduit}
        dasList={listeDAS}
        departements={listeDepartement}
        unitesAchat={listeUniteAchat}
        unitesVente={listeUniteVente}
        codesComptables={listeCodeComptable}

        // labels mapping pour gestion
        labelGestionStock={LABEL_GESTION_STOCK}
        labelGestion={LABEL_GESTION}

        onEdit={handleEdit}
        onDelete={handleDelete}
        onVerifier={handleVerifier}
      />
  
      <footer className="brand-footer" aria-label="Signature visuelle">
  <img
    src={banner}
    alt="Think before printing – Making the world better"
    className="brand-banner"
  />
</footer>
    </div>
    
  );
}

function TableArticles({
  data, unites, taxes, marques,
  types, natures, activites, familles, dangers, sousfamilles,
  conditionnements, applications, classifications, chefsProduit, dasList,
  departements, unitesAchat, unitesVente, codesComptables,
  labelGestionStock, labelGestion,
  onEdit, onDelete, onVerifier
}) {
  const byId = (arr, id) => arr.find(x => x.id === Number(id));

  const getUniteLabel = (id) => (id == null ? '-' : (byId(unites, id)?.label ?? 'Inconnu'));
  const getTaxeTaux   = (id) => (id == null ? '-' : (byId(taxes, id)?.taux ?? 'Inconnu'));

  const getNomSmart = (arr, id) => {
    if (id == null) return '-';
    const f = byId(arr, id);
    if (!f) return 'Inconnu';
    return f.nom ?? f.label ?? f.code ?? f.taux ?? String(f.id);
  };

  const getNom = (arr, id) => getNomSmart(arr, id);
  const col = (labelValue, list, idValue) => labelValue ?? getNom(list, idValue);

  const resolveMarqueName = (item) => {
    if (item.marqueLabel) return item.marqueLabel;
    const id = item.marque_id ?? item.marque;
    return id != null ? (byId(marques, id)?.nom ?? 'Inconnu') : '-';
  };

  const getId = (obj, ...keys) => {
    for (const k of keys) {
      if (obj?.[k] != null) return obj[k];
    }
    return null;
  };

  return (
    <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th>Des1</th><th>Des2</th><th>Des3</th>
          <th>Unité</th><th>Taxe1</th><th>Taxe2</th><th>Taxe3</th>
          <th>Marque</th><th>Type</th><th>Nature</th><th>Activité</th>
          <th>Famille</th><th>Danger</th><th>Sous-famille</th>

          {/* 9 nouveaux */}
          <th>Conditionnement</th>
          <th>Application</th>
          <th>Classification</th>
          <th>Chef produit</th>
          <th>DAS</th>
          <th>Département</th>
          <th>Unité d'achat</th>
          <th>Unité de vente</th>
          <th>Code comptable</th>

          {/* === Gestion === */}
          <th>Gestion de stock</th>
          <th>Gestion</th>

          <th>Date</th><th>Statut</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          const typeId       = item.type ?? item.type_id;
          const natureId     = item.nature ?? item.nature_id;
          const activiteId   = item.activite ?? item.activite_id;
          const familleId    = item.famille ?? item.famille_id;
          const dangerId     = item.danger ?? item.danger_id;
          const sousfamId    = item.sousfamille ?? item.sousfamille_id;

          // ids des 9 champs
          const conditionnementId   = getId(item, 'conditionnement', 'conditionnement_id');
          const applicationId       = getId(item, 'application', 'application_id');
          const classificationId    = getId(item, 'classificationArticle', 'classification_article', 'classification_article_id');
          const chefProduitId       = getId(item, 'chefProduit', 'chef_produit', 'chef_produit_id');
          const dasId               = getId(item, 'das', 'DAS', 'das_id', 'DAS_id');
          const departementId       = getId(item, 'departement', 'departement_id');
          const uniteAchatId        = getId(item, 'uniteAchat', 'unite_achat', 'unite_achat_id');
          const uniteVenteId        = getId(item, 'uniteVente', 'unite_vente', 'unite_vente_id');
          const codeComptableId     = getId(item, 'codeComptable', 'code_comptable', 'code_comptable_id');

          // champs gestion (camel ou snake)
          const gestionStockVal = item.gestionStock ?? item.gestion_stock ?? null;
          const gestionVal      = item.gestion ?? null;

          return (
            <tr key={item.id ?? index}>
              <td>{item.des1}</td>
              <td>{item.des2}</td>
              <td>{item.des3}</td>

              <td>{getUniteLabel(item.uniteStock)}</td>
              <td>{getTaxeTaux(item.taxe1)}</td>
              <td>{getTaxeTaux(item.taxe2)}</td>
              <td>{getTaxeTaux(item.taxe3)}</td>
              <td>{resolveMarqueName(item)}</td>

              <td>{col(item.typeLabel,       types,       typeId)}</td>
              <td>{col(item.natureLabel,     natures,     natureId)}</td>
              <td>{col(item.activiteLabel,   activites,   activiteId)}</td>
              <td>{col(item.familleLabel,    familles,    familleId)}</td>
              <td>{col(item.dangerLabel,     dangers,     dangerId)}</td>
              <td>{col(item.sousfamilleLabel,sousfamilles,sousfamId)}</td>

              {/* 9 champs */}
              <td>{col(item.conditionnementLabel, classifications /* volontaire? non => conditionnements */, conditionnementId)}</td>
              <td>{col(item.applicationLabel,     applications,     applicationId)}</td>
              <td>{col(item.classificationArticleLabel, classifications, classificationId)}</td>
              <td>{col(item.chefProduitLabel,     chefsProduit,      chefProduitId)}</td>
              <td>{col(item.dasLabel,             dasList,           dasId)}</td>
              <td>{col(item.departementLabel,     departements,      departementId)}</td>
              <td>{col(item.uniteAchatLabel,      unitesAchat,       uniteAchatId)}</td>
              <td>{col(item.uniteVenteLabel,      unitesVente,       uniteVenteId)}</td>
              <td>{col(item.codeComptableLabel,   codesComptables,   codeComptableId)}</td>

              {/* Gestion */}
              <td>{gestionStockVal ? (labelGestionStock[gestionStockVal] ?? gestionStockVal) : '—'}</td>
              <td>{gestionVal ? (labelGestion[gestionVal] ?? gestionVal) : '—'}</td>

              <td>{item.date ? new Date(item.date).toLocaleString() : '-'}</td>
              <td>{item.valide ? '✅' : '⏳'}</td>
              <td>
                <button onClick={() => onEdit(index)} disabled={item.valide} aria-label="Modifier article">Modifier</button>
                <button onClick={() => onDelete(index)} disabled={item.valide} aria-label="Supprimer article">Supprimer</button>
                {!item.valide && <button onClick={() => onVerifier(item)} aria-label="Valider article">Valider</button>}
              </td>
            </tr>
          );
        })}
        
      </tbody>
    </table>
        
  );
  
}

export default Des;
