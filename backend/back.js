// back.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'zak',
  port: 5432,
});

// === Enums "gestion" ===
const GESTION_STOCK_VALUES = ['non_gere', 'gere', 'gere_titre'];
const GESTION_VALUES = ['pas_de_gestion', 'avec_gestion'];

// Helpers
const toIntOrNull = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === '' || s === '0') return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
};
const isInt = (v) => Number.isInteger(v);
const parseId = (raw) => {
  const n = Number(String(raw).trim());
  return Number.isInteger(n) ? n : NaN;
};

const handlePgError = (res, e, msgGeneric = 'Erreur serveur') => {
  if (e.code === '23505') return res.status(409).json({ error: 'Conflit: doublon' });
  if (e.code === '23503') return res.status(400).json({ error: 'Contrainte référentielle violée' });
  console.error(e);
  return res.status(500).json({ error: msgGeneric });
};

function validateArticle({ des1, des2, des3 }) {
  if (typeof des1 !== 'string' || des1.length > 30) return 'des1 doit être une chaîne max 30 caractères';
  if (typeof des2 !== 'string' || des2.length > 30) return 'des2 doit être une chaîne max 30 caractères';
  if (typeof des3 !== 'string' || des3.length > 30) return 'des3 doit être une chaîne max 30 caractères';
  return null;
}

// Vérif existence FK (null => OK)
async function existsById(table, id) {
  if (id == null) return true;
  const { rows } = await pool.query(`SELECT 1 FROM ${table} WHERE id=$1`, [id]);
  return rows.length > 0;
}

/* ==================== ARTICLES ==================== */

