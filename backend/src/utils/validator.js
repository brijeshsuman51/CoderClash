const validator = require('validator')

const validate = (data) => {
    const mandatoryField = ['firstName','password','emailId']

    const conditionfulfill = mandatoryField.every((k)=>Object.keys(data).includes(k))

    if(!conditionfulfill){
        throw new Error("Invalid Credentials")
    }
    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Credentials")
    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password")
}

module.exports = validate