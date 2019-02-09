qrcode();

// Generate QR Code using API
function qrcode() {
    document.getElementById("qrcode").src = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + localStorage.getItem("qrcode"); 
}

