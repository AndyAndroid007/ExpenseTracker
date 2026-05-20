export const postEntry = async (userId, rawText) => {
    return "Entry Saved Successfully"
};

export const getEntries = async (userId, currDate) => {
    return [
        {
            "role": "user",
            "rawText": "Uber 400"
        },
        {
            "role": "user",
            "rawText": "Subway 300"
        },
    ];
};