// GET - Articles NON validés
app.get('/api/articles', async (req, res) => {
  try {
    const q = `
      SELECT 
        a.id,
        a.des1, a.des2, a.des3,
        a.unitestock       AS "uniteStock",
        u.label            AS "uniteLabel",
        a.taxe1, t1.taux   AS "taxe1Label",
        a.taxe2, t2.taux   AS "taxe2Label",
        a.taxe3, t3.taux   AS "taxe3Label",
        a.marque_id        AS "marque_id",
        m.nom              AS "marqueLabel",

        -- alias alignés avec le front :
        a.type_id          AS "type",
        ty.nom             AS "typeLabel",
        a.nature_id        AS "nature",
        na.nom             AS "natureLabel",
        a.activite_id      AS "activite",
        ac.nom             AS "activiteLabel",
        a.famille_id       AS "famille",
        fa.nom             AS "familleLabel",
        a.danger_id        AS "danger",
        da.nom             AS "dangerLabel",
        a.sous_famille_id  AS "sousfamille",
        sf.nom             AS "sousfamilleLabel",

        -- 9 NOUVELLES FKS + libellés
        a.conditionnement,
        cnd.nom            AS "conditionnementLabel",
        a.application,
        app.nom            AS "applicationLabel",
        a.classification_article,
        cla.nom            AS "classificationArticleLabel",
        a.chef_produit,
        chp.nom            AS "chefProduitLabel",
        a.das,
        ds.nom             AS "dasLabel",
        a.departement,
        dep.nom            AS "departementLabel",
        a.unite_achat,
        ua.label           AS "uniteAchatLabel",
        a.unite_vente,
        uv.label           AS "uniteVenteLabel",
        a.code_comptable,
        COALESCE(cc.nom, cc.code) AS "codeComptableLabel",

        -- NEW: champs gestion
        a.gestion_stock    AS "gestion_stock",
        a.gestion          AS "gestion",

        a.date,
        a.valide
      FROM article a
      LEFT JOIN unite_stock  u  ON u.id::text  = a.unitestock::text
      LEFT JOIN taxe         t1 ON t1.id::text = a.taxe1::text
      LEFT JOIN taxe         t2 ON t2.id::text = a.taxe2::text
      LEFT JOIN taxe         t3 ON t3.id::text = a.taxe3::text
      LEFT JOIN marque       m  ON m.id::text  = a.marque_id::text
      LEFT JOIN type         ty ON ty.id::text = a.type_id::text
      LEFT JOIN nature       na ON na.id::text = a.nature_id::text
      LEFT JOIN activite     ac ON ac.id::text = a.activite_id::text
      LEFT JOIN famille      fa ON fa.id::text = a.famille_id::text
      LEFT JOIN danger       da ON da.id::text = a.danger_id::text
      LEFT JOIN sous_famille sf ON sf.id::text = a.sous_famille_id::text

      LEFT JOIN conditionnement       cnd ON cnd.id::text = a.conditionnement::text
      LEFT JOIN application           app ON app.id::text = a.application::text
      LEFT JOIN classification_article cla ON cla.id::text = a.classification_article::text
      LEFT JOIN chef_produit          chp ON chp.id::text = a.chef_produit::text
      LEFT JOIN das                   ds  ON ds.id::text  = a.das::text
      LEFT JOIN departement           dep ON dep.id::text = a.departement::text
      LEFT JOIN unite_achat           ua  ON ua.id::text  = a.unite_achat::text
      LEFT JOIN unite_vente           uv  ON uv.id::text  = a.unite_vente::text
      LEFT JOIN code_comptable        cc  ON cc.id::text  = a.code_comptable::text

      WHERE a.valide = false
      ORDER BY a.date DESC
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur récupération articles' });
  }
});

// GET - Articles VALIDÉS
app.get('/api/articles-valides', async (req, res) => {
  try {
    const q = `
      SELECT 
        a.id,
        a.des1, a.des2, a.des3,
        a.unitestock       AS "uniteStock",
        u.label            AS "uniteLabel",
        a.taxe1, t1.taux   AS "taxe1Label",
        a.taxe2, t2.taux   AS "taxe2Label",
        a.taxe3, t3.taux   AS "taxe3Label",
        a.marque_id        AS "marque_id",
        m.nom              AS "marqueLabel",

        a.type_id          AS "type",
        ty.nom             AS "typeLabel",
        a.nature_id        AS "nature",
        na.nom             AS "natureLabel",
        a.activite_id      AS "activite",
        ac.nom             AS "activiteLabel",
        a.famille_id       AS "famille",
        fa.nom             AS "familleLabel",
        a.danger_id        AS "danger",
        da.nom             AS "dangerLabel",
        a.sous_famille_id  AS "sousfamille",
        sf.nom             AS "sousfamilleLabel",

        a.conditionnement,
        cnd.nom            AS "conditionnementLabel",
        a.application,
        app.nom            AS "applicationLabel",
        a.classification_article,
        cla.nom            AS "classificationArticleLabel",
        a.chef_produit,
        chp.nom            AS "chefProduitLabel",
        a.das,
        ds.nom             AS "dasLabel",
        a.departement,
        dep.nom            AS "departementLabel",
        a.unite_achat,
        ua.label           AS "uniteAchatLabel",
        a.unite_vente,
        uv.label           AS "uniteVenteLabel",
        a.code_comptable,
        COALESCE(cc.nom, cc.code) AS "codeComptableLabel",

        -- NEW: champs gestion
        a.gestion_stock    AS "gestion_stock",
        a.gestion          AS "gestion",

        a.date,
        a.valide
      FROM article a
      LEFT JOIN unite_stock  u  ON u.id::text  = a.unitestock::text
      LEFT JOIN taxe         t1 ON t1.id::text = a.taxe1::text
      LEFT JOIN taxe         t2 ON t2.id::text = a.taxe2::text
      LEFT JOIN taxe         t3 ON t3.id::text = a.taxe3::text
      LEFT JOIN marque       m  ON m.id::text  = a.marque_id::text
      LEFT JOIN type         ty ON ty.id::text = a.type_id::text
      LEFT JOIN nature       na ON na.id::text = a.nature_id::text
      LEFT JOIN activite     ac ON ac.id::text = a.activite_id::text
      LEFT JOIN famille      fa ON fa.id::text = a.famille_id::text
      LEFT JOIN danger       da ON da.id::text = a.danger_id::text
      LEFT JOIN sous_famille sf ON sf.id::text = a.sous_famille_id::text

      LEFT JOIN conditionnement       cnd ON cnd.id::text = a.conditionnement::text
      LEFT JOIN application           app ON app.id::text = a.application::text
      LEFT JOIN classification_article cla ON cla.id::text = a.classification_article::text
      LEFT JOIN chef_produit          chp ON chp.id::text = a.chef_produit::text
      LEFT JOIN das                   ds  ON ds.id::text  = a.das::text
      LEFT JOIN departement           dep ON dep.id::text = a.departement::text
      LEFT JOIN unite_achat           ua  ON ua.id::text  = a.unite_achat::text
      LEFT JOIN unite_vente           uv  ON uv.id::text  = a.unite_vente::text
      LEFT JOIN code_comptable        cc  ON cc.id::text  = a.code_comptable::text

      WHERE a.valide = true
      ORDER BY a.date DESC
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur récupération articles validés' });
  }
});

