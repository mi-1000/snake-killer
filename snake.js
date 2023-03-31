/**
 * L2 MIASHS - Web avancé - TD2 - Mars 2023
 * 
 * @author Émile
 */

var grille; // Le tableau 2D contenant les cases
var serpent; // Le serpent à déplacer
var ennemis = []; // Les serpents ennemis
var thread, threadEnnemis; // Le thread principal du jeu et celui des serpents ennemis
var tailleQueue = 5, tailleEnnemis = 5; // La taille de la queue du serpent et des ennemis
var score; // Le score du joueur
const lignes = 30, colonnes = 40; // Le nombre de lignes et de colonnes
const GAUCHE = 37, HAUT = 38, DROITE = 39, BAS = 40; // Les constantes correspondant aux codes des touches

window.addEventListener("load", () => {
    construireGrille();
    dessiner();
    window.addEventListener("keydown", (e) => {
        serpent.setDirection(e.keyCode);
    });
});

/**
 * Construit la grille
 */
function construireGrille() {
    var zone_jeu = document.getElementById("zonejeu");
    grille = [];

    for (let i = 0; i < colonnes; i++) {
        grille[i] = [];
    }

    for (let i = 0; i < lignes; i++) {
        for (let j = 0; j < colonnes; j++) {
            let cellule = document.createElement("div");
            cellule.classList.add("case")
            zone_jeu.appendChild(cellule);
            grille[i][j] = cellule;
        }
    }

    // Arrondissement des bords de la zone de jeu
    grille[0][0].style.borderTopLeftRadius = "50%";
    grille[0][colonnes - 1].style.borderTopRightRadius = "50%";
    grille[lignes - 1][0].style.borderBottomLeftRadius = "50%";
    grille[lignes - 1][colonnes - 1].style.borderBottomRightRadius = "50%";

}

/**
 * Classe du serpent
 */
class Serpent {
    tete;
    queue;
    direction;

    /**
     * Constructeur du serpent
     * 
     * @param {Number} x - La coordonnée x de l'emplacement initial de la tête
     * @param {Number} y - La coordonnée y de l'emplacement initial de la tête
     */
    constructor(x, y) {
        this.tete = [x, y];
        this.queue = [];
        this.direction = Math.floor(Math.random() * 4 + 37); // Direction entre 37 et 40
        let taille = tailleQueue;
        if (serpent !== undefined) { taille = tailleEnnemis };
        for (let i = 0; i < taille; i++) {
            switch (this.direction) {
                case GAUCHE:
                    this.queue[i] = [x, y + i + 1];
                    break;
                case DROITE:
                    this.queue[i] = [x, y - i - 1];
                    break;
                case HAUT:
                    this.queue[i] = [x + i + 1, y];
                    break;
                case BAS:
                    this.queue[i] = [x - i - 1, y];
                    break;
                default: break;
            }
        }
    }

    /**
     * @returns {Number} La direction
     */
    getDirection() {
        return this.direction;
    }

    /**
     * Met à jour la direction
     * 
     * @param {Number} d - La direction, comprise entre 37 et 40 inclus
     */
    setDirection(d) {
        if (typeof d === "number" && [GAUCHE, DROITE, HAUT, BAS].includes(d)) {
            if (d != oppose(this.direction)) {
                this.direction = d;
            }
        }
    }
}

/**
 * Dessine la zone de jeu
 */
function dessiner() {
    document.querySelectorAll(".case").forEach(caseGrille => {
        caseGrille.style.backgroundColor = "#070707";
    });

    try {

        dessinerSerpent(serpent, "#00ff00", "#00ff0088");

        ennemis.forEach(ennemi => {
            dessinerSerpent(ennemi, "#ff0000", "#ff000088");
        });

    } catch (e) {

    }
}

/**
 * Dessine un serpent
 * 
 * @param {Serpent} serpent - Le serpent à dessiner
 * @param {String} couleurTete - La couleur de la tête
 * @param {String} couleurQueue - La couleur de la queue
 */
