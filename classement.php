<?php
$con = new mysqli("mysql-mi-1000.alwaysdata.net", "mi-1000_snake", "8Z&NlIwgTrh9#Z9*fg*CVTQhBCy04&&#5qSbqwZj", "mi-1000_snake-killer", "3306");

if (!$con->connect_error) {
    $requete = "SELECT * FROM `scores` ORDER BY `score` DESC, `timestamp` ASC LIMIT 10";
    $resultat = $con->query($requete);
    if ($resultat->num_rows > 0) {
        $tableau_scores = array();
        while ($ligne = $resultat->fetch_assoc()) {
            $score = array(
                'nom' => $ligne["nom"],
                'score' => $ligne["score"],
                'date' => $ligne["timestamp"]
            );
            $tableau_scores[] = $score;
        }
        echo (json_encode($tableau_scores));
    }
}

$con->close();