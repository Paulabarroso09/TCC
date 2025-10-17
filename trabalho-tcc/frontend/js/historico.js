// Funcionalidade da página de histórico
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar funcionalidade ao botão de logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function() {
      if(confirm('Tem certeza que deseja sair?')) {
        window.location.href = 'login.html';
      }
    });
  }

  // Funcionalidade dos filtros de período
  const filtroBtns = document.querySelectorAll('.filtro-btn');
  
  filtroBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove a classe active de todos os botões
      filtroBtns.forEach(b => b.classList.remove('active'));
      
      // Adiciona a classe active ao botão clicado
      this.classList.add('active');
      
      // Aqui você pode adicionar a lógica para carregar os dados do período selecionado
      const periodo = this.getAttribute('data-periodo');
      console.log('Período selecionado:', periodo);
      
      // Simulação de carregamento de dados
      carregarDadosPeriodo(periodo);
    });
  });

  // Criar e inicializar o gráfico de qualidade do ar
  criarGraficoQualidadeAr();
  
  // Função para criar o gráfico de qualidade do ar
  function criarGraficoQualidadeAr() {
    const ctx = document.getElementById('graficoQualidadeAr').getContext('2d');
    
    // Dados iniciais do gráfico (simulados)
    const dadosIniciais = {
      labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
      datasets: [
        {
          label: 'Bom',
          data: [30, 25, 40, 35, 45],
          backgroundColor: 'rgba(40, 167, 69, 0.7)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'Moderado',
          data: [45, 50, 35, 40, 30],
          backgroundColor: 'rgba(255, 193, 7, 0.7)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 1
        },
        {
          label: 'Ruim',
          data: [20, 15, 20, 15, 20],
          backgroundColor: 'rgba(253, 126, 20, 0.7)',
          borderColor: 'rgba(253, 126, 20, 1)',
          borderWidth: 1
        },
        {
          label: 'Perigoso',
          data: [5, 10, 5, 10, 5],
          backgroundColor: 'rgba(220, 53, 69, 0.7)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Configurações do gráfico
    const config = {
      type: 'bar',
      data: dadosIniciais,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Horário'
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Porcentagem (%)'
            },
            min: 0,
            max: 100
          }
        }
      }
    };
    
    // Criar o gráfico
    const graficoQualidadeAr = new Chart(ctx, config);
    
    // Simular atualização de dados a cada 6 horas
    setInterval(() => {
      atualizarDadosGrafico(graficoQualidadeAr);
    }, 6000); // 6 segundos para demonstração (em produção seria 6 horas = 21600000 ms)
  }
  
  // Função para atualizar os dados do gráfico
  function atualizarDadosGrafico(grafico) {
    // Gerar novos dados aleatórios (simulação)
    const novosDados = grafico.data.datasets.map(dataset => {
      return {
        ...dataset,
        data: dataset.data.map(() => Math.floor(Math.random() * 50) + 10)
      };
    });
    
    // Atualizar os dados do gráfico
    grafico.data.datasets = novosDados;
    
    // Atualizar o gráfico
    grafico.update();
    
    console.log('Dados do gráfico atualizados às', new Date().toLocaleTimeString());
  }

  // Função para simular carregamento de dados
  function carregarDadosPeriodo(periodo) {
    // Em uma aplicação real, aqui você faria uma requisição à API
    console.log(`Carregando dados do período: ${periodo}`);
    
    // Adicionar efeito de loading
    const historicoContent = document.querySelector('.historico-content');
    historicoContent.style.opacity = '0.7';
    
    setTimeout(() => {
      historicoContent.style.opacity = '1';
      // Aqui você atualizaria os dados na tela
    }, 500);
  }

  // Animações de entrada
  const historicoItems = document.querySelectorAll('.historico-item');
  historicoItems.forEach((item, index) => {
    item.style.animationDelay = (index * 0.1) + 's';
    item.classList.add('fade-in');
  });

  const resumoCards = document.querySelectorAll('.resumo-card');
  resumoCards.forEach((card, index) => {
    card.style.animationDelay = (index * 0.2) + 's';
    card.classList.add('fade-in');
  });
});

// Adicionar animação fade-in
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }
`;
document.head.appendChild(style); 