var dbConfig = function(data) {
    var prefix = '';
}

dbConfig.prototype.setPrefix = function(prefix) {
    var self = this;

    self.prefix = prefix;

};

dbConfig.prototype.getConfig = function(prefix) {

    var self = this;

    return {
        db_categories: self.prefix + "categories",
        db_questions: self.prefix + "questions",
        db_resolutions: self.prefix + "resolutions",
        db_schools: self.prefix + "schools",
        db_students: self.prefix + "students",
        db_teachers: self.prefix + "teachers",
        db_tests: self.prefix + "tests",
        db_testtype: self.prefix + "testtype"
    }

};



module.exports = new dbConfig();
