import streamlit as st
import pandas as pd
import datetime
# import mysql.connector (MySQL não esta sendo utilizado)
import psycopg2
from fpdf import FPDF
import plotly.express as px
import io
from streamlit_option_menu import option_menu

# Função para criar a conexão com o banco de dados (SUPABASE)
def get_db_connection():
    conn = psycopg2.connect(
        host='db.ywxvnonihvqfenuhdifr.supabase.co',
        port=5432,
        dbname='postgres',  # Supabase normalmente usa 'postgres' como nome padrão do banco
        user='postgres',  # ou o usuário do Supabase
        password='@dados@'
    )
    return conn

# Função para inserir dados no banco de dados de indicadores
def insert_data_regindicador(indicador, mes, ano, resultado, analise, acao, prazo, status, evidencias):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """INSERT INTO rgindicador (indicador, mes, ano, resultado, analise, acao, prazo, status, evidencias)
         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""

    data = (indicador, mes, ano, resultado, analise, acao, prazo, status, evidencias)

    cursor.execute(sql, data)
    conn.commit()
    cursor.close()
    conn.close()

# Função para inserir dados no banco de dados de ficha técnica de indicadores
def insert_data_cadindicador(nomeindicador, objetivo, formula, fonte, periodicidade, meta, setor, unidademedida, tipo, status, referencia):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """INSERT INTO cadindicador (nomeindicador, objetivo, formula, fonte, periodicidade, meta, setor, unidademedida, tipo, status, referencia)
         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

    data = (nomeindicador, objetivo, formula, fonte, periodicidade, meta, setor, unidademedida, tipo, status, referencia)

    cursor.execute(sql, data)
    conn.commit()
    cursor.close()
    conn.close()

