document.addEventListener('DOMContentLoaded', fetchData);

var globalDate = getCurrentDate();

/**
 * 指定された日付の支出データをサーバーから取得し、取得したデータを元に円グラフを更新します。
 * データが存在しない場合、ユーザーにアラートを表示します。
 * 
 * @param {string} [date=getCurrentDate()] - データを取得する日付。デフォルトは現在の日付。
 */
function fetchData(date = getCurrentDate()) {
    fetch('/graph/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        },
        body: date,
    })
        .then(response => response.json())
        .then(data => {
            console.log('データ受信:', data);

            if (data && Object.keys(data).length > 0) {
                updatePieChart(data);
            } else {
                console.log('データが空です。');
                alert('この月は、まだデータが登録されていません。');
                updatePieChart(data);
                updateCategoryTable(data);
            }
        });
}

/**
 * 円グラフを更新する関数
 * 
 * @param {Object} data - 各カテゴリーの支出総額を含むオブジェクト
 */
function updatePieChart(data) {
    // 期待されるラベルの順番
    const expectedLabels = ["食費", "外食費", "日用品", "交通費", "衣服", "交際費", "趣味", "その他"];

    // ラベルと値を格納するための配列
    const labels = [];
    const values = [];

    // 期待されるラベルの順番でデータを取得
    expectedLabels.forEach(label => {
        const value = data[label] || 0;
        if (value !== 0) {
            labels.push(label);
            values.push(value);
        }
    });

    // 円グラフのラベルと値を更新
    myPieChart.data.labels = labels;
    myPieChart.data.datasets[0].data = values;

    // 円グラフを再描画
    myPieChart.update();
    updateCategoryTable(data);
}

/**
 * 円グラフを作成するためのコンテキストと初期データ
 */
var ctx = document.getElementById("myPieChart");
var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ["食費", "外食費", "日用品", "交通費", "衣服", "交際費", "趣味", "その他"],
        datasets: [{
            backgroundColor: [
                "#ff8585",
                "#FFA500",
                "#FFFF00",
                "#00ff00",
                "#00FFFF",
                "#9898ed",
                "#ec73ec",
                "#959595"
            ],
            data: [0, 0, 0, 0, 0, 0, 0, 0]
        }]
    },
    options: {
        title: {
            display: false,
            text: ''
        }
    }
});

/**
 * 日付を 'YYYY-MM-DD' 形式にフォーマットする関数
 * 
 * @param {Date} date - フォーマットする日付
 * @returns {string} フォーマットされた日付
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * 現在の日付を 'YYYY-MM-DD' 形式で取得する関数
 * 
 * @returns {string} フォーマットされた現在の日付
 */
function getCurrentDate() {
    const now = new Date();
    return formatDate(now);
}

/**
 * "前へ"ボタンが押されたときの処理を行います。
 * 現在の日付を一ヶ月戻し、その日付をグローバルな日付に設定します。
 * その後、グラフのタイトルを更新し、新しい日付のデータを取得します。
 * 
 * @function handlePrevButtonClick
 * @global
 */
function handlePrevButtonClick() {
    // globalDate を一月前に設定
    const previousMonth = new Date(globalDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    // 一月前の日付を取得
    const previousMonthDate = formatDate(previousMonth);
    globalDate = previousMonthDate;
    console.log('前へボタンが押されました', previousMonthDate);

    updateGraphTitle(previousMonthDate);

    // fetchData で一月前のデータを取得
    fetchData(previousMonthDate);
}

/**
 * "次へ"ボタンが押されたときの処理を行います。
 * 現在の日付を一ヶ月進め、その日付が現在の実日付を超えていない場合、
 * グローバルな日付を更新し、グラフのタイトルを更新し、新しい日付のデータを取得します。
 * 
 * @function handleNextButtonClick
 * @global
 */
function handleNextButtonClick() {

    const nextMonth = new Date(globalDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthDate = formatDate(nextMonth);

    if (nextMonthDate > getCurrentDate()) {
        console.log('次へボタンが押されましたが、これ以上進めません。');
        return; // 進めない場合は処理を中断
    }
    globalDate = nextMonthDate;
    console.log('次へボタンが押されました', nextMonthDate);

    updateGraphTitle(nextMonthDate);

    // fetchData で一月後のデータを取得
    fetchData(nextMonthDate);
}

/**
 * 指定された日付の支出データをサーバーから取得し、取得したデータを元にピーチャートを更新します。
 * データが存在しない場合、ユーザーにアラートを表示します。
 * 
 * @param {string} [date=getCurrentDate()] - データを取得する日付。デフォルトは現在の日付。
 */
function updateGraphTitle(date) {
    const formattedDate = formatMonth(new Date(date));
    document.getElementById("graphTitle").textContent = `${formattedDate}の支出`;
}

/**
 * 日付を 'YYYY年MM月' 形式にフォーマットする関数
 * 
 * @param {Date} date - フォーマットする日付
 * @returns {string} フォーマットされた日付
 */
function formatMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月は0から始まるため、+1 する
    return `${year}年${month}月`;
}

/**
 * 指定されたデータを使用してカテゴリーテーブルを更新します。
 * この関数では、月ごとの総合計も計算し、テーブルに表示します。
 *
 * @param {Object} data - カテゴリーとその金額をマッピングしたオブジェクト。
 * キーはカテゴリー名（"食費"、"外食費"、"日用品"、"交通費"、"衣服"、"交際費"、"趣味"、"その他"）で、
 * 値はそのカテゴリーの金額です。
 */
function updateCategoryTable(data) {
    const tableBody = document.getElementById("categoryTableBody");

    // カテゴリの順序を定義
    const categoryOrder = ["食費", "外食費", "日用品", "交通費", "衣服", "交際費", "趣味", "その他"];

    // テーブル内の既存のデータをクリア
    tableBody.innerHTML = "";

    // 月ごとの総合計を計算
    const totalAmount = Object.values(data).reduce((total, amount) => total + amount, 0);
    // 総合計を表示する行を作成して挿入
    const row = document.createElement("tr");

    const categoryNameCell = document.createElement("td");
    categoryNameCell.textContent = "合計";

    const totalAmountCell = document.createElement("td");
    totalAmountCell.textContent = totalAmount + "円";

    row.appendChild(categoryNameCell);
    row.appendChild(totalAmountCell);

    tableBody.appendChild(row);

    // カテゴリの順序に従ってテーブル行を作成して挿入
    categoryOrder.forEach(category => {
        const amount = data[category] || 0;

        // 金額が0でない場合のみ行を追加
        if (amount !== 0) {
            const row = document.createElement("tr");

            const categoryNameCell = document.createElement("td");
            const circle = document.createElement("span");
            circle.classList.add("circle", `circle-${category}`); // カテゴリに対応する色の丸を追加
            categoryNameCell.appendChild(circle);

            const categoryText = document.createTextNode(` ${category}`);
            categoryNameCell.appendChild(categoryText);

            const totalAmountCell = document.createElement("td");
            totalAmountCell.textContent = `${amount}円`;

            row.appendChild(categoryNameCell);
            row.appendChild(totalAmountCell);

            tableBody.appendChild(row);
        }
    });
}
