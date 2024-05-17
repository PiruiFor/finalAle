document.addEventListener('DOMContentLoaded', cargarUsuarios);

function cargarUsuarios() {
    fetch('http://localhost:3000/register')
        .then(response => response.json())
        .then(data => {
            const usuariosTabla = document.getElementById('usuariosTabla');
            usuariosTabla.innerHTML = ''; // Limpiar cualquier dato existente
            data.forEach(usuario => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${usuario.id_usuario}</td>
                    <td>${usuario.username}</td>
                    <td>${usuario.contraseña}</td>
                    <td>${usuario.id_persona}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick='eliminarUsuario(${usuario.id_usuario})'>Eliminar</button>
                        <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editarUsuarioModal" onclick='llenarFormulario(${usuario.id_usuario}, "${usuario.username}", "${usuario.contraseña}")'>Editar</button>
                    </td>
                `;
                usuariosTabla.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al obtener los usuarios:', error));
}

function llenarFormulario(id_usuario, username, contraseña) {
    document.getElementById('idUsuario').value = id_usuario;
    document.getElementById('usernameEdit').value = username;
    document.getElementById('contraseñaEdit').value = contraseña;
}

function registrarUsuario(event) {
    event.preventDefault(); // Previene el envío del formulario

    // Capturar los valores de los campos
    const username = document.getElementById('username').value;
    const password = document.getElementById('contraseña').value;
    const confirmar = document.getElementById('confirmar').value;
    const id_persona = document.getElementById('persona').value;

    // Validar los datos (ejemplo básico)
    if (username === '' || password === '') {
        alert('Por favor, complete todos los campos.');
        return;
    }

    if (password != confirmar){
        alert('Por favor, revise sus contraseñas.');
    }

    const data = {
        username,
        password,
        confirmar,
        id_persona
    };

    // Realizar la solicitud POST usando Fetch
    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Usuario registrado exitosamente');
            window.location.reload();
            return response.json();
        }
        alert('Error al registrar el usuario');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });

}

function editarUsuario(event){
    event.preventDefault();
    const username = document.getElementById('usernameEdit').value;
    const password = document.getElementById('contraseñaEdit').value;
    const id_usuario = document.getElementById('idUsuario').value;

    const data = {
        username,
        password
    }
    fetch(`http://localhost:3000/register/${id_usuario}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Usuario editado exitosamente!');
            window.location.reload();
            return response.json();
        }
        alert('Error al editar el usuario');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function eliminarUsuario(id_usuario){
    fetch(`http://localhost:3000/register/${id_usuario}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Usuario eliminado exitosamente!');
            window.location.reload();
            return response.json();
            
        }
        alert('Error al eliminar el usuario');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


document.getElementById('addUsuarioForm').addEventListener('submit', registrarUsuario);
document.getElementById('editarUsuarioForm').addEventListener('submit', editarUsuario);