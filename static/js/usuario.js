const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";

    function abrirUsuario() {
      const u = JSON.parse(localStorage.getItem("usuarioLogado"));
      window.location.href = `/usuario?email=${encodeURIComponent(u.email)}`;
    }
    
    const areaTabela = document.getElementById("areaTabela");
    const overlayContainer = document.getElementById("overlayContainer");

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


    // === Função auxiliar de formatação de data ===
    function formatarData(dataISO) {
      if (!dataISO) return "";
      const data = new Date(dataISO);
      const dia = String(data.getDate()).padStart(2, "0");
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } 

    function sair(){
      localStorage.removeItem("usuarioLogado");
      window.location.href="/";
    }

    async function carregarUsuarios(){
      try {
        const resp = await fetch("/usuarios");
        const data = await resp.json();
        if(!resp.ok) throw new Error(data.mensagem || "Erro ao buscar usuários.");
        renderTabela(data.usuarios);
      } catch(e){
        console.error(e);
        areaTabela.innerHTML = "<p style='color:red;'>Erro ao carregar usuários.</p>";
      }
    }

    let idEditando = null;

    function abrirForm(usuario = null){
      idEditando = usuario ? usuario.id : null;

      document.getElementById("overlayContainer").style.display = "flex";
      document.getElementById("tituloForm").innerText = usuario ? "Editar Usuário" : "Novo Usuário";

      document.getElementById("nomeUsuario").value = usuario ? usuario.nome : "";
      document.getElementById("emailUsuario").value = usuario ? usuario.email : "";
      document.getElementById("contatoUsuario").value = usuario ? usuario.contato : "";
      document.getElementById("senhaUsuario").value = usuario ? usuario.senha : "";
      document.getElementById("setorUsuario").value = usuario ? usuario.setor : "";
      document.getElementById("cargoUsuario").value = usuario ? usuario.cargo : "";
      document.getElementById("nivelUsuario").value = usuario ? usuario.nivel_usuario : "Leitor";
      document.getElementById("statusUsuario").value = usuario ? usuario.status : "Ativo";
      
      document.getElementById("modRH").checked = usuario && usuario.modrh === "S";
      document.getElementById("modDP").checked = usuario && usuario.moddp === "S";
      document.getElementById("modSST").checked = usuario && usuario.modsst === "S";
      document.getElementById("modAdm").checked = usuario && usuario.modadm === "S";

      carregarEmpresas(usuario);
    }


    /* === Fecha o modal ao clicar fora === */
    function clicarForaModal(event){
      if(event.target.id === "overlayContainer"){
        fecharForm();
      }
    }


    /* === Fecha modal === */
    function fecharForm(){
      document.getElementById("overlayContainer").style.display = "none";
    }


    /* === Salvar Usuário === */
    async function salvarUsuario(event){

      const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

      event.preventDefault();
      const idEditar = idEditando;
      const payload = {
        nome: document.getElementById("nomeUsuario").value.trim(),
        email: document.getElementById("emailUsuario").value.trim(),
        contato: document.getElementById("contatoUsuario").value.trim(),
        senha: document.getElementById("senhaUsuario").value.trim(),
        setor: document.getElementById("setorUsuario").value.trim(),
        cargo: document.getElementById("cargoUsuario").value.trim(),
        empresa: Array.from(document.getElementById("empresa").selectedOptions).map(opt => opt.value).join(";"),
        nivel_usuario: document.getElementById("nivelUsuario").value,
        status: document.getElementById("statusUsuario").value,
        modrh: document.getElementById("modRH").checked ? "S" : "N",
        moddp: document.getElementById("modDP").checked ? "S" : "N",
        modsst: document.getElementById("modSST").checked ? "S" : "N",
        modadm: document.getElementById("modAdm").checked ? "S" : "N", 

        usuario: usuarioLogado ? usuarioLogado.nome : null
      };

      try {
        let resp;
        if(idEditar){
          resp = await fetch(`/usuario/${idEditar}`, {
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(payload)
          });
        } else {
          resp = await fetch("/cadastrar", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(payload)
          });
        }

        const data = await resp.json();
        if(resp.ok && data.sucesso){
          showToast(data.mensagem, "success");
          fecharForm();
          carregarUsuarios();
        } else {
          showToast(data.mensagem || "Erro ao salvar usuário.", "error");
        }
      } catch(e){
        console.error(e);
        showToast("Erro de conexão com o servidor.", "error");
      }
    }

    /* === Renderizar tabela === */
    function renderTabela(usuarios){
      areaTabela.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Contato</th>
              <th>Setor</th>
              <th>Nível</th>
              <th>Empresa</th>
              <th>Acesso</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${usuarios.map(u=>`
              <tr>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.contato || ''}</td>
                <td>${u.setor || ''}</td>
                <td>${u.nivel_usuario || ''}</td>
                <td>${u.empresa || ''}</td>
                <td>${formatarData(u.dtacesso)}</td>
                <td class="${u.status==="Inativo"?"inactive":""}">${u.status || ''}</td>
                <td>
                  <button class="btn" onclick='abrirForm(${JSON.stringify(u)})'>
                    <i class="fa-solid fa-pen-to-square"></i> Editar
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    carregarUsuarios();

    /* === Carregar empresas === */
    async function carregarEmpresas(usuario=null) {
      try {
        const response = await fetch('/empresas');
        const data = await response.json();

        if (data.empresas && Array.isArray(data.empresas)) {
          const select = document.getElementById('empresa');
          select.innerHTML = '<option value="">Selecione a empresa...</option>';
          data.empresas.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.nome_fantasia;
            option.textContent = emp.nome_fantasia;
            select.appendChild(option);
          });

          if (usuario && usuario.empresa) {
            const empresasUsuario = usuario.empresa.split(";").map(e => e.trim());
            for (let opt of select.options) {
              if (empresasUsuario.includes(opt.value)) opt.selected = true;
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        showToast("Erro ao carregar empresas", "error");
      }
    }