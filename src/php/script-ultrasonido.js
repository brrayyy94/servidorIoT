var datos = window.respJson;
json1 = JSON.parse(datos.toString());
// Obtener una referencia al elemento canvas del DOM
const $grafica = document.querySelector("#grafica");
// Las etiquetas son las que van en el eje X.
const etiquetas = [];
// Podemos tener varios conjuntos de datos. Comencemos con uno

const datosUltrasonido = {
  label: "datos de distancia",
  data: [], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas
  backgroundColor: "blue", // Color de fondo
  borderColor: "blue", // Color del borde
  borderWidth: 1, // Ancho del borde
};
for (let i = 0; i < json1.length; i++) {
  etiquetas.push(json1[i].fechahora);
  datosUltrasonido.data.push(json1[i].distancia);
}
new Chart($grafica, {
  type: "line", // Tipo de gráfica
  data: {
    labels: etiquetas,
    datasets: [datosUltrasonido],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            max: 50,
          },
        },
      ],
    },
  },
});
