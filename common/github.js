// --------------------------------------------
// GitHub API：将错题写入 wrong.json
// --------------------------------------------

// ⚠️ 你必须替换下面这三项：
// 1. GitHub 用户名
// 2. 仓库名
// 3. 你的安全 Token（下一步教你生成）

const GITHUB_USERNAME = "你的GitHub用户名";
const REPO_NAME = "你的仓库名";
const TOKEN = "你的GitHub Token";  // 之后替换


// 写入错题
async function saveWrongQuestion(question) {
    const COURSE = window.location.pathname.split("/")[2];
    const FILE_PATH = `courses/${COURSE}/wrong.json`;

    // 1. 先获取文件内容（需要 sha）
    const getRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: {
            "Authorization": `token ${TOKEN}`
        }
    });

    if (!getRes.ok) {
        console.error("❌ 无法读取 wrong.json");
        return;
    }

    const fileData = await getRes.json();
    const currentContent = JSON.parse(atob(fileData.content));  // 原有错题
    currentContent.push(question);  // 添加新错题

    // 2. 把更新后的 JSON 转为 base64
    const updatedBase64 = btoa(JSON.stringify(currentContent, null, 2));

    // 3. 上传更新
    const updateRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: "PUT",
        headers: {
            "Authorization": `token ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: `Add wrong question to ${COURSE}`,
            content: updatedBase64,
            sha: fileData.sha
        })
    });

    if (updateRes.ok) {
        console.log("✔ 错题已成功写入 GitHub");
    } else {
        console.error("❌ 错题写入失败");
    }
}
