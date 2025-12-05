const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";

    // === Função auxiliar de formatação de data ===
    function formatarData(dataISO) {
      if (!dataISO) return "";
      const data = new Date(dataISO);
      const dia = String(data.getDate()).padStart(2, "0");
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } 

    const areaTabela = document.getElementById("areaTabela");
    const overlayContainer = document.getElementById("overlayContainer");

    function sair(){
      localStorage.removeItem("usuarioLogado");
      window.location.href="/";
    }

    /* === Abrir Modal === */
    function abrirForm(){
      overlayContainer.innerHTML = `
        <div class="overlay" onclick="clicarForaModal(event)">
          <div class="modal">
            <button class="close-btn" onclick="fecharForm()">×</button>
            <h3>Novo Chamado</h3>

            <form onsubmit="salvarChamado(event)">
              <textarea id="descricao" placeholder="Descrição do chamado" required rows="3"></textarea>

              <select id="modulo" required>
                <option value="">Selecione o módulo</option>
                <option value="RH">RH</option>
                <option value="Administrador">Administrador</option>
                <option value="SST">SST</option>
                <option value="DP">DP</option>
              </select>

              <input type="text" id="motivo" placeholder="Motivo" required>

              <textarea id="observacoes" placeholder="Observações adicionais" rows="3"></textarea>

              <select id="prioridade" required>
                <option value="">Selecione a prioridade</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>

              <input type="text" id="setor" placeholder="Setor" required>

              <!-- Usuário logado vem automático -->
              <input type="text" id="usuario" value="${usuarioLogado?.nome || ''}" readonly>

              <!-- Status fixo: Em aberto -->
              <input type="text" id="status" value="Em aberto" readonly>

              <button type="submit" class="btn"><i class="fa-solid fa-floppy-disk"></i> Salvar Chamado</button>
              <button type="button" class="btn" onclick="fecharForm()">Cancelar</button>
            </form>
          </div>
        </div>
      `;
    }

    function clicarForaModal(event){
      if (event.target.classList.contains("overlay")) fecharForm();
    }

    function fecharForm(){
      overlayContainer.innerHTML = "";
    }

    /* === Salvar Chamado === */
    async function salvarChamado(event){
      event.preventDefault();

      const payload = {
        descricao: document.getElementById("descricao").value.trim(),
        modulo: document.getElementById("modulo").value,
        motivo: document.getElementById("motivo").value.trim(),
        observacoes: document.getElementById("observacoes").value.trim(),
        prioridade: document.getElementById("prioridade").value,
        setor: document.getElementById("setor").value.trim(),
        usuario: usuarioLogado?.nome || "Desconhecido",
        status: "Em aberto"
      };

      try {
        const resp = await fetch("/chamados", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload)
        });

        const data = await resp.json();
        showToast(data.mensagem || "Chamado registrado com sucesso!", "success");
        fecharForm();
        carregarChamados();
      } catch (e) {
        console.error(e);
        showToast("Erro ao salvar o chamado.", "error");
      }
    }

    /* === Listar chamados do usuário logado === */
    async function carregarChamados(){
      try {
        const resp = await fetch(`/chamados?usuario=${encodeURIComponent(usuarioLogado?.nome || '')}`);
        const data = await resp.json();

        if (resp.ok && data.sucesso) renderTabela(data.chamados);
        else areaTabela.innerHTML = "<p>Nenhum chamado encontrado.</p>";
      } catch (e){
        console.error(e);
        areaTabela.innerHTML = "<p style='color:red;'>Erro ao carregar chamados.</p>";
      }
    }

    function renderTabela(chamados){
      areaTabela.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Módulo</th>
              <th>Motivo</th>
              <th>Prioridade</th>
              <th>Setor</th>
              <th>Solicitação</th>
              <th>Conclusão</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${chamados.map(c => `
              <tr>
                <td>${c.descricao}</td>
                <td>${c.modulo}</td>
                <td>${c.motivo}</td>
                <td>${c.prioridade}</td>
                <td>${c.setor}</td>
                <td>${formatarData(c.dtregistro)}</td>
                <td>${formatarData(c.dtconclusao)}</td>
                <td>${c.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    carregarChamados();