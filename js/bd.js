var bd;
var cajaDatos;
var searchPerson;
function iniciarBD() {
  // Asignar la caja de datos
  cajaDatos = document.getElementById("lista-personas");

  // Asignar la caja de búsqueda y asignar el evento de búsqueda
  searchPerson = document.getElementById("search-person");
  var btnSearch = document.getElementById("btn-buscar");
  btnSearch.addEventListener("click", buscarPersona);

  // Asignar el evento al botón de agregar
  var btnAgregar = document.getElementById("btn-guardar");
  btnAgregar.addEventListener("click", agregarPersona);

  //Abrir la base de datos
  var solicitud = window.indexedDB.open("miBaseDatos,", "2");
  //Asignar los eventos
  solicitud.addEventListener("error", mostrarError);
  solicitud.addEventListener("success", iniciar);
  solicitud.addEventListener("upgradeneeded", crearBD);
}

/**
 * Muestra un mensaje de error
 * @param {*} evento
 */
function mostrarError(evento) {
  alert("Error: " + evento.target.error.code + " - " + evento.target.error.message);
}

/**
 * Inicia la base de datos, creacion o apertura de la misma
 * @param {*} evento
 * @returns {void}
 */
function iniciar(evento) {
  bd = evento.target.result;
  mostrarPersonas();
}

/**
 * Crea la base de datos
 * @param {*} evento
 */
function crearBD(evento) {
  // Obtener la base de datos
  var basedatos = evento.target.result;
  // Crear el almacen de objetos y la llave primaria
  var almacen = basedatos.createObjectStore("Personas", { keyPath: "docId" });
  // Crear el índice para buscar por nombre
  almacen.createIndex("Buscar persona", "nombre", { unique: false });
}

function agregarPersona() {
  // Obtener los datos de los campos
  var docId = document.getElementById("id").value;
  var nombre = document.getElementById("nombre").value;
  var edad = document.getElementById("edad").value;

  // Crear el objeto persona
  var persona = {
    docId: docId,
    nombre: nombre.toUpperCase(),
    edad: edad,
  };

  // Iniciar la transacción, leer y escribir en el almacen especificado
  // type: readwrite | readonly
  var transaccion = bd.transaction(["Personas"], "readwrite");

  // Obtener el almacen de objetos
  var almacen = transaccion.objectStore("Personas");

  // Agregar la persona
  almacen.add(persona);

  // Mostrar las personas en la lista una vez agregada
  transaccion.addEventListener("complete", mostrarPersonas);
  // Limpiar los campos
  document.getElementById("id").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("edad").value = "";
}

/**
 * Muestra las personas en la lista
 */
function mostrarPersonas() {
  // Limpiar la lista
  cajaDatos.innerHTML = "";
  // Iniciar la transacción, solo lectura
  var transaccion = bd.transaction(["Personas"], "readonly");
  // Obtener el almacen de objetos
  var almacen = transaccion.objectStore("Personas");
  // Obtener el cursor
  var cursor = almacen.openCursor();
  // Asignar el evento para mostrar la lista
  cursor.addEventListener("success", mostrarLista);
}

/**
 * Setea la lista de personas en la caja de datos
 * @param {*} evento
 */
function mostrarLista(evento) {
  // Obtener el evento del cursor
  var cursor = evento.target.result;
  // Si hay datos, mostrarlos
  if (cursor) {
    // Agregar los datos a la caja de datos
    cajaDatos.innerHTML +=
      "<div>" +
      "<span>" +
      cursor.value.docId +
      "</span> " +
      "<span>" +
      cursor.value.nombre +
      "</span> " +
      "<span>" +
      cursor.value.edad +
      "</span> " +
      "<input type='button' class='btn-editar'  value='Editar' onclick='editarPersona(" +
      cursor.value.docId +
      ")'>" +
      "<input type='button' class='btn-eliminar'  value='Eliminar' onclick='eliminarPersona(" +
      cursor.value.docId +
      ")'>" +
      "</div>";
    // Continuar con el cursor
    cursor.continue();
  }
}