// POST - Ajouter un article (avec tous les champs)
app.post('/api/articles', async (req, res) => {
  const {
    des1, des2, des3,
    uniteStock, taxe1, taxe2, taxe3, marque,
    type, nature, activite, famille, danger, sousfamille,

    // 9 NOUVEAUX CHAMPS
    conditionnement, application, classificationArticle, chefProduit,
    das, departement, uniteAchat, uniteVente, codeComptable,

    // NEW gestion
    gestion_stock, gestion,

    date
  } = req.body;

  const errVal = validateArticle({ des1, des2, des3 });
  if (errVal) return res.status(400).json({ error: errVal });

  // Validation enum (si fournis)
  if (gestion_stock && !GESTION_STOCK_VALUES.includes(gestion_stock)) {
    return res.status(400).json({ error: 'gestion_stock invalide' });
  }
  if (gestion && !GESTION_VALUES.includes(gestion)) {
    return res.status(400).json({ error: 'gestion invalide' });
  }

  const now              = date ? new Date(date) : new Date();
  const parsedUnite      = toIntOrNull(uniteStock);
  const parsedTaxe1      = toIntOrNull(taxe1);
  const parsedTaxe2      = toIntOrNull(taxe2);
  const parsedTaxe3      = toIntOrNull(taxe3);
  const parsedMarque     = toIntOrNull(marque);

  const parsedType       = toIntOrNull(type);
  const parsedNature     = toIntOrNull(nature);
  const parsedActivite   = toIntOrNull(activite);
  const parsedFamille    = toIntOrNull(famille);
  const parsedDanger     = toIntOrNull(danger);
  const parsedSousFam    = toIntOrNull(sousfamille);

  const parsedCond       = toIntOrNull(conditionnement);
  const parsedApp        = toIntOrNull(application);
  const parsedClassif    = toIntOrNull(classificationArticle);
  const parsedChefProd   = toIntOrNull(chefProduit);
  const parsedDas        = toIntOrNull(das);
  const parsedDept       = toIntOrNull(departement);
  const parsedUniteAch   = toIntOrNull(uniteAchat);
  const parsedUniteVte   = toIntOrNull(uniteVente);
  const parsedCodeComp   = toIntOrNull(codeComptable);

  try {
    // FKs existantes
    if (!(await existsById('unite_stock',  parsedUnite)))   return res.status(400).json({ error: 'Unité inconnue' });
    if (!(await existsById('taxe',         parsedTaxe1)))   return res.status(400).json({ error: 'Taxe 1 inconnue' });
    if (!(await existsById('taxe',         parsedTaxe2)))   return res.status(400).json({ error: 'Taxe 2 inconnue' });
    if (!(await existsById('taxe',         parsedTaxe3)))   return res.status(400).json({ error: 'Taxe 3 inconnue' });
    if (!(await existsById('marque',       parsedMarque)))  return res.status(400).json({ error: 'Marque inconnue' });

    if (!(await existsById('type',         parsedType)))    return res.status(400).json({ error: 'Type inconnu' });
    if (!(await existsById('nature',       parsedNature)))  return res.status(400).json({ error: 'Nature inconnue' });
    if (!(await existsById('activite',     parsedActivite)))return res.status(400).json({ error: 'Activité inconnue' });
    if (!(await existsById('famille',      parsedFamille))) return res.status(400).json({ error: 'Famille inconnue' });
    if (!(await existsById('danger',       parsedDanger)))  return res.status(400).json({ error: 'Danger inconnu' });
    if (!(await existsById('sous_famille', parsedSousFam))) return res.status(400).json({ error: 'Sous-famille inconnue' });

    // 9 NOUVELLES FKs
    if (!(await existsById('conditionnement',       parsedCond)))     return res.status(400).json({ error: 'Conditionnement inconnu' });
    if (!(await existsById('application',           parsedApp)))      return res.status(400).json({ error: 'Application inconnue' });
    if (!(await existsById('classification_article',parsedClassif)))  return res.status(400).json({ error: 'Classification article inconnue' });
    if (!(await existsById('chef_produit',          parsedChefProd))) return res.status(400).json({ error: 'Chef produit inconnu' });
    if (!(await existsById('das',                   parsedDas)))      return res.status(400).json({ error: 'DAS inconnu' });
    if (!(await existsById('departement',           parsedDept)))     return res.status(400).json({ error: 'Département inconnu' });
    if (!(await existsById('unite_achat',           parsedUniteAch))) return res.status(400).json({ error: 'Unité d\'achat inconnue' });
    if (!(await existsById('unite_vente',           parsedUniteVte))) return res.status(400).json({ error: 'Unité de vente inconnue' });
    if (!(await existsById('code_comptable',        parsedCodeComp))) return res.status(400).json({ error: 'Code comptable inconnu' });

    const q = `
      INSERT INTO article 
        (des1, des2, des3,
         unitestock, taxe1, taxe2, taxe3, marque_id,
         type_id, nature_id, activite_id, famille_id, danger_id, sous_famille_id,
         conditionnement, application, classification_article, chef_produit, das, departement, unite_achat, unite_vente, code_comptable,
         gestion_stock, gestion,
         date, valide)
      VALUES 
        ($1, $2, $3,
         $4, $5, $6, $7, $8,
         $9, $10, $11, $12, $13, $14,
         $15, $16, $17, $18, $19, $20, $21, $22, $23,
         $24, $25,
         $26, false)
    `;
    await pool.query(q, [
      des1, des2, des3,
      parsedUnite, parsedTaxe1, parsedTaxe2, parsedTaxe3, parsedMarque,
      parsedType, parsedNature, parsedActivite, parsedFamille, parsedDanger, parsedSousFam,
      parsedCond, parsedApp, parsedClassif, parsedChefProd, parsedDas, parsedDept, parsedUniteAch, parsedUniteVte, parsedCodeComp,
      gestion_stock ?? null,           // $24
      gestion ?? null,                 // $25
      now                              // $26
    ]);
    res.status(201).json({ message: 'Article ajouté.' });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Référence invalide (FK).' });
    handlePgError(res, err, 'Erreur ajout article');
  }
});

