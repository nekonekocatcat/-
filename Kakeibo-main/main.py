from flask import Flask, request, render_template, jsonify
from datetime import datetime
from modules import expenditure_data_manager

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('input.html')

@app.route('/input', methods=["POST"])
def expenses_add():
    # 追加するデータの取得
    amount = request.form.get('amount')
    category = request.form.get('category')
    date = request.form.get('date')
    print(f"POST - amount:{amount} category:{category} date:{date}")

    # データの追加
    expenditure_data_manager.add_data(amount, category, date)

    return render_template('input.html')

@app.route('/graph')
def graph():
    return render_template('graph.html')

@app.route('/graph/data', methods=['GET', 'POST'])
def get_data():
    received_data = request.data.decode('utf-8')

    if received_data == '[object Event]':
        date = datetime.now().strftime('%Y-%m-%d')
    else:
        date = received_data

    data =  expenditure_data_manager.get_graph_data(date)
    if not data:
        data = {}
    #print(data)
    return jsonify(data)

@app.route('/calendar')
def calendar():
    return render_template('calendar.html')

# カレンダーのデータを取得するAPI
@app.route('/calendar/data', methods=['GET'])
def get_calendar_data():
    # パラメータの取得
    date = request.args.get('date')
    type = request.args.get('type')
    # リクエストパラメータのNoneチェック
    if date is None:
        jsonify({'error': 'リクエストパラメータが不正です。'})
    # データの取得
    if type == 'days_amount': # 月間の支出データ（日ごとの支出合計）を取得
        result_data = expenditure_data_manager.get_days_amount_data(date)
    elif type == 'day_detail':
        result_data = expenditure_data_manager.get_day_detail_data(date)
    elif type == 'day_category_amount':
        result_data = expenditure_data_manager.get_day_category_amount(date)
    else:
        result_data = {}
    if not result_data:
        result_data = {}
    print(result_data)
    return jsonify(result_data)

if __name__ == '__main__':
    # Windowsだとdefaultの5000番ポートが使えないので、8888番ポートに変更
    app.run(port=8888, debug=True)