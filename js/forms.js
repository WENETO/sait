// ===== ОБРАБОТКА ФОРМ (БЕЗ ОТПРАВКИ НА СЕРВЕР) =====

// Инициализация всех форм
function initForms() {
    const forms = document.querySelectorAll('form');
    
    console.log(`Найдено форм: ${forms.length}`);
    
    forms.forEach((form, index) => {
        form.setAttribute('data-form-id', index);
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(this);
        });
        
        // Добавляем валидацию в реальном времени
        addLiveValidation(form);
    });
    
    // Особые обработчики для отдельных форм
    const consultForm = document.getElementById('consultForm');
    const orderForm = document.getElementById('orderForm');
    const footerForm = document.getElementById('footerForm');
    const calculatorForm = document.getElementById('calculatorForm');
    const reviewForm = document.getElementById('reviewForm');
    
    if (consultForm) {
        console.log('Форма консультации загружена');
    }
    
    if (orderForm) {
        console.log('Форма заказа загружена');
        
        // Добавляем проверку ознакомления с памяткой
        const clientMemoAgreement = orderForm.querySelector('#clientMemoAgreement');
        if (clientMemoAgreement) {
            const submitBtn = orderForm.querySelector('button[type="submit"]');
            
            clientMemoAgreement.addEventListener('change', function() {
                if (submitBtn) {
                    submitBtn.disabled = !this.checked;
                }
            });
            
            // Инициализация состояния кнопки
            if (submitBtn) {
                submitBtn.disabled = !clientMemoAgreement.checked;
            }
        }
    }
    
    if (footerForm) {
        console.log('Форма в футере загружена');
    }
    
    if (calculatorForm) {
        console.log('Форма калькулятора загружена');
        
        // Обработка калькулятора
        calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCalculatorFormSubmit(this);
        });
    }
    
    if (reviewForm) {
        console.log('Форма отзыва загружена');
        
        // Обработка формы отзыва
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleReviewFormSubmit(this);
        });
    }
}

