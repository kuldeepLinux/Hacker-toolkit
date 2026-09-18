// ============ NAVIGATION ============
const navBtns = document.querySelectorAll('.nav-btn');
const toolPanels = document.querySelectorAll('.tool-panel');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        navBtns.forEach(b => b.classList.remove('active'));
        toolPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tool-${tool}`).classList.add('active');
    });
});

// ============ TYPING EFFECT ============
document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.typing');
    if (title) {
        const fullText = title.textContent;
        title.textContent = '';
        let i = 0;
        function typeChar() {
            if (i < fullText.length) {
                title.textContent += fullText.charAt(i);
                i++;
                setTimeout(typeChar, 80);
            }
        }
        typeChar();
    }
});

// ============ TOOL 1: METADATA ============
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');
const results = document.getElementById('results');
const metadataList = document.getElementById('metadataList');
const clearBtn = document.getElementById('clearBtn');

if (uploadBox) {
    uploadBox.addEventListener('click', () => fileInput.click());
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });
    uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Sirf image files allowed hain!');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        preview.style.display = 'block';
        extractMetadata(file);
    };
    reader.readAsDataURL(file);
}

function extractMetadata(file) {
    metadataList.innerHTML = '';
    
    const sizeKB = (file.size / 1024).toFixed(2);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const displaySize = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
    
    metadataList.innerHTML += `
        <div class="metadata-item"><span class="label">📁 File Name</span><span class="value">${file.name}</span></div>
        <div class="metadata-item"><span class="label">📦 File Size</span><span class="value">${displaySize}</span></div>
        <div class="metadata-item"><span class="label">🎨 File Type</span><span class="value">${file.type}</span></div>
    `;
    
    EXIF.getData(file, function() {
        const allData = EXIF.getAllTags(this);
        
        if (Object.keys(allData).length === 0) {
            metadataList.innerHTML += '<div class="no-metadata">Is image mein koi EXIF metadata nahi mila 😕</div>';
            results.style.display = 'block';
            return;
        }

        const importantTags = {
            'Make': '📷 Camera Brand', 'Model': '📱 Camera Model',
            'DateTimeOriginal': '📅 Date Taken', 'ExposureTime': '⏱️ Shutter Speed',
            'FNumber': '🔆 Aperture', 'ISOSpeedRatings': '📊 ISO',
            'FocalLength': '🔍 Focal Length', 'LensModel': '🔭 Lens',
            'Software': '💻 Software', 'Artist': '👤 Artist', 'Copyright': '©️ Copyright'
        };

        let hasData = false;
        for (const [key, label] of Object.entries(importantTags)) {
            if (allData[key]) {
                hasData = true;
                let value = allData[key];
                if (key === 'ExposureTime') value = `1/${Math.round(1/value)}s`;
                if (key === 'FNumber') value = `f/${value}`;
                if (key === 'FocalLength') value = `${value}mm`;
                metadataList.innerHTML += `<div class="metadata-item"><span class="label">${label}</span><span class="value">${value}</span></div>`;
            }
        }

        const lat = EXIF.getTag(this, 'GPSLatitude');
        const lon = EXIF.getTag(this, 'GPSLongitude');
        
        if (lat && lon) {
            hasData = true;
            const latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
            const lonRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'E';
            const latDec = convertDMSToDD(lat, latRef);
            const lonDec = convertDMSToDD(lon, lonRef);
            const mapLink = `https://www.google.com/maps?q=${latDec},${lonDec}`;
            
            metadataList.innerHTML += `
                <div class="metadata-item gps">
                    <span class="label">📍 GPS Location</span>
                    <span class="value"><a href="${mapLink}" target="_blank">${latDec.toFixed(6)}, ${lonDec.toFixed(6)}</a></span>
                </div>
                <div class="map-container">
                    <h3>🗺️ Photo Location Map</h3>
                    <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${lonDec-0.01},${latDec-0.01},${lonDec+0.01},${latDec+0.01}&layer=mapnik&marker=${latDec},${lonDec}"
                        style="width:100%; height:280px; border:2px solid #00ff41; border-radius:6px; margin-top:10px;" loading="lazy"></iframe>
                    <a href="${mapLink}" target="_blank" class="map-link">🔗 Google Maps mein kholo →</a>
                </div>
            `;
        }

        if (!hasData) {
            metadataList.innerHTML += '<div class="no-metadata">Koi readable metadata nahi mila 😕</div>';
        }
        results.style.display = 'block';
    });
}

function convertDMSToDD(dms, ref) {
    const dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
    return (ref === 'S' || ref === 'W') ? -dd : dd;
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        fileInput.value = '';
        preview.style.display = 'none';
        results.style.display = 'none';
        metadataList.innerHTML = '';
    });
}

