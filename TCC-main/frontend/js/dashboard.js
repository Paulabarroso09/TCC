// dashboard.js - MESMO CÓDIGO (só muda a posição no HTML)
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se usuário está logado
    if (!apiService.isAuthenticated()) {
        alert('⚠️ Faça login primeiro!');
        window.location.href = 'index.html';
        return;
    }
  
    const usuario = apiService.getUsuarioAtual();
    console.log('Usuário logado:', usuario);
  
    try {
        // ✅ BUSCAR DADOS REAIS DA API
        console.log('📡 Buscando dados da API...');
        const aparelhos = await apiService.getAparelhos();
        const temperaturas = await apiService.getTemperatura();
        
        console.log('📊 Dados recebidos:', { 
            aparelhos: aparelhos.length, 
            temperaturas: temperaturas.length 
        });
  
        // Atualizar a interface com dados reais
        atualizarDashboard(aparelhos, temperaturas);
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        alert('Erro ao carregar dados: ' + error.message);
    }
  
    // Configurar relatórios dinâmicos
    configurarRelatorios();
  });
  
  function atualizarDashboard(aparelhos, temperaturas) {
    console.log('🎨 Atualizando dashboard...');
    
    // ✅ VERSÃO SEGURA - verifica se elementos existem
    const elementos = {
        temp: document.getElementById("temp"),
        umid: document.getElementById("umid"),
        co2: document.getElementById("co2"),
        alerta: document.getElementById("alerta"),
        ultimaAtualizacao: document.getElementById("ultimaAtualizacao")
    };
  
    // Verificar elementos críticos
    if (!elementos.temp || !elementos.umid || !elementos.co2) {
        console.error('❌ Elementos do dashboard não encontrados!');
        return;
    }
  
    if (temperaturas.length === 0) {
        elementos.temp.innerText = `--°C`;
        elementos.umid.innerText = `--%`;
        elementos.co2.innerText = `-- ppm`;
        console.warn('⚠️ Nenhuma medição encontrada');
        return;
    }
  
    // Pegar a última medição (mais recente)
    const ultimaMedicao = temperaturas[0];
    console.log('📈 Última medição:', ultimaMedicao);
    
    // === Atualiza Resumo com Dados Reais ===
    elementos.temp.innerText = `${ultimaMedicao.temperatura}°C`;
    elementos.umid.innerText = `${ultimaMedicao.umidade}%`;
    elementos.co2.innerText = `${ultimaMedicao.co2 || '--'} ppm`;
  
    // === Alerta Dinâmico com Dados Reais ===
    if (elementos.alerta) {
        if (ultimaMedicao.co2 > 1000 || ultimaMedicao.qualidade_ar === 'perigosa') {
            elementos.alerta.style.display = "block";
            elementos.alerta.innerHTML = `⚠️ ALERTA: Qualidade do ar ${ultimaMedicao.qualidade_ar.toUpperCase()}!`;
        } else {
            elementos.alerta.style.display = "none";
        }
    }
  
    // === Atualização ===
    if (elementos.ultimaAtualizacao) {
        elementos.ultimaAtualizacao.innerText = `Última atualização: ${new Date().toLocaleString("pt-BR")}`;
    }
  
    // === Gráfico de Tendência ===
    criarGraficoTendencia(temperaturas);
    
    console.log('✅ Dashboard atualizado com dados reais da API!');
  }
  
  function criarGraficoTendencia(temperaturas) {
    const ctxTendencia = document.getElementById("tendenciaChart");
    if (!ctxTendencia) {
        console.warn('⚠️ Canvas tendenciaChart não encontrado');
        return;
    }
  
    // ✅ VERSÃO SEGURA - Sem destruir gráficos (evita erro)
    try {
        // Pegar últimas 6 medições para o gráfico
        const dadosGrafico = temperaturas.slice(0, 6).reverse();
        
        new Chart(ctxTendencia, {
            type: "line",
            data: {
                labels: dadosGrafico.map((d, i) => `M${i + 1}`),
                datasets: [
                    {
                        label: "Temperatura (°C)",
                        data: dadosGrafico.map(d => d.temperatura),
                        borderColor: "rgb(255, 99, 132)",
                        backgroundColor: "rgba(255, 99, 132, 0.1)",
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2
                    },
                    {
                        label: "Umidade (%)",
                        data: dadosGrafico.map(d => d.umidade),
                        borderColor: "rgb(54, 162, 235)",
                        backgroundColor: "rgba(54, 162, 235, 0.1)",
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2
                    },
                    {
                        label: "CO₂ (ppm)",
                        data: dadosGrafico.map(d => d.co2 || 0),
                        borderColor: "rgb(75, 192, 192)",
                        backgroundColor: "rgba(75, 192, 192, 0.1)",
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { 
                        position: "top",
                        labels: { font: { size: 12 } }
                    },
                    title: {
                        display: true,
                        text: 'Tendência das Últimas Medições',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: false,
                        ticks: { font: { size: 11 } }
                    },
                    x: {
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
        console.log('✅ Gráfico de tendência criado!');
    } catch (error) {
        console.error('❌ Erro ao criar gráfico de tendência:', error);
    }
  }
  
  function configurarRelatorios() {
    const relatorio = document.getElementById("relatorio");
    const botoes = document.querySelectorAll(".btn-periodo");
  
    if (!relatorio) {
        console.warn('⚠️ Elemento relatorio não encontrado');
        return;
    }
  
    botoes.forEach(btn => {
        btn.addEventListener("click", async () => {
            // remove o destaque dos outros
            botoes.forEach(b => b.classList.remove("ativo"));
            btn.classList.add("ativo");
  
            try {
                const temperaturas = await apiService.getTemperatura();
                
                switch (btn.id) {
                    case "btn-hoje":
                        relatorio.innerHTML = `
                            <div class="relatorio-conteudo">
                                <h3>📊 Relatório de Hoje</h3>
                                <p><strong>Total de medições:</strong> ${temperaturas.length}</p>
                                <p><strong>Temperatura média:</strong> ${calcularMedia(temperaturas, 'temperatura')}°C</p>
                                <p><strong>Umidade média:</strong> ${calcularMedia(temperaturas, 'umidade')}%</p>
                                <p><strong>CO₂ médio:</strong> ${calcularMedia(temperaturas, 'co2')} ppm</p>
                                <p><strong>Qualidade predominante:</strong> ${calcularQualidadePredominante(temperaturas)}</p>
                            </div>
                        `;
                        break;
  
                    case "btn-semana":
                        relatorio.innerHTML = `
                            <div class="relatorio-conteudo">
                                <h3>📅 Relatório da Semana</h3>
                                <p><strong>Medições analisadas:</strong> ${temperaturas.length}</p>
                                <p><strong>Qualidade predominante:</strong> ${calcularQualidadePredominante(temperaturas)}</p>
                                <p><strong>Média de CO₂:</strong> ${calcularMedia(temperaturas, 'co2')} ppm</p>
                                <p><strong>Variação de temperatura:</strong> ${calcularVariacao(temperaturas, 'temperatura')}°C</p>
                            </div>
                        `;
                        break;
  
                    case "btn-mes":
                        relatorio.innerHTML = `
                            <div class="relatorio-conteudo">
                                <h3>📈 Relatório do Mês</h3>
                                <p><strong>Dados coletados:</strong> ${temperaturas.length} medições</p>
                                <p><strong>Temperatura média:</strong> ${calcularMedia(temperaturas, 'temperatura')}°C</p>
                                <p><strong>Umidade média:</strong> ${calcularMedia(temperaturas, 'umidade')}%</p>
                                <p><strong>Nível médio de CO₂:</strong> ${calcularMedia(temperaturas, 'co2')} ppm</p>
                            </div>
                        `;
                        break;
                }
            } catch (error) {
                relatorio.innerHTML = `<p>❌ Erro ao carregar relatório: ${error.message}</p>`;
            }
        });
    });
  }
  
  // Funções auxiliares
  function calcularMedia(dados, campo) {
    const valores = dados.map(d => d[campo]).filter(val => val != null);
    if (valores.length === 0) return '--';
    const soma = valores.reduce((acc, val) => acc + val, 0);
    return (soma / valores.length).toFixed(1);
  }
  
  function calcularQualidadePredominante(dados) {
    const contagem = {};
    dados.forEach(d => {
        const qualidade = d.qualidade_ar || 'boa';
        contagem[qualidade] = (contagem[qualidade] || 0) + 1;
    });
    
    const predominante = Object.keys(contagem).reduce((a, b) => 
        contagem[a] > contagem[b] ? a : b
    );
    
    // Traduzir para português
    const traducoes = {
        'boa': 'Boa',
        'moderada': 'Moderada', 
        'ruim': 'Ruim',
        'perigosa': 'Perigosa'
    };
    
    return traducoes[predominante] || predominante;
  }
  
  function calcularVariacao(dados, campo) {
    const valores = dados.map(d => d[campo]).filter(val => val != null);
    if (valores.length === 0) return '--';
    const max = Math.max(...valores);
    const min = Math.min(...valores);
    return (max - min).toFixed(1);
  }