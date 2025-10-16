// Variables globales
let currentChofer = '';
let currentDay = '';
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];

// Precios de fábrica por millar
const preciosPlanta = {
    'Ladrillera Choque': {
        'H-10 ECO': 0.8,
        'H-10 COM': 0.9,
        'H-10 SEG': 0.45,
        'PAND ECO': 0.85,
        'PAND COM': 0.9,
        'PAND SEG': 0.45,
        'H-09 ECO': 0.75,
        'H-09 COM': 0.8,
        'H-09 SEG': 0.45,
        'H-15': 2.15,
        'H-15 SEG': 1,
        'H-12': 2,
        'H-12 SEG': 1,
        'H-20': 4
    },
    'Ladrillera Arequipa': {
        'H-10 ECO': 0.73,
        'H-10 COM': 0.73, // Asumiendo mismo precio que ECO
        'H-10 SEG': 0.55,
        'PAND ECO': 0.68,
        'PAND COM': 0.68, // Asumiendo mismo precio que ECO
        'PAND SEG': 0.5,
        'H-09 ECO': 0.65,
        'H-09 COM': 0.65, // Asumiendo mismo precio que ECO
        'H-09 SEG': 0.55, // Asumiendo mismo precio que H-10 SEG
        'H-15': 2.0, // Estimando
        'H-15 SEG': 1.0, // Estimando
        'H-12': 1.8, // Estimando
        'H-12 SEG': 0.9, // Estimando
        'H-20': 3.5 // Estimando
    }
};

// Función para mostrar pantallas
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // Cargar reportes si se selecciona esa pantalla
    if (screenId === 'reports') {
        loadWeeklyReport();
    }
    
    // Cargar visualización de pedidos si se selecciona esa pantalla
    if (screenId === 'orders-viewer') {
        loadOrdersViewer();
    }
}

// Mostrar formulario de gastos
function showGastosForm() {
    updateGastosTitle();
    showScreen('gastos-form');
}

// Actualizar título dinámico de gastos
function updateGastosTitle() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES');
    
    document.getElementById('gastos-title').textContent = `Gastos de ${currentChofer} - ${formattedDate}`;
}

// Selección de chofer
function selectChofer(chofer) {
    currentChofer = chofer;
    showScreen('day-selection');
}

// Selección de día
function selectDay(day) {
    currentDay = day;
    updateOrderTitle();
    showScreen('order-form');
}

// Realizar búsqueda con filtros
function performSearch() {
    const chofer = document.getElementById('search-chofer').value;
    const dia = document.getElementById('search-dia').value;
    
    let filteredOrders = orders;
    
    // Aplicar filtros
    if (chofer) {
        filteredOrders = filteredOrders.filter(order => order.chofer === chofer);
    }
    
    if (dia) {
        filteredOrders = filteredOrders.filter(order => order.dia === dia);
    }
    
    displaySearchResults(filteredOrders, chofer, dia);
}

// Mostrar resultados de búsqueda
function displaySearchResults(filteredOrders, chofer, dia) {
    const summaryDiv = document.getElementById('search-results-summary');
    const tableDiv = document.getElementById('search-results-table');
    const tbody = document.getElementById('search-results-tbody');
    
    // Crear texto del filtro aplicado
    let filterText = 'Todos los pedidos';
    if (chofer && dia) {
        filterText = `de ${chofer} y del día ${dia}`;
    } else if (chofer) {
        filterText = `de ${chofer}`;
    } else if (dia) {
        filterText = `del día ${dia}`;
    }
    
    summaryDiv.innerHTML = `<strong>Todos los pedidos ${filterText}:</strong>`;
    summaryDiv.style.display = 'block';
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; padding: 20px;">No se encontraron pedidos con los filtros seleccionados</td></tr>';
        tableDiv.style.display = 'block';
        return;
    }
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    // Llenar tabla con resultados
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${order.fecha}</td>
            <td>${order.cantidad}</td>
            <td>${order.tipoLadrillo}</td>
            <td>${order.fabrica}</td>
            <td>${order.chofer}</td>
            <td>${order.dia}</td>
            <td>${order.precioUnidad || '0.00'}</td>
            <td>${order.precioMillar || '0.00'}</td>
            <td>S/${parseFloat(order.total || 0).toFixed(2)}</td>
            <td>${order.formaPago}</td>
            <td>${order.numOperacion || '-'}</td>
            <td>${order.vendedor}</td>
            <td><button class="delete-button" onclick="confirmDeleteOrder(${order.id})">Eliminar</button></td>
        `;
        
        tbody.appendChild(row);
    });
    
    tableDiv.style.display = 'block';
}

// Confirmar eliminación de pedido
function confirmDeleteOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('Pedido no encontrado');
        return;
    }
    
    const confirmMessage = `¿Está seguro que desea eliminar este pedido?\n\n` +
                         `Chofer: ${order.chofer}\n` +
                         `Día: ${order.dia}\n` +
                         `Fecha: ${order.fecha}\n` +
                         `Tipo: ${order.tipoLadrillo}\n` +
                         `Cantidad: ${order.cantidad}\n` +
                         `Total: S/${order.total}\n\n` +
                         `Esta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
        deleteOrder(orderId);
    }
}

// Eliminar pedido
function deleteOrder(orderId) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        alert('Pedido eliminado exitosamente');
        
        // Recargar búsqueda actual
        performSearch();
    } else {
        alert('Error: No se pudo eliminar el pedido');
    }
}

// Actualizar título dinámico del pedido
function updateOrderTitle() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES');
    
    document.getElementById('order-title').textContent = `Pedido de ${currentChofer} / ${currentDay} / ${formattedDate}`;
}

// Actualizar campos de precio según el tipo de ladrillo
function updatePriceFields() {
    const tipoLadrillo = document.getElementById('tipo-ladrillo').value;
    const priceBoxSingle = document.getElementById('price-box-single');
    const priceBoxMillar = document.getElementById('price-box-millar');
    const precioUnidad = document.getElementById('precio-unidad');
    const precioMillar = document.getElementById('precio-millar');
    
    // Limpiar campos
    precioUnidad.value = '';
    precioMillar.value = '';
    
    // Verificar si es ladrillo techo (H-15, H-12, H-20)
    const esTecho = tipoLadrillo === 'H-15' || tipoLadrillo === 'H-15 SEG' || 
                   tipoLadrillo === 'H-12' || tipoLadrillo === 'H-12 SEG' || 
                   tipoLadrillo === 'H-20';
    
    if (esTecho) {
        // Mostrar precio por unidad para ladrillos techo
        priceBoxSingle.style.display = 'block';
        priceBoxMillar.style.display = 'none';
        precioMillar.value = '0';
    } else if (tipoLadrillo !== '') {
        // Mostrar precio por millar para otros tipos
        priceBoxSingle.style.display = 'none';
        priceBoxMillar.style.display = 'block';
        precioUnidad.value = '0';
    } else {
        // No mostrar ningún campo si no se ha seleccionado tipo
        priceBoxSingle.style.display = 'none';
        priceBoxMillar.style.display = 'none';
    }
    
    calculateTotal();
}

// Mostrar/ocultar campo de N° de Operación según forma de pago
function togglePaymentFields() {
    const formaPago = document.querySelector('input[name="forma-pago"]:checked')?.value;
    const numOperacionGroup = document.getElementById('num-operacion-group');
    const numOperacionInput = document.getElementById('num-operacion');
    
    if (formaPago === 'Deposito') {
        numOperacionGroup.style.display = 'block';
        numOperacionInput.required = true;
    } else {
        numOperacionGroup.style.display = 'none';
        numOperacionInput.required = false;
        numOperacionInput.value = '';
    }
}

