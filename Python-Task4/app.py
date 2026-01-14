from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

user_score = 0
computer_score = 0
draws = 0

VALID_CHOICES = ('rock', 'paper', 'scissors')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/play', methods=['POST'])
def play():
    global user_score, computer_score, draws

    data = request.get_json()
    if not data or 'choice' not in data:
        return jsonify({'error': 'Missing choice'}), 400

    user_choice = str(data['choice']).lower()
    if user_choice not in VALID_CHOICES:
        return jsonify({'error': 'Invalid choice'}), 400

    computer_choice = random.choice(VALID_CHOICES)

    if user_choice == computer_choice:
        result = 'draw'
        draws += 1
    else:
        wins_against = {'rock': 'scissors', 'scissors': 'paper', 'paper': 'rock'}
        if wins_against[user_choice] == computer_choice:
            result = 'win'
            user_score += 1
        else:
            result = 'lose'
            computer_score += 1

    return jsonify({
        'user_choice': user_choice,
        'computer_choice': computer_choice,
        'result': result,
        'user_score': user_score,
        'computer_score': computer_score,
        'draws': draws
    })


@app.route('/reset', methods=['POST'])
def reset():
    global user_score, computer_score, draws
    user_score = 0
    computer_score = 0
    draws = 0
    return jsonify({
        'user_score': user_score,
        'computer_score': computer_score,
        'draws': draws
    })


if __name__ == '__main__':
    app.run(debug=True)