// PUT - Modifier article (avec tous les champs)
app.put('/api/articles/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });

  const {
    des1, des2, des3,
    uniteStock, taxe1, taxe2, taxe3, marque,
    type, nature, activite, famille, danger, sousfamille,

    conditionnement, application, classificationArticle, chefProduit,
    das, departement, uniteAchat, uniteVente, codeComptable,

    // NEW gestion
    gestion_stock, gestion
  } = req.body;

  const errVal = validateArticle({ des1, des2, des3 });
  if (errVal) return res.status(400).json({ error: errVal });

  // Validation enum (si fournis)
  if (gestion_stock && !GESTION_STOCK_VALUES.includes(gestion_stock)) {
    return res.status(400).json({ error: 'gestion_stock invalide' });
  }
  if (gestion && !GESTION_VALUES.includes(gestion)) {
    return res.status(400).json({ error: 'gestion invalide' });
  }

  const now              = new Date();
  const parsedUnite      = toIntOrNull(uniteStock);
  const parsedTaxe1      = toIntOrNull(taxe1);
  const parsedTaxe2      = toIntOrNull(taxe2);
  const parsedTaxe3      = toIntOrNull(taxe3);
  const parsedMarque     = toIntOrNull(marque);

  const parsedType       = toIntOrNull(type);
  const parsedNature     = toIntOrNull(nature);
  const parsedActivite   = toIntOrNull(activite);
  const parsedFamille    = toIntOrNull(famille);
  const parsedDanger     = toIntOrNull(danger);
  const parsedSousFam    = toIntOrNull(sousfamille);

  const parsedCond       = toIntOrNull(conditionnement);
  const parsedApp        = toIntOrNull(application);
  const parsedClassif    = toIntOrNull(classificationArticle);
  const parsedChefProd   = toIntOrNull(chefProduit);
  const parsedDas        = toIntOrNull(das);
  const parsedDept       = toIntOrNull(departement);
  const parsedUniteAch   = toIntOrNull(uniteAchat);
  const parsedUniteVte   = toIntOrNull(uniteVente);
  const parsedCodeComp   = toIntOrNull(codeComptable);

  try {
    if (!(await existsById('unite_stock',  parsedUnite)))   return res.status(400).json({ error: 'Unité inconnue' });
    if (!(await existsById('taxe',         parsedTaxe1)))   return res.status(400).json({ error: 'Taxe 1 inconnue' });
    if (!(await existsById('taxe',         parsedTaxe2)))   return res.status(400).json({ error: 'Taxe 2 inconnue' });
    if (!(await existsById('taxe',         parsedTaxe3)))   return res.status(400).json({ error: 'Taxe 3 inconnue' });
    if (!(await existsById('marque',       parsedMarque)))  return res.status(400).json({ error: 'Marque inconnue' });

    if (!(await existsById('type',         parsedType)))    return res.status(400).json({ error: 'Type inconnu' });
    if (!(await existsById('nature',       parsedNature)))  return res.status(400).json({ error: 'Nature inconnue' });
    if (!(await existsById('activite',     parsedActivite)))return res.status(400).json({ error: 'Activité inconnue' });
    if (!(await existsById('famille',      parsedFamille))) return res.status(400).json({ error: 'Famille inconnue' });
    if (!(await existsById('danger',       parsedDanger)))  return res.status(400).json({ error: 'Danger inconnu' });
    if (!(await existsById('sous_famille', parsedSousFam))) return res.status(400).json({ error: 'Sous-famille inconnue' });

    if (!(await existsById('conditionnement',       parsedCond)))     return res.status(400).json({ error: 'Conditionnement inconnu' });
    if (!(await existsById('application',           parsedApp)))      return res.status(400).json({ error: 'Application inconnue' });
    if (!(await existsById('classification_article',parsedClassif)))  return res.status(400).json({ error: 'Classification article inconnue' });
    if (!(await existsById('chef_produit',          parsedChefProd))) return res.status(400).json({ error: 'Chef produit inconnu' });
    if (!(await existsById('das',                   parsedDas)))      return res.status(400).json({ error: 'DAS inconnu' });
    if (!(await existsById('departement',           parsedDept)))     return res.status(400).json({ error: 'Département inconnu' });
    if (!(await existsById('unite_achat',           parsedUniteAch))) return res.status(400).json({ error: 'Unité d\'achat inconnue' });
    if (!(await existsById('unite_vente',           parsedUniteVte))) return res.status(400).json({ error: 'Unité de vente inconnue' });
    if (!(await existsById('code_comptable',        parsedCodeComp))) return res.status(400).json({ error: 'Code comptable inconnu' });

    const q = `
      UPDATE article 
      SET des1=$1, des2=$2, des3=$3,
          unitestock=$4, taxe1=$5, taxe2=$6, taxe3=$7, marque_id=$8,
          type_id=$9, nature_id=$10, activite_id=$11, famille_id=$12, danger_id=$13, sous_famille_id=$14,
          conditionnement=$15, application=$16, classification_article=$17, chef_produit=$18, das=$19, departement=$20, 
          unite_achat=$21, unite_vente=$22, code_comptable=$23,
          gestion_stock=$24, gestion=$25,
          date=$26
      WHERE id=$27
    `;
    const r = await pool.query(q, [
      des1, des2, des3,
      parsedUnite, parsedTaxe1, parsedTaxe2, parsedTaxe3, parsedMarque,
      parsedType, parsedNature, parsedActivite, parsedFamille, parsedDanger, parsedSousFam,
      parsedCond, parsedApp, parsedClassif, parsedChefProd, parsedDas, parsedDept,
      parsedUniteAch, parsedUniteVte, parsedCodeComp,
      gestion_stock ?? null,               // $24
      gestion ?? null,                     // $25
      now,                                 // $26
      id                                   // $27
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Article non trouvé' });
    res.json({ message: 'Article modifié.' });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Référence invalide (FK).' });
    handlePgError(res, err, 'Erreur modification article');
  }
});

// DELETE - Supprimer article
app.delete('/api/articles/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
  try {
    const r = await pool.query('DELETE FROM article WHERE id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Article non trouvé' });
    res.json({ message: 'Article supprimé.' });
  } catch (err) {
    handlePgError(res, err, 'Erreur suppression article');
  }
});

