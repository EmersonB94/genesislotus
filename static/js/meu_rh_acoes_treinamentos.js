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


let editandoId = null;

const API = "/api/acoes_treinamentos";

// função auxiliar de formatação
  function formatarData(dataISO) {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");
    const segundo = String(data.getSeconds()).padStart(2, "0");
    return `${dia}/${mes}/${ano}`; // ${hora}:${minuto}:${segundo}`;
  } 

function abrirFormulario(){
  document.getElementById("form-popup").style.display = "flex";
  editandoId = null;
  // ✅ Garante que o botão volte ao modo "salvar novo"
  document.querySelector("#formTreinamento button[type='submit']").onclick = salvarTreinamento;
  document.querySelector("#formTreinamento h2").innerText = "Novo Registro";

}

function fecharFormulario(){
  document.getElementById("form-popup").style.display = "none";
  document.getElementById("formTreinamento").reset();
  editandoId = null;
}

function sair(){
  localStorage.removeItem("usuarioLogado");
  alert("Sessão encerrada.");
}

// === SALVAR (NOVO) ===
async function salvarTreinamento(event){
  event.preventDefault();

  // 🔹 PEGAR EMPRESA (unidade) SELECIONADA
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  const dados = {
    empresa: unidadeSelecionada ? unidadeSelecionada.nome : null, // 🔹 <--- AJUSTE AQUI
    tema: document.getElementById("tema").value,
    realizado: document.getElementById("realizado").value,
    dataRealizacao: document.getElementById("dataRealizacao").value,
    local: document.getElementById("local").value,
    tipoAcao: document.getElementById("tipoAcao").value,
    duracao: document.getElementById("duracao").value,
    departamento: document.getElementById("departamento").value,
    responsavel: document.getElementById("responsavel").value,
    modalidade: document.getElementById("modalidade").value,
    pat: document.getElementById("pat").value,
    participantes: document.getElementById("participantes").value,
    area: document.getElementById("area").value,
    status: document.getElementById("status").value,
    usuario: usuarioLogado ? usuarioLogado.nome : null,
  };

  const resp = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });
  const resultado = await resp.json();
  showToast(resultado.mensagem, "success");
  if(resultado.sucesso){
    fecharFormulario();
    carregarTabela();
  }
}

