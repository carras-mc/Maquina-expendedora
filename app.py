from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import oracledb
oracledb.init_oracle_client(lib_dir=r"C:\oracle\instantclient")


app = Flask(__name__)
CORS(app)

DB_USER = "VENDING_MACHINE"
DB_PASS = "trebujena"
DB_DSN = "localhost/XEXDB"


def get_connection():
    oracledb.init_oracle_client(lib_dir=r"C:\oracle\instantclient")
    return oracledb.connect(
        user=DB_USER,
        password=DB_PASS,
        dsn=DB_DSN
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/T_PRODUCTO")
def get_productos():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ID_PRODUCTO, D_DESCRIPCION, I_PRECIO
        FROM T_PRODUCTO
        ORDER BY ID_PRODUCTO
    """)

    cols = [c[0].lower() for c in cursor.description]

    productos = [dict(zip(cols, fila)) for fila in cursor.fetchall()]

    conn.close()

    return jsonify(productos)


@app.route("/api/comprar", methods=["POST"])
def comprar():
    datos = request.get_json()
    producto_id = datos["id"]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT n_cantidad FROM t_stockmaq WHERE prod_id_producto = :id",
        {"id": producto_id}
    )
    fila = cursor.fetchone()

    if producto_id > 6 or producto_id <= 0:
        conn.close()
        return jsonify({"error": "No existe"}), 400

    elif not fila or fila[0] <= 0:
        conn.close()
        return jsonify({"error": "Sin stock"}), 400

    cursor.execute(
        "UPDATE t_stockmaq "
        "SET n_cantidad = n_cantidad - 1 WHERE prod_id_producto = :id",
        {"id": producto_id}
    )

    conn.commit()
    conn.close()

    return jsonify()


@app.route("/api/reponer", methods=["POST"])
def reponer():
    datos = request.get_json()
    producto_id = datos["id"]
    cantidad = datos["cantidad"]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT n_cantidad FROM t_stockmaq WHERE prod_id_producto = :id",
        {"id": producto_id}
    )

    if producto_id > 6 or producto_id <= 0:
        conn.close()
        return jsonify({"error": "No existe"}), 400

    cursor.execute(
        "UPDATE t_stockmaq "
        "SET n_cantidad = n_cantidad + :cantidad WHERE prod_id_producto = :id",
        {"id": producto_id, "cantidad": cantidad}
    )

    conn.commit()
    conn.close()

    return jsonify()


if __name__ == "__main__":
    app.run(debug=True)
