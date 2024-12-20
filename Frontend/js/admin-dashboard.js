// Ouvrir la modal
function openModal(modalId, formId, previewId, data = null) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';

    // Réinitialiser le formulaire et la photo de prévisualisation pour l'ajout
    const form = document.getElementById(formId);
    form.reset();
    document.getElementById(previewId).style.display = 'none';

    if (data) {
        // Pré-remplir les champs avec les données
        if (data.title) {
            document.getElementById('news-title').value = data.title;
            document.getElementById('news-content').value = data.content;
            document.getElementById('news-extra-content').value = data.extra_content;
            document.getElementById('news-category').value = data.category;
            document.getElementById('news-is-featured').checked = data.isFeatured;
        }

        if (data.name) {
            document.getElementById('teacher-name').value = data.name;
            document.getElementById('teacher-level').value = data.level;
            document.getElementById('teacher-bio').value = data.bio;
        }

        // Prévisualiser l'image ou photo
        if (data.imageUrl || data.photo) {
            const preview = document.getElementById(previewId);
            preview.src = data.imageUrl || data.photo;
            preview.style.display = 'block';
        }
    }
}


// Fermer la modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Fonction pour envoyer les données du formulaire au serveur
document.getElementById('add-teacher-form').addEventListener('submit', function (e) {
    e.preventDefault();  // Empêcher le rechargement de la page lors de l'envoi du formulaire

    // Récupérer les données du formulaire
    const name = document.getElementById('teacher-name').value;
    const level = document.getElementById('teacher-level').value;
    const bio = document.getElementById('teacher-bio').value;
    const photo = document.getElementById('teacher-photo').files[0];

    // Créer un objet FormData pour envoyer les données, y compris la photo si elle existe
    const formData = new FormData();
    formData.append('name', name);
    formData.append('level', level);
    formData.append('bio', bio);
    if (photo) {
        formData.append('photo', photo);
    }

    // Envoyer les données au serveur avec fetch
    fetch('/admin/teachers', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);  // Afficher un message de succès

            // Ajouter l'enseignant à la liste sans recharger la page
            const newTeacher = `<tr id="teacher-${data.teacherId}">
                <td>${name}</td>
                <td>${level}</td>
                <td>${bio}</td>
                <td><img src="${data.photoUrl}" alt="Photo de l'enseignant" style="max-width: 100px;"></td>
                <td><button onclick="deleteTeacher(${data.teacherId})">Supprimer</button></td>
            </tr>`;
            document.getElementById('teachers-list').insertAdjacentHTML('beforeend', newTeacher);

            // Fermer la modal
            closeModal('add-teacher-modal');
        } else {
            alert('Erreur lors de l\'ajout de l\'enseignant');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur serveur');
    });
});

// Affiche la prévisualisation de la photo
function previewImage(event, previewId) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const imgElement = document.getElementById(previewId);
        imgElement.src = e.target.result;  // Définir la source de l'image à partir du fichier téléchargé
        imgElement.style.display = 'block';  // Afficher l'image
    };
    reader.readAsDataURL(file);  // Lire le fichier et l'afficher en tant qu'URL de données
}

// Charger les enseignants
function loadTeachers() {
    fetch('/admin/teachers')
        .then(response => response.json())
        .then(data => {
            const teachersList = document.getElementById('teachers-list');
            teachersList.innerHTML = '';  // Réinitialiser la liste

            // Vérifier si les enseignants existent et les ajouter à la liste
            if (data.teachers && data.teachers.length > 0) {
                data.teachers.forEach(teacher => {
                    const teacherRow = document.createElement('tr');
                    teacherRow.id = `teacher-${teacher.id}`;  // Ajouter un ID unique pour chaque enseignant
                    teacherRow.innerHTML = `
                        <td>${teacher.name}</td>
                        <td>${teacher.level}</td>
                        <td>${teacher.bio}</td>
                        <td><img src="${teacher.photo}" alt="Photo" style="max-width: 100px;"></td>
                        <td>
                            <button onclick="editTeacher(${teacher.id})">Modifier</button>
                            <button onclick="deleteTeacher(${teacher.id})">Supprimer</button>
                        </td>
                    `;
                    teachersList.appendChild(teacherRow);
                });
            } else {
                teachersList.innerHTML = '<tr><td colspan="5">Aucun enseignant trouvé.</td></tr>';
            }
        })
        .catch(error => console.error('Erreur de chargement des enseignants:', error));
}

