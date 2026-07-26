import axios from "axios"

export async function sendCode(phone: string, message: string) {
    return await axios.get(`https://sms.ru/sms/send`, {
        params: {
            api_id: 'C3B1416C-C62A-A829-16CE-6ABEAB8A68D2',
            to: phone,
            msg: message,
            json: 1,
        },
    })
}