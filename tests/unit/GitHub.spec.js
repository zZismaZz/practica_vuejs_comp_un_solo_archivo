import { expect } from 'chai'
import { shallowMount, mount } from '@vue/test-utils'
import GitHub from '@/components/GitHub.vue'

// Importar paquete fetch para Node: fetch no está incluido en Node.
// Dado que el test se ejecuta en Node y no en el navegador,
// si no se importa no funcionará.
import {fetch, Headers} from 'cross-fetch';

// Se añaden las funciones 'fetch' y 'Headers' para que funcione la aplicación
// (que utiliza ambas funciones) en el entorno de test en Node.
if (!global.fetch) {
    global.fetch = fetch;
    global.Headers = Headers;
}

// Función auxiliar para crear un temporizador de espera
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Componente GitHub', () => {
    it('Comprueba que muestra cuadro de alerta (.alert) con usuario incorrecto', async () => {
        // Usuario para comprobar
        var testuser = 'notexists9873184';
        var wrapper = shallowMount(GitHub);

        // Control de selección de usuario
        expect(wrapper.contains('input'), 'Debe aparecer un campo input para introducir el usuario a buscar.').to.be.true;
        var userInput = wrapper.get('input');

        // Comprobar usuario incorrecto
        userInput.setValue(testuser);
        // Pulsar la tecla ENTER
        userInput.trigger('keydown.enter');
        await timeout(1000); //Esperar un segundo para que se complete la petición

        // Comprobar que aparece etiqueta de error
        expect(wrapper.contains('.alert'), 'Debe aparecer etiqueta de error (.alert) si el usuario no existe en GitHub.').to.be.true;

        // Comprobar que NO aparece componente card
        expect(wrapper.contains('.card'), 'No debe aparecer el componente de tarjeta (.card) si el usuario no existe en GitHub.').to.be.false;

        // Comprobar que NO aparece botón de repositorios
        expect(wrapper.contains('button'), 'No debe aparecer el botón de mostrar repositorios si el usuario no existe en GitHub.').to.be.false;

        // Comprobar que NO aparece una etiqueta de imagen
        expect(wrapper.contains('img'), 'No debe aparecer la etiqueta de imagen si el usuario no existe en GitHub.').to.be.false;
    })

    it('Comprueba que muestra información (imagen, nombre, botón de repositorios) con usuario correcto', async () => {
        // Usuario para comprobar
        var testuser = 'vuejs';
        var testuser_url = 'https://github.com/vuejs';
        var wrapper = shallowMount(GitHub);

        // Control de selección de usuario
        var userInput = wrapper.get('input');

        // Comprobar usuario correcto
        userInput.setValue(testuser);
        userInput.trigger('keydown.enter');
        await timeout(1000); //Esperar un segundo para que se complete la petición

        // Comprobar que NO aparece etiqueta de error
        expect(wrapper.contains('.alert'),'No debe aparecer mensaje de error con usuario correcto.').to.be.false;

        // Comprobar que aparece componente card
        expect(wrapper.contains('.card'), 'Debe aparecer un componente card si el usuario existe en GitHub.').to.be.true;

        // Comprobar que aparece nombre del usuario buscado dentro del componente card
        expect(wrapper.get('.card').text()).to.include(testuser,'Debe aparecer el nombre del usuario en el componente card');

        // Comprobar que aparece botón de repositorios
        expect(wrapper.contains('button'), 'Debe aparecer un botón <button> para mostrar los repositorios del usuario.').to.be.true;

        // Comprobar que aparece el enlace a la URL de GitHub del usuario
        expect(wrapper.contains('a'), 'Debe aparecer un enlace <a> para mostrar la URL de GitHub del usuario.').to.be.true;
        expect(wrapper.get('a').attributes('href')).to.include(testuser_url,'El enlace debe apuntar a la URL del usuario en GitHub');

        // Comprobar que aparece una etiqueta de imagen
        expect(wrapper.contains('img'), 'Debe aparecer una etiqueta <img> para mostrar el avatar del usuario.').to.be.true;
        var imgUser = wrapper.get('img');
        expect(imgUser.attributes('src')).to.equal('https://avatars.githubusercontent.com/u/6128107?v=4','La URL del avatar del usuario no coincide con la que debería ser.');

    })
})

describe('Componente GitHubRepos', () => {
    it('Comprueba que se muestra la lista de repositorios con usuario correcto', async () => {
        // Usuario para comprobar
        var testuser = 'vuejs';
        var wrapper = mount(GitHub);

        // Control de selección de usuario
        var userInput = wrapper.get('input');

        userInput.setValue(testuser);
        userInput.trigger('keydown.enter');
        await timeout(1000); //Esperar un segundo para que se complete la petición

        // Comprobar que todavía NO aparece el componente 'list-group'
        expect(wrapper.contains('.list-group'), 'Inicialmente no debe aparecer el listado de repositorios.').to.be.false;

        // Botón para mostrar repositorios
        var repoButton = wrapper.get('button');
        // Pulsar en botón
        repoButton.trigger('click');
        await timeout(1000); //Esperar un segundo para que se complete la petición

        // Comprobar que aparece el componente 'list-group'
        expect(wrapper.contains('.list-group'), 'Debe aparecer un componente list-group de Bootstrap para mostrar el listado de repositorios del usuario.').to.be.true;

        // Comprobar un repo
        var repoList = wrapper.get('.list-group');
        expect(repoList.contains('a'), 'Debe aparecer un enlace para cada repositorio.').to.be.true;
        expect(repoList.get('a').attributes('href')).to.include('https://github.com/' + testuser, 'El enlace debe apuntar a la URL de GitHub.');
        expect(repoList.contains('.badge'), 'Debe aparecer un componente badge de Bootstrap para mostrar los forks del repositorio.').to.be.true;
        expect(repoList.get('.badge').text(), 'La badge debe mostrar el número de forks.').to.exist;
        expect(repoList.contains('[title]'), 'Debe haber un elemento con atributo title para mostrar la descripción del repositorio.').to.be.true;
        expect(repoList.get('[title]').attributes('title'), 'El contenido del atributo title debe contener la descripción del repositorio.').to.not.be.empty;

    })
})
