// Variables pour stocker les données récupérées
let works = [];
let categories = [];


// Fetch les travaux depuis l'API et les stocke dans la variable globale works
// Puis affiche les travaux
fetch("http://localhost:5678/api/works")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        works = data;
        displayProjects();
    })
    .catch(error => {
        console.log("There was a problem with the fetch operation:", error.message);
        
    });

// Fetch les catégories depuis l'API et les affiche sous forme de boutons
fetch("http://localhost:5678/api/categories")
    .then(response => response.json())
    .then(data => {
        categories = data;
        const filtersButtonDiv = document.querySelector('.filters');
        
        // Bouton "Tous"
        const allButton = document.createElement('button');
        allButton.className = "filter__btn btn__all filter__btn--active";
        allButton.textContent = "Tous";
        allButton.setAttribute('data-id', "all");
        filtersButtonDiv.appendChild(allButton);

        // Bouton pour chaque catégorie
        categories.forEach(category => {
            const filterButton = document.createElement('button');
            filterButton.className = `filter__btn btn__${category.name.replace(" ", "_")}`;
            filterButton.textContent = category.name;
            filterButton.setAttribute('data-id', category.id);
            filtersButtonDiv.appendChild(filterButton);
        });

        // Ajout des catégories comme options pour le menu déroulant
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            document.getElementById('projectCategory').appendChild(option);
        });
    });


// Ajoute un écouteur d'événement pour filtrer les projets selon la catégorie choisie
document.querySelector('.filters').addEventListener('click', (e) => {
    if (e.target.className.includes('filter__btn')) {
        // Désactivation du bouton précédemment actif
        document.querySelectorAll('.filter__btn').forEach(btn => btn.classList.remove('filter__btn--active'));
        
        // Activation du bouton actuel
        e.target.classList.add('filter__btn--active');
        // Récupération de l'ID de la catégorie
        const categoryId = e.target.getAttribute('data-id'); 
        // Affichage des projets filtrés
        displayProjects(categoryId);
    }
});

// Fonction pour afficher les projets en fonction d'une catégorie spécifique ou de tous les projets
function displayProjects(categoryId = null) {
    const galerieDiv = document.querySelector('.gallery');

    galerieDiv.innerHTML = '';

    
    const filteredWorks = (categoryId === "all" || categoryId === null) 
            ? works 
            : works.filter(work => work.category.id == categoryId);

    filteredWorks.forEach(projet => {
        const figure = document.createElement('figure');
        
        const img = document.createElement('img');
        img.src = projet.imageUrl;
        img.alt = projet.title;

        const figcaption = document.createElement('figcaption');
        figcaption.innerText = projet.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        galerieDiv.appendChild(figure);
    });
}


// Configuration du mode édition pour l'administrateur si le token existe
const token = localStorage.getItem("token");
adminPanel();

function adminPanel() {
    const headerElement = document.querySelector("header");
    const asideElements = document.querySelectorAll(".admin__modifer");
    const loginLogoutElement = document.querySelector(".loginOrLogout");   
    const filtersDiv = document.querySelector('.filters'); 

    if (token !== null) {
        asideElements.forEach(aside => aside.style.display = "flex");
        loginLogoutElement.textContent = "logout";
        headerElement.style.paddingTop = "59px";
        // Cacher les boutons de filtres
        filtersDiv.style.display = "none"; 
    } else {
        asideElements.forEach(aside => aside.style.display = "none");
        loginLogoutElement.textContent = "login";
        headerElement.style.paddingTop = "0";
    }
    // Ajout de l'écouteur d'événement pour "logout"
    loginLogoutElement.addEventListener('click', function() {
        if (loginLogoutElement.textContent === "logout") {
            localStorage.removeItem("token");
            window.location.href = "login.html";        
        }        
    });
}

// Gestion des modales pour ajouter ou éditer un projet
let modal = null;
const focusableSelector = 'button, a input ,textarea';
let focusables = []

const openModal = function(e) {
    modaleProjets(); 
    e.preventDefault();
    
      // Force la modal à revenir à la vue "Galerie photo"
    const title = document.getElementById('titlemodal');
    if (title.innerText !== 'Galerie photo') {
        toggleModalContent();
    }
    modal = document.querySelector(e.target.getAttribute('href'));
    focusables = Array.from(modal.querySelectorAll(focusableSelector))
    modal.style.display = null;
    modal.querySelector('.fa-xmark').addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');      
    modal.addEventListener('click', function(e) {
        if (e.target === modal) { 
            closeModal(e);
        }
    })
}


function closeModal(e) {
    if (modal) {
        modal.style.display = "none";
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal.removeEventListener('click', closeModal);
        modal.querySelector('.fa-xmark').removeEventListener('click', closeModal);
        modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
        modal = null;
    }
}



const stopPropagation = function(e) {
    if (e.target.classList.contains('js-modal-stop') && !e.target.classList.contains('js-delete-work')) {
        e.stopPropagation();   
    }
}


