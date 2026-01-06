// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio site yüklendi!');
    
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    // Smooth Scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip download links
            if (href.includes('download/')) return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Lütfen tüm alanları doldurun!');
                return;
            }
            
            // In a real app, you would send this to a server
            // For demo, we'll just show a success message
            alert(`Teşekkürler ${name}!\n\nMesajınız alındı. En kısa sürede dönüş yapacağım.`);
            
            // Reset form
            this.reset();
        });
    }
    
    // Download counter
    const downloadLinks = document.querySelectorAll('a[download]');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function() {
            // You could track downloads here
            console.log('Download clicked:', this.href);
            
            // Optional: Send analytics or update counter
            // fetch('/api/track-download', { method: 'POST' });
        });
    });
    
    // Dynamic year in footer
    const yearSpan = document.querySelector('footer .container p:first-child');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.innerHTML = yearSpan.innerHTML.replace('2024', currentYear);
    }
    
    // Add active class to nav links on scroll
    window.addEventListener('scroll', function() {
        const scrollPos = window.scrollY + 100;
        
        document.querySelectorAll('.section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Skill cards animation on scroll
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe skill cards
    document.querySelectorAll('.skill-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    // Create download folder and zip file (this would be done server-side)
    // For GitHub Pages, we'll create a dummy zip file
    console.log('Site hazır! İndirme linkleri aktif.');
    
    // Add a simple counter for downloads (using localStorage)
    if (typeof Storage !== 'undefined') {
        let downloadCount = localStorage.getItem('portfolioDownloads') || 0;
        
        // Update download button text with count
        const downloadBtn = document.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.innerHTML = `<i class="fas fa-download"></i> Tüm Kodu İndir (${downloadCount})`;
        }
        
        // Increment on download
        downloadLinks.forEach(link => {
            link.addEventListener('click', function() {
                downloadCount++;
                localStorage.setItem('portfolioDownloads', downloadCount);
                
                // Update button text
                if (downloadBtn) {
                    downloadBtn.innerHTML = `<i class="fas fa-download"></i> Tüm Kodu İndir (${downloadCount})`;
                }
            });
        });
    }
});

// Utility function for file download simulation
function simulateDownload() {
    // This would create a zip file in a real scenario
    // For demo, we'll create a simple text file
    const content = `
PORTFOLIO SITE KAYNAK KODLARI
=============================
Tarih: ${new Date().toLocaleDateString('tr-TR')}
Dosyalar:
- index.html (Ana sayfa)
- style.css (Stiller)
- script.js (JavaScript)
- README.md (Açıklama)

Kurulum:
1. Zip dosyasını çıkarın
2. index.html'yi tarayıcıda açın
3. Değişiklik yapmak için kodları düzenleyin

Not: Bu dosyalar Vercel'de deploy edilmek üzere hazırlanmıştır.
GitHub'a yükleyip Vercel ile deploy edebilirsiniz.
    `;
    
    // In a real app, you would generate a proper zip file
    // For now, we'll just show the content
    console.log('Download content:', content);
    return content;
}


// DATABASE FUNCTIONS

// Projeleri yükle
async function loadProjects() {
  const output = document.getElementById('database-output');
  output.innerHTML = '<p>⏳ Projeler yükleniyor...</p>';
  
  try {
    const response = await fetch('/api/projects');
    const result = await response.json();
    
    if (result.success) {
      let html = `<h3>📁 Projeler (${result.meta.total})</h3>`;
      
      result.data.forEach(project => {
        html += `
          <div class="project-item">
            <h4>${project.title} ${project.featured ? '⭐' : ''}</h4>
            <p>${project.description}</p>
            <small>
              🏷️ Tags: ${project.tags.join(', ')} | 
              📅 ${project.created_at}
            </small>
          </div>
        `;
      });
      
      output.innerHTML = html;
      
      // Console'a da yaz
      console.log('Database Projeler:', result.data);
      
    } else {
      output.innerHTML = `<p class="error">❌ Hata: ${result.error}</p>`;
    }
  } catch (error) {
    output.innerHTML = `<p class="error">❌ Network hatası: ${error.message}</p>`;
    console.error('Load projects error:', error);
  }
}

// Test projesi ekle
async function addTestProject() {
  const output = document.getElementById('database-output');
  output.innerHTML = '<p>⏳ Test projesi ekleniyor...</p>';
  
  const testProject = {
    title: `Test Proje ${Date.now().toString().slice(-4)}`,
    description: 'Bu bir test projesidir. Database çalışıyor mu kontrol etmek için eklendi.',
    image: `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 100)}`,
    demo_url: '#',
    github_url: '#',
    tags: ['Test', 'Database', 'Vercel'],
    featured: false
  };
  
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProject)
    });
    
    const result = await response.json();
    
    if (result.success) {
      output.innerHTML = `
        <div class="success">
          <h3>✅ Başarılı!</h3>
          <p>Test projesi eklendi: <strong>${result.data.title}</strong></p>
          <p>ID: ${result.data.id}</p>
          <button onclick="loadProjects()" class="btn btn-primary">
            🔄 Projeleri Yenile
          </button>
        </div>
      `;
      
      console.log('Test project added:', result);
      
      // Otomatik yenile (5 saniye sonra)
      setTimeout(() => {
        loadProjects();
      }, 3000);
      
    } else {
      output.innerHTML = `<p class="error">❌ Hata: ${result.error}</p>`;
    }
  } catch (error) {
    output.innerHTML = `<p class="error">❌ Network hatası: ${error.message}</p>`;
    console.error('Add test project error:', error);
  }
}