// PATCH - Valider article
app.patch('/api/articles/:id/valider', async (req, res) => {
  const id = parseId(req.params.id);
  if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
  try {
    const r = await pool.query('UPDATE article SET valide = true WHERE id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Article non trouvé' });
    res.json({ message: 'Article validé.' });
  } catch (err) {
    handlePgError(res, err, 'Erreur validation article');
  }
});

/* ==================== UNITÉS DE STOCK ==================== */
app.get('/api/unites-stock', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, label FROM unite_stock ORDER BY label ASC');
    res.json(r.rows);
  } catch (err) {
    handlePgError(res, err, 'Erreur récupération unités');
  }
});

app.post('/api/unites-stock', async (req, res) => {
  const label = (req.body.label ?? '').toString().trim();
  if (!label) return res.status(400).json({ error: 'Label requis' });
  try {
    const r = await pool.query(
      `WITH ins AS (
         INSERT INTO unite_stock(label)
         SELECT $1::text
         WHERE NOT EXISTS (SELECT 1 FROM unite_stock WHERE label = $1::text)
         RETURNING id, label
       )
       SELECT id, label FROM ins;`,
      [label]
    );
    if (r.rowCount === 0) return res.status(409).json({ error: 'Unité déjà existante' });
    res.status(201).json({ message: 'Unité ajoutée.', ...r.rows[0] });
  } catch (err) {
    handlePgError(res, err, 'Erreur ajout unité');
  }
});

