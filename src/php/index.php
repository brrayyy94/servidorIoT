<!DOCTYPE html>
<html>

<head>
    <title>CaliDatos</title>
</head>

<body>
    <?php
    if (isset($_POST['enviar'])) {
        $login = $_POST['login'];
        $password = $_POST['pass'];
        if ($login == "admin" && $password == "1234") {
            session_start();
            $_SESSION['usuario'] = $login;
            header("Location: pagina1.php");
        } else {
            session_start();
            $_SESSION['usuario'] = "";
            header("Location: index.php");
        }
    } else {
        ?>
        <br>
        <h1>CALI DATOS</h1>
        <h2>INGRESO</h2>
        <form action="index.php" method="POST">
            LOGIN: <br>
            <input type="text" name="login" width="50"><br><br>
            PASSWORD: <br>
            <input type="password" name="pass" width="50"><br><br>
            <input type="submit" name="enviar" value="ENVIAR">
        </form>
    <?php } ?>
</body>

</html>