function editarPersona(docId) {
  console.log(docId);
  // Iniciar la transacción, solo lectura
  var transaccion = bd.transaction(["Personas"], "readonly");
  // Obtener el almacen de objetos
  var almacen = transaccion.objectStore("Personas");
  // Obtener el objeto por la llave primaria
  var id = String(docId);
  var solicitud = almacen.get(id);
  // Asignar el evento para mostrar la persona
  solicitud.addEventListener("success", setDatos);
}

function setDatos(evento) {
  var persona = evento.target.result;
  console.log(persona);
  document.getElementById("id").value = persona.docId;
  document.getElementById("nombre").value = persona.nombre;
  document.getElementById("edad").value = persona.edad;
  //Asignar el evento al botón de agregar
  var btnAgregar = document.querySelector(".padre-boton");
  btnAgregar.innerHTML =
    "<input type='button' id='btn-act' value='Actualizar' onclick='actualizarPersona()'>";
}

function actualizarPersona() {
  // Obtener los datos de los campos
  var docId = document.getElementById("id").value;
  var nombre = document.getElementById("nombre").value;
  var edad = document.getElementById("edad").value;

  // Crear el objeto persona
  var persona = {
    docId: docId,
    nombre: nombre.toUpperCase(),
    edad: edad,
  };

  // Iniciar la transacción, leer y escribir en el almacen especificado
  // type: readwrite | readonly
  var transaccion = bd.transaction(["Personas"], "readwrite");

  // Obtener el almacen de objetos
  var almacen = transaccion.objectStore("Personas");

  // Agregar la persona
  almacen.put(persona);

  // Mostrar las personas en la lista una vez agregada
  transaccion.addEventListener("complete", mostrarPersonas);
  // Limpiar los campos
  document.getElementById("id").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("edad").value = "";
  var btnAgregar = document.querySelector(".padre-boton");
  btnAgregar.innerHTML =
    "<input type='button' id='btn-guardar' value='Guardar' onclick='agregarPersona()'>";
}

function buscarPersona() {
  searchPerson.innerHTML = "";
  // Obtener el valor de la caja de búsqueda
  var nombre = document.getElementById("ip-buscar").value;
  console.log(nombre);
  // Iniciar la transacción, solo lectura
  var transaccion = bd.transaction(["Personas"], "readonly");
  // Obtener el almacen de objetos
  var almacen = transaccion.objectStore("Personas");
  // Obtener el índice
  var indice = almacen.index("Buscar persona");
  var rango = IDBKeyRange.only(nombre.toUpperCase());
  // Obtener el cursor
  var cursor = indice.openCursor(rango);
  // Asignar el evento para mostrar la lista
  cursor.addEventListener("success", function (evento) {
    var cursor = evento.target.result;
    if (cursor) {
      searchPerson.innerHTML +=
        "<div>" +
        "<span>" +
        cursor.value.docId +
        "</span> " +
        "<span>" +
        cursor.value.nombre +
        "</span> " +
        "<span>" +
        cursor.value.edad +
        "</span> " +
        "</div>";

      cursor.continue();
    }
  });
  document.getElementById("ip-buscar").value = "";
}
function eliminarPersona(docId) {
  // Iniciar la transacción, leer y escribir en el almacen especificado
  // type: readwrite | readonly
  var transaccion = bd.transaction(["Personas"], "readwrite");
  var almacen = transaccion.objectStore("Personas");
  // Eliminar la persona
  var id = String(docId);
  almacen.delete(id);
  // Mostrar las personas en la lista una vez eliminada
  transaccion.addEventListener("complete", mostrarPersonas);
}

/**
 * Cargar la base de datos
 */
window.addEventListener("load", iniciarBD);
