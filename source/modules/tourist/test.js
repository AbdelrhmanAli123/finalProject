import axios from 'axios'
import FormData from 'form-data'
import got from 'got'
import fetch from 'node-fetch'
import fs from 'fs'
import { Readable } from 'stream'
// import { FormData } from "formdata-node"
import { FormDataEncoder } from "form-data-encoder"
import path from 'path'

// request from http test => failed
export const request_ai_test = async (req, res, next) => {
    const { languages } = req.body
    console.log({
        message: "AI test is entered!"
    })
    const AiUrl = 'http://18.207.187.181:8081/process_image'
    const headers = {
        'Content-Type': 'multipart/form-data'
    };
    const options = {
        'method': 'POST',
        'url': 'http://18.212.174.169:8081/process_image',
        'headers': { 'Content-Type': 'multipart/form-data' },
        formData: {
            'image': {
                'value': req?.file.originalPath,
                'options': {
                    'filename': req?.file.filename,
                    'contentType': null
                }
            },
            'languages': languages
        }
    };
    let AI_data
    const AI_request = request(options
        , function (error, response) {
            if (error) {
                return next(new Error('request error!', { cause: 400 }))
            }
            AI_data = response
            console.log({
                response: response
            })
        })
    console.log({
        AI_request
    })
    res.status(200).json({
        message: "Ai testing done",
        AI_answer: AI_data,
        languages: AI_data.languages
    })
}

// got for http requests with form-data node for creating form data -> failure
export const got_ai_test = async (req, res, next) => {
    const { languages } = req.body
    console.log({
        message: "\nGOT AI TEST API IS ENTERED!\n"
    })

    const AI_url = 'http://18.207.187.181:8081/process_image'
    const headers = {
        'Content-Type': 'multipart/form-data'
    }
    console.log({
        message: "URL and headers are created!"
    })

    const form = new FormData()
    console.log({
        message: "new form data is created!",
        created_form_data: form.getAll()
    })
    if (req.file) {
        form.set('image', req.file.buffer)
        console.log({
            message: "the image is set in the form!",
            update1_in_form: form.keys()
        })
    }
    if (languages) {
        form.set('languages', languages)
        console.log({
            message: "the languages are set in the form!",
            update2_in_form: form.keys()
        })
    }
    console.log({
        message: "the final form-data",
        final_form: form.getAll()
    })
    const AI_request = await got(
        {
            url: 'http://18.207.187.181:8081/process_image',
            method: 'POST',
            headers: headers,
            body: form
        }
    ).json();
    console.log({
        message: "a request is send",
        response: AI_request.data
    })
    res.status(200).json({
        message: "a request is send",
        response: AI_request.data
    })
}

// axios request again
export const axios_request = async (req, res, next) => {
    const { languages } = req.body
    let AI_result
    const formData = new FormData();
    formData.set("image", new Blob([req.file.buffer]))
    formData.set("languages", languages)

    const encoder = new FormDataEncoder(formData)
    console.log({
        message: "form data is created!",
        created_form_data: encoder
    })
    try {
        const AI_response = await axios.post(
            'http://18.207.187.181:8081/process_image',
            Readable.from(encoder.encode()),
            {
                headers: encoder.headers,
            }
        )
        AI_result = AI_response
        console.log({
            message: "response came from the AI model!",
            response_status: AI_response.status,
            response: AI_response.data
        })
    } catch (error) {
        console.log({
            message: "failed to send the request to the AI model!",
            error_message: error.message,
            error: error
        })
        return next(new Error('failed to send the request to the AI model',
            { cause: 400 }))
    }
    res.status(200).json({
        message: "AI test is successfull!",
        AI_response_data: AI_result.data
    })
}

