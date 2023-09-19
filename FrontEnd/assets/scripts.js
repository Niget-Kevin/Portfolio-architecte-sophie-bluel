fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(data => {
    console.table(data);

    const galerieDiv = document.querySelector('.gallery');

    for (const projet of data) {
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

    // Récupérer les catégories
    let categories = new Set();

    for (const projet of data) {
        categories.add(projet.category.name);
    }

    // Mettre à jour la galerie lorsqu'un filtre est appliqué
    document.querySelectorAll('.filter__btn').forEach(button => {
      button.addEventListener('click', function() {
          
          // Récupérer la catégorie sélectionnée en fonction de la classe du bouton
          let selectedCategory;
          if (this.classList.contains('btn__Objects')) {
              selectedCategory = "Objets";
          } else if (this.classList.contains('btn__Apartments')) {
              selectedCategory = "Appartements";
          } else if (this.classList.contains('btn__Hotels')) {
              selectedCategory = "Hotels & restaurants";
          } else {
              selectedCategory = "Tous";
          }
    
          // Vider la galerie
          galerieDiv.innerHTML = '';
    
          for (const projet of data) {
              if (selectedCategory === "Tous" || projet.category.name === selectedCategory) {
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
          }
      });
    });
  })


