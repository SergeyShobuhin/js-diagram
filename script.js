document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = "http://51.250.13.229/api/safetyEnterprise/";

    const tableContainer = document.getElementById('tableContainer');
    const chartContainer = document.getElementById('chartContainer');
    const errorContainer = document.createElement('div');
    errorContainer.setAttribute('id', 'errorContainer');
    tableContainer.appendChild(errorContainer);

    const fieldLabels = {
        'REPEAT_ENT': 'Коэф. повторяемости',
        'FACTOR_ELIMINATE': 'Коэф. устраняемости',
        'KOL_NARUSH': 'Кол-во нарушений',
        'KOL_PREDPIS': 'Кол-во предписаний',
        'PRIOSTANOVKI': 'Приостановки',
        'ISP_V_SROK': 'Выполнены в срок',
        'ISP_NE_V_SROK': 'Выполнены не в срок',
        'NE_ISTEK_SROK': 'На контроле',
        'ISTEK_SROK': 'Просрочено',
        'VYP': 'Выполнено'
    };

    function createFieldSelect() {
        const select = document.getElementById('fieldSelect');
        Object.keys(fieldLabels).forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = fieldLabels[field];
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            fetchData(); // Перезагружаем данные при изменении выбора
        });
    }

    function fetchData() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                createTable(data);
                const selectedField = document.getElementById('fieldSelect').value;
                createBarChart(data, selectedField);
            })
            .catch(error => {
                showError(`Не удалось подключиться к серверу: ${error.message}`);
            });
    }

    // Функция для создания таблицы
    function createTable(data) {
        tableContainer.innerHTML = ''; // Очищаем контейнер перед вставкой новой таблицы
        errorContainer.innerHTML = ''; // Удаляем сообщения об ошибке

        const table = document.createElement('table');
        table.setAttribute('border', '1');
        table.setAttribute('cellpadding', '10');
        table.setAttribute('cellspacing', '0');

        // Создаем заголовок таблицы
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = [
            'Предприятие', 'Коэф. повторяемости', 'Коэф. устраняемости', 'Кол-во нарушений',
            'Кол-во предписаний', 'Приостановки', 'Выполнены в срок', 'Выполнены не в срок', 'На контроле',
            'Просрочено', 'Выполнено'
        ];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Создаем тело таблицы
        const tbody = document.createElement('tbody');

        data.forEach(item => {
            const row = document.createElement('tr');

            const fields = [
                item.PREDPR_NAIM,
                item.REPEAT_ENT,
                item.FACTOR_ELIMINATE,
                item.KOL_NARUSH,
                item.KOL_PREDPIS,
                item.PRIOSTANOVKI,
                item.ISP_V_SROK,
                item.ISP_NE_V_SROK,
                item.NE_ISTEK_SROK,
                item.ISTEK_SROK,
                item.VYP
            ];

            fields.forEach(fieldValue => {
                const td = document.createElement('td');
                td.textContent = fieldValue;
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        // Добавляем таблицу в контейнер
        tableContainer.appendChild(table);
    }

    function createBarChart(data, selectedField) {
        chartContainer.innerHTML = ''; // Очищаем контейнер перед построением диаграммы

        const canvas = document.createElement('canvas');
        canvas.width = chartContainer.clientWidth; // Устанавливаем ширину canvas равной ширине контейнера
        canvas.height = 400; // Задаем фиксированную высоту
        chartContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        const labels = data.map(item => item.PREDPR_NAIM); // Названия предприятий
        const values = data.map(item => parseFloat(item[selectedField])); // Выбранное значение

        const chartWidth = canvas.width;
        const barWidth = Math.max((chartWidth - 100) / values.length * 0.7, 20); // Ширина столбца пропорциональна количеству данных
        const gap = Math.max((chartWidth - 100) / values.length * 0.3, 10); // Промежуток между столбцами
        const maxBarHeight = 300;

        const maxValue = Math.max(...values);

        // Рисуем оси
        ctx.beginPath();
        ctx.moveTo(50, 10);
        ctx.lineTo(50, maxBarHeight + 50);
        ctx.lineTo(chartWidth - 20, maxBarHeight + 50);
        ctx.stroke();

        // Устанавливаем размер шрифта для меток
        ctx.font = '14px Arial'; // Задаем шрифт и его размер
        ctx.fillStyle = '#000';  // Цвет текста

        // Рисуем столбцы
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * maxBarHeight;
            const x = 60 + index * (barWidth + gap);
            const y = maxBarHeight + 50 - barHeight;

            // Рисуем столбик
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Рисуем метки под столбиком
            ctx.fillStyle = '#000';  // Цвет текста
            ctx.fillText(labels[index], x, maxBarHeight + 70);

            // Рисуем значения над столбиком
            ctx.fillText(value, x + barWidth / 4, y - 10);
        });
    }

    function showError(errorMessage) {
        errorContainer.innerHTML = `<p style="color: red;">${errorMessage}</p>`;
    }

    createFieldSelect();
    fetchData();
});
