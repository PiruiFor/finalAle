document.addEventListener('DOMContentLoaded', cargarPacientes);

function cargarPacientes() {
    fetch('http://localhost:3000/pacientes')
    .then(response => response.json())
    .then(data => {
        const pacientesTabla = document.getElementById('pacientesTabla');
        pacientesTabla.innerHTML = ''; // Limpiar cualquier dato existente
        data.forEach(paciente => {
            const tr = document.createElement('tr');
            const fechaNacimiento = new Date(paciente.fecha_nacimiento);
            const año = fechaNacimiento.getFullYear();
            const mes = fechaNacimiento.getMonth() + 1; 
            const dia = fechaNacimiento.getDate();
            const fechaFormateada = `${año}-${mes < 10 ? '0' + mes : mes}-${dia < 10 ? '0' + dia : dia}`;
            tr.innerHTML = `
                <td>${paciente.id_paciente}</td>
                <td>${paciente.nombres}</td>
                <td>${paciente.apellidos}</td>
                <td>${paciente.sexo}</td>
                <td>${fechaFormateada}</td>
                <td>${paciente.telefonos}</td>
                <td>${paciente.correo}</td>
                <td>${paciente.id_medico}</td>
                <td>${paciente.informacion_medica}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick='eliminarPaciente(${paciente.id_paciente})'>Eliminar</button>
                    <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editarPacienteModal" onclick='llenarFormulario(
                        ${paciente.id_paciente}, "${paciente.nombres}", "${paciente.apellidos}", "${paciente.telefonos}",
                        "${paciente.correo}", "${paciente.id_medico}", "${paciente.informacion_medica}"
                    )'>Editar</button>
                </td>
            `;
            pacientesTabla.appendChild(tr);
        });
    })
    .catch(error => console.error('Error al obtener los pacientes:', error));
};


function llenarFormulario(id_paciente, nombres, apellidos, telefonos, correo, id_medico, informacion_medica) {
    document.getElementById('id_paciente').value = id_paciente;
    document.getElementById('nombreEditar').value = nombres; 
    document.getElementById('apellidoEditar').value = apellidos;
    document.getElementById('telefonoEditar').value = telefonos;
    document.getElementById('correoEditar').value = correo;
    document.getElementById('id_medicoEditar').value = id_medico;
    document.getElementById('informacion_medicaEditar').value = informacion_medica;
}

function registrarPacientes(event) {
    event.preventDefault();

     // Capturar los valores de los campos
     const nombre = document.getElementById('nombre').value;
     const apellido = document.getElementById('apellido').value;
     const sexo = document.getElementById('sexo').value;
     const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;
     const telefonos = document.getElementById('telefonos').value;
     const correo = document.getElementById('correo').value;
     const id_medico = document.getElementById('id_medico').value;
     const informacion_medica = document.getElementById('informacion_medica').value;
 
     const data = {
        nombre,
        apellido,
        sexo,
        fecha_nacimiento,
        telefonos,
        correo,
        informacion_medica,
        id_medico
     }

        // Realizar la solicitud POST usando Fetch
    fetch('http://localhost:3000/pacientes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Paciente registrado exitosamente');
            window.location.reload();
            return response.json();
        }
        alert('Error al registrar el paciente');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editarPacientes(event){
    event.preventDefault();
    const id_paciente = document.getElementById('id_paciente').value;
    const nombreEditar = document.getElementById('nombreEditar').value;
    const apellidoEditar = document.getElementById('apellidoEditar').value;
    const telefonoEditar = document.getElementById('telefonoEditar').value;
    const correoEditar = document.getElementById('correoEditar').value;
    const id_medicoEditar = document.getElementById('id_medicoEditar').value;
    const informacion_medicaEditar = document.getElementById('informacion_medicaEditar').value;

    const data = {
        nombreEditar,
        apellidoEditar,
        telefonoEditar,
        correoEditar,
        id_medicoEditar,
        informacion_medicaEditar
    }

    fetch(`http://localhost:3000/pacientes/${id_paciente}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Paciente editado exitosamente!');
            window.location.reload();
            return response.json();
        }
        alert('Error al editar el paciente');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function eliminarPaciente(id_paciente){
    fetch(`http://localhost:3000/pacientes/${id_paciente}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Paciente eliminado exitosamente!');
            window.location.reload();
            return response.json();
            
        }
        alert('Error al eliminar el paciente');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.getElementById('addPacienteForm').addEventListener('submit', registrarPacientes);
document.getElementById('editarPacienteForm').addEventListener('submit', editarPacientes);
