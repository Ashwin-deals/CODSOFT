import os
from flask import Flask, render_template, request

app = Flask(__name__)


def get_response(message: str) -> str:
    if not message:
        return "Please say something so I can help."

    text = message.lower()

    # how are you
    if "how are you" in text:
        return "I'm good! How are you?"

    # joke
    if "joke" in text or "tell me a joke" in text:
        return "A guy walks into a bar and orders a glass of water. Haha!"

    # greetings
    if any(g in text for g in ("hi", "hello", "hey")):
        return "Hello! I am a simple chatbot. How can I help you today?"

    # weather
    if "weather" in text:
        return "I can't check live weather yet, but it's always a good day to learn Python!"

    # help
    if "help" in text or "commands" in text:
        return "Try typing: hi, how are you, joke, weather, help, or bye."

    # goodbye
    if any(w in text for w in ("bye", "goodbye", "see ya", "exit")):
        return "Goodbye! Have a great day."

    # fallback
    return "Sorry, I don't understand that yet. Try 'help' for suggestions."


@app.route("/", methods=["GET", "POST"])
def index():
    user_message = ""
    bot_reply = ""

    if request.method == "POST":
        user_message = request.form.get("message", "").strip()
        bot_reply = get_response(user_message)

    return render_template("index.html", user_message=user_message, bot_reply=bot_reply)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # debug=True for local development; Render will use gunicorn in production
    app.run(host="0.0.0.0", port=port, debug=True)
