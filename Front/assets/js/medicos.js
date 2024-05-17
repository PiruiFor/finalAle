document.addEventListener('DOMContentLoaded', cargarMedicos)
    
function cargarMedicos() { 
    fetch('http://localhost:3000/medicos')
    .then(response => response.json())
    .then(data => {
        const medicosTabla = document.getElementById('medicosTabla');
        medicosTabla.innerHTML = ''; // Limpiar cualquier dato existente
        data.forEach(medico => {
            const tr = document.createElement('tr');
            const fechaNacimiento = new Date(medico.fecha_nacimiento);
            const año = fechaNacimiento.getFullYear();
            const mes = fechaNacimiento.getMonth() + 1; 
            const dia = fechaNacimiento.getDate();
            const fechaFormateada = `${año}-${mes < 10 ? '0' + mes : mes}-${dia < 10 ? '0' + dia : dia}`;
            tr.innerHTML = `
                <td>${medico.id_medico}</td>
                <td>${medico.nombres}</td>
                <td>${medico.apellidos}</td>
                <td>${medico.sexo}</td>
                <td>${fechaFormateada}</td>
                <td>${medico.telefonos}</td>
                <td>${medico.correo}</td>
                <td>${medico.tipo_medico}</td>
                <td>${medico.especialidad}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick='eliminarMedicos(${medico.id_medico})'>Eliminar</button>
                    <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editarMedicoModal" onclick='llenarFormulario(
                    ${medico.id_medico}, "${medico.nombres}","${medico.apellidos}", "${medico.telefonos}", "${medico.correo}",
                    "${medico.tipo_medico}", "${medico.especialidad}"
                    )'>Editar</button>
                </td>
            `;
            medicosTabla.appendChild(tr);
        });
    })
    .catch(error => console.error('Error al obtener los medicos:', error));
}


function llenarFormulario(id_medico, nombres, apellidos, telefonos, correo, tipo_medico, especialidad) {
    document.getElementById('id_medico').value = id_medico;
    document.getElementById('nombreEditar').value = nombres; 
    document.getElementById('apellidoEditar').value = apellidos;
    document.getElementById('telefonoEditar').value = telefonos;
    document.getElementById('correoEditar').value = correo;
    document.getElementById('tipoMedicoEditar').value = tipo_medico;
    document.getElementById('id_especialidadEditar').value = especialidad;
}


function registrarMedicos(event) {
    event.preventDefault();

     // Capturar los valores de los campos
     const nombre = document.getElementById('nombre').value;
     const apellido = document.getElementById('apellido').value;
     const sexo = document.getElementById('sexo').value;
     const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;
     const telefonos = document.getElementById('telefonos').value;
     const correo = document.getElementById('correo').value;
     const tipo_medico = document.getElementById('tipo_medico').value;
     const especialidad = document.getElementById('especialidad').value;
 

     const data = {
        nombre,
        apellido,
        sexo,
        fecha_nacimiento,
        telefonos,
        correo,
        tipo_medico,
        especialidad
     }

        // Realizar la solicitud POST usando Fetch
    fetch('http://localhost:3000/medicos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Médico registrado exitosamente');
            window.location.reload();
            return response.json();
        }
        alert('Error al registrar el médico');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editarMedicos(event) {
    event.preventDefault();
    const id_medico = document.getElementById('id_medico').value;
    const nombreEditar = document.getElementById('nombreEditar').value;
    const apellidoEditar = document.getElementById('apellidoEditar').value;
    const telefonoEditar = document.getElementById('telefonoEditar').value;
    const correoEditar = document.getElementById('correoEditar').value;
    const tipo_medicoEditar = document.getElementById('tipo_medicoEditar').value;
    const id_especialidad = document.getElementById('id_especialidadEditar').value;

    const data = {
        nombreEditar,
        apellidoEditar,
        telefonoEditar,
        correoEditar,
        tipo_medicoEditar,
        id_especialidad
    };

    fetch(`http://localhost:3000/medicos/${id_medico}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Médico editado exitosamente!');
            window.location.reload();
            return response.json();
        }
        alert('Error al editar el médico');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function eliminarMedicos(id_medico){
    fetch(`http://localhost:3000/medicos/${id_medico}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Médico eliminado exitosamente!');
            window.location.reload();
            return response.json();
            
        }
        alert('Error al eliminar el médico');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.getElementById('editarMedicoForm').addEventListener('submit', editarMedicos);
document.getElementById('addMedicoForm').addEventListener('submit', registrarMedicos);