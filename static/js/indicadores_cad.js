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
    
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";

    function abrirUsuario() {
      const u = JSON.parse(localStorage.getItem("usuarioLogado"));
      window.location.href = `/usuario?email=${encodeURIComponent(u.email)}`;
    }

    const areaTabela = document.getElementById("areaTabela");
    const overlayContainer = document.getElementById("overlayContainer");

    function sair() {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "/";
    }

    function formatarData(dataISO) {
      if (!dataISO) return "";
      return new Date(dataISO).toLocaleDateString("pt-BR");
    }

    // === MODAL ===
    function abrirForm(ind = null) {
      const edicao = !!ind;

      overlayContainer.innerHTML = `
        <div class="overlay" onclick="clicarForaModal(event)">
          <div class="modal">
            <button class="close-btn" onclick="fecharForm()">×</button>
            <h3>${edicao ? "Editar Indicador" : "Novo Indicador"}</h3>

            <form onsubmit="${edicao ? `atualizarIndicador(event, ${ind.id})` : "salvarIndicador(event)"}">
              <input id="nome" value="${ind?.nome || ""}" placeholder="Nome do indicador" required>

              <textarea id="definicao" rows="3" placeholder="Definição">${ind?.definicao || ""}</textarea>

              <textarea id="formula" rows="2" placeholder="Fórmula">${ind?.formula || ""}</textarea>

              <input id="fonte" value="${ind?.fonte || ""}" placeholder="Fonte dos dados">

              <input id="meta" value="${ind?.meta || ""}" placeholder="Meta">

              <input id="setor" value="${ind?.setor || ""}" placeholder="Setor">

              <select id="unidademedida">
                <option value="">Unidade de Medida</option>
                <option ${ind?.unidademedida==="Número"?"selected":""}>Número</option>
                <option ${ind?.unidademedida==="Porcentagem"?"selected":""}>Porcentagem</option>
                <option ${ind?.unidademedida==="Hora"?"selected":""}>Hora</option>
                <option ${ind?.unidademedida==="Moeda"?"selected":""}>Moeda</option>
              </select>

              <select id="tipo">
                <option value="">Tipo</option>
                <option ${ind?.tipo==="Operacional"?"selected":""}>Operacional</option>
                <option ${ind?.tipo==="Tático"?"selected":""}>Tático</option>
                <option ${ind?.tipo==="Estratégico"?"selected":""}>Estratégico</option>
              </select>

              <select id="status">
                <option value="">Status</option>
                <option ${ind?.status==="Ativo"?"selected":""}>Ativo</option>
                <option ${ind?.status==="Suspenso"?"selected":""}>Suspenso</option>
                <option ${ind?.status==="Inativo"?"selected":""}>Inativo</option>
              </select>

              <button type="submit" class="btn">${edicao ? "Salvar Alterações" : "Salvar"}</button>
            </form>
          </div>
        </div>`;
    }

    function clicarForaModal(e) {
      if (e.target.classList.contains("overlay")) fecharForm();
    }
    function fecharForm() { overlayContainer.innerHTML = ""; }

    function getFormData() {
      return {
        nome: document.getElementById("nome").value,
        definicao: document.getElementById("definicao").value,
        formula: document.getElementById("formula").value,
        fonte: document.getElementById("fonte").value,
        meta: document.getElementById("meta").value,
        setor: document.getElementById("setor").value,
        unidademedida: document.getElementById("unidademedida").value,
        tipo: document.getElementById("tipo").value,
        status: document.getElementById("status").value
      };
    }

    // === CRUD ===
    async function salvarIndicador(event) {
      event.preventDefault();
      const payload = getFormData();

      const resp = await fetch("/cadindicadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      showToast(data.mensagem, "success");
      fecharForm();
      carregarIndicadores();
    }

    async function atualizarIndicador(event, id) {
      event.preventDefault();
      const payload = getFormData();

      const resp = await fetch(`/cadindicadores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      showToast(data.mensagem, "success");
      fecharForm();
      carregarIndicadores();
    }

    async function carregarIndicadores() {
      const resp = await fetch(`/cadindicadores`);
      const data = await resp.json();

      if (resp.ok && data.sucesso) renderTabela(data.indicadores);
      else areaTabela.innerHTML = "<p>Nenhum indicador encontrado.</p>";
    }

    function renderTabela(ind) {
      areaTabela.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Nome</th><th>Meta</th><th>Unidade</th><th>Tipo</th>
              <th>Setor</th><th>Status</th><th>Criado em</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${ind.map(i => `
              <tr>
                <td>${i.nome}</td>
                <td>${i.meta}</td>
                <td>${i.unidademedida}</td>
                <td>${i.tipo}</td>
                <td>${i.setor}</td>
                <td>${i.status}</td>
                <td>${formatarData(i.dtregistro)}</td>
                <td>
                  <button onclick='abrirForm(${JSON.stringify(i)})'>
                    <i class="fa-solid fa-pen"></i>
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
    }

    // === FILTRO ===
    async function filtrarIndicadores() {
      const params = new URLSearchParams({
        nome: document.getElementById("filtroNome").value,
        setor: document.getElementById("filtroSetor").value,
        tipo: document.getElementById("filtroTipo").value,
        status: document.getElementById("filtroStatus").value
      });

      const resp = await fetch(`/cadindicadores/filtros?${params}`);
      const data = await resp.json();

      if (resp.ok && data.sucesso) renderTabela(data.indicadores);
      else showToast("Nenhum indicador encontrado.", "error");
    }

    carregarIndicadores();