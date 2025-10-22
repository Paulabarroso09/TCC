// Funcionalidade de expandir/retrair as prevenções
document.addEventListener('DOMContentLoaded', function() {
    const prevencaoCards = document.querySelectorAll('.prevencao-card');
    
    prevencaoCards.forEach(card => {
      const header = card.querySelector('.prevencao-header');
      const arrow = card.querySelector('.prevencao-arrow');
      const detalhes = card.querySelector('.prevencao-detalhes');
      
      header.addEventListener('click', function() {
        const isOpen = card.classList.contains('active');
        
        // Fecha todos os outros cards
        prevencaoCards.forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.classList.remove('active');
            otherCard.querySelector('.prevencao-arrow').textContent = '▼';
            otherCard.querySelector('.prevencao-detalhes').style.maxHeight = '0';
          }
        });
        
        // Alterna o estado do card atual
        if (!isOpen) {
          card.classList.add('active');
          arrow.textContent = '▲';
          detalhes.style.maxHeight = detalhes.scrollHeight + 'px';
        } else {
          card.classList.remove('active');
          arrow.textContent = '▼';
          detalhes.style.maxHeight = '0';
        }
      });
    });
  
    // Adicionar funcionalidade ao botão de logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', function() {
        if(confirm('Tem certeza que deseja sair?')) {
          window.location.href = 'login.html';
        }
      });
    }
  });