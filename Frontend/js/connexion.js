const apiUrl = 'http://localhost:3001';  // Remplace par l'URL de ton backend si elle est différente

// Fonction pour connecter un utilisateur
async function connecterUtilisateur(email, password) {
  try {
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Connexion réussie:', data);
      // Stocke le token dans le localStorage ou autre endroit sécurisé
      localStorage.setItem('token', data.token);
      // Rediriger vers une autre page ou effectuer une action après la connexion réussie
      window.location.href = './administration.html';  // Exemple de redirection après connexion
    } else {
      console.error('Erreur lors de la connexion:', data.error);
      alert("Identifiants incorrects.");
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    alert("Une erreur est survenue lors de la connexion.");
  }
}

// Ajoute un écouteur d'événements sur le formulaire pour intercepter la soumission
document.getElementById('login-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Empêche le rechargement de la page à la soumission du formulaire

  // Récupérer les données du formulaire
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Appeler la fonction de connexion
  connecterUtilisateur(email, password);
});
