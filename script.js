/*
 * MODEL ***********************************************************************
 */

class Model {

    constructor() {
        // The state of the model, an array of todo objects, prepopulated with some data
        // O estado do modelo, uma matriz de objetos todo, preenchidos com alguns dados
        this.todos = [
            {id: 1, text: 'Run a marathon', complete: false},
            {id: 2, text: 'Plant a garden', complete: false}
        ];
    }

    // Append a todo to the todos array
    // Anexa um todo ao array de todos
    addTodo(todo) {
        this.todos = [...this.todos, todo];

        this.onTodoListChanged(this.todos);
    }

    // Map through all todos, and replace the text of the todo with the specified id
    // Mapeie todos os todos e substitua o texto do todo pelo id especificado
    editTodo(id, updatedText) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo
        );

        this.onTodoListChanged(this.todos);
    }

    // Filter a todo out of the array by id
    // Filtre um todo do array por id
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);

        this.onTodoListChanged(this.todos);
    }

    // Flip the complete boolean on the specified todo
    // Inverta o booleano completo no todo especificado
    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo
        );

        this.onTodoListChanged(this.todos);
    }

    bindEvents(controller) {
        this.onTodoListChanged = controller.onTodoListChanged;
    }

}




/*
 * VIEW ************************************************************************
 */

class View {

    constructor() {
        // The root element
        // O elemento raiz
        this.app = this.getElement('#root');

        // The title of the app
        // O formulário, com uma entrada [type = "text"] e um botão de envio
        this.title = this.createElement('h1');
        this.title.textContent = 'Todos / A fazer';

        // The form, with a [type="text"] input, and a submit button
        // O formulário, com uma entrada [type = "text"] e um botão de envio
        this.form = this.createElement('form');

        this.input = this.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Add todo / Adicione tarefa';
        this.input.name = 'todo';

        this.submitButton = this.createElement('button');
        this.submitButton.textContent = 'Submit';


        // The visual representation of the todo list
        // A representação visual da lista de tarefas
        this.todoList = this.createElement('ul', 'todo-list');


        // Append the input and submit button to the form
        // Anexe a entrada e envie o botão para o formulário
        this.form.append(this.input, this.submitButton);

        // Append the title, form, and todo list to the app
        // Anexar o título, formulário e lista de tarefas ao aplicativo
        this.app.append(this.title, this.form, this.todoList);

    }

    // Create an element with an optional CSS class
    // Crie um elemento com uma classe CSS opcional
    createElement(tag, className) {
        const element = document.createElement(tag);

        if (className)
            element.classList.add(className);

        return element;
    }

    // Retrieve an element from the DOM
    // Recuperar um elemento do DOM
    getElement(selector) {
        const element = document.querySelector(selector);

        return element;
    }

    get todoText() {
        return this.input.value;
    }

    resetInput() {
        this.input.value = '';
    }

    displayTodos(todos) {
        // Delete all nodes
        // Excluir todos os nós
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild);
        }

        // Show default message
        // Mostrar mensagem padrão
        if (todos.length === 0) {
            const p = this.createElement('p');
            p.textContent = 'Nothing to do! Add a task?';
            this.todoList.append(p);
        } else {

            // Create todo item nodes for each todo in state
            // Criar nós de itens de tarefas para cada tarefa no estado
            todos.forEach(todo => {
                const li = this.createElement('li');
                li.id = todo.id;

                // Each todo item will have a checkbox you can toggle
                // Cada item de trabalho terá uma caixa de seleção que você pode alternar
                const checkbox = this.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = todo.complete;

                // The todo item text will be in a contenteditable span
                // O texto do item todo estará em um span editável de conteúdo
                const span = this.createElement('span');
                span.contentEditable = true;
                span.classList.add('editable');

                // If the todo is complete, it will have a strikethrough
                // Se o todo estiver completo, ele terá um rasurado
                if (todo.complete) {
                    const strike = this.createElement('s');
                    strike.textContent = todo.text;
                    span.append(strike);
                } else {
                    // Otherwise just display the text
                    // Caso contrário, basta exibir o texto
                    span.textContent = todo.text;
                }

                // The todos will also have a delete button
                // O todos também terá um botão delete
                const deleteButton = this.createElement('button', 'delete');
                deleteButton.textContent = 'Delete';
                li.append(checkbox, span, deleteButton);

                // Append nodes to the todo list
                this.todoList.append(li);
            });
        }
    }

    bindEvents(controller) {
        this.form.addEventListener('submit', controller.handleAddTodo);
        this.todoList.addEventListener('click', controller.handleDeleteTodo);
        this.todoList.addEventListener('change', controller.handleToggle);
    }
}




/*
 * CONTROLLER ******************************************************************
 */

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Display initial todos
        // Exibir os todos iniciais
        this.onTodoListChanged(this.model.todos);

        this.model.bindEvents(this);
        this.view.bindEvents(this);
    }

    onTodoListChanged = todos => {
        this.view.displayTodos(todos);
    }

    // Handle submit event for adding a todo
    // Lidar com o evento de envio para adicionar um todo
    handleAddTodo = event => {
        event.preventDefault();

        if (this.view.todoText) {
            const todo = {
                id: this.model.todos.length + 1,
                text: this.view.todoText,
                complete: false
            };

            this.model.addTodo(todo);
            this.view.resetInput();
        }
    }

    // Handle click event for deleting a todo
    // Lidar com evento de clique para excluir um todo
    handleDeleteTodo = event => {
        if (event.target.className === 'delete') {
            const id = parseInt(event.target.parentElement.id);

            this.model.deleteTodo(id);
        }
    }

    // Handle change event for toggling a todo
    // Lidar com o evento de mudança para alternar um todo
    handleToggle = event => {
        if (event.target.type === 'checkbox') {
            const id = parseInt(event.target.parentElement.id);

            this.model.toggleTodo(id);
        }
    }
}



const app = new Controller(new Model(), new View());