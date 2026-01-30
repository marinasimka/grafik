const daysGrid = document.getElementById('daysGrid');
const yavkaDetails = document.getElementById('yavkaDetails');

document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
});

function renderCalendar() {
    daysGrid.innerHTML = '';
    
    brigadeData.schedule.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        if (day.isWeekend) {
            dayCard.classList.add('weekend');
        } else if (!day.yavka) {
            dayCard.classList.add('empty');
        }
        
        let yavkaContent = '';
        let statusText = '';
        
        if (day.yavka) {
            yavkaContent = `
                <div class="yavka-badge" onclick="showYavkaDetail('${day.yavka}')">
                    ${day.yavka}
                </div>
            `;
            statusText = "Явка";
        } else {
            yavkaContent = '<div class="empty-yavka">-</div>';
            statusText = day.isWeekend ? "Выходной" : "";
        }
        
        dayCard.innerHTML = `
            <div class="day-number">${day.day}</div>
            <div class="day-yavka">
                ${yavkaContent}
                <div class="day-status">${statusText}</div>
            </div>
        `;
        
        daysGrid.appendChild(dayCard);
    });
}

function showYavkaDetail(yavkaNumber) {
    const yavka = yavkaDatabase[yavkaNumber];
    
    if (!yavka) {
        yavkaDetails.innerHTML = `
            <div class="yavka-detail-card">
                <div class="detail-header">
                    <div class="detail-title">
                        <h4>Информация о явке</h4>
                    </div>
                </div>
                <div style="padding: 20px; text-align: center; color: #c53030;">
                    Информация о явке ${yavkaNumber} не найдена
                </div>
            </div>
        `;
        return;
    }
    
    const detailHTML = `
        <div class="yavka-detail-card">
            <div class="detail-header">
                <div class="detail-title">
                    <h4>Явка №${yavka.number}</h4>
                </div>
            </div>
            
            <div class="detail-content">
                <div class="detail-group">
                    <h5>Основная информация</h5>
                    <div class="detail-row">
                        <span class="detail-label">Номер явки:</span>
                        <span class="detail-value">${yavka.number}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Время явки:</span>
                        <span class="detail-value">${yavka.time}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Время сдачи:</span>
                        <span class="detail-value">${yavka.сдача}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Рабочее время:</span>
                        <span class="detail-value">${yavka.рабочееВремя}</span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <h5>Детали работы</h5>
                    <div class="detail-row">
                        <span class="detail-label">Из-под поезда:</span>
                        <span class="detail-value">${yavka.изПодПоезда || "-"}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Номер поездов:</span>
                        <span class="detail-value">
                            <div style="text-align: left;">
                                ${yavka.номерПоездов}
                            </div>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    yavkaDetails.innerHTML = detailHTML;
    
    yavkaDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
}