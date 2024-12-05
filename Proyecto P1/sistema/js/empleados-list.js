class EmployeeList extends HTMLElement {
    constructor() {
      super(); // Llamada al constructor de la clase padre
      this.attachShadow({ mode: "open" }); // Creamos un shadow DOM para encapsulamiento
  
      // Contenedor principal
      this.container = document.createElement("div");
  
      // Estilo del componente
      this.estilo = document.createElement("style");
      this.estilo.textContent = `
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                  font-size: 16px;
                  text-align: left;
              }
              th, td {
                  padding: 10px;
                  border: 1px solid #ccc;
              }
              th {
                  background-color: #f4f4f4;
              }
              .actions button {
                  margin: 0 5px;
                  padding: 5px 10px;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
              }
              .btn-update {
                  background-color: #4caf50;
                  color: white;
              }
              .btn-delete {
                  background-color: #f44336;
                  color: white;
              }
              .error-alert {
                  color: red;
                  font-weight: bold;
              }
              .empty-alert {
                  color: gray;
                  font-style: italic;
              }
          `;
  
      // Agregamos el estilo y el contenedor al shadow DOM
      this.shadowRoot.appendChild(this.estilo);
      this.shadowRoot.appendChild(this.container);
    }
  
    connectedCallback() {
      // Obtenemos la URL de la API desde el atributo del componente
      const apiUrl = this.getAttribute("api-url");
      this.fetchData(apiUrl);
    }
  
    // Método para obtener datos desde la API
    fetchData = async (url) => {
      try {
        const response = await fetch(url); // Llamada a la API
        const data = await response.json(); // Parseamos la respuesta
        const employees = data || []; // Asumimos que la respuesta contiene una lista de empleados
        this.render(employees); // Pasamos los datos al render
      } catch (error) {
        console.error("Error con la API", error);
        this.container.innerHTML = `
                  <p class="error-alert">Error con la API</p>
              `;
      }
    };
  
    // Método para renderizar la tabla
    render = (employees) => {
      if (employees.length === 0) {
        // Si no hay empleados disponibles, mostramos un mensaje
        this.container.innerHTML = `
                  <p class="empty-alert">No hay empleados disponibles</p>
              `;
        return;
      }
  
      // Generamos el encabezado de la tabla
      let tableHTML = `
              <table>
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Puesto</th>
                          <th>Salario</th>
                          <th>Acciones</th>
                      </tr>
                  </thead>
                  <tbody>
          `;
  
      // Generamos las filas con forEach
      employees.forEach((employee) => {
        tableHTML += `
                  <tr>
                      <td>${employee.id_empleado}</td>
                      <td>${employee.nombre}</td>
                      <td>${employee.puesto}</td>
                      <td>${employee.salario}</td>
                      <td class="actions">
                          <button class="btn-update" data-id="${employee.id_empleado}">Actualizar</button>
                          <button class="btn-delete" data-id="${employee.id_empleado}">Eliminar</button>
                      </td>
                  </tr>
              `;
      });
  
      // Cerramos la tabla
      tableHTML += `
                  </tbody>
              </table>
          `;
  
      // Insertamos el contenido de la tabla en el contenedor
      this.container.innerHTML = tableHTML;
  
      // Asignamos eventos a los botones de eliminación
      this.container.querySelectorAll(".btn-delete").forEach((button) => {
        button.addEventListener("click", () =>
          this.handleDelete(button.dataset.id)
        );
      });
  
      // Asignamos eventos a los botones de actualización
      this.container.querySelectorAll(".btn-update").forEach((button) => {
        button.addEventListener("click", () =>
          this.handleUpdate(button.dataset.id)
        );
      });
    };
  
    // Método para manejar la eliminación
    handleDelete = async (id) => {
      const confirmDelete = confirm(
        `¿Estás seguro de que deseas eliminar el empleado con ID: ${id}?`
      );
      if (confirmDelete) {
        try {
          const response = await fetch(`http://localhost:8000/empleados/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            alert("Empleado eliminado con éxito");
            const apiUrl = this.getAttribute("api-url");
            this.fetchData(apiUrl); // Refrescamos la lista
          } else {
            alert("Error al eliminar el empleado");
          }
        } catch (error) {
          console.error("Error en la eliminación", error);
          alert("Error con la conexión de la API");
        }
      }
    };
  
    // Método para manejar la actualización
    // Método para manejar la actualización
    handleUpdate = async (id) => {
      try {
        // Obtener datos actuales del empleado
        const response = await fetch(`http://localhost:8000/empleados/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos del empleado");
        }
        const employeeData = await response.json();
  
        // Solicitar nuevos valores al usuario
        const nuevoNombre = prompt("Nuevo nombre:", employeeData.nombre);
        const nuevoPuesto = prompt("Nuevo puesto:", employeeData.puesto);
        const nuevoSalario = prompt("Nuevo salario:", employeeData.salario);
  
        // Validar que se proporcionen valores válidos
        if (!nuevoNombre || !nuevoPuesto || !nuevoSalario) {
          alert("Actualización cancelada. Todos los campos son obligatorios.");
          return;
        }
  
        // Enviar solicitud PUT para actualizar al empleado
        const updateResponse = await fetch(
          `http://localhost:8000/empleados/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nombre: nuevoNombre.trim(),
              puesto: nuevoPuesto.trim(),
              salario: parseFloat(nuevoSalario), // Convertir salario a número
            }),
          }
        );
  
        if (!updateResponse.ok) {
          throw new Error("Error al actualizar el empleado");
        }
  
        // Confirmar la actualización
        alert("Empleado actualizado con éxito");
  
        // Recargar la lista de empleados
        const apiUrl = this.getAttribute("api-url");
        this.fetchData(apiUrl);
      } catch (error) {
        console.error("Error al actualizar el empleado:", error);
        alert(
          "No se pudo actualizar el empleado. Revisa la consola para más detalles."
        );
      }
    };
  }
  
  window.customElements.define("empleados-list", EmployeeList);
  