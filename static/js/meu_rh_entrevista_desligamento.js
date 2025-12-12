const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
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

  let editandoId = null;
  const API = "/api/entrevista_desligamento"; // base da API

  function abrirFormulario(){
    document.getElementById("form-popup").style.display = "flex";
    document.getElementById("tituloForm").innerText = "Nova Requisição";
    editandoId = null;
    document.getElementById("formExperiencia").reset();
  }

  function fecharFormulario(){
    document.getElementById("form-popup").style.display = "none";
    editandoId = null;
    document.getElementById("formExperiencia").reset();
  }

  function sair(){
    localStorage.removeItem("usuarioLogado");
    alert("Sessão encerrada.");
  }

  // === SALVAR (NOVO) ===
  async function salvarRequisicao(event){
  event.preventDefault();
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  const dados = {
    empresa: unidadeSelecionada ? unidadeSelecionada.nome : null,
    nome: document.getElementById("nome").value,
    cargo: document.getElementById("cargo").value,
    dt_admissao: document.getElementById("dt_admissao").value,
    dt_demissao: document.getElementById("dt_demissao").value,
    tipo_desligamento: document.getElementById("tipo_desligamento").value,
    avaliador: document.getElementById("avaliador").value,
    r_optou_responder: document.getElementById("r_optou_responder").value,
    r_voltaria_trabalhar: document.getElementById("r_voltaria_trabalhar").value,
    r_gostaria_exercer_atividades: document.getElementById("r_gostaria_exercer_atividades").value,
    r_cargo_gostaria_exercer: document.getElementById("r_cargo_gostaria_exercer").value, // corrigido também

    usuario: usuarioLogado ? usuarioLogado.nome : null,
  };

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!resp.ok) {
      const text = await resp.text();
      showToast(`❌ Erro HTTP ${resp.status}: ${text}`, "error");
      console.error("Resposta completa do servidor:", text);
      return;
    }

    const resultado = await resp.json();
    console.log("Resposta JSON:", resultado);
    showToast(resultado.mensagem || "Resposta recebida.", "success");

    if (resultado.sucesso) {
      fecharFormulario();
      carregarTabela();
    }

  } catch (erro) {
    showToast(`⚠️ Erro inesperado: ${erro.message}`, "error");
    console.error("Erro detalhado:", erro);
  }
}


  // === CARREGAR ===
  async function carregarTabela() {
    const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
    if (!unidadeSelecionada) {
      document.getElementById("tabelaRequisicoes").innerHTML = "<h3>Selecione uma unidade.</h3>";
      return;
    }

    const mes = document.getElementById("filtroMes").value;
    const ano = document.getElementById("filtroAno").value;
    const status = document.getElementById("filtroStatus").value;

    const params = new URLSearchParams({
      unidade: unidadeSelecionada.nome,
      mes,
      ano,
      status
    });

    const resp = await fetch(`${API}?${params.toString()}`);
    const dados = await resp.json();

    if (!dados.sucesso) {
      showToast("Erro ao carregar registros.", "error");
      return;
    }

    const registros = dados.dados;
    const container = document.getElementById("tabelaRequisicoes");

    if (!registros.length) {
      container.innerHTML = "<p>Nenhum registro encontrado para os filtros selecionados.</p>";
      return;
    }

    // Agrupar por status (ex.: Pendente, Aprovada, etc.)
    const grupos = [...new Set(registros.map(t => t.tipo_desligamento || 'Sem Status'))];

    container.innerHTML = grupos.map(grp => {
      const items = registros.filter(t => (t.tipo_desligamento||'') === grp);
      return `
        <div class="grupo-tipo">
          <h3> ${grp} (${items.length})</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Colaborador</th>
                <th>Cargo</th>
                <th>Demissão</th>
                <th>Avaliador</th>
                <th>Tipo desligamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(i => `
                <tr>
                  <td>${i.id}</td>
                  <td>${i.nome}</td>
                  <td>${i.cargo || ''}</td>
                  <td>${formatarData(i.dt_demissao)}</td>
                  <td>${i.avaliador || ''}</td>
                  <td>${i.tipo_desligamento || ''}</td>                  
                  <td>
                    <button class="btn" onclick="editar(${i.id})">Editar</button>
                    <button class="btn" onclick="PDF(${i.id})">PDF</button>
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
async function editar(id){
  try {
    const resp = await fetch(`${API}/${id}`);
    const resultado = await resp.json();

    if(!resultado.sucesso) {
      showToast(resultado.erro || "Erro ao buscar registro.", "error");
      return; 
    }

    const reg = resultado.dados; // ✅ corrigido (antes estava resultado.dado)
    if(!reg) { 
      showToast("Registro não encontrado.", "error");
      return; 
    }

    abrirFormulario();
    editandoId = id;
    document.getElementById("tituloForm").innerText = "Editar Entrevista de Desligamento";

    // ✅ preencher corretamente conforme os campos reais da tabela
    document.getElementById("nome").value = reg.nome || "";
    document.getElementById("cargo").value = reg.cargo || "";
    document.getElementById("dt_admissao").value = reg.dt_admissao || "";
    document.getElementById("dt_demissao").value = reg.dt_demissao || "";
    document.getElementById("tipo_desligamento").value = reg.tipo_desligamento || "";
    
    // se houver no banco esses campos adicionais
    document.getElementById("r_optou_responder").value = reg.r_optou_responder || "";
    document.getElementById("r_voltaria_trabalhar").value = reg.r_voltaria_trabalhar || "";
    document.getElementById("r_gostaria_exercer_atividades").value = reg.r_gostaria_exercer_atividades || "";
    document.getElementById("r_cargo_gostaria_exercer").value = reg.r_cargo_gostaria_exercer || "";
    document.getElementById("avaliador").value = reg.avaliador || "";

    // alterar submit para atualizar
    document.getElementById("formExperiencia").onsubmit = (e) => atualizar(e, id);

  } catch (erro) {
    console.error("❌ Erro ao editar:", erro);
    showToast("Erro ao carregar registro para edição.", "error");
  }
}

  // === ATUALIZAR (EDIÇÃO) ===
async function atualizar(event, id) {
  event.preventDefault();

  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  const dados = {
    empresa: unidadeSelecionada ? unidadeSelecionada.nome : null,
    nome: document.getElementById("nome").value,
    cargo: document.getElementById("cargo").value,
    dt_admissao: document.getElementById("dt_admissao").value,
    dt_demissao: document.getElementById("dt_demissao").value,
    tipo_desligamento: document.getElementById("tipo_desligamento").value,
    avaliador: document.getElementById("avaliador").value,
    r_optou_responder: document.getElementById("r_optou_responder").value,
    r_voltaria_trabalhar: document.getElementById("r_voltaria_trabalhar").value,
    r_gostaria_exercer_atividades: document.getElementById("r_gostaria_exercer_atividades").value,
    r_cargo_gostaria_exercer: document.getElementById("r_cargo_gostaria_exercer").value,

    usuario: usuarioLogado ? usuarioLogado.nome : null
  };

  try {
    const resp = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resultado = await resp.json();
    showToast(resultado.mensagem || "Resposta recebida.", "success");

    if (resultado.sucesso) {
      fecharFormulario();
      carregarTabela();
    }

  } catch (erro) {
    showToast(`❌ Erro ao atualizar: ${erro.message}`, "error");
    console.error("Erro detalhado:", erro);
  }
}



  // === EXCLUIR ===
  async function excluir(id){
    if(!confirm("Tem certeza que deseja excluir esta requisição?")) return;
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    const resultado = await resp.json();
    alert(resultado.mensagem || "Resposta recebida.");
    if(resultado.sucesso) carregarTabela();
  }

  // === EXPORTAR ===
  function exportarTabela() {
    const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
    const nomeUnidade = unidadeSelecionada ? unidadeSelecionada.nome.replace(/\s+/g, "_") : "Sem_Unidade";

    const tabelas = document.querySelectorAll("#tabelaRequisicoes table");
    if (!tabelas.length) { showToast("Nenhum dado encontrado para exportar.", "error"); return; }
    const wb = XLSX.utils.book_new();

    tabelas.forEach((tabela, index) => {
      const titulo = tabela.closest(".grupo-tipo")?.querySelector("h3")?.textContent || `Tabela_${index + 1}`;
      const ws = XLSX.utils.table_to_sheet(tabela);
      XLSX.utils.book_append_sheet(wb, ws, titulo.substring(0,31));
    });

    const nomeArquivo = `Genesis_Lotus_Requisicoes_Pessoal_${nomeUnidade}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  }

  // === GERAR PDF ===
async function PDF(id) {
  try {
    const resp = await fetch(`${API}/${id}`);
    const resultado = await resp.json();

    if (!resultado.sucesso || !resultado.dados) {
      showToast("Erro ao gerar PDF: " + (resultado.mensagem || "Registro não encontrado."), "error");
      return;
    }

    const r = resultado.dados;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // === CABEÇALHO ===
    doc.addImage('/static/image/genesis1.png', 'JPEG', 10, 5, 30, 12);
    doc.setFontSize(16);
    doc.text("ENTREVISTA DE DESLIGAMENTO", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${formatarData(new Date())}`, 150, 25);
    doc.line(10, 28, 200, 28);

    let y = 36;
    const espacamento = 7;

    // === SEÇÃO 1 - DADOS DO COLABORADOR ===
    doc.setFontSize(12);
    doc.text("DADOS DO COLABORADOR", 14, y);
    y += 6;
    doc.setFontSize(10);

    const dadosColab = [
      ["Colaborador", r.nome],
      ["Cargo", r.cargo],
      ["Admissão", formatarData(r.dt_admissao)],
      ["Demissão", formatarData(r.dt_demissao)],
      ["Tipo de Desligamento", r.tipo_desligamento],
    ];

    dadosColab.forEach(([label, valor]) => {
      doc.text(`${label}: ${valor || ''}`, 14, y);
      y += espacamento;
    });

    // === SEÇÃO 2 - AVALIAÇÃO ===
    y += 4;
    doc.setFontSize(12);
    doc.text("AVALIAÇÃO", 14, y);
    y += 6;
    doc.setFontSize(10);

    const dadosAvaliacao = [
      ["Optou por responder a pesquisa?", r.r_optou_responder],
      ["Voltaria a trabalhar na instituição?", r.r_voltaria_trabalhar],
      ["Gostava de exercer suas atividades?", r.r_gostaria_exercer_atividades],
      ["Há na instituição algum cargo que gostaria de ter exercido?", r.r_cargo_gostaria_exercer],
    ];

    dadosAvaliacao.forEach(([label, valor]) => {
      doc.text(`${label}: ${valor || ''}`, 14, y);
      y += espacamento;
    });

    // === SEÇÃO 3 - AVALIADOR ===
    y += 4;
    doc.setFontSize(12);
    doc.text("RESPONSÁVEL PELA AVALIAÇÃO", 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`Avaliador: ${r.avaliador || ''}`, 14, y);
    y += 12;

    // === CAMPO DE ASSINATURA ===
    doc.setFontSize(10);
    doc.line(60, y + 10, 150, y + 10); // linha de assinatura
    doc.text(`Assinatura do Avaliador: ${r.avaliador || ''}`, 105, y + 16, { align: "center" });

    // === RODAPÉ ===
    doc.setFontSize(9);
    doc.text("© 2025 Genesis Lotus - Sistema de Entrevista de Desligamento", 105, 290, { align: "center" });

    // === SALVAR PDF ===
    const nomeArquivo = `Entrevista_Desligamento_${r.nome?.replace(/\s+/g, "_") || id}.pdf`;
    doc.save(nomeArquivo);

  } catch (erro) {
    showToast("Erro ao gerar PDF: " + erro.message, "error");
    console.error(erro);
  }
}


  // === Unidades permitidas (mantive seu endpoint antigo) ===
  carregarTabela();
  carregarUnidades();

  async function carregarUnidades() {
    try {
      const resp = await fetch(`/api/unidades_permitidas?usuario_id=${usuarioLogado.id || ''}`);
      const dados = await resp.json();
      if (dados.sucesso) {
        const select = document.getElementById('selectUnidade');
        select.innerHTML = '<option value="">Selecione a Unidade</option>';
        dados.unidades.forEach(u => {
          const nomes = (u.nome || "").split(";").map(n => n.trim()).filter(Boolean);
          nomes.forEach(nome => {
            const opt = document.createElement("option");
            opt.value = u.id;
            opt.textContent = nome;
            select.appendChild(opt);
          });
        });
        const unidadeSalva = JSON.parse(localStorage.getItem('unidadeSelecionada'));
        if (unidadeSalva) select.value = unidadeSalva.id;
        else if (dados.unidades.length > 0) {
          const u0 = dados.unidades[0];
          select.value = u0.id;
          localStorage.setItem('unidadeSelecionada', JSON.stringify(u0));
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
    if (id) localStorage.setItem('unidadeSelecionada', JSON.stringify({ id, nome }));
    else localStorage.removeItem('unidadeSelecionada');
  });

  document.addEventListener("DOMContentLoaded", () => {
    // garantir que unidades carreguem no load
    carregarUnidades();
    carregarTabela();
  });