function dessinerSerpent(serpent, couleurTete, couleurQueue) {
    if (grille[serpent.tete[0]][serpent.tete[1]]) {
        let tete = grille[serpent.tete[0]][serpent.tete[1]];
        tete.style.backgroundColor = couleurTete;
    } else { }
    serpent.queue.forEach(caseQueue => {
        let x = caseQueue[0];
        let y = caseQueue[1];
        let div = grille[x][y];
        div.style.backgroundColor = couleurQueue;
    });
}

/**
 * Déplace le serpent
 * 
 * @param {Serpent} serpent - Le serpent à déplacer
 */
function deplacer(serpent) {
    let direction = serpent.direction;

    for (let n = serpent.queue.length - 1; n > 0; n--) {
        serpent.queue[n][0] = serpent.queue[n - 1][0];
        serpent.queue[n][1] = serpent.queue[n - 1][1];
    }

    serpent.queue[0][0] = serpent.tete[0];
    serpent.queue[0][1] = serpent.tete[1];

    if (direction == GAUCHE) {
        serpent.tete[1]--;
    }
    else if (direction == HAUT) {
        serpent.tete[0]--;
    }
    else if (direction == DROITE) {
        serpent.tete[1]++;
    }
    else if (direction == BAS) {
        serpent.tete[0]++;
    }
}

/**
 * Met à jour la grille
 */
function majGrille() {
    deplacer(serpent);

    ennemis.forEach(ennemi => {
        changerDirection(ennemi);
        if (mord(serpent, ennemi)) {
            supprimerSerpent(ennemi);
            incrementerScore();
            incrementerTailleQueue();
        }
        if (ennemi.tete[0] <= 0 || ennemi.tete[0] >= lignes - 1 || ennemi.tete[1] <= 0 || ennemi.tete[1] >= colonnes - 1) {
            supprimerSerpent(ennemi);
        } // On supprime les serpents ennemis qui atteignent le bord de la grille
    });

    if (serpentMort()) {
        afficherWrapper();
        afficherBoutons();
        clearInterval(thread);
        enregistrerScore();
    } // On arrête le jeu si le serpent meurt

    dessiner();

}

/**
 * @returns true si le serpent est mort, false sinon
 */
function serpentMort() {
    let a = false;
    try {
        a = serpent.tete[0] < 0 || serpent.tete[0] > lignes - 1 || serpent.tete[1] < 0 || serpent.tete[1] > colonnes - 1;
    } catch (e) {

    }
    for (let i = 0; i < ennemis.length; i++) {
        if (mord(ennemis[i], serpent)) {
            return true;
        }
    }
    return a;
}

/**
 * Ajoute un serpent ennemi
 */
function ajouterEnnemi() {
    let x;
    let y;
    let queue = serpent.queue;
    let longueurQueue = queue.length;
    let trouve = false;
    do {
        x = Math.floor(Math.random() * lignes);
        y = Math.floor(Math.random() * colonnes);
        for (let i = 0; i < longueurQueue; i++) {
            if (queue[i][0] === x && queue[i][1] === y) {
                trouve = true;
                break;
            }
        }
    } while (trouve); // Vérifie que le serpent ennemi n'apparaîtra pas sur l'une des cases de la queue du serpent
    let serpentEnnemi = new Serpent(x, y);
    ennemis.push(serpentEnnemi);
}

/**
 * Change la direction du serpent aléatoirement avec une probabilité de 0,1
 * 
 * @param {Serpent} serpent - Le serpent ennemi
 */
function changerDirection(serpent) {
    let nbAleatoire = Math.floor(Math.random() * 10);
    let direction = serpent.direction;
    if (nbAleatoire == 5) { // Évènement qui a 10 % de chances de se produire
        let nouvelleDirection = direction;
        do {
            nouvelleDirection = Math.floor(Math.random() * 4 + 37);
        } while (nouvelleDirection == direction || nouvelleDirection == oppose(direction));
        serpent.direction = nouvelleDirection;
    }
    deplacer(serpent);
}

/**
 * Retourne l'opposé de la direction passée en paramètre
 * 
 * @param {Number} direction - La direction
 * @returns {Number} La direction opposée
 */
function oppose(direction) {
    switch (direction) {
        case GAUCHE:
            return DROITE;
        case DROITE:
            return GAUCHE;
        case HAUT:
            return BAS;
        case BAS:
            return HAUT;
        default:
            return direction;
    }
}

