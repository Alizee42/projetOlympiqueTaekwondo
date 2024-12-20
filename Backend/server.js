const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const path = require('path');  // Ajout du module path pour la gestion des chemins
const multer = require('multer');  // Import de multer
const app = express();
const port = 3001;

// Connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Votre mot de passe MySQL
  database: 'taekwondo'
});

// Clé secrète pour signer le JWT
const JWT_SECRET = 'votre_clé_secrète';

// Connexion à la base de données
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Middleware pour parser le corps des requêtes JSON
app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS) depuis le dossier 'Frontend'
app.use(express.static(path.join(__dirname, '../Frontend')));

// Route pour inscrire un nouvel utilisateur
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'email existe déjà
  connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'email:', err);  // Log de l'erreur de la requête SELECT
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'L\'email existe déjà' });
    }

    try {
      // Hasher le mot de passe avant de le sauvegarder
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Mot de passe hashé:', hashedPassword); // Log pour vérifier le mot de passe hashé

      // Ajouter l'utilisateur à la base de données
      connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, results) => {
        if (err) {
          console.error('Erreur lors de l\'insertion de l\'utilisateur:', err);  // Log de l'erreur d'insertion
          return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
        }

        console.log('Utilisateur ajouté:', results);  // Log du résultat de l'insertion
        res.status(201).json({ message: 'Utilisateur créé avec succès' });
      });
    } catch (error) {
      console.error('Erreur lors du hash du mot de passe:', error);  // Log de l'erreur pendant le hash
      return res.status(500).json({ error: 'Erreur serveur lors du hash du mot de passe' });
    }
  });
});

// Route pour connecter un utilisateur
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe
  connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    const user = results[0];

    // Vérifier si le mot de passe est correct
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la comparaison du mot de passe' });
      }

      if (!isMatch) {
        return res.status(400).json({ error: 'Mot de passe incorrect' });
      }

      // Générer un token JWT
      const payload = { id: user.id, email: user.email };
      const token = jwt.encode(payload, JWT_SECRET);

      res.status(200).json({ message: 'Connexion réussie', token });
    });
  });
});

// Route pour vérifier l'authentification d'un utilisateur
app.post('/verify', (req, res) => {
  const { token } = req.body;

  try {
    // Décoder le token JWT
    const decoded = jwt.decode(token, JWT_SECRET);
    res.status(200).json({ message: 'Token valide', decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
});
// Route pour obtenir la liste des enseignants
app.get('/admin/teachers', (req, res) => {
  connection.query('SELECT * FROM teachers', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des enseignants:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ teachers: results });
  });
});
 // Configuration de Multer pour gérer les fichiers téléchargés pour les enseignants
const teacherStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dossier où les fichiers seront stockés
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Renommer le fichier pour éviter les conflits (ajout d'un timestamp)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Gestionnaire d'upload pour les enseignants
const upload = multer({ storage: teacherStorage });


// Route pour ajouter un enseignant
app.post('/admin/teachers', upload.single('photo'), (req, res) => {
  const { name, level, bio } = req.body;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Insérer l'enseignant dans la base de données
  const query = 'INSERT INTO teachers (name, level, bio, photo) VALUES (?, ?, ?, ?)';
  connection.query(query, [name, level, bio, photoUrl], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de l\'enseignant:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({ message: 'Enseignant ajouté avec succès', teacherId: results.insertId, photoUrl });
  });
});

// Route pour supprimer un enseignant
app.delete('/admin/teachers/:id', (req, res) => {
  const teacherId = parseInt(req.params.id);

  // Supprimer l'enseignant de la base de données
  const query = 'DELETE FROM teachers WHERE id = ?';
  connection.query(query, [teacherId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression de l\'enseignant:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({ message: 'Enseignant supprimé avec succès' });
  });
});
// Route pour éditer un enseignant
app.put('/admin/teachers/:id', (req, res) => {
  const teacherId = parseInt(req.params.id);
  const { name, level, bio } = req.body;

  const query = 'UPDATE teachers SET name = ?, level = ?, bio = ? WHERE id = ?';
  connection.query(query, [name, level, bio, teacherId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'enseignant:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({ message: 'Enseignant mis à jour avec succès' });
  });
});

// Route pour ajouter une actualité
app.post('/admin/news', (req, res) => {
  const { title, content, extra_content, category, isFeatured, imageUrl } = req.body;

  // Vérification des données reçues
  if (!title || !content) {
    return res.status(400).json({ error: 'Le titre et le contenu sont obligatoires.' });
  }

  // Exécuter la requête SQL directement
  connection.query(
    'INSERT INTO news (title, content, extra_content, category, is_featured, image_path) VALUES (?, ?, ?, ?, ?, ?)',
    [title, content, extra_content, category, isFeatured, imageUrl],
    (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'insertion de l\'actualité:', err);
        return res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout de l\'actualité.' });
      }

      // Réponse avec l'actualité ajoutée
      res.status(201).json({
        message: 'Actualité ajoutée avec succès.',
        news: {
          id: result.insertId,
          title,
          content,
          extra_content,
          category,
          isFeatured,
          imageUrl,
          date: new Date().toISOString() // Génère une date au format ISO
        }
      });
    }
  );
});
// Route pour obtenir toutes les actualités
app.get('/admin/news', (req, res) => {
  connection.query('SELECT * FROM news', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des actualités:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ news: results });
  });
});

// Route pour obtenir une actualité par son ID
app.get('/admin/news/:id', (req, res) => {
  const newsId = parseInt(req.params.id);

  connection.query('SELECT * FROM news WHERE id = ?', [newsId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'actualité:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }

    res.json({ news: results[0] });
  });
});

// Route pour éditer une actualité
app.put('/admin/news/:id', (req, res) => {
  const newsId = parseInt(req.params.id);
  const { title, content, date } = req.body;

  const query = 'UPDATE news SET title = ?, content = ?, date = ? WHERE id = ?';
  connection.query(query, [title, content, date, newsId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'actualité:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({ message: 'Actualité mise à jour avec succès' });
  });
});

// Route pour supprimer une actualité
app.delete('/admin/news/:id', (req, res) => {
  const newsId = parseInt(req.params.id);

  const query = 'DELETE FROM news WHERE id = ?';
  connection.query(query, [newsId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression de l\'actualité:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({ message: 'Actualité supprimée avec succès' });
  });
});
 
/// Configuration de Multer pour gérer les fichiers téléchargés pour la galerie
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dossier où les fichiers seront stockés
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Renommer le fichier pour éviter les conflits (ajout d'un timestamp)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Gestionnaire d'upload pour la galerie
const uploadGallery = multer({ storage: galleryStorage });

// Route pour ajouter une photo dans la galerie
app.post('/admin/gallery', uploadGallery.single('photo'), (req, res) => {
  const { title, description } = req.body;
  const photoUrl = req.file ? `/uploads/gallery${req.file.filename}` : null;

  if (!photoUrl) {
    return res.status(400).json({ error: 'Aucune photo téléchargée.' });
  }

  // Insertion dans la table gallery
  const query = 'INSERT INTO gallery (title, description, storagePath) VALUES (?, ?, ?)';
  connection.query(query, [title, description, photoUrl], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de la photo dans la galerie:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(201).json({
      message: 'Photo ajoutée avec succès',
      photo: { id: results.insertId, title, description, storagePath: photoUrl }
    });
  });
});

// Route pour récupérer toutes les photos de la galerie
app.get('/admin/gallery', (req, res) => {
  connection.query('SELECT * FROM gallery', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des photos:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ gallery: results });
  });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

