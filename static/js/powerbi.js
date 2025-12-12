async function gerarRelatorio() {
    
    const resposta = await fetch("/gerar_powerbi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const json = await resposta.json();

    // Atualiza iframe
    document.getElementById("iframePowerBI").src = json.url;
}

const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";
document.getElementById("usuarioLogadoCargo").innerText = usuarioLogado?.cargo || "";