// Sélection des éléments nécessaires du DOM
const form = document.getElementById("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageError = document.querySelector(".error");

// Ajout d'un gestionnaire d'événement pour gérer la soumission du formulaire
form.addEventListener("submit", async (e) => {
    // Empêche la soumission par défaut du formulaire (rechargement de la page)
    e.preventDefault();

    // Récupère les valeurs saisies par l'utilisateur
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // Tentative de connexion de l'utilisateur avec l'API
        const token = await loginUser(email, password);
        
        // Si la connexion est réussie, stocke le token dans le sessionStorage
        localStorage.setItem("token", token);
        
        // Redirige l'utilisateur vers la page d'accueil
        window.location.href = "./index.html";
    } catch (error) {
        // En cas d'erreur lors de la connexion, affiche un message d'erreur
        messageError.textContent = error.message;
    }
});

// Fonction pour connecter l'utilisateur via l'API
async function loginUser(email, password) {
    // Envoie une demande POST à l'API 
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    // Vérifie si la réponse de l'API est un succès
    if (response.ok) {
        // Si réussi, extrait les données de la réponse et renvoie le token
        const data = await response.json();
        return data.token;
    } else {
        // Si échec, détermine le type d'erreur en fonction du code de statut de la réponse
        switch (response.status) {
            case 401:
                throw new Error("Mot de passe incorrect");
            case 404:
                throw new Error("Utilisateur introuvable");
            default:
                throw new Error("Erreur d'authentification");
        }
    }
}