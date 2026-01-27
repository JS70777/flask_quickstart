from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('homepage.html')

@app.route('/idle')
def idle():
    return render_template('frc_idle.html')

@app.route('/assignment')
def assignment():
    return render_template('assign.html')

if __name__ == '__main__':
    app.run(debug=True)
