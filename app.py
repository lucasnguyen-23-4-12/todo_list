from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)
DB_NAME = "todo.db"


# ====== DB HELPER ======
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# ====== INIT DB ======
def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


# ====== ROUTES ======
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks")
    rows = cursor.fetchall()
    conn.close()

    tasks = []
    for row in rows:
        tasks.append({
            "id": row["id"],
            "task": row["task"],
            "status": row["status"]
        })

    return jsonify(tasks)


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json()

    task = data.get("task")
    status = data.get("status", "Chưa hoàn thành")

    if not task:
        return jsonify({"error": "Task is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (task, status) VALUES (?, ?)",
        (task, status)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Task saved"}), 201


# ====== MAIN ======
if __name__ == "__main__":
    init_db()
    app.run(debug=True)
