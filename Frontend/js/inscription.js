
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inscription-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nom = document.getElementById('nom').value;
            const prenom = document.getElementById('prenom').value;
            const email = document.getElementById('email').value;
            const cours = document.getElementById('cours').value;

            // Gestion des fichiers
            const documentIdentiteFile = document.getElementById('document-identite').files[0];
            const documentMedicalFile = document.getElementById('document-medical').files[0];
            const documentPhotoFile = document.getElementById('document-photo').files[0];

            try {
                const registrationData = {
                    nom: nom,
                    prenom: prenom,
                    email: email,
                    cours: cours,
                    status: 'En attente'
                };

                if (documentIdentiteFile) {
                    const identiteRef = ref(storage, 'registrations/identite/' + documentIdentiteFile.name);
                    await uploadBytes(identiteRef, documentIdentiteFile);
                    registrationData.documentIdentiteURL = await getDownloadURL(identiteRef);
                }

                if (documentMedicalFile) {
                    const medicalRef = ref(storage, 'registrations/medical/' + documentMedicalFile.name);
                    await uploadBytes(medicalRef, documentMedicalFile);
                    registrationData.documentMedicalURL = await getDownloadURL(medicalRef);
                }

                if (documentPhotoFile) {
                    const photoRef = ref(storage, 'registrations/photo/' + documentPhotoFile.name);
                    await uploadBytes(photoRef, documentPhotoFile);
                    registrationData.documentPhotoURL = await getDownloadURL(photoRef);
                }

                await addDoc(collection(db, 'registrations'), registrationData);
                alert('Inscription envoyée avec succès !');
                form.reset();
            } catch (error) {
                console.error('Erreur lors de l\'envoi de l\'inscription : ', error);
                alert('Une erreur est survenue lors de l\'envoi de votre inscription.');
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    setupDropZone('drop-zone-identite', 'document-identite', 'preview-identite');
    setupDropZone('drop-zone-medical', 'document-medical', 'preview-medical');
    setupDropZone('drop-zone-photo', 'document-photo', 'preview-photo');
});

function setupDropZone(dropZoneId, inputId, previewId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            handleFilePreview(files[0], preview);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFilePreview(e.target.files[0], preview);
        }
    });
}

function handleFilePreview(file, previewElement) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewElement.innerHTML = `<img src="${e.target.result}" alt="Prévisualisation de l'image" style="max-width: 200px;">`;
    };
    reader.readAsDataURL(file);
}
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('open');
    });
});
