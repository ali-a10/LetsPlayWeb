class User {
    constructor({
        id,
        username,
        email,
        password,
        phone,
        gender,
        favoriteSports,
        about,
        dob,
    //   profilePic
    }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.phone = phone || '';
        this.gender = gender || '';
        this.favoriteSports = favoriteSports || [];
        this.about = about || '';
        this.dob = dob || '';
        this.eventsCreated = [];
        this.eventsJoined = [];
    //   this.profilePic = profilePic || '';
    }
  
    // Validate required fields and data formats
    validate(existingUsers = []) {
        if (!this.username || !this.email || !this.password) {
            throw new Error('Username, email, and password are required.');
        }
  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            throw new Error('Invalid email format.');
        }
  
        if (existingUsers.some(u => u.username === this.username)) {
            throw new Error('Username already exists.');
        }
  
        if (existingUsers.some(u => u.email === this.email)) {
            throw new Error('Email already exists.');
        }
  
          if (this.favoriteSports.length === 0) {
            throw new Error('Please select at least one favorite sport.');
        }
    }
  
    // Convert to plain object (for JSON storage)
    userToJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            password: this.password,
            phone: this.phone,
            gender: this.gender,
            favoriteSports: this.favoriteSports,
            about: this.about,
            dob: this.dob,
            eventsCreated: this.eventsCreated,
            eventsJoined: this.eventsJoined,
            // profilePic: this.profilePic
        };
    }

    // Update user fields
    updateFields(updates) {
        const allowedFields = [
            'username',
            'email',
            'password',
            'phone',
            'gender',
            'favoriteSports',
            'about',
            'dob',
            'eventsCreated',
            'eventsJoined',
        //   'profilePic'
        ];
  
        for (const key in updates) {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                this[key] = updates[key];
            }
        }
      }
  }
  
  module.exports = User;
