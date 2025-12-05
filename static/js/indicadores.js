const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";

const tabela = document.querySelector("#tabelaIndicadores tbody");
const overlay = document.getElementById("overlay");
const form = document.getElementById("formIndicador");
let editando = false;

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

// 🔧 ABRIR MODAL (Novo ou Editar)
function abrirFormulario(indicador = null) {
  overlay.classList.add("mostrar");

  if (indicador) {
    document.getElementById("tituloForm").textContent = "Editar Indicador";
    document.getElementById("id").value = indicador.id;
    document.getElementById("SelectIndicador").value = indicador.nome;
    document.getElementById("mes").value = indicador.mes;
    document.getElementById("ano").value = indicador.ano;
    document.getElementById("valor").value = indicador.valor;
    document.getElementById("analise_critica").value = indicador.analise_critica;
    document.getElementById("acao_corretiva").value = indicador.acao_corretiva;
    document.getElementById("prazo").value = indicador.prazo ? indicador.prazo.split('T')[0] : "";
    document.getElementById("status").value = indicador.status;
    editando = true;
  } else {
    form.reset();
    document.getElementById("id").value = "";
    document.getElementById("tituloForm").textContent = "Novo Indicador";
    editando = false;
  }
}

// 🔧 FECHAR MODAL
function fecharFormulario() {
  overlay.classList.remove("mostrar");
  form.reset();
  editando = false;
}

// 🔧 Fechar ao clicar fora
overlay.addEventListener("click", fecharFormulario);

// ======================== CRUD ==========================
function formatarData(dataISO) {
  if (!dataISO) return "";
  const data = new Date(dataISO);
  return `${String(data.getDate()).padStart(2,"0")}/${String(data.getMonth()+1).padStart(2,"0")}/${data.getFullYear()}`;
}

