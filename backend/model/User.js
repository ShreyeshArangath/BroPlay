class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  getJSON() {
    return {
      "id": this.id,
      "name": this.name,
      "email": this.email
    }
  }
}

module.exports = User;
