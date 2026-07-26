// ===== Google Apps Script Web App URL =====
const FORM_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztx9C3R5Mm3VBnMU9OPGXbb7RIgZMcX8K6yUtuLeYaQ6ai-mtyJWIQu-joQws1CtLO/exec';

// ===== Handle Consultation Form Submission =====
const consultationForm = document.getElementById('consultation-form');
if (consultationForm) {
    consultationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('📝 Form submitted');
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Validate consultation areas
        const consultationAreas = formData.getAll('consultationAreas');
        if (consultationAreas.length === 0) {
            alert('لطفاً حداقل یک حوزه مشاوره را انتخاب کنید');
            return;
        }
        
        // Prepare data
        const data = {
            timestamp: new Date().toLocaleString('fa-IR'),
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            projectType: formData.get('projectType'),
            executedBy: formData.get('executedBy'),
            consultationAreas: consultationAreas,
            description: formData.get('description') || '-'
        };
        
        console.log('📤 Sending data:', data);
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> در حال ارسال...';
        
        const successMsg = document.getElementById('form-success');
        const errorMsg = document.getElementById('form-error');
        
        if (successMsg) successMsg.classList.add('hidden');
        if (errorMsg) errorMsg.classList.add('hidden');
        
        try {
            const response = await fetch(FORM_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            console.log('✅ Request sent');
            
            // Show success (no-cors doesn't return response)
            if (successMsg) successMsg.classList.remove('hidden');
            form.reset();
            
            setTimeout(() => {
                closeConsultationModal();
            }, 3000);
            
        } catch (error) {
            console.error('❌ Form error:', error);
            if (errorMsg) {
                errorMsg.classList.remove('hidden');
                errorMsg.textContent = 'خطا: ' + error.message;
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// ===== Phone Validation =====
const phoneInput = document.querySelector('input[name="phone"]');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value;
        
        // Convert Persian to English digits
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';
        
        for (let i = 0; i < persianDigits.length; i++) {
            value = value.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
        }
        
        // Remove non-numeric
        value = value.replace(/[^0-9]/g, '');
        
        // Limit to 11 digits
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        e.target.value = value;
    });
}

// ===== Form Validation =====
const formInputs = document.querySelectorAll('#consultation-form input, #consultation-form select, #consultation-form textarea');

formInputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            input.classList.add('border-red-500');
            input.classList.remove('border-gray-200');
        } else {
            input.classList.remove('border-red-500');
            input.classList.add('border-gray-200');
        }
    });
    
    input.addEventListener('input', () => {
        if (input.classList.contains('border-red-500') && input.value.trim()) {
            input.classList.remove('border-red-500');
            input.classList.add('border-gray-200');
        }
    });
});