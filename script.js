class ColheitaOvos {
  constructor() {
    this.colheitas = [];
    this.elementos = this.inicializarElementos();
    this.carregarDados();
    this.adicionarEventListeners();
    this.atualizarInterface();
  }

  inicializarElementos() {
    return {
      lista: document.getElementById("lista"),
      mediaSpan: document.getElementById("media"),
      totalSpan: document.getElementById("total"),
      addBtn: document.getElementById("addDia"),
      limparBtn: document.getElementById("limparTudo"),
      exportarBtn: document.getElementById("exportarDados"),
      input: document.getElementById("qtdOvos"),
    };
  }

  adicionarEventListeners() {
    // Adicionar novo dia
    this.elementos.addBtn.addEventListener("click", () => this.adicionarDia());

    // Enter no input para adicionar
    this.elementos.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.adicionarDia();
      }
    });

    // Limpar todos os dados
    this.elementos.limparBtn.addEventListener("click", () => this.limparTudo());

    // Exportar dados
    this.elementos.exportarBtn.addEventListener("click", () =>
      this.exportarDados()
    );
  }

  adicionarDia() {
    const qtd = parseFloat(this.elementos.input.value);

    if (isNaN(qtd) || qtd < 0) {
      this.mostrarFeedback("Digite um número válido de ovos!", "error");
      return;
    }

    this.colheitas.push({
      dia: this.colheitas.length + 1,
      quantidade: qtd,
      data: new Date().toLocaleDateString("pt-BR"),
    });

    this.elementos.input.value = "";
    this.salvarDados();
    this.atualizarInterface();
    this.mostrarFeedback("Dia adicionado com sucesso!", "success");
  }

  editarQuantidade(indice, novaQuantidade) {
    const valor = parseFloat(novaQuantidade);
    if (isNaN(valor) || valor < 0) {
      this.colheitas[indice].quantidade = 0;
    } else {
      this.colheitas[indice].quantidade = valor;
    }

    this.salvarDados();
    this.atualizarEstatisticas();
  }

  removerDia(indice) {
    if (confirm("Tem certeza que deseja remover este dia?")) {
      this.colheitas.splice(indice, 1);

      // Reajustar números dos dias
      this.colheitas.forEach((colheita, i) => {
        colheita.dia = i + 1;
      });

      this.salvarDados();
      this.atualizarInterface();
      this.mostrarFeedback("Dia removido com sucesso!", "success");
    }
  }

  limparTudo() {
    if (
      confirm(
        "Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita."
      )
    ) {
      this.colheitas = [];
      this.salvarDados();
      this.atualizarInterface();
      this.mostrarFeedback("Todos os dados foram limpos!", "success");
    }
  }

  calcularMedia() {
    if (this.colheitas.length === 0) return 0;
    const soma = this.colheitas.reduce((a, b) => a + b.quantidade, 0);
    return (soma / this.colheitas.length).toFixed(2);
  }

  calcularTotal() {
    return this.colheitas.reduce((a, b) => a + b.quantidade, 0);
  }

  atualizarEstatisticas() {
    this.elementos.mediaSpan.textContent = this.calcularMedia();
    this.elementos.totalSpan.textContent = this.calcularTotal();
  }

  atualizarTabela() {
    this.elementos.lista.innerHTML = "";

    if (this.colheitas.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.innerHTML = `
        <div class="empty-state">
          <h3>🥚 Nenhuma colheita registrada</h3>
          <p>Adicione seu primeiro dia de colheita!</p>
        </div>
      `;
      tr.appendChild(td);
      this.elementos.lista.appendChild(tr);
      return;
    }

    this.colheitas.forEach((colheita, i) => {
      const tr = document.createElement("tr");

      // Dia
      const tdDia = document.createElement("td");
      tdDia.textContent = `Dia ${colheita.dia}`;

      // Data
      const tdData = document.createElement("td");
      tdData.textContent = colheita.data;
      tdData.style.fontSize = "0.8rem";
      tdData.style.color = "#666";

      // Quantidade editável
      const tdQtd = document.createElement("td");
      tdQtd.contentEditable = "true";
      tdQtd.textContent = colheita.quantidade;
      tdQtd.addEventListener("blur", () => {
        this.editarQuantidade(i, tdQtd.textContent);
      });
      tdQtd.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          tdQtd.blur();
        }
      });

      // Ações
      const tdAcoes = document.createElement("td");
      const btnRemover = document.createElement("button");
      btnRemover.textContent = "❌";
      btnRemover.style.background = "none";
      btnRemover.style.border = "none";
      btnRemover.style.cursor = "pointer";
      btnRemover.style.fontSize = "1rem";
      btnRemover.title = "Remover dia";
      btnRemover.addEventListener("click", () => this.removerDia(i));

      tdAcoes.appendChild(btnRemover);

      tr.appendChild(tdDia);
      tr.appendChild(tdData);
      tr.appendChild(tdQtd);
      tr.appendChild(tdAcoes);
      this.elementos.lista.appendChild(tr);
    });
  }

  atualizarInterface() {
    this.atualizarEstatisticas();
    this.atualizarTabela();
  }

  // Gerenciamento de dados com cookies
  salvarDados() {
    try {
      const dados = JSON.stringify(this.colheitas);
      // Salvar com data de expiração de 1 ano
      const dataExpiracao = new Date();
      dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);

      document.cookie = `colheitaOvos=${encodeURIComponent(
        dados
      )}; expires=${dataExpiracao.toUTCString()}; path=/`;
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      this.mostrarFeedback("Erro ao salvar dados!", "error");
    }
  }

  carregarDados() {
    try {
      const cookies = document.cookie.split(";");
      const colheitaCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("colheitaOvos=")
      );

      if (colheitaCookie) {
        const dados = decodeURIComponent(colheitaCookie.split("=")[1]);
        this.colheitas = JSON.parse(dados) || [];
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      this.colheitas = [];
    }
  }

  exportarDados() {
    if (this.colheitas.length === 0) {
      this.mostrarFeedback("Não há dados para exportar!", "error");
      return;
    }

    try {
      // Criar conteúdo para exportação
      let conteudo = "RELATÓRIO DE COLHEITA DE OVOS\n";
      conteudo += "================================\n\n";
      conteudo += `Total de dias registrados: ${this.colheitas.length}\n`;
      conteudo += `Total de ovos coletados: ${this.calcularTotal()}\n`;
      conteudo += `Média diária: ${this.calcularMedia()} ovos\n\n`;
      conteudo += "DETALHES POR DIA:\n";
      conteudo += "-----------------\n";

      this.colheitas.forEach((colheita) => {
        conteudo += `Dia ${colheita.dia} (${colheita.data}): ${colheita.quantidade} ovos\n`;
      });

      // Criar e baixar arquivo
      const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `colheita-ovos-${new Date()
        .toLocaleDateString("pt-BR")
        .replace(/\//g, "-")}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.mostrarFeedback("Dados exportados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      this.mostrarFeedback("Erro ao exportar dados!", "error");
    }
  }

  mostrarFeedback(mensagem, tipo) {
    // Criar elemento de feedback
    const feedback = document.createElement("div");
    feedback.textContent = mensagem;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;

    if (tipo === "success") {
      feedback.style.background = "#4caf50";
    } else if (tipo === "error") {
      feedback.style.background = "#f44336";
    }

    document.body.appendChild(feedback);

    // Remover após 3 segundos
    setTimeout(() => {
      feedback.style.animation = "slideOut 0.3s ease-in forwards";
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 3000);
  }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  new ColheitaOvos();
});

// Adicionar animação de slideOut para feedback
const style = document.createElement("style");
style.textContent = `
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);
