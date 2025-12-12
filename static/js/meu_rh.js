const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || ""; 

function showToast(message, tipo = "success") {
      const container = document.getElementById("toast-container");

      const toast = document.createElement("div");
      toast.classList.add("toast");

      if (tipo === "success") toast.classList.add("toast-success");
      else toast.classList.add("toast-error");

      toast.textContent = message;

      container.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 3500);
    } 


function sair() {
  localStorage.removeItem('usuarioLogado');
  window.location.href = '/';
}

async function carregarTotais() {
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const empresaId = unidadeSelecionada?.nome || '';

  try {
    const resp = await fetch(`/api/dados_rh?empresa_id=${empresaId}`);
    const dados = await resp.json();

    if (dados.sucesso) {
      const t = dados.totais;
      document.getElementById('totalAcoes').textContent = t.acoes;
      document.getElementById('totalTreinamentos').textContent = t.treinamentos;
      document.getElementById('totalRequisicoes').textContent = t.requisicoes;
      document.getElementById('totalAvaliacoes').textContent = t.avaliacoes;
      document.getElementById('totalPSS').textContent = t.pss;
      document.getElementById('TotalEntrevista').textContent = t.entrevista;
    } else {
      console.error("Erro ao carregar totais:", dados.mensagem);
    }
  } catch (err) {
    console.error("Erro de conexão:", err);
  }
}

async function carregarUnidades() {
  try {
    const resp = await fetch(`/api/unidades_permitidas?usuario_id=${usuarioLogado.id}`);
    const dados = await resp.json();
    const select = document.getElementById('selectUnidade');

    if (dados.sucesso) {
      select.innerHTML = '';

      dados.unidades.forEach(u => {
        const nomes = u.nome.split(";").map(n => n.trim()).filter(n => n !== "");
        nomes.forEach(nome => {
          const opt = document.createElement("option");
          opt.value = u.id;
          opt.textContent = nome;
          select.appendChild(opt);
        });
      });

      const unidadeSalva = JSON.parse(localStorage.getItem('unidadeSelecionada'));

      if (unidadeSalva && dados.unidades.some(u => u.id == unidadeSalva.nome)) {
        select.value = unidadeSalva.id;
      } else {
        if (dados.unidades.length > 0) {
          const primeira = dados.unidades[0];
          localStorage.setItem('unidadeSelecionada', JSON.stringify(primeira));
          select.value = primeira.id;
        }
      }

      carregarTotais();
    }
  } catch (err) {
    console.error("Erro ao carregar unidades:", err);
  }
}

document.getElementById('selectUnidade').addEventListener('change', (e) => {
  const select = e.target;
  const id = select.value;
  const nome = select.options[select.selectedIndex].text;
  if (id) {
    localStorage.setItem('unidadeSelecionada', JSON.stringify({ id, nome }));
    carregarTotais();
  }
});

carregarTotais();
carregarUnidades();