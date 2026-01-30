/* ================== DOWNLOAD JSON ================== */
function downloadJSON() {
    const tasks = [];
    const taskItems = document.querySelectorAll("#todo-list li");

    taskItems.forEach(li => {
        const text = li.querySelector(".task-text")?.textContent || "";
        const statusSelect = li.querySelector(".status-select");
        const status = statusSelect?.value || "todo";

        tasks.push({
            task: text,
            status: status === "done" ? "Đã hoàn thành" : "Chưa hoàn thành"
        });
    });

    if (tasks.length === 0) {
        alert("Không có công việc nào để tải!");
        return;
    }

    const blob = new Blob(
        [JSON.stringify(tasks, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todo_list.json";
    a.click();
    URL.revokeObjectURL(url);
}

/* ================== LOAD FROM SERVER ================== */
function loadFromServer() {
    fetch("/api/tasks")
        .then(res => res.json())
        .then(tasks => {
            const list = document.getElementById("todo-list");
            list.innerHTML = "";

            tasks.forEach(item => {
                createTask(
                    item.task,
                    item.status === "Đã hoàn thành"
                );
            });
        })
        .catch(err => {
            console.error("Load error:", err);
            alert("Không thể tải dữ liệu từ server");
        });
}

/* ================== ADD TASK (POST API) ================== */
function addTask() {
    const input = document.getElementById("todo-input");
    const text = input.value.trim();

    if (!text) {
        alert("Vui lòng nhập công việc!");
        return;
    }

    fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            task: text,
            status: "Chưa hoàn thành"
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("POST failed");
        input.value = "";
        loadFromServer(); // ✅ đồng bộ DB
    })
    .catch(err => {
        console.error(err);
        alert("Không thể thêm công việc");
    });
}

/* ================== CREATE TASK UI ================== */
function createTask(text, done) {
    const li = document.createElement("li");

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = text;
    if (done) taskText.classList.add("checked");

    const select = document.createElement("select");
    select.className = "status-select";
    select.innerHTML = `
        <option value="todo">Chưa hoàn thành</option>
        <option value="done">Đã hoàn thành</option>
    `;
    select.value = done ? "done" : "todo";

    select.onchange = () => {
        taskText.classList.toggle("checked", select.value === "done");

        // ⚠️ (nâng cao) nếu muốn update DB thì gọi PUT ở đây
    };

    const del = document.createElement("button");
    del.textContent = "Xóa";
    del.className = "delete-btn";
    del.onclick = () => {
        // ⚠️ (nâng cao) muốn xóa DB thì gọi DELETE API
        li.remove();
    };

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.append(select, del);

    li.append(taskText, actions);
    document.getElementById("todo-list").appendChild(li);
}

/* ================== ENTER TO ADD ================== */
document.getElementById("todo-input").addEventListener("keydown", e => {
    if (e.key === "Enter") addTask();
});

/* ================== DARK MODE ================== */
const themeBtn = document.getElementById("theme-toggle");

themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
};

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

/* ================== INIT ================== */
window.onload = loadFromServer;