const focusInModal = function (e) {
    e.preventDefault();    
    let index = focusables.findIndex(f=> f === modal.querySelector(':focus'))
    if (e.shiftKey === true) {
        index--
    } else {
    index++
}
    if (index >= focusables.length) {
        index = 0
    }
    if (index < 0) {
        index = focusables.length - 1
    }
    focusables[index].focus()
}

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', openModal);
});

window.addEventListener('keydown', function(e) {
    if (e.key === "Escape" || e.key === "esc") {
    closeModal(e);
    }
    if (e.key === "Tab" && modal !== null) {
        focusInModal(e)
    }    
})


// Récupère et affiche tous les projets dans la modal en mode édition

async function modaleProjets() {        
    const modaleSectionProjets = document.querySelector(".js-admin-projets");
    if (!modaleSectionProjets) return; // Sortie si l'élément n'existe pas

    modaleSectionProjets.innerHTML = '';

    const response = await fetch('http://localhost:5678/api/works'); 
    const dataAdmin = await response.json();

    for (let i = 0; i < dataAdmin.length; i++) {
        const div = document.createElement("div");
        div.classList.add("gallery__item-modale");
        modaleSectionProjets.appendChild(div);
        
        const img = document.createElement("img");
        img.src = dataAdmin[i].imageUrl;
        img.alt = dataAdmin[i].title;
        div.appendChild(img);

        if (i === 0) {
            const iconArrow = document.createElement("i");
            div.appendChild(iconArrow);
        }

        const icon = document.createElement("i");
        icon.classList.add(dataAdmin[i].id, "js-delete-work");
        icon.classList.add("fa-solid", "fa-trash-can"); 
        div.appendChild(icon);

        const a = document.createElement("a");
        a.innerHTML = "Éditer";
        div.appendChild(a);
    }

}

// Bascule entre l'affichage de la galerie photo et le formulaire d'ajout d'une photo
function toggleModalContent() {
    const title = document.getElementById('titlemodal');
    const galleryContent = document.querySelector('.js-admin-projets');
    const addProjectForm = document.getElementById('addProjectForm');
    const addLink = document.querySelector('.js-modale-projet');
    const deleteGallery = document.querySelector('.btn-clear-admin');
    const backButton = document.querySelector('.js-back-modal');
    const closeButton = document.querySelector('.select-barre');
    

    if (title.innerText === 'Galerie photo') {
        title.innerText = 'Ajout photo';
        
        closeButton.style.gridTemplateColumns= '1fr 1fr';
        backButton.style.display = 'grid';
        galleryContent.style.display = 'none';
        addProjectForm.style.display = 'grid';
        addLink.style.display = 'none';
        deleteGallery.style.display = 'none';
        
    } else {
        title.innerText = 'Galerie photo';
        closeButton.style.gridTemplateColumns= '1fr';
        backButton.style.display = 'none';
        galleryContent.style.display = 'grid';
        addProjectForm.style.display = 'none';
        addLink.style.display = 'grid';
        deleteGallery.style.display = 'grid';
        
    }
}

document.querySelector('.fa-arrow-left').addEventListener('click', toggleModalContent);
document.querySelector('.js-modale-projet').addEventListener('click', function(e) {
    e.preventDefault();
    toggleModalContent();    
});

// Supprime toutes les photos de la galerie
async function deleteAllGallery() {
    for (let work of works) {
        await fetch(`http://localhost:5678/api/works/${work.id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        works = []; // vider la liste des projets
        displayProjects(); //  rafraîchir la galerie
    }

    // Recharger la modal après suppression
    modaleProjets();
}

document.querySelector('.btn-clear-admin').addEventListener('click', function(e) {
    e.preventDefault();
    deleteAllGallery();
});

// Supprime un projet spécifique lors du clic sur l'icône poubelle
document.addEventListener('click', async function(e) {    
    
    if (e.target.classList.contains('js-delete-work')) {
        e.stopPropagation();  // empêcher la propagation du clic   
        

        const idToDelete = e.target.classList[0];
        
        const response = await fetch(`http://localhost:5678/api/works/${idToDelete}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
                
            }
            
        });

        works = works.filter(work => work.id != idToDelete); // Mise à jour du tableau local
        e.target.parentElement.remove(); // Suppression de l'élément du DOM

        displayProjects(); 
    }
});


// Affiche l'image sélectionnée dans le formulaire avant de l'ajouter
document.querySelector('.projectImage').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        // Une photo a été choisie
        const addImgDiv = document.querySelector('.add-img');

        addImgDiv.style.padding = '0';
        
        // Cacher tous les enfants de la div
        for (let child of addImgDiv.children) {
            child.style.display = 'none';
        }

        // Afficher l'image choisie
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.querySelector('.add-img img') || document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.style.display = 'block'; 
            addImgDiv.insertBefore(imgElement, addImgDiv.firstChild);
        }
        reader.readAsDataURL(this.files[0]);
    }
});