// Calcular total automáticamente
function calculateTotal() {
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
    const precioUnidad = parseFloat(document.getElementById('precio-unidad').value) || 0;
    const precioMillar = parseFloat(document.getElementById('precio-millar').value) || 0;
    const tipoLadrillo = document.getElementById('tipo-ladrillo').value;
    
    // Verificar si es ladrillo techo
    const esTecho = tipoLadrillo === 'H-15' || tipoLadrillo === 'H-15 SEG' || 
                   tipoLadrillo === 'H-12' || tipoLadrillo === 'H-12 SEG' || 
                   tipoLadrillo === 'H-20';
    
    let total = 0;
    
    if (cantidad > 0 && tipoLadrillo !== '') {
        if (esTecho && precioUnidad > 0) {
            // Para ladrillos techo: cantidad * precio por unidad
            total = cantidad * precioUnidad;
        } else if (!esTecho && precioMillar > 0) {
            // Para otros ladrillos: (cantidad / 1000) * precio por millar
            total = (cantidad / 1000) * precioMillar;
        }
    }
    
    // Actualizar los campos de total
    document.getElementById('total').value = total.toFixed(2);
    document.getElementById('total-final').value = total.toFixed(2);
}

// Event listeners para cálculo automático (ahora están directamente en el HTML)
// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('cantidad').addEventListener('input', calculateTotal);
//     document.getElementById('precio-unidad').addEventListener('input', calculateTotal);
//     document.getElementById('precio-millar').addEventListener('input', calculateTotal);
//     document.getElementById('tipo-ladrillo').addEventListener('change', calculateTotal);
// });

// Guardar pedido
function saveOrder() {
    // Validar campos requeridos
    const cantidad = document.getElementById('cantidad').value;
    const tipoLadrillo = document.getElementById('tipo-ladrillo').value;
    const fabrica = document.getElementById('fabrica').value;
    const vendedor = document.getElementById('vendedor').value;
    const formaPago = document.querySelector('input[name="forma-pago"]:checked')?.value;
    const numOperacion = document.getElementById('num-operacion').value;
    
    if (!cantidad || !tipoLadrillo || !fabrica || !vendedor || !formaPago) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }
    
    // Validar N° de operación si es depósito
    if (formaPago === 'Deposito' && !numOperacion) {
        alert('Debe ingresar el N° de Operación para pago por depósito');
        return;
    }
    
    // Validar precio según tipo de ladrillo
    const precioUnidad = document.getElementById('precio-unidad').value;
    const precioMillar = document.getElementById('precio-millar').value;
    const esTecho = tipoLadrillo === 'H-15' || tipoLadrillo === 'H-15 SEG' || 
                   tipoLadrillo === 'H-12' || tipoLadrillo === 'H-12 SEG' || 
                   tipoLadrillo === 'H-20';
    
    if (esTecho && !precioUnidad) {
        alert('Debe ingresar el precio por unidad para ladrillos techo (H-15, H-12, H-20)');
        return;
    } else if (!esTecho && !precioMillar) {
        alert('Debe ingresar el precio por millar para este tipo de ladrillo');
        return;
    }

    const now = new Date();
    const order = {
        id: Date.now(),
        chofer: currentChofer,
        dia: currentDay,
        fecha: now.toLocaleDateString(),
        fechaISO: now.toISOString(),
        hora: now.toLocaleTimeString(),
        cantidad: cantidad,
        tipoLadrillo: tipoLadrillo,
        precioUnidad: precioUnidad,
        precioMillar: precioMillar,
        total: document.getElementById('total-final').value,
        formaPago: formaPago,
        numOperacion: numOperacion,
        fabrica: fabrica,
        vendedor: vendedor
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    alert('Pedido guardado exitosamente');
    
    // Limpiar formulario
    document.getElementById('order-form').querySelectorAll('input, select').forEach(field => {
        if (field.type === 'radio') {
            field.checked = false;
        } else {
            field.value = '';
        }
    });
    
    // Ocultar campos de precio y N° de operación
    document.getElementById('price-box-single').style.display = 'none';
    document.getElementById('price-box-millar').style.display = 'none';
    document.getElementById('num-operacion-group').style.display = 'none';
    
    // Mantener en la pantalla del formulario para agregar más pedidos
    // No llamar a showScreen('main-menu')
}

// Buscar pedidos por chofer (función legacy mantenida para compatibilidad)
function searchOrders() {
    // Esta función se mantiene para evitar errores, pero ahora redirige a la nueva función
    performSearch();
}

// Cargar reportes
function loadReports() {
    const reportsDiv = document.getElementById('reports-content');
    
    if (orders.length === 0 && gastos.length === 0) {
        reportsDiv.innerHTML = '<p>No hay datos registrados</p>';
        return;
    }

    // Estadísticas de pedidos
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    
    // Estadísticas de gastos
    const totalGastos = gastos.length;
    const totalGastosAmount = gastos.reduce((sum, gasto) => sum + gasto.totalGastos, 0);
    
    // Pedidos por chofer
    const ordersByChofer = {};
    orders.forEach(order => {
        if (!ordersByChofer[order.chofer]) {
            ordersByChofer[order.chofer] = { count: 0, total: 0, gastos: 0 };
        }
        ordersByChofer[order.chofer].count++;
        ordersByChofer[order.chofer].total += parseFloat(order.total || 0);
    });
    
    // Gastos por chofer
    gastos.forEach(gasto => {
        if (!ordersByChofer[gasto.chofer]) {
            ordersByChofer[gasto.chofer] = { count: 0, total: 0, gastos: 0 };
        }
        ordersByChofer[gasto.chofer].gastos += gasto.totalGastos;
    });

    // Pedidos por día
    const ordersByDay = {};
    orders.forEach(order => {
        if (!ordersByDay[order.dia]) {
            ordersByDay[order.dia] = 0;
        }
        ordersByDay[order.dia]++;
    });

    let html = `
        <div style="margin-bottom: 20px;">
            <h4>Estadísticas Generales</h4>
            <p><strong>Total de Pedidos:</strong> ${totalOrders}</p>
            <p><strong>Monto Total Ventas:</strong> S/${totalAmount.toFixed(2)}</p>
            <p><strong>Total de Gastos:</strong> ${totalGastos} registros</p>
            <p><strong>Monto Total Gastos:</strong> S/${totalGastosAmount.toFixed(2)}</p>
            <p><strong>Balance:</strong> S/${(totalAmount - totalGastosAmount).toFixed(2)}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4>Resumen por Chofer</h4>
    `;

    Object.keys(ordersByChofer).forEach(chofer => {
        const data = ordersByChofer[chofer];
        const balance = data.total - data.gastos;
        html += `
            <div class="order-item">
                <strong>${chofer}:</strong><br>
                Pedidos: ${data.count} - S/${data.total.toFixed(2)}<br>
                Gastos: S/${data.gastos.toFixed(2)}<br>
                <strong>Balance: S/${balance.toFixed(2)}</strong>
            </div>
        `;
    });

    html += `
        </div>
        
        <div>
            <h4>Pedidos por Día</h4>
    `;

    Object.keys(ordersByDay).forEach(dia => {
        html += `
            <div class="order-item">
                <strong>${dia}:</strong> ${ordersByDay[dia]} pedidos
            </div>
        `;
    });

    html += '</div>';
    reportsDiv.innerHTML = html;
}

// Guardar gastos
function saveGastos() {
    const petroleo = document.getElementById('petroleo').value;
    const otrosDescripcion = document.getElementById('otros-descripcion').value;
    const otrosCantidad = document.getElementById('otros-cantidad').value;
    
    // Validar que al menos un campo tenga datos
    if (!petroleo && !otrosDescripcion && !otrosCantidad) {
        alert('Debe ingresar al menos un gasto');
        return;
    }
    
    // Validar que si hay descripción en "Otros", también haya cantidad
    if (otrosDescripcion && !otrosCantidad) {
        alert('Debe ingresar la cantidad para "Otros" si proporciona una descripción');
        return;
    }
    
    // Validar que si hay cantidad en "Otros", también haya descripción
    if (otrosCantidad && !otrosDescripcion) {
        alert('Debe ingresar la descripción para "Otros" si proporciona una cantidad');
        return;
    }

    const now = new Date();
    const gasto = {
        id: Date.now(),
        chofer: currentChofer,
        dia: currentDay,
        fecha: now.toLocaleDateString(),
        fechaISO: now.toISOString(),
        hora: now.toLocaleTimeString(),
        petroleo: parseFloat(petroleo) || 0,
        otrosDescripcion: otrosDescripcion,
        otrosCantidad: parseFloat(otrosCantidad) || 0,
        totalGastos: (parseFloat(petroleo) || 0) + (parseFloat(otrosCantidad) || 0)
    };

    gastos.push(gasto);
    localStorage.setItem('gastos', JSON.stringify(gastos));
    
    alert('Gastos guardados exitosamente');
    
    // Limpiar formulario
    document.getElementById('petroleo').value = '';
    document.getElementById('otros-descripcion').value = '';
    document.getElementById('otros-cantidad').value = '';
    
    showScreen('order-form');
}