// Appeler la fonction pour charger les enseignants au démarrage
loadTeachers();

// Fonction pour supprimer un enseignant
function deleteTeacher(teacherId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
        fetch(`/admin/teachers/${teacherId}`, {
            method: 'DELETE',  // Méthode HTTP pour la suppression
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                // Supprimer la ligne du tableau
                const teacherRow = document.getElementById(`teacher-${teacherId}`);
                if (teacherRow) {
                    teacherRow.remove();  // Supprimer la ligne du tableau
                    alert('Enseignant supprimé avec succès');
                }
            } else {
                alert('Erreur lors de la suppression de l\'enseignant');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de l\'enseignant:', error);
            alert('Erreur serveur');
        });
    }
}

// Fonction pour modifier un enseignant
function editTeacher(teacherId) {
    // Récupérer les données de l'enseignant
    fetch(`/admin/teachers/${teacherId}`)
    .then(response => response.json())
    .then(data => {
        if (data.teacher) {
            // Remplir le formulaire de modification avec les données de l'enseignant
            document.getElementById('teacher-name').value = data.teacher.name;
            document.getElementById('teacher-level').value = data.teacher.level;
            document.getElementById('teacher-bio').value = data.teacher.bio;
            // Prévisualiser l'image actuelle (si elle existe)
            if (data.teacher.photo) {
                const preview = document.getElementById('teacher-photo-preview');
                preview.src = data.teacher.photo;
                preview.style.display = 'block';
            }
            // Ouvrir la modal de modification
            openModal('edit-teacher-modal', 'edit-teacher-form', 'teacher-photo-preview');
            // Ajouter l'événement de soumission du formulaire
            document.getElementById('edit-teacher-form').addEventListener('submit', function (e) {
                e.preventDefault();
                const formData = new FormData();
                formData.append('name', document.getElementById('teacher-name').value);
                formData.append('level', document.getElementById('teacher-level').value);
                formData.append('bio', document.getElementById('teacher-bio').value);
                const photo = document.getElementById('teacher-photo').files[0];
                if (photo) {
                    formData.append('photo', photo);  // Ajouter la photo au FormData
                }

                fetch(`/admin/teachers/${teacherId}`, {
                    method: 'PUT',  // Méthode HTTP pour la mise à jour
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert('Enseignant modifié avec succès');
                        closeModal('edit-teacher-modal');  // Fermer la modal après la modification
                        loadTeachers();  // Recharger la liste des enseignants
                    } else {
                        alert('Erreur lors de la modification de l\'enseignant');
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la modification de l\'enseignant:', error);
                    alert('Erreur serveur');
                });
            });
        }
    })
    .catch(error => {
        console.error('Erreur de récupération des données de l\'enseignant:', error);
        alert('Erreur lors de la récupération des données de l\'enseignant');
    });
}

// Fonction pour ouvrir la modal pour ajouter ou modifier une actualité
function openNewsModal(modalId, formId, previewId, newsData = null) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';

    // Réinitialiser le formulaire pour l'ajout
    const form = document.getElementById(formId);
    form.reset();
    document.getElementById(previewId).style.display = 'none';

    // Si des données sont passées (modification), les pré-remplir
    if (newsData) {
        document.getElementById('news-title').value = newsData.title;
        document.getElementById('news-content').value = newsData.content;
        document.getElementById('news-extra-content').value = newsData.extra_content;
        document.getElementById('news-category').value = newsData.category;
        document.getElementById('news-is-featured').checked = newsData.isFeatured;

        // Prévisualisation de l'image
        if (newsData.imageUrl) {
            const preview = document.getElementById(previewId);
            preview.src = newsData.imageUrl;
            preview.style.display = 'block';
        }
    }
}

