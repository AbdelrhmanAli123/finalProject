from flask import Flask, render_template, request, jsonify
import cv2
import pytesseract
import json

app = Flask(__name__)

pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'


def find_words(text, words):
    found_words = []
    not_found_words = []

    for word in words:
        if word.lower() in text.lower():
            found_words.append(word)
        else:
            not_found_words.append(word)

    return found_words, not_found_words


@app.route('/')
def index():
    return {"Hello": "World"}


@app.route('/process_image', methods=['POST'])
def process_image():
    uploaded_file = request.files['image']

    languages_json = request.form['languages']
    languages = json.loads(languages_json)

    uploaded_file.save('temp_image.jpg')

    img = cv2.imread('temp_image.jpg')
    gray_image = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    adaptive_threshold = cv2.adaptiveThreshold(gray_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 85,
                                               25)
    text = pytesseract.image_to_string(adaptive_threshold, lang='ara+eng')

    found_words, not_found_words = find_words(text, languages)

    result = {"languages": found_words}
    return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)