// Özel proje ekle
async function addCustomProject() {
  const title = document.getElementById('project-title').value;
  const desc = document.getElementById('project-desc').value;
  
  if (!title || !desc) {
    alert('Lütfen başlık ve açıklama girin!');
    return;
  }
  
  const output = document.getElementById('database-output');
  output.innerHTML = '<p>⏳ Proje ekleniyor...</p>';
  
  const customProject = {
    title: title,
    description: desc,
    image: `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`,
    demo_url: '#',
    github_url: '#',
    tags: ['Custom', 'User-Added'],
    featured: false
  };
  
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customProject)
    });
    
    const result = await response.json();
    
    if (result.success) {
      output.innerHTML = `
        <div class="success">
          <h3>🎉 Tebrikler!</h3>
          <p>Projen başarıyla eklendi!</p>
          <p><strong>${result.data.title}</strong></p>
          <p>Artık database'de görünecek.</p>
          <button onclick="loadProjects()" class="btn btn-primary">
            🔍 Projeleri Gör
          </button>
        </div>
      `;
      
      // Formu temizle
      document.getElementById('project-title').value = '';
      document.getElementById('project-desc').value = '';
      
      // Otomatik yenile
      setTimeout(() => {
        loadProjects();
      }, 2000);
      
    } else {
      output.innerHTML = `<p class="error">❌ Hata: ${result.error}</p>`;
    }
  } catch (error) {
    output.innerHTML = `<p class="error">❌ Network hatası: ${error.message}</p>`;
    console.error('Add custom project error:', error);
  }
}

// Database output'u temizle
function clearDatabaseOutput() {
  document.getElementById('database-output').innerHTML = 
    '<p>Output temizlendi. Yeni işlem yapabilirsin.</p>';
}

// Sayfa yüklendiğinde otomatik projeleri yükle
document.addEventListener('DOMContentLoaded', function() {
  // İstersen otomatik yükle:
  // loadProjects();
  
  // Veya butona basılınca yüklensin
  console.log('Database functions ready!');
  
  // Token kontrolü
  checkToken();
});

// Token kontrolü
async function checkToken() {
  try {
    const response = await fetch('/api/projects');
    if (response.ok) {
      console.log('✅ Database API çalışıyor!');
    }
  } catch (error) {
    console.warn('⚠️ Database API hatası:', error.message);
  }
}
