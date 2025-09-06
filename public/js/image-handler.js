// اختبار معاينة الصور قبل الرفع
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('images');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const files = e.target.files;
            const previewContainer = document.getElementById('image-preview');
            
            if (!previewContainer) {
                // إنشاء حاوي المعاينة إذا لم يكن موجوداً
                const preview = document.createElement('div');
                preview.id = 'image-preview';
                preview.className = 'mt-3';
                preview.innerHTML = '<h6>معاينة الصور:</h6><div class="row" id="preview-row"></div>';
                imageInput.parentNode.appendChild(preview);
            }
            
            const previewRow = document.getElementById('preview-row');
            previewRow.innerHTML = ''; // مسح المعاينة السابقة
            
            if (files.length > 0) {
                Array.from(files).forEach((file, index) => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const col = document.createElement('div');
                            col.className = 'col-md-3 mb-2';
                            col.innerHTML = `
                                <div class="card">
                                    <img src="${e.target.result}" class="card-img-top" style="height: 100px; object-fit: cover;">
                                    <div class="card-body p-2">
                                        <small class="text-muted">${file.name}</small>
                                    </div>
                                </div>
                            `;
                            previewRow.appendChild(col);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    }
});

// تحسين عرض الصور في الصفحة الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    // إضافة lazy loading للصور
    const images = document.querySelectorAll('.car-image');
    images.forEach(img => {
        img.loading = 'lazy';
        
        // إضافة placeholder أثناء التحميل
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            console.log('فشل تحميل الصورة:', this.src);
            this.src = '/images/default-car.svg';
        });
    });
});
