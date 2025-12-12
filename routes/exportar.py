import mysql.connector
import pandas as pd

def exportar_tabelas(tabelas, arquivo_saida):
    # Conexão com o banco
    conexao = mysql.connector.connect(
        host="sql10.freesqldatabase.com",
        database="sql10805265",
        user="sql10805265",
        password="SXqt5m8ZIq",
        port=3306
    )

    # Criar writer para gerar o Excel
    with pd.ExcelWriter(arquivo_saida, engine="openpyxl") as writer:
        for tabela in tabelas:
            df = pd.read_sql(f"SELECT * FROM {tabela}", conexao)
            df.to_excel(writer, sheet_name=tabela, index=False)

    conexao.close()
    print(f"Arquivo '{arquivo_saida}' exportado com sucesso!")


# EXEMPLO DE USO
tabelas = [
    "rg_processo_seletivo", "rg_requisicao_pessoal", "rg_mov",
    "cad_empresa", "rg_acoes_treinamentos", "rg_avaliacao_experiencia",
    "rg_acidentes", "rg_asos"
]

# Caminho ajustado
arquivo_saida = r"C:\Users\LENOVO\Desktop\basegenesislotusbi.xlsx"

exportar_tabelas(tabelas, arquivo_saida)