// ============ TOOL 2: PASSWORD ============
const passwordInput = document.getElementById('passwordInput');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const generateBtn = document.getElementById('generateBtn');
const generatedPassword = document.getElementById('generatedPassword');
const copyPasswordBtn = document.getElementById('copyPasswordBtn');

if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        const pass = passwordInput.value;
        let score = 0;
        
        const checks = {
            'check-length': pass.length >= 8,
            'check-upper': /[A-Z]/.test(pass),
            'check-lower': /[a-z]/.test(pass),
            'check-number': /[0-9]/.test(pass),
            'check-special': /[!@#$%^&*(),.?":{}|<>]/.test(pass)
        };
        
        for (const [id, passed] of Object.entries(checks)) {
            const el = document.getElementById(id);
            if (passed) {
                el.classList.add('passed');
                el.textContent = '✅ ' + el.textContent.slice(2);
                score++;
            } else {
                el.classList.remove('passed');
                el.textContent = '❌ ' + el.textContent.slice(2);
            }
        }
        
        const percent = (score / 5) * 100;
        strengthFill.style.width = percent + '%';
        
        if (score <= 2) {
            strengthFill.style.background = '#ff5f56';
            strengthText.textContent = 'WEAK ❌';
            strengthText.style.color = '#ff5f56';
        } else if (score <= 4) {
            strengthFill.style.background = '#ffbd2e';
            strengthText.textContent = 'MEDIUM ⚠️';
            strengthText.style.color = '#ffbd2e';
        } else {
            strengthFill.style.background = '#00ff41';
            strengthText.textContent = 'STRONG ✅';
            strengthText.style.color = '#00ff41';
        }
        
        if (pass.length === 0) {
            strengthText.textContent = 'Waiting for input...';
            strengthText.style.color = '#888';
            strengthFill.style.width = '0%';
        }
    });
}

if (generateBtn) {
    generateBtn.addEventListener('click', () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let pass = '';
        for (let i = 0; i < 16; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        generatedPassword.value = pass;
    });
}

if (copyPasswordBtn) {
    copyPasswordBtn.addEventListener('click', () => {
        if (generatedPassword.value) {
            navigator.clipboard.writeText(generatedPassword.value);
            copyPasswordBtn.textContent = '[ COPIED! ]';
            setTimeout(() => copyPasswordBtn.textContent = '[ COPY ]', 1500);
        }
    });
}

// ============ TOOL 3: HASH ============
const hashInput = document.getElementById('hashInput');
const hashBtn = document.getElementById('hashBtn');
const hashResults = document.getElementById('hashResults');

async function generateHash(text, algo) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

if (hashBtn) {
    hashBtn.addEventListener('click', async () => {
        const text = hashInput.value;
        if (!text) { alert('Kuch text daalo!'); return; }
        
        document.getElementById('sha1Result').textContent = 'Computing...';
        document.getElementById('sha256Result').textContent = 'Computing...';
        hashResults.style.display = 'block';
        
        const sha1 = await generateHash(text, 'SHA-1');
        const sha256 = await generateHash(text, 'SHA-256');
        
        document.getElementById('sha1Result').textContent = sha1;
        document.getElementById('sha256Result').textContent = sha256;
    });
}

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.copy;
        const text = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(text);
        btn.textContent = '[COPIED!]';
        setTimeout(() => btn.textContent = '[COPY]', 1500);
    });
});

// ============ TOOL 4: BASE64 ============
const base64Input = document.getElementById('base64Input');
const base64Output = document.getElementById('base64Output');
const encodeBtn = document.getElementById('encodeBtn');
const decodeBtn = document.getElementById('decodeBtn');
const copyBase64Btn = document.getElementById('copyBase64Btn');

if (encodeBtn) {
    encodeBtn.addEventListener('click', () => {
        try {
            base64Output.value = btoa(base64Input.value);
        } catch (e) {
            base64Output.value = 'Error: ' + e.message;
        }
    });
}

if (decodeBtn) {
    decodeBtn.addEventListener('click', () => {
        try {
            base64Output.value = atob(base64Input.value);
        } catch (e) {
            base64Output.value = 'Error: Invalid Base64';
        }
    });
}

if (copyBase64Btn) {
    copyBase64Btn.addEventListener('click', () => {
        if (base64Output.value) {
            navigator.clipboard.writeText(base64Output.value);
            copyBase64Btn.textContent = '[ COPIED! ]';
            setTimeout(() => copyBase64Btn.textContent = '[ COPY ]', 1500);
        }
    });
}