async function carregarIndicadores() {
  const unidadeSelecionada = JSON.parse(localStorage.getItem("unidadeSelecionada"));
  if (!unidadeSelecionada) {
    tabela.innerHTML = "<tr><td colspan='10'>Selecione uma unidade.</td></tr>";
    return;
  }

  const params = new URLSearchParams({
    indicador: document.getElementById("filtroIndicador").value || "",
    mes: document.getElementById("filtroMes").value || "",
    ano: document.getElementById("filtroAno").value || "",
    unidade: unidadeSelecionada.nome
  });

  const res = await fetch(`/api/indicadores?${params.toString()}`);
  const data = await res.json();
  tabela.innerHTML = "";

  if (!data.length) {
    tabela.innerHTML = "<tr><td colspan='10'>Nenhum resultado encontrado.</td></tr>";
    return;
  }

  data.forEach(ind => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ind.id}</td>
      <td>${ind.empresa || "-"}</td>
      <td>${ind.indicador}</td>
      <td>${ind.mes}</td>
      <td>${ind.ano}</td>
      <td>${ind.valor}</td>
      <td>${ind.analise_critica || ""}</td>
      <td>${ind.acao_corretiva || ""}</td>
      <td>${formatarData(ind.prazo)}</td>
      <td>${ind.status}</td>
      <td>${formatarData(ind.dtregistro)}</td>
      <td>
        <button class="btn" onclick='abrirFormulario(${JSON.stringify(ind)})'><i class="fa-solid fa-pen-to-square"></i> Editar</button>
      </td>`;
    tabela.appendChild(tr);
  });

  atualizarFiltroIndicadores(data);
}

function atualizarFiltroIndicadores(lista) {
  /* const filtro = document.getElementById("filtroIndicador"); */
  const indicadores = [...new Set(lista.map(i => i.indicador))];
  filtro.innerHTML = `<option value="">Todos os Indicadores</option>`;
  indicadores.forEach(ind => {
    const opt = document.createElement("option");
    opt.value = ind;
    opt.textContent = ind;
    filtro.appendChild(opt);
  });
}

async function excluirIndicador(id) {
  if (!confirm("Deseja excluir este indicador?")) return;
  await fetch(`/api/indicadores/${id}`, { method: "DELETE" });
  carregarIndicadores();
}

// ======================== SALVAR ==========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const unidadeSelecionada = JSON.parse(localStorage.getItem("unidadeSelecionada"));
  const indicador = {
    indicador: document.getElementById("SelectIndicador").value,
    mes: document.getElementById("mes").value,
    ano: document.getElementById("ano").value,
    valor: document.getElementById("valor").value,
    analise_critica: document.getElementById("analise_critica").value,
    acao_corretiva: document.getElementById("acao_corretiva").value,
    prazo: document.getElementById("prazo").value,
    status: document.getElementById("status").value,
    unidade: unidadeSelecionada ? unidadeSelecionada.nome : null,
  };

  const id = document.getElementById("id").value;
  const url = editando ? `/api/indicadores/${id}` : "/api/indicadores";
  const metodo = editando ? "PUT" : "POST";

  await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(indicador)
  });

  fecharFormulario();
  carregarIndicadores();
});

// ======================== UNIDADES ==========================
async function carregarUnidades() {
  try {
    const resp = await fetch(`/api/unidades_permitidas?usuario_id=${usuarioLogado.id}`);
    const dados = await resp.json();

    if (dados.sucesso) {
      const select = document.getElementById('selectUnidade');
      select.innerHTML = '<option value="">Selecione a Unidade</option>';
      dados.unidades.forEach(u => {
        u.nome.split(";").map(n => n.trim()).filter(n => n).forEach(nome => {
          const opt = document.createElement("option");
          opt.value = u.nome;
          opt.textContent = nome;
          select.appendChild(opt);
        });
      });

      const unidadeSalva = JSON.parse(localStorage.getItem('unidadeSelecionada'));
      if (unidadeSalva) select.value = unidadeSalva.id;
    }
  } catch (err) { console.error("Erro ao carregar unidades:", err); }
}

// ======================== FICHA INDICADORES ==========================
async function carregarFichaIndicadores() {
  try {
    const resp = await fetch('/cadindicadores');
    const dados = await resp.json();

    if (dados.sucesso) {
      const select = document.getElementById('SelectIndicador');
      const filtro = document.getElementById('filtroIndicador');

      select.innerHTML = '<option value="">Selecione o indicador</option>';
      filtro.innerHTML = '<option value="">Todos os indicadores</option>';

      dados.indicadores.forEach(u => {
        // SELECT PRINCIPAL
        const opt1 = document.createElement("option");
        opt1.value = u.nome; // ← usa nome
        opt1.textContent = u.nome;
        select.appendChild(opt1);

        // SELECT FILTRO
        const opt2 = document.createElement("option");
        opt2.value = u.nome;
        opt2.textContent = u.nome;
        filtro.appendChild(opt2);
      });

    }
  } catch (err) {
    console.error("Erro ao carregar indicadores:", err);
  }
}

document.getElementById('selectUnidade').addEventListener('change', () => {
  const select = document.getElementById('selectUnidade');
  const id = select.value;
  const nome = select.options[select.selectedIndex].text;
  if (id) localStorage.setItem('unidadeSelecionada', JSON.stringify({ id, nome }));
  else localStorage.removeItem('unidadeSelecionada');
});

function exportarTabela() {
  const unidadeSelecionada = JSON.parse(localStorage.getItem('unidadeSelecionada'));
  const nomeUnidade = unidadeSelecionada ? unidadeSelecionada.nome.replace(/\s+/g, "_") : "Sem_Unidade";
  const tabela = document.getElementById("tabelaIndicadores");
  if (!tabela || tabela.rows.length <= 1) {
    showToast("Nenhum dado encontrado na tabela para exportar.", "error");
    return;
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(tabela);
  XLSX.utils.book_append_sheet(wb, ws, "Indicadores");
  XLSX.writeFile(wb, `Genesis_Lotus_Indicadores_${nomeUnidade}.xlsx`);
}

carregarUnidades();
carregarFichaIndicadores();
carregarIndicadores();