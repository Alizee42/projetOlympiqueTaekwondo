// fichier: galerie.js

import { db } from './firebase-config.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.querySelector('.masonry-gallery');

    function loadGallery() {
        const galleryCollection = collection(db, 'gallery');
        onSnapshot(galleryCollection, (snapshot) => {
            galleryContainer.innerHTML = ''; // Vider la galerie avant de la remplir
            snapshot.forEach(doc => {
                const imageData = doc.data();
                const galleryItem = document.createElement('div');
                galleryItem.className = 'masonry-item';
                galleryItem.innerHTML = `
                    <img src="${imageData.url}" alt="Image de la galerie">
                    <div class="image-description">
                        <h3>${imageData.title || 'Image de la galerie'}</h3>
                        <p>${imageData.description || ''}</p>
                    </div>
                `;
                galleryContainer.appendChild(galleryItem);
            });

            if (!snapshot.size) {
                galleryContainer.innerHTML = '<p>Aucune image à afficher pour le moment.</p>';
            }
        }, (error) => {
            console.error("Erreur lors du chargement des images :", error);
            galleryContainer.innerHTML = '<p>Erreur lors du chargement des images.</p>';
        });
    }

    loadGallery();
});
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('open');
    });
});
