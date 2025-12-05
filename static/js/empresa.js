    const areaTabela = document.getElementById("areaTabela");
    const overlay = document.getElementById("overlay");
    const formPopup = document.getElementById("formEmpresa");
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

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

    function abrirUsuario() {
      const u = JSON.parse(localStorage.getItem("usuarioLogado"));
      window.location.href = `/usuario?email=${encodeURIComponent(u.email)}`;
    }

    document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";

    /* === FUNÇÃO ABRIR FORM (ajustada para usar modal) === */
    function abrirForm(empresa = null) {
      document.getElementById("empresaForm").reset();
      document.getElementById("empresaId").value = empresa ? empresa.id : "";
      document.getElementById("tituloForm").innerText = empresa ? "Editar Empresa" : "Nova Empresa";

      if (empresa) {
        document.getElementById("nome_fantasia").value = empresa.nome_fantasia;
        document.getElementById("cnpj").value = empresa.cnpj;
        document.getElementById("endereco").value = empresa.endereco;
        document.getElementById("telefone").value = empresa.telefone;
        document.getElementById("responsavel").value = empresa.responsavel;
      }

      // Mostra o overlay e modal
      overlay.style.display = "flex"; // agora o overlay é um flex container
    }

    /* === FUNÇÃO FECHAR FORM (ajustada) === */
    function fecharForm() {
      overlay.style.display = "none";
    }

    // Fecha o modal ao clicar fora da área dele
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fecharForm();
    });

    /* === CARREGAR EMPRESAS === */
    async function carregarEmpresas() {
      const resp = await fetch("/empresas");
      const data = await resp.json();

      if (data.sucesso) renderTabela(data.empresas);
      else showToast("Erro ao carregar empresas: " + data.mensagem, "error");
    }

    /* === SALVAR EMPRESA === */
    async function salvarEmpresa(event) {
      event.preventDefault();
      const id = document.getElementById("empresaId").value;
      const empresa = {
        nome_fantasia: document.getElementById("nome_fantasia").value,
        cnpj: document.getElementById("cnpj").value,
        endereco: document.getElementById("endereco").value,
        telefone: document.getElementById("telefone").value,
        responsavel: document.getElementById("responsavel").value,
        usuario: usuarioLogado?.nome || "admin"
      };

      const metodo = id ? "PUT" : "POST";
      const url = id ? `/empresa/${id}` : "/empresa";

      const resp = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresa)
      });

      const data = await resp.json();
      showToast(data.mensagem, "success");
      if (data.sucesso) {
        fecharForm();
        carregarEmpresas();
      }
    }

    /* === RENDERIZAR TABELA === */
    function renderTabela(empresas) {
      areaTabela.innerHTML = `
        <table border="1" cellpadding="6" cellspacing="0">
          <thead>
            <tr>
              <th>Nome Fantasia</th>
              <th>CNPJ</th>
              <th>Endereço</th>
              <th>Telefone</th>
              <th>Responsável</th>
              <th>Cadastro / Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${empresas.map(e => `
              <tr>
                <td>${e.nome_fantasia}</td>
                <td>${e.cnpj}</td>
                <td>${e.endereco}</td>
                <td>${e.telefone}</td>
                <td>${e.responsavel}</td>
                <td>${e.data_hora_cadastro ? new Date(e.data_hora_cadastro).toLocaleString() : ''}</td>
                <td>
                  <button class="btn-edit" onclick='abrirForm(${JSON.stringify(e)})'>Editar</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    /* === SAIR === */
    function sair() {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "/";
    }

    carregarEmpresas();