app.delete('/api/unites-stock/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
  try {
    const r = await pool.query('DELETE FROM unite_stock WHERE id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Unité non trouvée' });
    res.json({ message: 'Unité supprimée' });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Unité utilisée dans un article' });
    handlePgError(res, err, 'Erreur suppression unité');
  }
});

/* ==================== TAXES ==================== */
app.get('/api/taxes', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, taux FROM taxe ORDER BY taux ASC');
    res.json(r.rows);
  } catch (err) {
    handlePgError(res, err, 'Erreur récupération taxes');
  }
});

app.post('/api/taxes', async (req, res) => {
  const raw = (req.body.taux ?? '').toString().trim().replace(',', '.');
  const taux = Number(raw);
  if (!Number.isFinite(taux)) return res.status(400).json({ error: 'Taux doit être un nombre' });
  try {
    const r = await pool.query(
      `WITH ins AS (
         INSERT INTO taxe(taux)
         SELECT $1::numeric
         WHERE NOT EXISTS (SELECT 1 FROM taxe WHERE taux = $1::numeric)
         RETURNING id, taux
       )
       SELECT id, taux FROM ins;`,
      [taux]
    );
    if (r.rowCount === 0) return res.status(409).json({ error: 'Cette taxe existe déjà' });
    res.status(201).json({ message: 'Taxe ajoutée.', ...r.rows[0] });
  } catch (err) {
    handlePgError(res, err, 'Erreur ajout taxe');
  }
});

app.delete('/api/taxes/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
  try {
    const r = await pool.query('DELETE FROM taxe WHERE id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Taxe non trouvée' });
    res.json({ message: 'Taxe supprimée' });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Taxe utilisée dans un article' });
    handlePgError(res, err, 'Erreur suppression taxe');
  }
});

/* ==================== MARQUE ==================== */
app.get('/api/marque', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, nom FROM marque ORDER BY nom ASC');
    res.json(r.rows);
  } catch (err) {
    handlePgError(res, err, 'Erreur récupération marques');
  }
});

app.post('/api/marque', async (req, res) => {
  const nom = (req.body.nom ?? '').toString().trim();
  if (!nom) return res.status(400).json({ error: 'Nom requis' });
  try {
    const r = await pool.query(
      `WITH ins AS (
         INSERT INTO marque(nom)
         SELECT $1::text
         WHERE NOT EXISTS (SELECT 1 FROM marque WHERE nom = $1::text)
         RETURNING id, nom
       )
       SELECT id, nom FROM ins;`,
      [nom]
    );
    if (r.rowCount === 0) return res.status(409).json({ error: 'Marque déjà existante' });
    res.status(201).json({ message: 'Marque ajoutée.', ...r.rows[0] });
  } catch (err) {
    handlePgError(res, err, 'Erreur ajout marque');
  }
});

app.put('/api/marque/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
  const nom = (req.body.nom ?? '').toString().trim();
  if (!nom) return res.status(400).json({ error: 'Nom requis' });
  try {
    const r = await pool.query('UPDATE marque SET nom = $1 WHERE id = $2', [nom, id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Marque non trouvée' });
    res.json({ message: 'Marque modifiée' });
  } catch (err) {
    handlePgError(res, err, 'Erreur modification marque');
  }
});

app.delete('/api/marque/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
  try {
    const r = await pool.query('DELETE FROM marque WHERE id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Marque non trouvée' });
    res.json({ message: 'Marque supprimée' });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Marque utilisée' });
    handlePgError(res, err, 'Erreur suppression marque');
  }
});

