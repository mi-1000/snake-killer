<?php
$con = new mysqli("mysql-mi-1000.alwaysdata.net", "mi-1000_snake", "8Z&NlIwgTrh9#Z9*fg*CVTQhBCy04&&#5qSbqwZj", "mi-1000_snake-killer", "3306");

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