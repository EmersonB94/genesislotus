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
  const API = "/api/requisicoes_pessoal"; // base da API

  function abrirFormulario(){
    document.getElementById("form-popup").style.display = "flex";
    document.getElementById("tituloForm").innerText = "Nova Requisição";
    editandoId = null;
    document.getElementById("formRequisicao").reset();
  }

  function fecharFormulario(){
    document.getElementById("form-popup").style.display = "none";
    editandoId = null;
    document.getElementById("formRequisicao").reset();
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
      numero_requisicao: null, // backend gera se necessário
      data_solicitacao: new Date().toISOString().slice(0,19).replace('T',' '),

      solicitante_nome: document.getElementById("solicitante_nome").value,
      solicitante_cargo: document.getElementById("solicitante_cargo").value,
      departamento: document.getElementById("departamento").value,

      tipo_requisicao: document.getElementById("tipo_requisicao").value,
      titulo_cargo: document.getElementById("titulo_cargo").value,
      area_setor: document.getElementById("area_setor").value,
      empresa: unidadeSelecionada ? unidadeSelecionada.nome : null,
      quantidade: parseInt(document.getElementById("quantidade").value || 1, 10),
      motivo: document.getElementById("motivo").value,
      colaborador_substituido: document.getElementById("colaborador_substituido").value,
      urgencia: document.getElementById("urgencia").value,
      prazo_desejado: document.getElementById("prazo_desejado").value || null,
      data_contratacao: document.getElementById("data_contratacao").value || null,

      faixa_salarial: document.getElementById("faixa_salarial").value,
      tipo_contrato: document.getElementById("tipo_contrato").value,

      formacao_exigida: document.getElementById("formacao_exigida").value,
      experiencia_minima: document.getElementById("experiencia_minima").value,
      competencias_tecnicas: document.getElementById("competencias_tecnicas").value,
      competencias_comportamentais: document.getElementById("competencias_comportamentais").value,

      responsavel_rh: document.getElementById("responsavel_rh").value,
      observacoes: document.getElementById("observacoes").value,

      status: document.getElementById("status").value,
      usuario: usuarioLogado ? usuarioLogado.nome : null
    };

    try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!resp.ok) {
      const text = await resp.text();
      showToast(`Erro HTTP ${resp.status}: ${text}`, "error");
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


    if(resultado.sucesso){
      fecharFormulario();
      carregarTabela();
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
      container.innerHTML = "<h3>Nenhum registro encontrado para os filtros selecionados.</h3>";
      return;
    }

    // Agrupar por status (ex.: Pendente, Aprovada, etc.)
    const grupos = [...new Set(registros.map(t => t.status || 'Sem Status'))];

    container.innerHTML = grupos.map(grp => {
      const items = registros.filter(t => (t.status||'') === grp);
      return `
        <div class="grupo-tipo">
          <h3>${grp} (${items.length})</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nº Req</th>
                <th>Data Solicitação</th>
                <th>Solicitante</th>
                <th>Cargo</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Urgência</th>
                <th>Prazo</th>
                <th>Contratação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(i => `
                <tr>
                  <td>${i.id}</td>
                  <td>${i.numero_requisicao || '-'}</td>
                  <td>${formatarData(i.data_solicitacao)}</td>
                  <td>${i.solicitante_nome || ''}</td>
                  <td>${i.titulo_cargo || ''}</td>
                  <td>${i.tipo_requisicao || ''}</td>
                  <td>${i.quantidade || ''}</td>
                  <td>${i.urgencia || ''}</td>
                  <td>${formatarData(i.prazo_desejado)}</td>
                  <td>${formatarData(i.data_contratacao)}</td>
                  
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
    const resp = await fetch(`${API}/${id}`);
    const resultado = await resp.json();
    if(!resultado.sucesso) { alert(resultado.mensagem || "Erro"); return; }
    const reg = resultado.dado;
    if(!reg) return;

    abrirFormulario();
    editandoId = id;
    document.getElementById("tituloForm").innerText = "Editar Requisição";

    // popular campos
    document.getElementById("tipo_requisicao").value = reg.tipo_requisicao || "Nova vaga";
    document.getElementById("titulo_cargo").value = reg.titulo_cargo || "";
    document.getElementById("area_setor").value = reg.area_setor || "";
    document.getElementById("quantidade").value = reg.quantidade || 1;
    document.getElementById("urgencia").value = reg.urgencia || "Média";
    document.getElementById("prazo_desejado").value = reg.prazo_desejado ? reg.prazo_desejado.split('T')[0] : "";
    document.getElementById("data_contratacao").value = reg.data_contratacao ? reg.data_contratacao.split('T')[0] : "";

    document.getElementById("solicitante_nome").value = reg.solicitante_nome || "";
    document.getElementById("solicitante_cargo").value = reg.solicitante_cargo || "";
    document.getElementById("departamento").value = reg.departamento || "";
    document.getElementById("colaborador_substituido").value = reg.colaborador_substituido || "";

    document.getElementById("faixa_salarial").value = reg.faixa_salarial || "";
    document.getElementById("tipo_contrato").value = reg.tipo_contrato || "CLT";

    document.getElementById("motivo").value = reg.motivo || "";
    document.getElementById("formacao_exigida").value = reg.formacao_exigida || "";
    document.getElementById("experiencia_minima").value = reg.experiencia_minima || "";
    document.getElementById("competencias_tecnicas").value = reg.competencias_tecnicas || "";
    document.getElementById("competencias_comportamentais").value = reg.competencias_comportamentais || "";
    document.getElementById("responsavel_rh").value = reg.responsavel_rh || "";
    document.getElementById("observacoes").value = reg.observacoes || "";
    document.getElementById("status").value = reg.status || "";

    showToast(reg.usuario, "success");

    // alterar submit para atualizar
    document.getElementById("formRequisicao").onsubmit = (e) => atualizar(e, id);
  }

  // === ATUALIZAR ===
  async function atualizar(event, id){
    event.preventDefault();
    const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    const dados = {
      solicitante_nome: document.getElementById("solicitante_nome").value,
      solicitante_cargo: document.getElementById("solicitante_cargo").value,
      departamento: document.getElementById("departamento").value,

      tipo_requisicao: document.getElementById("tipo_requisicao").value,
      titulo_cargo: document.getElementById("titulo_cargo").value,
      area_setor: document.getElementById("area_setor").value,
      empresa: unidadeSelecionada ? unidadeSelecionada.nome : null,
      quantidade: parseInt(document.getElementById("quantidade").value || 1, 10),
      motivo: document.getElementById("motivo").value,
      colaborador_substituido: document.getElementById("colaborador_substituido").value,
      urgencia: document.getElementById("urgencia").value,
      prazo_desejado: document.getElementById("prazo_desejado").value || null,
      data_contratacao: document.getElementById("data_contratacao").value || null,

      faixa_salarial: document.getElementById("faixa_salarial").value,
      tipo_contrato: document.getElementById("tipo_contrato").value,

      formacao_exigida: document.getElementById("formacao_exigida").value,
      experiencia_minima: document.getElementById("experiencia_minima").value,
      competencias_tecnicas: document.getElementById("competencias_tecnicas").value,
      competencias_comportamentais: document.getElementById("competencias_comportamentais").value,

      responsavel_rh: document.getElementById("responsavel_rh").value,
      observacoes: document.getElementById("observacoes").value,

      status: document.getElementById("status").value,
      usuario: usuarioLogado ? usuarioLogado.nome : null
    };

    const resp = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const resultado = await resp.json();
    showToast(resultado.mensagem || "Atualizado.", "success");
    if(resultado.sucesso){
      fecharFormulario();
      carregarTabela();
      // reset onsubmit para criar depois
      document.getElementById("formRequisicao").onsubmit = salvarRequisicao;
    }
  }

  // === EXCLUIR ===
  async function excluir(id){
    if(!confirm("Tem certeza que deseja excluir esta requisição?")) return;
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    const resultado = await resp.json();
    showToast(resultado.mensagem || "Resposta recebida.", "success");
    if(resultado.sucesso) carregarTabela();
  }

  const usuarioLog = JSON.parse(localStorage.getItem("usuarioLogado"));




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

  async function PDF(id) {
    try {
      const resp = await fetch(`${API}/${id}`);
      const resultado = await resp.json();

      if (!resultado.sucesso || !resultado.dado) {
        showToast("Erro ao gerar PDF: " + (resultado.mensagem || "Registro não encontrado.", "error"));
        return;
      }

      const r = resultado.dado;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Cabeçalho
      doc.setFontSize(16);
      doc.text("REQUISIÇÃO DE PESSOAL", 105, 15, { align: "center" });

      doc.addImage('/static/image/genesis1.png', 'JPEG', 10, 5, 30, 12);

      doc.setFontSize(10);
      doc.text(`Número: ${r.numero_requisicao || '-'}`, 14, 25);
      doc.text(`Data Solicitação: ${formatarData(r.data_solicitacao)}`, 140, 25);

      // Linha separadora
      doc.line(10, 28, 200, 28);

      // Seção 1 — Dados da vaga
      doc.setFontSize(12);
      doc.text("Dados da Vaga", 14, 36);
      doc.setFontSize(10);
      let y = 42;
      const espacamento = 6;

      const dadosVaga = [
        ["Tipo de Requisição", r.tipo_requisicao],
        ["Título do Cargo", r.titulo_cargo],
        ["Área / Setor", r.area_setor],
        ["Quantidade", r.quantidade],
        ["Faixa Salarial", r.faixa_salarial],
        ["Tipo de Contrato", r.tipo_contrato],
        ["Motivo", r.motivo],
        ["Formação Exigida", r.formacao_exigida],
        ["Experiência Mínima", r.experiencia_minima],
        ["Competências Técnicas", r.competencias_tecnicas],
        ["",],
        ["Competências Comportamentais", r.competencias_comportamentais],
        ["",],
        ["Observações", r.observacoes]
      ];

      dadosVaga.forEach(([label, valor]) => {
        doc.text(`${label}: ${valor || ''}`, 14, y);
        y += espacamento;
      });

      // Nova seção — Dados do Solicitante
      y += 4;
      doc.setFontSize(12);
      doc.text("Dados do Solicitante", 14, y);
      y += 6;
      doc.setFontSize(10);

      const dadosSolicitante = [
        ["Nome", r.solicitante_nome],
        ["Cargo", r.solicitante_cargo],
        ["Departamento", r.departamento],
        ["Colaborador Substituído", r.colaborador_substituido],
        ["Responsável RH", r.responsavel_rh],
        ["Urgência", r.urgencia],
        ["Prazo Desejado", formatarData(r.prazo_desejado)],
        ["Data Contratação", formatarData(r.data_contratacao)],
        ["Status", r.status]
      ];

      dadosSolicitante.forEach(([label, valor]) => {
        doc.text(`${label}: ${valor || ''}`, 14, y);
        y += espacamento;
        if (y > 270) { // quebra de página se estiver cheio
          doc.addPage();
          y = 20;
        }
      });

      // Rodapé
      doc.setFontSize(9);
      doc.text("© 2025 Genesis Lotus - Sistema de Requisições de Pessoal", 105, 290, { align: "center" });

      // Salvar PDF
      const nomeArquivo = `Requisicao_Pessoal_${r.titulo_cargo}.pdf`;
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