// Fonction pour afficher un projet individuel
function displaySingleProject(projet) {
    const galerieDiv = document.querySelector('.gallery');
    
    const figure = document.createElement('figure');
    
    const img = document.createElement('img');
    img.src = projet.imageUrl;
    img.alt = projet.title;

    const figcaption = document.createElement('figcaption');
    figcaption.innerText = projet.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    galerieDiv.appendChild(figure);
}


document.querySelector('button[type="button"]').addEventListener('click', function() {
    document.getElementById('projectImage').click();
});


categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    document.getElementById('projectCategory').appendChild(option);
});

// Ajouter l'option par défaut
const defaultOption = document.createElement('option');
defaultOption.value = ""; 
defaultOption.selected = true;  
defaultOption.disabled = true; 
defaultOption.hidden = true;  

document.getElementById('projectCategory').insertBefore(defaultOption, document.getElementById('projectCategory').firstChild);



// Poste un nouveau projet à l'API lors de la soumission du formulaire
// ... (le reste de votre code reste inchangé)

// ... (le reste de votre code reste inchangé)

// Supprimez les écouteurs d'événements qui vérifient la validité à chaque modification de champ.
document.querySelector('.projectImage').removeEventListener('change', checkAllFieldsFilled);
document.getElementById('projectTitle').removeEventListener('input', checkAllFieldsFilled);
document.getElementById('projectCategory').removeEventListener('change', checkAllFieldsFilled);

document.getElementById('addProjectForm').addEventListener('submit', function(e) { 
    e.preventDefault();

    if (!checkAllFieldsFilled()) { // Si la fonction retourne "false", cela signifie qu'il y a une erreur
        // Ne faites rien, car le message d'erreur sera déjà affiché par la fonction checkAllFieldsFilled
    } else {
        // Ici, vous pouvez continuer avec le traitement de votre formulaire
        // par exemple, en envoyant les données au serveur si tout est valide.

        // Vous aviez déjà un code pour envoyer le projet à l'API, alors je l'ai inclus ici.
        const imageFile = document.querySelector('.projectImage').files[0];
        const title = document.getElementById('projectTitle').value;
        const category = document.getElementById('projectCategory').value;

        const formData = new FormData();

        formData.append('image', imageFile);
        formData.append('title', title);
        formData.append('category', category);

        fetch("http://localhost:5678/api/works", { 
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData    
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    console.error('Server Error:', errorData);
                    throw new Error('Erreur lors de l\'ajout de la photo');
                });
            }
            return response.json();
        })
        .then(newWork => {
            works.push(newWork);  // Ajoutez le nouveau projet à la liste
            displaySingleProject(newWork);  // Affichez le nouveau projet
            modaleProjets();
            closeModal(e);  // Fermez la modal après l'ajout réussi
        })
        .catch(error => {
            console.error("Erreur lors de l'ajout de la photo:", error);
        });
    }
});

// Initialisation
const validateButton = document.querySelector('.button-add');

// Validation des champs du formulaire avant soumission
function checkAllFieldsFilled(e) {
    const imageInput = document.querySelector('.projectImage');
    const title = document.getElementById('projectTitle').value.trim();
    const category = document.getElementById('projectCategory').value.trim();
    let errorMessage = '';

    // Si l'événement provient du champ de catégorie ou si ce n'est pas un événement
    if (!e || e.target.id === 'projectCategory') {
        if (!category) {
            errorMessage = 'Merci de choisir une catégorie.';
        }
    }
    
    
    // Si l'événement provient du champ de titre ou si ce n'est pas un événement
    if (!e || e.target.id === 'projectTitle') {
        if (!title) {
            errorMessage = 'Merci d\'ajouter un titre.';
        }
    }

    // Si l'événement provient du champ d'image ou si ce n'est pas un événement
    if (!e || e.target === imageInput) {
        if (!imageInput.files || imageInput.files.length === 0) {
            errorMessage = 'Merci d\'ajouter une photo.';
        }
    }

    const errorElement = document.getElementById('formError');
    errorElement.textContent = errorMessage;
    
    if (errorMessage) {
        validateButton.disabled = true;
        validateButton.style.backgroundColor = '#A7A7A7'; 
        return false;
    } else {
        validateButton.disabled = false;
        validateButton.style.background = '#1D6154'; 
        return true;
    }
}



document.getElementById('addProjectForm').addEventListener('submit', function(e) { 
    e.preventDefault();
    
    if (!checkAllFieldsFilled()) { // Si la fonction retourne "false", cela signifie qu'il y a une erreur
        e.preventDefault(); // Empêche la soumission
    }
});

// Vérifiez la validité du formulaire à chaque modification de champ
document.querySelector('.projectImage').addEventListener('change', checkAllFieldsFilled);
document.getElementById('projectTitle').addEventListener('input', checkAllFieldsFilled);
document.getElementById('projectCategory').addEventListener('change', checkAllFieldsFilled);



