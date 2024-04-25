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
    <h3><a href="ultrasonido.php">DISTANCIA</a></h3>
    <h3><a href="infrarrojo.php">INFRAROJO</a></h3>
    <h3><a href="peso.php">INFRAROJO</a></h3>
    <h4><a href="logout.php">CERRAR SESION</a></h4>
</body>

</html>