/* ==================== GENERIQUES (tables avec colonne nom) ==================== */
function mountNomRoutes({ base, table, label }) {
  app.get(`/api/${base}`, async (req, res) => {
    try {
      const r = await pool.query(`SELECT id, nom FROM ${table} ORDER BY nom ASC`);
      res.json(r.rows);
    } catch (err) {
      handlePgError(res, err, `Erreur récupération ${label}s`);
    }
  });

  app.post(`/api/${base}`, async (req, res) => {
    const nom = (req.body.nom ?? '').toString().trim();
    if (!nom) return res.status(400).json({ error: 'Nom requis' });
    try {
      const r = await pool.query(
        `WITH ins AS (
           INSERT INTO ${table}(nom)
           SELECT $1::text
           WHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE nom = $1::text)
           RETURNING id, nom
         )
         SELECT id, nom FROM ins;`,
        [nom]
      );
      if (r.rowCount === 0) return res.status(409).json({ error: `${label} déjà existant(e)` });
      res.status(201).json({ message: `${label} ajouté(e).`, ...r.rows[0] });
    } catch (err) {
      handlePgError(res, err, `Erreur ajout ${label}`);
    }
  });

  app.put(`/api/${base}/:id`, async (req, res) => {
    const id = parseId(req.params.id);
    if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
    const nom = (req.body.nom ?? '').toString().trim();
    if (!nom) return res.status(400).json({ error: 'Nom requis' });
    try {
      const r = await pool.query(`UPDATE ${table} SET nom = $1 WHERE id = $2`, [nom, id]);
      if (r.rowCount === 0) return res.status(404).json({ error: `${label} non trouvé(e)` });
      res.json({ message: `${label} modifié(e)` });
    } catch (err) {
      handlePgError(res, err, `Erreur modification ${label}`);
    }
  });

  app.delete(`/api/${base}/:id`, async (req, res) => {
    const id = parseId(req.params.id);
    if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
    try {
      const r = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      if (r.rowCount === 0) return res.status(404).json({ error: `${label} non trouvé(e)` });
      res.json({ message: `${label} supprimé(e)` });
    } catch (err) {
      if (err.code === '23503') return res.status(400).json({ error: `${label} utilisé(e)` });
      handlePgError(res, err, `Erreur suppression ${label}`);
    }
  });
}

/* ==================== SPECIFIQUES (label / code+nom) ==================== */
function mountLabelRoutes({ base, table, label }) {
  app.get(`/api/${base}`, async (req, res) => {
    try {
      const r = await pool.query(`SELECT id, label FROM ${table} ORDER BY label ASC`);
      res.json(r.rows);
    } catch (err) {
      handlePgError(res, err, `Erreur récupération ${label}s`);
    }
  });

  app.post(`/api/${base}`, async (req, res) => {
    const labelVal = (req.body.label ?? '').toString().trim();
    if (!labelVal) return res.status(400).json({ error: 'Label requis' });
    try {
      const r = await pool.query(
        `WITH ins AS (
           INSERT INTO ${table}(label)
           SELECT $1::text
           WHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE label = $1::text)
           RETURNING id, label
         )
         SELECT id, label FROM ins;`,
        [labelVal]
      );
      if (r.rowCount === 0) return res.status(409).json({ error: `${label} déjà existante` });
      res.status(201).json({ message: `${label} ajoutée.`, ...r.rows[0] });
    } catch (err) {
      handlePgError(res, err, `Erreur ajout ${label}`);
    }
  });

  app.put(`/api/${base}/:id`, async (req, res) => {
    const id = parseId(req.params.id);
    if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
    const labelVal = (req.body.label ?? '').toString().trim();
    if (!labelVal) return res.status(400).json({ error: 'Label requis' });
    try {
      const r = await pool.query(`UPDATE ${table} SET label = $1 WHERE id = $2`, [labelVal, id]);
      if (r.rowCount === 0) return res.status(404).json({ error: `${label} non trouvée` });
      res.json({ message: `${label} modifiée` });
    } catch (err) {
      handlePgError(res, err, `Erreur modification ${label}`);
    }
  });

  app.delete(`/api/${base}/:id`, async (req, res) => {
    const id = parseId(req.params.id);
    if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
    try {
      const r = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      if (r.rowCount === 0) return res.status(404).json({ error: `${label} non trouvée` });
      res.json({ message: `${label} supprimée` });
    } catch (err) {
      if (err.code === '23503') return res.status(400).json({ error: `${label} utilisée` });
      handlePgError(res, err, `Erreur suppression ${label}`);
    }
  });
}

