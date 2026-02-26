from flask import Flask, jsonify, request

app = Flask(__name__)

POSITIVE = {'great', 'excellent', 'amazing', 'good', 'happy', 'love', 'smooth', 'friendly', 'fantastic', 'service', 'services'}
NEGATIVE = {'bad', 'terrible', 'awful', 'poor', 'hate', 'slow', 'rude', 'broken'}


def classify_sentiment(text):
    if not text:
        return 'neutral'

    score = 0
    words = [word.strip('.,!?').lower() for word in text.split()]
    for word in words:
        if word in POSITIVE:
            score += 1
        elif word in NEGATIVE:
            score -= 1

    if score > 0:
        return 'positive'
    if score < 0:
        return 'negative'
    return 'neutral'


@app.get('/health')
def health():
    return jsonify({'status': 'ok'})


@app.post('/analyze')
def analyze():
    payload = request.get_json(silent=True) or {}
    text = payload.get('text', '')
    sentiment = classify_sentiment(text)
    return jsonify({'sentiment': sentiment})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
