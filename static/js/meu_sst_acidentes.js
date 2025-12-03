const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";

let editandoId = null;

const API = "/api/acidentes";

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

  const dados = {
    empresa: unidadeSelecionada ? unidadeSelecionada.nome : null, // 🔹 <--- AJUSTE AQUI
    nome: document.getElementById("nome").value,
    cargo: document.getElementById("cargo").value,
    ocorrido: document.getElementById("ocorrido").value,
    data: document.getElementById("data").value,
    local: document.getElementById("local").value,
    tipo: document.getElementById("tipo").value,
    responsavel: document.getElementById("responsavel").value,
    cat: document.getElementById("cat").value,
    afastamento: document.getElementById("afastamento").value,
    dataretorno: document.getElementById("dataretorno").value,
    usuario: usuarioLogado ? usuarioLogado.nome : null
  };

  const resp = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });
  const resultado = await resp.json();
  alert(resultado.mensagem);
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

  // Monta query string com filtros
  const params = new URLSearchParams({
    unidade: unidadeSelecionada.nome,
    mes,
    ano
  });

  const resp = await fetch(`/api/acidentes?${params.toString()}`);
  const dados = await resp.json();

  if (!dados.sucesso) {
    alert("Erro ao carregar registros.");
    return;
  }

  const registros = dados.dados;
  const container = document.getElementById("tabelaTreinamentos");

  if (!registros.length) {
    container.innerHTML = "<h3>Nenhum registro encontrado para os filtros selecionados.</h3>";
    return;
  }

  // 🔹 Agrupar por tipo_acao
  const tipos = [...new Set(registros.map(t => t.tipo))];

  container.innerHTML = tipos.map(tipo => {
    const items = registros.filter(t => t.tipo === tipo);
    return `
      <div class="grupo-tipo">
        <h3>${tipo}</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Colaborador</th>
              <th>Cargo</th>
              <th>Local</th>
              <th>Tipo</th>
              <th>Afastamento?</th>
              <th>Data retorno</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td>${formatarData(i.data)}</td>
                <td>${i.nome}</td>
                <td>${i.cargo}</td>
                <td>${i.local}</td>
                <td>${i.tipo}</td>
                <td>${i.afastamento}</td>
                <td>${formatarData(i.dataretorno)}</td>
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
  // Buscar APENAS um acidente
  const resp = await fetch(`/api/acidentes/${id}`);
  const reg = await resp.json();

  console.log("Registro carregado:", reg);

  if (!reg || !reg.id) {
    console.warn("Registro não encontrado:", id);
    return;
  }

  abrirFormulario();
  editandoId = id;

  document.getElementById("nome").value = reg.nome;
  document.getElementById("cargo").value = reg.cargo;

  // Corrigido (campo é "data")
  if (reg.data) {
    document.getElementById("data").value =
      new Date(reg.data).toISOString().split('T')[0];
  } else {
    document.getElementById("data").value = "";
  }

  document.getElementById("ocorrido").value = reg.ocorrido;
  document.getElementById("local").value = reg.local;
  document.getElementById("tipo").value = reg.tipo;
  document.getElementById("responsavel").value = reg.responsavel;
  document.getElementById("cat").value = reg.cat;
  document.getElementById("afastamento").value = reg.afastamento;
  document.getElementById("dataretorno").value = reg.dataretorno || "";

  document.querySelector("#formTreinamento h2").innerText = "Editar Registro";
  document.querySelector("#formTreinamento button[type='submit']").onclick =
    (e) => atualizar(e, id);
}



// === ATUALIZAR ===
async function atualizar(event, id){
  event.preventDefault();

  // 🔹 PEGAR EMPRESA (unidade) SELECIONADA
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));

  const dados = {
    empresa: unidadeSelecionada ? unidadeSelecionada.nome : null, // 🔹 <--- AJUSTE AQUI
    nome: document.getElementById("nome").value,
    cargo: document.getElementById("cargo").value,
    ocorrido: document.getElementById("ocorrido").value,
    data: document.getElementById("data").value,
    local: document.getElementById("local").value,
    tipo: document.getElementById("tipo").value,
    responsavel: document.getElementById("responsavel").value,
    cat: document.getElementById("cat").value,
    afastamento: document.getElementById("afastamento").value,
    dataretorno: document.getElementById("dataretorno").value,
    participantes: document.getElementById("participantes").value,
    usuario: usuarioLogado ? usuarioLogado.nome : null
  };

  const resp = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });
  const resultado = await resp.json();
  alert(resultado.mensagem);
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
    alert("Nenhum dado encontrado para exportar.");
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