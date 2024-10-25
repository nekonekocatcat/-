var today = new Date();
var currentDay = today.getDate();
var currentMonth = today.getMonth();
var currentYear = today.getFullYear();
var selectYear = document.getElementById("year");
var selectMonth = document.getElementById("month");
// 生成する年の範囲設定とその反映
var createYear = generate_year_range(2000, 2030);
document.getElementById("year").innerHTML = createYear;
// カテゴリー設定
category_list = ['食費', '外食費', '日用品', '交通費', '衣服', '交際費', '趣味', 'その他']

var calendar = document.getElementById("calendar");
var lang = calendar.getAttribute('data-lang');

var months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
var days = ["日", "月", "火", "水", "木", "金", "土"];

var dayHeader = "<tr>";
for (day in days) {
  dayHeader += "<th data-days='" + days[day] + "'>" + days[day] + "</th>";
}
dayHeader += "</tr>";

document.getElementById("thead-month").innerHTML = dayHeader;

monthAndYear = document.getElementById("monthAndYear");
// 生成
showCalendar(currentMonth, currentYear);
showDetail(currentDay, currentMonth, currentYear);

function generate_year_range(start, end) {
  var years = "";
  for (var year = start; year <= end; year++) {
    years += "<option value='" + year + "'>" + year + "</option>";
  }
  return years;
}

function next() {
  currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
  currentMonth = (currentMonth + 1) % 12;
  showCalendar(currentMonth, currentYear);
}

function previous() {
  currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
  currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
  showCalendar(currentMonth, currentYear);
}

function jump() {
  currentYear = parseInt(selectYear.value);
  currentMonth = parseInt(selectMonth.value);
  showCalendar(currentMonth, currentYear);
}

async function showCalendar(month, year) {
  console.log("showCalendar:" + year + "/" + (month+1));
  // その月の収支データを取得
  date_str = year + "-" + String(month+1).padStart(2, '0') + "-01";
  const params = {type: "days_amount", date : date_str};
  const query = new URLSearchParams(params);
  const response = await fetch (`./calendar/data?${query}`);
  const jsonData = await response.json();
  var firstDay = (new Date(year, month)).getDay();
  tbl = document.getElementById("calendar-body");
  tbl.innerHTML = "";

  monthAndYear.innerHTML = year + "年" + months[month]; // 月と年を逆に表示
  selectYear.value = year;
  selectMonth.value = month;

  var date = 1;
  for (var i = 0; i < 6; i++) {
    var row = document.createElement("tr");

    for (var j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        cell = document.createElement("td");
        cellText = document.createTextNode("");
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else if (date > daysInMonth(month, year)) {
        break;
      } else {
        cell = document.createElement("td");
        cell.setAttribute("data-date", date);
        cell.setAttribute("data-month", month + 1);
        cell.setAttribute("data-year", year);
        cell.setAttribute("data-month_name", months[month]);
        cell.className = "date-picker";
        // 各日付のデータを表示
        if(Object.keys(jsonData).length === 0 || jsonData[date] === 0)
        {
          // 月別データがない場合
          iTEXT = "　";
        }
        else
        {
          // 日別データがある場合
          iTEXT = jsonData[date] + "円";
        }
        cell.innerHTML = "<button type='button' id='date-cell-button'>" + date + "<div>" +  iTEXT + "</div></button>";

        if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
          cell.className = "date-picker selected";
        }
        row.appendChild(cell);
        date++;
      }
    }

    tbl.appendChild(row);
  }
  // イベントリスナーの追加
  const buttons = document.querySelectorAll('#date-cell-button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const date = parseInt(button.parentElement.getAttribute("data-date"));
      const month = parseInt(button.parentElement.getAttribute("data-month"))
      const year = parseInt(button.parentElement.getAttribute("data-year"));
      // クリックされた日付のデータを表示
      console.log("Selected:" + year + "/" + month + "/" + date + "");
      // 選択状態の更新
      updateSelectedDate(date);
      // 日別データの表示
      showDetail(date, month-1, year);
    });
  });
}

function daysInMonth(iMonth, iYear) {
  return 32 - new Date(iYear, iMonth, 32).getDate();
}

function updateSelectedDate(iDay) {
  // Selected クラス属性がついた要素を取得
  var selected = document.getElementsByClassName("selected");
  if(selected.length !== 0) // Selected クラス属性がついた要素がある場合
  {
    // Selected クラス属性を削除
    selected[0].classList.remove("selected");
  }
  // data-date属性がiDayの要素を取得
  var nowSelected = document.querySelector("[data-date='" + iDay + "']");
  // Selected クラス属性を追加
  nowSelected.classList.add("selected");
}

async function showDetail(date, month, year) {
  console.log("showDetail:" + year + "/" + (month+1) + "/" + date);
  // 指定日の収支データを取得
  date_str = year + "-" + String(month+1).padStart(2, '0') + "-" + String(date).padStart(2, '0');
  console.log(date_str);
  const params = {type: "day_category_amount", date : date_str};
  const query = new URLSearchParams(params);
  const response = await fetch (`./calendar/data?${query}`);
  const jsonData = await response.json();
  console.log(jsonData);
  // タイトル更新
  var detailTitle = document.getElementById("detailTableTitle");
  detailTitle.innerHTML = year + "年" + (month+1) + "月" + date + "日の支出詳細データ";
  // テーブル更新
  var detailBody = document.getElementById("detail-body");
  detailBody.innerHTML = "";
  // 日別データの表示
  for(var i = 0; i < category_list.length; i++)
  {
    // カテゴリーの金額が0円の場合は表示しない
    if(typeof jsonData[category_list[i]] === "undefined")
    {
      continue;
    }
    var row = document.createElement("tr");
    // カテゴリー
    cell = document.createElement("td");
    cellText = document.createTextNode(category_list[i]);
    cell.appendChild(cellText);
    row.appendChild(cell);
    // 金額
    cell = document.createElement("td");
    cellText = document.createTextNode(jsonData[category_list[i]] + "円");
    cell.appendChild(cellText);
    row.appendChild(cell);
    // 削除ボタン
    //cell = document.createElement("td");
    //cell.innerHTML = "<button type='button' id='delete-button'>削除</button>";
    //row.appendChild(cell);
    detailBody.appendChild(row);
  }
  // イベントリスナーの追加
  const buttons = document.querySelectorAll('#delete-button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const date = button.parentElement.parentElement.children[0].innerText;
      const category = button.parentElement.parentElement.children[1].innerText;
      const amount = button.parentElement.parentElement.children[2].innerText;
      // クリックされた日付のデータを表示
      console.log("Delete:" + date + " " + category + " " + amount);
    });
  });
}