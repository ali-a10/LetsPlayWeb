class Event {
    constructor({
        id,
        userId,
        title,
        description,
        dateTime,
        location,
        activity,
        isFree,
        price,
        currentParticipants,
        maxParticipants,
        ageGroup,
        level,
        usersJoined
    }) {
        this.id = id;
        this.userId = userId;  // The user who created the event
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
        this.location = location;
        this.activity = activity;
        this.isFree = isFree;
        this.price = isFree ? null : price;
        this.currentParticipants = currentParticipants || 0;
        this.maxParticipants = maxParticipants || null;
        this.ageGroup = ageGroup || '';
        this.level = level || '';
        this.usersJoined = usersJoined || [];  // List of ids of users who joined the event
    }

    // Validate required fields and data formats
    validate() {
        if (!this.title || !this.description || !this.dateTime || !this.location || !this.activity) {
            throw new Error('Title, description, date and time, location, and activity are required.');
        }

        if (this.isFree === false && !this.price) {
            throw new Error('Price is required for non-free events.');
        }

        const validLevels = ['beginner', 'intermediate', 'advanced'];
        if (this.level && !validLevels.includes(this.level.toLowerCase())) {
            throw new Error('Invalid level. Valid options are: beginner, intermediate, advanced.');
        }
        ///////// prob wont need this^^^
    }

    // Convert to plain object (for JSON storage)
    eventToJSON() {
        return {
            id: this.id,
            userId: this.userId,
            title: this.title,
            description: this.description,
            dateTime: this.dateTime,
            location: this.location,
            activity: this.activity,
            isFree: this.isFree,
            price: this.price,
            currentParticipants: this.currentParticipants,
            maxParticipants: this.maxParticipants,
            ageGroup: this.ageGroup,
            level: this.level,
            usersJoined: this.usersJoined  // list of int ids
        };
    }

    // Update event fields
    updateFields(updates) {
        const allowedFields = [
            'title',
            'description',
            'dateTime',
            'location',
            'activity',
            'isFree',
            'price',
            'currentParticipants',
            'maxParticipants',
            'ageGroup',
            'level',
            'usersJoined'
        ];

        for (const key in updates) {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                this[key] = updates[key];
            }
        }
    }
}

module.exports = Event;