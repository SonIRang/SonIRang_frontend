class User {
    constructor({
      profileImage = null,
      name = '',
      callHistory = null,
      email = '',
      bio = '',
    }) {
      this.profileImage = profileImage; // string (이미지 경로 or URL), null 가능
      this.name = name;                 // string
      this.callHistory = callHistory;  // array of strings or null
      this.email = email;              // string
      this.bio = bio;                  // string
    }
  }
  
  export default User;