// === CARREGAR ===
async function carregarTabela() {
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  if (!unidadeSelecionada) {
    document.getElementById("tabelaTreinamentos").innerHTML = "<h3>Selecione uma unidade.</h3>";
    return;
  }

  const mes = document.getElementById("filtroMes").value;
  const ano = document.getElementById("filtroAno").value;
  const area = document.getElementById("area").value;

  // Monta query string com filtros
  const params = new URLSearchParams({
    unidade: unidadeSelecionada.nome,
    mes,
    ano,
    area
  });

  const resp = await fetch(`/api/acoes_treinamentos?${params.toString()}`);
  const dados = await resp.json();

  if (!dados.sucesso) {
    showToast("Erro ao carregar registros.", "error");
    return;
  }

  const registros = dados.dados;
  const container = document.getElementById("tabelaTreinamentos");

  if (!registros.length) {
    container.innerHTML = "<h3>Nenhum registro encontrado para os filtros selecionados.</h3>";
    return;
  }

  // 🔹 Agrupar por tipo_acao
  const tipos = [...new Set(registros.map(t => t.tipo_acao))];

  container.innerHTML = tipos.map(tipo => {
    const items = registros.filter(t => t.tipo_acao === tipo);
    return `
      <div class="grupo-tipo">
        <h3>${tipo}</h3>
        <table>
          <thead>
            <tr>
              <th>Tema</th><th>Data</th><th>Local</th><th>Tipo</th>
              <th>Duração</th><th>Departamento</th><th>Responsável</th><th>Modalidade</th>
              <th>PAT</th><th>Participantes</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td>${i.tema}</td>
                <td>${formatarData(i.data)}</td>
                <td>${i.local}</td>
                <td>${i.tipo_acao}</td>
                <td>${i.duracao}</td>
                <td>${i.departamento}</td>
                <td>${i.responsavel}</td>
                <td>${i.modalidade}</td>
                <td>${i.pat}</td>
                <td>${i.participantes}</td>
                <td>${i.status}</td>
                <td>
                  <button class="btn" onclick="editar(${i.id})">Editar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}


// === EDITAR ===
async function editar(id) { 

  const resp = await fetch("/api/acoes_treinamentos");
  const dados = await resp.json();

  console.log("Resposta API:", dados);

  const reg = dados.dados.find(r => Number(r.id) === Number(id));
  if(!reg) {
    console.warn("Registro não encontrado para ID:", id);
    return;
  }

  abrirFormulario();
  editandoId = id;

  document.getElementById("tema").value = reg.tema;
  document.getElementById("realizado").value = reg.realizado;

  if (reg.data) {
    document.getElementById("dataRealizacao").value =
      new Date(reg.data).toISOString().split('T')[0];
  } else {
    document.getElementById("dataRealizacao").value = "";
  }

  document.getElementById("local").value = reg.local;
  document.getElementById("tipoAcao").value = reg.tipo_acao;
  document.getElementById("duracao").value = reg.duracao;
  document.getElementById("departamento").value = reg.departamento;
  document.getElementById("responsavel").value = reg.responsavel;
  document.getElementById("modalidade").value = reg.modalidade;
  document.getElementById("pat").value = reg.pat;
  document.getElementById("participantes").value = reg.participantes;

  document.querySelector("#formTreinamento h2").innerText = "Editar Registro";
  document.querySelector("#formTreinamento button[type='submit']").onclick = 
      (e) => atualizar(e, id);
}


// === ATUALIZAR ===
async function atualizar(event, id){
  event.preventDefault();

  // 🔹 PEGAR EMPRESA (unidade) SELECIONADA
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  const dados = {
    empresa: unidadeSelecionada ? unidadeSelecionada.nome : null, // 🔹 <--- AJUSTE AQUI
    tema: tema.value,
    realizado: realizado.value,
    dataRealizacao: dataRealizacao.value,
    local: local.value,
    tipoAcao: tipoAcao.value,
    duracao: duracao.value,
    departamento: departamento.value,
    responsavel: responsavel.value,
    modalidade: modalidade.value,
    pat: pat.value,
    participantes: participantes.value,
    area: area.value,
    status: statusform.value,
    usuario: usuarioLogado ? usuarioLogado.nome : null
  };

  const resp = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });
  const resultado = await resp.json();
  showToast(resultado.mensagem, "success");
  if(resultado.sucesso){
    fecharFormulario();
    carregarTabela();
  }
}

// === EXCLUIR ===
async function excluir(id){
  if(!confirm("Tem certeza que deseja excluir este registro?")) return;
  const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
  const resultado = await resp.json();
  alert(resultado.mensagem);
  if(resultado.sucesso) carregarTabela();
}

function exportarTabela() {
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const nomeUnidade = unidadeSelecionada ? unidadeSelecionada.nome.replace(/\s+/g, "_") : "Sem_Unidade";

  const tabelas = document.querySelectorAll("#tabelaTreinamentos table");

  if (!tabelas.length) {
    showToast("Nenhum dado encontrado para exportar.", "error");
    return;
  }

  const wb = XLSX.utils.book_new();

  tabelas.forEach((tabela, index) => {
    const titulo = tabela.closest(".grupo-tipo")?.querySelector("h3")?.textContent || `Tabela_${index + 1}`;
    const ws = XLSX.utils.table_to_sheet(tabela);
    XLSX.utils.book_append_sheet(wb, ws, titulo);
  });

  const nomeArquivo = `Genesis_Lotus_Exportação_Ações_e_Treinamentos_${nomeUnidade}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}


carregarTabela();
carregarUnidades();

// === Carregar unidades com permissão ===
async function carregarUnidades() {
  try {
    const resp = await fetch(`/api/unidades_permitidas?usuario_id=${usuarioLogado.id}`);
    const dados = await resp.json();

    if (dados.sucesso) {
      const select = document.getElementById('selectUnidade');
      select.innerHTML = '<option value="">Selecione a Unidade</option>';

      dados.unidades.forEach(u => {
        // Separa o nome em várias partes quando houver ";"
        const nomes = u.nome.split(";").map(n => n.trim()).filter(n => n !== "");

        // Cria uma opção para cada nome encontrado
        nomes.forEach(nome => {
          const opt = document.createElement("option");
          opt.value = u.id;  // mantém o mesmo id
          opt.textContent = nome;
          select.appendChild(opt);
        });
      });

      const unidadeSalva = JSON.parse(localStorage.getItem('unidadeSelecionada'));

      if (unidadeSalva) {
        select.value = unidadeSalva.id;
      } else if (dados.unidades.length > 0) {
        select.value = dados.unidades[0].id;
        localStorage.setItem('unidadeSelecionada', JSON.stringify(dados.unidades[0]));
      }
    }
  } catch (err) {
    console.error("Erro ao carregar unidades:", err);
  }
}

document.getElementById('selectUnidade').addEventListener('change', () => {
  const select = document.getElementById('selectUnidade');
  const id = select.value;
  const nome = select.options[select.selectedIndex].text;
  
  if (id) {
    localStorage.setItem('unidadeSelecionada', JSON.stringify({ id, nome }));
  } else {
    localStorage.removeItem('unidadeSelecionada');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  carregarUnidades();
});