export const got_request2 = async (req, res, next) => {
    const { languages } = req.body;
    let AI_result;

    try {
        const formData = new FormData();
        formData.append("image", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        formData.append("languages", languages);

        console.log({
            message: "form data is created!",
            created_form_data: formData
        });

        const AI_response = await got.post('http://18.207.187.181:8081/process_image', {
            body: formData,
            headers: formData.getHeaders(),
            responseType: 'json', // Assuming the response is JSON
        });

        AI_result = AI_response;

        console.log({
            message: "response came from the AI model!",
            response_status: AI_response.statusCode,
            response: AI_response.body
        });
    } catch (error) {
        console.log({
            message: "failed to send the request to the AI model!",
            error_message: error.message,
            error: error
        });

        return next(new Error('failed to send the request to the AI model', { cause: 400 }));
    }

    res.status(200).json({
        message: "AI test is successful!",
        AI_response_data: AI_result.body
    });
};

export const fetch_request = async (req, res, next) => {
    const { languages } = req.body;
    let AI_result;

    try {
        const formData = new FormData();
        formData.set("image", new Blob([req.file.buffer]))
        formData.set("languages", languages)

        const encoder = new FormDataEncoder(formData)

        console.log({
            message: 'form data is created!',
            created_form_data: encoder
        });

        const AI_response = await fetch('http://18.207.187.181:8081/process_image', {
            method: 'POST',
            body: encoder.encode(),
            headers: encoder.headers,
        });

        AI_result = await AI_response.json();

        console.log({
            message: 'response came from the AI model!',
            response_status: AI_response.status,
            response: AI_result
        });
    } catch (error) {
        console.log({
            message: 'failed to send the request to the AI model!',
            error_message: error.message,
            error: error
        });

        return next(new Error('failed to send the request to the AI model', { cause: 400 }));
    }

    res.status(200).json({
        message: 'AI test is successful!',
        AI_response_data: AI_result
    });
};

export const fetch_request2 = async (req, res, next) => {
    const { languages } = req.body;
    let AI_result;

    const formData = new FormData();
    formData.append('image', new Blob([req.file.buffer]), {
        filename: 'image.jpg', // Set a filename for the image
    });
    formData.append('languages', JSON.stringify(languages));

    const encoder = new FormDataEncoder(formData);

    console.log({
        message: 'form data is created!',
        created_form_data: encoder,
    });

    try {
        const AI_response = await fetch('http://18.207.187.181:8081/process_image', {
            method: 'POST',
            body: encoder.encode(),
            headers: encoder.headers
        });

        AI_result = await AI_response.json();

        console.log({
            message: 'response came from the AI model!',
            response_status: AI_response.status,
            response: AI_result,
        });
    } catch (error) {
        console.log({
            message: 'failed to send the request to the AI model!',
            error_message: error.message,
            error: error,
        });

        return next(new Error('failed to send the request to the AI model', { cause: 400 }));
    }

    res.status(200).json({
        message: 'AI test is successful!',
        AI_response_data: AI_result.data,
    });
};


// axios , FormData , fs , path 
export const axios_request2 = async (req, res, next) => {
    const { languages } = req.body;
    let AI_result;

    console.log({
        message: "request temp file name check",
        tempFileName: req.tempFileName
    })
    const formData = new FormData();
    formData.append('image', fs.createReadStream(path.resolve(`${process.env.LOCAL_TEMP_UPLOADS_PATH}/${req.tempFileName}`)))
    formData.append('languages', languages);

    console.log({
        message: 'form data is created!',
        created_form_data: formData
    });

    try {
        const AI_response = await axios.post('http://18.207.187.181:8081/process_image', formData, {
            headers: formData.getHeaders()
        })

        console.log({
            message: 'response came from the AI model!',
            response_status: AI_response.status,
            response: AI_response.data,
        });

        AI_result = AI_response
        fs.unlink(`${process.env.LOCAL_TEMP_UPLOADS_PATH}/${req.tempFileName}`, (error) => {
            if (error) {
                console.log({
                    message: "error regarading deleting the temp image again",
                    error: error.message
                })
            }
            else {
                console.log({
                    message: ``
                })
            }
        })

    } catch (error) {
        console.log({
            message: 'failed to send the request to the AI model!',
            error_message: error.message,
            error: error,
        });

        return next(new Error('failed to send the request to the AI model', { cause: 400 }));
    }

    res.status(200).json({
        message: 'AI test is successful!',
        AI_response_data: AI_result.data.languages,
    });
}
// 80st ismailia gam3a

// r'/usr/bin/tesseract' sad