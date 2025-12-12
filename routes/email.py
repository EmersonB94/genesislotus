import smtplib # Comandos dos e-mails
from email.mime.text import MIMEText # Comandos dos e-mails;
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error  # opcional, para tratamento de erros;
import random, string
from datetime import datetime, date
from flask import Blueprint, request, jsonify

email_bp = Blueprint("email", __name__)

@email_bp.route("/enviar_email", methods=["GET"])
def enviar_email():
    remetente = "coord.ti@genesisgenteegestao.com"
    senha = "yivx shwv hcow ahpv"

    msg = MIMEText("Mensagem de teste de conexão")
    msg["Subject"] = "Teste de conexão"
    msg["From"] = remetente
    msg["To"] = remetente

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(remetente, senha)
        smtp.send_message(msg)

    print("Email enviado!")

@email_bp.route("/enviar_email_brevo", methods=["GET"])
def enviar_email_brevo():
    try:
        remetente = "gestaodadosindicadores@gmail.com"
        destinatario = "coord.ti@genesisgenteegestao.com"

        # 🔵 DADOS DO BREVO
        smtp_host = "smtp-relay.brevo.com"
        smtp_port = 587
        smtp_login = "9cef56001@smtp-brevo.com"
        smtp_password = "45xa6pXAUcSOtyZr"

        # 🔵 Corpo do e-mail
        msg = MIMEText("Mensagem de teste de conexão via Brevo")
        msg["Subject"] = "Teste de conexão - Brevo"
        msg["From"] = remetente
        msg["To"] = destinatario

        # 🔵 Conectar ao servidor SMTP Brevo
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as smtp:
            smtp.starttls()
            smtp.login(smtp_login, smtp_password)
            smtp.send_message(msg)

        print("📧 Email enviado com sucesso (Brevo)!")
        return jsonify({"sucesso": True, "mensagem": "Email enviado com sucesso brevo!"})

    except Exception as e:
        print("❌ ERRO AO ENVIAR EMAIL:", e)
        return jsonify({"sucesso": False, "erro": str(e)})
    
def enviar_email_nova_senha(email_destino, nome, nova_senha):
    remetente = "coord.ti@genesisgenteegestao.com"
    senha = "yivx shwv hcow ahpv"

    corpo = f"""
        Olá {nome},

        Uma nova senha foi gerada para sua conta no sistema Genesis Lotus.

        Nome: {nome}
        E-mail: {email_destino}
        Nova Senha: {nova_senha}

        Recomendamos que você altere essa senha após realizar o login.

        Caso não tenha solicitado essa alteração, entre em contato com o administrador imediatamente.

        Atenciosamente,
        Equipe Genesis Lotus
        """

    msg = MIMEText(corpo)
    msg["Subject"] = "Genesis Lotus -> Recuperação de Senha"
    msg["From"] = remetente
    msg["To"] = email_destino  # agora envia para o e-mail correto

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(remetente, senha)
        smtp.send_message(msg)

    print("📧 Email de nova senha enviado para:", email_destino)


def enviar_email_atualizacao(email_destino, nome, status, unidade):
    remetente = "coord.ti@genesisgenteegestao.com"
    senha = "yivx shwv hcow ahpv"

    corpo = f"""
        Olá {nome},

        Seus dados foram atualizados com sucesso no sistema Genesis Lotus.

        Nome: {nome};
        E-mail: {email_destino}
        Unidade(s): {unidade}
        Status: {status}

        Caso não tenha solicitado essa alteração, entre em contato com o administrador imediatamente.

        Atenciosamente,
        Equipe Genesis Lotus
        """
    
    msg = MIMEText(corpo)
    msg["Subject"] = "Genesis Lotus -> Atualização de Usuário"
    msg["From"] = remetente
    msg["To"] = "gestaodadosindicadores@gmail.com" #= email_destino

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(remetente, senha)
        smtp.send_message(msg)

    print("📧 Email de atualização de usuário enviado para:", email_destino)