import { auth } from './js/firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { db } from './firebase-config.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    function handleFileSelect(event, dropZoneId, fileTextId, previewId) {
        event.preventDefault();
        
        const files = event.type === 'drop' ? event.dataTransfer.files : event.target.files;
        const dropZone = document.getElementById(dropZoneId);
        const fileText = document.getElementById(fileTextId);
        const preview = document.getElementById(previewId);

        dropZone.classList.remove('dragover');

        if (files.length) {
            const file = files[0];  // Assure qu'on prend le premier fichier seulement
            fileText.textContent = file.name;
            
            // Efface l'aperçu précédent
            preview.innerHTML = '';

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = function() {
                    URL.revokeObjectURL(img.src); // Libère la mémoire après le chargement de l'image
                };
                preview.appendChild(img);
            } else {
                const fileName = document.createElement('div');
                fileName.className = 'file-name';
                fileName.textContent = file.name;
                preview.appendChild(fileName);
            }
        }
    }

    // Initialisation des événements pour chaque document
    ['document-identite', 'document-medical', 'document-photo'].forEach(function(id) {
        const dropZone = document.getElementById('drop-zone-' + id.split('-')[1]);
        const inputFile = document.getElementById(id);

        dropZone.addEventListener('dragover', function(event) {
            event.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', function(event) {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', function(event) {
            handleFileSelect(event, dropZone.id, 'file-text-' + id.split('-')[1], 'preview-' + id.split('-')[1]);
        });

        dropZone.addEventListener('click', function() {
            inputFile.click();
        });

        inputFile.addEventListener('change', function(event) {
            handleFileSelect(event, dropZone.id, 'file-text-' + id.split('-')[1], 'preview-' + id.split('-')[1]);
        });
    });
});
  // Fonction pour les onglets de tarifs
  function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Affiche le premier onglet par défaut
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('.tab-content').style.display = "block";
});
document.querySelector('.back-to-top').addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.getElementById("hamburger");
    const navbar = document.getElementById("navbar");

    hamburger.addEventListener("click", function() {
        navbar.classList.toggle("active");
    });
});

 
    const loginForm = document.querySelector('.connexion-form');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Connexion réussie:', userCredential.user);
            window.location.href = 'administration.html'; // Redirection vers la page d'administration après la connexion
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            alert('Connexion échouée. Veuillez vérifier vos informations.');
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('nav ul');
    
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('open');
        });
    });
    