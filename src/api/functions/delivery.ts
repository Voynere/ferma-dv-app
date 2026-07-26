import axios from "axios";
import { DADATA_TOKEN } from "../../config/secrets";

export const getSugesstionAdreses = async (query: string) => {
    const API_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

    return await axios.post(API_URL, { 
        query,
        locations: [
            {
                "region": "Приморский"
            }
        ],
        locations_boost: [
            {
                "city": "Владивосток"
            }
        ],
        count: 10
    }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${DADATA_TOKEN}`,
        },
    });
};