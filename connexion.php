<?php
$con = new mysqli("URL", "Nom d'utilisateur", "MDP", "BDD", "3306");

$donnees = json_decode($_POST['donnees'], true);
if (json_last_error() == JSON_ERROR_NONE) {
    $nom = ($donnees[0]['nom']);
    $score = ($donnees[0]['score']);
    $timestamp = ($donnees[0]['timestamp']);

    $stmt = $con->prepare("INSERT INTO `scores` VALUES(?, ?, ?)");
    $stmt->bind_param("sis", $nom, $score, $timestamp);

    $stmt->execute();

    $stmt->close();
}

$con->close();
