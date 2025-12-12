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
  const API = "/api/processo_seletivo"; // base da API

  function abrirFormulario(){
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    document.getElementById("form-popup").style.display = "flex";
    document.getElementById("tituloForm").innerText = "Seleção";
    editandoId = null;
    document.getElementById("formRequisicao").reset();
    psicologo.value = usuarioLogado ? usuarioLogado.nome : null
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

  // === SALVAR OU ATUALIZAR ===
async function salvarRequisicao(event){
  event.preventDefault();

  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada')) || {};
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || {};

    const dados = {
        numero_requisicao: document.getElementById("numero_requisicao").value.trim(),
        nome: document.getElementById("nome").value.trim(),
        cargo: document.getElementById("cargo").value.trim(),
        contato: document.getElementById("contato").value.trim(),
        email: document.getElementById("email").value.trim(),
        data: document.getElementById("data").value || new Date().toISOString().slice(0,10),
        fase: document.getElementById("fase").value || 1,
        formacao: document.getElementById("formacao").value.trim(),
        sintese: document.getElementById("sintese").value.trim(),
        perfil_comportamental: document.getElementById("perfil_comportamental").value.trim(),
        conclusao: document.getElementById("conclusao").value.trim(),
        modo: document.getElementById("modo").value,
        status: document.getElementById("status").value,
        empresa: unidadeSelecionada.nome || '',
        usuario: usuarioLogado.nome || usuarioLogado.id || ''
    };


  const url = editandoId ? `${API}/${editandoId}` : API;
  const method = editandoId ? "PUT" : "POST";

  const resp = await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  const resultado = await resp.json();
  showToast(resultado.mensagem || "Operação concluída.", "success");

  if (resultado.sucesso) {
    fecharFormulario();
    carregarTabela();
  }
}

// === EDITAR ===
async function editar(id){
  const resp = await fetch(`${API}/${id}`);
  const resultado = await resp.json();

  if(!resultado.sucesso){
    showToast(resultado.mensagem || "Erro ao carregar registro.", "error");
    return;
  }

  const r = resultado.dado;

  abrirFormulario();
  editandoId = id;
  tituloForm.innerText = "Editar Seleção";

  numero_requisicao.value = r.numero_requisicao || "";
  nome.value = r.nome || "";
  cargo.value = r.cargo || "";
  contato.value = r.contato || "";
  email.value = r.email || "";
  data.value = r.data || "";
  fase.value = r.fase || "1";
  formacao.value = r.formacao || "";
  sintese.value = r.sintese || "";
  perfil_comportamental.value = r.perfil_comportamental || "";
  conclusao.value = r.conclusao || "";
  modo.value = r.modo || "Presencial";
  psicologo.value = r.usuario || "Presencial";
  status.value = r.status || "Em processo";
  

  showToast("Psicólogo(a) responsável: " + r.usuario, "success");
}

// === ATUALIZAR REGISTRO ===
async function atualizar(event, id){
  event.preventDefault();
  await salvarRequisicao(event);  
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
                <th>Nº Requisição</th>
                <th>Entrevista</th>
                <th>Solicitante</th>
                <th>Cargo</th>
                <th>Fase</th>
                <th>Psicólogo(a)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(i => `
                <tr>
                  <td>${i.id}</td>
                  <td>${i.numero_requisicao || '-'}</td>
                  <td>${formatarData(i.data)}</td>
                  <td>${i.nome || ''}</td>
                  <td>${i.cargo || ''}</td>
                  <td>${i.fase || ''}</td>
                  <td>${i.usuario || ''}</td>
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

  async function PDF(id) {
  try {
    const resp = await fetch(`${API}/${id}`);
    const resultado = await resp.json();

    if (!resultado.sucesso || !resultado.dado) {
      showToast("Erro ao gerar PDF: " + (resultado.mensagem || "Registro não encontrado."), "error");
      return;
    }

    const r = resultado.dado;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("AVALIAÇÃO DE CANDIDATO", 105, 15, { align: "center" });

    doc.addImage('/static/image/genesis1.png', 'JPEG', 10, 5, 30, 12);

    doc.setFontSize(10);
    doc.text(`Número: ${r.numero_requisicao || '-'}`, 14, 25);
    doc.text(`Data Entrevista: ${formatarData(r.data)}`, 85, 25);
    doc.text(`Status: ${r.status || '-'}`, 150, 25);

    doc.line(10, 28, 200, 28);

    // Seção
    doc.setFontSize(12);
    doc.text("Detalhes", 14, 36);
    doc.setFontSize(10);

    let y = 42;
    const espacamento = 6;
    const larguraMax = 180; // margem esquerda e direita controladas

    const dadosVaga = [
      ["Empresa", r.empresa],
      ["Modo de entrevista", r.modo],
      ["Cargo", r.cargo],
      ["Candidato", r.nome],
      ["Contato", r.contato],
      ["E-mail", r.email],
      ["Formação acadêmica", r.formacao],
      [""],
      ["Sintese", r.sintese],
      [""],
      ["Perfil Comportamental", r.perfil_comportamental],
      [""],
      ["Conclusão", r.conclusao]
    ];

    dadosVaga.forEach(([label, valor]) => {

      valor = valor || "";

      // GERA A QUEBRA AUTOMÁTICA
      const linhas = doc.splitTextToSize(`${label}: ${valor}`, larguraMax);

      linhas.forEach(linha => {
        doc.text(linha, 14, y);
        y += espacamento;

        // Se chegar perto do final da página, cria nova página
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      // espaço extra entre campos
      y += 2;
    });

    // Rodapé
    doc.setFontSize(9);
    doc.text("© 2025 Genesis Lotus", 105, 290, { align: "center" });

    const nomeArquivo = `Processo_Seletivo_${r.nome}.pdf`;
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

  

async function buscarRequisicaoManualmente() {
    const numeroReq = document.getElementById("numero_requisicao").value.trim();

    if (!numeroReq) {
        showToast("Digite o número da requisição.", "error");
        return;
    }

    try {
        const resp = await fetch(`/api/buscar_requisicao?numero=${numeroReq}`);
        const dados = await resp.json();

        if (dados.sucesso && dados.dado) {
            document.getElementById("cargo").value = dados.dado.titulo_cargo || "";
        } else {
            alert("Requisição não encontrada para esta empresa.");
        }
    } catch (e) {
        console.error("Erro ao buscar requisição:", e);
        alert("Erro ao consultar requisição.");
    }
}



  document.addEventListener("DOMContentLoaded", () => {
    // garantir que unidades carreguem no load
    carregarUnidades();
    carregarTabela();
  });