function mountCodeComptableRoutes() {
  const base = 'code-comptable';
  const table = 'code_comptable';
  const label = 'Code comptable';

  app.get(`/api/${base}`, async (req, res) => {
    try {
      const r = await pool.query(`SELECT id, code, nom FROM ${table} ORDER BY code ASC`);
      res.json(r.rows);
    } catch (err) {
      handlePgError(res, err, `Erreur récupération ${label}s`);
    }
  });

  app.post(`/api/${base}`, async (req, res) => {
    const code = (req.body.code ?? '').toString().trim();
    const nom  = (req.body.nom ?? '').toString().trim() || null;
    if (!code) return res.status(400).json({ error: 'Code requis' });
    try {
      const r = await pool.query(
        `WITH ins AS (
           INSERT INTO ${table}(code, nom)
           SELECT $1::varchar(32), $2::text
           WHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE code = $1::varchar(32))
           RETURNING id, code, nom
         )
         SELECT id, code, nom FROM ins;`,
        [code, nom]
      );
      if (r.rowCount === 0) return res.status(409).json({ error: `${label} déjà existant` });
      res.status(201).json({ message: `${label} ajouté.`, ...r.rows[0] });
    } catch (err) {
      handlePgError(res, err, `Erreur ajout ${label}`);
    }
  });

  app.put(`/api/${base}/:id`, async (req, res) => {
    const id = parseId(req.params.id);
    if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
    const code = (req.body.code ?? '').toString().trim();
    const nom  = (req.body.nom ?? '').toString().trim() || null;
    if (!code) return res.status(400).json({ error: 'Code requis' });
    try {
      const r = await pool.query(`UPDATE ${table} SET code=$1, nom=$2 WHERE id=$3`, [code, nom, id]);
      if (r.rowCount === 0) return res.status(404).json({ error: `${label} non trouvé` });
      res.json({ message: `${label} modifié` });
    } catch (err) {
      handlePgError(res, err, `Erreur modification ${label}`);
    }
  });

  app.delete(`/api/${base}/:id`, async (req, res) => {
    const id = parseId(req.params.id);
    if (!isInt(id)) return res.status(400).json({ error: 'id invalide' });
    try {
      const r = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      if (r.rowCount === 0) return res.status(404).json({ error: `${label} non trouvé` });
      res.json({ message: `${label} supprimé` });
    } catch (err) {
      if (err.code === '23503') return res.status(400).json({ error: `${label} utilisé` });
      handlePgError(res, err, `Erreur suppression ${label}`);
    }
  });
}

/* ==================== MONTAGE DES ROUTES ==================== */
/* Tables avec colonne nom */
mountNomRoutes({ base: 'type',                   table: 'type',                   label: 'Type' });
mountNomRoutes({ base: 'nature',                 table: 'nature',                 label: 'Nature' });
mountNomRoutes({ base: 'activite',               table: 'activite',               label: 'Activité' });
mountNomRoutes({ base: 'danger',                 table: 'danger',                 label: 'Danger' });
mountNomRoutes({ base: 'famille',                table: 'famille',                label: 'Famille' });
mountNomRoutes({ base: 'sousfamille',            table: 'sous_famille',           label: 'Sous-famille' });

/* Nouvelles tables "nom" */
mountNomRoutes({ base: 'conditionnement',        table: 'conditionnement',        label: 'Conditionnement' });
mountNomRoutes({ base: 'application',            table: 'application',            label: 'Application' });
mountNomRoutes({ base: 'classification-article', table: 'classification_article', label: 'Classification article' });
mountNomRoutes({ base: 'chef-produit',           table: 'chef_produit',           label: 'Chef produit' });
mountNomRoutes({ base: 'das',                    table: 'das',                    label: 'DAS' });
mountNomRoutes({ base: 'departement',            table: 'departement',            label: 'Département' });

/* Nouvelles tables "label" */
mountLabelRoutes({ base: 'unite-achat',          table: 'unite_achat',            label: 'Unité d\'achat' });
mountLabelRoutes({ base: 'unite-vente',          table: 'unite_vente',            label: 'Unité de vente' });

/* Code comptable (code + nom) */
mountCodeComptableRoutes();

/* ==================== START ==================== */
app.listen(3000, () => console.log('✅ Serveur backend prêt sur http://localhost:3000'));
