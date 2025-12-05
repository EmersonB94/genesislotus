let chamadoEditando = null;

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";

    function abrirUsuario() {
      const u = JSON.parse(localStorage.getItem("usuarioLogado"));
      window.location.href = `/usuario?email=${encodeURIComponent(u.email)}`;
    }

    const overlay = document.getElementById("overlayContainer");
    const formulario = document.getElementById("formChamado");
    const tituloForm = document.getElementById("tituloForm");

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

    // SAIR
    function sair() {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "/";
    }

    function formatarData(dataISO) {
      if (!dataISO) return "";
      return new Date(dataISO).toLocaleDateString("pt-BR");
    }

    // ========== ABRIR FORM ==========
    function abrirForm(chamado = null) {
      chamadoEditando = chamado;

      tituloForm.innerText = chamado ? "Editar Chamado" : "Novo Chamado";

      // Preencher se edição
      document.getElementById("descricao").value = chamado?.descricao || "";
      document.getElementById("modulo").value = chamado?.modulo || "";
      document.getElementById("motivo").value = chamado?.motivo || "";
      document.getElementById("observacoes").value = chamado?.obs || "";
      document.getElementById("prioridade").value = chamado?.prioridade || "";
      document.getElementById("setor").value = chamado?.setor || "";
      document.getElementById("usuario").value = chamado?.usuario || "";
      document.getElementById("dtconclusao").value = chamado?.dtconclusao || "";
      document.getElementById("status").value = chamado?.status || "Em aberto";

      overlay.classList.add("show");
    }

    function fecharForm() {
      overlay.classList.remove("show");
      chamadoEditando = null;
      formulario.reset();
    }

    // ========== SALVAR / ATUALIZAR ==========
    formulario.addEventListener("submit", async function (e) {
      e.preventDefault();

      const payload = {
        descricao: descricao.value,
        modulo: modulo.value,
        motivo: motivo.value,
        observacoes: observacoes.value,
        prioridade: prioridade.value,
        usuario: document.getElementById("usuario").value,
        setor: setor.value,
        status: document.getElementById("status").value,
      };

      let url = "/chamados";
      let metodo = "POST";

      if (chamadoEditando) {
        url = `/chamados/${chamadoEditando.id}`;
        metodo = "PUT";
      }

      const resp = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      showToast(data.mensagem, "success");

      fecharForm();
      filtrarChamados();
    });

    // ========== LISTAR ==========
    async function carregarChamados() {
      const resp = await fetch(`/chamados?usuario=${encodeURIComponent(usuarioLogado?.nome || '')}`);
      const data = await resp.json();

      if (resp.ok && data.sucesso) renderTabela(data.chamados);
      else areaTabela.innerHTML = "<p>Nenhum chamado encontrado.</p>";
    }

    function renderTabela(chamados) {
      areaTabela.innerHTML = `
        <table>
          <thead><tr>
            <th>Solicitante</th><th>Descrição</th><th>Módulo</th><th>Motivo</th>
            <th>Prioridade</th><th>Setor</th><th>Solicitação</th><th>Conclusão</th>
            <th>Status</th><th>Ações</th>
          </tr></thead>
          <tbody>
          ${chamados.map(c => `
            <tr>
              <td>${c.usuario}</td>
              <td>${c.descricao}</td>
              <td>${c.modulo}</td>
              <td>${c.motivo}</td>
              <td>${c.prioridade}</td>
              <td>${c.setor}</td>
              <td>${formatarData(c.dtregistro)}</td>
              <td>${formatarData(c.dtconclusao)}</td>
              <td>${c.status}</td>
              <td><button onclick='abrirForm(${JSON.stringify(c)})'><i class="fa-solid fa-pen"></i></button></td>
            </tr>
          `).join("")}
          </tbody>
        </table>
      `;
    }

    // ========== FILTRAR ==========
    async function filtrarChamados() {
      const params = new URLSearchParams({
        usuario: usuarioLogado?.nome || "",
        modulo: filtroModulo.value,
        prioridade: filtroPrioridade.value,
        status: filtroStatus.value,
        solicitante: filtroSolicitante.value,
        data_inicio: filtroDataInicio.value,
        data_fim: filtroDataFim.value
      });

      const resp = await fetch(`/chamados/filtros?${params}`);
      const data = await resp.json();

      if (resp.ok && data.sucesso) renderTabela(data.chamados);
      else showToast("Erro ao filtrar chamados.", "error");;
    }

    filtrarChamados();