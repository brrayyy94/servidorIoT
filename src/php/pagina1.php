<!DOCTYPE html>
<html>

<head>
    <title>calidatos/pagina1.php</title>
</head>

<body> <?php session_start();
$us = $_SESSION['usuario'];
if ($us == "") {
    header("Location: index.php");
} ?>
    <h1>CALI DATOS</h1>
    <h2>Seleccione una variable:</h2>
    <h3><a href="temperatura.php">TEMPERATURA</a></h3>
    <h3><a href="humedad.php">HUMEDAD</a></h3>
    <h4><a href="logout.php">CERRAR SESION</a></h4>
</body>

</html>