// Mostrar visualizador de pedidos
function showOrdersViewer() {
    showScreen('orders-viewer');
}

// Cargar reporte semanal
function loadWeeklyReport() {
    const tbody = document.getElementById('weekly-report-tbody');
    const totalMillaresSpan = document.getElementById('total-millares');
    const ventaTotalSpan = document.getElementById('venta-total');
    const costoFabricaSpan = document.getElementById('costo-fabrica');
    const gananciaChoferesSpan = document.getElementById('ganancia-choferes');
    const totalGastosSpan = document.getElementById('total-gastos-reporte');
    const gananciaTotalSpan = document.getElementById('ganancia-total');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No hay pedidos registrados para esta semana</td></tr>';
        totalMillaresSpan.textContent = '0';
        ventaTotalSpan.textContent = '0';
        costoFabricaSpan.textContent = '0';
        gananciaChoferesSpan.textContent = '0';
        totalGastosSpan.textContent = '0';
        gananciaTotalSpan.textContent = '0';
        return;
    }

    // Obtener pedidos y gastos de esta semana
    const weeklyOrders = getWeeklyOrders();
    const weeklyGastos = getWeeklyGastos();
    
    // Agrupar por chofer
    const choferData = {};
    let totalMillares = 0;
    let ventaTotal = 0;
    let costoFabricaTotal = 0;
    
    // Procesar pedidos
    weeklyOrders.forEach(order => {
        const chofer = order.chofer;
        if (!choferData[chofer]) {
            choferData[chofer] = {
                millares: 0,
                costoFabrica: 0,
                gastos: 0,
                petroleo: 0,
                pagoChofer: 0,
                ventas: 0
            };
        }
        
        // Calcular millares con la conversión correcta
        const cantidad = parseFloat(order.cantidad || 0);
        const esTecho = order.tipoLadrillo === 'H-15' || order.tipoLadrillo === 'H-15 SEG' || 
                       order.tipoLadrillo === 'H-12' || order.tipoLadrillo === 'H-12 SEG' || 
                       order.tipoLadrillo === 'H-20';
        
        let millares = 0;
        if (esTecho) {
            // Para ladrillos techo: 350 unidades = 1 millar
            millares = cantidad / 350;
        } else {
            // Para H-10 y panderetas: 1000 unidades = 1 millar
            millares = cantidad / 1000;
        }
        
        choferData[chofer].millares += millares;
        totalMillares += millares;
        
        // Calcular costo de fábrica
        const fabrica = order.fabrica;
        const tipoLadrillo = order.tipoLadrillo;
        const precioPlanta = preciosPlanta[fabrica] && preciosPlanta[fabrica][tipoLadrillo] 
            ? preciosPlanta[fabrica][tipoLadrillo] 
            : 0;
        const costoFabricaOrder = millares * precioPlanta * 1000; // precio por millar
        
        choferData[chofer].costoFabrica += costoFabricaOrder;
        costoFabricaTotal += costoFabricaOrder;
        
        // Calcular pago del chofer (59 por millar)
        const pagoChoferOrder = millares * 59;
        choferData[chofer].pagoChofer += pagoChoferOrder;
        
        // Calcular ventas (total de ventas del chofer)
        const ventasOrder = parseFloat(order.total || 0);
        choferData[chofer].ventas += ventasOrder;
        ventaTotal += ventasOrder;
    });
    
    // Procesar gastos
    weeklyGastos.forEach(gasto => {
        const chofer = gasto.chofer;
        if (!choferData[chofer]) {
            choferData[chofer] = {
                millares: 0,
                costoFabrica: 0,
                gastos: 0,
                petroleo: 0,
                pagoChofer: 0,
                ventas: 0
            };
        }
        
        // Sumar gastos totales
        choferData[chofer].gastos += gasto.totalGastos;
        
        // Sumar petroleo específicamente
        choferData[chofer].petroleo += gasto.petroleo;
    });
    
    // Calcular totales
    const totalGastos = Object.values(choferData).reduce((sum, data) => sum + data.gastos, 0);
    const totalPagoChoferes = totalMillares * 59;
    const gananciaTotal = ventaTotal - costoFabricaTotal - totalGastos - totalPagoChoferes;
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    // Llenar tabla agrupada por chofer
    Object.keys(choferData).forEach(chofer => {
        const data = choferData[chofer];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${chofer}</strong></td>
            <td>${data.millares.toFixed(2)}</td>
            <td>S/${data.costoFabrica.toFixed(2)}</td>
            <td>S/${data.gastos.toFixed(2)}</td>
            <td>S/${data.petroleo.toFixed(2)}</td>
            <td>S/${data.pagoChofer.toFixed(2)}</td>
            <td>S/${data.ventas.toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Si no hay datos, mostrar mensaje
    if (Object.keys(choferData).length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No hay datos para esta semana</td></tr>';
    }
    
    // Actualizar totales
    totalMillaresSpan.textContent = totalMillares.toFixed(2);
    ventaTotalSpan.textContent = ventaTotal.toFixed(0);
    costoFabricaSpan.textContent = costoFabricaTotal.toFixed(0);
    gananciaChoferesSpan.textContent = totalPagoChoferes.toFixed(0);
    totalGastosSpan.textContent = totalGastos.toFixed(0);
    gananciaTotalSpan.textContent = Math.abs(gananciaTotal).toFixed(0);
}

// Obtener gastos de esta semana
function getWeeklyGastos() {
    // Retornar todos los gastos para mantener consistencia con getWeeklyOrders
    return gastos;
}

// Obtener todos los pedidos (no solo de esta semana)
function getWeeklyOrders() {
    // Retornar todos los pedidos en lugar de filtrar por semana
    return orders;
}

// Cargar visualizador de pedidos
function loadOrdersViewer() {
    const contentDiv = document.getElementById('orders-viewer-content');
    
    // Obtener solo los pedidos y gastos de esta semana
    const weeklyOrders = getWeeklyOrders();
    const weeklyGastos = getWeeklyGastos();
    
    if (weeklyOrders.length === 0 && weeklyGastos.length === 0) {
        contentDiv.innerHTML = '<p>No hay datos registrados para esta semana</p>';
        return;
    }

    let html = '';
    
    // Sección de Pedidos
    if (weeklyOrders.length > 0) {
        html += `
            <h4>📋 PEDIDOS DE ESTA SEMANA (${weeklyOrders.length} pedidos)</h4>
            <table class="view-orders-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Chofer</th>
                        <th>Día</th>
                        <th>Cantidad</th>
                        <th>Tipo Ladrillo</th>
                        <th>Precio Millar</th>
                        <th>Total</th>
                        <th>Forma Pago</th>
                        <th>N° Operación</th>
                        <th>Fábrica</th>
                        <th>Vendedor</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        weeklyOrders.forEach(order => {
            html += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.fecha}</td>
                    <td>${order.chofer}</td>
                    <td>${order.dia}</td>
                    <td>${order.cantidad}</td>
                    <td>${order.tipoLadrillo}</td>
                    <td>${order.precioMillar || '0.00'}</td>
                    <td>S/${parseFloat(order.total || 0).toFixed(2)}</td>
                    <td>${order.formaPago}</td>
                    <td>${order.numOperacion || '-'}</td>
                    <td>${order.fabrica}</td>
                    <td>${order.vendedor}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table><br><br>';
    }
    
    // Sección de Gastos
    if (weeklyGastos.length > 0) {
        html += `
            <h4>💰 GASTOS DE ESTA SEMANA (${weeklyGastos.length} registros)</h4>
            <table class="view-orders-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Chofer</th>
                        <th>Día</th>
                        <th>Petroleo (S/.)</th>
                        <th>Otros - Descripción</th>
                        <th>Otros - Cantidad (S/.)</th>
                        <th>Total Gastos (S/.)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        weeklyGastos.forEach(gasto => {
            html += `
                <tr>
                    <td>${gasto.id}</td>
                    <td>${gasto.fecha}</td>
                    <td>${gasto.chofer}</td>
                    <td>${gasto.dia}</td>
                    <td>S/${gasto.petroleo.toFixed(2)}</td>
                    <td>${gasto.otrosDescripcion || '-'}</td>
                    <td>S/${gasto.otrosCantidad.toFixed(2)}</td>
                    <td><strong>S/${gasto.totalGastos.toFixed(2)}</strong></td>
                </tr>
            `;
        });
        
        html += '</tbody></table><br><br>';
    }
    
    // Resumen general con todos los costos de esta semana
    const totalVentas = weeklyOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalGastosAmount = weeklyGastos.reduce((sum, gasto) => sum + gasto.totalGastos, 0);
    
    // Calcular millares totales y costos de fábrica
    let totalMillares = 0;
    let costoFabricaTotal = 0;
    
    weeklyOrders.forEach(order => {
        const cantidad = parseFloat(order.cantidad || 0);
        const esTecho = order.tipoLadrillo === 'H-15' || order.tipoLadrillo === 'H-15 SEG' || 
                       order.tipoLadrillo === 'H-12' || order.tipoLadrillo === 'H-12 SEG' || 
                       order.tipoLadrillo === 'H-20';
        
        let millares = 0;
        if (esTecho) {
            millares = cantidad / 350; // 350 unidades = 1 millar para techo
        } else {
            millares = cantidad / 1000; // 1000 unidades = 1 millar para H-10/pandereta
        }
        totalMillares += millares;
        
        // Calcular costo de fábrica
        const fabrica = order.fabrica;
        const tipoLadrillo = order.tipoLadrillo;
        const precioPlanta = preciosPlanta[fabrica] && preciosPlanta[fabrica][tipoLadrillo] 
            ? preciosPlanta[fabrica][tipoLadrillo] 
            : 0;
        costoFabricaTotal += millares * precioPlanta * 1000; // precio por millar
    });
    
    const totalPagoChoferes = totalMillares * 59;
    const balance = totalVentas - costoFabricaTotal - totalGastosAmount - totalPagoChoferes;
    
    html += `
        <div style="background-color: #f0f0f0; padding: 15px; border: 2px solid #333; border-radius: 5px;">
            <h4>📊 RESUMEN DE ESTA SEMANA</h4>
            <div><strong>Total Ventas:</strong> S/${totalVentas.toFixed(2)}</div>
            <div><strong>Costo Fábrica Total:</strong> S/${costoFabricaTotal.toFixed(2)} (${totalMillares.toFixed(2)} millares)</div>
            <div><strong>Total Gastos:</strong> S/${totalGastosAmount.toFixed(2)}</div>
            <div><strong>Ganancia Choferes:</strong> S/${totalPagoChoferes.toFixed(2)} (${totalMillares.toFixed(2)} millares × S/59)</div>
            <div style="font-size: 18px; color: ${balance >= 0 ? 'green' : 'red'};"><strong>Ganancia Total: S/${Math.abs(balance).toFixed(2)}</strong></div>
            <div style="font-size: 12px; color: #666; margin-top: 10px;">
                <em>Ganancia = Ventas - Costo Fábrica - Gastos - Pago Choferes</em>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

// Función legacy mantenida para compatibilidad
function loadReports() {
    loadWeeklyReport();
}

// Función para imprimir reporte
function printReport() {
    // Obtener datos de la semana actual
    const weeklyOrders = getWeeklyOrders();
    const weeklyGastos = getWeeklyGastos();
    
    // Calcular totales
    const totalVentas = weeklyOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalGastosAmount = weeklyGastos.reduce((sum, gasto) => sum + gasto.totalGastos, 0);
    
    let totalMillares = 0;
    let costoFabricaTotal = 0;
    
    weeklyOrders.forEach(order => {
        const cantidad = parseFloat(order.cantidad || 0);
        const esTecho = order.tipoLadrillo === 'H-15' || order.tipoLadrillo === 'H-15 SEG' || 
                       order.tipoLadrillo === 'H-12' || order.tipoLadrillo === 'H-12 SEG' || 
                       order.tipoLadrillo === 'H-20';
        
        let millares = 0;
        if (esTecho) {
            millares = cantidad / 350;
        } else {
            millares = cantidad / 1000;
        }
        totalMillares += millares;
        
        const fabrica = order.fabrica;
        const tipoLadrillo = order.tipoLadrillo;
        const precioPlanta = preciosPlanta[fabrica] && preciosPlanta[fabrica][tipoLadrillo] 
            ? preciosPlanta[fabrica][tipoLadrillo] 
            : 0;
        costoFabricaTotal += millares * precioPlanta * 1000;
    });
    
    const totalPagoChoferes = totalMillares * 59;
    const gananciaTotal = totalVentas - costoFabricaTotal - totalGastosAmount - totalPagoChoferes;
    
    // Agrupar por chofer
    const choferData = {};
    weeklyOrders.forEach(order => {
        const chofer = order.chofer;
        if (!choferData[chofer]) {
            choferData[chofer] = {
                millares: 0,
                costoFabrica: 0,
                gastos: 0,
                petroleo: 0,
                pagoChofer: 0,
                ventas: 0
            };
        }
        
        const cantidad = parseFloat(order.cantidad || 0);
        const esTecho = order.tipoLadrillo === 'H-15' || order.tipoLadrillo === 'H-15 SEG' || 
                       order.tipoLadrillo === 'H-12' || order.tipoLadrillo === 'H-12 SEG' || 
                       order.tipoLadrillo === 'H-20';
        
        let millares = 0;
        if (esTecho) {
            millares = cantidad / 350;
        } else {
            millares = cantidad / 1000;
        }
        
        choferData[chofer].millares += millares;
        
        const fabrica = order.fabrica;
        const tipoLadrillo = order.tipoLadrillo;
        const precioPlanta = preciosPlanta[fabrica] && preciosPlanta[fabrica][tipoLadrillo] 
            ? preciosPlanta[fabrica][tipoLadrillo] 
            : 0;
        const costoFabricaOrder = millares * precioPlanta * 1000;
        
        choferData[chofer].costoFabrica += costoFabricaOrder;
        choferData[chofer].pagoChofer += millares * 59;
        choferData[chofer].ventas += parseFloat(order.total || 0);
    });
    
    weeklyGastos.forEach(gasto => {
        const chofer = gasto.chofer;
        if (!choferData[chofer]) {
            choferData[chofer] = {
                millares: 0,
                costoFabrica: 0,
                gastos: 0,
                petroleo: 0,
                pagoChofer: 0,
                ventas: 0
            };
        }
        
        choferData[chofer].gastos += gasto.totalGastos;
        choferData[chofer].petroleo += gasto.petroleo;
    });
    
    // Crear contenido para imprimir
    const today = new Date();
    const fechaReporte = today.toLocaleDateString('es-ES');
    
    let reporteHTML = `
        <div class="printable-report">
            <h1 style="text-align: center; margin-bottom: 30px;">REPORTE SEMANAL - LADRILLERÍA</h1>
            <p style="text-align: center; margin-bottom: 30px;"><strong>Fecha del Reporte:</strong> ${fechaReporte}</p>
            
            <div style="margin-bottom: 30px;">
                <h3>RESUMEN GENERAL</h3>
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr>
                        <td><strong>Total de millares:</strong></td>
                        <td>${totalMillares.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Venta Total:</strong></td>
                        <td>S/${totalVentas.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Costo Fábrica:</strong></td>
                        <td>S/${costoFabricaTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Ganancia Choferes:</strong></td>
                        <td>S/${totalPagoChoferes.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Gastos:</strong></td>
                        <td>S/${totalGastosAmount.toFixed(2)}</td>
                    </tr>
                    <tr style="background-color: #f0f0f0;">
                        <td><strong>Ganancia Total:</strong></td>
                        <td><strong>S/${Math.abs(gananciaTotal).toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
            
            <div>
                <h3>DETALLE POR CHOFER</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Millares</th>
                            <th>Costo Fábrica</th>
                            <th>Gastos</th>
                            <th>Petroleo</th>
                            <th>Pago Chofer</th>
                            <th>Ventas</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    Object.keys(choferData).forEach(chofer => {
        const data = choferData[chofer];
        reporteHTML += `
            <tr>
                <td><strong>${chofer}</strong></td>
                <td>${data.millares.toFixed(2)}</td>
                <td>S/${data.costoFabrica.toFixed(2)}</td>
                <td>S/${data.gastos.toFixed(2)}</td>
                <td>S/${data.petroleo.toFixed(2)}</td>
                <td>S/${data.pagoChofer.toFixed(2)}</td>
                <td>S/${data.ventas.toFixed(2)}</td>
            </tr>
        `;
    });
    
    reporteHTML += `
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
                <p>Reporte generado el ${fechaReporte} a las ${today.toLocaleTimeString('es-ES')}</p>
            </div>
        </div>
    `;
    
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Reporte Semanal - Ladrillería</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f0f0f0; font-weight: bold; }
                    h1, h3 { color: #333; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                ${reporteHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Función para limpiar todos los datos (DESACTIVADA PARA PRODUCCIÓN)
/*
function clearAllData() {
    if (confirm('¿Está seguro que desea eliminar TODOS los pedidos y gastos?\n\nEsta acción no se puede deshacer.')) {
        localStorage.removeItem('orders');
        localStorage.removeItem('gastos');
        
        // Reinicializar variables
        orders = [];
        gastos = [];
        
        alert('Todos los datos han sido eliminados correctamente.\n\nEl sistema está listo para usar desde cero.');
        
        // Si está en pantalla de reportes, recargar
        if (document.getElementById('reports').classList.contains('active')) {
            loadWeeklyReport();
        }
        
        // Si está en pantalla de búsqueda, limpiar resultados
        if (document.getElementById('search').classList.contains('active')) {
            document.getElementById('search-results-summary').style.display = 'none';
            document.getElementById('search-results-table').style.display = 'none';
        }
    }
}
*/

// Limpiar datos de prueba - EJECUTAR UNA SOLA VEZ (DESACTIVADO)
// clearAllData();

// ==================== FUNCIONES PARA LOGO ====================

// Función para agregar logo a todos los encabezados
function initializeHeaders() {
    const headers = document.querySelectorAll('.header');
    console.log('Inicializando headers:', headers.length); // Debug
    
    headers.forEach(header => {
        // Verificar si ya tiene logo
        if (!header.querySelector('.header-logo')) {
            // Buscar elementos especiales que deben preservarse
            const orderTitle = header.querySelector('#order-title');
            const gastosTitle = header.querySelector('#gastos-title');
            const backButton = header.querySelector('.back-button');
            
            let title = '';
            let specialElement = null;
            
            if (orderTitle) {
                title = orderTitle.textContent;
                specialElement = orderTitle;
            } else if (gastosTitle) {
                title = gastosTitle.textContent;
                specialElement = gastosTitle;
            } else {
                title = header.textContent.trim();
            }
            
            console.log('Procesando header:', title); // Debug
            
            // Limpiar el contenido actual pero preservar elementos especiales
            if (specialElement) {
                // Si hay un elemento especial, solo agregar el logo
                const logo = document.createElement('img');
                logo.src = 'logo.png';
                logo.alt = 'LADRILLOS AREQUIPA S.A.C.';
                logo.className = 'header-logo';
                
                // Debug del logo
                logo.onload = function() {
                    console.log('Logo cargado correctamente');
                    this.style.display = 'block';
                };
                
                logo.onerror = function() {
                    console.log('Error cargando logo, verificar ruta: logo.png');
                    this.style.display = 'none';
                };
                
                // Insertar logo al principio
                header.insertBefore(logo, specialElement);
                
                // Reagregar botón de volver si existía
                if (backButton) {
                    header.appendChild(backButton);
                }
            } else {
                // Si no hay elementos especiales, hacer el proceso normal
                header.innerHTML = '';
                
                // Agregar logo
                const logo = document.createElement('img');
                logo.src = 'logo.png';
                logo.alt = 'LADRILLOS AREQUIPA S.A.C.';
                logo.className = 'header-logo';
                
                // Debug del logo
                logo.onload = function() {
                    console.log('Logo cargado correctamente');
                    this.style.display = 'block';
                };
                
                logo.onerror = function() {
                    console.log('Error cargando logo, verificar ruta: logo.png');
                    this.style.display = 'none';
                };
                
                // Agregar texto del título
                const titleDiv = document.createElement('div');
                titleDiv.className = 'header-text';
                titleDiv.textContent = title;
                
                header.appendChild(logo);
                header.appendChild(titleDiv);
                
                // Reagregar botón de volver si existía
                if (backButton) {
                    header.appendChild(backButton);
                }
            }
        }
    });
}

// Inicializar headers cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeHeaders();
});

// También ejecutar después de un pequeño delay para asegurar que todo esté cargado
setTimeout(function() {
    initializeHeaders();
}, 100);

// Función de prueba para verificar el logo
function testLogo() {
    const img = new Image();
    img.onload = function() {
        console.log('✅ Logo encontrado y cargado correctamente');
        // Mensaje eliminado - logo carga correctamente sin alerta
    };
    img.onerror = function() {
        console.log('❌ Error: No se puede cargar logo.png');
        // Solo mostrar error en consola, sin alertas molestas
    };
    img.src = 'logo.png';
}

// Ejecutar prueba del logo después de cargar la página
setTimeout(testLogo, 500);

// Función de debug para verificar el formulario de pedidos
function debugOrderForm() {
    const orderTitle = document.getElementById('order-title');
    if (orderTitle) {
        console.log('✅ Elemento order-title encontrado:', orderTitle.textContent);
    } else {
        console.log('❌ Error: Elemento order-title NO encontrado');
    }
    
    // Verificar si la función selectDay funciona
    console.log('currentChofer:', currentChofer);
    console.log('currentDay:', currentDay);
}

// Ejecutar debug después de cargar la página
setTimeout(debugOrderForm, 1000);

// Función de prueba manual para el flujo de pedidos
function testOrderFlow() {
    console.log('🧪 Probando flujo de pedidos...');
    
    // Simular selección de chofer
    currentChofer = 'Chofer 1';
    console.log('Chofer seleccionado:', currentChofer);
    
    // Simular selección de día
    currentDay = 'LUNES';
    console.log('Día seleccionado:', currentDay);
    
    // Probar actualización del título
    try {
        updateOrderTitle();
        console.log('✅ updateOrderTitle() ejecutada correctamente');
    } catch (error) {
        console.log('❌ Error en updateOrderTitle():', error);
    }
    
    // Probar mostrar pantalla de pedidos
    try {
        showScreen('order-form');
        console.log('✅ showScreen("order-form") ejecutada correctamente');
    } catch (error) {
        console.log('❌ Error en showScreen():', error);
    }
}

// Función para limpiar y reiniciar el sistema
function resetSystem() {
    console.log('🔄 Reiniciando sistema...');
    
    // Limpiar variables
    currentChofer = '';
    currentDay = '';
    
    // Volver al menú principal
    showScreen('main-menu');
    
    console.log('✅ Sistema reiniciado');
}

// Hacer funciones disponibles globalmente para debug
window.testOrderFlow = testOrderFlow;
window.resetSystem = resetSystem;
window.debugOrderForm = debugOrderForm;

// ==================== NUEVAS FUNCIONES PARA REPORTES AVANZADOS ====================

// Inicializar selectores de año
function initializeYearSelector() {
    const yearSelect = document.getElementById('year-select');
    const currentYear = new Date().getFullYear();
    
    // Agregar años desde hace 2 años hasta el año actual
    for (let year = currentYear; year >= currentYear - 2; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // Seleccionar el mes y año actual por defecto
    const currentMonth = new Date().getMonth();
    document.getElementById('month-select').value = currentMonth;
}

// Cargar reporte por vendedor
function loadVendorReport() {
    const contentDiv = document.getElementById('vendor-report-content');
    
    if (orders.length === 0) {
        contentDiv.innerHTML = '<p>No hay pedidos registrados</p>';
        return;
    }
    
    // Agrupar por vendedor
    const vendorData = {};
    
    orders.forEach(order => {
        const vendedor = order.vendedor || 'Sin vendedor';
        if (!vendorData[vendedor]) {
            vendorData[vendedor] = {
                pedidos: 0,
                millares: 0,
                ventas: 0,
                orders: []
            };
        }
        
        vendorData[vendedor].pedidos++;
        
        const cantidad = parseFloat(order.cantidad || 0);
        const esTecho = order.tipoLadrillo === 'H-15' || order.tipoLadrillo === 'H-15 SEG' || 
                       order.tipoLadrillo === 'H-12' || order.tipoLadrillo === 'H-12 SEG' || 
                       order.tipoLadrillo === 'H-20';
        
        let millares = 0;
        if (esTecho) {
            millares = cantidad / 350;
        } else {
            millares = cantidad / 1000;
        }
        
        vendorData[vendedor].millares += millares;
        vendorData[vendedor].ventas += parseFloat(order.total || 0);
        vendorData[vendedor].orders.push(order);
    });
    
    // Generar HTML
    let html = `
        <div class="report-summary">
            <h3 style="color: var(--primary-color);">Resumen por Vendedor</h3>
        </div>
        
        <table class="results-table">
            <thead>
                <tr>
                    <th>Vendedor</th>
                    <th>N° Pedidos</th>
                    <th>Millares</th>
                    <th>Total Ventas</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    Object.keys(vendorData).sort().forEach(vendedor => {
        const data = vendorData[vendedor];
        html += `
            <tr>
                <td><strong>${vendedor}</strong></td>
                <td>${data.pedidos}</td>
                <td>${data.millares.toFixed(2)}</td>
                <td>S/${data.ventas.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    // Totales generales
    const totalPedidos = Object.values(vendorData).reduce((sum, data) => sum + data.pedidos, 0);
    const totalMillares = Object.values(vendorData).reduce((sum, data) => sum + data.millares, 0);
    const totalVentas = Object.values(vendorData).reduce((sum, data) => sum + data.ventas, 0);
    
    html += `
        <div style="margin-top: 30px; padding: 20px; background: var(--bg-light); border-radius: 8px; border: 2px solid var(--border-color);">
            <h4 style="color: var(--primary-color);">TOTALES GENERALES</h4>
            <div><strong>Total Pedidos:</strong> ${totalPedidos}</div>
            <div><strong>Total Millares:</strong> ${totalMillares.toFixed(2)}</div>
            <div><strong>Total Ventas:</strong> S/${totalVentas.toFixed(2)}</div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

// Generar reporte por semana
function generateWeekReport() {
    const startDate = document.getElementById('week-start-date').value;
    const endDate = document.getElementById('week-end-date').value;
    
    if (!startDate || !endDate) {
        alert('Por favor selecciona ambas fechas');
        return;
    }
    
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    
    if (start > end) {
        alert('La fecha de inicio debe ser anterior a la fecha de fin');
        return;
    }
    
    // Filtrar pedidos y gastos por rango de fechas
    const filteredOrders = orders.filter(order => {
        const orderDate = parseDateString(order.fecha);
        return orderDate >= start && orderDate <= end;
    });
    
    const filteredGastos = gastos.filter(gasto => {
        const gastoDate = parseDateString(gasto.fecha);
        return gastoDate >= start && gastoDate <= end;
    });
    
    // Generar reporte
    generateCustomReport(filteredOrders, filteredGastos, 'week');
}

// Generar reporte por mes
function generateMonthReport() {
    const month = parseInt(document.getElementById('month-select').value);
    const year = parseInt(document.getElementById('year-select').value);
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    
    // Filtrar pedidos y gastos por mes
    const filteredOrders = orders.filter(order => {
        const orderDate = parseDateString(order.fecha);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    const filteredGastos = gastos.filter(gasto => {
        const gastoDate = parseDateString(gasto.fecha);
        return gastoDate >= startDate && gastoDate <= endDate;
    });
    
    // Generar reporte
    generateCustomReport(filteredOrders, filteredGastos, 'month');
}

// Función auxiliar para parsear fechas en formato local
function parseDateString(dateStr) {
    // Formato esperado: dd/mm/yyyy o similar
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        // Asumiendo formato dd/mm/yyyy
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    // Si no se puede parsear, retornar fecha inválida
    return new Date(dateStr);
}

// Generar reporte personalizado
function generateCustomReport(filteredOrders, filteredGastos, type) {
    const prefix = type; // 'week' o 'month'
    
    if (filteredOrders.length === 0 && filteredGastos.length === 0) {
        alert('No hay datos para el período seleccionado');
        return;
    }
    
    // Agrupar por chofer
    const choferData = {};
    let totalMillares = 0;
    let ventaTotal = 0;
    let costoFabricaTotal = 0;
    
    // Procesar pedidos
    filteredOrders.forEach(order => {
        const chofer = order.chofer;
        if (!choferData[chofer]) {
            choferData[chofer] = {
                millares: 0,
                costoFabrica: 0,
                gastos: 0,
                petroleo: 0,
                pagoChofer: 0,
                ventas: 0
            };
        }
        
        const cantidad = parseFloat(order.cantidad || 0);
        const esTecho = order.tipoLadrillo === 'H-15' || order.tipoLadrillo === 'H-15 SEG' || 
                       order.tipoLadrillo === 'H-12' || order.tipoLadrillo === 'H-12 SEG' || 
                       order.tipoLadrillo === 'H-20';
        
        let millares = 0;
        if (esTecho) {
            millares = cantidad / 350;
        } else {
            millares = cantidad / 1000;
        }
        
        choferData[chofer].millares += millares;
        totalMillares += millares;
        
        const fabrica = order.fabrica;
        const tipoLadrillo = order.tipoLadrillo;
        const precioPlanta = preciosPlanta[fabrica] && preciosPlanta[fabrica][tipoLadrillo] 
            ? preciosPlanta[fabrica][tipoLadrillo] 
            : 0;
        const costoFabricaOrder = millares * precioPlanta * 1000;
        
        choferData[chofer].costoFabrica += costoFabricaOrder;
        costoFabricaTotal += costoFabricaOrder;
        
        const pagoChoferOrder = millares * 59;
        choferData[chofer].pagoChofer += pagoChoferOrder;
        
        const ventasOrder = parseFloat(order.total || 0);
        choferData[chofer].ventas += ventasOrder;
        ventaTotal += ventasOrder;
    });
    
    // Procesar gastos
    filteredGastos.forEach(gasto => {
        const chofer = gasto.chofer;
        if (!choferData[chofer]) {
            choferData[chofer] = {
                millares: 0,
                costoFabrica: 0,
                gastos: 0,
                petroleo: 0,
                pagoChofer: 0,
                ventas: 0
            };
        }
        
        choferData[chofer].gastos += gasto.totalGastos || 0;
        choferData[chofer].petroleo += gasto.petroleo || 0;
    });
    
    // Calcular totales
    const totalGastos = Object.values(choferData).reduce((sum, data) => sum + data.gastos, 0);
    const totalPagoChoferes = totalMillares * 59;
    const gananciaTotal = ventaTotal - costoFabricaTotal - totalGastos - totalPagoChoferes;
    
    // Actualizar resumen
    document.getElementById(`${prefix}-total-millares`).textContent = totalMillares.toFixed(2);
    document.getElementById(`${prefix}-venta-total`).textContent = 'S/' + ventaTotal.toFixed(2);
    document.getElementById(`${prefix}-costo-fabrica`).textContent = 'S/' + costoFabricaTotal.toFixed(2);
    document.getElementById(`${prefix}-ganancia-choferes`).textContent = 'S/' + totalPagoChoferes.toFixed(2);
    document.getElementById(`${prefix}-total-gastos`).textContent = 'S/' + totalGastos.toFixed(2);
    document.getElementById(`${prefix}-ganancia-total`).textContent = 'S/' + Math.abs(gananciaTotal).toFixed(2);
    
    // Generar tabla
    let tableHTML = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Millares</th>
                    <th>Costo Fábrica</th>
                    <th>Gastos</th>
                    <th>Petroleo</th>
                    <th>Pago Chofer</th>
                    <th>Ventas</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    Object.keys(choferData).forEach(chofer => {
        const data = choferData[chofer];
        tableHTML += `
            <tr>
                <td><strong>${chofer}</strong></td>
                <td>${data.millares.toFixed(2)}</td>
                <td>S/${data.costoFabrica.toFixed(2)}</td>
                <td>S/${data.gastos.toFixed(2)}</td>
                <td>S/${data.petroleo.toFixed(2)}</td>
                <td>S/${data.pagoChofer.toFixed(2)}</td>
                <td>S/${data.ventas.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    
    document.getElementById(`${prefix}-report-table-container`).innerHTML = tableHTML;
    document.getElementById(`${prefix}-report-results`).style.display = 'block';
}

// Funciones de impresión para nuevos reportes
function printVendorReport() {
    const contentDiv = document.getElementById('vendor-report-content');
    const today = new Date();
    const fechaReporte = today.toLocaleDateString('es-ES');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Reporte por Vendedor - Ladrillería</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #8B1538; color: white; font-weight: bold; }
                    h1, h3 { color: #8B1538; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <h1 style="text-align: center;">REPORTE POR VENDEDOR - LADRILLERÍA</h1>
                <p style="text-align: center;"><strong>Fecha del Reporte:</strong> ${fechaReporte}</p>
                ${contentDiv.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printWeekReport() {
    printCustomReport('week', 'REPORTE SEMANAL');
}

function printMonthReport() {
    printCustomReport('month', 'REPORTE MENSUAL');
}

function printCustomReport(type, title) {
    const startDate = type === 'week' ? document.getElementById('week-start-date').value : '';
    const endDate = type === 'week' ? document.getElementById('week-end-date').value : '';
    const month = type === 'month' ? document.getElementById('month-select').selectedOptions[0].text : '';
    const year = type === 'month' ? document.getElementById('year-select').value : '';
    
    const periodo = type === 'week' 
        ? `Del ${startDate} al ${endDate}`
        : `${month} ${year}`;
    
    const summaryHTML = document.getElementById(`${type}-report-results`).querySelector('.report-summary').outerHTML;
    const tableHTML = document.getElementById(`${type}-report-table-container`).innerHTML;
    
    const today = new Date();
    const fechaReporte = today.toLocaleDateString('es-ES');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${title} - Ladrillería</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #8B1538; color: white; font-weight: bold; }
                    h1, h3 { color: #8B1538; }
                    .report-summary { background: #FAF6F7; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <h1 style="text-align: center;">${title} - LADRILLERÍA</h1>
                <p style="text-align: center;"><strong>Período:</strong> ${periodo}</p>
                <p style="text-align: center;"><strong>Fecha del Reporte:</strong> ${fechaReporte}</p>
                ${summaryHTML}
                ${tableHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Actualizar función showScreen para cargar datos según la pantalla
const originalShowScreen = showScreen;
showScreen = function(screenId) {
    originalShowScreen(screenId);
    
    // Cargar datos específicos según la pantalla
    if (screenId === 'report-by-vendor') {
        loadVendorReport();
    } else if (screenId === 'report-by-month-filter' && !document.getElementById('year-select').options.length) {
        initializeYearSelector();
    } else if (screenId === 'cloud-sync') {
        loadCloudSyncScreen();
    }
};

// ==================== FUNCIONES DE SINCRONIZACIÓN EN LA NUBE ====================

// Configuración de Firebase (hardcoded - sincronización automática invisible)
let firebaseConfig = {
    apiKey: "AIzaSyA1oBwgXD_R_2KHqKvtRE248QiCtu4uoRA",
    databaseURL: "https://ladrilleria-c5d8a-default-rtdb.firebaseio.com",
    projectId: "ladrilleria-c5d8a"
};
let autoSyncEnabled = true; // Siempre activado
let autoSyncInterval = null;

// Cargar pantalla de sincronización
function loadCloudSyncScreen() {
    // Cargar configuración guardada
    const savedConfig = localStorage.getItem('firebaseConfig');
    if (savedConfig) {
        try {
            firebaseConfig = JSON.parse(savedConfig);
            document.getElementById('firebase-apiKey').value = firebaseConfig.apiKey || '';
            document.getElementById('firebase-databaseURL').value = firebaseConfig.databaseURL || '';
            document.getElementById('firebase-projectId').value = firebaseConfig.projectId || '';
            
            updateFirebaseStatus(true);
            document.getElementById('sync-panel').style.display = 'block';
        } catch (e) {
            console.error('Error cargando configuración:', e);
        }
    }
    
    // Actualizar contadores
    document.getElementById('local-count').textContent = orders.length + gastos.length;
    
    // Verificar auto-sync
    const autoSync = localStorage.getItem('autoSyncEnabled');
    if (autoSync === 'true') {
        autoSyncEnabled = true;
        document.getElementById('auto-sync-status').textContent = 'Activada ✅';
    }
}

// Guardar configuración de Firebase
function saveFirebaseConfig() {
    const apiKey = document.getElementById('firebase-apiKey').value.trim();
    const databaseURL = document.getElementById('firebase-databaseURL').value.trim();
    const projectId = document.getElementById('firebase-projectId').value.trim();
    
    if (!apiKey || !databaseURL || !projectId) {
        showCloudMessage('⚠️ Por favor completa todos los campos', 'error');
        return;
    }
    
    if (!databaseURL.includes('firebaseio.com') && !databaseURL.includes('firebasedatabase.app')) {
        showCloudMessage('⚠️ La URL de la base de datos no parece válida', 'error');
        return;
    }
    
    firebaseConfig = {
        apiKey: apiKey,
        databaseURL: databaseURL,
        projectId: projectId
    };
    
    localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
    showCloudMessage('✅ Configuración guardada correctamente', 'success');
    updateFirebaseStatus(true);
    document.getElementById('sync-panel').style.display = 'block';
}

// Actualizar estado de Firebase
function updateFirebaseStatus(configured) {
    const statusDiv = document.getElementById('firebase-config-status');
    const statusText = document.getElementById('firebase-status-text');
    const statusDesc = document.getElementById('firebase-status-desc');
    
    if (configured) {
        statusDiv.style.background = '#d4edda';
        statusDiv.style.borderColor = '#c3e6cb';
        statusText.textContent = 'Configurado ✅';
        statusText.style.color = '#155724';
        statusDesc.textContent = 'La sincronización está lista para usar';
        statusDesc.style.color = '#155724';
    } else {
        statusDiv.style.background = '#fff3cd';
        statusDiv.style.borderColor = '#ffc107';
        statusText.textContent = 'No Configurado';
        statusText.style.color = '#856404';
        statusDesc.textContent = 'Configura Firebase para habilitar la sincronización';
        statusDesc.style.color = '#666';
    }
}

// Probar conexión con Firebase
async function testFirebaseConnection() {
    if (!firebaseConfig) {
        showCloudMessage('⚠️ Primero debes guardar la configuración', 'error');
        return;
    }
    
    showCloudMessage('🔄 Probando conexión...', 'info');
    
    try {
        const testUrl = firebaseConfig.databaseURL + '/test.json';
        const response = await fetch(testUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timestamp: new Date().toISOString() })
        });
        
        if (response.ok) {
            showCloudMessage('✅ Conexión exitosa con Firebase', 'success');
        } else {
            showCloudMessage('❌ Error de conexión. Verifica la configuración', 'error');
        }
    } catch (error) {
        showCloudMessage('❌ Error: ' + error.message, 'error');
    }
}

// Subir datos a la nube
async function syncToCloud() {
    if (!firebaseConfig) {
        showCloudMessage('⚠️ Configura Firebase primero', 'error');
        return;
    }
    
    showCloudMessage('🔄 Subiendo datos a la nube...', 'info');
    
    try {
        const data = {
            orders: orders,
            gastos: gastos,
            lastSync: new Date().toISOString(),
            totalRecords: orders.length + gastos.length
        };
        
        const url = firebaseConfig.databaseURL + '/ladrilleria.json';
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showCloudMessage('✅ Datos sincronizados: ' + orders.length + ' pedidos y ' + gastos.length + ' gastos', 'success');
        } else {
            showCloudMessage('❌ Error al subir datos', 'error');
        }
    } catch (error) {
        showCloudMessage('❌ Error: ' + error.message, 'error');
    }
}

// Descargar datos de la nube
async function syncFromCloud() {
    if (!firebaseConfig) {
        showCloudMessage('⚠️ Configura Firebase primero', 'error');
        return;
    }
    
    showCloudMessage('🔄 Descargando datos de la nube...', 'info');
    
    try {
        const url = firebaseConfig.databaseURL + '/ladrilleria.json';
        const response = await fetch(url);
        
        if (!response.ok) {
            showCloudMessage('❌ Error al descargar datos', 'error');
            return;
        }
        
        const data = await response.json();
        
        if (!data || !data.orders || !data.gastos) {
            showCloudMessage('ℹ️ No hay datos en la nube aún', 'info');
            return;
        }
        
        // Preguntar si quiere reemplazar o combinar
        const replace = confirm(
            '¿Cómo quieres sincronizar?\n\n' +
            '✅ ACEPTAR = Reemplazar datos locales con los de la nube\n' +
            '❌ CANCELAR = Mantener datos locales\n\n' +
            'Datos en la nube: ' + data.orders.length + ' pedidos, ' + data.gastos.length + ' gastos'
        );
        
        if (replace) {
            orders = data.orders;
            gastos = data.gastos;
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('gastos', JSON.stringify(gastos));
            showCloudMessage('✅ Datos sincronizados desde la nube: ' + orders.length + ' pedidos, ' + gastos.length + ' gastos', 'success');
            document.getElementById('local-count').textContent = orders.length + gastos.length;
        }
    } catch (error) {
        showCloudMessage('❌ Error: ' + error.message, 'error');
    }
}

// Activar/Desactivar sincronización automática
function enableAutoSync() {
    if (!firebaseConfig) {
        showCloudMessage('⚠️ Configura Firebase primero', 'error');
        return;
    }
    
    autoSyncEnabled = !autoSyncEnabled;
    localStorage.setItem('autoSyncEnabled', autoSyncEnabled.toString());
    
    if (autoSyncEnabled) {
        document.getElementById('auto-sync-status').textContent = 'Activada ✅';
        showCloudMessage('✅ Sincronización automática activada (cada 5 minutos)', 'success');
        
        // Sincronizar inmediatamente
        syncToCloud();
        
        // Configurar intervalo de 5 minutos
        autoSyncInterval = setInterval(() => {
            syncToCloud();
        }, 5 * 60 * 1000);
    } else {
        document.getElementById('auto-sync-status').textContent = 'Desactivada';
        showCloudMessage('ℹ️ Sincronización automática desactivada', 'info');
        
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
            autoSyncInterval = null;
        }
    }
}

// Mostrar mensajes de sincronización
function showCloudMessage(message, type) {
    const element = document.getElementById('cloud-sync-status');
    element.style.display = 'block';
    element.textContent = message;
    
    if (type === 'success') {
        element.style.background = '#d4edda';
        element.style.color = '#155724';
        element.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        element.style.background = '#f8d7da';
        element.style.color = '#721c24';
        element.style.border = '1px solid #f5c6cb';
    } else if (type === 'info') {
        element.style.background = '#d1ecf1';
        element.style.color = '#0c5460';
        element.style.border = '1px solid #bee5eb';
    }
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 7000);
}

// Auto-sincronizar al guardar pedido o gasto (completamente invisible)
const originalSaveOrder = saveOrder;
saveOrder = function() {
    originalSaveOrder();
    // Sincronizar automáticamente después de guardar
    setTimeout(() => syncToCloudQuietly(), 1000);
};

const originalSaveGastos = saveGastos;
saveGastos = function() {
    originalSaveGastos();
    // Sincronizar automáticamente después de guardar
    setTimeout(() => syncToCloudQuietly(), 1000);
};

// Iniciar auto-sync automáticamente (completamente invisible)
window.addEventListener('load', function() {
    // Iniciar sincronización automática sin preguntar
    setTimeout(() => {
        startAutoSync();
    }, 2000); // Espera 2 segundos después de cargar
});

// Función para iniciar auto-sync
async function startAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }
    
    // PRIMERO: Descargar datos de la nube al iniciar
    await syncFromCloudQuietly();
    
    // LUEGO: Configurar sincronización periódica para subir cambios
    autoSyncInterval = setInterval(() => {
        syncToCloudQuietly();
    }, 5 * 60 * 1000); // Cada 5 minutos
}

// Descargar datos de la nube silenciosamente al iniciar
async function syncFromCloudQuietly() {
    if (!firebaseConfig) return;
    
    try {
        const url = firebaseConfig.databaseURL + '/ladrilleria.json';
        const response = await fetch(url);
        
        if (!response.ok) {
            console.log('No hay datos en la nube o error al descargar');
            return;
        }
        
        const data = await response.json();
        
        // Si no hay datos en la nube, no hacer nada
        if (!data || !data.orders || !data.gastos) {
            console.log('No hay datos en Firebase todavía');
            return;
        }
        
        // Combinar datos: Firebase tiene prioridad pero preservar datos locales nuevos
        const cloudOrders = data.orders || [];
        const cloudGastos = data.gastos || [];
        
        // Crear un mapa de IDs para evitar duplicados
        const orderIds = new Set(cloudOrders.map(o => o.id));
        const gastoIds = new Set(cloudGastos.map(g => g.id));
        
        // Agregar datos locales que no estén en la nube
        orders.forEach(order => {
            if (!orderIds.has(order.id)) {
                cloudOrders.push(order);
            }
        });
        
        gastos.forEach(gasto => {
            if (!gastoIds.has(gasto.id)) {
                cloudGastos.push(gasto);
            }
        });
        
        // Actualizar datos locales con los combinados
        orders = cloudOrders;
        gastos = cloudGastos;
        
        // Guardar en localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('gastos', JSON.stringify(gastos));
        
        console.log('✅ Datos sincronizados desde la nube:', orders.length, 'pedidos,', gastos.length, 'gastos');
        
        // Subir datos combinados de vuelta a la nube
        await syncToCloudQuietly();
        
    } catch (error) {
        console.error('Error al descargar de la nube:', error);
    }
}

// Sincronizar silenciosamente (subir a la nube)
async function syncToCloudQuietly() {
    if (!firebaseConfig) return;
    
    try {
        const data = {
            orders: orders,
            gastos: gastos,
            lastSync: new Date().toISOString(),
            totalRecords: orders.length + gastos.length
        };
        
        const url = firebaseConfig.databaseURL + '/ladrilleria.json';
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Sincronización exitosa (silenciosa, sin notificaciones)
        if (response.ok) {
            console.log('✅ Datos subidos a la nube:', orders.length, 'pedidos,', gastos.length, 'gastos');
        }
    } catch (error) {
        // Error silencioso, solo en consola
        console.error('Error al subir a la nube:', error);
    }
}

// enableAutoSync no se usa más (sincronización siempre activada)
function enableAutoSync() {
    // Función vacía - la sincronización siempre está activada
    return;
}

// ==================== FIN FUNCIONES DE SINCRONIZACIÓN EN LA NUBE ====================

// ==================== FIN DE NUEVAS FUNCIONES ====================
