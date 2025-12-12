import mysql.connector

def conectar():
    return mysql.connector.connect(
        host="sql10.freesqldatabase.com",
        database="sql10805265",
        user="sql10805265",
        password="SXqt5m8ZIq",
        port=3306
    )