/**
 * Supprime un serpent de la zone de jeu
 * 
 * @param {Serpent} serpent - Le serpent ennemi à supprimer
 */
function supprimerSerpent(serpent) {
    try {
        ennemis = ennemis.filter((ennemi) => { return ennemi !== serpent; });
    } catch (e) {

    }
}

/**
 * Vérifie si le premier serpent mord le second
 * 
 * @param {Serpent} s1 - Le premier serpent
 * @param {Serpent} s2 - Le deuxième serpent
 * 
 * @returns true si "s1" mord "s2", false sinon
 */
function mord(s1, s2) {
    // s2.queue.forEach(a => { if (a[0] == s1.tete[0] && a[1] == s1.tete[1]) { return true; } });
    for (let i = 0; i < s2.queue.length; i++) {
        if (s2.queue[i][0] === s1.tete[0] && s2.queue[i][1] === s1.tete[1]) {
            return true;
        }
    }
    return false;
}

/**
 * Incrémente le score du joueur
 */
function incrementerScore() {
    score++;
    document.getElementById("score").innerHTML = "" + score;
}

/**
 * Réinitialise le jeu
 */
function reinitialiserJeu() {
    clearInterval(thread);
    clearInterval(threadEnnemis);

    cacherWrapper();
    cacherBoutons();

    serpent = new Serpent(14, 19);
    ennemis = [];
    tailleQueue = 5;
    tailleEnnemis = 5;
    score = 0;
    document.getElementById("score").innerHTML = score;

    thread = setInterval(() => {
        majGrille();
    }, 80); // Le serpent se déplace à intervalles réguliers (de 80 ms)
    threadEnnemis = setInterval(() => {
        ajouterEnnemi();
    }, 750); // On ajoute un serpent ennemi toutes les 750 ms

}

/**
 * Affiche le panneau d'arrière-plan des boutons
 */
function afficherWrapper() {
    document.getElementById("wrapperBoutonJouer").style.visibility = "visible";
}

/**
 * Cache le panneau d'arrière-plan des boutons
 */
function cacherWrapper() {
    document.getElementById("wrapperBoutonJouer").style.visibility = "hidden";
}

/**
 * Affiche les boutons du menu
 */
function afficherBoutons() {
    document.getElementById("boutonJouer").style.visibility = "visible";
    document.getElementById("boutonClassement").style.visibility = "visible";
}

/**
 * Cache les boutons du menu
 */
function cacherBoutons() {
    document.getElementById("boutonJouer").style.visibility = "hidden";
    document.getElementById("boutonClassement").style.visibility = "hidden";
}

/**
 * Incrémente la taille de la queue
 */
function incrementerTailleQueue() {
    let dernierSegment = serpent.queue[serpent.queue.length - 1]; // Dernier segment de la queue
    let nouveauSegment;

    switch (serpent.direction) {
        case GAUCHE:
            nouveauSegment = [dernierSegment[0], dernierSegment[1] - 1];
            break;
        case DROITE:
            nouveauSegment = [dernierSegment[0], dernierSegment[1] + 1];
            break;
        case HAUT:
            nouveauSegment = [dernierSegment[0] - 1, dernierSegment[1]];
            break;
        case BAS:
            nouveauSegment = [dernierSegment[0] + 1, dernierSegment[1]];
            break;
        default:
            break;
    }

    serpent.queue.push(nouveauSegment);

}

/**
 * Enregistre le score du joueur
 */
function enregistrerScore() {
    let donnees = [];
    let joueur = {};

    joueur.nom = prompt("Score : " + score + ". Entrez votre nom pour enregistrer votre score : ");
    joueur.score = score;
    const date = new Date();
    let jour = date.getDate();
    let mois = date.getMonth() + 1;
    let annee = date.getFullYear();
    let heure = date.getHours();
    let minutes = date.getMinutes();
    let secondes = date.getSeconds();
    joueur.timestamp = `${annee}-${formaterDate(mois)}-${formaterDate(jour)} ${formaterDate(heure)}:${formaterDate(minutes)}:${formaterDate(secondes)}`;

    donnees.push(joueur);

    ajouterBDD(donnees, "./connexion.php");
}

/**
 * Formate la date au format SQL
 * 
 * @param {Number} nombre - Le nombre à formater
 * @returns {String} Le nombre formaté
 */
