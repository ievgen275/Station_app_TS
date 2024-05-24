function addStation() {
   let inputAddress = document.getElementById("address"),
      selectElement = document.getElementById("status"),
      selectedValue = selectElement.value,
      inputAddressValue = inputAddress.value;

   const newStation = {
      address: inputAddressValue,
      status: selectedValue === "true" ? true : false
   };

   fetch("http://localhost:8000/stations", {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(newStation)
   })
      .then(res => {
         if (!res.ok) throw new Error(res.status);
         return res.json();
      })
      .then(data => {
         console.log("Нова станція успішно додана:", data);
      })
      .catch(error => {
         console.error("Помилка при додаванні нової станції:", error);
      });
}

function showInputBlock() {
   const inputBlock = document.getElementById('input-block');
   if (inputBlock.classList.contains('hidden')) {
      inputBlock.classList.remove('hidden');
      inputBlock.classList.add('visible');
   } else {
      inputBlock.classList.remove('visible');
      inputBlock.classList.add('hidden');
   }
}

function activeStation() {
   let ul = document.getElementById('list');
   ul.innerHTML = '';
   fetch("http://localhost:8000/stations")
      .then(res => {
         if (!res.ok) throw new Error(res.status)
         return res.json();
      })
      .then((data) => {
         data.forEach(station => {
            if (station.status) {
               const li = document.createElement('li');
               li.className = 'station-item';
               li.setAttribute('data-id', station.id);
               li.innerHTML = `
                        <span class="station_title">ID: ${station.id}, Address: <span class="station-address">${station.address}</span></span>
                        <div class="station_edit">
                           <button onclick="editStation(${station.id})">Edit</button>
                           <button onclick="deleteStation(${station.id})">Delete</button>
                        </div>`;
               ul.appendChild(li);

               const metricsContainer = document.createElement('div');
               getStationMetrics(station.id, metricsContainer);
               li.appendChild(metricsContainer);
            }
         });
      })
      .catch(error => console.error('Error fetching stations:', error));
}

function inactiveStation() {
   let ul = document.getElementById('list');
   ul.innerHTML = '';
   fetch("http://localhost:8000/stations")
      .then(res => {
         if (!res.ok) throw new Error(res.status)
         return res.json();
      })
      .then((data) => {
         data.forEach(station => {
            if (!station.status) {
               const li = document.createElement('li');
               li.className = 'station-item';
               li.setAttribute('data-id', station.id);
               li.innerHTML = `
                        <span class="station_title">ID: ${station.id}, Address: <span class="station-address">${station.address}</span></span>
                        <div class="station_edit">
                           <button onclick="editStation(${station.id})">Edit</button>
                           <button onclick="deleteStation(${station.id})">Delete</button>
                        </div>`;
               ul.appendChild(li);

               const metricsContainer = document.createElement('div');
               getStationMetrics(station.id, metricsContainer);
               li.appendChild(metricsContainer);
            }
         });
      })
      .catch(error => console.error('Error fetching stations:', error));
}

function allStation() {
   let ul = document.getElementById('list');
   ul.innerHTML = '';
   fetch("http://localhost:8000/stations")
      .then(res => {
         if (!res.ok) throw new Error(res.status)
         return res.json();
      })
      .then((data) => {
         data.forEach(station => {
            const li = document.createElement('li');
            li.className = 'station-item';
            li.setAttribute('data-id', station.id);
            li.innerHTML = `
                        <span class="station_title">ID: ${station.id}, Address: <span class="station-address">${station.address}</span></span>
                        <div class="station_edit">
                           <button onclick="editStation(${station.id})">Edit</button>
                           <button onclick="deleteStation(${station.id})">Delete</button>
                        </div>`;
            ul.appendChild(li);

            const metricsContainer = document.createElement('div');
            getStationMetrics(station.id, metricsContainer);
            li.appendChild(metricsContainer);
         });
      })
      .catch(error => console.error('Error fetching stations:', error));
}

function deleteStation(id) {
   fetch(`http://localhost:8000/stations/${id}`, {
      method: "DELETE"
   })
      .then(res => {
         if (!res.ok) throw new Error(res.status);
         console.log("Станція успішно видалена");
         const li = document.querySelector(`li[data-id="${id}"]`);
         if (li) {
            li.remove();
         }
      })
      .catch(error => {
         console.error("Помилка при видаленні станції:", error);
      });
}

function editStation(id) {
   const li = document.querySelector(`li[data-id="${id}"]`);
   const addressSpan = li.querySelector('.station-address');
   const addressText = addressSpan.textContent;

   const input = document.createElement('input');
   input.type = 'text';
   input.value = addressText;
   input.classList.add('edit-address');

   addressSpan.innerHTML = '';
   addressSpan.appendChild(input);

   const buttonDiv = li.querySelector('div');
   buttonDiv.innerHTML = `
      <button onclick="saveStation(${id})">Save</button>
      <button onclick="cancelEdit(${id}, '${addressText}')">Cancel</button>`;
}

function saveStation(id) {
   const li = document.querySelector(`li[data-id="${id}"]`);
   const newAddress = li.querySelector('.edit-address').value;

   fetch(`http://localhost:8000/stations/${id}`, {
      method: "PUT",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify({ address: newAddress })
   })
      .then(res => {
         if (!res.ok) throw new Error(res.status);
         return res.json();
      })
      .then(data => {
         console.log("Станція успішно оновлена:", data);
         li.innerHTML = `
            <span>ID: ${id}, Address: <span class="station-address">${newAddress}</span></span>
            <div>
               <button onclick="editStation(${id})">Edit</button>
               <button onclick="deleteStation(${id})">Delete</button>
            </div>`;
      })
      .catch(error => {
         console.error("Помилка при оновленні станції:", error);
      });
}

function cancelEdit(id, addressText) {
   const li = document.querySelector(`li[data-id="${id}"]`);
   li.innerHTML = `
      <span>ID: ${id}, Address: <span class="station-address">${addressText}</span></span>
      <div>
         <button onclick="editStation(${id})">Edit</button>
         <button onclick="deleteStation(${id})">Delete</button>
      </div>`;
}

function getStationMetrics(id, element) {
   fetch(`http://localhost:8000/stations/${id}/metrics`)
      .then(response => {
         if (!response.ok) {
            throw new Error('Network response was not ok');
         }
         return response.json();
      })
      .then(data => {
         const metricsContainer = document.createElement('div');
         metricsContainer.innerHTML = `
            <div class="station_block">
               <h4>Metrics for Station ${id}</h4>
               <p>Temperature: ${data.temperature}</p>
               <p>Dose Rate: ${data.dose_rate}</p>
               <p>Humidity: ${data.humidity}</p>
            </div>
         `;
         element.appendChild(metricsContainer);
      })
      .catch(error => {
         console.error('There has been a problem with your fetch operation:', error);
      });
}


window.activeStation = activeStation;
window.inactiveStation = inactiveStation;
window.addStation = addStation;
window.showInputBlock = showInputBlock;
window.deleteStation = deleteStation;
window.editStation = editStation;
window.allStation = allStation;
window.saveStation = saveStation;
window.cancelEdit = cancelEdit;
window.getStationMetrics = getStationMetrics;