class User {
    constructor({
      userId = 0,               
      profileImage = null,
      name = '',
      callHistory = null,
      email = '',
      bio = null,
      lastCallTime = null,
      lastCallDuration = null
    }) {
      this.userId = userId;   // number (사용자 ID)
      this.profileImage = profileImage; // string (이미지 경로 or URL), null 가능
      this.name = name;                 // string
      this.callHistory = callHistory;  // array of strings or null
      this.email = email;              // string
      this.bio = bio;                  // string
      this.lastCallTime = lastCallTime; // string (날짜/시간 형식)
      this.lastCallDuration = lastCallDuration
    }
  }
  
  export default User;