// This file acts as a temporary static database.

export const initialPosts = [
    {
        id: 1,
        type: 'source',
        category: 'Water',
        title: 'Free Water Station (Brgy. Hall)',
        description: 'Barangay Hall providing free drinking water. Bring your own containers. 8am - 5pm.',
        location: 'Cebu City',
        coordinates: [10.3157, 123.8854], // Cebu City Hall (approx)
        contact: 'Maria Santos - 09123456789',
        verified: true,
        hearts: 15,
        userHearted: false
    },
    {
        id: 2,
        type: 'source',
        category: 'Electricity',
        title: 'Public Charging Station',
        description: 'Public charging station with generators at Mandaue City Plaza. 2 outlets per person limit.',
        location: 'Mandaue City',
        coordinates: [10.3236, 123.9415], // Mandaue City (approx)
        contact: 'Juan Dela Cruz - 09198765432',
        verified: true,
        hearts: 8,
        userHearted: false
    },
    {
        id: 3,
        type: 'help',
        category: 'Rescue',
        title: 'Family Needs Evacuation',
        description: 'Family of 5 stranded on 2nd floor, need immediate rescue. Water is rising.',
        location: 'Talisay City',
        coordinates: [10.2447, 123.8494], // Talisay City (approx)
        contact: 'Ana Reyes - 09151112233',
        verified: false,
        urgent: true,
        hearts: 3,
        userHearted: false
    },
    {
        id: 4,
        type: 'source',
        category: 'Food',
        title: 'Community Kitchen - Hot Meals',
        description: 'Free hot meals (lugaw) at Lapu-Lapu City elementary school gym. Available 11am-1pm and 5pm-7pm.',
        location: 'Lapu-Lapu City',
        coordinates: [10.3160, 123.9787], // Lapu-Lapu (approx)
        contact: 'LGU Relief Ops - 09271234567',
        verified: true,
        hearts: 22,
        userHearted: false
    },
    {
        id: 5,
        type: 'help',
        category: 'Medicine',
        title: 'Need Insulin for Senior',
        description: 'My father is diabetic and we are running out of insulin. Needs help sourcing any available.',
        location: 'Minglanilla',
        coordinates: [10.2483, 123.7865], // Minglanilla (approx)
        contact: 'Pedro Gomez - 09189998877',
        verified: false,
        urgent: true,
        hearts: 5,
        userHearted: false
    }
];

export const categories = {
    source: ['Water', 'Electricity', 'Food', 'Clothes', 'Medicine', 'Shelter'],
    help: ['Water', 'Electricity', 'Food', 'Clothes', 'Medicine', 'Shelter', 'Rescue', 'Clearing']
};

export const cities = ['Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Talisay City', 'Minglanilla', 'Naga City', 'Consolacion', 'Liloan'];