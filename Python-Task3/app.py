from flask import Flask, render_template, request, jsonify
import string
import random

app = Flask(__name__)


@app.route('/')
def index():
    """Serve the main index page"""
    return render_template('index.html')


@app.route('/generate', methods=['POST'])
def generate_password():
    """Generate a password based on user requirements"""
    try:
        data = request.get_json()

        # Extract parameters
        length = data.get('length', 12)
        use_upper = data.get('upper', False)
        use_lower = data.get('lower', False)
        use_digits = data.get('digits', False)
        use_symbols = data.get('symbols', False)

        # Validate length
        if not isinstance(length, int) or length < 1:
            length = 12

        # Check if at least one character type is selected
        if not any([use_upper, use_lower, use_digits, use_symbols]):
            return jsonify({
                'error': 'At least one character type must be selected'
            }), 400

        # Build character pool
        char_pool = ''
        if use_upper:
            char_pool += string.ascii_uppercase
        if use_lower:
            char_pool += string.ascii_lowercase
        if use_digits:
            char_pool += string.digits
        if use_symbols:
            char_pool += string.punctuation

        # Generate password
        password = ''.join(random.choice(char_pool) for _ in range(length))

        return jsonify({'password': password}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
