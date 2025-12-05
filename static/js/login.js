
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

    async function login(){
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value.trim();
      if(!email || !senha){
        alert("Preencha e-mail e senha!");
        
        return;
      }

      //const resp = await fetch("http://localhost:5000/login", {
      
      const resp = await fetch(`/login`, {

      //const resp = await fetch("/genesislotus/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });


      const data = await resp.json();

      if(data.sucesso){
        localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
        window.location.href = "/inicio";
      } else {
        alert(data.mensagem)
      } 


    }

    // === Esqueci minha senha ===
    function abrirEsqueciSenha(){
      const overlay = document.getElementById("overlayContainer");
      overlay.innerHTML = `
        <div class="overlay">
          <div class="popup">
            <h3>Recuperar senha</h3>
            <p>Informe seu e-mail cadastrado:</p>
            <input type="email" id="emailRecuperacao" placeholder="Seu e-mail">
            <button onclick="enviarRecuperacao()">Enviar</button>
            <button style="background:#ccc; color:#000; margin-top:8px;" onclick="fecharModal()">Fechar</button>
          </div>
        </div>
      `;
    }

    function fecharModal(){
      document.getElementById("overlayContainer").innerHTML = "";
    }

    async function enviarRecuperacao(){
      const email = document.getElementById("emailRecuperacao").value.trim();
      if(!email){
        showToast("Informe seu e-mail.", "error");
        return;
      }

      
      const resp = await fetch(`/esqueci_senha`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email })
      });

      const data = await resp.json();
      alert(data.mensagem);
      fecharModal();
    }