// Fonction pour fermer la modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Fonction pour envoyer les données du formulaire d'actualité au serveur
document.getElementById('add-news-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Récupération des données du formulaire
    const title = document.getElementById('news-title').value;
    const content = document.getElementById('news-content').value;
    const extra_content = document.getElementById('news-extra-content').value;
    const category = document.getElementById('news-category').value;
    const isFeatured = document.getElementById('news-is-featured').checked;
    const imageFile = document.getElementById('news-image').files[0];

    // Si une image est sélectionnée, on l'upload
    let imageUrl = null;
    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        // Envoi du fichier image vers le serveur ou Firebase Storage
        fetch('/upload-news-image', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.url) {
                imageUrl = data.url;  // URL de l'image téléchargée
                saveNewsData(imageUrl);
            } else {
                alert('Erreur lors de l\'upload de l\'image');
            }
        })
        .catch(error => {
            console.error('Erreur serveur pour l\'upload de l\'image:', error);
            alert('Erreur serveur');
        });
    } else {
        saveNewsData(null);  // Si pas d'image, on continue sans image
    }

    // Fonction pour envoyer les données au serveur
    function saveNewsData(imageUrl) {
        const newsData = {
            title,
            content,
            extra_content,
            category,
            isFeatured,
            imageUrl: imageUrl || null,  // Utilisation de l'URL de l'image ou null
        };

        // Envoi des données au serveur pour ajout
        fetch('/admin/news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newsData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Actualité ajoutée avec succès');
                loadNews();  // Recharger la liste des actualités
                closeModal('add-news-modal');  // Fermer la modal d'ajout
            } else {
                alert('Erreur lors de l\'ajout de l\'actualité');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Erreur serveur');
        });
    }
});


// Fonction pour charger les actualités
function loadNews() {
    fetch('/admin/news')
        .then(response => response.json())
        .then(data => {
            const newsList = document.getElementById('news-list');
            newsList.innerHTML = '';  // Réinitialiser la liste des actualités

            // Vérifier si des actualités existent
            if (data.news && data.news.length > 0) {
                data.news.forEach(newsItem => {
                    const newsRow = document.createElement('tr');
                    newsRow.id = `news-${newsItem.id}`;
                    newsRow.innerHTML = `
    <td>${newsItem.title || 'Titre non disponible'}</td>
    <td>${newsItem.content || 'Contenu non disponible'}</td>
    <td class="extra-content-cell"> ${newsItem.extra_content || 'Non disponible'}</td>
    <td>${newsItem.category || 'Non spécifiée'}</td>
    <td><img src="${newsItem.image || 'default-image.jpg'}" alt="Image" style="max-width: 100px;"></td>
    <td>
        <button class="edit-button" onclick="editNews('${newsItem.id}')">Modifier</button>
        <button class="delete-button" onclick="deleteNews('${newsItem.id}')">Supprimer</button>
        <button class="set-featured-button" onclick="setAsFeatured('${newsItem.id}')">Définir comme à la une</button>
    </td>
`;

                    newsList.appendChild(newsRow);
                });
            } else {
                newsList.innerHTML = '<tr><td colspan="4">Aucune actualité trouvée.</td></tr>';
            }
        })
        .catch(error => console.error('Erreur de chargement des actualités:', error));
}
loadNews();

// Fonction pour supprimer une actualité
function deleteNews(newsId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
        fetch(`/admin/news/${newsId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Actualité supprimée avec succès');
                loadNews();  // Recharger la liste des actualités
            } else {
                alert('Erreur lors de la suppression de l\'actualité');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de l\'actualité:', error);
            alert('Erreur serveur');
        });
    }
}

