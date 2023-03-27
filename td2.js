/**
 * L2 MIASHS - Web avancé - TD2 - Mars 2023
 * 
 * @author Émile
 */

var grille; // Le tableau 2D contenant les cases
var serpent; // Le serpent à déplacer
var ennemis = []; // Les serpents ennemis
var thread; // Le thread principal du jeu
const lignes = 30, colonnes = 40; // Le nombre de lignes et de colonnes
const tailleQueue = 5, tailleEnnemis = 5; // La taille de la queue du serpent et des ennemis
const GAUCHE = 37, HAUT = 38, DROITE = 39, BAS = 40; // Les constantes correspondant aux codes des touches

window.addEventListener("load", () => {
    construireGrille();
    serpent = new Serpent(14, 19);
    dessiner();

    thread = setInterval(() => { // TODO fonction lancerPartie() qui peut démarrer le thread suivant un évènement
        document.addEventListener("keydown", e => {
            if (e.keyCode == 27) { clearInterval(thread) }
        });
        /// À supprimer au-dessus
        majGrille();
    }, 80); // Le serpent se déplace à intervalles réguliers (de 80 ms)
    setInterval(() => {
        ajouterEnnemi();
    }, 750); // On ajoute un serpent ennemi toutes les 750 ms
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
    })

    if (serpentMort()) {
        clearInterval(thread);
    } // On arrête le jeu si le serpent touche le bord
    ennemis.forEach(serpent => {
        if (serpent.tete[0] <= 0 || serpent.tete[0] >= lignes - 1 || serpent.tete[1] <= 0 || serpent.tete[1] >= colonnes - 1) {
            supprimerSerpent(serpent);
        }
    }); // On supprime les serpents ennemis qui atteignent le bord de la grille

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
    let b = false;
    ennemis.forEach(ennemi => {
        console.log(mord(ennemi, serpent));
        if (mord(ennemi, serpent)) {
            return true;
        }
    });
    return a || b;
}

/**
 * Ajoute un serpent ennemi
 */
function ajouterEnnemi() {
    let x = Math.floor(Math.random() * lignes);
    let y = Math.floor(Math.random() * colonnes);
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
    /**
     * 
     * 
    s2.queue.forEach(a => { console.log(a[0], s1.tete[0], "**", a[1], s1.tete[1]); if (a[0] === s1.tete[0] && a[1] && s1.tete[1]) { return true; } });
    return s2.tete === s1.tete;
    */
    for (var k = 0; k < s2.tete.length; k++){
		if (s1.tete[0] == s2.tete[k][0] && s1.tete[1] == s2.tete[k][1]){
			console.log("TRUE");
            return true;
		}
	}
	return false;
}