// Обработка отправки формы
function handleFormSubmit(form) {
    // Собираем данные формы
    const formData = new FormData(form);
    const data = {};
    const formId = form.getAttribute('data-form-id');
    
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Добавляем дополнительную информацию
    data.formId = formId;
    data.formName = form.id || 'unnamed-form';
    data.timestamp = new Date().toISOString();
    data.pageUrl = window.location.href;
    
    // Для формы заказа проверяем ознакомление с памяткой
    if (form.id === 'orderForm') {
        const memoAgreement = formData.get('clientMemoAgreement');
        if (!memoAgreement) {
            if (window.DEZ && window.DEZ.showNotification) {
                window.DEZ.showNotification('Необходимо ознакомиться с Памяткой клиенту и подтвердить согласие', 'error');
            } else {
                alert('Необходимо ознакомиться с Памяткой клиенту и подтвердить согласие');
            }
            return;
        }
    }
    
    // В реальном сайте здесь была бы отправка на сервер
    console.log('Данные формы получены:', data);
    
    // Определяем тип формы для сообщения
    let message = 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.';
    
    if (form.id === 'consultForm') {
        message = 'Спасибо за заявку на консультацию! Наш специалист перезвонит вам в течение 15 минут.';
    } else if (form.id === 'orderForm') {
        message = 'Заявка на услугу оформлена! Мы перезвоним для уточнения деталей.';
    } else if (form.id === 'footerForm') {
        message = 'Спасибо! Мы перезвоним вам в рабочее время.';
    } else if (form.classList.contains('subscribe-form')) {
        message = 'Спасибо за подписку! Вы будете получать полезные статьи на почту.';
    } else if (form.id === 'calculatorForm') {
        message = 'Заявка из калькулятора создана! Точную стоимость уточнит специалист после выезда.';
    } else if (form.id === 'reviewForm') {
        message = 'Спасибо за ваш отзыв! Он будет опубликован после модерации.';
    }
    
    // Показать уведомление
    if (window.DEZ && window.DEZ.showNotification) {
        window.DEZ.showNotification(message, 'success');
    } else {
        alert(message);
    }
    
    // Закрываем модальное окно, если форма в нем
    const modal = form.closest('.modal');
    if (modal) {
        if (window.DEZ && window.DEZ.closeAllModals) {
            window.DEZ.closeAllModals();
        } else {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Очищаем форму
    form.reset();
    
    // Специальная обработка для калькулятора
    if (form.id === 'calculatorForm') {
        const totalPriceElement = document.getElementById('totalPrice');
        const areaValue = document.getElementById('areaValue');
        const areaRange = document.getElementById('area');
        const serviceTypeSelect = document.getElementById('serviceType');
        const propertyTypeSelect = document.getElementById('propertyType');
        
        if (totalPriceElement) totalPriceElement.textContent = '0 ₽';
        if (areaValue) areaValue.textContent = '50 м²';
        if (areaRange) areaRange.value = 50;
        if (serviceTypeSelect) serviceTypeSelect.selectedIndex = 0;
        if (propertyTypeSelect) propertyTypeSelect.selectedIndex = 0;
        
        // Сбрасываем чекбоксы
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    // Сохраняем в localStorage для истории (опционально)
    saveFormToHistory(data);
}

// Обработка формы калькулятора
function handleCalculatorFormSubmit(form) {
    // Получаем данные из формы
    const serviceTypeSelect = document.getElementById('serviceType');
    const propertyTypeSelect = document.getElementById('propertyType');
    const areaRange = document.getElementById('area');
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (!serviceTypeSelect || !propertyTypeSelect || !areaRange || !totalPriceElement) {
        handleFormSubmit(form);
        return;
    }
    
    const serviceTypeText = serviceTypeSelect.options[serviceTypeSelect.selectedIndex].text;
    const propertyTypeText = propertyTypeSelect.options[propertyTypeSelect.selectedIndex].text;
    const area = areaRange.value;
    const price = totalPriceElement.textContent;
    
    // Получаем выбранные опции
    const selectedOptions = [];
    const checkboxes = document.querySelectorAll('input[name="options"]:checked');
    checkboxes.forEach(checkbox => {
        if (checkbox.value === 'urgent') selectedOptions.push('Срочный выезд');
        if (checkbox.value === 'strengthened') selectedOptions.push('Усиленная защита');
        if (checkbox.value === 'barrier') selectedOptions.push('Барьерная защита');
        if (checkbox.value === 'odorless') selectedOptions.push('Препараты без запаха');
        if (checkbox.value === 'sticker') selectedOptions.push('Наклейка сеточки от тараканов');
    });
    
    // Заполняем поле услуги в форме заказа
    const serviceInput = document.getElementById('serviceInput');
    if (serviceInput) {
        let serviceText = `${serviceTypeText} для ${propertyTypeText} (${area} м²)`;
        if (selectedOptions.length > 0) {
            serviceText += ` + ${selectedOptions.join(', ')}`;
        }
        serviceText += ` - ${price}`;
        serviceInput.value = serviceText;
    }
    
    // Показываем модальное окно заказа
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
        if (window.DEZ && window.DEZ.closeAllModals) {
            window.DEZ.closeAllModals();
        }
        orderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Сбрасываем состояние кнопки отправки
        const submitBtn = orderModal.querySelector('button[type="submit"]');
        const memoCheckbox = orderModal.querySelector('#clientMemoAgreement');
        if (submitBtn && memoCheckbox) {
            submitBtn.disabled = !memoCheckbox.checked;
        }
    }
    
    // Отправляем данные формы
    handleFormSubmit(form);
}

// Обработка формы отзыва
function handleReviewFormSubmit(form) {
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Добавляем дополнительную информацию
    data.date = new Date().toLocaleDateString('ru-RU');
    data.timestamp = new Date().toISOString();
    
    console.log('Данные отзыва получены:', data);
    
    // Сохраняем отзыв
    if (window.DEZ && window.DEZ.saveReviewToStorage) {
        window.DEZ.saveReviewToStorage(data);
    }
    
    // Добавляем отзыв на страницу
    if (window.DEZ && window.DEZ.addReviewToPage) {
        window.DEZ.addReviewToPage(data);
    }
    
    // Показываем уведомление
    if (window.DEZ && window.DEZ.showNotification) {
        window.DEZ.showNotification('Спасибо за ваш отзыв! Он будет опубликован после модерации.', 'success');
    } else {
        alert('Спасибо за ваш отзыв! Он будет опубликован после модерации.');
    }
    
    // Закрываем модальное окно
    const modal = form.closest('.modal');
    if (modal) {
        if (window.DEZ && window.DEZ.closeAllModals) {
            window.DEZ.closeAllModals();
        } else {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Очищаем форму
    form.reset();
    
    // Сброс звезд рейтинга
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');
    if (stars.length > 0 && ratingValue) {
        stars.forEach(s => {
            s.classList.remove('selected');
            s.style.color = '#ddd';
        });
        stars[4].classList.add('selected');
        stars[4].style.color = '#ff9800';
        ratingValue.value = '5';
    }
}

// Валидация в реальном времени
function addLiveValidation(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Валидация отдельного поля
function validateField(field) {
    clearFieldError(field);
    
    if (!field.value.trim()) {
        showFieldError(field, 'Это поле обязательно для заполнения');
        return false;
    }
    
    if (field.type === 'tel') {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
        if (!phoneRegex.test(field.value)) {
            showFieldError(field, 'Введите корректный номер телефона');
            return false;
        }
    }
    
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            showFieldError(field, 'Введите корректный email');
            return false;
        }
    }
    
    return true;
}

// Показать ошибку поля
function showFieldError(field, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #dc3545;
        font-size: 0.85rem;
        margin-top: 5px;
        padding: 3px 0;
    `;
    
    // Удаляем предыдущую ошибку
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    field.parentNode.appendChild(errorElement);
    field.style.borderColor = '#dc3545';
}

// Очистить ошибку поля
function clearFieldError(field) {
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.style.borderColor = '';
}

// Сохранение формы в истории (localStorage)
function saveFormToHistory(formData) {
    try {
        const history = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        
        // Ограничиваем историю последними 50 заявками
        history.unshift(formData);
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem('formSubmissions', JSON.stringify(history));
        console.log('Заявка сохранена в историю. Всего заявок:', history.length);
    } catch (e) {
        console.warn('Не удалось сохранить заявку в историю:', e);
    }
}

// Получение истории заявок
function getFormHistory() {
    try {
        return JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    } catch (e) {
        console.warn('Не удалось загрузить историю заявок:', e);
        return [];
    }
}

// Очистка истории заявок
function clearFormHistory() {
    localStorage.removeItem('formSubmissions');
    console.log('История заявок очищена');
}

// Получение истории отзывов
function getReviewsHistory() {
    try {
        return JSON.parse(localStorage.getItem('dezReviews') || '[]');
    } catch (e) {
        console.warn('Не удалось загрузить историю отзывов:', e);
        return [];
    }
}

// Очистка истории отзывов
function clearReviewsHistory() {
    localStorage.removeItem('dezReviews');
    console.log('История отзывов очищена');
    
    if (window.DEZ && window.DEZ.showNotification) {
        window.DEZ.showNotification('История отзывов очищена', 'success');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initForms();
});

// Экспорт функций для использования в консоли
window.Forms = {
    initForms,
    handleFormSubmit,
    handleCalculatorFormSubmit,
    handleReviewFormSubmit,
    getFormHistory,
    clearFormHistory,
    getReviewsHistory,
    clearReviewsHistory,
    validateField
};