let inputActual = "";

const teclado = document.querySelector(".teclado");

const display = document.getElementById("displayTexto");

console.log("hola");

//================== TECLADO =====================
teclado.addEventListener("click", function (evento) {

    if (inputActual.length < 3) {

        const elementoClickado = evento.target;

        if (elementoClickado.tagName === "BUTTON") {

            const valor = elementoClickado.dataset.valor;

            inputActual += valor;

            display.textContent = inputActual;
        }

    }
})


//================== BORRAR =====================
const btnBorrar = document.getElementById("borrar");

btnBorrar.addEventListener("click", () => {

    inputActual = inputActual.slice(0, -1);

    if (inputActual.length === 0) display.textContent = "---";
    else display.textContent = inputActual;
})


//================== CARGAR PRODUCTOS =====================
async function cargarProductos() {

    const respuesta = await fetch("/api/T_PRODUCTO");

    const productos = await respuesta.json();

    console.log(productos);

    productos.forEach(function (producto) {

        const slot = document.querySelector(`.slot[data-id="${producto.id_producto}"]`)

        if (!slot) return;

        const divProducto = slot.querySelector(".producto");

        const img = document.createElement("img");

        img.src = `/static/imgs/${producto.id_producto}.png`;
        img.alt = producto.d_descripcion;

        img.style.width = "200%";
        img.style.height = "200%";
        img.style.marginLeft = "-50%";
        img.style.objectFit = "contain";

        divProducto.appendChild(img);
    })
}


//================== COMPRAR =====================
async function comprar(id) {

    const respuesta = await fetch("api/comprar", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id })
    })

    if (!respuesta.ok) {
        const error = await respuesta.json();
        display.textContent = error.error;
        return;
    }

    display.textContent = "OK";
}


//================== REPONER =====================
async function reponer(id, cantidad) {

    const respuesta = await fetch("api/reponer", {

        method:"POST",

        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id: id, cantidad: cantidad})
    })

    if (!respuesta.ok) {
        const error = await respuesta.json();
        display.textContent = error.error;
        return;
    }

    display.textContent = "OK";
}


//================== ACEPTAR =====================
const btnAceptar = document.getElementById("aceptar");
let idTemporal = null;
let estadoReponer = 0;

btnAceptar.addEventListener("click", async () => {

    const id = parseInt(inputActual);

    if (!inputActual) return;

    if (btnModoComprar.classList.contains("activo")) {
        comprar(id);
    }
    else {
        if (estadoReponer === 0) {
            idTemporal = parseInt(inputActual);
            display.textContent = "CANT";
            inputActual = "";
            estadoReponer = 1;
            return;
        }

        if (estadoReponer === 1) {
            const cantidad = parseInt(inputActual);

            await reponer(idTemporal, cantidad);

            estadoReponer = 0;
            idTemporal = null;
            inputActual = "";
        }
    }

    await esperar(3000);

    inputActual = "";
    display.textContent = "---";
})


//================== ESPERA JOE =====================
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//================== MODOS =====================
const btnModoReponer = document.getElementById("reponer");

const btnModoComprar = document.getElementById("comprar");

btnModoReponer.addEventListener("click", () => {

    if (btnModoComprar.classList.contains("activo")) {

        btnModoComprar.classList.remove("activo");
        btnModoReponer.classList.add("activo")
    }
})

btnModoComprar.addEventListener("click", () => {

    if (btnModoReponer.classList.contains("activo")) {

        btnModoReponer.classList.remove("activo");
        btnModoComprar.classList.add("activo")
    }
})

cargarProductos();