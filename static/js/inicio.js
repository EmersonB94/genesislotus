const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";
document.getElementById("usuarioLogadoCargo").innerText = usuarioLogado?.cargo || "";
// Bloquear/mostrar botões conforme permissão
//document.getElementById("btnRH").style.display = usuarioLogado.perm_rh ? "block" : "none";
//document.getElementById("btnDP").style.display = usuarioLogado.perm_dp ? "block" : "none";
//document.getElementById("btnSST").style.display = usuarioLogado.perm_sst ? "block" : "none";
//document.getElementById("btnADM").style.display = usuarioLogado.perm_adm ? "block" : "none";


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

function abrirIndicadores() {
    const u = JSON.parse(localStorage.getItem("usuarioLogado"));
    window.location.href = `/indicadores?usuario=${encodeURIComponent(u.email)}`;
}

function abrirMeuRH() {
    /* const u = JSON.parse(localStorage.getItem("usuarioLogado"));
    window.location.href = `/meu_rh?email=${encodeURIComponent(u.email)}`; */
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    // Se não existir usuário ou se modrh === "N"
    if (!usuarioLogado || usuarioLogado.modrh === "N") {

      showToast("Você não possui permissão a este módulo RH", "error");
        
    } else {
        
      showToast("Acesso permitido", "sucess");
      window.location.href = `/meu_rh?usuario=${encodeURIComponent(usuarioLogado.email)}`;

    }
}

function abrirMeuDP() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    // Se não existir usuário ou se modrh === "N"
    if (!usuarioLogado || usuarioLogado.moddp === "N") {

      showToast("Você não possui permissão a este módulo DP", "error");
        
    } else {
        
      showToast("Acesso permitido", "sucess");
      window.location.href = `/meu_dp?usuario=${encodeURIComponent(usuarioLogado.email)}`;

    }
}

function abrirMeuSST() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    // Se não existir usuário ou se modrh === "N"
    if (!usuarioLogado || usuarioLogado.modsst === "N") {

      showToast("Você não possui permissão a este módulo SST", "error");
        
    } else {
        
      showToast("Acesso permitido", "sucess");
      window.location.href = `/meu_sst?usuario=${encodeURIComponent(usuarioLogado.email)}`;

    }
}

function abrirMeuADM() {
    const u = JSON.parse(localStorage.getItem("usuarioLogado"));
    window.location.href = `/usuario?email=${encodeURIComponent(u.email)}`;
}

function sair() {
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('unidadeSelecionada');
  window.location.href = '/';
}

async function carregarTotais() {
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const empresaId = unidadeSelecionada?.nome || '';

  try {
    const resp = await fetch(`/api/totais?empresa_id=${empresaId}`);
    const dados = await resp.json();

    if (dados.sucesso) {
      const t = dados.totais;
      document.getElementById('totalUsuarios').textContent = t.usuarios;
      showToast("Usuários: " + t.usuarios, "success");
      document.getElementById('totalChamados').textContent = t.chamados;
      showToast("Chamados em aberto: " + t.chamados, "success");
      document.getElementById('totalIndicadores').textContent = t.indicadores;
      showToast("Indicadores registrados: " + t.indicadores, "success");
      document.getElementById('totalAcoes').textContent = t.acoes;
      document.getElementById('totalTreinamentos').textContent = t.treinamentos;
      document.getElementById('totalRequisicoes').textContent = t.requisicoes;
      document.getElementById('totalPSS').textContent = t.pss;
      document.getElementById('totalEntrevista').textContent = t.entrevista;
      document.getElementById('totalAvaliacoes').textContent = t.avaliacoes;
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
  showToast("Unidade Selecionada: " + nome, "success");
  if (id) {
    localStorage.setItem('unidadeSelecionada', JSON.stringify({ id, nome }));
    carregarTotais();
  }
});

/* 🔹 Agora usamos o overlay corretamente */
function abrirPerfil() {
  const overlay = document.getElementById("overlayPerfil");
  overlay.classList.add("active");

  const u = JSON.parse(localStorage.getItem("usuarioLogado"));
  document.getElementById("perfilNome").value = u.nome || "";
  document.getElementById("perfilEmail").value = u.email || "";
  document.getElementById("perfilSenha").value = "";
  document.getElementById("perfilContato").value = u.contato || "";
  document.getElementById("perfilSetor").value = u.setor || "";
  document.getElementById("perfilCargo").value = u.cargo || "";
  document.getElementById("perfilNivel").value = u.nivel_usuario || "";
  document.getElementById("perfilUnidades").value = u.unidades || "";
  document.getElementById("perfilStatus").value = u.status || "";
}

function fecharModal() {
  document.getElementById("overlayPerfil").classList.remove("active");
}

async function salvarPerfil() {
  const u = JSON.parse(localStorage.getItem("usuarioLogado"));
  const dados = {
    id: u.id,
    senha: document.getElementById("perfilSenha").value,
    contato: document.getElementById("perfilContato").value
  };

  try {
    const resp = await fetch(`/api/atualizar_perfil`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const data = await resp.json();

    if (data.sucesso) {
      showToast("Perfil atualizado com sucesso!", "success");
      fecharModal();
    } else {
      showToast("Erro ao atualizar: " + data.mensagem, "error");
    }
  } catch (e) {
    showToast("Erro de conexão ao salvar perfil.", "error");
  }
}

function verificarPermissaoRH() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const btnRH = document.getElementById("btnRH");

    // Se não existir usuário ou se modrh === "N"
    if (!usuarioLogado || usuarioLogado.modrh === "N") {

        // Remove o onclick
        btnRH.removeAttribute("onclick");

        // Estética de bloqueado
        btnRH.style.opacity = "0.5";
        btnRH.style.pointerEvents = "none";
        btnRH.style.cursor = "not-allowed";
        
    } else {
        // Reativa
        btnRH.setAttribute("onclick", "abrirIndicadores()");
        btnRH.style.opacity = "1";
        btnRH.style.pointerEvents = "auto";
        btnRH.style.cursor = "pointer";
    }
}

// Execute ao carregar a página
document.addEventListener("DOMContentLoaded", verificarPermissaoRH);
verificarPermissaoRH()


/* 🔹 Fecha ao clicar fora */
window.onclick = function(event) {
  const overlay = document.getElementById("overlayPerfil");
  if (event.target === overlay) overlay.classList.remove("active");
};

document.addEventListener("DOMContentLoaded", () => {
  carregarUnidades();
});