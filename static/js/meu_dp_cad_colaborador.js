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
  // Substitua por esta versão robusta
function formatarData(dataISO) {
  if (!dataISO) return "";

  // Se já for um objeto Date válido
  if (dataISO instanceof Date) {
    const d = dataISO;
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  // Se for número (timestamp ms)
  if (typeof dataISO === "number") {
    const d = new Date(dataISO);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  // Se for string, buscar padrão yyyy-mm-dd (suporta também yyyy-mm-ddTHH:MM:SS ou yyyy-mm-dd HH:MM:SS)
  if (typeof dataISO === "string") {
    // procurar o primeiro trecho YYYY-MM-DD
    const m = dataISO.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const ano = m[1], mes = m[2], dia = m[3];
      // evitar datas inválidas como 0000-00-00
      if (ano === "0000" || mes === "00" || dia === "00") return "";
      return `${dia}/${mes}/${ano}`;
    }

    // fallback: tentar criar Date apenas se for necessário (pode ainda ter timezone issues)
    const tentativa = new Date(dataISO);
    if (!isNaN(tentativa.getTime())) {
      const d = tentativa;
      const dia = String(d.getDate()).padStart(2, "0");
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

    return "";
  }

  return "";
}


  let editandoId = null;
  const API = "/api/funcionario"; // base da API

  function abrirFormulario(){
  document.getElementById("form-popup").style.display = "flex";
  document.getElementById("tituloForm").innerText = "Novo Cadastro";
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
    showToast("Sessão encerrada.", "success");
  }

  // === SALVAR (NOVO OU EDITAR) ===
async function salvarRequisicao(event) {
  event.preventDefault();

  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));

  const dados = {
    empresa: unidadeSelecionada ? unidadeSelecionada.nome : null,
    nome: document.getElementById("nome").value,
    cpf: document.getElementById("cpf").value,
    contato: document.getElementById("contato").value,
    emailpessoal: document.getElementById("emailpessoal").value,
    dtnascimento: document.getElementById("dtnascimento").value,
    sexo: document.getElementById("sexo").value,
    filhos: document.getElementById("filhos").value,
    cidade: document.getElementById("cidade").value,
    estado: document.getElementById("estado").value,
    formacao_escolar: document.getElementById("formacao_escolar").value,
    formacao_superior: document.getElementById("formacao_superior").value,
    matricula: document.getElementById("matricula").value,
    emailprofissional: document.getElementById("emailprofissional").value,
    cargo: document.getElementById("cargo").value,
    salariobase: document.getElementById("salariobase").value,
    ch: document.getElementById("ch").value,
    dtadmissao: document.getElementById("dtadmissao").value,
    dtintegracao: document.getElementById("dtintegracao").value,
    dtdemissao: document.getElementById("dtdemissao").value,
    pcd: document.getElementById("pcd").value,
    motivo_desligamento: document.getElementById("motivo_desligamento").value,
    status: document.getElementById("status").value,
    usuario: usuarioLogado?.nome || "admin"
  };

  try {
    let resp;
    let resultado;

    if (editandoId) {
      // 👉 Edição existente
      resp = await fetch(`${API}/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
    } else {
      // 👉 Novo cadastro
      resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
    }

    if (!resp.ok) {
      const text = await resp.text();
      showToast(`Erro HTTP ${resp.status}: ${text}`, "error");
      console.error("Resposta completa do servidor:", text);
      return;
    }

    resultado = await resp.json();
    console.log("Resposta JSON:", resultado);

    if (resultado.sucesso) {
      showToast(editandoId ? "Registro atualizado com sucesso!" : "Registro cadastrado com sucesso!", "success");
      fecharFormulario();
      carregarTabela();
    } else {
      showToast("Erro: " + (resultado.mensagem || resultado.erro), "error");
    }

  } catch (erro) {
    showToast(`Erro inesperado: ${erro.message}`, "error");
    console.error("Erro detalhado:", erro);
  }
}


  // === CARREGAR ===
  async function carregarTabela() {
    const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
    if (!unidadeSelecionada) {
      document.getElementById("tabelaRequisicoes").innerHTML = "<p>Selecione uma unidade.</p>";
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

    const registros = Array.isArray(dados) ? dados : dados.dados || [];

    if (!registros.length) {
      document.getElementById("tabelaRequisicoes").innerHTML = "<p>Nenhum registro encontrado.</p>";
      return;
    }

    // Agrupar por cargo (ou "Sem Cargo")
const grupos = [...new Set(registros.map(t => t.cargo || 'Sem Cargo'))];

const container = document.getElementById("tabelaRequisicoes");

container.innerHTML = grupos.map(grp => {

    const items = registros.filter(t => (t.cargo || 'Sem Cargo') === grp);

    return `
    <div class="grupo-tipo">
        <h3>${grp} (${items.length})</h3>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Colaborador</th>
                    <th>Cargo</th>
                    <th>Admissão</th>
                    <th>PCD</th>
                    <th>Sexo</th>
                    <th>Motivo Desligamento</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                ${items.map(i => `
                <tr>
                    <td>${i.id}</td>
                    <td>${i.nome || ''}</td>
                    <td>${i.cargo || ''}</td>
                    <td>${formatarData(i.dtadmissao) || ''}</td>
                    <td>${i.pcd || ''}</td>
                    <td>${i.sexo || ''}</td>
                    <td>${i.motivo_desligamento || ''}</td>
                    <td>${i.status || ''}</td>
                    <td>
                        <button class="btn" onclick="editar(${i.id})">
                            Editar
                        </button>
                        <button class="btn" onclick="PDF(${i.id})">
                            PDF
                        </button>
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
  try {
    const resp = await fetch(`${API}/${id}`);
    const resultado = await resp.json();

    if (!resultado.sucesso) {
      showToast(resultado.erro || "Erro ao buscar registro.", "error");
      return;
    }

    const reg = resultado.dados || {};  // ✅ Primeiro cria o reg

    if (!reg) {
      showToast("Registro não encontrado.", "error");
      return;
    }

    abrirFormulario();
    editandoId = id;
    document.getElementById("tituloForm").innerText = "Editar Colaborador";

    // Preencher campos
    document.getElementById("nome").value = reg.nome ?? "";
    document.getElementById("cpf").value = reg.cpf ?? "";
    document.getElementById("contato").value = reg.contato ?? "";
    document.getElementById("emailpessoal").value = reg.emailpessoal ?? "";
    document.getElementById("dtnascimento").value = reg.dtnascimento ?? "";
    document.getElementById("sexo").value = reg.sexo ?? "";
    document.getElementById("filhos").value = reg.filhos ?? "";
    document.getElementById("cidade").value = reg.cidade ?? "";
    document.getElementById("estado").value = reg.estado ?? "";
    document.getElementById("formacao_escolar").value = reg.formacao_escolar ?? "";
    document.getElementById("formacao_superior").value = reg.formacao_superior ?? "";
    document.getElementById("matricula").value = reg.matricula ?? "";
    document.getElementById("emailprofissional").value = reg.emailprofissional ?? "";
    document.getElementById("cargo").value = reg.cargo ?? "";
    document.getElementById("salariobase").value = reg.salariobase ?? "";
    document.getElementById("ch").value = reg.ch ?? "";
    document.getElementById("dtadmissao").value = reg.dtadmissao ?? "";
    document.getElementById("dtintegracao").value = reg.dtintegracao ?? "";
    document.getElementById("dtdemissao").value = reg.dtdemissao ?? "";
    document.getElementById("pcd").value = reg.pcd ?? "";
    document.getElementById("motivo_desligamento").value = reg.motivo_desligamento ?? "";
    document.getElementById("status").value = reg.status ?? "Ativo";

    document.getElementById("formExperiencia").onsubmit = (e) => atualizar(e, id);

  } catch (erro) {
    console.error("Erro ao editar:", erro);
    showToast("Erro ao carregar dados para edição.", "error");
  }
}


  // === ATUALIZAR ===
  async function atualizar(e, id) {
  e.preventDefault();

  const dados = {
    empresa: unidadeSelecionada ? unidadeSelecionada.nome : null,
    nome: document.getElementById("nome").value,
    cpf: document.getElementById("cpf").value,
    contato: document.getElementById("contato").value,
    emailpessoal: document.getElementById("emailpessoal").value,
    dtnascimento: document.getElementById("dtnascimento").value,
    sexo: document.getElementById("sexo").value,
    filhos: document.getElementById("filhos").value,
    cidade: document.getElementById("cidade").value,
    estado: document.getElementById("estado").value,
    formacao_escolar: document.getElementById("formacao_escolar").value,
    formacao_superior: document.getElementById("formacao_superior").value,
    matricula: document.getElementById("matricula").value,
    emailprofissional: document.getElementById("emailprofissional").value,
    cargo: document.getElementById("cargo").value,
    salariobase: document.getElementById("salariobase").value,
    ch: document.getElementById("ch").value,
    dtadmissao: document.getElementById("dtadmissao").value,
    dtintegracao: document.getElementById("dtintegracao").value,
    dtdemissao: document.getElementById("dtdemissao").value,
    pcd: document.getElementById("pcd").value,
    motivo_desligamento: document.getElementById("motivo_desligamento").value,
    status: document.getElementById("status").value,
    usuario: usuarioLogado?.nome || "admin"
  };

  const resp = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resp.json();

  if (resultado.sucesso) {
    showToast("Registro atualizado com sucesso!", "success");
    fecharFormulario();
    carregarTabela();
  } else {
    showToast("Erro ao atualizar: " + (resultado.erro || resultado.mensagem), "error");
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

  // === EXPORTAR ===
  function exportarTabela() {
    const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
    const nomeUnidade = unidadeSelecionada ? unidadeSelecionada.nome.replace(/\s+/g, "_") : "Sem_Unidade";

    const tabelas = document.querySelectorAll("#tabelaRequisicoes table");
    if (!tabelas.length) { showToast("Nenhum dado encontrado para exportar.", "error");; return; }
    const wb = XLSX.utils.book_new();

    tabelas.forEach((tabela, index) => {
      const titulo = tabela.closest(".grupo-tipo")?.querySelector("h3")?.textContent || `Tabela_${index + 1}`;
      const ws = XLSX.utils.table_to_sheet(tabela);
      XLSX.utils.book_append_sheet(wb, ws, titulo.substring(0,31));
    });

    const nomeArquivo = `Genesis_Lotus_avaliação_experiencia_${nomeUnidade}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  }

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

    // Cabeçalho
    doc.addImage('/static/image/genesis1.png', 'JPEG', 10, 5, 30, 12);
    doc.setFontSize(16);
    doc.text("FICHA CADASTRAL", 105, 15, { align: "center" });

    // Linha separadora
    doc.line(10, 20, 200, 20);

    doc.setFontSize(11);
    let y = 30;
    const espacamento = 8;

    // Bloco 1 — Dados do colaborador
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Colaborador", 10, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    doc.text(`Colaborador: ${r.nome || ""}`, 10, y); y += espacamento;
    doc.text(`CPF: ${r.cpf || ""}`, 10, y); y += espacamento;
    doc.text(`Contato: ${r.contato || ""}`, 10, y); y += espacamento;
    doc.text(`E-mail pessoal: ${r.emailpessoal || ""}`, 10, y); y += espacamento;
    doc.text(`Data de Nascimento: ${r.dtnascimento ? formatarData(r.dtnascimento) : ""}`, 10, y); y += espacamento;
    doc.text(`Sexo: ${r.sexo || ""}`, 10, y); y += espacamento;
    doc.text(`Cidade: ${r.cidade || ""}`, 10, y); y += espacamento;
    doc.text(`Estado: ${r.estado || ""}`, 10, y); y += espacamento;

    // Bloco 2 — Avaliações
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Formação", 10, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    doc.text(`Escolaridade: ${r.formacao_escolar || ""}`, 10, y); y += espacamento;
    doc.text(`Formação / Superior: ${r.formacao_superior || ""}`, 10, y); y += espacamento;

    // Bloco 3 — Status
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Dados de contratação", 10, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    doc.text(`Matricula: ${r.matricula || ""}`, 10, y); y += espacamento;
    doc.text(`Cargo: ${r.cargo || ""}`, 10, y); y += espacamento;
    doc.text(`E-mail corporativo: ${r.emailprofissional || ""}`, 10, y); y += espacamento;
    doc.text(`Salário base: ${r.salariobase || ""}`, 10, y); y += espacamento;
    doc.text(`Jornada de trabalho: ${r.ch || ""}`, 10, y); y += espacamento;
    doc.text(`PCD: ${r.pcd || ""}`, 10, y); y += espacamento;
    doc.text(`Admissão: ${r.dtadmissao ? formatarData(r.dtadmissao) : ""}`, 10, y); y += espacamento;
    doc.text(`Integração: ${r.dtintegracao ? formatarData(r.dtintegracao) : ""}`, 10, y); y += espacamento;
    doc.text(`Desligamento: ${r.dtdemissao ? formatarData(r.dtdemissao) : ""}`, 10, y); y += espacamento;
    doc.text(`Motivo: ${r.motivo_desligamento || ""}`, 10, y); y += espacamento;
    doc.text(`Situação: ${r.status || ""}`, 10, y); y += espacamento;

    // Bloco 4 — Rodapé
    y = 280;
    doc.setFontSize(9);
    doc.text("© 2025 Genesis Lotus", 105, y, { align: "center" });

    // Salvar PDF
    const nomeArquivo = `Ficha_Cadastral_${r.nome?.replace(/\s+/g, "_") || id}.pdf`;
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

  async function editar(id) {
  try {
    const resp = await fetch(`${API}/${id}`);
    const resultado = await resp.json();

    if (!resultado.sucesso || !resultado.dado) {
      showToast("Erro ao buscar registro.", "error");
      return;
    }

    const r = resultado.dado;

    editandoId = id;
    document.getElementById("tituloForm").innerText = "Editar Registro";

    // Preencher campos do formulário
    document.getElementById("nome").value = r.nome || "";
    document.getElementById("cpf").value = r.cpf || "";
    document.getElementById("contato").value = r.contato || "";
    document.getElementById("emailpessoal").value = r.emailpessoal || "";
    document.getElementById("dtnascimento").value = r.dtnascimento || "";
    document.getElementById("sexo").value = r.sexo || "";
    document.getElementById("filhos").value = r.filhos || "";
    document.getElementById("cidade").value = r.cidade || "";
    document.getElementById("estado").value = r.estado || "";
    document.getElementById("formacao_escolar").value = r.formacao_escolar || "";
    document.getElementById("formacao_superior").value = r.formacao_superior || "";
    document.getElementById("matricula").value = r.matricula || "";
    document.getElementById("emailprofissional").value = r.emailprofissional || "";
    document.getElementById("cargo").value = r.cargo || "";
    document.getElementById("salariobase").value = r.salariobase || "";
    document.getElementById("ch").value = r.ch || "";
    document.getElementById("dtadmissao").value = r.dtadmissao || "";
    document.getElementById("dtintegracao").value = r.dtintegracao || "";
    document.getElementById("dtdemissao").value = r.dtdemissao || "";
    document.getElementById("pcd").value = r.pcd || "";
    document.getElementById("motivo_desligamento").value = r.motivo_desligamento || "";
    document.getElementById("status").value = r.status || "";

    // Abrir modal
    document.getElementById("form-popup").style.display = "flex";

  } catch (erro) {
    console.error("Erro ao editar registro:", erro);
    showToast("Erro inesperado ao editar.", "error");
  }
}


  document.addEventListener("DOMContentLoaded", () => {
    // garantir que unidades carreguem no load
    carregarUnidades();
    carregarTabela();
  });