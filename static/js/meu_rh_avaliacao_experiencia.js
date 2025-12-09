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
  const API = "/api/avaliacao_experiencia"; // base da API

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

  // === SALVAR (NOVO OU EDITAR) ===
async function salvarRequisicao(event) {
  event.preventDefault();

  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  editandoEmpresa = reg.empresa;

  const dados = {
    empresa: editandoId
      ? editandoEmpresa
      : (unidadeSelecionada ? unidadeSelecionada.nome : null),

    nome: document.getElementById("nome").value,
    cargo: document.getElementById("cargo").value,
    dt_admissao: document.getElementById("dt_admissao").value,
    dt_integracao: document.getElementById("dt_integracao").value,
    dt_avaliacao1: document.getElementById("dt_avaliacao1").value,
    dt_avaliacao2: document.getElementById("dt_avaliacao2").value,
    padrinho: document.getElementById("padrinho").value,
    dt_padrinho: document.getElementById("dt_padrinho").value,
    status: document.getElementById("status").value,
    usuario: usuarioLogado ? usuarioLogado.nome : null
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
      showToast(`❌ Erro HTTP ${resp.status}: ${text}`, "error");
      console.error("Resposta completa do servidor:", text);
      return;
    }

    resultado = await resp.json();
    console.log("Resposta JSON:", resultado);

    if (resultado.sucesso) {
      showToast(editandoId ? "Registro atualizado com sucesso!" : "Registro cadastrado com sucesso!", "error");
      fecharFormulario();
      carregarTabela();
    } else {
      showToast("Erro: " + (resultado.mensagem || resultado.erro), "error");
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

    const registros = Array.isArray(dados) ? dados : dados.dados || [];

    if (!registros.length) {
      document.getElementById("tabelaRequisicoes").innerHTML = "<h3>Nenhum registro encontrado.</h3>";
      return;
    }

    // Agrupar por status
    const grupos = [...new Set(registros.map(t => t.status || 'Sem Status'))];

    const container = document.getElementById("tabelaRequisicoes"); // ✅ CORREÇÃO AQUI
    container.innerHTML = grupos.map(grp => {
      const items = registros.filter(t => (t.status||'') === grp);
      return `
        <div class="grupo-tipo">
          <h3>${grp} (${items.length})</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Data admissão</th>
                <th>Data integração</th>
                <th>Colaborador</th>
                <th>Cargo</th>
                <th>1ª Avaliação</th>
                <th>2ª Avaliação</th>
                <th>Padrinho</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(i => `
                <tr>
                  <td>${i.id}</td>
                  <td>${formatarData(i.dt_admissao)}</td>
                  <td>${formatarData(i.dt_integracao)}</td>
                  <td>${i.nome || ''}</td>
                  <td>${i.cargo || ''}</td>
                  <td>${formatarData(i.dt_avaliacao1)}</td>
                  <td>${formatarData(i.dt_avaliacao2)}</td>
                  <td>${i.padrinho || ''}</td>
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
async function editar(id) {
  try {
    const resp = await fetch(`${API}/${id}`);
    const resultado = await resp.json();

    if (!resultado.sucesso) {
      showToast(resultado.mensagem || "Erro ao buscar registro.", "error");
      return;
    }

    const reg = resultado.dados; // ✅ Corrigido: era resultado.dado

    if (!reg) {
      showToast("Registro não encontrado.", "error");
      return;
    }

    abrirFormulario();
    editandoId = id;
    document.getElementById("tituloForm").innerText = "Editar Avaliação";

    // Popular campos
    document.getElementById("unidade").value = reg.empresa || "";
    document.getElementById("nome").value = reg.nome || "";
    document.getElementById("cargo").value = reg.cargo || "";
    document.getElementById("dt_admissao").value = reg.dt_admissao || "";
    document.getElementById("dt_integracao").value = reg.dt_integracao || "";
    document.getElementById("dt_avaliacao1").value = reg.dt_avaliacao1 || "";
    document.getElementById("dt_avaliacao2").value = reg.dt_avaliacao2 || "";
    document.getElementById("padrinho").value = reg.padrinho || "";
    document.getElementById("dt_padrinho").value = reg.dt_padrinho || "";
    document.getElementById("status").value = reg.status || "Em Experiência";

    // Alterar submit para atualizar
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
    empresa: document.getElementById("unidade").value,
    nome: document.getElementById("nome").value,
    cargo: document.getElementById("cargo").value,
    dt_admissao: document.getElementById("dt_admissao").value,
    dt_integracao: document.getElementById("dt_integracao").value,
    dt_avaliacao1: document.getElementById("dt_avaliacao1").value,
    dt_avaliacao2: document.getElementById("dt_avaliacao2").value,
    padrinho: document.getElementById("padrinho").value,
    dt_padrinho: document.getElementById("dt_padrinho").value,
    status: document.getElementById("status").value
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
    doc.text("AVALIAÇÃO DE EXPERIÊNCIA", 105, 15, { align: "center" });

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
    doc.text(`Cargo: ${r.cargo || ""}`, 10, y); y += espacamento;
    doc.text(`Data de Admissão: ${r.dt_admissao ? formatarData(r.dt_admissao) : ""}`, 10, y); y += espacamento;
    doc.text(`Data de Integração: ${r.dt_integracao ? formatarData(r.dt_integracao) : ""}`, 10, y); y += espacamento;

    // Bloco 2 — Avaliações
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Avaliações", 10, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    doc.text(`1ª Avaliação: ${r.dt_avaliacao1 ? formatarData(r.dt_avaliacao1) : ""}`, 10, y); y += espacamento;
    doc.text(`2ª Avaliação: ${r.dt_avaliacao2 ? formatarData(r.dt_avaliacao2) : ""}`, 10, y); y += espacamento;
    doc.text(`Padrinho: ${r.padrinho || ""}`, 10, y); y += espacamento;
    doc.text(`Data de Apadrinhamento: ${r.dt_padrinho ? formatarData(r.dt_padrinho) : ""}`, 10, y); y += espacamento;

    // Bloco 3 — Status
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Status", 10, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    doc.text(`Situação Atual: ${r.status || ""}`, 10, y); y += espacamento;

    // Bloco 4 — Rodapé
    y = 280;
    doc.setFontSize(9);
    doc.text("© 2025 Genesis Lotus - Sistema de Avaliação de Experiência", 105, y, { align: "center" });

    // Salvar PDF
    const nomeArquivo = `Avaliacao_Experiencia_${r.nome?.replace(/\s+/g, "_") || id}.pdf`;
    doc.save(nomeArquivo);

  } catch (erro) {
    showToast("Erro ao gerar PDF: " + erro.message, "error");
    console.error(erro);
  }
}


  // === Unidades permitidas (mantive seu endpoint antigo) ===
  carregarTabela();
  carregarUnidades();
  carregarFuncionarios();

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

  async function carregarFuncionarios() {
    try {
      const resp = await fetch('/api/funcionario');
      const dados = await resp.json();

      if (dados.sucesso) {

        const select = document.getElementById('nome');
        select.innerHTML = '<option value="">Selecione o colaborador</option>';

        dados.dados.forEach(u => {     // ← note: no backend o nome é "dados"
          const nomes = (u.nome || "")
            .split(";")
            .map(n => n.trim())
            .filter(Boolean);

          nomes.forEach(nome => {
            const opt = document.createElement("option");
            opt.value = u.nome;
            opt.textContent = nome;
            select.appendChild(opt);
          });
        });

        const funcionarioSalvo = JSON.parse(localStorage.getItem('nomefuncionario'));

        if (funcionarioSalvo)
          select.value = funcionarioSalvo.id;
        else if (dados.dados.length > 0) {
          const u0 = dados.dados[0];
          select.value = u0.id;
          localStorage.setItem('nomefuncionario', JSON.stringify(u0));
        }
      }

    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
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