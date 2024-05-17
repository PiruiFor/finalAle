document.addEventListener('DOMContentLoaded', cargarEmpleados)

function cargarEmpleados() {
    fetch('http://localhost:3000/empleados')
    .then(response => response.json())
    .then(data => {
        const empleadosTabla = document.getElementById('empleadosTabla');
        empleadosTabla.innerHTML = ''; // Limpiar cualquier dato existente
        data.forEach(empleado => {
            const tr = document.createElement('tr');
            const fechaNacimiento = new Date(empleado.fecha_nacimiento);
            const año = fechaNacimiento.getFullYear();
            const mes = fechaNacimiento.getMonth() + 1; 
            const dia = fechaNacimiento.getDate();
            const fechaFormateada = `${año}-${mes < 10 ? '0' + mes : mes}-${dia < 10 ? '0' + dia : dia}`;
            tr.innerHTML = `
                <td>${empleado.id_empleado}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.apellidos}</td>
                <td>${empleado.sexo}</td>
                <td>${fechaFormateada}</td>
                <td>${empleado.telefonos}</td>
                <td>${empleado.correo}</td>
                <td>${empleado.nombre_puesto}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick='eliminarEmpleado(${empleado.id_empleado})'>Eliminar</button>
                    <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editarEmpleadoModal" onclick='llenarFormulario(
                        ${empleado.id_empleado}, "${empleado.nombres}", "${empleado.apellidos}", "${empleado.telefonos}",
                        "${empleado.correo}", "${empleado.nombre_puesto}",
                    )'>Editar</button>
                </td>
            `;
            empleadosTabla.appendChild(tr);
        });
    })
    .catch(error => console.error('Error al obtener los empleados:', error));
};


function llenarFormulario(id_empleado, nombres, apellidos, telefonos, correo, nombre_puesto) {
    document.getElementById('id_empleado').value = id_empleado;
    document.getElementById('nombreEditar').value = nombres; 
    document.getElementById('apellidoEditar').value = apellidos;
    document.getElementById('telefonoEditar').value = telefonos;
    document.getElementById('correoEditar').value = correo;
    document.getElementById('id_puestoEditar').value = nombre_puesto;
}

function registrarEmpleado(event) {
    event.preventDefault();

     // Capturar los valores de los campos
     const nombre = document.getElementById('nombre').value;
     const apellido = document.getElementById('apellido').value;
     const sexo = document.getElementById('sexo').value;
     const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;
     const telefonos = document.getElementById('telefonos').value;
     const correo = document.getElementById('correo').value;
     const id_puesto = document.getElementById('id_puesto').value;
 
     const data = {
        nombre,
        apellido,
        sexo,
        fecha_nacimiento,
        telefonos,
        correo,
        id_puesto
     }

        // Realizar la solicitud POST usando Fetch
    fetch('http://localhost:3000/empleados', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Empleado registrado exitosamente');
            window.location.reload();
            return response.json();
        }
        alert('Error al registrar el empleado');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editarEmpleado(event) {
    event.preventDefault();
    const id_empleado = document.getElementById('id_empleado').value;
    const nombreEditar = document.getElementById('nombreEditar').value;
    const apellidoEditar = document.getElementById('apellidoEditar').value;
    const telefonoEditar = document.getElementById('telefonoEditar').value;
    const correoEditar = document.getElementById('correoEditar').value;
    const id_puestoEditar = document.getElementById('id_puestoEditar').value;

    const data = {
        nombreEditar,
        apellidoEditar,
        telefonoEditar,
        correoEditar,
        id_puestoEditar
    };

    fetch(`http://localhost:3000/empleados/${id_empleado}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Empleado editado exitosamente!');
            window.location.reload();
            return response.json();
        }
        alert('Error al editar el empleado');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function eliminarEmpleado(id_empleado){
    fetch(`http://localhost:3000/empleados/${id_empleado}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Empleado eliminado exitosamente!');
            window.location.reload();
            return response.json();
            
        }
        alert('Error al eliminar el empleado');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.getElementById('editarEmpleadoForm').addEventListener('submit', editarEmpleado);
document.getElementById('addEmpleadoForm').addEventListener('submit', registrarEmpleado);