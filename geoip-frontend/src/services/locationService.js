export const fetchLocationData = async (ip) => {
    const encodedIp = encodeURIComponent(ip);
    const databaseResponse = await fetch(`/api/network/${encodedIp}`);

    if (databaseResponse.ok) {
        return await databaseResponse.json();
    }

    if (databaseResponse.status === 404) {
        // Try getting the IP data from MaxMind API
        const maxMindResponse = await fetch(`/api/maxmind/${encodedIp}`);
        if (!maxMindResponse.ok) {
            if (maxMindResponse.status === 404) {
                throw new Error('No data found for this IP address in Maxmind API.');
            }
            throw new Error('Failed to fetch data from MaxMind API.');
        }

        const maxMindData = await maxMindResponse.json();
        await addToDatabase(maxMindData);

        // Query the database again to get the newly added data
        const newDatabaseResponse = await fetch(`/api/network/${encodedIp}`);
        if (!newDatabaseResponse.ok) {
            throw new Error('Failed to fetch newly added data from the database.');
        }
        return await newDatabaseResponse.json();
    }

    const errorText = await databaseResponse.text();
    const errorData = JSON.parse(errorText);
    throw new Error(
        'Failed to fetch data from the database.' +
        (errorData.message || databaseResponse.statusText)
    );
};

export const fetchSecondaryLocationData = async (geonameId, language) => {
    const encodedLang = encodeURIComponent(language);
    const response = await fetch(
        `api/location/${geonameId}?lang=${encodedLang}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch secondary location data');
    }

    return await response.json();
};

export const addToDatabase = async (data) => {
    const response = await fetch('/api/addToDatabase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to add data to the database');
    }

    return true;
};
