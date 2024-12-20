import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (newsId) {
        const docRef = doc(db, 'news', newsId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const news = docSnap.data();
            document.getElementById('news-title').textContent = news.title;
            document.getElementById('news-content').innerHTML = news.content;
            if (news.extraContent) {
                document.getElementById('news-extra-content').innerHTML = news.extraContent;
            }
        } else {
            document.getElementById('news-title').textContent = 'Actualité non trouvée';
        }
    } else {
        document.getElementById('news-title').textContent = 'ID d\'actualité manquant dans l\'URL';
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('open');
    });
});