# Função para verificar o login no banco de dados
def check_login(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Consulta SQL para verificar o usuário e a senha no banco de dados
    cursor.execute("SELECT * FROM usuario WHERE email = %s AND senha = %s", (username, password))
    user = cursor.fetchone()  # Retorna a primeira linha que corresponder aos critérios

    cursor.close()
    conn.close()

    if user:
        st.session_state['logged_in'] = True
        st.session_state['username'] = username  # Armazenando o nome do usuário
        return True  # Usuário e senha corretos
    else:
        return False  # Usuário ou senha incorretos

# Função para gerar o PDF
def generate_pdf(novo_dado):
    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", size=12, style='B')
    pdf.cell(200, 10, "Indicador: " + novo_dado["Indicador"], ln=True)
    pdf.cell(200, 10, f"Mês: {novo_dado['Mês']} | Ano: {novo_dado['Ano']}", ln=True)

    pdf.set_font("Arial", size=10)
    pdf.ln(10)

    if novo_dado["Resultado"] is not None:
        # pdf.multi_cell(0, 10, f"Resultado: {novo_dado['resultado']}%") # Gpt
        pdf.multi_cell(0, 10, f"Resultado: {novo_dado.get('resultado', 'N/A')}%")
    if novo_dado["Análise Crítica"] is not None:
        pdf.multi_cell(0, 10, f"Análise Crítica: {novo_dado.get('analise', 'N/A')}%")
    if novo_dado["Ação Corretiva"] is not None:
        pdf.multi_cell(0, 10, f"Ação Corretiva: {novo_dado['acao']}")
    if novo_dado["Prazo"] is not None:
        pdf.multi_cell(0, 10, f"Prazo: {novo_dado['Prazo'].strftime('%d/%m/%Y')}")
    if novo_dado["Status"] is not None:
        pdf.multi_cell(0, 10, f"Status: {novo_dado['Status']}")
    if novo_dado["Evidências"] is not None:
        pdf.multi_cell(0, 10, f"Evidências: {novo_dado['Evidências']}")

    pdf_output = io.BytesIO()
    pdf_output.write(pdf.output(dest='S').encode('latin1'))
    pdf_output.seek(0)

    return pdf_output

# Função para buscar dados do banco de indicadores registrados
def fetch_data_rgindicador():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rgindicador")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

# Função para buscar dados do banco de indicadores registrados
def fetch_data_cadindicador():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cadindicador")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

# Função para buscar dados do banco de usuario
def fetch_data_usuario():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuario")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

# Tela de login
if 'logged_in' not in st.session_state or not st.session_state['logged_in']:
    
    col1, col2 = st.columns(2)

    with col1:

        # Caminho da imagem local
        imagem_logo = "C:/Users/LENOVO/Desktop/Projetos Python/imagem/logo_genesislotus_semfundo.png"

        st.image(imagem_logo, use_container_width=True)  # Aqui mostramos a imagem na coluna esquerda

    with col2:

        st.title("Conecte-se")

        with st.form(key="login_form"):
            username = st.text_input("Usuário")
            password = st.text_input("Senha", type="password")
            submit_button = st.form_submit_button(label="Entrar")
            submit_button_senha = st.form_submit_button(label="Esqueci minha senha")

            if submit_button:
                if check_login(username, password):
                    st.session_state['logged_in'] = True
                    st.success("Login realizado com sucesso!")
                    st.session_state['login_success'] = True  # Adiciona um flag para indicar login bem-sucedido
                    st.rerun()  # Isso recarrega a página
                else:
                    st.error("Usuário ou senha inválidos.")
else:
    # Após o login, agora vamos mostrar o conteúdo do sistema.
    # menu = st.sidebar.radio("Navegação", ["Inicial", "Indicadores", "Sobre"])

    # Menu lateral com título
    with st.sidebar:
        # Caminho da imagem local
        imagem_logo = "C:/Users/LENOVO/Desktop/Projetos Python/imagem/logo_genesislotus_semfundo.png"
        st.image(imagem_logo, width=100)  # Define tanto a largura quanto a altura
        ## st.markdown("<h2 style='color: white;'>🌟 Genesis Lotus</h2>", unsafe_allow_html=True)

    # Menu lateral com opções
        menu = option_menu(
        menu_title="Menu",
        options = [
                "Inicio",
                "Indicadores",
                "Recursos Humanos",
                "Departamento Pessoal",
                "SESMT",
                "Relatórios",
                "Formulários",
                "Cadastro",
                "Sobre"
            ],

            icons = [
                "house",                 # Início
                "bar-chart-line",        # Indicadores
                "people-fill",           # Recursos Humanos
                "briefcase-fill",        # Departamento Pessoal
                "shield-plus",           # SESMT (segurança do trabalho)
                "file-earmark-bar-graph",# Relatórios
                "ui-checks-grid",        # Formulários
                "person-plus",           # Cadastro
                "info-circle"            # Sobre
            ],
        menu_icon="cast",
        default_index=0,
        styles={
            "container": {"padding": "5px", "background-color": "#0D187D"},
            "icon": {"color": "white", "font-size": "16px"},
            "nav-link": {"color": "white", "font-size": "14px", "text-align": "left", "margin": "0px"},
            "nav-link-selected": {"background-color": "#0E3E98"},
        }
    )
        
        st.markdown(f"<h5 style='color: white;'>Usuario: {st.session_state['username']}</h5>", unsafe_allow_html=True)
       

    if menu == "Indicadores":

            st.subheader("Indicadores")

            # Ajuste do submenu fora da coluna
            submenuindicadores = option_menu(
                menu_title=None,
                options=["Registrar", "Listar dados", "Cadastrar ficha técnica", "Fichas técnicas"],
                icons=["plus-square", "list-task", "file-earmark-text"],
                orientation="horizontal",
                styles={
                    "container": {"padding": "0!important", "background-color": "#0E3E98"},
                    "icon": {"color": "white", "font-size": "18px"},
                    "nav-link": {"color": "white", "font-size": "14px", "text-align": "center", "margin": "0px"},
                    "nav-link-selected": {"background-color": "#0D187D"},
                }
            )

            if submenuindicadores == "Registrar":
                with st.form(key="form_novo_indicador"):
                    indicador = st.selectbox("Indicador", ["Absenteísmo", "Turnover", "Eficiência Orçamentária"], key="form_indicador")

                    meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
                    mes = st.selectbox("Mês", meses, key="form_mes")
                    anos = ["2024", "2025"]
                    ano = st.selectbox("Ano", anos, key="form_ano")

                    resultado = st.number_input("resultado (%)", step=0.01, format="%.2f", key="form_resultado")
                    analise = st.text_area("Análise Crítica", key="form_analise")
                    acao = st.text_area("Ação Corretiva", key="form_acao")

                    evidencias = st.file_uploader("Anexar evidências (PDF, Docx ou Xlsx)", type=["pdf", "docx", "xlsx"], key="form_evidencias")
                    prazo = st.date_input("Prazo para ação de correção", min_value=datetime.date.today(), format="DD/MM/YYYY", key="form_prazo")
                    status = st.selectbox("Status da ação", ["Aberta", "Em andamento", "Concluída"], key="form_status")

                    submitted = st.form_submit_button("Salvar dados")

                    if submitted:
                        if mes and ano and analise and acao:
                            novo_dado = {
                                "Indicador": indicador,
                                "Mês": mes,
                                "Ano": ano,
                                "Resultado": resultado,
                                "Análise Crítica": analise,
                                "Ação Corretiva": acao,
                                "Prazo": prazo,
                                "Status": status,
                                "Evidências": evidencias.name if evidencias else None,
                            }

                            insert_data_regindicador(novo_dado["Indicador"], novo_dado["Mês"], novo_dado["Ano"], novo_dado["Resultado"], novo_dado["Análise Crítica"], novo_dado["Ação Corretiva"], novo_dado["Prazo"], novo_dado["Status"], novo_dado["Evidências"])

                            st.success("Indicador adicionado com sucesso!")

                            # Gerar PDF
                            pdf_output = generate_pdf(novo_dado) # Gpt

                            # Resetando formulários
                            for key in list(st.session_state.keys()):
                                if key.startswith("form_"):
                                    del st.session_state[key]

                            st.query_params.clear()

                            if pdf_output:
                                st.subheader("Baixar PDF gerado")
                                st.download_button(label="Baixar PDF", data=pdf_output, file_name="indicador.pdf", mime="application/pdf")

            if submenuindicadores == "Listar dados":

                    st.subheader("Registros:")

                    tipo = st.selectbox(
                        "Selecione o indicador", 
                        ["Todos os indicadores"] + ["Absenteísmo", "Turnover", "Eficiência Orçamentária"]
                    )

                    dados = fetch_data_rgindicador()
                    st.write(dados[0])  # Isso mostra uma tupla da primeira linha
                    df = pd.DataFrame(dados, columns=[
                        "id", "created_at", "indicador", "mes", "ano", "resultado", 
                        "analise", "acao", "prazo", "status", "evidencias", "usuario"
                    ])

                    # Filtro por tipo
                    df_filtered = df[df["Indicador"] == tipo] if tipo != "Todos os indicadores" else df

                    # Selecionar apenas as colunas desejadas
                    colunas_desejadas = ["indicador", "mes", "ano", "resultado", "prazo", "status"]
                    df_mostrar = df_filtered[colunas_desejadas]

                    # Exibir a tabela filtrada
                    st.dataframe(df_mostrar)

            if submenuindicadores == "Cadastrar ficha técnica":

                with st.form(key="form_ficha_Indicador"):

                    nome = st.text_input("Nome do indicador", key="form_nomeindicador")
                    objetivo = st.text_area("Objetivo", key="form_objetivo")
                    formula = st.text_input("Formula", key="form_formula")
                    fonte = st.text_input("Fonte de dados", key="form_fonte")
                    periodicidade = st.selectbox("Periodicidade", ["Mensal", "Trimestral", "Semestral", "Anual"], key="form_periodicidade")
                    meta = st.text_input("Meta", key="form_meta")
                    setor = st.text_input("Setor", key="form_setor")
                    unidademedida = st.selectbox("Unidade de medida", ["Porcentagem", "Numeral", "Horas", "Financeiro", "Outros"], key="form_unidademedida")
                    tipo = st.selectbox("Tipo", ["Estratégico", "Tático", "Operacional"], key="form_tipo")
                    status = st.selectbox("Status", ["Ativo", "Inativo"], key="form_status")
                    referencia = st.file_uploader("Referências (PDF, Docx)", type=["pdf", "docx"], key="form_referencia")

                    submitted = st.form_submit_button("Salvar ficha técnica")

                    if submitted:
                        if nome and formula and status and setor:
                            novo_dado = {
                                "Nome": nome,
                                "Objetivo": objetivo,
                                "Formula": formula,
                                "Fonte": fonte,
                                "Periodicidade": periodicidade,
                                "Meta": meta,
                                "Setor": setor,
                                "Unidade de medida": unidademedida,
                                "Tipo": tipo,
                                "Status": status,
                                "Referencia": referencia.name if referencia else None,
                            }

                            insert_data_cadindicador(novo_dado["Nome"], novo_dado["Objetivo"], novo_dado["Formula"], novo_dado["Fonte"], novo_dado["Periodicidade"], novo_dado["Meta"], novo_dado["Setor"], novo_dado["Unidade de medida"], novo_dado["Tipo"], novo_dado["Status"], novo_dado["Referencia"])

                            st.success("Ficha técnica cadastrada")

                            # Resetando formulários
                            for key in list(st.session_state.keys()):
                                if key.startswith("form_"):
                                    del st.session_state[key]

                            st.query_params.clear()

            if submenuindicadores == "Fichas técnicas":

                st.subheader("Fichas Técnicas de indicador:")

                tipo = st.selectbox(
                        "Setor", 
                        ["Todos os setores"] + ["Recursos Humanos", "Departamento Pessoal", "SESMT"]
                    )

                dados = fetch_data_cadindicador()
                st.write(dados[0])  # Isso mostra uma tupla da primeira linha
                df = pd.DataFrame(dados, columns=[
                        "id", "created_at", "nomeindicador", "objetivo", "formula", "fonte", 
                        "periodicidade", "meta", "setor", "unidademedida", "tipo", "status", "referencia"
                    ])

                    # Filtro por tipo
                df_filtered = df[df["Setor"] == tipo] if tipo != "Todos os setores" else df

                    # Selecionar apenas as colunas desejadas
                colunas_desejadas = ["status", "nomeindicador", "meta", "formula", "periodicidade", "tipo"]
                df_mostrar = df_filtered[colunas_desejadas]

                    # Exibir a tabela filtrada
                st.dataframe(df_mostrar)

    if menu == "Recursos Humanos":
        
            st.subheader("Recursos Humanos")

            # Ajuste do submenu fora da coluna
            submenuindicadores = option_menu(
                menu_title=None,
                options = [
                    "Avaliação experiência",
                    "Entrevista de desligamento",
                    "Requisição de pessoal",
                    "Ações e Treinamentos",
                    "Editais"
                ],

                icons = [
                    "bar-chart-line",       # Avaliação experiência
                    "person-x",             # Entrevista de desligamento
                    "file-earmark-plus",    # Requisição de pessoal
                    "people",               # Ações e Treinamentos
                    "file-earmark-text"     # Editais
                ],

                orientation="horizontal",
                styles={
                    "container": {"padding": "0!important", "background-color": "#0E3E98"},
                    "icon": {"color": "white", "font-size": "18px"},
                    "nav-link": {"color": "white", "font-size": "14px", "text-align": "center", "margin": "0px"},
                    "nav-link-selected": {"background-color": "#0D187D"},
                }
            )

    if menu == "Departamento Pessoal":

        st.subheader("Recursos Humanos")

            # Ajuste do submenu fora da coluna
        submenuindicadores = option_menu(
                menu_title=None,
                options = [
                    "Eficiência Orçamentária",
                    "Atestado",
                    "Faltas",
                    "Advertência / Suspensão"
                ],

            icons = [
                    "bar-chart-line",       # Avaliação experiência
                    "person-x",             # Entrevista de desligamento
                    "file-earmark-plus",    # Requisição de pessoal
                    "people",               # Ações e Treinamentos
                    "file-earmark-text"     # Editais
                ],

            orientation="horizontal",
            styles={
                    "container": {"padding": "0!important", "background-color": "#0E3E98"},
                    "icon": {"color": "white", "font-size": "18px"},
                    "nav-link": {"color": "white", "font-size": "14px", "text-align": "center", "margin": "0px"},
                    "nav-link-selected": {"background-color": "#0D187D"},
                }
            )

    if menu == "SESMT":

        st.subheader("Recursos Humanos")

            # Ajuste do submenu fora da coluna
        submenuindicadores = option_menu(
                menu_title=None,
                options = [
                    "Acidentes",
                    "SIPAT",
                    "Ações e Treinamentos"
                ],

                icons = [
                    "bar-chart-line",       # Avaliação experiência
                    "person-x",             # Entrevista de desligamento
                    "file-earmark-plus",    # Requisição de pessoal
                    "people",               # Ações e Treinamentos
                    "file-earmark-text"     # Editais
                ],

                orientation="horizontal",
                styles={
                    "container": {"padding": "0!important", "background-color": "#0E3E98"},
                    "icon": {"color": "white", "font-size": "18px"},
                    "nav-link": {"color": "white", "font-size": "14px", "text-align": "center", "margin": "0px"},
                    "nav-link-selected": {"background-color": "#0D187D"},
                }
            )

    elif menu == "Inicio":
        ## st.title("Painel de Indicadores")
        st.markdown("""
        ### Visão Geral dos Indicadores

        Acesse aqui os gráficos e detalhes dos indicadores de desempenho da empresa.
        Analise os dados de **Absenteísmo**, **Turnover** e **Eficiência Orçamentária** 
        para monitorar o progresso e as melhorias contínuas.

        Use o módulo **Indicadores** para ver detalhes como análise, ações de correção e prazos.
        """)

        # Caminho para a imagem local
        imagem_local = "C:/Users/LENOVO/Desktop/Projetos Python/Imagem/Fundo_1.jpg"  # Altere conforme o local da sua imagem

        # Adicionando uma imagem de fundo para destacar a página
        st.markdown("""
            <style>
                .reportview-container {
                    background-image: url('file:///{imagem_local}');
                    background-size: cover;
                    background-position: center center;
                    background-repeat: no-repeat;
                    height: 100vh;
                    width: 100%;
                }
            </style>
        """, unsafe_allow_html=True)

        # Buscar dados
        dados = fetch_data_rgindicador()

            # Transformar em DataFrame
        df = pd.DataFrame(dados, columns=[
                "id", "created_at", "indicador", "mes", "ano", "resultado", "status",
                "analise", "acao", "prazo",
                "evidencias", "usuario"
            ])

            # Criar coluna 'competência'
        df['competência'] = df['mes'].astype(str) + '/' + df['ano'].astype(str)

            # Listar os indicadores únicos
        indicadores = df['indicador'].unique()

            # Criando o layout com 3 colunas
        col1, col2, col3 = st.columns(3)

            # Criar um contador para atribuir os gráficos às colunas
        columns = [col1, col2, col3]
        counter = 0

            # Para cada indicador, atribua-o a uma coluna diferente
        for indicador in indicadores:
                # Atribui a coluna para o gráfico com base no contador
                with columns[counter]:
                    df_indicador = df[df['indicador'] == indicador]

                    # Criar gráfico de barras
                    fig = px.bar(
                        df_indicador,
                        x='competência',
                        y='resultado',
                        text_auto=True,
                        title=f'{indicador}',
                        labels={'resultado': 'resultado (%)', 'competência': 'Competência'}
                    )

                    # Personalizar layout do gráfico
                    fig.update_layout(
                        plot_bgcolor='rgba(0,0,0,0)',
                        paper_bgcolor='rgba(0,0,0,0)',
                        xaxis_title='Competência',
                        yaxis_title='resultado (%)',
                        title_x=0.5
                    )

                    # Exibir gráfico
                    st.plotly_chart(fig, use_container_width=True)

                # Atualiza o contador para garantir que o próximo gráfico será colocado na próxima coluna
                counter = (counter + 1) % 3  # Isso faz o contador "circular" entre 0, 1 e 2

    if menu == "Cadastro":

        st.subheader("Cadastro e permissões de usuário")

        col1, col2 = st.columns(2)

        with col1:

            st.subheader("Cadastrar")

        with col2:

            st.subheader("Cadastros")

            dados = fetch_data_usuario()
            st.write(dados[0])  # Isso mostra uma tupla da primeira linha
            df = pd.DataFrame(dados, columns=[
                        "id", "nome", "email", "setor", "contato", "senha", 
                        "nivelusuario", "dtcadastro", "dtatualizacao", "dtacesso"
                    ])

                    # Selecionar apenas as colunas desejadas
            colunas_desejadas = ["status", "nome", "email", "setor", "contato", "dtacesso"]
            df_mostrar = colunas_desejadas

                    # Exibir a tabela filtrada
            st.dataframe(df_mostrar)

    else:
        st.info(f"Você está na página: {menu}")
