<!DOCTYPE html>
<html>

<head>
    <title>calidatos/pagina1.php</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>
    <?php
        session_start();
        $us = $_SESSION['usuario'];
        if ($us == "") {
            header("Location: index.php");
        }
    ?>
    <h1>CALI DATOS</h1>
    <h2>Datos de distancia ultrasonido</h2>
    <table border="2px">
        <tr>
            <th>ID</th>
            <th>ID NODO</th>
            <th>DISTANCIA</th>
            <th>FECHA</th>
        </tr>
        <?php
            $url_rest = "http://localhost:3000/datosUltrasonido";
            $curl = curl_init($url_rest);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            $respuesta = curl_exec($curl);
            if ($respuesta === false) {
                curl_close($curl);
                die("Error...");
            }
            //curl_close($curl); //echo $respuesta; 
            $resp = json_decode($respuesta);
            if ($resp === null || !is_array($resp)) {
                // La respuesta no pudo ser decodificada correctamente o no es un array
                // Aquí puedes manejar el error de acuerdo a tus necesidades
                die("Error al decodificar la respuesta JSON o respuesta no válida.");
            }
            $tam = count($resp);
            for ($i = 0; $i < $tam; $i++) {
                $j = $resp[$i];
                $id = $j->id;
                $idnodo = $j->idnodo;
                $distancia = $j->distancia;
                $fechahora = $j->fechahora;
                echo "<tr><td>$id</td><td>$idnodo</td><td>$distancia</td><td>$fechahora</td></tr>";
            }
        ?>
    </table>
    <script type="text/javascript">
        window.respJson = <?php echo json_encode($respuesta); ?>;
        // Justo aquí estamos pasando la variable ----^ 
    </script>
    <canvas id="grafica" width="50" height="10"></canvas>
    <script src="script-ultrasonido.js"></script>
    <a href="pagina1.php">Volver</a><br>
    <a href="logout.php">Cerrar sesión</a>
</body>

</html>