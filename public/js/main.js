// JavaScript to toggle visibility of fields based on user type
document.addEventListener('DOMContentLoaded', function() {
    const userTypeElement = document.getElementById('userType');
    if (userTypeElement) {
        userTypeElement.addEventListener('change', function() {
            const userType = this.value;
            document.getElementById('customerFields').style.display = userType === 'customer' ? 'block' : 'none';
            document.getElementById('staffFields').style.display = userType === 'staff' ? 'block' : 'none';
        });

        // Initialize visibility based on default selection
        userTypeElement.dispatchEvent(new Event('change'));
    }
});
