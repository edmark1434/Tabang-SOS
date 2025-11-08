// This file acts as a temporary static database.

// Helper function to generate realistic timestamps
const getTimestamp = (daysAgo = 0, hoursAgo = 0, minutesAgo = 0) => {
    const now = new Date();
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - daysAgo);
    timestamp.setHours(now.getHours() - hoursAgo);
    timestamp.setMinutes(now.getMinutes() - minutesAgo);
    return timestamp.toISOString();
};

export const initialPosts = [
    {
        id: 1,
        type: 'source',
        category: 'Water',
        title: 'Free Water Station (Brgy. Hall)',
        description: 'Barangay Hall providing free drinking water. Bring your own containers. 8am - 5pm.',
        location: 'Cebu City',
        coordinates: [10.3157, 123.8854],
        contact: 'Maria Santos - 09123456789',
        verified: true,
        urgent: false,
        hearts: 15,
        userHearted: false,
        timestamp: getTimestamp(1, 2, 0), // 1 day, 2 hours ago
        lastUpdated: getTimestamp(1, 2, 0)
    },
    {
        id: 2,
        type: 'source',
        category: 'Electricity',
        title: 'Public Charging Station',
        description: 'Public charging station with generators at Mandaue City Plaza. 2 outlets per person limit.',
        location: 'Mandaue City',
        coordinates: [10.3236, 123.9415],
        contact: 'Juan Dela Cruz - 09198765432',
        verified: true,
        urgent: false,
        hearts: 8,
        userHearted: false,
        timestamp: getTimestamp(0, 3, 45), // 3 hours, 45 minutes ago
        lastUpdated: getTimestamp(0, 3, 45)
    },
    {
        id: 3,
        type: 'help',
        category: 'Rescue',
        title: 'Family Needs Evacuation',
        description: 'Family of 5 stranded on 2nd floor, need immediate rescue. Water is rising.',
        location: 'Talisay City',
        coordinates: [10.2447, 123.8494],
        contact: 'Ana Reyes - 09151112233',
        verified: false,
        urgent: true,
        hearts: 3,
        userHearted: false,
        timestamp: getTimestamp(0, 0, 25), // 25 minutes ago
        lastUpdated: getTimestamp(0, 0, 25)
    },
    {
        id: 4,
        type: 'source',
        category: 'Food',
        title: 'Community Kitchen - Hot Meals',
        description: 'Free hot meals (lugaw) at Lapu-Lapu City elementary school gym. Available 11am-1pm and 5pm-7pm.',
        location: 'Lapu-Lapu City',
        coordinates: [10.3160, 123.9787],
        contact: 'LGU Relief Ops - 09271234567',
        verified: true,
        urgent: false,
        hearts: 22,
        userHearted: false,
        timestamp: getTimestamp(2, 0, 0), // 2 days ago
        lastUpdated: getTimestamp(0, 1, 30) // Updated 1.5 hours ago
    },
    {
        id: 5,
        type: 'help',
        category: 'Medicine',
        title: 'Need Insulin for Senior',
        description: 'My father is diabetic and we are running out of insulin. Needs help sourcing any available.',
        location: 'Minglanilla',
        coordinates: [10.2483, 123.7865],
        contact: 'Pedro Gomez - 09189998877',
        verified: false,
        urgent: true,
        hearts: 5,
        userHearted: false,
        timestamp: getTimestamp(0, 1, 15), // 1 hour, 15 minutes ago
        lastUpdated: getTimestamp(0, 1, 15)
    }
];

export const categories = {
    source: ['Water', 'Electricity', 'Food', 'Clothes', 'Medicine', 'Shelter'],
    help: ['Water', 'Electricity', 'Food', 'Clothes', 'Medicine', 'Shelter', 'Rescue', 'Clearing', 'Volunteers']
};

export const cities = ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Talisay', 'Minglanilla', 'Naga City', 'Consolacion', 'Liloan'];