function iniciarSesion(event) {
    event.preventDefault(); // Previene el envío del formulario

    // Capturar los valores de los campos
    const username = document.getElementById('username').value;
    const password = document.getElementById('contraseña').value;

    // Validar los datos (ejemplo básico)
    if (username === '' || password === '') {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const data = {
        username,
        password
    };

    // Realizar la solicitud POST usando Fetch
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Inicio de sesión exitoso');
            window.location.href = 'Usuarios.html';
            return response.json();
        }
        alert('Nombre de usuario o contraseña incorrectos');
        throw new Error('Error en la solicitud: ' + response.statusText);
    })
    .catch(error => {
        console.error('Error:', error);
    });

}

document.querySelector('form').addEventListener('submit', iniciarSesion);