function formaterDate(nombre) {
    if (nombre < 10) {
        return "0" + nombre;
    } return nombre;
}

/**
 * Envoie des données à la base de données via une requête AJAX
 * 
 * @param {Array} donnees - Le tableau associatif contenant les données à envoyer
 * @param {String} chemin - Le chemin (relatif) d'accès au fichier PHP effectuant le traitement
 */
function ajouterBDD(donnees, chemin) {
    $.ajax({
        url: chemin,
        method: "post",
        data: { donnees: JSON.stringify(donnees) },
        success: function (res) {
            console.log(res);
        }
    });
}

/**
 * Récupère les résultats de la requête effectuée sur la base de données
 * 
 * @param {String} chemin - Le chemin (relatif) d'accès au fichier PHP effectuant le traitement
 * @returns {Promise} La promesse contenant le tableau associatif contenant les données récupérées
 */
async function recupererBDD(chemin) {
    return new Promise(resolve => {
        $.get(chemin).done(function (resultat) {
            resolve(JSON.parse(resultat));
        });
    });
}


/**
 * Renvoie le classement sous forme de tableau
 * 
 * @param {String} chemin - Le chemin (relatif) d'accès au fichier PHP effectuant le traitement
 * @returns {HTMLTableElement} - Le tableau contenant les résultats
 */
async function getClassement(chemin) {
    let donnees = await recupererBDD(chemin);

    let tableau = document.createElement("table");
    tableau.id = "tableauClassement";

    let caption = document.createElement("caption");
    caption.innerHTML = "Meilleurs scores";
    tableau.appendChild(caption);

    let titres = document.createElement("th");
    tableau.appendChild(titres);

    let titre1 = document.createElement("td");
    titre1.innerHTML = "N°";
    titres.appendChild(titre1);

    let titre2 = document.createElement("td");
    titre2.innerHTML = "Joueur";
    titres.appendChild(titre2);

    let titre3 = document.createElement("td");
    titre3.innerHTML = "Score";
    titres.appendChild(titre3);

    let titre4 = document.createElement("td");
    titre4.innerHTML = "Date";
    titres.appendChild(titre4);

    for (let i = 0; i < donnees.length; i++) {
        let ligne = document.createElement("tr");
        tableau.appendChild(ligne);

        let cellule1 = document.createElement("td");
        cellule1.innerHTML = (i + 1) + "";
        ligne.appendChild(cellule1);

        let cellule2 = document.createElement("td");
        cellule2.innerHTML = donnees[i]["nom"];
        ligne.appendChild(cellule2);

        let cellule3 = document.createElement("td");
        cellule3.innerHTML = donnees[i]["score"];
        ligne.appendChild(cellule3);

        let cellule4 = document.createElement("td");
        let timestamp = new Date(donnees[i]["date"]);
        let jour = timestamp.getDate();
        let mois = timestamp.getMonth() + 1;
        let annee = timestamp.getFullYear();
        let dateFormatee = jour + '/' + mois + '/' + annee;
        cellule4.innerHTML = dateFormatee;
        ligne.appendChild(cellule4);
    }
    return tableau;
}

/**
 * Affiche le classement
 */
async function afficherClassement() {
    document.getElementById("boutonJouer").style.visibility = "hidden";
    document.getElementById("boutonClassement").style.visibility = "hidden";
    let tableau = await getClassement("./classement.php");
    document.getElementById("wrapperBoutonJouer").appendChild(tableau);
    let croix = document.createElement("div");
    croix.innerHTML = "x";
    croix.classList.add("croix");
    croix.addEventListener("click", (e) => {
        document.getElementById("wrapperBoutonJouer").removeChild(croix);
        document.getElementById("wrapperBoutonJouer").removeChild(tableau);
        document.getElementById("boutonJouer").style.visibility = "visible";
        document.getElementById("boutonClassement").style.visibility = "visible";
    });
    croix.addEventListener("mouseenter", (e)=> {
       croix.innerHTML = "Fermer x";
    });
    croix.addEventListener("mouseleave", (e) => {
       croix.innerHTML = "x";
    });
    document.getElementById("wrapperBoutonJouer").appendChild(croix);
}