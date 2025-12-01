// ============================================
// quiz.js — 题库核心引擎（支持 Block 模式）
// ============================================

// 全局变量
let currentQuestions = [];
let currentIndex = 0;

// 自动识别课程名，例如 ILGG / WO / BP
const COURSE = window.location.pathname.split("/")[2];

// ============================================
//   加载不同题库类型
// ============================================
async function loadQuestionSet(type) {
    let urls = [];

    // --- 按 Block 加载 ---
    if (type.startsWith("block")) {
        let blockNumber = type.replace("block", "");
        urls = [`../../courses/${COURSE}/block${blockNumber}.json`];
    }

    // --- 加载所有原题 ---
    else if (type === "original") {
        urls = [`../../courses/${COURSE}/original.json`];
    }

    // --- 加载错题 + AI 扩展题 ---
    else if (type === "wrong+ai") {
        urls = [
            `../../courses/${COURSE}/wrong.json`,
            `../../courses/${COURSE}/ai.json`
        ];
    }

    // --- 模拟考试：从原题随机抽取 ---
    else if (type === "mock") {
        urls = [`../../courses/${COURSE}/original.json`];
    }

    // 实际加载
    let questions = [];

    for (let url of urls) {
        const res = await fetch(url);
        const data = await res.json();
        questions = questions.concat(data);
    }

    // 模拟考试随机抽取（20题）
    if (type === "mock") {
        questions = shuffle(questions).slice(0, 20);
    }

    if (questions.length === 0) {
        document.getElementById("quiz-area").innerHTML =
            "<h3>暂无题目，请先添加题库。</h3>";
        return;
    }

    currentQuestions = questions;
    currentIndex = 0;
    showQuestion();
}

// ============================================
//   随机洗牌
// ============================================
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// ============================================
//   显示题目
// ============================================
function showQuestion() {
    const q = currentQuestions[currentIndex];
    const area = document.getElementById("quiz-area");

    let html = `
        <h2>第 ${currentIndex + 1} 题</h2>
        <p>${q.question}</p>
    `;

    q.options.forEach(opt => {
        html += `
            <div class="option" onclick="selectOption('${opt}', '${q.answer}', ${currentIndex})">
                ${opt}
            </div>
        `;
    });

    area.innerHTML = html;
}

// ============================================
//   选择答案（判题 + 显示解析）
// ============================================
function selectOption(selected, correct, index) {
    const q = currentQuestions[index];
    const area = document.getElementById("quiz-area");

    let result = "";

    if (selected === correct) {
        result = `<p style="color:green;font-weight:bold;">✔ 回答正确！</p>`;
    } else {
        result = `<p style="color:red;font-weight:bold;">✘ 回答错误！</p>`;
        // 写入错题
        saveWrongQuestion(q);
    }

    area.innerHTML = `
        <h2>解析</h2>
        ${result}
        <p><strong>正确答案：</strong> ${correct}</p>
        <p><strong>解析：</strong> ${q.explanation}</p>

        <button onclick="nextQuestion()" style="
            padding:10px 20px;
            margin-top:15px;
            border:none;
            background:#007aff;
            color:#fff;
            border-radius:8px;
            cursor:pointer;">
            下一题
        </button>
    `;
}

// ============================================
//   下一题
// ============================================
function nextQuestion() {
    currentIndex++;

    if (currentIndex >= currentQuestions.length) {
        document.getElementById("quiz-area").innerHTML =
            "<h2>🎉 已完成所有题目！</h2>";
    } else {
        showQuestion();
    }
}
