
function sair() {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
}

const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
document.getElementById("usuarioLogado").innerText = usuarioLogado?.nome || "";
document.getElementById("usuarioLogadoCargo").innerText = usuarioLogado?.cargo || "";

document.addEventListener("DOMContentLoaded", () => {
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const indicadores = JSON.parse(localStorage.getItem('indicadores') || '[]');
  const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
  const acoesTreinamentos = JSON.parse(localStorage.getItem('acoesTreinamentos') || '[]');
  const requisicoes = JSON.parse(localStorage.getItem('requisicoesPessoal') || '[]');
  const avaliacoes = JSON.parse(localStorage.getItem('avaliacoes') || '[]');

  // Totais
  document.getElementById('totalUsuarios').textContent = usuarios.length;
  document.getElementById('totalIndicadores').textContent = indicadores.length;
  document.getElementById('totalClientes').textContent = empresas.filter(e => e.status === "Ativo").length;
  document.getElementById('totalAcoesTreinamentos').textContent = acoesTreinamentos.length;
  document.getElementById('totalRequisicoes').textContent = requisicoes.length;
  document.getElementById('totalAvaliacoes').textContent = avaliacoes.length;

  
  });
;